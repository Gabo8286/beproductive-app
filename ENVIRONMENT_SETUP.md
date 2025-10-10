# Environment Setup Guide
# BeProductive v2 - Luna AI Enhanced

## 🎯 Overview

This guide explains how to configure different environments for the BeProductive v2 application with Luna AI integration.

## 📁 Environment Files

### **Available Environment Configurations:**

1. **`.env.local`** - Local development (default)
2. **`.env.production`** - Live production deployment
3. **`docker.env`** - Docker containerized testing

---

## 🚀 Local Development Setup

### **1. Create .env.local file:**

```env
# Local Development Configuration
VITE_SUPABASE_PROJECT_ID=rymixmuunfjxwryucvxt
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bWl4bXV1bmZqeHdyeXVjdnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzA4NjUsImV4cCI6MjA3NDg0Njg2NX0.TENbnWnRA8Ik5aKmgit4d8-CYjlD1uNNNZwzEPclPlU
VITE_SUPABASE_URL=https://rymixmuunfjxwryucvxt.supabase.co

# Authentication (Local URLs)
VITE_AUTH_REDIRECT_URL=http://localhost:5173
VITE_AUTH_SITE_URL=http://localhost:5173

# Application Configuration
VITE_APP_NAME="BeProductive v2 - Local Dev"
VITE_APP_VERSION=1.0.0-dev
VITE_APP_ENVIRONMENT=development
VITE_APP_URL=http://localhost:5173

# Features (All enabled for development)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_MOBILE_OPTIMIZATIONS=true

# Development Tools (Enabled)
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_REDUX_DEVTOOLS=true
VITE_SHOW_PERFORMANCE_MONITOR=true

# Local Mode Flag
VITE_LOCAL_MODE=true

# Build settings
NODE_ENV=development
```

### **2. Install Dependencies:**

```bash
npm install
```

### **3. Start Development Server:**

```bash
npm run dev
```

**Expected Result:** App runs at `http://localhost:5173`

---

## 🐳 Docker Development Setup

### **1. Use existing docker.env file:**

The `docker.env` file is already configured with production Supabase credentials.

### **2. Build Docker Image:**

```bash
docker build -t beproductive-v2 .
```

### **3. Run Container:**

```bash
docker run -p 8080:80 --env-file docker.env beproductive-v2
```

**Expected Result:** App runs at `http://localhost:8080`

---

## 🌐 Production Deployment

### **For Lovable Platform:**

Use the `.env.production` file which contains optimized production settings.

### **For Other Platforms:**

Copy environment variables from `.env.production` to your deployment platform's environment configuration.

### **Required Variables for Production:**

```env
VITE_SUPABASE_PROJECT_ID=rymixmuunfjxwryucvxt
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bWl4bXV1bmZqeHdyeXVjdnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzA4NjUsImV4cCI6MjA3NDg0Njg2NX0.TENbnWnRA8Ik5aKmgit4d8-CYjlD1uNNNZwzEPclPlU
VITE_SUPABASE_URL=https://rymixmuunfjxwryucvxt.supabase.co
VITE_ENABLE_AI_FEATURES=true
VITE_LOCAL_MODE=false
NODE_ENV=production
```

---

## 🔧 Environment Variables Reference

### **Supabase Configuration**

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_PROJECT_ID` | Supabase project identifier | `rymixmuunfjxwryucvxt` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/public key for client-side | `eyJhbGci...` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |

### **Authentication URLs**

| Variable | Local Dev | Docker | Production |
|----------|-----------|---------|------------|
| `VITE_AUTH_REDIRECT_URL` | `http://localhost:5173` | `http://localhost:8080` | `https://your-domain.com` |
| `VITE_AUTH_SITE_URL` | `http://localhost:5173` | `http://localhost:8080` | `https://your-domain.com` |

### **Feature Flags**

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `VITE_ENABLE_AI_FEATURES` | `true` | `true` | Luna AI assistant |
| `VITE_ENABLE_COLLABORATION` | `true` | `true` | Team features |
| `VITE_ENABLE_GAMIFICATION` | `true` | `true` | Points, streaks |
| `VITE_ENABLE_ANALYTICS` | `false` | `true` | Usage tracking |
| `VITE_LOCAL_MODE` | `true` | `false` | Development mode |

### **Development Tools**

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `VITE_ENABLE_DEVTOOLS` | `true` | `false` | React DevTools |
| `VITE_ENABLE_REDUX_DEVTOOLS` | `true` | `false` | State debugging |
| `VITE_SHOW_PERFORMANCE_MONITOR` | `true` | `false` | Performance overlay |

---

## 🔒 Security Considerations

### **Environment File Security:**

1. **Never commit `.env.local`** to git (included in .gitignore)
2. **Production keys** should be stored securely in deployment platform
3. **Docker.env** can be committed as it uses production keys
4. **Service role keys** should NEVER be exposed to client

### **Supabase Security:**

1. **Row-Level Security (RLS)** is enabled on all tables
2. **JWT verification** is required for Edge Functions
3. **Anon key** is safe for client-side use (RLS protects data)
4. **Auth policies** restrict user access to their own data

---

## 🧪 Testing Different Environments

### **Local Development Test:**

```bash
# Use local environment
npm run dev

# Test Luna chat
# Visit http://localhost:5173
# Open Luna chat and verify AI responses
```

### **Docker Environment Test:**

```bash
# Build and run Docker container
docker build -t beproductive-v2 .
docker run -p 8080:80 --env-file docker.env beproductive-v2

# Test in browser
# Visit http://localhost:8080
# Verify production Supabase connection
```

### **Production Environment Test:**

```bash
# Build for production
npm run build

# Serve production build locally
npm run preview

# Test production-like environment
# Visit preview URL
# Verify all features work with production database
```

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. "Supabase client not initialized"**
**Cause:** Missing or incorrect environment variables
**Solution:**
```bash
# Check environment variables are loaded
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
```

#### **2. "Authentication redirect loop"**
**Cause:** Incorrect redirect URLs
**Solution:** Ensure redirect URLs match your current domain:
- Local: `http://localhost:5173`
- Docker: `http://localhost:8080`
- Production: `https://your-domain.com`

#### **3. "Database connection failed"**
**Cause:** Network issues or incorrect URL
**Solution:**
```bash
# Test Supabase connection
curl https://rymixmuunfjxwryucvxt.supabase.co/rest/v1/
```

#### **4. "Luna AI not responding"**
**Cause:** AI features disabled or database issues
**Solution:**
1. Check `VITE_ENABLE_AI_FEATURES=true`
2. Verify `ai_habit_suggestions` table exists
3. Test database permissions

---

## 📝 Environment Checklist

### **Before Starting Development:**

- [ ] `.env.local` file created with correct variables
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase connection tested
- [ ] Luna chat loads and responds
- [ ] Authentication works (signup/login)

### **Before Docker Testing:**

- [ ] Docker installed and running
- [ ] `docker.env` file configured
- [ ] Production Supabase credentials valid
- [ ] Container builds successfully
- [ ] App accessible on port 8080

### **Before Production Deployment:**

- [ ] `.env.production` variables copied to platform
- [ ] Build completes without errors
- [ ] All features tested in production environment
- [ ] Database schema validated
- [ ] Security policies verified

---

## 🔄 Environment Migration

### **From Local to Docker:**

1. Copy `.env.local` variables to `docker.env`
2. Update URLs from localhost:5173 to localhost:8080
3. Set `VITE_LOCAL_MODE=true` for testing
4. Build and test Docker container

### **From Docker to Production:**

1. Copy `docker.env` variables to production platform
2. Update all URLs to production domain
3. Set `VITE_LOCAL_MODE=false`
4. Enable production features (analytics, monitoring)
5. Verify security configurations

---

## ✅ Quick Commands Reference

```bash
# Development
npm run dev                 # Start local development
npm run build              # Build for production
npm run preview            # Preview production build
npm run type-check         # Check TypeScript types

# Docker
docker build -t app .      # Build container
docker run -p 8080:80 app  # Run container
docker logs <container>    # Check container logs

# Environment Testing
npm run test               # Run tests
npm run lint              # Check code quality
npm run format            # Format code
```

**🎯 Follow this guide to ensure consistent environment setup across all deployment scenarios!**