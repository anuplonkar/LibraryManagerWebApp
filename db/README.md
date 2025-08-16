# Library Management App — Database Migrations

This document tracks the **schema** and all migrations applied to the Supabase database for the Library Management App.  
It serves as the single source of truth for future setup, troubleshooting, and onboarding.

---

## Baseline Schema

- **File:** `schema.sql`
- **Purpose:** Creates the initial database schema.
- **Key objects:**
  - `books` — stores catalog of books.
  - `members` — stores library patrons (auto-generated `member_code`).
  - `loans` — tracks which member has which book and due dates.
  - `app_users` — list of authorized app users who can log in.
- **Constraints/Notes:**
  - `loans.member_id` → `members.id` with `ON DELETE CASCADE`.
  - `copies_available` defaults to `total_copies`.
  - Row Level Security (RLS) is enabled on all tables.

---

## Migration 01 — Auto-generate Member Code

- **File:** `01_member_code_autogen.sql`
- **Purpose:** Ensure `member_code` is automatically assigned.
- **Details:**
  - Added trigger `set_member_code` that runs `before insert` on `members`.
  - Codes are generated as `M-<6-digit-sequence>`.

---

## Migration 02 — Book Defaults and Consistency

- **File:** `02_books_defaults_and_checks.sql`
- **Purpose:** Make book insertions safer and reduce manual input.
- **Changes:**
  - Default: `copies_available = total_copies` if not provided.
  - Added a CHECK constraint to ensure `copies_available <= total_copies`.

---

## Migration 03 — Enable Member Deletion (RLS)

- **File:** `03_enable_member_delete.sql`
- **Purpose:** Allow app users to delete members.
- **Why:** RLS was blocking DELETE by default (only SELECT/INSERT/UPDATE allowed).
- **Policy:** Added a policy `delete_members` that allows authenticated users to delete from `members`.
- **Impact:**  
  - Deleting a member also deletes their loans due to `ON DELETE CASCADE`.  
  - Alternative approach: mark member as `inactive` if history should be preserved.

---

## How to Apply Migrations

1. Log in to Supabase dashboard.
2. Navigate to **SQL → Editor → New query**.
3. Paste the SQL contents of the migration file (in order).
4. Run the query.
5. Confirm changes in **Table Editor**.

---

## Recommended Project Structure

```
/db
  ├── schema.sql
  ├── migrations/
  │     ├── 01_member_code_autogen.sql
  │     ├── 02_books_defaults_and_checks.sql
  │     ├── 03_enable_member_delete.sql
  └── README.md   ← this file
```

---

## Tips

- Always version migrations sequentially (`01_`, `02_`, `03_` …).
- Keep both the `.sql` and a commit message in Git for traceability.
- If you drop/recreate your DB:
  1. Run `schema.sql`.
  2. Apply migrations in sequence.
- Test after each migration by using Supabase Studio or the local app.

