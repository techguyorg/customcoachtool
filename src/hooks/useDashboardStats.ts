import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, endOfWeek, format, startOfDay, endOfDay, subDays, differenceInDays } from "date-fns";

export interface DashboardStats {
  workoutsThisWeek: number;
  totalWorkoutMinutes: number;
  caloriesLogged: number;
  currentStreak: number;
  nextCheckinDate: string | null;
  hasActiveWorkoutPlan: boolean;
  hasActiveDietPlan: boolean;
  todaysWorkout: {
    id: string;
    name: string;
    dayNumber: number;
  } | null;
  todaysDiet: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) {
        return getEmptyStats();
      }

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);

      // Fetch all data in parallel
      const [
        workoutLogsResult,
        nutritionLogResult,
        assignmentsResult,
        checkinTemplateResult,
      ] = await Promise.all([
        // Workout logs this week
        supabase
          .from("workout_logs")
          .select("id, status, duration_minutes, workout_date")
          .eq("client_id", user.id)
          .eq("status", "completed")
          .gte("workout_date", format(weekStart, "yyyy-MM-dd"))
          .lte("workout_date", format(weekEnd, "yyyy-MM-dd")),
        
        // Today's nutrition
        supabase
          .from("client_nutrition_logs")
          .select("calories")
          .eq("client_id", user.id)
          .gte("log_date", format(todayStart, "yyyy-MM-dd"))
          .lte("log_date", format(todayEnd, "yyyy-MM-dd")),

        // Active plan assignments
        supabase
          .from("plan_assignments")
          .select(`
            *,
            workout_template:workout_templates(id, name, days_per_week),
            diet_plan:diet_plans(id, name, calories_target, protein_grams, carbs_grams, fat_grams)
          `)
          .eq("client_id", user.id)
          .eq("status", "active"),

        // Check-in template
        supabase
          .from("checkin_templates")
          .select("frequency_days")
          .eq("client_id", user.id)
          .eq("is_active", true)
          .maybeSingle(),
      ]);

      // Calculate workouts this week
      const workoutsThisWeek = workoutLogsResult.data?.length || 0;
      const totalWorkoutMinutes = workoutLogsResult.data?.reduce(
        (sum, log) => sum + (log.duration_minutes || 0), 0
      ) || 0;

      // Calculate calories logged today
      const caloriesLogged = nutritionLogResult.data?.reduce(
        (sum, entry) => sum + (entry.calories || 0), 0
      ) || 0;

      // Calculate streak
      const currentStreak = await calculateStreak(user.id);

      // Next check-in - also check last submitted checkin
      let nextCheckinDate: string | null = null;
      if (checkinTemplateResult.data) {
        // Get the last submitted checkin to calculate from that date
        const { data: lastCheckin } = await supabase
          .from("client_checkins")
          .select("checkin_date")
          .eq("client_id", user.id)
          .eq("status", "submitted")
          .order("checkin_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        nextCheckinDate = calculateNextCheckinDate(
          checkinTemplateResult.data.frequency_days, 
          lastCheckin?.checkin_date
        );
      }

      // Active plans
      const assignments = assignmentsResult.data || [];
      const workoutAssignment = assignments.find(a => a.plan_type === "workout");
      const dietAssignment = assignments.find(a => a.plan_type === "diet");

      // Today's workout info
      let todaysWorkout = null;
      if (workoutAssignment?.workout_template) {
        const template = workoutAssignment.workout_template;
        const dayNumber = getDayOfProgram(workoutAssignment.start_date);
        todaysWorkout = {
          id: template.id,
          name: template.name,
          dayNumber,
        };
      }

      // Today's diet info
      let todaysDiet = null;
      if (dietAssignment?.diet_plan) {
        const plan = dietAssignment.diet_plan;
        todaysDiet = {
          id: plan.id,
          name: plan.name,
          calories: plan.calories_target || 0,
          protein: plan.protein_grams || 0,
          carbs: plan.carbs_grams || 0,
          fat: plan.fat_grams || 0,
        };
      }

      return {
        workoutsThisWeek,
        totalWorkoutMinutes,
        caloriesLogged,
        currentStreak,
        nextCheckinDate,
        hasActiveWorkoutPlan: !!workoutAssignment,
        hasActiveDietPlan: !!dietAssignment,
        todaysWorkout,
        todaysDiet,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

async function calculateStreak(userId: string): Promise<number> {
  const { data } = await supabase
    .from("workout_logs")
    .select("workout_date")
    .eq("client_id", userId)
    .eq("status", "completed")
    .order("workout_date", { ascending: false })
    .limit(30);

  if (!data || data.length === 0) return 0;

  const dates = [...new Set(data.map(d => d.workout_date))].sort().reverse();
  let streak = 0;
  let expectedDate = format(new Date(), "yyyy-MM-dd");

  // Check if there's a workout today
  if (dates[0] !== expectedDate) {
    // Check if there's one yesterday
    expectedDate = format(subDays(new Date(), 1), "yyyy-MM-dd");
    if (dates[0] !== expectedDate) {
      return 0; // Streak is broken
    }
  }

  for (const date of dates) {
    if (date === expectedDate) {
      streak++;
      expectedDate = format(subDays(new Date(expectedDate), 1), "yyyy-MM-dd");
    } else if (date < expectedDate) {
      break;
    }
  }

  return streak;
}

function calculateNextCheckinDate(frequencyDays: number, lastCheckinDate?: string | null): string {
  if (lastCheckinDate) {
    // Calculate from last check-in date
    const lastDate = new Date(lastCheckinDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + frequencyDays);
    
    // If next date is in the past, calculate from today
    const today = new Date();
    if (nextDate < today) {
      return format(today, "EEE, MMM d") + " (Overdue)";
    }
    return format(nextDate, "EEE, MMM d");
  }
  
  // No previous check-in, schedule for today or based on frequency
  const nextDate = new Date();
  return format(nextDate, "EEE, MMM d");
}

function getDayOfProgram(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const days = differenceInDays(today, start);
  return (days % 7) + 1; // 1-7
}

function getEmptyStats(): DashboardStats {
  return {
    workoutsThisWeek: 0,
    totalWorkoutMinutes: 0,
    caloriesLogged: 0,
    currentStreak: 0,
    nextCheckinDate: null,
    hasActiveWorkoutPlan: false,
    hasActiveDietPlan: false,
    todaysWorkout: null,
    todaysDiet: null,
  };
}
