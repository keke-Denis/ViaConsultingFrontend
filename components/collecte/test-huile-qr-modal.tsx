"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import { QRCodeSVG } from "qrcode.react"
import { useRef } from "react"
import { toast } from "react-toastify"

interface TestHuileQRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  test: any
}

export function TestHuileQRModal({ open, onOpenChange, test }: TestHuileQRModalProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      en_attente_test: "En attente de test",
      test_en_cours: "Test en cours",
      validation_test: "Validation du test",
      paiement_incomplet: "Paiement incomplet",
      paye: "Payé",
      en_attente_livraison: "En attente de livraison",
      livre: "Livré",
    }
    return statusMap[status] || status
  }

  const qrData = test
    ? `
📄 FICHE DE RÉCEPTION - HUILE ESSENTIELLE

📋 INFORMATIONS PRINCIPALES
Référence: ${test.reference || test.numero_document}
Date Réception: ${formatDate(test.dateTest || test.date_reception)}
Type Huile: ${test.typeHuile || test.type_produit}
Statut: ${getStatusLabel(test.status || test.statut)}

👤 FOURNISSEUR
Nom: ${test.fournisseur?.prenom || ''} ${test.fournisseur?.nom || ''}
Localisation: ${test.localisation?.Nom || ''}

📦 INFORMATIONS POIDS
Poids Brut: ${test.poids_brut || test.stockTestePoids} kg
Poids Tare: ${test.poids_tare || '0'} kg
Poids Net: ${(test.poids_brut - (test.poids_tare || 0)) || test.stockTestePoids} kg

🧪 INFORMATIONS TEST (si disponible)
Teneur en eau: ${test.teneurEau || 'N/A'}
Densité: ${test.densite || 'N/A'}

🏢 SITE DE COLLECTE
Nom: ${test.site_collecte?.Nom || 'N/A'}

🔍 SYSTÈME DE GESTION TESTS HUILE ESSENTIELLE
QR Code généré le: ${formatDate(new Date().toISOString())}
  `.trim()
    : ""

  const downloadQRCode = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector("svg")
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)

          const pngFile = canvas.toDataURL("image/png")
          const downloadLink = document.createElement("a")
          downloadLink.download = `QRCode-Test-${test.reference || test.numero_document}.png`
          downloadLink.href = pngFile
          downloadLink.click()
          toast.success(`QR Code téléchargé pour ${test.reference || test.numero_document}`, { position: "top-right" })
        }

        img.src = "data:image/svg+xml;base64," + btoa(svgData)
      }
    }
  }

  if (!test) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-lg font-semibold">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              QR Code - {test.reference || test.numero_document}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="relative">
            <div ref={qrRef} className="bg-white p-6 rounded-2xl border-2 border-green-100 shadow-lg">
              <QRCodeSVG
                value={qrData}
                size={280}
                level="H"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#1a1a1a"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "12px",
                }}
              />
            </div>
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Scan Me
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-semibold text-gray-900 text-lg">{test.reference || test.numero_document}</h3>
            <p className="text-gray-600 text-sm">
              {test.typeHuile || test.type_produit} • {test.stockTestePoids || test.poids_brut} kg
            </p>
          </div>

          <Button
            onClick={downloadQRCode}
            className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md"
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
