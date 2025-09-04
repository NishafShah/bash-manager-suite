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
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ 
        error: "Email is required" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        }
      }
    );

    // Check if user exists and their confirmation status
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error checking existing users:', listError);
      return new Response(JSON.stringify({ 
        error: "Failed to check email status" 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const user = existingUsers.users.find(user => user.email === email);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        error: "No account found with this email address. Please sign up first.",
        code: "USER_NOT_FOUND"
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if email is already confirmed
    if (user.email_confirmed_at) {
      return new Response(JSON.stringify({ 
        error: "This email is already verified. Please login.",
        code: "EMAIL_ALREADY_CONFIRMED"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create regular Supabase client for resending confirmation
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Resend confirmation email
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${req.headers.get("origin")}/`
      }
    });

    if (resendError) {
      console.error('Resend confirmation error:', resendError);
      
      // Handle specific Supabase errors
      if (resendError.message.includes('rate limit')) {
        return new Response(JSON.stringify({ 
          error: "Too many requests. Please wait a few minutes before trying again.",
          code: "RATE_LIMITED"
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: "Unable to send verification email. Please try again later.",
        code: "SEND_FAILED"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Confirmation email resent successfully for:', email);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Verification email sent! Please check your inbox and spam folder."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in resend-confirmation function:', error);
    return new Response(JSON.stringify({ 
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});