// components/test-huile/livraison-confirmation-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Truck, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

const COLOR = "#72bc21"

interface LivraisonConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ficheReference: string
  poids: number
  onConfirm: () => void
  loading?: boolean
}

export function LivraisonConfirmationModal({
  open,
  onOpenChange,
  ficheReference,
  poids,
  onConfirm,
  loading = false
}: LivraisonConfirmationModalProps) {
    return (
      <>
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            aria-hidden="true"
          />
        )}
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl z-50">
            {/* Header vert animé */}
            <div
              className="h-2 w-full"
              style={{
                background: `linear-gradient(90deg, ${COLOR}, #5ea01a)`,
              }}
            />

            <DialogHeader className="p-6 pb-4">
              <div className="flex flex-col items-center text-center space-y-4">
            {/* Icône animée de succès */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: open ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-green-100 animate-ping" />
              <div
                className="relative rounded-full p-3 flex items-center justify-center"
                style={{ backgroundColor: `${COLOR}15` }}
              >
                <Truck className="h-10 w-10" style={{ color: COLOR }} />
              </div>
            </motion.div>

            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Confirmer la Livraison
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-2">
                Vous êtes sur le point de marquer la fiche comme <span className="font-semibold">livrée</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Corps */}
        <div className="px-6 pb-4 space-y-3">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Référence :</span>
              <span className="font-semibold text-black">{ficheReference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Poids brut :</span>
              <span className="font-semibold text-black">{poids.toFixed(2)} kg</span>
            </div>
          </div>

          <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
            <strong>Attention :</strong> Cette action est irréversible.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-4 bg-gray-50 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 border-gray-300 hover:bg-gray-100"
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: COLOR }}
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmer la Livraison
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
      </>
    )
}
