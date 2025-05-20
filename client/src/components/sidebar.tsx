import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@shared/schema";
import { UserAvatar } from "./user-avatar";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  User as UserIcon,
  Settings,
  ChevronRight,
  LogOut,
  ChevronLeft,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [location] = useLocation();

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Orders",
      href: "/orders",
      icon: Package,
    },
    ...(isAdmin || isManager
      ? [
          {
            title: "Employees",
            href: "/employees",
            icon: Users,
          },
        ]
      : []),
    {
      title: "Profile",
      href: "/profile",
      icon: UserIcon,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const sidebarVariants = {
    expanded: { width: "260px" },
    collapsed: { width: "80px" },
  };

  const contentVariants = {
    expanded: { opacity: 1, display: "block" },
    collapsed: {
      opacity: 0,
      transitionEnd: {
        display: "none",
      },
    },
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background",
        isExpanded ? "w-64" : "w-20",
        className
      )}
    >
      {/* User Profile Section */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-4">
          <UserAvatar user={user} />
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.employeeId}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {isExpanded && <span>{item.title}</span>}
                </a>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Expand/Collapse Button */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={toggleSidebar}
        >
          {isExpanded ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
