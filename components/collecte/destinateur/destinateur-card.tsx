"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Phone, CalendarPlus, RefreshCw } from "lucide-react"

const COLOR = "#72bc21"

export default function DestinateurCard() {
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [data, setData] = useState({
    totalDestinataires: 0,
    totalEntreprises: 0,
    nouveauxCeMois: 0,
    dernierAjout: "",
    derniereDate: "",
  })

  const loadData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setData({
        totalDestinataires: 24,
        totalEntreprises: 18,
        nouveauxCeMois: 5,
        dernierAjout: "Via Consulting",
        derniereDate: "20/11/2025",
      })
      setIsRefreshing(false)
    }, 800)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="w-full space-y-6 mb-8">
      {/* === HEADER RESPONSIVE avec titre + bouton actualiser === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Statistiques Destinataires</h2>

        <button
          onClick={loadData}
          disabled={isRefreshing}
          className={`
            flex items-center justify-center gap-2 px-4 py-2.5 
            rounded-lg border font-medium text-sm
            transition-all duration-200
            ${isRefreshing 
              ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed" 
              : "bg-white border-[#72bc21] text-[#72bc21] hover:bg-[#72bc21] hover:text-white shadow-sm"
            }
          `}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Actualiser</span>
          <span className="sm:hidden">Rafraîchir</span>
        </button>
      </div>

      {/* === CARTES RESPONSIVES === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: COLOR }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Destinataires</CardTitle>
            <Users className="h-5 w-5" style={{ color: COLOR }} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLOR }}>
              {isRefreshing ? "..." : data.totalDestinataires}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Contacts enregistrés</p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: COLOR }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Entreprises</CardTitle>
            <Building2 className="h-5 w-5" style={{ color: COLOR }} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLOR }}>
              {isRefreshing ? "..." : data.totalEntreprises}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sociétés distinctes</p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: COLOR }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Nouveaux (mois)</CardTitle>
            <CalendarPlus className="h-5 w-5" style={{ color: COLOR }} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLOR }}>
              {isRefreshing ? "..." : `+${data.nouveauxCeMois}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ajoutés ce mois</p>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: COLOR }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Dernier ajout</CardTitle>
            <Phone className="h-5 w-5" style={{ color: COLOR }} />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-lg font-semibold" style={{ color: COLOR }}>
              {isRefreshing ? (
                <span className="inline-block h-5 w-32 bg-gray-200 rounded animate-pulse" />
              ) : (
                data.dernierAjout
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRefreshing ? (
                <span className="inline-block h-4 w-24 bg-gray-200 rounded animate-pulse" />
              ) : (
                data.derniereDate
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}