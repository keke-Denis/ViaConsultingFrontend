"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Package, Box, FlaskRound, Users } from "lucide-react"

// Couleurs cohérentes
const COLOR = "#76bc21"
const COLOR_LIGHT = "#ffffff"

const TestProvisoireCard = ({ title, Icon, children }: { 
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
      </CardContent>
    </Card>
  )
}

const AgregageProvisoireCard = () => {
  // Données pour les tests en cours
  const testsEnCours = {
    feuilles: {
      total: 12,
      poidsTotal: "28.5 kg",
      clients: 8
    },
    clous: {
      total: 34,
      poidsTotal: "65.2 kg", 
      clients: 22
    },
    griffes: {
      total: 7,
      poidsTotal: "15.8 kg",
      clients: 5
    }
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Carte 1: HE Feuilles */}
        <TestProvisoireCard title="HE Feuilles" Icon={Leaf}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FlaskRound className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Tests en cours:</span>
              </div>
              <span className="font-semibold text-lg text-green-700">{testsEnCours.feuilles.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Poids total:</span>
              </div>
              <span className="font-semibold text-lg">{testsEnCours.feuilles.poidsTotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Clients concernés:</span>
              </div>
              <span className="font-semibold text-lg">{testsEnCours.feuilles.clients}</span>
            </div>
          </div>
        </TestProvisoireCard>

        {/* Carte 2: HE Clous */}
        <TestProvisoireCard title="HE Clous" Icon={Package}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FlaskRound className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Tests en cours:</span>
              </div>
              <span className="font-semibold text-lg text-blue-700">{testsEnCours.clous.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Poids total:</span>
              </div>
              <span className="font-semibold text-lg">{testsEnCours.clous.poidsTotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Clients concernés:</span>
              </div>
              <span className="font-semibold text-lg">{testsEnCours.clous.clients}</span>
            </div>
          </div>
        </TestProvisoireCard>

        {/* Carte 3: HE Griffes */}
        <TestProvisoireCard title="HE Griffes" Icon={Box}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FlaskRound className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Tests en cours:</span>
              </div>
              <span className="font-semibold text-lg text-amber-700">{testsEnCours.griffes.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Poids total:</span>
              </div>
              <span className="font-semibold text-lg">{testsEnCours.griffes.poidsTotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Clients concernés:</span>
              </div>
              <span className="font-semibold text-lg">{testsEnCours.griffes.clients}</span>
            </div>
          </div>
        </TestProvisoireCard>
      </div>
    </div>
  )
}

export default AgregageProvisoireCard