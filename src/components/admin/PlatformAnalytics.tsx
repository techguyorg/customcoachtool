import { useAdminStats } from "@/hooks/useAdminStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, UserCheck, Shield, Handshake, Dumbbell, UtensilsCrossed, ChefHat, Apple } from "lucide-react";

export function PlatformAnalytics() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            color="text-primary"
          />
          <StatCard
            icon={Shield}
            label="Super Admins"
            value={stats.totalAdmins}
            color="text-red-500"
          />
          <StatCard
            icon={UserCheck}
            label="Coaches"
            value={stats.totalCoaches}
            color="text-blue-500"
          />
          <StatCard
            icon={Users}
            label="Clients"
            value={stats.totalClients}
            color="text-green-500"
          />
        </div>
      </div>

      {/* Engagement Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Engagement</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            icon={Handshake}
            label="Active Coach-Client Relationships"
            value={stats.activeCoachings}
            color="text-purple-500"
          />
          <StatCard
            icon={Users}
            label="Pending Coaching Requests"
            value={stats.pendingRequests}
            color="text-amber-500"
          />
        </div>
      </div>

      {/* Content Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">System Content</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Dumbbell}
            label="Exercises"
            value={stats.systemExercises}
            color="text-primary"
            compact
          />
          <StatCard
            icon={Dumbbell}
            label="Workout Templates"
            value={stats.systemWorkoutTemplates}
            color="text-primary"
            compact
          />
          <StatCard
            icon={UtensilsCrossed}
            label="Diet Plans"
            value={stats.systemDietPlans}
            color="text-primary"
            compact
          />
          <StatCard
            icon={ChefHat}
            label="Recipes"
            value={stats.systemRecipes}
            color="text-primary"
            compact
          />
          <StatCard
            icon={Apple}
            label="Foods"
            value={stats.systemFoods}
            color="text-primary"
            compact
          />
        </div>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>
            Summary of the CustomCoachPro platform status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Coach to Client Ratio</span>
              <span className="font-medium">
                1:{stats.totalCoaches > 0 ? Math.round(stats.totalClients / stats.totalCoaches) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Average Clients per Coach</span>
              <span className="font-medium">
                {stats.totalCoaches > 0 ? (stats.activeCoachings / stats.totalCoaches).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Request Conversion Rate</span>
              <span className="font-medium">
                {stats.activeCoachings > 0 && stats.pendingRequests >= 0
                  ? `${Math.round((stats.activeCoachings / (stats.activeCoachings + stats.pendingRequests)) * 100)}%`
                  : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  compact?: boolean;
}

function StatCard({ icon: Icon, label, value, color, compact }: StatCardProps) {
  return (
    <Card className={compact ? "p-4" : ""}>
      {compact ? (
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${color}`} />
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ) : (
        <>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              {label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{value}</p>
          </CardContent>
        </>
      )}
    </Card>
  );
}
