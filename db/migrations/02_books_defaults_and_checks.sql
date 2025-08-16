-- Default copies_available to total_copies on INSERT and keep counts valid
create or replace function books_default_and_clamp()
returns trigger as $$
begin
  if new.copies_available is null then
    new.copies_available := new.total_copies;
  end if;

  if new.copies_available < 0 then
    new.copies_available := 0;
  end if;
  if new.copies_available > new.total_copies then
    new.copies_available := new.total_copies;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_books_default_and_clamp on public.books;
create trigger trg_books_default_and_clamp
before insert on public.books
for each row
execute function books_default_and_clamp();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'books_copies_le_total'
      and conrelid = 'public.books'::regclass
  ) then
    alter table public.books
      add constraint books_copies_le_total
      check (copies_available <= total_copies)
      not valid;
    alter table public.books validate constraint books_copies_le_total;
  end if;
end $$;
