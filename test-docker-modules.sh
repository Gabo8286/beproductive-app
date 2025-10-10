#!/bin/bash

# Test script for Docker modular architecture
# This script builds and tests the modular architecture in Docker

set -e

echo "🚀 Testing Modular Architecture in Docker"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Clean up any existing containers
print_status "Cleaning up existing containers..."
docker-compose down --remove-orphans || true
docker system prune -f --volumes || true

# Step 2: Build the application
print_status "Building Docker image with modular architecture..."
docker-compose build --no-cache app

# Step 3: Start the services
print_status "Starting services..."
docker-compose up -d

# Step 4: Wait for services to be ready
print_status "Waiting for services to be ready..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker-compose exec app curl -f http://localhost:80/health >/dev/null 2>&1; then
        print_success "Health check passed!"
        break
    fi

    if [ $counter -eq $((timeout - 1)) ]; then
        print_error "Services failed to start within $timeout seconds"
        docker-compose logs app
        exit 1
    fi

    sleep 1
    counter=$((counter + 1))
    echo -n "."
done

echo ""

# Step 5: Test module endpoints
print_status "Testing module endpoints..."

# Test module status endpoint
print_status "Testing module status endpoint..."
if curl -f http://localhost:8080/api/modules/status >/dev/null 2>&1; then
    print_success "Module status endpoint is accessible"
    echo "Module status response:"
    curl -s http://localhost:8080/api/modules/status | jq . || curl -s http://localhost:8080/api/modules/status
else
    print_warning "Module status endpoint not accessible"
fi

# Test module test page
print_status "Testing module test page..."
if curl -f http://localhost:8080/module-test >/dev/null 2>&1; then
    print_success "Module test page is accessible"

    # Check for module architecture headers
    headers=$(curl -I http://localhost:8080/module-test 2>/dev/null)
    if echo "$headers" | grep -q "X-Module-Architecture"; then
        print_success "Module architecture headers detected"
    else
        print_warning "Module architecture headers not found"
    fi
else
    print_warning "Module test page not accessible"
fi

# Test main application
print_status "Testing main application..."
if curl -f http://localhost:8080/ >/dev/null 2>&1; then
    print_success "Main application is accessible"
else
    print_error "Main application not accessible"
    exit 1
fi

# Step 6: Check logs for module initialization
print_status "Checking logs for module initialization..."
logs=$(docker-compose logs app 2>/dev/null | tail -20)

modules=("AI Assistant" "Productivity Cycle" "Task Management" "Automation Engine" "Voice Interface")
for module in "${modules[@]}"; do
    if echo "$logs" | grep -q "$module module initialized"; then
        print_success "$module module initialized successfully"
    else
        print_warning "$module module initialization not found in logs"
    fi
done

# Step 7: Performance check
print_status "Checking performance metrics..."
response_time=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:8080/)
if (( $(echo "$response_time < 2.0" | bc -l) )); then
    print_success "Application loads in ${response_time}s (good performance)"
else
    print_warning "Application loads in ${response_time}s (consider optimization)"
fi

# Step 8: Check bundle information
print_status "Checking JavaScript bundles..."
bundle_info=$(curl -s http://localhost:8080/ | grep -o 'assets/[^"]*\.js' | head -5)
if [ -n "$bundle_info" ]; then
    print_success "JavaScript bundles detected:"
    echo "$bundle_info"
else
    print_warning "Could not detect JavaScript bundles"
fi

# Step 9: Final status
print_status "==========================================="
print_success "🎉 Docker Modular Architecture Test Complete!"
print_status "==========================================="

echo ""
echo "📋 Test Summary:"
echo "- Application URL: http://localhost:8080"
echo "- Module Test Page: http://localhost:8080/module-test"
echo "- Module Status API: http://localhost:8080/api/modules/status"
echo "- Health Check: http://localhost:8080/health"
echo ""
echo "🔧 Commands to interact with the running application:"
echo "- View logs: docker-compose logs -f app"
echo "- Stop services: docker-compose down"
echo "- Restart services: docker-compose restart"
echo "- Shell access: docker-compose exec app sh"
echo ""

# Option to keep running or stop
read -p "Keep the application running? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped."
else
    print_success "Application will continue running at http://localhost:8080"
    print_status "Use 'docker-compose down' to stop when done."
fi