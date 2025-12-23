// components/test-huile/test-huile-suppression-modal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { FicheReception } from "@/lib/TestHuille/fiche-reception-types"

interface TestHuileSuppressionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fiche: FicheReception | null
  onConfirm: () => Promise<void>
  loading?: boolean
  formatReference?: (fiche: FicheReception) => string
}

export function TestHuileSuppressionModal({
  open,
  onOpenChange,
  fiche,
  onConfirm,
  loading = false,
  formatReference = (f) => f.numero_document || `Fiche #${f.id}`
}: TestHuileSuppressionModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onOpenChange(false)
      toast.success("Fiche supprimée avec succès")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" style={{ color: "#72bc21" }} />
            <DialogTitle style={{ color: "#72bc21" }}>Confirmation de suppression</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {fiche && (
            <>
              <p className="font-medium text-gray-900">
                Êtes-vous sûr de vouloir supprimer la fiche <span className="font-bold">{formatReference(fiche)}</span> ?
              </p>
              <div className="rounded-lg p-3" style={{ backgroundColor: "#f0fdf4", borderColor: "#72bc21", borderWidth: "1px" }}>
                <p className="text-sm" style={{ color: "#72bc21" }}>
                  <span className="font-semibold">Attention :</span> Cette action est irréversible. Toutes les données associées à cette fiche seront définitivement supprimées.
                </p>
              </div>
            </>
          )}
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="sm:mr-2 w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto text-white"
            style={{ backgroundColor: "#72bc21" }}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Suppression en cours...
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}