import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateFilters } from "@/components/templates/TemplateFilters";
import { TemplateDetailSheet } from "@/components/templates/TemplateDetailSheet";
import { CreateWorkoutTemplateDialog } from "@/components/templates/CreateWorkoutTemplateDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Search, Library, User } from "lucide-react";
import type { TemplateFilters as Filters } from "@/hooks/useWorkoutTemplates";

export default function CoachWorkoutProgramsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>({
    search: "",
    templateType: "all",
    difficulty: "all",
    daysPerWeek: "all",
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my-programs");

  // Fetch coach's own programs
  const { data: myPrograms, isLoading: loadingMy } = useQuery({
    queryKey: ["coach-workout-templates", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("workout_templates")
        .select(`
          *,
          workout_template_weeks(count),
          workout_template_days(count)
        `)
        .eq("created_by", user.id)
        .eq("is_system", false)
        .order("created_at", { ascending: false });

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,goal.ilike.%${filters.search}%`);
      }

      if (filters.templateType !== "all") {
        query = query.eq("template_type", filters.templateType);
      }

      if (filters.difficulty !== "all") {
        query = query.eq("difficulty", filters.difficulty);
      }

      if (filters.daysPerWeek !== "all") {
        query = query.eq("days_per_week", filters.daysPerWeek);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((template: any) => ({
        ...template,
        week_count: template.workout_template_weeks?.[0]?.count || 0,
        day_count: template.workout_template_days?.[0]?.count || 0,
        exercise_count: 0,
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch system programs (library)
  const { data: libraryPrograms, isLoading: loadingLibrary } = useQuery({
    queryKey: ["library-workout-templates", filters],
    queryFn: async () => {
      let query = supabase
        .from("workout_templates")
        .select(`
          *,
          workout_template_weeks(count),
          workout_template_days(count)
        `)
        .eq("is_system", true)
        .order("name");

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,goal.ilike.%${filters.search}%`);
      }

      if (filters.templateType !== "all") {
        query = query.eq("template_type", filters.templateType);
      }

      if (filters.difficulty !== "all") {
        query = query.eq("difficulty", filters.difficulty);
      }

      if (filters.daysPerWeek !== "all") {
        query = query.eq("days_per_week", filters.daysPerWeek);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((template: any) => ({
        ...template,
        week_count: template.workout_template_weeks?.[0]?.count || 0,
        day_count: template.workout_template_days?.[0]?.count || 0,
        exercise_count: 0,
      }));
    },
  });

  const handleTemplateClick = (id: string) => {
    setSelectedTemplateId(id);
    setSheetOpen(true);
  };

  const isLoading = activeTab === "my-programs" ? loadingMy : loadingLibrary;
  const templates = activeTab === "my-programs" ? myPrograms : libraryPrograms;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-primary" />
            Workout Programs
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage workout programs for your clients
          </p>
        </div>
        <CreateWorkoutTemplateDialog />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-programs" className="gap-2">
            <User className="w-4 h-4" />
            My Programs
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <Library className="w-4 h-4" />
            Library
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <TemplateFilters filters={filters} onChange={setFilters} />

      {/* Results count */}
      {!isLoading && templates && (
        <p className="text-sm text-muted-foreground">
          {templates.length} program{templates.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Template Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => handleTemplateClick(template.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg">
            {activeTab === "my-programs" ? "No custom programs yet" : "No programs found"}
          </h3>
          <p className="text-muted-foreground mt-1">
            {activeTab === "my-programs"
              ? "Create your first workout program to get started"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      )}

      {/* Template Detail Sheet */}
      <TemplateDetailSheet
        templateId={selectedTemplateId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}