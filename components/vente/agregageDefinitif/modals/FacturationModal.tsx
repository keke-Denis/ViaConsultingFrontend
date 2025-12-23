// components/agregageDefinitif/modals/FacturationModal.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, FileText, Calendar, DollarSign, Scale, Loader2 } from "lucide-react"
import { toast } from "react-toastify"

const COLOR = "#76bc21"

interface FacturationModalProps {
  test: any
  onClose: () => void
  onSubmit: () => void
}

const FacturationModal: React.FC<FacturationModalProps> = ({ test, onClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    setTimeout(() => {
      onSubmit()
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
              <h3 className="text-xl font-bold text-[#76bc21]">Générer la facture</h3>
              <p className="text-gray-500">Facture pour {test.reference}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de la facture */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Récapitulatif de la facture</h4>
              
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence:</span>
                  <span className="font-medium">{test.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{test.clientNom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date de facturation:</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {new Date(test.dateFacturation!).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix unitaire:</span>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">
                      {test.prixUnitaire?.toLocaleString("fr-FR")} Ar/kg
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Poids final:</span>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold">
                      {test.poidsFinal?.toLocaleString("fr-FR")} kg
                    </span>
                  </div>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-800 font-bold">Total à payer:</span>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-lg text-green-700">
                      {test.prixTotal?.toLocaleString("fr-FR")} Ar
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> La facture sera générée au format PDF avec toutes les informations ci-dessus.
                Vous pourrez ensuite la télécharger et l'envoyer au client.
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
                className="flex-1 text-white"
                style={{ backgroundColor: COLOR }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Générer la facture
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FacturationModal