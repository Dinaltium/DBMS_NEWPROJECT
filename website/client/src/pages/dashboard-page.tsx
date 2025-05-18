import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { StatsCard } from "@/components/stats-card";
import { TaskTable } from "@/components/task-table";
import { QuickActionButton } from "@/components/quick-action-button";
import { useQuery } from "@tanstack/react-query";
import { Task, User } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardList, Truck, CheckCircle, Map, PlusCircle, Package, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Fetch recent tasks
  const { data: recentTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/recent"],
  });

  // Fetch all users for displaying task assignees
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === 'admin', // Only fetch all users if the user is an admin
  });
  
  // Local stats for the UI (would typically come from the API)
  const stats = {
    ongoingTasks: recentTasks.filter(t => t.status === 'in_progress').length,
    pendingShipments: 7,
    completedTasks: recentTasks.filter(t => t.status === 'completed').length,
  };
  
  if (!user) return null;
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-background">
      <Sidebar user={user} />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                  title="Ongoing Tasks"
                  value={stats.ongoingTasks}
                  icon={ClipboardList}
                  href="/tasks"
                  color="primary"
                />
                
                <StatsCard
                  title="Pending Shipments"
                  value={stats.pendingShipments}
                  icon={Truck}
                  href="/shipments"
                  color="warning"
                />
                
                <StatsCard
                  title="Completed Tasks"
                  value={stats.completedTasks}
                  icon={CheckCircle}
                  href="/tasks?status=completed"
                  color="success"
                />
              </div>
              
              {/* Recent Activity Table */}
              <div className="mt-8">
                <Card className="overflow-hidden">
                  <CardHeader className="px-6 flex justify-between items-center">
                    <CardTitle>Recent Activity</CardTitle>
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
                    <TaskTable tasks={recentTasks} users={users} />
                    <div className="bg-gray-50 dark:bg-dark-input px-6 py-3 flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {recentTasks.length} recent entries
                      </div>
                      <Button variant="link" size="sm">View All Tasks</Button>
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
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 800 400" 
                        className="w-full h-full"
                        style={{ padding: '20px' }}
                      >
                        <g className="map-background">
                          <rect x="0" y="0" width="800" height="400" fill="#f0f0f0" className="dark:fill-gray-800" />
                          <path d="M50,200 L750,200" stroke="#d0d0d0" strokeWidth="1" className="dark:stroke-gray-700" />
                          <path d="M400,50 L400,350" stroke="#d0d0d0" strokeWidth="1" className="dark:stroke-gray-700" />
                          <circle cx="200" cy="150" r="5" fill="#3B82F6" />
                          <circle cx="600" cy="250" r="5" fill="#3B82F6" />
                          <path d="M200,150 C300,100 500,300 600,250" stroke="#3B82F6" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                          <circle cx="350" cy="200" r="8" fill="#EF4444" />
                          <circle cx="500" cy="150" r="8" fill="#10B981" />
                          <text x="210" y="140" fill="#374151" fontSize="12" className="dark:fill-gray-300">Warehouse A</text>
                          <text x="610" y="240" fill="#374151" fontSize="12" className="dark:fill-gray-300">Distribution Center</text>
                          <text x="360" y="190" fill="#374151" fontSize="12" className="dark:fill-gray-300">Delivery #28</text>
                          <text x="510" y="140" fill="#374151" fontSize="12" className="dark:fill-gray-300">Delivery #42</text>
                        </g>
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-black/10 rounded-md flex items-center justify-center">
                      <Button variant="secondary" className="bg-white/90 dark:bg-dark-card/90 shadow">
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
                        disabled={user.role !== 'admin'}
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
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav isAdmin={user.role === 'admin'} />
    </div>
  );
}
