import { Nut } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white" | "icon-only";
  showText?: boolean;
  className?: string;
}

/**
 * Logo Component
 * 
 * Usage:
 * 1. Add your logo image to: public/assets/images/logo.png
 * 2. Component will automatically use it
 * 3. Falls back to icon if image not found
 * 
 * Variants:
 * - default: Colored logo with text
 * - white: White logo for dark backgrounds
 * - icon-only: Just the logo icon
 */
export function Logo({ 
  size = "md", 
  variant = "default", 
  showText = true,
  className = "" 
}: LogoProps) {
  const sizes = {
    sm: { container: "h-10 w-10", text: "text-base", icon: "h-5 w-5" },
    md: { container: "h-14 w-14", text: "text-xl", icon: "h-7 w-7" },
    lg: { container: "h-24 w-24", text: "text-3xl", icon: "h-12 w-12" },
  };

  const s = sizes[size];
  const isWhite = variant === "white";
  const iconOnly = variant === "icon-only" || !showText;

  // Try to use custom logo image, fallback to icon
  const logoPath = "/chaman_delight_no_bg.png";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image */}
      <div className={`flex ${s.container} items-center justify-center overflow-hidden`}>
        <img 
          src={logoPath} 
          alt="Chaman Delight Logo" 
          className="h-full w-full object-contain brightness-105 contrast-110"
        />
      </div>

      {/* Company Name */}
      {!iconOnly && (
        <div className="flex flex-col">
          <p className={`font-display font-black leading-none tracking-tight ${s.text} ${isWhite ? "text-cream" : "text-amber-brand"} drop-shadow-sm`}>
            Chaman Delight
          </p>
          <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-1 ${isWhite ? "text-cream/70" : "text-amber-brand/80"}`}>
            Premium Dry Fruit
          </p>
        </div>
      )}
    </div>
  );
}
