import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useClientAssignments, useUpdateAssignment, type PlanAssignmentWithDetails } from "@/hooks/usePlanAssignments";
import { Dumbbell, Utensils, Calendar, PlayCircle, PauseCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { format, differenceInDays, differenceInWeeks } from "date-fns";
import { toast } from "sonner";

interface MyPlansSectionProps {
  planType?: "workout" | "diet" | "all";
  title?: string;
}

export function MyPlansSection({ planType = "all", title = "My Active Plans" }: MyPlansSectionProps) {
  const { data: assignments, isLoading } = useClientAssignments();
  const updateAssignment = useUpdateAssignment();

  const activePlans = assignments?.filter(a => {
    if (a.status !== "active") return false;
    if (planType === "all") return true;
    return a.plan_type === planType;
  }) || [];

  const handlePause = (id: string) => {
    updateAssignment.mutate(
      { id, status: "paused" },
      {
        onSuccess: () => toast.success("Plan paused"),
        onError: () => toast.error("Failed to pause plan"),
      }
    );
  };

  const handleResume = (id: string) => {
    updateAssignment.mutate(
      { id, status: "active" },
      {
        onSuccess: () => toast.success("Plan resumed"),
        onError: () => toast.error("Failed to resume plan"),
      }
    );
  };

  const handleComplete = (id: string) => {
    updateAssignment.mutate(
      { id, status: "completed" },
      {
        onSuccess: () => toast.success("Plan marked as complete! Great job! 🎉"),
        onError: () => toast.error("Failed to complete plan"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activePlans.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <PlayCircle className="w-5 h-5 text-primary" />
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {activePlans.map((plan) => (
          <ActivePlanCard
            key={plan.id}
            plan={plan}
            onPause={() => handlePause(plan.id)}
            onComplete={() => handleComplete(plan.id)}
            isPending={updateAssignment.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function ActivePlanCard({
  plan,
  onPause,
  onComplete,
  isPending,
}: {
  plan: PlanAssignmentWithDetails;
  onPause: () => void;
  onComplete: () => void;
  isPending: boolean;
}) {
  const isWorkout = plan.plan_type === "workout";
  const planDetails = isWorkout ? plan.workout_template : plan.diet_plan;
  const Icon = isWorkout ? Dumbbell : Utensils;
  
  const startDate = new Date(plan.start_date);
  const daysActive = differenceInDays(new Date(), startDate);
  const weeksActive = differenceInWeeks(new Date(), startDate);
  
  // Calculate progress if there's an end date or duration
  let progress = 0;
  let totalDuration = "";
  if (plan.end_date) {
    const endDate = new Date(plan.end_date);
    const totalDays = differenceInDays(endDate, startDate);
    progress = Math.min(100, Math.round((daysActive / totalDays) * 100));
    totalDuration = `${differenceInWeeks(endDate, startDate)} weeks`;
  } else if (isWorkout && plan.workout_template?.duration_weeks) {
    const totalDays = plan.workout_template.duration_weeks * 7;
    progress = Math.min(100, Math.round((daysActive / totalDays) * 100));
    totalDuration = `${plan.workout_template.duration_weeks} weeks`;
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{planDetails?.name || "Untitled Plan"}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {isWorkout ? "Workout" : "Diet"}
                </Badge>
                {isWorkout && plan.workout_template?.difficulty && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {plan.workout_template.difficulty}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Started {format(startDate, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {weeksActive > 0 ? `${weeksActive} week${weeksActive > 1 ? "s" : ""} ` : ""}
              {daysActive % 7 > 0 || weeksActive === 0 ? `${daysActive % 7 || daysActive} day${(daysActive % 7 || daysActive) !== 1 ? "s" : ""}` : ""}
            </span>
          </div>
        </div>

        {totalDuration && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {totalDuration} program
            </p>
          </div>
        )}

        {isWorkout && plan.workout_template && (
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>{plan.workout_template.days_per_week} days/week</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onPause} disabled={isPending}>
            <PauseCircle className="w-4 h-4 mr-1" />
            Pause
          </Button>
          <Button variant="default" size="sm" className="flex-1" onClick={onComplete} disabled={isPending}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
