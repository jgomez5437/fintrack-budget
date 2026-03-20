# FinTrack Budget App

FinTrack is a React + Vite budgeting app. It now supports Supabase as the primary backend, with browser `localStorage` as a fallback when Supabase environment variables are missing.

## Deploying To Vercel

This project is configured as a static Vite app for Vercel.

1. Import the repository into Vercel.
2. Keep the framework preset as `Vite`.
3. Use the default install command.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. Add these environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Local Development

This app expects a modern Node.js runtime. The project declares:

- `node >= 20.19.0`

Common commands:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- Copy `.env.example` to `.env.local` and fill in your Supabase values.

## Supabase Setup

1. In the Supabase dashboard, open the SQL editor and run [`supabase/schema.sql`](./supabase/schema.sql).
2. In `Authentication > Providers`, enable anonymous sign-ins.
3. Copy your project URL and anon key into `.env.local` for local development.
4. Add the same values to your Vercel environment variables.

The current implementation uses anonymous Supabase auth so the app can create a secure per-user session without adding a sign-in screen yet.

## Notes

- Imported spreadsheet parsing is loaded dynamically in the browser, which avoids Vite production build issues from source-level remote imports.
- Budget data is stored in the `monthly_budgets` table one record per month and user.
- The `user_preferences` table stores the last selected category for quick-add flows.
- If Supabase variables are not configured, the app falls back to browser `localStorage` so the UI still works.
