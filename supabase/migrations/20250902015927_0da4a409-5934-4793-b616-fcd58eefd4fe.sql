-- Enable RLS on the services table that was missing it
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for the services table
CREATE POLICY "Admins can manage services" 
ON public.services 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view services" 
ON public.services 
FOR SELECT 
USING (true);