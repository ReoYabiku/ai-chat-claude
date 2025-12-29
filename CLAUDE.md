# AI Chat Claude - プロジェクト仕様書

## 1. プロジェクト概要

### 1.1 基本情報

- **プロジェクト名**: AI Chat Claude
- **バージョン**: 1.0.0
- **最終更新日**: 2025-12-29

### 1.2 目的とビジョン

汎用的な会話アシスタントとして、誰でも気軽に使えるWebベースのAIチャットボットを提供します。Claude APIを活用した高品質な会話体験と、シンプルで直感的なインターフェースを特徴とします。

### 1.3 主要機能の概要

- テキストベースの会話機能
- 会話履歴の保存と管理
- レスポンシブデザイン（デスクトップ・モバイル対応）

### 1.4 対象ユーザー

- 認証不要で誰でもアクセス可能
- 技術的な知識がなくても利用できるシンプルなUI
- 日本語・英語での会話に対応

### 1.5 プロジェクトの特徴

- **認証不要**: ログインなしで即座に利用開始
- **高品質な会話**: Anthropic Claude APIによる自然な対話
- **拡張性**: Mastraフレームワークによる将来的な機能拡張に対応
- **スケーラブル**: Google Cloud Runによる自動スケーリング
- **モダンな技術スタック**: Next.js、Hono、Prisma、TypeScriptによる型安全な開発

---

## 2. システムアーキテクチャ

### 2.1 アーキテクチャ図

```
┌─────────────────────────────────────────────────┐
│              Browser (ユーザー)                    │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────┐
│          Next.js Frontend (SSR/CSR)              │
│  ┌────────────────────────────────────────┐     │
│  │  - Pages/App Router                    │     │
│  │  - React Components                    │     │
│  │  - State Management (Hooks + Context)  │     │
│  │  - Tailwind CSS Styling                │     │
│  └────────────────────────────────────────┘     │
└───────────────────┬─────────────────────────────┘
                    │ API Routes / fetch
                    ▼
┌─────────────────────────────────────────────────┐
│            Hono API Server                       │
│  ┌────────────────────────────────────────┐     │
│  │  - REST Endpoints                      │     │
│  │  - Middleware (CORS, Logging, etc.)    │     │
│  │  - Validation (Zod)                    │     │
│  │  - Error Handling                      │     │
│  └────────────────────────────────────────┘     │
└───────┬───────────────────────┬─────────────────┘
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────────┐
│   Mastra     │        │  Prisma Client   │
│  Framework   │        │                  │
│              │        │  - ORM           │
│ - Agents     │        │  - Schema Mgmt   │
│ - Workflows  │        │  - Type Safety   │
└──────┬───────┘        └────────┬─────────┘
       │                         │
       ▼                         ▼
┌──────────────┐        ┌──────────────────┐
│  Claude API  │        │   MongoDB Atlas  │
│  (Anthropic) │        │                  │
│              │        │  - Conversations │
│ - Chat       │        │  - Messages      │
│ - Streaming  │        │  - Sessions      │
└──────────────┘        └──────────────────┘
```

### 2.2 レイヤー構成

| レイヤー | 技術 | 責務 |
|---------|------|------|
| **プレゼンテーション層** | Next.js (React) | ユーザーインターフェース、ユーザー入力の受付、データの表示 |
| **アプリケーション層** | Hono API + Mastra | ビジネスロジック、AIエージェント制御、APIエンドポイント提供 |
| **データアクセス層** | Prisma ORM | データベース操作の抽象化、型安全なクエリ |
| **データ永続化層** | MongoDB | 会話データの永続化、ドキュメント指向ストレージ |

### 2.3 通信フロー

1. ユーザーがブラウザからメッセージを入力し送信
2. Next.jsフロントエンドがHono APIへHTTPリクエストを送信
3. Hono APIがリクエストをバリデーション
4. MastraエージェントがClaude APIと通信してAI応答を生成
5. 会話履歴（ユーザーメッセージ + AI応答）をPrisma経由でMongoDBに保存
6. レスポンスをJSON形式でフロントエンドに返却
7. フロントエンドが新しいメッセージをUI上に表示

---

## 3. 技術スタック詳細

### 3.1 フロントエンド

| 技術 | バージョン | 用途 |
|-----|----------|------|
| **Next.js** | 14+ | Reactフレームワーク、App Router使用 |
| **React** | 18+ | UI構築、コンポーネントベース開発 |
| **TypeScript** | 5+ | 型安全性、開発体験向上 |
| **Tailwind CSS** | 3+ | ユーティリティファーストCSSフレームワーク |
| **React Hooks** | - | 状態管理（useState, useEffect, カスタムフック） |

**主な選定理由:**
- **Next.js App Router**: SSR/CSRのハイブリッド、Server Components活用
- **Tailwind CSS**: 迅速なUI開発、保守性の高いスタイリング
- **TypeScript**: エンドツーエンドの型安全性

### 3.2 バックエンド

| 技術 | バージョン | 用途 |
|-----|----------|------|
| **Hono** | Latest | 高速軽量Webフレームワーク |
| **Prisma** | 5+ | 型安全ORM、スキーマ管理 |
| **Mastra** | Latest | AIエージェントフレームワーク |
| **Zod** | Latest | スキーマバリデーション |

**主な選定理由:**
- **Hono**: Edge対応、高速、型安全なルーティング
- **Prisma**: MongoDB Connector、マイグレーション管理、型生成
- **Mastra**: Claude API統合、エージェントワークフロー管理

### 3.3 データベース

| 技術 | 用途 |
|-----|------|
| **MongoDB Atlas** | マネージドNoSQLデータベース |

**選定理由:**
- ドキュメント指向で会話データの保存に最適
- 柔軟なスキーマ設計
- Atlasによる運用負荷軽減

### 3.4 AI/ML

| 技術 | 用途 |
|-----|------|
| **Claude API** | 自然言語処理、会話生成 |
| **Claude 3.5 Sonnet** | 推奨モデル（バランス型） |

### 3.5 インフラストラクチャ

| 技術 | 用途 |
|-----|------|
| **Google Cloud Run** | コンテナベースデプロイ、自動スケーリング |
| **Docker** | アプリケーションのコンテナ化 |
| **Google Cloud Logging** | ログ管理 |

### 3.6 開発ツール

| 技術 | 用途 |
|-----|------|
| **Node.js** | 20.x LTS ランタイム |
| **pnpm** | 高速パッケージマネージャー |
| **ESLint** | コード品質チェック |
| **Prettier** | コードフォーマッター |
| **Husky** | Git hooks管理 |

---

## 4. 機能要件

### 4.1 基本チャット機能（MVP）

| ID | 要件 | 優先度 |
|----|------|--------|
| **FR-001** | ユーザーはテキストメッセージを送信できる | 高 |
| **FR-002** | AIが自然な日本語/英語で応答する | 高 |
| **FR-003** | 会話履歴が画面上に時系列で表示される | 高 |
| **FR-004** | 新しい会話セッションを開始できる | 中 |
| **FR-005** | 会話がセッション単位で自動保存される | 高 |

### 4.2 UI/UX要件

| ID | 要件 | 優先度 |
|----|------|--------|
| **FR-006** | シンプルで直感的なチャットインターフェース | 高 |
| **FR-007** | レスポンシブデザイン（モバイル・タブレット対応） | 高 |
| **FR-008** | AIが応答中はローディング表示を行う | 高 |
| **FR-009** | エラー発生時は適切なメッセージを表示する | 高 |
| **FR-010** | メッセージ送信はEnterキーで可能 | 中 |

### 4.3 データ管理

| ID | 要件 | 優先度 |
|----|------|--------|
| **FR-011** | 会話履歴をデータベースに永続化する | 高 |
| **FR-012** | ブラウザごとにユニークなセッションIDを生成 | 高 |
| **FR-013** | セッションIDに基づいて過去の会話を取得できる | 中 |

### 4.4 将来の拡張性（Phase 2以降）

| ID | 要件 | 優先度 |
|----|------|--------|
| **FR-014** | AIストリーミング応答のサポート | 低 |
| **FR-015** | ファイルアップロード機能（画像・PDF等） | 低 |
| **FR-016** | マルチエージェント対応（Mastra活用） | 低 |
| **FR-017** | 会話のエクスポート機能 | 低 |

---

## 5. 非機能要件

### 5.1 パフォーマンス

| ID | 要件 | 目標値 |
|----|------|--------|
| **NFR-001** | API応答時間（通常時） | < 5秒 |
| **NFR-002** | ページ初回ロード時間 | < 3秒 |
| **NFR-003** | ストリーミング応答の初回トークン到達時間（Phase 2） | < 2秒 |

### 5.2 スケーラビリティ

| ID | 要件 | 目標値 |
|----|------|--------|
| **NFR-004** | 同時接続ユーザー数（初期） | 100ユーザー |
| **NFR-005** | Cloud Runの自動スケーリング活用 | 設定済み |

### 5.3 可用性

| ID | 要件 | 目標値 |
|----|------|--------|
| **NFR-006** | 稼働率 | 95%以上 |
| **NFR-007** | エラーハンドリングの適切な実装 | 100% |

### 5.4 セキュリティ

| ID | 要件 | 実装方法 |
|----|------|---------|
| **NFR-008** | API Key環境変数管理 | Secret Manager使用 |
| **NFR-009** | HTTPS通信 | Cloud Run標準機能 |
| **NFR-010** | レートリミット実装 | Honoミドルウェア |
| **NFR-011** | XSS/CSRF対策 | Next.js標準機能 + バリデーション |

### 5.5 保守性

| ID | 要件 | 目標値 |
|----|------|--------|
| **NFR-012** | TypeScript型定義カバレッジ | 100% |
| **NFR-013** | コードカバレッジ（Phase 2） | > 70% |
| **NFR-014** | ESLintルール準拠 | 100% |

### 5.6 運用

| ID | 要件 | 実装方法 |
|----|------|---------|
| **NFR-015** | ログ出力 | Google Cloud Logging |
| **NFR-016** | エラー監視 | ログベース監視 |
| **NFR-017** | 環境変数による設定管理 | .env + Secret Manager |

---

## 6. データモデル設計

### 6.1 Prismaスキーマ定義

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// 会話セッション
model Conversation {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  sessionId String   @unique
  title     String?  // 会話のタイトル（最初のメッセージから生成）
  messages  Message[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("conversations")
}

// メッセージ
model Message {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String       @db.ObjectId
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           Role
  content        String
  metadata       Json?        // 追加情報（model名、token数など）
  createdAt      DateTime     @default(now())

  @@map("messages")
}

enum Role {
  USER
  ASSISTANT
  SYSTEM
}
```

### 6.2 データモデル説明

#### Conversationモデル

| フィールド | 型 | 説明 |
|----------|---|------|
| `id` | ObjectId | MongoDB自動生成ID |
| `sessionId` | String (unique) | ブラウザセッションとの紐付けID |
| `title` | String? | 会話タイトル（オプション、最初のメッセージから生成） |
| `messages` | Message[] | この会話に属するメッセージ配列 |
| `createdAt` | DateTime | 会話作成日時 |
| `updatedAt` | DateTime | 最終更新日時 |

#### Messageモデル

| フィールド | 型 | 説明 |
|----------|---|------|
| `id` | ObjectId | MongoDB自動生成ID |
| `conversationId` | ObjectId | 所属する会話のID |
| `conversation` | Conversation | リレーション |
| `role` | Role | メッセージの役割（USER/ASSISTANT/SYSTEM） |
| `content` | String | メッセージ本文 |
| `metadata` | Json? | 拡張情報（使用モデル、トークン数等） |
| `createdAt` | DateTime | メッセージ作成日時 |

#### Role列挙型

- `USER`: ユーザーからのメッセージ
- `ASSISTANT`: AIからの応答
- `SYSTEM`: システムメッセージ（プロンプト等）

### 6.3 インデックス戦略

```javascript
// MongoDB Indexes

// 1. sessionId - 高速検索用
db.conversations.createIndex({ "sessionId": 1 }, { unique: true })

// 2. conversationId + createdAt - メッセージ取得最適化
db.messages.createIndex({ "conversationId": 1, "createdAt": 1 })

// 3. updatedAt - 最近の会話取得用
db.conversations.createIndex({ "updatedAt": -1 })
```

---

## 7. API設計

### 7.1 RESTful APIエンドポイント

#### 1. 会話作成

```
POST /api/conversations
```

**Request Body:**
```json
{
  "sessionId": "optional-uuid-v4"
}
```

**Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "createdAt": "2025-12-29T10:00:00Z"
}
```

#### 2. メッセージ送信

```
POST /api/conversations/:conversationId/messages
```

**Request Body:**
```json
{
  "content": "こんにちは、AIチャットボット！",
  "role": "user"
}
```

**Response (200 OK):**
```json
{
  "userMessage": {
    "id": "507f1f77bcf86cd799439012",
    "conversationId": "507f1f77bcf86cd799439011",
    "role": "USER",
    "content": "こんにちは、AIチャットボット！",
    "createdAt": "2025-12-29T10:01:00Z"
  },
  "assistantMessage": {
    "id": "507f1f77bcf86cd799439013",
    "conversationId": "507f1f77bcf86cd799439011",
    "role": "ASSISTANT",
    "content": "こんにちは！何かお手伝いできることはありますか？",
    "metadata": {
      "model": "claude-3-5-sonnet-20241022",
      "tokensUsed": 150
    },
    "createdAt": "2025-12-29T10:01:03Z"
  }
}
```

#### 3. 会話履歴取得

```
GET /api/conversations/:conversationId
```

**Response (200 OK):**
```json
{
  "conversation": {
    "id": "507f1f77bcf86cd799439011",
    "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "AIチャットボットとの会話",
    "createdAt": "2025-12-29T10:00:00Z",
    "updatedAt": "2025-12-29T10:05:00Z"
  },
  "messages": [
    {
      "id": "507f1f77bcf86cd799439012",
      "role": "USER",
      "content": "こんにちは、AIチャットボット！",
      "createdAt": "2025-12-29T10:01:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "role": "ASSISTANT",
      "content": "こんにちは！何かお手伝いできることはありますか？",
      "createdAt": "2025-12-29T10:01:03Z"
    }
  ]
}
```

#### 4. セッション会話一覧取得

```
GET /api/sessions/:sessionId/conversations
```

**Response (200 OK):**
```json
{
  "conversations": [
    {
      "id": "507f1f77bcf86cd799439011",
      "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "title": "AIチャットボットとの会話",
      "createdAt": "2025-12-29T10:00:00Z",
      "updatedAt": "2025-12-29T10:05:00Z"
    }
  ]
}
```

#### 5. ヘルスチェック

```
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-12-29T10:00:00Z",
  "version": "1.0.0"
}
```

### 7.2 エラーレスポンス形式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "field": "content",
      "issue": "Content cannot be empty"
    }
  }
}
```

**エラーコード一覧:**

| コード | HTTPステータス | 説明 |
|-------|--------------|------|
| `VALIDATION_ERROR` | 400 | リクエストバリデーションエラー |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `RATE_LIMIT` | 429 | レート制限超過 |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |
| `AI_SERVICE_ERROR` | 502 | Claude APIエラー |

### 7.3 Honoミドルウェア構成

```typescript
// api/src/app.ts

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limit';

const app = new Hono();

// CORS設定
app.use('/*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ロギング
app.use('/*', logger());

// レート制限
app.use('/api/*', rateLimiter());

// ルート登録
app.route('/api/conversations', conversationsRoutes);
app.route('/api/health', healthRoutes);

// エラーハンドリング
app.onError(errorHandler);

export default app;
```

### 7.4 Mastra統合パターン

```typescript
// api/src/lib/mastra.ts

import { Mastra } from '@mastra/core';
import { ClaudeProvider } from '@mastra/claude';

export const mastraClient = new Mastra({
  agents: {
    chatAgent: {
      provider: new ClaudeProvider({
        apiKey: process.env.CLAUDE_API_KEY!,
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4096,
      }),
      systemPrompt: '親切で役立つ日本語アシスタントです。自然で分かりやすい回答を心がけてください。',
      temperature: 0.7,
    }
  },
});

// 使用例
export async function generateChatResponse(userMessage: string, conversationHistory: Array<{ role: string; content: string }>) {
  const response = await mastraClient.agents.chatAgent.chat({
    messages: [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ],
  });

  return response.content;
}
```

---

## 8. フロントエンド構成

### 8.1 ディレクトリ構造（Next.js App Router）

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # ホームページ（チャット画面）
│   │   ├── globals.css             # グローバルスタイル
│   │   └── api/                    # API Routes
│   │       └── [...route]/
│   │           └── route.ts        # Honoプロキシ
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx   # チャットメインコンテナ
│   │   │   ├── MessageList.tsx     # メッセージ一覧
│   │   │   ├── MessageItem.tsx     # 個別メッセージ
│   │   │   ├── MessageInput.tsx    # 入力フォーム
│   │   │   └── TypingIndicator.tsx # ローディング表示
│   │   ├── layout/
│   │   │   ├── Header.tsx          # ヘッダー
│   │   │   └── Footer.tsx          # フッター
│   │   └── ui/                     # 共通UIコンポーネント
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Card.tsx
│   ├── hooks/
│   │   ├── useChat.ts              # チャット機能カスタムフック
│   │   ├── useSession.ts           # セッション管理フック
│   │   └── useAutoScroll.ts        # 自動スクロールフック
│   ├── lib/
│   │   ├── api-client.ts           # APIクライアント
│   │   ├── utils.ts                # ユーティリティ関数
│   │   └── constants.ts            # 定数定義
│   └── types/
│       ├── chat.ts                 # チャット関連型定義
│       └── api.ts                  # API関連型定義
├── public/
│   ├── favicon.ico
│   └── images/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── Dockerfile.frontend
```

### 8.2 主要コンポーネント設計

#### ChatContainer

**責務:**
- チャット全体の状態管理
- メッセージ送受信ロジック
- セッションID管理

```typescript
// src/components/chat/ChatContainer.tsx

import { useChat } from '@/hooks/useChat';

export default function ChatContainer() {
  const { messages, sendMessage, isLoading, error } = useChat();

  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} isLoading={isLoading} />
      {error && <ErrorDisplay error={error} />}
    </div>
  );
}
```

#### MessageList

**責務:**
- メッセージ配列の表示
- 自動スクロール
- 仮想スクロール（Phase 2）

#### MessageInput

**責務:**
- テキスト入力
- 送信ボタン制御
- Enter送信対応

### 8.3 状態管理戦略

```typescript
// src/hooks/useChat.ts

import { useState, useCallback } from 'react';
import type { Message } from '@/types/chat';
import { apiClient } from '@/lib/api-client';

interface UseChatReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useChat(conversationId?: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendMessage(conversationId!, content);
      setMessages(prev => [...prev, response.userMessage, response.assistantMessage]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  return { messages, sendMessage, isLoading, error };
}
```

### 8.4 スタイリング方針

- **Tailwind CSS**: ユーティリティファーストアプローチ
- **レスポンシブ**: モバイルファースト設計
- **カラースキーム**: ライトモード（Phase 1）、ダークモード（Phase 2）
- **アニメーション**: 控えめなトランジション

---

## 9. バックエンド構成

### 9.1 ディレクトリ構造（Hono API）

```
api/
├── src/
│   ├── index.ts                    # エントリポイント
│   ├── app.ts                      # Honoアプリ初期化
│   ├── routes/
│   │   ├── conversations.ts        # 会話関連ルート
│   │   ├── messages.ts             # メッセージ関連ルート
│   │   └── health.ts               # ヘルスチェック
│   ├── middleware/
│   │   ├── cors.ts                 # CORS設定
│   │   ├── logger.ts               # ロギング
│   │   ├── error-handler.ts        # エラーハンドリング
│   │   └── rate-limit.ts           # レート制限
│   ├── services/
│   │   ├── chat.service.ts         # チャットビジネスロジック
│   │   ├── mastra.service.ts       # Mastra統合
│   │   └── conversation.service.ts # 会話管理ロジック
│   ├── repositories/
│   │   ├── conversation.repository.ts  # 会話DB操作
│   │   └── message.repository.ts       # メッセージDB操作
│   ├── lib/
│   │   ├── prisma.ts               # Prismaクライアント
│   │   └── mastra.ts               # Mastra初期化
│   ├── types/
│   │   └── index.ts                # 型定義
│   └── utils/
│       └── validation.ts           # バリデーション（Zod）
├── prisma/
│   └── schema.prisma               # Prismaスキーマ
├── Dockerfile
├── tsconfig.json
└── package.json
```

### 9.2 レイヤーアーキテクチャ

#### Routes層（ルート定義）

**責務:**
- HTTPリクエスト/レスポンス処理
- リクエストバリデーション
- Services層の呼び出し

```typescript
// src/routes/conversations.ts

import { Hono } from 'hono';
import { z } from 'zod';
import { conversationService } from '../services/conversation.service';

const app = new Hono();

const createConversationSchema = z.object({
  sessionId: z.string().uuid().optional(),
});

app.post('/', async (c) => {
  const body = await c.req.json();
  const validated = createConversationSchema.parse(body);

  const conversation = await conversationService.create(validated.sessionId);
  return c.json(conversation, 201);
});

export default app;
```

#### Services層（ビジネスロジック）

**責務:**
- ビジネスロジックの実装
- Mastraエージェント呼び出し
- トランザクション制御

```typescript
// src/services/chat.service.ts

import { mastraClient } from '../lib/mastra';
import { conversationRepository } from '../repositories/conversation.repository';
import { messageRepository } from '../repositories/message.repository';

export class ChatService {
  async sendMessage(conversationId: string, userContent: string) {
    // ユーザーメッセージを保存
    const userMessage = await messageRepository.create({
      conversationId,
      role: 'USER',
      content: userContent,
    });

    // 会話履歴を取得
    const history = await messageRepository.findByConversationId(conversationId);

    // Mastraでレスポンス生成
    const aiResponse = await mastraClient.agents.chatAgent.chat({
      messages: history.map(m => ({ role: m.role.toLowerCase(), content: m.content })),
    });

    // AIメッセージを保存
    const assistantMessage = await messageRepository.create({
      conversationId,
      role: 'ASSISTANT',
      content: aiResponse.content,
      metadata: { model: 'claude-3-5-sonnet-20241022' },
    });

    return { userMessage, assistantMessage };
  }
}

export const chatService = new ChatService();
```

#### Repositories層（データアクセス）

**責務:**
- データベース操作
- Prismaクライアント使用

```typescript
// src/repositories/message.repository.ts

import { prisma } from '../lib/prisma';
import type { Role } from '@prisma/client';

export class MessageRepository {
  async create(data: { conversationId: string; role: Role; content: string; metadata?: any }) {
    return await prisma.message.create({
      data,
    });
  }

  async findByConversationId(conversationId: string) {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const messageRepository = new MessageRepository();
```

### 9.3 Prisma統合パターン

```typescript
// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// グレースフルシャットダウン
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

---

## 10. 開発環境セットアップ

### 10.1 前提条件

- **Node.js**: 20.x LTS以上
- **pnpm**: 8.x以上
- **Docker Desktop**: 最新版（推奨）
- **MongoDB Atlas アカウント**: または ローカルMongoDB
- **Anthropic APIキー**: https://console.anthropic.com から取得

### 10.2 セットアップ手順

```bash
# 1. リポジトリクローン
git clone https://github.com/your-org/ai-chat-claude.git
cd ai-chat-claude

# 2. 依存関係インストール（モノレポ全体）
pnpm install

# 3. 環境変数設定
cp .env.example .env

# .envファイルを編集:
# DATABASE_URL="mongodb+srv://..."
# CLAUDE_API_KEY="sk-ant-..."
# NODE_ENV="development"

# 4. Prismaセットアップ
cd api
pnpm prisma generate        # Prisma Clientコード生成
pnpm prisma db push         # MongoDBスキーマ同期

# 5. 開発サーバー起動
# ターミナル1: フロントエンド
cd frontend
pnpm dev

# ターミナル2: バックエンド
cd api
pnpm dev
```

### 10.3 環境変数一覧

```env
# .env.example

# ======================
# Database
# ======================
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"

# ======================
# AI API
# ======================
CLAUDE_API_KEY="sk-ant-api-key-here"

# ======================
# Application
# ======================
NODE_ENV="development"
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001"

# ======================
# Frontend (Next.js)
# ======================
NEXT_PUBLIC_APP_NAME="AI Chat Claude"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# ======================
# Optional
# ======================
LOG_LEVEL="debug"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

### 10.4 開発ツールセットアップ

#### VSCode推奨拡張機能

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### Git Hooks設定（Husky）

```bash
# Huskyインストール
pnpm add -D husky
pnpm exec husky install

# pre-commitフック追加
pnpm exec husky add .husky/pre-commit "pnpm lint-staged"
```

---

## 11. デプロイ手順

### 11.1 Google Cloud Runデプロイ

#### 前提条件

- Google Cloud Platformアカウント
- gcloud CLI インストール
- Cloud Run API有効化
- Artifact Registry有効化

#### デプロイ手順

```bash
# 1. Google Cloudプロジェクト設定
gcloud config set project <YOUR_PROJECT_ID>
gcloud auth login

# 2. Dockerイメージビルド & プッシュ

# フロントエンド
cd frontend
docker build -t gcr.io/<PROJECT_ID>/ai-chat-frontend:latest .
docker push gcr.io/<PROJECT_ID>/ai-chat-frontend:latest

# バックエンド
cd ../api
docker build -t gcr.io/<PROJECT_ID>/ai-chat-api:latest .
docker push gcr.io/<PROJECT_ID>/ai-chat-api:latest

# 3. Cloud Runデプロイ

# API
gcloud run deploy ai-chat-api \
  --image gcr.io/<PROJECT_ID>/ai-chat-api:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL \
  --set-secrets CLAUDE_API_KEY=claude-api-key:latest \
  --memory 512Mi \
  --cpu 1

# Frontend
gcloud run deploy ai-chat-frontend \
  --image gcr.io/<PROJECT_ID>/ai-chat-frontend:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=<API_SERVICE_URL> \
  --memory 512Mi \
  --cpu 1
```

### 11.2 Dockerfile例

#### Dockerfile.api (Hono Backend)

```dockerfile
FROM node:20-alpine AS base

# 依存関係インストール
FROM base AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# ビルド
FROM base AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# 本番環境
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN corepack enable pnpm

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 8080
CMD ["node", "dist/index.js"]
```

#### Dockerfile.frontend (Next.js)

```dockerfile
FROM node:20-alpine AS base

# 依存関係インストール
FROM base AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ビルド
FROM base AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# 本番環境
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 11.3 CI/CD（GitHub Actions）

```yaml
# .github/workflows/deploy.yml

name: Deploy to Cloud Run

on:
  push:
    branches: [main]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: asia-northeast1

jobs:
  deploy-api:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Google Cloud
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ env.PROJECT_ID }}

      - name: Configure Docker
        run: gcloud auth configure-docker

      - name: Build and Push API
        run: |
          docker build -t gcr.io/$PROJECT_ID/ai-chat-api:$GITHUB_SHA -f api/Dockerfile api/
          docker push gcr.io/$PROJECT_ID/ai-chat-api:$GITHUB_SHA

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ai-chat-api \
            --image gcr.io/$PROJECT_ID/ai-chat-api:$GITHUB_SHA \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-api

    steps:
      - uses: actions/checkout@v4

      - name: Setup Google Cloud
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ env.PROJECT_ID }}

      - name: Build and Push Frontend
        run: |
          docker build -t gcr.io/$PROJECT_ID/ai-chat-frontend:$GITHUB_SHA -f frontend/Dockerfile frontend/
          docker push gcr.io/$PROJECT_ID/ai-chat-frontend:$GITHUB_SHA

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ai-chat-frontend \
            --image gcr.io/$PROJECT_ID/ai-chat-frontend:$GITHUB_SHA \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated
```

### 11.4 MongoDB Atlasセットアップ

1. **クラスター作成**
   - https://cloud.mongodb.com にアクセス
   - 新規クラスター作成（M0 Free Tier可）
   - リージョン: Asia Pacific (Tokyo)推奨

2. **データベースユーザー設定**
   - Security > Database Access
   - ユーザー名・パスワード設定
   - 権限: Read and Write to any database

3. **ネットワークアクセス許可**
   - Security > Network Access
   - IP Whitelist: `0.0.0.0/0`（開発時）
   - 本番: Cloud Run IPレンジ設定

4. **接続文字列取得**
   - Clusters > Connect > Connect your application
   - 接続文字列をコピーし、`.env`の`DATABASE_URL`に設定

---

## 12. ディレクトリ構成

### 12.1 プロジェクト全体構成（モノレポ）

```
ai-chat-claude/
├── frontend/                      # Next.jsフロントエンド
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── api/                           # Hono API バックエンド
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── shared/                        # 共通型定義・ユーティリティ
│   ├── types/
│   │   ├── conversation.ts
│   │   └── message.ts
│   ├── utils/
│   └── package.json
│
├── docs/                          # ドキュメント
│   ├── CLAUDE.md                  # この仕様書
│   ├── API.md                     # API仕様書
│   ├── DEPLOYMENT.md              # デプロイガイド
│   └── CONTRIBUTING.md            # コントリビューションガイド
│
├── .github/
│   └── workflows/
│       ├── deploy.yml             # CI/CDパイプライン
│       ├── test.yml               # テスト自動化
│       └── lint.yml               # Lint自動化
│
├── .vscode/
│   ├── extensions.json            # 推奨拡張機能
│   └── settings.json              # エディタ設定
│
├── docker-compose.yml             # ローカル開発環境
├── .env.example                   # 環境変数テンプレート
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── README.md                      # プロジェクトREADME
├── package.json                   # ルートpackage.json
└── pnpm-workspace.yaml            # pnpmワークスペース設定
```

### 12.2 pnpm Workspaces設定

```yaml
# pnpm-workspace.yaml

packages:
  - 'frontend'
  - 'api'
  - 'shared'
```

```json
// package.json (root)

{
  "name": "ai-chat-claude",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 12.3 ファイル命名規則

| 種類 | 規則 | 例 |
|-----|------|---|
| **Reactコンポーネント** | PascalCase | `ChatContainer.tsx` |
| **ユーティリティ関数** | kebab-case | `api-client.ts` |
| **カスタムフック** | camelCase (use prefix) | `useChat.ts` |
| **定数ファイル** | kebab-case | `constants.ts` |
| **型定義ファイル** | kebab-case | `chat.ts` |
| **テストファイル** | 元ファイル名.test | `ChatContainer.test.tsx` |

---

## 13. テスト戦略

### 13.1 テスト方針

| テストレベル | ツール | カバレッジ目標 | 優先度 |
|------------|-------|--------------|--------|
| **ユニットテスト** | Jest + Testing Library | > 70% | Phase 2 |
| **統合テスト** | Supertest (API) | > 60% | Phase 2 |
| **E2Eテスト** | Playwright | 主要フロー100% | Phase 3 |

### 13.2 テスト実装例

```typescript
// frontend/src/components/chat/MessageItem.test.tsx

import { render, screen } from '@testing-library/react';
import MessageItem from './MessageItem';

describe('MessageItem', () => {
  it('ユーザーメッセージを正しく表示する', () => {
    render(
      <MessageItem
        message={{
          role: 'USER',
          content: 'こんにちは',
          createdAt: new Date()
        }}
      />
    );

    expect(screen.getByText('こんにちは')).toBeInTheDocument();
  });
});
```

---

## 14. エラーハンドリング戦略

### 14.1 エラー分類

| エラータイプ | HTTPステータス | ユーザーへの表示 |
|-----------|--------------|----------------|
| **バリデーションエラー** | 400 | "入力内容を確認してください" |
| **リソース未検出** | 404 | "会話が見つかりません" |
| **レート制限** | 429 | "しばらく待ってから再度お試しください" |
| **AI APIエラー** | 502 | "AIサービスに接続できません" |
| **内部サーバーエラー** | 500 | "予期しないエラーが発生しました" |

### 14.2 リトライロジック

```typescript
// api/src/utils/retry.ts

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 15. 監視・ログ

### 15.1 ロギング戦略

```typescript
// api/src/lib/logger.ts

import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});
```

### 15.2 監視項目

- **API応答時間**: Cloud Runメトリクス
- **エラー率**: ログベース監視
- **Claude APIレート制限**: カスタムログ
- **データベース接続**: Prismaメトリクス

---

## 16. セキュリティ考慮事項

### 16.1 セキュリティチェックリスト

- [x] API Key環境変数管理（Secret Manager）
- [x] HTTPS通信
- [x] CORS設定
- [x] 入力サニタイゼーション（Zod）
- [x] レート制限実装
- [ ] CSP (Content Security Policy) 設定
- [ ] セキュリティヘッダー（Helmet.js）

### 16.2 入力バリデーション

```typescript
// api/src/utils/validation.ts

import { z } from 'zod';

export const messageSchema = z.object({
  content: z.string()
    .min(1, '메시지を入力してください')
    .max(5000, 'メッセージが長すぎます'),
});
```

---

## 17. パフォーマンス最適化

### 17.1 最適化施策

| 領域 | 施策 | 期待効果 |
|-----|------|---------|
| **フロントエンド** | Next.js Image最適化 | 画像読み込み50%改善 |
| **バックエンド** | APIレスポンスキャッシング | レスポンス時間30%短縮 |
| **データベース** | インデックス最適化 | クエリ速度2倍向上 |
| **AI API** | ストリーミング実装（Phase 2） | 体感速度大幅改善 |

### 17.2 ストリーミング応答（Phase 2）

```typescript
// api/src/services/chat.service.ts (Phase 2)

export async function* streamChatResponse(messages: Message[]) {
  const stream = await mastraClient.agents.chatAgent.streamChat({ messages });

  for await (const chunk of stream) {
    yield chunk.content;
  }
}
```

---

## 18. 今後の拡張計画

### Phase 2: 拡張機能（3-6ヶ月後）

- [ ] ストリーミング応答実装
- [ ] ダークモード対応
- [ ] 会話タイトル自動生成
- [ ] マークダウンレンダリング
- [ ] コードハイライト

### Phase 3: プロダクション機能（6-12ヶ月後）

- [ ] ユーザー認証（メール/パスワード）
- [ ] ファイルアップロード（画像・PDF）
- [ ] 会話検索機能
- [ ] エクスポート機能（JSON/Markdown）
- [ ] カスタムエージェント作成

### Phase 4: エンタープライズ機能（12ヶ月後〜）

- [ ] チーム機能
- [ ] API利用制限管理
- [ ] 詳細なアナリティクス
- [ ] マルチモーダル対応（音声・画像生成）

---

## 19. 用語集

| 用語 | 説明 |
|-----|------|
| **Conversation** | 一連の会話のまとまり（セッション） |
| **Message** | 個別のメッセージ（ユーザー発言またはAI応答） |
| **Session ID** | ブラウザごとに生成される一意のID |
| **Mastra** | AIエージェントフレームワーク |
| **Prisma** | 型安全なNode.js ORM |
| **Hono** | 高速軽量なWebフレームワーク |

---

## 20. 参考資料

### 公式ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Mastra Framework](https://mastra.ai/docs)
- [Google Cloud Run](https://cloud.google.com/run/docs)

### 関連リポジトリ

- GitHub: (プロジェクトURL)
- Issue Tracker: (IssueトラッカーURL)

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|----------|------|---------|
| 1.0.0 | 2025-12-29 | 初版リリース |

---

**作成者**: AI Chat Claude Development Team
**最終更新**: 2025年12月29日
**ステータス**: Draft
