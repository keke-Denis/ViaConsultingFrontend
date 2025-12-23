"use client"

import { useState, useEffect } from "react"
import { Building, User, Phone, FileText, X } from "lucide-react"
import { toast } from 'react-toastify'
import { destinateurApi } from "@/lib/destinateur/destinateur-api"
import type { Destinateur, DestinateurFormData } from "@/lib/destinateur/destinateur-types"

const COLOR = "#76bc21"

type ModalMode = "add" | "edit" | "view"

interface DestinataireModalProps {
  isOpen: boolean
  onClose: () => void
  mode: ModalMode
  destinateur?: Destinateur | null
  onSuccess: (destinateur: Destinateur) => void
}

const initialFormData: DestinateurFormData = {
  nom_entreprise: "",
  nom_prenom: "",
  contact: "",
  observation: ""
}

export default function DestinataireModal({
  isOpen,
  onClose,
  mode,
  destinateur,
  onSuccess
}: DestinataireModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<DestinateurFormData>(initialFormData)

  // Réinitialisation du formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      if (destinateur && (mode === "edit" || mode === "view")) {
        setFormData({
          nom_entreprise: destinateur.nom_entreprise,
          nom_prenom: destinateur.nom_prenom,
          contact: destinateur.contact,
          observation: destinateur.observation || ""
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [isOpen, destinateur, mode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "view") return

    if (!formData.nom_entreprise.trim() || !formData.nom_prenom.trim() || !formData.contact.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires", {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    setLoading(true)
    try {
      const result = mode === "add"
        ? await destinateurApi.create(formData)
        : await destinateurApi.update(destinateur!.id, formData)

      onSuccess(result)
      setFormData(initialFormData)
      
      toast.success(
        mode === "add" 
          ? "Destinataire créé avec succès" 
          : "Destinataire modifié avec succès",
        {
          position: "top-right",
          autoClose: 3000,
        }
      )
      
      onClose()
    } catch (err: any) {
      console.error("Erreur complète :", err.response?.data || err)

      let message = "Erreur lors de la sauvegarde du destinataire"
      if (err.response?.data) {
        if (err.response.data.message) {
          message = err.response.data.message
        } else if (err.response.data.errors) {
          const errors = err.response.data.errors
          message = Object.values(errors).flat().join(', ')
        }
      }

      toast.error(message, {
        position: "top-center",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData(initialFormData)
    onClose()
  }

  if (!isOpen) return null

  const title = mode === "add" ? "Nouveau Destinataire" : mode === "edit" ? "Modifier" : "Détails"
  const isViewMode = mode === "view"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: COLOR }}>
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-600">
                  {mode === "add" && "Ajouter un nouveau destinataire"}
                  {mode === "edit" && "Modifier les informations"}
                  {mode === "view" && "Informations du destinataire"}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Formulaire avec autocomplete désactivé partout */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
            {/* Champ : Nom de l'entreprise */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Nom de l'entreprise *</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                <input
                  name="nom_entreprise"
                  type="text"
                  required
                  value={formData.nom_entreprise}
                  onChange={handleChange}
                  disabled={isViewMode}
                  autoComplete="off"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                  placeholder="Ex: SARL Dupont"
                />
              </div>
            </div>

            {/* Champ : Nom & Prénom */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Nom & Prénom *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                <input
                  name="nom_prenom"
                  type="text"
                  required
                  value={formData.nom_prenom}
                  onChange={handleChange}
                  disabled={isViewMode}
                  autoComplete="off"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                  placeholder="Ex: Jean Martin"
                />
              </div>
            </div>

            {/* Champ : Téléphone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Téléphone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                <input
                  name="contact"
                  type="tel"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  disabled={isViewMode}
                  autoComplete="off"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                  placeholder="Ex: 0341234567"
                />
              </div>
            </div>

            {/* Champ : Observation */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Observation</label>
              <div className="relative">
                <FileText className="absolute left-3 top-4 h-4 w-4" style={{ color: COLOR }} />
                <textarea
                  name="observation"
                  value={formData.observation || ""}
                  onChange={handleChange}
                  disabled={isViewMode}
                  rows={3}
                  autoComplete="off"
                  className="pl-10 w-full px-3 py-2 pt-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                  placeholder="Notes ou observations..."
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                {isViewMode ? "Fermer" : "Annuler"}
              </button>

              {!isViewMode && (
                <button
                  type="submit"
                  disabled={loading || !formData.nom_entreprise.trim() || !formData.nom_prenom.trim() || !formData.contact.trim()}
                  className="flex-1 px-6 py-3 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  style={{ backgroundColor: COLOR }}
                >
                  <Building className="w-4 h-4" />
                  {loading ? "Enregistrement..." : mode === "edit" ? "Sauvegarder" : "Ajouter"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}