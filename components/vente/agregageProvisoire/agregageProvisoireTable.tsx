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
  MoreHorizontal, Eye, Search, FileDown, Edit, Trash2, 
  Package, User, Calendar, FlaskRound, Plus, UserPlus, Clock, CheckCircle
} from "lucide-react"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import TestProvisoireModal from "./modals/TestProvisoireModal"
import NouveauClientModal from "./modals/NouveauClientModal"

const COLOR = "#76bc21"

interface Client {
  id: number
  nom: string
  contact: string
  cin?: string
  entreprise?: string
  typeClient: "Local" | "Etranger"
}

interface TestProvisoire {
  id: number
  reference: string
  dateDebutTest: string
  clientId: number
  poidsTeste: number
  typeHE: "HE Feuilles" | "HE Clous" | "HE Griffes"
  status: "En cours du test" | "Test terminé" | "En attente"
}

// Données de démonstration
const clientsData: Client[] = [
  {
    id: 1,
    nom: "Jean Dupont",
    contact: "034 12 345 67",
    cin: "101234567890",
    entreprise: "Dupont SARL",
    typeClient: "Local"
  },
  {
    id: 2,
    nom: "Maria Silva",
    contact: "+351 912 345 678",
    entreprise: "Silva Export",
    typeClient: "Etranger"
  },
  {
    id: 3,
    nom: "Rakoto Andrian",
    contact: "032 11 223 34",
    cin: "102233445566",
    typeClient: "Local"
  },
  {
    id: 4,
    nom: "Zhang Wei",
    contact: "+86 138 0013 8000",
    entreprise: "China Imports",
    typeClient: "Etranger"
  }
]

const testProvisoireData: (TestProvisoire & { client: Client })[] = [
  {
    id: 1,
    reference: "TEST-2024-001",
    dateDebutTest: "2024-01-15",
    clientId: 1,
    poidsTeste: 2.5,
    typeHE: "HE Feuilles",
    status: "En cours du test",
    client: clientsData[0]
  },
  {
    id: 2,
    reference: "TEST-2024-002",
    dateDebutTest: "2024-01-14",
    clientId: 2,
    poidsTeste: 1.8,
    typeHE: "HE Clous",
    status: "Test terminé",
    client: clientsData[1]
  },
  {
    id: 3,
    reference: "TEST-2024-003",
    dateDebutTest: "2024-01-16",
    clientId: 3,
    poidsTeste: 3.2,
    typeHE: "HE Griffes",
    status: "En cours du test",
    client: clientsData[2]
  },
  {
    id: 4,
    reference: "TEST-2024-004",
    dateDebutTest: "2024-01-13",
    clientId: 4,
    poidsTeste: 2.0,
    typeHE: "HE Feuilles",
    status: "En attente",
    client: clientsData[3]
  },
  {
    id: 5,
    reference: "TEST-2024-005",
    dateDebutTest: "2024-01-12",
    clientId: 1,
    poidsTeste: 1.5,
    typeHE: "HE Clous",
    status: "Test terminé",
    client: clientsData[0]
  },
  {
    id: 6,
    reference: "TEST-2024-006",
    dateDebutTest: "2024-01-17",
    clientId: 2,
    poidsTeste: 2.8,
    typeHE: "HE Griffes",
    status: "En cours du test",
    client: clientsData[1]
  }
]

const AgregageProvisoireTable: React.FC = () => {
  const [tests, setTests] = useState<(TestProvisoire & { client: Client })[]>(testProvisoireData)
  const [clients, setClients] = useState<Client[]>(clientsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDetail, setShowDetail] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState<(TestProvisoire & { client: Client }) | null>(null)
  const [searchClient, setSearchClient] = useState("")

  const filteredTests = useMemo(() => {
    if (!searchTerm.trim()) return tests

    const lower = searchTerm.toLowerCase()
    return tests.filter(
      (test) =>
        test.reference.toLowerCase().includes(lower) ||
        test.client.nom.toLowerCase().includes(lower) ||
        test.typeHE.toLowerCase().includes(lower) ||
        test.client.typeClient.toLowerCase().includes(lower) ||
        test.status.toLowerCase().includes(lower)
    )
  }, [tests, searchTerm])

  const filteredClients = useMemo(() => {
    if (!searchClient.trim()) return clients
    const lower = searchClient.toLowerCase()
    return clients.filter(
      (client) =>
        client.nom.toLowerCase().includes(lower) ||
        client.contact.toLowerCase().includes(lower) ||
        (client.cin && client.cin.toLowerCase().includes(lower)) ||
        (client.entreprise && client.entreprise.toLowerCase().includes(lower))
    )
  }, [clients, searchClient])

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" })

    doc.setFontSize(18)
    doc.setTextColor(COLOR)
    doc.text("Tableau des Tests Provisoires", 14, 20)

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
      new Date(test.dateDebutTest).toLocaleDateString("fr-FR"),
      test.client.nom,
      `${test.poidsTeste.toLocaleString("fr-FR")} kg`,
      test.typeHE,
      test.client.typeClient,
      test.status
    ])

    autoTable(doc, {
      head: [
        [
          "Référence",
          "Date début test",
          "Nom Client",
          "Poids testé",
          "Type HE",
          "Type Client",
          "Status"
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
      `Total : ${filteredTests.length} test${filteredTests.length > 1 ? "s" : ""}`,
      14,
      finalY + 10
    )

    doc.save(`tests_provisoires_${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success("PDF généré avec succès !")
  }

  const handleVoir = (test: TestProvisoire & { client: Client }) => {
    setSelectedTest(test)
    setShowDetail(true)
  }

  const handleModifier = (test: TestProvisoire & { client: Client }) => {
    setSelectedTest(test)
    setShowTestModal(true)
  }

  const handleSupprimer = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce test ?")) {
      setTests(prev => prev.filter(test => test.id !== id))
      toast.success("Test supprimé avec succès !")
    }
  }

  const handleTerminerTest = (id: number) => {
    setTests(prev =>
      prev.map((test) => 
        test.id === id ? { ...test, status: "Test terminé" } : test
      )
    )
    toast.success("Test marqué comme terminé !")
  }

  const handleDemarrerTest = (id: number) => {
    setTests(prev =>
      prev.map((test) => 
        test.id === id ? { ...test, status: "En cours du test" } : test
      )
    )
    toast.success("Test démarré !")
  }

  const handleAjouterTest = (data: any) => {
    const client = clients.find(c => c.id === data.clientId)
    if (!client) {
      toast.error("Client non trouvé !")
      return
    }

    const newTest: TestProvisoire & { client: Client } = {
      id: tests.length + 1,
      reference: `TEST-${new Date().getFullYear()}-${String(tests.length + 1).padStart(3, '0')}`,
      dateDebutTest: data.date,
      clientId: data.clientId,
      poidsTeste: Number(data.poids),
      typeHE: data.typeHE,
      status: "En cours du test",
      client: client
    }
    
    setTests(prev => [...prev, newTest])
    toast.success("Test provisoire ajouté avec succès !")
  }

  const handleModifierTest = (data: any) => {
    if (!selectedTest) return

    const client = clients.find(c => c.id === data.clientId)
    if (!client) {
      toast.error("Client non trouvé !")
      return
    }

    setTests(prev =>
      prev.map((test) =>
        test.id === selectedTest.id
          ? {
              ...test,
              dateDebutTest: data.date,
              clientId: data.clientId,
              poidsTeste: Number(data.poids),
              typeHE: data.typeHE,
              client: client
            }
          : test
      )
    )
    toast.success("Test modifié avec succès !")
  }

  const handleAjouterClient = (data: any) => {
    const newClient: Client = {
      id: clients.length + 1,
      nom: data.nom,
      contact: data.contact,
      cin: data.cin,
      entreprise: data.entreprise,
      typeClient: data.typeClient
    }
    
    setClients(prev => [...prev, newClient])
    toast.success("Client ajouté avec succès !")
  }

  const hasNoData = tests.length === 0
  const hasResults = filteredTests.length > 0

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "En cours du test":
        return <Clock className="h-3 w-3" />
      case "Test terminé":
        return <CheckCircle className="h-3 w-3" />
      case "En attente":
        return <Clock className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En cours du test":
        return "bg-yellow-100 text-yellow-800"
      case "Test terminé":
        return "bg-green-100 text-green-800"
      case "En attente":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold" style={{ color: COLOR }}>
          Tests Provisoires
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowTestModal(true)}
              className="text-white"
              style={{ backgroundColor: COLOR }}
            >
              <Plus className="h-4 w-4 mr-2" /> Nouveau Test
            </Button>
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

      {/* Recherche client pour le modal */}
      {showTestModal && (
        <TestProvisoireModal
          onClose={() => {
            setShowTestModal(false)
            setSelectedTest(null)
          }}
          onSave={selectedTest ? handleModifierTest : handleAjouterTest}
          clients={filteredClients}
          searchClient={searchClient}
          onSearchClient={setSearchClient}
          onAddClient={() => setShowClientModal(true)}
          initialData={selectedTest ? {
            date: selectedTest.dateDebutTest,
            clientId: selectedTest.clientId,
            poids: selectedTest.poidsTeste.toString(),
            typeHE: selectedTest.typeHE
          } : undefined}
        />
      )}

      {/* Modal nouveau client */}
      {showClientModal && (
        <NouveauClientModal
          onClose={() => setShowClientModal(false)}
          onSave={handleAjouterClient}
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
                Date début test
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
                Type Client
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Status
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
                    <div className="text-6xl mb-4">🧪</div>
                    <p className="text-lg font-medium">
                      {hasNoData
                        ? "Aucun test provisoire enregistré"
                        : "Aucun résultat pour votre recherche"}
                    </p>
                    <Button
                      onClick={() => setShowTestModal(true)}
                      className="mt-4 text-white"
                      style={{ backgroundColor: COLOR }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Ajouter un test
                    </Button>
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
                      {new Date(test.dateDebutTest).toLocaleDateString("fr-FR")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{test.client.nom}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {test.poidsTeste.toLocaleString("fr-FR")} kg
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {test.typeHE === "HE Feuilles" ? (
                        <Package className="h-4 w-4 text-green-600" />
                      ) : test.typeHE === "HE Clous" ? (
                        <Package className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Package className="h-4 w-4 text-amber-600" />
                      )}
                      <span>{test.typeHE}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        test.client.typeClient === "Local"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {test.client.typeClient}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}
                    >
                      {getStatusIcon(test.status)}
                      {test.status}
                    </span>
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
                        <DropdownMenuItem onClick={() => handleModifier(test)}>
                          <Edit className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Modifier
                        </DropdownMenuItem>
                        
                        {test.status === "En cours du test" && (
                          <DropdownMenuItem
                            onClick={() => handleTerminerTest(test.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Terminer le test
                          </DropdownMenuItem>
                        )}

                        {test.status === "En attente" && (
                          <DropdownMenuItem
                            onClick={() => handleDemarrerTest(test.id)}
                            className="text-blue-600"
                          >
                            <Clock className="mr-2 h-4 w-4" /> Démarrer le test
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => handleSupprimer(test.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
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
            <div className="text-6xl mb-4">🧪</div>
            <p className="text-lg font-medium">
              {hasNoData ? "Aucun test" : "Aucun résultat"}
            </p>
            <Button
              onClick={() => setShowTestModal(true)}
              className="mt-4 text-white"
              style={{ backgroundColor: COLOR }}
            >
              <Plus className="h-4 w-4 mr-2" /> Ajouter un test
            </Button>
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
                      {new Date(test.dateDebutTest).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium">{test.client.nom}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(test.status)}`}
                  >
                    {getStatusIcon(test.status)}
                    {test.status}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    test.client.typeClient === "Local"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {test.client.typeClient}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type HE</span>
                  <div className="flex items-center gap-2">
                    {test.typeHE === "HE Feuilles" ? (
                      <Package className="h-4 w-4 text-green-600" />
                    ) : test.typeHE === "HE Clous" ? (
                      <Package className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Package className="h-4 w-4 text-amber-600" />
                    )}
                    <span className="font-medium">{test.typeHE}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Poids testé</span>
                  <span className="font-semibold">{test.poidsTeste.toLocaleString("fr-FR")} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact client</span>
                  <span className="font-medium">{test.client.contact}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button size="sm" variant="outline" onClick={() => handleVoir(test)}>
                  <Eye className="h-4 w-4 mr-1" /> Voir
                </Button>
                
                {test.status === "En cours du test" ? (
                  <Button
                    size="sm"
                    className="border-green-600 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleTerminerTest(test.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Terminer
                  </Button>
                ) : test.status === "En attente" ? (
                  <Button
                    size="sm"
                    className="border-blue-600 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleDemarrerTest(test.id)}
                  >
                    <Clock className="h-4 w-4 mr-1" /> Démarrer
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleModifier(test)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Modifier
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
                  <h3 className="text-xl font-bold text-[#76bc21]">Détails du test provisoire</h3>
                  <p className="text-gray-500">{selectedTest.reference}</p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
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
                    <p className="text-sm text-gray-500">Date début test</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <p className="font-medium">
                        {new Date(selectedTest.dateDebutTest).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type HE</p>
                    <div className="flex items-center gap-2">
                      {selectedTest.typeHE === "HE Feuilles" ? (
                        <Package className="h-5 w-5 text-green-600" />
                      ) : selectedTest.typeHE === "HE Clous" ? (
                        <Package className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Package className="h-5 w-5 text-amber-600" />
                      )}
                      <p className="font-medium">{selectedTest.typeHE}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Poids testé</p>
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

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-lg text-gray-800 mb-3">Informations client</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Nom</span>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{selectedTest.client.nom}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Contact</span>
                      <span className="font-medium">{selectedTest.client.contact}</span>
                    </div>
                    {selectedTest.client.cin && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">CIN</span>
                        <span className="font-medium">{selectedTest.client.cin}</span>
                      </div>
                    )}
                    {selectedTest.client.entreprise && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Entreprise</span>
                        <span className="font-medium">{selectedTest.client.entreprise}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Type client</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          selectedTest.client.typeClient === "Local"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {selectedTest.client.typeClient}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 flex gap-3">
                  <Button
                    onClick={() => setShowDetail(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                  
                  {selectedTest.status === "En cours du test" && (
                    <Button
                      onClick={() => {
                        handleTerminerTest(selectedTest.id)
                        setShowDetail(false)
                      }}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Terminer
                    </Button>
                  )}

                  {selectedTest.status === "En attente" && (
                    <Button
                      onClick={() => {
                        handleDemarrerTest(selectedTest.id)
                        setShowDetail(false)
                      }}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Clock className="h-4 w-4 mr-2" /> Démarrer
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      setShowDetail(false)
                      handleModifier(selectedTest)
                    }}
                    className="flex-1 text-white"
                    style={{ backgroundColor: COLOR }}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Modifier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgregageProvisoireTable