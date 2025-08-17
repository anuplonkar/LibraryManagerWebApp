// app/api/admin/import-members/route.ts
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
    const flat = r.flat_number ? String(r.flat_number).trim() : null;
    const flatOk = !flat || /^[A-Za-z0-9]{1,5}$/.test(flat);
    return {
      full_name: String(r.full_name || "").trim(),
      email: r.email ? String(r.email).trim() : null,
      phone: r.phone ? String(r.phone).trim() : null,
      flat_number: flatOk ? flat : null,
      status: (r.status && String(r.status).trim().toLowerCase() === "inactive") ? "inactive" : "active",
    };
  }).filter(r => r.full_name);

  if (!rows.length) return new NextResponse("No valid rows found", { status: 400 });

  const { error } = await admin.from("members").insert(rows);
  if (error) return new NextResponse(`Insert failed: ${error.message}`, { status: 400 });

  return new NextResponse(`Imported ${rows.length} members`);
}
