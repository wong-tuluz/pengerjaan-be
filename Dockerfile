FROM node:20-slim AS base

# Install dependencies needed for build
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

# Install production dependencies
FROM base AS production-deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install --omit=dev

# Build the application
FROM base AS builder 
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Run the application
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bootstrap.sh ./bootstrap.sh
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy production node_modules
COPY --from=production-deps /app/node_modules ./node_modules

RUN chmod +x bootstrap.sh

EXPOSE 3000

CMD ["./bootstrap.sh"]