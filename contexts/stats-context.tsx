// contexts/stats-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { soldeGeneraleApi } from "@/lib/soldeGenerale/soldeGenerale-api";
import type { Transaction } from "@/lib/soldeGenerale/soldeGenerale-type";

interface StatsContextType {
  stats: {
    total_revenus: number;
    total_depenses: number;
    nombre_transactions: number;
  };
  isLoading: boolean;
  refreshStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState({
    total_revenus: 0,
    total_depenses: 0,
    nombre_transactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = async () => {
    try {
      setIsLoading(true);
      const transactions: Transaction[] = await soldeGeneraleApi.getTransactions();

      console.log("Transactions reçues pour stats:", transactions);

      if (transactions.length === 0) {
        setStats({
          total_revenus: 0,
          total_depenses: 0,
          nombre_transactions: 0,
        });
      } else {
        const revenus = transactions
          .filter(t => t.type === "revenu")
          .reduce((sum, t) => {
            const montant = Number(t.montant) || 0;
            return sum + montant;
          }, 0);

        const depenses = transactions
          .filter(t => t.type === "depense")
          .reduce((sum, t) => {
            const montant = Number(t.montant) || 0;
            return sum + montant;
          }, 0);

        console.log("Nouveaux calculs stats:", { revenus, depenses });

        setStats({
          total_revenus: revenus,
          total_depenses: depenses,
          nombre_transactions: transactions.length,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only refresh stats initially when we have an access token to avoid
    // unauthenticated API calls that immediately redirect to /login (401).
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (token) refreshStats()
    } catch (err) {
      // ignore
    }
  }, []);

  return (
    <StatsContext.Provider value={{ stats, isLoading, refreshStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}