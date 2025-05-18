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
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager';
  
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

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const sidebarVariants = {
    expanded: { width: "260px" },
    collapsed: { width: "80px" }
  };

  const contentVariants = {
    expanded: { opacity: 1, display: "block" },
    collapsed: { 
      opacity: 0,
      transitionEnd: {
        display: "none"
      }
    }
  };
  
  return (
    <motion.aside
      className="fixed left-0 top-0 z-10 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      initial="expanded"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-full flex-col">
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4">
          <motion.div 
            className="flex items-center gap-2"
            variants={contentVariants}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-blue-600 text-white p-1 rounded">
              <ClipboardList size={20} />
            </div>
            <h1 className="text-lg font-semibold truncate dark:text-white">
              Logistics Management
            </h1>
          </motion.div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="rounded-full h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight size={18} />
            </motion.div>
          </Button>
        </div>
        
        {/* Sidebar links */}
        <nav className="flex-1 overflow-auto py-4">
          <ul className="space-y-1 px-2">
            {links.map((link) => {
              // Skip admin-only links for non-admins
              if (link.adminOnly && !isAdmin) {
                return null;
              }
              
              const Icon = link.icon;
              
              return (
                <li key={link.href}>
                  <Link href={link.href}>
                    <motion.a
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        link.active ? 
                          "bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-medium" : 
                          "text-gray-700 dark:text-gray-300"
                      )}
                      whileHover={{ scale: 1.02, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon size={20} />
                      <motion.span 
                        className="truncate"
                        variants={contentVariants}
                        transition={{ duration: 0.2 }}
                      >
                        {link.title}
                      </motion.span>
                      
                      {link.active && (
                        <motion.div
                          className="absolute left-0 h-full w-1 bg-primary-600 dark:bg-primary-400 rounded-r-full"
                          layoutId="activeIndicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User info and logout */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-800 p-4">
          <motion.div 
            className="flex flex-col gap-3"
            variants={{
              expanded: { opacity: 1 },
              collapsed: { opacity: 0 }
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <UserAvatar user={user} />
              <div className="overflow-hidden">
                <p className="truncate font-medium dark:text-white">{user.name}</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => logoutMutation.mutate()}
              >
                <span>Logout</span>
                <LogOut size={16} />
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Mini user avatar when collapsed */}
          {!isExpanded && (
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <UserAvatar user={user} size="sm" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}