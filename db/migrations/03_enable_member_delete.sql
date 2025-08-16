-- 03_enable_member_delete.sql
-- Purpose: Allow authenticated app users to DELETE rows from public.members.
-- Why: RLS was enabled, but there was no DELETE policy, so deletes were blocked.

alter table public.members enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'members' and policyname = 'delete_members'
  ) then
    create policy "delete_members" on public.members
      for delete
      using (auth.role() = 'authenticated');
  end if;
end $$;

-- Note: loans.member_id references members(id) ON DELETE CASCADE (from your base schema),
-- so deleting a member will also delete their loans automatically.
-- If you prefer not to lose history, consider using a soft delete: set status='inactive' instead of deleting.
