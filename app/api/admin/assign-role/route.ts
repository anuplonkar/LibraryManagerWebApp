// app/api/admin/assign-role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function okAdmin(req: NextRequest) {
  const hdr = req.headers.get('x-admin-key');
  const key = process.env.ADMIN_DASHBOARD_KEY;
  return !!hdr && !!key && hdr === key;
}

export async function POST(req: NextRequest) {
  if (!okAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json().catch(()=>({}));
  const role: string = body.role;
  const email: string | undefined = body.email;
  const user_id: string | undefined = body.user_id;

  if (!role || (!email && !user_id)) return new NextResponse('Provide role and email or user_id', { status: 400 });

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return new NextResponse('Server not configured', { status: 500 });

  const admin = createClient(url, serviceKey);

  let id = user_id;
  if (!id && email) {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) return new NextResponse(error.message, { status: 400 });
    const user = data.users.find(u => u.email === email);
    if (!user) return new NextResponse('No auth user found with that email', { status: 404 });
    id = user.id;
  }

  const { error } = await admin.from('app_users').update({ role }).eq('user_id', id!);
  if (error) return new NextResponse(error.message, { status: 400 });
  return new NextResponse('OK', { status: 200 });
}
