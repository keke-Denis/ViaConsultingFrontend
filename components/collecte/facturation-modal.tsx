// components/collecte/facturation-modal.tsx
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
import { facturationApi, facturationUtils } from "@/lib/pvreception/facturation-api"
import type { CreateFacturationData } from "@/lib/pvreception/facturation-types"
import { PVReception } from "@/lib/pvreception/pvreception-types"

const COLOR = "#72bc21"

interface FacturationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pvReception: PVReception | null
  onSuccess?: () => void
}

export function FacturationModal({ open, onOpenChange, pvReception, onSuccess }: FacturationModalProps) {
  const [dateFacturation, setDateFacturation] = useState<Date>()
  const [modePaiement, setModePaiement] = useState<'especes' | 'virement' | 'cheque' | 'carte' | 'mobile_money'>('especes')
  const [referencePaiement, setReferencePaiement] = useState("")
  const [montantPaye, setMontantPaye] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (open && pvReception) {
      setDateFacturation(new Date())
      setModePaiement('especes')
      setReferencePaiement("")
      const detteRestante = pvReception.dette_fournisseur ?? pvReception.prix_total ?? 0
      setMontantPaye(detteRestante.toString())
      setLocalError(null)
    }
  }, [open, pvReception])

  // Formatage du montant affiché
  const formatMontant = (value: string) => {
    const num = value.replace(/\s/g, '')
    if (!num) return ''
    return parseInt(num).toLocaleString('fr-FR')
  }

  const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setMontantPaye(raw)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!pvReception || !dateFacturation || !montantPaye) {
      const msg = "Veuillez remplir tous les champs obligatoires"
      setLocalError(msg)
      toast.error(msg)
      return
    }

    const montant = parseInt(montantPaye) || 0
    const detteFournisseur = pvReception.dette_fournisseur || pvReception.prix_total || 0

    if (montant <= 0) {
      toast.error("Le montant doit être supérieur à 0")
      return
    }
    if (montant > detteFournisseur) {
      toast.error(`Le montant dépasse la dette fournisseur (${detteFournisseur.toLocaleString('fr-FR')} Ar)`)
      return
    }

    setIsSubmitting(true)

    try {
      const facturationData: CreateFacturationData = {
        pv_reception_id: pvReception.id,
        date_facturation: dateFacturation.toISOString().split('T')[0],
        mode_paiement: modePaiement,
        montant_total: pvReception.prix_total,
        montant_paye: montant,
        reference_paiement: referencePaiement || undefined
      }

      const validationErrors = facturationUtils.validerDonnees(facturationData)
      if (validationErrors.length > 0) {
        const msg = validationErrors.join(', ')
        setLocalError(msg)
        toast.error(msg)
        return
      }

      const response = await facturationApi.create(facturationData)

      // Succès
      if (response.status === 'success') {
        toast.success("Facturation créée avec succès !")
        onSuccess?.()
        onOpenChange(false)
        return
      }

      // Gestion spécifique de l'erreur "solde insuffisant"
      if (response.message?.includes("Solde utilisateur insuffisant")) {
        const message = `Solde utilisateur insuffisant !\nMontant demandé : ${montant.toLocaleString('fr-FR')} Ar`

        setLocalError(message.replace(/\n/g, ' '))
        toast.error(message, { autoClose: 8000 })
        return
      }

      // Autres erreurs API
      throw new Error(response.message || "Erreur inconnue lors de la création")

    } catch (error: any) {
      console.error("Erreur facturation:", error)

      let errorMessage = "Une erreur est survenue lors de la création de la facturation"

      // Erreur 400/422 avec détail dans le body
      if (error.response?.status === 400 || error.response?.status === 422) {
        const data = error.response.data
        if (data?.message?.includes("Solde utilisateur insuffisant")) {
          errorMessage = `Solde insuffisant ! Montant demandé : ${Number(montantPaye).toLocaleString('fr-FR')} Ar`
        } else if (data?.message) {
          errorMessage = data.message
        } else if (data?.errors) {
          errorMessage = Object.values(data.errors).flat().join(', ')
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

  const modesPaiement = [
    { value: 'especes', label: 'Espèces' },
    { value: 'virement', label: 'Virement bancaire' },
    { value: 'cheque', label: 'Chèque' },
    { value: 'carte', label: 'Carte bancaire' },
    { value: 'mobile_money', label: 'Mobile Money' }
  ]

  const montantAffiche = montantPaye ? parseInt(montantPaye).toLocaleString('fr-FR') : '0'

  // Calcul du montant numérique et contrôle si dépasse la dette
  const detteFournisseur = pvReception?.dette_fournisseur || pvReception?.prix_total || 0
  const montantNum = montantPaye ? parseInt(montantPaye) : 0
  const montantDepasse = montantNum > detteFournisseur

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" style={{ color: COLOR }} />
            Nouvelle Facturation Fournisseur
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Infos PV */}
          {pvReception && (
            <div className="bg-linear-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-sm mb-2 text-green-800">PV de Réception</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-600">N° Doc:</span> <strong>{pvReception.numero_doc}</strong></div>
                <div><span className="text-gray-600">Total:</span> <span>{pvReception.prix_total.toLocaleString('fr-FR')} Ar</span></div>
                <div className="col-span-2">
                  <span className="text-gray-600">Dette à payer:</span>
                  <span className="ml-2 font-bold text-red-600 text-lg">
                    {detteFournisseur.toLocaleString('fr-FR')} Ar
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Date de facturation *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFacturation && "text-muted-foreground")} disabled>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFacturation ? format(dateFacturation, "PPP", { locale: fr }) : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFacturation} onSelect={setDateFacturation} locale={fr} disabled />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Montant payé (Ar) *</Label>
            <Input
              type="text"
              value={montantAffiche}
              onChange={handleMontantChange}
              placeholder="0"
              className="text-right text-xl font-bold h-12 px-3"
            />
            <p className="text-xs text-gray-500">
              Dette restante : <strong>{detteFournisseur.toLocaleString('fr-FR')} Ar</strong>
            </p>
            {montantDepasse && (
              <p className="text-sm text-red-600">
                Le montant saisi ({montantNum.toLocaleString('fr-FR')} Ar) dépasse la dette fournisseur ({detteFournisseur.toLocaleString('fr-FR')} Ar).
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mode de paiement *</Label>
            <Select value={modePaiement} onValueChange={(v: any) => setModePaiement(v)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choisir le mode" />
              </SelectTrigger>
              <SelectContent>
                {modesPaiement.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Référence (facultatif)</Label>
            <Input
              placeholder="N° chèque, référence virement..."
              value={referencePaiement}
              onChange={(e) => setReferencePaiement(e.target.value)}
              className="h-12 px-3"
            />
          </div>

          {localError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
              {localError}
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !dateFacturation || !montantPaye || montantDepasse}
              style={{ backgroundColor: COLOR }}
              className="text-white font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer la facturation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}