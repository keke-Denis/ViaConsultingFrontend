import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, User, CreditCard, MapPin, DollarSign, Calendar, FileText, Download, Package, Leaf, Sprout, Droplet, Phone, IdCard, Building, History, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, Mail, Target, AlertCircle } from "lucide-react"

// Types pour les collecteurs
interface Collecteur {
  id: number
  nom: string
  cin: string
  contact: string
  email: string
  site_collecte: string
  montant_disponible: number
  total_depense: number
  solde_initial: number
  date_inscription: string
  dernier_transfert: string
  transferts: Transfert[]
  matieres_premieres: MatierePremiere[]
}

interface Transfert {
  id: number
  admin_nom: string
  admin_cin: string
  date_heure: string
  montant: number
  type: "argent" | "matiere_premiere"
  reference: string
  statut: "complet" | "partiel" | "en_attente"
}

interface MatierePremiere {
  id: number
  type: "feuilles" | "clous" | "griffes" | "he_feuilles"
  date_heure: string
  quantite: number
  unite: "kg"
  qualite: "A" | "B" | "C"
  prix_unitaire: number
}

const RapportCollecteur = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const COLOR = "#72bc21"
  const tauxConversionHE = 0.9 // 1L ≈ 0.9kg

  // Prix unitaire pour le calcul
  const prixUnitaire = {
    feuilles: 150,
    griffes: 200,
    clous: 180,
    he_feuilles: 2.5
  }

  // Générer des données de démonstration améliorées
  const generateCollecteurs = (): Collecteur[] => {
    const sites = ["Vangaindrano", "Manambondro", "Vohipeno", "Manakara", "Matangy", "Ampasimandreva"]
    const admins = [
      { nom: "Admin Principal", cin: "ADM001" },
      { nom: "Admin Secondaire", cin: "ADM002" },
      { nom: "Admin RH", cin: "ADM003" },
      { nom: "Admin Finances", cin: "ADM004" }
    ]
    
    const qualites: Array<"A" | "B" | "C"> = ["A", "B", "C"]
    
    return Array.from({ length: 20 }, (_, index) => {
      const site = sites[Math.floor(Math.random() * sites.length)]
      const soldeInitial = Math.floor(Math.random() * 2000000) + 500000
      const totalDepense = Math.floor(Math.random() * 3000000) + 1000000
      const montantDisponible = soldeInitial - totalDepense
      
      // Générer 2-4 transferts
      const transferts = Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, i) => {
        const admin = admins[Math.floor(Math.random() * admins.length)]
        const date = `${20 - i}/12/2024`
        const heure = `${String(8 + Math.floor(Math.random() * 8)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
        const montant = Math.floor(Math.random() * 1000000) + 100000
        const type = Math.random() > 0.5 ? "argent" : "matiere_premiere"
        
        return {
          id: i + 1,
          admin_nom: admin.nom,
          admin_cin: admin.cin,
          date_heure: `${date} ${heure}`,
          montant: type === "argent" ? montant : 0,
          type: type,
          reference: `TRF-${date.replace(/\//g, '')}-${String(index + 1).padStart(3, '0')}`,
          statut: ["complet", "partiel", "en_attente"][Math.floor(Math.random() * 3)] as "complet" | "partiel" | "en_attente"
        }
      })
      
      // Générer matières premières (convertir HE feuilles de L à kg)
      const matieres_premieres = Array.from({ length: 4 }, (_, i) => {
        const types: Array<"feuilles" | "clous" | "griffes" | "he_feuilles"> = ["feuilles", "clous", "griffes", "he_feuilles"]
        const quantitesBase = [30, 25, 20, 4500]
        const quantite = quantitesBase[i] + Math.floor(Math.random() * 20) - 10
        const quantiteKg = types[i] === "he_feuilles" ? quantite * tauxConversionHE : quantite
        
        return {
          id: i + 1,
          type: types[i],
          date_heure: `${20 - i}/12/2024 ${String(8 + i).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          quantite: quantiteKg, // Toujours en kg
          unite: "kg",
          qualite: qualites[Math.floor(Math.random() * 3)],
          prix_unitaire: prixUnitaire[types[i]]
        }
      })
      
      return {
        id: index + 1,
        nom: `Collecteur ${index + 1}`,
        cin: `CIN${String(index + 1).padStart(6, '0')}`,
        contact: `+261 32 ${String(index + 1).padStart(2, '0')} ${String((index + 1) * 111).padStart(3, '0')} ${String((index + 1) * 11).padStart(2, '0')}`,
        email: `collecteur${index + 1}@gmail.com`,
        site_collecte: site,
        montant_disponible: montantDisponible > 0 ? montantDisponible : 0,
        total_depense: totalDepense,
        solde_initial: soldeInitial,
        date_inscription: `01/12/2024`,
        dernier_transfert: transferts[0]?.date_heure || `${20}/12/2024 10:00`,
        transferts: transferts,
        matieres_premieres: matieres_premieres
      }
    })
  }

  const [collecteurs] = useState<Collecteur[]>(generateCollecteurs())

  // Formater la devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculer les totaux de MP (toujours en kg)
  const calculerTotauxMP = (matieres: MatierePremiere[]) => {
    const totaux = {
      feuilles: 0,
      clous: 0,
      griffes: 0,
      he_feuilles: 0,
      valeur_totale: 0
    }
    
    matieres.forEach(mp => {
      if (!mp || !mp.type || !mp.quantite) return
      
      switch(mp.type) {
        case "feuilles": 
          totaux.feuilles += mp.quantite
          totaux.valeur_totale += mp.quantite * (mp.prix_unitaire || prixUnitaire.feuilles)
          break
        case "clous": 
          totaux.clous += mp.quantite
          totaux.valeur_totale += mp.quantite * (mp.prix_unitaire || prixUnitaire.clous)
          break
        case "griffes": 
          totaux.griffes += mp.quantite
          totaux.valeur_totale += mp.quantite * (mp.prix_unitaire || prixUnitaire.griffes)
          break
        case "he_feuilles": 
          totaux.he_feuilles += mp.quantite
          totaux.valeur_totale += mp.quantite * (mp.prix_unitaire || prixUnitaire.he_feuilles)
          break
      }
    })
    
    return totaux
  }

  // Statistiques globales
  const statistiquesGlobales = {
    totalCollecteurs: collecteurs.length,
    totalMontantDisponible: collecteurs.reduce((sum, c) => sum + (c.montant_disponible || 0), 0),
    totalDepenses: collecteurs.reduce((sum, c) => sum + (c.total_depense || 0), 0),
    totalTransferts: collecteurs.reduce((sum, c) => sum + (c.transferts?.length || 0), 0),
    totalMP: collecteurs.reduce((sum, c) => {
      const totaux = calculerTotauxMP(c.matieres_premieres || [])
      return sum + totaux.feuilles + totaux.clous + totaux.griffes + totaux.he_feuilles
    }, 0)
  }

  // Filtrer les collecteurs
  const filteredCollecteurs = collecteurs.filter((collecteur) => {
    if (!collecteur) return false
    
    const searchableFields = [
      collecteur.nom,
      collecteur.cin,
      collecteur.contact,
      collecteur.email,
      collecteur.site_collecte
    ].filter(Boolean) as string[]
    
    return searchableFields.some(field =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredCollecteurs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredCollecteurs.length / itemsPerPage)

  // Fonctions de pagination
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Fonction pour exporter les données
  const exporterDonnees = () => {
    const data = currentItems.map(collecteur => {
      const totaux = calculerTotauxMP(collecteur.matieres_premieres || [])
      return {
        "Nom": collecteur.nom || "",
        "CIN": collecteur.cin || "",
        "Contact": collecteur.contact || "",
        "Email": collecteur.email || "",
        "Site de collecte": collecteur.site_collecte || "",
        "Date d'inscription": collecteur.date_inscription || "",
        "Solde initial": formatCurrency(collecteur.solde_initial || 0),
        "Montant disponible": formatCurrency(collecteur.montant_disponible || 0),
        "Total dépensé": formatCurrency(collecteur.total_depense || 0),
        "Dernier transfert": collecteur.dernier_transfert || "",
        "Nombre de transferts": (collecteur.transferts || []).length,
        "Feuilles (kg)": totaux.feuilles.toFixed(1),
        "Clous (kg)": totaux.clous.toFixed(1),
        "Griffes (kg)": totaux.griffes.toFixed(1),
        "HE Feuilles (kg)": totaux.he_feuilles.toFixed(1),
        "Valeur totale MP": formatCurrency(totaux.valeur_totale)
      }
    })

    const jsonStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(jsonStr)
    const exportFileDefaultName = `rapport-collecteurs-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Obtenir la couleur du statut
  const getStatutColor = (statut: string) => {
    switch(statut) {
      case "complet": return "bg-[#72bc21]/10 text-black border-[#72bc21]"
      case "partiel": return "bg-amber-100 text-amber-800 border-amber-300"
      case "en_attente": return "bg-gray-100 text-gray-800 border-gray-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Fonction pour extraire la date d'une date_heure
  const getDateFromDateTime = (dateTime: string) => {
    if (!dateTime) return ""
    const parts = dateTime.split(' ')
    return parts[0] || ""
  }

  // Fonction pour extraire l'heure d'une date_heure
  const getTimeFromDateTime = (dateTime: string) => {
    if (!dateTime) return ""
    const parts = dateTime.split(' ')
    return parts[1] || ""
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header avec recherche et statistiques */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">RAPPORT DES COLLECTEURS</h2>
          <p className="text-sm text-gray-700 mt-1">
            {collecteurs.length} collecteurs enregistrés • Suivi complet des activités
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher un collecteur..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 w-full sm:w-64 border border-[#72bc21] text-black"
            />
          </div>
          
          <button
            onClick={exporterDonnees}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#72bc21] text-white rounded-lg hover:bg-[#5aa017] transition-colors border border-[#72bc21]"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-[#72bc21] bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">Collecteurs</span>
            </div>
            <p className="text-2xl font-bold text-black">{statistiquesGlobales.totalCollecteurs}</p>
            <p className="text-xs text-gray-700">Total enregistrés</p>
          </CardContent>
        </Card>

        <Card className="border border-[#72bc21] bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">Disponible</span>
            </div>
            <p className="text-2xl font-bold text-black">{formatCurrency(statistiquesGlobales.totalMontantDisponible)}</p>
            <p className="text-xs text-gray-700">Solde total</p>
          </CardContent>
        </Card>

        <Card className="border border-[#72bc21] bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">Dépensé</span>
            </div>
            <p className="text-2xl font-bold text-black">{formatCurrency(statistiquesGlobales.totalDepenses)}</p>
            <p className="text-xs text-gray-700">Total dépenses</p>
          </CardContent>
        </Card>

        <Card className="border border-[#72bc21] bg-gradient-to-r from-[#72bc21]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">MP Total</span>
            </div>
            <p className="text-2xl font-bold text-black">{statistiquesGlobales.totalMP.toFixed(1)} kg</p>
            <p className="text-xs text-gray-700">Matières premières</p>
          </CardContent>
        </Card>
      </div>

      {/* Table des collecteurs avec pagination */}
      <div className="bg-white rounded-xl border border-[#72bc21] overflow-hidden shadow-sm">
        {/* En-tête de table */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-[#72bc21]/5 border-b border-[#72bc21]">
          <div className="col-span-3 font-semibold text-black">Informations Collecteur</div>
          <div className="col-span-2 font-semibold text-black">Contact</div>
          <div className="col-span-2 font-semibold text-black">Site</div>
          <div className="col-span-2 font-semibold text-black">Finances</div>
          <div className="col-span-2 font-semibold text-black">Statistiques</div>
          <div className="col-span-1 font-semibold text-black">Actions</div>
        </div>

        {/* Corps de table */}
        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {currentItems.length === 0 ? (
            <div className="text-center py-16 text-gray-700">
              <div className="mb-4 text-4xl">📋</div>
              Aucun collecteur trouvé
            </div>
          ) : (
            currentItems.map((collecteur) => {
              const totauxMP = calculerTotauxMP(collecteur.matieres_premieres || [])
              const totalMP = totauxMP.feuilles + totauxMP.clous + totauxMP.griffes + totauxMP.he_feuilles
              
              return (
                <div key={collecteur.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 border-b border-[#72bc21]/20">
                  {/* Informations Collecteur */}
                  <div className="col-span-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#72bc21] rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-black">{collecteur.nom || "N/A"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <IdCard className="h-3 w-3 text-gray-700" />
                          <span className="text-sm text-gray-700">{collecteur.cin || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-700" />
                          <span className="text-xs text-gray-700">Inscrit le: {collecteur.date_inscription || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact */}
                  <div className="col-span-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-700" />
                        <span className="text-sm text-gray-700">{collecteur.contact || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-700" />
                        <span className="text-xs text-gray-700 truncate">{collecteur.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Site */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-700" />
                      <span className="text-black">{collecteur.site_collecte || "N/A"}</span>
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-[#72bc21]/10 text-black border-[#72bc21] text-xs">
                        Site actif
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Finances */}
                  <div className="col-span-2">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Disponible:</span>
                        <span className="font-semibold text-black">{formatCurrency(collecteur.montant_disponible || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Dépensé:</span>
                        <span className="font-semibold text-black">{formatCurrency(collecteur.total_depense || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Initial:</span>
                        <span className="text-sm text-gray-700">{formatCurrency(collecteur.solde_initial || 0)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Statistiques */}
                  <div className="col-span-2">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Transferts:</span>
                        <span className="font-semibold text-black">{(collecteur.transferts || []).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">MP Total:</span>
                        <span className="font-semibold text-black">{totalMP.toFixed(1)} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Dernier:</span>
                        <span className="text-xs text-gray-700">{getDateFromDateTime(collecteur.dernier_transfert || "")}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-1">
                    <button
                      onClick={() => exporterDonnees()}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#72bc21] text-white rounded hover:bg-[#5aa017] transition-colors border border-[#72bc21]"
                      title="Voir détails"
                    >
                      <FileText className="h-3 w-3" />
                    </button>
                  </div>
                  
                  {/* Détails supplémentaires */}
                  <div className="col-span-12 mt-4 pt-4 border-t border-[#72bc21]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Section Transferts */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <History className="h-5 w-5 text-black" />
                          <h3 className="font-bold text-black">Historique des Transferts ({(collecteur.transferts || []).length})</h3>
                        </div>
                        <div className="space-y-3">
                          {(collecteur.transferts || []).map((transfert, index) => (
                            <Card key={transfert.id} className="border border-[#72bc21] bg-gradient-to-r from-[#72bc21]/5 to-transparent">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-black">Transfert {index + 1}</span>
                                      <Badge className={`text-xs ${getStatutColor(transfert.statut || "")}`}>
                                        {(transfert.statut || "").replace('_', ' ')}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">Réf: {transfert.reference || "N/A"}</p>
                                  </div>
                                  <span className="font-bold text-black">
                                    {transfert.type === "argent" ? formatCurrency(transfert.montant || 0) : "Matière"}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-700">Admin:</span>
                                    <p className="font-medium text-black">{transfert.admin_nom || "N/A"}</p>
                                    <p className="text-xs text-gray-700">CIN: {transfert.admin_cin || "N/A"}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-700">Date:</span>
                                    <p className="font-medium text-black">{getDateFromDateTime(transfert.date_heure || "")}</p>
                                    <p className="text-xs text-gray-700">Heure: {getTimeFromDateTime(transfert.date_heure || "")}</p>
                                  </div>
                                </div>
                                
                                <div className="mt-2 flex items-center gap-2 text-xs">
                                  <span className="text-gray-700">Type:</span>
                                  <Badge className={`${transfert.type === "argent" ? 'bg-green-100 text-green-800 border-green-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                                    {transfert.type === "argent" ? "💰 Argent" : "📦 Matière"}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      
                      {/* Section Matières Premières */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-5 w-5 text-black" />
                          <h3 className="font-bold text-black">Matières Premières Collectées (en kg)</h3>
                        </div>
                        
                        {/* Totaux par type */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <Card className="border border-[#72bc21] bg-gradient-to-br from-[#72bc21]/10 to-transparent">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Leaf className="h-4 w-4 text-black" />
                                <span className="text-sm font-medium text-black">Feuilles</span>
                              </div>
                              <p className="text-2xl font-bold text-black">{totauxMP.feuilles.toFixed(1)} kg</p>
                              <p className="text-xs text-gray-700">
                                {formatCurrency(totauxMP.feuilles * prixUnitaire.feuilles)}
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card className="border border-[#72bc21] bg-gradient-to-br from-[#4a9014]/10 to-transparent">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Sprout className="h-4 w-4 text-black" />
                                <span className="text-sm font-medium text-black">Griffes</span>
                              </div>
                              <p className="text-2xl font-bold text-black">{totauxMP.griffes.toFixed(1)} kg</p>
                              <p className="text-xs text-gray-700">
                                {formatCurrency(totauxMP.griffes * prixUnitaire.griffes)}
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card className="border border-[#72bc21] bg-gradient-to-br from-[#a8d466]/10 to-transparent">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="h-4 w-4 text-black" />
                                <span className="text-sm font-medium text-black">Clous</span>
                              </div>
                              <p className="text-2xl font-bold text-black">{totauxMP.clous.toFixed(1)} kg</p>
                              <p className="text-xs text-gray-700">
                                {formatCurrency(totauxMP.clous * prixUnitaire.clous)}
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card className="border border-[#72bc21] bg-gradient-to-br from-[#2a700e]/10 to-transparent">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Droplet className="h-4 w-4 text-black" />
                                <span className="text-sm font-medium text-black">HE Feuilles</span>
                              </div>
                              <p className="text-2xl font-bold text-black">{totauxMP.he_feuilles.toFixed(1)} kg</p>
                              <p className="text-xs text-gray-700">
                                {formatCurrency(totauxMP.he_feuilles * prixUnitaire.he_feuilles)}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Résumé */}
                        <Card className="border border-[#72bc21] bg-gradient-to-r from-gray-50 to-[#72bc21]/5">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium text-black">Total Matières Premières</p>
                                <p className="text-2xl font-bold text-black">{totalMP.toFixed(1)} kg</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-black">Valeur Totale</p>
                                <p className="text-xl font-bold text-black">{formatCurrency(totauxMP.valeur_totale)}</p>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-700">
                              Moyenne qualité: {(collecteur.matieres_premieres || [])[0]?.qualite || "A"}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {filteredCollecteurs.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[#72bc21] bg-gray-50">
            <div className="text-sm text-gray-700">
              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredCollecteurs.length)} sur {filteredCollecteurs.length} collecteurs
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded border ${currentPage === 1 ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-[#72bc21] text-black hover:bg-[#72bc21]/10'}`}
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded border ${currentPage === 1 ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-[#72bc21] text-black hover:bg-[#72bc21]/10'}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 rounded border ${currentPage === pageNum ? 'bg-[#72bc21] text-white border-[#72bc21]' : 'border-[#72bc21] text-black hover:bg-[#72bc21]/10'}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded border ${currentPage === totalPages ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-[#72bc21] text-black hover:bg-[#72bc21]/10'}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded border ${currentPage === totalPages ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-[#72bc21] text-black hover:bg-[#72bc21]/10'}`}
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RapportCollecteur