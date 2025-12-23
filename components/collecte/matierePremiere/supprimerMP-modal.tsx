// components/collecte/supprimerMP-modal.tsx
"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { toast } from "react-toastify"

const COLOR = "#72bc21"

interface SupprimerMPModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pvReception: { id: number; numero_doc: string } | null
  onDeleteSuccess: () => Promise<void> | void
  deletePVReception: (id: number) => Promise<{ success: boolean; message?: string }>
}

export function SupprimerMPModal({
  open,
  onOpenChange,
  pvReception,
  onDeleteSuccess,
  deletePVReception,
}: SupprimerMPModalProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!pvReception) return

    setIsDeleting(true)
    try {
      const res = await deletePVReception(pvReception.id)
      if (res && res.success) {
        toast.success(res.message || `PV ${pvReception.numero_doc} supprimé avec succès`)
        await onDeleteSuccess()
        onOpenChange(false)
      } else {
        toast.error(res?.message || "Erreur lors de la suppression du PV")
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression du PV")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-3 bg-red-100 rounded-full">
              <Trash2 className="h-7 w-7 text-red-600" />
            </div>
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600 leading-relaxed">
            Êtes-vous absolument sûr de vouloir supprimer le PV de réception
            <span className="font-bold text-gray-900"> {pvReception?.numero_doc}</span> ?
            <br />
            <br />
            <span className="font-semibold text-red-600">Cette action est irréversible</span> et toutes les données associées seront perdues définitivement.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-3 mt-6">
          <AlertDialogCancel disabled={isDeleting} className="min-w-32">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ backgroundColor: COLOR }}
            className="text-white hover:opacity-90 min-w-32 shadow-lg"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.M 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}