.PHONY: help dev up down api frontend logs mongo-ui clean install prisma-generate prisma-push setup

# デフォルトターゲット
.DEFAULT_GOAL := help

# カラー定義
GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
RESET  := \033[0m

help: ## ヘルプを表示
	@echo "$(GREEN)AI Chat Claude - 開発用コマンド$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'

dev: up ## すべてのサービスを起動（MongoDB + API + Frontend）
	@echo "$(GREEN)Starting all services...$(RESET)"
	@echo "$(BLUE)Waiting for MongoDB to be ready...$(RESET)"
	@sleep 3
	@echo "$(GREEN)Starting API and Frontend...$(RESET)"
	pnpm --parallel -r dev

up: ## MongoDBコンテナを起動
	@echo "$(GREEN)Starting MongoDB container...$(RESET)"
	docker-compose up -d mongodb
	@echo "$(GREEN)MongoDB started at mongodb://localhost:27017$(RESET)"

down: ## すべてのコンテナを停止
	@echo "$(YELLOW)Stopping containers...$(RESET)"
	docker-compose down

api: ## APIサーバーのみ起動
	@echo "$(GREEN)Starting API server...$(RESET)"
	cd api && pnpm dev

frontend: ## フロントエンドのみ起動
	@echo "$(GREEN)Starting frontend...$(RESET)"
	cd frontend && pnpm dev

logs: ## MongoDBコンテナのログを表示
	@echo "$(BLUE)Showing MongoDB logs (Ctrl+C to exit)...$(RESET)"
	docker-compose logs -f mongodb

mongo-ui: ## Mongo Express UI を起動
	@echo "$(GREEN)Starting Mongo Express...$(RESET)"
	docker-compose up -d mongo-express
	@echo "$(GREEN)Mongo Express started at http://localhost:8081$(RESET)"
	@echo "$(YELLOW)Login: admin / admin$(RESET)"

clean: down ## 環境をクリーンアップ（コンテナ・ボリューム削除）
	@echo "$(YELLOW)Cleaning up containers and volumes...$(RESET)"
	docker-compose down -v
	@echo "$(YELLOW)Removing node_modules...$(RESET)"
	rm -rf api/node_modules frontend/node_modules shared/node_modules node_modules
	@echo "$(GREEN)Cleanup complete!$(RESET)"

install: ## 依存関係をインストール
	@echo "$(GREEN)Installing dependencies...$(RESET)"
	pnpm install
	@echo "$(GREEN)Dependencies installed!$(RESET)"

prisma-generate: ## Prisma Clientを生成
	@echo "$(GREEN)Generating Prisma Client...$(RESET)"
	cd api && pnpm prisma:generate
	@echo "$(GREEN)Prisma Client generated!$(RESET)"

prisma-push: ## MongoDBスキーマを同期
	@echo "$(GREEN)Pushing Prisma schema to MongoDB...$(RESET)"
	cd api && pnpm prisma:push
	@echo "$(GREEN)Schema pushed!$(RESET)"

prisma-studio: ## Prisma Studioを起動
	@echo "$(GREEN)Starting Prisma Studio...$(RESET)"
	cd api && pnpm prisma:studio

setup: install up ## 初回セットアップ
	@echo "$(BLUE)Waiting for MongoDB to be ready...$(RESET)"
	@sleep 5
	@$(MAKE) prisma-generate
	@$(MAKE) prisma-push
	@echo ""
	@echo "$(GREEN)========================================$(RESET)"
	@echo "$(GREEN)Setup complete!$(RESET)"
	@echo "$(GREEN)========================================$(RESET)"
	@echo ""
	@echo "Run '$(YELLOW)make dev$(RESET)' to start development"
	@echo "Run '$(YELLOW)make mongo-ui$(RESET)' to open MongoDB admin UI"
	@echo "Run '$(YELLOW)make help$(RESET)' to see all available commands"
	@echo ""

restart: down dev ## コンテナを再起動してすべてのサービスを起動

status: ## コンテナの状態を確認
	@echo "$(BLUE)Container status:$(RESET)"
	@docker-compose ps
