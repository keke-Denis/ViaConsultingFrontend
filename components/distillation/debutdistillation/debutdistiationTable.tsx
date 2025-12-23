"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
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
  FlaskRound, Plus
} from "lucide-react"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import DemarrerDistillationModal from "./modals/DemarrerDistillationModal"
import TerminerDistillationModal from "./modals/TerminerDistillationModal"
import type { DistillationDto } from '@/lib/distillation/debutDistillation/debutDistillation-types'
import {
  getDistillations,
  demarrerDistillation,
  terminerDistillation,
  filterDistillationsByStatus
} from '@/lib/distillation/debutDistillation/debutDistillation-api'

const COLOR = "#76bc21"

interface Distillation {
  id: number
  reference: string
  idAmbalic: string
  quantiteDisponible: number
  quantiteRestant: number
  heObtenu?: number
  typeHEObtained?: string
  lieuDepart?: string
  siteCollecte: string
  typeMatierePremiere: string
  status: "en_cours" | "termine" | "en_attente"
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

const DebutDistilationTable: React.FC = () => {
  const [allDistillations, setAllDistillations] = useState<DistillationDto[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'en-attente' | 'en-cours' | 'terminees'>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('debutDistillation.viewMode') : null
      if (saved === 'en-attente' || saved === 'en-cours' || saved === 'terminees') return saved
    } catch (e) {
      // ignore
    }
    return 'en-attente'
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showDetail, setShowDetail] = useState(false)
  const [showDemarrerModal, setShowDemarrerModal] = useState(false)
  const [showTerminerModal, setShowTerminerModal] = useState(false)
  const [selectedDistillation, setSelectedDistillation] = useState<Distillation | null>(null)

  // Filtrer les distillations par statut
  const filteredByStatus = useMemo(() => {
    switch(viewMode) {
      case 'en-attente': return filterDistillationsByStatus(allDistillations, 'en_attente')
      case 'en-cours': return filterDistillationsByStatus(allDistillations, 'en_cours')
      case 'terminees': return filterDistillationsByStatus(allDistillations, 'termine')
      default: return []
    }
  }, [allDistillations, viewMode])

  // Convertir DistillationDto vers Distillation pour l'affichage
  const distillationsForDisplay = useMemo<Distillation[]>(() => {
    return filteredByStatus.map((d: DistillationDto) => {
  // Récupérer le lieu de départ 
  const lieuDepart =
  (d as any).lieu_depart ||
  (d as any).lieu ||
  (d as any).lieuDepart ||
  (d as any).lieu ||
  (d as any).site ||
  d.expedition?.lieu_depart ||
  d.expedition?.lieu ||
  d.expedition?.site ||
    d.expedition?.ficheLivraison?.distillateur?.site_collecte ||
    d.expedition?.ficheLivraison?.distilleur?.siteCollecte?.Nom ||
    '—'

  // Garder aussi une valeur pour l'ancien champ siteCollecte si d'autres parties du code l'utilisent
  const siteCollecte = lieuDepart

      // Récupérer le type de matière première
      const typeMatiere = d.type_matiere_premiere || 
                         d.expedition?.type_matiere ||
                         d.expedition?.ficheLivraison?.type_matiere ||
                         '—'

      // Calculer la quantité restante
      const quantiteRecue = Number(d.quantite_recue || 0)
      const quantiteTraitee = Number(d.quantite_traitee || 0)
      const quantiteRestant = Math.max(0, quantiteRecue - quantiteTraitee)

      return {
        id: d.id,
        reference: d.numero_pv || `DIST-${d.id}`,
        idAmbalic: d.id_ambalic || `AMB-${d.id}`,
        quantiteDisponible: quantiteRecue,
        quantiteRestant: quantiteRestant,
        heObtenu: Number(d.quantite_resultat || 0),
        siteCollecte: siteCollecte,
        typeMatierePremiere: mapTypeName(typeMatiere),
        // Type HE obtenu (pour les distillations terminées)
        typeHEObtained: d.type_he || (d as any).matiere || mapTypeName(d.type_matiere_premiere || typeMatiere),
        // Lieu de départ (affiché pour les terminées)
        lieuDepart: lieuDepart,
        status: d.statut as "en_cours" | "termine" | "en_attente"
      }
    })
  }, [filteredByStatus])

  // Filtrer par terme de recherche
  const filteredDistillations = useMemo(() => {
    if (!searchTerm.trim()) return distillationsForDisplay

    const lower = searchTerm.toLowerCase()
    return distillationsForDisplay.filter(
      (dist) =>
        dist.reference.toLowerCase().includes(lower) ||
        dist.idAmbalic.toLowerCase().includes(lower) ||
        dist.typeMatierePremiere.toLowerCase().includes(lower) ||
      (dist.lieuDepart || '').toLowerCase().includes(lower) ||
        dist.status.includes(lower)
    )
  }, [distillationsForDisplay, searchTerm])

  // Calculer le pourcentage restant
  const calculatePercentage = (disponible: number, restant: number) => {
    if (disponible === 0) return 0
    return Math.round((restant / disponible) * 100)
  }

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" })

    doc.setFontSize(18)
    doc.setTextColor(COLOR)
    doc.text("Tableau des Distillations", 14, 20)

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

    // Export by selected rows (lines). If none selected, ask the user to select rows.
    if (!selectedRows || selectedRows.length === 0) {
      toast.error('Sélectionnez au moins une ligne à exporter')
      return
    }

    const rows: any[] = []
    const headers = [
      'Référence',
      'ID Ambalic',
      'Qte disponible',
      'Qte Restant',
      'HE obtenu',
      'Type HE obtenu',
      'Lieu de départ',
      'Type matière',
      'Statut',
    ]

    selectedRows.forEach((id) => {
      const dist = filteredDistillations.find(d => d.id === id)
      if (!dist) return

      rows.push([
        dist.reference,
        dist.idAmbalic,
        `${dist.quantiteDisponible.toLocaleString('fr-FR')} kg`,
        `${dist.quantiteRestant.toLocaleString('fr-FR')} kg (${calculatePercentage(dist.quantiteDisponible, dist.quantiteRestant)}%)`,
        `${Number(dist.heObtenu ?? 0).toLocaleString('fr-FR')} kg`,
        dist.typeHEObtained || '—',
    dist.lieuDepart || '—',
        dist.typeMatierePremiere || '—',
        dist.status === 'en_cours' ? 'En cours' : dist.status === 'termine' ? 'Terminée' : 'En attente',
      ])
    })

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [118, 188, 33], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    const finalY = (doc as any).lastAutoTable?.finalY || 40
    doc.setFontSize(10)
    doc.text(
      `Total : ${filteredDistillations.length} distillation${filteredDistillations.length > 1 ? "s" : ""}`,
      14,
      finalY + 10
    )

    doc.save(`distillations_${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success("PDF généré avec succès !")
    // clear selection after export
    setSelectedRows([])
  }

  const handleVoir = (distillation: Distillation) => {
    setSelectedDistillation(distillation)
    setShowDetail(true)
  }

  // Charger toutes les distillations
  const fetchDistillations = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getDistillations()
      if (res.success) {
        setAllDistillations(res.data || [])
      } else {
        toast.error(res.message || 'Impossible de charger les distillations')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDistillations()
  }, [fetchDistillations])

  // persister le mode de vue
  useEffect(() => {
    try {
      localStorage.setItem('debutDistillation.viewMode', viewMode)
    } catch (e) {
      // ignore quota errors
    }
  }, [viewMode])

  const handleDemarrerDistillation = async (data: any) => {
    if (!selectedDistillation) {
      toast.error('Aucune distillation sélectionnée')
      return
    }
    try {
      setLoading(true)
      const payload = {
        id_ambalic: data.idAmbalic,
        date_debut: new Date().toISOString().split('T')[0],
        poids_distiller: Number(data.poidsDistiller),
        usine: data.usine,
        duree_distillation: Number(data.dureeDistillation),
        poids_chauffage: Number(data.poidsChaufage),
        carburant: data.carburant,
        main_oeuvre: Number(data.mainOeuvre),
      }
      const res = await demarrerDistillation(selectedDistillation.id, payload)
      if (res.success) {
        toast.success(res.message || 'Distillation démarrée')
        // Rafraîchir la liste
        await fetchDistillations()
      } else {
        toast.error(res.message || 'Erreur au démarrage')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || err?.message || 'Erreur réseau')
    } finally {
      setShowDemarrerModal(false)
      setLoading(false)
    }
  }

  const handleTerminerDistillation = async (data: any) => {
    if (!selectedDistillation) {
      toast.error('Aucune distillation sélectionnée')
      return
    }
    try {
      setLoading(true)
      const payload = {
        reference: data.reference || selectedDistillation.reference,
        matiere: data.typeHEObtenu || selectedDistillation.typeMatierePremiere,
  site: data.site || selectedDistillation.lieuDepart,
        quantite_traitee: Number(data.quantiteResultat) || 0,
        date_fin: new Date().toISOString().split('T')[0],
        type_he: data.typeHEObtenu || null,
        quantite_resultat: Number(data.quantiteResultat) || 0,
        observations: data.observations || null,
      }
      const res = await terminerDistillation(selectedDistillation.id, payload)
      if (res.success) {
        toast.success(res.message || 'Distillation terminée')
        // Rafraîchir la liste
        await fetchDistillations()
      } else {
        toast.error(res.message || 'Erreur lors de la finalisation')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || err?.message || 'Erreur réseau')
    } finally {
      setShowTerminerModal(false)
      setLoading(false)
    }
  }

  const hasNoData = allDistillations.length === 0
  const hasResults = filteredDistillations.length > 0

  // nombre de colonnes selon le mode de vue (+1 pour la colonne de sélection)
  const colCount = (viewMode === 'en-attente' || viewMode === 'terminees' ? 7 : 8) + 1

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold" style={{ color: COLOR }}>
          Distillations
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="hidden sm:flex items-center space-x-2 mr-2">
            <Button
              variant={viewMode === 'en-attente' ? undefined : 'outline'}
              onClick={() => setViewMode('en-attente')}
              style={viewMode === 'en-attente' ? { backgroundColor: COLOR, color: '#fff' } : undefined}
            >
              En attente
            </Button>
            <Button
              variant={viewMode === 'en-cours' ? undefined : 'outline'}
              onClick={() => setViewMode('en-cours')}
              style={viewMode === 'en-cours' ? { backgroundColor: COLOR, color: '#fff' } : undefined}
            >
              En cours
            </Button>
            <Button
              variant={viewMode === 'terminees' ? undefined : 'outline'}
              onClick={() => setViewMode('terminees')}
              style={viewMode === 'terminees' ? { backgroundColor: COLOR, color: '#fff' } : undefined}
            >
              Terminées
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une distillation..."
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
            <Button
              variant="outline"
              onClick={fetchDistillations}
              style={{ borderColor: COLOR, color: COLOR }}
            >
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Tableau Desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#76bc21]/10 via-[#76bc21]/5 to-[#76bc21]/10">
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      filteredDistillations.length > 0 && selectedRows.length === filteredDistillations.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(filteredDistillations.map(d => d.id))
                      } else {
                        setSelectedRows([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  Référence
                </TableHead>
              {viewMode !== 'en-attente' && (
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  ID Ambalic
                </TableHead>
              )}
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                {viewMode === 'terminees' ? 'HE obtenu' : 'Qte disponible'}
              </TableHead>
              {viewMode !== 'terminees' && (
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  Qte Restant
                </TableHead>
              )}
              {viewMode !== 'terminees' && (
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  Provenance 
                </TableHead>
              )}
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                {viewMode === 'terminees' ? 'Type HE obtenu' : 'Type de matière première'}
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
                <TableCell colSpan={colCount} className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center gap-4">
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="h-12 w-12 text-gray-400 animate-spin" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <circle cx="25" cy="25" r="20" stroke="currentColor" strokeOpacity="0.15" strokeWidth="5" />
                          <path d="M45 25a20 20 0 00-7.1-15.5" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : null}
                    <p className="text-lg font-medium">
                      {hasNoData
                        ? "Aucune distillation enregistrée"
                        : filteredByStatus.length === 0
                        ? `Aucune distillation ${viewMode === 'en-attente' ? 'en attente' : viewMode === 'en-cours' ? 'en cours' : 'terminée'}`
                        : "Aucun résultat pour votre recherche"}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {searchTerm
                        ? "Essayez avec d'autres termes"
                        : viewMode === 'en-attente'
                        ? "Les distillations en attente apparaîtront ici"
                        : viewMode === 'en-cours'
                        ? "Les distillations en cours apparaîtront ici"
                        : "Les distillations terminées apparaîtront ici"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDistillations.map((dist, index) => (
                <TableRow
                  key={dist.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50/30" : "bg-white"
                  }`}
                >
                  <TableCell className="font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(dist.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(s => Array.from(new Set([...s, dist.id])))
                        } else {
                          setSelectedRows(s => s.filter(id => id !== dist.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {dist.reference}
                  </TableCell>
                  {viewMode !== 'en-attente' && (
                    <TableCell className="font-medium text-gray-900">
                      {dist.idAmbalic}
                    </TableCell>
                  )}
                  {viewMode === 'terminees' ? (
                    <TableCell>
                      <span className="font-semibold">
                        {Number(dist.heObtenu ?? 0).toLocaleString("fr-FR")} kg
                      </span>
                    </TableCell>
                  ) : (
                    <>
                      <TableCell>
                        <span className="font-semibold">
                          {dist.quantiteDisponible.toLocaleString("fr-FR")} kg
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="font-semibold block">
                            {dist.quantiteRestant.toLocaleString("fr-FR")} kg
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                dist.status === "termine" ? "bg-green-500" : 
                                dist.status === "en_cours" ? "bg-[#76bc21]" : "bg-yellow-500"
                              }`}
                              style={{ 
                                width: `${calculatePercentage(dist.quantiteDisponible, dist.quantiteRestant)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {calculatePercentage(dist.quantiteDisponible, dist.quantiteRestant)}% restant
                          </span>
                        </div>
                      </TableCell>
                    </>
                  )}
                  <TableCell>{dist.status === 'termine' ? null : dist.lieuDepart}</TableCell>
                  <TableCell className="font-medium">{viewMode === 'terminees' ? dist.typeHEObtained : dist.typeMatierePremiere}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        dist.status === "termine"
                          ? "bg-green-100 text-green-800"
                          : dist.status === "en_cours"
                          ? "bg-[#76bc21]/20 text-[#76bc21]"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {dist.status === "termine" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : dist.status === "en_cours" ? (
                        <FlaskRound className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {dist.status === "termine" ? "Terminée" : 
                       dist.status === "en_cours" ? "En cours" : "En attente"}
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
                        <DropdownMenuItem onClick={() => handleVoir(dist)}>
                          <Eye className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Voir détails
                        </DropdownMenuItem>

                        {dist.status === "en_cours" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDistillation(dist)
                              setShowTerminerModal(true)
                            }}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Terminer la distillation
                          </DropdownMenuItem>
                        )}

                        {dist.status === "en_attente" && (
                          <DropdownMenuItem onClick={() => { setSelectedDistillation(dist); setShowDemarrerModal(true) }}>
                            <Plus className="mr-2 h-4 w-4" style={{ color: COLOR }} /> 
                            Démarrer la distillation
                          </DropdownMenuItem>
                        )}

                        {dist.status === "termine" && (
                          <div className="text-xs text-gray-500 px-2 py-1">
                            Aucune autre action disponible
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
      <div className="lg:hidden mb-3 flex items-center gap-2">
        <Button
          size="sm"
          variant={viewMode === 'en-attente' ? undefined : 'outline'}
          onClick={() => setViewMode('en-attente')}
          style={viewMode === 'en-attente' ? { backgroundColor: COLOR, color: '#fff' } : undefined}
        >
          En attente
        </Button>
        <Button
          size="sm"
          variant={viewMode === 'en-cours' ? undefined : 'outline'}
          onClick={() => setViewMode('en-cours')}
          style={viewMode === 'en-cours' ? { backgroundColor: COLOR, color: '#fff' } : undefined}
        >
          En cours
        </Button>
        <Button
          size="sm"
          variant={viewMode === 'terminees' ? undefined : 'outline'}
          onClick={() => setViewMode('terminees')}
          style={viewMode === 'terminees' ? { backgroundColor: COLOR, color: '#fff' } : undefined}
        >
          Terminées
        </Button>
      </div>
      
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
              {hasNoData
                ? "Aucune distillation"
                : filteredByStatus.length === 0
                ? `Aucune distillation ${viewMode === 'en-attente' ? 'en attente' : viewMode === 'en-cours' ? 'en cours' : 'terminée'}`
                : "Aucun résultat"}
            </p>
            <div>
              <Button onClick={fetchDistillations} style={{ backgroundColor: COLOR, color: '#fff' }}>
                Actualiser
              </Button>
            </div>
          </div>
        ) : (
          filteredDistillations.map((dist) => (
            <div
              key={dist.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(dist.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedRows(s => Array.from(new Set([...s, dist.id])))
                      else setSelectedRows(s => s.filter(id => id !== dist.id))
                    }}
                  />
                  <div>
                    <p className="font-bold text-lg text-gray-900">{dist.reference}</p>
                    {viewMode !== 'en-attente' && (
                      <p className="text-sm text-gray-600">ID: {dist.idAmbalic}</p>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                        dist.status === "termine"
                          ? "bg-green-100 text-green-800"
                          : dist.status === "en_cours"
                          ? "bg-[#76bc21]/20 text-[#76bc21]"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {dist.status === "termine" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : dist.status === "en_cours" ? (
                        <FlaskRound className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {dist.status === "termine" ? "Terminée" : 
                       dist.status === "en_cours" ? "En cours" : "En attente"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {viewMode === 'terminees' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type HE obtenu</span>
                      <span className="font-medium">{dist.typeHEObtained}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">HE obtenu</span>
                      <span className="font-semibold">{Number(dist.heObtenu ?? 0).toLocaleString("fr-FR")} kg</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Qte disponible</span>
                      <span className="font-semibold">{dist.quantiteDisponible.toLocaleString("fr-FR")} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Qte restant</span>
                      <span className="font-semibold">{dist.quantiteRestant.toLocaleString("fr-FR")} kg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          dist.status === "termine" ? "bg-green-500" : 
                          dist.status === "en_cours" ? "bg-[#76bc21]" : "bg-yellow-500"
                        }`}
                        style={{ 
                          width: `${calculatePercentage(dist.quantiteDisponible, dist.quantiteRestant)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-center text-gray-500">
                      {calculatePercentage(dist.quantiteDisponible, dist.quantiteRestant)}% restant
                    </div>
                  </>
                )}
                {dist.status !== 'termine' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lieu de départ</span>
                    <span className="font-medium">{dist.lieuDepart}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button size="sm" variant="outline" onClick={() => handleVoir(dist)}>
                  <Eye className="h-4 w-4 mr-1" /> Voir
                </Button>

                {dist.status === "en_cours" && (
                  <Button
                    size="sm"
                    className="border-[#76bc21] bg-[#76bc21] hover:bg-[#65a91d] text-white"
                    onClick={() => {
                      setSelectedDistillation(dist)
                      setShowTerminerModal(true)
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Terminer
                  </Button>
                )}

                {dist.status === "en_attente" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#76bc21] border-[#76bc21] hover:bg-[#76bc21]/10"
                    onClick={() => { setSelectedDistillation(dist); setShowDemarrerModal(true) }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Démarrer
                  </Button>
                )}

                {dist.status === "termine" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300"
                    disabled
                  >
                    Aucune action
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal pour démarrer une distillation */}
      {showDemarrerModal && selectedDistillation && (
        <DemarrerDistillationModal
          onClose={() => setShowDemarrerModal(false)}
          onStart={handleDemarrerDistillation}
          initialIdAmbalic={selectedDistillation.idAmbalic}
          initialPoidsDistiller={selectedDistillation.quantiteRestant ?? selectedDistillation.quantiteDisponible}
          initialTypeMatiere={selectedDistillation.typeMatierePremiere}
          initialSite={selectedDistillation.lieuDepart}
        />
      )}

      {/* Modal pour terminer une distillation */}
      {showTerminerModal && selectedDistillation && (
        <TerminerDistillationModal
            distillation={selectedDistillation as any}
          onClose={() => setShowTerminerModal(false)}
          onTerminate={handleTerminerDistillation}
        />
      )}

      {/* Modal Détails */}
      {showDetail && selectedDistillation && (
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
                  <h3 className="text-xl font-bold text-[#76bc21]">Détails de la distillation</h3>
                  <p className="text-gray-500">{selectedDistillation.reference}</p>
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
                    <p className="font-medium">{selectedDistillation.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID Ambalic</p>
                    <p className="font-medium">{selectedDistillation.idAmbalic}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quantité disponible</p>
                    <p className="font-bold text-lg">
                      {selectedDistillation.quantiteDisponible.toLocaleString("fr-FR")} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantité restante</p>
                    <p className="font-bold text-lg">
                      {selectedDistillation.quantiteRestant.toLocaleString("fr-FR")} kg
                    </p>
                  </div>
                </div>

                {selectedDistillation.heObtenu && selectedDistillation.heObtenu > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Huile essentielle obtenue</p>
                    <p className="font-bold text-lg text-green-600">
                      {selectedDistillation.heObtenu.toLocaleString("fr-FR")} kg
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Progression</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${
                          selectedDistillation.status === "termine" ? "bg-green-500" : 
                          selectedDistillation.status === "en_cours" ? "bg-[#76bc21]" : "bg-yellow-500"
                        }`}
                        style={{ 
                          width: `${calculatePercentage(
                            selectedDistillation.quantiteDisponible, 
                            selectedDistillation.quantiteRestant
                          )}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">
                        {calculatePercentage(
                          selectedDistillation.quantiteDisponible, 
                          selectedDistillation.quantiteRestant
                        )}% restant
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedDistillation.quantiteDisponible - selectedDistillation.quantiteRestant} kg traités
                      </span>
                    </div>
                  </div>
                </div>

                {selectedDistillation.status === 'termine' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Type HE obtenu</p>
                      <p className="font-medium">{selectedDistillation.typeHEObtained}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Type de matière première</p>
                      <p className="font-medium">{selectedDistillation.typeMatierePremiere}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lieu de départ</p>
                      <p className="font-medium">{selectedDistillation.lieuDepart}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mt-1 ${
                      selectedDistillation.status === "termine"
                        ? "bg-green-100 text-green-800"
                        : selectedDistillation.status === "en_cours"
                        ? "bg-[#76bc21]/20 text-[#76bc21]"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedDistillation.status === "termine" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : selectedDistillation.status === "en_cours" ? (
                      <FlaskRound className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                    {selectedDistillation.status === "termine" ? "Terminée" : 
                     selectedDistillation.status === "en_cours" ? "En cours" : "En attente"}
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

export default DebutDistilationTable