// app/api/admin/create-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function okAdmin(req: NextRequest) {
  const hdr = req.headers.get('x-admin-key');
  const key = process.env.ADMIN_DASHBOARD_KEY;

  //console.log("🔑 Incoming header x-admin-key:", hdr);
  //console.log("🔐 Server env ADMIN_DASHBOARD_KEY:", key);

  return !!hdr && !!key && hdr === key;
}


function randomPassword(len = 14) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function POST(req: NextRequest) {
  if (!okAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json().catch(()=>({}));
  const fullName: string = body.fullName || 'New Staff';
  const role: string = body.role || 'staff';

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return new NextResponse('Server not configured', { status: 500 });

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const email = `staff-${Date.now()}@urban.local`;
  const password = randomPassword();

  const { data: created, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: fullName, role }
  });
  if (error) return new NextResponse(error.message, { status: 400 });

  const userId = created.user.id;
  const { error: linkErr } = await admin.from('app_users').insert({ user_id: userId, full_name: fullName, role });
  if (linkErr) return new NextResponse(linkErr.message, { status: 400 });

  return NextResponse.json({ email, password, userId, fullName, role });
}
