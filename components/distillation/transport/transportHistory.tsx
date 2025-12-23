// components/transport/transport-history.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Search, Package, MapPin, User, Building, Calendar, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/api/api"

const COLOR = "#72bc21"

// Types pour les transports
interface Transport {
  id: number
  numero_document?: string
  date_transport?: string
  lieu_depart?: string
  destination?: string
  type_huile_essentielle?: string
  quantite_livree?: number
  chauffeur_nom?: string
  chauffeur_telephone?: string
  destinataire_nom?: string
  fonction_destinataire?: string
  ristourne_regionale?: number | null
  ristourne_communale?: number | null
  remarques?: string | null
}

const TransportHistory = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [transports, setTransports] = useState<Transport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Récupérer les transports depuis l'API
  useEffect(() => {
    let mounted = true
    const fetchTransports = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/transports/mes-transports')
        const data = res.data
        if (data?.success && Array.isArray(data.data)) {
            const mapped = data.data.map((t: any) => ({
            id: t.id,
            numero_document: t.distillation?.numero_document ?? t.numero_document ?? `TR-${t.id}`,
            date_transport: t.date_transport ?? t.dateTransport ?? null,
            lieu_depart: t.lieu_depart ?? t.lieuDepart ?? t.distillation?.expedition?.ficheLivraison?.distilleur?.siteCollecte?.Nom ?? 'Non défini',
            destination: t.site_destination ?? t.destination ?? t.destinataire_nom ?? '',
            type_huile_essentielle: t.type_matiere ?? t.type_huile_essentielle ?? '',
            // Ensure quantite_livree is a number (API may return a string)
            quantite_livree: parseFloat(String(t.quantite_a_livrer ?? t.quantite_livree ?? 0)) || 0,
            chauffeur_nom: t.livreur ? `${t.livreur.nom} ${t.livreur.prenom}` : t.chauffeur_nom ?? '',
            chauffeur_telephone: t.livreur?.telephone ?? t.chauffeur_telephone ?? '',
            destinataire_nom: t.vendeur ? `${t.vendeur.nom} ${t.vendeur.prenom}` : t.destinataire_nom ?? '',
            fonction_destinataire: t.vendeur?.role ?? t.fonction_destinataire ?? '',
            ristourne_regionale: t.ristourne_regionale ?? null,
            ristourne_communale: t.ristourne_communale ?? null,
            remarques: t.observations ?? t.remarques ?? null,
          }))
          if (mounted) setTransports(mapped)
        } else {
          setError(data?.message ?? 'Réponse API inattendue')
        }
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err.message ?? 'Erreur réseau')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchTransports()

    return () => { mounted = false }
  }, [])

  const formatCurrency = (amount: number | null) => {
    // Treat null/undefined as zero; allow 0 to be formatted
    if (amount == null) return "0 Ar"
    return new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatRelativeDate = (dateString?: string | null) => {
    if (!dateString) return "-"

    // Accept either DD/MM/YYYY or ISO dates
    let date: Date
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/').map(Number)
      date = new Date(year, month - 1, day)
    } else {
      const parsed = Date.parse(dateString)
      if (isNaN(parsed)) return dateString
      date = new Date(parsed)
    }

    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    // Format as dd/mm/yyyy for display
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`
  }

  const filteredTransports = transports.filter((transport) =>
    Object.values(transport).some((value) => {
      // Safely convert any value to a lowercase string for comparison
      const v = value == null ? "" : String(value).toLowerCase()
      return v.includes(searchTerm.toLowerCase())
    })
  )

  return (
    <div className="space-y-6 p-4">
      {/* Header avec recherche */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#72bc21]">
            Historique des Transports <br />
            <span className="text-gray-500 text-lg font-normal">
              Tous les transports d'huiles essentielles enregistrés
            </span>
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un transport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="divide-x divide-gray-200 border-t border-gray-200" />

      {/* Liste des transports */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-200 max-h-[700px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-500">Chargement...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : filteredTransports.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="mb-4 text-4xl">📋</div>
              Aucun transport trouvé
            </div>
          ) : (
            filteredTransports.map((transport) => (
              <div
                key={transport.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* En-tête avec numéro document et date */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg text-[#72bc21]">
                        {transport.numero_document}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        {formatRelativeDate(transport.date_transport)}
                      </span>
                    </div>

                    {/* Informations de trajet */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{transport.lieu_depart}</span>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{transport.destination}</span>
                      </div>
                    </div>

                    {/* Détails du produit et quantité */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {transport.type_huile_essentielle}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold">{(transport.quantite_livree ?? 0).toFixed(1)} kg</span> livrés
                      </span>
                    </div>

                    {/* Informations chauffeur et destinataire */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{transport.chauffeur_nom}</p>
                          <p className="text-xs text-gray-500">{transport.chauffeur_telephone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{transport.destinataire_nom}</p>
                          <p className="text-xs text-gray-500">{transport.fonction_destinataire}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ristournes */}
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Ristourne régionale: </span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(transport.ristourne_regionale)}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <div>
                        <span className="text-gray-600">Ristourne communale: </span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(transport.ristourne_communale)}
                        </span>
                      </div>
                    </div>

                    {/* Remarques */}
                    {transport.remarques && (
                      <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="italic">{transport.remarques}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TransportHistory