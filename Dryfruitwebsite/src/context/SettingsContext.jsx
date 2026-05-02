import { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../services/api';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    companyName: 'Chaman Delight Dry Fruit',
    phone: '0326 5153000',
    address: 'Billa Chowk Satellite Town Gujranwala Pakistan',
    email: 'chamandelightdryfruit@gmail.com'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await settingsApi.get();
      if (response.success && response.data) {
        setSettings({
          companyName: response.data.companyName || 'Chaman Delight Dry Fruit',
          phone: response.data.phone || '0326 5153000',
          address: response.data.address || 'Billa Chowk Satellite Town Gujranwala Pakistan',
          email: response.data.email || 'chamandelightdryfruit@gmail.com'
        });
      }
    } catch (error) {
      console.error('Failed to fetch website settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useWebsiteSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useWebsiteSettings must be used within a SettingsProvider');
  }
  return context;
}
