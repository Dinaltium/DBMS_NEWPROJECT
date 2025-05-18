import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@shared/schema";
import { UserAvatar } from "./user-avatar";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  User as UserIcon, 
  Settings 
} from "lucide-react";

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  
  const isAdmin = user.role === 'admin';
  
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
      icon: UserIcon,
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
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white dark:bg-dark-card shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Advanced Logistics</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {links.map((link) => {
                if (link.adminOnly && !isAdmin) return null;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      link.active
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-input hover:text-gray-900 dark:hover:text-white",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    )}
                  >
                    <link.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {link.title}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <UserAvatar user={user} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.name}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {user.employeeId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
