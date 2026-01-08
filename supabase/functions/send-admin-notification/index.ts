import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  type: "super_admin_granted" | "super_admin_revoked";
  targetEmail: string;
  targetName: string;
  performedByName: string;
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Super Admin Access Granted</h1>
          <p>Hello ${targetName},</p>
          <p>You have been granted <strong>Super Admin</strong> access to CustomCoachPro by ${performedByName}.</p>
          <p>As a Super Admin, you now have full access to:</p>
          <ul>
            <li>User management and role assignments</li>
            <li>Platform-wide settings and feature flags</li>
            <li>System content management</li>
            <li>Platform analytics and audit logs</li>
          </ul>
          <p style="color: #f59e0b; font-weight: bold;">⚠️ With great power comes great responsibility.</p>
          <p>If you did not expect this access, please contact your system administrator immediately.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">This is an automated message from CustomCoachPro.</p>
        </div>
      `;
    } else {
      subject = "⚠️ Your Super Admin access has been revoked - CustomCoachPro";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Super Admin Access Revoked</h1>
          <p>Hello ${targetName},</p>
          <p>Your <strong>Super Admin</strong> access to CustomCoachPro has been revoked by ${performedByName}.</p>
          <p>If you believe this was done in error, please contact your system administrator.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">This is an automated message from CustomCoachPro.</p>
        </div>
      `;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CustomCoachPro <onboarding@resend.dev>",
        to: [targetEmail],
        subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const data = await res.json();
    console.log("Admin notification email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
