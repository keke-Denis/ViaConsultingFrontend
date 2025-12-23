"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { fournisseurAPI } from '@/lib/fournisseur/fournisseur-api';
import { provenanceAPI } from '@/lib/provenance/provenance-api';
import type { Fournisseur } from '@/lib/fournisseur/fournisseur-types';
import type { Provenance } from '@/lib/provenance/provenance-types';

interface DataContextType {
  loadFournisseurs: () => Promise<Fournisseur[]>;
  loadProvenances: () => Promise<Provenance[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const loadFournisseurs = async (): Promise<Fournisseur[]> => {
    try {
      const response = await fournisseurAPI.getAll();
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error);
      return [];
    }
  };

  const loadProvenances = async (): Promise<Provenance[]> => {
    try {
      const response = await provenanceAPI.getAll();
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Erreur chargement provenances:', error);
      return [];
    }
  };

  return (
    <DataContext.Provider value={{
      loadFournisseurs,
      loadProvenances,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}