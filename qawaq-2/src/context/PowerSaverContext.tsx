import React, { createContext, useContext } from 'react';
import { usePowerSaver, UsePowerSaverReturn } from '../hooks/usePowerSaver';

const PowerSaverContext = createContext<UsePowerSaverReturn | undefined>(undefined);

export const PowerSaverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const powerSaver = usePowerSaver();

  return (
    <PowerSaverContext.Provider value={powerSaver}>
      {children}
    </PowerSaverContext.Provider>
  );
};

export const usePowerSaverContext = (): UsePowerSaverReturn => {
  const context = useContext(PowerSaverContext);
  if (!context) {
    throw new Error('usePowerSaverContext must be used within a PowerSaverProvider');
  }
  return context;
};
