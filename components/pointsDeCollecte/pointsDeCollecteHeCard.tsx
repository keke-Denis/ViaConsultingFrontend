"use client"

import React, { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { useStockHE } from "@/contexts/stockHE-context"

const COLOR = "#76bc21"
const COLOR_LIGHT = "#ffffff"

interface PointsDeCollecteHeCardProps {
  title: string;
  Icon: any;
  poidsNet: number | null;
  isLoading?: boolean;
  isError?: boolean;
}

const PointsDeCollecteHeCard: React.FC<PointsDeCollecteHeCardProps> = ({ 
  title, 
  Icon, 
  poidsNet,
  isLoading = false,
  isError = false
}) => {
  const formatPoids = (poids: number | null) => {
    if (poids === null || poids === undefined) {
      return "-"
    }
    return poids.toLocaleString('fr-FR') + " Kg"
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
        <CardTitle className="text-sm font-semibold uppercase text-black">{title}</CardTitle>
        <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_LIGHT }}>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: COLOR }} />
          ) : isError ? (
            <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />
          ) : (
            <Icon className="h-5 w-5" style={{ color: COLOR }} />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center text-red-600 space-y-2">
            <AlertCircle className="h-8 w-8" />
            <span className="text-sm text-center">Données indisponibles</span>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Poids net:</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">
              {formatPoids(poidsNet)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const PointsDeCollecteHeCardComponent = () => {
  const { stock, isLoading, error, refresh } = useStockHE()
  // refresh is provided by the context; call on mount to ensure latest
  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#76bc21]">État du Stock - Huile Essentielle</h2>
        <button
          onClick={() => { void refresh() }}
          className="flex items-center gap-2 px-4 py-2 bg-[#76bc21] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Actualiser
        </button>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 max-w-lg mx-auto gap-4 lg:gap-6">
        <PointsDeCollecteHeCard 
          title="Huile Essentielle de Feuilles" 
          Icon={Droplets} 
          poidsNet={stock.HE_FEUILLES ?? null}
          isLoading={isLoading}
          isError={Boolean(error)}
        />
      </div>
    </div>
  )
}

export default PointsDeCollecteHeCardComponent