import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  insertUserSchema,
  userRoleEnum,
  userStatusEnum,
} from "@shared/schema";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  PlusCircle,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusIndicator } from "@/components/status-indicator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function SuppliersPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("employee");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const [filterType, setFilterType] = useState("all");

  // Create a separate form instance for the main view
  const mainForm = useForm<any>({
    defaultValues: {
      search: "",
      filter: "all",
    },
  });

  // Fetch all suppliers
  const {
    data: suppliers = [],
    isLoading: isSuppliersLoading,
    refetch: refetchSuppliers,
  } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
  });

  // Fetch all users
  const {
    data: users = [],
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const res = await apiRequest("POST", "/api/users", employeeData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Employee created",
        description: "The employee has been created successfully",
      });
      setCreateDialogOpen(false);
      createEmployeeForm.reset();
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
    mutationFn: async (employeeData: any) => {
      const res = await apiRequest(
        "PUT",
        `/api/users/${employeeData.id}`,
        employeeData
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      refetchSuppliers();
      toast({
        title: "Employee updated",
        description: "The employee has been updated successfully",
      });
      setEditDialogOpen(false);
      editEmployeeForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Employee update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create employee form
  const employeeSchema = z
    .object({
      id: z.string().min(1, "ID is required"),
      role: z.enum(["admin", "manager", "employee", "supplier"]),
      first_name: z.string().min(1, "First name is required"),
      last_name: z.string().min(1, "Last name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().min(1, "Phone is required"),
      status: z.enum(["active", "inactive"]).default("active"),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      zipcode: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === "supplier") {
        if (!data.city || data.city.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "City is required",
            path: ["city"],
          });
        }
        if (!data.state || data.state.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "State is required",
            path: ["state"],
          });
        }
        if (!data.country || data.country.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Country is required",
            path: ["country"],
          });
        }
        if (!data.zipcode || data.zipcode.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Zipcode is required",
            path: ["zipcode"],
          });
        }
      }
    });

  const createEmployeeForm = useForm<any>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      id: "",
      role: "employee",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      status: "active",
      city: "",
      state: "",
      country: "",
      zipcode: "",
    },
  });

  const editEmployeeForm = useForm<any>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      id: "",
      role: "employee",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      status: "active",
      city: "",
      state: "",
      country: "",
      zipcode: "",
    },
  });

  // Populate edit form when an employee/supplier is selected
  useEffect(() => {
    if (selectedEmployee && editDialogOpen) {
      // Reset form first
      editEmployeeForm.reset();

      // Populate form with selected employee/supplier data
      if (selectedEmployee.type === "supplier") {
        editEmployeeForm.setValue("role", "supplier");
        editEmployeeForm.setValue(
          "first_name",
          selectedEmployee.first_name || ""
        );
        editEmployeeForm.setValue(
          "last_name",
          selectedEmployee.last_name || ""
        );
        editEmployeeForm.setValue("email", selectedEmployee.email || "");
        editEmployeeForm.setValue("phone", selectedEmployee.phone || "");
        editEmployeeForm.setValue("city", selectedEmployee.city || "");
        editEmployeeForm.setValue("state", selectedEmployee.state || "");
        editEmployeeForm.setValue("country", selectedEmployee.country || "");
        editEmployeeForm.setValue("zipcode", selectedEmployee.zipcode || "");
        editEmployeeForm.setValue(
          "status",
          selectedEmployee.status || "active"
        );
      } else {
        editEmployeeForm.setValue("id", selectedEmployee.employeeId || "");
        editEmployeeForm.setValue("role", selectedEmployee.role || "employee");
        editEmployeeForm.setValue(
          "first_name",
          selectedEmployee.first_name ||
            selectedEmployee.name?.split(" ")[0] ||
            ""
        );
        editEmployeeForm.setValue(
          "last_name",
          selectedEmployee.last_name ||
            selectedEmployee.name?.split(" ")[1] ||
            ""
        );
        editEmployeeForm.setValue("email", selectedEmployee.email || "");
        editEmployeeForm.setValue("phone", selectedEmployee.phone || "");
        editEmployeeForm.setValue(
          "status",
          selectedEmployee.status || "active"
        );
      }
    }
  }, [selectedEmployee, editDialogOpen]);

  // Handle create employee/supplier form submission
  const onCreateEmployeeSubmit = (data: any) => {
    if (data.role === "supplier") {
      // Only send supplier fields to /api/suppliers
      const supplierData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        state: data.state,
        country: data.country,
        zipcode: data.zipcode,
      };
      apiRequest("POST", "/api/suppliers", supplierData)
        .then((res) => res.json())
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
          refetchSuppliers();
          toast({
            title: "Supplier created",
            description: "The supplier has been created successfully",
          });
          setCreateDialogOpen(false);
          createEmployeeForm.reset();
        })
        .catch((error) => {
          toast({
            title: "Supplier creation failed",
            description: error.message,
            variant: "destructive",
          });
        });
    } else {
      // Only send user fields to /api/users
      createEmployeeMutation.mutate(data);
    }
  };

  // Handle edit employee/supplier form submission
  const onEditEmployeeSubmit = (data: any) => {
    if (data.role === "supplier") {
      const supplierData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        state: data.state,
        country: data.country,
        zipcode: data.zipcode,
      };
      apiRequest(
        "PUT",
        `/api/suppliers/${
          selectedEmployee?.id || selectedEmployee?.supplier_id
        }`,
        supplierData
      )
        .then((res) => res.json())
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
          refetchSuppliers();
          toast({
            title: "Supplier updated",
            description: "The supplier has been updated successfully",
          });
          setEditDialogOpen(false);
          editEmployeeForm.reset();
        })
        .catch((error) => {
          toast({
            title: "Supplier update failed",
            description: error.message,
            variant: "destructive",
          });
        });
    } else {
      editEmployeeMutation.mutate({ ...data, id: selectedEmployee.id });
    }
  };

  // Combine users and suppliers for unified list
  const combinedList = [
    ...users.map((u) => ({ ...u, type: u.role })),
    ...suppliers.map((s) => ({ ...s, type: "supplier" })),
  ];

  // Filter by dropdown
  const filteredList =
    filterType === "all"
      ? combinedList
      : combinedList.filter((item) => item.type === filterType);

  // Handle delete logic for both users and suppliers
  const handleDelete = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Delete failed",
        description: "No employee selected.",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      return;
    }
    try {
      console.log("Attempting to delete:", selectedEmployee);
      let response;
      if (selectedEmployee.type === "supplier") {
        response = await apiRequest(
          "DELETE",
          `/api/suppliers/${selectedEmployee.supplier_id}`
        );
        queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
        refetchSuppliers();
        toast({
          title: "Supplier deleted",
          description: `Supplier ${selectedEmployee.first_name || ""} ${
            selectedEmployee.last_name || ""
          } has been deleted successfully`,
        });
      } else {
        response = await apiRequest(
          "DELETE",
          `/api/users/${selectedEmployee.id}`
        );
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
        toast({
          title: "Employee deleted",
          description: `Employee ${
            selectedEmployee.name || selectedEmployee.first_name || ""
          } has been deleted successfully`,
        });
      }
      console.log("Delete API response:", response);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || String(error),
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-foreground">
                  Suppliers
                </h1>
                <div className="flex space-x-2">
                  {/* Refresh Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchSuppliers()}
                    disabled={isSuppliersLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        isSuppliersLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                  {/* Create Employee Button */}
                  <Dialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                  >
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
                          Fill in the details below to create a new employee
                          account
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...createEmployeeForm}>
                        <form
                          onSubmit={createEmployeeForm.handleSubmit(
                            onCreateEmployeeSubmit
                          )}
                          className="space-y-5"
                        >
                          <FormField
                            control={createEmployeeForm.control}
                            name="id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ID</FormLabel>
                                <FormControl>
                                  <Input placeholder="Employee ID" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createEmployeeForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="manager">
                                      Manager
                                    </SelectItem>
                                    <SelectItem value="employee">
                                      Employee
                                    </SelectItem>
                                    <SelectItem value="supplier">
                                      Supplier
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={createEmployeeForm.control}
                              name="first_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="First name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={createEmployeeForm.control}
                              name="last_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={createEmployeeForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
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
                            <FormField
                              control={createEmployeeForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Phone number"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={createEmployeeForm.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="active">
                                      Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                      Inactive
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Supplier-specific fields */}
                          {createEmployeeForm.watch("role") === "supplier" && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={createEmployeeForm.control}
                                  name="city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>City</FormLabel>
                                      <FormControl>
                                        <Input placeholder="City" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={createEmployeeForm.control}
                                  name="state"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>State</FormLabel>
                                      <FormControl>
                                        <Input placeholder="State" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={createEmployeeForm.control}
                                  name="country"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Country</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Country"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={createEmployeeForm.control}
                                  name="zipcode"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Zipcode</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Zipcode"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </>
                          )}
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
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle>Employee Management</CardTitle>
                  <CardDescription>
                    Manage your organization's employees and their access
                    settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...mainForm}>
                    <form className="space-y-4">
                      <div className="flex items-center mb-4">
                        <FormField
                          control={mainForm.control}
                          name="filter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="mr-2">Show:</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setFilterType(value);
                                }}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="manager">
                                    Manager
                                  </SelectItem>
                                  <SelectItem value="employee">
                                    Employee
                                  </SelectItem>
                                  <SelectItem value="supplier">
                                    Supplier
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex mb-4">
                        <FormField
                          control={mainForm.control}
                          name="search"
                          render={({ field }) => (
                            <FormItem className="w-full max-w-sm">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                  <Input
                                    type="search"
                                    placeholder="Search employees..."
                                    className="pl-8 bg-background text-foreground"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      setSearchQuery(e.target.value);
                                    }}
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>

                  {isSuppliersLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="rounded-md border border-border bg-background">
                      <Table>
                        <TableHeader className="bg-muted">
                          <TableRow>
                            <TableHead className="text-foreground">
                              Employee
                            </TableHead>
                            <TableHead className="text-foreground">
                              ID
                            </TableHead>
                            <TableHead className="text-foreground">
                              Type
                            </TableHead>
                            <TableHead className="text-foreground">
                              Status
                            </TableHead>
                            <TableHead className="text-foreground">
                              Email
                            </TableHead>
                            <TableHead className="text-foreground">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredList.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-4 text-muted-foreground"
                              >
                                No employees found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredList.map((item) => (
                              <TableRow
                                key={item.id}
                                className="hover:bg-accent"
                              >
                                <TableCell>
                                  <div className="flex items-center">
                                    <UserAvatar user={item} size="sm" />
                                    <span className="ml-2 font-medium text-foreground">
                                      {item.name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-foreground">
                                  {item.employeeId}
                                </TableCell>
                                <TableCell className="capitalize text-foreground">
                                  {item.type}
                                </TableCell>
                                <TableCell>
                                  <StatusIndicator />
                                </TableCell>
                                <TableCell className="text-foreground">
                                  {item.email || "-"}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedEmployee(item);
                                          setEditDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedEmployee(item);
                                          setDeleteDialogOpen(true);
                                        }}
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
                <CardFooter className="flex justify-between border-t border-border px-6 py-3">
                  <div className="text-sm text-muted-foreground">
                    {filteredList.length} employees
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav isAdmin={user.role === "admin"} />

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee information</DialogDescription>
          </DialogHeader>
          <Form {...editEmployeeForm}>
            <form
              onSubmit={editEmployeeForm.handleSubmit(onEditEmployeeSubmit)}
              className="space-y-5"
            >
              <FormField
                control={editEmployeeForm.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Employee ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editEmployeeForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editEmployeeForm.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editEmployeeForm.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editEmployeeForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                <FormField
                  control={editEmployeeForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editEmployeeForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Supplier-specific fields for edit */}
              {editEmployeeForm.watch("role") === "supplier" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editEmployeeForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editEmployeeForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editEmployeeForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editEmployeeForm.control}
                      name="zipcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zipcode</FormLabel>
                          <FormControl>
                            <Input placeholder="Zipcode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              <DialogFooter>
                <Button type="submit" disabled={editEmployeeMutation.isPending}>
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
              This action cannot be undone. This will permanently delete the
              employee account and remove their data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {createEmployeeMutation.isPending ? (
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
