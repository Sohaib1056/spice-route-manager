import { useState, useEffect } from "react";
import { 
  RotateCcw, Search, Plus, Eye, CheckCircle, XCircle, 
  RefreshCw, Clock, CheckCircle2, DollarSign, User, Package, List, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "@/components/Modal";
import { Pill } from "@/components/Pill";
import { formatPKR, formatDate } from "@/lib/format";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

// --- Custom Confirmation Modal ---

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data?: any) => void;
  title: string;
  message: string;
  type: "approve" | "reject" | "refund";
  loading?: boolean;
}

function ConfirmActionModal({ open, onClose, onConfirm, title, message, type, loading }: ConfirmModalProps) {
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = () => {
    if (type === "reject" && !inputValue.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    onConfirm(inputValue);
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed">{message}</p>
        </div>

        {type === "reject" && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-walnut">Rejection Reason</label>
            <textarea
              className="w-full rounded-lg border border-border p-2 text-sm h-24 bg-white focus:ring-2 focus:ring-amber-brand/20 outline-none"
              placeholder="Explain why this return is being rejected..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        )}

        {type === "refund" && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-walnut">Transaction Reference (Optional)</label>
            <Input
              placeholder="e.g. Bank Transfer ID, Receipt #"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={`${
              type === "approve" ? "bg-success" : 
              type === "reject" ? "bg-destructive" : 
              "bg-blue-600"
            } hover:opacity-90 text-white min-w-[100px]`}
          >
            {loading ? "Processing..." : type === "approve" ? "Approve" : type === "reject" ? "Reject" : "Confirm Refund"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// --- Sub-components for Modals ---

function ReturnDetailView({ data, onClose, onUpdate }: { data: any, onClose: () => void, onUpdate: () => void }) {
  const { user } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "approve" | "reject" | "refund"; title: string; message: string } | null>(null);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await api.approveReturn(data._id, user?.name || "Admin");
      if (res.success) {
        toast.success("Return approved and stock updated");
        onUpdate();
        setConfirmModal(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to approve return");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    setActionLoading(true);
    try {
      const res = await api.rejectReturn(data._id, { rejectionReason: reason, processedBy: user?.name || "Admin" });
      if (res.success) {
        toast.success("Return rejected");
        onUpdate();
        setConfirmModal(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reject return");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefunded = async (ref: string) => {
    setActionLoading(true);
    try {
      const res = await api.markAsRefunded(data._id, { transactionReference: ref, processedBy: user?.name || "Admin" });
      if (res.success) {
        toast.success("Marked as refunded and finance updated");
        onUpdate();
        setConfirmModal(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update refund status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-bold text-walnut border-b pb-2">Order/Sale Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground font-medium">Type:</span> <span className="uppercase">{data.type}</span></p>
            <p><span className="text-muted-foreground font-medium">ID:</span> {data.type === 'website' ? data.orderId?.orderNumber : data.saleId?.invoice}</p>
            <p><span className="text-muted-foreground font-medium">Customer:</span> {data.customer.name}</p>
            <p><span className="text-muted-foreground font-medium">Phone:</span> {data.customer.phone}</p>
            {data.cashierName && <p><span className="text-muted-foreground font-medium">Cashier:</span> {data.cashierName}</p>}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-walnut border-b pb-2">Return Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Status:</span>
              <Pill tone={data.status === 'Pending' ? 'amber' : data.status === 'Approved' ? 'success' : data.status === 'Rejected' ? 'danger' : 'info'}>
                {data.status}
              </Pill>
            </div>
            {data.rejectionReason && <p><span className="text-red-600 font-medium">Reason for Rejection:</span> {data.rejectionReason}</p>}
            {data.processedBy && <p><span className="text-muted-foreground font-medium">Processed By:</span> {data.processedBy}</p>}
            {data.processedAt && <p><span className="text-muted-foreground font-medium">Processed At:</span> {formatDate(data.processedAt)}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-walnut border-b pb-2">Items Returned</h3>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-xs text-left">
            <thead className="bg-cream/40">
              <tr className="border-b">
                <th className="p-2">Product Name</th>
                <th className="p-2">Weight</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit Price</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item: any, i: number) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-2 font-medium">{item.productName}</td>
                  <td className="p-2 uppercase">{item.weight}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{formatPKR(item.unitPrice)}</td>
                  <td className="p-2 text-right font-bold">{formatPKR(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-bold text-walnut border-b pb-2">Return Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground font-medium">Reason:</span> {data.reason}</p>
            <p><span className="text-muted-foreground font-medium">Condition:</span> {data.condition}</p>
            {data.notes && <p><span className="text-muted-foreground font-medium">Notes:</span> {data.notes}</p>}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-walnut border-b pb-2">Refund Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground font-medium">Method:</span> {data.refundMethod}</p>
            <p><span className="text-amber-brand font-bold text-lg">Amount: {formatPKR(data.refundAmount)}</span></p>
            {data.refundedAt && <p><span className="text-muted-foreground font-medium">Refunded At:</span> {formatDate(data.refundedAt)}</p>}
            {data.transactionReference && <p><span className="text-muted-foreground font-medium">Ref #:</span> {data.transactionReference}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        {data.status === 'Pending' && (
          <>
            <Button 
              onClick={() => setConfirmModal({
                open: true,
                type: "reject",
                title: "Reject Return Request",
                message: "Are you sure you want to reject this return? You must provide a reason."
              })} 
              variant="outline" 
              className="text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              Reject
            </Button>
            <Button 
              onClick={() => setConfirmModal({
                open: true,
                type: "approve",
                title: "Approve Return Request",
                message: "This will add the items back to inventory stock. Are you sure you want to continue?"
              })} 
              className="bg-success hover:opacity-90 text-white"
            >
              Approve
            </Button>
          </>
        )}
        {data.status === 'Approved' && (
          <Button 
            onClick={() => setConfirmModal({
              open: true,
              type: "refund",
              title: "Process Refund",
              message: "This will mark the return as Refunded and create a Finance expense transaction. Are you sure?"
            })} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Mark as Refunded
          </Button>
        )}
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>

      {confirmModal && (
        <ConfirmActionModal
          open={confirmModal.open}
          onClose={() => setConfirmModal(null)}
          onConfirm={(val) => {
            if (confirmModal.type === "approve") handleApprove();
            else if (confirmModal.type === "reject") handleReject(val);
            else if (confirmModal.type === "refund") handleRefunded(val);
          }}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

function NewReturnForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { user } = useAuth();
  const [type, setType] = useState<"website" | "pos">("website");
  const [lookupId, setLookupId] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [saleId, setSaleId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [reason, setReason] = useState("Quality Issue");
  const [condition, setCondition] = useState("Good Condition");
  const [notes, setNotes] = useState("");
  const [refundMethod, setRefundMethod] = useState("Cash");
  const [refundAmount, setRefundAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleLookup = async () => {
    if (!lookupId) return toast.error("Please enter ID, Name, or Phone");
    setLookupLoading(true);
    setSearchResults([]);
    try {
      if (type === "website") {
        const res = await api.getWebsiteOrders({ search: lookupId, limit: 10 }) as any;
        if (res.success && res.data.orders) {
          setSearchResults(res.data.orders);
          if (res.data.orders.length === 0) toast.error("No website orders found");
        }
      } else {
        const res = await api.getSales({ search: lookupId, limit: 10 }) as any;
        if (res.success && res.data) {
          const data = res.data.data || res.data;
          setSearchResults(Array.isArray(data) ? data : []);
          if ((Array.isArray(data) ? data.length : 0) === 0) toast.error("No POS sales found");
        }
      }
    } catch (err) {
      toast.error("Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  };

  const selectTransaction = (tx: any) => {
    if (type === "website") {
      setOrderId(tx._id);
      setCustomer({
        name: `${tx.customer.firstName} ${tx.customer.lastName}`,
        phone: tx.customer.phone,
        email: tx.customer.email || ""
      });
      setItems(tx.items.map((i: any) => ({
        productId: i.productId?._id || i.productId,
        productName: i.productId?.name || i.name,
        weight: i.selectedWeight,
        quantity: i.quantity,
        unitPrice: i.price,
        totalPrice: i.subtotal
      })));
    } else {
      setSaleId(tx._id);
      setCustomer({
        name: tx.customer || "Walk-in",
        phone: tx.customerPhone || "",
        email: ""
      });
      setItems(tx.items.map((i: any) => ({
        productId: i.productId,
        productName: i.name,
        weight: i.unit || "N/A",
        quantity: i.qty,
        unitPrice: i.price,
        totalPrice: i.qty * i.price
      })));
    }
    setSearchResults([]);
  };

  const toggleItem = (item: any) => {
    const isSelected = selectedItems.find(i => i.productId === item.productId && i.weight === item.weight);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => !(i.productId === item.productId && i.weight === item.weight)));
    } else {
      setSelectedItems([...selectedItems, { ...item, returnQty: item.quantity }]);
    }
  };

  const updateReturnQty = (item: any, qty: number) => {
    if (qty > item.quantity) {
      toast.error(`Max quantity is ${item.quantity}`);
      return;
    }
    setSelectedItems(selectedItems.map(i => 
      (i.productId === item.productId && i.weight === item.weight) ? { ...i, returnQty: qty } : i
    ));
  };

  useEffect(() => {
    const total = selectedItems.reduce((sum, i) => sum + (i.returnQty * i.unitPrice), 0);
    setRefundAmount(total);
  }, [selectedItems]);

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return toast.error("Select items to return");
    setLoading(true);
    try {
      const payload = {
        type,
        orderId: type === 'website' ? (orderId || null) : null,
        saleId: type === 'pos' ? (saleId || null) : null,
        customer: {
          ...customer,
          email: customer.email || ""
        },
        cashierName: type === 'pos' ? user?.name : undefined,
        items: selectedItems.map(i => ({
          productId: i.productId,
          productName: i.productName,
          weight: i.weight || "N/A",
          quantity: i.returnQty,
          unitPrice: i.unitPrice,
          totalPrice: i.returnQty * i.unitPrice
        })),
        reason,
        condition,
        notes: notes || "",
        refundMethod,
        refundAmount
      };

      console.log("Submitting Return Payload:", payload);
      const res = await api.createReturn(payload);
      if (res.success) {
        toast.success("Return request created");
        onSuccess();
      } else {
        toast.error(res.message || "Failed to create request");
      }
    } catch (err: any) {
      console.error("Return Submission Error:", err);
      toast.error(err.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cream/30 p-4 rounded-xl border">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-walnut mb-2 block">Return Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={type === "website"} onChange={() => { setType("website"); setOrderId(null); setSaleId(null); setItems([]); setSelectedItems([]); setSearchResults([]); }} className="text-amber-brand" />
              <span className="text-sm font-medium">Website Order</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={type === "pos"} onChange={() => { setType("pos"); setOrderId(null); setSaleId(null); setItems([]); setSelectedItems([]); setSearchResults([]); }} className="text-amber-brand" />
              <span className="text-sm font-medium">POS Sale</span>
            </label>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-walnut mb-2 block">Lookup (ID, Name, Phone)</label>
          <div className="flex gap-2">
            <Input 
              value={lookupId} 
              onChange={(e) => setLookupId(e.target.value)} 
              placeholder="Search..."
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
            <Button onClick={handleLookup} disabled={lookupLoading} variant="secondary">
              {lookupLoading ? "..." : "Search"}
            </Button>
          </div>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3 animate-fade-up">
          <h3 className="text-sm font-bold text-walnut flex items-center gap-2">
            <List className="h-4 w-4" /> Select Transaction
          </h3>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
            {searchResults.map((tx) => (
              <div 
                key={tx._id} 
                onClick={() => selectTransaction(tx)}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-amber-brand hover:bg-amber-brand/5 cursor-pointer transition-all group"
              >
                <div>
                  <p className="text-sm font-bold text-walnut group-hover:text-amber-brand">
                    {type === "website" ? tx.orderNumber : tx.invoice}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {type === "website" ? `${tx.customer.firstName} ${tx.customer.lastName}` : tx.customer} | {formatPKR(tx.total)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{formatDate(tx.createdAt || tx.orderDate)}</p>
                  <Pill tone="info" className="scale-75 origin-right">{tx.orderStatus || 'Sold'}</Pill>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {customer.name && !searchResults.length && (
        <div className="space-y-6 animate-fade-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-walnut border-b pb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> Customer Details
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Name:</span> {customer.name}</p>
                <p><span className="text-muted-foreground">Phone:</span> {customer.phone}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-walnut border-b pb-2 flex items-center gap-2">
                <Package className="h-4 w-4" /> Order Items
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 border rounded-lg p-2">
                {items.map((item, i) => {
                  const selected = selectedItems.find(si => si.productId === item.productId && si.weight === item.weight);
                  return (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${selected ? 'bg-amber-brand/5 border-amber-brand' : 'bg-white border-border'}`}>
                      <input type="checkbox" checked={!!selected} onChange={() => toggleItem(item)} className="rounded text-amber-brand" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{item.productName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{item.weight} - {formatPKR(item.unitPrice)}</p>
                      </div>
                      {selected && (
                        <div className="w-16">
                          <Input 
                            type="number" 
                            size={1}
                            className="h-8 text-xs p-1 text-center" 
                            value={selected.returnQty} 
                            onChange={(e) => updateReturnQty(item, Number(e.target.value))} 
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-walnut border-b pb-2">Return Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Reason</label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Damaged Product", "Wrong Item", "Quality Issue", "Customer Changed Mind", "Other"].map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Condition</label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Unopened", "Opened", "Good Condition", "Damaged"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-border p-2 text-sm h-20 bg-white" placeholder="Extra details..." />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-walnut border-b pb-2">Refund Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Refund Method</label>
                  <Select value={refundMethod} onValueChange={setRefundMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Cash", "JazzCash", "Bank Transfer", "Store Credit"].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Refund Amount (PKR)</label>
                  <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value))} />
                  <p className="text-[10px] text-muted-foreground mt-1">Calculated from selected items</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-amber-brand hover:opacity-90 text-white min-w-[120px]">
              {loading ? "Submitting..." : "Submit Return"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page ---

export default function ReturnsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"website" | "pos">("website");
  const [returns, setReturns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [isNewReturnOpen, setNewReturnOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "approve" | "reject"; id: string; title: string; message: string } | null>(null);

  // Stats fetching
  const fetchStats = async () => {
    try {
      const res = await api.getReturnStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Returns fetching
  const fetchReturns = async () => {
    setLoading(true);
    try {
      const params: any = { type: activeTab };
      if (statusFilter !== "All") params.status = statusFilter;
      if (search) params.search = search;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await api.getReturns(params) as any;
      if (res.success) setReturns(res.data.returns || []);
    } catch (err) {
      toast.error("Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchReturns();
  }, [activeTab, statusFilter, fromDate, toDate, search]);

  const handleReset = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "Pending": return <Pill tone="amber">Pending</Pill>;
      case "Approved": return <Pill tone="success">Approved</Pill>;
      case "Rejected": return <Pill tone="danger">Rejected</Pill>;
      case "Refunded": return <Pill tone="info">Refunded</Pill>;
      default: return <Pill tone="walnut">{status}</Pill>;
    }
  };

  async function handleApprove(id: string) {
    setActionLoading(true);
    try {
      const res = await api.approveReturn(id, user?.name || "Admin");
      if (res.success) {
        toast.success("Return approved and stock updated");
        fetchReturns();
        fetchStats();
        setConfirmModal(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to approve return");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(id: string, reason: string) {
    setActionLoading(true);
    try {
      const res = await api.rejectReturn(id, { rejectionReason: reason, processedBy: user?.name || "Admin" });
      if (res.success) {
        toast.success("Return rejected");
        fetchReturns();
        fetchStats();
        setConfirmModal(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reject return");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-walnut flex items-center gap-2">
            <RotateCcw className="h-6 w-6" />
            Returns and Refunds
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage product returns and customer refunds</p>
        </div>
        <Button 
          onClick={() => setNewReturnOpen(true)}
          className="bg-amber-brand hover:bg-amber-brand/90 text-white gap-2"
        >
          <Plus className="h-4 w-4" /> New Return Request
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("website")}
          className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
            activeTab === "website" ? "text-amber-brand" : "text-muted-foreground hover:text-walnut"
          }`}
        >
          Website Orders Returns
          {activeTab === "website" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-brand" />}
        </button>
        <button
          onClick={() => setActiveTab("pos")}
          className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
            activeTab === "pos" ? "text-amber-brand" : "text-muted-foreground hover:text-walnut"
          }`}
        >
          POS Software Returns
          {activeTab === "pos" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-brand" />}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReturns || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingReturns || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Refunds</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approvedRefunds || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refund Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(stats?.totalRefundAmount || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search ID/Customer..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
            />
            <Input 
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
            />
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/60 text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left p-4">Return ID</th>
                  {activeTab === "website" ? (
                    <th className="text-left p-4">Order ID</th>
                  ) : (
                    <th className="text-left p-4">Sale ID</th>
                  )}
                  {activeTab === "pos" && <th className="text-left p-4">Cashier</th>}
                  <th className="text-left p-4">Customer</th>
                  {activeTab === "website" && <th className="text-left p-4">Phone</th>}
                  <th className="text-left p-4">Items</th>
                  <th className="text-left p-4">Reason</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-right p-4">Refund</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-brand border-r-transparent"></div>
                      <p className="mt-2 text-muted-foreground">Loading returns...</p>
                    </td>
                  </tr>
                ) : returns.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-muted-foreground">
                      No return requests found
                    </td>
                  </tr>
                ) : returns.map((r) => (
                  <tr key={r._id} className="border-b border-border hover:bg-cream/20 transition-colors">
                    <td className="p-4 font-mono font-semibold text-walnut">{r.returnId}</td>
                    <td className="p-4 font-mono">{r.type === 'website' ? r.orderId?.orderNumber || 'N/A' : r.saleId?.invoice || 'N/A'}</td>
                    {activeTab === "pos" && <td className="p-4">{r.cashierName || 'System'}</td>}
                    <td className="p-4 font-medium">{r.customer.name}</td>
                    {activeTab === "website" && <td className="p-4 text-muted-foreground">{r.customer.phone}</td>}
                    <td className="p-4">{r.items.length} items</td>
                    <td className="p-4 max-w-[150px] truncate">{r.reason}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(r.createdAt)}</td>
                    <td className="p-4 text-right font-semibold">{formatPKR(r.refundAmount)}</td>
                    <td className="p-4">{getStatusPill(r.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setSelectedReturn(r); setDetailOpen(true); }}
                          className="p-1.5 rounded-md text-info hover:bg-info/10"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {r.status === "Pending" && (
                          <>
                            <button 
                              onClick={() => setConfirmModal({
                                open: true,
                                type: "approve",
                                id: r._id,
                                title: "Approve Return",
                                message: "This will add items back to stock. Continue?"
                              })}
                              className="p-1.5 rounded-md text-success hover:bg-success/10"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => setConfirmModal({
                                open: true,
                                type: "reject",
                                id: r._id,
                                title: "Reject Return",
                                message: "Please provide a reason for rejection."
                              })}
                              className="p-1.5 rounded-md text-destructive hover:bg-destructive/10"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Return Request Modal */}
      <Modal 
        open={isNewReturnOpen} 
        onClose={() => setNewReturnOpen(false)} 
        title="New Return Request" 
        size="lg"
      >
        <NewReturnForm 
          onClose={() => setNewReturnOpen(false)} 
          onSuccess={() => {
            fetchReturns();
            fetchStats();
            setNewReturnOpen(false);
          }}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal 
        open={isDetailOpen} 
        onClose={() => setDetailOpen(false)} 
        title={`Return Detail - ${selectedReturn?.returnId}`} 
        size="lg"
      >
        {selectedReturn && (
          <ReturnDetailView 
            data={selectedReturn} 
            onClose={() => setDetailOpen(false)}
            onUpdate={() => {
              fetchReturns();
              fetchStats();
              setDetailOpen(false);
            }}
          />
        )}
      </Modal>

      {confirmModal && (
        <ConfirmActionModal
          open={confirmModal.open}
          onClose={() => setConfirmModal(null)}
          onConfirm={(val) => {
            if (confirmModal.type === "approve") handleApprove(confirmModal.id);
            else if (confirmModal.type === "reject") handleReject(confirmModal.id, val);
          }}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
