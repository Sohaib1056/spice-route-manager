# 🚀 Vercel Deployment Guide - DryFruit Pro

## ❌ Problem: 404 Error on Vercel

**Why 404 Error?**
TanStack Start uses **client-side routing**. Jab aap directly `/sales` ya `/login` URL par jate hain, Vercel ko wo file nahi milti aur 404 error deta hai.

**Solution:**
All routes ko `index.html` par redirect karna hoga (SPA routing).

## ✅ Solution Files Created

### 1. `vercel.json` ✅
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**What it does:**
- ✅ All routes redirect to index.html
- ✅ Client-side router handles navigation
- ✅ No more 404 errors

### 2. `main.tsx` ✅
Entry point for the application.

### 3. `App.tsx` ✅
Main app component with router.

## 🔧 Deployment Steps

### Method 1: Vercel Dashboard (Recommended)

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "Add Vercel deployment config"
git push origin main
```

**Step 2: Import to Vercel**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect settings

**Step 3: Configure Build Settings**
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: .output/public
Install Command: npm install
```

**Step 4: Deploy**
Click "Deploy" button

### Method 2: Vercel CLI

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login**
```bash
vercel login
```

**Step 3: Deploy**
```bash
# First time
vercel

# Production
vercel --prod
```

## 📁 Build Output Structure

After `npm run build`:
```
.output/
└── public/
    ├── index.html
    ├── assets/
    │   ├── images/
    │   └── *.js, *.css
    └── favicon.ico
```

## 🎯 Vercel Configuration Explained

### `vercel.json` Breakdown

```json
{
  // Build command
  "buildCommand": "npm run build",
  
  // Where build files are
  "outputDirectory": ".output/public",
  
  // Don't auto-detect framework
  "framework": null,
  
  // Redirect all routes to index.html
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  
  // Cache static assets
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Why Rewrites?

**Without Rewrites:**
```
User visits: https://yourapp.vercel.app/sales
Vercel looks for: /sales.html
Not found: 404 Error ❌
```

**With Rewrites:**
```
User visits: https://yourapp.vercel.app/sales
Vercel redirects to: /index.html
React Router handles: /sales route
Page loads: ✅
```

## 🔍 Troubleshooting

### Issue 1: 404 on Refresh

**Problem:**
- Homepage works
- Navigation works
- Refresh on /sales → 404

**Solution:**
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue 2: Build Fails

**Problem:**
```
Error: Cannot find module 'vite'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue 3: Assets Not Loading

**Problem:**
- CSS not loading
- Images not showing
- JS errors

**Solution:**
Check `vite.config.ts`:
```ts
export default defineConfig({
  base: '/',  // ← Should be '/' for Vercel
});
```

### Issue 4: Environment Variables

**Problem:**
API keys not working in production

**Solution:**
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add your variables:
   ```
   VITE_API_URL=https://api.example.com
   ```
4. Redeploy

## 🎨 Custom Domain Setup

### Step 1: Add Domain in Vercel
1. Project Settings → Domains
2. Add your domain: `dryfruit.com`
3. Follow DNS instructions

### Step 2: Update DNS
Add these records to your domain:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for Propagation
Usually takes 5-30 minutes.

## 📊 Performance Optimization

### 1. Enable Compression
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip"
        }
      ]
    }
  ]
}
```

### 2. Cache Static Assets
Already configured in `vercel.json`:
```json
{
  "source": "/assets/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

### 3. Optimize Images
```bash
# Install image optimizer
npm install sharp

# Use in build
npm run build
```

## 🔐 Security Headers

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 📱 Preview Deployments

**Every Git Push:**
- Vercel creates preview deployment
- Unique URL for testing
- Perfect for testing before production

**Example:**
```
main branch → https://dryfruit-pro.vercel.app (production)
feature branch → https://dryfruit-pro-git-feature.vercel.app (preview)
```

## 🎯 Deployment Checklist

Before deploying:

- [ ] `vercel.json` file exists
- [ ] `npm run build` works locally
- [ ] All routes work in preview
- [ ] Images load correctly
- [ ] Favicon shows up
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Environment variables set

## 🚀 Quick Deploy Commands

```bash
# Test build locally
npm run build
npm run preview

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## 📖 Common Vercel Commands

```bash
# Login
vercel login

# Link project
vercel link

# Deploy
vercel

# Production deploy
vercel --prod

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# View logs
vercel logs [deployment-url]

# Environment variables
vercel env ls
vercel env add
vercel env rm
```

## 🎨 Vercel Dashboard Features

### Analytics
- Page views
- Unique visitors
- Top pages
- Performance metrics

### Logs
- Build logs
- Runtime logs
- Error tracking

### Deployments
- All deployments history
- Rollback to previous version
- Preview deployments

## 💡 Best Practices

### 1. Use Environment Variables
```bash
# .env.local (not committed)
VITE_API_URL=http://localhost:3000

# Vercel Dashboard
VITE_API_URL=https://api.production.com
```

### 2. Test Before Deploy
```bash
npm run build
npm run preview
# Test all routes
```

### 3. Use Git Branches
```bash
main → Production
develop → Preview
feature/* → Preview
```

### 4. Monitor Performance
- Check Vercel Analytics
- Monitor build times
- Watch bundle size

## 🔄 Continuous Deployment

**Automatic:**
```
Git Push → Vercel detects → Build → Deploy → Live
```

**Manual:**
```bash
vercel --prod
```

## 📊 Expected Results

After deployment:

✅ **Homepage:** https://yourapp.vercel.app
✅ **Login:** https://yourapp.vercel.app/login
✅ **Sales:** https://yourapp.vercel.app/sales
✅ **All routes work**
✅ **No 404 errors**
✅ **Fast loading**
✅ **Mobile responsive**

## 🎉 Success!

Your app should now be live on Vercel without any 404 errors!

**Test URLs:**
- Homepage: `/`
- Login: `/login`
- Dashboard: `/`
- Sales: `/sales`
- Purchase: `/purchase`

All routes should work perfectly! 🚀

## 📞 Need Help?

**Vercel Docs:**
- https://vercel.com/docs
- https://vercel.com/docs/frameworks/vite

**TanStack Router:**
- https://tanstack.com/router/latest/docs

**Common Issues:**
- Check build logs in Vercel dashboard
- Verify `vercel.json` is in root
- Ensure `npm run build` works locally
- Check output directory is correct

---

**Summary:**
1. ✅ `vercel.json` created
2. ✅ Rewrites configured
3. ✅ Build settings correct
4. ✅ Ready to deploy!

**Next Step:** Push to GitHub and deploy on Vercel! 🚀
