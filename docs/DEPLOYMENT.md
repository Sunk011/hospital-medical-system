# Hospital Medical System - Production Deployment Guide

## Prerequisites

- Docker Engine 24.x+
- Docker Compose V2
- Minimum 2GB RAM
- 10GB disk space

## Environment Configuration

### 1. Create Environment Files

Create `.env` files for each service:

**Backend (.env):**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://root:YOUR_SECURE_PASSWORD@mysql:3306/hospital_db
JWT_SECRET=your-super-secure-random-string-at-least-32-chars
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=your-super-secure-refresh-token-string
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**MySQL:** Configuration is handled in docker-compose.yml

### 2. Generate Prisma Client

Before building, ensure the Prisma client is generated:

```bash
cd backend
npx prisma generate
```

### 3. Database Initialization

The first run will:
1. Create MySQL data volume
2. Initialize hospital_db database
3. Run test_data.sql for sample data

For production, replace test_data.sql with your actual data.

## Deployment Steps

### 1. Pull Latest Images

```bash
docker compose pull
```

### 2. Build and Start Services

```bash
docker compose up -d --build
```

### 3. Verify Services

```bash
# Check container status
docker compose ps

# Check backend health
curl http://localhost:3000/api/v1/health

# Check frontend
curl http://localhost
```

### 4. View Logs

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
```

## Scaling

### Horizontal Scaling (Multiple Instances)

```bash
# Scale backend to 3 instances
docker compose up -d --scale backend=3

# Note: Requires external Redis for session storage when scaling
```

### Load Balancer Configuration

Nginx configuration for load balancing:

```nginx
upstream backend {
    server backend-1:3000;
    server backend-2:3000;
    server backend-3:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://backend;
        # ... additional proxy settings
    }
}
```

## Monitoring

### Health Checks

The services include health check endpoints:
- Backend: `http://localhost:3000/api/v1/health`
- MySQL: Check via `docker exec -it hospital-medical-system-mysql-1 mysqladmin ping`

### Logging

```bash
# View all logs
docker compose logs

# View recent logs
docker compose logs --tail 100

# Follow specific service
docker compose logs -f backend
```

### Metrics (Optional)

Add Prometheus metrics endpoint for monitoring:

```bash
# Run with monitoring profile
docker compose --profile monitoring up -d
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker exec hospital-medical-system-mysql-1 mysqldump -u root -p hospital_db > backup.sql

# Restore from backup
docker exec -i hospital-medical-system-mysql-1 mysql -u root -p hospital_db < backup.sql
```

### Automated Backups

Add cron job for daily backups:

```bash
# Add to crontab
0 2 * * * docker exec hospital-medical-system-mysql-1 mysqldump -u root -pYOUR_PASSWORD hospital_db | gzip > /backup/hospital_db_$(date +\%Y\%m\%d).sql.gz
```

## Security Checklist

- [ ] Change default MySQL root password
- [ ] Generate strong JWT secrets (32+ random characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up regular database backups
- [ ] Enable audit logging
- [ ] Configure rate limiting appropriately
- [ ] Review and restrict CORS origins
- [ ] Set up intrusion detection
- [ ] Configure log retention policies

## Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker compose logs backend

# Check if ports are in use
netstat -tlnp | grep 3000
```

### Database Connection Failed

```bash
# Check MySQL is running
docker exec -it hospital-medical-system-mysql-1 mysql -u root -p

# Check network connectivity
docker network inspect hospital-medical-system_hospital-network
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check MySQL slow queries
docker exec hospital-medical-system-mysql-1 mysql -u root -p -e "SHOW VARIABLES LIKE 'slow_query_log';"
```

## Rollback

```bash
# Rollback to previous version
docker compose down
docker compose up -d
```

## Update

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose up -d --build
```
