import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import type { Exercise } from "@/lib/api";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
  showFavorite?: boolean;
}

const difficultyColors = {
  beginner: "bg-success/20 text-success border-success/30",
  intermediate: "bg-warning/20 text-warning border-warning/30",
  advanced: "bg-destructive/20 text-destructive border-destructive/30",
};

const formatLabel = (value: string) => 
  value.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

export function ExerciseCard({ exercise, onClick, showFavorite = true }: ExerciseCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Exercise Icon/Image */}
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
            {exercise.image_url ? (
              <img 
                src={exercise.image_url} 
                alt={exercise.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Dumbbell className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {exercise.name}
              </h3>
              {showFavorite && (
                <div onClick={(e) => e.stopPropagation()}>
                  <FavoriteButton itemType="exercise" itemId={exercise.id} size="sm" />
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {exercise.description || "No description available"}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {formatLabel(exercise.primary_muscle)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formatLabel(exercise.equipment)}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${difficultyColors[exercise.difficulty]}`}
              >
                {formatLabel(exercise.difficulty)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
