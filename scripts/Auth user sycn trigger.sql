create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, null, 'user');
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();
