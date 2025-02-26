
import { createContext, useContext, useState, useEffect } from 'react';
import { Car } from '../data/cars';

type AppContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  selectedCar: Car | null;
  setSelectedCar: (car: Car | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  useEffect(() => {
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(darkModePreference);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <AppContext.Provider value={{ 
      isDarkMode, 
      toggleDarkMode,
      selectedCar,
      setSelectedCar
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
