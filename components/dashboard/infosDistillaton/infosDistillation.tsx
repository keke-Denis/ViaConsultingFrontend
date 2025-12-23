import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Sprout, Package, Droplets, Factory, Filter } from "lucide-react"

const InfosDistillation = () => {
  const [selectedUsine, setSelectedUsine] = useState<string>("all")

  // Données des stocks
  const stocksData = {
    "all": {
      heFeuilles: 40,
      heGriffes: 35,
      heClous: 45,
      stockFeuilles: 120,
      stockClous: 90,
      stockGriffes: 85
    },
    "pk12": {
      heFeuilles: 25,
      heGriffes: 18,
      heClous: 30,
      stockFeuilles: 75,
      stockClous: 60,
      stockGriffes: 55
    },
    "makomby": {
      heFeuilles: 15,
      heGriffes: 17,
      heClous: 15,
      stockFeuilles: 45,
      stockClous: 30,
      stockGriffes: 30
    }
  }

  const data = stocksData[selectedUsine as keyof typeof stocksData] || stocksData.all
  const totalHE = data.heFeuilles + data.heGriffes + data.heClous
  const totalStock = data.stockFeuilles + data.stockClous + data.stockGriffes

  return (
    <div className="space-y-8 p-4">
      {/* En-tête avec filtre d'usine */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#72bc21] rounded-xl flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black">STOCK HUILE ESSENTIELLE</h2>
            <p className="text-sm text-gray-700">Stock disponible par type de matière première</p>
          </div>
        </div>

        {/* Filtre d'usine */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Usine :</span>
          </div>
          <div className="flex border border-[#72bc21] rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedUsine("all")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedUsine === "all" 
                  ? "bg-[#72bc21] text-white" 
                  : "bg-white text-black hover:bg-[#72bc21]/10"
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setSelectedUsine("pk12")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedUsine === "pk12" 
                  ? "bg-[#72bc21] text-white" 
                  : "bg-white text-black hover:bg-[#72bc21]/10"
              }`}
            >
              PK 12
            </button>
            <button
              onClick={() => setSelectedUsine("makomby")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedUsine === "makomby" 
                  ? "bg-[#72bc21] text-white" 
                  : "bg-white text-black hover:bg-[#72bc21]/10"
              }`}
            >
              Makomby
            </button>
          </div>
        </div>
      </div>

      {/* Section Stock Huile Essentielle - 3 cartes seulement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* HE Feuille */}
        <Card className="border border-[#72bc21] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#72bc21] to-[#5aa017] rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black">
                  HE Feuille
                </h3>
                <p className="text-xs text-gray-700">Production</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-4xl font-bold text-black mb-4">{data.heFeuilles} kg</p>
              <Badge 
                variant="outline" 
                className="bg-[#72bc21]/10 text-black border-[#72bc21] text-sm px-4 py-1"
              >
                Stock disponible
              </Badge>
            </div>

            <div className="mt-6 p-3 bg-[#72bc21]/5 rounded-lg border border-[#72bc21]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Pourcentage total</span>
                <span className="font-semibold text-black">
                  {totalHE > 0 ? ((data.heFeuilles / totalHE) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                <div 
                  className="bg-[#72bc21] h-2 rounded-full" 
                  style={{ 
                    width: totalHE > 0 ? `${(data.heFeuilles / totalHE) * 100}%` : '0%' 
                  }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HE Griffe */}
        <Card className="border border-[#72bc21] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4a9014] to-[#3a8010] rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black">
                  HE Griffe
                </h3>
                <p className="text-xs text-gray-700">Production</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-4xl font-bold text-black mb-4">{data.heGriffes} kg</p>
              <Badge 
                variant="outline" 
                className="bg-[#4a9014]/10 text-black border-[#72bc21] text-sm px-4 py-1"
              >
                Stock disponible
              </Badge>
            </div>

            <div className="mt-6 p-3 bg-[#4a9014]/5 rounded-lg border border-[#72bc21]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Pourcentage total</span>
                <span className="font-semibold text-black">
                  {totalHE > 0 ? ((data.heGriffes / totalHE) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                <div 
                  className="bg-[#4a9014] h-2 rounded-full" 
                  style={{ 
                    width: totalHE > 0 ? `${(data.heGriffes / totalHE) * 100}%` : '0%' 
                  }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HE Clous */}
        <Card className="border border-[#72bc21] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#a8d466] to-[#98c456] rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black">
                  HE Clous
                </h3>
                <p className="text-xs text-gray-700">Production</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-4xl font-bold text-black mb-4">{data.heClous} kg</p>
              <Badge 
                variant="outline" 
                className="bg-[#a8d466]/10 text-black border-[#72bc21] text-sm px-4 py-1"
              >
                Stock disponible
              </Badge>
            </div>

            <div className="mt-6 p-3 bg-[#a8d466]/5 rounded-lg border border-[#72bc21]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Pourcentage total</span>
                <span className="font-semibold text-black">
                  {totalHE > 0 ? ((data.heClous / totalHE) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                <div 
                  className="bg-[#a8d466] h-2 rounded-full" 
                  style={{ 
                    width: totalHE > 0 ? `${(data.heClous / totalHE) * 100}%` : '0%' 
                  }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section RÉSUMÉ DE PRODUCTION - Stock restant */}
      <Card className="border border-[#72bc21] shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#72bc21] to-[#5aa017] rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">RÉSUMÉ DE PRODUCTION</h2>
              <p className="text-sm text-gray-700">Stock restant : Feuilles / Clous / Griffes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stock restant Feuilles */}
            <Card className="border border-[#72bc21] bg-gradient-to-r from-[#72bc21]/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#72bc21]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Feuilles</h3>
                <p className="text-3xl font-bold text-black mb-3">{data.stockFeuilles} kg</p>
                <Badge variant="outline" className="bg-[#72bc21]/20 text-black border-[#72bc21] text-sm">
                  Stock restant
                </Badge>
                <div className="mt-4 w-full bg-gray-300 rounded-full h-2">
                  <div className="bg-[#72bc21] h-2 rounded-full" style={{ 
                    width: totalStock > 0 ? `${(data.stockFeuilles / totalStock) * 100}%` : '0%' 
                  }} />
                </div>
                <p className="text-xs text-gray-700 mt-2">
                  {totalStock > 0 ? ((data.stockFeuilles / totalStock) * 100).toFixed(1) : 0}% du stock total
                </p>
              </CardContent>
            </Card>

            {/* Stock restant Clous */}
            <Card className="border border-[#72bc21] bg-gradient-to-r from-[#a8d466]/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#a8d466]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Clous</h3>
                <p className="text-3xl font-bold text-black mb-3">{data.stockClous} kg</p>
                <Badge variant="outline" className="bg-[#a8d466]/20 text-black border-[#72bc21] text-sm">
                  Stock restant
                </Badge>
                <div className="mt-4 w-full bg-gray-300 rounded-full h-2">
                  <div className="bg-[#a8d466] h-2 rounded-full" style={{ 
                    width: totalStock > 0 ? `${(data.stockClous / totalStock) * 100}%` : '0%' 
                  }} />
                </div>
                <p className="text-xs text-gray-700 mt-2">
                  {totalStock > 0 ? ((data.stockClous / totalStock) * 100).toFixed(1) : 0}% du stock total
                </p>
              </CardContent>
            </Card>

            {/* Stock restant Griffes */}
            <Card className="border border-[#72bc21] bg-gradient-to-r from-[#4a9014]/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#4a9014]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sprout className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Griffes</h3>
                <p className="text-3xl font-bold text-black mb-3">{data.stockGriffes} kg</p>
                <Badge variant="outline" className="bg-[#4a9014]/20 text-black border-[#72bc21] text-sm">
                  Stock restant
                </Badge>
                <div className="mt-4 w-full bg-gray-300 rounded-full h-2">
                  <div className="bg-[#4a9014] h-2 rounded-full" style={{ 
                    width: totalStock > 0 ? `${(data.stockGriffes / totalStock) * 100}%` : '0%' 
                  }} />
                </div>
                <p className="text-xs text-gray-700 mt-2">
                  {totalStock > 0 ? ((data.stockGriffes / totalStock) * 100).toFixed(1) : 0}% du stock total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Résumé global */}
          <div className="mt-6 p-4 bg-[#72bc21]/5 rounded-xl border border-[#72bc21]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#72bc21] rounded-full flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    Total stock huile essentielle : <strong className="text-black">{totalHE} kg</strong>
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    Total stock matière première : <strong className="text-black">{totalStock} kg</strong>
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-700">Usine sélectionnée</p>
                <p className="text-lg font-bold text-black">
                  {selectedUsine === "all" ? "Toutes les usines" : 
                   selectedUsine === "pk12" ? "PK 12" : "Makomby"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InfosDistillation