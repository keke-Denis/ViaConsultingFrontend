// components/solde/solde-display-ajuste.tsx
"use client"

import { useFacturationSolde } from "@/contexts/facturation-solde-context"
import { useSolde } from "@/contexts/solde-context"

interface SoldeDisplayAjusteProps {
  className?: string
  showBrut?: boolean
}

export function SoldeDisplayAjuste({ className = "", showBrut = false }: SoldeDisplayAjusteProps) {
  const { soldeActuelAjuste, totalFacturisations, soldeBrut } = useFacturationSolde()
  const { isLoading } = useSolde()

  if (isLoading) {
    return (
      <div className={`inline-block ${className}`}>
        <div className="h-6 w-20 bg-gray-300 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="text-sm text-gray-600">Solde actuel</div>
      
      {/* Solde ajusté (principal) */}
      <div className="text-2xl font-bold text-green-600">
        {soldeActuelAjuste.toLocaleString('fr-FR')} Ar
      </div>

      {/* Détail si facturations en attente */}
      {totalFacturisations > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          Solde brut: {soldeBrut.toLocaleString('fr-FR')} Ar - Facturations: {totalFacturisations.toLocaleString('fr-FR')} Ar
        </div>
      )}

      {/* Affichage du solde brut optionnel */}
      {showBrut && totalFacturisations > 0 && (
        <div className="text-sm text-gray-600 mt-2 pt-2 border-t">
          <span className="text-yellow-600">⚠️ </span>
          {totalFacturisations.toLocaleString('fr-FR')} Ar de facturations en attente
        </div>
      )}
    </div>
  )
}
