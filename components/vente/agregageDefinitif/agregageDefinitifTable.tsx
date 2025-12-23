"use client"

import React, { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, Eye, Search, FileDown, CheckCircle, XCircle, 
  Package, User, Calendar, Droplets, Plus, DollarSign, Scale,
  Clock, AlertCircle, Loader2, CreditCard
} from "lucide-react"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import ValidationTestModal from "./modals/ValidationTestModal"
import PaiementModal from "./modals/PaiementModal"

const COLOR = "#76bc21"

interface TestDefinitif {
  id: number
  reference: string
  dateValidation: string
  clientNom: string
  typeHE: "HE Feuilles" | "HE Clous" | "HE Griffes"
  poidsTeste: number
  status: "En attente de validation" | "Validé" | "Refusé"
  prixUnitaire?: number
  poidsFinal?: number
  dateFacturation?: string
  prixTotal?: number
}

// Données de démonstration
const testsDefinitifsData: TestDefinitif[] = [
  {
    id: 1,
    reference: "DEF-2024-001",
    dateValidation: "2024-01-15",
    clientNom: "Jean Dupont",
    typeHE: "HE Feuilles",
    poidsTeste: 85,
    status: "Validé",
    prixUnitaire: 50000,
    poidsFinal: 85,
    dateFacturation: "2024-01-20",
    prixTotal: 4250000
  },
  {
    id: 2,
    reference: "DEF-2024-002",
    dateValidation: "2024-01-14",
    clientNom: "Maria Silva",
    typeHE: "HE Clous",
    poidsTeste: 32,
    status: "Refusé",
    prixUnitaire: 70000,
    poidsFinal: 0,
    prixTotal: 0
  },
  {
    id: 3,
    reference: "DEF-2024-003",
    dateValidation: "2024-01-16",
    clientNom: "Rakoto Andrian",
    typeHE: "HE Griffes",
    poidsTeste: 18,
    status: "En attente de validation",
  },
  {
    id: 4,
    reference: "DEF-2024-004",
    dateValidation: "2024-01-13",
    clientNom: "Zhang Wei",
    typeHE: "HE Feuilles",
    poidsTeste: 45,
    status: "Validé",
    prixUnitaire: 52000,
    poidsFinal: 45,
    dateFacturation: "2024-01-18",
    prixTotal: 2340000
  },
  {
    id: 5,
    reference: "DEF-2024-005",
    dateValidation: "2024-01-12",
    clientNom: "Jean Dupont",
    typeHE: "HE Clous",
    poidsTeste: 28,
    status: "En attente de validation",
  },
  {
    id: 6,
    reference: "DEF-2024-006",
    dateValidation: "2024-01-17",
    clientNom: "Maria Silva",
    typeHE: "HE Griffes",
    poidsTeste: 22,
    status: "Validé",
    prixUnitaire: 65000,
    poidsFinal: 22,
    dateFacturation: "2024-01-22",
    prixTotal: 1430000
  }
]

const AgregageDefinitifTable: React.FC = () => {
  const [tests, setTests] = useState<TestDefinitif[]>(testsDefinitifsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDetail, setShowDetail] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [showPaiementModal, setShowPaiementModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState<TestDefinitif | null>(null)

  const filteredTests = useMemo(() => {
    if (!searchTerm.trim()) return tests

    const lower = searchTerm.toLowerCase()
    return tests.filter(
      (test) =>
        test.reference.toLowerCase().includes(lower) ||
        test.clientNom.toLowerCase().includes(lower) ||
        test.typeHE.toLowerCase().includes(lower) ||
        test.status.toLowerCase().includes(lower)
    )
  }, [tests, searchTerm])

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" })

    doc.setFontSize(18)
    doc.setTextColor(COLOR)
    doc.text("Tableau des Agrégages Définitifs", 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(
      `Exporté le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      14,
      30
    )

    const tableData = filteredTests.map((test) => [
      test.reference,
      new Date(test.dateValidation).toLocaleDateString("fr-FR"),
      test.clientNom,
      `${test.poidsTeste.toLocaleString("fr-FR")} kg`,
      test.typeHE,
      test.status,
      test.prixTotal ? `${test.prixTotal.toLocaleString("fr-FR")} Ar` : "-",
      test.dateFacturation ? new Date(test.dateFacturation).toLocaleDateString("fr-FR") : "-"
    ])

    autoTable(doc, {
      head: [
        [
          "Référence",
          "Date validation",
          "Nom Client",
          "Poids testé",
          "Type HE",
          "Status",
          "Prix total",
          "Date paiement"
        ],
      ],
      body: tableData,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [118, 188, 33], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    const finalY = (doc as any).lastAutoTable?.finalY || 40
    doc.setFontSize(10)
    doc.text(
      `Total : ${filteredTests.length} agrégat${filteredTests.length > 1 ? "s" : ""}`,
      14,
      finalY + 10
    )

    doc.save(`agregages_definitifs_${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success("PDF généré avec succès !")
  }

  const handleVoir = (test: TestDefinitif) => {
    setSelectedTest(test)
    setShowDetail(true)
  }

  const handleValidation = (test: TestDefinitif) => {
    setSelectedTest(test)
    setShowValidationModal(true)
  }

  const handlePaiement = (test: TestDefinitif) => {
    setSelectedTest(test)
    setShowPaiementModal(true)
  }

  const handleValiderTest = (data: { decision: "Validé" | "Refusé"; commentaire?: string }) => {
    if (!selectedTest) return

    const updatedTest: TestDefinitif = {
      ...selectedTest,
      status: data.decision,
      ...(data.decision === "Refusé" && { 
        poidsFinal: 0,
        prixTotal: 0
      })
    }

    setTests(prev => prev.map(test => 
      test.id === selectedTest.id ? updatedTest : test
    ))

    toast.success(`Test ${data.decision === "Validé" ? "validé" : "refusé"} avec succès !`)
  }

  const handlePaiementSubmit = (data: { prixUnitaire: number; poidsFinal: number }) => {
    if (!selectedTest) return

    const prixTotal = data.prixUnitaire * data.poidsFinal
    const today = new Date().toISOString().split('T')[0]

    const updatedTest: TestDefinitif = {
      ...selectedTest,
      prixUnitaire: data.prixUnitaire,
      poidsFinal: data.poidsFinal,
      prixTotal: prixTotal,
      dateFacturation: today
    }

    setTests(prev => prev.map(test => 
      test.id === selectedTest.id ? updatedTest : test
    ))

    toast.success(`Paiement enregistré pour ${prixTotal.toLocaleString("fr-FR")} Ar !`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "En attente de validation":
        return <Clock className="h-3 w-3" />
      case "Validé":
        return <CheckCircle className="h-3 w-3" />
      case "Refusé":
        return <XCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En attente de validation":
        return "bg-yellow-100 text-yellow-800"
      case "Validé":
        return "bg-green-100 text-green-800"
      case "Refusé":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeHEIcon = (typeHE: string) => {
    switch (typeHE) {
      case "HE Feuilles":
        return <Droplets className="h-4 w-4 text-green-600" />
      case "HE Clous":
        return <Package className="h-4 w-4 text-blue-600" />
      case "HE Griffes":
        return <Package className="h-4 w-4 text-amber-600" />
      default:
        return <Droplets className="h-4 w-4 text-gray-600" />
    }
  }

  const hasNoData = tests.length === 0
  const hasResults = filteredTests.length > 0

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold" style={{ color: COLOR }}>
          Agrégages Définitifs
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un agrégat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToPDF}
              disabled={!hasResults}
              className="hover:border-[#76bc21] hover:text-[#76bc21]"
            >
              <FileDown className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showValidationModal && selectedTest && (
        <ValidationTestModal
          test={selectedTest}
          onClose={() => {
            setShowValidationModal(false)
            setSelectedTest(null)
          }}
          onValidate={handleValiderTest}
        />
      )}

      {showPaiementModal && selectedTest && selectedTest.status === "Validé" && (
        <PaiementModal
          test={selectedTest}
          onClose={() => {
            setShowPaiementModal(false)
            setSelectedTest(null)
          }}
          onSubmit={handlePaiementSubmit}
        />
      )}

      {/* Tableau Desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#76bc21]/10 via-[#76bc21]/5 to-[#76bc21]/10">
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Référence
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Date validation
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Nom Client
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Poids testé (kg)
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Type HE
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Prix total
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasResults ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-lg font-medium">
                      {hasNoData
                        ? "Aucun agrégat définitif enregistré"
                        : "Aucun résultat pour votre recherche"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTests.map((test, index) => (
                <TableRow
                  key={test.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50/30" : "bg-white"
                  }`}
                >
                  <TableCell className="font-medium text-gray-900">
                    {test.reference}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(test.dateValidation).toLocaleDateString("fr-FR")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{test.clientNom}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {test.poidsTeste.toLocaleString("fr-FR")} kg
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeHEIcon(test.typeHE)}
                      <span>{test.typeHE}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}
                    >
                      {getStatusIcon(test.status)}
                      {test.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {test.prixTotal ? (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-700">
                          {test.prixTotal.toLocaleString("fr-FR")} Ar
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleVoir(test)}>
                          <Eye className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Voir détails
                        </DropdownMenuItem>

                        {test.status === "En attente de validation" && (
                          <DropdownMenuItem onClick={() => handleValidation(test)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-yellow-600" /> 
                            Valider/Refuser
                          </DropdownMenuItem>
                        )}

                        {test.status === "Validé" && (
                          <DropdownMenuItem onClick={() => handlePaiement(test)}>
                            <CreditCard className="mr-2 h-4 w-4 text-green-600" /> 
                            Gérer le paiement
                          </DropdownMenuItem>
                        )}

                        {test.status === "Refusé" && (
                          <div className="px-2 py-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-red-600" />
                              Test refusé
                            </div>
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vue Mobile */}
      <div className="lg:hidden space-y-4">
        {!hasResults ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium">
              {hasNoData ? "Aucun agrégat" : "Aucun résultat"}
            </p>
          </div>
        ) : (
          filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-lg text-gray-900">{test.reference}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      {new Date(test.dateValidation).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium">{test.clientNom}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(test.status)}`}
                  >
                    {getStatusIcon(test.status)}
                    {test.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeHEIcon(test.typeHE)}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type HE</span>
                  <span className="font-medium">{test.typeHE}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Poids testé</span>
                  <span className="font-semibold">{test.poidsTeste.toLocaleString("fr-FR")} kg</span>
                </div>
                {test.prixTotal && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prix total</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-700">
                        {test.prixTotal.toLocaleString("fr-FR")} Ar
                      </span>
                    </div>
                  </div>
                )}
                {test.dateFacturation && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date paiement</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {new Date(test.dateFacturation).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button size="sm" variant="outline" onClick={() => handleVoir(test)}>
                  <Eye className="h-4 w-4 mr-1" /> Voir
                </Button>
                
                {test.status === "En attente de validation" ? (
                  <Button
                    size="sm"
                    className="border-yellow-600 bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={() => handleValidation(test)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Valider
                  </Button>
                ) : test.status === "Validé" ? (
                  <Button
                    size="sm"
                    className="border-green-600 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handlePaiement(test)}
                  >
                    <CreditCard className="h-4 w-4 mr-1" /> Paiement
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700"
                    disabled
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Refusé
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Détails */}
      {showDetail && selectedTest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#76bc21]">Détails de l'agrégat définitif</h3>
                  <p className="text-gray-500">{selectedTest.reference}</p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-700 text-2xl leading-none p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Référence</p>
                    <p className="font-medium">{selectedTest.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date validation</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <p className="font-medium">
                        {new Date(selectedTest.dateValidation).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <p className="font-medium">{selectedTest.clientNom}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type HE</p>
                    <div className="flex items-center gap-2">
                      {getTypeHEIcon(selectedTest.typeHE)}
                      <p className="font-medium">{selectedTest.typeHE}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Poids testé</p>
                    <div className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-gray-600" />
                      <p className="font-bold text-lg">
                        {selectedTest.poidsTeste.toLocaleString("fr-FR")} kg
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedTest.status)}`}>
                        {getStatusIcon(selectedTest.status)}
                        {selectedTest.status}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedTest.status === "Validé" && selectedTest.dateFacturation && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Informations de paiement</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Date de paiement</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">
                              {new Date(selectedTest.dateFacturation).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Prix unitaire</p>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold">
                              {selectedTest.prixUnitaire?.toLocaleString("fr-FR")} Ar/kg
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Poids final</p>
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold">
                              {selectedTest.poidsFinal?.toLocaleString("fr-FR")} kg
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Prix total</p>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-lg text-green-700">
                              {selectedTest.prixTotal?.toLocaleString("fr-FR")} Ar
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200 flex gap-3">
                  <Button
                    onClick={() => setShowDetail(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                  
                  {selectedTest.status === "En attente de validation" && (
                    <Button
                      onClick={() => {
                        setShowDetail(false)
                        handleValidation(selectedTest)
                      }}
                      className="flex-1 bg-yellow-600 text-white hover:bg-yellow-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Valider
                    </Button>
                  )}

                  {selectedTest.status === "Validé" && (
                    <Button
                      onClick={() => {
                        setShowDetail(false)
                        handlePaiement(selectedTest)
                      }}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" /> Paiement
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgregageDefinitifTable