"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { CreditCard, Loader2, Plus, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"
import type { FicheReception } from "@/lib/TestHuille/fiche-reception.service"
import { facturationService } from "@/lib/TestHuille/Facturation-huile-api"
import { useSolde } from "@/contexts/paimentEnAvance/solde-context"

interface TestHuilePaiementSupplementaireModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fiche: FicheReception | null
  onSuccess?: () => void
}

export function TestHuilePaiementSupplementaireModal({ open, onOpenChange, fiche, onSuccess }: TestHuilePaiementSupplementaireModalProps) {
  const { refreshSoldes } = useSolde()
  const [formData, setFormData] = useState({
    montant: "",
    mode_paiement: "especes",
    reference: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [facturation, setFacturation] = useState<any>(null)
  const [loadingFacturation, setLoadingFacturation] = useState(false)

  // Charger les informations de facturation
  useEffect(() => {
    const loadFacturation = async () => {
      if (open && fiche) {
        setLoadingFacturation(true)
        try {
          const facturationData = await facturationService.getFacturationByFiche(fiche.id)
          setFacturation(facturationData)
        } catch (error) {
          console.error('Erreur chargement facturation:', error)
          toast.error("Erreur lors du chargement de la facturation")
        } finally {
          setLoadingFacturation(false)
        }
      }
    }

    if (open) {
      loadFacturation()
    }
  }, [open, fiche])

  useEffect(() => {
    if (open && fiche) {
      setFormData({
        montant: "",
        mode_paiement: "especes",
        reference: ""
      })
    }
  }, [open, fiche])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fiche || !facturation) {
      toast.error("Données manquantes")
      return
    }

    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      toast.error("Veuillez entrer un montant valide")
      return
    }

    const montantPaiement = parseFloat(formData.montant)
    const nouveauReste = facturation.reste_a_payer - montantPaiement

    if (nouveauReste < 0) {
      toast.error("Le montant ne peut pas dépasser le reste à payer")
      return
    }

    setIsSubmitting(true)

    try {
      // Mettre à jour la facturation avec le nouveau paiement (PUT)
      const nouvelleAvance = facturation.avance_versee + montantPaiement
      
      const result = await facturationService.updateFacturation(facturation.id, {
        avance_versee: nouvelleAvance
      })

      const message = result.nouveau_statut_fiche === 'payé' 
        ? "Paiement complet effectué - Statut: payé" 
        : `Paiement supplémentaire enregistré - Reste: ${result.data.reste_a_payer.toFixed(2)} Ar`

      toast.success(message)

      // Rafraîchir le solde après succès
      await refreshSoldes()

      onSuccess?.()
      onOpenChange(false)
      
    } catch (error: any) {
      console.error('Erreur paiement:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] ||
                          "Erreur lors de l'enregistrement du paiement"
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!fiche) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" style={{ color: "#76bc21" }} />
            Paiement supplémentaire - {fiche.numero_document}
          </DialogTitle>
        </DialogHeader>

        {loadingFacturation ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#76bc21" }} />
            <span className="ml-2">Chargement de la facturation...</span>
          </div>
        ) : !facturation ? (
          <div className="text-center py-8 text-gray-500">
            Aucune facturation trouvée pour cette fiche
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Informations de la facturation */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant total:</span>
                <span className="font-medium">{facturation.montant_total.toFixed(2)} Ar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Déjà payé:</span>
                <span className="font-medium">{facturation.avance_versee.toFixed(2)} Ar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reste à payer:</span>
                <span className="font-medium text-orange-600">{facturation.reste_a_payer.toFixed(2)} Ar</span>
              </div>
            </div>

            {/* Montant du paiement */}
            <div className="space-y-2">
              <Label>Montant du paiement (Ar) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={facturation.reste_a_payer}
                placeholder="0.00"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                className="h-10 text-right font-semibold"
                required
              />
              <p className="text-xs text-gray-500">
                Maximum: {facturation.reste_a_payer.toFixed(2)} Ar
              </p>
            </div>

            {/* Mode de paiement */}
            <div className="space-y-2">
              <Label>Mode de paiement *</Label>
              <Select
                value={formData.mode_paiement}
                onValueChange={(value) => setFormData({ ...formData, mode_paiement: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="carte">Carte</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Référence */}
            <div className="space-y-2">
              <Label>Référence de paiement</Label>
              <Input
                type="text"
                placeholder="Numéro de chèque, référence virement..."
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="h-10"
              />
            </div>

            {/* Calcul du nouveau reste */}
            {formData.montant && parseFloat(formData.montant) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span>Nouveau reste à payer:</span>
                  <span className="font-semibold">
                    {(facturation.reste_a_payer - parseFloat(formData.montant)).toFixed(2)} Ar
                  </span>
                </div>
                {(facturation.reste_a_payer - parseFloat(formData.montant)) === 0 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>La facture sera marquée comme payée</span>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.montant || parseFloat(formData.montant) <= 0} 
                style={{ backgroundColor: "#76bc21" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer le paiement"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
