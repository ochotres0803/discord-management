import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, subDays, startOfWeek, startOfMonth } from "date-fns";

export async function GET() {
  try {
    const today = startOfDay(new Date());
    const weekAgo = subDays(today, 7);
    const monthAgo = subDays(today, 30);

    // 今日の統計を取得
    const todayStat = await prisma.dailyStat.findUnique({
      where: { date: today },
    });

    // 総メンバー数
    const totalMembers = await prisma.member.count({
      where: { isActive: true },
    });

    // 今日の新規メンバー
    const newMembersToday = todayStat?.newMembers || 0;

    // 今日のメッセージ数
    const messagesToday = todayStat?.messageCount || 0;

    // 今日のアクティブユーザー数
    const activeUsersToday = todayStat?.activeUsers || 0;

    // 週間の統計
    const weeklyStats = await prisma.dailyStat.aggregate({
      where: {
        date: { gte: weekAgo },
      },
      _sum: {
        newMembers: true,
        leftMembers: true,
        messageCount: true,
      },
    });

    // 週間のアクティブユーザー数（ユニーク）
    const weeklyActiveUsers = await prisma.message.groupBy({
      by: ["memberId"],
      where: {
        createdAt: { gte: weekAgo },
      },
    });

    // 月間のアクティブユーザー数（ユニーク）
    const monthlyActiveUsers = await prisma.message.groupBy({
      by: ["memberId"],
      where: {
        createdAt: { gte: monthAgo },
      },
    });

    // アクティブ率の計算
    const dauRate = totalMembers > 0 ? (activeUsersToday / totalMembers) * 100 : 0;
    const wauRate = totalMembers > 0 ? (weeklyActiveUsers.length / totalMembers) * 100 : 0;
    const mauRate = totalMembers > 0 ? (monthlyActiveUsers.length / totalMembers) * 100 : 0;

    return NextResponse.json({
      totalMembers,
      newMembersToday,
      messagesToday,
      activeUsersToday,
      weeklyNewMembers: weeklyStats._sum.newMembers || 0,
      weeklyLeftMembers: weeklyStats._sum.leftMembers || 0,
      weeklyMessages: weeklyStats._sum.messageCount || 0,
      weeklyActiveUsers: weeklyActiveUsers.length,
      monthlyActiveUsers: monthlyActiveUsers.length,
      dauRate: Math.round(dauRate * 10) / 10,
      wauRate: Math.round(wauRate * 10) / 10,
      mauRate: Math.round(mauRate * 10) / 10,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
