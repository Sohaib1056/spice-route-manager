# 🚀 Quick Start Guide - Vercel Deployment

## Sabse Aasan Tarika (5 Minutes)

### Step 1: Vercel CLI Install Karein
```bash
npm install -g vercel
```

### Step 2: Vercel Login
```bash
vercel login
```
- Apna email enter karein
- Email check karein aur verify karein

### Step 3: Project Folder Mein Jayen
```bash
cd Dryfruitwebsite
```

### Step 4: Deploy Karein
```bash
vercel
```

First time ye questions puchega:
- **"Set up and deploy?"** → Type `Y` aur Enter
- **"Which scope?"** → Apna account select karein (arrow keys se)
- **"Link to existing project?"** → Type `N` aur Enter
- **"What's your project's name?"** → `dryfruit-pro` (ya jo naam chahiye)
- **"In which directory is your code located?"** → Just Enter press karein

### Step 5: Production Deploy
```bash
vercel --prod
```

## ✅ Done!

Aapko ek URL milega jaise:
```
https://dryfruit-pro.vercel.app
```

## 🎯 Alternative: GitHub Method

### 1. GitHub Repository Banao
```bash
git init
git add .
git commit -m "DryFruit Pro - Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Vercel Dashboard
1. https://vercel.com par jao
2. "New Project" click karo
3. GitHub repository import karo
4. "Deploy" click karo

## 📝 Important Commands

```bash
# Development server
npm run dev

# Production build test
npm run build
npm run preview

# Deploy to preview
npm run deploy:preview

# Deploy to production
npm run deploy
```

## 🔥 Pro Tips

1. **Pehli baar deploy kar rahe ho?**
   - Vercel CLI method use karo (sabse aasan)

2. **Team ke saath kaam kar rahe ho?**
   - GitHub method use karo (automatic deployments)

3. **Quick updates?**
   - Code change karo
   - `git push` karo
   - Automatic deploy ho jayega (agar GitHub connected hai)

## ❓ Help Needed?

Detailed guide ke liye `DEPLOYMENT.md` file dekho.

---

**Happy Coding! 🎉**
