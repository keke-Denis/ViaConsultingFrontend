"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { getLivreurs } from "@/lib/livreur/livreur-api"
import { destinateurApi } from "@/lib/destinateur/destinateur-api"
import { useFicheLivraison } from "@/contexts/pvreception/fichelivraison-context"
import { usePVReception } from "@/contexts/pvreception/pvreception-context"
import { ficheLivraisonUtils } from "@/lib/pvreception/fichelivraison-api"
import { CalendarIcon, Loader2, ChevronsUpDown, FileText, Weight, DollarSign, Truck, Check } from "lucide-react"
import DestinataireModal from "@/components/collecte/destinateur/DestinataireModal"
import { formatCurrency, formatNumber, formatDate as formatDateUtil } from "@/utils/formatters"
import { cn } from "@/lib/utils"
import type { LivreurFromAPI } from "@/lib/livreur/livreur-types"
import type { Destinateur } from "@/lib/destinateur/destinateur-types"

const COLOR = "#76bc21"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  pvReceptions: any[]
  onSuccess?: () => void
}

export function FicheDeLivraisonMultiple({ open, onOpenChange, pvReceptions, onSuccess }: Props) {
  const [dateLivraison, setDateLivraison] = useState<Date | undefined>(undefined)
  const [lieuDepart, setLieuDepart] = useState("")
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
  const [ristourneRegionale, setRistourneRegionale] = useState("0")
  const [ristourneCommunale, setRistourneCommunale] = useState("0")
  const [isDestModalOpen, setIsDestModalOpen] = useState(false)

  const { createFicheLivraison } = useFicheLivraison()
  const { updatePVReception } = usePVReception()

  useEffect(() => {
    if (!open) return
    const load = async () => {
      setIsLoadingData(true)
      try {
        const [lData, dData] = await Promise.all([getLivreurs(), destinateurApi.getAll()])
        setLivreurs(lData)
        setDestinateurs(dData)
        setDateLivraison(new Date())
        setRistourneRegionale("0")
        setRistourneCommunale("0")
        if (pvReceptions.length > 0) setLieuDepart(pvReceptions[0].site_collecte?.Nom || "")
        // Reset selections like in ficheLivraison-modal
        setSelectedLivreur(null)
        setSelectedDestinataire(null)
        setSearchLivreur("")
        setSearchDestinataire("")
      } catch (err) {
        toast.error("Erreur de chargement des données")
      } finally {
        setIsLoadingData(false)
      }
    }
    load()
  }, [open, pvReceptions])

  const filteredLivreurs = livreurs.filter(l => `${l.prenom} ${l.nom} ${l.telephone}`.toLowerCase().includes(searchLivreur.toLowerCase()))
  const filteredDestinateurs = destinateurs.filter(d => `${d.nom_prenom} ${d.nom_entreprise} ${d.contact}`.toLowerCase().includes(searchDestinataire.toLowerCase()))

  const totalPoidsNet = pvReceptions.reduce((t, r) => t + (parseFloat((r.poids_net ?? 0).toString()) || 0), 0)
  const totalPrix = pvReceptions.reduce((t, r) => t + (parseFloat((r.prix_total ?? 0).toString()) || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLivreur || !selectedDestinataire || !dateLivraison) return toast.error("Remplissez tous les champs obligatoires")
    setIsSubmitting(true)

    let success = 0
    const errors: string[] = []

    for (const pv of pvReceptions) {
      const payload = {
        pv_reception_id: pv.id,
        date_livraison: dateLivraison.toISOString().split('T')[0],
        livreur_id: selectedLivreur.id,
        destinateur_id: selectedDestinataire.id,
        lieu_depart: lieuDepart || pv.site_collecte?.Nom || "",
        ristourne_regionale: parseFloat(ristourneRegionale) || 0,
        ristourne_communale: parseFloat(ristourneCommunale) || 0,
        quantite_a_livrer: parseFloat((pv.quantite_restante ?? pv.poids_net ?? 0).toString()) || 0,
      }

      // Validation côté client (comme dans ficheLivraison-modal)
      const validationErrors = ficheLivraisonUtils.validerDonnees(payload as any)
      if (validationErrors.length > 0) {
        errors.push(`PV ${pv.numero_doc || pv.id}: ${validationErrors.join(', ')}`)
        continue
      }

      try {
        await createFicheLivraison(payload as any)
        // Mettre à jour le PV en 'en_attente_livraison'
        await updatePVReception(pv.id, { statut: 'en_attente_livraison' })
        success++
      } catch (err: any) {
        console.error(`Erreur PV ${pv.id}:`, err)
        if (err.response?.data?.errors) {
          errors.push(`PV ${pv.numero_doc || pv.id}: ${Object.values(err.response.data.errors).flat().join(', ')}`)
        } else {
          errors.push(`PV ${pv.numero_doc || pv.id}: ${err.message || 'Erreur API'}`)
        }
      }
    }

    if (success > 0) {
      toast.success(`${success} fiche(s) de transfert créée(s)`)
    }
    if (errors.length > 0) {
      toast.warning(`Certaines fiches ont échoué:\n${errors.join('\n')}`)
    }

    onSuccess?.()
    onOpenChange(false)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Truck className="h-6 w-6" style={{ color: COLOR }} />
            Fiche Livraison Multiple ({pvReceptions.length})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="p-4 rounded-lg border" style={{ background: 'linear-gradient(90deg, rgba(114,188,33,0.04), rgba(114,188,33,0.02))', borderColor: 'rgba(114,188,33,0.10)' }}>
            <h4 className="font-semibold text-sm uppercase tracking-wide mb-3 flex items-center" style={{ color: COLOR }}>
              <FileText className="h-4 w-4 mr-2" style={{ color: COLOR }} /> Sélection
            </h4>
            <ScrollArea className="h-40">
              <div className="space-y-2 pr-4">
                {pvReceptions.map((pv, idx) => (
                  <div key={pv.id} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs" style={{ backgroundColor: 'rgba(114,188,33,0.06)', color: COLOR }}>{idx + 1}</Badge>
                      <div>
                        <p className="font-semibold" style={{ color: COLOR }}>{pv.numero_doc || `PV-${pv.id}`}</p>
                        <p className="text-xs text-gray-500">{pv.fournisseur?.prenom} {pv.fournisseur?.nom} • {formatDateUtil(pv.date_reception)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(pv.poids_net)} kg</p>
                      <p className="text-xs text-gray-500">{formatCurrency(pv.prix_total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 pt-3 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid rgba(114,188,33,0.08)' }}>
              <div className="text-center p-2 bg-white rounded border">
                <p className="text-xs text-gray-600 flex items-center justify-center"><Weight className="h-3 w-3 mr-1" /> Poids Net Total</p>
                <p className="text-lg font-bold" style={{ color: COLOR }}>{formatNumber(totalPoidsNet)} kg</p>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <p className="text-xs text-gray-600 flex items-center justify-center"><DollarSign className="h-3 w-3 mr-1" /> Valeur Totale</p>
                <p className="text-lg font-bold" style={{ color: COLOR }}>{formatCurrency(totalPrix)}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de transfert *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`w-full justify-start text-left font-normal h-11 ${!dateLivraison ? 'text-gray-500' : ''}`}>
                    <CalendarIcon className="mr-2 h-4 w-4" /> {dateLivraison ? format(dateLivraison, 'dd/MM/yyyy', { locale: fr }) : 'Choisir...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateLivraison} onSelect={setDateLivraison} locale={fr} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Lieu de départ *</Label>
              <Input value={lieuDepart} onChange={(e) => setLieuDepart(e.target.value)} className="h-11" />
            </div>
          </div>

          {/* Ristournes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ristourne_regionale" className="text-sm font-medium text-gray-700">Ristourne régionale (Ar)</Label>
              <Input
                id="ristourne_regionale"
                type="number"
                placeholder="0.00"
                value={ristourneRegionale}
                onChange={(e) => setRistourneRegionale(e.target.value)}
                className="h-11 text-right"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ristourne_communale" className="text-sm font-medium text-gray-700">Ristourne communale (Ar)</Label>
              <Input
                id="ristourne_communale"
                type="number"
                placeholder="0.00"
                value={ristourneCommunale}
                onChange={(e) => setRistourneCommunale(e.target.value)}
                className="h-11 text-right"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Livreur / Destinataire */}
          <div className="space-y-2">
            <Label>Livreur *</Label>
            <Popover open={openLivreur} onOpenChange={setOpenLivreur}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-11" disabled={isLoadingData}>
                  {selectedLivreur ? `${selectedLivreur.prenom} ${selectedLivreur.nom}` : 'Sélectionner un livreur'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Rechercher..." value={searchLivreur} onValueChange={setSearchLivreur} />
                  <CommandList>
                    <CommandEmpty>Aucun livreur trouvé</CommandEmpty>
                    <CommandGroup className="max-h-48 overflow-y-auto">
                      {filteredLivreurs.map(l => (
                        <CommandItem key={l.id} onSelect={() => { setSelectedLivreur(l); setOpenLivreur(false) }}>
                          <div className="font-medium">{l.prenom} {l.nom}</div>
                          <div className="text-xs text-gray-500">{l.telephone}</div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Destinataire *</Label>
            <div className="flex items-center gap-2">
              <Popover open={openDestinataire} onOpenChange={setOpenDestinataire}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-11" disabled={isLoadingData}>
                  {selectedDestinataire ? `${selectedDestinataire.nom_prenom} - ${selectedDestinataire.contact}` : isLoadingData ? "Chargement..." : "Sélectionner un destinataire"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Rechercher un destinataire..." value={searchDestinataire} onValueChange={setSearchDestinataire} className="h-9" />
                  <CommandList>
                    <CommandEmpty className="py-6 text-center text-sm text-gray-500">Aucun destinataire trouvé</CommandEmpty>
                    <CommandGroup className="max-h-48 overflow-y-auto">
                      {filteredDestinateurs.map((destinateur) => (
                        <CommandItem
                          key={destinateur.id}
                          value={`${destinateur.nom_prenom} ${destinateur.nom_entreprise} ${destinateur.contact} ${destinateur.id}`}
                          onSelect={() => {
                            setSelectedDestinataire(destinateur)
                            setOpenDestinataire(false)
                            setSearchDestinataire("")
                          }}
                          className="py-2"
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedDestinataire?.id === destinateur.id ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span className="font-medium">{destinateur.nom_prenom}</span>
                            <span className="text-xs text-gray-500">{destinateur.contact} • {destinateur.nom_entreprise}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
              </Popover>

              {/* Bouton pour ouvrir le modal de création de destinataire */}
              <Button variant="ghost" onClick={() => setIsDestModalOpen(true)} className="h-11 px-3">
                +
              </Button>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting || !selectedLivreur || !selectedDestinataire || !dateLivraison} style={{ backgroundColor: COLOR }} className="flex-1 h-11 font-semibold text-white">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</> : `Créer ${pvReceptions.length} fiche(s)`}
              </Button>
            </div>
          </DialogFooter>
        </form>
        {/* Modal pour créer un nouveau destinataire */}
        <DestinataireModal
          isOpen={isDestModalOpen}
          onClose={() => setIsDestModalOpen(false)}
          mode="add"
          onSuccess={(d) => {
            // ajouter le nouveau destinataire dans la liste et le sélectionner
            setDestinateurs(prev => [d, ...prev])
            setSelectedDestinataire(d)
            setIsDestModalOpen(false)
            toast.success("Destinataire ajouté et sélectionné")
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default FicheDeLivraisonMultiple
