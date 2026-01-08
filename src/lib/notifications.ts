/**
 * Notification Service Abstraction Layer
 * 
 * Provides a unified interface for notifications that works with:
 * - Supabase (current development)
 * - Azure (future production)
 * 
 * Supports both in-app notifications and email notifications.
 */

import { supabase } from "@/integrations/supabase/client";
import { emailService } from "./email";
import type { TablesInsert } from "@/integrations/supabase/types";

export interface Notification {
  id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: string;
  data?: Record<string, unknown>;
  isRead?: boolean;
  createdAt?: string;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

export interface NotificationService {
  // In-app notifications
  sendNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<NotificationResult>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<NotificationResult>;
  markAllAsRead(userId: string): Promise<NotificationResult>;
  getUnreadCount(userId: string): Promise<number>;
  
  // Combined notifications (in-app + email)
  notifyUser(params: {
    userId: string;
    email: string;
    type: string;
    title: string;
    message: string;
    emailSubject?: string;
    emailHtml?: string;
    sendEmail?: boolean;
  }): Promise<NotificationResult>;
}

/**
 * Supabase implementation
 */
class SupabaseNotificationService implements NotificationService {
  async sendNotification(
    notification: Omit<Notification, "id" | "createdAt">
  ): Promise<NotificationResult> {
    try {
      const insertData: TablesInsert<"notifications"> = {
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        reference_type: notification.referenceType || null,
        reference_id: notification.referenceId || null,
        data: notification.data ? JSON.parse(JSON.stringify(notification.data)) : null,
        is_read: false,
      };

      const { data, error } = await supabase
        .from("notifications")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, notificationId: data.id };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return data.map((n) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        referenceType: n.reference_type || undefined,
        referenceId: n.reference_id || undefined,
        data: n.data as Record<string, unknown> | undefined,
        isRead: n.is_read,
        createdAt: n.created_at,
      }));
    } catch (err) {
      console.error("Error fetching notifications:", err);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<NotificationResult> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  async markAllAsRead(userId: string): Promise<NotificationResult> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error("Error getting unread count:", error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error("Error getting unread count:", err);
      return 0;
    }
  }

  async notifyUser(params: {
    userId: string;
    email: string;
    type: string;
    title: string;
    message: string;
    emailSubject?: string;
    emailHtml?: string;
    sendEmail?: boolean;
  }): Promise<NotificationResult> {
    // Always send in-app notification
    const inAppResult = await this.sendNotification({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
    });

    // Optionally send email
    if (params.sendEmail && params.emailHtml) {
      try {
        await emailService.sendEmail({
          to: params.email,
          subject: params.emailSubject || params.title,
          html: params.emailHtml,
        });
      } catch (err) {
        console.error("Failed to send email notification:", err);
        // Don't fail the whole operation if email fails
      }
    }

    return inAppResult;
  }
}

// Factory function
export function getNotificationService(): NotificationService {
  return new SupabaseNotificationService();
}

// Export singleton instance
export const notificationService = getNotificationService();
