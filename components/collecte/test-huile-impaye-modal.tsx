"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import { impayeService, impayeUtils } from "@/lib/TestHuille/Impaye-api"
import { useSolde } from "@/contexts/paimentEnAvance/solde-context"
import type { HEImpaye } from "@/lib/TestHuille/Impaye-types"
import { toast } from "react-toastify"

interface TestHuileImpayeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  impaye: HEImpaye
  onSuccess: () => void
}

export function TestHuileImpayeModal({ open, onOpenChange, impaye, onSuccess }: TestHuileImpayeModalProps) {
  const { refreshSoldes } = useSolde()
  const [montantPaiement, setMontantPaiement] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [erreurs, setErreurs] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setMontantPaiement("")
      setErreurs([])
    }
  }, [open, impaye])

  // Validation en temps réel
  useEffect(() => {
    const montantNumerique = parseFloat(montantPaiement) || 0
    const nouvellesErreurs: string[] = []

    if (!montantPaiement || montantNumerique <= 0) {
      nouvellesErreurs.push('Le montant à payer est requis et doit être positif')
    }

    if (montantNumerique > impaye.reste_a_payer) {
      nouvellesErreurs.push(`Le montant ne peut pas dépasser ${impayeUtils.formaterMontant(impaye.reste_a_payer)}`)
    }

    setErreurs(nouvellesErreurs)
  }, [montantPaiement, impaye.reste_a_payer])

  const montantNumerique = parseFloat(montantPaiement) || 0

  const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valeur = e.target.value
    
    // Permettre la saisie de nombres uniquement
    if (valeur === '' || /^\d*\.?\d*$/.test(valeur)) {
      setMontantPaiement(valeur)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (erreurs.length > 0 || montantNumerique <= 0) {
      toast.error("Veuillez corriger les erreurs avant de soumettre")
      return
    }

    setLoading(true)
    try {
      console.log('🔄 Début du paiement impayé:', {
        facturation_id: impaye.facturation_id,
        montant_paye: montantNumerique,
        reste_a_payer: impaye.reste_a_payer
      })

      const response = await impayeService.create({
        facturation_id: impaye.facturation_id,
        montant_paye: montantNumerique
      })

      console.log('📥 Réponse complète du serveur:', response)

      if (response.success) {
        toast.success(response.message || "Paiement effectué avec succès")
        await refreshSoldes()
        onSuccess()
        onOpenChange(false)
      } else {
        // Gérer les erreurs métier du serveur
        const messageErreur = response.message || "Erreur lors du paiement"
        console.error('❌ Erreur métier:', messageErreur)
        toast.error(messageErreur)
      }
    } catch (error: any) {
      console.error('💥 Erreur complète paiement impayé:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      // Message d'erreur plus spécifique
      let messageErreur = "Erreur lors du paiement"
      
      if (error.response?.status === 500) {
        messageErreur = "Erreur serveur. Veuillez réessayer ou contacter l'administrateur."
      } else if (error.response?.data?.message) {
        messageErreur = error.response.data.message
      }
      
      toast.error(messageErreur)
    } finally {
      setLoading(false)
    }
  }

  const pourcentagePaye = impayeUtils.calculerPourcentagePaye(impaye.montant_paye, impaye.montant_du)
  const nouveauPourcentage = impayeUtils.calculerPourcentagePaye(
    impaye.montant_paye + montantNumerique, 
    impaye.montant_du
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement d'impayé
          </DialogTitle>
          <DialogDescription>
            Règlement du solde restant pour cette facturation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations de la facturation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Informations de la facturation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant total:</span>
                <span className="font-medium">{impayeUtils.formaterMontant(impaye.montant_du)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Déjà payé:</span>
                <span className="font-medium text-green-600">
                  {impayeUtils.formaterMontant(impaye.montant_paye)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reste à payer:</span>
                <span className="font-medium text-orange-600">
                  {impayeUtils.formaterMontant(impaye.reste_a_payer)}
                </span>
              </div>
              
              {/* Barre de progression */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs">
                  <span>Progression actuelle:</span>
                  <span>{pourcentagePaye}%</span>
                </div>
                <Progress value={pourcentagePaye} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de paiement */}
          <div className="space-y-3">
            <Label htmlFor="montant">Montant à payer *</Label>
            <Input
              id="montant"
              type="text"
              inputMode="decimal"
              placeholder="Entrez le montant à payer"
              value={montantPaiement}
              onChange={handleMontantChange}
              className={erreurs.length > 0 ? "border-red-500 focus:border-red-500" : ""}
            />

            {/* Aperçu du nouveau statut */}
            {montantNumerique > 0 && (
              <div className="text-sm space-y-1 p-2 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex justify-between">
                  <span>Nouveau total payé:</span>
                  <span className="font-medium">
                    {impayeUtils.formaterMontant(impaye.montant_paye + montantNumerique)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Nouveau reste:</span>
                  <span className="font-medium">
                    {impayeUtils.formaterMontant(impaye.reste_a_payer - montantNumerique)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Nouvelle progression:</span>
                  <span className="font-medium">{nouveauPourcentage}%</span>
                </div>
              </div>
            )}

            {/* Messages d'erreur personnalisés */}
            {erreurs.map((erreur, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{erreur}</span>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || erreurs.length > 0 || montantNumerique <= 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payer {montantNumerique > 0 ? impayeUtils.formaterMontant(montantNumerique) : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}