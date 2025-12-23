// components/test-huile/test-huile-edit-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Edit3, MapPin, Scale, ChevronRight, ChevronLeft, Calendar, Clock } from "lucide-react"
import { toast } from "react-toastify"
import { ficheService } from "@/lib/TestHuille/fiche-reception-api"
import { siteCollecteApi } from "@/lib/siteCollecte/site-collecte-api"
import type { FicheReception, UpdateFicheReceptionData } from "@/lib/TestHuille/fiche-reception-types"
import type { SiteCollecte } from "@/lib/siteCollecte/site-collecte-types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  fiche: FicheReception
  onSuccess: () => void
}

export function TestHuileEditModal({ open, onOpenChange, fiche, onSuccess }: Props) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    date_reception: '',
    heure_reception: '',
    site_collecte_id: 0,
    poids_brut: '',
  })
  const [sitesCollecte, setSitesCollecte] = useState<SiteCollecte[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Réinitialiser à l'ouverture
  useEffect(() => {
    if (open && fiche) {
      setCurrentStep(1)
      setFormData({
        date_reception: fiche.date_reception || new Date().toISOString().split("T")[0],
        heure_reception: fiche.heure_reception || new Date().toTimeString().slice(0, 5),
        site_collecte_id: fiche.site_collecte_id || 0,
        poids_brut: fiche.poids_brut?.toString() || '',
      })
    }
  }, [open, fiche])

  // Charger les sites de collecte
  useEffect(() => {
    const fetchSitesCollecte = async () => {
      if (!open) return
      setIsLoadingData(true)
      try {
        const response = await siteCollecteApi.getAll()
        if (response.success) {
          setSitesCollecte(response.data || [])
        } else {
          throw new Error(response.message || "Erreur lors du chargement des sites de collecte")
        }
      } catch (err: any) {
        console.error('Erreur chargement sites:', err)
        toast.error("Erreur lors du chargement des sites de collecte")
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchSitesCollecte()
  }, [open])

  const isStep1Valid = formData.date_reception && formData.heure_reception && formData.site_collecte_id > 0
  const isStep2Valid = isStep1Valid && formData.poids_brut && parseFloat(formData.poids_brut) > 0

  const handleNext = () => {
    if (isStep1Valid) setCurrentStep(2)
    else toast.error("Veuillez remplir tous les champs obligatoires")
  }

  const handlePrev = () => setCurrentStep(1)

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isStep2Valid) {
      toast.error("Veuillez remplir tous les champs correctement")
      return
    }

    setIsLoading(true)
    try {
      const updateData: UpdateFicheReceptionData = {
        date_reception: formData.date_reception,
        heure_reception: formData.heure_reception,
        site_collecte_id: formData.site_collecte_id,
        poids_brut: parseFloat(formData.poids_brut),
      }

      console.log('Envoi des données de mise à jour:', updateData)

      const response = await ficheService.update(fiche.id, updateData)

      if (response.success) {
        toast.success("Fiche modifiée avec succès !")
        onSuccess()
        onOpenChange(false)
      } else {
        // Afficher les erreurs de validation détaillées
        console.log('Réponse erreur détaillée:', response)
        
        if (response.errors) {
          // Afficher chaque erreur de validation
          Object.values(response.errors).forEach((error: any) => {
            if (Array.isArray(error)) {
              error.forEach(err => toast.error(err))
            } else {
              toast.error(error)
            }
          })
        } else if (response.message) {
          toast.error(response.message)
        }
        
        throw new Error(response.message || "Erreur lors de la modification")
      }
    } catch (err: any) {
      console.error('Erreur détaillée modification fiche:', err)
      // Ne pas afficher de toast supplémentaire si les erreurs sont déjà affichées
      if (!err.message?.includes('Erreur de validation') && !err.message?.includes('Erreur lors de la modification')) {
        toast.error(err.message || "Erreur lors de la modification")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const selectedSite = sitesCollecte.find(s => s.id === formData.site_collecte_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-[#76bc21] to-[#5f9a1a] rounded-full flex items-center justify-center">
              <Edit3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Modifier la Fiche de Réception</DialogTitle>
              <DialogDescription>
                Étape {currentStep}/2 — {currentStep === 1 ? "Informations générales" : "Poids"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#76bc21]" />
            <p className="mt-4 text-lg">Chargement...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Barre de progression */}
            <div className="flex gap-2">
              <div className={`h-2 flex-1 rounded-full ${currentStep >= 1 ? "bg-[#76bc21]" : "bg-gray-300"}`} />
              <div className={`h-2 flex-1 rounded-full ${currentStep >= 2 ? "bg-[#76bc21]" : "bg-gray-300"}`} />
            </div>

            {/* ÉTAPE 1 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Date + Heure */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Date de réception *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="date"
                        value={formData.date_reception}
                        onChange={e => handleChange("date_reception", e.target.value)}
                        className="h-12 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Heure de réception *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="time"
                        value={formData.heure_reception}
                        onChange={e => handleChange("heure_reception", e.target.value)}
                        className="h-12 pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Site de collecte */}
                <div className="space-y-2">
                  <Label className="font-semibold">Site de collecte *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21] z-10" />
                    <Select
                      value={formData.site_collecte_id.toString()}
                      onValueChange={v => handleChange("site_collecte_id", parseInt(v))}
                    >
                      <SelectTrigger className="h-12 pl-10">
                        <SelectValue placeholder="Choisir un site de collecte" />
                      </SelectTrigger>
                      <SelectContent>
                        {sitesCollecte.map(site => (
                          <SelectItem key={site.id} value={site.id.toString()}>
                            {site.Nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-semibold">Poids brut (kg) *</Label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.poids_brut}
                      onChange={e => handleChange("poids_brut", e.target.value)}
                      className="h-12 pl-10"
                      placeholder="45.50"
                      required
                    />
                  </div>
                </div>

                <div className="bg-linear-to-r from-[#76bc21]/10 to-[#5f9a1a]/10 rounded-xl p-6 border border-[#76bc21]/20">
                  <p className="text-sm text-muted-foreground">
                    <strong>Référence :</strong> {fiche.numero_document || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Fournisseur :</strong> {fiche.fournisseur ? `${fiche.fournisseur.prenom} ${fiche.fournisseur.nom}` : '-'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Site actuel :</strong> {selectedSite?.Nom || fiche.site_collecte?.Nom || '-'}
                  </p>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3 pt-6 border-t">
              {currentStep === 2 && (
                <Button type="button" onClick={handlePrev} variant="outline">
                  <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Annuler
              </Button>

              {currentStep === 1 && (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  className="flex-1 bg-[#76bc21] hover:bg-[#5f9a1a]"
                >
                  Suivant <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  type="submit"
                  disabled={isLoading || !isStep2Valid}
                  className="flex-1 bg-[#76bc21] hover:bg-[#5f9a1a]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Modification en cours...
                    </>
                  ) : (
                    <>Sauvegarder</>
                  )}
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
