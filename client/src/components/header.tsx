import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "./theme-provider";
import { Moon, Sun, Menu, Bell } from "lucide-react";
import { StatusIndicator } from "./status-indicator";
import { UserAvatar } from "./user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link } from "wouter";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  if (!user) return null;
  
  // Check if user is T Mohammed Jazeel (Manager) or an admin
  const canChangeStatus = user.name === 'T Mohammed Jazeel' || user.role === 'admin';

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-dark-card shadow">
      <button 
        type="button" 
        className="md:hidden px-4 text-gray-500 dark:text-gray-400 focus:outline-none"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white md:hidden">Advanced Logistics</h1>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-gray-100 dark:bg-dark-input text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {/* Status Indicator (Manager Only) */}
          {canChangeStatus && (
            <div className="ml-3 hidden md:block">
              <StatusIndicator canChange={canChangeStatus} />
            </div>
          )}
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-3 bg-gray-100 dark:bg-dark-input text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* Profile Dropdown */}
          <div className="ml-3 relative">
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full focus:outline-none">
                  <UserAvatar user={user} size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400 cursor-pointer" 
                  onClick={() => logoutMutation.mutate()}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
