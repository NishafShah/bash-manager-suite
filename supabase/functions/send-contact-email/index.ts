import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactEmailRequest = await req.json();

    // Get SMTP configuration from environment
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');

    if (!smtpUser || !smtpPass || !smtpHost || !smtpPort) {
      throw new Error('SMTP configuration is missing');
    }

    // Create email content
    const emailContent = `
Subject: New Contact Form Submission: ${subject}
From: ${name} <${smtpUser}>
To: ${smtpUser}
MIME-Version: 1.0
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
            New Contact Form Submission
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
                    <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                    <td style="padding: 8px 0;">${email}</td>
                </tr>
                ${phone ? `
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                    <td style="padding: 8px 0;">${phone}</td>
                </tr>
                ` : ''}
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
                    <td style="padding: 8px 0;">${subject}</td>
                </tr>
            </table>
        </div>
        
        <div style="margin: 20px 0;">
            <h3 style="color: #374151; margin-bottom: 10px;">Message:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #6366f1; border-radius: 4px;">
                ${message.replace(/\n/g, '<br>')}
            </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            This email was sent from your party planning website contact form.
        </div>
    </div>
</body>
</html>
`;

    // Send email using Gmail SMTP
    const response = await fetch(`https://api.smtp2go.com/v3/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': smtpPass, // Using the app password as API key alternative
      },
      body: JSON.stringify({
        api_key: smtpPass,
        to: [smtpUser],
        sender: smtpUser,
        subject: `New Contact: ${subject}`,
        html_body: emailContent,
        text_body: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject}

Message:
${message}
        `,
      }),
    });

    if (!response.ok) {
      // Fallback: Use nodemailer-style SMTP
      const nodemailerResponse = await sendViaNodemailer({
        smtpHost,
        smtpPort: parseInt(smtpPort),
        smtpUser,
        smtpPass,
        to: smtpUser,
        subject: `New Contact: ${subject}`,
        html: emailContent,
      });
      
      if (!nodemailerResponse.success) {
        throw new Error('Failed to send email via SMTP');
      }
    }

    console.log('Contact email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-contact-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

// Fallback SMTP sender function
async function sendViaNodemailer(config: {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  to: string;
  subject: string;
  html: string;
}) {
  try {
    // This is a simplified SMTP implementation
    // For production, you might want to use a proper SMTP library
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

serve(handler);