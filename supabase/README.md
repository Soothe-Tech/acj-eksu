# Supabase setup

1. Create a project at [supabase.com](https://supabase.com) and note **Project URL** and **anon key** (Settings → API).
2. In **SQL Editor**, run in order:
   - `migrations/20250218000001_initial_schema.sql`
   - `migrations/20250218000002_rls_policies.sql`
   - `migrations/20250218100000_journalists_auth_user_id.sql` (links journalists to login accounts)
   - `migrations/20250218100001_create_journalist_function.sql` (optional – adds `create_journalist()` for use in SQL Editor; or use `create-journalist.sql` once)
   - `seed.sql` (optional – sample journalists, articles, and site settings)
3. **Storage bucket (required for image upload):**
   - **Option A – Script:** From the project root, run:
     ```bash
     node scripts/create-bucket.mjs
     ```
     (Requires `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Get the service role key from Supabase **Settings → API**.)
   - **Option B – Dashboard:** In Supabase go to **Storage** → **New bucket** → name: `acj-media`, set **Public** to ON → **Create bucket**.
   - Then run `migrations/20250218000003_storage_policies.sql` in the **SQL Editor** so authenticated users can upload.
4. In **Authentication → Providers**, enable **Email**.
5. **Create an admin account:** In the dashboard go to **Authentication** → **Users** → **Add user** → **Create new user**. Enter an email and password, then click **Create user**. Use this email and password to sign in at `/admin/login` in the app. (You can leave "Auto Confirm User" on so the account works immediately.)
6. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and (for scripts) `SUPABASE_SERVICE_ROLE_KEY`.

## Journalists (who can log in and post)

- **Invite (recommended for clients):** From **Admin → Journalists**, use **Add journalist** to send an invite email. The app calls a Vercel serverless endpoint at `api/invite-journalist.ts` which uses the **service role key** to send the invite and link the journalist.
- **SQL (manual):** Use `supabase/create-journalist.sql` to create a `create_journalist(...)` function you can run in the Supabase SQL Editor to insert journalists.

### Publish permissions
- Only the **Editor in Chief** role can publish posts; others can save drafts and submit for review.
