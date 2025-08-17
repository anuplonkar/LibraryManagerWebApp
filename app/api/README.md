# Admin Dashboard (Urban Discovery)
This adds a protected **/admin** dashboard with buttons to:
- Create staff user with auto-generated email + password
- Assign role to an existing user (by email or user_id)
- Seed sample books

## Security
Set an environment variable **ADMIN_DASHBOARD_KEY** and provide it in the UI when prompted.
Requests from the UI include `x-admin-key` header; API routes validate it.
> Keep this key secret. Preferably set a long random string.

Also set **SUPABASE_SERVICE_ROLE** (server-only) for the API routes to use.

## Env required
```
ADMIN_DASHBOARD_KEY=your-strong-random-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
*(SUPABASE_URL/ANON for the client; SERVICE_ROLE for server routes only.)*

## Files
- `app/admin/page.tsx` — UI
- `app/api/admin/create-user/route.ts` — Create staff/admin user
- `app/api/admin/assign-role/route.ts` — Assign role
- `app/api/admin/seed-books/route.ts` — Seed books

## Install
Drop these files into your project in the same paths.

## Use
1. Restart dev server (to pick up envs).
2. Open `/admin` in your browser.
3. Enter the **Admin Key** once (stored in localStorage for convenience).
4. Use the forms/buttons.
