import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Gmail SMTP Configuration
const GMAIL_USER = "s.susheel9@gmail.com";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
const SENDER_NAME = "CustomCoachPro";

interface InvitationRequest {
  email: string;
  name: string;
  message?: string;
  coachId: string;
  coachName: string;
}

async function sendEmailViaSMTP(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  if (!GMAIL_APP_PASSWORD) {
    console.log("GMAIL_APP_PASSWORD not configured");
    return { success: false, error: "Email not configured" };
  }

  try {
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: GMAIL_USER,
          password: GMAIL_APP_PASSWORD,
        },
      },
    });

    await client.send({
      from: `${SENDER_NAME} <${GMAIL_USER}>`,
      to: to,
      subject: subject,
      content: "Please view this email in an HTML-compatible email client.",
      html: html,
    });

    await client.close();
    return { success: true };
  } catch (error) {
    console.error("SMTP Error:", error);
    return { success: false, error: String(error) };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, message, coachId, coachName }: InvitationRequest = await req.json();

    if (!email || !name || !coachId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, name, coachId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!GMAIL_APP_PASSWORD) {
      console.log("GMAIL_APP_PASSWORD not configured - logging invitation instead");
      console.log("Invitation details:", { email, name, message, coachId, coachName });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invitation logged (email sending not configured)",
          note: "Configure GMAIL_APP_PASSWORD to enable email sending"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const signupUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/signup?ref=coach&coach_id=${coachId}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0d14; color: #e5e7eb; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #12161f 0%, #0e1118 100%); border-radius: 16px; border: 1px solid #1f2937; overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 32px; text-align: center;">
            <h1 style="color: #0a0d14; margin: 0; font-size: 28px; font-weight: 700;">
              🏋️ CustomCoachPro
            </h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 32px;">
            <h2 style="color: #f9fafb; margin: 0 0 16px; font-size: 24px;">
              Hey ${name}! 👋
            </h2>
            
            <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              <strong style="color: #10b981;">${coachName || "A fitness coach"}</strong> has invited you to join their coaching program on CustomCoachPro!
            </p>
            
            ${message ? `
              <div style="background: #1f2937; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 0 0 24px;">
                <p style="color: #d1d5db; font-size: 14px; font-style: italic; margin: 0;">
                  "${message}"
                </p>
                <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0;">
                  — ${coachName}
                </p>
              </div>
            ` : ""}
            
            <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
              Join now to get personalized workout plans, track your progress, and achieve your fitness goals with expert guidance.
            </p>
            
            <div style="text-align: center;">
              <a href="${signupUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: #0a0d14; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #1f2937; padding: 24px 32px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2024 CustomCoachPro. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmailViaSMTP(
      email,
      `${coachName || "A coach"} has invited you to CustomCoachPro!`,
      emailHtml
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to send email");
    }

    console.log("Email sent successfully via Gmail SMTP");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in send-client-invitation function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
