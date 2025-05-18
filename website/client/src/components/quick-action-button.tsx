import { ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  variant: "primary" | "success" | "warning" | "default";
}

export function QuickActionButton({
  icon: Icon,
  label,
  variant,
  className,
  ...props
}: QuickActionButtonProps) {
  const colorVariants = {
    primary: "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30",
    success: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
    warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30",
    default: "bg-gray-50 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50",
  };

  return (
    <Button
      variant="ghost"
      className={`p-4 flex flex-col items-center h-auto ${colorVariants[variant]} rounded-lg`}
      {...props}
    >
      <Icon className="mb-2 h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}
