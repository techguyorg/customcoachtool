export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      client_profiles: {
        Row: {
          coach_id: string | null
          created_at: string
          current_weight_kg: number | null
          dietary_restrictions: string[] | null
          fitness_goals: string[] | null
          fitness_level: string | null
          height_cm: number | null
          id: string
          medical_conditions: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          target_weight_kg: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          current_weight_kg?: number | null
          dietary_restrictions?: string[] | null
          fitness_goals?: string[] | null
          fitness_level?: string | null
          height_cm?: number | null
          id?: string
          medical_conditions?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          current_weight_kg?: number | null
          dietary_restrictions?: string[] | null
          fitness_goals?: string[] | null
          fitness_level?: string | null
          height_cm?: number | null
          id?: string
          medical_conditions?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_client_relationships: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coach_profiles: {
        Row: {
          certifications: string[] | null
          created_at: string
          currency: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_accepting_clients: boolean | null
          max_clients: number | null
          rating: number | null
          specializations: string[] | null
          stripe_account_id: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string
          currency?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_accepting_clients?: boolean | null
          max_clients?: number | null
          rating?: number | null
          specializations?: string[] | null
          stripe_account_id?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications?: string[] | null
          created_at?: string
          currency?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_accepting_clients?: boolean | null
          max_clients?: number | null
          rating?: number | null
          specializations?: string[] | null
          stripe_account_id?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_alternatives: {
        Row: {
          alternative_exercise_id: string
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
        }
        Insert: {
          alternative_exercise_id: string
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          alternative_exercise_id?: string
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_alternatives_alternative_exercise_id_fkey"
            columns: ["alternative_exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_alternatives_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          common_mistakes: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          equipment: Database["public"]["Enums"]["equipment_type"]
          exercise_type: Database["public"]["Enums"]["exercise_type"]
          id: string
          image_url: string | null
          instructions: string[] | null
          is_system: boolean
          name: string
          primary_muscle: Database["public"]["Enums"]["muscle_group"]
          secondary_muscles:
            | Database["public"]["Enums"]["muscle_group"][]
            | null
          tips: string[] | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          common_mistakes?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          equipment: Database["public"]["Enums"]["equipment_type"]
          exercise_type?: Database["public"]["Enums"]["exercise_type"]
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          is_system?: boolean
          name: string
          primary_muscle: Database["public"]["Enums"]["muscle_group"]
          secondary_muscles?:
            | Database["public"]["Enums"]["muscle_group"][]
            | null
          tips?: string[] | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          common_mistakes?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          equipment?: Database["public"]["Enums"]["equipment_type"]
          exercise_type?: Database["public"]["Enums"]["exercise_type"]
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          is_system?: boolean
          name?: string
          primary_muscle?: Database["public"]["Enums"]["muscle_group"]
          secondary_muscles?:
            | Database["public"]["Enums"]["muscle_group"][]
            | null
          tips?: string[] | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name: string
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_template_days: {
        Row: {
          created_at: string
          day_number: number
          id: string
          name: string
          notes: string | null
          template_id: string
          week_id: string | null
        }
        Insert: {
          created_at?: string
          day_number: number
          id?: string
          name: string
          notes?: string | null
          template_id: string
          week_id?: string | null
        }
        Update: {
          created_at?: string
          day_number?: number
          id?: string
          name?: string
          notes?: string | null
          template_id?: string
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_template_days_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_template_days_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "workout_template_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_template_exercises: {
        Row: {
          created_at: string
          custom_exercise_name: string | null
          day_id: string
          exercise_id: string | null
          id: string
          notes: string | null
          order_index: number
          reps_max: number | null
          reps_min: number
          rest_seconds_max: number | null
          rest_seconds_min: number | null
          sets_max: number | null
          sets_min: number
        }
        Insert: {
          created_at?: string
          custom_exercise_name?: string | null
          day_id: string
          exercise_id?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          reps_max?: number | null
          reps_min?: number
          rest_seconds_max?: number | null
          rest_seconds_min?: number | null
          sets_max?: number | null
          sets_min?: number
        }
        Update: {
          created_at?: string
          custom_exercise_name?: string | null
          day_id?: string
          exercise_id?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          reps_max?: number | null
          reps_min?: number
          rest_seconds_max?: number | null
          rest_seconds_min?: number | null
          sets_max?: number | null
          sets_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_template_exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "workout_template_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_template_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_template_weeks: {
        Row: {
          created_at: string
          focus: string | null
          id: string
          name: string | null
          notes: string | null
          template_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          focus?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          template_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          focus?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          template_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_template_weeks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          cloned_from: string | null
          created_at: string
          created_by: string | null
          days_per_week: number
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks: number | null
          goal: string | null
          id: string
          is_periodized: boolean
          is_system: boolean
          name: string
          updated_at: string
        }
        Insert: {
          cloned_from?: string | null
          created_at?: string
          created_by?: string | null
          days_per_week?: number
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          is_periodized?: boolean
          is_system?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          cloned_from?: string | null
          created_at?: string
          created_by?: string | null
          days_per_week?: number
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          is_periodized?: boolean
          is_system?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_cloned_from_fkey"
            columns: ["cloned_from"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_coach_of_client: {
        Args: { _client_id: string; _coach_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "coach" | "client"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      equipment_type:
        | "barbell"
        | "dumbbell"
        | "cable"
        | "machine"
        | "bodyweight"
        | "kettlebell"
        | "resistance_band"
        | "ez_bar"
        | "smith_machine"
        | "pull_up_bar"
        | "dip_station"
        | "bench"
        | "cardio_machine"
        | "other"
      exercise_type:
        | "compound"
        | "isolation"
        | "cardio"
        | "plyometric"
        | "stretching"
      muscle_group:
        | "chest"
        | "back"
        | "shoulders"
        | "biceps"
        | "triceps"
        | "forearms"
        | "quadriceps"
        | "hamstrings"
        | "glutes"
        | "calves"
        | "abs"
        | "obliques"
        | "lower_back"
        | "traps"
        | "lats"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "coach", "client"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      equipment_type: [
        "barbell",
        "dumbbell",
        "cable",
        "machine",
        "bodyweight",
        "kettlebell",
        "resistance_band",
        "ez_bar",
        "smith_machine",
        "pull_up_bar",
        "dip_station",
        "bench",
        "cardio_machine",
        "other",
      ],
      exercise_type: [
        "compound",
        "isolation",
        "cardio",
        "plyometric",
        "stretching",
      ],
      muscle_group: [
        "chest",
        "back",
        "shoulders",
        "biceps",
        "triceps",
        "forearms",
        "quadriceps",
        "hamstrings",
        "glutes",
        "calves",
        "abs",
        "obliques",
        "lower_back",
        "traps",
        "lats",
      ],
    },
  },
} as const
