import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, Loader2, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { useExercises } from "@/hooks/useExercises";

interface Exercise {
  id: string;
  name: string;
  primary_muscle: string;
  equipment: string;
  difficulty: string;
}

interface DayExercise {
  id: string;
  exercise_id: string | null;
  custom_exercise_name: string | null;
  sets_min: number;
  sets_max: number | null;
  reps_min: number;
  reps_max: number | null;
  rest_seconds_min: number | null;
  rest_seconds_max: number | null;
  notes: string | null;
  order_index: number;
  exercise?: Exercise | null;
}

interface Day {
  id: string;
  day_number: number;
  name: string;
  notes: string | null;
  exercises: DayExercise[];
}

interface Week {
  id: string;
  week_number: number;
  name: string | null;
  focus: string | null;
  notes: string | null;
  days: Day[];
}

interface WorkoutProgramEditorProps {
  templateId: string;
  onClose?: () => void;
}

export function WorkoutProgramEditor({ templateId, onClose }: WorkoutProgramEditorProps) {
  const queryClient = useQueryClient();
  const [addExerciseDialog, setAddExerciseDialog] = useState<{ dayId: string } | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [newSetsMin, setNewSetsMin] = useState(3);
  const [newSetsMax, setNewSetsMax] = useState<number | undefined>();
  const [newRepsMin, setNewRepsMin] = useState(8);
  const [newRepsMax, setNewRepsMax] = useState<number | undefined>(12);

  // Fetch template structure
  const { data: structure, isLoading } = useQuery({
    queryKey: ["template-structure", templateId],
    queryFn: async () => {
      return api.get<Week[]>(`/api/workouts/templates/${templateId}/structure`);
    },
  });

  // Fetch exercises for search
  const { data: allExercises } = useExercises({
    search: exerciseSearch,
    muscleGroup: "all",
    equipment: "all",
    difficulty: "all",
  });

  // Add exercise mutation
  const addExerciseMutation = useMutation({
    mutationFn: async ({
      dayId,
      exerciseId,
      customName,
      setsMin,
      setsMax,
      repsMin,
      repsMax,
    }: {
      dayId: string;
      exerciseId?: string;
      customName?: string;
      setsMin: number;
      setsMax?: number;
      repsMin: number;
      repsMax?: number;
    }) => {
      return api.post('/api/workouts/template-exercises', {
        day_id: dayId,
        exercise_id: exerciseId || null,
        custom_exercise_name: customName || null,
        sets_min: setsMin,
        sets_max: setsMax || null,
        reps_min: repsMin,
        reps_max: repsMax || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-structure", templateId] });
      queryClient.invalidateQueries({ queryKey: ["workout-template-detail", templateId] });
      toast.success("Exercise added");
      setAddExerciseDialog(null);
      setExerciseSearch("");
      setCustomExerciseName("");
    },
    onError: () => {
      toast.error("Failed to add exercise");
    },
  });

  // Remove exercise mutation
  const removeExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      return api.delete(`/api/workouts/template-exercises/${exerciseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-structure", templateId] });
      queryClient.invalidateQueries({ queryKey: ["workout-template-detail", templateId] });
      toast.success("Exercise removed");
    },
  });

  // Update day name mutation
  const updateDayMutation = useMutation({
    mutationFn: async ({ dayId, name }: { dayId: string; name: string }) => {
      return api.put(`/api/workouts/template-days/${dayId}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-structure", templateId] });
    },
  });

  const handleAddExercise = (exerciseId?: string) => {
    if (!addExerciseDialog) return;

    addExerciseMutation.mutate({
      dayId: addExerciseDialog.dayId,
      exerciseId,
      customName: exerciseId ? undefined : customExerciseName,
      setsMin: newSetsMin,
      setsMax: newSetsMax,
      repsMin: newRepsMin,
      repsMax: newRepsMax,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Program Structure</h2>
      </div>

      {structure && structure.length > 0 ? (
        <Accordion type="multiple" defaultValue={structure.map(w => w.id)} className="space-y-4">
          {structure.map((week) => (
            <AccordionItem
              key={week.id}
              value={week.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Week {week.week_number}</Badge>
                  <span className="font-medium">{week.name || `Week ${week.week_number}`}</span>
                  {week.focus && (
                    <span className="text-sm text-muted-foreground">• {week.focus}</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 mt-2">
                  {week.days.map((day) => (
                    <Card key={day.id}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-semibold flex items-center justify-center">
                              {day.day_number}
                            </div>
                            <CardTitle className="text-base">{day.name}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddExerciseDialog({ dayId: day.id })}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Exercise
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-4 pb-4">
                        {day.exercises.length > 0 ? (
                          <div className="space-y-2">
                            {day.exercises.map((ex, idx) => (
                              <div
                                key={ex.id}
                                className="flex items-center gap-3 py-2 px-3 bg-muted/50 rounded-lg group"
                              >
                                <span className="text-muted-foreground text-sm w-5">
                                  {idx + 1}.
                                </span>
                                <Dumbbell className="w-4 h-4 text-muted-foreground" />
                                <span className="flex-1 font-medium text-sm">
                                  {ex.exercise?.name || ex.custom_exercise_name || "Unknown"}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {ex.sets_min}{ex.sets_max && ex.sets_max !== ex.sets_min ? `-${ex.sets_max}` : ""} × {ex.reps_min}{ex.reps_max && ex.reps_max !== ex.reps_min ? `-${ex.reps_max}` : ""}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeExerciseMutation.mutate(ex.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No exercises added yet. Click "Add Exercise" to get started.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <Dumbbell className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No program structure defined yet</p>
        </div>
      )}

      {/* Add Exercise Dialog */}
      <Dialog open={!!addExerciseDialog} onOpenChange={(open) => !open && setAddExerciseDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
            <DialogDescription>
              Search for an exercise or add a custom one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Sets/Reps Config */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sets</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={newSetsMin}
                    onChange={(e) => setNewSetsMin(parseInt(e.target.value) || 1)}
                    placeholder="Min"
                  />
                  <span className="text-muted-foreground self-center">-</span>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={newSetsMax || ""}
                    onChange={(e) => setNewSetsMax(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Max"
                  />
                </div>
              </div>
              <div>
                <Label>Reps</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={newRepsMin}
                    onChange={(e) => setNewRepsMin(parseInt(e.target.value) || 1)}
                    placeholder="Min"
                  />
                  <span className="text-muted-foreground self-center">-</span>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={newRepsMax || ""}
                    onChange={(e) => setNewRepsMax(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Search Exercises */}
            <div>
              <Label>Search Exercises</Label>
              <Input
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Search by name..."
                className="mt-1"
              />
            </div>

            {exerciseSearch && allExercises && allExercises.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {allExercises.slice(0, 10).map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExercise(ex.id)}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center gap-2 border-b last:border-b-0"
                    disabled={addExerciseMutation.isPending}
                  >
                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{ex.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {ex.primary_muscle.replace(/_/g, " ")}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            <Separator />

            {/* Custom Exercise */}
            <div>
              <Label>Or Add Custom Exercise</Label>
              <p className="text-xs text-muted-foreground mb-2">
                For exercises not in our database
              </p>
              <div className="flex gap-2">
                <Input
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  placeholder="Custom exercise name..."
                  className="flex-1"
                />
                <Button
                  onClick={() => handleAddExercise()}
                  disabled={!customExerciseName.trim() || addExerciseMutation.isPending}
                >
                  {addExerciseMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
