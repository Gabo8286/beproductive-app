# 🚀 Complete IONOS Deployment Guide for BeProductive v2

## 📋 Overview
This comprehensive guide provides detailed, step-by-step instructions for deploying BeProductive v2 to IONOS hosting with the be-productive.app domain. This guide assumes you have already configured Supabase with the GOOGLE_AI_API_KEY.

---

## ✅ Prerequisites Checklist

### 🔧 Required Accounts & Access
- [x] IONOS hosting account with domain `be-productive.app`
- [x] GitHub repository access with admin permissions
- [x] Supabase project configured: `rymixmuunfjxwryucvxt.supabase.co`
- [x] Google AI API key added to Supabase environment variables

### 🗄️ Database Status
- [x] Supabase project ready
- [x] Google AI API key configured (`GOOGLE_AI_API_KEY`)
- [ ] Database functions deployed (if not done, see CRITICAL_DATABASE_SETUP.md)

---

## 🏠 Part 1: IONOS Control Panel Setup

### Step 1: Access IONOS Control Panel

1. **Login to IONOS**
   - Go to: https://login.ionos.com/
   - Enter your IONOS credentials
   - Navigate to "Hosting" section

2. **Locate Your Hosting Package**
   - Click on "Hosting" in the main menu
   - Find the package associated with `be-productive.app`
   - Click "Manage" or "Settings"

### Step 2: Domain Configuration

1. **Access Domain Settings**
   ```
   IONOS Control Panel → Domains & SSL → Domain Overview
   → Select be-productive.app → DNS
   ```

2. **Configure DNS Records**
   ```dns
   # A Record (Required)
   Name: @
   Type: A
   Value: [Your server IP - found in hosting details]
   TTL: 3600

   # CNAME Record (Optional but recommended)
   Name: www
   Type: CNAME
   Value: be-productive.app
   TTL: 3600
   ```

3. **Find Your Server IP**
   - In IONOS Control Panel: Hosting → [Your Package] → Technical Details
   - Look for "IP Address" or "Server IP"
   - Copy this IP for the A record above

### Step 3: SSL Certificate Setup

1. **Enable SSL/TLS**
   ```
   IONOS Control Panel → Hosting → [Your Package] → SSL
   → Enable "Let's Encrypt SSL Certificate" (Free)
   ```

2. **Verify SSL Settings**
   - SSL should auto-renew
   - Force HTTPS redirection should be enabled
   - Wait 15-30 minutes for activation

### Step 4: FTP Access Configuration

1. **Access FTP Settings**
   ```
   IONOS Control Panel → Hosting → [Your Package] → FTP Access
   ```

2. **Create/Verify FTP User**
   - **FTP Host**: Usually `[your-domain].ionos.com` or similar
   - **FTP Username**: Create if needed (e.g., `beproductive`)
   - **FTP Password**: Set a strong password
   - **FTP Path**: Usually `/` (root) or `/htdocs/`

3. **Test FTP Connection**
   ```bash
   # Using command line (optional)
   ftp your-ftp-host.ionos.com
   # Enter username and password when prompted
   ```

---

## 🔐 Part 2: GitHub Repository Configuration

### Step 1: Access GitHub Secrets

1. **Navigate to Repository Settings**
   ```
   GitHub → Your Repository → Settings → Security →
   Secrets and variables → Actions
   ```

2. **Click "New repository secret"**

### Step 2: Add Required Secrets

Add these secrets one by one by clicking "New repository secret":

#### **FTP Configuration Secrets**
```yaml
Secret Name: IONOS_FTP_HOST
Secret Value: your-ftp-host.ionos.com
# Example: h123456789.web.ionos.com

Secret Name: IONOS_FTP_USER
Secret Value: your-ftp-username
# The username you created in IONOS FTP settings

Secret Name: IONOS_FTP_PASS
Secret Value: your-ftp-password
# The password you set for FTP user

Secret Name: IONOS_DEPLOY_PATH
Secret Value: /
# Usually "/" for root, or "/htdocs/" for some configurations
```

#### **Supabase Configuration Secrets**
```yaml
Secret Name: VITE_SUPABASE_PROJECT_ID
Secret Value: rymixmuunfjxwryucvxt

Secret Name: VITE_SUPABASE_PUBLISHABLE_KEY
Secret Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bWl4bXV1bmZqeHdyeXVjdnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzA4NjUsImV4cCI6MjA3NDg0Njg2NX0.TENbnWnRA8Ik5aKmgit4d8-CYjlD1uNNNZwzEPclPlU

Secret Name: VITE_SUPABASE_URL
Secret Value: https://rymixmuunfjxwryucvxt.supabase.co
```

### Step 3: Verify Secrets Configuration

1. **Check Secrets List**
   - You should see 6 secrets total
   - All should show "Updated X seconds/minutes ago"

2. **Secret Naming Verification**
   ```
   ✅ IONOS_FTP_HOST
   ✅ IONOS_FTP_USER
   ✅ IONOS_FTP_PASS
   ✅ IONOS_DEPLOY_PATH
   ✅ VITE_SUPABASE_PROJECT_ID
   ✅ VITE_SUPABASE_PUBLISHABLE_KEY
   ✅ VITE_SUPABASE_URL
   ```

---

## 🗂 Part 3: File System Preparation

### Step 1: Verify Required Files Exist

Your repository should already contain these files. Verify they exist:

```bash
# Core deployment files
✅ public/.htaccess           # Apache configuration for React Router
✅ public/404.html           # Custom 404 page
✅ .env.production          # Production environment variables
✅ .github/workflows/deploy-production.yml  # GitHub Actions workflow
```

### Step 2: Understanding the .htaccess File

The `.htaccess` file handles:
- React Router support (client-side routing)
- Security headers
- Compression
- Caching rules

**Location**: `public/.htaccess` (already created)

### Step 3: Understanding the 404.html File

Custom 404 page with:
- BeProductive branding
- Auto-redirect to home page after 5 seconds
- Fallback for broken routes

**Location**: `public/404.html` (already created)

---

## 🚀 Part 4: Deployment Methods

### Method A: Automatic Deployment (Recommended)

#### Step 1: Deploy via Git Tag

```bash
# Create and push a release tag
git tag v1.0.0-release
git push origin v1.0.0-release
```

#### Step 2: Monitor GitHub Actions

1. **View Deployment Progress**
   ```
   GitHub → Your Repository → Actions → Production Deployment
   ```

2. **Deployment Stages**
   ```
   🔄 Quality Assurance (Linting, tests, security)
   🔄 Build Application (Creates dist/ folder)
   🔄 Deploy to IONOS (FTP upload)
   🔄 Health Checks (Verifies deployment)
   ```

3. **Expected Duration**: 5-10 minutes total

#### Step 3: Verify Deployment Success

Look for green checkmarks ✅ on all stages.

### Method B: Manual Deployment

If automatic deployment fails, use manual method:

#### Step 1: Build Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build success
ls -la dist/
```

#### Step 2: Upload via FTP Client

**Using FileZilla (Recommended)**:
1. Download FileZilla: https://filezilla-project.org/
2. Connection settings:
   - **Host**: your-ftp-host.ionos.com
   - **Username**: your-ftp-username
   - **Password**: your-ftp-password
   - **Port**: 21 (or 22 for SFTP)

3. Upload process:
   - Connect to FTP server
   - Navigate to root directory (`/` or `/htdocs/`)
   - Upload ALL contents of `dist/` folder to root
   - Ensure `.htaccess` and `404.html` are in root

**Using Command Line**:
```bash
# Install lftp (if not installed)
sudo apt-get install lftp  # Ubuntu/Debian
brew install lftp          # macOS

# Create upload script
cat > upload.lftp << EOF
open -u your-username,your-password your-ftp-host.ionos.com
lcd dist
cd /
mirror --reverse --delete --verbose
bye
EOF

# Execute upload
lftp -f upload.lftp
```

---

## 🔍 Part 5: Verification & Testing

### Step 1: Domain Propagation Check

```bash
# Check if domain resolves
nslookup be-productive.app

# Check if website responds
curl -I https://be-productive.app
```

**Expected Response**:
```
HTTP/2 200
content-type: text/html
```

### Step 2: Comprehensive Site Testing

#### **Basic Functionality**
1. **Main Site**: https://be-productive.app
   - Should load React application
   - Should show BeProductive interface

2. **React Router**: https://be-productive.app/tasks
   - Should NOT return 404
   - Should load tasks page

3. **Authentication**: https://be-productive.app/login
   - Login form should appear
   - Should connect to Supabase

#### **Advanced Testing**
```bash
# Test various routes
curl -f https://be-productive.app/
curl -f https://be-productive.app/goals
curl -f https://be-productive.app/habits
curl -f https://be-productive.app/calendar

# Check for React app container
curl -s https://be-productive.app/ | grep '<div id="root">'
```

### Step 3: Performance Verification

1. **Page Speed Test**
   - Use: https://pagespeed.web.dev/
   - Enter: https://be-productive.app
   - Look for: Score > 80

2. **SSL Certificate Check**
   - Use: https://www.ssllabs.com/ssltest/
   - Enter: be-productive.app
   - Look for: Grade A

---

## 🛠 Part 6: IONOS-Specific Troubleshooting

### Issue 1: "Site Not Loading"

**Symptoms**: Domain doesn't resolve or shows IONOS placeholder

**Solutions**:
1. **Check DNS Propagation**
   ```bash
   # Wait up to 24 hours for full propagation
   dig be-productive.app
   ```

2. **Verify A Record**
   - IONOS Control Panel → Domains → DNS
   - Ensure A record points to correct IP

3. **Check Hosting Status**
   - IONOS Control Panel → Hosting → Package Status
   - Should show "Active"

### Issue 2: "404 on React Routes"

**Symptoms**: `/tasks`, `/goals` etc. return 404

**Solutions**:
1. **Verify .htaccess Upload**
   ```bash
   # Check if .htaccess exists on server
   curl -I https://be-productive.app/.htaccess
   # Should return 403 Forbidden (file exists but not accessible)
   ```

2. **Check Apache mod_rewrite**
   - Contact IONOS support if .htaccess rules don't work
   - Ask them to enable mod_rewrite module

3. **Alternative .htaccess Content**
   If current .htaccess doesn't work, try simpler version:
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

### Issue 3: "Authentication Fails"

**Symptoms**: Login/signup doesn't work

**Solutions**:
1. **Update Supabase CORS**
   ```
   Supabase Dashboard → Authentication → URL Configuration
   Site URL: https://be-productive.app
   Redirect URLs: https://be-productive.app/**
   ```

2. **Check Environment Variables**
   - Verify GitHub secrets are correct
   - Ensure VITE_ prefix on all client variables

### Issue 4: "FTP Upload Fails"

**Symptoms**: GitHub Actions deployment fails at FTP step

**Solutions**:
1. **Test FTP Credentials**
   ```bash
   # Test connection manually
   lftp -u username,password ftp-host.ionos.com
   ```

2. **Check FTP Settings**
   - IONOS Control Panel → FTP Access
   - Verify username/password combination
   - Try creating new FTP user

3. **Alternative: Use SFTP**
   - Some IONOS packages support SFTP (port 22)
   - Update GitHub Actions to use SFTP instead

### Issue 5: "Slow Loading Times"

**Symptoms**: Site loads but very slowly

**Solutions**:
1. **Enable Compression**
   - .htaccess already includes gzip compression
   - Verify it's working: `curl -H "Accept-Encoding: gzip" https://be-productive.app`

2. **Optimize Images**
   ```bash
   # Check image sizes
   du -sh dist/assets/*.{png,jpg,webp}
   ```

3. **CDN Setup** (Optional)
   - IONOS offers CDN services
   - Contact support for CDN configuration

---

## 📞 Part 7: Support & Maintenance

### IONOS Support Contacts

1. **Technical Support**
   - Phone: Available in IONOS Control Panel
   - Email: Available in IONOS Control Panel
   - Chat: Login to control panel for live chat

2. **Common Support Requests**
   - "Enable mod_rewrite for my domain"
   - "Check FTP connectivity issues"
   - "SSL certificate not working"

### Monitoring & Maintenance

#### **Weekly Checks**
```bash
# Verify site health
curl -f https://be-productive.app/

# Check SSL expiration
openssl s_client -connect be-productive.app:443 -servername be-productive.app | openssl x509 -noout -dates
```

#### **Monthly Tasks**
- Review IONOS hosting usage
- Check for any performance degradation
- Verify backups are current
- Update dependencies and redeploy

---

## 🎯 Part 8: Deployment Checklist

### Pre-Deployment
- [ ] IONOS hosting account active
- [ ] Domain DNS configured
- [ ] SSL certificate enabled
- [ ] FTP credentials created and tested
- [ ] GitHub secrets configured
- [ ] Supabase CORS updated
- [ ] Database functions deployed

### During Deployment
- [ ] GitHub Actions workflow triggered
- [ ] All CI/CD stages pass
- [ ] FTP upload completes successfully
- [ ] Health checks pass

### Post-Deployment
- [ ] Main site loads: https://be-productive.app
- [ ] React router works: https://be-productive.app/tasks
- [ ] Authentication functional
- [ ] SSL certificate valid
- [ ] Performance acceptable (PageSpeed > 80)
- [ ] Error tracking configured

---

## 🚨 Emergency Procedures

### Quick Rollback

If deployment causes issues:

1. **Identify Previous Working Version**
   ```bash
   git log --oneline
   ```

2. **Deploy Previous Tag**
   ```bash
   git tag v1.0.0-rollback
   git push origin v1.0.0-rollback
   ```

3. **Manual Restoration** (if needed)
   - Keep backup of previous `dist/` folder
   - Re-upload via FTP client

### Contact Information

**For Critical Issues**:
1. Check GitHub Actions logs first
2. Verify IONOS hosting status
3. Contact IONOS support for hosting-specific problems
4. Check Supabase status page for database issues

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ **Site Loads**: https://be-productive.app shows BeProductive interface
✅ **Routes Work**: All React Router routes resolve correctly
✅ **Authentication**: Users can login/signup via Supabase
✅ **AI Features**: Google AI integration working
✅ **SSL Secure**: HTTPS enabled with valid certificate
✅ **Performance**: Site loads quickly (< 3 seconds)
✅ **Mobile**: Responsive design works on mobile devices

**Estimated Total Deployment Time**: 2-4 hours (including DNS propagation)

---

## 📚 Additional Resources

- **IONOS Documentation**: https://www.ionos.com/help/
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Supabase Docs**: https://supabase.com/docs
- **React Router Docs**: https://reactrouter.com/

**Good luck with your deployment! 🚀**