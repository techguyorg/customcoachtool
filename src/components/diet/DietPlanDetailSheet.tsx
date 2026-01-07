import { Flame, Beef, Wheat, Droplet, Clock, Utensils, Play, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDietPlanWithMeals, DietPlan } from "@/hooks/useDietPlans";
import { useStartDietPlan } from "@/hooks/useStartProgram";

const goalLabels: Record<string, string> = {
  weight_loss: "Weight Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  performance: "Performance",
  general_health: "General Health",
};

const dietaryLabels: Record<string, string> = {
  standard: "Standard",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  keto: "Keto",
  paleo: "Paleo",
  mediterranean: "Mediterranean",
  low_carb: "Low Carb",
  high_protein: "High Protein",
};

interface Props {
  plan: DietPlan | null;
  onOpenChange: (open: boolean) => void;
}

export function DietPlanDetailSheet({ plan, onOpenChange }: Props) {
  const { data: planWithMeals } = useDietPlanWithMeals(plan?.id);
  const displayPlan = planWithMeals || plan;
  const startDietPlan = useStartDietPlan();

  const handleFollowPlan = () => {
    if (!plan?.id) return;
    startDietPlan.mutate({ dietPlanId: plan.id });
  };

  return (
    <Sheet open={!!plan} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {displayPlan && (
          <>
            <SheetHeader>
              <SheetTitle className="text-2xl">{displayPlan.name}</SheetTitle>
              <SheetDescription>{displayPlan.description}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Follow Plan Button */}
              <Button 
                className="w-full gap-2" 
                onClick={handleFollowPlan}
                disabled={startDietPlan.isPending}
              >
                {startDietPlan.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Follow This Plan
              </Button>

              <div className="flex flex-wrap gap-2">
                {displayPlan.goal && (
                  <Badge variant="secondary">{goalLabels[displayPlan.goal] || displayPlan.goal}</Badge>
                )}
                {displayPlan.dietary_type && (
                  <Badge variant="outline">{dietaryLabels[displayPlan.dietary_type] || displayPlan.dietary_type}</Badge>
                )}
                {displayPlan.is_system && <Badge>System Plan</Badge>}
              </div>

              {displayPlan.calories_target && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Daily Macros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                        <Flame className="h-5 w-5 text-orange-500 mb-2" />
                        <span className="text-xl font-bold">{displayPlan.calories_target}</span>
                        <span className="text-xs text-muted-foreground">kcal</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                        <Beef className="h-5 w-5 text-red-500 mb-2" />
                        <span className="text-xl font-bold">{displayPlan.protein_grams || 0}g</span>
                        <span className="text-xs text-muted-foreground">protein</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                        <Wheat className="h-5 w-5 text-amber-500 mb-2" />
                        <span className="text-xl font-bold">{displayPlan.carbs_grams || 0}g</span>
                        <span className="text-xs text-muted-foreground">carbs</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                        <Droplet className="h-5 w-5 text-yellow-500 mb-2" />
                        <span className="text-xl font-bold">{displayPlan.fat_grams || 0}g</span>
                        <span className="text-xs text-muted-foreground">fat</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Meal Structure ({displayPlan.meals_per_day} meals/day)
                </h3>

                <div className="space-y-3">
                  {displayPlan.meals && displayPlan.meals.length > 0 ? (
                    displayPlan.meals.map((meal) => (
                      <Card key={meal.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{meal.meal_name}</h4>
                              {meal.time_suggestion && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {meal.time_suggestion}
                                </p>
                              )}
                            </div>
                            {meal.calories && (
                              <Badge variant="outline">{meal.calories} kcal</Badge>
                            )}
                          </div>

                          {(meal.protein_grams || meal.carbs_grams || meal.fat_grams) && (
                            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                              {meal.protein_grams && <span>P: {meal.protein_grams}g</span>}
                              {meal.carbs_grams && <span>C: {meal.carbs_grams}g</span>}
                              {meal.fat_grams && <span>F: {meal.fat_grams}g</span>}
                            </div>
                          )}

                          {meal.notes && (
                            <p className="text-sm mt-2 text-muted-foreground">{meal.notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No meal details added yet</p>
                  )}
                </div>
              </div>

              {displayPlan.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground">{displayPlan.notes}</p>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
