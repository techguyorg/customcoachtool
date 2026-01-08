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

interface AdminNotificationRequest {
  type: "super_admin_granted" | "super_admin_revoked";
  targetEmail: string;
  targetName: string;
  performedByName: string;
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
    const { type, targetEmail, targetName, performedByName }: AdminNotificationRequest = await req.json();

    let subject: string;
    let htmlContent: string;

    if (type === "super_admin_granted") {
      subject = "🎉 You've been granted Super Admin access - CustomCoachPro";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0d14; color: #e5e7eb; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #12161f 0%, #0e1118 100%); border-radius: 16px; border: 1px solid #1f2937; overflow: hidden;">
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 32px; text-align: center;">
              <h1 style="color: #0a0d14; margin: 0; font-size: 24px; font-weight: 700;">
                🎉 Super Admin Access Granted
              </h1>
            </div>
            
            <div style="padding: 32px;">
              <p style="color: #f9fafb; font-size: 16px; margin: 0 0 16px;">Hello ${targetName},</p>
              
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                You have been granted <strong style="color: #10b981;">Super Admin</strong> access to CustomCoachPro by ${performedByName}.
              </p>
              
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px;">As a Super Admin, you now have full access to:</p>
              <ul style="color: #9ca3af; font-size: 14px; line-height: 1.8; margin: 0 0 20px; padding-left: 20px;">
                <li>User management and role assignments</li>
                <li>Platform-wide settings and feature flags</li>
                <li>System content management</li>
                <li>Platform analytics and audit logs</li>
              </ul>
              
              <div style="background: #422006; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 0 0 20px;">
                <p style="color: #f59e0b; font-size: 14px; font-weight: 600; margin: 0;">
                  ⚠️ With great power comes great responsibility.
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                If you did not expect this access, please contact your system administrator immediately.
              </p>
            </div>
            
            <div style="border-top: 1px solid #1f2937; padding: 20px 32px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2024 CustomCoachPro. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = "⚠️ Your Super Admin access has been revoked - CustomCoachPro";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0d14; color: #e5e7eb; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #12161f 0%, #0e1118 100%); border-radius: 16px; border: 1px solid #1f2937; overflow: hidden;">
            
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
                ⚠️ Super Admin Access Revoked
              </h1>
            </div>
            
            <div style="padding: 32px;">
              <p style="color: #f9fafb; font-size: 16px; margin: 0 0 16px;">Hello ${targetName},</p>
              
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                Your <strong style="color: #ef4444;">Super Admin</strong> access to CustomCoachPro has been revoked by ${performedByName}.
              </p>
              
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                If you believe this was done in error, please contact your system administrator.
              </p>
            </div>
            
            <div style="border-top: 1px solid #1f2937; padding: 20px 32px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2024 CustomCoachPro. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    if (!GMAIL_APP_PASSWORD) {
      console.log("GMAIL_APP_PASSWORD not configured - logging notification instead");
      console.log("Notification details:", { type, targetEmail, targetName, performedByName });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Notification logged (email sending not configured)"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const result = await sendEmailViaSMTP(targetEmail, subject, htmlContent);

    if (!result.success) {
      throw new Error(result.error || "Failed to send email");
    }

    console.log("Admin notification email sent successfully via Gmail SMTP");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in send-admin-notification function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
