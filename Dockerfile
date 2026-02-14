# ──────────────────────────────────────────────────────────────
# Stage 1: BUILD — Install everything, compile TypeScript → JS
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (Docker layer caching: only re-installs if package.json changes)
COPY package*.json ./

# Install ALL dependencies (including devDeps like `typescript`)
# We need typescript to compile — it's a devDependency
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Compile TypeScript → JavaScript into dist/
RUN npm run build


# ──────────────────────────────────────────────────────────────
# Stage 2: PRODUCTION — Lean image with only compiled JS
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Set production mode — libraries optimize for performance
ENV NODE_ENV=production

# Create non-root user (security best practice)
RUN addgroup -S nodejs && \
    adduser -S nodeuser -G nodejs

# Copy only package files and install PRODUCTION dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy compiled JavaScript from the build stage
# (no .ts files, no typescript compiler, no dev tools)
COPY --from=builder /app/dist ./dist

# Set permissions
RUN chown -R nodeuser:nodejs /app

# Run as non-root
USER nodeuser

# Expose port
EXPOSE 3000

# Start the compiled JavaScript
CMD ["node", "dist/server.js"]
