import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppRole } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Repeat, Shield, Users, Dumbbell, Check } from "lucide-react";

const ROLE_CONFIG: Record<AppRole, { label: string; icon: typeof Shield; path: string; color: string }> = {
  super_admin: {
    label: "Super Admin",
    icon: Shield,
    path: "/admin",
    color: "text-red-500",
  },
  coach: {
    label: "Coach",
    icon: Dumbbell,
    path: "/coach",
    color: "text-blue-500",
  },
  client: {
    label: "Client",
    icon: Users,
    path: "/client",
    color: "text-green-500",
  },
};

const STORAGE_KEY = "customcoachpro_active_role";

export function RoleSwitcher() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);

  const allRoles = user?.allRoles || [];

  // Initialize active role from localStorage or use highest priority role
  useEffect(() => {
    if (!user || allRoles.length === 0) return;

    const savedRole = localStorage.getItem(STORAGE_KEY) as AppRole | null;
    
    if (savedRole && allRoles.includes(savedRole)) {
      setActiveRole(savedRole);
    } else {
      // Use the current role (highest priority) as default
      setActiveRole(user.role);
      localStorage.setItem(STORAGE_KEY, user.role);
    }
  }, [user, allRoles]);

  // Don't show if user has only one role
  if (!user || allRoles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = (role: AppRole) => {
    setActiveRole(role);
    localStorage.setItem(STORAGE_KEY, role);
    
    const config = ROLE_CONFIG[role];
    navigate(config.path);
  };

  const currentConfig = activeRole ? ROLE_CONFIG[activeRole] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <Repeat className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">
            {currentConfig?.label || "Switch Role"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allRoles.map((role) => {
          const config = ROLE_CONFIG[role];
          const isActive = role === activeRole;
          const Icon = config.icon;

          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className="gap-2 cursor-pointer"
            >
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className="flex-1">{config.label}</span>
              {isActive && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook to get the active role
export function useActiveRole(): AppRole | null {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);

  useEffect(() => {
    if (!user) {
      setActiveRole(null);
      return;
    }

    const savedRole = localStorage.getItem(STORAGE_KEY) as AppRole | null;
    const allRoles = user.allRoles || [];

    if (savedRole && allRoles.includes(savedRole)) {
      setActiveRole(savedRole);
    } else {
      setActiveRole(user.role);
    }
  }, [user]);

  return activeRole;
}
