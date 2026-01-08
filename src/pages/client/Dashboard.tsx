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
  ClipboardList,
  ChefHat,
  Apple,
  Heart,
  Users,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ExercisesPage from "@/pages/shared/ExercisesPage";
import WorkoutTemplatesPage from "@/pages/shared/WorkoutTemplatesPage";
import WorkoutsPage from "@/pages/client/WorkoutsPage";
import ActiveWorkoutPage from "@/pages/client/ActiveWorkoutPage";
import ProgressPage from "@/pages/client/ProgressPage";
import CheckinsPage from "@/pages/client/CheckinsPage";
import ClientDietPlansPage from "@/pages/client/DietPlansPage";
import RecipesPage from "@/pages/shared/RecipesPage";
import NutritionLogPage from "@/pages/client/NutritionLogPage";
import FavoritesPage from "@/pages/client/FavoritesPage";
import CoachMarketplacePage from "@/pages/client/CoachMarketplacePage";
import ClientProfilePage from "@/pages/client/ProfilePage";
import MessagesPage from "@/pages/shared/MessagesPage";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { MyCoachCard } from "@/components/client/MyCoachCard";
import { ClientOnboardingDialog } from "@/components/client/ClientOnboardingDialog";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useTotalUnreadCount } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/client" },
  { icon: Users, label: "Find a Coach", path: "/client/coaches" },
  { icon: Heart, label: "Favorites", path: "/client/favorites" },
  { icon: Dumbbell, label: "Workouts", path: "/client/workouts" },
  { icon: ClipboardList, label: "Programs", path: "/client/programs" },
  { icon: Library, label: "Exercises", path: "/client/exercises" },
  { icon: UtensilsCrossed, label: "Diet Plans", path: "/client/diet-plans" },
  { icon: Apple, label: "Nutrition Log", path: "/client/nutrition-log" },
  { icon: ChefHat, label: "Recipes", path: "/client/recipes" },
  { icon: TrendingUp, label: "Progress", path: "/client/progress" },
  { icon: CalendarCheck, label: "Check-ins", path: "/client/checkins" },
  { icon: MessageSquare, label: "Messages", path: "/client/messages" },
  { icon: User, label: "Profile", path: "/client/profile" },
];

function ClientDashboard() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const unreadCount = useTotalUnreadCount();

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
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              const showBadge = item.label === "Messages" && unreadCount > 0;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {showBadge && (
                    <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {unreadCount}
                    </Badge>
                  )}
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
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <h1 className="text-lg font-semibold">My Fitness Journey</h1>
            </div>
            <div className="flex items-center gap-2">
              <RoleSwitcher />
              <ThemeSwitcher />
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          <Routes>
            <Route index element={<ClientHome />} />
            <Route path="coaches" element={<CoachMarketplacePage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="workouts" element={<WorkoutsPage />} />
            <Route path="workouts/:logId" element={<ActiveWorkoutPage />} />
            <Route path="programs" element={<WorkoutTemplatesPage />} />
            <Route path="exercises" element={<ExercisesPage />} />
            <Route path="diet-plans" element={<ClientDietPlansPage />} />
            <Route path="nutrition-log" element={<NutritionLogPage />} />
            <Route path="recipes" element={<RecipesPage viewOnly />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="checkins" element={<CheckinsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="profile" element={<ClientProfilePage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function ClientHome() {
  const { user } = useAuth();
  const { data: profileData, isLoading } = useClientProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding if profile is incomplete
  useEffect(() => {
    if (!isLoading && profileData && !profileData.isComplete) {
      // Small delay so page loads first
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, profileData]);
  
  return (
    <div className="space-y-5">
      {/* Onboarding Dialog */}
      <ClientOnboardingDialog 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding}
      />

      {/* Incomplete Profile Banner */}
      {profileData && !profileData.isComplete && !showOnboarding && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning" />
            <div>
              <p className="font-medium text-sm">Complete Your Profile</p>
              <p className="text-xs text-muted-foreground">
                Missing: {profileData.missingFields.join(", ")}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowOnboarding(true)}>
            Complete Now
          </Button>
        </div>
      )}

      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/10 rounded-xl p-5 border border-primary/20">
        <h2 className="text-xl font-bold">Hey {user?.fullName?.split(' ')[0] || 'there'}! 💪</h2>
        <p className="text-sm text-muted-foreground mt-1">Ready to crush your goals today?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Workouts This Week", value: "0", icon: Dumbbell },
          { label: "Calories Today", value: "0", icon: UtensilsCrossed },
          { label: "Current Streak", value: "0 days", icon: TrendingUp },
          { label: "Next Check-in", value: "—", icon: CalendarCheck },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Coach Card */}
        <MyCoachCard />

        {/* Today's Plan */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-3">Today's Plan</h3>
          <p className="text-muted-foreground text-xs mb-3">No workout assigned for today.</p>
          <Link to="/client/programs">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <Search className="w-3 h-3 mr-2" />
              Browse Workout Plans
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/client/nutrition-log">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Apple className="w-3 h-3 mr-2" />
                Log Nutrition
              </Button>
            </Link>
            <Link to="/client/progress">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <TrendingUp className="w-3 h-3 mr-2" />
                Track Progress
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;
