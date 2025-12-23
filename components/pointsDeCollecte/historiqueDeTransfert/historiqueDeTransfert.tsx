// components/transport/transport-history.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Search, Package, MapPin, User, Calendar, FileText, Download } from "lucide-react"
import { useState, useEffect } from "react"
import api from "@/api/api"
import { jsPDF } from "jspdf"

const COLOR = "#72bc21"

interface SiteCollecte {
  id: number
  Nom: string
  created_at: string | null
  updated_at: string | null
}

interface Distilleur {
  id: number
  nom: string
  prenom: string
  numero: string
  site_collecte_id: number
  site_collecte?: SiteCollecte
  localisation_id: number
  CIN: string
  role: string
  created_at: string
  updated_at: string
}

interface Livreur {
  id: number
  nom: string
  prenom: string
  telephone: string
  numero_vehicule: string
  zone_livraison: string
}

interface Stockpv {
  id: number
  type_matiere: string
  stock_total: string
  stock_disponible: string
  created_at: string | null
  updated_at: string
}

interface FicheLivraison {
  id: number
  stockpvs_id: number
  livreur_id: number
  distilleur_id: number
  date_livraison: string
  lieu_depart: string
  ristourne_regionale: string
  ristourne_communale: string
  quantite_a_livrer: string
  created_at: string
  updated_at: string
  stockpv: Stockpv
  livreur: Livreur
  distilleur: Distilleur
}

const typeMatiereMapping: Record<string, string> = {
  "FG": "Feuilles",
  "CG": "Clous",
  "GG": "Griffes",
  "Feuilles": "Feuilles",
  "Clous": "Clous",
  "Griffes": "Griffes"
}

const HistoriqueDeTransfert = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [fichesLivraison, setFichesLivraison] = useState<FicheLivraison[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFichesLivraison = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.get('/fiche-livraisons')
      
      if (response.data.success) {
        setFichesLivraison(response.data.data || [])
      } else {
        setError("Erreur lors du chargement des données")
      }
    } catch (err: any) {
      console.error('Erreur API:', err)
      setError(err.response?.data?.message || "Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFichesLivraison()
  }, [])

  const formatCurrency = (amount: string | number | null) => {
    if (!amount && amount !== 0 && amount !== "0") return "0 Ar"
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return "0 Ar"
    
    return new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(numAmount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue"
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getSiteCollecte = (fiche: FicheLivraison) => {
    if (!fiche?.distilleur) {
      return "Non attribué"
    }
    
    if (fiche.distilleur.site_collecte && fiche.distilleur.site_collecte.Nom) {
      return fiche.distilleur.site_collecte.Nom
    }
    
    return "Site inconnu"
  }

  const getNumeroDocument = (fiche: FicheLivraison) => {
    const site = getSiteCollecte(fiche)
    return `${site}${fiche.id}`
  }

  const getNomComplet = (personne: { nom?: string; prenom?: string }) => {
    if (!personne) return "Inconnu"
    return `${personne.nom || ''} ${personne.prenom || ''}`.trim() || "Inconnu"
  }

  const getDestination = (fiche: FicheLivraison) => {
    return getSiteCollecte(fiche)
  }

  const getTypeMatiere = (fiche: FicheLivraison) => {
    if (!fiche?.stockpv?.type_matiere) return "Non spécifié"
    
    const typeRaw = fiche.stockpv.type_matiere
    return typeMatiereMapping[typeRaw] || typeRaw
  }

  const getQuantite = (fiche: FicheLivraison) => {
    if (!fiche?.quantite_a_livrer) return "0.0"
    
    try {
      const quantite = parseFloat(fiche.quantite_a_livrer)
      return isNaN(quantite) ? "0.0" : quantite.toFixed(1)
    } catch {
      return "0.0"
    }
  }

  const downloadPDF = (fiche: FicheLivraison) => {
    const doc = new jsPDF()
    
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [114, 188, 33]
    }

    const colorRGB = hexToRgb(COLOR)
    const primaryColor: [number, number, number] = colorRGB
    const lightColor: [number, number, number, number] = [colorRGB[0], colorRGB[1], colorRGB[2], 0.1]
    const pageWidth = doc.internal.pageSize.width
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)
    
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor(255, 255, 255)
    doc.text("VIA CONSULTING", margin, 22)
    
    doc.setFontSize(12)
    doc.text("Fiche de Transport", pageWidth - margin, 22, { align: 'right' })
    
    doc.setFontSize(16)
    doc.text(`TRANSFERT N° ${getNumeroDocument(fiche)}`, pageWidth / 2, 45, { align: 'center' })
    
    let yPos = 60
    
  doc.setFillColor(lightColor[0], lightColor[1], lightColor[2], lightColor[3])
    doc.roundedRect(margin, yPos - 5, contentWidth, 10, 3, 3, 'F')
    
    doc.setFontSize(12)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("Informations du Transfert", margin + 5, yPos)
    
    yPos += 12
    
    const infoData = [
      ["Site de distillation", getSiteCollecte(fiche)],
      ["Date de transfert", formatDate(fiche.date_livraison)],
      ["Lieu de départ", fiche.lieu_depart || "Non spécifié"],
      ["Destination", getDestination(fiche)],
      ["Type MP", getTypeMatiere(fiche)],
      ["Quantité", `${getQuantite(fiche)} kg`]
    ]
    
    infoData.forEach(([label, value], index) => {
      const colX = margin + (index % 2) * (contentWidth / 2 + 10)
      const rowY = yPos + Math.floor(index / 2) * 7
      
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(60, 60, 60)
      doc.text(`${label}:`, colX, rowY)
      
      doc.setFont("helvetica", "normal")
      doc.text(value, colX + 35, rowY)
    })
    
    yPos += 25
    
  doc.setFillColor(lightColor[0], lightColor[1], lightColor[2], lightColor[3])
    doc.roundedRect(margin, yPos - 5, contentWidth, 10, 3, 3, 'F')
    
    doc.setFontSize(12)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("Destinataire", margin + 5, yPos)
    
    yPos += 12
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(60, 60, 60)
    doc.text("Nom complet:", margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(getNomComplet(fiche.distilleur), margin + 30, yPos)
    
    yPos += 6
    doc.setFont("helvetica", "bold")
    doc.text("Téléphone:", margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(fiche.distilleur?.numero || "Non spécifié", margin + 30, yPos)
    
    yPos += 15
    
  doc.setFillColor(lightColor[0], lightColor[1], lightColor[2], lightColor[3])
    doc.roundedRect(margin, yPos - 5, contentWidth, 10, 3, 3, 'F')
    
    doc.setFontSize(12)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("Livreur", margin + 5, yPos)
    
    yPos += 12
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(60, 60, 60)
    doc.text("Nom complet:", margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(getNomComplet(fiche.livreur), margin + 30, yPos)
    
    yPos += 6
    doc.setFont("helvetica", "bold")
    doc.text("Téléphone:", margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(fiche.livreur?.telephone || "Non spécifié", margin + 30, yPos)
    
    yPos += 6
    doc.setFont("helvetica", "bold")
    doc.text("Véhicule:", margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(fiche.livreur?.numero_vehicule || "Non spécifié", margin + 30, yPos)
    
    yPos += 15
    
  doc.setFillColor(lightColor[0], lightColor[1], lightColor[2], lightColor[3])
    doc.roundedRect(margin, yPos - 5, contentWidth, 10, 3, 3, 'F')
    
    doc.setFontSize(12)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("Ristournes", margin + 5, yPos)
    
    yPos += 12
    
    const ristReg = formatCurrency(fiche.ristourne_regionale)
    const ristCom = formatCurrency(fiche.ristourne_communale)
    const ristRegNum = parseFloat(fiche.ristourne_regionale || "0")
    const ristComNum = parseFloat(fiche.ristourne_communale || "0")
    const totalRistournes = formatCurrency(ristRegNum + ristComNum)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(60, 60, 60)
    doc.text("Ristourne régionale:", margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(ristReg, margin + 45, yPos)
    
    yPos += 6
    
    doc.setFont("helvetica", "bold")
    doc.text("Ristourne communale:", margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(ristCom, margin + 45, yPos)
    
    yPos += 8
    
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(0.5)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    
    yPos += 6
    
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("TOTAL RISTOURNES:", margin, yPos)
    doc.text(totalRistournes, pageWidth - margin, yPos, { align: 'right' })
    
    yPos += 15
    
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(margin, yPos - 5, contentWidth, 25, 3, 3, 'F')
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "bold")
    doc.text("Informations techniques", margin + 5, yPos)
    
    yPos += 8
    
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    
    const techData = [
      [`ID Fiche: ${fiche.id}`, `ID Stock PV: ${fiche.stockpvs_id}`],
      [`ID Distilleur: ${fiche.distilleur_id}`, `ID Livreur: ${fiche.livreur_id}`],
      [`Date création: ${formatDate(fiche.created_at)}`, `Stock disponible: ${fiche.stockpv?.stock_disponible || "0"} kg`]
    ]
    
    techData.forEach(([left, right], index) => {
      const rowY = yPos + (index * 5)
      doc.text(left, margin + 5, rowY)
      doc.text(right, margin + contentWidth / 2, rowY)
    })
    
    yPos += 20
    
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    
    yPos += 5
    
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont("helvetica", "italic")
    doc.text("Document généré automatiquement par Via Consulting", pageWidth / 2, yPos, { align: 'center' })
    
    yPos += 4
    doc.text(`Généré le ${formatDate(new Date().toISOString())}`, pageWidth / 2, yPos, { align: 'center' })
    
    doc.save(`fiche-transport-${getNumeroDocument(fiche)}.pdf`)
  }

  const filteredTransports = fichesLivraison.filter((fiche) => {
    if (!fiche) return false
    
    const searchLower = searchTerm.toLowerCase()
    const fieldsToSearch = [
      getNumeroDocument(fiche),
      getNomComplet(fiche.distilleur),
      getNomComplet(fiche.livreur),
      fiche.lieu_depart || "",
      getSiteCollecte(fiche),
      getTypeMatiere(fiche),
      fiche.distilleur?.numero || "",
      fiche.livreur?.telephone || "",
    ]
    
    return fieldsToSearch.some(field => 
      field?.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-[#72bc21]">
            Historique des Transports <br />
            <span className="text-gray-500 text-lg font-normal">
              Tous les transports d'huiles essentielles enregistrés
            </span>
          </h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#72bc21]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-[#72bc21]">
            Historique des Transports <br />
            <span className="text-gray-500 text-lg font-normal">
              Tous les transports d'huiles essentielles enregistrés
            </span>
          </h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchFichesLivraison}
            className="mt-2 px-4 py-2 bg-[#72bc21] text-white rounded hover:bg-[#5a9c1a]"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
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

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-200 max-h-[700px] overflow-y-auto">
          {filteredTransports.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="mb-4 text-4xl">📋</div>
              {fichesLivraison.length === 0 ? "Aucune fiche de livraison enregistrée" : "Aucun transport trouvé"}
            </div>
          ) : (
            filteredTransports.map((fiche) => (
              <div
                key={fiche.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg text-[#72bc21]">
                          {getNumeroDocument(fiche)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1 text-gray-700">
                          <Calendar className="h-4 w-4" />
                          {formatDate(fiche.date_livraison)}
                        </span>
                      </div>
                      <button
                        onClick={() => downloadPDF(fiche)}
                        className="flex items-center gap-1 text-[#72bc21] hover:text-[#5a9c1a] transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-sm">PDF</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{fiche.lieu_depart || "Non spécifié"}</span>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{getDestination(fiche)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {getTypeMatiere(fiche)}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold">{getQuantite(fiche)} kg</span> à livrer
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{getNomComplet(fiche.distilleur)}</p>
                          <p className="text-xs text-gray-500">{fiche.distilleur?.numero || "Non spécifié"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Ristourne régionale: </span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(fiche.ristourne_regionale)}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <div>
                        <span className="text-gray-600">Ristourne communale: </span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(fiche.ristourne_communale)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        <span>Créé le {formatDate(fiche.created_at)} • ID Stock: {fiche.stockpvs_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {filteredTransports.length > 0 && (
        <div className="text-sm text-gray-500">
          {filteredTransports.length} fiche{filteredTransports.length > 1 ? 's' : ''} de transport trouvée{filteredTransports.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export default HistoriqueDeTransfert