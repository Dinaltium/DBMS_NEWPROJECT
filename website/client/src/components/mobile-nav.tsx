import { Link, useLocation } from "wouter";
import { LayoutDashboard, ClipboardList, User, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isAdmin: boolean;
}

export function MobileNav({ isAdmin }: MobileNavProps) {
  const [location] = useLocation();
  
  const links = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: location === "/"
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: ClipboardList,
      active: location.startsWith("/tasks")
    },
    {
      title: "Employees",
      href: "/employees",
      icon: Users,
      active: location.startsWith("/employees"),
      adminOnly: true
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
      active: location === "/profile"
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      active: location === "/settings"
    }
  ];
  
  return (
    <div className="fixed bottom-0 w-full md:hidden bg-white dark:bg-dark-card shadow-lg border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around py-2">
        {links.map((link) => {
          if (link.adminOnly && !isAdmin) return null;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center px-2 py-1",
                link.active 
                  ? "text-primary-600 dark:text-primary-400" 
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{link.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
