import { useState, useMemo, useEffect } from "react";
import {
  Bell,
  Filter,
  Search,
  Download,
  Eye,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  ShoppingCart,
  Package,
  Truck,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
} from "lucide-react";
import { Pill } from "@/components/Pill";
import { formatDateTime, formatDate } from "@/lib/format";
import { api } from "@/services/api";
import toast from "react-hot-toast";

type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "permission_change"
  | "settings_change"
  | "purchase"
  | "sale"
  | "stock_adjustment";

type AuditCategory = "user" | "product" | "transaction" | "system" | "security" | "all";

type AuditSeverity = "info" | "warning" | "success" | "error";

interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userRole: "Admin" | "Manager" | "Staff";
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  module: string;
  description: string;
  details?: string;
  ipAddress?: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  timestamp: string;
  createdAt: string;
}

const getActionIcon = (action: AuditAction) => {
  switch (action) {
    case "create":
      return <UserPlus className="h-4 w-4" />;
    case "update":
      return <Edit className="h-4 w-4" />;
    case "delete":
      return <Trash2 className="h-4 w-4" />;
    case "login":
    case "logout":
      return <Shield className="h-4 w-4" />;
    case "permission_change":
      return <Shield className="h-4 w-4" />;
    case "settings_change":
      return <Settings className="h-4 w-4" />;
    case "purchase":
      return <Truck className="h-4 w-4" />;
    case "sale":
      return <ShoppingCart className="h-4 w-4" />;
    case "stock_adjustment":
      return <Package className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getSeverityIcon = (severity: AuditSeverity) => {
  switch (severity) {
    case "success":
      return <CheckCircle className="h-4 w-4" />;
    case "warning":
      return <AlertCircle className="h-4 w-4" />;
    case "error":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity: AuditSeverity) => {
  switch (severity) {
    case "success":
      return "text-success bg-success/10";
    case "warning":
      return "text-warning bg-warning/10";
    case "error":
      return "text-destructive bg-destructive/10";
    default:
      return "text-info bg-info/10";
  }
};

export default function NotificationsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AuditCategory>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<AuditSeverity | "all">("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [selectedCategory, selectedSeverity]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    const params: any = {};
    
    if (selectedCategory !== "all") {
      params.category = selectedCategory;
    }
    
    if (selectedSeverity !== "all") {
      params.severity = selectedSeverity;
    }

    try {
      const response = await api.getAuditLogs(params);
      if (response.success && response.data) {
        setAuditLogs(response.data as AuditLog[]);
      } else {
        toast.error("Failed to load audit logs");
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("An error occurred while fetching audit logs");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.module.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;
      const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [auditLogs, searchQuery, selectedCategory, selectedSeverity]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      total: auditLogs.length,
      today: auditLogs.filter((log) => {
        const logDate = new Date(log.timestamp || log.createdAt);
        return logDate >= todayStart;
      }).length,
      critical: auditLogs.filter((log) => log.severity === "error").length,
      warnings: auditLogs.filter((log) => log.severity === "warning").length,
    };
  }, [auditLogs]);

  const exportToCSV = async () => {
    try {
      const params: any = {};
      
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      
      if (selectedSeverity !== "all") {
        params.severity = selectedSeverity;
      }

      const headers = ["Timestamp", "User", "Role", "Action", "Module", "Description", "IP Address"];
      const rows = filteredLogs.map((log) => [
        formatDateTime(log.timestamp || log.createdAt),
        log.userName,
        log.userRole,
        log.action,
        log.module,
        log.description,
        log.ipAddress || "N/A",
      ]);

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${formatDate(new Date().toISOString())}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Audit logs exported successfully");
    } catch (error) {
      toast.error("Failed to export audit logs");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <Bell className="h-5 w-5" />
            <span className="text-sm font-medium">Total Events</span>
          </div>
          <p className="font-display text-3xl font-bold text-walnut">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Today</span>
          </div>
          <p className="font-display text-3xl font-bold text-info">{stats.today}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Warnings</span>
          </div>
          <p className="font-display text-3xl font-bold text-warning">{stats.warnings}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Critical</span>
          </div>
          <p className="font-display text-3xl font-bold text-destructive">{stats.critical}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user, action, or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as AuditCategory)}
            className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Categories</option>
            <option value="user">User</option>
            <option value="product">Product</option>
            <option value="transaction">Transaction</option>
            <option value="system">System</option>
            <option value="security">Security</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as AuditSeverity | "all")}
            className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Severity</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-brand border-r-transparent mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-walnut">No audit logs found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || selectedCategory !== "all" || selectedSeverity !== "all"
                    ? "Try adjusting your filters"
                    : "Audit logs will appear here as actions are performed"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <div key={log._id} className="p-4 hover:bg-cream/40 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Severity Icon */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${getSeverityColor(log.severity)}`}>
                        {getSeverityIcon(log.severity)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-walnut">{log.description}</p>
                              <Pill tone={log.severity === "error" ? "danger" : log.severity === "warning" ? "warning" : "info"}>
                                {log.module}
                              </Pill>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {getActionIcon(log.action)}
                                {log.action.replace("_", " ")}
                              </span>
                              <span>•</span>
                              <span>{log.userName} ({log.userRole})</span>
                              <span>•</span>
                              <span>{formatDateTime(log.timestamp || log.createdAt)}</span>
                              {log.ipAddress && (
                                <>
                                  <span>•</span>
                                  <span>IP: {log.ipAddress}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* View Details Button */}
                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setShowDetailModal(true);
                            }}
                            className="rounded-md p-1.5 text-amber-brand hover:bg-amber-brand/10 transition-colors shrink-0"
                            aria-label="View Details"
                            title="View Full Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Details */}
                        {log.details && (
                          <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                        )}

                        {/* Expanded Details */}
                        {expandedLog === log._id && log.changes && log.changes.length > 0 && (
                          <div className="mt-3 p-3 rounded-lg bg-cream/60 border border-border">
                            <p className="text-xs font-semibold text-walnut mb-2 uppercase tracking-wide">
                              Changes Made:
                            </p>
                            <div className="space-y-2">
                              {log.changes.map((change, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <span className="font-medium text-walnut">{change.field}:</span>
                                  <span className="text-destructive line-through">{change.oldValue}</span>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="text-success font-medium">{change.newValue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-info/20 bg-info/5 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-walnut text-sm mb-1">About Audit Logs</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• All user actions and system events are automatically logged</li>
              <li>• Logs include user information, timestamps, IP addresses, and detailed changes</li>
              <li>• Use filters to find specific events or export data for compliance</li>
              <li>• Critical events (errors) and warnings are highlighted for quick attention</li>
              <li>• Audit logs are retained for 90 days for security and compliance purposes</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-cream/30">
              <h3 className="text-xl font-bold text-walnut">Activity Details</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-muted-foreground hover:text-walnut p-2"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Module</label>
                  <p className="text-sm font-semibold text-walnut">{selectedLog.module}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Action</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getActionIcon(selectedLog.action)}
                    <span className="text-sm font-semibold capitalize">{selectedLog.action.replace("_", " ")}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Performed By</label>
                  <p className="text-sm font-semibold text-walnut">{selectedLog.userName} ({selectedLog.userRole})</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Timestamp</label>
                  <p className="text-sm font-semibold text-walnut">{formatDateTime(selectedLog.timestamp || selectedLog.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Description</label>
                <p className="text-sm text-walnut mt-1 bg-cream/40 p-3 rounded-lg border border-border/50">{selectedLog.description}</p>
              </div>

              {selectedLog.details && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Technical Details</label>
                  <pre className="text-xs text-walnut mt-1 bg-muted p-4 rounded-lg overflow-x-auto font-mono border border-border">
                    {selectedLog.details}
                  </pre>
                </div>
              )}

              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block">Data Changes</label>
                  <div className="space-y-2">
                    {selectedLog.changes.map((change, idx) => (
                      <div key={idx} className="flex flex-col p-3 rounded-lg bg-cream/20 border border-border/30">
                        <span className="text-xs font-bold text-walnut mb-2 uppercase opacity-70">{change.field}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex-1 text-xs p-2 rounded bg-destructive/10 text-destructive line-through truncate">{change.oldValue}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="flex-1 text-xs p-2 rounded bg-success/10 text-success font-medium truncate">{change.newValue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-4 border-t border-border">
                <span>ID: {selectedLog._id}</span>
                {selectedLog.ipAddress && <span>• IP: {selectedLog.ipAddress}</span>}
              </div>
            </div>

            <div className="p-4 border-t border-border bg-cream/10 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 rounded-xl bg-walnut text-cream font-semibold text-sm hover:bg-walnut/90 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
