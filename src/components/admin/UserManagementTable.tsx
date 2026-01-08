import { useState } from "react";
import { AdminUser, useAdminUsers } from "@/hooks/useAdminUsers";
import { AppRole } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical, Search, Shield, UserPlus, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface UserManagementTableProps {
  onImpersonate?: (user: AdminUser) => void;
}

const ROLE_COLORS: Record<AppRole, string> = {
  super_admin: "bg-red-500/10 text-red-500 border-red-500/20",
  coach: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  client: "bg-green-500/10 text-green-500 border-green-500/20",
};

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  coach: "Coach",
  client: "Client",
};

export function UserManagementTable({ onImpersonate }: UserManagementTableProps) {
  const { user: currentUser } = useAuth();
  const { users, isLoading, addRole, removeRole, isAddingRole, isRemovingRole } = useAdminUsers();
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole =
      roleFilter === "all" ||
      user.roles.includes(roleFilter as AppRole);

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admins</SelectItem>
            <SelectItem value="coach">Coaches</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const initials = user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              
              const isCurrentUser = user.user_id === currentUser?.id;

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.full_name}
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground ml-2">(you)</span>
                          )}
                        </p>
                        {user.phone && (
                          <p className="text-xs text-muted-foreground">{user.phone}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className={`text-xs ${ROLE_COLORS[role]}`}
                        >
                          {ROLE_LABELS[role]}
                        </Badge>
                      ))}
                      {user.roles.length === 0 && (
                        <span className="text-xs text-muted-foreground">No roles</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {!isCurrentUser && onImpersonate && (
                          <DropdownMenuItem onClick={() => onImpersonate(user)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View as User
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                          Add Role
                        </DropdownMenuLabel>
                        {(["super_admin", "coach", "client"] as AppRole[])
                          .filter((role) => !user.roles.includes(role))
                          .map((role) => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => addRole({ userId: user.user_id, role })}
                              disabled={isAddingRole}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add {ROLE_LABELS[role]}
                            </DropdownMenuItem>
                          ))}
                        
                        {user.roles.length > 0 && !isCurrentUser && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                              Remove Role
                            </DropdownMenuLabel>
                            {user.roles.map((role) => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => removeRole({ userId: user.user_id, role })}
                                disabled={isRemovingRole}
                                className="text-destructive focus:text-destructive"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Remove {ROLE_LABELS[role]}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
