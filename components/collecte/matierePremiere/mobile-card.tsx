// components/collecte/mobile-card.tsx
import React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { QrCode, Calendar, Package, FileText, AlertTriangle, Truck, Edit, Trash2, Download } from "lucide-react"

type MobileCardProps = {
  reception: any
  hasPartielle: boolean
  getStatutColor: (s: string) => string
  getStatutLabel: (s: string) => string
  getTypeLabel: (t: string) => string
  getTypeEmballageLabel: (t: string) => string
  getDetteColor: (d: number) => string
  getStockColor: (s: number) => string
  formatDate: (d: string) => string
  isAdmin: boolean
  isSelected?: boolean
  onCheckChange?: (checked: boolean) => void
  onDownloadPDF?: () => void
  onShowQR: (r: any) => void
  onFacturation: (r: any) => void
  onPaiementImpaye: (r: any) => void
  onFicheLivraison: (r: any) => void
  onConfirmerLivraison: (r: any) => void
  onEdit: (r: any) => void
  onDelete: (r: any) => void
}

export function MobileCard({
  reception, hasPartielle, getStatutColor, getStatutLabel, getTypeLabel,
  getTypeEmballageLabel, getDetteColor, getStockColor, formatDate, isAdmin,
  isSelected = false, onCheckChange, onDownloadPDF,
  onShowQR, onFacturation, onPaiementImpaye, onFicheLivraison,
  onConfirmerLivraison, onEdit, onDelete
}: MobileCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with Checkbox, N°, Status, and QR/PDF buttons */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="flex items-start gap-2 flex-1">
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onCheckChange}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">{reception.numero_doc}</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatutColor(reception.statut)}`}>
                {getStatutLabel(reception.statut)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              {formatDate(reception.date_reception)}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onShowQR(reception)}
            title="Scanner QR Code"
          >
            <QrCode className="h-4 w-4" />
          </Button>
          {onDownloadPDF && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onDownloadPDF}
              title="Télécharger PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="space-y-4 border-t border-gray-100 pt-4">
        {/* Row 1: Type & Fournisseur */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type</p>
            <p className="font-medium text-sm text-gray-900">{getTypeLabel(reception.type)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Fournisseur</p>
            <p className="font-medium text-sm text-gray-900 truncate">{reception.fournisseur?.prenom} {reception.fournisseur?.nom}</p>
          </div>
        </div>

        {/* Row 2: Provenance & Emballage */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Provenance</p>
            <p className="font-medium text-sm text-gray-900">{reception.provenance?.Nom || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Emballage</p>
            <p className="font-medium text-sm text-gray-900">{getTypeEmballageLabel(reception.type_emballage)}</p>
          </div>
        </div>

        {/* Row 3: Poids & Prix */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Poids net</p>
            <p className="font-medium text-sm text-gray-900">{reception.poids_net} kg</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Prix U.</p>
            <p className="font-medium text-sm text-gray-900">{reception.prix_unitaire?.toLocaleString('fr-FR')} Ar</p>
          </div>
        </div>

        {/* Row 4: Poids emballage & Colis */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Poids emb.</p>
            <p className="font-medium text-sm text-gray-900">{reception.poids_emballage} kg</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Colis</p>
            <p className="font-medium text-sm text-gray-900">{reception.nombre_colisage}</p>
          </div>
        </div>

        {/* Row 5: Dette seulement */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Dette</p>
            <p className="font-bold text-lg text-black">{reception.dette_fournisseur?.toLocaleString('fr-FR')} Ar</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col gap-2">
        {reception.statut === 'non_paye' && (
          <Button 
            size="sm" 
            className="w-full text-white"
            style={{ backgroundColor: '#72bc21' }}
            onClick={() => onFacturation(reception)}
          >
            <FileText className="mr-2 h-4 w-4" />Facturation
          </Button>
        )}
        {reception.statut === 'incomplet' && (
          <Button 
            size="sm" 
            className="w-full text-white"
            style={{ backgroundColor: '#72bc21' }}
            onClick={() => onPaiementImpaye(reception)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />Payer impayé
          </Button>
        )}
        {isAdmin && (
          <div className="flex gap-2 border-t pt-2 mt-2">
            <Button 
              size="sm" 
              className="flex-1 text-white"
              style={{ backgroundColor: '#72bc21' }}
              onClick={() => onEdit(reception)}
            >
              <Edit className="mr-1 h-3.5 w-3.5" />Modifier
            </Button>
            <Button 
              size="sm" 
              className="flex-1 text-white"
              style={{ backgroundColor: '#72bc21' }}
              onClick={() => onDelete(reception)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />Supprimer
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}