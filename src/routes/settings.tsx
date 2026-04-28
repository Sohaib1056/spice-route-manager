import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Upload, Download, Database, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/Modal";
import { api } from "@/services/api";
import { formatDateTime } from "@/lib/format";
import { useSettings } from "@/contexts/SettingsContext";

interface SettingsData {
  _id?: string;
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  ntnNumber: string;
  taxRate: number;
  logo?: string;
  currency: string;
  defaultTax: number;
  lowStockThreshold: number;
  dateFormat: string;
  invoicePrefix: string;
  poPrefix: string;
  businessType: "Retail" | "Wholesale" | "Both";
  lastBackupDate?: string;
  lastBackupSize?: string;
}

export default function SettingsPage() {
  const [tab, setTab] = useState<"company" | "system" | "backup">("company");
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshSettings } = useSettings();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.getSettings();
      if (response.success && response.data) {
        setSettings(response.data as SettingsData);
      } else {
        toast.error("Failed to load settings");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    await fetchSettings();
    await refreshSettings();
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-amber-brand/20 border-t-amber-brand animate-spin" />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest animate-pulse">Initializing System...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2 rounded-2xl border border-border bg-card p-1.5 w-fit shadow-sm">
        {[
          ["company", "Company Info", Upload],
          ["system", "System Settings", Database],
          ["backup", "Security & Backup", AlertTriangle],
        ].map(([k, l, Icon]: any) => (
          <button
            key={k}
            onClick={() => setTab(k as typeof tab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              tab === k 
                ? "bg-walnut text-cream shadow-lg shadow-walnut/20" 
                : "text-muted-foreground hover:bg-cream hover:text-walnut"
            }`}
          >
            <Icon className="h-4 w-4" />
            {l}
          </button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {tab === "company" && <CompanyInfo settings={settings} onUpdate={handleUpdate} />}
        {tab === "system" && <SystemSettings settings={settings} onUpdate={handleUpdate} />}
        {tab === "backup" && <BackupTab settings={settings} onUpdate={handleUpdate} />}
      </div>
    </div>
  );
}

function CompanyInfo({ settings, onUpdate }: { settings: SettingsData; onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    companyName: settings.companyName,
    ownerName: settings.ownerName,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    city: settings.city,
    ntnNumber: settings.ntnNumber,
    taxRate: settings.taxRate,
  });
  const [logo, setLogo] = useState<string | null>(settings.logo || null);
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo size must be less than 2MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result as string);
      toast.success("Logo uploaded successfully");
    };
    reader.onerror = () => {
      toast.error("Failed to upload logo");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    toast.success("Logo removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const response = await api.updateCompanyInfo({
      ...formData,
      logo: logo || "",
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });

    if (response.success) {
      toast.success("Company info saved successfully");
      onUpdate();
    } else {
      toast.error(response.message || "Failed to save company info");
    }

    setSaving(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
      <div>
        <label className="lbl">Company Logo</label>
        {logo ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center p-4 rounded-lg border border-border bg-cream/40">
              <img src={logo} alt="Company Logo" className="max-h-32 max-w-full object-contain" />
            </div>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  Change Logo
                </div>
              </label>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="rounded-lg border border-destructive bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-cream/40 text-muted-foreground hover:border-amber-brand transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div className="text-center">
              <Upload className="mx-auto h-6 w-6" />
              <p className="text-sm mt-2">Click to upload logo</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
            </div>
          </label>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="lbl">Company Name</label>
          <input
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="lbl">Owner Name</label>
          <input
            value={formData.ownerName}
            onChange={(e) => handleChange("ownerName", e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="lbl">Phone</label>
          <input
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="lbl">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="lbl">City</label>
          <input
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="lbl">NTN Number</label>
          <input
            value={formData.ntnNumber}
            onChange={(e) => handleChange("ntnNumber", e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="lbl">Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.taxRate}
            onChange={(e) => handleChange("taxRate", Number(e.target.value))}
            className="input"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="lbl">Address</label>
          <input
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="input"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-amber-brand px-5 py-2.5 text-sm font-medium text-amber-brand-foreground hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </form>
  );
}

function SystemSettings({ settings, onUpdate }: { settings: SettingsData; onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    defaultTax: settings.defaultTax,
    lowStockThreshold: settings.lowStockThreshold,
    dateFormat: settings.dateFormat,
    invoicePrefix: settings.invoicePrefix,
    poPrefix: settings.poPrefix,
    businessType: settings.businessType,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const response = await api.updateSystemSettings({
      ...formData,
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });

    if (response.success) {
      toast.success("System settings saved successfully");
      onUpdate();
    } else {
      toast.error(response.message || "Failed to save system settings");
    }

    setSaving(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="lbl">Currency</label>
          <input value={settings.currency} disabled className="input bg-muted" />
        </div>
        <div>
          <label className="lbl">Default Tax %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.defaultTax}
            onChange={(e) => handleChange("defaultTax", Number(e.target.value))}
            className="input"
            required
          />
        </div>
        <div>
          <label className="lbl">Low Stock Alert Threshold</label>
          <input
            type="number"
            min="0"
            value={formData.lowStockThreshold}
            onChange={(e) => handleChange("lowStockThreshold", Number(e.target.value))}
            className="input"
            required
          />
        </div>
        <div>
          <label className="lbl">Date Format</label>
          <select
            value={formData.dateFormat}
            onChange={(e) => handleChange("dateFormat", e.target.value)}
            className="input"
          >
            <option>DD MMM YYYY</option>
            <option>YYYY-MM-DD</option>
            <option>DD/MM/YYYY</option>
          </select>
        </div>
        <div>
          <label className="lbl">Invoice Prefix</label>
          <input
            value={formData.invoicePrefix}
            onChange={(e) => handleChange("invoicePrefix", e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="lbl">PO Prefix</label>
          <input
            value={formData.poPrefix}
            onChange={(e) => handleChange("poPrefix", e.target.value)}
            className="input"
            required
          />
        </div>
      </div>
      <div>
        <label className="lbl">Business Type</label>
        <div className="flex gap-1 rounded-lg border border-border p-1 w-fit bg-cream/40">
          {(["Retail", "Wholesale", "Both"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleChange("businessType", t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                formData.businessType === t ? "bg-walnut text-cream" : "text-walnut hover:bg-card"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-amber-brand px-5 py-2.5 text-sm font-medium text-amber-brand-foreground hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </form>
  );
}

function BackupTab({ settings, onUpdate }: { settings: SettingsData; onUpdate: () => void }) {
  const [backing, setBacking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetText, setResetText] = useState("");

  const handleBackup = async () => {
    setBacking(true);
    const response = await api.createBackup({
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });

    if (response.success) {
      toast.success("Backup created successfully");
      onUpdate();
    } else {
      toast.error(response.message || "Failed to create backup");
    }
    setBacking(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${baseUrl}/settings/backup/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `spice-route-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Backup downloaded successfully");
      } else {
        toast.error("Failed to download backup");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading backup");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setResetText("");
    setShowResetModal(true);
  };

  const doReset = async () => {
    if (resetText !== "DELETE ALL DATA") {
      toast.error("Confirmation text does not match");
      return;
    }
    setShowResetModal(false);
    setResetting(true);
    const response = await api.resetAllData(resetText, {
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });
    if (response.success) {
      toast.success(response.message || "Data reset completed");
    } else {
      toast.error(response.message || "Failed to reset data");
    }
    setResetting(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 text-info">
            <Database className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-walnut">Database Backup</h3>
            {settings.lastBackupDate ? (
              <p className="text-sm text-muted-foreground mt-1">
                Last backup: {formatDateTime(settings.lastBackupDate)} — {settings.lastBackupSize || "N/A"}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">No backup created yet</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleDownload}
                disabled={downloading || !settings.lastBackupDate}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {downloading ? "Downloading..." : "Download Backup"}
              </button>
              <button
                onClick={handleBackup}
                disabled={backing}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted disabled:opacity-50"
              >
                <Database className="h-4 w-4" />
                {backing ? "Creating..." : "Backup Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This action cannot be undone. All data will be permanently deleted from the database.
            </p>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="mt-4 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
            >
              {resetting ? "Resetting..." : "Reset All Data"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-info/20 bg-info/5 p-4">
        <div className="flex gap-3">
          <Database className="h-5 w-5 text-info shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-walnut text-sm mb-1">About Backups</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Backups include all data: users, products, transactions, and settings</li>
              <li>• Create regular backups to prevent data loss</li>
              <li>• Download backups to store them safely offline</li>
              <li>• Backup files can be used to restore your data if needed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        open={showResetModal}
        onClose={() => { setShowResetModal(false); setResetText(""); }}
        title="Reset All Data"
        size="md"
        footer={
          <>
            <button
              onClick={() => { setShowResetModal(false); setResetText(""); }}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-walnut hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={doReset}
              disabled={resetText !== "DELETE ALL DATA"}
              className="rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Reset All Data
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-destructive/8 border border-destructive/20 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">This action CANNOT be undone!</p>
              <p className="text-xs text-muted-foreground mt-1">
                All products, suppliers, sales, purchases, and transactions will be permanently deleted from the database.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Type <span className="text-destructive font-mono">DELETE ALL DATA</span> to confirm
            </label>
            <input
              value={resetText}
              onChange={(e) => setResetText(e.target.value)}
              placeholder='DELETE ALL DATA'
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/20"
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
