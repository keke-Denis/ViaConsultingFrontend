"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "react-toastify"
import { CheckCircle, Calendar } from "lucide-react"

const COLOR = "#76bc21"

interface Distillation {
  id: number
  reference: string
  idAmbalic: string
  quantiteDisponible: number
  quantiteRestant: number
  siteCollecte: string
  typeMatierePremiere: string
  status: "en cours" | "terminée" | "en attente"
}

interface TerminerDistillationModalProps {
  distillation: Distillation
  onClose: () => void
  onTerminate: (data: any) => void
}

const TerminerDistillationModal: React.FC<TerminerDistillationModalProps> = ({ 
  distillation, 
  onClose, 
  onTerminate 
}) => {
  const [formData, setFormData] = useState({
    quantiteResultat: "",
    typeHEObtenu: "",
  })

  const today = new Date().toLocaleDateString('fr-FR')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.quantiteResultat || !formData.typeHEObtenu) {
      toast.error("Veuillez remplir tous les champs")
      return
    }
    
    const terminationData = {
      distillationId: distillation.id,
      dateFin: today,
      ...formData
    }
    
    onTerminate(terminationData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Terminer la distillation</h3>
          <p className="text-gray-600">Remplissez les informations pour terminer la distillation</p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Informations de la distillation */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Référence:</span>
                <p className="font-medium">{distillation.reference}</p>
              </div>
              <div>
                <span className="text-gray-500">Matière:</span>
                <p className="font-medium">{distillation.typeMatierePremiere}</p>
              </div>
              <div>
                <span className="text-gray-500">Site:</span>
                <p className="font-medium">{distillation.siteCollecte}</p>
              </div>
              <div>
                <span className="text-gray-500">Qte traitée:</span>
                <p className="font-medium">{distillation.quantiteDisponible - distillation.quantiteRestant} kg</p>
              </div>
            </div>
          </div>

          {/* Date de fin */}
          <div className="space-y-2">
            <Label htmlFor="dateFin" className="text-sm font-medium">
              Date fin de la distillation
            </Label>
            <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg bg-gray-50">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{today}</span>
            </div>
            <p className="text-xs text-gray-500">Date automatique (read-only)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantité du résultat obtenu */}
            <div className="space-y-2">
              <Label htmlFor="quantiteResultat" className="text-sm font-medium">
                Quantité du résultat obtenu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantiteResultat"
                name="quantiteResultat"
                type="number"
                value={formData.quantiteResultat}
                onChange={handleChange}
                placeholder="Ex: 45"
                className="w-full"
              />
            </div>

            {/* Type HE obtenu */}
            <div className="space-y-2">
              <Label htmlFor="typeHEObtenu" className="text-sm font-medium">
                Type HE obtenu <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.typeHEObtenu}
                onValueChange={(value) => handleSelectChange("typeHEObtenu", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez un type d'HE" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HE Feuilles">HE Feuilles</SelectItem>
                  <SelectItem value="HE Clous">HE Clous</SelectItem>
                  <SelectItem value="HE Griffes">HE Griffes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 hover:border-[#76bc21] hover:text-[#76bc21]"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  style={{ backgroundColor: COLOR }}
                  className="flex-1 text-white hover:opacity-90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer la fin
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TerminerDistillationModal