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
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_resource_id: string | null
          target_resource_type: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_resource_id?: string | null
          target_resource_type?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_resource_id?: string | null
          target_resource_type?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      checkin_templates: {
        Row: {
          client_id: string | null
          coach_id: string
          created_at: string
          description: string | null
          frequency_days: number
          id: string
          is_active: boolean
          name: string
          required_fields: Json
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          coach_id: string
          created_at?: string
          description?: string | null
          frequency_days?: number
          id?: string
          is_active?: boolean
          name?: string
          required_fields?: Json
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          coach_id?: string
          created_at?: string
          description?: string | null
          frequency_days?: number
          id?: string
          is_active?: boolean
          name?: string
          required_fields?: Json
          updated_at?: string
        }
        Relationships: []
      }
      client_checkins: {
        Row: {
          challenges: string | null
          checkin_date: string
          client_id: string
          coach_feedback: string | null
          coach_id: string | null
          coach_rating: number | null
          created_at: string
          diet_adherence: number | null
          diet_notes: string | null
          energy_level: number | null
          general_notes: string | null
          id: string
          measurement_id: string | null
          mood_rating: number | null
          next_checkin_date: string | null
          period_end: string | null
          period_start: string | null
          photo_ids: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          sleep_quality: number | null
          status: string
          stress_level: number | null
          submitted_at: string | null
          template_id: string | null
          updated_at: string
          wins: string | null
          workout_adherence: number | null
          workout_notes: string | null
        }
        Insert: {
          challenges?: string | null
          checkin_date?: string
          client_id: string
          coach_feedback?: string | null
          coach_id?: string | null
          coach_rating?: number | null
          created_at?: string
          diet_adherence?: number | null
          diet_notes?: string | null
          energy_level?: number | null
          general_notes?: string | null
          id?: string
          measurement_id?: string | null
          mood_rating?: number | null
          next_checkin_date?: string | null
          period_end?: string | null
          period_start?: string | null
          photo_ids?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sleep_quality?: number | null
          status?: string
          stress_level?: number | null
          submitted_at?: string | null
          template_id?: string | null
          updated_at?: string
          wins?: string | null
          workout_adherence?: number | null
          workout_notes?: string | null
        }
        Update: {
          challenges?: string | null
          checkin_date?: string
          client_id?: string
          coach_feedback?: string | null
          coach_id?: string | null
          coach_rating?: number | null
          created_at?: string
          diet_adherence?: number | null
          diet_notes?: string | null
          energy_level?: number | null
          general_notes?: string | null
          id?: string
          measurement_id?: string | null
          mood_rating?: number | null
          next_checkin_date?: string | null
          period_end?: string | null
          period_start?: string | null
          photo_ids?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sleep_quality?: number | null
          status?: string
          stress_level?: number | null
          submitted_at?: string | null
          template_id?: string | null
          updated_at?: string
          wins?: string | null
          workout_adherence?: number | null
          workout_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_checkins_measurement_id_fkey"
            columns: ["measurement_id"]
            isOneToOne: false
            referencedRelation: "client_measurements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_checkins_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checkin_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_goals: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          starting_value: number | null
          status: string
          target_date: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type: string
          id?: string
          starting_value?: number | null
          status?: string
          target_date?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          starting_value?: number | null
          status?: string
          target_date?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_measurements: {
        Row: {
          body_fat_pct: number | null
          chest_cm: number | null
          client_id: string
          created_at: string
          hips_cm: number | null
          id: string
          left_arm_cm: number | null
          left_calf_cm: number | null
          left_thigh_cm: number | null
          muscle_mass_kg: number | null
          neck_cm: number | null
          notes: string | null
          recorded_at: string
          right_arm_cm: number | null
          right_calf_cm: number | null
          right_thigh_cm: number | null
          shoulders_cm: number | null
          updated_at: string
          waist_cm: number | null
          weight_kg: number
        }
        Insert: {
          body_fat_pct?: number | null
          chest_cm?: number | null
          client_id: string
          created_at?: string
          hips_cm?: number | null
          id?: string
          left_arm_cm?: number | null
          left_calf_cm?: number | null
          left_thigh_cm?: number | null
          muscle_mass_kg?: number | null
          neck_cm?: number | null
          notes?: string | null
          recorded_at?: string
          right_arm_cm?: number | null
          right_calf_cm?: number | null
          right_thigh_cm?: number | null
          shoulders_cm?: number | null
          updated_at?: string
          waist_cm?: number | null
          weight_kg: number
        }
        Update: {
          body_fat_pct?: number | null
          chest_cm?: number | null
          client_id?: string
          created_at?: string
          hips_cm?: number | null
          id?: string
          left_arm_cm?: number | null
          left_calf_cm?: number | null
          left_thigh_cm?: number | null
          muscle_mass_kg?: number | null
          neck_cm?: number | null
          notes?: string | null
          recorded_at?: string
          right_arm_cm?: number | null
          right_calf_cm?: number | null
          right_thigh_cm?: number | null
          shoulders_cm?: number | null
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number
        }
        Relationships: []
      }
      client_nutrition_logs: {
        Row: {
          calories: number | null
          carbs_grams: number | null
          client_id: string
          created_at: string
          custom_food_name: string | null
          fat_grams: number | null
          food_id: string | null
          id: string
          log_date: string
          meal_type: string
          notes: string | null
          protein_grams: number | null
          quantity: number
          recipe_id: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          calories?: number | null
          carbs_grams?: number | null
          client_id: string
          created_at?: string
          custom_food_name?: string | null
          fat_grams?: number | null
          food_id?: string | null
          id?: string
          log_date?: string
          meal_type: string
          notes?: string | null
          protein_grams?: number | null
          quantity?: number
          recipe_id?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          calories?: number | null
          carbs_grams?: number | null
          client_id?: string
          created_at?: string
          custom_food_name?: string | null
          fat_grams?: number | null
          food_id?: string | null
          id?: string
          log_date?: string
          meal_type?: string
          notes?: string | null
          protein_grams?: number | null
          quantity?: number
          recipe_id?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_nutrition_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_nutrition_logs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          coach_id: string | null
          created_at: string
          current_weight_kg: number | null
          dietary_restrictions: string[] | null
          email_checkin_reviewed: boolean
          email_checkin_submitted: boolean
          email_plan_assigned: boolean
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
          email_checkin_reviewed?: boolean
          email_checkin_submitted?: boolean
          email_plan_assigned?: boolean
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
          email_checkin_reviewed?: boolean
          email_checkin_submitted?: boolean
          email_plan_assigned?: boolean
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
      coach_client_notes: {
        Row: {
          client_id: string
          coach_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          note_type: string
          priority: string | null
          reference_date: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          note_type?: string
          priority?: string | null
          reference_date?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          note_type?: string
          priority?: string | null
          reference_date?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
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
          email_checkin_received: boolean
          email_plan_assigned: boolean
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
          email_checkin_received?: boolean
          email_plan_assigned?: boolean
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
          email_checkin_received?: boolean
          email_plan_assigned?: boolean
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
      coaching_requests: {
        Row: {
          client_id: string
          coach_id: string
          coach_response: string | null
          created_at: string
          id: string
          message: string | null
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          coach_response?: string | null
          created_at?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          coach_response?: string | null
          created_at?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      diet_plan_meals: {
        Row: {
          calories: number | null
          carbs_grams: number | null
          created_at: string
          fat_grams: number | null
          food_suggestions: string[] | null
          id: string
          meal_name: string
          meal_number: number
          notes: string | null
          plan_id: string
          protein_grams: number | null
          time_suggestion: string | null
        }
        Insert: {
          calories?: number | null
          carbs_grams?: number | null
          created_at?: string
          fat_grams?: number | null
          food_suggestions?: string[] | null
          id?: string
          meal_name: string
          meal_number: number
          notes?: string | null
          plan_id: string
          protein_grams?: number | null
          time_suggestion?: string | null
        }
        Update: {
          calories?: number | null
          carbs_grams?: number | null
          created_at?: string
          fat_grams?: number | null
          food_suggestions?: string[] | null
          id?: string
          meal_name?: string
          meal_number?: number
          notes?: string | null
          plan_id?: string
          protein_grams?: number | null
          time_suggestion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_plan_meals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_plans: {
        Row: {
          calories_target: number | null
          carbs_grams: number | null
          created_at: string
          created_by: string | null
          description: string | null
          dietary_type: string | null
          fat_grams: number | null
          goal: string | null
          id: string
          is_active: boolean
          is_system: boolean
          meals_per_day: number | null
          name: string
          notes: string | null
          protein_grams: number | null
          updated_at: string
        }
        Insert: {
          calories_target?: number | null
          carbs_grams?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dietary_type?: string | null
          fat_grams?: number | null
          goal?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          meals_per_day?: number | null
          name: string
          notes?: string | null
          protein_grams?: number | null
          updated_at?: string
        }
        Update: {
          calories_target?: number | null
          carbs_grams?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dietary_type?: string | null
          fat_grams?: number | null
          goal?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          meals_per_day?: number | null
          name?: string
          notes?: string | null
          protein_grams?: number | null
          updated_at?: string
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
      food_alternatives: {
        Row: {
          alternative_food_id: string
          created_at: string
          food_id: string
          id: string
          notes: string | null
          reason: string | null
        }
        Insert: {
          alternative_food_id: string
          created_at?: string
          food_id: string
          id?: string
          notes?: string | null
          reason?: string | null
        }
        Update: {
          alternative_food_id?: string
          created_at?: string
          food_id?: string
          id?: string
          notes?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_alternatives_alternative_food_id_fkey"
            columns: ["alternative_food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_alternatives_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          barcode: string | null
          brand: string | null
          calories_per_100g: number
          carbs_per_100g: number
          category: string
          created_at: string
          created_by: string | null
          default_serving_size: number
          default_serving_unit: string
          fat_per_100g: number
          fiber_per_100g: number | null
          id: string
          image_url: string | null
          is_system: boolean
          name: string
          notes: string | null
          protein_per_100g: number
          sodium_mg_per_100g: number | null
          subcategory: string | null
          sugar_per_100g: number | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number
          carbs_per_100g?: number
          category: string
          created_at?: string
          created_by?: string | null
          default_serving_size?: number
          default_serving_unit?: string
          fat_per_100g?: number
          fiber_per_100g?: number | null
          id?: string
          image_url?: string | null
          is_system?: boolean
          name: string
          notes?: string | null
          protein_per_100g?: number
          sodium_mg_per_100g?: number | null
          subcategory?: string | null
          sugar_per_100g?: number | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number
          carbs_per_100g?: number
          category?: string
          created_at?: string
          created_by?: string | null
          default_serving_size?: number
          default_serving_unit?: string
          fat_per_100g?: number
          fiber_per_100g?: number | null
          id?: string
          image_url?: string | null
          is_system?: boolean
          name?: string
          notes?: string | null
          protein_per_100g?: number
          sodium_mg_per_100g?: number | null
          subcategory?: string | null
          sugar_per_100g?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      meal_food_items: {
        Row: {
          calculated_calories: number | null
          calculated_carbs: number | null
          calculated_fat: number | null
          calculated_protein: number | null
          created_at: string
          food_id: string | null
          id: string
          meal_id: string
          notes: string | null
          order_index: number
          quantity: number
          recipe_id: string | null
          unit: string
        }
        Insert: {
          calculated_calories?: number | null
          calculated_carbs?: number | null
          calculated_fat?: number | null
          calculated_protein?: number | null
          created_at?: string
          food_id?: string | null
          id?: string
          meal_id: string
          notes?: string | null
          order_index?: number
          quantity?: number
          recipe_id?: string | null
          unit?: string
        }
        Update: {
          calculated_calories?: number | null
          calculated_carbs?: number | null
          calculated_fat?: number | null
          calculated_protein?: number | null
          created_at?: string
          food_id?: string | null
          id?: string
          meal_id?: string
          notes?: string | null
          order_index?: number
          quantity?: number
          recipe_id?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_food_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_food_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "diet_plan_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_food_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_template_items: {
        Row: {
          created_at: string
          food_id: string | null
          id: string
          order_index: number
          quantity: number
          recipe_id: string | null
          template_id: string
          unit: string
        }
        Insert: {
          created_at?: string
          food_id?: string | null
          id?: string
          order_index?: number
          quantity?: number
          recipe_id?: string | null
          template_id: string
          unit?: string
        }
        Update: {
          created_at?: string
          food_id?: string | null
          id?: string
          order_index?: number
          quantity?: number
          recipe_id?: string | null
          template_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_template_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_template_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "meal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_system: boolean
          name: string
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_assignments: {
        Row: {
          client_id: string
          client_notes: string | null
          coach_id: string
          coach_notes: string | null
          created_at: string
          diet_plan_id: string | null
          end_date: string | null
          id: string
          plan_type: string
          start_date: string
          status: string
          updated_at: string
          workout_template_id: string | null
        }
        Insert: {
          client_id: string
          client_notes?: string | null
          coach_id: string
          coach_notes?: string | null
          created_at?: string
          diet_plan_id?: string | null
          end_date?: string | null
          id?: string
          plan_type: string
          start_date: string
          status?: string
          updated_at?: string
          workout_template_id?: string | null
        }
        Update: {
          client_id?: string
          client_notes?: string | null
          coach_id?: string
          coach_notes?: string | null
          created_at?: string
          diet_plan_id?: string | null
          end_date?: string | null
          id?: string
          plan_type?: string
          start_date?: string
          status?: string
          updated_at?: string
          workout_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_assignments_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_assignments_workout_template_id_fkey"
            columns: ["workout_template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
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
          onboarding_completed: boolean | null
          onboarding_step: number | null
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
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
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
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_private: boolean
          notes: string | null
          photo_url: string
          pose_type: string
          recorded_at: string
          thumbnail_url: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_private?: boolean
          notes?: string | null
          photo_url: string
          pose_type: string
          recorded_at?: string
          thumbnail_url?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_private?: boolean
          notes?: string | null
          photo_url?: string
          pose_type?: string
          recorded_at?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          food_id: string
          id: string
          notes: string | null
          order_index: number
          quantity: number
          recipe_id: string
          unit: string
        }
        Insert: {
          created_at?: string
          food_id: string
          id?: string
          notes?: string | null
          order_index?: number
          quantity?: number
          recipe_id: string
          unit?: string
        }
        Update: {
          created_at?: string
          food_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          quantity?: number
          recipe_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          calories_per_serving: number | null
          carbs_per_serving: number | null
          category: string | null
          cook_time_minutes: number | null
          created_at: string
          created_by: string | null
          description: string | null
          fat_per_serving: number | null
          fiber_per_serving: number | null
          id: string
          image_url: string | null
          instructions: string | null
          is_system: boolean
          name: string
          prep_time_minutes: number | null
          protein_per_serving: number | null
          servings: number
          total_weight_g: number | null
          updated_at: string
        }
        Insert: {
          calories_per_serving?: number | null
          carbs_per_serving?: number | null
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fat_per_serving?: number | null
          fiber_per_serving?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_system?: boolean
          name: string
          prep_time_minutes?: number | null
          protein_per_serving?: number | null
          servings?: number
          total_weight_g?: number | null
          updated_at?: string
        }
        Update: {
          calories_per_serving?: number | null
          carbs_per_serving?: number | null
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fat_per_serving?: number | null
          fiber_per_serving?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_system?: boolean
          name?: string
          prep_time_minutes?: number | null
          protein_per_serving?: number | null
          servings?: number
          total_weight_g?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
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
      workout_log_exercises: {
        Row: {
          created_at: string
          exercise_id: string | null
          exercise_name: string
          id: string
          notes: string | null
          order_index: number
          set_data: Json | null
          sets_completed: number
          workout_log_id: string
        }
        Insert: {
          created_at?: string
          exercise_id?: string | null
          exercise_name: string
          id?: string
          notes?: string | null
          order_index?: number
          set_data?: Json | null
          sets_completed?: number
          workout_log_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          notes?: string | null
          order_index?: number
          set_data?: Json | null
          sets_completed?: number
          workout_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_log_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_log_exercises_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          assignment_id: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          perceived_effort: number | null
          satisfaction_rating: number | null
          started_at: string | null
          status: string
          template_day_id: string | null
          template_id: string | null
          updated_at: string
          workout_date: string
        }
        Insert: {
          assignment_id?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          perceived_effort?: number | null
          satisfaction_rating?: number | null
          started_at?: string | null
          status?: string
          template_day_id?: string | null
          template_id?: string | null
          updated_at?: string
          workout_date?: string
        }
        Update: {
          assignment_id?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          perceived_effort?: number | null
          satisfaction_rating?: number | null
          started_at?: string | null
          status?: string
          template_day_id?: string | null
          template_id?: string | null
          updated_at?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "plan_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_template_day_id_fkey"
            columns: ["template_day_id"]
            isOneToOne: false
            referencedRelation: "workout_template_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
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
          template_type: Database["public"]["Enums"]["template_type"] | null
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
          template_type?: Database["public"]["Enums"]["template_type"] | null
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
          template_type?: Database["public"]["Enums"]["template_type"] | null
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
      assign_super_admin_by_email: {
        Args: { target_email: string }
        Returns: string
      }
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
      list_super_admins: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          user_id: string
        }[]
      }
      revoke_super_admin_by_email: {
        Args: { target_email: string }
        Returns: string
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
      template_type:
        | "push_pull_legs"
        | "upper_lower"
        | "full_body"
        | "bro_split"
        | "strength"
        | "hypertrophy"
        | "powerbuilding"
        | "sport_specific"
        | "cardio_conditioning"
        | "functional"
        | "bodyweight"
        | "beginner"
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
      template_type: [
        "push_pull_legs",
        "upper_lower",
        "full_body",
        "bro_split",
        "strength",
        "hypertrophy",
        "powerbuilding",
        "sport_specific",
        "cardio_conditioning",
        "functional",
        "bodyweight",
        "beginner",
      ],
    },
  },
} as const
