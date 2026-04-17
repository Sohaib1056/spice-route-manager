import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Upload, Download, Database, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const [tab, setTab] = useState<"company" | "system" | "backup">("company");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit shadow-sm">
        {[
          ["company", "Company Info"], ["system", "System Settings"], ["backup", "Backup"],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)} className={`rounded-md px-4 py-2 text-sm font-medium ${tab === k ? "bg-amber-brand text-amber-brand-foreground" : "text-walnut hover:bg-cream"}`}>{l}</button>
        ))}
      </div>

      {tab === "company" && <CompanyInfo />}
      {tab === "system" && <SystemSettings />}
      {tab === "backup" && <BackupTab />}
    </div>
  );
}

function CompanyInfo() {
  return (
    <form onSubmit={(e) => { e.preventDefault(); toast.success("Company info saved"); }} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
      <div>
        <label className="lbl">Company Logo</label>
        <div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-cream/40 text-muted-foreground hover:border-amber-brand">
          <div className="text-center">
            <Upload className="mx-auto h-6 w-6" />
            <p className="text-sm mt-2">Click to upload logo</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ["Company Name", "DryFruit Pro"], ["Owner Name", "Imran Khan"],
          ["Phone", "+92 300 1234567"], ["Email", "info@dryfruitpro.pk"],
          ["City", "Lahore"], ["NTN Number", "1234567-8"],
          ["Tax Rate (%)", "5"],
        ].map(([l, v]) => (
          <div key={l}><label className="lbl">{l}</label><input defaultValue={v} className="input" /></div>
        ))}
        <div className="md:col-span-2"><label className="lbl">Address</label><input defaultValue="Akbari Mandi, Lahore" className="input" /></div>
      </div>
      <button type="submit" className="rounded-lg bg-amber-brand px-5 py-2.5 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Save Changes</button>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </form>
  );
}

function SystemSettings() {
  return (
    <form onSubmit={(e) => { e.preventDefault(); toast.success("Settings saved"); }} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="lbl">Currency</label><input value="PKR" disabled className="input bg-muted" /></div>
        <div><label className="lbl">Default Tax %</label><input type="number" defaultValue="5" className="input" /></div>
        <div><label className="lbl">Low Stock Alert Threshold</label><input type="number" defaultValue="10" className="input" /></div>
        <div><label className="lbl">Date Format</label><select className="input"><option>DD MMM YYYY</option><option>YYYY-MM-DD</option><option>DD/MM/YYYY</option></select></div>
        <div><label className="lbl">Invoice Prefix</label><input defaultValue="INV-" className="input" /></div>
        <div><label className="lbl">PO Prefix</label><input defaultValue="PO-" className="input" /></div>
      </div>
      <div>
        <label className="lbl">Business Type</label>
        <div className="flex gap-1 rounded-lg border border-border p-1 w-fit bg-cream/40">
          {["Retail", "Wholesale", "Both"].map((t, i) => (
            <button key={t} type="button" className={`rounded-md px-4 py-1.5 text-sm font-medium ${i === 2 ? "bg-walnut text-cream" : "text-walnut hover:bg-card"}`}>{t}</button>
          ))}
        </div>
      </div>
      <button type="submit" className="rounded-lg bg-amber-brand px-5 py-2.5 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Save Settings</button>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </form>
  );
}

function BackupTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 text-info"><Database className="h-6 w-6" /></div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-walnut">Last Backup</h3>
            <p className="text-sm text-muted-foreground mt-1">Yesterday at 11:45 PM — 24.6 MB</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => toast.success("Backup downloading...")} className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90"><Download className="h-4 w-4" /> Download Full Backup</button>
              <button onClick={() => toast.success("Backup started")} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">Backup Now</button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertTriangle className="h-6 w-6" /></div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-1">This action cannot be undone. All data will be permanently deleted.</p>
            <button onClick={() => { if (confirm("Are you absolutely sure? This will delete ALL data.")) toast.error("This is a demo — no real data was deleted."); }} className="mt-4 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90">Reset All Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}
