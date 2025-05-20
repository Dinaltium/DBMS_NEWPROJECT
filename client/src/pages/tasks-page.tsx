import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function OrdersPage() {
  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/orders");
      return res.json();
    },
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header onMenuClick={() => {}} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-foreground">
                  Orders
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>
              <div className="rounded-md border border-border bg-background">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No orders available
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.order_id}>
                          <TableCell>{order.order_number}</TableCell>
                          <TableCell>{order.item}</TableCell>
                          <TableCell>{order.status}</TableCell>
                          <TableCell>{order.order_date}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
