-- Create storage bucket for package images
INSERT INTO storage.buckets (id, name, public) VALUES ('package-images', 'package-images', true);

-- Create storage policies for package images
CREATE POLICY "Anyone can view package images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'package-images');

CREATE POLICY "Admins can upload package images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'package-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update package images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'package-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete package images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'package-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Create RPC functions for analytics
CREATE OR REPLACE FUNCTION public.get_analytics_data()
RETURNS TABLE (
  total_bookings BIGINT,
  active_packages BIGINT,
  revenue_generated NUMERIC,
  monthly_trend JSONB,
  popular_packages JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  month_data JSONB;
  package_data JSONB;
BEGIN
  -- Get monthly bookings trend (last 12 months)
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', month_year,
      'bookings', booking_count,
      'revenue', month_revenue
    ) ORDER BY month_year
  ) INTO month_data
  FROM (
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM') as month_year,
      COUNT(*) as booking_count,
      COALESCE(SUM(total_amount), 0) as month_revenue
    FROM bookings 
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month_year
  ) monthly_stats;

  -- Get top 5 popular packages
  SELECT jsonb_agg(
    jsonb_build_object(
      'title', sp.title,
      'booking_count', booking_count,
      'revenue', package_revenue
    ) ORDER BY booking_count DESC
  ) INTO package_data
  FROM (
    SELECT 
      b.package_id,
      COUNT(*) as booking_count,
      COALESCE(SUM(b.total_amount), 0) as package_revenue
    FROM bookings b
    WHERE b.package_id IS NOT NULL
    GROUP BY b.package_id
    ORDER BY booking_count DESC
    LIMIT 5
  ) popular_stats
  LEFT JOIN service_packages sp ON sp.id = popular_stats.package_id;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM bookings)::BIGINT as total_bookings,
    (SELECT COUNT(*) FROM service_packages WHERE is_active = true)::BIGINT as active_packages,
    (SELECT COALESCE(SUM(total_amount), 0) FROM bookings) as revenue_generated,
    COALESCE(month_data, '[]'::JSONB) as monthly_trend,
    COALESCE(package_data, '[]'::JSONB) as popular_packages;
END;
$$;