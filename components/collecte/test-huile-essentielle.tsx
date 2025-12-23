// components/test-huile/TestHuileEssentielle.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useTestFiche } from "@/contexts/test-huile/fiche-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, AlertCircle, Package, RefreshCw, Scale, Box, Leaf, DollarSign, TrendingUp, Clock } from "lucide-react"
import { cardStatistiqueService } from "@/lib/affichageCardTestHuille/card-api"

const COLOR = "#76bc21"
const COLOR_LIGHT = "#ffffff"

export function TestHuileEssentielle() {
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [lastLoadTime, setLastLoadTime] = useState<number>(0)
  const [totaux, setTotaux] = useState({
    totalFiches: 0,
    awaitingTest: 0,
    totalStock: 0,
    totalPoidsNet: 0
  })

  const loadFiches = useCallback(async () => {
    const now = Date.now()
    if (now - lastLoadTime < 5000) {
      return
    }

    try {
      setIsLoading(true)
      const stats = await cardStatistiqueService.getStatistiques()
      
      setTotaux({
        totalFiches: stats.totalFiches,
        awaitingTest: stats.awaitingTest,
        totalStock: stats.totalStock,
        totalPoidsNet: stats.totalPoidsNet
      })
      
      setLastUpdate(new Date().toLocaleTimeString('fr-FR'))
      setLastLoadTime(Date.now())
    } catch (error) {
      console.error("Erreur de chargement des statistiques:", error)
      setTotaux({
        totalFiches: 0,
        awaitingTest: 0,
        totalStock: 0,
        totalPoidsNet: 0
      })
    } finally {
      setIsLoading(false)
    }
  }, [lastLoadTime])

  useEffect(() => {
    loadFiches()
  }, [loadFiches])

  // Recharger automatiquement les stats lorsque la liste des fiches change
  const { fiches } = useTestFiche()
  useEffect(() => {
    loadFiches()
  }, [fiches])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  const StatCard = ({ 
    title, 
    value, 
    unit, 
    icon: IconComponent, 
    description,
    secondaryValue,
    secondaryLabel
  }: { 
    title: string, 
    value: number | string, 
    unit?: string, 
    icon: any, 
    description: string,
    secondaryValue?: string | number,
    secondaryLabel?: string
  }) => {
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
            {title}
          </CardTitle>
          <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_LIGHT }}>
            <IconComponent className="h-5 w-5" style={{ stroke: COLOR, strokeWidth: 2 }} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="text-2xl md:text-3xl font-bold text-black mb-2">
            {isLoading ? '...' : `${formatNumber(Number(value))}${unit || ''}`}
          </div>
          
          {description && (
            <div className="flex items-center gap-1 mb-3">
              <Package className="h-3 w-3" style={{ color: COLOR }} />
              <p className="text-xs text-gray-600">
                {isLoading ? 'Chargement...' : description}
              </p>
            </div>
          )}
          
          {secondaryValue !== undefined && secondaryLabel && (
            <div className="mt-auto pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{secondaryLabel}</span>
                <span className="text-sm font-semibold text-black">
                  {isLoading ? '...' : secondaryValue}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-2xl font-bold text-[#76bc21]">
            Test Huile Essentielle
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Statistiques des fiches de réception
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={loadFiches}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatCard 
          title="Total fiches" 
          value={totaux.totalFiches} 
          icon={FileText} 
          description={`${totaux.totalFiches} fiches enregistrées`}
          secondaryValue={`${totaux.awaitingTest} en attente`}
          secondaryLabel="À tester"
        />
        
        <StatCard 
          title="Poids net total" 
          value={totaux.totalPoidsNet.toFixed(2)} 
          unit=" kg" 
          icon={Scale} 
          description="Poids net total disponible"
          secondaryValue={`${formatNumber(totaux.totalStock)} kg brut`}
          secondaryLabel="Poids brut"
        />
        
        <StatCard 
          title="En attente test" 
          value={totaux.awaitingTest} 
          icon={AlertCircle} 
          description={`${totaux.awaitingTest} fiches en attente`}
          secondaryValue={totaux.totalFiches > 0 
            ? `${((totaux.awaitingTest / totaux.totalFiches) * 100).toFixed(1)}%` 
            : '0%'
          }
          secondaryLabel="Pourcentage"
        />
      </div>
    </div>
  )
}