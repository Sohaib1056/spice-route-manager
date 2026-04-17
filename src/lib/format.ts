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
