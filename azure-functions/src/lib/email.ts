import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL || "https://customcoachpro.azurewebsites.net";
const FROM_EMAIL = "CustomCoachPro <noreply@customcoachpro.com>";

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your email - CustomCoachPro",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to CustomCoachPro, ${name}!</h1>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link: ${verifyUrl}</p>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password - CustomCoachPro",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link: ${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to CustomCoachPro!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to CustomCoachPro, ${name}!</h1>
        <p>Your account has been created successfully. We're excited to have you on board!</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore workout plans and exercises</li>
          <li>Track your fitness progress</li>
        </ul>
        <a href="${APP_URL}/login" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Get Started
        </a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">Need help? Contact us at support@customcoachpro.com</p>
      </div>
    `,
  });
}

export async function sendClientInvitation(
  email: string,
  coachName: string,
  message?: string
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${coachName} invited you to CustomCoachPro`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">You've Been Invited!</h1>
        <p>Coach <strong>${coachName}</strong> has invited you to join CustomCoachPro.</p>
        ${message ? `<p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">"${message}"</p>` : ""}
        <p>CustomCoachPro helps you work with your coach to achieve your fitness goals.</p>
        <a href="${APP_URL}/signup" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Accept Invitation
        </a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">If you don't want to accept this invitation, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendCheckinNotification(
  email: string,
  clientName: string,
  checkinDate: string
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `New check-in from ${clientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Client Check-in</h1>
        <p><strong>${clientName}</strong> has submitted a check-in for ${checkinDate}.</p>
        <a href="${APP_URL}/coach/checkins" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Review Check-in
        </a>
      </div>
    `,
  });
}

export async function sendPlanAssignmentNotification(
  email: string,
  clientName: string,
  planName: string,
  planType: "workout" | "diet"
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `New ${planType} plan assigned: ${planName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Plan Assigned!</h1>
        <p>Hi ${clientName},</p>
        <p>Your coach has assigned you a new ${planType} plan: <strong>${planName}</strong></p>
        <a href="${APP_URL}/client/${planType === "workout" ? "workouts" : "diet-plans"}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          View Plan
        </a>
      </div>
    `,
  });
}
