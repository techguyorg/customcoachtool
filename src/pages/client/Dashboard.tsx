import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Dumbbell, 
  UtensilsCrossed, 
  TrendingUp,
  CalendarCheck,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Library,
  ClipboardList
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ExercisesPage from "@/pages/shared/ExercisesPage";
import WorkoutTemplatesPage from "@/pages/shared/WorkoutTemplatesPage";
import ProgressPage from "@/pages/client/ProgressPage";
import CheckinsPage from "@/pages/client/CheckinsPage";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/client" },
  { icon: Dumbbell, label: "Workouts", path: "/client/workouts" },
  { icon: ClipboardList, label: "Programs", path: "/client/programs" },
  { icon: Library, label: "Exercises", path: "/client/exercises" },
  { icon: UtensilsCrossed, label: "Nutrition", path: "/client/nutrition" },
  { icon: TrendingUp, label: "Progress", path: "/client/progress" },
  { icon: CalendarCheck, label: "Check-ins", path: "/client/checkins" },
  { icon: MessageSquare, label: "Messages", path: "/client/messages" },
  { icon: User, label: "Profile", path: "/client/profile" },
];

function ClientDashboard() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">CustomCoachPro</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.fullName || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-4 px-6 py-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-xl font-semibold flex-1">My Fitness Journey</h1>
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          <Routes>
            <Route index element={<ClientHome />} />
            <Route path="workouts" element={<div className="text-muted-foreground">Workouts coming soon...</div>} />
            <Route path="programs" element={<WorkoutTemplatesPage />} />
            <Route path="exercises" element={<ExercisesPage />} />
            <Route path="nutrition" element={<div className="text-muted-foreground">Nutrition tracking coming soon...</div>} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="checkins" element={<CheckinsPage />} />
            <Route path="messages" element={<div className="text-muted-foreground">Messages coming soon...</div>} />
            <Route path="profile" element={<div className="text-muted-foreground">Profile settings coming soon...</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function ClientHome() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/10 rounded-xl p-6 border border-primary/20">
        <h2 className="text-2xl font-bold">Hey {user?.fullName?.split(' ')[0] || 'there'}! 💪</h2>
        <p className="text-muted-foreground mt-1">Ready to crush your goals today?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Workouts This Week", value: "0", icon: Dumbbell },
          { label: "Calories Today", value: "0", icon: UtensilsCrossed },
          { label: "Current Streak", value: "0 days", icon: TrendingUp },
          { label: "Next Check-in", value: "—", icon: CalendarCheck },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Today's Plan</h3>
          <p className="text-muted-foreground text-sm mb-4">No workout assigned for today.</p>
          <Button variant="outline" className="w-full justify-start">
            <Search className="w-4 h-4 mr-2" />
            Browse Workout Plans
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Find a Coach</h3>
          <p className="text-muted-foreground text-sm mb-4">Get personalized guidance from a certified coach.</p>
          <Button variant="outline" className="w-full justify-start">
            <User className="w-4 h-4 mr-2" />
            Browse Coaches
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;
