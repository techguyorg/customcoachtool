import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GMAIL_USER = "s.susheel9@gmail.com";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
const SENDER_NAME = "CustomCoachPro";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface NotificationRequest {
  type: "submitted" | "reviewed";
  checkinId: string;
  clientId?: string;
  coachId?: string;
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
    const { type, checkinId, clientId, coachId }: NotificationRequest = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    if (type === "submitted" && coachId) {
      // Coach receives email when client submits check-in
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("email_checkin_received")
        .eq("user_id", coachId)
        .single();

      if (coachProfile?.email_checkin_received === false) {
        return new Response(JSON.stringify({ success: true, skipped: "opted_out" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", coachId)
        .single();

      if (profile?.email) {
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:40px 20px;background:#0a0d14;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#12161f;border-radius:16px;border:1px solid #1f2937;"><tr><td style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:24px;text-align:center;border-radius:16px 16px 0 0;"><h1 style="color:#0a0d14;margin:0;font-size:20px;">New Check-in Submitted</h1></td></tr><tr><td style="padding:24px;"><p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 16px;">Hey ${profile.full_name || "Coach"},</p><p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">One of your clients has submitted a new check-in and is waiting for your feedback.</p><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:linear-gradient(135deg,#10b981,#14b8a6);border-radius:8px;"><a href="https://id-preview--ojtvhevrsixwokjbidcx.lovable.app/coach/checkins" style="display:block;padding:12px 24px;color:#0a0d14;text-decoration:none;font-weight:600;font-size:14px;">Review Check-in</a></td></tr></table></td></tr><tr><td style="border-top:1px solid #1f2937;padding:16px;text-align:center;"><p style="color:#6b7280;font-size:11px;margin:0;">You can manage email preferences in your profile settings.</p></td></tr></table></body></html>`;
        
        await sendEmailViaSMTP(profile.email, "New Client Check-in Submitted", html);
      }
    } else if (type === "reviewed" && clientId) {
      // Client receives email when coach reviews check-in
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("email_checkin_reviewed")
        .eq("user_id", clientId)
        .single();

      if (clientProfile?.email_checkin_reviewed === false) {
        return new Response(JSON.stringify({ success: true, skipped: "opted_out" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", clientId)
        .single();

      if (profile?.email) {
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:40px 20px;background:#0a0d14;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#12161f;border-radius:16px;border:1px solid #1f2937;"><tr><td style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:24px;text-align:center;border-radius:16px 16px 0 0;"><h1 style="color:#0a0d14;margin:0;font-size:20px;">Check-in Reviewed!</h1></td></tr><tr><td style="padding:24px;"><p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 16px;">Hey ${profile.full_name || "there"},</p><p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">Your coach has reviewed your check-in and left feedback for you.</p><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:linear-gradient(135deg,#10b981,#14b8a6);border-radius:8px;"><a href="https://id-preview--ojtvhevrsixwokjbidcx.lovable.app/client/checkins" style="display:block;padding:12px 24px;color:#0a0d14;text-decoration:none;font-weight:600;font-size:14px;">View Feedback</a></td></tr></table></td></tr><tr><td style="border-top:1px solid #1f2937;padding:16px;text-align:center;"><p style="color:#6b7280;font-size:11px;margin:0;">You can manage email preferences in your profile settings.</p></td></tr></table></body></html>`;
        
        await sendEmailViaSMTP(profile.email, "Your Check-in Has Been Reviewed", html);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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