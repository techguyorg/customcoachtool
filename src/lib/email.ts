/**
 * Email Service Abstraction Layer
 * 
 * Provides a unified interface for email operations that works with:
 * - Supabase Edge Functions (current development)
 * - Azure Functions (future production)
 * 
 * Gmail SMTP Configuration:
 * - Sender: s.susheel9@gmail.com
 * - Display Name: CustomCoachPro
 */

import { supabase } from "@/integrations/supabase/client";

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface TemplatedEmailOptions {
  to: string;
  templateId: string;
  data: Record<string, unknown>;
}

export interface EmailService {
  sendEmail(options: EmailOptions): Promise<EmailResult>;
  sendTemplatedEmail(options: TemplatedEmailOptions): Promise<EmailResult>;
  sendClientInvitation(params: {
    email: string;
    name: string;
    message?: string;
    coachId: string;
    coachName: string;
  }): Promise<EmailResult>;
  sendAdminNotification(params: {
    type: "super_admin_granted" | "super_admin_revoked";
    targetEmail: string;
    targetName: string;
    performedByName: string;
  }): Promise<EmailResult>;
}

/**
 * Supabase Edge Function implementation
 * Uses Gmail SMTP via edge functions
 */
class SupabaseEmailService implements EmailService {
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: options,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Unknown error" 
      };
    }
  }

  async sendTemplatedEmail(options: TemplatedEmailOptions): Promise<EmailResult> {
    try {
      const { data, error } = await supabase.functions.invoke("send-templated-email", {
        body: options,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Unknown error" 
      };
    }
  }

  async sendClientInvitation(params: {
    email: string;
    name: string;
    message?: string;
    coachId: string;
    coachName: string;
  }): Promise<EmailResult> {
    try {
      const { data, error } = await supabase.functions.invoke("send-client-invitation", {
        body: params,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.data?.id };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Unknown error" 
      };
    }
  }

  async sendAdminNotification(params: {
    type: "super_admin_granted" | "super_admin_revoked";
    targetEmail: string;
    targetName: string;
    performedByName: string;
  }): Promise<EmailResult> {
    try {
      const { data, error } = await supabase.functions.invoke("send-admin-notification", {
        body: params,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Unknown error" 
      };
    }
  }
}

/**
 * Azure Functions implementation (future)
 * Uncomment and configure when migrating to Azure
 */
// class AzureEmailService implements EmailService {
//   private baseUrl: string;
//   
//   constructor(baseUrl: string) {
//     this.baseUrl = baseUrl;
//   }
//
//   async sendEmail(options: EmailOptions): Promise<EmailResult> {
//     const response = await fetch(`${this.baseUrl}/api/send-email`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(options),
//     });
//     
//     const data = await response.json();
//     return data;
//   }
//   // ... implement other methods
// }

// Factory function - switch implementation based on environment
export function getEmailService(): EmailService {
  // Future: Check environment variable to determine which service to use
  // const provider = import.meta.env.VITE_EMAIL_PROVIDER;
  // if (provider === 'azure') {
  //   return new AzureEmailService(import.meta.env.VITE_AZURE_FUNCTIONS_URL);
  // }
  
  return new SupabaseEmailService();
}

// Export singleton instance
export const emailService = getEmailService();
