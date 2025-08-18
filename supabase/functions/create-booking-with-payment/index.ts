import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
    // Initialize Supabase client with service role and forward user's JWT for RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Get authenticated user from the provided token
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'User authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const user = userData.user;
    
    if (!user?.email) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { package_id, event_date, guest_count, special_requests, success_url, cancel_url } = await req.json();

    if (!package_id || !event_date) {
      return new Response(JSON.stringify({ error: "package_id and event_date are required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate that the package exists and is active
    const { data: packageData, error: packageError } = await supabaseClient
      .from('service_packages')
      .select('id, title, price, is_active')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (packageError || !packageData) {
      return new Response(JSON.stringify({ error: "Package not found or inactive" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ error: "Failed to create booking" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Booking created successfully:', booking.id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0];
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: packageData.title,
              description: `${guest_count || 1} guests • ${new Date(event_date).toLocaleDateString()}`,
            },
            unit_amount: Math.round(total_amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: success_url ? `${success_url}?booking_id=${booking.id}` : `${req.headers.get("origin")}/booking-success?booking_id=${booking.id}`,
      cancel_url: cancel_url ? `${cancel_url}?booking_id=${booking.id}` : `${req.headers.get("origin")}/booking-canceled?booking_id=${booking.id}`,
      metadata: {
        booking_id: booking.id,
        user_id: user.id,
      },
    });

    console.log('Checkout session created:', session.id, 'for booking:', booking.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      booking_id: booking.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-booking-with-payment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});