// contexts/solde-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { soldeUserApi } from '@/lib/affichageSolde/solde-user-api';
import { SoldeUser } from '@/lib/affichageSolde/solde-user-type';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'react-toastify';

interface SoldeContextType {
  soldes: SoldeUser[];
  loading: boolean;
  refreshSoldes: () => Promise<void>;
  getSoldeUtilisateur: (userId: number) => number;
}

const SoldeContext = createContext<SoldeContextType | undefined>(undefined);

export function SoldeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [soldes, setSoldes] = useState<SoldeUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSoldes = async () => {
    if (!user) {
      setSoldes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await soldeUserApi.getTousLesSoldes();
      const userSoldes = data.filter(item => item.utilisateur_id === user.id);
      const sorted = userSoldes.sort((a, b) => {
        if (a.utilisateur?.role === "admin") return -1;
        if (b.utilisateur?.role === "admin") return 1;
        return a.utilisateur_id - b.utilisateur_id;
      });
      setSoldes(sorted);
    } catch (err) {
      console.error("Erreur chargement soldes:", err);
      toast.error("Erreur lors du chargement des soldes");
      setSoldes([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshSoldes = async () => {
    await loadSoldes();
  };

  const getSoldeUtilisateur = (userId: number): number => {
    const solde = soldes.find(s => s.utilisateur_id === userId);
    return solde?.solde || 0;
  };

  useEffect(() => {
    loadSoldes();
  }, [user]);

  return (
    <SoldeContext.Provider value={{ soldes, loading, refreshSoldes, getSoldeUtilisateur }}>
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