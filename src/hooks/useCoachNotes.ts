import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CoachNote {
  id: string;
  coach_id: string;
  client_id: string;
  title: string | null;
  content: string;
  note_type: 'general' | 'call_notes' | 'observation' | 'reminder' | 'milestone' | 'concern';
  tags: string[];
  is_pinned: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  reference_date: string | null;
  created_at: string;
  updated_at: string;
}

export type NoteInput = Omit<CoachNote, 'id' | 'coach_id' | 'created_at' | 'updated_at'>;

export function useClientNotes(clientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-notes", clientId],
    queryFn: async () => {
      if (!user?.id || !clientId) return [];

      const { data, error } = await supabase
        .from("coach_client_notes")
        .select("*")
        .eq("coach_id", user.id)
        .eq("client_id", clientId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CoachNote[];
    },
    enabled: !!user?.id && !!clientId,
  });
}

export function useAllNotes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["all-coach-notes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("coach_client_notes")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CoachNote[];
    },
    enabled: !!user?.id,
  });
}

export function useAddNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (note: NoteInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("coach_client_notes")
        .insert({
          ...note,
          coach_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coach-notes", variables.client_id] });
      queryClient.invalidateQueries({ queryKey: ["all-coach-notes", user?.id] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CoachNote> & { id: string }) => {
      const { data, error } = await supabase
        .from("coach_client_notes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as CoachNote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coach-notes", data.client_id] });
      queryClient.invalidateQueries({ queryKey: ["all-coach-notes", user?.id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await supabase
        .from("coach_client_notes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { clientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coach-notes", data.clientId] });
      queryClient.invalidateQueries({ queryKey: ["all-coach-notes", user?.id] });
    },
  });
}

export function useTogglePinNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const { data, error } = await supabase
        .from("coach_client_notes")
        .update({ is_pinned: !isPinned })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as CoachNote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coach-notes", data.client_id] });
      queryClient.invalidateQueries({ queryKey: ["all-coach-notes", user?.id] });
    },
  });
}
