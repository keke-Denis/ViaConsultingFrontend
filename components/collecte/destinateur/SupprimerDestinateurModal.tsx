// components/SupprimerDestinateurModal.tsx
"use client"

import { Trash2, X } from "lucide-react"

interface SupprimerDestinateurModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: number) => void
  destinateur: any
}

export default function SupprimerDestinateurModal({
  isOpen,
  onClose,
  onConfirm,
  destinateur
}: SupprimerDestinateurModalProps) {
  if (!isOpen || !destinateur) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-red-600">Confirmer la suppression</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 text-gray-700">
          <p>Voulez-vous vraiment supprimer ce destinataire ?</p>
          <p className="mt-2 font-semibold text-lg">
            {destinateur.nom_entreprise} - {destinateur.nom_prenom}
          </p>
          <p className="text-sm text-gray-500 mt-1">Cette action est irréversible.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirm(destinateur.id)
              onClose()
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}