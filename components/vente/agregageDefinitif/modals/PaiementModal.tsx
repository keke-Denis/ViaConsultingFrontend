// PaiementModal.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, DollarSign, Scale, Calendar, Loader2 } from "lucide-react"
import { toast } from "react-toastify"

const COLOR = "#76bc21"

interface PaiementModalProps {
  test: any
  onClose: () => void
  onSubmit: (data: { prixUnitaire: number; poidsFinal: number }) => void
}

const PaiementModal: React.FC<PaiementModalProps> = ({ test, onClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    prixUnitaire: test.prixUnitaire || "",
    poidsFinal: test.poidsFinal || test.poidsTeste
  })

  const prixTotal = formData.prixUnitaire && formData.poidsFinal 
    ? Number(formData.prixUnitaire) * Number(formData.poidsFinal)
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.prixUnitaire || !formData.poidsFinal) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      onSubmit({
        prixUnitaire: Number(formData.prixUnitaire),
        poidsFinal: Number(formData.poidsFinal)
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
              <h3 className="text-xl font-bold text-[#76bc21]">Paiement - {test.reference}</h3>
              <p className="text-gray-500">Enregistrer le paiement pour cet agrégat</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date de facturation (readOnly) */}
            <div className="space-y-2">
              <Label>Date de facturation</Label>
              <div className="relative">
                <Input
                  value={new Date().toLocaleDateString("fr-FR")}
                  readOnly
                  className="pl-10 bg-gray-50"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Prix unitaire */}
            <div className="space-y-2">
              <Label>Prix unitaire (Ar/kg)</Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.prixUnitaire}
                  onChange={(e) => setFormData({...formData, prixUnitaire: e.target.value})}
                  placeholder="Ex: 50000"
                  className="pl-10 text-right"
                  required
                />
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Poids final */}
            <div className="space-y-2">
              <Label>Poids final (kg)</Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.poidsFinal}
                  onChange={(e) => setFormData({...formData, poidsFinal: e.target.value})}
                  placeholder="Ex: 85"
                  className="pl-10 text-right"
                  required
                />
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Prix total (readOnly) */}
            <div className="space-y-2">
              <Label>Prix total</Label>
              <div className="relative">
                <Input
                  value={prixTotal.toLocaleString("fr-FR") + " Ar"}
                  readOnly
                  className="pl-10 bg-gray-50 font-bold text-green-700"
                />
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-500">
                Calcul automatique: {formData.prixUnitaire || 0} × {formData.poidsFinal} = {prixTotal.toLocaleString("fr-FR")} Ar
              </p>
            </div>

            {/* Boutons */}
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
                disabled={isLoading || !formData.prixUnitaire || !formData.poidsFinal}
                className="flex-1 text-white"
                style={{ backgroundColor: COLOR }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Enregistrer le paiement
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

export default PaiementModal