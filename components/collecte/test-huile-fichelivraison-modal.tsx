// components/test-huile/test-huile-fichelivraison-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  CalendarIcon, 
  Truck, 
  Loader2, 
  Package,
  Check,
  ChevronsUpDown,
  AlertCircle
} from "lucide-react"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { FicheReception } from "@/lib/TestHuille/fiche-reception.service"
import { createFicheLivraison } from "@/lib/TestHuille/fiche-livraisonUpdate-api"

import { getLivreurs } from "@/lib/livreur/livreur-api"
import { destinateurApi } from "@/lib/destinateur/destinateur-api"
import type { LivreurFromAPI } from "@/lib/livreur/livreur-types"
import type { Destinateur } from "@/lib/destinateur/destinateur-types"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const COLOR = "#76bc21"

interface TestHuileLivraisonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fiche: FicheReception | null
  onSuccess?: () => void
  mode?: 'normal' | 'partiel'
}

export function TestHuileLivraisonModal({
  open,
  onOpenChange,
  fiche,
  onSuccess,
  mode = 'normal'
}: TestHuileLivraisonModalProps) {
  const [dateLivraison, setDateLivraison] = useState<Date | undefined>(undefined)
  const [lieuDepart, setLieuDepart] = useState("")
  const [quantiteALivrer, setQuantiteALivrer] = useState("")
  const [ristourneRegionale, setRistourneRegionale] = useState("")
  const [ristourneCommunale, setRistourneCommunale] = useState("")
  const [fonctionDestinataire, setFonctionDestinataire] = useState("")

  const [selectedLivreur, setSelectedLivreur] = useState<LivreurFromAPI | null>(null)
  const [selectedDestinataire, setSelectedDestinataire] = useState<Destinateur | null>(null)

  const [openLivreur, setOpenLivreur] = useState(false)
  const [openDestinataire, setOpenDestinataire] = useState(false)
  const [searchLivreur, setSearchLivreur] = useState("")
  const [searchDestinataire, setSearchDestinataire] = useState("")

  const [livreurs, setLivreurs] = useState<LivreurFromAPI[]>([])
  const [destinateurs, setDestinateurs] = useState<Destinateur[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculs
  const poidsBrut = fiche ? parseFloat((fiche.poids_brut ?? 0).toString()) || 0 : 0
  const poidsEmballage = fiche ? parseFloat((fiche.poids_emballage ?? 0).toString()) || 0 : 0
  const poidsNetTotal = fiche ? parseFloat((fiche.poids_net ?? 0).toString()) || 0 : 0

  const quantite = parseFloat(quantiteALivrer) || 0
  const poidsRestant = Math.max(0, poidsNetTotal - quantite)
  const isPartialTransfer = quantite > 0 && quantite < poidsNetTotal
  const ratio = poidsBrut > 0 ? quantite / poidsBrut : 0
  const poidsNetLivree = (poidsNetTotal * ratio).toFixed(2)

  // Fonction pour obtenir la quantité restante de manière sécurisée
  const getQuantiteRestante = () => {
    if (!fiche) return 0
    
    // Essayer d'abord quantite_restante
    if (fiche.quantite_restante !== undefined && fiche.quantite_restante !== null) {
      return parseFloat(fiche.quantite_restante.toString()) || 0
    }
    
    // Ensuite poids_restant
    if (fiche.poids_restant !== undefined && fiche.poids_restant !== null) {
      return parseFloat(fiche.poids_restant.toString()) || 0
    }
    
    // Sinon retourner 0
    return 0
  }

  useEffect(() => {
    if (!open) return

    const load = async () => {
      setIsLoadingData(true)
      try {
        const [lData, dData] = await Promise.all([
          getLivreurs(),
          destinateurApi.getAll()
        ])
        setLivreurs(lData)
        setDestinateurs(dData)
      } catch (err) {
        toast.error("Erreur de chargement des livreurs/destinataires")
      } finally {
        setIsLoadingData(false)
      }
    }
    load()
  }, [open])

  useEffect(() => {
    if (open && fiche) {
      setDateLivraison(new Date())
      setLieuDepart(fiche.site_collecte?.Nom || "")
      
      // Si la fiche est partiellement livrée, utiliser la quantité restante
      const quantiteRestante = getQuantiteRestante()
      if (fiche.statut === 'partiellement_livre') {
        setQuantiteALivrer(quantiteRestante > 0 ? quantiteRestante.toFixed(2) : "")
      } else {
        setQuantiteALivrer(mode === 'normal' ? poidsNetTotal.toFixed(2) : "")
      }
      
      setSelectedLivreur(null)
      setSelectedDestinataire(null)
      setFonctionDestinataire("")
      setRistourneRegionale("")
      setRistourneCommunale("")
    }
  }, [open, fiche, mode, poidsNetTotal])

  const filteredLivreurs = livreurs.filter(l =>
    `${l.prenom} ${l.nom} ${l.telephone}`.toLowerCase().includes(searchLivreur.toLowerCase())
  )

  const filteredDestinateurs = destinateurs.filter(d =>
    `${d.nom_prenom} ${d.nom_entreprise} ${d.contact}`.toLowerCase().includes(searchDestinataire.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fiche || !selectedLivreur || !selectedDestinataire || !dateLivraison || !quantiteALivrer || !fonctionDestinataire.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (quantite <= 0 || quantite > poidsNetTotal) {
      toast.error(`Quantité invalide (max: ${poidsNetTotal.toFixed(2)} kg)`)
      return
    }

    // Vérifier si la quantité à livrer dépasse la quantité restante
    const quantiteRestanteActuelle = getQuantiteRestante()
    if (quantite > quantiteRestanteActuelle) {
      toast.error(`Quantité invalide. Stock restant: ${quantiteRestanteActuelle.toFixed(2)} kg`)
      return
    }

    setIsSubmitting(true)
    try {
      // Utiliser 'En attente de livraison' comme statut initial
      const statutInitial = 'En attente de livraison'

      const payload = {
        fiche_reception_id: fiche.id,
        date_heure_livraison: format(dateLivraison, "yyyy-MM-dd HH:mm:ss"),
        livreur_id: selectedLivreur.id,
        destinateur_id: selectedDestinataire.id,
        fonction_destinataire: fonctionDestinataire.trim(),
        lieu_depart: lieuDepart.trim(),
        destination: fiche.site_collecte?.Nom || "Non défini",
        type_produit: "Huile essentielle",
        poids_net: quantite,
        quantite_a_livrer: quantite,
        poids_restant: poidsRestant,
        statut: statutInitial,
        ristourne_regionale: ristourneRegionale ? parseFloat(ristourneRegionale) : null,
        ristourne_communale: ristourneCommunale ? parseFloat(ristourneCommunale) : null,
      }

      const response = await createFicheLivraison(payload)

      if (response.success) {
        toast.success("Fiche de livraison créée avec succès")
        onSuccess?.()
        onOpenChange(false)
      } else {
        toast.error(response.message || "Erreur lors de la création")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur réseau")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Obtenir la quantité restante actuelle
  const quantiteRestanteActuelle = getQuantiteRestante()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Truck className="h-6 w-6" style={{ color: COLOR }} />
            Nouvelle Fiche de Livraison
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">

          {/* Infos fiche */}
          {fiche && (
            <div className="bg-linear-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
              <h4 className="font-semibold text-sm uppercase tracking-wide mb-3">
                <Package className="inline h-4 w-4 mr-1" /> Fiche de Réception
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-600 text-xs">N° Doc</span><p className="font-semibold" style={{ color: COLOR }}>{fiche.numero_document}</p></div>
                <div><span className="text-gray-600 text-xs">Type</span><p>Huile essentielle</p></div>
                <div><span className="text-gray-600 text-xs">Fournisseur</span><p>{fiche.fournisseur?.prenom} {fiche.fournisseur?.nom}</p></div>
                <div><span className="text-gray-600 text-xs">Poids net total</span><p className="font-semibold">{poidsNetTotal.toFixed(2)} kg</p></div>
                <div><span className="text-gray-600 text-xs">Stock restant</span><p className="font-semibold text-amber-600">{quantiteRestanteActuelle.toFixed(2)} kg</p></div>
                <div><span className="text-gray-600 text-xs">Statut</span><p>{fiche.statut}</p></div>
              </div>
            </div>
          )}

          {/* Date + Lieu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de livraison *</Label>
              <Input 
                type="text"
                value={dateLivraison ? format(dateLivraison, "dd/MM/yyyy", { locale: fr }) : ""}
                readOnly
                className="h-11 bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label>Lieu de départ *</Label>
              <Input value={lieuDepart} onChange={(e) => setLieuDepart(e.target.value)} required className="h-11" />
            </div>
          </div>

          {/* Livreur */}
          <div className="space-y-2">
            <Label>Livreur *</Label>
            <Popover open={openLivreur} onOpenChange={setOpenLivreur}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-11" disabled={isLoadingData}>
                  {selectedLivreur ? `${selectedLivreur.prenom} ${selectedLivreur.nom} - ${selectedLivreur.telephone}` : "Sélectionner un livreur"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Rechercher..." value={searchLivreur} onValueChange={setSearchLivreur} />
                  <CommandList>
                    <CommandEmpty>Aucun livreur trouvé</CommandEmpty>
                    <CommandGroup className="max-h-48 overflow-y-auto">
                      {filteredLivreurs.map((l) => (
                        <CommandItem key={l.id} onSelect={() => { setSelectedLivreur(l); setOpenLivreur(false) }}>
                          <Check className={cn("mr-2 h-4 w-4", selectedLivreur?.id === l.id ? "opacity-100" : "opacity-0")} />
                          <div>
                            <div className="font-medium">{l.prenom} {l.nom}</div>
                            <div className="text-xs text-gray-500">{l.telephone}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Destinataire */}
          <div className="space-y-2">
            <Label>Destinataire *</Label>
            <Popover open={openDestinataire} onOpenChange={setOpenDestinataire}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-11" disabled={isLoadingData}>
                  {selectedDestinataire ? `${selectedDestinataire.nom_prenom} - ${selectedDestinataire.contact}` : "Sélectionner un destinataire"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Rechercher..." value={searchDestinataire} onValueChange={setSearchDestinataire} />
                  <CommandList>
                    <CommandEmpty>Aucun destinataire trouvé</CommandEmpty>
                    <CommandGroup className="max-h-48 overflow-y-auto">
                      {filteredDestinateurs.map((d) => (
                        <CommandItem key={d.id} onSelect={() => { setSelectedDestinataire(d); setOpenDestinataire(false) }}>
                          <Check className={cn("mr-2 h-4 w-4", selectedDestinataire?.id === d.id ? "opacity-100" : "opacity-0")} />
                          <div>
                            <div className="font-medium">{d.nom_prenom}</div>
                            <div className="text-xs text-gray-500">{d.contact} • {d.nom_entreprise}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Fonction du destinataire - Champ libre */}
          <div className="space-y-2">
            <Label>Fonction du destinataire *</Label>
            <Input
              value={fonctionDestinataire}
              onChange={(e) => setFonctionDestinataire(e.target.value)}
              placeholder="Ex: Responsable logistique, Gérant, Agent de réception..."
              className="h-11"
              required
            />
          </div>

          {/* Ristournes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ristourne régionale (Ar)</Label>
              <Input type="number" value={ristourneRegionale} onChange={(e) => setRistourneRegionale(e.target.value)} className="h-11 text-right" step="0.01" min="0" />
            </div>
            <div className="space-y-2">
              <Label>Ristourne communale (Ar)</Label>
              <Input type="number" value={ristourneCommunale} onChange={(e) => setRistourneCommunale(e.target.value)} className="h-11 text-right" step="0.01" min="0" />
            </div>
          </div>

          {/* Quantité */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Quantité à livrer (kg) *
                <span className="text-xs text-gray-500 ml-2">
                  Max: {poidsNetTotal.toFixed(2)} kg | Stock restant: {quantiteRestanteActuelle.toFixed(2)} kg
                </span>
              </Label>
              <Input
                type="number"
                step="0.01"
                value={quantiteALivrer}
                onChange={(e) => setQuantiteALivrer(e.target.value)}
                className="h-11 text-right font-semibold"
                required
                max={poidsNetTotal}
              />
            </div>

            {/* Indicateur de transfert partiel */}
            {isPartialTransfer && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 mb-1">Transfert Partiel Détecté</p>
                  <div className="space-y-1 text-sm text-amber-800">
                    <p>📦 <span className="font-medium">Quantité à transférer:</span> {quantite.toFixed(2)} kg</p>
                    <p>⚠️ <span className="font-medium">Poids restant après livraison:</span> {poidsRestant.toFixed(2)} kg</p>
                    <p className="text-amber-700 mt-2">
                      Le statut sera "En attente de livraison". Après démarrage → "en cours de livraison". 
                      Après fin → {poidsRestant > 0 ? '"partiellement_livre"' : '"livré"'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Transfert complet */}
            {quantite === poidsNetTotal && quantite > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span><span className="font-semibold">Transfert Complet</span> - Tout le poids sera transféré</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedLivreur || !selectedDestinataire || !fonctionDestinataire.trim() || quantite <= 0}
                style={{ backgroundColor: COLOR }}
                className="flex-1 h-11 font-semibold text-white hover:opacity-90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  mode === 'partiel' ? 'Créer Livraison Partielle' : 'Créer Fiche de Livraison'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}