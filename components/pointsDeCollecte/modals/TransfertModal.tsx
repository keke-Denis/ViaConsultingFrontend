"use client"

import React, { useState, useEffect } from "react"
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
import { X, Loader2, Calendar, Scale, User, Package } from "lucide-react"
import { toast } from "react-toastify"

const COLOR = "#76bc21"

interface Transfert {
  id: number
  reference: string
  dateTransfert: string
  dateReception: string
  typeMP: "Feuilles" | "Clous" | "Griffes" | "HE Feuilles"
  poidsNet: number
  nomCollecteur: string
}

interface TransfertModalProps {
  mode: "add" | "edit"
  transfert?: Transfert | null
  onClose: () => void
  onSave: (data: any) => void
}

const TransfertModal: React.FC<TransfertModalProps> = ({ mode, transfert, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    dateTransfert: "",
    dateReception: "",
    typeMP: "",
    poidsNet: "",
    nomCollecteur: "",
  })

  // Fonction pour formater la date en jj/mm/aaaa
  const formatDateToFrenchInput = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Fonction pour parser la date du format input vers un format stockage
  const parseDateFromInput = (inputValue: string) => {
    if (!inputValue) return ""
    const [datePart, timePart] = inputValue.split('T')
    const [year, month, day] = datePart.split('-')
    const [hours, minutes] = timePart.split(':')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  useEffect(() => {
    if (mode === "edit" && transfert) {
      // Mode édition : pré-remplir avec les données existantes
      setFormData({
        dateTransfert: formatDateToFrenchInput(transfert.dateTransfert),
        dateReception: formatDateToFrenchInput(transfert.dateReception),
        typeMP: transfert.typeMP,
        poidsNet: transfert.poidsNet.toString(),
        nomCollecteur: transfert.nomCollecteur,
      })
    } else {
      // Mode ajout : valeurs par défaut
      const now = new Date()
      const today = new Date()
      today.setHours(17, 0, 0, 0) // Date de réception aujourd'hui à 17h00

      setFormData({
        dateTransfert: formatDateToFrenchInput(now.toISOString()),
        dateReception: formatDateToFrenchInput(today.toISOString()),
        typeMP: "",
        poidsNet: "",
        nomCollecteur: "",
      })
    }
  }, [mode, transfert])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.typeMP || !formData.poidsNet || !formData.nomCollecteur) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (!formData.dateTransfert || !formData.dateReception) {
      toast.error("Les dates sont requises")
      return
    }

    const poidsNetNum = Number(formData.poidsNet)
    if (isNaN(poidsNetNum) || poidsNetNum <= 0) {
      toast.error("Le poids net doit être un nombre positif")
      return
    }

    setIsLoading(true)
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const dataToSave = {
        dateTransfert: parseDateFromInput(formData.dateTransfert),
        dateReception: parseDateFromInput(formData.dateReception),
        typeMP: formData.typeMP as "Feuilles" | "Clous" | "Griffes" | "HE Feuilles",
        poidsNet: formData.poidsNet,
        nomCollecteur: formData.nomCollecteur
      }
      
      onSave(dataToSave)
      toast.success(mode === "add" ? "Transfert ajouté avec succès !" : "Transfert modifié avec succès !")
      onClose()
    } catch (error) {
      toast.error(`Erreur lors de ${mode === "add" ? "l'ajout" : "la modification"} du transfert`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#76bc21]">
                {mode === "add" ? "Ajouter un Transfert" : "Modifier le Transfert"}
              </h3>
              <p className="text-gray-500">
                {mode === "add" 
                  ? "Remplissez les informations du nouveau transfert" 
                  : `Modifier le transfert ${transfert?.reference}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type de MP */}
              <div className="space-y-2">
                <Label htmlFor="typeMP" className="font-medium">
                  Type de Matière Première <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.typeMP}
                  onValueChange={(value) => handleSelectChange("typeMP", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Feuilles">Feuilles</SelectItem>
                    <SelectItem value="Clous">Clous</SelectItem>
                    <SelectItem value="Griffes">Griffes</SelectItem>
                    <SelectItem value="HE Feuilles">HE Feuilles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Poids Net */}
              <div className="space-y-2">
                <Label htmlFor="poidsNet" className="font-medium">
                  Poids Net (kg) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="poidsNet"
                    name="poidsNet"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.poidsNet}
                    onChange={handleChange}
                    placeholder="Ex: 150.5"
                    className="pl-10"
                    required
                  />
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Date du transfert */}
              <div className="space-y-2">
                <Label htmlFor="dateTransfert" className="font-medium">
                  Date du transfert <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="dateTransfert"
                    name="dateTransfert"
                    type="datetime-local"
                    value={formData.dateTransfert}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Format: {formatDateForDisplay(formData.dateTransfert)}
                </p>
              </div>

              {/* Date de réception */}
              <div className="space-y-2">
                <Label htmlFor="dateReception" className="font-medium">
                  Date de réception <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="dateReception"
                    name="dateReception"
                    type="date"
                    value={formData.dateReception.split('T')[0]}
                    onChange={(e) => {
                      const dateValue = e.target.value
                      const timePart = formData.dateReception.includes('T') 
                        ? formData.dateReception.split('T')[1] 
                        : "17:00"
                      setFormData(prev => ({ 
                        ...prev, 
                        dateReception: `${dateValue}T${timePart}` 
                      }))
                    }}
                    min={getTodayDate()}
                    className="pl-10"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-2">
                  <Label htmlFor="heureReception" className="text-sm font-medium">
                    Heure de réception
                  </Label>
                  <Input
                    id="heureReception"
                    type="time"
                    value={formData.dateReception.split('T')[1] || "17:00"}
                    onChange={(e) => {
                      const timeValue = e.target.value
                      const datePart = formData.dateReception.split('T')[0]
                      setFormData(prev => ({ 
                        ...prev, 
                        dateReception: `${datePart}T${timeValue}` 
                      }))
                    }}
                    className="mt-1"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Aujourd'hui ({formatDateForDisplay(formData.dateReception)})
                </p>
              </div>

              {/* Nom Collecteur */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nomCollecteur" className="font-medium">
                  Nom du Collecteur <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="nomCollecteur"
                    name="nomCollecteur"
                    type="text"
                    value={formData.nomCollecteur}
                    onChange={handleChange}
                    placeholder="Ex: Jean Rakoto"
                    className="pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Aperçu des dates */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Aperçu des dates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Transfert prévu :</p>
                  <p className="font-medium">
                    {formData.dateTransfert ? formatDateForDisplay(formData.dateTransfert) : "Non définie"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Réception prévue :</p>
                  <p className="font-medium">
                    {formData.dateReception ? formatDateForDisplay(formData.dateReception) : "Non définie"}
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="hover:border-gray-300"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="text-white hover:bg-[#65a91d]"
                style={{ backgroundColor: COLOR }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === "add" ? "Ajout en cours..." : "Modification en cours..."}
                  </>
                ) : (
                  <>
                    {mode === "add" ? "Ajouter le Transfert" : "Modifier le Transfert"}
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

export default TransfertModal