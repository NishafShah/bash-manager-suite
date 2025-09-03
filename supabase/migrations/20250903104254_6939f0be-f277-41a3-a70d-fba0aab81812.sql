-- Add foreign key relationship between bookings and profiles
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key relationship between bookings and service_packages  
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_package_id_fkey
FOREIGN KEY (package_id) REFERENCES public.service_packages(id) ON DELETE SET NULL;