<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1XM9qGG9nRuUhWG56dzZHIOjWIGSqgJHC

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy [.env.example](.env.example) to `.env.local` and set:
   - `VITE_SUPABASE_URL` – your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` – your Supabase anon (public) key
   - Optionally `GEMINI_API_KEY` if you use Gemini features
3. Run the app: `npm run dev`

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migrations in [supabase/migrations/](supabase/migrations/) in order (see [supabase/README.md](supabase/README.md)).
3. In **Storage**, create a **public** bucket named `acj-media`.
4. In **Authentication → Providers**, enable **Email**.
5. **Create an admin account:** In Supabase go to **Authentication** → **Users** → **Add user** → **Create new user**. Enter email and password, then **Create user**. Sign in at your app’s **/admin/login** with those credentials. Turn **Auto Confirm User** on so the account works without email verification.
6. Use the project URL and anon key in `.env.local` as above.

## Deploy on Vercel

1. Push the repo to GitHub (or connect your Git provider in Vercel).
2. In Vercel, **Import** the project; set **Framework** to Vite and **Build** to `npm run build` (output `dist`).
3. Add **Environment Variables**:
   - **Client (Vite)**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - **Server (invites endpoint)**:
     - `SUPABASE_URL` (can be the same value as `VITE_SUPABASE_URL`)
     - `SUPABASE_ANON_KEY` (can be the same value as `VITE_SUPABASE_ANON_KEY`)
     - `SUPABASE_SERVICE_ROLE_KEY` (from Supabase **Settings → API**, keep secret)
     - Optional `INVITE_REDIRECT_TO` (e.g. `https://your-domain.com/admin/login`)
4. Deploy. SPA routing is handled by [vercel.json](vercel.json).
