# FinTrack Budget App

FinTrack is a React + Vite budgeting app that runs fully in the browser.

## Deploying To Vercel

This project is configured as a static Vite app for Vercel.

1. Import the repository into Vercel.
2. Keep the framework preset as `Vite`.
3. Use the default install command.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.

The app now uses browser `localStorage` automatically when `window.storage` is not available, so it works in normal web deployments without any custom host runtime.

## Local Development

This app expects a modern Node.js runtime. The project declares:

- `node >= 20.19.0`

Common commands:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Notes

- Imported spreadsheet parsing is loaded dynamically in the browser, which avoids Vite production build issues from source-level remote imports.
- Budget data is stored per month in the browser, so each user keeps their own local copy unless you connect a backend.

## Backend Recommendation

If you want to add a backend to this Vite app, use Supabase first.

Why it fits this app well:

- It works cleanly with a client-rendered React app.
- You get Postgres, auth, and row-level security together.
- It is an easy next step if you want accounts, syncing across devices, or shared household budgets.

If you only need a few server endpoints and no database yet, Vercel Functions are a good lightweight option. If you want persistent user data, Supabase is the stronger default.
