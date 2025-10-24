#!/bin/bash

# IONOS SFTP Deployment Script - Fixed Version
# Usage: ./deploy-ionos-fixed.sh [directory]
# Example: ./deploy-ionos-fixed.sh htdocs

echo "🚀 IONOS Deployment Script - Fixed Version"
echo "=========================================="

# SFTP Configuration
SFTP_HOST="access-5018822626.webspace-host.com"
SFTP_USER="a258905"
SFTP_PORT="22"
LOCAL_DIR="dist"

# Target directory (can be passed as argument or will be prompted)
# Note: IONOS uses root directory (/) for web files
TARGET_DIR=${1:-""}

# Check if dist directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ Error: dist directory not found. Run 'npm run build' first."
    exit 1
fi

# If no target directory specified, show options
if [ -z "$TARGET_DIR" ]; then
    echo ""
    echo "📂 IONOS web directory options:"
    echo "  1) / (root) - RECOMMENDED for IONOS"
    echo "  2) htdocs (legacy)"
    echo "  3) www (legacy)"
    echo "  4) public_html (legacy)"
    echo ""
    read -p "Enter the target directory (or press Enter for root '/'): " TARGET_DIR
    TARGET_DIR=${TARGET_DIR:-""}
fi

echo ""
echo "📦 Deployment Configuration:"
echo "  Source: ./$LOCAL_DIR/*"
echo "  Target: /$TARGET_DIR/"
echo "  Server: $SFTP_HOST"
echo ""

read -p "Is this correct? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🔗 Connecting to IONOS server..."
echo "⚠️  You will be prompted for your password:"

# Create SFTP batch file
cat > /tmp/sftp_deploy.txt << EOF
# Navigate to target directory
cd /$TARGET_DIR 2>/dev/null || mkdir /$TARGET_DIR
cd /$TARGET_DIR

# Show current directory
pwd

# Clean up any Lovable placeholder files
rm -f index.html 2>/dev/null
rm -f project-not-found.html 2>/dev/null
rm -rf lovable* 2>/dev/null

# Upload all files from dist
put -r $LOCAL_DIR/* .

# Verify upload
ls -la

# Check for critical files
ls -la .htaccess
ls -la index.html

bye
EOF

# Execute SFTP deployment
sftp -P $SFTP_PORT -b /tmp/sftp_deploy.txt $SFTP_USER@$SFTP_HOST

# Clean up
rm /tmp/sftp_deploy.txt

echo ""
echo "✅ Deployment attempt complete!"
echo ""
echo "🔍 Please verify your site at:"
echo "   https://be-productive.app"
echo ""
echo "⚠️  If the site still shows the placeholder:"
echo "1. Run: ./explore-ionos-structure.sh to find the correct directory"
echo "2. Re-run this script with the correct directory:"
echo "   ./deploy-ionos-fixed.sh [correct-directory]"
echo ""
echo "📝 Common issues:"
echo "- Wrong directory: Try 'htdocs', 'www', or 'public_html'"
echo "- Files in subdirectory: Check if files need to be in root of target dir"
echo "- Permissions: Ensure uploaded files have correct permissions"