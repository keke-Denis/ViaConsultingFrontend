"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { ficheService } from "@/lib/TestHuille/fiche-reception.service"
import { testService } from "@/lib/TestHuille/Tester-huile-api"
import { facturationService } from "@/lib/TestHuille/Facturation-huile-api"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Plus, MoreHorizontal, Edit, Trash2, Search, FileDown,
  QrCode, AlertCircle, Loader2, CreditCard, CheckCircle
} from 'lucide-react'

import { TestHuileAjoutModal } from "./test-huile-ajout-modal"
import { TestHuileEditModal } from "./test-huile-edit-modal"
import { QRModal } from "./qr-modal"
import { TestHuileTestModal } from "./test-huile-test-modal"
import { TestHuileEssentielle } from "@/components/collecte/test-huile-essentielle"
import { useAuth } from "@/contexts/auth-context"
import { useTestFiche } from "@/contexts/test-huile/fiche-context"
import { TestHuileFacturationModal } from "./test-huile-facturation-modal"
import { TestHuileValidationModal } from "./test-huile-validation-modal"
import { TestHuileLivraisonModal } from "./test-huile-fichelivraison-modal"
import { TestHuileImpayeModal } from "./test-huile-impaye-modal"
import { TestHuileSuppressionModal } from "./test-huile-suppression-modal"
import { TestHuileMobileCard } from "./test-huile/test-huile-mobile-card"

import {
  generateRecapPDF
} from "@/utils/pdf-generator"

import {
  formatDate,
  formatCurrency,
  formatNumber,
  formatPercentage,
  getPoidsBruts,
  getStatusLabel as getGlobalStatusLabel
} from "@/utils/formatters"

const COLOR = "#76bc21"

function TestHuileTableContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // fiches are now provided by TestFiche context
  const { fiches, getFiches, deleteFiche } = useTestFiche()
  const [tests, setTests] = useState<any[]>([])
  const [facturations, setFacturations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isAjoutOpen, setIsAjoutOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [ficheToEdit, setFicheToEdit] = useState<any>(null)
  const [isQROpen, setIsQROpen] = useState(false)
  const [selectedFicheQR, setSelectedFicheQR] = useState<any>(null)
  const [isTestOpen, setIsTestOpen] = useState(false)
  const [ficheForTest, setFicheForTest] = useState<any>(null)
  const [isFacturationOpen, setIsFacturationOpen] = useState(false)
  const [ficheForFacturation, setFicheForFacturation] = useState<any>(null)
  const [isValidationOpen, setIsValidationOpen] = useState(false)
  const [ficheForValidation, setFicheForValidation] = useState<any>(null)
  const [testForValidation, setTestForValidation] = useState<any>(null)
  const [validatingTest, setValidatingTest] = useState<number | null>(null)
  const [isLivraisonOpen, setIsLivraisonOpen] = useState(false)
  const [ficheForLivraison, setFicheForLivraison] = useState<any>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmFiche, setConfirmFiche] = useState<any>(null)
  const [isImpayeOpen, setIsImpayeOpen] = useState(false)
  const [selectedImpaye, setSelectedImpaye] = useState<any>(null)

  const [isSuppressionOpen, setIsSuppressionOpen] = useState(false)
  const [ficheToDelete, setFicheToDelete] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      // fiches come from context
      await getFiches()
      const [testsData, facturationsData] = await Promise.all([
        testService.getAll(),
        facturationService.getAll()
      ])

      setTests(Array.isArray(testsData?.data) ? testsData.data : [])
      setFacturations(Array.isArray(facturationsData) ? facturationsData : [])
    } catch (error) {
      console.error("Erreur chargement données:", error)
      toast.error("Erreur de chargement des données")
      setTests([])
      setFacturations([])
    } finally {
      setLoading(false)
    }
  }, [getFiches])

  useEffect(() => { loadData() }, [loadData])

  const formatReference = (f: any) => {
    if (f?.numero_document) return f.numero_document
    const datePart = f?.date_reception ? new Date(f.date_reception).toISOString().slice(0,10).replace(/-/g, '') : '20251201'
    const idPart = f?.id ? String(f.id).padStart(6, '0') : 'XXXXXX'
    return `REC-${datePart}-${idPart}`
  }

  const getStatusLabel = (statut: string) => {
    const statusMap: Record<string, string> = {
      'en attente de teste': 'En attente de test',
      'en cours de teste': 'En cours de test',
      'Accepté': 'Accepté',
      'Refusé': 'Refusé',
      'A retraiter': 'A retraiter',
      'en attente de paiement': 'En attente de paiement',
      'payé': 'Payé',
      'incomplet': 'Incomplet',
      'payement incomplète': 'Paiement incomplet',
    }
    return statusMap[statut] || statut
  }

  const getStatusBadgeStyle = (statut: string) => {
    const styles: Record<string, any> = {
      'en attente de teste': { backgroundColor: "#f3f4f6", color: "#6b7280", borderColor: "#d1d5db" },
      'en cours de teste': { backgroundColor: "#fff3cd", color: "#856404", borderColor: "#ffeaa7" },
      'Accepté': { backgroundColor: "#d1fae5", color: "#065f46", borderColor: "#6ee7b7" },
      'Refusé': { backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" },
      'A retraiter': { backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#fcd34d" },
      'en attente de paiement': { backgroundColor: "#e0e7ff", color: "#3730a3", borderColor: "#a5b4fc" },
      'payé': { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#86efac" },
      'incomplet': { backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#fcd34d" },
      'payement incomplète': { backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#fcd34d" },
    }
    return styles[statut] || { backgroundColor: "#f3f4f6", color: "#6b7280" }
  }

  const getStatusBadgeVariant = (statut: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, any> = {
      'en attente de teste': "outline",
      'en cours de teste': "secondary",
      'Accepté': "default",
      'Refusé': "destructive",
      'A retraiter': "secondary",
      'en attente de paiement': "outline",
      'payé': "default",
      'incomplet': "secondary",
      'payement incomplète': "secondary",
    }
    return variants[statut] || "outline"
  }

  const filteredFiches = useMemo(() => {
    if (!searchTerm) return fiches
    const term = searchTerm.toLowerCase()
    return fiches.filter(f => {
      const ref = formatReference(f).toLowerCase()
      const fournisseur = `${f?.fournisseur?.prenom || ''} ${f?.fournisseur?.nom || ''}`.toLowerCase()
      const site = f?.site_collecte?.Nom?.toLowerCase() || ''
      const statut = getStatusLabel(f?.statut || '').toLowerCase()
      return ref.includes(term) || fournisseur.includes(term) || site.includes(term) || statut.includes(term)
    })
  }, [fiches, searchTerm])

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedRows)
    newSet.has(id) ? newSet.delete(id) : newSet.add(id)
    setSelectedRows(newSet)
  }

  const toggleAll = () => {
    if (filteredFiches.length === 0) return setSelectedRows(new Set())
    const allSelected = filteredFiches.every(f => selectedRows.has(f.id))
    setSelectedRows(allSelected ? new Set() : new Set(filteredFiches.map(f => f.id)))
  }

  const openSuppression = (fiche: any) => {
    setFicheToDelete(fiche)
    setIsSuppressionOpen(true)
  }

  const confirmSuppression = async () => {
    if (!ficheToDelete) return
    setDeleting(true)
    try {
      await deleteFiche(ficheToDelete.id)
      toast.success("Fiche supprimée avec succès")
      // getFiches will have updated the context; refresh tests/facturations
      await Promise.all([getFiches(), testService.getAll(), facturationService.getAll()])
      setIsSuppressionOpen(false)
    } catch (error) {
      toast.error("Échec de la suppression")
    } finally {
      setDeleting(false)
      setFicheToDelete(null)
    }
  }

  const handleEdit = (fiche: any) => {
    setFicheToEdit(fiche)
    setIsEditOpen(true)
  }

  const handleFacturation = (fiche: any) => {
    setFicheForFacturation(fiche)
    setIsFacturationOpen(true)
  }

  const handlePaiementSupplementaire = async (fiche: any) => {
    try {
      const facturationsImpayees = await facturationService.getImpayes()
      const facturationImpayee = Array.isArray(facturationsImpayees)
        ? facturationsImpayees.find((f: any) => f.fiche_reception_id === fiche.id)
        : null

      if (!facturationImpayee) {
        toast.error("Aucune facturation impayée trouvée")
        return
      }

      const impayeContext = {
        id: 0,
        facturation_id: facturationImpayee.id,
        montant_du: facturationImpayee.montant_total,
        montant_paye: facturationImpayee.avance_versee,
        reste_a_payer: facturationImpayee.reste_a_payer,
        facturation: facturationImpayee
      }

      setSelectedImpaye(impayeContext)
      setIsImpayeOpen(true)
    } catch (error) {
      toast.error("Erreur lors du chargement des impayés")
    }
  }

  const canFacturer = (fiche: any) => fiche?.statut === 'Accepté'
  const canAjouterPaiement = (fiche: any) => fiche?.statut === 'payement incomplète'
  const canValidateTest = (fiche: any) => fiche?.statut === 'en cours de teste'
  const canLaunchTest = (fiche: any) => fiche?.statut === 'en attente de teste'

  const handleValidateTest = (fiche: any) => {
    setConfirmFiche(fiche)
    setIsConfirmOpen(true)
  }

  const confirmValidate = async () => {
    if (!confirmFiche) return
    setIsConfirmOpen(false)
    setValidatingTest(confirmFiche.id)

    try {
      const test = tests.find((t: any) => t.fiche_reception_id === confirmFiche.id)
      if (!test) {
        toast.error("Aucun test trouvé pour cette fiche")
        return
      }
      setFicheForValidation(confirmFiche)
      setTestForValidation(test)
      setIsValidationOpen(true)
    } catch (error) {
      toast.error("Erreur lors de la validation")
    } finally {
      setValidatingTest(null)
      setConfirmFiche(null)
    }
  }

  const handleLivraison = (fiche: any) => {
    // Ne permettre la livraison que si le statut n'est pas "payé"
    if (fiche?.statut === 'payé') {
      return // Ne pas afficher de bouton pour les fiches payées
    }
    setFicheForLivraison(fiche)
    setIsLivraisonOpen(true)
  }

  const handleShowQRCode = (fiche: any) => {
    setSelectedFicheQR(fiche)
    setIsQROpen(true)
  }

  const handleLaunchTest = (fiche: any) => {
    if (!canLaunchTest(fiche)) {
      toast.error("Cette fiche n'est pas en attente de test")
      return
    }
    setFicheForTest(fiche)
    setIsTestOpen(true)
  }

  const handleExportPDF = async () => {
    if (selectedRows.size === 0) return toast.error("Sélectionnez au moins une ligne")
    setIsGeneratingPDF(true)

    try {
      const selected = fiches.filter(f => selectedRows.has(f.id))
      generateRecapPDF(selected, tests, facturations)
      toast.success(`${selected.length} PDF généré(s)`)
    } catch (err) {
      console.error("Erreur génération PDF:", err)
      toast.error("Erreur génération PDF")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (loading && fiches.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: COLOR }} />
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 lg:space-y-6 p-3 sm:p-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-[#76bc21]">Liste des Fiches de Réception - Huile Essentielle</h2>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setIsAjoutOpen(true)} style={{ backgroundColor: COLOR }} className="text-white">
                <Plus className="h-4 w-4 mr-2" /> Nouvelle fiche
              </Button>
              <Button variant="outline" onClick={handleExportPDF} disabled={isGeneratingPDF || selectedRows.size === 0}>
                {isGeneratingPDF ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Vue Mobile */}
        <div className="block lg:hidden space-y-4">
          {filteredFiches.map(fiche => (
            <TestHuileMobileCard
              key={fiche.id}
              fiche={fiche}
              isSelected={selectedRows.has(fiche.id)}
              onCheckChange={() => toggleSelect(fiche.id)}
              onShowQR={handleShowQRCode}
              onLaunchTest={handleLaunchTest}
              onValidateTest={handleValidateTest}
              onFacturation={handleFacturation}
              onPaiementSupplementaire={handlePaiementSupplementaire}
              onLivraison={handleLivraison}
              onEdit={handleEdit}
              onDelete={openSuppression}
              getStatusLabel={getStatusLabel}
              getStatusBadgeStyle={getStatusBadgeStyle}
              getStatusBadgeVariant={getStatusBadgeVariant}
              formatReference={formatReference}
              formatDate={formatDate}
              canLaunchTest={canLaunchTest}
              canValidateTest={canValidateTest}
              canFacturer={canFacturer}
              canAjouterPaiement={canAjouterPaiement}
              canDeliver={() => false}
              validatingTest={validatingTest}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {/* Vue Desktop */}
        <div className="hidden lg:block bg-white rounded-xl border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-linear-to-r from-[#76bc21]/10 to-[#76bc21]/5">
                <TableHead className="w-12">
                  <Checkbox checked={filteredFiches.length > 0 && filteredFiches.every(f => selectedRows.has(f.id))} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Poids net</TableHead>
                <TableHead>Emballage</TableHead>
                <TableHead>Colis</TableHead>
                <TableHead>Prix total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                    {fiches.length === 0 ? "Aucune fiche" : "Aucun résultat"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiches.map((fiche) => {
                  const badgeStyle = getStatusBadgeStyle(fiche.statut)
                  
                  return (
                    <TableRow key={fiche.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox checked={selectedRows.has(fiche.id)} onCheckedChange={() => toggleSelect(fiche.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{formatReference(fiche)}</TableCell>
                      <TableCell>{formatDate(fiche.date_reception)}</TableCell>
                      <TableCell>{fiche.fournisseur?.prenom} {fiche.fournisseur?.nom}</TableCell>
                      <TableCell>{fiche.site_collecte?.Nom || '-'}</TableCell>
                      <TableCell>{formatNumber(fiche.poids_net)} kg</TableCell>
                      <TableCell className="capitalize">{fiche.type_emballage || '-'}</TableCell>
                      <TableCell>{fiche.nombre_colisage || '-'}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(fiche.prix_total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(fiche.statut)}
                          style={{ backgroundColor: badgeStyle.backgroundColor, color: badgeStyle.color, borderColor: badgeStyle.borderColor }}
                          className="border"
                        >
                          {getStatusLabel(fiche.statut)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {fiche?.statut !== 'payé' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              <DropdownMenuItem onClick={() => handleShowQRCode(fiche)}>
                                <QrCode className="mr-2 h-4 w-4" style={{ color: COLOR }} /> QR Code
                              </DropdownMenuItem>

                              {canLaunchTest(fiche) && (
                                <DropdownMenuItem onClick={() => handleLaunchTest(fiche)}>
                                  <AlertCircle className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Lancer test
                                </DropdownMenuItem>
                              )}

                              {canValidateTest(fiche) && (
                                <DropdownMenuItem onClick={() => handleValidateTest(fiche)} disabled={validatingTest === fiche.id}>
                                  {validatingTest === fiche.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" style={{ color: COLOR }} />}
                                  Valider test
                                </DropdownMenuItem>
                              )}

                              {canFacturer(fiche) && (
                                <DropdownMenuItem onClick={() => handleFacturation(fiche)}>
                                  <CreditCard className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Facturation
                                </DropdownMenuItem>
                              )}

                              {canAjouterPaiement(fiche) && (
                                <DropdownMenuItem onClick={() => handlePaiementSupplementaire(fiche)}>
                                  <Plus className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Paiement supp.
                                </DropdownMenuItem>
                              )}

                              {/* ADMIN ONLY */}
                              {isAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Administration</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEdit(fiche)}>
                                    <Edit className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => openSuppression(fiche)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleShowQRCode(fiche)}>
                                <QrCode className="mr-2 h-4 w-4" style={{ color: COLOR }} /> QR Code
                              </DropdownMenuItem>

                              {/* ADMIN ONLY - Le QR Code s'affiche pour tout le monde, mais modifier/supprimer seulement pour admin */}
                              {isAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Administration</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEdit(fiche)}>
                                    <Edit className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => openSuppression(fiche)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog de confirmation de validation */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la validation</DialogTitle>
            <DialogDescription>
              Valider le test pour la fiche {confirmFiche && formatReference(confirmFiche)} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Annuler</Button>
            <Button style={{ backgroundColor: COLOR }} onClick={confirmValidate}>Valider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tous les modals */}
  <TestHuileAjoutModal open={isAjoutOpen} onOpenChange={setIsAjoutOpen} onSuccess={loadData} />

      {ficheToEdit && (
        <TestHuileEditModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          fiche={ficheToEdit}
          onSuccess={() => { loadData(); setFicheToEdit(null) }}
        />
      )}

      <QRModal open={isQROpen} onOpenChange={setIsQROpen} reception={selectedFicheQR} />

  <TestHuileTestModal open={isTestOpen} onOpenChange={setIsTestOpen} fiche={ficheForTest} onSuccess={() => { loadData(); setFicheForTest(null) }} />

  <TestHuileFacturationModal open={isFacturationOpen} onOpenChange={setIsFacturationOpen} fiche={ficheForFacturation} onSuccess={() => { loadData(); setFicheForFacturation(null) }} />

      {ficheForValidation && testForValidation && (
        <TestHuileValidationModal
          open={isValidationOpen}
          onOpenChange={setIsValidationOpen}
          test={testForValidation}
          onSuccess={() => { loadData(); setFicheForValidation(null); setTestForValidation(null) }}
        />
      )}

      {ficheForLivraison && (
        <TestHuileLivraisonModal
          open={isLivraisonOpen}
          onOpenChange={setIsLivraisonOpen}
          fiche={ficheForLivraison}
          onSuccess={loadData}
        />
      )}

      {selectedImpaye && (
        <TestHuileImpayeModal
          open={isImpayeOpen}
          onOpenChange={setIsImpayeOpen}
          impaye={selectedImpaye}
          onSuccess={() => { loadData(); setSelectedImpaye(null) }}
        />
      )}

      <TestHuileSuppressionModal
        open={isSuppressionOpen}
        onOpenChange={setIsSuppressionOpen}
        fiche={ficheToDelete}
        onConfirm={confirmSuppression}
        loading={deleting}
        formatReference={formatReference}
      />
    </>
  )
}

export function TestHuileEssentielleTab() {
  return (
    <div className="space-y-6">
      <TestHuileEssentielle />
      <Card>
        <CardContent className="p-0">
          <TestHuileTableContent />
        </CardContent>
      </Card>
    </div>
  )
}