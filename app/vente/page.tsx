"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, TrendingUp, Package } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function VentePage() {
  return (
    <ProtectedLayout allowedRoles={["admin", "vendeur"]}>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-green-900">Gestion Vente</h1>
            <p className="text-green-700">Gestion des ventes et exportations</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle vente
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Réceptions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">15</div>
              <p className="text-xs text-green-600">+3 cette semaine</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Agrégage Provisoire</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">8</div>
              <p className="text-xs text-blue-600">En cours</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900">Agrégage Définitif</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">12</div>
              <p className="text-xs text-yellow-600">Finalisés</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Exportations</CardTitle>
              <ShoppingCart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">6</div>
              <p className="text-xs text-red-600">Terminées</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Commandes récentes</CardTitle>
            <CardDescription className="text-green-700">Liste des dernières commandes et exportations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-green-200 hover:bg-green-50">
                  <TableHead className="text-green-900">Numéro</TableHead>
                  <TableHead className="text-green-900">Client</TableHead>
                  <TableHead className="text-green-900">Quantité (L)</TableHead>
                  <TableHead className="text-green-900">Date</TableHead>
                  <TableHead className="text-green-900">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-green-200 hover:bg-green-50">
                  <TableCell className="font-medium">CMD-2024-001</TableCell>
                  <TableCell>Client A</TableCell>
                  <TableCell>50</TableCell>
                  <TableCell>2024-11-01</TableCell>
                  <TableCell>
                    <Badge className="bg-green-600">Expédiée</Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="border-green-200 hover:bg-green-50">
                  <TableCell className="font-medium">CMD-2024-002</TableCell>
                  <TableCell>Client B</TableCell>
                  <TableCell>75</TableCell>
                  <TableCell>2024-11-02</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-600">En cours</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
