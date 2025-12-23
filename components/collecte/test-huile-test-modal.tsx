// components/collecte/test-huile-test-modal.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Loader2, Beaker } from "lucide-react"
import { toast } from "react-toastify"
import { testService, testerHuileUtils } from "@/lib/TestHuille/Tester-huile-api"
import type { FicheReception } from "@/lib/TestHuille/fiche-reception-types"
import type { CreateHETesterData } from "@/lib/TestHuille/Tester-huile-types"

interface TestHuileTestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fiche: FicheReception | null
  onSuccess?: () => void
}

export function TestHuileTestModal({ open, onOpenChange, fiche, onSuccess }: TestHuileTestModalProps) {
  const [formData, setFormData] = useState({
    date_test: "",
    heure_debut: "",
    heure_fin_prevue: "",
    densite: "",
    presence_huile_vegetale: "Non" as "Oui" | "Non",
    presence_lookhead: "Non" as "Oui" | "Non",
    teneur_eau: "",
    observations: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && fiche) {
      const now = new Date()
      const heureDebut = now.toTimeString().slice(0, 5)
      const heureFinPrevue = testerHuileUtils.calculerHeureFinPrevue(heureDebut)
      
      setFormData({
        date_test: now.toISOString().split("T")[0],
        heure_debut: heureDebut,
        heure_fin_prevue: heureFinPrevue,
        densite: "",
        presence_huile_vegetale: "Non",
        presence_lookhead: "Non",
        teneur_eau: "",
        observations: ""
      })
    }
  }, [open, fiche])

  // Mettre à jour l'heure de fin prévue quand l'heure de début change
  useEffect(() => {
    if (formData.heure_debut) {
      const heureFinPrevue = testerHuileUtils.calculerHeureFinPrevue(formData.heure_debut)
      setFormData(prev => ({ ...prev, heure_fin_prevue: heureFinPrevue }))
    }
  }, [formData.heure_debut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fiche) {
      toast.error("Aucune fiche sélectionnée")
      return
    }

    // Préparer les données pour la validation
    const submitData: CreateHETesterData = {
      fiche_reception_id: fiche.id,
      date_test: formData.date_test,
      heure_debut: formData.heure_debut,
      heure_fin_prevue: formData.heure_fin_prevue,
      presence_huile_vegetale: formData.presence_huile_vegetale,
      presence_lookhead: formData.presence_lookhead,
      densite: formData.densite ? parseFloat(formData.densite) : null,
      teneur_eau: formData.teneur_eau ? parseFloat(formData.teneur_eau) : null,
      observations: formData.observations || null
    }

    // Validation avec les utilitaires
    const erreurs = testerHuileUtils.validerDonnees(submitData)
    if (erreurs.length > 0) {
      erreurs.forEach(erreur => toast.error(erreur))
      return
    }

    // Validation supplémentaire pour les champs numériques
    // Utiliser des vérifications explicites pour éviter les erreurs TypeScript
    const densiteValue = submitData.densite
    const teneurEauValue = submitData.teneur_eau

    if (densiteValue !== null && densiteValue !== undefined && densiteValue < 0) {
      toast.error("La densité ne peut pas être négative")
      return
    }

    if (teneurEauValue !== null && teneurEauValue !== undefined && (teneurEauValue < 0 || teneurEauValue > 100)) {
      toast.error("La teneur en eau doit être entre 0 et 100%")
      return
    }

    setIsSubmitting(true)

    try {
      console.debug('Démarrage du test pour fiche:', fiche.id, 'avec données:', submitData)

      const response = await testService.create(submitData)

      if (response.success) {
        toast.success(`Test démarré avec succès !`)
        onSuccess?.()
        onOpenChange(false)
        
        // Vérifier que le statut a bien changé
        if (response.data.fiche_reception?.statut === 'en cours de teste') {
          toast.info("Statut de la fiche mis à jour: En cours de test")
        }
      } else {
        // Afficher les erreurs de validation du backend
        if (response.errors) {
          Object.values(response.errors).forEach((error: any) => {
            if (Array.isArray(error)) {
              error.forEach(err => toast.error(err))
            } else {
              toast.error(error)
            }
          })
        } else {
          toast.error(response.message || "Erreur lors du démarrage du test")
        }
      }
    } catch (error: any) {
      console.error('Erreur démarrage test:', error)
      toast.error("Erreur lors du démarrage du test")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!fiche) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" style={{ color: "#76bc21" }} />
            Démarrer le test complet
          </DialogTitle>
          <DialogDescription>
            Fiche : {fiche.numero_document || 'N/A'}
            {fiche.fournisseur && (
              <span> - {fiche.fournisseur.prenom} {fiche.fournisseur.nom}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date et heure du test */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_test">Date du test *</Label>
              <Input
                id="date_test"
                type="date"
                value={formData.date_test}
                onChange={(e) => setFormData({ ...formData, date_test: e.target.value })}
                className="h-10"
                required
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heure_debut" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Heure début *
              </Label>
              <Input
                id="heure_debut"
                type="time"
                value={formData.heure_debut}
                onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                className="h-10"
                required
                readOnly
              />
            </div>
          </div>

          {/* Heure de fin prévue (calculée automatiquement) */}
          <div className="space-y-2">
            <Label htmlFor="heure_fin_prevue" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Heure fin prévue *
            </Label>
            <Input
              id="heure_fin_prevue"
              type="time"
              value={formData.heure_fin_prevue}
              onChange={(e) => setFormData({ ...formData, heure_fin_prevue: e.target.value })}
              className="h-10 bg-muted"
              required
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Calculée automatiquement (3 heures après le début)
            </p>
          </div>

          {/* Résultats du test */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="densite">Densité</Label>
              <Input
                id="densite"
                type="number"
                step="0.0001"
                min="0"
                value={formData.densite}
                onChange={(e) => setFormData({ ...formData, densite: e.target.value })}
                placeholder="ex: 0.9400"
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Huile végétale *</Label>
                <Select
                  value={formData.presence_huile_vegetale}
                  onValueChange={(value: "Oui" | "Non") => setFormData({ ...formData, presence_huile_vegetale: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Non">Non</SelectItem>
                    <SelectItem value="Oui">Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lookhead *</Label>
                <Select
                  value={formData.presence_lookhead}
                  onValueChange={(value: "Oui" | "Non") => setFormData({ ...formData, presence_lookhead: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Non">Non</SelectItem>
                    <SelectItem value="Oui">Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teneur_eau">Teneur en eau (%)</Label>
              <Input
                id="teneur_eau"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.teneur_eau}
                onChange={(e) => setFormData({ ...formData, teneur_eau: e.target.value })}
                placeholder="ex: 1.50"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observations</Label>
              <Input
                id="observations"
                type="text"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Notes supplémentaires..."
                className="h-10"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
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
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Démarrage...
                </>
              ) : (
                "Démarrer le test"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}