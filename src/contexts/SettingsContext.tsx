import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/services/api";

interface Settings {
  _id?: string;
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  ntnNumber: string;
  taxRate: number;
  logo?: string;
  currency: string;
  defaultTax: number;
  lowStockThreshold: number;
  dateFormat: string;
  invoicePrefix: string;
  poPrefix: string;
  businessType: "Retail" | "Wholesale" | "Both";
  lastBackupDate?: string;
  lastBackupSize?: string;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  companyName: "Spice Route Manager",
  ownerName: "Admin",
  phone: "+92 300 0000000",
  email: "info@spiceroute.com",
  address: "Lahore, Pakistan",
  city: "Lahore",
  ntnNumber: "",
  taxRate: 5,
  currency: "PKR",
  defaultTax: 5,
  lowStockThreshold: 10,
  dateFormat: "DD MMM YYYY",
  invoicePrefix: "INV-",
  poPrefix: "PO-",
  businessType: "Both",
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | null>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await api.getSettings();
      if (response.success && response.data) {
        setSettings(response.data as Settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      // Use default settings on error
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
