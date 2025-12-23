"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { QrCode, AlertCircle, CheckCircle, CreditCard, Plus, Edit, Trash2, Calendar, Download, Loader2 } from "lucide-react"
import { formatNumber, formatCurrency, formatPercentage, getPoidsBruts } from "@/utils/formatters"

const COLOR = "#76bc21"

interface TestHuileMobileCardProps {
  fiche: any
  isSelected: boolean
  onCheckChange: (checked: boolean) => void
  onShowQR: (fiche: any) => void
  onLaunchTest: (fiche: any) => void
  onValidateTest: (fiche: any) => void
  onFacturation: (fiche: any) => void
  onPaiementSupplementaire: (fiche: any) => void
  onLivraison: (fiche: any) => void
  onEdit: (fiche: any) => void
  onDelete: (fiche: any) => void
  getStatusLabel: (statut: string) => string
  getStatusBadgeStyle: (statut: string) => any
  getStatusBadgeVariant: (statut: string) => "default" | "secondary" | "destructive" | "outline"
  formatReference: (fiche: any) => string
  formatDate: (dateString: string) => string
  canLaunchTest: (fiche: any) => boolean
  canValidateTest: (fiche: any) => boolean
  canFacturer: (fiche: any) => boolean
  canAjouterPaiement: (fiche: any) => boolean
  canDeliver: (fiche: any) => boolean
  validatingTest: number | null
  isAdmin: boolean
  onDownloadPDF?: () => void
}

export function TestHuileMobileCard({
  fiche,
  isSelected,
  onCheckChange,
  onShowQR,
  onLaunchTest,
  onValidateTest,
  onFacturation,
  onPaiementSupplementaire,
  onLivraison,
  onEdit,
  onDelete,
  getStatusLabel,
  getStatusBadgeStyle,
  getStatusBadgeVariant,
  formatReference,
  formatDate,
  canLaunchTest,
  canValidateTest,
  canFacturer,
  canAjouterPaiement,
  canDeliver,
  validatingTest,
  isAdmin,
  onDownloadPDF,
}: TestHuileMobileCardProps) {
  
  const badgeStyle = getStatusBadgeStyle(fiche.statut)
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header avec Checkbox, Référence, Statut et boutons QR/PDF */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="flex items-start gap-2 flex-1">
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onCheckChange}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">{formatReference(fiche)}</h3>
              <Badge 
                variant={getStatusBadgeVariant(fiche.statut)} 
                className="font-medium text-xs px-2.5 py-1 border"
                style={{
                  backgroundColor: badgeStyle.backgroundColor,
                  color: badgeStyle.color,
                  borderColor: badgeStyle.borderColor,
                }}
              >
                {getStatusLabel(fiche.statut)}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              {formatDate(fiche.date_reception)}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onShowQR(fiche)}
            title="Scanner QR Code"
          >
            <QrCode className="h-4 w-4" style={{ color: COLOR }} />
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
      
      {/* Informations principales */}
      <div className="space-y-4 border-t border-gray-100 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Fournisseur</p>
            <p className="font-medium text-sm text-gray-900 truncate">
              {fiche.fournisseur?.prenom || ''} {fiche.fournisseur?.nom || ''}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Site collecte</p>
            <p className="font-medium text-sm text-gray-900">{fiche.site_collecte?.Nom || '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Poids brut</p>
            <p className="font-bold text-sm text-black">{formatNumber(getPoidsBruts(fiche))} kg</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Poids net</p>
            <p className="font-bold text-sm text-black">{formatNumber(fiche.poids_net)} kg</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type emballage</p>
            <p className="font-medium text-sm text-gray-900 capitalize">{fiche.type_emballage || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Poids emballage</p>
            <p className="font-medium text-sm text-gray-900">{formatNumber(fiche.poids_emballage)} kg</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nombre colis</p>
            <p className="font-medium text-sm text-gray-900">{fiche.nombre_colisage || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Prix unitaire</p>
            <p className="font-medium text-sm text-gray-900">{formatCurrency(fiche.prix_unitaire)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Prix total</p>
            <p className="font-bold text-sm text-black">{formatCurrency(fiche.prix_total)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Humidité</p>
            <p className="font-medium text-sm text-gray-900">{formatPercentage(fiche.taux_humidite)}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Dessiccation</p>
          <p className="font-medium text-sm text-gray-900">{formatPercentage(fiche.taux_dessiccation)}</p>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="mt-5 space-y-2">
        {fiche?.statut !== 'payé' && (
          <>
            {canLaunchTest(fiche) && (
              <Button size="sm" className="w-full text-white" style={{ backgroundColor: COLOR }} onClick={() => onLaunchTest(fiche)}>
                <AlertCircle className="mr-2 h-4 w-4" /> Lancer le test
              </Button>
            )}

            {canValidateTest(fiche) && (
              <Button 
                size="sm" 
                className="w-full text-white" 
                style={{ backgroundColor: COLOR }} 
                onClick={() => onValidateTest(fiche)}
                disabled={validatingTest === fiche.id}
              >
                {validatingTest === fiche.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                {validatingTest === fiche.id ? 'Chargement...' : 'Valider le test'}
              </Button>
            )}

            {canFacturer(fiche) && (
              <Button size="sm" className="w-full text-white" style={{ backgroundColor: COLOR }} onClick={() => onFacturation(fiche)}>
                <CreditCard className="mr-2 h-4 w-4" /> Facturation
              </Button>
            )}

            {canAjouterPaiement(fiche) && (
              <Button size="sm" className="w-full text-white" style={{ backgroundColor: COLOR }} onClick={() => onPaiementSupplementaire(fiche)}>
                <Plus className="mr-2 h-4 w-4" /> Paiement supplémentaire
              </Button>
            )}
          </>
        )}

        {/* SEULEMENT POUR LES ADMINS */}
        {isAdmin && (
          <div className="flex gap-2 pt-3 border-t border-gray-200 mt-3">
            <Button 
              size="sm" 
              variant="default"
              className="flex-1"
              style={{ backgroundColor: COLOR }}
              onClick={() => onEdit(fiche)}
            >
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              className="flex-1"
              onClick={() => onDelete(fiche)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}