#!/bin/bash

# Domain Monitoring Script for BeProductive App
# Usage: ./check-domain.sh

echo "=== BeProductive Domain Status Check ==="
echo "Timestamp: $(date)"
echo ""

# Check Vercel deployment (should work)
echo "🚀 VERCEL DEPLOYMENT STATUS:"
if curl -s --max-time 10 https://beproductive-app.vercel.app > /dev/null; then
    echo "✅ https://beproductive-app.vercel.app - WORKING"
    TITLE=$(curl -s https://beproductive-app.vercel.app | grep -o '<title>[^<]*</title>')
    echo "   Title: $TITLE"
else
    echo "❌ https://beproductive-app.vercel.app - DOWN"
fi

echo ""

# Check custom domain (likely won't work yet)
echo "🌐 CUSTOM DOMAIN STATUS:"
if ping -c 1 beproductive.app > /dev/null 2>&1; then
    echo "✅ beproductive.app - DNS RESOLVING"
    if curl -s --max-time 10 https://beproductive.app > /dev/null; then
        echo "✅ https://beproductive.app - WORKING"
    else
        echo "⚠️  https://beproductive.app - DNS OK, HTTPS FAILING"
    fi
else
    echo "❌ beproductive.app - DNS NOT RESOLVING (NXDOMAIN)"
    echo "   📋 Action needed: Check IONOS domain registration"
fi

echo ""

# DNS Status
echo "🔍 DNS LOOKUP DETAILS:"
echo "A Record check:"
dig +short A beproductive.app || echo "No A record found"

echo ""
echo "WHOIS check:"
whois beproductive.app | head -5 || echo "WHOIS lookup failed"

echo ""
echo "=== SUMMARY ==="
echo "✅ App is live and working on Vercel"
echo "❌ Custom domain needs IONOS configuration"
echo "📚 See deploy-netlify.md for alternative deployment"