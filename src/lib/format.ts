export const formatPKR = (n: number) =>
  `PKR ${Math.round(n).toLocaleString("en-PK")}`;

export const formatNumber = (n: number) => n.toLocaleString("en-PK");

export const formatDate = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${formatDate(date)} ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

// Format quantity with unit (e.g., "2.5 kg", "250 g", "3 pack")
export const formatQty = (qty: number, unit: string) => {
  // Gram mein agar 1000 se zyada hai toh kg mein convert karo
  if (unit === "g" && qty >= 1000) {
    return `${(qty / 1000).toFixed(2)} kg`;
  }
  // Decimal values ko properly format karo
  if (qty % 1 !== 0) {
    return `${qty.toFixed(2)} ${unit}`;
  }
  return `${qty} ${unit}`;
};
