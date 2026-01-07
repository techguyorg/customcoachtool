import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { ProgressPhoto } from "@/hooks/useClientProgress";

interface PhotoGalleryProps {
  photos: ProgressPhoto[];
  compact?: boolean;
}

const poseLabels: Record<string, string> = {
  front: "Front",
  back: "Back",
  side_left: "Left Side",
  side_right: "Right Side",
  other: "Other",
};

export function PhotoGallery({ photos, compact = false }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

  // Group photos by date for comparison view
  const photosByDate = photos.reduce((acc, photo) => {
    const date = photo.recorded_at;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  return (
    <>
      <div className={`grid gap-4 ${compact ? "grid-cols-4" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
              <img
                src={photo.photo_url}
                alt={`Progress photo - ${poseLabels[photo.pose_type]}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg" />
            <div className="absolute bottom-2 left-2 right-2">
              <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0">
                {poseLabels[photo.pose_type]}
              </Badge>
            </div>
            {!compact && (
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(photo.recorded_at), "MMM d, yyyy")}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedPhoto && (
            <div className="relative">
              <img
                src={selectedPhoto.photo_url}
                alt={`Progress photo - ${poseLabels[selectedPhoto.pose_type]}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <Badge variant="secondary" className="bg-white/20 border-0 text-white">
                      {poseLabels[selectedPhoto.pose_type]}
                    </Badge>
                    <p className="text-sm mt-2 opacity-90">
                      {format(new Date(selectedPhoto.recorded_at), "MMMM d, yyyy")}
                    </p>
                  </div>
                  {selectedPhoto.notes && (
                    <p className="text-sm opacity-80 max-w-xs text-right">
                      {selectedPhoto.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
