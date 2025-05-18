import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

type StatusType = "available" | "busy" | "away";

interface StatusIndicatorProps {
  canChange?: boolean;
}

export function StatusIndicator({ canChange = false }: StatusIndicatorProps) {
  const { user, updateProfileMutation } = useAuth();
  
  if (!user) return null;
  
  const status = user.status || "available";
  
  const statusConfig = {
    available: {
      color: "bg-green-500",
      label: "Available",
      textColor: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40",
    },
    busy: {
      color: "bg-red-500",
      label: "Busy",
      textColor: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40",
    },
    away: {
      color: "bg-yellow-500",
      label: "Away",
      textColor: "text-yellow-700 dark:text-yellow-300",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-800/40",
    },
  };
  
  const current = statusConfig[status as StatusType];
  
  const changeStatus = (newStatus: StatusType) => {
    updateProfileMutation.mutate({
      id: user.id,
      data: { status: newStatus }
    });
  };
  
  if (!canChange) {
    return (
      <Badge variant="outline" className={`${current.bgColor} ${current.textColor}`}>
        <span className={`mr-1.5 h-2 w-2 rounded-full ${current.color}`} />
        {current.label}
      </Badge>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge variant="outline" className={`${current.bgColor} ${current.textColor} cursor-pointer`}>
          <span className={`mr-1.5 h-2 w-2 rounded-full ${current.color}`} />
          {current.label}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeStatus("available")} className="text-green-700 dark:text-green-300">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500" />
          Available
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeStatus("busy")} className="text-red-700 dark:text-red-300">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-red-500" />
          Busy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeStatus("away")} className="text-yellow-700 dark:text-yellow-300">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-yellow-500" />
          Away
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
