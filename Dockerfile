# BeProductive v2 - Multi-stage Docker Build
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Build argument for environment file
ARG ENV_FILE=.env.docker

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy environment files and ensure we use the specified ENV_FILE
COPY ${ENV_FILE} .env.build
RUN cp .env.build .env
COPY .env.example .env.example

# Copy source code
COPY . .

# Debug environment variables
RUN echo "=== Environment Check ===" && \
    echo "NODE_ENV: $NODE_ENV" && \
    echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL" && \
    cat .env && \
    echo "========================="

# Verify environment variables for build
RUN echo "=== Build Environment Variables ===" && \
    echo "VITE_LOCAL_MODE will be: false" && \
    echo "VITE_SUPABASE_URL will be: https://rymixmuunfjxwryucvxt.supabase.co" && \
    echo "========================================="

# Build the application with explicit environment variables
RUN VITE_LOCAL_MODE=false \
    VITE_SUPABASE_URL=https://rymixmuunfjxwryucvxt.supabase.co \
    VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bWl4bXV1bmZqeHdyeXVjdnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzA4NjUsImV4cCI6MjA3NDg0Njg2NX0.TENbnWnRA8Ik5aKmgit4d8-CYjlD1uNNNZwzEPclPlU \
    VITE_SUPABASE_PROJECT_ID=rymixmuunfjxwryucvxt \
    npm run build

# Verify build output and modular architecture
RUN echo "=== Build Output Verification ===" && \
    ls -la /app/dist/ && \
    echo "=== Checking for Module Files ===" && \
    find /app/dist -name "*Module*" -o -name "*module*" | head -10 && \
    echo "=== Checking for AI Assistant chunks ===" && \
    find /app/dist -name "*AI*" -o -name "*ai*" | head -5 && \
    echo "=== Checking for Productivity Cycle chunks ===" && \
    find /app/dist -name "*Cycle*" -o -name "*cycle*" | head -5 && \
    echo "=== Checking for Communication chunks ===" && \
    find /app/dist -name "*communication*" -o -name "*Communication*" | head -5 && \
    echo "=== Main bundle sizes ===" && \
    find /app/dist -name "*.js" -exec sh -c 'echo "File: $1, Size: $(wc -c < $1) bytes"' _ {} \; | sort -k4 -nr | head -10 && \
    echo "=== Module Test Page Check ===" && \
    find /app/dist -name "*ModuleTest*" && \
    echo "Build verification complete"

# Stage 2: Production server with Nginx
FROM nginx:alpine AS production

# Install Node.js and curl for runtime needs and health checks
RUN apk add --no-cache nodejs npm curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set proper permissions
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

# Create nginx PID directory
RUN mkdir -p /var/run/nginx && \
    chown -R nextjs:nodejs /var/run/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Create health check endpoint
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>OK</h1></body></html>' > /usr/share/nginx/html/health

# Switch to non-root user
USER nextjs

# Start nginx
CMD ["nginx", "-g", "daemon off;"]