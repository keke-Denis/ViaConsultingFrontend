// contexts/facturation-solde-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useSolde } from './solde-context';

interface FacturationUpdateData {
  montantPaye: number;
  montantTotal: number;
  pvReceptionId: number;
  dateFacturation: string;
}

interface FacturationSoldeContextType {
  // Solde temporaire réduit par les facturations en attente
  soldeActuelAjuste: number;
  // Solde brut depuis le contexte solde
  soldeBrut: number;
  // Ajouter un montant payé (appelé lors d'une facturation réussie)
  decrementSolde: (montant: number, pvReceptionId?: number) => void;
  // Annuler un paiement
  incrementSolde: (montant: number, pvReceptionId?: number) => void;
  // Réinitialiser et récupérer depuis l'API
  resetSoldeLocaux: () => Promise<void>;
  // Facturations en cours
  facturationsPendantes: FacturationUpdateData[];
  // Total des facturations en attente
  totalFacturisations: number;
}

const FacturationSoldeContext = createContext<FacturationSoldeContextType | undefined>(undefined);

export function FacturationSoldeProvider({ children }: { children: ReactNode }) {
  const { soldeActuel, refreshSolde } = useSolde();
  const [totalFacturisations, setTotalFacturisations] = useState(0);
  const [facturationsPendantes, setFacturationsPendantes] = useState<FacturationUpdateData[]>([]);

  // Solde actuel ajusté = solde initial - facturations en attente
  const soldeActuelAjuste = soldeActuel - totalFacturisations;

  const decrementSolde = useCallback((montant: number, pvReceptionId?: number) => {
    setTotalFacturisations(prev => prev + montant);
    
    if (pvReceptionId) {
      setFacturationsPendantes(prev => [...prev, {
        montantPaye: montant,
        montantTotal: montant,
        pvReceptionId,
        dateFacturation: new Date().toISOString()
      }]);
    }
  }, []);

  const incrementSolde = useCallback((montant: number, pvReceptionId?: number) => {
    setTotalFacturisations(prev => Math.max(0, prev - montant));
    
    if (pvReceptionId) {
      setFacturationsPendantes(prev => 
        prev.filter(f => f.pvReceptionId !== pvReceptionId)
      );
    }
  }, []);

  const resetSoldeLocaux = useCallback(async () => {
    setTotalFacturisations(0);
    setFacturationsPendantes([]);
    await refreshSolde();
  }, [refreshSolde]);

  return (
    <FacturationSoldeContext.Provider
      value={{
        soldeActuelAjuste,
        soldeBrut: soldeActuel,
        decrementSolde,
        incrementSolde,
        resetSoldeLocaux,
        facturationsPendantes,
        totalFacturisations,
      }}
    >
      {children}
    </FacturationSoldeContext.Provider>
  );
}

export function useFacturationSolde() {
  const context = useContext(FacturationSoldeContext);
  if (context === undefined) {
    throw new Error('useFacturationSolde must be used within a FacturationSoldeProvider');
  }
  return context;
}
