// components/collecte/gerer-payement-card.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign } from "lucide-react"
import { PaiementStats } from "@/lib/payement/payement-types"

interface GestionPaiementCardProps {
  stats: PaiementStats & {
    nombreFournisseursAvecAvance: number
    totalAvancesPrises: number
  }
}

export function GestionPaiementCard({ stats }: GestionPaiementCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      {/* Carte 1 : Nombre de fournisseurs qui ont pris des avances */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Fournisseurs avec avances
          </CardTitle>
          <Users className="h-4 w-4" style={{ color: '#72bc21' }} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: '#72bc21' }}>
            {stats.nombreFournisseursAvecAvance}
          </div>
          <p className="text-xs text-muted-foreground">
            Nombre de fournisseurs qui ont pris des avances
          </p>
        </CardContent>
      </Card>

      {/* Carte 2 : Total des avances que les fournisseurs ont pris */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total des avances prises
          </CardTitle>
          <DollarSign className="h-4 w-4" style={{ color: '#72bc21' }} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: '#72bc21' }}>
            {stats.totalAvancesPrises.toLocaleString('fr-FR')} Ar
          </div>
          <p className="text-xs text-muted-foreground">
            Total des avances que les fournisseurs ont pris
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
