# Google Cloud Run デプロイガイド

このガイドでは、AI Chat Claude アプリケーションを Google Cloud Run にデプロイする手順を説明します。

## 目次

- [前提条件](#前提条件)
- [1. GCP プロジェクトのセットアップ](#1-gcp-プロジェクトのセットアップ)
- [2. gcloud CLI のインストールと設定](#2-gcloud-cli-のインストールと設定)
- [3. 必要な API の有効化](#3-必要な-api-の有効化)
- [4. Artifact Registry のセットアップ](#4-artifact-registry-のセットアップ)
- [5. Secret Manager の設定](#5-secret-manager-の設定)
- [6. 手動デプロイ](#6-手動デプロイ)
- [7. GitHub Actions によるCI/CD設定](#7-github-actions-によるcicd設定)
- [8. デプロイ後の確認](#8-デプロイ後の確認)
- [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### 必要なもの

- Google Cloud Platform アカウント
- クレジットカード（無料枠内でも必要）
- MongoDB Atlas クラスター（[MongoDB セットアップガイド](./MONGODB_SETUP.md)参照）
- Anthropic Claude API キー（https://console.anthropic.com から取得）
- Git リポジトリ（GitHub）

### ローカル環境

- Node.js 20.x 以上
- pnpm 8.x 以上
- Docker Desktop（ローカルビルドテスト用）
- gcloud CLI

---

## 1. GCP プロジェクトのセットアップ

### 1.1 プロジェクト作成

1. **Google Cloud Console にアクセス**
   - https://console.cloud.google.com

2. **新規プロジェクト作成**
   - 画面上部のプロジェクト選択メニューから「新しいプロジェクト」を選択
   - プロジェクト名: `ai-chat-claude`（または任意の名前）
   - プロジェクト ID: 自動生成または手動で指定（例: `ai-chat-claude-prod`）
   - 「作成」をクリック

3. **プロジェクトIDの確認**
   ```bash
   # プロジェクトIDを確認（後で使用）
   gcloud projects list
   ```

### 1.2 請求先アカウントの設定

1. **請求先アカウントをリンク**
   - 左サイドバーの「お支払い」→「アカウントをリンク」
   - 既存の請求先アカウントを選択、または新規作成

⚠️ **重要**: Cloud Run の無料枠
- 月あたり 200 万リクエスト無料
- 36 万 vCPU 秒、20 万 GiB 秒のコンピューティング時間
- 1 GB のネットワーク下りトラフィック

---

## 2. gcloud CLI のインストールと設定

### 2.1 gcloud CLI のインストール

**macOS:**
```bash
# Homebrew を使用
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
# 公式インストーラー
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Windows:**
- https://cloud.google.com/sdk/docs/install からインストーラーをダウンロード

### 2.2 gcloud の初期化

```bash
# gcloud 初期化
gcloud init

# プロジェクトを設定
gcloud config set project PROJECT_ID

# 例:
# gcloud config set project ai-chat-claude-prod

# 現在の設定を確認
gcloud config list
```

### 2.3 認証

```bash
# アプリケーションのデフォルト認証情報を設定
gcloud auth application-default login

# ログイン
gcloud auth login
```

---

## 3. 必要な API の有効化

以下の API を有効化します：

```bash
# Cloud Run API
gcloud services enable run.googleapis.com

# Artifact Registry API（コンテナイメージ保存用）
gcloud services enable artifactregistry.googleapis.com

# Cloud Build API（イメージビルド用）
gcloud services enable cloudbuild.googleapis.com

# Secret Manager API（機密情報管理用）
gcloud services enable secretmanager.googleapis.com

# Container Registry API（従来のレジストリ、オプション）
gcloud services enable containerregistry.googleapis.com

# 一括有効化
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

### API 有効化の確認

```bash
gcloud services list --enabled
```

---

## 4. Artifact Registry のセットアップ

### 4.1 リポジトリ作成

```bash
# Docker リポジトリを作成
gcloud artifacts repositories create ai-chat-claude \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="AI Chat Claude container images"
```

### 4.2 Docker 認証設定

```bash
# gcloud を Docker 認証ヘルパーとして設定
gcloud auth configure-docker asia-northeast1-docker.pkg.dev
```

---

## 5. Secret Manager の設定

機密情報（API キー、データベース接続文字列）を Secret Manager で管理します。

### 5.1 ANTHROPIC_API_KEY の登録

```bash
# Claude API キーを登録
echo -n "sk-ant-api03-YOUR_API_KEY_HERE" | \
gcloud secrets create ANTHROPIC_API_KEY \
  --data-file=- \
  --replication-policy="automatic"
```

### 5.2 DATABASE_URL の登録

```bash
# MongoDB 接続文字列を登録
echo -n "mongodb+srv://username:password@cluster.mongodb.net/ai-chat?retryWrites=true&w=majority" | \
gcloud secrets create DATABASE_URL \
  --data-file=- \
  --replication-policy="automatic"
```

### 5.3 Secret の確認

```bash
# 登録された Secret を確認
gcloud secrets list

# Secret の詳細を表示
gcloud secrets describe ANTHROPIC_API_KEY
gcloud secrets describe DATABASE_URL
```

### 5.4 Secret の更新（必要に応じて）

```bash
# 新しいバージョンを追加
echo -n "NEW_VALUE" | \
gcloud secrets versions add ANTHROPIC_API_KEY \
  --data-file=-
```

---

## 6. 手動デプロイ

### 6.1 環境変数の設定

```bash
# プロジェクト ID を環境変数に設定
export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-northeast1
export REPOSITORY=ai-chat-claude
```

### 6.2 API のデプロイ

```bash
# 1. プロジェクトルートに移動
cd ai-chat-claude

# 2. Docker イメージをビルド
docker build \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/api:latest \
  -f api/Dockerfile \
  ./api

# 3. Artifact Registry にプッシュ
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/api:latest

# 4. Cloud Run にデプロイ
gcloud run deploy ai-chat-api \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/api:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-secrets ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,DATABASE_URL=DATABASE_URL:latest \
  --set-env-vars NODE_ENV=production,PORT=8080,LOG_LEVEL=info \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60

# 5. デプロイされた URL を取得
API_URL=$(gcloud run services describe ai-chat-api \
  --region ${REGION} \
  --format 'value(status.url)')

echo "API deployed to: ${API_URL}"
```

### 6.3 Frontend のデプロイ

```bash
# 1. Docker イメージをビルド（API URL を build-arg で渡す）
docker build \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=${API_URL} \
  --build-arg NEXT_PUBLIC_APP_NAME="AI Chat Claude" \
  --build-arg NEXT_PUBLIC_APP_VERSION="1.0.0" \
  -f frontend/Dockerfile \
  ./frontend

# 2. Artifact Registry にプッシュ
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/frontend:latest

# 3. Cloud Run にデプロイ
gcloud run deploy ai-chat-frontend \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/frontend:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,NEXT_PUBLIC_API_URL=${API_URL},NEXT_PUBLIC_APP_NAME="AI Chat Claude",NEXT_PUBLIC_APP_VERSION="1.0.0" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60

# 4. デプロイされた URL を取得
FRONTEND_URL=$(gcloud run services describe ai-chat-frontend \
  --region ${REGION} \
  --format 'value(status.url)')

echo "Frontend deployed to: ${FRONTEND_URL}"
```

---

## 7. GitHub Actions によるCI/CD設定

### 7.1 サービスアカウントの作成

```bash
# サービスアカウントを作成
gcloud iam service-accounts create github-actions \
  --display-name "GitHub Actions Deployment"

# サービスアカウントのメールアドレスを取得
SA_EMAIL=$(gcloud iam service-accounts list \
  --filter="displayName:GitHub Actions Deployment" \
  --format='value(email)')

echo "Service Account Email: ${SA_EMAIL}"
```

### 7.2 サービスアカウントへの権限付与

```bash
# 必要な権限を付与
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"
```

### 7.3 サービスアカウントキーの作成

```bash
# JSON キーファイルを作成
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=${SA_EMAIL}

# キーファイルの内容を表示（GitHub Secrets に登録）
cat github-actions-key.json
```

⚠️ **重要**: キーファイルは機密情報です。安全に管理してください。

### 7.4 GitHub Secrets の設定

1. **GitHub リポジトリにアクセス**
   - https://github.com/YOUR_USERNAME/ai-chat-claude

2. **Settings → Secrets and variables → Actions**

3. **以下の Secrets を追加:**

   **GCP_PROJECT_ID**
   ```
   ai-chat-claude-prod
   ```

   **GCP_SA_KEY**
   ```json
   {
     "type": "service_account",
     "project_id": "ai-chat-claude-prod",
     ...
   }
   ```
   ↑ `github-actions-key.json` の内容全体をコピー

### 7.5 GitHub Actions ワークフローの確認

既に作成済みの以下のワークフローが自動実行されます：

- `.github/workflows/lint.yml`: PR/Push 時に Lint & Type Check
- `.github/workflows/deploy.yml`: main ブランチへの Push 時にデプロイ

### 7.6 デプロイの実行

```bash
# main ブランチに push すると自動デプロイが開始
git add .
git commit -m "Deploy to production"
git push origin main

# GitHub Actions のログを確認
# https://github.com/YOUR_USERNAME/ai-chat-claude/actions
```

---

## 8. デプロイ後の確認

### 8.1 サービスの確認

```bash
# デプロイされたサービス一覧
gcloud run services list --region ${REGION}

# API サービスの詳細
gcloud run services describe ai-chat-api --region ${REGION}

# Frontend サービスの詳細
gcloud run services describe ai-chat-frontend --region ${REGION}
```

### 8.2 ログの確認

```bash
# API のログを確認
gcloud logs read --service=ai-chat-api --limit=50

# Frontend のログを確認
gcloud logs read --service=ai-chat-frontend --limit=50

# リアルタイムでログを監視
gcloud logs tail --service=ai-chat-api
```

### 8.3 ヘルスチェック

```bash
# API ヘルスチェック
curl ${API_URL}/api/health

# 期待される応答:
# {"status":"ok","timestamp":"2025-12-30T...","version":"1.0.0"}
```

### 8.4 動作確認

1. **Frontend URL にアクセス**
   ```bash
   echo "Frontend URL: ${FRONTEND_URL}"
   ```

2. **ブラウザで開く**
   - チャット画面が表示されることを確認
   - メッセージを送信してAI応答が返ってくることを確認

---

## トラブルシューティング

### デプロイエラー: "Permission denied"

**原因:**
- サービスアカウントに必要な権限がない

**解決方法:**
```bash
# 権限を再確認・再付与
gcloud projects get-iam-policy ${PROJECT_ID}
```

### エラー: "Secret not found"

**原因:**
- Secret Manager に必要なシークレットが登録されていない

**解決方法:**
```bash
# Secret の存在確認
gcloud secrets list

# 登録されていなければ作成
gcloud secrets create ANTHROPIC_API_KEY --data-file=-
```

### コンテナが起動しない

**原因:**
- Docker イメージのビルドエラー
- 環境変数の設定ミス

**解決方法:**
```bash
# ローカルでビルドテスト
cd api
docker build -t test-api .

# ログを確認
gcloud logs read --service=ai-chat-api --limit=100
```

### MongoDB 接続エラー

**原因:**
- DATABASE_URL が正しく設定されていない
- MongoDB Atlas の IP ホワイトリスト設定

**解決方法:**
1. Secret Manager の DATABASE_URL を確認
2. MongoDB Atlas の Network Access で `0.0.0.0/0` を許可

### API が Frontend から呼び出せない

**原因:**
- CORS 設定
- NEXT_PUBLIC_API_URL の設定ミス

**解決方法:**
1. API の ALLOWED_ORIGINS 環境変数を確認
2. Frontend の NEXT_PUBLIC_API_URL を確認

---

## コスト管理

### 無料枠の確認

```bash
# 現在の請求額を確認（Google Cloud Console）
# https://console.cloud.google.com/billing
```

### コスト削減のヒント

1. **最小インスタンス数を 0 に設定**
   - リクエストがない時はインスタンスが 0 になり課金されない

2. **メモリとCPUを最適化**
   - 必要最小限のリソースに設定

3. **ログの保持期間を制限**
   ```bash
   gcloud logging buckets update _Default \
     --location=global \
     --retention-days=30
   ```

---

## 参考リンク

- [Cloud Run 公式ドキュメント](https://cloud.google.com/run/docs)
- [Secret Manager 公式ドキュメント](https://cloud.google.com/secret-manager/docs)
- [Artifact Registry 公式ドキュメント](https://cloud.google.com/artifact-registry/docs)
- [Cloud Run 料金](https://cloud.google.com/run/pricing)

---

**作成日**: 2025-12-30
**最終更新**: 2025-12-30
