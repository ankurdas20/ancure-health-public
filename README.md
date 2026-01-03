# Ancure Health

A menstrual cycle tracking application built with React, TypeScript, and Supabase.

## Features

- 📅 Cycle tracking and predictions
- 📊 Symptom logging and trends
- 🔐 Secure authentication (Email & Google OAuth)
- 📱 Responsive design for mobile and desktop
- ☁️ Cloud sync across devices

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI
- **Backend:** Supabase (Auth, Database, Storage)
- **Deployment:** Cloudflare Pages

---

## Quick Start

### Prerequisites

- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or bun
- A Supabase project

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd ancure-health
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
# Required - Get these from Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the **Project URL** → `VITE_SUPABASE_URL`
5. Copy the **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Cloudflare Pages deployment instructions.

### Quick Deploy to Cloudflare Pages

1. Push your code to GitHub
2. Connect repository to Cloudflare Pages
3. Set build settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Framework preset:** Vite
4. Add environment variables in Cloudflare Pages settings
5. Deploy!

---

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Feature components
├── contexts/        # React contexts (Auth, etc.)
├── hooks/           # Custom React hooks
├── integrations/    # External service integrations
│   └── supabase/   # Supabase client & types
├── lib/             # Utility functions
├── pages/           # Page components
└── assets/          # Static assets
```

---

## Authentication Setup

### Email Magic Link
Works out of the box with Supabase configuration.

### Google OAuth
1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
2. Add credentials to Supabase → Authentication → Providers → Google
3. Configure authorized origins and redirect URIs

See [Supabase Google Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google) for details.

---

## Development with Lovable

This project is built with [Lovable](https://lovable.dev). You can:

- Edit directly in Lovable's visual editor
- Make changes locally and push to sync
- Use the two-way GitHub sync

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public API key |

> **Note:** Never commit your `.env` file. Use `.env.example` as a template.

---

## Troubleshooting

Having issues? Check out [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for solutions to common problems:
- Environment variables not loading
- 404 errors on routes after deployment
- User data not syncing
- Build failures

---

## License

Private - All rights reserved.
