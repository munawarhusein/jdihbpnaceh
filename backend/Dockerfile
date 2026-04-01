# ============================================
# JDIH BPN Aceh Backend — Dockerfile
# Multi-stage build untuk production
# ============================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install sistem dependencies untuk OCR dan PDF
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-ind \
    poppler-utils \
    ghostscript \
    imagemagick \
    python3 \
    make \
    g++ \
    openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm ci && \
    npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# ============================================
# Stage 2: Production Runner
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime dependencies untuk OCR
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-ind \
    poppler-utils \
    ghostscript \
    imagemagick \
    dumb-init \
    openssl

# Copy built files dari builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Buat user non-root untuk keamanan
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

# Gunakan dumb-init untuk proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
