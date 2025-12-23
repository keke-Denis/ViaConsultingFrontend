"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Warehouse } from "lucide-react"

export default function StockProduitFiniPage() {
  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-900">Stock de Produit Fini</h1>
          <p className="text-green-700">Suivi détaillé du stock de produits finis</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Warehouse className="w-5 h-5" /> Total en stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">2,450 L</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Package className="w-5 h-5" /> Références
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700">3</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Inventaire</CardTitle>
            <CardDescription className="text-green-700">Liste détaillée du stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-green-600">Aucun article en stock</div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
