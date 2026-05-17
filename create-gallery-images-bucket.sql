-- Create gallery-images bucket and policies

-- Create bucket if not exists
insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do update set public = true;

-- Drop old policies if they exist
drop policy if exists "Public read gallery images" on storage.objects;
drop policy if exists "Admins upload gallery images" on storage.objects;
drop policy if exists "Admins delete gallery images" on storage.objects;
drop policy if exists "Admins update gallery images" on storage.objects;

-- Recreate clean storage policies
create policy "Public read gallery images" on storage.objects
  for select using (bucket_id = 'gallery-images');

create policy "Admins upload gallery images" on storage.objects
  for insert with check (
    bucket_id = 'gallery-images'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins delete gallery images" on storage.objects
  for delete using (
    bucket_id = 'gallery-images'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins update gallery images" on storage.objects
  for update using (
    bucket_id = 'gallery-images'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );