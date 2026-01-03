# Deploying Ancure Health to Cloudflare Pages

This guide covers deploying the Ancure Health app to Cloudflare Pages with Supabase backend.

## Prerequisites

- A [Cloudflare](https://cloudflare.com) account
- A [Supabase](https://supabase.com) project (already configured)
- Your repository pushed to GitHub

---

## Step 1: Connect to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → **Create application** → **Pages**
3. Click **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select the **ancure-health** repository
6. Click **Begin setup**

---

## Step 2: Configure Build Settings

Use these exact settings:

| Setting | Value |
|---------|-------|
| **Project name** | `ancure-health` (or your preferred name) |
| **Production branch** | `main` |
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave empty) |

---

## Step 3: Set Environment Variables

**CRITICAL:** You must set these environment variables before the first build.

In Cloudflare Pages:
1. Go to **Settings** → **Environment variables**
2. Add these variables for **Production** (and optionally **Preview**):

| Variable Name | Description | Where to Find |
|---------------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | Supabase Dashboard → Settings → API |

**Example values:**
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Important:** Use the `anon` key, NOT the `service_role` key. The anon key is safe for frontend use.

---

## Step 4: Configure Supabase Authentication

For authentication to work, you must configure redirect URLs in Supabase:

### 4.1 Set Site URL

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Cloudflare Pages URL:
   ```
   https://your-project.pages.dev
   ```

### 4.2 Add Redirect URLs

Add these URLs to **Redirect URLs**:
```
https://your-project.pages.dev
https://your-project.pages.dev/auth
https://your-project.pages.dev/*
```

If you have a custom domain, add those URLs too:
```
https://yourdomain.com
https://yourdomain.com/auth
https://yourdomain.com/*
```

### 4.3 Configure Google OAuth (if using)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-project.pages.dev
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

---

## Step 5: Deploy

1. Click **Save and Deploy** in Cloudflare Pages
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be live at `https://your-project.pages.dev`

---

## Step 6: Custom Domain (Optional)

1. In Cloudflare Pages, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow the DNS configuration steps
5. **Don't forget** to add the custom domain to Supabase redirect URLs!

---

## Troubleshooting

### "requested path is invalid" error on login

This means your redirect URLs aren't configured correctly in Supabase:
- Check that your Cloudflare Pages URL is in Supabase → Authentication → URL Configuration
- Make sure Site URL matches your deployed URL exactly

### Blank page after deployment

- Check that environment variables are set in Cloudflare Pages
- Open browser DevTools console for error messages
- Verify the build completed successfully in Cloudflare Pages deploy logs

### Google login not working

- Verify Google OAuth is enabled in Supabase → Authentication → Providers
- Check that Cloudflare Pages URL is in Google Cloud Console authorized origins
- Ensure the Supabase callback URL is in Google's authorized redirect URIs

### Routes returning 404

The `_redirects` file in `public/` should handle SPA routing. If you still get 404s:
- Verify `public/_redirects` contains: `/*    /index.html   200`
- Check that `dist/_redirects` exists after build

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous API key |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ❌ No | Alternative name for anon key |

---

## Automatic Deployments

Once connected, Cloudflare Pages will automatically:
- Deploy when you push to the `main` branch
- Create preview deployments for pull requests
- Provide unique URLs for each deployment

---

## Support

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#cloudflare-pages)
