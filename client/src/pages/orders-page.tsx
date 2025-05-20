import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "../components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Order {
  order_id: number;
  order_number: string;
  order_date: string;
  status: string;
  item: string;
}

export default function OrdersPage() {
  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Orders</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{(error as Error).message}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card border border-border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left">Order #</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Item</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id} className="border-t border-border">
                    <td className="px-4 py-2">{order.order_number}</td>
                    <td className="px-4 py-2">{order.order_date}</td>
                    <td className="px-4 py-2">{order.status}</td>
                    <td className="px-4 py-2">{order.item}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
