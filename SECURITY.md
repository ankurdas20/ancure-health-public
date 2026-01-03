# Security & Authentication Summary

This document outlines the security measures implemented in the Ancure Health application.

## Authentication

### Supported Methods
- **Email Magic Link** - Passwordless authentication via email
- **Google OAuth** - Social login with Google

### Implementation Details
- Authentication state is managed via `AuthContext` with proper session persistence
- Auth listener is set up **before** checking existing session (prevents race conditions)
- Profile data is fetched with `setTimeout(0)` to prevent Supabase deadlocks
- Subscription cleanup is properly handled to prevent memory leaks

### Session Persistence
- Sessions are stored in `localStorage` and persist across page refreshes
- Auto token refresh is enabled
- `onAuthStateChange` listener reacts to all auth events

## Row Level Security (RLS)

All user data tables have RLS enabled with proper policies:

### `profiles` Table
| Operation | Policy |
|-----------|--------|
| SELECT | Users can view their own profile (`auth.uid() = user_id`) |
| INSERT | Users can create their own profile (`auth.uid() = user_id`) |
| UPDATE | Users can update their own profile (`auth.uid() = user_id`) |

### `cycle_data` Table
| Operation | Policy |
|-----------|--------|
| SELECT | Users can view their own data (`auth.uid() = user_id`) |
| INSERT | Users can create their own data (`auth.uid() = user_id`) |
| UPDATE | Users can update their own data (`auth.uid() = user_id`) |
| DELETE | Users can delete their own data (`auth.uid() = user_id`) |

### `period_logs` Table
| Operation | Policy |
|-----------|--------|
| SELECT | Users can view their own logs (`auth.uid() = user_id`) |
| INSERT | Users can create their own logs (`auth.uid() = user_id`) |
| UPDATE | Users can update their own logs (`auth.uid() = user_id`) |
| DELETE | Users can delete their own logs (`auth.uid() = user_id`) |

### `symptom_logs` Table
| Operation | Policy |
|-----------|--------|
| SELECT | Users can view their own logs (`auth.uid() = user_id`) |
| INSERT | Users can create their own logs (`auth.uid() = user_id`) |
| UPDATE | Users can update their own logs (`auth.uid() = user_id`) |
| DELETE | Users can delete their own logs (`auth.uid() = user_id`) |

## Protected Routes

The `ProtectedRoute` component:
- Initializes auth when accessing protected pages
- Shows loading spinner while checking authentication
- Redirects to `/auth` if user is not logged in
- Preserves the intended destination for post-login redirect

## Environment Variables

All sensitive configuration is stored in environment variables:

| Variable | Purpose | Security |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Backend URL | Public (safe to expose) |
| `VITE_SUPABASE_ANON_KEY` | API key | Public (RLS protects data) |

The anon key is designed to be public - RLS policies protect all user data.

## Security Checklist

- [x] RLS enabled on all user data tables
- [x] Policies check `auth.uid() = user_id` for all operations
- [x] No hardcoded API keys or URLs in source code
- [x] Environment variables used for configuration
- [x] Error handling for missing environment variables
- [x] Session persistence with auto-refresh
- [x] Protected routes redirect unauthenticated users
- [x] Email validation on login form
- [x] Profile auto-created on first sign-up via database trigger
- [x] SPA redirect rules for Cloudflare Pages

## Database Trigger

A trigger automatically creates a profile when a new user signs up:

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$;
```

## Known Limitations

1. **Google OAuth** - Requires configuration in Lovable Cloud dashboard (Users → Auth Settings → Google Settings)
2. **Leaked Password Protection** - Warning shown but not applicable since we use passwordless auth
