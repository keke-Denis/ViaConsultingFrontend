"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Droplets, FlaskRound } from "lucide-react"
import { useDistillationStats } from '@/contexts/distillation/distillation-stats-context'

// Couleurs cohérentes avec `matiere-premiere-tab`
const COLOR = "#76bc21"
const COLOR_LIGHT = "#ffffff"

const DistillationCard = ({ title, Icon, value }: { 
  title: string; 
  Icon: any; 
  value: string
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
        <div className="text-2xl md:text-3xl font-bold text-black mb-2">{value}</div>
        <div className="mt-auto space-y-2 pt-3 border-t border-gray-100">
        </div>
      </CardContent>
    </Card>
  )
}

const DebutDistilationCard = () => {
  const { stats, loading } = useDistillationStats()

  const heFeuilles = loading ? '...' : stats?.distillations?.he_feuilles?.total_quantite_formate ?? '0 kg'
  const heClous = loading ? '...' : stats?.distillations?.he_clous?.total_quantite_formate ?? '0 kg'
  const heGriffes = loading ? '...' : stats?.distillations?.he_griffes?.total_quantite_formate ?? '0 kg'

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <DistillationCard title="HE Feuilles obtenu" Icon={Droplets} value={heFeuilles} />
        <DistillationCard title="HE Clous obtenu" Icon={FlaskRound} value={heClous} />
        <DistillationCard title="HE Griffes obtenu" Icon={Leaf} value={heGriffes} />
      </div>
    </div>
  )
}

export default DebutDistilationCard