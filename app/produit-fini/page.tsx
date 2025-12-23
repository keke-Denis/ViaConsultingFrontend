"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Box } from "lucide-react"

export default function ProduitFiniPage() {
  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-900">Produit Fini</h1>
          <p className="text-green-700">Gestion des stocks de produits finis</p>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <Box className="w-5 h-5" /> Stock Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">2,450 L</p>
            <p className="text-sm text-green-600">+150 L cette semaine</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Détails des stocks</CardTitle>
            <CardDescription className="text-green-700">État du stock de produits finis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 mb-2">Huile Essentielle Clous</p>
                <p className="text-2xl font-bold text-green-900">850 L</p>
              </div>
              <div className="p-4 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 mb-2">Huile Essentielle Griffes</p>
                <p className="text-2xl font-bold text-blue-900">750 L</p>
              </div>
              <div className="p-4 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 mb-2">Huile Essentielle Feuilles</p>
                <p className="text-2xl font-bold text-red-900">850 L</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
