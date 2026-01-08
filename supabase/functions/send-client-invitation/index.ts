import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GMAIL_USER = "s.susheel9@gmail.com";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
const SENDER_NAME = "CustomCoachPro";

interface InvitationRequest {
  email: string;
  name: string;
  message?: string;
  coachId: string;
  coachName: string;
  appUrl?: string;
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
      content: "Please view this email in an HTML-compatible client.",
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
    const { email, name, message, coachId, coachName, appUrl }: InvitationRequest = await req.json();

    if (!email || !name || !coachId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!GMAIL_APP_PASSWORD) {
      console.log("GMAIL_APP_PASSWORD not configured - logging invitation");
      return new Response(
        JSON.stringify({ success: true, message: "Invitation logged (email not configured)" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use provided appUrl or construct from origin
    const baseUrl = appUrl || "https://id-preview--ojtvhevrsixwokjbidcx.lovable.app";
    const signupUrl = `${baseUrl}/signup?ref=coach&coach_id=${coachId}`;

    const coachMsg = message ? `<tr><td style="padding:16px 20px;background:#1f2937;border-left:4px solid #10b981;border-radius:0 8px 8px 0;"><p style="color:#d1d5db;font-size:14px;font-style:italic;margin:0;">"${message}"</p><p style="color:#6b7280;font-size:12px;margin:12px 0 0;">— ${coachName}</p></td></tr><tr><td style="height:24px;"></td></tr>` : "";

    // Simple table-based HTML to avoid encoding issues
    const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:40px 20px;background:#0a0d14;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#12161f;border-radius:16px;border:1px solid #1f2937;"><tr><td style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:32px;text-align:center;border-radius:16px 16px 0 0;"><h1 style="color:#0a0d14;margin:0;font-size:24px;">CustomCoachPro</h1></td></tr><tr><td style="padding:32px;"><h2 style="color:#f9fafb;margin:0 0 16px;font-size:20px;">Hey ${name}!</h2><p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;"><strong style="color:#10b981;">${coachName || "A fitness coach"}</strong> has invited you to join their coaching program!</p></td></tr>${coachMsg}<tr><td style="padding:0 32px 32px;"><p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">Join now to get personalized workout plans and achieve your fitness goals.</p><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:linear-gradient(135deg,#10b981,#14b8a6);border-radius:8px;"><a href="${signupUrl}" style="display:block;padding:14px 32px;color:#0a0d14;text-decoration:none;font-weight:600;font-size:14px;">Accept Invitation</a></td></tr></table></td></tr><tr><td style="border-top:1px solid #1f2937;padding:20px 32px;text-align:center;"><p style="color:#6b7280;font-size:12px;margin:0;">© 2024 CustomCoachPro</p></td></tr></table></body></html>`;

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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
