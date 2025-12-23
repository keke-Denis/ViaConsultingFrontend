// components/test-huile/test-huile-validation-modal.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Scale, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { validationService, validationHuileUtils } from "@/lib/TestHuille/validation-huile-api"
import { useSolde } from "@/contexts/paimentEnAvance/solde-context"
import type { HETester } from "@/lib/TestHuille/Tester-huile-types"
import type { CreateHEValidationData } from "@/lib/TestHuille/validation-huile-types"

interface TestHuileValidationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  test: HETester | null
  onSuccess?: () => void
}

export function TestHuileValidationModal({ open, onOpenChange, test, onSuccess }: TestHuileValidationModalProps) {
  const { refreshSoldes } = useSolde()
  const [formData, setFormData] = useState({
    decision: "" as "Accepter" | "Refuser" | "A retraiter" | "",
    observation_generale: "",
    poids_agreer: "",
    observation_ecart_poids: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && test?.fiche_reception) {
      const poidsBrut = test.fiche_reception.poids_brut || 0
      setFormData({
        decision: "",
        observation_generale: "",
        poids_agreer: poidsBrut.toString(),
        observation_ecart_poids: ""
      })
    }
  }, [open, test])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!test || !test.fiche_reception) {
      toast.error("Aucun test valide sélectionné")
      return
    }

    if (!formData.decision) {
      toast.error("Veuillez sélectionner une décision")
      return
    }

    // Préparer les données pour la validation
    const submitData: CreateHEValidationData = {
      fiche_reception_id: test.fiche_reception.id,
      test_id: test.id,
      decision: formData.decision,
      observation_generale: formData.observation_generale || null,
      observation_ecart_poids: formData.observation_ecart_poids || null,
      poids_agreer: formData.poids_agreer ? parseFloat(formData.poids_agreer) : null
    }

    console.log('🔍 Données à soumettre pour validation:', {
      fiche_reception_id: submitData.fiche_reception_id,
      test_id: submitData.test_id,
      decision: submitData.decision,
      poids_agreer: submitData.poids_agreer,
      test_info: {
        id: test.id,
        fiche_reception_id: test.fiche_reception.id
      }
    })

    // Validation avec les utilitaires
    const erreurs = validationHuileUtils.validerDonnees(submitData)
    if (erreurs.length > 0) {
      erreurs.forEach(erreur => toast.error(erreur))
      return
    }

    // Validation supplémentaire pour TypeScript
    const poidsAgreeValue = submitData.poids_agreer
    if (poidsAgreeValue !== null && poidsAgreeValue !== undefined && poidsAgreeValue < 0) {
      toast.error("Le poids agréé ne peut pas être négatif")
      return
    }

    setIsSubmitting(true)

    try {
      console.debug('🚀 Envoi de la validation pour test:', test.id, 'avec données:', submitData)
      const response = await validationService.create(submitData)

      console.log('✅ Réponse API validation:', response)

      if (response.success) {
        toast.success(`Validation enregistrée avec succès !`)
        
        // Vérifier que le statut a bien changé
        if (response.data.fiche_reception?.statut) {
          const nouveauStatut = response.data.fiche_reception.statut
          toast.info(`Nouveau statut: ${nouveauStatut}`)
        }
        
        // Rafraîchir le solde après succès
        await refreshSoldes()
        
        onSuccess?.()
        onOpenChange(false)
      } else {
        console.error('❌ Erreur API validation:', response)
        if (response.errors) {
          Object.values(response.errors).forEach((error: any) => {
            if (Array.isArray(error)) {
              error.forEach(err => toast.error(err))
            } else {
              toast.error(error)
            }
          })
        } else {
          toast.error(response.message || "Erreur lors de l'enregistrement de la validation")
        }
      }
    } catch (error: any) {
      console.error('💥 Erreur validation test:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      })
      
      // Gestion spécifique des erreurs 422 (validation)
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors
        if (validationErrors) {
          Object.values(validationErrors).forEach((errorArray: any) => {
            if (Array.isArray(errorArray)) {
              errorArray.forEach(err => toast.error(err))
            } else {
              toast.error(errorArray)
            }
          })
        } else {
          toast.error("Erreur de validation des données")
        }
      } else {
        toast.error("Erreur lors de l'enregistrement de la validation")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculerEcart = (): number => {
    if (!test?.fiche_reception?.poids_brut || !formData.poids_agreer) return 0
    const poidsBrut = test.fiche_reception.poids_brut
    const poidsAgree = parseFloat(formData.poids_agreer)
    if (isNaN(poidsAgree)) return 0
    return poidsBrut - poidsAgree
  }

  const ecartPoids = calculerEcart()

  if (!test) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" style={{ color: "#76bc21" }} />
            Validation du test
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-4">
          <p>Fiche: <strong>{test.fiche_reception?.numero_document || 'N/A'}</strong></p>
          {test.fiche_reception?.fournisseur && (
            <p>Fournisseur: {test.fiche_reception.fournisseur.prenom} {test.fiche_reception.fournisseur.nom}</p>
          )}
          <p>Poids brut: {test.fiche_reception?.poids_brut || 0} kg</p>
          <p>Test ID: {test.id}</p>
          <p>Fiche ID: {test.fiche_reception?.id}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Décision finale *</Label>
            <Select
              value={formData.decision}
              onValueChange={(value: "Accepter" | "Refuser" | "A retraiter") => 
                setFormData({ ...formData, decision: value })
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Choisir une décision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Accepter">Accepter</SelectItem>
                <SelectItem value="Refuser">Refuser</SelectItem>
                <SelectItem value="A retraiter">À retraiter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observation générale</Label>
            <Textarea
              placeholder="Notes supplémentaires..."
              value={formData.observation_generale}
              onChange={(e) => setFormData({ ...formData, observation_generale: e.target.value })}
              className="min-h-24 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Scale className="h-4 w-4" /> Poids agréé (kg)
            </Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.poids_agreer}
              onChange={(e) => setFormData({ ...formData, poids_agreer: e.target.value })}
              className="h-10"
            />
          </div>

          {formData.poids_agreer && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Scale className="h-4 w-4" /> Écart de poids (kg)
              </Label>
              <Input
                type="number"
                step="0.01"
                value={ecartPoids.toFixed(2)}
                readOnly
                className="h-10 bg-muted"
              />
              <div className="text-xs text-muted-foreground">
                {ecartPoids > 0 ? `Surplus de ${ecartPoids.toFixed(2)} kg` : 
                 ecartPoids < 0 ? `Déficit de ${Math.abs(ecartPoids).toFixed(2)} kg` : 
                 'Aucun écart'}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Observation écart de poids</Label>
            <Textarea
              placeholder="Commentaire sur l'écart de poids..."
              value={formData.observation_ecart_poids}
              onChange={(e) => setFormData({ ...formData, observation_ecart_poids: e.target.value })}
              className="min-h-20 resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: "#76bc21" }}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Valider le test"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}