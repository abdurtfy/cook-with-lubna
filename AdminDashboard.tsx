import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Clock, Download, Home } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const ordersQuery = trpc.admin.getOrders.useQuery(undefined, {
    enabled: isAuthorized,
  });

  useEffect(() => {
    if (!authLoading) {
      if (user?.role === "admin") {
        setIsAuthorized(true);
      } else {
        setLocation("/");
      }
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const orders = ordersQuery.data?.orders || [];
  const totalSales = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const completedOrders = orders.filter(order => order.paymentStatus === "completed").length;
  const downloadedCount = orders.filter(order => order.downloadedAt).length;

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-900">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            className="text-amber-900 border-amber-200 hover:bg-amber-50"
            onClick={() => setLocation("/")}
          >
            <Home size={16} className="mr-2" />
            Back to Store
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Orders</p>
                <p className="text-3xl font-bold text-amber-900">{completedOrders}</p>
              </div>
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </Card>

          <Card className="p-6 border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-amber-900">{formatAmount(totalSales)}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </Card>

          <Card className="p-6 border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Downloaded</p>
                <p className="text-3xl font-bold text-amber-900">{downloadedCount}</p>
              </div>
              <Download size={32} className="text-blue-600" />
            </div>
          </Card>

          <Card className="p-6 border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Pending</p>
                <p className="text-3xl font-bold text-amber-900">{orders.length - completedOrders}</p>
              </div>
              <Clock size={32} className="text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="border-amber-100 overflow-hidden">
          <div className="p-6 border-b border-amber-100">
            <h2 className="text-xl font-bold text-amber-950">Recent Orders</h2>
          </div>

          {ordersQuery.isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : ordersQuery.error ? (
            <div className="p-8 flex items-start gap-4 text-red-600">
              <AlertCircle size={24} className="flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Failed to load orders</p>
                <p className="text-sm mt-1">{ordersQuery.error.message}</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-amber-100 hover:bg-amber-50">
                    <TableHead className="text-amber-950">Buyer Name</TableHead>
                    <TableHead className="text-amber-950">Email</TableHead>
                    <TableHead className="text-amber-950">Amount</TableHead>
                    <TableHead className="text-amber-950">Status</TableHead>
                    <TableHead className="text-amber-950">Order Date</TableHead>
                    <TableHead className="text-amber-950">Downloaded</TableHead>
                    <TableHead className="text-amber-950">Payment ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-amber-100 hover:bg-amber-50">
                      <TableCell className="font-medium text-amber-950">{order.buyerName}</TableCell>
                      <TableCell className="text-gray-700">{order.buyerEmail}</TableCell>
                      <TableCell className="font-semibold text-amber-900">{formatAmount(order.amount)}</TableCell>
                      <TableCell>
                        {order.paymentStatus === "completed" ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                            <CheckCircle size={14} />
                            Completed
                          </span>
                        ) : order.paymentStatus === "pending" ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
                            <Clock size={14} />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
                            <AlertCircle size={14} />
                            Failed
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm">{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        {order.downloadedAt ? (
                          <span className="inline-flex items-center gap-2 text-green-700 text-sm">
                            <Download size={14} />
                            {formatDate(order.downloadedAt)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Not downloaded</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm font-mono">{order.razorpayPaymentId.slice(0, 12)}...</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
