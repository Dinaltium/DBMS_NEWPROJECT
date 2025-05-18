import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  href: string;
  color: "primary" | "warning" | "success" | "danger";
}

export function StatsCard({ title, value, icon: Icon, href, color }: StatsCardProps) {
  const colors = {
    primary: "bg-primary-500",
    warning: "bg-amber-500",
    success: "bg-emerald-500",
    danger: "bg-red-500",
  };
  
  return (
    <Card className="overflow-hidden hover:-translate-y-1 transition-transform duration-200">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${colors[color]} rounded-md p-3`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-dark-input px-5 py-3">
        <div className="text-sm">
          <Link href={href} className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-900">
            View all
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
