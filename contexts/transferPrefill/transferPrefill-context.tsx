"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

type TransferPrefill = {
  destinataire_id?: number | null
  montant?: number | null
  type_transfert?: string
  reference?: string
  raison?: string
  destinataire?: any
}

type TransferPrefillContextType = {
  prefill: TransferPrefill | null
  setPrefill: (p: TransferPrefill | null) => void
  clearPrefill: () => void
}

const TransferPrefillContext = createContext<TransferPrefillContextType | undefined>(undefined)

export function TransferPrefillProvider({ children }: { children: ReactNode }) {
  const [prefill, setPrefillState] = useState<TransferPrefill | null>(null)

  const setPrefill = (p: TransferPrefill | null) => setPrefillState(p)
  const clearPrefill = () => setPrefillState(null)

  return (
    <TransferPrefillContext.Provider value={{ prefill, setPrefill, clearPrefill }}>
      {children}
    </TransferPrefillContext.Provider>
  )
}

export function useTransferPrefill() {
  const ctx = useContext(TransferPrefillContext)
  if (!ctx) throw new Error('useTransferPrefill must be used within TransferPrefillProvider')
  return ctx
}
