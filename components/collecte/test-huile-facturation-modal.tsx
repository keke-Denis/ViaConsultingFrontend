"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { CreditCard, Loader2, Calculator, UserCheck, User, AlertCircle, Info, CheckCircle } from "lucide-react"
import { toast } from "react-toastify"
import type { FicheReception } from "@/lib/TestHuille/fiche-reception.service"
import { facturationService, facturationUtils } from "@/lib/TestHuille/Facturation-huile-api"
import { useSolde } from "@/contexts/paimentEnAvance/solde-context"

interface TestHuileFacturationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fiche: FicheReception | null
  onSuccess?: () => void
}

export function TestHuileFacturationModal({ open, onOpenChange, fiche, onSuccess }: TestHuileFacturationModalProps) {
  const { refreshSoldes } = useSolde()
  const [formData, setFormData] = useState({
    avance_versee: "",
    controller_qualite: "",
    responsable_commercial: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculs, setCalculs] = useState({
    montant_total: 0,
    reste_a_payer: 0,
    statut_paiement: "",
    prix_total_fiche: 0,
    poids_agreer: 0,
    poids_net: 0
  })

  const [validationMessage, setValidationMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info' | null
    message: string
  }>({ type: null, message: '' })

  // Chargement des infos fiche
  useEffect(() => {
    if (open && fiche) {
      const fetchFicheInfos = async () => {
        try {
          const infos = await facturationService.getInfosFichePourFacturation(fiche.id)
          const prixTotal = infos.prix_total || 0

          setCalculs({
            prix_total_fiche: prixTotal,
            montant_total: prixTotal,
            poids_agreer: infos.poids_agreer || 0,
            poids_net: infos.poids_net || 0,
            reste_a_payer: prixTotal === 0 ? 0 : prixTotal,
            statut_paiement: prixTotal === 0 ? 'payé' : ''
          })

          // Si prix total = 0 → avance bloquée à 0
          if (prixTotal === 0) {
            setFormData(prev => ({
              ...prev,
              avance_versee: "0"
            }))
          } else {
            setFormData(prev => ({
              ...prev,
              avance_versee: "",
              controller_qualite: "",
              responsable_commercial: "",
            }))
          }

          setValidationMessage({ type: null, message: '' })

        } catch (error: any) {
          toast.error("Erreur lors du chargement des données de la fiche")
        }
      }

      fetchFicheInfos()
    }
  }, [open, fiche])

  // Validation automatique
  useEffect(() => {
    if (!fiche) return

    const prixTotal = calculs.montant_total
    const avance = parseFloat(formData.avance_versee) || 0

    if (prixTotal === 0) {
      setValidationMessage({
        type: 'success',
        message: 'Facturation gratuite - Aucun paiement requis'
      })
      return
    }

    if (avance > prixTotal) {
      setValidationMessage({
        type: 'error',
        message: 'Le montant saisi dépasse le prix total de la fiche'
      })
    } else if (Math.abs(avance - prixTotal) < 0.01 && avance > 0) {
      // show payment complete only when equal (not when greater)
      setValidationMessage({
        type: 'success',
        message: 'Paiement complet'
      })
    } else if (avance > 0) {
      setValidationMessage({
        type: 'warning',
        message: 'Paiement partiel - Reste à payer à compléter plus tard'
      })
    } else {
      setValidationMessage({ type: null, message: '' })
    }
  }, [formData.avance_versee, calculs.montant_total, fiche])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fiche) return

    const avanceVersee = calculs.montant_total === 0 ? 0 : (parseFloat(formData.avance_versee) || 0)

    if (!formData.controller_qualite.trim() || !formData.responsable_commercial.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await facturationService.creerFacturation({
        fiche_reception_id: fiche.id,
        montant_total: calculs.montant_total,
        avance_versee: avanceVersee,
        controller_qualite: formData.controller_qualite.trim(),
        responsable_commercial: formData.responsable_commercial.trim()
      })

      if (result.success) {
        const statut = calculs.montant_total === 0 ? "payé" : result.nouveau_statut
        toast.success(`Facturation créée avec succès ! Statut : ${statut}`)
        await refreshSoldes()
        onSuccess?.()
        onOpenChange(false)
      } else {
        toast.error(result.message || "Erreur lors de la création")
      }
    } catch (error: any) {
      toast.error("Erreur réseau ou serveur")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!fiche) return null

  const estGratuit = calculs.prix_total_fiche === 0
  const montantNum = formData.avance_versee ? parseFloat(formData.avance_versee) : 0
  const montantDepasse = !estGratuit && montantNum > calculs.montant_total

  const formatNumberString = (s: string) => {
    const n = (s || '').toString().replace(/\s+/g, '').replace(/[^0-9]/g, '')
    if (!n) return ''
    return parseInt(n, 10).toLocaleString('fr-FR')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" style={{ color: "#76bc21" }} />
            Facturation - {fiche.numero_document}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Infos fiche */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Fournisseur :</span>
              <span className="font-medium">{fiche.fournisseur?.prenom} {fiche.fournisseur?.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Poids agréé :</span>
              <span className="font-medium">{calculs.poids_agreer || calculs.poids_net} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut actuel :</span>
              <span className="font-medium capitalize">{fiche.statut}</span>
            </div>
          </div>

          {/* Prix total */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Prix total de la fiche
            </Label>
            <Input
              value={facturationUtils.formaterMontant(calculs.prix_total_fiche)}
              disabled
              className="h-10 text-right font-bold text-lg bg-blue-50 border-blue-300"
            />

            {/* Message spécial si gratuit */}
            {estGratuit && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <CheckCircle className="h-6 w-6 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="font-bold">Facturation gratuite (0 Ar)</strong><br />
                  Aucun paiement n'est requis.<br />
                  L'avance est fixée à <strong>0 Ar</strong> et le statut sera automatiquement <strong>"payé"</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Avance versée - READONLY si prix = 0 */}
          <div className="space-y-2">
            <Label htmlFor="avance" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" style={{ color: "#76bc21" }} />
              Montant payé (Ar)
            </Label>
            <Input
              id="avance"
              type="text"
              value={formData.avance_versee ? formatNumberString(formData.avance_versee) : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '')
                setFormData({ ...formData, avance_versee: raw })
              }}
              disabled={estGratuit}
              readOnly={estGratuit}
              placeholder={estGratuit ? "0 (automatique)" : "montant en Ariary"}
              className={`h-10 text-right font-semibold text-lg ${estGratuit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {estGratuit && (
              <p className="text-xs text-gray-500">Champ verrouillé car le prix total est de 0 Ar</p>
            )}
            {(!estGratuit && montantDepasse) && (
              <p className="text-sm text-red-600">Le montant saisi ({montantNum.toLocaleString('fr-FR')} Ar) dépasse le prix total de la fiche ({calculs.montant_total.toLocaleString('fr-FR')} Ar).</p>
            )}
          </div>

          {/* Message de validation */}
          {validationMessage.type && (
            <div className={`p-3 rounded-lg text-sm border flex items-center gap-2 ${
              validationMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-300' :
              validationMessage.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-300' :
              'bg-blue-50 text-blue-800 border-blue-300'
            }`}>
              {validationMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              <span>{validationMessage.message}</span>
            </div>
          )}

          {/* Contrôleur qualité */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" style={{ color: "#76bc21" }} />
              Contrôleur qualité *
            </Label>
            <Input
              placeholder="Nom du contrôleur"
              value={formData.controller_qualite}
              onChange={(e) => setFormData({ ...formData, controller_qualite: e.target.value })}
              required
            />
          </div>

          {/* Responsable commercial */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" style={{ color: "#76bc21" }} />
              Responsable commercial *
            </Label>
            <Input
              placeholder="Nom du responsable"
              value={formData.responsable_commercial}
              onChange={(e) => setFormData({ ...formData, responsable_commercial: e.target.value })}
              required
            />
          </div>

          <DialogFooter className="gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.controller_qualite.trim() || !formData.responsable_commercial.trim() || montantDepasse}
              style={{ backgroundColor: "#76bc21" }}
              className="min-w-48 font-semibold text-white hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Créer la facturation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}