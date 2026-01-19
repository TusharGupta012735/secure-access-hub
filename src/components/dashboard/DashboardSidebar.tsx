import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Radio,
  Bell,
  Sun,
  Moon,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
      {
        icon: Bell,
        label: "Denied Candidates",
        path: "/dashboard/deniedCandidates",
        badge: 5,
      },
    ],
  },
];

interface DashboardSidebarProps {
  userRole?: "admin" | "gate_operator" | "kitchen_operator";
}

export function DashboardSidebar({
  userRole = "admin",
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const { logout, isLoading, user, isAuthenticated } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // UI role label based on auth user role if available
  const roleLabel = useMemo(() => {
    const apiRole = user?.role;

    if (apiRole === "ADMIN") return "Administrator";
    if (apiRole === "USER") return "Operator";

    // fallback to sidebar prop role
    const roleLabels = {
      admin: "Administrator",
      gate_operator: "Gate Operator",
      kitchen_operator: "Kitchen Operator",
    };

    return roleLabels[userRole];
  }, [user?.role, userRole]);

  const roleDotColor = useMemo(() => {
    const apiRole = user?.role;

    if (apiRole === "ADMIN") return "bg-primary";
    if (apiRole === "USER") return "bg-accent";

    const roleColors = {
      admin: "bg-primary",
      gate_operator: "bg-accent",
      kitchen_operator: "bg-warning",
    };

    return roleColors[userRole];
  }, [user?.role, userRole]);

  const displayName = useMemo(() => {
    const fn = user?.firstName?.trim();
    const ln = user?.lastName?.trim();

    if (fn || ln) return `${fn ?? ""} ${ln ?? ""}`.trim();
    if (user?.email) return user.email;
    return "Guest";
  }, [user]);

  const initials = useMemo(() => {
    const fn = user?.firstName?.trim();
    const ln = user?.lastName?.trim();

    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    if (fn) return fn.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return "U";
  }, [user]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="gradient-primary p-2 rounded-lg flex-shrink-0">
            <Radio className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sidebar-foreground">
              RFID<span className="text-sidebar-primary">Access</span>
            </span>
          )}
        </Link>
      </div>

      {/* User Info */}
      <div
        className={cn(
          "p-4 border-b border-sidebar-border",
          collapsed && "px-2",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
            {isAuthenticated ? initials : <UserIcon className="h-5 w-5" />}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {displayName}
              </p>

              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", roleDotColor)} />
                <span className="text-xs text-sidebar-muted truncate">
                  {roleLabel}
                </span>
              </div>

              {user?.email && (
                <p className="text-[11px] text-sidebar-muted truncate mt-1">
                  {user.email}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
                {group.title}
              </p>
            )}

            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive(item.path)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center px-2",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2",
          )}
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Sun className="h-5 w-5 flex-shrink-0" />
          )}
          {!collapsed && <span className="ml-3">Toggle Theme</span>}
        </Button>

        <Link
          to="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2",
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <Link
          to="/"
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>{isLoading ? "Logging out..." : "Logout"}</span>}
        </Link>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </aside>
  );
}
