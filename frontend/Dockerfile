# Stage 1: Dependencies - Install dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Copy workspace files and package files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json
COPY shared/package.json ./shared/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile --filter=@ai-chat-claude/frontend...

# Stage 2: Builder - Build Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/frontend/node_modules /app/frontend/node_modules
COPY --from=deps /app/shared/node_modules /app/shared/node_modules
COPY frontend/package.json ./frontend/package.json
COPY shared/package.json ./shared/package.json

# Copy source code
COPY frontend ./frontend
COPY shared ./shared

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_VERSION

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION}

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build Next.js application (standalone output)
WORKDIR /app/frontend
RUN pnpm build

# Stage 3: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output (includes server.js at root level)
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./

# Copy .pnpm directory to resolve symlinks - must be at root level for symlinks to work
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm /node_modules/.pnpm

# Copy static files (must be at .next/static for Next.js to find them)
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set port and hostname
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application - server.js is at /app root
CMD ["node", "server.js"]
