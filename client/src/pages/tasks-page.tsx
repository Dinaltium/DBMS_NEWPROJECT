import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { TaskTable } from "@/components/task-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, User, insertTaskSchema, taskStatusEnum, taskPriorityEnum } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Filter, RefreshCw, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const createTaskSchema = insertTaskSchema.pick({
  title: true,
  description: true,
  status: true,
  priority: true,
  assignedToId: true,
  dueDate: true,
});

type CreateTaskValues = z.infer<typeof createTaskSchema>;

export default function TasksPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskFilters, setTaskFilters] = useState<{
    status: string[];
    priority: string[];
  }>({
    status: [],
    priority: [],
  });
  const { toast } = useToast();
  
  // Fetch tasks
  const { data: tasks = [], isLoading: isTasksLoading, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch all users (for task assignment dropdown)
  const { data: users = [], isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === 'admin', // Only fetch all users if the user is an admin
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskValues) => {
      const res = await apiRequest("POST", "/api/tasks", taskData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created",
        description: "The task has been created successfully",
      });
      setCreateTaskOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Task creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create task form
  const form = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assignedToId: undefined,
      dueDate: undefined,
    },
  });
  
  const onSubmit = (data: CreateTaskValues) => {
    // Convert assignedToId to number if it exists
    const formattedData = {
      ...data,
      assignedToId: data.assignedToId ? Number(data.assignedToId) : undefined,
    };
    createTaskMutation.mutate(formattedData);
  };
  
  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    if (taskFilters.status.length > 0 && !taskFilters.status.includes(task.status)) {
      return false;
    }
    if (taskFilters.priority.length > 0 && !taskFilters.priority.includes(task.priority)) {
      return false;
    }
    return true;
  });
  
  if (!user) return null;
  
  const isAdmin = user.role === 'admin';
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-background">
      <Sidebar user={user} />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
                
                <div className="flex space-x-2">
                  {/* Filter Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="p-2">
                        <h4 className="font-medium text-sm mb-1">Status</h4>
                        {Object.values(taskStatusEnum.enumValues).map((status) => (
                          <DropdownMenuCheckboxItem
                            key={status}
                            checked={taskFilters.status.includes(status)}
                            onCheckedChange={(checked) => {
                              setTaskFilters((prev) => ({
                                ...prev,
                                status: checked
                                  ? [...prev.status, status]
                                  : prev.status.filter((s) => s !== status),
                              }));
                            }}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                          </DropdownMenuCheckboxItem>
                        ))}
                        
                        <h4 className="font-medium text-sm mt-3 mb-1">Priority</h4>
                        {Object.values(taskPriorityEnum.enumValues).map((priority) => (
                          <DropdownMenuCheckboxItem
                            key={priority}
                            checked={taskFilters.priority.includes(priority)}
                            onCheckedChange={(checked) => {
                              setTaskFilters((prev) => ({
                                ...prev,
                                priority: checked
                                  ? [...prev.priority, priority]
                                  : prev.priority.filter((p) => p !== priority),
                              }));
                            }}
                          >
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Refresh Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchTasks()}
                    disabled={isTasksLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isTasksLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  
                  {/* Create Task Button (Admin Only) */}
                  {isAdmin && (
                    <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                          <DialogTitle>Create New Task</DialogTitle>
                          <DialogDescription>
                            Fill in the details below to create a new task
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Task title" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Task description" 
                                      className="resize-none" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Object.values(taskStatusEnum.enumValues).map((status) => (
                                          <SelectItem key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Object.values(taskPriorityEnum.enumValues).map((priority) => (
                                          <SelectItem key={priority} value={priority}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="assignedToId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Assigned To</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value?.toString()}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select employee" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {users.map((user) => (
                                          <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Due Date</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="datetime-local" 
                                        {...field} 
                                        value={field.value || ''}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={createTaskMutation.isPending}
                              >
                                {createTaskMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create Task
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Task List</CardTitle>
                  <CardDescription>
                    {isAdmin ? "Manage and monitor all tasks" : "View and manage your assigned tasks"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isTasksLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <TaskTable tasks={filteredTasks} users={users} />
                  )}
                </CardContent>
                {taskFilters.status.length > 0 || taskFilters.priority.length > 0 ? (
                  <CardFooter className="flex justify-between border-t px-6 py-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredTasks.length} tasks found matching filters
                    </div>
                    <Button 
                      variant="link" 
                      onClick={() => setTaskFilters({ status: [], priority: [] })}
                    >
                      Clear Filters
                    </Button>
                  </CardFooter>
                ) : null}
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav isAdmin={user.role === 'admin'} />
    </div>
  );
}
