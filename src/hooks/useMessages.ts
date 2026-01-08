import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function useConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all messages involving the user
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!messages || messages.length === 0) return [];

      // Group by conversation partner
      const conversationMap = new Map<string, {
        messages: Message[];
        unreadCount: number;
      }>();

      messages.forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const existing = conversationMap.get(partnerId) || { messages: [], unreadCount: 0 };
        existing.messages.push(msg);
        if (msg.recipient_id === user.id && !msg.read_at) {
          existing.unreadCount++;
        }
        conversationMap.set(partnerId, existing);
      });

      // Get profile info for all partners
      const partnerIds = Array.from(conversationMap.keys());
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", partnerIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      // Build conversation list
      const conversations: Conversation[] = [];
      conversationMap.forEach((data, partnerId) => {
        const profile = profileMap.get(partnerId);
        const lastMsg = data.messages[0]; // Already sorted by created_at desc
        conversations.push({
          partnerId,
          partnerName: profile?.full_name || "Unknown",
          partnerAvatar: profile?.avatar_url || null,
          lastMessage: lastMsg.content,
          lastMessageAt: lastMsg.created_at,
          unreadCount: data.unreadCount,
        });
      });

      // Sort by last message time
      conversations.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );

      return conversations;
    },
    enabled: !!user?.id,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id === user.id || msg.recipient_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["messages"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
}

export function useMessages(partnerId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["messages", user?.id, partnerId],
    queryFn: async () => {
      if (!user?.id || !partnerId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!user?.id && !!partnerId,
  });
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipientId,
      content,
    }: {
      recipientId: string;
      content: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content,
      });

      if (error) throw error;

      // Also send a notification
      await supabase.from("notifications").insert({
        user_id: recipientId,
        type: "new_message",
        title: "New Message",
        message: `${user.fullName} sent you a message`,
        reference_type: "message",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", messageIds)
        .is("read_at", null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useTotalUnreadCount() {
  const { data: conversations } = useConversations();
  return conversations?.reduce((sum, c) => sum + c.unreadCount, 0) || 0;
}
