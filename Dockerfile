# Multi-stage Dockerfile for Node.js application

# Development stage
FROM node:20-alpine AS development

# Set working directory
WORKDIR /app

# Install system dependencies including curl for health checks
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads/images uploads/docs uploads/medias logs \
    && chown -R node:node uploads logs

# Switch to non-root user
USER node

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start development server
CMD ["npm", "run", "dev"]

# Production build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Production stage
FROM node:20-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Install system dependencies including curl for health checks
RUN apk add --no-cache curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Create necessary directories with proper permissions
RUN mkdir -p logs uploads/images uploads/docs uploads/medias \
    && chown -R nodejs:nodejs /app

# Copy any static files or configs needed
COPY --chown=nodejs:nodejs uploads ./uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start production server
CMD ["node", "dist/server.js"]