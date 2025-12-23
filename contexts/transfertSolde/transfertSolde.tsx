// contexts/solde-global-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SoldeGlobalContextType {
  soldeGlobal: number;
  setSoldeGlobal: (solde: number) => void;
  refreshSoldeGlobal: () => void;
}

const SoldeGlobalContext = createContext<SoldeGlobalContextType | undefined>(undefined);

export function SoldeGlobalProvider({ children }: { children: ReactNode }) {
  const [soldeGlobal, setSoldeGlobal] = useState<number>(0);
  const [version, setVersion] = useState(0);

  const refreshSoldeGlobal = () => {
    setVersion(prev => prev + 1);
  };

  return (
    <SoldeGlobalContext.Provider value={{ 
      soldeGlobal, 
      setSoldeGlobal,
      refreshSoldeGlobal 
    }}>
      {children}
    </SoldeGlobalContext.Provider>
  );
}

export function useSoldeGlobal() {
  const context = useContext(SoldeGlobalContext);
  if (context === undefined) {
    throw new Error('useSoldeGlobal must be used within a SoldeGlobalProvider');
  }
  return context;
}