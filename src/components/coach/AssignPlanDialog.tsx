import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAssignPlan } from "@/hooks/usePlanAssignments";
import { useWorkoutTemplates } from "@/hooks/useWorkoutTemplates";
import { toast } from "sonner";
import { Loader2, ClipboardList, Dumbbell, UtensilsCrossed } from "lucide-react";

const assignmentSchema = z.object({
  plan_type: z.enum(['workout', 'diet']),
  workout_template_id: z.string().optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  notes: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export function AssignPlanDialog({ open, onOpenChange, clientId, clientName }: AssignPlanDialogProps) {
  const assignPlan = useAssignPlan();
  const { data: templates = [], isLoading: loadingTemplates } = useWorkoutTemplates();

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      plan_type: 'workout',
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  const planType = form.watch("plan_type");

  const onSubmit = async (data: AssignmentFormData) => {
    try {
        return;
      }

      await assignPlan.mutateAsync({
        clientId,
        planType: data.plan_type,
        workoutTemplateId: data.workout_template_id,
        startDate: data.start_date,
        endDate: data.end_date,
        notes: data.notes,
      });

      toast.success(`${data.plan_type === 'workout' ? 'Workout' : 'Diet'} plan assigned! Client will be notified.`);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to assign plan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Assign Plan
          </DialogTitle>
          <DialogDescription>
            Assign a workout or diet plan to {clientName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Plan Type */}
          <div className="space-y-2">
            <Label>Plan Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => form.setValue("plan_type", "workout")}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  planType === 'workout' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Dumbbell className={`w-6 h-6 mb-2 ${planType === 'workout' ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-medium">Workout Plan</p>
                <p className="text-xs text-muted-foreground">Assign workout templates</p>
              </button>
              <button
                type="button"
                onClick={() => form.setValue("plan_type", "diet")}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  planType === 'diet' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <UtensilsCrossed className={`w-6 h-6 mb-2 ${planType === 'diet' ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-medium">Diet Plan</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
                <Badge variant="secondary" className="mt-2 text-xs">Soon</Badge>
              </button>
            </div>
          </div>

          {/* Workout Template Selection */}
          {planType === 'workout' && (
            <div className="space-y-2">
              <Label>Select Workout Template</Label>
              <Select 
                value={form.watch("workout_template_id")} 
                onValueChange={(value) => form.setValue("workout_template_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingTemplates ? (
                    <div className="p-2 text-center">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    </div>
                  ) : templates.length > 0 ? (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <span>{template.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {template.days_per_week}d/wk
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground text-sm">
                      No templates available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Diet Plan Placeholder */}
          {planType === 'diet' && (
            <div className="p-6 rounded-lg border border-dashed border-border text-center">
              <UtensilsCrossed className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Diet plans are coming soon. You'll be able to create and assign custom nutrition plans.
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                {...form.register("start_date")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (optional)</Label>
              <Input
                id="end_date"
                type="date"
                {...form.register("end_date")}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes for Client (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes..."
              {...form.register("notes")}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={assignPlan.isPending || (planType === 'diet')}
            >
              {assignPlan.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Assign Plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
