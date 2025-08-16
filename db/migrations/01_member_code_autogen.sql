-- Auto-generate member_code like M-01000
create sequence if not exists member_code_seq start 1000;

create or replace function gen_member_code()
returns trigger as $$
begin
  if new.member_code is null or length(trim(new.member_code)) = 0 then
    new.member_code := 'M-' || to_char(nextval('member_code_seq'), 'FM00000');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_gen_member_code on public.members;
create trigger trg_gen_member_code
before insert on public.members
for each row
execute function gen_member_code();
