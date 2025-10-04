#!/bin/bash
# Automated Database Backup Script
set -e

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/database"
BACKUP_FILE="$BACKUP_DIR/$DATE-database-backup.sql"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]\033[0m $1"
}

error() {
  echo -e "${RED}[ERROR]\033[0m $1" >&2
}

warn() {
  echo -e "${YELLOW}[WARNING]\033[0m $1"
}

# Check required environment variables
check_env() {
  local required_vars=("SUPABASE_PROJECT_REF" "SUPABASE_ACCESS_TOKEN")

  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      error "Required environment variable $var is not set"
      exit 1
    fi
  done
}

# Create backup directory
setup_backup_dir() {
  if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    log "Created backup directory: $BACKUP_DIR"
  fi
}

# Perform database backup
backup_database() {
  log "Starting database backup..."

  # Create the backup
  if npx supabase db dump --project-ref $SUPABASE_PROJECT_REF > "$BACKUP_FILE"; then
    log "Database backup created: $BACKUP_FILE"
  else
    error "Failed to create database backup"
    exit 1
  fi

  # Compress the backup
  if gzip "$BACKUP_FILE"; then
    log "Backup compressed: $BACKUP_FILE.gz"
    BACKUP_FILE="$BACKUP_FILE.gz"
  else
    warn "Failed to compress backup, continuing with uncompressed file"
  fi

  # Verify backup integrity
  if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    log "Backup integrity verified"
  else
    error "Backup integrity check failed"
    exit 1
  fi
}

# Upload to cloud storage
upload_backup() {
  if [ ! -z "$AWS_S3_BUCKET" ]; then
    log "Uploading backup to S3..."
    if aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BUCKET/backups/database/"; then
      log "Backup uploaded to S3 successfully"
    else
      warn "Failed to upload backup to S3"
    fi
  fi
}

# Clean up old backups
cleanup_old_backups() {
  log "Cleaning up backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
  log "Cleanup completed"
}

# Main execution
main() {
  log "Starting automated database backup"

  check_env
  setup_backup_dir
  backup_database
  upload_backup
  cleanup_old_backups

  log "Database backup completed successfully"

  # Send notification (optional)
  if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
      --data "{\"text\":\"✅ Database backup completed successfully: $BACKUP_FILE\"}" \
      "$SLACK_WEBHOOK_URL"
  fi
}

# Execute main function
main "$@"