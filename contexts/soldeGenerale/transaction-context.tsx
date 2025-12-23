// contexts/soldeGenerale/transaction-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TransactionContextType {
  refreshTransactions: () => void;
  refreshStats: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactionVersion, setTransactionVersion] = useState(0);
  const [statsVersion, setStatsVersion] = useState(0);

  const refreshTransactions = () => {
    setTransactionVersion(prev => prev + 1);
  };

  const refreshStats = () => {
    setStatsVersion(prev => prev + 1);
  };

  return (
    <TransactionContext.Provider value={{ refreshTransactions, refreshStats }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
}