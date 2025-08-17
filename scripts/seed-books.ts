// scripts/seed-books.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) { console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE env vars."); process.exit(1); }
const admin = createClient(url, serviceKey);

const BOOKS = [
  { title: "The Pragmatic Programmer", author: "Andrew Hunt; David Thomas", isbn: "9780201616224", tags: ["software","craft"], total_copies: 4 },
  { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", tags: ["software","best-practices"], total_copies: 5 },
  { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", isbn: "9781449373320", tags: ["data","systems"], total_copies: 3 }
];

(async () => {
  const rows = BOOKS.map(b => ({ ...b, copies_available: b.total_copies }));
  const { error } = await admin.from('books').insert(rows);
  if (error) { console.error("Insert books error:", error); process.exit(1); }
  console.log(`✅ Inserted ${rows.length} books`);
})();
