import { useAuth } from "@/hooks/use-auth";
import { StatsCard } from "@/components/stats-card";
import { TaskTable } from "@/components/task-table";
import { QuickActionButton } from "@/components/quick-action-button";
import { useQuery } from "@tanstack/react-query";
import { Task, User } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ClipboardList,
  Truck,
  CheckCircle,
  Map,
  PlusCircle,
  Package,
  Clock,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { useLocation } from "wouter";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch all orders
  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      return res.json();
    },
  });

  // Order stats
  const stats = {
    totalOrders: orders.length,
    inStock: orders.filter((o) => o.status === "In Stock").length,
    outOfStock: orders.filter((o) => o.status === "Out of Stock").length,
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          <StatsCard
            title="Orders In Stock"
            value={stats.inStock}
            icon={Package}
            href="/orders"
            color="primary"
          />
          <StatsCard
            title="Orders Out of Stock"
            value={stats.outOfStock}
            icon={Package}
            href="/orders"
            color="danger"
          />
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={Package}
            href="/orders"
            color="success"
          />
        </div>

        {/* Recent Orders Table */}
        <div className="mt-8">
          <Card className="overflow-hidden">
            <CardHeader className="px-6 flex justify-between items-center">
              <CardTitle>Recent Orders</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <BarChart3 className="mr-1 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Clock className="mr-1 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                        Order Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.order_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.item}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.order_date}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No orders available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-muted px-6 py-3 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(orders.length, 5)} recent entries
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate("/orders")}
                >
                  View All Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logistics Overview Section */}
        <div className="mt-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Map View Card */}
          <Card className="overflow-hidden">
            <CardHeader className="px-6 border-b">
              <CardTitle>Logistics Map</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-64 relative">
              <div className="absolute inset-0 bg-muted rounded flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 800 400"
                  className="w-full h-full"
                  style={{ padding: "20px" }}
                >
                  <g className="map-background">
                    <rect
                      x="0"
                      y="0"
                      width="800"
                      height="400"
                      fill="currentColor"
                      className="text-muted"
                    />
                    <path
                      d="M50,200 L750,200"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-muted-foreground/50"
                    />
                    <path
                      d="M400,50 L400,350"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-muted-foreground/50"
                    />
                    <circle
                      cx="200"
                      cy="150"
                      r="5"
                      fill="currentColor"
                      className="text-primary"
                    />
                    <circle
                      cx="600"
                      cy="250"
                      r="5"
                      fill="currentColor"
                      className="text-primary"
                    />
                    <path
                      d="M200,150 C300,100 500,300 600,250"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      className="text-primary"
                    />
                    <circle
                      cx="350"
                      cy="200"
                      r="8"
                      fill="currentColor"
                      className="text-destructive"
                    />
                    <circle
                      cx="500"
                      cy="150"
                      r="8"
                      fill="currentColor"
                      className="text-success"
                    />
                    <text
                      x="210"
                      y="140"
                      fill="currentColor"
                      fontSize="12"
                      className="text-foreground"
                    >
                      Warehouse A
                    </text>
                    <text
                      x="610"
                      y="240"
                      fill="currentColor"
                      fontSize="12"
                      className="text-foreground"
                    >
                      Distribution Center
                    </text>
                    <text
                      x="360"
                      y="190"
                      fill="currentColor"
                      fontSize="12"
                      className="text-foreground"
                    >
                      Delivery #28
                    </text>
                    <text
                      x="510"
                      y="140"
                      fill="currentColor"
                      fontSize="12"
                      className="text-foreground"
                    >
                      Delivery #42
                    </text>
                  </g>
                </svg>
              </div>
              <div className="absolute inset-0 bg-black/10 rounded-md flex items-center justify-center">
                <Button variant="secondary" className="bg-background/90 shadow">
                  <Map className="mr-2 h-4 w-4" />
                  View Full Map
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="overflow-hidden">
            <CardHeader className="px-6 border-b">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <QuickActionButton
                  icon={PlusCircle}
                  label="Create Task"
                  variant="primary"
                  disabled={user.role !== "admin"}
                />

                <QuickActionButton
                  icon={Package}
                  label="Check Inventory"
                  variant="success"
                />

                <QuickActionButton
                  icon={Truck}
                  label="Schedule Delivery"
                  variant="warning"
                />

                <QuickActionButton
                  icon={BarChart3}
                  label="Generate Report"
                  variant="default"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
