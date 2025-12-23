// Version avec état de chargement et couleur verte pour le bouton
"use client"

import { useState } from "react"
import { AlertCircle, Trash2, X, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import type { Fournisseur } from "@/lib/fournisseur/fournisseur-types"

const COLOR = "#72bc21" 
const COLOR_HOVER = "#5f9a1a" 
const COLOR_LOADING = "#4a7c14" 
const LIGHT_BG = "#ecfbb6"
const DARK_TEXT = "#4a7c14"

interface SuppressionFournisseurProps {
  fournisseur: Fournisseur
  onConfirm: () => Promise<void> | void
  onCancel: () => void
}

export default function SuppressionFournisseur({ 
  fournisseur, 
  onConfirm, 
  onCancel 
}: SuppressionFournisseurProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    
    try {
      // Afficher un toast bleu pour l'encours de suppression
      toast.info(`En cours de suppression du fournisseur ${fournisseur.prenom} ${fournisseur.nom}...`, {
        position: "top-right",
        autoClose: 3000,
        style: {
          background: '#dbeafe', 
          color: '#1e40af', 
          border: '1px solid #93c5fd'
        },
        progressStyle: {
          background: '#3b82f6' 
        }
      })
      
      // Appeler la fonction de confirmation parente
      await onConfirm()
      
    } catch (error) {
      // Gérer les erreurs de suppression
      toast.error("Erreur lors de la suppression du fournisseur", {
        position: "top-right",
        autoClose: 4000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (isDeleting) return 
    
    toast.info("Suppression annulée", {
      position: "top-right",
      autoClose: 2000,
    })
    
    onCancel()
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-md mx-auto">
      {/* Icône d'avertissement en vert */}
      <div className="flex justify-center">
        <div 
          className="inline-flex items-center justify-center w-16 h-16 rounded-full"
          style={{ backgroundColor: LIGHT_BG }}
        >
          <AlertCircle className="w-9 h-9" style={{ color: COLOR }} />
        </div>
      </div>

      {/* Texte central */}
      <div className="text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Confirmer la suppression
        </h2>
        
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          Êtes-vous sûr de vouloir supprimer définitivement le fournisseur<br />
          <strong className="text-lg" style={{ color: COLOR }}>
            {fournisseur.prenom} {fournisseur.nom}
          </strong> ?
        </p>

        <div 
          className="text-sm font-medium p-3 rounded-lg font-mono"
          style={{ backgroundColor: LIGHT_BG, color: DARK_TEXT }}
        >
          ID Fiscale: {fournisseur.identification_fiscale}
        </div>

        <p className="text-sm font-semibold" style={{ color: DARK_TEXT }}>
          Cette action est irréversible
        </p>
      </div>

      {/* Boutons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isDeleting}
          className="w-full px-6 py-3.5 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
          Annuler
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting}
          className="w-full px-6 py-3.5 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{ 
            backgroundColor: isDeleting ? COLOR_LOADING : COLOR 
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = COLOR_HOVER
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = COLOR
            }
          }}
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Suppression...
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5" />
              Supprimer
            </>
          )}
        </button>
      </div>
    </div>
  )
}
