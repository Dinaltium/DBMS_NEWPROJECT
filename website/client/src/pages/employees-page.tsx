import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, insertUserSchema, userRoleEnum, userStatusEnum } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, PlusCircle, MoreVertical, Edit, Trash2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusIndicator } from "@/components/status-indicator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Create Employee Schema
const createEmployeeSchema = insertUserSchema.omit({
  nameLastChanged: true,
}).extend({
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type CreateEmployeeValues = z.infer<typeof createEmployeeSchema>;

// Edit Employee Schema
const editEmployeeSchema = insertUserSchema.omit({
  password: true,
  nameLastChanged: true,
}).partial();

type EditEmployeeValues = z.infer<typeof editEmployeeSchema>;

export default function EmployeesPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createEmployeeOpen, setCreateEmployeeOpen] = useState(false);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch all employees
  const { data: employees = [], isLoading: isEmployeesLoading, refetch: refetchEmployees } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: CreateEmployeeValues) => {
      const { confirmPassword, ...userData } = employeeData;
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Employee created",
        description: "The employee has been created successfully",
      });
      setCreateEmployeeOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Employee creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Edit employee mutation
  const editEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EditEmployeeValues }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Employee updated",
        description: "The employee has been updated successfully",
      });
      setEditEmployeeOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Employee update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Employee deleted",
        description: "The employee has been deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Employee deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create employee form
  const createForm = useForm<CreateEmployeeValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      username: "",
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "employee",
      status: "available",
    },
  });
  
  // Edit employee form
  const editForm = useForm<EditEmployeeValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      username: "",
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      role: "employee",
      status: "available",
    },
  });
  
  // Set form values when an employee is selected for editing
  const handleEditEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    editForm.reset({
      username: employee.username,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email || "",
      phone: employee.phone || "",
      role: employee.role,
      status: employee.status || "available",
    });
    setEditEmployeeOpen(true);
  };
  
  // Handle employee deletion confirmation
  const handleDeleteEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };
  
  // Handle create employee form submission
  const onCreateSubmit = (data: CreateEmployeeValues) => {
    createEmployeeMutation.mutate(data);
  };
  
  // Handle edit employee form submission
  const onEditSubmit = (data: EditEmployeeValues) => {
    if (selectedEmployee) {
      editEmployeeMutation.mutate({ id: selectedEmployee.id, data });
    }
  };
  
  // Handle employee deletion
  const confirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployeeMutation.mutate(selectedEmployee.id);
    }
  };
  
  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(query) ||
      employee.employeeId.toLowerCase().includes(query) ||
      employee.username.toLowerCase().includes(query) ||
      (employee.email && employee.email.toLowerCase().includes(query))
    );
  });
  
  // Generate a sample employee ID
  const generateEmployeeId = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `AL00CA${random}`;
  };
  
  if (!user || user.role !== 'admin') return null;
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-background">
      <Sidebar user={user} />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Employees</h1>
                
                <div className="flex space-x-2">
                  {/* Refresh Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchEmployees()}
                    disabled={isEmployeesLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isEmployeesLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  
                  {/* Create Employee Button */}
                  <Dialog open={createEmployeeOpen} onOpenChange={setCreateEmployeeOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Employee
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Create New Employee</DialogTitle>
                        <DialogDescription>
                          Fill in the details below to create a new employee account
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={createForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Full name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createForm.control}
                              name="employeeId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Employee ID</FormLabel>
                                  <div className="flex space-x-2">
                                    <FormControl>
                                      <Input 
                                        placeholder="Format: AL00CA1234" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="icon"
                                      onClick={() => createForm.setValue("employeeId", generateEmployeeId())}
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={createForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email (optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="email" 
                                      placeholder="Email address" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={createForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="Default: AL2023" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="Confirm password" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={createForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number (optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createForm.control}
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {Object.values(userRoleEnum.enumValues).map((role) => (
                                        <SelectItem key={role} value={role}>
                                          {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={createEmployeeMutation.isPending}
                            >
                              {createEmployeeMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Create Employee
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Management</CardTitle>
                  <CardDescription>
                    Manage your organization's employees and their access settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-4">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search employees..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {isEmployeesLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEmployees.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
                                No employees found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredEmployees.map((employee) => (
                              <TableRow key={employee.id}>
                                <TableCell>
                                  <div className="flex items-center">
                                    <UserAvatar user={employee} size="sm" />
                                    <span className="ml-2 font-medium">{employee.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{employee.employeeId}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={employee.role === 'admin' ? 'default' : 'secondary'}
                                    className="capitalize"
                                  >
                                    {employee.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <StatusIndicator />
                                </TableCell>
                                <TableCell>
                                  {employee.email || "-"}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteEmployee(employee)}
                                        className="text-red-600 dark:text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredEmployees.length} employees
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav isAdmin={user.role === 'admin'} />
      
      {/* Edit Employee Dialog */}
      <Dialog open={editEmployeeOpen} onOpenChange={setEditEmployeeOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Format: AL00CA1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Email address" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Phone number" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(userRoleEnum.enumValues).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
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
                        {Object.values(userStatusEnum.enumValues).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={editEmployeeMutation.isPending}
                >
                  {editEmployeeMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              account and remove their data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteEmployeeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
