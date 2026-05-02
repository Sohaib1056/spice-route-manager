import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { 
  Globe, 
  Search, 
  Filter, 
  Eye, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Trash2,
  Edit2,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import axios from "axios";

// Custom hook for debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const API_URL = "http://localhost:5000/api/website-orders";

interface WebsiteOrder {
  _id: string;
  orderNumber: string;
  orderDate: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  shippingAddress: {
    address: string;
    apartment?: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    nameUrdu?: string;
    emoji?: string;
    selectedWeight: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  shippingCharges: number;
  total: number;
  paymentMethod: "cod" | "online";
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  deliveryNotes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  todayOrders: number;
  totalRevenue: Array<{ _id: null; total: number }>;
  pendingPayments: Array<{ _id: null; total: number }>;
}

export default function WebsiteOrdersPage() {
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WebsiteOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setDetailsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ orderStatus: "", paymentStatus: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("new-website-order", (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
      fetchStats();
      toast.success(`Naya Order Aaya Hai: ${newOrder.orderNumber}`, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#4B2C20',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [statusFilter, debouncedSearch, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await axios.get(API_URL, { params });
      setOrders(response.data.data.orders);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleEditClick = (order: WebsiteOrder) => {
    setSelectedOrder(order);
    setEditForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus
    });
    setDetailsEditOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setIsUpdating(true);
      
      // Update Order Status if changed
      if (editForm.orderStatus !== selectedOrder.orderStatus) {
        await axios.patch(`${API_URL}/${selectedOrder._id}/status`, { 
          orderStatus: editForm.orderStatus 
        });
      }
      
      // Update Payment Status if changed
      if (editForm.paymentStatus !== selectedOrder.paymentStatus) {
        await axios.patch(`${API_URL}/${selectedOrder._id}/payment`, { 
          paymentStatus: editForm.paymentStatus 
        });
      }

      toast.success("Order updated successfully");
      setDetailsEditOpen(false);
      await fetchOrders();
      await fetchStats();
      
      // Close details if they were open to force refresh
      if (detailsOpen) setDetailsOpen(false);
      
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      setIsDeleting(true);
      await axios.delete(`${API_URL}/${orderToDelete}`);
      toast.success("Order deleted successfully");
      setDeleteOpen(false);
      setOrderToDelete(null);
      fetchOrders();
      fetchStats();
      if (detailsOpen) setDetailsOpen(false);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      const payload: any = { orderStatus: newStatus };
      if (trackingNumber) payload.trackingNumber = trackingNumber;

      await axios.patch(`${API_URL}/${orderId}/status`, payload);
      toast.success("Order status updated successfully");
      fetchOrders();
      fetchStats();
      if (selectedOrder?._id === orderId) {
        const response = await axios.get(`${API_URL}/${orderId}`);
        setSelectedOrder(response.data.data);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(`${API_URL}/${orderId}/payment`, { paymentStatus: newStatus });
      toast.success("Payment status updated successfully");
      fetchOrders();
      fetchStats();
      if (selectedOrder?._id === orderId) {
        const response = await axios.get(`${API_URL}/${orderId}`);
        setSelectedOrder(response.data.data);
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment status");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800",
      Confirmed: "bg-blue-100 text-blue-800",
      Processing: "bg-purple-100 text-purple-800",
      Shipped: "bg-cyan-100 text-cyan-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      Paid: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-walnut flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Website Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage orders from your e-commerce website
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayOrders} orders today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {stats.totalRevenue[0]?.total?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All time revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {stats.pendingPayments[0]?.total?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Order #</th>
                    <th className="text-left p-4 font-semibold">Customer</th>
                    <th className="text-left p-4 font-semibold">Phone</th>
                    <th className="text-left p-4 font-semibold">Total</th>
                    <th className="text-left p-4 font-semibold">Payment</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-mono text-sm">{order.orderNumber}</td>
                      <td className="p-4">
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="p-4">{order.customer.phone}</td>
                      <td className="p-4 font-semibold">Rs. {order.total.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(order.orderStatus)}>
                          {order.orderStatus}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-walnut border-walnut/20 hover:bg-walnut/5"
                            onClick={() => handleEditClick(order)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-100 hover:bg-red-50"
                            onClick={() => {
                              setOrderToDelete(order._id);
                              setDeleteOpen(true);
                            }}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Complete order information and management
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedOrder.customer.phone}</p>
                  </div>
                  {selectedOrder.customer.email && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.customer.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p>{selectedOrder.shippingAddress.address}</p>
                  {selectedOrder.shippingAddress.apartment && (
                    <p>{selectedOrder.shippingAddress.apartment}</p>
                  )}
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}
                  </p>
                  {selectedOrder.shippingAddress.postalCode && (
                    <p>Postal Code: {selectedOrder.shippingAddress.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.emoji || "📦"}</span>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.selectedWeight} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">Rs. {item.subtotal.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {selectedOrder.shippingCharges === 0
                        ? "FREE"
                        : `Rs. ${selectedOrder.shippingCharges.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>Rs. {selectedOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span>Payment Method</span>
                    <Badge>{selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</Badge>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Order Status</label>
                  <Select
                    value={selectedOrder.orderStatus}
                    onValueChange={(value) => updateOrderStatus(selectedOrder._id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Status</label>
                  <Select
                    value={selectedOrder.paymentStatus}
                    onValueChange={(value) => updatePaymentStatus(selectedOrder._id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Delivery Notes */}
              {selectedOrder.deliveryNotes && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Delivery Notes</h3>
                  <p className="bg-muted/50 p-4 rounded-lg">{selectedOrder.deliveryNotes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Order Date: {formatDate(selectedOrder.orderDate)}
                </p>
                <p>Created: {formatDate(selectedOrder.createdAt)}</p>
                <p>Last Updated: {formatDate(selectedOrder.updatedAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Order Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setDetailsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Order # {selectedOrder?.orderNumber} ki status update karein
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Order Status</label>
                <Select
                  value={editForm.orderStatus}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, orderStatus: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Payment Status</label>
                <Select
                  value={editForm.paymentStatus}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, paymentStatus: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDetailsEditOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateOrder}
                  disabled={isUpdating}
                  className="bg-walnut hover:bg-walnut/90 text-white"
                >
                  {isUpdating ? "Updating..." : "Done"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-red-600 p-6 flex flex-col items-center text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm animate-pulse">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">Delete Order?</DialogTitle>
            <DialogDescription className="text-red-100 mt-2 font-medium text-center px-4">
              Kya aap waqai is order ko delete karna chahte hain? Ye action wapas nahi liya ja sakega.
            </DialogDescription>
          </div>
          <DialogFooter className="p-6 bg-white flex flex-row sm:justify-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteOpen(false)}
              className="flex-1 px-8 py-6 rounded-xl font-bold uppercase tracking-widest text-[10px] border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </Button>
            <Button 
              onClick={deleteOrder}
              disabled={isDeleting}
              className="flex-1 px-8 py-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-200 transition-all active:scale-95"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete It"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
