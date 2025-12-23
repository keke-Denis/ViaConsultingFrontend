// components/collecte/confirmation-livraison-modal.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

const COLOR = "#76bc21"

interface ConfirmationLivraisonModalProps {
  open: boolean
  onClose: () => void
  selectedPV: any
  onConfirm: () => void
  isProcessing: boolean
}

export function ConfirmationLivraisonModal({
  open,
  onClose,
  selectedPV,
  onConfirm,
  isProcessing
}: ConfirmationLivraisonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la livraison</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">Êtes-vous sûr de vouloir confirmer la livraison pour le PV <strong>{selectedPV?.numero_doc}</strong> ?</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Annuler</Button>
          <Button onClick={onConfirm} disabled={isProcessing} style={{ backgroundColor: COLOR }}>
            {isProcessing ? <>Traitement...</> : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
