import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types
export interface ClientMeasurement {
  id: string;
  client_id: string;
  recorded_at: string;
  weight_kg: number;
  body_fat_pct: number | null;
  muscle_mass_kg: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  left_calf_cm: number | null;
  right_calf_cm: number | null;
  neck_cm: number | null;
  shoulders_cm: number | null;
  notes: string | null;
  created_at: string;
}

export interface ProgressPhoto {
  id: string;
  client_id: string;
  recorded_at: string;
  photo_url: string;
  thumbnail_url: string | null;
  pose_type: 'front' | 'back' | 'side_left' | 'side_right' | 'other';
  notes: string | null;
  is_private: boolean;
  created_at: string;
}

export interface ClientGoal {
  id: string;
  client_id: string;
  goal_type: 'weight' | 'body_fat' | 'measurement' | 'strength' | 'habit' | 'custom';
  title: string;
  description: string | null;
  target_value: number | null;
  starting_value: number | null;
  current_value: number | null;
  unit: string | null;
  target_date: string | null;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  completed_at: string | null;
  created_at: string;
}

export type MeasurementInput = Omit<ClientMeasurement, 'id' | 'client_id' | 'created_at'>;
export type GoalInput = Omit<ClientGoal, 'id' | 'client_id' | 'created_at' | 'completed_at'>;

// Hooks

export function useClientMeasurements(clientId?: string) {
  const { user } = useAuth();
  const targetId = clientId || user?.id;

  return useQuery({
    queryKey: ["client-measurements", targetId],
    queryFn: async () => {
      if (!targetId) return [];

      const { data, error } = await supabase
        .from("client_measurements")
        .select("*")
        .eq("client_id", targetId)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return data as ClientMeasurement[];
    },
    enabled: !!targetId,
  });
}

export function useAddMeasurement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (measurement: MeasurementInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_measurements")
        .insert({
          ...measurement,
          client_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-measurements", user?.id] });
    },
  });
}

export function useProgressPhotos(clientId?: string) {
  const { user } = useAuth();
  const targetId = clientId || user?.id;

  return useQuery({
    queryKey: ["progress-photos", targetId],
    queryFn: async () => {
      if (!targetId) return [];

      const { data, error } = await supabase
        .from("progress_photos")
        .select("*")
        .eq("client_id", targetId)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return data as ProgressPhoto[];
    },
    enabled: !!targetId,
  });
}

export function useUploadProgressPhoto() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ file, poseType, notes, recordedAt }: { 
      file: File; 
      poseType: ProgressPhoto['pose_type']; 
      notes?: string;
      recordedAt?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Upload to Azure via edge function
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientId", user.id);
      formData.append("poseType", poseType);

      const { data: uploadData, error: uploadError } = await supabase.functions.invoke(
        "upload-progress-photo",
        { body: formData }
      );

      if (uploadError) throw uploadError;
      if (!uploadData?.photoUrl) throw new Error("Failed to get photo URL");

      // Save to database
      const { data, error } = await supabase
        .from("progress_photos")
        .insert({
          client_id: user.id,
          photo_url: uploadData.photoUrl,
          pose_type: poseType,
          notes,
          recorded_at: recordedAt || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress-photos", user?.id] });
    },
  });
}

export function useClientGoals(clientId?: string) {
  const { user } = useAuth();
  const targetId = clientId || user?.id;

  return useQuery({
    queryKey: ["client-goals", targetId],
    queryFn: async () => {
      if (!targetId) return [];

      const { data, error } = await supabase
        .from("client_goals")
        .select("*")
        .eq("client_id", targetId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ClientGoal[];
    },
    enabled: !!targetId,
  });
}

export function useAddGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (goal: GoalInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_goals")
        .insert({
          ...goal,
          client_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-goals", user?.id] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClientGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from("client_goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-goals", user?.id] });
    },
  });
}

// Progress calculation utilities
export function calculateWeightProgress(measurements: ClientMeasurement[], targetWeight?: number | null) {
  if (!measurements.length) return null;

  const sorted = [...measurements].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  const change = latest.weight_kg - first.weight_kg;

  return {
    startWeight: first.weight_kg,
    currentWeight: latest.weight_kg,
    change,
    changePercent: ((change / first.weight_kg) * 100).toFixed(1),
    targetWeight,
    progressToGoal: targetWeight 
      ? Math.min(100, Math.abs((first.weight_kg - latest.weight_kg) / (first.weight_kg - targetWeight) * 100))
      : null,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
  };
}

export function getLatestMeasurement(measurements: ClientMeasurement[]) {
  if (!measurements.length) return null;
  return [...measurements].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  )[0];
}
