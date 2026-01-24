import { Client, GatewayIntentBits, Events, GuildMember, Message, PartialGuildMember } from "discord.js";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// 環境変数の読み込み
dotenv.config({ path: "../.env.local" });

const prisma = new PrismaClient();

// Discord クライアントの初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ========================================
// イベントハンドラー
// ========================================

// Bot 起動時
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ Bot is ready! Logged in as ${readyClient.user.tag}`);
  
  // 起動時に現在のメンバー数を記録
  const guild = readyClient.guilds.cache.get(process.env.DISCORD_GUILD_ID!);
  if (guild) {
    console.log(`📊 Connected to: ${guild.name} (${guild.memberCount} members)`);
    
    // 日次統計の初期化（今日の分がなければ作成）
    await initializeDailyStat(guild.memberCount);
  }
});

// メンバー参加時
client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
  console.log(`👋 New member joined: ${member.user.tag}`);
  
  try {
    // メンバーをDBに登録
    await prisma.member.upsert({
      where: { discordId: member.id },
      update: {
        username: member.user.username,
        nickname: member.nickname,
        avatarUrl: member.user.displayAvatarURL(),
        isActive: true,
        leftAt: null,
        updatedAt: new Date(),
      },
      create: {
        discordId: member.id,
        username: member.user.username,
        nickname: member.nickname,
        avatarUrl: member.user.displayAvatarURL(),
        joinedAt: member.joinedAt || new Date(),
        isActive: true,
      },
    });

    // 日次統計を更新
    await updateDailyStatOnJoin();
    
    console.log(`✅ Member ${member.user.tag} saved to database`);
  } catch (error) {
    console.error("Error saving member:", error);
  }
});

// メンバー退出時
client.on(Events.GuildMemberRemove, async (member: GuildMember | PartialGuildMember) => {
  console.log(`👋 Member left: ${member.user?.tag || member.id}`);
  
  try {
    // メンバーの退出を記録
    await prisma.member.updateMany({
      where: { discordId: member.id },
      data: {
        isActive: false,
        leftAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 日次統計を更新
    await updateDailyStatOnLeave();
    
    console.log(`✅ Member ${member.id} marked as left`);
  } catch (error) {
    console.error("Error updating member:", error);
  }
});

// メッセージ投稿時
client.on(Events.MessageCreate, async (message: Message) => {
  // Bot のメッセージは無視
  if (message.author.bot) return;
  
  // DM は無視
  if (!message.guild) return;

  try {
    // メンバーが存在するか確認、なければ作成
    let member = await prisma.member.findUnique({
      where: { discordId: message.author.id },
    });

    if (!member) {
      const guildMember = message.guild.members.cache.get(message.author.id);
      member = await prisma.member.create({
        data: {
          discordId: message.author.id,
          username: message.author.username,
          nickname: guildMember?.nickname,
          avatarUrl: message.author.displayAvatarURL(),
          joinedAt: guildMember?.joinedAt || new Date(),
          isActive: true,
        },
      });
    }

    // メッセージを記録
    await prisma.message.create({
      data: {
        discordId: message.id,
        channelId: message.channelId,
        channelName: message.channel.isDMBased() ? "DM" : message.channel.name,
        memberId: member.id,
        messageLength: message.content.length,
        hasAttachment: message.attachments.size > 0,
        createdAt: message.createdAt,
      },
    });

    // 日次統計のメッセージカウントを更新
    await updateDailyStatOnMessage(message.author.id);

  } catch (error) {
    // 重複エラーは無視（同じメッセージIDが来た場合）
    if ((error as { code?: string }).code !== "P2002") {
      console.error("Error saving message:", error);
    }
  }
});

// ========================================
// ヘルパー関数
// ========================================

async function initializeDailyStat(totalMembers: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyStat.upsert({
    where: { date: today },
    update: { totalMembers },
    create: {
      date: today,
      newMembers: 0,
      leftMembers: 0,
      totalMembers,
      messageCount: 0,
      activeUsers: 0,
    },
  });
}

async function updateDailyStatOnJoin() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyStat.upsert({
    where: { date: today },
    update: {
      newMembers: { increment: 1 },
      totalMembers: { increment: 1 },
    },
    create: {
      date: today,
      newMembers: 1,
      leftMembers: 0,
      totalMembers: 1,
      messageCount: 0,
      activeUsers: 0,
    },
  });
}

async function updateDailyStatOnLeave() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyStat.upsert({
    where: { date: today },
    update: {
      leftMembers: { increment: 1 },
      totalMembers: { decrement: 1 },
    },
    create: {
      date: today,
      newMembers: 0,
      leftMembers: 1,
      totalMembers: 0,
      messageCount: 0,
      activeUsers: 0,
    },
  });
}

// アクティブユーザーを追跡するためのSet（メモリ内）
const dailyActiveUsers = new Set<string>();

async function updateDailyStatOnMessage(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isNewActiveUser = !dailyActiveUsers.has(userId);
  dailyActiveUsers.add(userId);

  await prisma.dailyStat.upsert({
    where: { date: today },
    update: {
      messageCount: { increment: 1 },
      activeUsers: isNewActiveUser ? { increment: 1 } : undefined,
    },
    create: {
      date: today,
      newMembers: 0,
      leftMembers: 0,
      totalMembers: 0,
      messageCount: 1,
      activeUsers: 1,
    },
  });
}

// 日付が変わったらアクティブユーザーセットをリセット
function resetDailyActiveUsers() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    dailyActiveUsers.clear();
    console.log("🔄 Daily active users reset");
    resetDailyActiveUsers(); // 次の日のリセットをスケジュール
  }, timeUntilMidnight);
}

// ========================================
// Bot 起動
// ========================================

async function main() {
  try {
    // データベース接続テスト
    await prisma.$connect();
    console.log("✅ Database connected");

    // アクティブユーザーリセットのスケジュール
    resetDailyActiveUsers();

    // Bot ログイン
    await client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    console.error("❌ Failed to start bot:", error);
    process.exit(1);
  }
}

// グレースフルシャットダウン
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down...");
  await prisma.$disconnect();
  client.destroy();
  process.exit(0);
});

main();
