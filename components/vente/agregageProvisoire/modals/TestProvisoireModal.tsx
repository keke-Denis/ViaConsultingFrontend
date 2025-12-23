"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Calendar, Package, UserPlus, User, ChevronsUpDown, Check, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"

const COLOR = "#76bc21"

interface Client {
  id: number
  nom: string
  contact: string
  cin?: string
  entreprise?: string
  typeClient: "Local" | "Etranger"
}

interface TestProvisoireModalProps {
  onClose: () => void
  onSave: (data: any) => void
  clients: Client[]
  searchClient: string
  onSearchClient: (value: string) => void
  onAddClient: () => void
  initialData?: {
    date: string
    clientId: number
    poids: string
    typeHE: "HE Feuilles" | "HE Clous" | "HE Griffes"
  }
}

const TestProvisoireModal: React.FC<TestProvisoireModalProps> = ({
  onClose,
  onSave,
  clients,
  searchClient,
  onSearchClient,
  onAddClient,
  initialData
}) => {
  const [date, setDate] = useState<string>("")
  const [selectedClientId, setSelectedClientId] = useState<number>(initialData?.clientId || 0)
  const [poids, setPoids] = useState<string>(initialData?.poids || "")
  const [typeHE, setTypeHE] = useState<"HE Feuilles" | "HE Clous" | "HE Griffes">(
    initialData?.typeHE || "HE Feuilles"
  )
  const [openClient, setOpenClient] = useState(false)
  const [isLoadingInfos, setIsLoadingInfos] = useState(false)
  const [infosClient, setInfosClient] = useState<any>(null)

  // Set today's date on component mount
  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setDate(formattedDate)
  }, [])

  // Charger les informations du client sélectionné
  useEffect(() => {
    if (selectedClientId) {
      loadClientInfo(selectedClientId)
    } else {
      setInfosClient(null)
    }
  }, [selectedClientId])

  const loadClientInfo = async (clientId: number) => {
    setIsLoadingInfos(true)
    try {
      // Simulation de chargement d'informations client
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Ici, vous feriez un appel API pour récupérer les infos du client
      // Pour l'instant, on simule avec des données
      const client = clients.find(c => c.id === clientId)
      if (client) {
        setInfosClient({
          nom: client.nom,
          contact: client.contact,
          type: client.typeClient,
          // Informations simulées
          historique: {
            total_tests: 5,
            dernier_test: "2024-01-10"
          },
          disponibilite: true,
          message_dispo: "Client disponible pour les tests"
        })
      }
    } catch (error) {
      console.error("Erreur chargement infos client:", error)
      toast.error("Erreur lors du chargement des informations client")
    } finally {
      setIsLoadingInfos(false)
    }
  }

  const selectedClient = clients.find(c => c.id === selectedClientId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClientId) {
      toast.error("Veuillez sélectionner un client !")
      return
    }

    if (!poids || isNaN(Number(poids)) || Number(poids) <= 0) {
      toast.error("Veuillez entrer un poids valide !")
      return
    }

    onSave({
      date,
      clientId: selectedClientId,
      poids,
      typeHE
    })
    onClose()
  }

  const filteredClients = clients.filter(client => 
    client.nom.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.contact.toLowerCase().includes(searchClient.toLowerCase()) ||
    (client.cin && client.cin.toLowerCase().includes(searchClient.toLowerCase())) ||
    (client.entreprise && client.entreprise.toLowerCase().includes(searchClient.toLowerCase()))
  )

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#76bc21]">
                {initialData ? "Modifier le test" : "Nouveau test provisoire"}
              </h3>
              <p className="text-gray-500">Remplissez les informations du test</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date - Read only */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  value={date ? new Date(date).toLocaleDateString('fr-FR') : ''}
                  readOnly
                  className="pl-10 bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500">Date du jour (automatique)</p>
            </div>

            {/* Sélection client avec recherche */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Client *</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onAddClient}
                  className="text-[#76bc21] border-[#76bc21] hover:bg-[#76bc21]/10"
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Nouveau client
                </Button>
              </div>
              
              <Popover open={openClient} onOpenChange={setOpenClient}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-12 pl-10 font-normal text-left"
                    disabled={clients.length === 0}
                  >
                    <User className="absolute left-3 h-5 w-5 text-[#76bc21]" />
                    {selectedClient
                      ? `${selectedClient.nom} - ${selectedClient.contact}`
                      : "Rechercher un client..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Nom, contact, CIN ou entreprise..."
                      value={searchClient}
                      onValueChange={onSearchClient}
                    />
                    <CommandList>
                      <CommandEmpty>Aucun client trouvé</CommandEmpty>
                      <CommandGroup>
                        {filteredClients.map(client => (
                          <CommandItem
                            key={client.id}
                            value={`${client.id}`}
                            onSelect={() => {
                              setSelectedClientId(client.id === selectedClientId ? 0 : client.id)
                              setOpenClient(false)
                              onSearchClient("")
                            }}
                          >
                            <Check className={cn(
                              "mr-2 h-4 w-4", 
                              selectedClientId === client.id ? "opacity-100" : "opacity-0"
                            )} />
                            <div className="w-full">
                              <div className="font-medium">{client.nom}</div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{client.contact}</span>
                                <span className={`px-2 py-0.5 rounded-full ${
                                  client.typeClient === "Local" 
                                    ? "bg-blue-100 text-blue-800" 
                                    : "bg-purple-100 text-purple-800"
                                }`}>
                                  {client.typeClient}
                                </span>
                              </div>
                              {(client.entreprise || client.cin) && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {client.entreprise && `${client.entreprise}`}
                                  {client.cin && client.entreprise ? ` • CIN: ${client.cin}` : client.cin ? `CIN: ${client.cin}` : ''}
                                </div>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Informations du client */}
              {isLoadingInfos && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des informations du client...
                </div>
              )}

              {infosClient && (
                <div className="space-y-3">
                  {!infosClient.disponibilite ? (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      <AlertTriangle className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Client non disponible</div>
                        <div className="text-xs">{infosClient.message_dispo}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                      <Check className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Client disponible</div>
                        <div className="text-xs">{infosClient.message_dispo}</div>
                      </div>
                    </div>
                  )}

                  {/* Historique des tests */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Historique des tests</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total tests effectués</span>
                        <span className="font-medium" style={{ color: COLOR }}>
                          {infosClient.historique.total_tests}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Dernier test</span>
                        <span className="font-medium">
                          {new Date(infosClient.historique.dernier_test).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Type client</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          infosClient.type === "Local" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {infosClient.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Type de HE */}
            <div className="space-y-2">
              <Label>Type de Huile Essentielle *</Label>
              <Select value={typeHE} onValueChange={(value: any) => setTypeHE(value)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <SelectValue placeholder="Choisir le type de HE" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HE Feuilles">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      HE Feuilles
                    </div>
                  </SelectItem>
                  <SelectItem value="HE Clous">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      HE Clous
                    </div>
                  </SelectItem>
                  <SelectItem value="HE Griffes">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-amber-600" />
                      HE Griffes
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Poids à tester */}
            <div className="space-y-2">
              <Label htmlFor="poids">Poids à tester (kg) *</Label>
              <Input
                id="poids"
                type="number"
                step="0.1"
                min="0.1"
                value={poids}
                onChange={(e) => setPoids(e.target.value)}
                placeholder="Ex: 2.5"
                required
              />
              <p className="text-xs text-gray-500">Entrez le poids en kilogrammes</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 text-white"
                style={{ backgroundColor: COLOR }}
              >
                {initialData ? "Modifier" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TestProvisoireModal