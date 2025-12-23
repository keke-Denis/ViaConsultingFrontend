"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Leaf, Box, Package, Droplet } from "lucide-react"
import { useDistillationStats } from '@/contexts/distillation/distillation-stats-context'

// Couleurs cohérentes avec `matiere-premiere-tab`
const COLOR = "#76bc21"
const COLOR_LIGHT = "#ffffff"

const MetricCard = ({ title, value, Icon }: { title: string; value: string; Icon: any }) => {
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

const ExpeditionCard = () => {
  const { stats, loading } = useDistillationStats()

  const feuilleTotal = loading ? '...' : stats?.expeditions?.feuilles_recues?.total_quantite_formate ?? '0 kg'
  const giroffesTotal = loading ? '...' : stats?.expeditions?.griffes_recues?.total_quantite_formate ?? '0 kg'
  const clousTotal = loading ? '...' : stats?.expeditions?.clous_recus?.total_quantite_formate ?? '0 kg'

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <MetricCard title="Total de Feuilles arrivé" value={feuilleTotal} Icon={Leaf} />
        <MetricCard title="Total de Griffes arrivé" value={giroffesTotal} Icon={Box} />
        <MetricCard title="Total de Clous arrivés" value={clousTotal} Icon={Package} />
      </div>
    </div>
  )
}

export default ExpeditionCard