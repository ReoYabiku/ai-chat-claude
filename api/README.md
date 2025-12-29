# AI Chat Claude - API Server

Hono + Mastra + Prisma による AI チャットバックエンド API

## 📋 目次

- [機能概要](#機能概要)
- [セットアップ](#セットアップ)
- [動作確認](#動作確認)
- [API エンドポイント](#apiエンドポイント)
- [トラブルシューティング](#トラブルシューティング)

---

## 🎯 機能概要

- **Claude 3.5 Sonnet** を使用した AI チャット応答
- **MongoDB** による会話履歴の永続化
- **レート制限** でAPI保護
- **エラーハンドリング** で堅牢性確保
- **自動タイトル生成** で会話を分かりやすく管理

---

## 🔧 セットアップ

### 1. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成：

```bash
# プロジェクトルートで実行
cp .env.example .env
```

`.env` ファイルを編集して、以下を設定：

```env
# MongoDB接続文字列
DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/ai-chat?retryWrites=true&w=majority"

# Claude APIキー（https://console.anthropic.com から取得）
CLAUDE_API_KEY="sk-ant-api03-your-key-here"
```

### 2. 依存関係のインストール

```bash
# プロジェクトルートで実行
pnpm install
```

### 3. Prisma セットアップ

```bash
# APIディレクトリに移動
cd api

# Prisma Clientを生成
pnpm prisma generate

# MongoDBスキーマを同期
pnpm prisma db push
```

### 4. サーバー起動

```bash
# 開発モード（ホットリロード）
pnpm dev

# 本番モード
pnpm build
pnpm start
```

サーバーが起動すると、以下のように表示されます：

```
Server is running on http://localhost:3001
```

---

## ✅ 動作確認

### 1. ヘルスチェック

```bash
curl http://localhost:3001/api/health
```

**期待されるレスポンス:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-29T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### 2. 会話作成

```bash
curl -X POST http://localhost:3001/api/conversations \
  -H "Content-Type: application/json" \
  -d '{}'
```

**期待されるレスポンス:**
```json
{
  "id": "676f1234567890abcdef1234",
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": null,
  "createdAt": "2025-12-29T12:00:00.000Z",
  "updatedAt": "2025-12-29T12:00:00.000Z"
}
```

**重要**: `id` をコピーしてください（次のステップで使用）

### 3. メッセージ送信

```bash
# 上記で取得した conversationId を使用
CONVERSATION_ID="676f1234567890abcdef1234"

curl -X POST "http://localhost:3001/api/conversations/${CONVERSATION_ID}/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "こんにちは！AIチャットのテストです。"
  }'
```

**期待されるレスポンス:**
```json
{
  "userMessage": {
    "id": "676f1234567890abcdef5678",
    "conversationId": "676f1234567890abcdef1234",
    "role": "USER",
    "content": "こんにちは！AIチャットのテストです。",
    "createdAt": "2025-12-29T12:01:00.000Z"
  },
  "assistantMessage": {
    "id": "676f1234567890abcdef9012",
    "conversationId": "676f1234567890abcdef1234",
    "role": "ASSISTANT",
    "content": "こんにちは！テストありがとうございます。何かお手伝いできることはありますか？",
    "metadata": {
      "model": "claude-3-5-sonnet-20241022",
      "timestamp": "2025-12-29T12:01:05.000Z"
    },
    "createdAt": "2025-12-29T12:01:05.000Z"
  }
}
```

### 4. 会話履歴取得

```bash
curl "http://localhost:3001/api/conversations/${CONVERSATION_ID}"
```

**期待されるレスポンス:**
```json
{
  "conversation": {
    "id": "676f1234567890abcdef1234",
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "AIチャットのテスト",
    "createdAt": "2025-12-29T12:00:00.000Z",
    "updatedAt": "2025-12-29T12:01:05.000Z"
  },
  "messages": [
    {
      "id": "676f1234567890abcdef5678",
      "conversationId": "676f1234567890abcdef1234",
      "role": "USER",
      "content": "こんにちは！AIチャットのテストです。",
      "metadata": null,
      "createdAt": "2025-12-29T12:01:00.000Z"
    },
    {
      "id": "676f1234567890abcdef9012",
      "conversationId": "676f1234567890abcdef1234",
      "role": "ASSISTANT",
      "content": "こんにちは！テストありがとうございます。何かお手伝いできることはありますか？",
      "metadata": {
        "model": "claude-3-5-sonnet-20241022",
        "timestamp": "2025-12-29T12:01:05.000Z"
      },
      "createdAt": "2025-12-29T12:01:05.000Z"
    }
  ]
}
```

---

## 📡 API エンドポイント

### 会話管理

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| POST | `/api/conversations` | 新規会話作成 |
| GET | `/api/conversations/:conversationId` | 会話とメッセージ取得 |
| DELETE | `/api/conversations/:conversationId` | 会話削除 |

### メッセージ

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| POST | `/api/conversations/:conversationId/messages` | メッセージ送信とAI応答取得 |

### セッション

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/sessions/:sessionId/conversations` | セッションの全会話取得 |

### ヘルスチェック

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/health` | ヘルスチェック |
| GET | `/api/health/ready` | Readinessプローブ |
| GET | `/api/health/live` | Livenessプローブ |

---

## 🔍 トラブルシューティング

### データベース接続エラー

**エラー:**
```
Failed to start server
Database connection failed
```

**解決方法:**
1. `.env` の `DATABASE_URL` が正しいか確認
2. MongoDB Atlasの場合、IPホワイトリストを確認
3. ネットワーク接続を確認

```bash
# 接続テスト
cd api
pnpm prisma db push
```

### Claude API エラー

**エラー:**
```
CLAUDE_API_KEY environment variable is required
```

**解決方法:**
1. `.env` に `CLAUDE_API_KEY` を設定
2. APIキーが有効か確認（https://console.anthropic.com）
3. APIクレジットが残っているか確認

### ポート使用中エラー

**エラー:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解決方法:**
```bash
# ポート3001を使用しているプロセスを確認
lsof -i :3001

# プロセスを終了
kill -9 <PID>

# または別のポートを使用
PORT=3002 pnpm dev
```

### Prisma Client エラー

**エラー:**
```
Cannot find module '@prisma/client'
```

**解決方法:**
```bash
cd api
pnpm prisma generate
```

---

## 📝 ログの確認

開発モードでは、すべてのリクエストとレスポンスがコンソールに出力されます：

```
[12:00:00] INFO: Server is running on http://localhost:3001
[12:01:00] INFO: POST /api/conversations - 201 Created
[12:01:05] INFO: POST /api/conversations/676f.../messages - 200 OK
```

---

## 🚀 次のステップ

APIサーバーが正常に動作したら、Phase 3のフロントエンド実装に進むことができます。

詳細は `../TODO.md` を参照してください。
