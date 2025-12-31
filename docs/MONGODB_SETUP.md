# MongoDB Atlas セットアップガイド

このガイドでは、AI Chat Claude アプリケーション用の MongoDB Atlas クラスターのセットアップ手順を説明します。

## 目次

- [前提条件](#前提条件)
- [1. MongoDB Atlas アカウント作成](#1-mongodb-atlas-アカウント作成)
- [2. クラスター作成](#2-クラスター作成)
- [3. データベースユーザー設定](#3-データベースユーザー設定)
- [4. ネットワークアクセス設定](#4-ネットワークアクセス設定)
- [5. 接続文字列取得](#5-接続文字列取得)
- [6. 環境変数設定](#6-環境変数設定)
- [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- 有効なメールアドレス
- クレジットカード（無料枠を使用する場合でも必要な場合があります）

---

## 1. MongoDB Atlas アカウント作成

1. **MongoDB Atlas サイトにアクセス**
   - https://www.mongodb.com/cloud/atlas にアクセス

2. **サインアップ**
   - 「Try Free」または「Start Free」ボタンをクリック
   - メールアドレス、パスワードを入力
   - または Google/GitHub アカウントでサインアップ

3. **アカウント確認**
   - 登録したメールアドレスに確認メールが届く
   - メール内のリンクをクリックしてアカウントを有効化

---

## 2. クラスター作成

### 2.1 Organization と Project の作成

1. **Organization 作成**
   - ログイン後、Organization 名を入力（例: `My Organization`）
   - 「Next」をクリック

2. **Project 作成**
   - Project 名を入力（例: `AI Chat Claude`）
   - 「Create Project」をクリック

### 2.2 クラスター作成

1. **クラスター作成画面へ**
   - Project ダッシュボードで「Build a Database」ボタンをクリック

2. **プランの選択**
   - **推奨**: **M0 Sandbox (FREE)**
   - 512 MB ストレージ
   - 開発・検証に最適
   - 本番環境では M10 以上を推奨

3. **クラウドプロバイダーとリージョンの選択**
   - **Provider**: AWS / Google Cloud / Azure（お好みで選択）
   - **Region**: **Asia Pacific - Tokyo (ap-northeast-1)** を推奨
     - または最寄りのリージョンを選択
   - 無料枠では選択肢が限られる場合があります

4. **クラスター名の設定**
   - **Cluster Name**: `ai-chat-cluster`（または任意の名前）
   - 「Create」ボタンをクリック

5. **クラスター作成完了**
   - クラスターのデプロイに1〜3分かかります
   - ステータスが「Active」になるまで待機

---

## 3. データベースユーザー設定

クラスターにアクセスするためのデータベースユーザーを作成します。

### 3.1 ユーザー作成

1. **Security タブに移動**
   - 左サイドバーの「Security」→「Database Access」をクリック

2. **新規ユーザー追加**
   - 「Add New Database User」ボタンをクリック

3. **ユーザー情報入力**
   - **Authentication Method**: Password
   - **Username**: `ai-chat-admin`（または任意のユーザー名）
   - **Password**:
     - 「Autogenerate Secure Password」をクリックして自動生成（推奨）
     - または手動で強力なパスワードを入力
     - ⚠️ **重要**: パスワードを必ずコピーして安全な場所に保存

4. **データベースユーザー権限**
   - **Built-in Role**:
     - **推奨**: `Read and write to any database`
     - または `Atlas admin`（管理者権限が必要な場合）

5. **ユーザー作成完了**
   - 「Add User」ボタンをクリック

---

## 4. ネットワークアクセス設定

クラスターへのネットワークアクセスを許可します。

### 4.1 IP アドレスホワイトリスト設定

1. **Network Access タブに移動**
   - 左サイドバーの「Security」→「Network Access」をクリック

2. **IP アドレス追加**
   - 「Add IP Address」ボタンをクリック

3. **アクセス許可設定**

   **開発環境の場合（推奨しません）:**
   - 「Allow Access from Anywhere」ボタンをクリック
   - IP アドレス: `0.0.0.0/0`
   - ⚠️ **セキュリティリスク**: 全てのIPアドレスからアクセス可能になります

   **本番環境の場合（推奨）:**
   - Cloud Run のアウトバウンド IP 範囲を追加
   - または VPC コネクタを使用した Private IP 設定

   **ローカル開発の場合:**
   - 「Add Current IP Address」ボタンをクリック
   - 現在の IP アドレスが自動追加されます

4. **説明の追加**
   - **Comment**: `Development Environment`（または用途を記載）

5. **確認**
   - 「Confirm」ボタンをクリック
   - ステータスが「Active」になるまで待機（数秒）

### 4.2 Cloud Run からのアクセス設定（本番環境）

Cloud Run から MongoDB Atlas へアクセスする場合：

**Option 1: IP ホワイトリスト（簡易）**
- `0.0.0.0/0` を許可（セキュリティリスクあり）

**Option 2: VPC Service Controls（推奨）**
- VPC コネクタを使用
- Private IP でアクセス
- MongoDB Atlas の Private Endpoint を使用

---

## 5. 接続文字列取得

### 5.1 接続文字列の取得

1. **Database タブに移動**
   - 左サイドバーの「Database」をクリック

2. **Connect ボタンをクリック**
   - クラスター名の右にある「Connect」ボタンをクリック

3. **接続方法の選択**
   - 「Connect your application」を選択

4. **Driver とバージョンの選択**
   - **Driver**: `Node.js`
   - **Version**: `5.5 or later`（最新版を選択）

5. **接続文字列をコピー**
   - 表示された接続文字列をコピー
   - 形式:
     ```
     mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
     ```

### 5.2 接続文字列の編集

接続文字列を以下のように編集します：

**元の接続文字列:**
```
mongodb+srv://<username>:<password>@ai-chat-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**編集後:**
```
mongodb+srv://ai-chat-admin:YOUR_PASSWORD@ai-chat-cluster.xxxxx.mongodb.net/ai-chat?retryWrites=true&w=majority
```

**変更点:**
- `<username>` → 作成したユーザー名（例: `ai-chat-admin`）
- `<password>` → 設定したパスワード
- `/?retryWrites` の前に `/ai-chat` を追加（データベース名）

⚠️ **重要**:
- パスワードに特殊文字（`@`, `:`, `/` など）が含まれる場合は URL エンコードが必要
- 例: `p@ssw0rd` → `p%40ssw0rd`

---

## 6. 環境変数設定

### 6.1 ローカル開発環境

1. **`.env` ファイルを編集**
   ```bash
   cd ai-chat-claude
   nano .env  # または任意のエディタ
   ```

2. **DATABASE_URL を設定**
   ```env
   DATABASE_URL="mongodb+srv://ai-chat-admin:YOUR_PASSWORD@ai-chat-cluster.xxxxx.mongodb.net/ai-chat?retryWrites=true&w=majority"
   ```

3. **設定の確認**
   ```bash
   # APIディレクトリに移動
   cd api

   # Prisma接続テスト
   pnpm prisma db push
   ```

### 6.2 本番環境（Google Cloud Secret Manager）

1. **Secret Manager に登録**
   ```bash
   # DATABASE_URLをSecret Managerに保存
   echo -n "mongodb+srv://ai-chat-admin:YOUR_PASSWORD@ai-chat-cluster.xxxxx.mongodb.net/ai-chat?retryWrites=true&w=majority" | \
   gcloud secrets create DATABASE_URL \
     --data-file=- \
     --replication-policy="automatic"
   ```

2. **Cloud Run へのデプロイ時に使用**
   - GitHub Actions ワークフロー（`.github/workflows/deploy.yml`）で自動設定
   - または手動デプロイ時に `--set-secrets` オプションで指定

---

## トラブルシューティング

### 接続エラー: "MongoNetworkError: failed to connect"

**原因:**
- IP アドレスがホワイトリストに登録されていない
- ネットワーク接続の問題

**解決方法:**
1. Network Access で現在の IP アドレスが許可されているか確認
2. クラスターのステータスが「Active」であることを確認
3. ファイアウォールが MongoDB Atlas への接続をブロックしていないか確認

### 認証エラー: "MongoServerError: Authentication failed"

**原因:**
- ユーザー名またはパスワードが間違っている
- パスワードの特殊文字が URL エンコードされていない

**解決方法:**
1. ユーザー名とパスワードを再確認
2. パスワードに特殊文字が含まれる場合は URL エンコード
3. Database Access でユーザーが存在するか確認

### データベース名が見つからない

**原因:**
- 接続文字列にデータベース名が含まれていない

**解決方法:**
1. 接続文字列に `/ai-chat` を追加
2. 形式: `mongodb+srv://...mongodb.net/ai-chat?retryWrites=...`

### 接続が遅い

**原因:**
- クラスターのリージョンが遠い

**解決方法:**
1. 最寄りのリージョンにクラスターを作成し直す
2. Tokyo リージョン（ap-northeast-1）の使用を推奨

---

## 参考リンク

- [MongoDB Atlas 公式ドキュメント](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Prisma MongoDB Connector](https://www.prisma.io/docs/concepts/database-connectors/mongodb)

---

**作成日**: 2025-12-30
**最終更新**: 2025-12-30
