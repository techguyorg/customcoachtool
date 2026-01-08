import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ClientProfileData {
  hasProfile: boolean;
  isComplete: boolean;
  missingFields: string[];
  profile: {
    height_cm: number | null;
    current_weight_kg: number | null;
    target_weight_kg: number | null;
    fitness_goals: string[] | null;
    fitness_level: string | null;
    medical_conditions: string | null;
    dietary_restrictions: string[] | null;
  } | null;
}

export function useClientProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-profile", user?.id],
    queryFn: async (): Promise<ClientProfileData> => {
      if (!user?.id) {
        return {
          hasProfile: false,
          isComplete: false,
          missingFields: [],
          profile: null,
        };
      }

      const { data, error } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          hasProfile: false,
          isComplete: false,
          missingFields: ["All profile information"],
          profile: null,
        };
      }

      // Check which critical fields are missing
      const missingFields: string[] = [];
      if (!data.fitness_level) missingFields.push("Fitness level");
      if (!data.fitness_goals || data.fitness_goals.length === 0) {
        missingFields.push("Fitness goals");
      }
      if (!data.current_weight_kg) missingFields.push("Current weight");

      return {
        hasProfile: true,
        isComplete: missingFields.length === 0,
        missingFields,
        profile: {
          height_cm: data.height_cm,
          current_weight_kg: data.current_weight_kg,
          target_weight_kg: data.target_weight_kg,
          fitness_goals: data.fitness_goals,
          fitness_level: data.fitness_level,
          medical_conditions: data.medical_conditions,
          dietary_restrictions: data.dietary_restrictions,
        },
      };
    },
    enabled: !!user?.id,
  });
}
