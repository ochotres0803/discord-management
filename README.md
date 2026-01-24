# Discord Analytics - サーバー分析ダッシュボード

Discord サーバーの成長戦略を立てるための、メンバー動向・アクティビティ分析ダッシュボード

## 🚀 機能

### Phase 1: MVP（実装済み）
- ✅ **メンバー流入数ダッシュボード** - 日次/週次/月次の新規メンバー推移
- ✅ **メッセージ数計測** - チャンネル別・ユーザー別の投稿数
- ✅ **アクティブユーザー率** - DAU / WAU / MAU の可視化
- ✅ **Discord Bot** - データ収集用 Bot

### Phase 2: 拡張機能（予定）
- ⬜ タスク管理・共有
- ⬜ 業務連絡機能

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui, Recharts
- **バックエンド**: Next.js API Routes, Prisma
- **Discord Bot**: discord.js 14
- **データベース**: PostgreSQL 15
- **インフラ**: Google Cloud (Cloud Run, Cloud SQL)
- **認証**: NextAuth.js (Discord OAuth)

## 📋 セットアップ

### 1. 前提条件

- Node.js 20.x 以上
- Docker & Docker Compose
- Discord Developer Portal でアプリケーション作成済み

### 2. 環境変数の設定

`.env.local` ファイルを編集:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/discord_management?schema=public"

# Discord Bot
DISCORD_BOT_TOKEN="your-bot-token-here"
DISCORD_GUILD_ID="your-server-id-here"

# Discord OAuth (NextAuth)
DISCORD_CLIENT_ID="your-client-id-here"
DISCORD_CLIENT_SECRET="your-client-secret-here"

# NextAuth
AUTH_SECRET="openssl rand -base64 32 で生成"
```

### 3. データベースの起動

```bash
docker-compose up -d
```

### 4. Prisma マイグレーション

```bash
npx prisma generate
npx prisma db push
```

### 5. 開発サーバーの起動

```bash
# Web アプリ
npm run dev

# Discord Bot（別ターミナル）
cd bot
npm install
npm run dev
```

### 6. ブラウザでアクセス

http://localhost:3000

## 🤖 Discord Bot のセットアップ

### 1. Discord Developer Portal で Bot を作成

1. https://discord.com/developers/applications にアクセス
2. 「New Application」をクリック
3. アプリケーション名を入力して作成
4. 左メニューの「Bot」をクリック
5. 「Reset Token」でトークンを取得（`.env.local` に設定）

### 2. Bot の権限設定

左メニューの「OAuth2」→「URL Generator」で以下を選択:
- Scopes: `bot`
- Bot Permissions:
  - Read Messages/View Channels
  - Read Message History

### 3. 必要なインテント（Privileged Gateway Intents）

Bot 設定ページで以下を有効化:
- ✅ SERVER MEMBERS INTENT
- ✅ MESSAGE CONTENT INTENT

### 4. サーバーに招待

生成された URL でサーバーに Bot を招待

## 📁 ディレクトリ構成

```
/
├── .cursor/rules       # 開発ルール
├── docs/
│   ├── requirements.md # 要件定義書
│   └── technical-spec.md # 技術要件書
├── bot/                # Discord Bot
│   ├── src/
│   │   └── index.ts
│   └── package.json
├── prisma/
│   └── schema.prisma   # DBスキーマ
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── api/        # API Routes
│   │   ├── dashboard/  # ダッシュボード画面
│   │   └── login/      # ログイン画面
│   ├── auth/           # NextAuth 設定
│   ├── components/     # UIコンポーネント
│   └── lib/            # ユーティリティ
└── docker-compose.yml  # ローカル開発環境
```

## 🔒 セキュリティ

- Discord OAuth による認証
- 環境変数は `.env.local` で管理（Git 管理外）
- 本番環境では Google Cloud Secret Manager を使用

## 📊 使用可能なAPI

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `/api/dashboard/summary` | GET | KPIサマリー |
| `/api/dashboard/trends` | GET | 推移データ |
| `/api/members/stats` | GET | メンバー統計 |
| `/api/activity/channels` | GET | チャンネル別統計 |

## 📝 ライセンス

Private - All rights reserved
