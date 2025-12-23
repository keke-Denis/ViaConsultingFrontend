"use client"

import { useState, useEffect } from "react"
import { usePVReception } from "@/contexts/pvreception/pvreception-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, TrendingUp, Box, Leaf, RefreshCw, DollarSign, Scale } from "lucide-react"
import { MatierePremiereTable } from "./matiere-premiere-table"
import { ReceptionDialog } from "./reception-dialog"
import { stockApi, stockUtils, type StockStats, type TypeStat } from "@/lib/pvreception/stock-api"

// J'utilise le code couleur fourni : #72bc21.
// J'ai conservé le #76bc21 de votre code pour la cohérence des constantes.
const COLOR = "#76bc21" // Couleur principale
const COLOR_LIGHT = "#ffffff" // Blanc pour l'arrière-plan des icônes

// Données par défaut pendant le chargement
const defaultStats: StockStats = {
  FG: {
    stock_total: 0,
    nombre_pv: 0,
    quantite_totale_receptionnee: 0,
    quantite_livree: 0,
    prix_total: 0,
    prix_unitaire_moyen: 0,
    poids_net_total: 0, 
    libelle: 'Feuilles',
    icone: 'Leaf'
  },
  CG: {
    stock_total: 0,
    nombre_pv: 0,
    quantite_totale_receptionnee: 0,
    quantite_livree: 0,
    prix_total: 0,
    prix_unitaire_moyen: 0,
    poids_net_total: 0, 
    libelle: 'Clous',
    icone: 'Package'
  },
  GG: {
    stock_total: 0,
    nombre_pv: 0,
    quantite_totale_receptionnee: 0,
    quantite_livree: 0,
    prix_total: 0,
    prix_unitaire_moyen: 0,
    poids_net_total: 0, 
    libelle: 'Griffes',
    icone: 'Box'
  }
}

export function MatierePremiereTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [stockStats, setStockStats] = useState<StockStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [totaux, setTotaux] = useState({
    stock_total: 0,
    nombre_pv_total: 0,
    prix_total: 0,
    poids_net_total: 0,
    types_actifs: 0
  })

  // Charger les statistiques de stock
  const loadStockStats = async () => {
    try {
      setIsLoading(true)
      const response = await stockApi.getStockStats()
      if (response.status === 'success') {
        setStockStats(response.data.stats_par_type)
        setTotaux(response.data.totaux)
        setLastUpdate(new Date(response.data.derniere_mise_a_jour).toLocaleTimeString('fr-FR'))
      }
    } catch (error) {
      console.error('Erreur chargement statistiques:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStockStats()
  }, [])

  // Recharger automatiquement les stats lorsque la liste des PV change
  const { pvReceptions } = usePVReception()
  useEffect(() => {
    loadStockStats()
  }, [pvReceptions])

  // Recharger les stats après création d'un PV
  const handleDialogSuccess = () => {
    loadStockStats()
  }

  const stats = stockStats || defaultStats

  // Composant de carte réutilisable
  const StockCard = ({ typeStat, typeKey }: { typeStat: TypeStat, typeKey: keyof StockStats }) => {
    const getIcon = () => {
      switch (typeKey) {
        case 'CG': return <Package className="h-5 w-5" style={{ color: COLOR }} />;
        case 'GG': return <Box className="h-5 w-5" style={{ color: COLOR }} />;
        case 'FG': return <Leaf className="h-5 w-5" style={{ color: COLOR }} />;
        default: return <Package className="h-5 w-5" style={{ color: COLOR }} />;
      }
    }

    return (
      <Card
        className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
        style={{
          background: `linear-gradient(to bottom right, ${COLOR_LIGHT}, ${COLOR}10)`,
          borderLeft: `5px solid ${COLOR}`,
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold uppercase text-black">
            {typeStat.libelle}
          </CardTitle>
          <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_LIGHT }}>
            {getIcon()}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="text-2xl md:text-3xl font-bold text-black mb-2">
            {isLoading ? '...' : stockUtils.formatNumber(typeStat.poids_net_total)} Kg
          </div>
          
          <div className="mt-auto space-y-2 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Prix Total</span>
              <span className="text-sm font-semibold text-black">
                {isLoading ? '...' : stockUtils.formatPrice(typeStat.prix_total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nombre de PV</span>
              <span className="text-sm font-semibold text-black">
                {isLoading ? '...' : typeStat.nombre_pv}
              </span>
            </div>
            {typeStat.prix_unitaire_moyen > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Moyenne/Kg</span>
                <span className="text-sm font-semibold text-black">
                  {isLoading ? '...' : stockUtils.formatPrice(typeStat.prix_unitaire_moyen)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      {/* En-tête avec bouton actualiser et NOUVEAU bouton Nouvelle Réception */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-2xl font-bold text-[#76bc21]">
            Stock des matières premières
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestion des réceptions et suivi du stock
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Bouton Actualiser */}
          <Button
            onClick={loadStockStats}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="w-full sm:w-auto border-gray-300 text-gray-600 hover:bg-[#76bc21] hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="ml-2">Actualiser</span>
          </Button>
        </div>
      </div>

      {/* Stock - 4 cartes responsives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StockCard typeStat={stats.CG} typeKey="CG" />
        <StockCard typeStat={stats.GG} typeKey="GG" />
        <StockCard typeStat={stats.FG} typeKey="FG" />
       
        {/* Card Poids net total */}
        <Card
          className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
          style={{
            background: `linear-gradient(to bottom right, ${COLOR_LIGHT}, ${COLOR}10)`,
            borderLeft: `5px solid ${COLOR}`
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold uppercase text-black">
              Poids Net Global
            </CardTitle>
            <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_LIGHT }}>
              <Scale className="h-5 w-5" style={{ color: COLOR }} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <div className="text-2xl md:text-3xl font-bold text-black mb-2">
              {isLoading ? '...' : stockUtils.formatNumber(totaux.poids_net_total)} Kg
            </div>
            
            <div className="mt-auto space-y-2 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Somme du poids net de tous les types
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Types Actifs</span>
                <span className="text-sm font-semibold text-black">
                  {isLoading ? '...' : `${totaux.types_actifs}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des matières premières */}
        <Card>
          <MatierePremiereTable />
        </Card>

      <ReceptionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}