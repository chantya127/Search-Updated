# LTS Node.js only
FROM node:20-alpine

# App directory
WORKDIR /app

# Create non-root user
RUN addgroup -S nodejs && \
    adduser -S nodeuser -G nodejs

# Copy dependency files first (for caching)
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Set permissions
RUN chown -R nodeuser:nodejs /app

# Run as non-root
USER nodeuser

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "src/server.js"]
