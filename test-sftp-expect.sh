#!/bin/bash

# Simple SFTP Test with Expect
echo "🧪 Testing SFTP Connection with Expect"
echo "======================================"

SFTP_HOST="access-5018822626.webspace-host.com"
SFTP_USER="a258905"
SFTP_PORT="22"

# Get password securely
echo "🔐 Please enter your IONOS password:"
read -s PASSWORD
echo ""

# Create expect script for testing
cat > /tmp/sftp_test_expect.exp << EOF
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

# Show current directory
send "pwd\r"
expect "sftp>"

# List files
send "ls -la\r"
expect "sftp>"

# Exit
send "bye\r"
expect eof
EOF

# Make executable and run
chmod +x /tmp/sftp_test_expect.exp
echo "🔗 Testing connection..."

/tmp/sftp_test_expect.exp

# Clean up
rm /tmp/sftp_test_expect.exp

echo ""
echo "✅ Test complete!"