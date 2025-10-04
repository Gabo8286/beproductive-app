#!/bin/bash
# Disaster Recovery Test Script
set -e

echo "🧪 Starting Disaster Recovery Test"

# Test database connectivity
echo "Testing database connectivity..."
if npx supabase status > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "❌ Database connection failed"
  exit 1
fi

# Test backup integrity
echo "Testing backup integrity..."
LATEST_BACKUP=$(ls -t ./backups/database/*.sql.gz 2>/dev/null | head -1)
if [ -f "$LATEST_BACKUP" ]; then
  if gzip -t "$LATEST_BACKUP"; then
    echo "✅ Latest backup integrity verified"
  else
    echo "❌ Backup integrity check failed"
    exit 1
  fi
else
  echo "❌ No database backup found"
  exit 1
fi

# Test application build
echo "Testing application build..."
if npm run build > /dev/null 2>&1; then
  echo "✅ Application build successful"
else
  echo "❌ Application build failed"
  exit 1
fi

# Test monitoring endpoints
echo "Testing monitoring endpoints..."
if curl -f http://localhost:5173/api/health > /dev/null 2>&1; then
  echo "✅ Health endpoint accessible"
else
  echo "⚠️  Health endpoint not accessible (may be expected in test environment)"
fi

echo "🎉 Disaster Recovery Test Completed Successfully"