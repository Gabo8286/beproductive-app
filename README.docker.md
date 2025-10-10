# BeProductive v2 - Docker Setup Guide

This guide will help you run BeProductive v2 locally using Docker for easy testing and development.

## Quick Start

### 1. Production Mode (Recommended for Testing)
Run the optimized production build with Nginx:

```bash
# Build and start the application
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at: http://localhost:8080

### 2. Development Mode (Hot Reload)
For development with hot reload:

```bash
# Start development environment
docker-compose --profile dev up dev --build
```

### 3. Full Local Setup (with Local Supabase)
For complete offline development with local Supabase:

```bash
# Start full stack including local Supabase
docker-compose -f docker-compose.full.yml up --build
```

This includes:
- **App**: http://localhost:8080
- **Supabase Studio**: http://localhost:3000
- **PostgREST API**: http://localhost:8000
- **Database**: localhost:5432
- **Adminer**: http://localhost:8081 (with profile `tools`)

## Configuration

### Environment Variables
Before running, copy and configure your environment:

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your Supabase credentials
nano .env
```

For Docker-specific configuration, the `docker.env` file is pre-configured with Docker-optimized settings.

### Supabase Setup
1. **Using Remote Supabase** (Default):
   - Update `docker.env` with your Supabase project credentials
   - Use `docker-compose.yml`

2. **Using Local Supabase** (Full Offline):
   - Use `docker-compose.full.yml`
   - Access Supabase Studio at http://localhost:3000
   - Database runs on localhost:5432

## Available Commands

```bash
# Production build
docker-compose up --build

# Development mode
docker-compose --profile dev up dev --build

# Full local stack
docker-compose -f docker-compose.full.yml up --build

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f app

# Execute commands in container
docker-compose exec app sh
```

## Service URLs

### Standard Setup
- **Application**: http://localhost:8080
- **Redis**: localhost:6379

### Full Local Setup
- **Application**: http://localhost:8080
- **Supabase Studio**: http://localhost:3000
- **PostgREST API**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Adminer**: http://localhost:8081 (with `--profile tools`)

## Troubleshooting

### Port Conflicts
If ports are already in use, update the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Change 8080 to another port
```

### Database Issues
For local Supabase setup:

```bash
# Reset database
docker-compose -f docker-compose.full.yml down -v
docker-compose -f docker-compose.full.yml up --build
```

### Build Issues
Clear Docker cache and rebuild:

```bash
# Remove containers and images
docker-compose down --rmi all

# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose up --build
```

### Environment Issues
Verify environment variables are loaded:

```bash
# Check environment in container
docker-compose exec app env | grep VITE_
```

## Development Workflow

### 1. Code Changes
For development mode, code changes are automatically reflected due to volume mounting.

### 2. Database Migrations
When using local Supabase:

```bash
# Apply migrations
docker-compose -f docker-compose.full.yml exec supabase-db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/your-migration.sql
```

### 3. Testing
```bash
# Run tests in container
docker-compose exec app npm test

# Run specific test suite
docker-compose exec app npm run test:e2e
```

## Production Deployment

### Building for Production
```bash
# Build optimized image
docker build -t beproductive-v2:latest .

# Run production container
docker run -p 8080:80 -d --name beproductive-v2 beproductive-v2:latest
```

### Environment Configuration
For production deployment, ensure:
1. Update environment variables in `docker.env` or use proper secrets management
2. Use external database (not Docker Postgres)
3. Configure proper security headers
4. Set up SSL/TLS termination
5. Configure monitoring and logging

## Security Notes

- The Nginx configuration includes security headers
- JWT secrets should be changed for production
- Database passwords should be secure
- Use Docker secrets for sensitive data in production

## Performance

The Docker setup includes:
- Multi-stage builds for smaller images
- Nginx with gzip compression
- Redis caching
- Health checks for all services
- Optimized static asset serving

## Support

For issues with Docker setup:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Ensure ports are available
4. Check Docker and Docker Compose versions

Minimum requirements:
- Docker 20.10+
- Docker Compose 2.0+