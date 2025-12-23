// components/collecte/impaye-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CreditCard, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
import { impayeApi } from "@/lib/pvreception/impaye-api"
import { useSolde } from "@/contexts/paimentEnAvance/solde-context"
import type { ModePaiement } from "@/lib/pvreception/impaye-types"

const COLOR = "#76bc21"

interface ImpayeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  impaye: any
  onPaymentSuccess?: () => void
}

export function ImpayeModal({ open, onOpenChange, impaye, onPaymentSuccess }: ImpayeModalProps) {
  const { refreshSoldes } = useSolde()
  const [montantPaye, setMontantPaye] = useState("")
  const [modePaiement, setModePaiement] = useState<ModePaiement>('especes')
  const [referencePaiement, setReferencePaiement] = useState("")
  const [datePaiement, setDatePaiement] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // On récupère les infos nécessaires
  const pvId = impaye?.pv_reception_id ?? impaye?.id
  const resteAPayer = impaye?.reste_a_payer ?? impaye?.dette_fournisseur ?? 0
  const vraiImpayeId = impaye?.id && !isNaN(impaye.id) && impaye.id < 1000000 ? impaye.id : null

  useEffect(() => {
    if (open) {
      setMontantPaye(resteAPayer.toString())
      setModePaiement('especes')
      setReferencePaiement("")
      setDatePaiement(new Date())
      setLocalError(null)
    }
  }, [open, resteAPayer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    // Validation des champs obligatoires
    if (!pvId || !montantPaye || !datePaiement || !modePaiement) {
      setLocalError("Tous les champs marqués d'un * sont obligatoires")
      return
    }

    const montant = Number(montantPaye)
    if (isNaN(montant) || montant <= 0 || montant > resteAPayer) {
      setLocalError(`Montant invalide (max: ${resteAPayer.toLocaleString()} Ar)`)
      return
    }

    setIsSubmitting(true)

    try {
      const formattedDate = datePaiement.toISOString().split('T')[0]
      
      // CAS 1 : On a déjà un impayé existant → on ajoute juste un paiement
      if (vraiImpayeId) {
        const paymentPayload = {
          montant_paye: montant,
          mode_paiement: modePaiement,
          reference_paiement: referencePaiement ? referencePaiement : undefined,
          date_paiement: formattedDate,
        }

        const response = await impayeApi.enregistrerPaiement(vraiImpayeId, paymentPayload)
        
        if (response.status === "success") {
          toast.success("Paiement enregistré avec succès !")
          // Rafraîchir le solde après succès
          await refreshSoldes()
          onPaymentSuccess?.()
          onOpenChange(false)
        } else {
          throw new Error(response.message || "Échec du paiement")
        }
      }
      // CAS 2 : Aucun impayé existant → on crée un nouvel impayé
      else {
        const createPayload = {
          pv_reception_id: pvId,
          date_paiement: formattedDate,
          mode_paiement: modePaiement,
          reference_paiement: referencePaiement ? referencePaiement : undefined,
          montant_total: resteAPayer,
          montant_paye: montant,
        }

        const response = await impayeApi.create(createPayload)
        
        if (response.status === "success") {
          toast.success("Impayé créé et paiement enregistré avec succès !")
          // Rafraîchir le solde après succès
          await refreshSoldes()
          onPaymentSuccess?.()
          onOpenChange(false)
        } else {
          throw new Error(response.message || "Échec de la création de l'impayé")
        }
      }
    } catch (error: any) {
      console.error("Erreur paiement:", error)
      
      // Gestion des erreurs détaillées
      let errorMessage = "Erreur serveur"
      
      if (error.response?.data) {
        const errorData = error.response.data
        
        if (errorData.errors) {
          // Cas où Laravel retourne des erreurs de validation
          const validationErrors = Object.values(errorData.errors).flat()
          errorMessage = validationErrors.join(', ')
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setLocalError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (value: string) => {
    // Nettoyage: ne garder que les chiffres
    const cleaned = value.replace(/[^0-9]/g, '')
    setMontantPaye(cleaned)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" style={{ color: COLOR }} />
            {vraiImpayeId ? "Paiement de dette" : "Création d'impayé"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="date">Date du paiement *</Label>
            <Input
              id="date"
              type="text"
              value={datePaiement ? format(datePaiement, "yyyy-MM-dd") : ''}
              readOnly
              className="w-full text-left font-medium bg-gray-100 cursor-not-allowed"
              style={{ color: '#333' }}
            />
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm font-medium text-orange-800">Reste à payer</p>
            <p className="text-2xl font-bold text-red-600">
              {resteAPayer.toLocaleString('fr-FR')} Ar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="montant">Montant à payer *</Label>
            <Input
              id="montant"
              type="text"
              value={montantPaye ? Number(montantPaye).toLocaleString('fr-FR') : ''}
              onChange={(e) => handleInputChange(e.target.value)}
              className="text-right font-bold text-lg"
              placeholder="0"
              required
            />
            <p className="text-xs text-muted-foreground">
              Maximum : {resteAPayer.toLocaleString('fr-FR')} Ar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Mode de paiement *</Label>
            <Select 
              value={modePaiement} 
              onValueChange={(v: ModePaiement) => setModePaiement(v)}
              required
            >
              <SelectTrigger id="mode">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="virement">Virement bancaire</SelectItem>
                <SelectItem value="cheque">Chèque</SelectItem>
                <SelectItem value="carte">Carte bancaire</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Référence (facultatif)</Label>
            <Input
              id="reference"
              placeholder="N° chèque, référence virement..."
              value={referencePaiement}
              onChange={(e) => setReferencePaiement(e.target.value)}
            />
          </div>

          {localError && (
            <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 text-sm">
              {localError}
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !montantPaye || Number(montantPaye) === 0 || Number(montantPaye) > resteAPayer}
              style={{ backgroundColor: COLOR }}
              className="text-white hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : vraiImpayeId ? (
                "Payer"
              ) : (
                "Créer l'impayé"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}