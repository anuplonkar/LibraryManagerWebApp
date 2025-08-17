// app/api/admin/import-books/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

function okAdmin(req: NextRequest) {
  const hdr = (req.headers.get("x-admin-key") || "").trim();
  const key = (process.env.ADMIN_DASHBOARD_KEY || "").trim();
  return Boolean(hdr && key && hdr === key);
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!okAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return new NextResponse("No file uploaded", { status: 400 });

  const text = await file.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
  if (parsed.errors?.length) {
    return NextResponse.json({ message: "CSV parse error", errors: parsed.errors }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return new NextResponse("Server not configured", { status: 500 });
  const admin = createClient(url, serviceKey);

  const rows = (parsed.data as any[]).map((r) => {
    const tags = typeof r.tags === "string"
      ? r.tags.split(",").map((s:string)=>s.trim()).filter(Boolean)
      : Array.isArray(r.tags) ? r.tags : [];
    const total = Number(r.total_copies) || 1;
    const copies = Number(r.copies_available ?? total);
    return {
      title: String(r.title || "").trim(),
      author: r.author ? String(r.author).trim() : null,
      isbn: r.isbn ? String(r.isbn).trim() : null,
      tags,
      total_copies: total,
      copies_available: copies,
    };
  }).filter(r => r.title);

  if (!rows.length) return new NextResponse("No valid rows found", { status: 400 });

  const { error } = await admin.from("books").insert(rows);
  if (error) return new NextResponse(`Insert failed: ${error.message}`, { status: 400 });

  return new NextResponse(`Imported ${rows.length} books`);
}
