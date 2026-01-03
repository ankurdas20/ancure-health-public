# Pre-Deployment Checklist

Use this checklist before deploying Ancure Health to production.

---

## ✅ Environment & Configuration

- [x] All environment variables use `VITE_` prefix
- [x] `.env.example` is complete with all required variables
- [x] No hardcoded API keys or URLs in source code
- [x] `public/_redirects` file exists for SPA routing
- [x] `vite.config.ts` uses correct build output (`dist`)

## ✅ Security

- [x] RLS (Row Level Security) enabled on all user data tables:
  - [x] `profiles` - SELECT, INSERT, UPDATE policies
  - [x] `cycle_data` - SELECT, INSERT, UPDATE, DELETE policies
  - [x] `period_logs` - SELECT, INSERT, UPDATE, DELETE policies
  - [x] `symptom_logs` - SELECT, INSERT, UPDATE, DELETE policies
- [x] All RLS policies check `auth.uid() = user_id`
- [x] Supabase client uses environment variables
- [x] Error messages don't expose sensitive information in production
- [x] No console.log statements with sensitive data

## ✅ Authentication

- [x] Magic Link email authentication works
- [x] Google OAuth configured (requires backend setup)
- [x] Session persistence across page refreshes
- [x] Auth state listener properly set up
- [x] Protected routes redirect unauthenticated users
- [x] Logout clears all user state
- [x] Email redirect URLs configured correctly

## ✅ Error Handling

- [x] React Error Boundary wraps entire app
- [x] User-friendly error messages (not raw errors)
- [x] Network error detection and messaging
- [x] Session expiry handling
- [x] Form validation with clear error display
- [x] Try-catch blocks on all async operations

## ✅ User Experience

- [x] Loading spinners for all data fetching
- [x] Connection status indicator for authenticated users
- [x] Responsive design (mobile, tablet, desktop)
- [x] All navigation uses React Router (no page reloads)
- [x] Toast notifications for user feedback
- [x] Graceful degradation when offline

## ✅ Code Quality

- [x] No TODO/FIXME comments in production code
- [x] JSDoc comments on key functions
- [x] TypeScript types defined for all data structures
- [x] Components properly memoized for performance
- [x] Code splitting with React.lazy for pages
- [x] No ESLint errors (run `npm run lint`)

## ✅ Documentation

- [x] README.md with setup instructions
- [x] DEPLOYMENT.md with step-by-step deployment guide
- [x] TROUBLESHOOTING.md with common issues and solutions
- [x] SECURITY.md with security implementation details
- [x] .env.example with all required variables documented

## ✅ Build & Deploy

- [x] `npm install` completes without errors
- [x] `npm run build` completes successfully
- [x] `npm run preview` serves the production build
- [x] Build output in `dist/` folder
- [x] `dist/_redirects` exists after build

---

## Pre-Deployment Testing Checklist

### Local Development Testing

```bash
# 1. Fresh install
rm -rf node_modules
npm install

# 2. Create .env from example
cp .env.example .env
# Add your Supabase credentials to .env

# 3. Run development server
npm run dev
# Test all features at http://localhost:8080

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
# Test all features at http://localhost:4173
```

### Feature Testing Matrix

| Feature | Guest | Logged In | Status |
|---------|-------|-----------|--------|
| Landing page loads | ✅ | ✅ | Works |
| Navigate to /track | ✅ | ✅ | Works |
| Submit cycle form | ✅ | ✅ | Works |
| View dashboard | ✅ | ✅ | Works |
| Log period (local only) | ✅ | N/A | Works |
| Log period (cloud sync) | N/A | ✅ | Works |
| Navigate to /auth | ✅ | Redirects | Works |
| Magic link login | ✅ | N/A | Works |
| Google OAuth login | ✅ | N/A | Requires config |
| View cycle history | ❌ (locked) | ✅ | Works |
| Log symptoms | ❌ (locked) | ✅ | Works |
| View symptom trends | ❌ (locked) | ✅ | Works |
| Logout | N/A | ✅ | Works |
| Data persists refresh | ✅ (local) | ✅ (cloud) | Works |
| 404 page | ✅ | ✅ | Works |

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Testing

- [ ] Mobile (375px width)
- [ ] Tablet (768px width)
- [ ] Desktop (1280px+ width)

---

## Cloudflare Pages Configuration

### Environment Variables to Add

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://ttjjiunzikmxqeakekqp.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` (your anon key) |

### Build Settings

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Framework preset | `Vite` |

---

## Supabase Configuration

### Authentication URLs to Configure

**Site URL:**
```
https://your-app.pages.dev
```

**Redirect URLs:**
```
https://your-app.pages.dev
https://your-app.pages.dev/*
https://your-app.pages.dev/auth
http://localhost:8080 (for development)
```

### Google OAuth (if using)

1. Enable in Supabase: Authentication → Providers → Google
2. Add Client ID and Secret from Google Cloud Console
3. Configure Google Cloud Console:
   - Authorized JavaScript origins: `https://your-app.pages.dev`
   - Authorized redirect URIs: `https://ttjjiunzikmxqeakekqp.supabase.co/auth/v1/callback`

---

## Post-Deployment Verification

After deploying, verify:

1. [ ] App loads at production URL
2. [ ] All routes work (no 404s on direct access)
3. [ ] Magic link authentication works
4. [ ] Data saves and syncs correctly
5. [ ] Error pages display correctly
6. [ ] SSL certificate is active (https://)

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
| Product Owner | | | |

---

**Deployment Approved:** [ ] Yes [ ] No

**Notes:**
