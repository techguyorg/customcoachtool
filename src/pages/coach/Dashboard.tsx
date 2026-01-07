import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  CalendarCheck,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Dumbbell,
  Library
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ExercisesPage from "@/pages/shared/ExercisesPage";
import WorkoutTemplatesPage from "@/pages/shared/WorkoutTemplatesPage";
import ClientsPage from "@/pages/coach/ClientsPage";
import CoachCheckinsPage from "@/pages/coach/CheckinsPage";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/coach" },
  { icon: Users, label: "My Clients", path: "/coach/clients" },
  { icon: ClipboardList, label: "Programs", path: "/coach/programs" },
  { icon: Library, label: "Exercises", path: "/coach/exercises" },
  { icon: CalendarCheck, label: "Check-ins", path: "/coach/checkins" },
  { icon: MessageSquare, label: "Messages", path: "/coach/messages" },
  { icon: BarChart3, label: "Analytics", path: "/coach/analytics" },
  { icon: Settings, label: "Settings", path: "/coach/settings" },
];

function CoachDashboard() {
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
              <span className="font-display font-bold text-lg">Coach Portal</span>
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
                  {user?.fullName?.charAt(0) || 'C'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.fullName || 'Coach'}</p>
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
            <h1 className="text-xl font-semibold flex-1">Coach Dashboard</h1>
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          <Routes>
            <Route index element={<CoachHome />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="programs" element={<WorkoutTemplatesPage />} />
            <Route path="exercises" element={<ExercisesPage />} />
            <Route path="checkins" element={<CoachCheckinsPage />} />
            <Route path="messages" element={<div className="text-muted-foreground">Messages coming soon...</div>} />
            <Route path="analytics" element={<div className="text-muted-foreground">Analytics coming soon...</div>} />
            <Route path="settings" element={<div className="text-muted-foreground">Settings coming soon...</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function CoachHome() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/10 rounded-xl p-6 border border-primary/20">
        <h2 className="text-2xl font-bold">Welcome back, {user?.fullName?.split(' ')[0] || 'Coach'}! 👋</h2>
        <p className="text-muted-foreground mt-1">Here's what's happening with your clients today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Clients", value: "0", icon: Users },
          { label: "Pending Check-ins", value: "0", icon: CalendarCheck },
          { label: "Unread Messages", value: "0", icon: MessageSquare },
          { label: "Programs Created", value: "0", icon: ClipboardList },
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
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ClipboardList className="w-4 h-4 mr-2" />
              Create Program
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CalendarCheck className="w-4 h-4 mr-2" />
              Review Check-ins
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <p className="text-muted-foreground text-sm">No recent activity yet. Start by adding your first client!</p>
        </div>
      </div>
    </div>
  );
}

export default CoachDashboard;
