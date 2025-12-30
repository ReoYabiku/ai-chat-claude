# AI Chat Claude

Anthropic Claude APIを使用した汎用的なAIチャットボットアプリケーション

## プロジェクト概要

AI Chat Claudeは、認証不要で誰でも気軽に使えるWebベースのAIチャットボットです。Next.js、Hono、Prisma、Mastraといったモダンな技術スタックを採用し、高品質な会話体験を提供します。

## 主な特徴

- **認証不要**: ログインなしで即座に利用開始
- **高品質な会話**: Anthropic Claude APIによる自然な対話
- **レスポンシブデザイン**: デスクトップ・モバイル両対応
- **会話履歴保存**: MongoDB Atlasによる永続化
- **スケーラブル**: Google Cloud Runによる自動スケーリング
- **型安全**: TypeScriptとPrismaによるエンドツーエンドの型安全性

## 技術スタック

### フロントエンド
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS

### バックエンド
- Hono (Web Framework)
- Prisma (ORM)
- Mastra (AI Agent Framework)
- Zod (Validation)

### データベース
- MongoDB Atlas

### AI/ML
- Claude API (Anthropic)

### インフラ
- Google Cloud Run
- Docker

## クイックスタート

### 前提条件

- Node.js 20.x以上
- pnpm 8.x以上
- MongoDB Atlasアカウント
- Anthropic APIキー

### セットアップ

```bash
# 1. リポジトリクローン
git clone https://github.com/your-org/ai-chat-claude.git
cd ai-chat-claude

# 2. 依存関係インストール
pnpm install

# 3. 環境変数設定
cp .env.example .env
# .envファイルを編集してAPIキーやデータベースURLを設定

# 4. Prismaセットアップ
cd api
pnpm prisma generate
pnpm prisma db push

# 5. 開発サーバー起動
# ターミナル1: フロントエンド
cd frontend
pnpm dev

# ターミナル2: バックエンド
cd api
pnpm dev
```

ブラウザで http://localhost:3000 を開いてアプリケーションにアクセスします。

## 環境変数

`.env.example`をコピーして`.env`を作成し、以下の環境変数を設定してください：

```env
# データベース
DATABASE_URL="mongodb+srv://..."

# AI API
CLAUDE_API_KEY="sk-ant-..."

# アプリケーション
NODE_ENV="development"
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## プロジェクト構成

```
ai-chat-claude/
├── frontend/          # Next.jsフロントエンド
├── api/               # Hono APIバックエンド
├── shared/            # 共通型定義
├── docs/              # ドキュメント
│   └── CLAUDE.md      # 詳細な仕様書
├── .github/workflows/ # CI/CD設定
├── .env.example       # 環境変数テンプレート
├── pnpm-workspace.yaml
└── README.md
```

## ドキュメント

詳細な仕様、アーキテクチャ、実装ガイドについては、以下のドキュメントを参照してください：

- [CLAUDE.md](./CLAUDE.md) - プロジェクト仕様書（包括的な設計ドキュメント）

## 開発コマンド

```bash
# 開発サーバー起動（すべてのワークスペース）
pnpm dev

# ビルド
pnpm build

# Lint
pnpm lint

# テスト（Phase 2で実装予定）
pnpm test

# Prismaスキーマ同期
cd api && pnpm prisma db push

# Prismaクライアント生成
cd api && pnpm prisma generate
```

## デプロイ

### Google Cloud Run

詳細なデプロイ手順は[CLAUDE.md#11-デプロイ手順](./CLAUDE.md#11-デプロイ手順)を参照してください。

```bash
# イメージビルド & プッシュ
docker build -t gcr.io/<PROJECT_ID>/ai-chat-frontend:latest -f frontend/Dockerfile frontend/
docker push gcr.io/<PROJECT_ID>/ai-chat-frontend:latest

# Cloud Runデプロイ
gcloud run deploy ai-chat-frontend \
  --image gcr.io/<PROJECT_ID>/ai-chat-frontend:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated
```

## ロードマップ

### Phase 1: MVP（現在）
- ✅ 基本チャット機能
- ✅ 会話履歴保存
- ✅ レスポンシブUI

### Phase 2: 拡張機能
- [ ] ストリーミング応答
- [ ] ダークモード
- [ ] マークダウンレンダリング
- [ ] コードハイライト

### Phase 3: プロダクション機能
- [ ] ユーザー認証
- [ ] ファイルアップロード
- [ ] 会話検索
- [ ] エクスポート機能

