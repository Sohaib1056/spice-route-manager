import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Pill } from "@/components/Pill";

export const Route = createFileRoute("/login")({ component: LoginPage });

const loginSchema = z.object({
  email: z.string().email("براہ کرم صحیح ای میل درج کریں"),
  password: z.string().min(6, "پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے"),
  remember: z.boolean().optional(),
});

interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

const demos = [
  { label: "Admin", email: "admin@dryfruitpro.pk", password: "admin123", color: "bg-walnut hover:bg-walnut/90 border-walnut" },
  { label: "Manager", email: "manager@dryfruitpro.pk", password: "manager123", color: "bg-amber-brand hover:bg-amber-brand/90 border-amber-brand" },
  { label: "Staff", email: "staff@dryfruitpro.pk", password: "staff123", color: "bg-pistachio hover:bg-pistachio/90 border-pistachio" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Check if credentials match any demo account
    const validAccount = demos.find(
      (demo) => demo.email === data.email && demo.password === data.password
    );

    if (validAccount) {
      navigate({ to: "/" });
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Half - Walnut Brown Background */}
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-walnut text-cream p-12 overflow-hidden animate-slide-in-left">
        {/* Radial Gradient Background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(212, 134, 10, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(212, 134, 10, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(212, 134, 10, 0.2) 0%, transparent 60%)
            `,
          }}
        />
        
        {/* Diagonal Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(212, 134, 10, 0.1) 10px,
              rgba(212, 134, 10, 0.1) 20px
            )`,
          }}
        />

        <div className="relative z-10 text-center max-w-md">
          {/* Hand-crafted Dry Fruit SVG Illustration */}
          <div className="mb-8 relative h-32">
            <svg className="absolute left-1/2 top-0 -translate-x-1/2 animate-float" width="280" height="120" viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Badam (Almond) */}
              <ellipse cx="50" cy="60" rx="12" ry="20" stroke="#D4860A" strokeWidth="2" fill="none" />
              <path d="M 50 40 Q 55 60 50 80" stroke="#D4860A" strokeWidth="1.5" fill="none" />
              
              {/* Kaju (Cashew) */}
              <path className="animate-float-delayed" d="M 100 50 Q 110 45 115 55 Q 118 65 110 75 Q 100 80 95 70 Q 92 60 100 50 Z" stroke="#D4860A" strokeWidth="2" fill="none" />
              
              {/* Pista (Pistachio) */}
              <ellipse cx="150" cy="60" rx="10" ry="16" stroke="#D4860A" strokeWidth="2" fill="none" />
              <line x1="150" y1="44" x2="150" y2="76" stroke="#D4860A" strokeWidth="1.5" />
              
              {/* Kishmish (Raisin) */}
              <ellipse className="animate-float" cx="195" cy="65" rx="8" ry="14" stroke="#D4860A" strokeWidth="2" fill="none" />
              <ellipse cx="195" cy="60" rx="6" ry="10" stroke="#D4860A" strokeWidth="1" fill="none" />
              
              {/* Akhrot (Walnut) */}
              <circle cx="235" cy="60" rx="15" ry="15" stroke="#D4860A" strokeWidth="2" fill="none" />
              <path d="M 235 45 Q 240 60 235 75 M 235 45 Q 230 60 235 75" stroke="#D4860A" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          {/* Logo & Title */}
          <h1 className="font-display text-5xl font-bold text-cream mb-2">DryFruit Pro</h1>
          
          {/* Urdu Tagline */}
          <p className="text-2xl text-amber-brand font-semibold mb-6" style={{ fontFamily: 'Noto Nastaliq Urdu, serif', direction: 'rtl' }}>
            آپ کا معاملہ، ہمارے ہاتھ میں
          </p>

          {/* Feature Pills */}
          <div className="flex justify-center gap-3 mb-8 animate-fade-up">
            <Pill tone="amber">Inventory</Pill>
            <Pill tone="amber">Sales</Pill>
            <Pill tone="amber">Reports</Pill>
          </div>

          <div className="my-6 mx-auto h-px w-24 bg-amber-brand/50" />

          <p className="text-sm text-cream/70 leading-relaxed">
            Premium dry fruit business management system with complete inventory tracking, sales analytics, and financial reporting.
          </p>
        </div>
      </div>

      {/* Right Half - White Form Panel */}
      <div className="flex items-center justify-center bg-gradient-to-br from-white to-cream/30 p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-walnut mb-1">DryFruit Pro</h1>
            <p className="text-lg text-amber-brand font-semibold" style={{ fontFamily: 'Noto Nastaliq Urdu, serif', direction: 'rtl' }}>
              آپ کا معاملہ، ہمارے ہاتھ میں
            </p>
          </div>

          {/* Premium White Card */}
          <div className={`bg-white rounded-2xl shadow-2xl shadow-walnut/10 p-8 border border-border/50 ${shake ? 'animate-shake' : ''}`}>
            <h2 className="font-display text-3xl font-bold text-walnut mb-2">Welcome Back</h2>
            <p className="text-sm text-muted-foreground mb-6">اپنے اکاؤنٹ میں لاگ ان کریں</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-walnut mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-lg bg-white text-walnut placeholder:text-muted-foreground/50 focus:outline-none focus:border-amber-brand focus:ring-4 focus:ring-amber-brand/20 transition-all duration-200"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive" style={{ fontFamily: 'Noto Nastaliq Urdu, serif', direction: 'rtl' }}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-walnut mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...register("password")}
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 border-2 border-border rounded-lg bg-white text-walnut placeholder:text-muted-foreground/50 focus:outline-none focus:border-amber-brand focus:ring-4 focus:ring-amber-brand/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-walnut transition-colors"
                  >
                    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive" style={{ fontFamily: 'Noto Nastaliq Urdu, serif', direction: 'rtl' }}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register("remember")}
                    className="w-4 h-4 rounded border-2 border-border text-amber-brand focus:ring-2 focus:ring-amber-brand/30 cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-walnut transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-amber-brand hover:text-amber-brand/80 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-brand to-amber-brand/90 text-white font-semibold rounded-lg shadow-lg shadow-amber-brand/30 hover:shadow-xl hover:shadow-amber-brand/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  "Login to Dashboard"
                )}
              </button>
            </form>
          </div>

          {/* Demo Role Cards */}
          <div className="mt-8">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider text-center">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-3">
              {demos.map((demo) => (
                <button
                  key={demo.label}
                  onClick={() => fillDemo(demo.email, demo.password)}
                  className={`${demo.color} text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 border-2`}
                >
                  <div className="text-sm font-bold mb-1">{demo.label}</div>
                  <div className="text-[10px] opacity-80 truncate">{demo.email.split('@')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2024 DryFruit Pro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
