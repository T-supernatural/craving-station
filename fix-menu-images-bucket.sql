-- Fix menu-images bucket and policies

-- Create bucket if not exists
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

-- Drop old broken policies
drop policy if exists "Public can view menu images" on storage.objects;
drop policy if exists "Admins can upload menu images" on storage.objects;
drop policy if exists "Admins can delete menu images" on storage.objects;

-- Recreate clean storage policies
create policy "Public read menu images" on storage.objects
  for select using (bucket_id = 'menu-images');

create policy "Admins upload menu images" on storage.objects
  for insert with check (
    bucket_id = 'menu-images'
    and get_my_role() = 'admin'
  );

create policy "Admins delete menu images" on storage.objects
  for delete using (
    bucket_id = 'menu-images'
    and get_my_role() = 'admin'
  );

create policy "Admins update menu images" on storage.objects
  for update using (
    bucket_id = 'menu-images'
    and get_my_role() = 'admin'
  );