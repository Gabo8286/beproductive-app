#!/bin/bash
# Application Assets and Configuration Backup Script
set -e

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/application"
BACKUP_FILE="$BACKUP_DIR/$DATE-application-backup.tar.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Creating application backup..."

# Create tar archive of important files
tar -czf "$BACKUP_FILE" \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude=backups \
  --exclude=test-results \
  --exclude=coverage \
  ./src \
  ./public \
  ./supabase \
  ./scripts \
  .env.example \
  .env.production \
  .env.staging \
  package.json \
  package-lock.json \
  vite.config.ts \
  quality-gates.config.js \
  cdn-config.json \
  monitoring-alerts.json \
  backup-config.json \
  disaster-recovery-plan.json

echo "Application backup created: $BACKUP_FILE"

# Upload to cloud storage if configured
if [ ! -z "$AWS_S3_BUCKET" ]; then
  echo "Uploading to S3..."
  aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BUCKET/backups/application/"
  echo "Backup uploaded to S3"
fi

echo "Application backup completed"