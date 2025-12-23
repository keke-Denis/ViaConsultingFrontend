// components/collecte/pdf-generators.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PVReception, PVStatut } from '@/lib/pvreception/pvreception-types'
import type { Facturation } from '@/lib/pvreception/facturation-types'
import type { FicheLivraison } from '@/lib/pvreception/fichelivraison-types'

const formatDate = (date: string | undefined) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A'
const getTypeLabel = (t: string | undefined) => ({ FG: "Feuilles Girofle", CG: "Clous Girofle", GG: "Griffes Girofle" }[t as string] || t || '-')
const getTypeEmballageLabel = (t: string | undefined) => ({ sac: "Sac", bidon: "Bidon", fut: "Fut" }[t as string] || t || '-')
const getStatutLabel = (s: PVStatut | string | undefined) => ({
  non_paye: "Non payé",
  paye: "Payé",
  incomplet: "Incomplet",
  en_attente_livraison: "En attente livraison",
  partiellement_livre: "Partiellement livré",
  en_attente_livraison_partielle: "En attente livraison partielle",
  livree: "Livrée"
}[s as string] || s || '-')

const headerStyle = { fillColor: [118, 188, 33] as [number, number, number], textColor: 255 }

export const generatePVReceptionPDF = (receptions: PVReception[]) => {
  const doc = new jsPDF()
  receptions.forEach((r, i) => {
    if (i > 0) doc.addPage()
    doc.setFillColor(118, 188, 33)
    doc.rect(0, 0, 210, 45, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('PV DE RÉCEPTION', 105, 30, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text(`N° Document : ${r.numero_doc || '-'}`, 20, 55)
    doc.text(`Date : ${formatDate(r.date_reception)}`, 20, 63)
    doc.text(`Fournisseur : ${r.fournisseur?.prenom || ''} ${r.fournisseur?.nom || ''}`.trim() || 'N/A', 20, 71)
    doc.text(`Type : ${getTypeLabel(r.type)}`, 20, 79)

    autoTable(doc, {
      startY: 90,
      head: [['Détail', 'Valeur']],
      body: [
        ['Provenance', r.provenance?.Nom || '-'],
        ['Poids brut', `${r.poids_brut ?? 0} kg`],
        ['Type emballage', getTypeEmballageLabel(r.type_emballage)],
        ['Poids emballage', `${r.poids_emballage ?? 0} kg`],
        ['Poids net', `${r.poids_net ?? 0} kg`],
        ['Nombre colis', (r.nombre_colisage ?? 0).toString()],
        ['Prix unitaire', `${(r.prix_unitaire ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Montant total', `${(r.prix_total ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Dette fournisseur', `${(r.dette_fournisseur ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Statut', getStatutLabel(r.statut)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [118, 188, 33] as [number, number, number], textColor: 255 },
      styles: { fontSize: 11 }
    })
    // Ajouter un récapitulatif complet du PV (page séparée)
    doc.addPage()
    doc.setFillColor(118, 188, 33)
    doc.rect(0, 0, 210, 45, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('RÉCAPITULATIF COMPLET', 105, 30, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text(`Référence PV : ${r.numero_doc}`, 20, 55)
    doc.text(`Fournisseur : ${r.fournisseur?.prenom || ''} ${r.fournisseur?.nom || ''}`.trim() || 'N/A', 20, 63)
    doc.text(`Type : ${getTypeLabel(r.type)}`, 20, 71)

    autoTable(doc, {
      startY: 90,
      head: [['Champ', 'Valeur']],
      body: [
        ['N° PV', r.numero_doc || '-'],
        ['Date réception', formatDate(r.date_reception)],
        ['Poids brut', `${r.poids_brut ?? 0} kg`],
        ['Poids emballage', `${r.poids_emballage ?? 0} kg`],
        ['Poids net', `${r.poids_net ?? 0} kg`],
        ['Type emballage', getTypeEmballageLabel(r.type_emballage)],
        ['Nombre colis', (r.nombre_colisage ?? 0).toString()],
        ['Quantité totale', `${r.quantite_totale ?? 0} kg`],
        ['Quantité restante', `${r.quantite_restante ?? 0} kg`],
        ['Prix unitaire', `${(r.prix_unitaire ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Montant total', `${(r.prix_total ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Dette fournisseur', `${(r.dette_fournisseur ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Statut', getStatutLabel(r.statut)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [118, 188, 33] as [number, number, number], textColor: 255 },
      styles: { fontSize: 11 }
    })
  })
  const suffix = receptions.length > 1 ? '-multiples' : `-${receptions[0]?.numero_doc || 'doc'}`
  doc.save(`PV-reception${suffix}.pdf`)
}

export const generateFactureFournisseurPDF = (receptions: PVReception[], options?: { facturations?: Facturation[] }) => {
  const doc = new jsPDF()
  const facturations = options?.facturations || (window as any).facturations || []

  receptions.forEach((r, i) => {
    if (i > 0) doc.addPage()
    // Inclure d'abord le PV complet pour contexte
    doc.setFillColor(118, 188, 33)
    doc.rect(0, 0, 210, 45, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('PV DE RÉCEPTION', 105, 30, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text(`N° Document : ${r.numero_doc || '-'}`, 20, 55)
    doc.text(`Date : ${formatDate(r.date_reception)}`, 20, 63)
    doc.text(`Fournisseur : ${r.fournisseur?.prenom || ''} ${r.fournisseur?.nom || ''}`.trim() || 'N/A', 20, 71)
    doc.text(`Type : ${getTypeLabel(r.type)}`, 20, 79)

    autoTable(doc, {
      startY: 90,
      head: [['Détail', 'Valeur']],
      body: [
        ['Provenance', r.provenance?.Nom || '-'],
        ['Poids brut', `${r.poids_brut ?? 0} kg`],
        ['Type emballage', getTypeEmballageLabel(r.type_emballage)],
        ['Poids emballage', `${r.poids_emballage ?? 0} kg`],
        ['Poids net', `${r.poids_net ?? 0} kg`],
        ['Nombre colis', (r.nombre_colisage ?? 0).toString()],
        ['Prix unitaire', `${(r.prix_unitaire ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Montant total', `${(r.prix_total ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Dette fournisseur', `${(r.dette_fournisseur ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Statut', getStatutLabel(r.statut)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [118, 188, 33] as [number, number, number], textColor: 255 },
      styles: { fontSize: 11 }
    })

    // Puis la facture associée (si disponible)
    const facture = Array.isArray(facturations)
      ? facturations.find((f: Facturation) => (f as any).pv_reception_id === r.id || (f as any).pv_id === r.id)
      : undefined

    doc.addPage()
    doc.setFillColor(118, 188, 33)
    doc.rect(0, 0, 210, 45, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURE FOURNISSEUR', 105, 30, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text(`N° Facture : ${facture?.numero_facture || 'N/A'}`, 20, 55)
    doc.text(`Référence PV : ${r.numero_doc}`, 20, 63)
    doc.text(`Date : ${facture?.date_facturation ? formatDate(facture.date_facturation) : formatDate(r.date_reception)}`, 20, 71)
    doc.text(`Fournisseur : ${r.fournisseur?.prenom || ''} ${r.fournisseur?.nom || ''}`.trim() || 'N/A', 20, 79)

    autoTable(doc, {
      startY: 90,
      head: [['Libellé', 'Montant']],
      body: [
        ['Matière première', getTypeLabel(r.type)],
        ['Quantité', `${r.quantite_totale ?? 0} kg`],
        ['Prix unitaire HT', `${(r.prix_unitaire ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Montant total HT', `${(r.prix_total ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Montant payé', `${(facture?.montant_paye ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Reste à payer', `${(facture?.reste_a_payer ?? r.dette_fournisseur ?? 0).toLocaleString('fr-FR')} Ar`],
        ['Mode paiement', facture?.mode_paiement || 'N/A'],
        ['Statut', facture?.statut ? getStatutLabel(facture.statut) : getStatutLabel(r.statut)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [118, 188, 33] as [number, number, number], textColor: 255 },
      styles: { fontSize: 11 }
    })
  })
  const suffix = receptions.length > 1 ? '-multiples' : `-${receptions[0]?.numero_doc || 'doc'}`
  doc.save(`Facture-fournisseur${suffix}.pdf`)
}

export const generateFicheLivraisonPDF = (_receptions: PVReception[], _options?: { ficheLivraisons?: FicheLivraison[], facturations?: Facturation[] }) => {
  console.warn('generateFicheLivraisonPDF: disabled — fiches de livraison ne sont plus incluses dans les PDFs')
}