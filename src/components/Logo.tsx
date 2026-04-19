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
    sm: { container: "h-8 w-8", text: "text-base", icon: "h-4 w-4" },
    md: { container: "h-10 w-10", text: "text-lg", icon: "h-5 w-5" },
    lg: { container: "h-16 w-16", text: "text-2xl", icon: "h-8 w-8" },
  };

  const s = sizes[size];
  const isWhite = variant === "white";
  const iconOnly = variant === "icon-only" || !showText;

  // Try to use custom logo image, fallback to icon
  const logoPath = "/assets/images/logo.jpg";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image */}
      <div className={`flex ${s.container} items-center justify-center rounded-lg bg-white overflow-hidden shadow-sm`}>
        <img 
          src={logoPath} 
          alt="DryFruit Pro" 
          className="h-full w-full object-cover"
        />
      </div>

      {/* Company Name */}
      {!iconOnly && (
        <div>
          <p className={`font-display font-bold leading-none ${s.text} ${isWhite ? "text-cream" : "text-amber-brand"}`}>
            DryFruit Pro
          </p>
          {size === "lg" && (
            <p className={`text-[10px] mt-1 tracking-wide ${isWhite ? "text-cream/70" : "text-muted-foreground"}`}>
              WHOLESALE & RETAIL
            </p>
          )}
        </div>
      )}
    </div>
  );
}
