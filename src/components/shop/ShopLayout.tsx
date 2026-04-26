import type { ReactNode } from "react";
import { ShopNavbar } from "./ShopNavbar";
import { ShopFooter } from "./ShopFooter";
import { CartDrawer } from "./CartDrawer";

export function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#1a0a00] text-[#f5e6d0]">
      <ShopNavbar />
      <main className="flex-1">{children}</main>
      <ShopFooter />
      <CartDrawer />
    </div>
  );
}
