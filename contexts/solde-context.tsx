// contexts/solde-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { soldeGeneraleApi } from "@/lib/soldeGenerale/soldeGenerale-api";
import type { Transaction } from "@/lib/soldeGenerale/soldeGenerale-type";

interface SoldeContextType {
  soldeActuel: number;
  isLoading: boolean;
  refreshSolde: () => Promise<void>;
  lastUpdate: string;
}

const SoldeContext = createContext<SoldeContextType | undefined>(undefined);

export function SoldeProvider({ children }: { children: ReactNode }) {
  const [soldeActuel, setSoldeActuel] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");

  const refreshSolde = async () => {
    try {
      setIsLoading(true);
      const transactions: Transaction[] = await soldeGeneraleApi.getTransactions();

      if (transactions.length > 0) {
        const dernier = transactions[0];
        setSoldeActuel(Number(dernier.solde) || 0);
      } else {
        setSoldeActuel(0);
      }

      setLastUpdate(
        new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (err) {
      console.error("Erreur chargement solde:", err);
      setSoldeActuel(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSolde();
  }, []);

  return (
    <SoldeContext.Provider value={{ soldeActuel, isLoading, refreshSolde, lastUpdate }}>
      {children}
    </SoldeContext.Provider>
  );
}

export function useSolde() {
  const context = useContext(SoldeContext);
  if (context === undefined) {
    throw new Error('useSolde must be used within a SoldeProvider');
  }
  return context;
}