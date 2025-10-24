#!/bin/bash

# IONOS Directory Explorer Script
# This script helps identify the correct deployment directory

echo "🔍 IONOS Directory Structure Explorer"
echo "====================================="

# SFTP Configuration
SFTP_HOST="access-5018822626.webspace-host.com"
SFTP_USER="a258905"
SFTP_PORT="22"

echo "🔗 Connecting to $SFTP_HOST..."
echo "⚠️  You will be prompted for your password:"

# Create batch file with exploration commands
cat > /tmp/sftp_explore.txt << 'EOF'
pwd
ls -la /
cd /
ls -la
ls -la htdocs 2>/dev/null || echo "htdocs not found"
ls -la www 2>/dev/null || echo "www not found"
ls -la public_html 2>/dev/null || echo "public_html not found"
ls -la web 2>/dev/null || echo "web not found"
ls -la public 2>/dev/null || echo "public not found"
find . -name "*.html" -type f 2>/dev/null | head -5 || echo "Searching for HTML files..."
find . -name "lovable*" -type f 2>/dev/null || echo "No lovable files found"
bye
EOF

# Execute SFTP exploration
sftp -P $SFTP_PORT -b /tmp/sftp_explore.txt $SFTP_USER@$SFTP_HOST

# Clean up
rm /tmp/sftp_explore.txt

echo ""
echo "📝 Analysis Complete!"
echo ""
echo "🎯 What to look for:"
echo "1. A directory containing the Lovable placeholder files"
echo "2. Common web root directories: htdocs, www, public_html, web"
echo "3. Any .html files that might be the placeholder"
echo ""
echo "Once you identify the correct directory, we'll update the deployment script."