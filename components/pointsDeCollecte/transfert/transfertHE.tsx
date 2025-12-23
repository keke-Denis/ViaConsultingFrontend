// components/transport/TransfertHE.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Truck, 
  Loader2,
  CalendarIcon,
  Droplets,
  MapPin,
  CheckCircle,
  ChevronsUpDown,
  Check,
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { toast } from "react-toastify"

import { heFicheLivraisonApi } from "@/lib/TestHuille/fiche-livraison-api"
import type {
  Livreur,
  Destinateur,
  LivreursResponse,
  DestinateursResponse
} from "@/lib/TestHuille/fiche-livraison-types"
import type { PoidsNetData } from "@/lib/stockHE/stockHE-types"
import { useStockHE } from "@/contexts/stockHE-context"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const COLOR = "#72bc21"

const TransfertHE = () => {
  const [dateLivraison, setDateLivraison] = useState<Date>(new Date())
  const [lieuDepart, setLieuDepart] = useState("")
  const [quantiteALivrer, setQuantiteALivrer] = useState("")
  const [ristourneRegionale, setRistourneRegionale] = useState("")
  const [ristourneCommunale, setRistourneCommunale] = useState("")
  const [remarques, setRemarques] = useState("")
  const [fonctionDestinataire, setFonctionDestinataire] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const [selectedLivreur, setSelectedLivreur] = useState<Livreur | null>(null)
  const [selectedVendeur, setSelectedVendeur] = useState<Destinateur | null>(null)
  const [openLivreur, setOpenLivreur] = useState(false)
  const [openVendeur, setOpenVendeur] = useState(false)
  const [searchLivreur, setSearchLivreur] = useState("")
  const [searchVendeur, setSearchVendeur] = useState("")

  const [livreurs, setLivreurs] = useState<Livreur[]>([])
  const [vendeurs, setVendeurs] = useState<Destinateur[]>([])
  const [stockHeId, setStockHeId] = useState<number | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  const typeMatiere = "HE feuille"
  const destination = "Manakara"

  useEffect(() => {
    const loadData = async () => {
  setIsLoadingData(true)
      

      try {
        // Utilisez getDestinateurs() qui va appeler la route /destinateurs
        const [livreursResponse, destinateursResponse, etatStockResponse] = await Promise.allSettled([
          heFicheLivraisonApi.getLivreurs(),
          heFicheLivraisonApi.getDestinateurs(),
          heFicheLivraisonApi.getEtatStock()
        ])

        if (livreursResponse.status === 'fulfilled') {
          const result = livreursResponse.value as LivreursResponse
          if (result.success) {
            setLivreurs(result.data)
          } else {
            toast.error(result.message || "Erreur de chargement des livreurs")
          }
        }

        if (destinateursResponse.status === 'fulfilled') {
          const result = destinateursResponse.value as DestinateursResponse
          if (result.success) {
            setVendeurs(result.data)
          } else {
            toast.error(result.message || "Erreur de chargement des vendeurs")
          }
        }

        // Try to get stock id from backend state (Stockhe)
        if (etatStockResponse.status === 'fulfilled') {
          const etat = etatStockResponse.value as any
          const maybeId = etat?.data?.id ?? etat?.data?.stockhe_id ?? null
          if (maybeId) setStockHeId(Number(maybeId))
        }

      } catch (error) {
        console.error("Erreur de chargement des données:", error)
        toast.error("Erreur de chargement des données")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  const { stock, isLoading: isStockLoading, decreaseBy, refresh: refreshStock, setStockValue } = useStockHE()

  useEffect(() => {
    const quantite = parseFloat(quantiteALivrer)
    const stockDisponible = getStockDisponible(stock)
    
    if (quantite > 0 && stockDisponible !== null) {
      if (quantite > stockDisponible) {
        const msg = `La quantité demandée (${quantite.toFixed(2)} kg) dépasse le stock disponible (${stockDisponible.toFixed(2)} kg)`
        setLocalError(msg)
        // show a toast so user gets immediate feedback
        toast.error(msg)
      } else if (localError?.includes("dépasse le stock disponible")) {
        setLocalError(null)
      }
    }
  }, [quantiteALivrer, stock])

  const filteredLivreurs = livreurs.filter(l =>
    `${l.prenom} ${l.nom} ${(l as any).contact ?? (l as any).telephone ?? ''} ${(l as any).numero_vehicule ?? ''} ${(l as any).cin ?? ''}`
      .toLowerCase()
      .includes(searchLivreur.toLowerCase())
  )

  const filteredVendeurs = vendeurs.filter(d =>
    `${(d as any).nom_complet ?? (d.prenom + ' ' + d.nom)} ${(d as any).numero ?? ''}`.toLowerCase().includes(searchVendeur.toLowerCase())
  )

  // prefer explicit param to avoid closing over `stock` before it's declared
  const getStockDisponible = (stockParam?: any): number | null => {
    const stockVal = stockParam?.HE_FEUILLES
    if (stockVal === null || stockVal === undefined) {
      return null
    }
    const stock = stockVal
    if (typeof stock === 'number') {
      return stock
    }
    
    if (typeof stock === 'string') {
      const parsed = parseFloat(stock)
      return isNaN(parsed) ? 0 : parsed
    }
    
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    
    const validationErrors: string[] = []
    
    if (!lieuDepart.trim()) validationErrors.push("Le lieu de départ est requis")
    if (!quantiteALivrer.trim()) validationErrors.push("La quantité à livrer est requise")
    if (!selectedLivreur) validationErrors.push("Le livreur est requis")
    if (!selectedVendeur) validationErrors.push("Le vendeur (destinataire) est requis")
    if (!fonctionDestinataire.trim()) validationErrors.push("La fonction du destinataire est requise")
    
    if (validationErrors.length > 0) {
      const msg = validationErrors.join(". ")
      setLocalError(msg)
      toast.error(msg)
      return
    }

    const quantite = parseFloat(quantiteALivrer)
    const ristourneReg = ristourneRegionale ? parseFloat(ristourneRegionale) : 0
    const ristourneCom = ristourneCommunale ? parseFloat(ristourneCommunale) : 0

    if (isNaN(quantite) || quantite <= 0) {
      setLocalError("La quantité à livrer doit être supérieure à 0")
      return
    }

  const stockDisponible = getStockDisponible(stock)
    if (stockDisponible !== null && quantite > stockDisponible) {
      const msg = `La quantité demandée (${quantite.toFixed(2)} kg) dépasse le stock disponible (${stockDisponible.toFixed(2)} kg)`
      setLocalError(msg)
      toast.error(msg)
      return
    }

    setIsSubmitting(true)

    try {
      const dateFormatee = format(dateLivraison, "yyyy-MM-dd HH:mm:ss")

      // Build payload matching backend FicheLivraisonController::store expectations
      const payload = {
        livreur_id: selectedLivreur!.id,
        vendeur_id: selectedVendeur!.id,
        date_heure_livraison: dateFormatee,
        fonction_destinataire: fonctionDestinataire.trim(),
        lieu_depart: lieuDepart.trim(),
        destination: destination,
        type_produit: typeMatiere,
        poids_net: quantite,
        quantite_a_livrer: quantite,
        ristourne_regionale: ristourneReg,
        ristourne_communale: ristourneCom
      }

      console.log("Payload envoyé:", payload)

      const response = await heFicheLivraisonApi.create(payload)

      if (response.success) {
        toast.success("Fiche de transport HE créée avec succès !")
        // update shared stock context immediately so UI (cards) reflect the change
        try {
          decreaseBy(quantite)
          // refresh in background to sync with server
          void refreshStock()
        } catch (err) {
          console.error('Erreur lors de la mise à jour locale du stock:', err)
        }

        resetForm()
        
      } else {
        throw new Error(response.message || "Erreur lors de la création")
      }
      
    } catch (error: any) {
      console.error('Erreur:', error)
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la création de la fiche de transport"
      setLocalError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setLieuDepart("")
    setQuantiteALivrer("")
    setRistourneRegionale("")
    setRistourneCommunale("")
    setRemarques("")
    setFonctionDestinataire("")
    setSelectedLivreur(null)
    setSelectedVendeur(null)
    setLocalError(null)
  }

  const stockDisponible = getStockDisponible(stock)
  const quantiteSaisie = parseFloat(quantiteALivrer) || 0
  const stockRestant = stockDisponible !== null ? Math.max(0, stockDisponible - quantiteSaisie) : 0

  // helper to format livreur display (selected / list)
  const formatLivreurDisplay = (l: Livreur) => {
    const parts: string[] = []
    if ((l as any).telephone) parts.push(`Tel: ${(l as any).telephone}`)
    if ((l as any).numero_vehicule) parts.push(`Veh: ${(l as any).numero_vehicule}`)
    if ((l as any).cin) parts.push(`CIN: ${(l as any).cin}`)
    if ((l as any).contact && !(l as any).telephone) parts.push(`Contact: ${(l as any).contact}`)
    return parts.length ? ` - ${parts.join(' • ')}` : ''
  }

  const formatVendeurDisplay = (v: Destinateur) => {
    const parts: string[] = []
    if ((v as any).numero) parts.push(`Tel: ${(v as any).numero}`)
    if ((v as any).CIN) parts.push(`CIN: ${(v as any).CIN}`)
    return parts.length ? ` - ${parts.join(' • ')}` : ''
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-xl font-bold text-[#72bc21] flex items-center gap-3">
          <Droplets className="h-6 w-6" />
          Transfert d'Huile Essentielle
        </h1>
        <p className="text-gray-600 mt-2">
          Formulaire de transfert d'huile essentielle de feuilles vers Manakara
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" style={{ color: COLOR }} />
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date de transport</Label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-[#72bc21]">
                <CalendarIcon className="h-4 w-4 text-black" />
                <span className="font-medium">
                  {format(dateLivraison, "dd/MM/yyyy", { locale: fr })}
                </span>
                <span className="ml-auto text-xs text-black">Date du jour</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Lieu de départ *</Label>
              <Input
                value={lieuDepart}
                onChange={(e) => setLieuDepart(e.target.value)}
                placeholder="Ex: Site de production, Entrepôt principal..."
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Type de matière première</Label>
              <div className="flex items-center justify-between p-3 border rounded-md bg-[#72bc21]">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-black" />
                  <span className="font-medium">HE feuille</span>
                </div>
                <span className="text-xs text-black bg-[#72bc21] px-2 py-1 rounded">Fixe</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Destination</Label>
              <div className="flex items-center justify-between p-3 border rounded-md bg-[#72bc21]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-black" />
                  <span className="font-medium">Manakara</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Label className="text-sm font-medium">Livreur *</Label>
            <Popover open={openLivreur} onOpenChange={setOpenLivreur}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openLivreur}
                  className="w-full justify-between h-11"
                  disabled={isLoadingData}
                >
                  {selectedLivreur ? (
                    `${selectedLivreur.prenom} ${selectedLivreur.nom}` + formatLivreurDisplay(selectedLivreur)
                  ) : "Sélectionner un livreur..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Rechercher un livreur..." 
                    value={searchLivreur}
                    onValueChange={setSearchLivreur}
                  />
                  <CommandList>
                    <CommandEmpty>Aucun livreur trouvé.</CommandEmpty>
                    <CommandGroup className="max-h-48 overflow-y-auto">
                      {filteredLivreurs.map((livreur) => (
                        <CommandItem
                          key={livreur.id}
                          value={`${livreur.prenom} ${livreur.nom}`}
                          onSelect={() => {
                            setSelectedLivreur(livreur)
                            setOpenLivreur(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedLivreur?.id === livreur.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{livreur.prenom} {livreur.nom}</span>
                            <span className="text-xs text-gray-500">{formatLivreurDisplay(livreur).replace(/^ - /, '')}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium">Vendeur (Destinataire) *</Label>
            <Popover open={openVendeur} onOpenChange={setOpenVendeur}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openVendeur}
                  className="w-full justify-between h-11"
                  disabled={isLoadingData}
                >
                  {selectedVendeur 
                    ? `${(selectedVendeur as any).nom_complet ?? (selectedVendeur.prenom + ' ' + selectedVendeur.nom)}${formatVendeurDisplay(selectedVendeur)}`
                    : "Sélectionner un vendeur..."
                  }
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Rechercher un vendeur..." 
                    value={searchVendeur}
                    onValueChange={setSearchVendeur}
                  />
                  <CommandList>
                    <CommandEmpty>Aucun vendeur trouvé.</CommandEmpty>
                    <CommandGroup className="max-h-48 overflow-y-auto">
                      {filteredVendeurs.map((vendeur) => (
                        <CommandItem
                          key={vendeur.id}
                          value={`${(vendeur as any).nom_complet ?? (vendeur.prenom + ' ' + vendeur.nom)}`}
                          onSelect={() => {
                            setSelectedVendeur(vendeur)
                            setOpenVendeur(false)
                            setSearchVendeur("")
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedVendeur?.id === vendeur.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{(vendeur as any).nom_complet ?? (vendeur.prenom + ' ' + vendeur.nom)}</span>
                            <span className="text-xs text-gray-500">{formatVendeurDisplay(vendeur).replace(/^ - /, '')}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium">Fonction du destinataire *</Label>
            <Input
              value={fonctionDestinataire}
              onChange={(e) => setFonctionDestinataire(e.target.value)}
              placeholder="Ex: Responsable logistique, Gérant, Agent de réception..."
              required
              className="h-11"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Droplets className="h-5 w-5" style={{ color: COLOR }} />
            Quantité d'Huile Essentielle
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Quantité à livrer (kg) *
                <span className="text-xs text-gray-500 ml-2">
                  {stockDisponible !== null ? `Max: ${stockDisponible.toFixed(2)} kg` : "Chargement..."}
                </span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={quantiteALivrer}
                  onChange={(e) => setQuantiteALivrer(e.target.value)}
                  placeholder="Ex: 50.5"
                  required
                  className="h-11 text-right font-medium pr-12"
                  min="0.01"
                  max={stockDisponible !== null ? stockDisponible : undefined}
                  disabled={stockDisponible === null || isStockLoading}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">kg</span>
              </div>
              
              {quantiteSaisie > 0 && !isStockLoading && stockDisponible !== null && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="text-sm text-blue-600">Quantité sélectionnée</div>
                      <div className="text-lg font-semibold text-blue-800">{quantiteSaisie.toFixed(2)} kg</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <div className="text-sm text-green-600">Stock restant après</div>
                      <div className="text-lg font-semibold text-green-800">{stockRestant.toFixed(2)} kg</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Truck className="h-5 w-5" style={{ color: COLOR }} />
            Ristournes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ristourne régionale (Ar)</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={ristourneRegionale}
                  onChange={(e) => setRistourneRegionale(e.target.value)}
                  placeholder="0.00"
                  className="h-11 text-right font-medium pr-12"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">Ar</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Ristourne communale (Ar)</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={ristourneCommunale}
                  onChange={(e) => setRistourneCommunale(e.target.value)}
                  placeholder="0.00"
                  className="h-11 text-right font-medium pr-12"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">Ar</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Droplets className="h-5 w-5" style={{ color: COLOR }} />
            Observations
          </h2>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Remarques spéciales</Label>
            <textarea
              value={remarques}
              onChange={(e) => setRemarques(e.target.value)}
              placeholder="Ex: Manipuler avec soin, conserver à l'abri de la lumière..."
              className="w-full min-h-[140px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm"
            />
          </div>
        </div>

        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{localError}</span>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting || isLoadingData}
              className="flex-1 h-11"
            >
              Réinitialiser
            </Button>
            
            <Button
              type="submit"
              disabled={
                !lieuDepart.trim() || 
                !quantiteALivrer.trim() ||
                !selectedLivreur ||
                !selectedVendeur ||
                !fonctionDestinataire.trim() ||
                isSubmitting ||
                isLoadingData ||
                isStockLoading ||
                parseFloat(quantiteALivrer) <= 0 ||
                stockDisponible === null ||
                (stockDisponible !== null && parseFloat(quantiteALivrer) > stockDisponible)
              }
              style={{ backgroundColor: COLOR }}
              className="flex-1 h-11 font-semibold text-white hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmer le transfert
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default TransfertHE