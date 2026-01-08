import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Dumbbell, Calendar, UtensilsCrossed, ChefHat, Apple, Loader2, Plus, Trash2, Edit, MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

// Import dialogs for creating content
import { CreateExerciseDialog } from "@/components/exercises/CreateExerciseDialog";
import { CreateWorkoutTemplateDialog } from "@/components/templates/CreateWorkoutTemplateDialog";
import { CreateDietPlanDialog } from "@/components/diet/CreateDietPlanDialog";
import { RecipeBuilderDialog } from "@/components/diet/RecipeBuilderDialog";
import { CustomFoodDialog } from "@/components/diet/CustomFoodDialog";

// Import detail sheets for viewing
import { ExerciseDetailSheet } from "@/components/exercises/ExerciseDetailSheet";
import { TemplateDetailSheet } from "@/components/templates/TemplateDetailSheet";
import { DietPlanDetailSheet } from "@/components/diet/DietPlanDetailSheet";
import { RecipeDetailSheet } from "@/components/diet/RecipeDetailSheet";

interface SystemContentManagerProps {
  initialTab?: string;
}

export function SystemContentManager({ initialTab = "exercises" }: SystemContentManagerProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="exercises" className="gap-2">
            <Dumbbell className="w-4 h-4" />
            <span className="hidden sm:inline">Exercises</span>
          </TabsTrigger>
          <TabsTrigger value="workouts" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Workouts</span>
          </TabsTrigger>
          <TabsTrigger value="diets" className="gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            <span className="hidden sm:inline">Diets</span>
          </TabsTrigger>
          <TabsTrigger value="recipes" className="gap-2">
            <ChefHat className="w-4 h-4" />
            <span className="hidden sm:inline">Recipes</span>
          </TabsTrigger>
          <TabsTrigger value="foods" className="gap-2">
            <Apple className="w-4 h-4" />
            <span className="hidden sm:inline">Foods</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="exercises">
            <ExercisesTab search={search} setSearch={setSearch} />
          </TabsContent>
          <TabsContent value="workouts">
            <WorkoutsTab search={search} setSearch={setSearch} />
          </TabsContent>
          <TabsContent value="diets">
            <DietsTab search={search} setSearch={setSearch} />
          </TabsContent>
          <TabsContent value="recipes">
            <RecipesTab search={search} setSearch={setSearch} />
          </TabsContent>
          <TabsContent value="foods">
            <FoodsTab search={search} setSearch={setSearch} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

interface TabProps {
  search: string;
  setSearch: (s: string) => void;
}

function ExercisesTab({ search, setSearch }: TabProps) {
  const queryClient = useQueryClient();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const { data: exercises, isLoading } = useQuery({
    queryKey: ["admin-exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("is_system", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exercises").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exercises"] });
      toast({ title: "Exercise deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete exercise", variant: "destructive" });
    },
  });
  
  const filtered = (exercises || []).filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (id: string) => {
    setSelectedExerciseId(id);
    setSheetOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Exercises</CardTitle>
            <CardDescription>Manage platform-wide exercise library</CardDescription>
          </div>
          <CreateExerciseDialog
            trigger={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Exercise
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <SearchInput value={search} onChange={setSearch} placeholder="Search exercises..." />
        
        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} system exercises
            </p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Muscle</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 20).map((ex) => (
                    <TableRow 
                      key={ex.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleView(ex.id)}
                    >
                      <TableCell className="font-medium">{ex.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {ex.primary_muscle.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {ex.equipment.replace("_", " ")}
                      </TableCell>
                      <TableCell className="capitalize">{ex.difficulty}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <ActionsMenu 
                          onView={() => handleView(ex.id)}
                          onDelete={() => deleteMutation.mutate(ex.id)}
                          itemName={ex.name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filtered.length > 20 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing 20 of {filtered.length} exercises
              </p>
            )}
          </div>
        )}
      </CardContent>
      
      <ExerciseDetailSheet 
        exerciseId={selectedExerciseId} 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
      />
    </Card>
  );
}

function WorkoutsTab({ search, setSearch }: TabProps) {
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const { data: templates, isLoading } = useQuery({
    queryKey: ["admin-workout-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_templates")
        .select("*")
        .eq("is_system", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workout_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workout-templates"] });
      toast({ title: "Workout template deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    },
  });
  
  const filtered = (templates || []).filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (id: string) => {
    setSelectedTemplateId(id);
    setSheetOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Workout Templates</CardTitle>
            <CardDescription>Manage platform-wide workout programs</CardDescription>
          </div>
          <CreateWorkoutTemplateDialog />
        </div>
      </CardHeader>
      <CardContent>
        <SearchInput value={search} onChange={setSearch} placeholder="Search templates..." />
        
        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} system templates
            </p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Days/Week</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow 
                      key={t.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleView(t.id)}
                    >
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {t.template_type?.replace("_", " ") || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.days_per_week} days</TableCell>
                      <TableCell className="capitalize">{t.difficulty}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <ActionsMenu 
                          onView={() => handleView(t.id)}
                          onDelete={() => deleteMutation.mutate(t.id)}
                          itemName={t.name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      
      <TemplateDetailSheet 
        templateId={selectedTemplateId} 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
      />
    </Card>
  );
}

function DietsTab({ search, setSearch }: TabProps) {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  const { data: plans, isLoading } = useQuery({
    queryKey: ["admin-diet-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("is_system", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diet_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-diet-plans"] });
      toast({ title: "Diet plan deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete diet plan", variant: "destructive" });
    },
  });
  
  const filtered = (plans || []).filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Diet Plans</CardTitle>
            <CardDescription>Manage platform-wide diet plans</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
          <CreateDietPlanDialog
            open={showCreate}
            onOpenChange={setShowCreate}
          />
        </div>
      </CardHeader>
      <CardContent>
        <SearchInput value={search} onChange={setSearch} placeholder="Search diet plans..." />
        
        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} system diet plans
            </p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Meals/Day</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow 
                      key={p.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPlan(p)}
                    >
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {p.dietary_type || "Standard"}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.calories_target || "—"} kcal</TableCell>
                      <TableCell>{p.meals_per_day || "—"}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <ActionsMenu 
                          onView={() => setSelectedPlan(p)}
                          onDelete={() => deleteMutation.mutate(p.id)}
                          itemName={p.name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      
      <DietPlanDetailSheet 
        plan={selectedPlan} 
        onOpenChange={(open) => !open && setSelectedPlan(null)} 
      />
    </Card>
  );
}

function RecipesTab({ search, setSearch }: TabProps) {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  
  const { data: recipes, isLoading } = useQuery({
    queryKey: ["admin-recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("is_system", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recipes"] });
      toast({ title: "Recipe deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete recipe", variant: "destructive" });
    },
  });
  
  const filtered = (recipes || []).filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Recipes</CardTitle>
            <CardDescription>Manage platform-wide recipe library</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Recipe
          </Button>
          <RecipeBuilderDialog open={showCreate} onOpenChange={setShowCreate} />
        </div>
      </CardHeader>
      <CardContent>
        <SearchInput value={search} onChange={setSearch} placeholder="Search recipes..." />
        
        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} system recipes
            </p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Servings</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow 
                      key={r.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedRecipe(r)}
                    >
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {r.category || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.calories_per_serving || "—"} kcal</TableCell>
                      <TableCell>{r.servings}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <ActionsMenu 
                          onView={() => setSelectedRecipe(r)}
                          onDelete={() => deleteMutation.mutate(r.id)}
                          itemName={r.name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      
      <RecipeDetailSheet 
        recipe={selectedRecipe} 
        onOpenChange={(open) => !open && setSelectedRecipe(null)} 
      />
    </Card>
  );
}

function FoodsTab({ search, setSearch }: TabProps) {
  const queryClient = useQueryClient();
  
  const { data: foods, isLoading } = useQuery({
    queryKey: ["admin-foods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .eq("is_system", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("foods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-foods"] });
      toast({ title: "Food deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete food", variant: "destructive" });
    },
  });
  
  const filtered = (foods || []).filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Foods</CardTitle>
            <CardDescription>Manage platform-wide food database</CardDescription>
          </div>
          <CustomFoodDialog />
        </div>
      </CardHeader>
      <CardContent>
        <SearchInput value={search} onChange={setSearch} placeholder="Search foods..." />
        
        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} system foods
            </p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Protein</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 20).map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {f.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{f.calories_per_100g} /100g</TableCell>
                      <TableCell>{f.protein_per_100g}g</TableCell>
                      <TableCell>
                        <ActionsMenu 
                          onDelete={() => deleteMutation.mutate(f.id)}
                          itemName={f.name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filtered.length > 20 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing 20 of {filtered.length} foods
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

interface ActionsMenuProps {
  onView?: () => void;
  onDelete: () => void;
  itemName: string;
}

function ActionsMenu({ onView, onDelete, itemName }: ActionsMenuProps) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onView && (
            <DropdownMenuItem onClick={onView} className="gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{itemName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this item from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
