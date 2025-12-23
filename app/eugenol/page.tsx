"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Droplet, TrendingUp } from "lucide-react"

export default function EugenolPage() {
  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-900">Gestion Eugénol</h1>
          <p className="text-green-700">Suivi du composant actif (Eugénol)</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Leaf className="w-5 h-5" /> Stock Actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">85%</p>
              <p className="text-sm text-green-600">1,020 L</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Droplet className="w-5 h-5" /> Concentration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700">92.3%</p>
              <p className="text-sm text-blue-600">Optimal</p>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Consommation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-700">12.5 L</p>
              <p className="text-sm text-red-600">Cette semaine</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Analyse Eugénol</CardTitle>
            <CardDescription className="text-green-700">Suivi détaillé du composant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-green-600">Aucune donnée disponible</div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
