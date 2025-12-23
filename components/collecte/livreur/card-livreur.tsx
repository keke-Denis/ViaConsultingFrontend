"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Package, CheckCircle, RefreshCw, Truck, UserCheck } from "lucide-react"

const COLOR = "#76bc21"
const COLOR_LIGHT = "#ffffff"

const livreursData = {
  total: 12,
  actifs: 8,
  enLivraison: 5,
  disponibles: 3
}

export default function CardLivreur() {
  const [stats, setStats] = useState(livreursData)
  const [isLoading, setIsLoading] = useState(false)

  const loadStats = async () => {
    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStats(livreursData)
    } catch (error) {
      console.error("Erreur de chargement des statistiques")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

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
    secondaryLabel,
    percentage
  }: { 
    title: string, 
    value: number | string, 
    unit?: string, 
    icon: React.ComponentType<{ className?: string }>, 
    description: string,
    secondaryValue?: string | number,
    secondaryLabel?: string,
    percentage?: number
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
            <IconComponent className="h-5 w-5" style={{ color: COLOR } as any} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="text-2xl md:text-3xl font-bold text-black mb-2">
            {isLoading ? '...' : `${formatNumber(Number(value))}${unit || ''}`}
          </div>
          
          {description && (
            <div className="flex items-center gap-1 mb-3">
              <Truck className="h-3 w-3" style={{ color: COLOR }} />
              <p className="text-xs text-gray-600">
                {isLoading ? 'Chargement...' : description}
              </p>
            </div>
          )}
          
          {(secondaryValue !== undefined || percentage !== undefined) && (
            <div className="mt-auto pt-3 border-t border-gray-100">
              {secondaryValue !== undefined && secondaryLabel && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{secondaryLabel}</span>
                  <span className="text-sm font-semibold text-black">
                    {isLoading ? '...' : secondaryValue}
                  </span>
                </div>
              )}
              {percentage !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux d'activité</span>
                  <span className="text-sm font-semibold text-black">
                    {isLoading ? '...' : `${percentage}%`}
                  </span>
                </div>
              )}
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
            Gestion des Livreurs
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Suivi et statistiques des livreurs
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={loadStats}
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
          title="Total livreurs" 
          value={stats.total} 
          icon={Users} 
          description="Livreurs enregistrés dans le système"
          secondaryValue={`${stats.actifs} actifs`}
          secondaryLabel="Statut"
          percentage={stats.total > 0 ? Math.round((stats.actifs / stats.total) * 100) : 0}
        />
        
        <StatCard 
          title="Livreurs actifs" 
          value={stats.actifs} 
          icon={UserCheck} 
          description="En service actuellement"
          secondaryValue={`${stats.disponibles} disponibles`}
          secondaryLabel="Disponibles"
        />
        
        <StatCard 
          title="En livraison" 
          value={stats.enLivraison} 
          icon={Package} 
          description="Livraisons en cours"
          secondaryValue={`${stats.actifs > 0 ? Math.round((stats.enLivraison / stats.actifs) * 100) : 0}%`}
          secondaryLabel="Taux d'occupation"
        />
      </div>
    </div>
  )
}