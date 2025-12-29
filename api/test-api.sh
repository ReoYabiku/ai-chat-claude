#!/bin/bash

# AI Chat Claude API テストスクリプト
# 使用方法: ./test-api.sh

set -e

API_URL="${API_URL:-http://localhost:3001}"
echo "🧪 Testing AI Chat Claude API at $API_URL"
echo ""

# カラー出力
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ステップ1: ヘルスチェック
echo -e "${BLUE}📡 Step 1: Health Check${NC}"
echo "GET $API_URL/api/health"
HEALTH_RESPONSE=$(curl -s "$API_URL/api/health")
echo "$HEALTH_RESPONSE" | jq .
echo ""

# ステップ2: 会話作成
echo -e "${BLUE}💬 Step 2: Create Conversation${NC}"
echo "POST $API_URL/api/conversations"
CONVERSATION_RESPONSE=$(curl -s -X POST "$API_URL/api/conversations" \
  -H "Content-Type: application/json" \
  -d '{}')
echo "$CONVERSATION_RESPONSE" | jq .

# conversation IDを抽出
CONVERSATION_ID=$(echo "$CONVERSATION_RESPONSE" | jq -r '.id')
SESSION_ID=$(echo "$CONVERSATION_RESPONSE" | jq -r '.sessionId')
echo ""
echo -e "${GREEN}✅ Conversation created: $CONVERSATION_ID${NC}"
echo ""

# ステップ3: メッセージ送信
echo -e "${BLUE}✉️  Step 3: Send Message${NC}"
echo "POST $API_URL/api/conversations/$CONVERSATION_ID/messages"
MESSAGE_RESPONSE=$(curl -s -X POST "$API_URL/api/conversations/$CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "こんにちは！簡単な自己紹介をお願いします。"
  }')
echo "$MESSAGE_RESPONSE" | jq .
echo ""
echo -e "${GREEN}✅ AI Response received${NC}"
echo ""

# ステップ4: 会話履歴取得
echo -e "${BLUE}📜 Step 4: Get Conversation History${NC}"
echo "GET $API_URL/api/conversations/$CONVERSATION_ID"
HISTORY_RESPONSE=$(curl -s "$API_URL/api/conversations/$CONVERSATION_ID")
echo "$HISTORY_RESPONSE" | jq .
echo ""

# タイトルが自動生成されているか確認
TITLE=$(echo "$HISTORY_RESPONSE" | jq -r '.conversation.title')
if [ "$TITLE" != "null" ]; then
  echo -e "${GREEN}✅ Auto-generated title: \"$TITLE\"${NC}"
else
  echo -e "${RED}⚠️  Title not generated yet${NC}"
fi
echo ""

# ステップ5: セッション会話一覧取得
echo -e "${BLUE}📋 Step 5: Get Session Conversations${NC}"
echo "GET $API_URL/api/sessions/$SESSION_ID/conversations"
SESSION_RESPONSE=$(curl -s "$API_URL/api/sessions/$SESSION_ID/conversations")
echo "$SESSION_RESPONSE" | jq .
echo ""

# テスト完了
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "Conversation ID: $CONVERSATION_ID"
echo "Session ID: $SESSION_ID"
