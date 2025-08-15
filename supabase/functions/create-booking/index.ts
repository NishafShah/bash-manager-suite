import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { package_id, event_date, guest_count, special_requests } = await req.json();

    if (!package_id || !event_date) {
      throw new Error("package_id and event_date are required");
    }

    // Validate that the package exists and is active
    const { data: packageData, error: packageError } = await supabaseClient
      .from('service_packages')
      .select('id, title, price, is_active')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (packageError || !packageData) {
      throw new Error("Package not found or inactive");
    }

    // Calculate total amount
    const total_amount = packageData.price * (guest_count || 1);

    // Create the booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: user.id,
        package_id,
        event_date,
        guest_count: guest_count || 1,
        special_requests,
        total_amount,
        status: 'pending',
        booking_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      throw new Error("Failed to create booking");
    }

    console.log('Booking created successfully:', booking.id);

    return new Response(JSON.stringify({ 
      success: true, 
      booking: booking 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-booking function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});