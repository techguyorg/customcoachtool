import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Search, Dumbbell, Calendar, UtensilsCrossed, ChefHat, Apple, Loader2, Plus } from "lucide-react";

// Import dialogs for creating content
import { CreateExerciseDialog } from "@/components/exercises/CreateExerciseDialog";
import { CreateWorkoutTemplateDialog } from "@/components/templates/CreateWorkoutTemplateDialog";
import { CreateDietPlanDialog } from "@/components/diet/CreateDietPlanDialog";
import { RecipeBuilderDialog } from "@/components/diet/RecipeBuilderDialog";
import { CustomFoodDialog } from "@/components/diet/CustomFoodDialog";

export function SystemContentManager() {
  const [activeTab, setActiveTab] = useState("exercises");
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
  
  const filtered = (exercises || []).filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 20).map((ex) => (
                    <TableRow key={ex.id}>
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
    </Card>
  );
}

function WorkoutsTab({ search, setSearch }: TabProps) {
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
  
  const filtered = (templates || []).filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {t.template_type?.replace("_", " ") || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.days_per_week} days</TableCell>
                      <TableCell className="capitalize">{t.difficulty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DietsTab({ search, setSearch }: TabProps) {
  const [showCreate, setShowCreate] = useState(false);
  
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {p.dietary_type || "Standard"}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.calories_target || "—"} kcal</TableCell>
                      <TableCell>{p.meals_per_day || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecipesTab({ search, setSearch }: TabProps) {
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
          <RecipeBuilderDialog />
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {r.category || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.calories_per_serving || "—"} kcal</TableCell>
                      <TableCell>{r.servings}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FoodsTab({ search, setSearch }: TabProps) {
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
