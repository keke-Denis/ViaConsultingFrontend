"use client"

import { User, FileText, Phone, Car, MapPin, Calendar, X } from "lucide-react"
import { useState, useEffect } from "react"
import type { LivreurFormData, LivreurFromAPI } from "@/lib/livreur/livreur-types"

const COLOR = "#72bc21"

interface ModifierLivreurModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LivreurFormData) => void
  livreur: LivreurFromAPI
}

export default function ModifierLivreurModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  livreur 
}: ModifierLivreurModalProps) {
  
  const [formData, setFormData] = useState<LivreurFormData>({
    nom: "",
    prenom: "",
    cin: "",
    date_naissance: "",
    lieu_naissance: "",
    date_delivrance_cin: "",
    contact_famille: "",
    telephone: "",
    numero_vehicule: "",
    observation: "",
    zone_livraison: ""
  })

  useEffect(() => {
    if (livreur) {
      setFormData({
        nom: livreur.nom,
        prenom: livreur.prenom,
        cin: livreur.cin,
        date_naissance: livreur.date_naissance,
        lieu_naissance: livreur.lieu_naissance,
        date_delivrance_cin: livreur.date_delivrance_cin,
        contact_famille: livreur.contact_famille,
        telephone: livreur.telephone,
        numero_vehicule: livreur.numero_vehicule,
        observation: livreur.observation,
        zone_livraison: livreur.zone_livraison
      })
    }
  }, [livreur])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: COLOR }}>
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Modifier Livreur</h2>
                <p className="text-gray-600">Modifiez les informations du livreur</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Nom *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                  <input
                    name="nom"
                    type="text"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Prénom *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                  <input
                    name="prenom"
                    type="text"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                    placeholder="Prénom"
                  />
                </div>
              </div>
            </div>

            {/* CIN et Téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">N° CIN *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                  <input
                    name="cin"
                    type="text"
                    value={formData.cin}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                    placeholder="Numéro CIN"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                  <input
                    name="telephone"
                    type="text"
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                    placeholder="Téléphone"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Date de naissance *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                  <input
                    name="date_naissance"
                    type="date"
                    value={formData.date_naissance}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Date délivrance CIN *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                  <input
                    name="date_delivrance_cin"
                    type="date"
                    value={formData.date_delivrance_cin}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

            {/* Lieu et Contact famille */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Lieu de naissance *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                  <input
                    name="lieu_naissance"
                    type="text"
                    value={formData.lieu_naissance}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                    placeholder="Lieu de naissance"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Contact famille *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                  <input
                    name="contact_famille"
                    type="text"
                    value={formData.contact_famille}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                    placeholder="Contact famille"
                  />
                </div>
              </div>
            </div>

            {/* Véhicule et Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">N° Véhicule *</label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                  <input
                    name="numero_vehicule"
                    type="text"
                    value={formData.numero_vehicule}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                    placeholder="Numéro véhicule"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Zone de livraison *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLOR }} />
                  <input
                    name="zone_livraison"
                    type="text"
                    value={formData.zone_livraison}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                    placeholder="Zone de livraison"
                  />
                </div>
              </div>
            </div>

            {/* Observation */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Observation</label>
              <textarea
                name="observation"
                value={formData.observation}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                placeholder="Observation sur le livreur"
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: COLOR }}
              >
                <User className="w-4 h-4" />
                Modifier le Livreur
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}