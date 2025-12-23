"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Eye, Edit, Trash2, FileDown, Search, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState, useEffect, useMemo } from "react"
import CreationFournisseur from './creation-fournisseur'
import ModificationFournisseur from './modification-fournisseur'
import DetailleFournisseur from './detaille-fournisseur'
import SuppressionFournisseur from './suppression-fournisseur'
import { useFournisseur } from "@/contexts/fournisseur/fournisseur-context"
import { useAuth } from "@/contexts/auth-context" 
import { toast } from "react-toastify"
import { localisationAPI } from "@/lib/fournisseur/localisation-api"
import jsPDF from "jspdf"
import "jspdf-autotable"
import autoTable from "jspdf-autotable"

const COLOR = "#76bc21"

export default function TablesFournisseur() {
  const { user } = useAuth()  
  const isAdmin = user?.role === "admin"
  const isCollecteur = user?.role === "collecteur"

  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [localisations, setLocalisations] = useState<any[]>([])
  const [isLoadingLocalisations, setIsLoadingLocalisations] = useState(true)

  const {
    fournisseurs,
    isLoading,
    error,
    getFournisseurs,
    deleteFournisseur,
    clearError,
  } = useFournisseur()

  const selectedFournisseur = selectedId
    ? fournisseurs.find((f) => f.id === selectedId)
    : null

  useEffect(() => {
    if (fournisseurs.length === 0) {
      getFournisseurs()
    }
    loadLocalisations()
  }, [])

  const loadLocalisations = async () => {
    try {
      setIsLoadingLocalisations(true)
      const data = await localisationAPI.getAll()
      setLocalisations(data || [])
    } catch (err) {
      toast.error("Erreur lors du chargement des localisations")
      setLocalisations([])
    } finally {
      setIsLoadingLocalisations(false)
    }
  }

  const filteredFournisseurs = useMemo(() => {
    if (!searchTerm.trim()) return fournisseurs

    const lower = searchTerm.toLowerCase()
    return fournisseurs.filter((f) => {
      return (
        f.identification_fiscale?.toLowerCase().includes(lower) ||
        f.cin?.toLowerCase().includes(lower) ||
        `${f.prenom || ""} ${f.nom || ""}`.toLowerCase().includes(lower) ||
        f.adresse?.toLowerCase().includes(lower) ||
        f.localisation?.Nom?.toLowerCase().includes(lower) ||
        f.contact?.toLowerCase().includes(lower)
      )
    })
  }, [fournisseurs, searchTerm])

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" })

    doc.setFontSize(18)
    doc.setTextColor(COLOR)
    doc.text("Liste des Fournisseurs", 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(
      `Exporté le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
      14,
      30
    )

    const tableData = filteredFournisseurs.map((f) => [
      f.identification_fiscale ?? "",
      f.cin ?? "-",
      `${f.prenom || ""} ${f.nom || ""}`.trim() || "—",
      f.adresse || "-",
      f.localisation?.Nom || "-",
      f.contact || "-",
    ])

    autoTable(doc, {
      head: [["Code fournisseur", "CIN", "Nom complet", "Adresse", "Localisation", "Contact"]],
      body: tableData,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [118, 188, 33], textColor: 255 },
    })

    const finalY = (doc as any).lastAutoTable?.finalY || 40
    doc.setFontSize(10)
    doc.text(
      `Total : ${filteredFournisseurs.length} fournisseur${filteredFournisseurs.length > 1 ? "s" : ""}`,
      14,
      finalY + 10
    )

    doc.save(`fournisseurs_${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success("PDF généré avec succès !")
  }

  const handleVoir = (id: number) => {
    setSelectedId(id)
    setShowDetail(true)
  }
  
  const handleEdit = (id: number) => {
    setSelectedId(id)
    setShowEdit(true)
  }
  
  const handleDeleteOpen = (id: number) => {
    setSelectedId(id)
    setShowDelete(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedId) return

    try {
      const res = await deleteFournisseur(selectedId)
      if (res?.success !== false) {
        toast.success("Fournisseur supprimé")
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la suppression")
    } finally {
      setShowDelete(false)
      setSelectedId(null)
    }
  }

  const handleCreateSuccess = async () => {
    await getFournisseurs()
    setShowModal(false)
  }

  const handleEditSuccess = async () => {
    await getFournisseurs()
    setShowEdit(false)
    setSelectedId(null)
  }

  const hasNoData = !isLoading && fournisseurs.length === 0
  const hasResults = filteredFournisseurs.length > 0

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#76bc21]">
          {isAdmin ? "Suivi de tous les fournisseurs" : "Gestion des fournisseurs"}
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToPDF}
              disabled={isLoading || !hasResults}
              className="hover:border-[#76bc21] hover:text-[#76bc21]"
            >
              <FileDown className="h-4 w-4 mr-2" /> PDF
            </Button>

            {/* Bouton "Ajouter" visible SEULEMENT pour les collecteurs */}
            {isCollecteur && (
              <Button
                onClick={() => setShowModal(true)}
                style={{ backgroundColor: COLOR }}
                className="text-white hover:opacity-90 transition-all hover:scale-[1.02]"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" /> Ajouter un fournisseur
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Note visible SEULEMENT pour les collecteurs */}
      {isCollecteur && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-black">
            <span className="font-semibold">Note :</span> Avant toute opération, veuillez vérifier si le fournisseur existe déjà en recherchant son nom ou son prénom dans le PV de réception ou dans les paiements en avance
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-800 text-sm">{error}</p>
          <button onClick={clearError} className="text-red-600 hover:text-red-800 text-sm">
            Fermer
          </button>
        </div>
      )}

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {!hasResults && !isLoading ? (
          <div className="text-center py-16 text-gray-500 text-lg font-medium">
            {hasNoData ? "Aucun fournisseur trouvé, veuillez en ajouter" : "Aucun résultat pour la recherche"}
          </div>
        ) : (
          filteredFournisseurs.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-lg text-gray-900">{f.identification_fiscale}</p>
                  <p className="text-gray-500 text-xs">Code fournisseur</p>
                  <p className="text-gray-900 font-semibold mt-2">
                    {f.prenom} {f.nom}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Localisation</span>
                  <span className="font-medium">{f.localisation?.Nom || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-medium">{f.contact || "-"}</span>
                </div>
                {f.adresse && (
                  <div>
                    <span className="text-gray-500">Adresse</span>
                    <p className="font-medium mt-1 text-gray-900">{f.adresse}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 gap-2">
                <Button size="sm" variant="outline" onClick={() => handleVoir(f.id)}>
                  <Eye className="h-4 w-4 mr-1" /> Voir
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      size="sm"
                      style={{ backgroundColor: COLOR }}
                      className="text-white"
                      onClick={() => handleEdit(f.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteOpen(f.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#76bc21]/10 via-[#76bc21]/5 to-[#76bc21]/10 border-b-2 border-gray-100">
                  <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">Code fournisseur</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">CIN</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">Nom complet</TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">Adresse</TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">Localisation</TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">Contact</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasResults && !isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl mb-2">Personnes</div>
                    <p className="text-lg font-medium">
                      {hasNoData 
                        ? (isCollecteur ? "Aucun fournisseur trouvé" : "Aucun fournisseur enregistré")
                        : "Aucun résultat pour la recherche"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {searchTerm ? "Essayez avec d'autres termes de recherche" : (isCollecteur ? "Commencez par ajouter votre premier fournisseur" : "")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredFournisseurs.map((f, index) => (
                <TableRow 
                  key={f.id} 
                  className={`hover:bg-gray-50/80 transition-all duration-200 ${
                    index % 2 === 0 ? "bg-gray-50/30" : "bg-white"
                  } border-b border-gray-100 last:border-b-0`}
                >
                  <TableCell className="py-4 font-medium text-gray-900">
                    {f.identification_fiscale}
                  </TableCell>
                  <TableCell className="py-4 font-medium text-gray-900">
                    {f.cin || "-"}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-gray-900 font-medium">
                      {f.prenom} {f.nom}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 max-w-xs">
                    <div className="text-gray-900">
                      <span className="truncate block" title={f.adresse || ""}>
                        {f.adresse || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-gray-900 font-medium">
                      {f.localisation?.Nom || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-gray-900 font-medium">
                      {f.contact || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleVoir(f.id)}>
                          <Eye className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Voir
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(f.id)}>
                              <Edit className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteOpen(f.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </>
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

      {/* Les modals restent inchangés */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CreationFournisseur
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowModal(false)}
              localisations={localisations}
              isLoadingLocalisations={isLoadingLocalisations}
            />
          </div>
        </div>
      )}

      {showDetail && selectedFournisseur && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DetailleFournisseur
              fournisseur={selectedFournisseur}
              onClose={() => setShowDetail(false)}
            />
          </div>
        </div>
      )}

      {showEdit && selectedFournisseur && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ModificationFournisseur
              fournisseur={selectedFournisseur}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEdit(false)}
              localisations={localisations}
              isLoadingLocalisations={isLoadingLocalisations}
            />
          </div>
        </div>
      )}

      {showDelete && selectedFournisseur && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <SuppressionFournisseur
              fournisseur={selectedFournisseur}
              onConfirm={handleDeleteConfirm}
              onCancel={() => {
                setShowDelete(false)
                setSelectedId(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}