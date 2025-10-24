#!/bin/bash

# Simple SFTP Connection Test
echo "🔗 Testing IONOS SFTP Connection..."
echo "=================================="

SFTP_HOST="access-5018822626.webspace-host.com"
SFTP_USER="a258905"
SFTP_PORT="22"

echo "Server: $SFTP_HOST"
echo "User: $SFTP_USER"
echo "Port: $SFTP_PORT"
echo ""
echo "⚠️  You will be prompted for your password."
echo "If this fails, reset your password in IONOS Control Panel."
echo ""

# Simple connection test
cat > /tmp/sftp_test.txt << 'EOF'
pwd
ls -la
bye
EOF

echo "Testing connection..."
sftp -P $SFTP_PORT -b /tmp/sftp_test.txt $SFTP_USER@$SFTP_HOST

rm /tmp/sftp_test.txt

echo ""
echo "✅ If you saw directory listings above, the connection works!"
echo "❌ If you got 'Permission denied', reset your password in IONOS."