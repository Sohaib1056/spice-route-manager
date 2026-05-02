import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, Minus, Plus, Trash2, Printer, Eye } from "lucide-react";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";
import { formatPKR, formatDate } from "@/lib/format";
import { store, type Sale, type Product } from "@/lib/store";
import { TransactionRow, StatusPill } from "@/components/TransactionUtils";
import { useSettings } from "@/contexts/SettingsContext";

interface CartItem { productId: string; name: string; qty: number; price: number; unit: string; }

// --- Sub-components ---

function NewSale({ onComplete, products }: { onComplete: (s: Omit<Sale, "id">) => void, products: Product[] }) {
  const { settings } = useSettings();
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(settings?.taxRate ?? 5);
  const [payment, setPayment] = useState<"Cash" | "Credit" | "Bank Transfer">("Cash");
  const [received, setReceived] = useState(0);

  // Sync taxRate with settings when settings change
  useEffect(() => {
    if (settings?.taxRate !== undefined) {
      setTaxRate(settings.taxRate);
    }
  }, [settings?.taxRate]);

  const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const tax = (subtotal - discount) * taxRate / 100;
  const total = subtotal - discount + tax;
  const change = received - total;

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const add = (p: Product) => {
    if (p.stock <= 0) {
      toast.error("Maal khatam hai (Out of stock)");
      return;
    }
    setCart((c) => {
      const ex = c.find((x) => x.productId === p.id);
      const increment = p.unit === "kg" ? 0.5 : p.unit === "g" ? 100 : 1;
      if (ex) return c.map((x) => (x.productId === p.id ? { ...x, qty: x.qty + increment } : x));
      return [...c, { productId: p.id, name: p.name, qty: increment, price: p.sellPrice, unit: p.unit }];
    });
  };

  const setQty = (id: string, delta: number) => {
    const item = cart.find((x) => x.productId === id);
    if (!item) return;
    const increment = item.unit === "kg" ? 0.5 : item.unit === "g" ? 100 : 1;
    setCart((c) => c.map((x) => x.productId === id ? { ...x, qty: Math.max(increment, x.qty + (delta * increment)) } : x));
  };

  const complete = () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    const sale: Omit<Sale, "id"> = {
      invoice: `${settings?.invoicePrefix || "INV-"}${Math.floor(Math.random() * 9000) + 2000}`,
      date: new Date().toISOString().slice(0, 10),
      customer: customer || "Walk-in Customer",
      customerPhone: phone || undefined,
      items: cart.map(item => ({
        ...item,
        unit: item.unit || "pcs"
      })),
      subtotal, discount, tax, total,
      payment,
      status: payment === "Credit" ? "Credit" : "Paid",
    };
    onComplete(sale);
    setCart([]); setCustomer(""); setPhone(""); setDiscount(0); setReceived(0);
  };

  const printReceipt = () => {
    if (cart.length === 0) {
      toast.error("Cart khaali hai! Pehle items add karein.");
      return;
    }

    // Create thermal receipt HTML
    const receiptHTML = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          @page { size: 80mm auto; margin: 0; }
          @media print { body { margin: 0; } }
          * { box-sizing: border-box; }
          body {
            font-family: 'Inter', sans-serif;
            width: 80mm;
            margin: 0 auto;
            padding: 10mm 4mm;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }
          .header { text-align: center; margin-bottom: 6mm; }
          .logo-area { margin-bottom: 2mm; }
          .logo-text { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; }
          .tagline { font-size: 10px; font-weight: 600; color: #444; margin-top: -2px; margin-bottom: 3mm; display: block; }
          .contact-info { font-size: 10px; line-height: 1.3; color: #333; font-weight: 500; }
          
          .divider { border-top: 1px solid #000; margin: 4mm 0; }
          .divider-dashed { border-top: 1px dashed #444; margin: 3mm 0; }
          
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 1mm; font-size: 11px; font-weight: 500; }
          .meta-label { color: #555; }
          .meta-value { font-weight: 700; }
          
          .items-header { 
            display: grid; 
            grid-template-columns: 1fr 20mm 20mm; 
            font-weight: 800; 
            font-size: 11px; 
            padding-bottom: 2mm; 
            border-bottom: 1.5px solid #000;
            margin-bottom: 2mm;
            text-transform: uppercase;
          }
          .item-row { 
            display: grid; 
            grid-template-columns: 1fr 20mm 20mm; 
            margin-bottom: 3mm; 
            align-items: start;
          }
          .item-name { font-weight: 700; font-size: 12px; grid-column: 1 / span 3; margin-bottom: 0.5mm; }
          .item-qty { font-size: 11px; color: #444; font-weight: 500; }
          .item-price { font-size: 11px; color: #444; text-align: center; }
          .item-total { font-size: 11px; font-weight: 700; text-align: right; }
          
          .totals-area { margin-top: 4mm; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 1.5mm; font-size: 12px; }
          .total-row.grand { 
            margin-top: 3mm; 
            padding-top: 3mm; 
            border-top: 1.5px solid #000; 
            font-size: 18px; 
            font-weight: 800; 
          }
          
          .payment-box { 
            background: #f9f9f9; 
            padding: 3mm; 
            border-radius: 2mm; 
            margin: 5mm 0; 
            border: 0.5px solid #eee;
          }
          
          .footer { text-align: center; margin-top: 8mm; padding-top: 4mm; border-top: 1px dashed #ccc; }
          .thank-you { font-size: 14px; font-weight: 800; margin-bottom: 1mm; text-transform: uppercase; }
          .footer-note { font-size: 10px; color: #666; font-weight: 500; line-height: 1.3; }
          .branding { font-size: 8px; color: #aaa; margin-top: 4mm; text-transform: uppercase; letter-spacing: 1px; }
          
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <div class="logo-text">${settings?.companyName || "CHAMAN DELIGHT"}</div>
            <span class="tagline">Premium Dry Fruit & Spices</span>
          </div>
          <div class="contact-info">
            ${settings?.address || "Billa Chowk Satellite Town Gujranwala"}<br/>
            Phone: ${settings?.phone || "0326 5153000"}<br/>
            ${settings?.email || "chamandelightdryfruit@gmail.com"}
          </div>
        </div>

        <div class="meta-area">
          <div class="meta-row">
            <span class="meta-label">Invoice #</span>
            <span class="meta-value">${settings?.invoicePrefix || "INV-"}${Math.floor(Math.random() * 9000) + 2000}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Date</span>
            <span class="meta-value">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Time</span>
            <span class="meta-value">${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Customer</span>
            <span class="meta-value">${customer || 'Walk-in Customer'}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="items-header">
          <span>Description</span>
          <span class="text-center">Rate</span>
          <span class="text-right">Amount</span>
        </div>

        ${cart.map(item => `
          <div class="item-row">
            <div class="item-name">${item.name}</div>
            <div class="item-qty">${item.qty} ${item.unit} x ${item.price}</div>
            <div class="item-price">${formatPKR(item.price)}</div>
            <div class="item-total">${formatPKR(item.qty * item.price)}</div>
          </div>
        `).join('')}

        <div class="divider-dashed"></div>

        <div class="totals-area">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatPKR(subtotal)}</span>
          </div>
          ${discount > 0 ? `
          <div class="total-row">
            <span>Discount</span>
            <span>- ${formatPKR(discount)}</span>
          </div>` : ''}
          <div class="total-row">
            <span>Tax (${taxRate}%)</span>
            <span>${formatPKR(tax)}</span>
          </div>
          <div class="total-row grand">
            <span>TOTAL</span>
            <span>${formatPKR(total)}</span>
          </div>
        </div>

        <div class="payment-box">
          <div class="meta-row">
            <span class="meta-label">Payment Method</span>
            <span class="meta-value">${payment}</span>
          </div>
          ${payment === 'Cash' ? `
          <div class="meta-row" style="margin-top: 1mm;">
            <span class="meta-label">Received</span>
            <span class="meta-value">${formatPKR(received)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Change</span>
            <span class="meta-value">${formatPKR(Math.max(0, change))}</span>
          </div>` : ''}
        </div>

        <div class="footer">
          <div class="thank-you">Shukriya!</div>
          <div class="footer-note">
            Your satisfaction is our priority.<br/>
            Please visit again soon!
          </div>
          <div class="branding">Powered by Chaman Delight</div>
        </div>
      </body>
      </html>
    `;

    // Create iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(receiptHTML);
      iframeDoc.close();

      iframe.contentWindow?.focus();
      
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);

      toast.success("Receipt print kar rahe hain...");
    } else {
      toast.error("Print nahi ho saka.");
      document.body.removeChild(iframe);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
          {filtered.map((p) => {
            const out = p.stock <= 0;
            return (
              <button key={p.id} disabled={out} onClick={() => add(p)} className={`rounded-xl border border-border bg-cream/40 p-3 text-left transition ${out ? "opacity-40 cursor-not-allowed" : "hover:border-amber-brand hover:shadow-md hover:bg-card"}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-brand/10 text-amber-brand text-sm font-semibold mb-2">{p.name[0]}</div>
                <p className="text-sm font-medium text-walnut leading-tight line-clamp-2">{p.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-walnut">{formatPKR(p.sellPrice)}</p>
                  <Pill tone={out ? "danger" : p.stock < p.minStock ? "amber" : "success"}>{out ? "0" : p.stock} {p.unit}</Pill>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 shadow-sm sticky top-20 self-start">
        <h3 className="font-display text-lg font-semibold text-walnut mb-3">Invoice</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name" className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 mb-3 pr-1">
          {cart.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">Cart khaali hai</p>}
          {cart.map((c) => (
            <div key={c.productId} className="flex items-center gap-2 rounded-lg bg-cream/60 p-2">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm font-bold text-walnut truncate">{c.name}</p>
                  <button onClick={() => setCart((cc) => cc.filter((x) => x.productId !== c.productId))} className="text-destructive p-1 hover:bg-destructive/10 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">Select Weight</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "250g", val: 0.25 },
                        { label: "500g", val: 0.5 },
                        { label: "750g", val: 0.75 },
                        { label: "1kg", val: 1 },
                        { label: "2kg", val: 2 },
                        { label: "5kg", val: 5 }
                      ].map((w) => (
                        <button
                          key={w.label}
                          onClick={() => {
                            setCart((cc) => cc.map((x) => x.productId === c.productId ? { ...x, qty: w.val, unit: "kg" } : x));
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all border-2 ${
                            c.qty === w.val 
                              ? "bg-amber-brand border-amber-brand text-amber-brand-foreground shadow-sm scale-105" 
                              : "bg-white border-slate-200 text-slate-600 hover:border-amber-brand/50 hover:text-amber-brand"
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1 border-t border-slate-50">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">Custom Qty (KG)</label>
                      <div className="flex items-center gap-1 bg-white border-2 border-slate-200 rounded-xl p-1 shadow-sm focus-within:border-amber-brand transition-all">
                        <button onClick={() => setQty(c.productId, -1)} className="rounded-lg p-1.5 text-walnut hover:bg-slate-100 transition-colors"><Minus className="h-3.5 w-3.5 stroke-[3px]" /></button>
                        <input
                          type="number"
                          step="0.01"
                          value={c.qty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 0) {
                              setCart((cc) => cc.map((x) => x.productId === c.productId ? { ...x, qty: val } : x));
                            }
                          }}
                          className="w-20 text-center text-sm font-black text-walnut tabular-nums border-none focus:ring-0 p-0"
                        />
                        <button onClick={() => setQty(c.productId, 1)} className="rounded-lg p-1.5 text-walnut hover:bg-slate-100 transition-colors"><Plus className="h-3.5 w-3.5 stroke-[3px]" /></button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 ml-auto text-right">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">Item Total</label>
                      <p className="text-base font-black text-amber-brand tabular-nums">{formatPKR(c.qty * c.price)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-border pt-3 text-sm">
          <TransactionRow label="Subtotal" value={formatPKR(subtotal)} />
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Discount</span>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} className="w-24 rounded-md border border-border bg-card px-2 py-1 text-right text-sm" />
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Tax (%)</span>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} className="w-24 rounded-md border border-border bg-card px-2 py-1 text-right text-sm" />
          </div>
          <TransactionRow label="Grand Total" value={formatPKR(total)} bold />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg border border-border p-1 bg-cream/40">
          {(["Cash", "Credit", "Bank Transfer"] as const).map((m) => (
            <button key={m} onClick={() => setPayment(m)} className={`rounded-md py-1.5 text-xs font-medium ${payment === m ? "bg-walnut text-cream" : "text-walnut hover:bg-card"}`}>{m}</button>
          ))}
        </div>

        {payment === "Cash" && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <label className="text-xs text-muted-foreground">Received</label>
              <input type="number" value={received} onChange={(e) => setReceived(Number(e.target.value) || 0)} className="w-full rounded-md border border-border bg-card px-2 py-1.5 mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Change</label>
              <p className={`mt-1 px-2 py-1.5 rounded-md font-semibold tabular-nums ${change >= 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10"}`}>{formatPKR(Math.max(0, change))}</p>
            </div>
          </div>
        )}

        <button onClick={complete} className="mt-4 w-full rounded-lg bg-amber-brand py-2.5 text-sm font-semibold text-amber-brand-foreground hover:opacity-90">
          Complete Sale
        </button>
        <button onClick={printReceipt} className="mt-2 w-full rounded-lg border border-border py-2 text-sm font-medium text-walnut hover:bg-cream inline-flex items-center justify-center gap-2">
          <Printer className="h-4 w-4" /> Print Invoice
        </button>
      </div>
    </div>
  );
}

function History({ list }: { list: Sale[] }) {
  const { settings } = useSettings();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [pay, setPay] = useState("All");
  const [status, setStatus] = useState("All");
  const [view, setView] = useState<Sale | null>(null);

  const filtered = useMemo(() => list.filter((s) => {
    if (q && !s.customer.toLowerCase().includes(q.toLowerCase()) && !s.invoice.toLowerCase().includes(q.toLowerCase())) return false;
    if (pay !== "All" && s.payment !== pay) return false;
    if (status !== "All" && s.status !== status) return false;
    if (from && new Date(s.date) < new Date(from)) return false;
    if (to && new Date(s.date) > new Date(to)) return false;
    return true;
  }), [list, q, pay, status, from, to]);

  const printThermalReceipt = (sale: Sale) => {
    const receiptHTML = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt - ${sale.invoice}</title>
        <style>
          @page { 
            size: 80mm auto;
            margin: 0;
          }
          @media print {
            body { margin: 0; }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 8mm 5mm;
            font-size: 11px;
            line-height: 1.5;
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header { 
            text-align: center; 
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 2px solid #000;
          }
          .company-name { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 4px;
            letter-spacing: 1px;
          }
          .company-info { 
            font-size: 9px; 
            color: #333;
            line-height: 1.3;
          }
          .line { 
            border-top: 1px dashed #000; 
            margin: 8px 0; 
          }
          .line-solid { 
            border-top: 1px solid #000; 
            margin: 8px 0; 
          }
          .row { 
            display: flex; 
            justify-content: space-between; 
            margin: 3px 0;
            font-size: 10px;
          }
          .row-bold {
            display: flex; 
            justify-content: space-between; 
            margin: 3px 0;
            font-weight: bold;
            font-size: 11px;
          }
          .section-title {
            font-weight: bold;
            font-size: 11px;
            margin: 8px 0 4px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .item-name { 
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 2px;
          }
          .item-details { 
            display: flex; 
            justify-content: space-between; 
            font-size: 10px;
            color: #333;
            margin-bottom: 6px;
          }
          .total-section {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 2px solid #000;
          }
          .grand-total { 
            display: flex; 
            justify-content: space-between;
            font-weight: bold; 
            font-size: 14px;
            margin: 6px 0;
            padding: 4px 0;
          }
          .footer { 
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px dashed #000;
            text-align: center;
            font-size: 9px;
            line-height: 1.4;
          }
          .thank-you {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 4px;
          }
          .powered-by {
            margin-top: 8px;
            font-size: 8px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${settings?.companyName || "CHAMAN DELIGHT"}</div>
          <div class="company-info">
            ${settings?.address || "Billa Chowk Satellite Town Gujranwala"}<br/>
            Tel: ${settings?.phone || "0326 5153000"}<br/>
            ${settings?.email || "chamandelightdryfruit@gmail.com"}
          </div>
        </div>
        
        <div class="row-bold">
          <span>Invoice #:</span>
          <span>${sale.invoice}</span>
        </div>
        <div class="row">
          <span>Date:</span>
          <span>${formatDate(sale.date)}</span>
        </div>
        <div class="row">
          <span>Time:</span>
          <span>${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
        </div>
        <div class="row">
          <span>Customer:</span>
          <span>${sale.customer}</span>
        </div>
        ${sale.customerPhone ? `<div class="row"><span>Phone:</span><span>${sale.customerPhone}</span></div>` : ''}
        
        <div class="line-solid"></div>
        <div class="section-title">ITEMS</div>
        <div class="line"></div>
        
        ${sale.items.map(item => `
          <div class="item-name">${item.name}</div>
          <div class="item-details">
            <span>${item.qty} ${item.unit || 'pcs'} × PKR ${item.price.toLocaleString()}</span>
            <span>PKR ${(item.qty * item.price).toLocaleString()}</span>
          </div>
        `).join('')}
        
        <div class="line-solid"></div>
        
        <div class="row">
          <span>Subtotal:</span>
          <span>PKR ${sale.subtotal.toLocaleString()}</span>
        </div>
        ${sale.discount > 0 ? `
        <div class="row">
          <span>Discount:</span>
          <span>- PKR ${sale.discount.toLocaleString()}</span>
        </div>` : ''}
        <div class="row">
          <span>Tax:</span>
          <span>PKR ${sale.tax.toLocaleString()}</span>
        </div>
        
        <div class="total-section">
          <div class="grand-total">
            <span>TOTAL:</span>
            <span>PKR ${sale.total.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="line"></div>
        
        <div class="row-bold">
          <span>Payment Method:</span>
          <span>${sale.payment}</span>
        </div>
        <div class="row">
          <span>Status:</span>
          <span>${sale.status}</span>
        </div>
        
        <div class="footer">
          <div class="thank-you">Thank You! - Shukriya!</div>
          <div>Your satisfaction is our priority</div>
          <div>Please visit again</div>
          <div class="powered-by">Powered by ${settings?.companyName || "Chaman Delight"}</div>
        </div>
      </body>
      </html>
    `;

    // Create iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(receiptHTML);
      iframeDoc.close();

      iframe.contentWindow?.focus();
      
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);

      toast.success("Receipt print kar rahe hain...");
    } else {
      toast.error("Print nahi ho saka.");
      document.body.removeChild(iframe);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice/customer" className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        <select value={pay} onChange={(e) => setPay(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <option>All</option><option>Cash</option><option>Credit</option><option>Bank Transfer</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <option>All</option><option>Paid</option><option>Credit</option><option>Returned</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left p-3">Invoice#</th><th className="text-left p-3">Date</th><th className="text-left p-3">Customer</th>
              <th className="text-right p-3">Items</th><th className="text-right p-3">Subtotal</th><th className="text-right p-3">Disc</th>
              <th className="text-right p-3">Tax</th><th className="text-right p-3">Total</th><th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Status</th><th className="text-right p-3">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-cream/40">
                  <td className="p-3 font-medium text-walnut">{s.invoice}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(s.date)}</td>
                  <td className="p-3">{s.customer}</td>
                  <td className="p-3 text-right">{s.items.length}</td>
                  <td className="p-3 text-right tabular-nums">{formatPKR(s.subtotal)}</td>
                  <td className="p-3 text-right tabular-nums">{formatPKR(s.discount)}</td>
                  <td className="p-3 text-right tabular-nums">{formatPKR(s.tax)}</td>
                  <td className="p-3 text-right font-medium text-walnut">{formatPKR(s.total)}</td>
                  <td className="p-3 text-muted-foreground">{s.payment}</td>
                  <td className="p-3"><StatusPill type="sale" status={s.status} /></td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => printThermalReceipt(s)} 
                        className="rounded-md p-1.5 text-success hover:bg-success/10"
                        title="Print Receipt"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setView(s)} 
                        className="rounded-md p-1.5 text-info hover:bg-info/10"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState title="No sales found" />}
        </div>
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={`Invoice ${view?.invoice ?? ""}`} size="lg"
        footer={
          <>
            <button 
              onClick={() => view && printThermalReceipt(view)} 
              className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:opacity-90 inline-flex items-center gap-2"
            >
              <Printer className="h-4 w-4" /> Thermal Print
            </button>
            <button 
              onClick={() => window.print()} 
              className="rounded-lg bg-walnut px-4 py-2 text-sm font-medium text-cream hover:opacity-90 inline-flex items-center gap-2"
            >
              <Printer className="h-4 w-4" /> A4 Print
            </button>
            <button onClick={() => setView(null)} className="rounded-lg border border-border px-4 py-2 text-sm">
              Close
            </button>
          </>
        }>
        {view && (
          <div className="print-area">
            <div className="text-center border-b border-border pb-4">
            <p className="font-display text-2xl font-bold text-walnut">${settings?.companyName || "Chaman Delight Dry Fruit"}</p>
            <p className="text-xs text-muted-foreground">${settings?.address || "Billa Chowk Satellite Town Gujranwala"} | +92 ${settings?.phone || "326 5153000"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Invoice #</p><p className="font-medium text-walnut">{view.invoice}</p></div>
              <div className="text-right"><p className="text-xs text-muted-foreground">Date</p><p className="font-medium text-walnut">{formatDate(view.date)}</p></div>
              <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium text-walnut">{view.customer}</p>{view.customerPhone && <p className="text-xs">{view.customerPhone}</p>}</div>
              <div className="text-right"><p className="text-xs text-muted-foreground">Payment</p><p className="font-medium text-walnut">{view.payment}</p></div>
            </div>
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-cream"><tr><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Price</th><th className="text-right p-2">Total</th></tr></thead>
              <tbody>{view.items.map((it, i) => (
                <tr key={it.productId + i} className="border-t border-border"><td className="p-2">{it.name}</td><td className="p-2 text-right">{it.qty} {it.unit || 'pcs'}</td><td className="p-2 text-right">{formatPKR(it.price)}</td><td className="p-2 text-right">{formatPKR(it.qty * it.price)}</td></tr>
              ))}</tbody>
            </table>
            <div className="ml-auto w-64 mt-4 space-y-1 text-sm">
              <TransactionRow label="Subtotal" value={formatPKR(view.subtotal)} />
              <TransactionRow label="Discount" value={`- ${formatPKR(view.discount)}`} />
              <TransactionRow label="Tax" value={formatPKR(view.tax)} />
              <TransactionRow label="Grand Total" value={formatPKR(view.total)} bold />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t border-border">Shukriya for your business • Aap ka muamal, hamare haath mein.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

// --- Main Component ---

export default function SalesPage() {
  const [tab, setTab] = useState<"new" | "history">("new");
  const [list, setList] = useState<Sale[]>(store.getSales());
  const [products, setProducts] = useState<Product[]>(store.getProducts());

  const handleComplete = async (s: Omit<Sale, "id">) => {
    const loadingToast = toast.loading("Processing sale and updating stock...");
    try {
      await store.addSale(s);
      
      // Strict re-initialization to ensure inventory and sales lists are sync'd
      await store.init();
      
      setList(store.getSales());
      setProducts(store.getProducts());
      
      toast.success(`Sale completed • ${s.invoice}`, { id: loadingToast });
    } catch (error) {
      console.error("[SalesPage] Sale completion error:", error);
      toast.error("Failed to complete sale", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit shadow-sm">
        {(["new", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-2 text-sm font-medium ${tab === t ? "bg-amber-brand text-amber-brand-foreground" : "text-walnut hover:bg-cream"}`}>
            {t === "new" ? "New Sale" : "Sales History"}
          </button>
        ))}
      </div>
      {tab === "new"
        ? <NewSale onComplete={handleComplete} products={products} />
        : <History list={list} />}
    </div>
  );
}
