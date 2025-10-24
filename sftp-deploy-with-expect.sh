#!/bin/bash

# IONOS SFTP Deployment with Expect - Secure Password Handling
echo "🚀 IONOS SFTP Deployment with Expect"
echo "====================================="

# SFTP Configuration
SFTP_HOST="access-5018822626.webspace-host.com"
SFTP_USER="a258905"
SFTP_PORT="22"
LOCAL_DIR="dist"
# Note: IONOS uses root directory (/) for web files, not htdocs
TARGET_DIR=${1:-""}

# Check if dist directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ Error: dist directory not found. Run 'npm run build' first."
    exit 1
fi

echo ""
echo "📦 Deployment Configuration:"
echo "  Source: ./$LOCAL_DIR/*"
echo "  Target: /$([ -n "$TARGET_DIR" ] && echo "$TARGET_DIR/" || echo "(root)")"
echo "  Server: $SFTP_HOST"
echo ""

# Get password securely
echo "🔐 Please enter your IONOS password:"
read -s PASSWORD
echo ""

# Create expect script for SFTP
cat > /tmp/sftp_expect.exp << EOF
#!/usr/bin/expect -f
set timeout 30
spawn sftp -P $SFTP_PORT $SFTP_USER@$SFTP_HOST

expect {
    "password:" {
        send "$PASSWORD\r"
        expect "sftp>"
    }
    "Password:" {
        send "$PASSWORD\r"
        expect "sftp>"
    }
    timeout {
        puts "Connection timeout"
        exit 1
    }
}

# Navigate to target directory (only if specified)
# For IONOS, we deploy to root (/) by default

# Show current directory
send "pwd\r"
expect "sftp>"

# Clean up any placeholder files
send "rm index.html\r"
expect "sftp>"
send "rm project-not-found.html\r"
expect "sftp>"

# Upload .htaccess file specifically (most critical)
send "put $LOCAL_DIR/.htaccess\r"
expect "sftp>"

# Upload all files
send "put -r $LOCAL_DIR/*\r"
expect "sftp>"

# Verify upload
send "ls -la\r"
expect "sftp>"

# Check for critical files
send "ls -la .htaccess\r"
expect "sftp>"
send "ls -la index.html\r"
expect "sftp>"

# Exit
send "bye\r"
expect eof
EOF

# Make expect script executable
chmod +x /tmp/sftp_expect.exp

echo "🔗 Connecting to IONOS server..."

# Execute expect script
/tmp/sftp_expect.exp

# Clean up
rm /tmp/sftp_expect.exp

echo ""
echo "✅ Deployment attempt complete!"
echo ""
echo "🔍 Please verify your site at:"
echo "   https://be-productive.app"