# AI Chat Claude - 実装計画（TODO リスト）

## 概要

CLAUDE.mdの仕様に基づいた、AI Chat Claudeアプリケーションの段階的な実装計画です。各タスクをチェックリスト形式で管理し、進捗を追跡できるようにしています。

---

## Phase 1: プロジェクト基盤構築

### 1.1 ディレクトリ構造の作成

- [x] `frontend/` ディレクトリを作成
- [x] `api/` ディレクトリを作成
- [x] `shared/` ディレクトリを作成
- [x] `docs/` ディレクトリを作成（オプション）
- [x] `.github/workflows/` ディレクトリを作成（Phase 5用）

---

### 1.2 Sharedパッケージの初期化

#### パッケージ設定
- [x] `shared/package.json` を作成
- [x] `shared/tsconfig.json` を作成

#### 型定義ファイル
- [x] `shared/src/types/conversation.ts` を作成
  - Role enum (USER, ASSISTANT, SYSTEM)
  - Conversation interface
  - Message interface
- [x] `shared/src/types/api.ts` を作成
  - CreateConversationRequest/Response
  - SendMessageRequest/Response
  - GetConversationResponse
  - ApiError
- [x] `shared/src/index.ts` を作成（型のエクスポート）

---

### 1.3 APIパッケージの初期化

#### パッケージ設定
- [x] `api/package.json` を作成
  - 依存関係: @mastra/core, @mastra/anthropic, @prisma/client, hono, zod, pino
- [x] `api/tsconfig.json` を作成

---

### 1.4 Prismaスキーマの実装

- [x] `api/prisma/schema.prisma` を作成
  - Conversation モデル定義
  - Message モデル定義
  - Role enum定義
- [x] Prisma Client生成: `cd api && pnpm prisma generate`
- [x] MongoDBスキーマ同期: `cd api && pnpm prisma db push` (Phase 4で環境変数設定後に実行)

---

### 1.5 Frontendパッケージの初期化

#### パッケージ設定
- [x] `frontend/package.json` を作成
  - 依存関係: next, react, react-dom, tailwindcss, uuid
- [x] `frontend/tsconfig.json` を作成
- [x] `frontend/next.config.js` を作成
- [x] `frontend/tailwind.config.js` を作成
- [x] `frontend/postcss.config.js` を作成

---

## Phase 2: バックエンド実装

### 2.1 基本インフラストラクチャ

- [x] `api/src/lib/prisma.ts` を作成
  - PrismaClientのシングルトンインスタンス
  - グレースフルシャットダウン処理
- [x] `api/src/lib/logger.ts` を作成
  - Pinoロガーの設定
  - 開発/本番環境の切り替え
- [x] `api/src/lib/mastra.ts` を作成
  - Mastraクライアントの初期化
  - Claude API設定

---

### 2.2 リポジトリ層の実装

- [x] `api/src/repositories/conversation.repository.ts` を作成
  - create(): 会話作成
  - findById(): ID検索
  - findBySessionId(): セッションID検索
  - updateTitle(): タイトル更新
- [x] `api/src/repositories/message.repository.ts` を作成
  - create(): メッセージ作成
  - findByConversationId(): 会話IDでメッセージ取得
  - count(): メッセージ数カウント

---

### 2.3 サービス層の実装

- [x] `api/src/services/conversation.service.ts` を作成
  - create(): 会話作成（sessionId生成含む）
  - getById(): 会話とメッセージ取得
  - getBySessionId(): セッションの全会話取得
- [x] `api/src/services/chat.service.ts` を作成
  - sendMessage(): ユーザーメッセージ保存、AI応答生成、AIメッセージ保存
  - 会話履歴取得とMastra連携
  - 自動タイトル生成（最初のメッセージ時）

---

### 2.4 ミドルウェアの実装

- [x] `api/src/middleware/error-handler.ts` を作成
  - Zodバリデーションエラー処理
  - カスタムエラー処理
  - AI APIエラー処理
  - 内部サーバーエラー処理
- [x] `api/src/middleware/rate-limit.ts` を作成
  - インメモリレート制限実装
  - IP別のリクエスト制限

---

### 2.5 ルート定義

- [x] `api/src/routes/conversations.ts` を作成
  - POST /api/conversations - 会話作成
  - GET /api/conversations/:conversationId - 会話取得
  - POST /api/conversations/:conversationId/messages - メッセージ送信
  - Zodスキーマバリデーション
- [x] `api/src/routes/sessions.ts` を作成
  - GET /api/sessions/:sessionId/conversations - セッション会話一覧
- [x] `api/src/routes/health.ts` を作成
  - GET /api/health - ヘルスチェック

---

### 2.6 アプリケーションエントリポイント

- [x] `api/src/app.ts` を作成
  - Honoアプリ初期化
  - CORS設定
  - ロギングミドルウェア
  - レート制限ミドルウェア
  - ルート登録
  - エラーハンドリング
- [x] `api/src/index.ts` を作成
  - サーバー起動処理
  - ポート設定

---

## Phase 3: フロントエンド実装

### 3.1 ユーティリティとヘルパー

- [x] `frontend/src/lib/utils.ts` を作成
  - cn(): Tailwindクラス結合関数
  - formatDate(): 日付フォーマット関数
- [x] `frontend/src/lib/constants.ts` を作成
  - API_URL, APP_NAME, APP_VERSION
  - ストレージキー定義
  - UI関連定数
- [x] `frontend/src/lib/api-client.ts` を作成
  - ApiClientクラス実装
  - createConversation()
  - sendMessage()
  - getConversation()
  - healthCheck()

---

### 3.2 カスタムフック

- [x] `frontend/src/hooks/useSession.ts` を作成
  - sessionId管理（LocalStorage）
  - conversationId管理
  - saveConversationId()
  - clearConversationId()
- [x] `frontend/src/hooks/useChat.ts` を作成
  - messages状態管理
  - sendMessage()関数
  - isLoading, error状態
  - 会話履歴の読み込み
- [x] `frontend/src/hooks/useAutoScroll.ts` を作成
  - 自動スクロール機能

---

### 3.3 UIコンポーネント

- [x] `frontend/src/components/ui/Button.tsx` を作成
  - variant: primary, secondary, ghost
  - size: sm, md, lg
- [x] `frontend/src/components/ui/Input.tsx` を作成
  - 基本入力フィールドコンポーネント

---

### 3.4 チャットコンポーネント

- [x] `frontend/src/components/chat/MessageItem.tsx` を作成
  - メッセージ表示（ユーザー/AI別スタイル）
  - タイムスタンプ表示
- [x] `frontend/src/components/chat/TypingIndicator.tsx` を作成
  - ローディングアニメーション
- [x] `frontend/src/components/chat/MessageList.tsx` を作成
  - メッセージ配列表示
  - 自動スクロール
  - 空状態の表示
- [x] `frontend/src/components/chat/MessageInput.tsx` を作成
  - テキストエリア
  - 送信ボタン
  - 文字数カウント
  - Enter送信、Shift+Enter改行
- [x] `frontend/src/components/chat/ChatContainer.tsx` を作成
  - 全体のチャットUI統合
  - useChat, useSession連携
  - エラー表示
  - 新規会話ボタン

---

### 3.5 レイアウトとページ

- [x] `frontend/src/app/globals.css` を作成
  - Tailwind directives
  - ベーススタイル
- [x] `frontend/src/app/layout.tsx` を作成
  - ルートレイアウト
  - メタデータ設定
  - フォント設定
- [x] `frontend/src/app/page.tsx` を作成
  - ChatContainerの配置

---

## Phase 4: 統合とテスト

### 4.1 依存関係インストール

- [x] ルートディレクトリで `pnpm install` 実行
- [x] すべてのワークスペースの依存関係が正しくインストールされることを確認

---

### 4.2 環境変数設定

- [x] `.env` ファイルを作成（`.env.example`をコピー）
- [x] `DATABASE_URL` を設定（MongoDB Atlas接続文字列）
- [x] `CLAUDE_API_KEY` を設定（Anthropic APIキー）
- [x] その他の環境変数を適宜設定

---

### 4.3 開発サーバー起動と動作確認

- [x] APIサーバーを起動: `cd api && pnpm dev`
- [x] Frontendサーバーを起動: `cd frontend && pnpm dev`
- [x] ブラウザで http://localhost:3000 にアクセス
- [x] メッセージ送信機能の動作確認
- [x] AI応答の受信確認
- [x] 会話履歴の保存確認
- [x] 新規会話作成の確認
- [x] ブラウザリロード後の会話復元確認

---

### 4.4 エラーハンドリングのテスト

- [x] ネットワークエラー時のエラーメッセージ表示確認
- [x] 空メッセージ送信の防止確認
- [x] 長すぎるメッセージの制限確認
- [x] データベース接続エラーのハンドリング確認
- [x] API制限超過時の適切なエラー表示確認

---

## Phase 5: デプロイ準備（オプション）

### 5.1 Dockerファイルの作成

- [ ] `api/Dockerfile` を作成
  - Multi-stage build
  - Prisma Client生成
  - 本番環境設定
- [ ] `frontend/Dockerfile` を作成
  - Next.js standalone出力
  - Multi-stage build
  - 本番環境設定

---

### 5.2 Docker Compose（ローカルテスト用）

- [ ] `docker-compose.yml` を作成
  - API、Frontend、MongoDBサービス定義
  - ボリューム設定
- [ ] Docker Composeでの動作確認

---

### 5.3 CI/CD設定

- [ ] `.github/workflows/deploy.yml` を作成
  - Google Cloud Run デプロイ設定
  - Docker イメージビルド・プッシュ
  - 環境変数・シークレット設定
- [ ] GitHub Secretsの設定
  - GCP_PROJECT_ID
  - WIF_PROVIDER
  - WIF_SERVICE_ACCOUNT
  - DATABASE_URL
  - CLAUDE_API_KEY

---

### 5.4 MongoDB Atlasセットアップ

- [ ] MongoDB Atlasアカウント作成
- [ ] クラスター作成（M0 Free Tier可）
- [ ] データベースユーザー作成
- [ ] ネットワークアクセス設定（IP Whitelist）
- [ ] 接続文字列取得
- [ ] 環境変数に設定

---

## 実装の優先順位

### 最優先（MVP完成に必須）
- [ ] Phase 1: プロジェクト基盤構築
- [ ] Phase 2: バックエンド実装
- [ ] Phase 3: フロントエンド実装
- [ ] Phase 4.1-4.3: 統合と基本動作確認

### 高優先度（品質向上）
- [ ] Phase 2.4: ミドルウェア（エラーハンドリング、レート制限）
- [ ] Phase 3.3: UIコンポーネント
- [ ] Phase 4.4: エラーハンドリングテスト

### 中〜低優先度（本番デプロイ時）
- [ ] Phase 5: デプロイ準備

---

## 推奨実装順序

- [ ] **Shared パッケージ** → 他のパッケージが依存する共通型定義
- [ ] **API パッケージ（バックエンド）** → Prismaスキーマ → Repository → Service → Routes → App
- [ ] **Frontend パッケージ** → Utils → Hooks → Components → Pages
- [ ] **統合テスト** → 全体が連携して動作することを確認
- [ ] **デプロイ準備** → Dockerファイル作成、CI/CD設定

---

## 重要なファイル一覧

### バックエンド
- `api/prisma/schema.prisma` - データモデル定義
- `api/src/lib/mastra.ts` - AI統合の核
- `api/src/services/chat.service.ts` - チャット機能のビジネスロジック
- `api/src/app.ts` - APIサーバーのエントリポイント

### フロントエンド
- `frontend/src/hooks/useChat.ts` - チャット機能管理
- `frontend/src/lib/api-client.ts` - API通信
- `frontend/src/components/chat/ChatContainer.tsx` - UIの中心コンポーネント

### 共通
- `shared/src/types/conversation.ts` - 会話関連型定義
- `shared/src/types/api.ts` - API型定義

---

## 備考

- 各ファイルの詳細な実装内容は、Plan agentの出力を参照
- MongoDB Atlasは無料プラン（M0）でも十分動作可能
- 開発中はローカルMongoDBも使用可能（Docker Composeで起動）
- Mastraの設定は環境変数から読み込み、柔軟に変更可能
- 認証機能はPhase 2以降の拡張として計画（現在は認証不要）

---

## 次のアクションステップ

- [ ] Phase 1から順番に実装を開始
- [ ] 各チェックボックスを完了したらマークする
- [ ] 問題が発生したらCLAUDE.mdの仕様を参照
- [ ] MVP完成後、Phase 2の拡張機能に進む

---

**作成日**: 2025-12-29
**ステータス**: Ready for Implementation
