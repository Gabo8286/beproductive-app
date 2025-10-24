#!/bin/bash

# IONOS SFTP Deployment Script for BeProductive
# Usage: ./deploy-to-ionos.sh

echo "🚀 Starting deployment to IONOS..."

# SFTP Configuration
SFTP_HOST="access-5018822626.webspace-host.com"
SFTP_USER="a258905"
SFTP_PORT="22"
LOCAL_DIR="dist"

# Check if dist directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ Error: dist directory not found. Run 'npm run build' first."
    exit 1
fi

echo "📦 Preparing to upload files from $LOCAL_DIR..."
echo "🔗 Connecting to $SFTP_HOST as $SFTP_USER..."

# Create batch file for SFTP commands
cat > /tmp/sftp_batch.txt << EOF
cd /
put -r $LOCAL_DIR/* .
ls -la
exit
EOF

echo "📤 Uploading files (this may take several minutes)..."
echo "⚠️  You will be prompted for your password:"

# Execute SFTP with batch file
sftp -P $SFTP_PORT -b /tmp/sftp_batch.txt $SFTP_USER@$SFTP_HOST

# Clean up
rm /tmp/sftp_batch.txt

echo "✅ Deployment complete!"
echo ""
echo "🔍 Please verify your site at:"
echo "   http://be-productive.app"
echo "   https://be-productive.app (after SSL is enabled)"
echo ""
echo "📝 Next steps:"
echo "1. Enable SSL certificate in IONOS control panel"
echo "2. Test all application features"
echo "3. Configure GitHub Actions for automated deployments"