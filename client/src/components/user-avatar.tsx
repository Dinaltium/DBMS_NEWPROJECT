import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@shared/schema";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  // Use name for users, or first_name + last_name for suppliers
  const displayName =
    user.name ||
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    "";

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  return (
    <Avatar
      className={`${sizeClasses[size]} bg-gradient-to-r from-primary-600 to-primary-800`}
    >
      <AvatarFallback className="text-white font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
