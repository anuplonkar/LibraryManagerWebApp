# Library Lite (Next.js + Supabase)

This repository contains the exact starter the assistant shared earlier (frozen).

## Quick start
1. Create a Supabase project.
2. Open **SQL Editor** and run `schema.sql` from this repo.
3. Copy `.env.example` to `.env.local` and fill the two values from Supabase → Settings → API.
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```
5. Deploy to Vercel and set the same environment variables there.

### Sign-in URL
- Local: `http://localhost:3000/auth`
- Production: `https://<your-vercel-domain>/auth`
