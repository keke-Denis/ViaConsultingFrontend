// components/collecte/matiere-premiere-table-content.tsx
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "react-toastify"

import { usePVReception } from "@/contexts/pvreception/pvreception-context"
import { useFacturation } from "@/contexts/pvreception/facturation-context"
import { useImpaye } from "@/contexts/pvreception/impaye-context"
import { useFicheLivraison } from "@/contexts/pvreception/fichelivraison-context"
import { useAuth } from "@/contexts/auth-context"
import { useSolde } from "@/contexts/paimentEnAvance/solde-context"

import { ReceptionDialog } from "../reception-dialog"
import { FacturationModal } from "../facturation-modal"
import { ImpayeModal } from "../impaye-modal"
import { QRModal } from "../qr-modal"
import { MobileCard } from "./mobile-card"
import { SupprimerMPModal } from "./supprimerMP-modal"

import {
  Search, Plus, FileDown, Loader2, MoreHorizontal,
  Edit, Trash2, QrCode, FileText, AlertTriangle
} from "lucide-react"

import {
  generatePVReceptionPDF,
  generateFactureFournisseurPDF
} from "./pdf-generators"

const COLOR = "#76bc21"

export function MatierePremiereTableContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedPV, setSelectedPV] = useState<any>(null)
  const [selectedImpaye, setSelectedImpaye] = useState<any>(null)
  const [isFacturationModalOpen, setIsFacturationModalOpen] = useState(false)
  const [isImpayeModalOpen, setIsImpayeModalOpen] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isSupprimerModalOpen, setIsSupprimerModalOpen] = useState(false)
  const [pvToDelete, setPvToDelete] = useState<any>(null)

  const { pvReceptions, getPVReceptions, deletePVReception, setCurrentPVReception } = usePVReception()
  const { getFacturations } = useFacturation()
  const { impayes = [], getImpayes } = useImpaye()
  const { getFicheLivraisons } = useFicheLivraison()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const safeImpayes = Array.isArray(impayes) ? impayes : []

  useEffect(() => {
    const load = async () => {
      await Promise.all([getPVReceptions(), getFacturations(), getImpayes(), getFicheLivraisons()])
    }
    load()
  }, [])

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')
  const getTypeLabel = (t: string) => ({ FG: "Feuilles Girofle", CG: "Clous Girofle", GG: "Griffes Girofle" }[t] || t)
  const getTypeEmballageLabel = (t: string) => ({ sac: "Sac", bidon: "Bidon", fut: "Fut" }[t] || t)
  
  // Seulement les statuts demandés
  const getStatutLabel = (s: string) => ({
    non_paye: "Non payé", 
    paye: "Payé", 
    incomplet: "Paiement incomplet"
  }[s] || s)

  // Couleurs uniquement pour les statuts demandés
  const getStatutColor = (s: string) => ({
    non_paye: "text-red-700 bg-red-50 border-red-200",
    paye: "text-green-700 bg-green-50 border-green-200",
    incomplet: "text-orange-700 bg-orange-50 border-orange-200"
  }[s] || "text-gray-600 bg-gray-50")

  const getDetteColor = (dette: number) => dette > 0 ? "text-red-600 font-bold" : "text-green-600"
  const getStockColor = () => "text-black"

  const filteredReceptions = useMemo(() => {
    if (!searchTerm) return pvReceptions
    const term = searchTerm.toLowerCase()
    return pvReceptions.filter(r =>
      r.numero_doc?.toLowerCase().includes(term) ||
      `${r.fournisseur?.prenom || ''} ${r.fournisseur?.nom || ''}`.toLowerCase().includes(term) ||
      r.type?.toLowerCase().includes(term) ||
      getStatutLabel(r.statut).toLowerCase().includes(term)
    )
  }, [pvReceptions, searchTerm])

  const toggleRow = (id: number) => setSelectedRows(prev => {
    const newSet = new Set(prev)
    newSet.has(id) ? newSet.delete(id) : newSet.add(id)
    return newSet
  })

  const toggleSelectAll = () => {
    setSelectedRows(selectedRows.size === filteredReceptions.length ? new Set() : new Set(filteredReceptions.map(r => r.id)))
  }

  const handleAddNew = () => { setCurrentPVReception(null); setIsEditMode(false); setIsDialogOpen(true) }
  const handleEdit = (r: any) => { setCurrentPVReception(r); setIsEditMode(true); setIsDialogOpen(true) }
  const handleDelete = (r: any) => {
    setPvToDelete(r)
    setIsSupprimerModalOpen(true)
  }
  const handleFacturation = (r: any) => { setSelectedPV(r); setIsFacturationModalOpen(true) }
  const handlePaiementImpaye = (r: any) => {
    const impaye = safeImpayes.find(i => i.pv_reception_id === r.id && i.reste_a_payer > 0)
    setSelectedImpaye(impaye || { pv_reception_id: r.id, montant_total: r.dette_fournisseur, reste_a_payer: r.dette_fournisseur, pv_reception: r })
    setIsImpayeModalOpen(true)
  }
  const handleShowQRCode = (r: any) => { setSelectedPV(r); setIsQRModalOpen(true) }

  const { refreshSoldes } = useSolde()

  const handleSuccess = async () => {
    await Promise.all([getPVReceptions(), getFacturations(), getImpayes(), getFicheLivraisons(), refreshSoldes()])
    setSelectedRows(new Set())
  }

  const handleExportPDF = async () => {
    if (selectedRows.size === 0) return toast.error("Sélectionnez au moins une ligne")
    setIsGeneratingPDF(true)
    const selected = pvReceptions.filter(r => selectedRows.has(r.id))
    const grouped = selected.reduce((acc, r) => { (acc[r.statut] ||= []).push(r); return acc }, {} as Record<string, any[]>)

    try {
      if (grouped.non_paye?.length) { 
        generatePVReceptionPDF(grouped.non_paye); 
        toast.success(`${grouped.non_paye.length} PV généré(s)`) 
      }
      const facturable = [...(grouped.incomplet || []), ...(grouped.paye || [])]
      if (facturable.length) { 
        generateFactureFournisseurPDF(facturable); 
        toast.success(`${facturable.length} facture(s) générée(s)`) 
      }
    } catch (err) { 
      toast.error("Erreur génération PDF") 
    } finally { 
      setIsGeneratingPDF(false) 
    }
  }

  // Fonction vide pour les propriétés non utilisées
  const handleEmptyFunction = () => {}

  return (
    <>
      <div className="space-y-4 lg:space-y-6 p-3 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#76bc21]">Tables des matières Premières</h2>
          
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
            {/* Barre de recherche à gauche */}
            <div className="relative flex-1 md:flex-auto md:order-1 order-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-10 w-full md:w-80 text-sm" 
              />
            </div>
            
            {/* Boutons à droite */}
            <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4 md:order-2 order-2">
              <Button onClick={handleAddNew} style={{ backgroundColor: COLOR }} className="text-white hover:opacity-90 px-3 py-2 md:px-4 md:py-2">
                <Plus className="h-4 w-4 mr-1 md:mr-2 shrink-0" />
                <span className="hidden md:inline">Nouveau PV</span>
                <span className="md:hidden">Nouveau</span>
              </Button>
              <Button variant="outline" onClick={handleExportPDF} disabled={selectedRows.size === 0 || isGeneratingPDF} className="px-3 py-2 md:px-4 md:py-2">
                {isGeneratingPDF ? <Loader2 className="h-4 w-4 mr-1 md:mr-2 animate-spin shrink-0" /> : <FileDown className="h-4 w-4 mr-1 md:mr-2 shrink-0" />}
                <span className="hidden md:inline">Exporter</span>
                <span className="md:hidden">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Vue mobile */}
        <div className="block md:hidden">
          {filteredReceptions.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
              <p className="text-base sm:text-lg font-medium text-gray-600">
                {pvReceptions.length === 0 ? "Aucune matière première enregistrée" : "Aucun résultat"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredReceptions.map(r => (
                <MobileCard
                  key={r.id}
                  reception={r}
                  hasPartielle={false}
                  getStatutColor={getStatutColor}
                  getStatutLabel={getStatutLabel}
                  getTypeLabel={getTypeLabel}
                  getTypeEmballageLabel={getTypeEmballageLabel}
                  getDetteColor={getDetteColor}
                  getStockColor={getStockColor}
                  formatDate={formatDate}
                  isAdmin={isAdmin}
                  isSelected={selectedRows.has(r.id)}
                  onCheckChange={(checked: boolean) => toggleRow(r.id)}
                  onDownloadPDF={() => {
                    if (r.statut === 'non_paye') {
                      generatePVReceptionPDF([r])
                    } else if (['paye', 'incomplet'].includes(r.statut)) {
                      const facturable = [r].filter((item: any) => (item.statut === 'incomplet' || item.statut === 'paye') && item.dette_fournisseur >= 0)
                      if (facturable.length) generateFactureFournisseurPDF(facturable)
                    }
                  }}
                  onShowQR={handleShowQRCode}
                  onFacturation={handleFacturation}
                  onPaiementImpaye={handlePaiementImpaye}
                  onFicheLivraison={handleEmptyFunction} 
                  onConfirmerLivraison={handleEmptyFunction}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Vue desktop - Tableau */}
        <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-linear-to-r from-[#76bc21]/10 via-[#76bc21]/5 to-[#76bc21]/10">
                    <TableHead className="w-12"><Checkbox checked={selectedRows.size === filteredReceptions.length && filteredReceptions.length > 0} onCheckedChange={toggleSelectAll} /></TableHead>
                    <TableHead>N° Document</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Provenance</TableHead>
                    <TableHead>Emballage</TableHead>
                    <TableHead>Poids emb.</TableHead>
                    <TableHead>Poids net</TableHead>
                    <TableHead>Colis</TableHead>
                    <TableHead>Prix U.</TableHead>
                    <TableHead>Dette</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceptions.length === 0 ? (
                    <TableRow><TableCell colSpan={14} className="text-center py-12 text-gray-500">
                      <p className="text-lg font-medium">{pvReceptions.length === 0 ? "Aucune donnée" : "Aucun résultat"}</p>
                    </TableCell></TableRow>
                  ) : (
                    filteredReceptions.map((r, i) => (
                      <TableRow key={r.id} className={`hover:bg-gray-50 ${i % 2 === 0 ? "bg-gray-50/30" : "bg-white"}`}>
                        <TableCell><Checkbox checked={selectedRows.has(r.id)} onCheckedChange={() => toggleRow(r.id)} /></TableCell>
                        <TableCell className="font-medium">{r.numero_doc}</TableCell>
                        <TableCell>{formatDate(r.date_reception)}</TableCell>
                        <TableCell>{getTypeLabel(r.type)}</TableCell>
                        <TableCell>{r.fournisseur?.prenom} {r.fournisseur?.nom}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatutColor(r.statut)}`}>
                            {getStatutLabel(r.statut)}
                          </span>
                        </TableCell>
                        <TableCell>{r.provenance?.Nom || "-"}</TableCell>
                        <TableCell>{getTypeEmballageLabel(r.type_emballage)}</TableCell>
                        <TableCell>{r.poids_emballage} kg</TableCell>
                        <TableCell>{r.poids_net} kg</TableCell>
                        <TableCell>{r.nombre_colisage}</TableCell>
                        <TableCell>{r.prix_unitaire?.toLocaleString('fr-FR')} Ar</TableCell>
                        <TableCell className={`font-bold ${getDetteColor(r.dette_fournisseur)}`}>{r.dette_fournisseur?.toLocaleString('fr-FR')} Ar</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleShowQRCode(r)}><QrCode className="mr-2 h-4 w-4" />QR Code</DropdownMenuItem>
                              {r.statut === 'non_paye' && <DropdownMenuItem onClick={() => handleFacturation(r)}><FileText className="mr-2 h-4 w-4" />Facturation</DropdownMenuItem>}
                              {r.statut === 'incomplet' && <DropdownMenuItem onClick={() => handlePaiementImpaye(r)}><AlertTriangle className="mr-2 h-4 w-4" />Payer impayé</DropdownMenuItem>}
                              {isAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Administration</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEdit(r)}><Edit className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(r)}><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
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
          </div>
        </div>
      </div>

      <ReceptionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={handleSuccess} isEditMode={isEditMode} />
      <FacturationModal open={isFacturationModalOpen} onOpenChange={setIsFacturationModalOpen} pvReception={selectedPV} onSuccess={handleSuccess} />
      <ImpayeModal open={isImpayeModalOpen} onOpenChange={setIsImpayeModalOpen} impaye={selectedImpaye} onPaymentSuccess={handleSuccess} />
      <QRModal open={isQRModalOpen} onOpenChange={setIsQRModalOpen} reception={selectedPV} />
      <SupprimerMPModal
        open={isSupprimerModalOpen}
        onOpenChange={(open: boolean) => {
          setIsSupprimerModalOpen(open)
          if (!open) setPvToDelete(null)
        }}
        pvReception={pvToDelete}
        onDeleteSuccess={handleSuccess}
        deletePVReception={deletePVReception}
      />
    </>
  )
}