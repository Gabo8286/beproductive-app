# Netlify Deployment Guide

## Quick Setup (Alternative to Vercel)

### Method 1: Web Interface (Recommended)
1. Go to https://app.netlify.com/
2. Click "New site from Git"
3. Connect your GitHub account
4. Select repository: `beproductive-app`
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Environment variables:** Copy from .env file
6. Click "Deploy site"

### Method 2: Drag & Drop
1. Run `npm run build` locally
2. Go to https://app.netlify.com/
3. Drag the `dist` folder to the deploy area
4. Get instant URL: `random-name.netlify.app`

### Custom Domain Setup on Netlify
1. In site settings, go to "Domain settings"
2. Click "Add custom domain"
3. Enter: `beproductive.app`
4. Configure DNS in IONOS:
   ```
   Type: CNAME
   Name: @
   Value: your-site-name.netlify.app

   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app
   ```

## Environment Variables Needed
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Benefits of Netlify
- ✅ Free SSL certificates
- ✅ Global CDN
- ✅ Automatic deployments
- ✅ Branch previews
- ✅ Form handling
- ✅ Analytics

Your app will be live within 5 minutes!