import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Leaf, Sprout, Package, TrendingUp, Truck, DollarSign, BarChart, Droplet, Download, Filter, Search } from "lucide-react"
import { useState } from "react"

const collectionPoints = [
  { id: 1, name: "Vangaindrano", feuilles: 30, griffes: 30, clous: 30, total: 90, status: "Actif", heFeuilles: 4500 },
  { id: 2, name: "Manambondro", feuilles: 35, griffes: 35, clous: 35, total: 105, status: "Actif", heFeuilles: 5250 },
  { id: 3, name: "Vohipeno", feuilles: 35, griffes: 35, clous: 35, total: 105, status: "Actif", heFeuilles: 5250 },
  { id: 4, name: "Manakara", feuilles: 20, griffes: 20, clous: 20, total: 60, status: "Actif", heFeuilles: 3000 },
  { id: 5, name: "Matangy", feuilles: 30, griffes: 30, clous: 30, total: 90, status: "Actif", heFeuilles: 4500 },
  { id: 6, name: "Ampasimandreva", feuilles: 30, griffes: 30, clous: 30, total: 90, status: "Actif", heFeuilles: 4500 },
]

// Prix par kilogramme (HE feuilles converti en kg)
const prixParKg = {
  feuilles: 150,
  griffes: 200,
  clous: 180,
  heFeuilles: 2.5, // Prix par kg d'HE feuilles
}

// Taux de conversion HE feuilles (L -> kg)
const tauxConversionHE = 0.9 // 1L ≈ 0.9kg

const PointCollecte = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  
  // Convertir HE feuilles de L à kg
  const collectionPointsAvecKg = collectionPoints.map(point => ({
    ...point,
    heFeuillesKg: point.heFeuilles * tauxConversionHE,
    totalAvecHE: point.total + (point.heFeuilles * tauxConversionHE)
  }))

  const totalGlobal = collectionPoints.reduce((sum, point) => sum + point.total, 0)
  const totalFeuilles = collectionPoints.reduce((sum, point) => sum + point.feuilles, 0)
  const totalGriffes = collectionPoints.reduce((sum, point) => sum + point.griffes, 0)
  const totalClous = collectionPoints.reduce((sum, point) => sum + point.clous, 0)
  const totalHEFeuillesL = collectionPoints.reduce((sum, point) => sum + point.heFeuilles, 0)
  const totalHEFeuillesKg = totalHEFeuillesL * tauxConversionHE
  const totalGlobalAvecHE = totalGlobal + totalHEFeuillesKg

  // Calcul des prix totaux
  const prixTotalFeuilles = totalFeuilles * prixParKg.feuilles
  const prixTotalGriffes = totalGriffes * prixParKg.griffes
  const prixTotalClous = totalClous * prixParKg.clous
  const prixTotalHEFeuilles = totalHEFeuillesKg * prixParKg.heFeuilles
  const prixTotalGeneral = prixTotalFeuilles + prixTotalGriffes + prixTotalClous + prixTotalHEFeuilles

  // Filtrer les points de collecte
  const filteredPoints = collectionPointsAvecKg.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || point.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Statistiques par type
  const getStatsByType = () => {
    const stats = {
      feuilles: { total: 0, pourcentage: 0 },
      griffes: { total: 0, pourcentage: 0 },
      clous: { total: 0, pourcentage: 0 },
      heFeuilles: { total: 0, pourcentage: 0 }
    }
    
    collectionPoints.forEach(point => {
      stats.feuilles.total += point.feuilles
      stats.griffes.total += point.griffes
      stats.clous.total += point.clous
      stats.heFeuilles.total += point.heFeuilles * tauxConversionHE
    })
    
    const totalAll = stats.feuilles.total + stats.griffes.total + stats.clous.total + stats.heFeuilles.total
    stats.feuilles.pourcentage = (stats.feuilles.total / totalAll) * 100
    stats.griffes.pourcentage = (stats.griffes.total / totalAll) * 100
    stats.clous.pourcentage = (stats.clous.total / totalAll) * 100
    stats.heFeuilles.pourcentage = (stats.heFeuilles.total / totalAll) * 100
    
    return stats
  }

  const stats = getStatsByType()

  // Fonction pour exporter les données
  const exportData = () => {
    const dataStr = JSON.stringify(collectionPointsAvecKg, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `points-collecte-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6 p-4">
      {/* En-tête avec statistiques globales */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#72bc21] rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black">POINTS DE COLLECTE</h2>
            <p className="text-sm text-gray-700">Répartition des stocks par localité</p>
          </div>
        </div>

        {/* Contrôles et statistiques */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-[#72bc21] rounded-lg text-sm w-full sm:w-48 text-black"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-[#72bc21] rounded-lg text-sm bg-white text-black"
            >
              <option value="all">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-[#72bc21] text-white rounded-lg hover:bg-[#5aa017] transition-colors text-sm border border-[#72bc21]"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#72bc21] bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">Points actifs</span>
            </div>
            <p className="text-xl font-bold text-black">
              {collectionPoints.filter(p => p.status === "Actif").length}/{collectionPoints.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#72bc21] bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">Stock total</span>
            </div>
            <p className="text-xl font-bold text-black">{totalGlobalAvecHE.toFixed(1)} kg</p>
          </CardContent>
        </Card>

        <Card className="border border-[#72bc21] bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">Types MP</span>
            </div>
            <p className="text-xl font-bold text-black">4</p>
          </CardContent>
        </Card>

        <Card className="border border-[#72bc21] bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">Valeur totale</span>
            </div>
            <p className="text-xl font-bold text-black">
              {(prixTotalGeneral / 1000000).toFixed(1)}M Ar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#72bc21] bg-gradient-to-br from-[#72bc21]/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Feuilles</p>
                <p className="text-2xl font-bold text-black">{stats.feuilles.total} kg</p>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                  <div 
                    className="bg-[#72bc21] h-2 rounded-full"
                    style={{ width: `${stats.feuilles.pourcentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-700 mt-1">
                  {stats.feuilles.pourcentage.toFixed(1)}% du total
                </p>
              </div>
              <div className="w-10 h-10 bg-[#72bc21]/20 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#72bc21] bg-gradient-to-br from-[#4a9014]/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Griffes</p>
                <p className="text-2xl font-bold text-black">{stats.griffes.total} kg</p>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                  <div 
                    className="bg-[#4a9014] h-2 rounded-full"
                    style={{ width: `${stats.griffes.pourcentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-700 mt-1">
                  {stats.griffes.pourcentage.toFixed(1)}% du total
                </p>
              </div>
              <div className="w-10 h-10 bg-[#4a9014]/20 rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#72bc21] bg-gradient-to-br from-[#a8d466]/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Clous</p>
                <p className="text-2xl font-bold text-black">{stats.clous.total} kg</p>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                  <div 
                    className="bg-[#a8d466] h-2 rounded-full"
                    style={{ width: `${stats.clous.pourcentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-700 mt-1">
                  {stats.clous.pourcentage.toFixed(1)}% du total
                </p>
              </div>
              <div className="w-10 h-10 bg-[#a8d466]/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#72bc21] bg-gradient-to-br from-[#2a700e]/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">HE Feuilles</p>
                <p className="text-2xl font-bold text-black">{totalHEFeuillesKg.toFixed(1)} kg</p>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                  <div 
                    className="bg-[#2a700e] h-2 rounded-full"
                    style={{ width: `${stats.heFeuilles.pourcentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-700 mt-1">
                  {stats.heFeuilles.pourcentage.toFixed(1)}% du total
                </p>
              </div>
              <div className="w-10 h-10 bg-[#2a700e]/20 rounded-lg flex items-center justify-center">
                <Droplet className="w-5 h-5 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grille des points de collecte */}
      {filteredPoints.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#72bc21] rounded-lg">
          <p className="text-gray-700">Aucun point de collecte trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPoints.map((point) => (
            <Card
              key={point.id}
              className="border border-[#72bc21] shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group bg-gradient-to-br from-white to-gray-100"
            >
              <CardContent className="p-6">
                {/* En-tête de la carte */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#72bc21] rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-lg">{point.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={`${
                          point.status === "Actif" 
                            ? "bg-[#72bc21]/10 text-black border-[#72bc21]" 
                            : "bg-gray-200 text-gray-800 border-[#72bc21]"
                        } font-medium`}
                      >
                        {point.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Total du point */}
                  <div className="text-right">
                    <p className="text-xs text-gray-700">Total</p>
                    <p className="text-xl font-bold text-black">{point.totalAvecHE.toFixed(1)} kg</p>
                  </div>
                </div>

                {/* Détails des stocks */}
                <div className="space-y-3 mb-4">
                  {/* Feuilles */}
                  <div className="flex items-center justify-between p-3 bg-[#72bc21]/5 rounded-lg border border-[#72bc21] group-hover:bg-[#72bc21]/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#72bc21]/10 rounded-lg flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-sm font-medium text-black">Feuilles</span>
                    </div>
                    <span className="font-bold text-black">{point.feuilles} kg</span>
                  </div>

                  {/* Griffes */}
                  <div className="flex items-center justify-between p-3 bg-[#4a9014]/5 rounded-lg border border-[#72bc21] group-hover:bg-[#4a9014]/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#4a9014]/10 rounded-lg flex items-center justify-center">
                        <Sprout className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-sm font-medium text-black">Griffes</span>
                    </div>
                    <span className="font-bold text-black">{point.griffes} kg</span>
                  </div>

                  {/* Clous */}
                  <div className="flex items-center justify-between p-3 bg-[#a8d466]/5 rounded-lg border border-[#72bc21] group-hover:bg-[#a8d466]/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#a8d466]/10 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-sm font-medium text-black">Clous</span>
                    </div>
                    <span className="font-bold text-black">{point.clous} kg</span>
                  </div>

                  {/* HE feuilles */}
                  <div className="flex items-center justify-between p-3 bg-[#2a700e]/5 rounded-lg border border-[#72bc21] group-hover:bg-[#2a700e]/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#2a700e]/10 rounded-lg flex items-center justify-center">
                        <Droplet className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-sm font-medium text-black">HE feuilles</span>
                    </div>
                    <span className="font-bold text-black">{point.heFeuillesKg.toFixed(1)} kg</span>
                    <span className="text-xs text-gray-700 ml-2">({point.heFeuilles}L)</span>
                  </div>
                </div>

                {/* Performance */}
                <div className="pt-4 border-t border-[#72bc21]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Taux de remplissage</span>
                    <span className="font-semibold text-black flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-black" />
                      {Math.round((point.totalAvecHE / 150) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-[#72bc21] to-[#4a9014] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((point.totalAvecHE / 150) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock total */}
        <Card className="border border-[#72bc21] bg-gradient-to-r from-gray-50 to-[#72bc21]/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#72bc21] rounded-xl flex items-center justify-center">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-black text-lg">Stock Total</h3>
                <p className="text-sm text-gray-700">Quantités totales par type (en kg)</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Feuilles", value: totalFeuilles, icon: Leaf },
                { label: "Griffes", value: totalGriffes, icon: Sprout },
                { label: "Clous", value: totalClous, icon: Package },
                { label: "HE feuilles", value: totalHEFeuillesKg, icon: Droplet },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-[#72bc21]/5 rounded-lg border border-[#72bc21]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#72bc21]/10 rounded-lg flex items-center justify-center">
                      {React.createElement(item.icon, { className: "w-4 h-4 text-black" })}
                    </div>
                    <span className="text-sm font-medium text-black">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">{item.value.toFixed(1)} kg</p>
                    <p className="text-xs text-gray-700">
                      {Math.round((item.value / totalGlobalAvecHE) * 100)}% du total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Valeur totale */}
        <Card className="border border-[#72bc21] bg-gradient-to-r from-gray-50 to-[#72bc21]/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#72bc21] rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-black text-lg">Valeur Marchande</h3>
                <p className="text-sm text-gray-700">Estimation de la valeur du stock</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Feuilles", value: prixTotalFeuilles, unit: "kg", price: prixParKg.feuilles },
                { label: "Griffes", value: prixTotalGriffes, unit: "kg", price: prixParKg.griffes },
                { label: "Clous", value: prixTotalClous, unit: "kg", price: prixParKg.clous },
                { label: "HE feuilles", value: prixTotalHEFeuilles, unit: "kg", price: prixParKg.heFeuilles },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-[#72bc21]/5 rounded-lg border border-[#72bc21]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#72bc21]/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-black">{item.label}</span>
                      <p className="text-xs text-gray-700">{item.price} Ar/{item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">{item.value.toLocaleString()} Ar</p>
                    <p className="text-xs text-gray-700">
                      {Math.round((item.value / prixTotalGeneral) * 100)}% de la valeur
                    </p>
                  </div>
                </div>
              ))}

              {/* Total général */}
              <div className="mt-6 pt-4 border-t border-[#72bc21]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#72bc21] rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-black">Total Général</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-black">{prixTotalGeneral.toLocaleString()} Ar</p>
                    <p className="text-sm text-gray-700">
                      {totalGlobalAvecHE.toFixed(1)} kg total
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PointCollecte