# Stage 1: Dependencies - Install dependencies
FROM node:20-alpine AS deps

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Copy workspace files and package files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/package.json
COPY shared/package.json ./shared/package.json

# Install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile --filter=@ai-chat-claude/api...

# Stage 2: Prisma Client Generation
FROM node:20-alpine AS prisma

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/api/node_modules /app/api/node_modules
COPY api/package.json /app/api/package.json
COPY api/prisma /app/api/prisma

# Generate Prisma Client
WORKDIR /app/api
RUN pnpm prisma:generate

# Stage 3: TypeScript Build
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Copy dependencies - use node_modules from prisma stage which includes generated Prisma Client
COPY --from=prisma /app/node_modules /app/node_modules
COPY --from=prisma /app/api/node_modules /app/api/node_modules
COPY api/package.json api/tsconfig.json /app/api/
COPY api/src /app/api/src

# Build TypeScript
WORKDIR /app/api
RUN pnpm build

# Stage 4: Production Runner
FROM node:20-alpine AS runner

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Set environment to production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiuser

# Copy workspace files for production install
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/package.json
COPY shared/package.json ./shared/package.json

# Install all dependencies (including dev) to get prisma CLI
RUN pnpm install --frozen-lockfile --filter=@ai-chat-claude/api...

# Copy Prisma schema
COPY --from=prisma /app/api/prisma /app/api/prisma

# Generate Prisma Client
WORKDIR /app/api
RUN pnpm prisma:generate

# Copy built application from builder
WORKDIR /app
COPY --from=builder /app/api/dist /app/api/dist

# Change ownership to non-root user
RUN chown -R apiuser:nodejs /app

# Switch to non-root user
USER apiuser

WORKDIR /app/api

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
