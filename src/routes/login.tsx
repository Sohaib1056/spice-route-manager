import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff, Nut } from "lucide-react";
import { Pill } from "@/components/Pill";

export const Route = createFileRoute("/login")({ component: LoginPage });

interface LoginForm { email: string; password: string; remember: boolean; }

const demos = [
  { label: "Admin", email: "admin@dryfruitpro.pk", tone: "walnut" as const },
  { label: "Manager", email: "fatima@dryfruitpro.pk", tone: "amber" as const },
  { label: "Staff", email: "ayesha@dryfruitpro.pk", tone: "pistachio" as const },
];

function LoginPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<LoginForm>({
    defaultValues: { email: "admin@dryfruitpro.pk", password: "demo123", remember: true },
  });
  const [showPwd, setShowPwd] = useState(false);

  const onSubmit = () => { navigate({ to: "/" }); };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-walnut text-cream p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, var(--color-amber-brand) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--color-amber-brand) 0%, transparent 40%)"
        }} />
        <div className="relative z-10 text-center max-w-md">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-amber-brand/20 ring-4 ring-amber-brand/40">
            <Nut className="h-12 w-12 text-amber-brand" />
          </div>
          <h1 className="font-display text-5xl font-bold text-cream">DryFruit Pro</h1>
          <div className="my-4 mx-auto h-px w-16 bg-amber-brand" />
          <p className="italic text-cream/80 text-lg">"Aapka Muamal, Hamare Haath Mein"</p>
          <p className="text-sm text-cream/60 mt-8 leading-relaxed">
            Premium dry fruit management — inventory, sales, purchases, finance, and reports — all in one warm, beautiful workspace.
          </p>
          <div className="mt-10 flex justify-center gap-3 text-cream/70 text-sm">
            <span>🌰 Badam</span>
            <span>·</span>
            <span>🥜 Kaju</span>
            <span>·</span>
            <span>🍇 Kishmish</span>
            <span>·</span>
            <span>🌴 Khajoor</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-card p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-brand/10">
              <Nut className="h-7 w-7 text-amber-brand" />
            </div>
            <p className="font-display text-2xl font-bold text-walnut">DryFruit Pro</p>
          </div>

          <h2 className="font-display text-3xl font-bold text-walnut">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-1">Apna account mein login karein.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <label className="lbl">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input {...register("email")} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="lbl">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type={showPwd ? "text" : "password"} {...register("password")} className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-walnut">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" {...register("remember")} className="h-4 w-4 accent-[var(--color-amber-brand)]" />
              Remember me
            </label>
            <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-amber-brand to-amber-brand/80 py-3 text-sm font-semibold text-amber-brand-foreground shadow-md hover:shadow-lg transition-shadow">
              Login
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Demo accounts (click to fill)</p>
            <div className="grid grid-cols-3 gap-2">
              {demos.map((d) => (
                <button key={d.label} onClick={() => { setValue("email", d.email); setValue("password", "demo123"); }} className="rounded-lg border border-border bg-cream/50 p-3 text-left hover:border-amber-brand">
                  <Pill tone={d.tone}>{d.label}</Pill>
                  <p className="mt-2 text-[11px] text-muted-foreground truncate">{d.email}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">Powered by DryFruit Pro v1.0</p>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:10px 12px;font-size:14px}.input:focus{outline:none;border-color:var(--color-amber-brand);box-shadow:0 0 0 3px color-mix(in oklab, var(--color-amber-brand) 20%, transparent)}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </div>
  );
}
