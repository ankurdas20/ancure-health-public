# Ancure Health

A privacy-first menstrual cycle tracking application that helps users understand their body's patterns, estimate fertile windows, and log daily symptoms — all while keeping data secure and private.

![Ancure Health](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)

---

## ✨ Features

### Core Tracking
- 📅 **Cycle Predictions** - Accurate period and ovulation date estimates
- 🌸 **Phase Tracking** - Know your current cycle phase (menstrual, follicular, ovulation, luteal)
- 📊 **Symptom Logging** - Daily symptom, mood, and energy tracking
- 📈 **Trend Analysis** - Visualize patterns over time with charts

### User Experience  
- 🔐 **Secure Authentication** - Magic link email and Google OAuth
- ☁️ **Cloud Sync** - Data syncs across all your devices
- 📱 **Responsive Design** - Beautiful on mobile, tablet, and desktop
- 🎨 **Modern UI** - Clean, intuitive interface with smooth animations

### Privacy & Security
- 🔒 **Row Level Security** - Your data is protected at the database level
- 🚫 **No Account Required** - Use guest mode with local storage
- 🛡️ **Privacy-First** - No tracking, no ads, your data stays yours

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18 with TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **UI Components** | shadcn/ui + Radix UI |
| **Animations** | Framer Motion |
| **Backend** | Supabase (Auth, Database) |
| **Charts** | Recharts |
| **Deployment** | Cloudflare Pages |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd ancure-health

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

---

## 📁 Project Structure

```
ancure-health/
├── public/
│   ├── _redirects          # SPA routing for Cloudflare
│   └── favicon.ico
├── src/
│   ├── assets/             # Images and static files
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── CycleRing.tsx   # Cycle visualization
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx # Authentication state
│   ├── hooks/              # Custom React hooks
│   ├── integrations/
│   │   └── supabase/       # Supabase client & types
│   ├── lib/
│   │   ├── cycleCalculations.ts  # Cycle math
│   │   ├── storage.ts            # Data persistence
│   │   └── supabaseHelpers.ts    # Error handling
│   ├── pages/              # Route components
│   ├── App.tsx             # App entry with providers
│   └── main.tsx            # React DOM entry
├── .env.example            # Environment template
├── DEPLOYMENT.md           # Deployment guide
├── TROUBLESHOOTING.md      # Common issues & solutions
├── SECURITY.md             # Security documentation
├── PRE_DEPLOYMENT_CHECKLIST.md
└── README.md
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public API key |

**Important:** 
- Variables must be prefixed with `VITE_` for Vite to expose them
- Never commit your `.env` file (it's in `.gitignore`)
- Use `.env.example` as a template

---

## 🌐 Deployment

### Cloudflare Pages (Recommended)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete step-by-step instructions.

**Quick Deploy:**
1. Push code to GitHub
2. Connect to Cloudflare Pages
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables
5. Deploy!

### Pre-Deployment

Review **[PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)** before going live.

---

## 🔒 Security

This app implements multiple layers of security:

- **Row Level Security (RLS)** on all database tables
- **Authentication** via Supabase Auth
- **Session management** with automatic token refresh
- **Input validation** on all forms
- **Error boundaries** for graceful error handling

See **[SECURITY.md](./SECURITY.md)** for detailed security documentation.

---

## 🐛 Troubleshooting

Having issues? Check **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for solutions to:

- Environment variables not loading
- 404 errors on routes after deployment
- User data not syncing
- Build failures
- Authentication issues

---

## 🤝 Development

### With Lovable

This project is built with [Lovable](https://lovable.dev):
- Edit directly in Lovable's visual editor
- Changes sync automatically to GitHub
- Two-way sync with local development

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Cloudflare Pages deployment guide |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions |
| [SECURITY.md](./SECURITY.md) | Security implementation details |
| [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md) | Pre-launch verification |

---

## ⚖️ License

Private - All rights reserved.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Supabase](https://supabase.com/) for backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
