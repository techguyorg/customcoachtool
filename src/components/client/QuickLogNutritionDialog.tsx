import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddNutritionLog, type MealType } from "@/hooks/useNutritionLog";
import { useFoods } from "@/hooks/useFoods";
import { toast } from "sonner";
import { Loader2, Search, Apple } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface QuickLogNutritionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

export function QuickLogNutritionDialog({ open, onOpenChange }: QuickLogNutritionDialogProps) {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [customFoodName, setCustomFoodName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { data: foods = [] } = useFoods();
  const addNutritionLog = useAddNutritionLog();

  const filteredFoods = searchQuery.length >= 2
    ? foods.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
    : [];

  const handleSubmit = async () => {
    try {
      if (!selectedFood && !customFoodName) {
        toast.error("Please select a food or enter a custom name");
        return;
      }

      let calories = 0, protein = 0, carbs = 0, fat = 0;

      if (selectedFood) {
        const multiplier = quantity * (selectedFood.default_serving_size / 100);
        calories = Math.round(selectedFood.calories_per_100g * multiplier);
        protein = Math.round(selectedFood.protein_per_100g * multiplier);
        carbs = Math.round(selectedFood.carbs_per_100g * multiplier);
        fat = Math.round(selectedFood.fat_per_100g * multiplier);
      }

      await addNutritionLog.mutateAsync({
        log_date: format(new Date(), "yyyy-MM-dd"),
        meal_type: mealType,
        food_id: selectedFood?.id || null,
        recipe_id: null,
        custom_food_name: selectedFood ? null : customFoodName,
        quantity,
        unit: selectedFood?.default_serving_unit || "serving",
        calories,
        protein_grams: protein,
        carbs_grams: carbs,
        fat_grams: fat,
        notes: null,
      });

      toast.success("Food logged!");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to log food");
    }
  };

  const resetForm = () => {
    setMealType("breakfast");
    setSearchQuery("");
    setSelectedFood(null);
    setCustomFoodName("");
    setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Apple className="w-5 h-5" />
            Quick Log Food
          </DialogTitle>
          <DialogDescription>
            Log a food item without leaving the dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meal Type */}
          <div className="space-y-2">
            <Label>Meal</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Food Search */}
          <div className="space-y-2">
            <Label>Search Food</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedFood(null);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Search Results */}
          {filteredFoods.length > 0 && !selectedFood && (
            <ScrollArea className="h-32 border rounded-lg">
              <div className="p-2 space-y-1">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setSearchQuery(food.name);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm"
                  >
                    <span className="font-medium">{food.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {food.calories_per_100g} kcal/100g
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Custom Food Name (if no selection) */}
          {!selectedFood && searchQuery.length >= 2 && filteredFoods.length === 0 && (
            <div className="space-y-2">
              <Label>Custom Food Name</Label>
              <Input
                placeholder="Enter food name"
                value={customFoodName}
                onChange={(e) => setCustomFoodName(e.target.value)}
              />
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0.5}
                step={0.5}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24"
              />
              <span className="flex items-center text-sm text-muted-foreground">
                {selectedFood?.default_serving_unit || "serving(s)"}
              </span>
            </div>
          </div>

          {/* Selected Food Info */}
          {selectedFood && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium">{selectedFood.name}</p>
              <div className="flex gap-4 mt-1 text-muted-foreground">
                <span>{Math.round(selectedFood.calories_per_100g * quantity * (selectedFood.default_serving_size / 100))} kcal</span>
                <span>{Math.round(selectedFood.protein_per_100g * quantity * (selectedFood.default_serving_size / 100))}g P</span>
                <span>{Math.round(selectedFood.carbs_per_100g * quantity * (selectedFood.default_serving_size / 100))}g C</span>
                <span>{Math.round(selectedFood.fat_per_100g * quantity * (selectedFood.default_serving_size / 100))}g F</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={addNutritionLog.isPending}>
              {addNutritionLog.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Log Food
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
