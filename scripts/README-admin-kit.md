# Urban Discovery — Admin Scripts & Change Password Page

Place these files into your project:

- `/scripts/create-staff-user.js` (Node)
- `/scripts/assign-roles.ts` (ts-node)
- `/scripts/seed-books.ts` (ts-node)
- `/app/account/change-password/page.tsx` (Next.js page)

## Env vars

Add to `.env.local` (do not commit secrets):

SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

## Install dev deps (for TS scripts)
npm i -D ts-node typescript @types/node

## Run

# Create a staff user (prints email + password)
node scripts/create-staff-user.js "Jane Librarian" staff

# Assign roles
npx ts-node scripts/assign-roles.ts email=jane@urban.local role=admin
# or
npx ts-node scripts/assign-roles.ts user_id=<uuid> role=staff

# Seed books
npx ts-node scripts/seed-books.ts

## Change password
- Link to `/account/change-password` in your nav (only visible when signed in).
- Uses supabase.auth.updateUser with current session.
