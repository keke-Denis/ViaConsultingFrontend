"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ship, Globe } from "lucide-react"

export default function ExportationPage() {
  return (
    <ProtectedLayout allowedRoles={["admin", "vendeur"]}>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-900">Exportation</h1>
          <p className="text-green-700">Gestion des exportations internationales</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Ship className="w-5 h-5" /> En cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">4</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Globe className="w-5 h-5" /> Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700">12</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Expéditions</CardTitle>
            <CardDescription className="text-green-700">Suivi des exportations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-green-600">Aucune exportation en cours</div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
