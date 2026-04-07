# RentConnect - Complete Docker & CI/CD Deployment Guide

## 🐳 Docker Containerization

### 1. Backend Dockerfile
**File:** `Dockerfile.backend`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
```

### 2. Frontend Dockerfile
**File:** `Dockerfile.frontend`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm ci --legacy-peer-deps

COPY . .

# Build with environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Nginx Configuration
**File:** `nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://backend:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable caching for HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### 4. Docker Compose (Development)
**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: rentconnect-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: rentconnect
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: rentconnect-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: rentconnect-backend
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: development
      PORT: 4000
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/rentconnect?schema=public
      REDIS_URL: redis://redis:6379
      JWT_ACCESS_SECRET: development-access-secret
      JWT_REFRESH_SECRET: development-refresh-secret
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      RESEND_API_KEY: ${RESEND_API_KEY}
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./src:/app/src
      - ./prisma:/app/prisma
    command: sh -c "npx prisma migrate dev && npm run dev:server"

  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        VITE_API_URL: http://localhost:4000
    container_name: rentconnect-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: rentconnect-network
```

### 5. Docker Compose (Production)
**File:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database (Production)
  postgres:
    image: postgres:15-alpine
    container_name: rentconnect-db-prod
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: rentconnect
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache (Production)
  redis:
    image: redis:7-alpine
    container_name: rentconnect-redis-prod
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_prod_data:/data
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API (Production)
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: rentconnect-backend-prod
    restart: always
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/rentconnect?schema=public
      REDIS_URL: redis://redis:6379
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      RESEND_API_KEY: ${RESEND_API_KEY}
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
      VAPID_PUBLIC_KEY: ${VAPID_PUBLIC_KEY}
      VAPID_PRIVATE_KEY: ${VAPID_PRIVATE_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  # Frontend (Production)
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        VITE_API_URL: /api
    container_name: rentconnect-frontend-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 256M

  # Nginx Reverse Proxy (Optional if using separate proxy)
  nginx-proxy:
    image: nginx:alpine
    container_name: rentconnect-proxy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  default:
    name: rentconnect-prod-network
    driver: bridge
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
**File:** `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME_BACKEND: ${{ github.repository }}/backend
  IMAGE_NAME_FRONTEND: ${{ github.repository }}/frontend

jobs:
  # Test Job
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
          REDIS_URL: redis://localhost:6379
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
          fail_ci_if_error: false

  # Build Job
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
    
    outputs:
      backend_tag: ${{ steps.meta_backend.outputs.tags }}
      frontend_tag: ${{ steps.meta_frontend.outputs.tags }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata (backend)
        id: meta_backend
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest
      
      - name: Extract metadata (frontend)
        id: meta_frontend
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_FRONTEND }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest
      
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.backend
          push: true
          tags: ${{ steps.meta_backend.outputs.tags }}
          labels: ${{ steps.meta_backend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.frontend
          push: true
          tags: ${{ steps.meta_frontend.outputs.tags }}
          labels: ${{ steps.meta_frontend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VITE_API_URL=https://api.rentconnect.app

  # Deploy Job
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_SERVER_HOST }}
          username: ${{ secrets.PROD_SERVER_USER }}
          key: ${{ secrets.PROD_SERVER_SSH_KEY }}
          script: |
            cd /opt/rentconnect
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker system prune -af

  # Notify Job
  notify:
    needs: [test, build, deploy]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          text: |
            Deployment Status: ${{ job.status }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
```

---

## 📊 Monitoring & Observability

### Docker Monitoring Stack
**File:** `docker-compose.monitoring.yml`

```yaml
version: '3.8'

services:
  # Prometheus - Metrics Collection
  prometheus:
    image: prom/prometheus:latest
    container_name: rentconnect-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'

  # Grafana - Visualization
  grafana:
    image: grafana/grafana:latest
    container_name: rentconnect-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
      GF_USERS_ALLOW_SIGN_UP: false
    depends_on:
      - prometheus

  # Loki - Log Aggregation
  loki:
    image: grafana/loki:latest
    container_name: rentconnect-loki
    restart: unless-stopped
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki.yml:/etc/loki/local-config.yaml
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml

  # Promtail - Log Shipper
  promtail:
    image: grafana/promtail:latest
    container_name: rentconnect-promtail
    restart: unless-stopped
    volumes:
      - /var/log:/var/log
      - ./monitoring/promtail.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml

  # Node Exporter - System Metrics
  node-exporter:
    image: prom/node-exporter:latest
    container_name: rentconnect-node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

volumes:
  prometheus_data:
  grafana_data:
  loki_data:

networks:
  default:
    name: rentconnect-monitoring
```

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Backup strategy in place

### Deployment Day
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all services healthy

### Post-Deployment
- [ ] Monitor for 24 hours
- [ ] Review user feedback
- [ ] Check error logs
- [ ] Performance optimization
- [ ] Update documentation

---

This complete Docker & CI/CD setup ensures your platform is production-ready with automated testing, building, and deployment!
