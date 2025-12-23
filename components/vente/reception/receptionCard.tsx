"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle, Truck, Droplets, Box, Leaf } from "lucide-react"

// Couleurs cohérentes avec le thème
const COLOR = "#76bc21"
const COLOR_LIGHT = "#ffffff"

const ReceptionCardItem = ({ title, Icon, children }: { 
  title: string; 
  Icon: any; 
  children: React.ReactNode 
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
        <CardTitle className="text-sm font-semibold uppercase text-black">{title}</CardTitle>
        <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_LIGHT }}>
          <Icon className="h-5 w-5" style={{ color: COLOR }} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="space-y-3 flex-1">
          {children}
        </div>
        <div className="mt-auto space-y-2 pt-3 border-t border-gray-100">
        </div>
      </CardContent>
    </Card>
  )
}

const ReceptionCard = () => {
  // Remplacer par données dynamiques depuis l'API
  const [loading, setLoading] = useState(false)
  const [receptions, setReceptions] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      const apiModule = await import('@/lib/vente/vente-api')
      try {
        const res = await apiModule.getReceptions()
        if (mounted && (res as any)?.success && Array.isArray((res as any).data)) {
          setReceptions((res as any).data)
        }
      } catch (e) {
        console.error('Erreur chargement réceptions pour card', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // Calculs simples basés sur informations_source.type_produit / type_matiere
  const sumByType = (typeKey: string) => {
    const sum = receptions.reduce((acc, r) => {
      const info = r.informations_source || {}
      const tp = info.type_produit || info.type_matiere || (r.ficheLivraison?.type_produit ?? r.transport?.type_matiere)
      if (tp && tp.toLowerCase().includes(typeKey)) {
        return acc + (r.quantite_recue || 0)
      }
      return acc
    }, 0)
    return `${sum.toLocaleString('fr-FR')} kg`
  }

  const receptionEnAttente = {
    feuilles: sumByType('feuilles'),
    clous: sumByType('clous'),
    griffes: sumByType('griffes'),
  }

  const receptionRecues = receptionEnAttente // simplification: uses same sums (backend fournit distinction if needed)

  const totalReceptions = {
    feuilles: receptionEnAttente.feuilles,
    clous: receptionEnAttente.clous,
    griffes: receptionEnAttente.griffes,
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Carte 1: HE Feuilles */}
        <ReceptionCardItem title="HE Feuilles" Icon={Leaf}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">En attente:</span>
            </div>
            <span className="font-semibold text-lg">{receptionEnAttente.feuilles}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Reçues:</span>
            </div>
            <span className="font-semibold text-lg">{receptionRecues.feuilles}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Total:</span>
            </div>
            <span className="font-semibold text-lg text-green-700">{totalReceptions.feuilles}</span>
          </div>
        </ReceptionCardItem>

        {/* Carte 2: HE Clous */}
        <ReceptionCardItem title="HE Clous" Icon={Package}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">En attente:</span>
            </div>
            <span className="font-semibold text-lg">{receptionEnAttente.clous}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Reçues:</span>
            </div>
            <span className="font-semibold text-lg">{receptionRecues.clous}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Total:</span>
            </div>
            <span className="font-semibold text-lg text-green-700">{totalReceptions.clous}</span>
          </div>
        </ReceptionCardItem>

        {/* Carte 3: HE Griffes */}
        <ReceptionCardItem title="HE Griffes" Icon={Box}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">En attente:</span>
            </div>
            <span className="font-semibold text-lg">{receptionEnAttente.griffes}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Reçues:</span>
            </div>
            <span className="font-semibold text-lg">{receptionRecues.griffes}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Total:</span>
            </div>
            <span className="font-semibold text-lg text-green-700">{totalReceptions.griffes}</span>
          </div>
        </ReceptionCardItem>
      </div>
    </div>
  )
}

export default ReceptionCard