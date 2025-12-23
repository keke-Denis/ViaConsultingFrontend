"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Package, Box, DollarSign, Scale } from "lucide-react"

// Couleurs cohérentes
const COLOR = "#76bc21"
const COLOR_LIGHT = "#ffffff"

const HECard = ({ title, Icon, children }: { 
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
        <div className="space-y-4 flex-1">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

const AgregageDefinitifCard = () => {
  // Valeurs statiques pour les huiles essentielles vendues
  const heFeuillesData = {
    poidsVendu: "85 kg",
    prixTotal: "4.250.000 Ar",
    prixUnitaire: "50.000 Ar/kg"
  }

  const heGriffesData = {
    poidsVendu: "18 kg",
    prixTotal: "1.080.000 Ar",
    prixUnitaire: "60.000 Ar/kg"
  }

  const heClousData = {
    poidsVendu: "32 kg",
    prixTotal: "2.240.000 Ar",
    prixUnitaire: "70.000 Ar/kg"
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#76bc21]">Huiles Essentielles Vendues</h2>
        <p className="text-gray-600 mt-2">Récapitulatif des ventes d'huiles essentielles</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Carte 1: HE Feuilles */}
        <HECard title="HE Feuilles" Icon={Droplets}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Poids vendu:</span>
              </div>
              <span className="font-semibold text-lg">{heFeuillesData.poidsVendu}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Prix total:</span>
              </div>
              <span className="font-semibold text-lg text-green-600">{heFeuillesData.prixTotal}</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Prix unitaire:</span>
                <span className="font-medium">{heFeuillesData.prixUnitaire}</span>
              </div>
            </div>
          </div>
        </HECard>

        {/* Carte 2: HE Griffes */}
        <HECard title="HE Griffes" Icon={Box}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Poids vendu:</span>
              </div>
              <span className="font-semibold text-lg">{heGriffesData.poidsVendu}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Prix total:</span>
              </div>
              <span className="font-semibold text-lg text-green-600">{heGriffesData.prixTotal}</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Prix unitaire:</span>
                <span className="font-medium">{heGriffesData.prixUnitaire}</span>
              </div>
            </div>
          </div>
        </HECard>

        {/* Carte 3: HE Clous */}
        <HECard title="HE Clous" Icon={Package}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Poids vendu:</span>
              </div>
              <span className="font-semibold text-lg">{heClousData.poidsVendu}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Prix total:</span>
              </div>
              <span className="font-semibold text-lg text-green-600">{heClousData.prixTotal}</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Prix unitaire:</span>
                <span className="font-medium">{heClousData.prixUnitaire}</span>
              </div>
            </div>
          </div>
        </HECard>
      </div>
    </div>
  )
}

export default AgregageDefinitifCard