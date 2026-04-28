// Static catalog for the public e-commerce storefront
export interface ShopProduct {
  id: string;
  name: string;
  category: string;
  price: number; // PKR for default 500g
  description: string;
  image: string; // emoji used as placeholder
  stock: "In Stock" | "Low Stock" | "Out of Stock";
  weights: { label: string; multiplier: number }[];
}

export const CATEGORIES = [
  { id: "almonds", name: "Almonds", icon: "🌰", count: 8 },
  { id: "cashews", name: "Cashews", icon: "🥜", count: 6 },
  { id: "walnuts", name: "Walnuts", icon: "🌰", count: 5 },
  { id: "pistachios", name: "Pistachios", icon: "🥜", count: 7 },
  { id: "dates", name: "Dates", icon: "🌴", count: 9 },
  { id: "spices", name: "Spices", icon: "🌶️", count: 12 },
];

const W = [
  { label: "250g", multiplier: 0.55 },
  { label: "500g", multiplier: 1 },
  { label: "1kg", multiplier: 1.9 },
];

export const SHOP_PRODUCTS: ShopProduct[] = [
  { id: "p1", name: "Premium Californian Almonds", category: "almonds", price: 1850, description: "Crunchy, naturally sweet almonds sourced from California's finest orchards. Rich in vitamin E and protein.", image: "🌰", stock: "In Stock", weights: W },
  { id: "p2", name: "Kashmiri Mamra Almonds", category: "almonds", price: 3200, description: "Rare hand-picked Mamra almonds from Kashmir valleys — the king of almonds.", image: "🌰", stock: "Low Stock", weights: W },
  { id: "p3", name: "Jumbo Cashews W240", category: "cashews", price: 2400, description: "Premium grade W240 cashews — large, creamy and buttery.", image: "🥜", stock: "In Stock", weights: W },
  { id: "p4", name: "Roasted Salted Cashews", category: "cashews", price: 2200, description: "Lightly roasted cashews seasoned with Himalayan pink salt.", image: "🥜", stock: "In Stock", weights: W },
  { id: "p5", name: "Chilean Walnut Halves", category: "walnuts", price: 2100, description: "Light, fresh walnut halves perfect for baking and snacking.", image: "🌰", stock: "In Stock", weights: W },
  { id: "p6", name: "Akhrot Giri (Walnut Kernels)", category: "walnuts", price: 2600, description: "Premium walnut kernels — brain food packed with omega-3.", image: "🌰", stock: "Out of Stock", weights: W },
  { id: "p7", name: "Iranian Pistachios", category: "pistachios", price: 3800, description: "Authentic Iranian Akbari pistachios with deep flavour.", image: "🥜", stock: "In Stock", weights: W },
  { id: "p8", name: "Salted Roasted Pistachios", category: "pistachios", price: 3500, description: "In-shell pistachios, roasted and lightly salted to perfection.", image: "🥜", stock: "Low Stock", weights: W },
  { id: "p9", name: "Ajwa Dates (Madinah)", category: "dates", price: 4500, description: "Holy Ajwa dates from Madinah — soft, fruity and rich in iron.", image: "🌴", stock: "In Stock", weights: W },
  { id: "p10", name: "Medjool Dates", category: "dates", price: 2800, description: "Large, caramel-like Medjool dates — nature's candy.", image: "🌴", stock: "In Stock", weights: W },
  { id: "p11", name: "Kashmiri Saffron (Zafran)", category: "spices", price: 6500, description: "Pure Kashmiri saffron threads — vibrant red, intense aroma.", image: "🌶️", stock: "Low Stock", weights: [{ label: "1g", multiplier: 0.05 }, { label: "5g", multiplier: 0.22 }, { label: "10g", multiplier: 0.42 }] },
  { id: "p12", name: "Black Cardamom (Badi Elaichi)", category: "spices", price: 1600, description: "Smoky, bold black cardamom pods — a biryani essential.", image: "🌶️", stock: "In Stock", weights: W },
];

export const findProduct = (id: string) => SHOP_PRODUCTS.find((p) => p.id === id);
