import { BarChart3, TrendingUp, Users, CalendarCheck, Clock, Target, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoachClients, useClientStats } from "@/hooks/useCoachClients";
import { useCoachCheckins } from "@/hooks/useCheckins";
import { useCoachAssignments } from "@/hooks/usePlanAssignments";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns";

const COLORS = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

export default function AnalyticsPage() {
  const { data: clients, isLoading: loadingClients } = useCoachClients();
  const stats = useClientStats();
  const { data: checkins, isLoading: loadingCheckins } = useCoachCheckins();
  const { data: assignments, isLoading: loadingAssignments } = useCoachAssignments();

  // Client distribution data for pie chart
  const clientDistribution = [
    { name: "Active", value: stats.active, color: COLORS[0] },
    { name: "Pending", value: stats.pending, color: COLORS[1] },
    { name: "Paused", value: stats.paused, color: COLORS[2] },
  ].filter(d => d.value > 0);

  // Check-ins by status
  const checkinStats = {
    pending: checkins?.filter(c => c.status === "submitted").length || 0,
    reviewed: checkins?.filter(c => c.status === "reviewed").length || 0,
    draft: checkins?.filter(c => c.status === "draft").length || 0,
  };

  // Weekly activity (last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const weeklyActivity = last7Days.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayCheckins = checkins?.filter(c => 
      format(new Date(c.created_at), "yyyy-MM-dd") === dayStr
    ).length || 0;
    
    return {
      day: format(day, "EEE"),
      checkins: dayCheckins,
    };
  });

  // Plan assignments by type
  const assignmentsByType = {
    workout: assignments?.filter(a => a.plan_type === "workout").length || 0,
    diet: assignments?.filter(a => a.plan_type === "diet").length || 0,
    total: assignments?.length || 0,
  };

  const planTypeData = [
    { name: "Workout Only", value: assignmentsByType.workout },
    { name: "Diet Only", value: assignmentsByType.diet },
  ].filter(d => d.value > 0);

  const isLoading = loadingClients || loadingCheckins || loadingAssignments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your coaching business performance and client engagement
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{stats.total}</p>
                )}
              </div>
              <Users className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-success">{stats.active}</p>
                )}
              </div>
              <Activity className="w-8 h-8 text-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Check-ins</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-warning">{checkinStats.pending}</p>
                )}
              </div>
              <CalendarCheck className="w-8 h-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Plans</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{assignments?.filter(a => a.status === "active").length || 0}</p>
                )}
              </div>
              <Target className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Distribution</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : clientDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {clientDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No client data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Check-in Activity</CardTitle>
            <CardDescription>Check-ins received in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="checkins" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-in Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Check-in Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Review</span>
              <span className="font-semibold text-warning">{checkinStats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reviewed</span>
              <span className="font-semibold text-success">{checkinStats.reviewed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Draft</span>
              <span className="font-semibold">{checkinStats.draft}</span>
            </div>
          </CardContent>
        </Card>

        {/* Plan Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Workout Plans</span>
              <span className="font-semibold">{assignmentsByType.workout}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Diet Plans</span>
              <span className="font-semibold">{assignmentsByType.diet}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Assignments</span>
              <span className="font-semibold">{assignmentsByType.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. Active Time</span>
              <span className="font-semibold">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Rate</span>
              <span className="font-semibold">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Client Retention</span>
              <span className="font-semibold">—</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}