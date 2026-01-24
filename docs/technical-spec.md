# 技術要件書

## 1. システム構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                        Google Cloud                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Cloud Run     │    │   Cloud Run     │    │  Cloud SQL  │ │
│  │  (Next.js App)  │◄──►│  (Discord Bot)  │◄──►│ (PostgreSQL)│ │
│  └────────┬────────┘    └────────┬────────┘    └─────────────┘ │
│           │                      │                              │
└───────────┼──────────────────────┼──────────────────────────────┘
            │                      │
            ▼                      ▼
     ┌─────────────┐        ┌─────────────┐
     │   Browser   │        │   Discord   │
     │  (チーム)    │        │   Server    │
     └─────────────┘        └─────────────┘
```

---

## 2. 技術スタック

### 2.1 フロントエンド
| 項目 | 技術 | バージョン | 理由 |
|------|------|-----------|------|
| フレームワーク | Next.js | 15.x | App Router、RSC対応、高パフォーマンス |
| 言語 | TypeScript | 5.x | 型安全性、開発効率 |
| スタイリング | Tailwind CSS | 3.x | 高速開発、一貫したデザイン |
| チャート | Recharts | 2.x | React対応、カスタマイズ性 |
| 状態管理 | Zustand | 4.x | 軽量、シンプル |
| フォーム | React Hook Form | 7.x | パフォーマンス、バリデーション |
| UI コンポーネント | shadcn/ui | - | 高品質、カスタマイズ可能 |

### 2.2 バックエンド
| 項目 | 技術 | バージョン | 理由 |
|------|------|-----------|------|
| API | Next.js API Routes | 15.x | フロントと統合、Server Actions |
| ORM | Prisma | 5.x | 型安全、マイグレーション管理 |
| 認証 | NextAuth.js | 5.x | Discord OAuth対応 |
| バリデーション | Zod | 3.x | TypeScript統合、スキーマ定義 |

### 2.3 Discord Bot
| 項目 | 技術 | バージョン | 理由 |
|------|------|-----------|------|
| ライブラリ | discord.js | 14.x | 公式推奨、TypeScript対応 |
| ランタイム | Node.js | 20.x LTS | 安定性、長期サポート |

### 2.4 データベース
| 項目 | 技術 | 理由 |
|------|------|------|
| RDBMS | PostgreSQL 15 | 信頼性、JSON対応、Cloud SQL対応 |

### 2.5 インフラストラクチャ
| 項目 | サービス | 理由 |
|------|---------|------|
| コンピューティング | Cloud Run | サーバーレス、自動スケール、コスト効率 |
| データベース | Cloud SQL | マネージド、自動バックアップ |
| シークレット管理 | Secret Manager | セキュアな認証情報管理 |
| CI/CD | Cloud Build | GitHub連携、自動デプロイ |
| コンテナレジストリ | Artifact Registry | イメージ管理 |

---

## 3. データベース設計

### 3.1 ER図

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    members      │     │   messages      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ email           │     │ discord_id (UQ) │     │ discord_id      │
│ name            │     │ username        │     │ channel_id      │
│ discord_id      │     │ joined_at       │     │ user_id (FK)    │
│ role            │     │ left_at         │     │ created_at      │
│ created_at      │     │ is_active       │     └─────────────────┘
│ updated_at      │     │ created_at      │
└─────────────────┘     │ updated_at      │
                        └─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐     ┌─────────────────┐
│     tasks       │     │  daily_stats    │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ title           │     │ date (UQ)       │
│ description     │     │ new_members     │
│ status          │     │ left_members    │
│ assignee_id(FK) │     │ total_members   │
│ due_date        │     │ message_count   │
│ created_at      │     │ active_users    │
│ updated_at      │     │ created_at      │
└─────────────────┘     └─────────────────┘
```

### 3.2 テーブル定義

#### users（管理者ユーザー）
| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 主キー |
| email | VARCHAR(255) | UNIQUE, NOT NULL | メールアドレス |
| name | VARCHAR(100) | NOT NULL | 表示名 |
| discord_id | VARCHAR(20) | UNIQUE | Discord ID |
| role | ENUM | NOT NULL | admin / member |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

#### members（Discord メンバー）
| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 主キー |
| discord_id | VARCHAR(20) | UNIQUE, NOT NULL | Discord ユーザーID |
| username | VARCHAR(100) | NOT NULL | Discord ユーザー名 |
| joined_at | TIMESTAMP | NOT NULL | サーバー参加日時 |
| left_at | TIMESTAMP | NULL | サーバー退出日時 |
| is_active | BOOLEAN | NOT NULL | 在籍フラグ |
| created_at | TIMESTAMP | NOT NULL | レコード作成日時 |
| updated_at | TIMESTAMP | NOT NULL | レコード更新日時 |

#### messages（メッセージログ）
| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 主キー |
| discord_id | VARCHAR(20) | NOT NULL | Discord メッセージID |
| channel_id | VARCHAR(20) | NOT NULL | Discord チャンネルID |
| user_id | UUID | FK → members.id | 投稿者 |
| created_at | TIMESTAMP | NOT NULL | 投稿日時 |

#### daily_stats（日次統計）
| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 主キー |
| date | DATE | UNIQUE, NOT NULL | 対象日 |
| new_members | INTEGER | NOT NULL | 新規参加者数 |
| left_members | INTEGER | NOT NULL | 退出者数 |
| total_members | INTEGER | NOT NULL | 総メンバー数 |
| message_count | INTEGER | NOT NULL | 総メッセージ数 |
| active_users | INTEGER | NOT NULL | アクティブユーザー数 |
| created_at | TIMESTAMP | NOT NULL | レコード作成日時 |

#### tasks（タスク）- Phase 2
| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 主キー |
| title | VARCHAR(200) | NOT NULL | タスクタイトル |
| description | TEXT | NULL | 詳細説明 |
| status | ENUM | NOT NULL | pending / in_progress / completed |
| assignee_id | UUID | FK → users.id | 担当者 |
| due_date | DATE | NULL | 期限日 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

---

## 4. API設計

### 4.1 エンドポイント一覧

#### 認証
| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/auth/signin | Discord OAuth ログイン |
| GET | /api/auth/signout | ログアウト |
| GET | /api/auth/session | セッション情報取得 |

#### ダッシュボード
| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/dashboard/summary | KPIサマリー取得 |
| GET | /api/dashboard/trends | 推移データ取得 |

#### メンバー分析
| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/members | メンバー一覧取得 |
| GET | /api/members/stats | メンバー統計取得 |
| GET | /api/members/growth | 増減推移取得 |

#### アクティビティ分析
| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/activity/messages | メッセージ統計取得 |
| GET | /api/activity/channels | チャンネル別統計取得 |
| GET | /api/activity/users | アクティブユーザー統計取得 |

#### タスク（Phase 2）
| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/tasks | タスク一覧取得 |
| POST | /api/tasks | タスク作成 |
| PATCH | /api/tasks/:id | タスク更新 |
| DELETE | /api/tasks/:id | タスク削除 |

---

## 5. Discord Bot 設計

### 5.1 イベントハンドラ

| イベント | 処理内容 |
|---------|---------|
| guildMemberAdd | メンバー参加をDBに記録 |
| guildMemberRemove | メンバー退出をDBに記録 |
| messageCreate | メッセージをDBに記録 |

### 5.2 必要な権限（Intents）

```javascript
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
```

### 5.3 Bot トークン管理
- Google Cloud Secret Manager で管理
- 環境変数経由でアプリケーションに注入

---

## 6. セキュリティ

### 6.1 認証・認可
| 項目 | 実装 |
|------|------|
| 認証方式 | Discord OAuth 2.0 |
| セッション管理 | JWT（HttpOnly Cookie） |
| アクセス制御 | チームメンバーのみ許可（Discord サーバーロールで判定） |

### 6.2 データ保護
| 項目 | 実装 |
|------|------|
| 通信暗号化 | HTTPS (TLS 1.3) |
| DB接続 | SSL接続必須 |
| 機密情報 | Secret Manager で管理 |

---

## 7. 開発環境

### 7.1 必要なツール
| ツール | バージョン | 用途 |
|--------|-----------|------|
| Node.js | 20.x LTS | ランタイム |
| pnpm | 8.x | パッケージマネージャー |
| Docker | 最新 | ローカル開発、デプロイ |
| PostgreSQL | 15.x | ローカルDB |

### 7.2 環境変数

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/discord_management"

# Discord
DISCORD_BOT_TOKEN="your-bot-token"
DISCORD_CLIENT_ID="your-client-id"
DISCORD_CLIENT_SECRET="your-client-secret"
DISCORD_GUILD_ID="your-server-id"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# Google Cloud (本番環境)
GCP_PROJECT_ID="your-project-id"
```

---

## 8. デプロイメント

### 8.1 CI/CD パイプライン

```
GitHub Push
    │
    ▼
Cloud Build Trigger
    │
    ├─► Lint & Test
    │
    ├─► Build Docker Image
    │
    ├─► Push to Artifact Registry
    │
    └─► Deploy to Cloud Run
```

### 8.2 環境構成

| 環境 | 用途 | URL |
|------|------|-----|
| Local | 開発 | http://localhost:3000 |
| Staging | テスト | https://staging-xxx.run.app |
| Production | 本番 | https://discord-management.run.app |

---

## 9. 見積もり工数

### Phase 1: MVP
| タスク | 工数（目安） |
|--------|-------------|
| 環境構築・初期設定 | 1日 |
| Discord Bot 実装 | 2日 |
| DB設計・Prisma設定 | 1日 |
| 認証機能 | 1日 |
| ダッシュボード画面 | 2日 |
| メンバー分析画面 | 2日 |
| アクティビティ分析画面 | 2日 |
| テスト・バグ修正 | 2日 |
| デプロイ・本番設定 | 1日 |
| **合計** | **約14日** |

### Phase 2: 拡張機能
| タスク | 工数（目安） |
|--------|-------------|
| タスク管理機能 | 3日 |
| 業務連絡機能 | 2日 |
| **合計** | **約5日** |

---

## 10. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| Discord API レート制限 | データ収集遅延 | キャッシュ、バッチ処理 |
| Bot トークン漏洩 | 不正アクセス | Secret Manager、定期ローテーション |
| データ量増加 | パフォーマンス低下 | インデックス最適化、集計テーブル |

---

**最終更新日**: 2026-01-24
