// components/PointsDeCollecteCard.tsx
"use client"

import React, { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Package, Box, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { stockAPI } from "@/lib/stock/stock-api"
import { usePoidsNet } from "@/contexts/poidsNet-context"

// Couleurs cohérentes avec le thème
const COLOR = "#76bc21"
const COLOR_LIGHT = "#ffffff"

interface PointsDeCollecteCardProps {
  title: string;
  Icon: any;
  poidsNet: number | null;
  isLoading?: boolean;
  isError?: boolean;
}

const PointsDeCollecteCard: React.FC<PointsDeCollecteCardProps> = ({ 
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
              <Package className="h-4 w-4 text-gray-600" />
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

const PointsDeCollecteCardComponent = () => {
  const { poidsNet, isLoading, error, refresh } = usePoidsNet()
  const apiError = Boolean(error)

  // Use a ref to hold the latest refresh function so the setup effect doesn't
  // re-run when `refresh` changes identity (this avoids an infinite loop).
  const refreshRef = React.useRef(refresh)

  // Keep ref up-to-date when `refresh` changes.
  useEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

  // Install listeners once on mount; call refresh via the ref.
  useEffect(() => {
    const safeRefresh = () => {
      try {
        refreshRef.current()
      } catch (e) {
        // ignore; hook should surface errors via its own state
      }
    }

    // initial refresh on mount
    safeRefresh()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        safeRefresh()
      }
    }

    const handleFocus = () => {
      safeRefresh()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleFocus)
    }
    // empty deps: we intentionally don't depend on `refresh` to avoid re-registering
  }, [])

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#76bc21]">Total du matière première payée</h2>
        <button 
          onClick={refresh}
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
      
      {error && apiError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Carte 1: Feuille */}
        <PointsDeCollecteCard 
          title="Feuille" 
          Icon={Leaf} 
          poidsNet={poidsNet.FG}
          isLoading={isLoading}
          isError={apiError}
        />

        {/* Carte 2: Clous */}
        <PointsDeCollecteCard 
          title="Clous" 
          Icon={Package} 
          poidsNet={poidsNet.CG}
          isLoading={isLoading}
          isError={apiError}
        />

        {/* Carte 3: Griffes */}
        <PointsDeCollecteCard 
          title="Griffes" 
          Icon={Box} 
          poidsNet={poidsNet.GG}
          isLoading={isLoading}
          isError={apiError}
        />
      </div>
    </div>
  )
}

export default PointsDeCollecteCardComponent