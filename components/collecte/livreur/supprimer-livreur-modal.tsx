"use client"

import { AlertCircle, Trash2, X, User } from "lucide-react"
import { useState } from "react"

const COLOR = "#72bc21"

interface Livreur {
  id: number
  nom: string
  prenom: string
  cin: string
  telephone: string
  zone_livraison: string
  [key: string]: any
}

interface SupprimerLivreurModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  livreur: Livreur | null
}

export default function SupprimerLivreurModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  livreur 
}: SupprimerLivreurModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
    }
  }

  const handleClose = () => {
    if (!isConfirming) {
      onClose()
    }
  }

  if (!isOpen || !livreur) return null

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: `${COLOR}20` }}>
                <AlertCircle className="w-6 h-6" style={{ color: COLOR }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Supprimer le livreur</h2>
                <p className="text-gray-600">Action irréversible</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              disabled={isConfirming}
              className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Informations du livreur */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full" style={{ backgroundColor: `${COLOR}20` }}>
                <User className="w-4 h-4" style={{ color: COLOR }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {livreur.prenom} {livreur.nom}
                </h3>
                <p className="text-sm text-gray-600">CIN: {livreur.cin}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Téléphone:</span>
                <p className="font-medium">{livreur.telephone}</p>
              </div>
              <div>
                <span className="text-gray-500">Zone:</span>
                <p className="font-medium">{livreur.zone_livraison}</p>
              </div>
            </div>
          </div>

          {/* Message d'avertissement */}
          <div className="space-y-3">
            <div className="rounded-lg p-4" style={{ backgroundColor: `${COLOR}10`, border: `1px solid ${COLOR}30` }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: COLOR }} />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-black">
                    Attention : Cette action est irréversible
                  </p>
                  <p className="text-sm text-black">
                    Toutes les données associées à ce livreur seront définitivement supprimées du système.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 text-center">
              Êtes-vous absolument sûr de vouloir continuer ?
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              disabled={isConfirming}
              className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="flex-1 px-4 py-3 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: COLOR }}
            >
              <Trash2 className="w-4 h-4" />
              {isConfirming ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}