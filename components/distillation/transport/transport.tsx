// components/transport/transport.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Truck, 
  Package,
  MapPin,
  Calendar,
  Loader2,
  Check,
  ChevronsUpDown,
  User,
  Building,
  Leaf,
  Box,
  Droplet,
  Phone,
  AlertCircle,
  FileText,
  Shield
} from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { toast } from 'react-toastify'
import { getVendeursDisponibles, getLivreursDisponibles, creerTransport } from '@/lib/distillation/transport/transport-api'
import { useDistillationStats } from '@/contexts/distillation/distillation-stats-context'

const COLOR_LIGHT = "#ffffff"

const MetricCard = ({ title, value, Icon }: { title: string; value: string; Icon: any }) => {
  return (
    <Card
      className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
      style={{
        background: `linear-gradient(to bottom right, ${COLOR_LIGHT}, ${COLOR}10)`,
        borderLeft: `5px solid ${COLOR}`,
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold uppercase text-black">{title}</CardTitle>
        <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_LIGHT }}>
          <Icon className="h-5 w-5" style={{ color: COLOR }} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="text-2xl md:text-3xl font-bold text-black mb-2">{value}</div>
        <div className="mt-auto space-y-2 pt-3 border-t border-gray-100"></div>
      </CardContent>
    </Card>
  )
}

const COLOR = "#72bc21"

// Types pour les entités
interface Livreurnode {
  id: number
  nom: string
  prenom: string
  telephone?: string
  numero_vehicule?: string
  zone_livraison?: string
}

interface VendeurNode {
  id: number
  nom_complet: string
  nom?: string
  prenom?: string
  numero?: string
  localisation?: string
}

interface DistillationNode {
  id: number
  type_matiere?: string
  quantite_disponible?: number
  site_collecte?: string
}

// Types pour les huiles essentielles
type TypeHuileEssentielle = "HE Feuille" | "HE Clous" | "HE Griffes"

const Transport = () => {
  // Fonction pour obtenir la date d'aujourd'hui au format jj/mm/aaaa
  const getTodayDateFormatted = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Fonction pour convertir le format jj/mm/aaaa en aaaa-mm-jj pour l'input date
  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr) return ""
    
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const [day, month, year] = parts
      return `${year}-${month}-${day}`
    }
    return dateStr
  }

  // Fonction pour convertir le format aaaa-mm-jj en jj/mm/aaaa pour l'affichage
  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return ""
    
    // Si c'est déjà au format jj/mm/aaaa, retourner tel quel
    if (dateStr.includes('/')) return dateStr
    
    // Si c'est au format aaaa-mm-jj (input date)
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const [year, month, day] = parts
        return `${day}/${month}/${year}`
      }
    }
    
    return dateStr
  }

  // États pour les champs de base avec date d'aujourd'hui par défaut au format jj/mm/aaaa
  const [dateTransport, setDateTransport] = useState<string>(getTodayDateFormatted())
  const [dateTransportForInput, setDateTransportForInput] = useState<string>(formatDateForInput(getTodayDateFormatted()))
  const [lieuDepart, setLieuDepart] = useState("")
  const [destination, setDestination] = useState("")
  const [quantiteLivree, setQuantiteLivree] = useState("")
  const [fonctionDestinataire, setFonctionDestinataire] = useState("")
  const [ristourneRegionale, setRistourneRegionale] = useState("")
  const [ristourneCommunale, setRistourneCommunale] = useState("")
  const [remarques, setRemarques] = useState("")
  const [typeHuileEssentielle, setTypeHuileEssentielle] = useState<TypeHuileEssentielle | "">("")

  // États pour les entités avec recherche
  const [selectedLivreur, setSelectedLivreur] = useState<Livreurnode | null>(null)
  const [selectedVendeur, setSelectedVendeur] = useState<VendeurNode | null>(null)
  // conserver un état minimal pour la distillation si nécessaire (fallback prioritaire)
  const [selectedDistillation, setSelectedDistillation] = useState<DistillationNode | null>(null)

  // États pour les popovers de recherche
  const [openLivreur, setOpenLivreur] = useState(false)
  const [openVendeur, setOpenVendeur] = useState(false)

  // États pour la recherche
  const [searchLivreur, setSearchLivreur] = useState("")
  const [searchVendeur, setSearchVendeur] = useState("")

  // États pour les données
  const [livreurs, setLivreurs] = useState<Livreurnode[]>([])
  const [vendeurs, setVendeurs] = useState<VendeurNode[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { stats, loading, refreshStats } = useDistillationStats()
  const { user } = useAuth()
  // indique si le site de destination a été rempli automatiquement
  const [destinationAutoFilled, setDestinationAutoFilled] = useState(false)

  // Options pour le dropdown des huiles essentielles
  const huilesEssentielles: TypeHuileEssentielle[] = ["HE Feuille", "HE Clous", "HE Griffes"]

  // Load data from backend
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setIsLoadingData(true)
      const [vResp, lResp] = await Promise.all([
        getVendeursDisponibles(),
        getLivreursDisponibles(),
      ])

      if (!mounted) return

  if (vResp?.success) setVendeurs(vResp.data || [])
  if (lResp?.success) setLivreurs(lResp.data || [])

      setIsLoadingData(false)
    })()
    return () => { mounted = false }
  }, [])

  // Construire une liste de distillations à partir des stats (si disponibles)
  const statsDistillations: Array<any> = []
  try {
    if (stats?.distillations) {
      const { he_feuilles, he_clous, he_griffes } = stats.distillations
      const collect = (arr: any[] | undefined) => (arr || []).map((d: any) => ({
        id: d.id,
        quantite: d.quantite,
        quantite_kg: d.quantite_kg,
        date_fin: d.date_fin,
        type_matiere: d.type_matiere_premiere || d.type_matiere || d.type_he,
        type_he: d.type_he,
        site_collecte: d.site_collecte // may be undefined in stats
      }))
      statsDistillations.push(...collect(he_feuilles?.distillations))
      statsDistillations.push(...collect(he_clous?.distillations))
      statsDistillations.push(...collect(he_griffes?.distillations))
    }
  } catch (e) {
    // ignore
  }

  // Utiliser le site de collecte de l'utilisateur comme valeur par défaut
  useEffect(() => {
    try {
      // Prefer the authenticated user's localisation, otherwise fall back to distillation stats' distilleur_info.site_collecte
      const userSite = user?.localisation?.Nom || stats?.distilleur_info?.site_collecte || ""
      // ne pas écraser si l'utilisateur a déjà choisi une destination
      if (!destination && userSite) {
        setDestination(userSite)
        setDestinationAutoFilled(true)
      }
    } catch (e) {
      // ignore
    }
  }, [user, stats])

  useEffect(() => {
    try {
      const distSite = selectedDistillation?.site_collecte || ""
      const userSite = user?.localisation?.Nom || stats?.distilleur_info?.site_collecte || ""
      if (!destination && !userSite && distSite) {
        setDestination(distSite)
        setDestinationAutoFilled(true)
      }
    } catch (e) {
      // ignore
    }
  }, [selectedDistillation, user, stats])

  // Filtres
  const filteredLivreurs = livreurs.filter(l =>
    `${l.nom || ''} ${l.prenom || ''} ${l.telephone || ''} ${l.numero_vehicule || ''}`
      .toLowerCase()
      .includes(searchLivreur.toLowerCase())
  )

  const filteredVendeurs = vendeurs.filter(v =>
    `${v.nom_complet || ''} ${v.numero || ''} ${v.localisation || ''}`
      .toLowerCase()
      .includes(searchVendeur.toLowerCase())
  )

  // Gestion du changement de date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDateTransportForInput(inputValue)
    
    // Convertir de aaaa-mm-jj vers jj/mm/aaaa
    const formattedDate = formatDateForDisplay(inputValue)
    setDateTransport(formattedDate)
  }

  // Gestion du changement de date via input texte
  const handleDateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDateTransport(value)
    // si l'utilisateur tape au format dd/mm/yyyy, mettre à jour dateTransportForInput
    const parts = value.split('/')
    if (parts.length === 3) {
      const [day, month, year] = parts
      if (year && month && day) {
        setDateTransportForInput(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedLivreur || !selectedVendeur || !typeHuileEssentielle || !dateTransportForInput || !quantiteLivree) {
      toast.warning("Veuillez remplir tous les champs obligatoires")
      return
    }

    const qty = parseFloat(quantiteLivree)
    if (isNaN(qty) || qty <= 0) {
      toast.warning("La quantité livrée doit être supérieure à 0")
      return
    }

    setIsSubmitting(true)

    // Déterminer l'id de la distillation à envoyer à l'API.
    // Priorité: distillation explicitement sélectionnée par l'utilisateur,
    // sinon prendre la première distillation disponible issue des stats si présente.
    const distillationId = selectedDistillation?.id ?? (statsDistillations && statsDistillations.length ? statsDistillations[0].id : null)

    if (!distillationId) {
      // L'API exige `distillation_id`. Empêcher l'envoi et demander à l'utilisateur de sélectionner/fournir une distillation.
      toast.warning("Aucune distillation disponible ou sélectionnée. Veuillez sélectionner une distillation source.")
      setIsSubmitting(false)
      return
    }

    const payload = {
      distillation_id: distillationId,
      vendeur_id: selectedVendeur.id,
      livreur_id: selectedLivreur.id,
      date_transport: dateTransportForInput,
      site_destination: destination || user?.localisation?.Nom || stats?.distilleur_info?.site_collecte || selectedDistillation?.site_collecte || "",
      type_matiere: typeHuileEssentielle,
      quantite_a_livrer: qty,
      ristourne_regionale: ristourneRegionale ? parseFloat(ristourneRegionale) : 0,
      ristourne_communale: ristourneCommunale ? parseFloat(ristourneCommunale) : 0,
      observations: remarques || null
    }

    try {
      const res = await creerTransport(payload)
      if (res.success) {
        toast.success(res.message || 'Transport créé')
        resetForm()
        try { refreshStats() } catch (e) { /* ignore */ }
      } else {
        const msg = res.message || (res.error && res.error.message) || 'Erreur lors de la création'
        toast.error(msg)
        console.error('create transport failed', res)
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur réseau')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    // Réinitialiser tous les champs avec la date d'aujourd'hui au format jj/mm/aaaa
    const todayFormatted = getTodayDateFormatted()
    setDateTransport(todayFormatted)
    setDateTransportForInput(formatDateForInput(todayFormatted))
    setLieuDepart("")
    setDestination("")
    setQuantiteLivree("")
    setTypeHuileEssentielle("")
    setFonctionDestinataire("")
    setRistourneRegionale("")
    setRistourneCommunale("")
    setRemarques("")
    setSelectedLivreur(null)
    setSelectedVendeur(null)
    setSelectedDistillation(null)
    setSearchLivreur("")
    setSearchVendeur("")
    setDestinationAutoFilled(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Metric cards on top (same style as ExpeditionCard example) */}
      <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <MetricCard
            title="HE Feuilles"
            value={loading ? '...' : stats?.distillations?.he_feuilles?.total_quantite_formate ?? '0 kg'}
            Icon={Leaf}
          />
          <MetricCard
            title="HE Griffes"
            value={loading ? '...' : stats?.distillations?.he_griffes?.total_quantite_formate ?? '0 kg'}
            Icon={Box}
          />
          <MetricCard
            title="HE Clous"
            value={loading ? '...' : stats?.distillations?.he_clous?.total_quantite_formate ?? '0 kg'}
            Icon={Droplet}
          />
        </div>
      </div>

      <div className="mb-8 border-b pb-4">
        <h1 className="text-xl font-bold text-[#76bc21] flex items-center gap-3">
          Fiche de Transport - Huiles Essentielles
        </h1>
        <p className="text-gray-600 mt-2">
          Créer une nouvelle fiche de transport pour les huiles essentielles
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Informations de base */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" style={{ color: COLOR }} />
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Date de transport</Label>
              <div className="flex flex-col gap-2">
                {/* Input texte pour le format jj/mm/aaaa */}
                <Input
                  type="text"
                  value={dateTransport}
                  onChange={handleDateTextChange}
                  placeholder="jj/mm/aaaa"
                  required
                  className="h-11"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lieu de départ</Label>
              <Input
                value={lieuDepart}
                onChange={(e) => setLieuDepart(e.target.value)}
                placeholder="Ex: Pk 12"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Site de destination</Label>
                <Input
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setDestinationAutoFilled(false); }}
                  placeholder="Ex: Mokomby / PK12"
                  className="h-11"
                  readOnly={destinationAutoFilled}
                />
            </div>

            {/* Dropdown pour le type d'huile essentielle */}
            <div className="space-y-2">
              <Label>Type d'huile essentielle</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-11">
                    {typeHuileEssentielle || "Sélectionner un type"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {huilesEssentielles.map((type) => (
                          <CommandItem 
                            key={type}
                            onSelect={() => setTypeHuileEssentielle(type)}
                          >
                            <Check className={cn("mr-2 h-4 w-4", typeHuileEssentielle === type ? "opacity-100" : "opacity-0")} />
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

        {/* Distillation source section removed as requested */}

        {/* Section 3: Quantité livrée */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" style={{ color: COLOR }} />
            Quantité
          </h2>
          
          <div className="space-y-2 max-w-xs">
            <Label>Quantité livrée (kg)</Label>
            <Input
              type="number"
              step="0.01"
              value={quantiteLivree}
              onChange={(e) => setQuantiteLivree(e.target.value)}
              placeholder="Ex: 100.5"
              required
              className="h-11 text-right font-medium"
            />
            <p className="text-xs text-gray-500">Quantité en kilogrammes (kg)</p>
          </div>
        </div>

        {/* Section 4: Livreur (from backend) */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" style={{ color: COLOR }} />
            Livreur
          </h2>

          <div className="space-y-2">
            <Popover open={openLivreur} onOpenChange={setOpenLivreur}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-11" disabled={isLoadingData}>
                  {selectedLivreur ? `${selectedLivreur.prenom || ''} ${selectedLivreur.nom || ''}` : "Sélectionner un livreur"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Rechercher un livreur..." 
                    value={searchLivreur} 
                    onValueChange={setSearchLivreur} 
                  />
                  <CommandList>
                    <CommandEmpty>Aucun livreur trouvé</CommandEmpty>
                    <CommandGroup className="max-h-48 overflow-y-auto">
                      {filteredLivreurs.map((l) => (
                        <CommandItem 
                          key={l.id} 
                          onSelect={() => { 
                            setSelectedLivreur(l)
                            setOpenLivreur(false)
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedLivreur?.id === l.id ? "opacity-100" : "opacity-0")} />
                          <div>
                            <div className="font-medium">{l.prenom} {l.nom}</div>
                            <div className="text-xs text-gray-500">{l.telephone || ''} • {l.numero_vehicule || l.zone_livraison || ''}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedLivreur && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Véhicule:</span>{" "}
                  <span className="font-medium">{selectedLivreur.numero_vehicule || "Non spécifié"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Contact:</span>{" "}
                  <span className="font-medium">{selectedLivreur.telephone || '—'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Vendeur (from backend) */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" style={{ color: COLOR }} />
            Vendeur (destinataire)
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Popover open={openVendeur} onOpenChange={setOpenVendeur}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between h-11" disabled={isLoadingData}>
                    {selectedVendeur ? `${selectedVendeur.nom_complet}` : "Sélectionner un vendeur"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Rechercher un vendeur..." 
                      value={searchVendeur} 
                      onValueChange={setSearchVendeur} 
                    />
                    <CommandList>
                      <CommandEmpty>Aucun vendeur trouvé</CommandEmpty>
                      <CommandGroup className="max-h-48 overflow-y-auto">
                        {filteredVendeurs.map((v) => (
                          <CommandItem 
                            key={v.id} 
                            onSelect={() => { 
                              setSelectedVendeur(v)
                              setOpenVendeur(false)
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedVendeur?.id === v.id ? "opacity-100" : "opacity-0")} />
                            <div>
                              <div className="font-medium">{v.nom_complet}</div>
                              <div className="text-xs text-gray-500">{v.localisation || ''} • {v.numero || ''}</div>
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
              <Label>Fonction du destinataire</Label>
              <Input
                value={fonctionDestinataire}
                onChange={(e) => setFonctionDestinataire(e.target.value)}
                placeholder="Ex: Responsable logistique, Gérant, Agent de réception..."
                className="h-11"
                required
              />
            </div>

            {selectedVendeur && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Localisation:</span>{" "}
                    <span className="font-medium">{selectedVendeur.localisation || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Contact:</span>{" "}
                    <span className="font-medium">{selectedVendeur.numero || '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Ristournes */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" style={{ color: COLOR }} />
            Ristournes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Ristourne régionale (Ar)</Label>
              <Input
                type="number"
                step="0.01"
                value={ristourneRegionale}
                onChange={(e) => setRistourneRegionale(e.target.value)}
                placeholder="Ex: 50000"
                className="h-11 text-right"
              />
              <p className="text-xs text-gray-500">Montant en Ariary</p>
            </div>

            <div className="space-y-2">
              <Label>Ristourne communale (Ar)</Label>
              <Input
                type="number"
                step="0.01"
                value={ristourneCommunale}
                onChange={(e) => setRistourneCommunale(e.target.value)}
                placeholder="Ex: 25000"
                className="h-11 text-right"
              />
              <p className="text-xs text-gray-500">Montant en Ariary</p>
            </div>
          </div>
        </div>

        {/* Section 6: Remarques */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: COLOR }} />
            Observations
          </h2>
          
          <div className="space-y-2">
            <Label>Remarques et observations</Label>
            <textarea
              value={remarques}
              onChange={(e) => setRemarques(e.target.value)}
              placeholder="Ex: Route difficile, Produit fragile, Heure de livraison spécifique, Instructions particulières..."
              className="w-full min-h-[120px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-offset-2"
            />
          </div>
        </div>

        {/* Validation et boutons d'action */}
        <div className="bg-gray-50 rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
              className="flex-1 h-11"
            >
              Réinitialiser
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || !selectedLivreur || !selectedVendeur || !typeHuileEssentielle || !fonctionDestinataire.trim() || !quantiteLivree}
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