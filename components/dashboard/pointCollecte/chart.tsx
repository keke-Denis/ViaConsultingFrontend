"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, BarChart3, Target, Award, Calendar, Download, Filter } from "lucide-react"
import { useState } from "react"

const data = [
  { name: "Vangaindrano", feuilles: 30, griffes: 20, clous: 10, he_feuilles: 4500, total: 60 },
  { name: "Manambondro", feuilles: 35, griffes: 25, clous: 15, he_feuilles: 5250, total: 75 },
  { name: "Vohipeno", feuilles: 40, griffes: 30, clous: 20, he_feuilles: 5250, total: 90 },
  { name: "Manakara", feuilles: 20, griffes: 15, clous: 25, he_feuilles: 3000, total: 60 },
  { name: "Matangy", feuilles: 50, griffes: 35, clous: 30, he_feuilles: 4500, total: 115 },
  { name: "Ampasimandreva", feuilles: 45, griffes: 40, clous: 35, he_feuilles: 4500, total: 120 },
]

// Couleurs basées sur #72bc21 avec différentes variations
const CHART_COLORS = {
  primary: "#72bc21",
  feuilles: "#72bc21",          // Vert principal
  griffes: "#4a9014",          // Vert foncé
  clous: "#a8d466",            // Vert clair
  he_feuilles: "#2a700e",      // Vert très foncé
  background: "#f8fdf2",       // Fond vert très clair
  grid: "#e5f5d8",             // Lignes de grille
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.dataKey}:</span>
              <span className="font-semibold text-gray-900">
                {entry.value} {entry.dataKey === 'he_feuilles' ? 'L' : 'kg'}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200 mt-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#72bc21] to-[#4a9014]" />
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-[#72bc21]">
              {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)} kg
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

// Custom Legend
const renderLegend = (props: any) => {
  const { payload } = props
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700 font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

const Chart = () => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line')
  const totalFeuilles = data.reduce((sum, item) => sum + item.feuilles, 0)
  const totalGriffes = data.reduce((sum, item) => sum + item.griffes, 0)
  const totalClous = data.reduce((sum, item) => sum + item.clous, 0)
  const totalHEFeuilles = data.reduce((sum, item) => sum + item.he_feuilles, 0)
  const totalGlobal = totalFeuilles + totalGriffes + totalClous

  // Données pour le graphique circulaire
  const pieData = [
    { name: 'Feuilles', value: totalFeuilles, color: CHART_COLORS.feuilles },
    { name: 'Griffes', value: totalGriffes, color: CHART_COLORS.griffes },
    { name: 'Clous', value: totalClous, color: CHART_COLORS.clous },
    { name: 'HE Feuilles', value: totalHEFeuilles / 100, color: CHART_COLORS.he_feuilles },
  ]

  // Fonction pour exporter le graphique
  const exportChart = () => {
    const svgElement = document.querySelector('.recharts-surface') as SVGSVGElement
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        const link = document.createElement('a')
        link.download = `chart-${new Date().toISOString().split('T')[0]}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* En-tête avec statistiques */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#72bc21] to-[#5aa017] rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ANALYSE DES PERFORMANCES</h2>
            <p className="text-sm text-gray-600">Visualisation des données de collecte</p>
          </div>
        </div>

        {/* Contrôles du graphique */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded-md transition-colors ${chartType === 'line' ? 'bg-[#72bc21] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
            >
              Lignes
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-md transition-colors ${chartType === 'bar' ? 'bg-[#72bc21] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
            >
              Barres
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-4 py-2 rounded-md transition-colors ${chartType === 'pie' ? 'bg-[#72bc21] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
            >
              Circulaire
            </button>
          </div>
          
          <button
            onClick={exportChart}
            className="flex items-center gap-2 px-4 py-2 bg-[#72bc21] text-white rounded-lg hover:bg-[#5aa017] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#72bc21]/20 bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#72bc21]">Feuilles</p>
                <p className="text-2xl font-bold text-gray-900">{totalFeuilles} kg</p>
                <Badge variant="outline" className="mt-1 bg-[#72bc21]/10 text-[#72bc21] border-[#72bc21]/20">
                  {Math.round((totalFeuilles / totalGlobal) * 100)}%
                </Badge>
              </div>
              <div className="w-10 h-10 bg-[#72bc21]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#72bc21] text-lg">🍃</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#4a9014]/20 bg-gradient-to-r from-[#4a9014]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4a9014]">Griffes</p>
                <p className="text-2xl font-bold text-gray-900">{totalGriffes} kg</p>
                <Badge variant="outline" className="mt-1 bg-[#4a9014]/10 text-[#4a9014] border-[#4a9014]/20">
                  {Math.round((totalGriffes / totalGlobal) * 100)}%
                </Badge>
              </div>
              <div className="w-10 h-10 bg-[#4a9014]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#4a9014] text-lg">🌿</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#a8d466]/20 bg-gradient-to-r from-[#a8d466]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#8bc34a]">Clous</p>
                <p className="text-2xl font-bold text-gray-900">{totalClous} kg</p>
                <Badge variant="outline" className="mt-1 bg-[#a8d466]/10 text-[#8bc34a] border-[#a8d466]/20">
                  {Math.round((totalClous / totalGlobal) * 100)}%
                </Badge>
              </div>
              <div className="w-10 h-10 bg-[#a8d466]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#8bc34a] text-lg">📍</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#2a700e]/20 bg-gradient-to-r from-[#2a700e]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#2a700e]">HE Feuilles</p>
                <p className="text-2xl font-bold text-gray-900">{totalHEFeuilles} kg</p>
                <Badge variant="outline" className="mt-1 bg-[#2a700e]/10 text-[#2a700e] border-[#2a700e]/20">
                  Production
                </Badge>
              </div>
              <div className="w-10 h-10 bg-[#2a700e]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#2a700e] text-lg">💧</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique principal */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    {/* Gradients pour les aires */}
                    <linearGradient id="colorFeuilles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.feuilles} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.feuilles} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGriffes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.griffes} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.griffes} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClous" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.clous} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.clous} stopOpacity={0}/>
                    </linearGradient>
                  </defs>

                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={CHART_COLORS.grid}
                    vertical={false}
                  />
                  
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                    padding={{ left: 20, right: 20 }}
                  />
                  
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                  />
                  
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderLegend} />

                  {/* Aire pour Feuilles */}
                  <Area
                    type="monotone"
                    dataKey="feuilles"
                    stroke="none"
                    fill="url(#colorFeuilles)"
                    fillOpacity={1}
                  />

                  {/* Aire pour Griffes */}
                  <Area
                    type="monotone"
                    dataKey="griffes"
                    stroke="none"
                    fill="url(#colorGriffes)"
                    fillOpacity={1}
                  />

                  {/* Aire pour Clous */}
                  <Area
                    type="monotone"
                    dataKey="clous"
                    stroke="none"
                    fill="url(#colorClous)"
                    fillOpacity={1}
                  />

                  {/* Lignes principales */}
                  <Line
                    type="monotone"
                    dataKey="feuilles"
                    stroke={CHART_COLORS.feuilles}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.feuilles, strokeWidth: 2, r: 5, stroke: "#fff" }}
                    activeDot={{ r: 7, stroke: CHART_COLORS.feuilles, strokeWidth: 2, fill: "#fff" }}
                  />

                  <Line
                    type="monotone"
                    dataKey="griffes"
                    stroke={CHART_COLORS.griffes}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.griffes, strokeWidth: 2, r: 5, stroke: "#fff" }}
                    activeDot={{ r: 7, stroke: CHART_COLORS.griffes, strokeWidth: 2, fill: "#fff" }}
                  />

                  <Line
                    type="monotone"
                    dataKey="clous"
                    stroke={CHART_COLORS.clous}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.clous, strokeWidth: 2, r: 5, stroke: "#fff" }}
                    activeDot={{ r: 7, stroke: CHART_COLORS.clous, strokeWidth: 2, fill: "#fff" }}
                  />
                </LineChart>
              ) : chartType === 'bar' ? (
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderLegend} />
                  <Bar dataKey="feuilles" fill={CHART_COLORS.feuilles} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="griffes" fill={CHART_COLORS.griffes} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clous" fill={CHART_COLORS.clous} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}${entry.name === 'HE Feuilles' ? 'L' : 'kg'}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}${name === 'HE Feuilles' ? ' L' : ' kg'}`,
                      name
                    ]}
                  />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-[#72bc21]/20 bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-[#72bc21]" />
              <h3 className="font-semibold text-gray-900">Meilleur Performeur</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">Ampasimandreva</p>
                <p className="text-sm text-gray-600">120 kg collectés</p>
              </div>
              <Badge className="bg-[#72bc21]/10 text-[#72bc21] border-[#72bc21]/20">
                🏆 Leader
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#72bc21]/20 bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-[#72bc21]" />
              <h3 className="font-semibold text-gray-900">Tendance Mensuelle</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[#72bc21]">+15%</p>
                <p className="text-sm text-gray-600">Croissance ce mois</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#72bc21]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Chart