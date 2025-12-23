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
import { FlaskRound, Calendar } from "lucide-react"

const COLOR = "#76bc21"

interface DemarrerDistillationModalProps {
  onClose: () => void
  onStart: (data: any) => void
  initialIdAmbalic?: string
  initialPoidsDistiller?: number | string
  initialTypeMatiere?: string
  initialSite?: string
}

const DemarrerDistillationModal: React.FC<DemarrerDistillationModalProps> = ({ onClose, onStart, initialIdAmbalic, initialPoidsDistiller, initialTypeMatiere, initialSite }) => {
  const [formData, setFormData] = useState({
    idAmbalic: initialIdAmbalic ?? "",
    poidsDistiller: initialPoidsDistiller !== undefined && initialPoidsDistiller !== null ? String(initialPoidsDistiller) : "",
    typeMatierePremiere: initialTypeMatiere ?? "",
    usine: initialSite ?? "",
    dureeDistillation: "",
    poidsChaufage: "",
    carburant: "",
    mainOeuvre: "",
  })

  const today = new Date().toLocaleDateString('fr-FR')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // If parent provides new initial values after mount, sync them
  React.useEffect(() => {
    if (initialIdAmbalic) {
      setFormData(prev => ({ ...prev, idAmbalic: initialIdAmbalic }))
    }
    if (initialPoidsDistiller !== undefined && initialPoidsDistiller !== null) {
      setFormData(prev => ({ ...prev, poidsDistiller: String(initialPoidsDistiller) }))
    }
    if (initialTypeMatiere) {
      setFormData(prev => ({ ...prev, typeMatierePremiere: initialTypeMatiere }))
    }
    if (initialSite) {
      setFormData(prev => ({ ...prev, usine: initialSite }))
    }
  }, [initialIdAmbalic, initialPoidsDistiller, initialTypeMatiere, initialSite])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.idAmbalic || !formData.poidsDistiller || !formData.typeMatierePremiere) {
      toast.error("Veuillez remplir les champs obligatoires")
      return
    }
    onStart(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#76bc21]">Démarrer une nouvelle distillation</h3>
              <p className="text-gray-500">Remplissez les informations pour commencer la distillation</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date de début */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateDebut" className="text-sm font-medium">
                  Date de début de la distillation
                </Label>
                <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg bg-gray-50">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{today}</span>
                </div>
                <p className="text-xs text-gray-500">Date automatique (read-only)</p>
              </div>

              {/* ID Alambic */}
              <div className="space-y-2">
                <Label htmlFor="idAmbalic" className="text-sm font-medium">
                  ID Alambic <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.idAmbalic}
                  onValueChange={(value) => handleSelectChange("idAmbalic", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner ID ambalic dans input" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alambic site1 N1">Alambic site1 N1</SelectItem>
                    <SelectItem value="Alambic site2 N2">Alambic site2 N2</SelectItem>
                    <SelectItem value="Alambic site2 N3">Alambic site2 N3</SelectItem>
                    <SelectItem value="Alambic site2 N4">Alambic site2 N4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Poids à distiller et Type de matière */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poidsDistiller" className="text-sm font-medium">
                  Poids à distiller (kg) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="poidsDistiller"
                  name="poidsDistiller"
                  type="number"
                  value={formData.poidsDistiller}
                  onChange={handleChange}
                  placeholder="Ex: 500"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeMatierePremiere" className="text-sm font-medium">
                  Type de matière première <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="typeMatierePremiere"
                  name="typeMatierePremiere"
                  value={formData.typeMatierePremiere}
                  onChange={handleChange}
                  placeholder="Ex: Feuille, Clous, Griffes"
                  className="w-full bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            {/* Usine et Durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usine" className="text-sm font-medium">
                  Usine
                </Label>
                {/* Show usine/site as read-only value populated from initialSite */}
                <Input
                  id="usine"
                  name="usine"
                  value={formData.usine}
                  readOnly
                  className="w-full bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dureeDistillation" className="text-sm font-medium">
                  Durée de la distillation (heures)
                </Label>
                <Input
                  id="dureeDistillation"
                  name="dureeDistillation"
                  type="number"
                  value={formData.dureeDistillation}
                  onChange={handleChange}
                  placeholder="Ex: 4"
                  className="w-full"
                />
              </div>
            </div>

            {/* Poids de chauffage et Carburant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poidsChaufage" className="text-sm font-medium">
                  Poids de chauffage (m³)
                </Label>
                <Input
                  id="poidsChaufage"
                  name="poidsChaufage"
                  type="number"
                  value={formData.poidsChaufage}
                  onChange={handleChange}
                  placeholder="Ex: 100"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carburant" className="text-sm font-medium">
                  Carburant (litres)
                </Label>
                <Input
                  id="carburant"
                  name="carburant"
                  type="number"
                  value={formData.carburant}
                  onChange={handleChange}
                  placeholder="Ex: 20"
                  className="w-full"
                />
              </div>
            </div>

            {/* Main d'œuvre */}
            <div className="space-y-2">
              <Label htmlFor="mainOeuvre" className="text-sm font-medium">
                Main d'œuvre (personnes)
              </Label>
              <Input
                id="mainOeuvre"
                name="mainOeuvre"
                type="number"
                value={formData.mainOeuvre}
                onChange={handleChange}
                placeholder="Ex: 3"
                className="w-full"
              />
            </div>

            <div className="pt-6 border-t border-gray-200">
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
                  <FlaskRound className="h-4 w-4 mr-2" />
                  Démarrer la distillation
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DemarrerDistillationModal