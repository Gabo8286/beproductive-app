# 🚀 IONOS Deployment Guide for BeProductive v2

## 📋 Overview
This guide provides step-by-step instructions for deploying BeProductive v2 to IONOS hosting with the be-productive.app domain, completely independent from Lovable.dev.

## ✅ Pre-Deployment Checklist

### 🔧 Code Changes Completed
- [x] Removed Lovable.dev dependencies (`lovable-tagger`)
- [x] Removed Lovable.dev imports from `vite.config.ts`
- [x] Created production environment variables (`.env.production`)
- [x] Added `.htaccess` for React Router support
- [x] Updated GitHub Actions for IONOS deployment
- [x] Added custom 404.html page
- [x] Verified build process works correctly

### 🗄️ Database Prerequisites
- [x] Supabase project configured: `rymixmuunfjxwryucvxt.supabase.co`
- [ ] **CRITICAL**: Deploy missing database functions (see Database Setup section below)

## 📁 IONOS Hosting Setup

### 1. Domain Configuration
1. Log into your IONOS control panel
2. Configure DNS settings for `be-productive.app`:
   ```
   A Record: @ → Your server IP
   CNAME: www → be-productive.app
   ```
3. Enable SSL certificate for HTTPS

### 2. GitHub Secrets Configuration
Add these secrets to your GitHub repository settings:

```bash
IONOS_FTP_HOST="your-ftp-host.ionos.com"
IONOS_FTP_USER="your-ftp-username"
IONOS_FTP_PASS="your-ftp-password"
IONOS_DEPLOY_PATH="/"
VITE_SUPABASE_PROJECT_ID="rymixmuunfjxwryucvxt"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bWl4bXV1bmZqeHdyeXVjdnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzA4NjUsImV4cCI6MjA3NDg0Njg2NX0.TENbnWnRA8Ik5aKmgit4d8-CYjlD1uNNNZwzEPclPlU"
VITE_SUPABASE_URL="https://rymixmuunfjxwryucvxt.supabase.co"
```

### 3. Supabase CORS Configuration
Update Supabase Authentication settings:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add these URLs:
   - Site URL: `https://be-productive.app`
   - Redirect URLs: `https://be-productive.app/**`

## 🗄️ Database Setup (CRITICAL)

### Missing Functions Issue
The app requires super admin functions that are currently missing. You must deploy these manually:

1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `step2-functions.sql`:
   ```sql
   -- Copy and paste the entire contents of step2-functions.sql
   -- This creates the required functions:
   -- - assign_initial_super_admin()
   -- - assign_super_admin_role(uuid)
   -- - get_user_roles(uuid)
   ```

3. Verify functions exist:
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name IN ('assign_initial_super_admin', 'assign_super_admin_role', 'get_user_roles');
   ```

## 🚀 Deployment Process

### Automatic Deployment (Recommended)
1. Push to main branch or create a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically:
   - Build the application with production settings
   - Deploy to IONOS via FTP
   - Run health checks

### Manual Deployment
If needed, you can deploy manually:

```bash
# 1. Build for production
npm run build

# 2. Upload dist/ folder contents to IONOS via FTP
# Use your preferred FTP client or command line

# 3. Verify deployment
curl -f https://be-productive.app/
```

## 🔧 Files Created/Modified

### New Files
- `.env.production` - Production environment variables
- `public/.htaccess` - Apache configuration for React Router
- `public/404.html` - Custom 404 error page
- `IONOS_DEPLOYMENT_GUIDE.md` - This documentation

### Modified Files
- `package.json` - Removed lovable-tagger dependency
- `vite.config.ts` - Removed componentTagger import and usage
- `.github/workflows/deploy-production.yml` - Updated for IONOS deployment

## ⚠️ Post-Deployment Steps

### 1. Initial Super Admin Setup
After first deployment and user registration:

1. Log into the application
2. Run this SQL in Supabase Dashboard:
   ```sql
   SELECT * FROM assign_initial_super_admin();
   ```
3. Verify super admin access in the app

### 2. Testing Checklist
- [ ] Main site loads: `https://be-productive.app`
- [ ] React app renders correctly
- [ ] Authentication works (login/signup)
- [ ] Super admin dashboard accessible
- [ ] Database functions working
- [ ] All routes accessible (thanks to .htaccess)

### 3. Performance Optimization
- [ ] Enable gzip compression (should be automatic with .htaccess)
- [ ] Verify SSL certificate is working
- [ ] Test loading speed
- [ ] Check mobile responsiveness

## 🛠️ Troubleshooting

### Common Issues

1. **Site not loading**
   - Check DNS propagation (can take up to 24 hours)
   - Verify FTP upload completed successfully
   - Check IONOS hosting status

2. **React routes return 404**
   - Ensure `.htaccess` file is in the root directory
   - Check Apache mod_rewrite is enabled on IONOS

3. **Authentication fails**
   - Verify Supabase CORS settings include be-productive.app
   - Check environment variables in GitHub secrets

4. **Super admin features not working**
   - Ensure database functions are deployed (step2-functions.sql)
   - Check user has super_admin role in database

### Support Resources
- IONOS Support: Contact for hosting-specific issues
- Supabase Docs: For database and authentication issues
- GitHub Actions Logs: For deployment troubleshooting

## 🎯 Next Steps After Deployment

1. **Monitor Performance**
   - Set up Lighthouse monitoring
   - Configure error tracking (Sentry)
   - Monitor Core Web Vitals

2. **User Onboarding**
   - Test beta signup flow
   - Verify email notifications work
   - Set up user feedback collection

3. **SEO & Marketing**
   - Submit sitemap to search engines
   - Configure Google Analytics
   - Set up social media meta tags

## 📞 Emergency Rollback

If deployment fails:

1. **Quick Fix**: Revert to previous GitHub tag
2. **Manual**: Re-upload previous dist/ folder backup
3. **DNS**: Point domain back to temporary hosting if needed

---

## 🎉 Success!

Once deployed successfully, your app will be:
- ✅ Live at https://be-productive.app
- ✅ Independent from Lovable.dev
- ✅ Ready for beta testing
- ✅ Scalable and production-ready

**Total estimated deployment time: 2-4 hours** (including DNS propagation)