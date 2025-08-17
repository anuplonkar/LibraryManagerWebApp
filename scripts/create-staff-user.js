// scripts/create-staff-user.js
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE env vars.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

function randomPassword(len = 14) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

const fullName = process.argv[2] || 'New Staff';
const role = process.argv[3] || 'staff';
const email = `staff-${Date.now()}@urban.local`;
const password = randomPassword();

(async () => {
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role }
  });
  if (error) { console.error("Auth createUser error:", error); process.exit(1); }
  const userId = created.user.id;

  const { error: linkErr } = await admin.from('app_users').insert({
    user_id: userId, full_name: fullName, role
  });
  if (linkErr) { console.error("Insert app_users error:", linkErr); process.exit(1); }

  console.log("✅ Created staff user");
  console.log({ email, password, userId, fullName, role });
})();
