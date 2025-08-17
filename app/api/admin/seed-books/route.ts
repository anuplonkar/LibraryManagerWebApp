// app/api/admin/seed-books/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function okAdmin(req: NextRequest) {
  const hdr = req.headers.get('x-admin-key');
  const key = process.env.ADMIN_DASHBOARD_KEY;
  return !!hdr && !!key && hdr === key;
}

export async function POST(req: NextRequest) {
  if (!okAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return new NextResponse('Server not configured', { status: 500 });

  const admin = createClient(url, serviceKey);

  const BOOKS = [
    { title: "The Pragmatic Programmer", author: "Andrew Hunt; David Thomas", isbn: "9780201616224", tags: ["software","craft"], total_copies: 4 },
    { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", tags: ["software","best-practices"], total_copies: 5 },
    { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", isbn: "9781449373320", tags: ["data","systems"], total_copies: 3 }
  ];
  const rows = BOOKS.map(b => ({ ...b, copies_available: b.total_copies }));

  const { error } = await admin.from('books').insert(rows);
  if (error) return new NextResponse(error.message, { status: 400 });
  return new NextResponse(`Inserted ${rows.length} books`, { status: 200 });
}
