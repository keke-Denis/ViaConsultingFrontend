"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, MapPin, Package } from "lucide-react"

export default function TransportPage() {
  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-900">Gestion Transport</h1>
          <p className="text-green-700">Suivi des livraisons et transports</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Truck className="w-5 h-5" /> En cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">5</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700">8</p>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <Package className="w-5 h-5" /> Livrées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-700">52</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Trajets de transport</CardTitle>
            <CardDescription className="text-green-700">Suivi des livraisons en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-green-600">Aucun trajet en cours</div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
