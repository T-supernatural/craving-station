-- bucket.sql
-- Run this in Supabase SQL editor to initialize gallery image storage bucket + security policies

-- 1) Create the bucket
insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do update set public = true;

-- 2) Remove stale policies if they exist
drop policy if exists "Public read gallery images" on storage.objects;
drop policy if exists "Admins upload gallery images" on storage.objects;
drop policy if exists "Admins delete gallery images" on storage.objects;
drop policy if exists "Admins update gallery images" on storage.objects;

-- 3) Public read policy
create policy "Public read gallery images" on storage.objects
  for select using (bucket_id = 'gallery-images');

-- 4) Admin upload policy
create policy "Admins upload gallery images" on storage.objects
  for insert with check (
    bucket_id = 'gallery-images'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 5) Admin delete policy
create policy "Admins delete gallery images" on storage.objects
  for delete using (
    bucket_id = 'gallery-images'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6) Admin update policy
create policy "Admins update gallery images" on storage.objects
  for update using (
    bucket_id = 'gallery-images'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 7) Check that bucket was created
select * from storage.buckets where id = 'gallery-images';

-- 8) Check applied policies
select * from storage.policies where table_name = 'objects' and bucket_id = 'gallery-images';
