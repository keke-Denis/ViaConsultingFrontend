// utils/pdf-generator.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatPercentage,
  getPoidsBruts,
  safeGet,
  getStatusLabel,
  getTypeEmballageLabel
} from './formatters'

const PRIMARY_COLOR = [114, 188, 33] as [number, number, number]

const headerStyle = { 
  fillColor: PRIMARY_COLOR, 
  textColor: 255,
  fontStyle: 'bold' as const
}

const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(0, 0, 210, 45, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 105, 30, { align: 'center' })
  
  if (subtitle) {
    doc.setFontSize(12)
    doc.text(subtitle, 20, 40)
  }
}

const addFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }
}

// 1. PV de Réception
export const generatePVReceptionPDF = (fiches: any[]) => {
  const doc = new jsPDF()
  
  fiches.forEach((fiche, i) => {
    if (i > 0) doc.addPage()
    
    addHeader(doc, "PROCES-VERBAL DE RECEPTION", `Fiche N°: ${safeGet(fiche, 'numero_document', '-')}`)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text(`Référence : ${safeGet(fiche, 'numero_document', '-')}`, 20, 55)
    doc.text(`Date : ${formatDate(safeGet(fiche, 'date_reception'))}`, 20, 63)
    doc.text(`Fournisseur : ${safeGet(fiche, 'fournisseur.prenom', '')} ${safeGet(fiche, 'fournisseur.nom', '')}`.trim() || 'N/A', 20, 71)
    doc.text(`Site : ${safeGet(fiche, 'site_collecte.Nom', '-')}`, 20, 79)

    autoTable(doc, {
      startY: 90,
      head: [['Détail', 'Valeur']],
      body: [
        ['Heure réception', safeGet(fiche, 'heure_reception', '-')],
        ['Statut', getStatusLabel(safeGet(fiche, 'statut'))],
        ['Poids brut', `${formatNumber(safeGet(fiche, 'poids_brut'))} kg`],
        ['Poids net', `${formatNumber(safeGet(fiche, 'poids_net'))} kg`],
        ['Poids agréé', `${formatNumber(safeGet(fiche, 'poids_agreer'))} kg`],
        ['Type emballage', getTypeEmballageLabel(safeGet(fiche, 'type_emballage'))],
        ['Poids emballage', `${formatNumber(safeGet(fiche, 'poids_emballage'))} kg`],
        ['Nombre colis', safeGet(fiche, 'nombre_colisage', '0')],
        ['Taux humidité', formatPercentage(safeGet(fiche, 'taux_humidite'))],
        ['Taux dessiccation', formatPercentage(safeGet(fiche, 'taux_dessiccation'))],
        ['Prix unitaire', formatCurrency(safeGet(fiche, 'prix_unitaire'))],
        ['Prix total', formatCurrency(safeGet(fiche, 'prix_total'))],
        ['Utilisateur', safeGet(fiche, 'utilisateur.name', '-')]
      ],
      theme: 'grid',
      headStyles: headerStyle,
      styles: { fontSize: 11 }
    })
  })
  
  const suffix = fiches.length > 1 ? '-multiples' : `-${fiches[0]?.numero_document || 'doc'}`
  doc.save(`PV-Reception-Huile${suffix}.pdf`)
}

// 2. Rapport de Test
export const generateTestPDF = (fiches: any[], allTests: any[] = []) => {
  const doc = new jsPDF()
  
  fiches.forEach((fiche, i) => {
    if (i > 0) doc.addPage()
    
    const test = allTests.find(t => safeGet(t, 'fiche_reception_id') === fiche.id)
    
    addHeader(doc, "RAPPORT DE TEST", `Fiche N°: ${safeGet(fiche, 'numero_document', '-')}`)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text(`Référence : ${safeGet(fiche, 'numero_document', '-')}`, 20, 55)
    doc.text(`Date test : ${formatDate(safeGet(test, 'date_test'))}`, 20, 63)
    doc.text(`Fournisseur : ${safeGet(fiche, 'fournisseur.prenom', '')} ${safeGet(fiche, 'fournisseur.nom', '')}`.trim() || 'N/A', 20, 71)
    
    autoTable(doc, {
      startY: 90,
      head: [['Détail', 'Valeur']],
      body: [
        ['Heure début', safeGet(test, 'heure_debut', '-')],
        ['Heure fin prévue', safeGet(test, 'heure_fin_prevue', '-')],
        ['Heure fin réelle', safeGet(test, 'heure_fin_reelle', '-')],
        ['Densité', formatNumber(safeGet(test, 'densite'))],
        ['Présence huile végétale', safeGet(test, 'presence_huile_vegetale', 'Non testé')],
        ['Présence lookhead', safeGet(test, 'presence_lookhead', 'Non testé')],
        ['Teneur en eau', formatPercentage(safeGet(test, 'teneur_eau'))],
        ['Observations', safeGet(test, 'observations', 'Aucune')]
      ],
      theme: 'grid',
      headStyles: headerStyle,
      styles: { fontSize: 11 }
    })
  })
  
  const suffix = fiches.length > 1 ? '-multiples' : `-${fiches[0]?.numero_document || 'doc'}`
  doc.save(`Test-Huile${suffix}.pdf`)
}

// 3. Validation de Test
export const generateValidationPDF = (fiches: any[]) => {
  const doc = new jsPDF()
  
  fiches.forEach((fiche, i) => {
    if (i > 0) doc.addPage()
    
    addHeader(doc, "VALIDATION DE TEST", `Fiche N°: ${safeGet(fiche, 'numero_document', '-')}`)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text(`Référence : ${safeGet(fiche, 'numero_document', '-')}`, 20, 55)
    doc.text(`Date : ${formatDate(safeGet(fiche, 'date_reception'))}`, 20, 63)
    doc.text(`Fournisseur : ${safeGet(fiche, 'fournisseur.prenom', '')} ${safeGet(fiche, 'fournisseur.nom', '')}`.trim() || 'N/A', 20, 71)
    
    autoTable(doc, {
      startY: 90,
      head: [['Détail', 'Valeur']],
      body: [
        ['Statut', getStatusLabel(safeGet(fiche, 'statut'))],
        ['Poids brut', `${formatNumber(safeGet(fiche, 'poids_brut'))} kg`],
        ['Poids net', `${formatNumber(safeGet(fiche, 'poids_net'))} kg`],
        ['Poids agréé', `${formatNumber(safeGet(fiche, 'poids_agreer'))} kg`],
        ['Taux humidité', formatPercentage(safeGet(fiche, 'taux_humidite'))],
        ['Taux dessiccation', formatPercentage(safeGet(fiche, 'taux_dessiccation'))],
        ['Prix unitaire', formatCurrency(safeGet(fiche, 'prix_unitaire'))],
        ['Prix total', formatCurrency(safeGet(fiche, 'prix_total'))]
      ],
      theme: 'grid',
      headStyles: headerStyle,
      styles: { fontSize: 11 }
    })
  })
  
  const suffix = fiches.length > 1 ? '-multiples' : `-${fiches[0]?.numero_document || 'doc'}`
  doc.save(`Validation-Test${suffix}.pdf`)
}

// 4. Facture
export const generateFacturationPDF = (fiches: any[], allFacturations: any[] = []) => {
  const doc = new jsPDF()
  
  fiches.forEach((fiche, i) => {
    if (i > 0) doc.addPage()
    
    const facturation = allFacturations.find(f => safeGet(f, 'fiche_reception_id') === fiche.id)
    
    addHeader(doc, "FACTURE", `N°: ${safeGet(facturation, 'numero_facture', '-')}`)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text(`N° Facture : ${safeGet(facturation, 'numero_facture', '-')}`, 20, 55)
    doc.text(`Référence : ${safeGet(fiche, 'numero_document', '-')}`, 20, 63)
    doc.text(`Date : ${formatDate(safeGet(facturation, 'created_at') || safeGet(fiche, 'date_reception'))}`, 20, 71)
    doc.text(`Client : ${safeGet(fiche, 'fournisseur.prenom', '')} ${safeGet(fiche, 'fournisseur.nom', '')}`.trim() || 'N/A', 20, 79)
    
    const montantTotal = safeGet(facturation, 'montant_total') || safeGet(fiche, 'prix_total') || 0
    const avanceVersee = safeGet(facturation, 'avance_versee') || 0
    const resteAPayer = safeGet(facturation, 'reste_a_payer') || 0
    const pourcentagePaye = montantTotal > 0 ? Math.round((avanceVersee / montantTotal) * 100) : 0
    
    autoTable(doc, {
      startY: 90,
      head: [['Libellé', 'Montant']],
      body: [
        ['Matière première', 'Huile essentielle'],
        ['Poids net', `${formatNumber(safeGet(fiche, 'poids_net'))} kg`],
        ['Prix unitaire', formatCurrency(safeGet(fiche, 'prix_unitaire'))],
        ['Montant total', formatCurrency(montantTotal)],
        ['Avance versée', formatCurrency(avanceVersee)],
        ['Reste à payer', formatCurrency(resteAPayer)],
        ['Pourcentage payé', `${pourcentagePaye}%`],
        ['Statut', getStatusLabel(safeGet(fiche, 'statut'))],
        ['Contrôleur qualité', safeGet(facturation, 'controller_qualite', '-')],
        ['Responsable commercial', safeGet(facturation, 'responsable_commercial', '-')]
      ],
      theme: 'grid',
      headStyles: headerStyle,
      styles: { fontSize: 11 }
    })
  })
  
  const suffix = fiches.length > 1 ? '-multiples' : `-${fiches[0]?.numero_document || 'doc'}`
  doc.save(`Facture-Huile${suffix}.pdf`)
}

// 5. Fiche de Livraison
export const generateLivraisonPDF = (fiches: any[]) => {
  const doc = new jsPDF()
  
  fiches.forEach((fiche, i) => {
    if (i > 0) doc.addPage()
    
    addHeader(doc, "FICHE DE LIVRAISON", `Fiche N°: ${safeGet(fiche, 'numero_document', '-')}`)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text(`Référence : ${safeGet(fiche, 'numero_document', '-')}`, 20, 55)
    doc.text(`Date réception : ${formatDate(safeGet(fiche, 'date_reception'))}`, 20, 63)
    doc.text(`Fournisseur : ${safeGet(fiche, 'fournisseur.prenom', '')} ${safeGet(fiche, 'fournisseur.nom', '')}`.trim() || 'N/A', 20, 71)
    
    autoTable(doc, {
      startY: 90,
      head: [['Information', 'Détail']],
      body: [
        ['Statut', getStatusLabel(safeGet(fiche, 'statut'))],
        ['Poids net', `${formatNumber(safeGet(fiche, 'poids_net'))} kg`],
        ['Destination', 'À définir'],
        ['Type emballage', getTypeEmballageLabel(safeGet(fiche, 'type_emballage'))],
        ['Poids emballage', `${formatNumber(safeGet(fiche, 'poids_emballage'))} kg`],
        ['Nombre colis', safeGet(fiche, 'nombre_colisage', '0')],
        ['Prix total', formatCurrency(safeGet(fiche, 'prix_total'))]
      ],
      theme: 'grid',
      headStyles: headerStyle,
      styles: { fontSize: 11 }
    })
  })
  
  const suffix = fiches.length > 1 ? '-multiples' : `-${fiches[0]?.numero_document || 'doc'}`
  doc.save(`Fiche-Livraison${suffix}.pdf`)
}

// 6. Récapitulatif complet
export const generateRecapPDF = (fiches: any[], allTests: any[] = [], allFacturations: any[] = []) => {
  const doc = new jsPDF()
  
  fiches.forEach((fiche, i) => {
    if (i > 0) doc.addPage()
    
    const test = allTests.find(t => safeGet(t, 'fiche_reception_id') === fiche.id)
    const facturation = allFacturations.find(f => safeGet(f, 'fiche_reception_id') === fiche.id)
    
    addHeader(doc, "RECAPITULATIF COMPLET", `Fiche N°: ${safeGet(fiche, 'numero_document', '-')}`)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text("1. INFORMATIONS GENERALES", 20, 60)
    
    autoTable(doc, {
      startY: 65,
      head: [['Champ', 'Valeur']],
      body: [
        ['N° Document', safeGet(fiche, 'numero_document', '-')],
        ['Date réception', formatDate(safeGet(fiche, 'date_reception'))],
        ['Heure réception', safeGet(fiche, 'heure_reception', '-')],
        ['Fournisseur', `${safeGet(fiche, 'fournisseur.prenom', '')} ${safeGet(fiche, 'fournisseur.nom', '')}`.trim()],
        ['Contact', safeGet(fiche, 'fournisseur.contact', '-')],
        ['Site', safeGet(fiche, 'site_collecte.Nom', '-')],
        ['Statut', getStatusLabel(safeGet(fiche, 'statut'))]
      ],
      theme: 'grid',
      headStyles: headerStyle,
      styles: { fontSize: 11 }
    })
    
    const yPos1 = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(14)
    doc.text("2. CARACTERISTIQUES TECHNIQUES", 20, yPos1)
    
    autoTable(doc, {
      startY: yPos1 + 5,
      head: [['Champ', 'Valeur']],
      body: [
        ['Poids brut', `${formatNumber(safeGet(fiche, 'poids_brut'))} kg`],
        ['Poids net', `${formatNumber(safeGet(fiche, 'poids_net'))} kg`],
        ['Poids agréé', `${formatNumber(safeGet(fiche, 'poids_agreer'))} kg`],
        ['Type emballage', getTypeEmballageLabel(safeGet(fiche, 'type_emballage'))],
        ['Poids emballage', `${formatNumber(safeGet(fiche, 'poids_emballage'))} kg`],
        ['Nombre colis', safeGet(fiche, 'nombre_colisage', '0')],
        ['Taux humidité', formatPercentage(safeGet(fiche, 'taux_humidite'))],
        ['Taux dessiccation', formatPercentage(safeGet(fiche, 'taux_dessiccation'))],
        ['Prix unitaire', formatCurrency(safeGet(fiche, 'prix_unitaire'))],
        ['Prix total', formatCurrency(safeGet(fiche, 'prix_total'))]
      ],
      theme: 'grid',
      headStyles: headerStyle,
      styles: { fontSize: 11 }
    })
    
    if (test) {
      const yPos2 = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(14)
      doc.text("3. RESULTATS DU TEST", 20, yPos2)
      
      autoTable(doc, {
        startY: yPos2 + 5,
        head: [['Champ', 'Valeur']],
        body: [
          ['Date test', formatDate(safeGet(test, 'date_test'))],
          ['Densité', formatNumber(safeGet(test, 'densite'))],
          ['Huile végétale', safeGet(test, 'presence_huile_vegetale', 'Non testé')],
          ['Lookhead', safeGet(test, 'presence_lookhead', 'Non testé')],
          ['Teneur eau', formatPercentage(safeGet(test, 'teneur_eau'))],
          ['Observations', safeGet(test, 'observations', 'Aucune')]
        ],
        theme: 'grid',
        headStyles: headerStyle,
        styles: { fontSize: 11 }
      })
    }
    
    if (facturation) {
      const yPos3 = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(14)
      doc.text("4. FACTURATION", 20, yPos3)
      
      const montantTotal = safeGet(facturation, 'montant_total') || 0
      const avanceVersee = safeGet(facturation, 'avance_versee') || 0
      const pourcentagePaye = montantTotal > 0 ? Math.round((avanceVersee / montantTotal) * 100) : 0
      
      autoTable(doc, {
        startY: yPos3 + 5,
        head: [['Champ', 'Valeur']],
        body: [
          ['N° Facture', safeGet(facturation, 'numero_facture', '-')],
          ['Montant total', formatCurrency(montantTotal)],
          ['Avance versée', formatCurrency(avanceVersee)],
          ['Reste à payer', formatCurrency(safeGet(facturation, 'reste_a_payer'))],
          ['Pourcentage payé', `${pourcentagePaye}%`]
        ],
        theme: 'grid',
        headStyles: headerStyle,
        styles: { fontSize: 11 }
      })
    }
  })
  
  const suffix = fiches.length > 1 ? '-multiples' : `-${fiches[0]?.numero_document || 'doc'}`
  doc.save(`Recapitulatif-Huile${suffix}.pdf`)
}