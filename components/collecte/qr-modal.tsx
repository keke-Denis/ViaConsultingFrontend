// components/qr-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useRef } from "react"

interface QRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reception: any
}

export function QRModal({ open, onOpenChange, reception }: QRModalProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  // Fonction pour obtenir le label du type
  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'FG': 'Feuilles Girofle',
      'CG': 'Clous Girofle', 
      'GG': 'Griffes Girofle'
    }
    return types[type] || type
  }

  // Fonction pour obtenir le label du statut
  const getStatutLabel = (statut: string) => {
    const statusMap: { [key: string]: string } = {
      'non_paye': 'Non payé',
      'paye': 'Payé',
      'incomplet': 'Incomplet',
      'en_attente_livraison': 'En attente livraison',
      'partiellement_livre': 'Partiellement livré',
      'livree': 'Livrée'
    }
    return statusMap[statut] || statut
  }

  // Préparer les données pour le QR code avec un format lisible
  const qrData = reception ? `
📄 FICHE MATIÈRE PREMIÈRE

📋 INFORMATIONS PRINCIPALES
N° Document: ${reception.numero_doc}
Date Réception: ${formatDate(reception.date_reception)}
Type: ${getTypeLabel(reception.type)}
Statut: ${getStatutLabel(reception.statut)}

👤 FOURNISSEUR
Nom: ${reception.fournisseur?.prenom || ''} ${reception.fournisseur?.nom || ''}
Contact: ${reception.fournisseur?.contact || 'Non renseigné'}

📦 INFORMATIONS STOCK
Quantité Totale: ${reception.quantite_totale} kg
Stock Restant: ${reception.quantite_restante} kg
Stock Initial: ${reception.stock_initial} kg

📊 EMBALLAGE
Type: ${reception.type_emballage || 'Non spécifié'}
Poids: ${reception.poids_emballage} kg
Nombre Colis: ${reception.nombre_colisage}

💰 INFORMATIONS FINANCIÈRES
Prix Unitaire: ${reception.prix_unitaire?.toLocaleString('fr-FR')} Ar
Dette Fournisseur: ${reception.dette_fournisseur?.toLocaleString('fr-FR')} Ar

📍 LOCALISATION
Lieu: ${reception.localisation?.Nom || 'Non spécifiée'}

📅 DATES
Création: ${formatDate(reception.created_at)}
Modification: ${reception.updated_at ? formatDate(reception.updated_at) : 'Non modifié'}

🔍 SYSTÈME DE GESTION MATIÈRES PREMIÈRES
  `.trim() : ''

  // Fonction pour télécharger le QR code
  const downloadQRCode = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg')
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          
          const pngFile = canvas.toDataURL('image/png')
          const downloadLink = document.createElement('a')
          downloadLink.download = `QRCode-PV-${reception.numero_doc}.png`
          downloadLink.href = pngFile
          downloadLink.click()
        }
        
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
      }
    }
  }

  if (!reception) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-lg font-semibold">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              QR Code - PV {reception.numero_doc}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 hover:bg-gray-100 rounded-full"
            >
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Section QR Code avec fond stylisé */}
          <div className="relative">
            <div 
              ref={qrRef}
              className="bg-white p-6 rounded-2xl border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <QRCodeSVG
                value={qrData}
                size={280}
                level="H"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#1a1a1a"
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  borderRadius: '12px'
                }}
              />
            </div>
            
            {/* Badge décoratif */}
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Scan Me
            </div>
          </div>
          
          {/* Informations de base */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-gray-900 text-lg">
              PV {reception.numero_doc}
            </h3>
            <p className="text-gray-600 text-sm">
              {getTypeLabel(reception.type)} • {reception.fournisseur?.prenom} {reception.fournisseur?.nom}
            </p>
            <p className="text-green-600 text-sm font-medium">
              {getStatutLabel(reception.statut)}
            </p>
          </div>

          {/* Bouton de téléchargement */}
          <Button
            onClick={downloadQRCode}
            className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            size="lg"
          >
            <Download className="h-5 w-5" />
            Télécharger QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
