// components/transport/transport.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Truck, 
  Package,
  Loader2,
  Check,
  ChevronsUpDown,
  User,
  Building,
  FileText,
  Shield,
  CalendarIcon,
  Leaf,
  Box,
  Factory
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
import { ficheLivraisonApi, ficheLivraisonUtils } from "@/lib/pvreception/fichelivraison-api"
import { CreateFicheLivraisonData } from "@/lib/pvreception/fichelivraison-types"
import { getLivreurs } from "@/lib/livreur/livreur-api"
import type { LivreurFromAPI } from "@/lib/livreur/livreur-types"
import api from "@/api/api"
import { usePoidsNet } from "@/contexts/poidsNet-context"

const COLOR = "#72bc21"

interface StockItem {
  id: number
  type_matiere: string
  stock_total: number
  stock_disponible: number
  created_at: string
  updated_at: string
}

interface StockData {
  FG: StockItem
  CG: StockItem
  GG: StockItem
}

type TypeMatierePremiere = "Feuilles" | "Griffes" | "Clous"

interface Distillateur {
  id: number
  nom_complet: string
  site_collecte: string
  site_collecte_id?: number
  numero?: string
}

const Transport = () => {
  const [dateLivraison] = useState<Date>(new Date()) // Date fixe au jour actuel (modifiable si besoin)
  const [lieuDepart, setLieuDepart] = useState("")
  const [quantiteALivrer, setQuantiteALivrer] = useState("")
  const [ristourneRegionale, setRistourneRegionale] = useState("")
  const [ristourneCommunale, setRistourneCommunale] = useState("")
  const [remarques, setRemarques] = useState("")
  const [typeMatierePremiere, setTypeMatierePremiere] = useState<TypeMatierePremiere | "">("")

  const [selectedLivreur, setSelectedLivreur] = useState<LivreurFromAPI | null>(null)
  const [selectedDistillateur, setSelectedDistillateur] = useState<Distillateur | null>(null)

  const [openLivreur, setOpenLivreur] = useState(false)
  const [openDistillateur, setOpenDistillateur] = useState(false)
  const [searchLivreur, setSearchLivreur] = useState("")
  const [searchDistillateur, setSearchDistillateur] = useState("")

  const [livreurs, setLivreurs] = useState<LivreurFromAPI[]>([])
  const [distillateurs, setDistillateurs] = useState<Distillateur[]>([])
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const { refresh } = usePoidsNet()

  const matieresPremieres: TypeMatierePremiere[] = ["Feuilles", "Griffes", "Clous"]

  const getTypeMPIcon = (type: TypeMatierePremiere) => {
    switch (type) {
      case "Feuilles":
        return <Leaf className="h-4 w-4 mr-2" />
      case "Griffes":
        return <Box className="h-4 w-4 mr-2" />
      case "Clous":
        return <Factory className="h-4 w-4 mr-2" />
      default:
        return <Package className="h-4 w-4 mr-2" />
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true)
      try {
        const [livreursData, distillateursResponse, stocksResponse] = await Promise.all([
          getLivreurs(),
          api.get('/fiche-livraisons/distillateurs/disponibles'),
          api.get('/matiere-premiere/stock')
        ])

        setLivreurs(livreursData)

        if (distillateursResponse.data.success) {
          setDistillateurs(distillateursResponse.data.data)
        }

        if (stocksResponse.data.success && stocksResponse.data.data) {
          setStockData(stocksResponse.data.data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        toast.error('Erreur lors du chargement des données nécessaires')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  const filteredLivreurs = livreurs.filter(livreur =>
    `${livreur.prenom} ${livreur.nom} ${livreur.telephone} ${livreur.numero_vehicule || ""}`
      .toLowerCase()
      .includes(searchLivreur.toLowerCase())
  )

  const filteredDistillateurs = distillateurs.filter(distillateur =>
    `${distillateur.nom_complet} ${distillateur.site_collecte} ${distillateur.numero || ""}`
      .toLowerCase()
      .includes(searchDistillateur.toLowerCase())
  )

  const handleTypeMatiereChange = (type: TypeMatierePremiere) => {
    setTypeMatierePremiere(type)
  }

  const getStockForType = (type: TypeMatierePremiere): StockItem | null => {
    if (!stockData) return null

    switch (type) {
      case "Feuilles":
        return stockData.FG ? { ...stockData.FG, id: 1, type_matiere: "Feuilles" } : null
      case "Clous":
        return stockData.CG ? { ...stockData.CG, id: 2, type_matiere: "Clous" } : null
      case "Griffes":
        return stockData.GG ? { ...stockData.GG, id: 3, type_matiere: "Griffes" } : null
      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!lieuDepart || !selectedLivreur || !selectedDistillateur || !quantiteALivrer || !typeMatierePremiere) {
      setLocalError("Veuillez remplir tous les champs obligatoires")
      return
    }

    const quantite = parseFloat(quantiteALivrer)
    const ristourneReg = parseFloat(ristourneRegionale) || 0
    const ristourneCom = parseFloat(ristourneCommunale) || 0

    if (quantite <= 0) {
      setLocalError("La quantité à livrer doit être supérieure à 0")
      return
    }

    const stock = getStockForType(typeMatierePremiere)
    if (!stock) {
      setLocalError("Aucun stock disponible pour ce type de matière première")
      return
    }

    if (quantite > stock.stock_disponible) {
      setLocalError(`Quantité demandée (${quantite} kg) dépasse le stock disponible (${stock.stock_disponible} kg)`)
      return
    }

    setIsSubmitting(true)

    try {
      const data: CreateFicheLivraisonData = {
        stockpvs_id: stock.id,
        livreur_id: selectedLivreur.id,
        distilleur_id: selectedDistillateur.id,
        date_livraison: new Date().toISOString().split('T')[0], // Date du jour
        lieu_depart: lieuDepart,
        ristourne_regionale: ristourneReg,
        ristourne_communale: ristourneCom,
        quantite_a_livrer: quantite
      }

      const erreursValidation = ficheLivraisonUtils.validerDonnees(data)
      if (erreursValidation.length > 0) {
        setLocalError(erreursValidation.join(', '))
        return
      }

      const response = await ficheLivraisonApi.create(data)

      if (response.success) {
        toast.success("Fiche de transport créée avec succès !")
        // Rafraîchir les poids nets partagés pour que les cartes se mettent à jour automatiquement
        try {
          await refresh()
        } catch (err) {
          // ignore: refresh errors are non-blocking for user flow
          console.warn('Erreur lors du rafraîchissement des poids nets:', err)
        }
        resetForm()
      } else {
        const errorMsg = response.message || 
          (response.errors ? Object.values(response.errors).flat().join(', ') : "Erreur inconnue")
        toast.error(errorMsg)
        setLocalError(errorMsg)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      let errorMessage = "Erreur lors de la création de la fiche de transport"

      if (error.response?.data) {
        const data = error.response.data
        if (data.message) errorMessage = data.message
        if (data.errors) {
          errorMessage = Object.values(data.errors).flat().join(', ')
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      setLocalError(errorMessage)
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
    setTypeMatierePremiere("")
    setSelectedLivreur(null)
    setSelectedDistillateur(null)
    setSearchLivreur("")
    setSearchDistillateur("")
    setLocalError(null)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-xl font-bold text-[#76bc21] flex items-center gap-3">
          <Truck className="h-6 w-6" />
          Fiche de Transport - Matières Premières
        </h1>
        <p className="text-gray-600 mt-2">
          Créer une nouvelle fiche de transport vers un distillateur
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" style={{ color: COLOR }} />
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Date de transport</Label>
              <Button variant="outline" className="w-full justify-start text-left font-normal h-11" disabled>
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                {format(new Date(), "dd/MM/yyyy", { locale: fr })}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Lieu de départ</Label>
              <Input
                value={lieuDepart}
                onChange={(e) => setLieuDepart(e.target.value)}
                placeholder="Ex: Manambondro"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Type de matière première</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-11">
                    {typeMatierePremiere ? (
                      <div className="flex items-center">
                        {getTypeMPIcon(typeMatierePremiere)}
                        <span>{typeMatierePremiere}</span>
                      </div>
                    ) : (
                      "Sélectionner un type"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {matieresPremieres.map((type) => (
                          <CommandItem 
                            key={type}
                            onSelect={() => handleTypeMatiereChange(type)}
                            className="flex items-center"
                          >
                            <Check className={cn("mr-2 h-4 w-4", typeMatierePremiere === type ? "opacity-100" : "opacity-0")} />
                            {getTypeMPIcon(type)}
                            <span>{type}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" style={{ color: COLOR }} />
            Quantité à livrer (kg)
          </h2>
          <Input
            type="number"
            step="0.01"
            value={quantiteALivrer}
            onChange={(e) => setQuantiteALivrer(e.target.value)}
            placeholder="Ex: 150.5"
            required
            className="h-11 text-right font-medium"
            min="0.01"
          />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" style={{ color: COLOR }} />
            Livreur
          </h2>
          
          <Popover open={openLivreur} onOpenChange={setOpenLivreur}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-11 font-normal text-left"
                disabled={isLoadingData}
              >
                {selectedLivreur
                  ? `${selectedLivreur.prenom} ${selectedLivreur.nom} - ${selectedLivreur.telephone}`
                  : isLoadingData ? "Chargement..." : "Sélectionner un livreur"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Rechercher..." value={searchLivreur} onValueChange={setSearchLivreur} />
                <CommandList>
                  <CommandEmpty>Aucun livreur trouvé</CommandEmpty>
                  <CommandGroup className="max-h-48 overflow-y-auto">
                    {filteredLivreurs.map((livreur) => (
                      <CommandItem
                        key={livreur.id}
                        onSelect={() => {
                          setSelectedLivreur(livreur)
                          setOpenLivreur(false)
                          setSearchLivreur("")
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedLivreur?.id === livreur.id ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col">
                          <span className="font-medium">{livreur.prenom} {livreur.nom}</span>
                          <span className="text-xs text-gray-500">
                            {livreur.telephone} {livreur.numero_vehicule && `• ${livreur.numero_vehicule}`}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedLivreur && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
              <span className="text-gray-600">Véhicule :</span> <span className="font-medium">{selectedLivreur.numero_vehicule || "Non spécifié"}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" style={{ color: COLOR }} />
            Distillateur (Destinataire)
          </h2>
          
          <Popover open={openDistillateur} onOpenChange={setOpenDistillateur}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-11 font-normal text-left"
                disabled={isLoadingData}
              >
                {selectedDistillateur
                  ? `${selectedDistillateur.nom_complet} - ${selectedDistillateur.site_collecte}`
                  : isLoadingData ? "Chargement..." : "Sélectionner un distillateur"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Rechercher..." value={searchDistillateur} onValueChange={setSearchDistillateur} />
                <CommandList>
                  <CommandEmpty>Aucun distillateur trouvé</CommandEmpty>
                  <CommandGroup className="max-h-48 overflow-y-auto">
                    {filteredDistillateurs.map((distillateur) => (
                      <CommandItem
                        key={distillateur.id}
                        onSelect={() => {
                          setSelectedDistillateur(distillateur)
                          setOpenDistillateur(false)
                          setSearchDistillateur("")
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedDistillateur?.id === distillateur.id ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col">
                          <span className="font-medium">{distillateur.nom_complet}</span>
                          <span className="text-xs text-gray-500">Site : {distillateur.site_collecte}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedDistillateur && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Site de collecte :</span>{" "}
                  <span className="font-medium">{selectedDistillateur.site_collecte}</span>
                </div>
                {selectedDistillateur.numero && (
                  <div>
                    <span className="text-gray-600">Numéro :</span>{" "}
                    <span className="font-medium">{selectedDistillateur.numero}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" style={{ color: COLOR }} />
            Ristournes (optionnel)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Ristourne régionale (Ar)</Label>
              <Input
                type="number"
                step="0.01"
                value={ristourneRegionale}
                onChange={(e) => setRistourneRegionale(e.target.value)}
                placeholder="0"
                className="h-11 text-right"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Ristourne communale (Ar)</Label>
              <Input
                type="number"
                step="0.01"
                value={ristourneCommunale}
                onChange={(e) => setRistourneCommunale(e.target.value)}
                placeholder="0"
                className="h-11 text-right"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: COLOR }} />
            Observations (optionnel)
          </h2>
          <textarea
            value={remarques}
            onChange={(e) => setRemarques(e.target.value)}
            placeholder="Remarques particulières, instructions..."
            className="w-full min-h-[100px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          />
        </div>

        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {localError}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting} className="flex-1 h-11">
              Réinitialiser
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || !lieuDepart || !selectedLivreur || !selectedDistillateur || !quantiteALivrer || !typeMatierePremiere}
              style={{ backgroundColor: COLOR }}
              className="flex-1 h-11 font-semibold text-white hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Créer la fiche de transport
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Transport