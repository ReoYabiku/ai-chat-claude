# Docker Compose によるローカル開発環境セットアップ

このガイドでは、Docker Composeを使用してローカル開発環境でMongoDBを起動する方法を説明します。

## 📋 前提条件

- **Docker Desktop** がインストールされていること
- **Docker Compose** がインストールされていること（Docker Desktopに含まれます）

## 🚀 クイックスタート

### 1. MongoDBを起動

プロジェクトルートで以下を実行：

```bash
docker-compose up -d
```

これにより以下のサービスが起動します：
- **MongoDB** (ポート 27017) - メインデータベース
- **Mongo Express** (ポート 8081) - MongoDB管理UI

### 2. 起動確認

```bash
# コンテナの状態を確認
docker-compose ps

# ログを確認
docker-compose logs -f mongodb
```

**期待される出力:**
```
NAME                   IMAGE              STATUS         PORTS
ai-chat-mongodb        mongo:7.0          Up 10 seconds  0.0.0.0:27017->27017/tcp
ai-chat-mongo-express  mongo-express:1.0  Up 10 seconds  0.0.0.0:8081->8081/tcp
```

### 3. Mongo Express（管理UI）にアクセス

ブラウザで以下にアクセス：

```
http://localhost:8081
```

**ログイン情報:**
- ユーザー名: `admin`
- パスワード: `admin`

## 🔧 データベース接続情報

### 接続文字列

`.env` ファイルに以下が設定されています：

```env
DATABASE_URL="mongodb://admin:password123@localhost:27017/ai-chat?authSource=admin"
```

### 接続パラメータ

| パラメータ | 値 |
|----------|-----|
| **ホスト** | `localhost` |
| **ポート** | `27017` |
| **ユーザー名** | `admin` |
| **パスワード** | `password123` |
| **データベース名** | `ai-chat` |
| **認証DB** | `admin` |

## 📝 Prismaセットアップ

MongoDBが起動したら、Prismaのセットアップを実行：

```bash
cd api

# Prisma Clientを生成
pnpm prisma generate

# MongoDBにスキーマを同期
pnpm prisma db push
```

**期待される出力:**
```
✔ Generated Prisma Client
✔ The MongoDB database is now in sync with your Prisma schema
```

## 🧪 動作確認

### 方法1: APIサーバー起動

```bash
cd api
pnpm dev
```

**期待される出力:**
```
Database connection established
Server is running on http://localhost:3001
```

### 方法2: テストスクリプト実行

別のターミナルで：

```bash
cd api
./test-api.sh
```

### 方法3: MongoDBクライアントで直接確認

```bash
# MongoDBコンテナに接続
docker exec -it ai-chat-mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# データベース確認
show dbs
use ai-chat
show collections
```

## 🛑 サービスの停止

### 一時停止（データは保持）

```bash
docker-compose stop
```

### 完全停止（データは保持）

```bash
docker-compose down
```

### データも含めて削除

```bash
# ⚠️ 注意: すべてのデータが削除されます
docker-compose down -v
```

## 🔄 サービスの再起動

```bash
docker-compose restart
```

## 📊 データの確認

### Mongo Expressを使用（推奨）

1. http://localhost:8081 にアクセス
2. `ai-chat` データベースを選択
3. コレクション（`conversations`, `messages`）を確認

### mongoshを使用

```bash
# MongoDBコンテナに接続
docker exec -it ai-chat-mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# ai-chatデータベースを使用
use ai-chat

# 会話データを確認
db.conversations.find().pretty()

# メッセージデータを確認
db.messages.find().pretty()

# 件数確認
db.conversations.countDocuments()
db.messages.countDocuments()
```

## 🔍 トラブルシューティング

### ポート競合エラー

**症状:**
```
Error: port is already allocated
```

**解決策:**

ポート27017または8081が既に使用されている場合、`docker-compose.yml`を編集：

```yaml
services:
  mongodb:
    ports:
      - '27018:27017'  # ホスト側のポートを変更
```

`.env`の接続文字列も更新：
```env
DATABASE_URL="mongodb://admin:password123@localhost:27018/ai-chat?authSource=admin"
```

### コンテナが起動しない

```bash
# ログを確認
docker-compose logs mongodb

# コンテナを完全に削除して再作成
docker-compose down -v
docker-compose up -d
```

### データベース接続エラー

**症状:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**解決策:**

1. MongoDBコンテナが起動しているか確認：
```bash
docker-compose ps
```

2. ヘルスチェックを確認：
```bash
docker-compose logs mongodb | grep healthy
```

3. 接続テスト：
```bash
docker exec -it ai-chat-mongodb mongosh -u admin -p password123 --authenticationDatabase admin --eval "db.adminCommand('ping')"
```

### データの永続化

データはDockerボリューム `mongodb_data` に保存されます。

```bash
# ボリュームの確認
docker volume ls | grep mongodb

# ボリュームの詳細
docker volume inspect ai-chat-claude_mongodb_data
```

## 🔐 本番環境への切り替え

本番環境（MongoDB Atlas）を使用する場合：

1. `.env`ファイルを編集：

```env
# ローカルMongoDBをコメントアウト
# DATABASE_URL="mongodb://admin:password123@localhost:27017/ai-chat?authSource=admin"

# MongoDB Atlasのコメントを解除して接続文字列を設定
DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/ai-chat?retryWrites=true&w=majority"
```

2. Prismaスキーマを同期：

```bash
cd api
pnpm prisma db push
```

## 📚 参考情報

### Docker Composeコマンド一覧

| コマンド | 説明 |
|---------|------|
| `docker-compose up -d` | バックグラウンドで起動 |
| `docker-compose down` | 停止して削除 |
| `docker-compose ps` | 状態確認 |
| `docker-compose logs -f [service]` | ログ表示 |
| `docker-compose restart` | 再起動 |
| `docker-compose exec mongodb bash` | コンテナに接続 |

### MongoDBコマンド一覧

| コマンド | 説明 |
|---------|------|
| `show dbs` | データベース一覧 |
| `use ai-chat` | データベース選択 |
| `show collections` | コレクション一覧 |
| `db.conversations.find()` | 会話データ取得 |
| `db.messages.find()` | メッセージデータ取得 |
| `db.dropDatabase()` | データベース削除 |

## 🎯 次のステップ

MongoDBが正常に起動したら：

1. APIサーバーを起動: `cd api && pnpm dev`
2. テストスクリプトを実行: `cd api && ./test-api.sh`
3. Phase 3のフロントエンド実装に進む

詳細は `api/README.md` と `TODO.md` を参照してください。
