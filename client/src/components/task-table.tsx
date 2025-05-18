import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Task, User } from "@shared/schema";
import { UserAvatar } from "./user-avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TaskTableProps {
  tasks: Task[];
  users: User[];
}

export function TaskTable({ tasks, users }: TaskTableProps) {
  const findUser = (userId: number | null) => {
    if (!userId) return null;
    return users.find(u => u.id === userId);
  };

  const statusConfig = {
    pending: {
      label: "Pending",
      classes: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    },
    in_progress: {
      label: "In Progress",
      classes: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
    },
    completed: {
      label: "Completed",
      classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    },
    overdue: {
      label: "Overdue",
      classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    }
  };

  const priorityConfig = {
    low: {
      label: "Low",
      classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    },
    medium: {
      label: "Medium",
      classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    },
    high: {
      label: "High",
      classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                No tasks available
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => {
              const assignee = findUser(task.assignedToId);
              
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {task.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {assignee ? (
                      <div className="flex items-center">
                        <UserAvatar user={assignee} size="sm" />
                        <div className="ml-4">
                          <div className="text-sm font-medium">{assignee.name}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[task.status].classes}>
                      {statusConfig[task.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      format(new Date(task.dueDate), 'MMM dd, yyyy')
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">No due date</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityConfig[task.priority].classes}>
                      {priorityConfig[task.priority].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
