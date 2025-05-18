import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@shared/schema";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  // Get initials from name
  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg"
  };

  return (
    <Avatar className={`${sizeClasses[size]} bg-gradient-to-r from-primary-600 to-primary-800`}>
      <AvatarFallback className="text-white font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
