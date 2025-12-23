"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Edit, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { useSolde } from "@/contexts/paimentEnAvance/solde-context"

interface TestHuileModificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  test: any
}

export function TestHuileModificationModal({ open, onOpenChange, test }: TestHuileModificationModalProps) {
  const { refreshSoldes } = useSolde()
  const [formData, setFormData] = useState({
    reference: "",
    fournisseur: "",
    provenance: "",
    poidsBruts: "",
    heure_reception: "", // ← Ajouté
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Réinitialiser le formulaire à l'ouverture
  useEffect(() => {
    if (open && test) {
      setFormData({
        reference: test.reference || "",
        fournisseur: test.fournisseur || "",
        provenance: test.provenance || "",
        poidsBruts: test.poidsBruts?.toString() || "",
        heure_reception: test.heure_reception || "", // ← Récupéré depuis test
      })
    }
  }, [open, test])

  // Fonction pour formater l'heure en HH:mm
  const formatTime = (time: string): string => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const h = hours.padStart(2, "0")
    const m = minutes ? minutes.padStart(2, "0").slice(0, 2) : "00"
    return `${h}:${m}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation des champs obligatoires
    if (!formData.reference || !formData.fournisseur || !formData.poidsBruts || !formData.heure_reception) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    // Validation du format heure_reception (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(formData.heure_reception)) {
      toast.error("L'heure de réception doit être au format HH:MM (ex: 14:30)")
      return
    }

    setIsSubmitting(true)

    try {
      // Préparer les données pour l'API
      const payload = {
        fournisseur: formData.fournisseur,
        provenance: formData.provenance,
        poids_brut: parseFloat(formData.poidsBruts),
        heure_reception: formData.heure_reception, // Format H:i garanti
        // Ajoute d'autres champs si besoin (date_reception, etc.)
      }

      // Remplace par ton appel API réel
      const response = await fetch(`/api/fiche-reception/${test.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la modification")
      }

      toast.success(`Test ${test?.reference} modifié avec succès`)

      // Rafraîchir le solde après succès
      await refreshSoldes()

      onOpenChange(false)
    } catch (error: any) {
      console.error("Erreur API :", error)
      toast.error(error.message || "Erreur lors de la modification")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!test) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" style={{ color: "#76bc21" }} />
            {test?.reference} - Modification
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Référence (lecture seule) */}
          <div className="space-y-2">
            <Label>Référence</Label>
            <Input
              type="text"
              value={formData.reference}
              disabled
              className="h-10 bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* Fournisseur */}
          <div className="space-y-2">
            <Label>Fournisseur *</Label>
            <Input
              type="text"
              value={formData.fournisseur}
              onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
              className="h-10"
              placeholder="Nom du fournisseur"
            />
          </div>

          {/* Provenance */}
          <div className="space-y-2">
            <Label>Provenance *</Label>
            <Input
              type="text"
              value={formData.provenance}
              onChange={(e) => setFormData({ ...formData, provenance: e.target.value })}
              className="h-10"
              placeholder="Origine du produit"
            />
          </div>

          {/* Poids bruts */}
          <div className="space-y-2">
            <Label>Poids bruts (kg) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.poidsBruts}
              onChange={(e) => setFormData({ ...formData, poidsBruts: e.target.value })}
              className="h-10"
              placeholder="0.00"
            />
          </div>

          {/* Heure de réception */}
          <div className="space-y-2">
            <Label>Heure de réception *</Label>
            <Input
              type="time"
              value={formData.heure_reception}
              onChange={(e) => {
                const formatted = formatTime(e.target.value)
                setFormData({ ...formData, heure_reception: formatted })
              }}
              className="h-10"
              required
            />
            <p className="text-xs text-gray-500">Format : HH:MM (ex: 14:30)</p>
          </div>

          {/* Boutons */}
          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: "#76bc21" }}
              className="text-white hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Modifier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
