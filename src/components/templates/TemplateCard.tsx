import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Zap } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import type { TemplateWithStats } from "@/hooks/useWorkoutTemplates";

interface TemplateCardProps {
  template: TemplateWithStats;
  onClick: () => void;
  showFavorite?: boolean;
}

const difficultyColors = {
  beginner: "bg-success/20 text-success border-success/30",
  intermediate: "bg-warning/20 text-warning border-warning/30",
  advanced: "bg-destructive/20 text-destructive border-destructive/30",
};

const typeColors: Record<string, string> = {
  push_pull_legs: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  upper_lower: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  full_body: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  bro_split: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  strength: "bg-red-500/20 text-red-400 border-red-500/30",
  hypertrophy: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  powerbuilding: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  sport_specific: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  cardio_conditioning: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  functional: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  bodyweight: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
};

const formatLabel = (value: string) => 
  value.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

export function TemplateCard({ template, onClick, showFavorite = true }: TemplateCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 group h-full"
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {template.name}
            </h3>
            {template.goal && (
              <p className="text-sm text-primary/80 mt-0.5 line-clamp-1">
                {template.goal}
              </p>
            )}
          </div>
          {showFavorite && (
            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton itemType="workout_template" itemId={template.id} size="sm" />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {template.description || "No description available"}
        </p>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{template.days_per_week} days/week</span>
          </div>
          {template.duration_weeks && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{template.duration_weeks} weeks</span>
            </div>
          )}
          {template.is_periodized && (
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary">Periodized</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {template.template_type && (
            <Badge 
              variant="outline" 
              className={`text-xs ${typeColors[template.template_type] || ""}`}
            >
              {formatLabel(template.template_type)}
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className={`text-xs ${difficultyColors[template.difficulty]}`}
          >
            {formatLabel(template.difficulty)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
