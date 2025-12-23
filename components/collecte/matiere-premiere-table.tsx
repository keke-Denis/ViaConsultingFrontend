// components/collecte/matiere-premiere-table.tsx
"use client"

import { FicheLivraisonProvider } from "@/contexts/pvreception/fichelivraison-context"
import { MatierePremiereTableContent } from "./matierePremiere/matiere-premiere-table-content"

export function MatierePremiereTable() {
  return (
    <FicheLivraisonProvider>
      <MatierePremiereTableContent />
    </FicheLivraisonProvider>
  )
}