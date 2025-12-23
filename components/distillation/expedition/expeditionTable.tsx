"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Search, FileDown, CheckCircle, Clock } from "lucide-react"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { getExpeditions, receptionnerExpedition } from '@/lib/distillation/expedition/expedition-api'
import { useDistillationStats } from '@/contexts/distillation/distillation-stats-context'

const COLOR = "#72bc21"

interface ExpeditionLocal {
  id: number
  documentNumber: string
  dateEnvoi: string | null
  dateArrivee: string | null
  typeMatierePremiere: string
  quantite: number
  quantiteRecue?: number | null
  lieuDepart: string
  status: 'receptionné' | 'en attente'
}

// Mapper les codes de type matière première vers des libellés lisibles
const mapTypeName = (type?: string | null) => {
  if (!type) return '—'
  const t = String(type).toUpperCase()
  if (t === 'FG') return 'Feuilles de girofle'
  if (t === 'CG') return 'Clous de girofle'
  if (t === 'GG') return 'griffe de grifofe'
  return type
}

// Modal de confirmation pour la réception multiple
const ExpeditionConfirmation: React.FC<{
  selectedCount: number
  onConfirm: () => void
  onCancel: () => void
}> = ({ selectedCount, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmer la réception</h3>
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir marquer <span className="font-bold">{selectedCount}</span>{" "}
            expédition{selectedCount > 1 ? "s" : ""} comme réceptionnée{selectedCount > 1 ? "s" : ""} ?
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Expéditions sélectionnées</span>
            <span className="font-bold" style={{ color: COLOR }}>{selectedCount}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            style={{ borderColor: COLOR, color: COLOR }}
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            style={{ backgroundColor: COLOR }}
            className="flex-1 text-white hover:opacity-90"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmer la réception
          </Button>
        </div>
      </div>
    </div>
  )
}

const ExpeditionTable: React.FC = () => {
  const [expeditions, setExpeditions] = useState<ExpeditionLocal[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showDetail, setShowDetail] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedExpedition, setSelectedExpedition] = useState<ExpeditionLocal | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showReceptionModal, setShowReceptionModal] = useState(false)
  const [receptionTargetId, setReceptionTargetId] = useState<number | null>(null)
  const [receptionQty, setReceptionQty] = useState<number | string>('')

  // Filtrer les expéditions en attente
  const pendingExpeditions = useMemo(() => {
    return expeditions.filter(exp => exp.status === "en attente")
  }, [expeditions])

  const filteredExpeditions = useMemo(() => {
    if (!searchTerm.trim()) return expeditions

    const lower = searchTerm.toLowerCase()
    return expeditions.filter(
      (exp) =>
        exp.documentNumber.toLowerCase().includes(lower) ||
        exp.typeMatierePremiere.toLowerCase().includes(lower) ||
        exp.lieuDepart.toLowerCase().includes(lower) ||
        exp.status.includes(lower)
    )
  }, [expeditions, searchTerm])

  // Gérer la sélection/désélection de toutes les expéditions "en attente"
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      const pendingIds = pendingExpeditions.map(exp => exp.id)
      setSelectedIds(pendingIds)
    } else {
      setSelectedIds([])
    }
  }

  // Gérer la sélection individuelle
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id))
      setSelectAll(false)
    }
  }

  // Vérifier si toutes les expéditions "en attente" sont sélectionnées
  const allPendingSelected = useMemo(() => {
    if (pendingExpeditions.length === 0) return false
    return pendingExpeditions.every(exp => selectedIds.includes(exp.id))
  }, [pendingExpeditions, selectedIds])

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Load expeditions au démarrage
  useEffect(() => {
    fetchExpeditions()
  }, [])

  // distillation stats context to refresh global totals when expeditions change
  const { refreshStats } = useDistillationStats()

  const fetchExpeditions = async () => {
    try {
      setLoading(true)
      const res = await getExpeditions()
      if (res.success) {
        // Mapping des données depuis le backend
        const mapped = (res.data || []).map((e: any) => {
          // Créer un numéro de document
          const doc = `EXP-${e.id}`
          
          // Gérer la quantité
          const quantiteExp = e.quantite_expediee !== undefined && e.quantite_expediee !== null
            ? Number(e.quantite_expediee)
            : 0
          const quantiteRec = e.quantite_recue !== undefined && e.quantite_recue !== null
            ? Number(e.quantite_recue)
            : null
          
          // Obtenir le type de matière
          const rawType = e.type_matiere || e.typeMatierePremiere || '—'
          
          // Obtenir le lieu de départ
          const lieuDepart = e.lieu_depart || e.lieuDepart || '—'

          // Déterminer le statut
          let status: 'receptionné' | 'en attente' = 'en attente'
          if (e.statut === 'receptionne' || e.status === 'receptionné') {
            status = 'receptionné'
          }

          return {
            id: e.id,
            documentNumber: doc,
            dateEnvoi: e.date_expedition || e.dateEnvoi || null,
            dateArrivee: e.date_reception || e.dateArrivee || null,
            typeMatierePremiere: mapTypeName(rawType),
            quantite: isNaN(quantiteExp) ? 0 : quantiteExp,
            quantiteRecue: isNaN(Number(quantiteRec)) ? null : quantiteRec,
            lieuDepart: lieuDepart,
            status: status,
          } as ExpeditionLocal
        })
        setExpeditions(mapped)
        // Mettre à jour les totaux globaux (cards) via le context
        try { await refreshStats() } catch (err) { console.error('refreshStats after fetchExpeditions failed', err) }
      } else {
        toast.error(res.message || 'Impossible de charger les expéditions')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const openReceptionModal = (expId: number) => {
    setReceptionTargetId(expId)
    const row = expeditions.find(r => r.id === expId)
    const defaultQty = row?.quantite ?? ''
    setReceptionQty(typeof defaultQty === 'number' ? String(defaultQty) : defaultQty)
    setShowReceptionModal(true)
  }

  const submitReception = async () => {
    if (!receptionTargetId) return
    const qty = typeof receptionQty === 'string' ? parseFloat(receptionQty) : receptionQty
    if (isNaN(qty) || qty < 0) {
      toast.warning('Quantité invalide')
      return
    }
    try {
      setLoading(true)
      const res = await receptionnerExpedition(receptionTargetId, qty)
      if (res.success) {
        toast.success(res.message || 'Expédition réceptionnée')
        // refresh list
        await fetchExpeditions()
        setShowReceptionModal(false)
      } else {
        toast.error(res.message || 'Erreur')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || err?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" })

    doc.setFontSize(18)
    doc.setTextColor(COLOR)
    doc.text("Tableau des Expéditions", 14, 20)

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

    const tableData = filteredExpeditions.map((exp) => [
      exp.documentNumber,
      formatDate(exp.dateEnvoi),
      exp.dateArrivee ? formatDate(exp.dateArrivee) : "—",
      exp.typeMatierePremiere,
      `${exp.quantite.toLocaleString("fr-FR")} kg`,
      exp.lieuDepart,
      exp.status === "receptionné" ? "Réceptionné" : "En attente",
    ])

    autoTable(doc, {
      head: [
        [
          "N° Document",
          "Date d'envoi",
          "Date d'arrivée",
          "Type matière",
          "Quantité",
          "Lieu de départ",
          "Statut",
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
      `Total : ${filteredExpeditions.length} expédition${filteredExpeditions.length > 1 ? "s" : ""}`,
      14,
      finalY + 10
    )

    doc.save(`expeditions_${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success("PDF généré avec succès !")
  }

  const handleVoir = (expedition: ExpeditionLocal) => {
    setSelectedExpedition(expedition)
    setShowDetail(true)
  }

  // Réception multiple
  const handleMultipleReception = () => {
    if (selectedIds.length === 0) {
      toast.warning("Veuillez sélectionner au moins une expédition")
      return
    }
    setShowConfirmation(true)
  }

  const confirmMultipleReception = async () => {
    if (selectedIds.length === 0) return
    setShowConfirmation(false)
    setLoading(true)

    try {
      // Traiter chaque expédition sélectionnée
      const rowsToProcess = expeditions.filter(e => 
        selectedIds.includes(e.id) && e.status === "en attente"
      )

      if (rowsToProcess.length === 0) {
        toast.warning('Aucune expédition en attente sélectionnée')
        setLoading(false)
        return
      }

      // Traiter chaque expédition une par une
      for (const row of rowsToProcess) {
        try {
          await receptionnerExpedition(row.id, row.quantite)
        } catch (err) {
          console.error(`Erreur pour l'expédition ${row.id}:`, err)
          // Continuer avec les autres même si une échoue
        }
      }

      // Rafraîchir la liste
      await fetchExpeditions()
      
      toast.success(`${rowsToProcess.length} expédition(s) marquée(s) comme réceptionnée(s)`)
      
    } catch (err: any) {
      console.error(err)
      toast.error('Erreur lors de la réception multiple')
    } finally {
      setSelectedIds([])
      setSelectAll(false)
      setLoading(false)
    }
  }

  const hasNoData = expeditions.length === 0
  const hasResults = filteredExpeditions.length > 0
  const hasPendingExpeditions = pendingExpeditions.length > 0
  const hasSelection = selectedIds.length > 0

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête avec bouton de réception multiple */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold" style={{ color: COLOR }}>
          Suivi des Expéditions
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une expédition..."
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
              style={{ borderColor: COLOR, color: COLOR }}
            >
              <FileDown className="h-4 w-4 mr-2" /> PDF
            </Button>

            <Button
              onClick={handleMultipleReception}
              disabled={!hasSelection}
              style={{ backgroundColor: COLOR, color: '#fff' }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Réceptionner ({selectedIds.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Sélecteur tout cocher pour mobile */}
      {hasPendingExpeditions && (
        <div className="lg:hidden bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="select-all-mobile"
                checked={allPendingSelected}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all-mobile" className="text-sm font-medium">
                Tout sélectionner ({pendingExpeditions.length} en attente)
              </label>
            </div>
            <span className="text-sm text-gray-600">
              {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Tableau Desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#72bc21]/10 via-[#72bc21]/5 to-[#72bc21]/10">
              <TableHead className="w-12 text-center">
                {hasPendingExpeditions && (
                  <Checkbox
                    checked={allPendingSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-gray-400"
                  />
                )}
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                N° Document
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Date d'envoi
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Date d'arrivée
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Type matière première
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Quantité (kg)
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Provenance
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                Statut
              </TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasResults ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center gap-4">
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="h-12 w-12 text-gray-400 animate-spin"
                          viewBox="0 0 50 50"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden
                        >
                          <circle cx="25" cy="25" r="20" stroke="currentColor" strokeOpacity="0.15" strokeWidth="5" />
                          <path
                            d="M45 25a20 20 0 00-7.1-15.5"
                            stroke="currentColor"
                            strokeWidth="5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    ) : null}
                    <p className="text-lg font-medium">
                      {hasNoData ? "Aucune expédition enregistrée" : "Aucun résultat pour votre recherche"}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {searchTerm ? "Essayez avec d'autres termes" : ""}
                    </p>
                    {hasNoData && !loading && (
                      <Button 
                        onClick={fetchExpeditions}
                        style={{ backgroundColor: COLOR, color: '#fff' }}
                      >
                        Actualiser
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExpeditions.map((exp, index) => (
                <TableRow
                  key={exp.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50/30" : "bg-white"
                  } ${selectedIds.includes(exp.id) ? 'bg-blue-50/50' : ''}`}
                >
                  <TableCell className="text-center">
                      {exp.status === "en attente" && (
                        <Checkbox
                          checked={selectedIds.includes(exp.id)}
                          onCheckedChange={(checked) => handleSelectOne(exp.id, checked as boolean)}
                          className="border-gray-400"
                        />
                      )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {exp.documentNumber}
                  </TableCell>
                  <TableCell>{formatDate(exp.dateEnvoi)}</TableCell>
                  <TableCell>{exp.dateArrivee ? formatDate(exp.dateArrivee) : "—"}</TableCell>
                  <TableCell className="font-medium">{exp.typeMatierePremiere}</TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {exp.quantite.toLocaleString("fr-FR")} kg
                    </span>
                    {typeof exp.quantiteRecue === 'number' && (
                      <div className="text-sm text-gray-500">Reçu : {exp.quantiteRecue.toLocaleString('fr-FR')} kg</div>
                    )}
                  </TableCell>
                  <TableCell>{exp.lieuDepart}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        exp.status === "receptionné"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {exp.status === "receptionné" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {exp.status === "receptionné" ? "Réceptionné" : "En attente"}
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
                        <DropdownMenuItem onClick={() => handleVoir(exp)}>
                          <Eye className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Voir détails
                        </DropdownMenuItem>
                        {exp.status === "en attente" && (
                          <DropdownMenuItem
                            onClick={() => openReceptionModal(exp.id)}
                            style={{ color: COLOR }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Marquer comme réceptionné
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
          <div className="text-center py-12 text-gray-500 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-gray-400 animate-spin"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <circle cx="25" cy="25" r="20" stroke="currentColor" strokeOpacity="0.15" strokeWidth="5" />
                  <path
                    d="M45 25a20 20 0 00-7.1-15.5"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ) : null}
            <p className="text-lg font-medium">
              {hasNoData ? "Aucune expédition" : "Aucun résultat"}
            </p>
            <div>
              <Button onClick={fetchExpeditions} style={{ backgroundColor: COLOR, color: '#fff' }}>
                Actualiser
              </Button>
            </div>
          </div>
        ) : (
          filteredExpeditions.map((exp) => (
            <div
              key={exp.id}
              className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow ${
                selectedIds.includes(exp.id) ? 'border-[#72bc21] bg-blue-50/30' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {exp.status === "en attente" && (
                    <Checkbox
                      checked={selectedIds.includes(exp.id)}
                      onCheckedChange={(checked) => handleSelectOne(exp.id, checked as boolean)}
                      className="border-gray-400"
                    />
                  )}
                  <div>
                    <p className="font-bold text-lg text-gray-900">{exp.documentNumber}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                        exp.status === "receptionné"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {exp.status === "receptionné" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {exp.status === "receptionné" ? "Réceptionné" : "En attente"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type matière</span>
                  <span className="font-medium">{exp.typeMatierePremiere}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantité</span>
                  <div className="text-right">
                    <div className="font-semibold">{exp.quantite.toLocaleString("fr-FR")} kg</div>
                    {typeof exp.quantiteRecue === 'number' && (
                      <div className="text-sm text-gray-500">Reçu : {exp.quantiteRecue.toLocaleString('fr-FR')} kg</div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lieu de départ</span>
                  <span className="font-medium">{exp.lieuDepart}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Envoi</span>
                  <span>{formatDate(exp.dateEnvoi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Arrivée</span>
                  <span>{exp.dateArrivee ? formatDate(exp.dateArrivee) : "—"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button size="sm" variant="outline" onClick={() => handleVoir(exp)}>
                  <Eye className="h-4 w-4 mr-1" /> Voir
                </Button>
                {exp.status === "en attente" ? (
                  <Button
                    size="sm"
                    className="border-[#72bc21] bg-[#72bc21] hover:bg-[#65a91d] text-white"
                    onClick={() => openReceptionModal(exp.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Réceptionner
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmation pour la réception multiple */}
      {showConfirmation && (
        <ExpeditionConfirmation
          selectedCount={selectedIds.length}
          onConfirm={confirmMultipleReception}
          onCancel={() => setShowConfirmation(false)}
        />
      )}

      {/* Modal Réception (saisie quantité) */}
      {showReceptionModal && receptionTargetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Marquer comme réceptionné</h3>
              <p className="text-gray-600 text-sm">Entrez la quantité reçue pour l'expédition sélectionnée.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 block mb-2">Quantité reçue (kg)</label>
                <Input
                  type="number"
                  value={receptionQty}
                  onChange={(e) => setReceptionQty(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowReceptionModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={submitReception} className="flex-1 text-white" style={{ backgroundColor: COLOR }}>
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetail && selectedExpedition && (
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
                  <h3 className="text-xl font-bold" style={{ color: COLOR }}>Détails de l'expédition</h3>
                  <p className="text-gray-500">{selectedExpedition.documentNumber}</p>
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
                    <p className="text-sm text-gray-500">Date d'envoi</p>
                    <p className="font-medium">{formatDate(selectedExpedition.dateEnvoi)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date d'arrivée</p>
                    <p className="font-medium">
                      {selectedExpedition.dateArrivee
                        ? formatDate(selectedExpedition.dateArrivee)
                        : "Non arrivée"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Type de matière première</p>
                  <p className="font-medium text-lg">{selectedExpedition.typeMatierePremiere}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Quantité</p>
                  <p className="font-bold text-2xl">
                    {selectedExpedition.quantite.toLocaleString("fr-FR")} kg
                  </p>
                  {typeof selectedExpedition.quantiteRecue === 'number' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Quantité reçue : {selectedExpedition.quantiteRecue.toLocaleString("fr-FR")} kg
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Lieu de départ</p>
                  <p className="font-medium">{selectedExpedition.lieuDepart}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mt-1 ${
                      selectedExpedition.status === "receptionné"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedExpedition.status === "receptionné" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                    {selectedExpedition.status === "receptionné" ? "Réceptionné" : "En attente"}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => setShowDetail(false)}
                    className="w-full text-white"
                    style={{ backgroundColor: COLOR }}
                  >
                    Fermer
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

export default ExpeditionTable