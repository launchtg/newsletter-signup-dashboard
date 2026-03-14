# 🚀 Deploy to Vercel

## Quick Deploy (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
(Follow the email confirmation link)

### Step 3: Deploy
```bash
cd /root/.openclaw/workspace/dashboard
vercel --prod
```

That's it! Vercel will give you a live URL like:
```
https://newsletter-dashboard-xxxxx.vercel.app
```

---

## Alternative: Deploy via GitHub

1. Push this folder to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repo
5. Deploy!

---

## Files Deployed

- `index.html` - Dashboard UI (dark theme, lime green)
- `api/newsletters.js` - Get/save newsletter data
- `api/start-automation.js` - Trigger automation
- `vercel.json` - Vercel configuration
- `package.json` - Dependencies

---

## After Deployment

Your dashboard will be live at a public URL!

**Features:**
- ✅ Upload 36k newsletter CSV
- ✅ Real-time status tracking
- ✅ One-click manual signup
- ✅ Glaido-style dark theme
- ✅ Auto-refresh every 5 seconds

---

## Local Testing

```bash
cd /root/.openclaw/workspace/dashboard
vercel dev
```

Opens at http://localhost:3000

---

## Configuration

The dashboard connects back to this VPS for:
- Reading signup logs
- Starting automation workers
- Storing newsletter data

Make sure the VPS IP is accessible or configure environment variables in Vercel dashboard.
