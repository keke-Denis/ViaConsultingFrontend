// components/agregageDefinitif/modals/ValidationTestModal.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "react-toastify"

const COLOR = "#76bc21"

interface ValidationTestModalProps {
  test: any
  onClose: () => void
  onValidate: (data: { decision: "Validé" | "Refusé"; commentaire?: string }) => void
}

const ValidationTestModal: React.FC<ValidationTestModalProps> = ({ test, onClose, onValidate }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [decision, setDecision] = useState<"Validé" | "Refusé">("Validé")
  const [commentaire, setCommentaire] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!decision) {
      toast.error("Veuillez sélectionner une décision")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      onValidate({
        decision,
        commentaire: commentaire.trim() || undefined
      })
      setIsLoading(false)
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#76bc21]">Validation du test</h3>
              <p className="text-gray-500">Décision finale pour {test.reference}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Aperçu du test */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Informations du test</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Référence:</span>
                <span className="font-medium">{test.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Client:</span>
                <span className="font-medium">{test.clientNom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type HE:</span>
                <span className="font-medium">{test.typeHE}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Poids testé:</span>
                <span className="font-semibold">{test.poidsTeste.toLocaleString("fr-FR")} kg</span>
              </div>
            </div>
          </div>

          {/* Message de confirmation */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Vous êtes sur de valider cette test ?</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Cette action définit le statut final du test. Une fois validé, le processus de paiement pourra être initié.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Choix de la décision */}
            <div className="space-y-3">
              <Label>Décision</Label>
              <RadioGroup
                value={decision}
                onValueChange={(value) => setDecision(value as "Validé" | "Refusé")}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Validé" id="valide" className="text-green-600" />
                  <Label htmlFor="valide" className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">Valider le test</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Refusé" id="refuse" className="text-red-600" />
                  <Label htmlFor="refuse" className="flex items-center gap-2 cursor-pointer">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-700">Refuser le test</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Commentaire facultatif */}
            <div className="space-y-2">
              <Label htmlFor="commentaire">
                Commentaire {decision === "Refusé" ? "(Recommandé)" : "(Optionnel)"}
              </Label>
              <Textarea
                id="commentaire"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder={
                  decision === "Refusé" 
                    ? "Expliquez les raisons du refus..." 
                    : "Ajoutez un commentaire si nécessaire..."
                }
                className="min-h-[100px] resize-y"
              />
              <p className="text-xs text-gray-500">
                Ce commentaire sera visible dans l'historique de validation.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={`flex-1 text-white ${
                  decision === "Validé" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validation...
                  </>
                ) : decision === "Validé" ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Valider le test
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Refuser le test
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Note selon la décision */}
          <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              {decision === "Validé" ? (
                "Le test sera marqué comme validé. Vous pourrez ensuite procéder au paiement."
              ) : (
                "Le test sera marqué comme refusé. Aucun paiement ne pourra être effectué."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValidationTestModal