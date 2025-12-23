// components/collecte/gerer-payment-suppression.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, X } from "lucide-react"
import { PaiementEnAvance } from "@/lib/paiementEnAvance/paiementEnAvance-types"

interface GererPaymentSuppressionProps {
  isOpen: boolean
  onClose: () => void
  paiement: PaiementEnAvance | null
  onConfirm: () => void
  loading?: boolean
}

export function GererPaymentSuppression({ 
  isOpen, 
  onClose, 
  paiement, 
  onConfirm,
  loading = false 
}: GererPaymentSuppressionProps) {

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-50 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer définitivement ce paiement ?
            <br />
            <span className="font-semibold text-red-600">Cette action est irréversible.</span>
          </DialogDescription>
        </DialogHeader>

        {paiement && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Référence:</span>
              <span className="text-sm font-medium">{paiement.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fournisseur:</span>
              <span className="text-sm font-medium">{paiement.fournisseur.nom} {paiement.fournisseur.prenom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Montant:</span>
              <span className="text-sm font-medium">{paiement.montant.toLocaleString()} Ar</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm font-medium">{paiement.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="text-sm font-medium">
                {new Date(paiement.date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11"
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {loading ? "Suppression..." : "Supprimer définitivement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}