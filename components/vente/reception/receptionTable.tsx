"use client"

import React, { useState, useMemo, useEffect } from "react"
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
  MoreHorizontal, Eye, Search, FileDown, CheckCircle, Clock, 
  Truck, Package, CheckCheck, X
} from "lucide-react"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const COLOR = "#76bc21"

interface TableReception {
  id: number
  reference: string
  typeHE: string
  quantite: number
  status: "en attente" | "receptionné"
  dateArrivee: string
  lieu: string
}

const receptionData: TableReception[] = [
  {
    id: 1,
    reference: "REC-2024-001",
    typeHE: "HE Feuilles",
    quantite: 150,
    status: "en attente",
    dateArrivee: "2024-01-15",
    lieu: "Manakara",
  },
  {
    id: 2,
    reference: "REC-2024-002",
    typeHE: "HE Clous",
    quantite: 85,
    status: "receptionné",
    dateArrivee: "2024-01-14",
    lieu: "Manakara",
  },
  {
    id: 3,
    reference: "REC-2024-003",
    typeHE: "HE Griffes",
    quantite: 45,
    status: "en attente",
    dateArrivee: "2024-01-16",
    lieu: "Manakara",
  },
  {
    id: 4,
    reference: "REC-2024-004",
    typeHE: "HE Feuilles",
    quantite: 200,
    status: "receptionné",
    dateArrivee: "2024-01-13",
    lieu: "Manakara",
  },
  {
    id: 5,
    reference: "REC-2024-005",
    typeHE: "HE Clous",
    quantite: 120,
    status: "receptionné",
    dateArrivee: "2024-01-12",
    lieu: "Manakara",
  },
  {
    id: 6,
    reference: "REC-2024-006",
    typeHE: "HE Griffes",
    quantite: 60,
    status: "en attente",
    dateArrivee: "2024-01-17",
    lieu: "Manakara",
  },
]

import { getReceptions, marquerReceptionne, marquerAnnule } from '@/lib/vente/vente-api'
import type { Reception as ApiReception } from '@/lib/vente/vente-type'

const ReceptionTable: React.FC = () => {
  const [receptions, setReceptions] = useState<TableReception[]>(receptionData)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDetail, setShowDetail] = useState(false)
  const [selectedReception, setSelectedReception] = useState<TableReception | null>(null)

  const filteredReceptions = useMemo(() => {
    if (!searchTerm.trim()) return receptions

    const lower = searchTerm.toLowerCase()
    return receptions.filter(
      (rec) =>
        rec.reference.toLowerCase().includes(lower) ||
        rec.typeHE.toLowerCase().includes(lower) ||
        rec.status.includes(lower) ||
        rec.lieu.toLowerCase().includes(lower)
    )
  }, [receptions, searchTerm])

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      setLoading(true)
    const res = await getReceptions()
      setLoading(false)
  if ((res as any)?.success && Array.isArray((res as any).data)) {
        if (!mounted) return
  const mapped = (res as any).data.map((r: ApiReception) => {
          // mapper les champs API vers l'UI
          const info = (r as any).informations_source || {}
          const reference = info.nom ? `${info.nom}` : `Réception ${r.id}`
          const typeHE = info.type_produit || info.type_matiere || (r.ficheLivraison?.type_produit ?? r.transport?.type_matiere) || '—'
          const quantite = r.quantite_recue ?? 0
          const dateArrivee = r.date_reception ?? info.date_livraison ?? r.created_at ?? ''
          const lieu = r.lieu_reception ?? info.destination ?? '—'

          return {
            id: r.id,
            reference,
            typeHE,
            quantite,
            status: r.statut === 'receptionne' ? 'receptionné' : (r.statut ?? 'en attente'),
            dateArrivee,
            lieu,
          }
        })
        setReceptions(mapped)
      } else {
        toast.error((res as any)?.message || 'Erreur lors de la récupération des réceptions')
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [])

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" })

    doc.setFontSize(18)
    doc.setTextColor(COLOR)
    doc.text("Tableau des Réceptions", 14, 20)

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

    const tableData = filteredReceptions.map((rec) => [
      rec.reference,
      rec.typeHE,
      `${rec.quantite.toLocaleString("fr-FR")} kg`,
      rec.status === "receptionné" ? "Réceptionné" : "En attente",
      new Date(rec.dateArrivee).toLocaleDateString("fr-FR"),
      rec.lieu,
    ])

    autoTable(doc, {
      head: [
        [
          "Référence",
          "Type de HE",
          "Quantité",
          "Statut",
          "Date d'arrivée",
          "Lieu",
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
      `Total : ${filteredReceptions.length} réception${filteredReceptions.length > 1 ? "s" : ""}`,
      14,
      finalY + 10
    )

    doc.save(`receptions_${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success("PDF généré avec succès !")
  }

  const handleVoir = (reception: TableReception) => {
    setSelectedReception(reception)
    setShowDetail(true)
  }

  const handleReceptionner = async (id: number) => {
    const res = await marquerReceptionne(id)
    if ((res as any)?.success) {
      setReceptions(prev => prev.map(r => r.id === id ? { ...r, status: 'receptionné' } : r))
      toast.success((res as any).message || 'Réception marquée comme réceptionnée')
    } else {
      const backendMessage = (res as any)?.message || (res as any)?.error?.message || JSON.stringify((res as any)?.error || '')
      toast.error(backendMessage || 'Erreur lors du marquage')
    }
  }

  const handleAnnulerReception = async (id: number) => {
    // ici on utilise l'API pour annuler
    const res = await marquerAnnule(id as any, { raison: 'Réouverture via UI' })
    if ((res as any)?.success) {
      setReceptions(prev => prev.map(r => r.id === id ? { ...r, status: 'en attente' } : r))
      toast.warning((res as any).message || 'Réception remise en attente')
    } else {
      const backendMessage = (res as any)?.message || (res as any)?.error?.message || JSON.stringify((res as any)?.error || '')
      toast.error(backendMessage || "Erreur lors de l'annulation")
    }
  }

  const hasNoData = receptions.length === 0
  const hasResults = filteredReceptions.length > 0

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold" style={{ color: COLOR }}>
          Réceptions de produits
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une réception..."
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

      {/* Tableau Desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-linear-to-r from-[#76bc21]/10 via-[#76bc21]/5 to-[#76bc21]/10">
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Référence
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Type de HE
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Quantité (kg)
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Statut
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Date d'arrivée
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Lieu
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasResults ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-lg font-medium">
                      {hasNoData
                        ? "Aucune réception enregistrée"
                        : "Aucun résultat pour votre recherche"}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {searchTerm
                        ? "Essayez avec d'autres termes"
                        : "Toutes les réceptions sont traitées"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredReceptions.map((rec, index) => (
                <TableRow
                  key={rec.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50/30" : "bg-white"
                  }`}
                >
                  <TableCell className="font-medium text-gray-900">
                    {rec.reference}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {rec.typeHE === "HE Feuilles" ? (
                        <Package className="h-4 w-4 text-green-600" />
                      ) : rec.typeHE === "HE Clous" ? (
                        <Package className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Package className="h-4 w-4 text-amber-600" />
                      )}
                      {rec.typeHE}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {rec.quantite.toLocaleString("fr-FR")} kg
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        rec.status === "receptionné"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {rec.status === "receptionné" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {rec.status === "receptionné" ? "Réceptionné" : "En attente"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(rec.dateArrivee).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-500" />
                      {rec.lieu}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleVoir(rec)}>
                          <Eye className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Voir détails
                        </DropdownMenuItem>

                        {rec.status === "en attente" && (
                          <DropdownMenuItem
                            onClick={() => handleReceptionner(rec.id)}
                            className="text-green-600"
                          >
                            <CheckCheck className="mr-2 h-4 w-4" /> Valider la réception
                          </DropdownMenuItem>
                        )}

                        {rec.status === "receptionné" && (
                          <DropdownMenuItem
                            onClick={() => handleAnnulerReception(rec.id)}
                            className="text-amber-600"
                          >
                            <X className="mr-2 h-4 w-4" /> Remettre en attente
                          </DropdownMenuItem>
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
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-medium">
              {hasNoData ? "Aucune réception" : "Aucun résultat"}
            </p>
          </div>
        ) : (
          filteredReceptions.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-lg text-gray-900">{rec.reference}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {rec.typeHE === "HE Feuilles" ? (
                      <Package className="h-4 w-4 text-green-600" />
                    ) : rec.typeHE === "HE Clous" ? (
                      <Package className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Package className="h-4 w-4 text-amber-600" />
                    )}
                    <p className="text-sm text-gray-600">{rec.typeHE}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                      rec.status === "receptionné"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {rec.status === "receptionné" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {rec.status === "receptionné" ? "Réceptionné" : "En attente"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantité</span>
                  <span className="font-semibold">{rec.quantite.toLocaleString("fr-FR")} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date d'arrivée</span>
                  <span className="font-medium">{new Date(rec.dateArrivee).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lieu</span>
                  <div className="flex items-center gap-1">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{rec.lieu}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button size="sm" variant="outline" onClick={() => handleVoir(rec)}>
                  <Eye className="h-4 w-4 mr-1" /> Voir
                </Button>

                {rec.status === "en attente" ? (
                  <Button
                    size="sm"
                    className="border-[#76bc21] bg-[#76bc21] hover:bg-[#65a91d] text-white"
                    onClick={() => handleReceptionner(rec.id)}
                  >
                    <CheckCheck className="h-4 w-4 mr-1" /> Valider
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-600 border-amber-600 hover:bg-amber-50"
                    onClick={() => handleAnnulerReception(rec.id)}
                  >
                    <X className="h-4 w-4 mr-1" /> Réattente
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Détails */}
      {showDetail && selectedReception && (
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
                  <h3 className="text-xl font-bold text-[#76bc21]">Détails de la réception</h3>
                  <p className="text-gray-500">{selectedReception.reference}</p>
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
                    <p className="font-medium">{selectedReception.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type de HE</p>
                    <div className="flex items-center gap-2">
                      {selectedReception.typeHE === "HE Feuilles" ? (
                        <Package className="h-5 w-5 text-green-600" />
                      ) : selectedReception.typeHE === "HE Clous" ? (
                        <Package className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Package className="h-5 w-5 text-amber-600" />
                      )}
                      <p className="font-medium">{selectedReception.typeHE}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quantité</p>
                    <p className="font-bold text-lg">
                      {selectedReception.quantite.toLocaleString("fr-FR")} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date d'arrivée</p>
                    <p className="font-bold text-lg">
                      {new Date(selectedReception.dateArrivee).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Lieu</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Truck className="h-5 w-5 text-gray-600" />
                    <p className="font-medium">{selectedReception.lieu}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mt-1 ${
                      selectedReception.status === "receptionné"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedReception.status === "receptionné" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                    {selectedReception.status === "receptionné" ? "Réceptionné" : "En attente"}
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
                  
                  {selectedReception.status === "en attente" ? (
                    <Button
                      onClick={() => {
                        handleReceptionner(selectedReception.id)
                        setShowDetail(false)
                      }}
                      className="flex-1 text-white"
                      style={{ backgroundColor: COLOR }}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" /> Valider
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        handleAnnulerReception(selectedReception.id)
                        setShowDetail(false)
                      }}
                      variant="outline"
                      className="flex-1 text-amber-600 border-amber-600 hover:bg-amber-50"
                    >
                      <X className="h-4 w-4 mr-2" /> Réattente
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

export default ReceptionTable