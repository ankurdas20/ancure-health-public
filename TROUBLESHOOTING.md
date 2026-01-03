# Troubleshooting Guide

This guide covers common issues you might encounter when developing or deploying Ancure Health.

---

## Table of Contents

1. ["Supabase is not defined" error](#supabase-is-not-defined-error)
2. [User data not syncing](#user-data-not-syncing)
3. [404 errors on routes](#404-errors-on-routes)
4. [Build fails](#build-fails)
5. [Environment variables not loading](#environment-variables-not-loading)
6. [Authentication issues](#authentication-issues)
7. [Google OAuth not working](#google-oauth-not-working)

---

## "Supabase is not defined" error

### Symptoms
- Console error: `ReferenceError: supabase is not defined`
- App crashes on load or when accessing authenticated features

### Causes & Solutions

**1. Missing environment variables**
```bash
# Check your .env file has these variables:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**2. Import not using the correct path**
```typescript
// ❌ Wrong
import { supabase } from './supabase';

// ✅ Correct
import { supabase } from '@/integrations/supabase/client';
```

**3. Environment variables not prefixed correctly**
```bash
# ❌ Wrong - won't be exposed to client
SUPABASE_URL=...

# ✅ Correct - VITE_ prefix required
VITE_SUPABASE_URL=...
```

---

## User data not syncing

### Symptoms
- Data saved locally but not appearing when signed in on another device
- Changes not persisting after refresh (for authenticated users)

### Causes & Solutions

**1. User not signed in**
- Check that the user is authenticated before attempting cloud sync
- Look for the connection indicator in the app header

**2. RLS policies blocking access**
- All tables require `user_id = auth.uid()` for access
- Ensure the user_id field is being set correctly in inserts

**3. Network issues**
- Check browser console for failed network requests
- Verify Supabase project is running and accessible

**4. Session expired**
- Sign out and sign back in
- Clear browser storage and re-authenticate

**Debug steps:**
1. Open browser DevTools → Network tab
2. Look for failed requests to `supabase.co`
3. Check the response body for error details

---

## 404 errors on routes

### Symptoms
- Direct URL access returns 404 (e.g., `/track`, `/auth`)
- Works fine when navigating within the app
- Happens only in production/deployed version

### Causes & Solutions

**1. Missing SPA redirect configuration**

For **Cloudflare Pages**, ensure `public/_redirects` exists:
```
/*    /index.html   200
```

For **Netlify**, use `public/_redirects`:
```
/*    /index.html   200
```

For **Vercel**, use `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**2. Redirect file not in build output**
- Verify `_redirects` is in the `public/` folder
- After build, check that `dist/_redirects` exists

---

## Build fails

### Symptoms
- `npm run build` exits with errors
- TypeScript or ESLint errors preventing build

### Common Causes & Solutions

**1. TypeScript errors**
```bash
# Run type check to see all errors
npx tsc --noEmit
```

**2. Missing dependencies**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. Import path issues**
```typescript
// ❌ Wrong - relative path might break
import { Button } from '../../components/ui/button';

// ✅ Correct - use path alias
import { Button } from '@/components/ui/button';
```

**4. Circular dependencies**
- Look for files that import each other
- Extract shared code to a separate module

**5. Out of memory**
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

---

## Environment variables not loading

### Symptoms
- `import.meta.env.VITE_SUPABASE_URL` is `undefined`
- Error: "Missing VITE_SUPABASE_URL environment variable"

### Causes & Solutions

**1. Missing `.env` file**
```bash
# Copy from example and fill in values
cp .env.example .env
```

**2. Wrong variable prefix**
```bash
# Only VITE_ prefixed variables are exposed to the client
VITE_SUPABASE_URL=...  # ✅ Accessible
SUPABASE_URL=...       # ❌ Not accessible in browser
```

**3. Need to restart dev server**
```bash
# After changing .env, restart the dev server
npm run dev
```

**4. Cloudflare Pages not configured**
- Go to Cloudflare Pages → Settings → Environment Variables
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Redeploy after adding variables

**5. Using `process.env` instead of `import.meta.env`**
```typescript
// ❌ Wrong - Node.js syntax, doesn't work in Vite
const url = process.env.SUPABASE_URL;

// ✅ Correct - Vite syntax
const url = import.meta.env.VITE_SUPABASE_URL;
```

---

## Authentication issues

### Symptoms
- Login doesn't work
- Session not persisting
- Redirect loops

### Causes & Solutions

**1. Site URL not configured**
- In Supabase Dashboard → Authentication → URL Configuration
- Set Site URL to your deployed URL (e.g., `https://your-app.pages.dev`)

**2. Redirect URLs not whitelisted**
- Add your app URLs to "Redirect URLs" in Supabase Auth settings:
  - `https://your-app.pages.dev`
  - `https://your-app.pages.dev/*`
  - `http://localhost:8080` (for development)

**3. "requested path is invalid" error**
- This means the redirect URL isn't in the whitelist
- Add the exact URL being used for redirects

**4. Session not persisting**
- Check that localStorage is not blocked
- Verify the Supabase client has `persistSession: true`

---

## Google OAuth not working

### Symptoms
- "provider is not enabled" error
- Google button does nothing or shows error

### Causes & Solutions

**1. Provider not enabled in Supabase**
- Go to Supabase Dashboard → Authentication → Providers
- Enable Google and add Client ID + Secret

**2. Google Cloud Console not configured**
- Create OAuth 2.0 credentials in Google Cloud Console
- Add authorized JavaScript origins (your app URL)
- Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

**3. Callback URL mismatch**
- Ensure the callback URL in Google Console matches Supabase exactly

---

## Still having issues?

1. **Check the browser console** for error messages
2. **Check the Network tab** for failed requests
3. **Verify environment variables** are set correctly
4. **Test locally first** before deploying
5. **Review recent changes** that might have introduced the bug

For more help, consult:
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
