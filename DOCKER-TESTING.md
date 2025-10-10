# Docker Testing for Modular Architecture

This document describes how to test the new modular architecture using Docker.

## 🚀 Quick Start

### Automated Testing
Run the automated test script:
```bash
./test-docker-modules.sh
```

### Manual Testing
1. **Build and start:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Main app: http://localhost:8080
   - Module test page: http://localhost:8080/module-test
   - Module status API: http://localhost:8080/api/modules/status
   - Health check: http://localhost:8080/health

## 🏗️ Architecture Testing

### Module System Verification

The modular architecture includes these modules:
- **AI Assistant** - Intent recognition and natural language processing
- **Productivity Cycle** - 3-step cycle management (Capture → Execute → Engage)
- **Task Management** - Task lifecycle management
- **Automation Engine** - Cross-module automation
- **Voice Interface** - Speech processing capabilities

### Testing Endpoints

1. **Module Status API**
   ```bash
   curl http://localhost:8080/api/modules/status
   ```
   Expected response:
   ```json
   {
     "status": "ready",
     "architecture": "modular",
     "version": "1.0.0",
     "modules": [
       "ai-assistant",
       "productivity-cycle",
       "task-management",
       "automation-engine",
       "voice-interface"
     ]
   }
   ```

2. **Module Test Page**
   ```bash
   curl -I http://localhost:8080/module-test
   ```
   Should include headers:
   - `X-Module-Architecture: v1.0.0`
   - `X-Build-Type: modular`

3. **Health Check**
   ```bash
   curl http://localhost:8080/health
   ```

## 🧪 Manual Testing Checklist

### Build Verification
- [ ] Docker build completes successfully
- [ ] Module files are present in dist/
- [ ] ModuleTest page chunk is built
- [ ] No missing dependencies errors

### Runtime Testing
- [ ] Application starts without errors
- [ ] Module Test page loads at `/module-test`
- [ ] Module status API returns correct data
- [ ] Health checks pass
- [ ] No console errors in browser

### Module Integration Testing
Visit `/module-test` and verify:
- [ ] Module registry shows all modules
- [ ] Module communication tests pass
- [ ] AI Assistant responds to health checks
- [ ] Productivity Cycle state retrieval works
- [ ] Cross-module data flow functions
- [ ] Event bus processes events correctly

## 🔧 Debugging

### View Logs
```bash
# All services
docker-compose logs

# Just the app
docker-compose logs app

# Follow logs
docker-compose logs -f app
```

### Shell Access
```bash
docker-compose exec app sh
```

### Check Build Output
```bash
# View built files
docker-compose exec app ls -la /usr/share/nginx/html/

# Check for module files
docker-compose exec app find /usr/share/nginx/html -name "*Module*"
```

### Environment Variables
Check if module flags are set:
```bash
docker-compose exec app env | grep MODULE
```

## 🐛 Common Issues

### Module Not Loading
- Check console for import errors
- Verify module files exist in build output
- Check network tab for 404s on module chunks

### Communication Errors
- Ensure event bus is initialized
- Check module registration in console
- Verify message handlers are set up

### Build Issues
- Clear Docker cache: `docker system prune -f`
- Rebuild without cache: `docker-compose build --no-cache`
- Check .env.docker configuration

## 📊 Performance Monitoring

### Bundle Analysis
The build verification shows:
- Main bundle sizes
- Module chunk distribution
- Code splitting effectiveness

### Key Metrics to Monitor
- Initial load time (should be < 2s)
- Module loading performance
- Memory usage in browser
- Network requests for module chunks

## 🎯 Success Criteria

✅ **Build Success:**
- No build errors
- All modules compile correctly
- Module test page builds
- Appropriate chunk sizes

✅ **Runtime Success:**
- Application loads without errors
- All modules initialize
- Module communication works
- Test page shows green tests

✅ **Performance Success:**
- Load time under 2 seconds
- Reasonable bundle sizes
- Efficient module loading
- No memory leaks

## 🔄 Continuous Testing

Add this to your CI/CD pipeline:
```bash
# In your CI script
./test-docker-modules.sh
```

The script will:
1. Build the Docker image
2. Start services
3. Run health checks
4. Test module endpoints
5. Verify module initialization
6. Check performance metrics
7. Report results