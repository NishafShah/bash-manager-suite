import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  try {
    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error('No stripe signature found');
      return new Response("No signature", { status: 400 });
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook signature verification failed: ${err.message}`, { 
        status: 400 
      });
    }

    console.log('Webhook event received:', event.type);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Processing checkout session completed:', session.id);

      // Get booking_id from metadata
      const booking_id = session.metadata?.booking_id;
      const user_id = session.metadata?.user_id;

      if (!booking_id) {
        console.error('No booking_id found in session metadata');
        return new Response("No booking_id found", { status: 400 });
      }

      // Create Supabase service client to bypass RLS
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      try {
        // Update booking status
        const { error: bookingError } = await supabaseService
          .from('bookings')
          .update({
            status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', booking_id);

        if (bookingError) {
          console.error('Error updating booking:', bookingError);
          throw bookingError;
        }

        // Create payment record
        const { error: paymentError } = await supabaseService
          .from('payments')
          .insert({
            booking_id: booking_id,
            amount: (session.amount_total || 0) / 100, // Convert from cents
            status: 'completed',
            transaction_id: session.payment_intent as string,
            payment_method: 'stripe',
            paid_at: new Date().toISOString()
          });

        if (paymentError) {
          console.error('Error creating payment record:', paymentError);
          throw paymentError;
        }

        console.log('Successfully updated booking and created payment record for booking:', booking_id);

      } catch (error) {
        console.error('Database update failed:', error);
        return new Response(`Database update failed: ${error.message}`, { 
          status: 500 
        });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });

  } catch (error) {
    console.error('Error in stripe-webhook function:', error);
    return new Response(`Webhook processing failed: ${error.message}`, { 
      status: 500 
    });
  }
});