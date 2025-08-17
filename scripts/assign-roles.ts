// scripts/assign-roles.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) { console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE env vars."); process.exit(1); }
const admin = createClient(url, serviceKey);

const arg = Object.fromEntries(process.argv.slice(2).map(p => p.split('=')));
const role = arg.role;
const user_id = arg.user_id;
const email = arg.email;

if (!role || (!user_id && !email)) {
  console.log("Usage: npx ts-node scripts/assign-roles.ts user_id=<uuid>|email=<email> role=<admin|staff>");
  process.exit(1);
}

(async () => {
  let id = user_id;
  if (!id && email) {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) { console.error("Auth listUsers error:", error); process.exit(1); }
    const user = data.users.find(u => u.email === email);
    if (!user) { console.error("No auth user found with email", email); process.exit(1); }
    id = user.id;
  }

  const { error } = await admin.from('app_users').update({ role }).eq('user_id', id);
  if (error) { console.error("Update role error:", error); process.exit(1); }
  console.log("✅ Updated role", { user_id: id, role });
})();
