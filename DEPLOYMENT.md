# Deployment Guide: Firebase Hosting + Supabase Backend

This guide covers deploying your Ancure Health application with:
- **Frontend**: Firebase Hosting (React/Vite app)
- **Backend**: Supabase (via Lovable Cloud - database, auth, storage)

## Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐
│   Firebase Hosting  │────▶│      Supabase       │
│   (React Frontend)  │     │  (Backend/Database) │
└─────────────────────┘     └─────────────────────┘
         │                           │
         │ Serves static files       │ Handles:
         │ (HTML, JS, CSS)           │ - Authentication
         │                           │ - Database (PostgreSQL)
         │                           │ - File Storage
         │                           │ - Edge Functions
         └───────────────────────────┘
```

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Firebase CLI**: `npm install -g firebase-tools`
3. **Firebase Account**: [console.firebase.google.com](https://console.firebase.google.com)
4. **Supabase Project**: Already connected via Lovable Cloud

---

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

## Step 3: Initialize Firebase in Your Project

Run this from your project root:

```bash
firebase init hosting
```

When prompted:
- **Project**: Select or create a Firebase project
- **Public directory**: `dist` (Vite build output)
- **Single-page app**: `Yes`
- **GitHub Actions**: `No` (optional - can set up later)
- **Overwrite index.html**: `No`

## Step 4: Firebase Configuration

The `firebase.json` file is already configured in this project:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      {
        "source": "**/*.@(js|css|jpg|jpeg|gif|png|svg|webp|woff2)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      }
    ]
  }
}
```

## Step 5: Create `.firebaserc`

Create this file with your Firebase project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

Replace `your-firebase-project-id` with your actual Firebase project ID.

## Step 6: Build and Deploy

```bash
# Build the production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your app will be available at: `https://your-project-id.web.app`

---

## Environment Variables

### For Local Development

The `.env` file is already configured with Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

### For Production Build

These variables are embedded at build time. Ensure they're set before running `npm run build`.

**Option A: Use `.env` file** (already configured - recommended)

**Option B: Set in CI/CD environment**
```bash
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
npm run build
```

---

## Configure Supabase Authentication

### Update Redirect URLs

In Lovable Cloud backend settings, add your Firebase domains:

1. Open your backend settings
2. Navigate to Authentication → URL Configuration
3. Add these URLs:
   - `https://your-project-id.web.app`
   - `https://your-project-id.firebaseapp.com`
   - `https://your-custom-domain.com` (if using)

### Google OAuth Setup

If using Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Add authorized JavaScript origins:
   - `https://your-project-id.web.app`
   - `https://your-project-id.firebaseapp.com`

---

## Custom Domain (Optional)

### In Firebase Console:

1. Go to Hosting → Add custom domain
2. Enter your domain (e.g., `app.ancure.in`)
3. Follow DNS verification steps
4. Add provided DNS records to your domain registrar

### Update Supabase:

Remember to add your custom domain to Supabase redirect URLs.

---

## Continuous Deployment with GitHub Actions

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-firebase-project-id
```

### Setup GitHub Secrets:

1. Go to your GitHub repo → Settings → Secrets
2. Add these secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `FIREBASE_SERVICE_ACCOUNT` (JSON key from Firebase)

---

## Troubleshooting

### Build Errors

**"Missing environment variables"**
- Ensure `.env` file exists with Supabase credentials
- Or set environment variables before build

### 404 Errors on Routes

- Ensure `firebase.json` has the SPA rewrite rule
- All routes should redirect to `/index.html`

### Authentication Not Working

1. Check redirect URLs in Supabase auth settings
2. Verify Google OAuth origins include Firebase domains
3. Check browser console for CORS errors

### Slow Initial Load

- Caching headers are configured in `firebase.json`
- Consider using Firebase's CDN features

---

## Quick Deploy Commands

```bash
# One-time setup
npm install -g firebase-tools
firebase login
firebase init hosting  # Select existing project, use 'dist' as public dir

# Every deployment
npm run build
firebase deploy --only hosting
```

---

## Quick Deploy Checklist

- [ ] Firebase CLI installed and logged in
- [ ] `firebase.json` configured (already done)
- [ ] `.firebaserc` with your project ID
- [ ] `.env` has Supabase credentials
- [ ] `npm run build` succeeds
- [ ] Supabase redirect URLs updated
- [ ] Google OAuth origins updated (if using)
- [ ] `firebase deploy --only hosting` succeeds
- [ ] Test authentication on deployed site
- [ ] Test all features (blogs, tracking, etc.)

---

## Support Resources

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Vite + Firebase Guide](https://vitejs.dev/guide/static-deploy.html#google-firebase)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
