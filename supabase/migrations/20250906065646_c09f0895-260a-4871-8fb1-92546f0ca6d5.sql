-- Storage policies for package images
-- Allow public read access for the 'package-images' bucket
create policy if not exists "Public can view package images"
  on storage.objects
  for select
  using (bucket_id = 'package-images');

-- Allow admins to upload images to the 'package-images' bucket
create policy if not exists "Admins can upload package images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'package-images'
    and public.has_role(auth.uid(), 'admin')
  );

-- Allow admins to update images in the 'package-images' bucket
create policy if not exists "Admins can update package images"
  on storage.objects
  for update
  using (
    bucket_id = 'package-images' and public.has_role(auth.uid(), 'admin')
  )
  with check (
    bucket_id = 'package-images' and public.has_role(auth.uid(), 'admin')
  );

-- Allow admins to delete images in the 'package-images' bucket
create policy if not exists "Admins can delete package images"
  on storage.objects
  for delete
  using (
    bucket_id = 'package-images' and public.has_role(auth.uid(), 'admin')
  );