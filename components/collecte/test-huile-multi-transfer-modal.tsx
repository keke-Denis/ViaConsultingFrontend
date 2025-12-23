// components/test-huile/test-huile-multi-transfer-modal.tsx
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
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  Weight
} from "lucide-react"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getLivreurs } from "@/lib/livreur/livreur-api"
import { destinateurApi } from "@/lib/destinateur/destinateur-api"
import { createFicheLivraison } from "@/lib/TestHuille/fiche-livraisonUpdate-api"
import { ficheService } from "@/lib/TestHuille/fiche-reception.service"
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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatNumber, formatDate as formatDateUtil } from "@/utils/formatters"

const COLOR = "#72bc21"

interface TestHuileMultiTransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fiches: any[]
  onSuccess?: () => void
}

export function TestHuileMultiTransferModal({
  open,
  onOpenChange,
  fiches,
  onSuccess,
}: TestHuileMultiTransferModalProps) {
  const [dateLivraison, setDateLivraison] = useState<Date | undefined>(undefined)
  const [lieuDepart, setLieuDepart] = useState("")
  const [fonctionDestinataire, setFonctionDestinataire] = useState("")
  const [ristourneRegionale, setRistourneRegionale] = useState("0")
  const [ristourneCommunale, setRistourneCommunale] = useState("0")
  
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
  
  // Calculs des totaux
  const totalPoidsNet = fiches.reduce((total, fiche) => {
    const poidsNet = parseFloat((fiche.poids_net ?? 0).toString()) || 0
    return total + poidsNet
  }, 0)
  
  const totalPrix = fiches.reduce((total, fiche) => {
    return total + (parseFloat((fiche.prix_total ?? 0).toString()) || 0)
  }, 0)

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
        
        // Définir la date par défaut
        setDateLivraison(new Date())
        
        // Définir le lieu de départ basé sur la première fiche
        if (fiches.length > 0) {
          setLieuDepart(fiches[0].site_collecte?.Nom || "")
        }
        
        // Initialiser les ristournes à 0
        setRistourneRegionale("0")
        setRistourneCommunale("0")
      } catch (err) {
        toast.error("Erreur de chargement des livreurs/destinataires")
      } finally {
        setIsLoadingData(false)
      }
    }
    load()
  }, [open, fiches])

  const filteredLivreurs = livreurs.filter(l =>
    `${l.prenom} ${l.nom} ${l.telephone}`.toLowerCase().includes(searchLivreur.toLowerCase())
  )

  const filteredDestinateurs = destinateurs.filter(d =>
    `${d.nom_prenom} ${d.nom_entreprise} ${d.contact}`.toLowerCase().includes(searchDestinataire.toLowerCase())
  )

  const formatReference = (f: any) => {
    if (f?.numero_document) return f.numero_document
    const datePart = f?.date_reception ? new Date(f.date_reception).toISOString().slice(0,10).replace(/-/g, '') : '20251201'
    const idPart = f?.id ? String(f.id).padStart(6, '0') : 'XXXXXX'
    return `REC-${datePart}-${idPart}`
  }

  const handleApiError = (error: any, defaultMessage: string) => {
    if (error.response?.data?.error?.includes('Integrity constraint violation')) {
      if (error.response.data.error.includes('ristourne_regionale')) {
        toast.error("La ristourne régionale est requise. Veuillez entrer une valeur (0 si aucune)")
      } else if (error.response.data.error.includes('ristourne_communale')) {
        toast.error("La ristourne communale est requise. Veuillez entrer une valeur (0 si aucune)")
      } else {
        toast.error("Erreur de validation des données. Vérifiez tous les champs obligatoires.")
      }
    } else {
      toast.error(defaultMessage)
    }
    console.error("Erreur API:", error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedLivreur || !selectedDestinataire || !dateLivraison || !fonctionDestinataire.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Créer une fiche de livraison pour chaque fiche sélectionnée
      const promises = fiches.map(async (fiche) => {
        const payload = {
          fiche_reception_id: fiche.id,
          date_heure_livraison: format(dateLivraison, "yyyy-MM-dd HH:mm:ss"),
          livreur_id: selectedLivreur!.id,
          destinateur_id: selectedDestinataire!.id,
          fonction_destinataire: fonctionDestinataire.trim(),
          lieu_depart: lieuDepart.trim(),
          destination: fiche.site_collecte?.Nom || "Non défini",
          type_produit: "Huile essentielle",
          poids_net: parseFloat((fiche.poids_net ?? 0).toString()) || 0,
          ristourne_regionale: parseFloat(ristourneRegionale) || 0,
          ristourne_communale: parseFloat(ristourneCommunale) || 0,
        }

        return createFicheLivraison(payload)
      })

      // Attendre que toutes les fiches de livraison soient créées
      const results = await Promise.all(promises)
      
      // Mettre à jour le statut de chaque fiche à "livré"
      const updatePromises = fiches.map(async (fiche) => {
        return ficheService.update(fiche.id, { statut: 'livré' })
      })
      
      await Promise.all(updatePromises)

      // Vérifier s'il y a des erreurs
      const hasErrors = results.some(result => !result.success)
      
      if (hasErrors) {
        toast.warning("Certaines fiches n'ont pas pu être traitées, mais l'opération continue")
      }
      
      toast.success(`${fiches.length} fiche(s) transférée(s) avec succès`)
      onSuccess?.()
      onOpenChange(false)
      
    } catch (error: any) {
      handleApiError(error, "Erreur lors de la création des transferts")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Truck className="h-6 w-6" style={{ color: COLOR }} />
            Transfert Multiple ({fiches.length} fiches)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Récapitulatif des fiches */}
          <div className="p-4 rounded-lg border" style={{ background: 'linear-gradient(90deg, rgba(114,188,33,0.06), rgba(114,188,33,0.03))', borderColor: 'rgba(114,188,33,0.12)' }}>
            <h4 className="font-semibold text-sm uppercase tracking-wide mb-3 flex items-center" style={{ color: COLOR }}>
              <FileText className="h-4 w-4 mr-2" style={{ color: COLOR }} /> Fiches Sélectionnées
            </h4>
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-4">
                {fiches.map((fiche, index) => (
                  <div key={fiche.id} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs" style={{ backgroundColor: 'rgba(114,188,33,0.08)', color: COLOR }}>{index + 1}</Badge>
                      <div>
                        <p className="font-semibold" style={{ color: COLOR }}>{formatReference(fiche)}</p>
                        <p className="text-xs text-gray-500">
                          {fiche.fournisseur?.prenom} {fiche.fournisseur?.nom} • {formatDateUtil(fiche.date_reception)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(fiche.poids_net)} kg</p>
                      <p className="text-xs text-gray-500">{formatCurrency(fiche.prix_total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Totaux */}
            <div className="mt-4 pt-3 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid rgba(114,188,33,0.12)' }}>
              <div className="text-center p-2 bg-white rounded border">
                <p className="text-xs text-gray-600 flex items-center justify-center">
                  <Weight className="h-3 w-3 mr-1" /> Poids Net Total
                </p>
                <p className="text-lg font-bold" style={{ color: COLOR }}>{formatNumber(totalPoidsNet)} kg</p>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <p className="text-xs text-gray-600 flex items-center justify-center">
                  <DollarSign className="h-3 w-3 mr-1" /> Valeur Totale
                </p>
                <p className="text-lg font-bold" style={{ color: COLOR }}>{formatCurrency(totalPrix)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date + Lieu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de transfert *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11", !dateLivraison && "text-gray-500")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateLivraison ? format(dateLivraison, "dd/MM/yyyy", { locale: fr }) : "Choisir..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateLivraison} onSelect={setDateLivraison} locale={fr} />
                </PopoverContent>
              </Popover>
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

          {/* Fonction du destinataire */}
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
              <Label>Ristourne régionale (Ar) *</Label>
              <Input 
                type="number" 
                value={ristourneRegionale} 
                onChange={(e) => setRistourneRegionale(e.target.value)} 
                className="h-11 text-right" 
                step="0.01" 
                min="0" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Ristourne communale (Ar) *</Label>
              <Input 
                type="number" 
                value={ristourneCommunale} 
                onChange={(e) => setRistourneCommunale(e.target.value)} 
                className="h-11 text-right" 
                step="0.01" 
                min="0" 
                required
              />
            </div>
          </div>

          {/* Note d'information */}
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(114,188,33,0.06)', border: '1px solid rgba(114,188,33,0.12)' }}>
            <p className="text-sm" style={{ color: COLOR }}>
              <strong>Note :</strong> Cette opération va créer {fiches.length} fiche(s) de transfert et marquer toutes les fiches sélectionnées comme "livré".
            </p>
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedLivreur || !selectedDestinataire || !fonctionDestinataire.trim()}
                style={{ backgroundColor: COLOR }}
                className="flex-1 h-11 font-semibold text-white hover:opacity-90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  `Créer ${fiches.length} Fiche(s) de Transfert`
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}