// components/collecte/pdf-export.tsx
"use client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface CollecteData {
  id: string;
  fournisseur: string;
  date: string;
  typeMatiere: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  statut: string;
  createur: {
    nom: string;
    email: string;
    role: string;
  };
}

export const generateCollectePDF = (collecte: CollecteData) => {
  const doc = new jsPDF();
  
  // En-tête du document
  doc.setFillColor(118, 188, 33); // #76bc21
  doc.rect(0, 0, 210, 40, 'F');
  
  // Titre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FICHE DE COLLECTE', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Système de Gestion des Collectes', 105, 28, { align: 'center' });
  
  // Informations de la collecte
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DE LA COLLECTE', 20, 55);
  
  // Ligne séparatrice
  doc.setDrawColor(118, 188, 33);
  doc.setLineWidth(0.5);
  doc.line(20, 58, 190, 58);
  
  // Informations principales
  const infoYStart = 70;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Colonne gauche
  doc.text(`ID Collecte: ${collecte.id}`, 20, infoYStart);
  doc.text(`Fournisseur: ${collecte.fournisseur}`, 20, infoYStart + 8);
  doc.text(`Date: ${new Date(collecte.date).toLocaleDateString('fr-FR')}`, 20, infoYStart + 16);
  doc.text(`Type de matière: ${collecte.typeMatiere}`, 20, infoYStart + 24);
  
  // Colonne droite
  doc.text(`Quantité: ${collecte.quantite} kg`, 110, infoYStart);
  doc.text(`Prix unitaire: ${collecte.prixUnitaire.toLocaleString('fr-FR')} Ar`, 110, infoYStart + 8);
  doc.text(`Montant total: ${collecte.montantTotal.toLocaleString('fr-FR')} Ar`, 110, infoYStart + 16);
  doc.text(`Statut: ${collecte.statut}`, 110, infoYStart + 24);
  
  // Tableau des détails
  autoTable(doc, {
    startY: infoYStart + 35,
    head: [['Description', 'Valeur']],
    body: [
      ['ID de la collecte', collecte.id],
      ['Nom du fournisseur', collecte.fournisseur],
      ['Date de collecte', new Date(collecte.date).toLocaleDateString('fr-FR')],
      ['Type de matière première', collecte.typeMatiere],
      ['Quantité collectée', `${collecte.quantite} kg`],
      ['Prix unitaire', `${collecte.prixUnitaire.toLocaleString('fr-FR')} Ar`],
      ['Montant total', `${collecte.montantTotal.toLocaleString('fr-FR')} Ar`],
      ['Statut de la collecte', collecte.statut],
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { 
      fillColor: [118, 188, 33],
      textColor: 255,
      fontStyle: 'bold'
    },
  });
  
  // Informations du créateur
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS DU CRÉATEUR', 20, finalY);
  
  doc.setDrawColor(118, 188, 33);
  doc.line(20, finalY + 2, 190, finalY + 2);
  
  autoTable(doc, {
    startY: finalY + 10,
    head: [['Champ', 'Valeur']],
    body: [
      ['Nom', collecte.createur.nom],
      ['Email', collecte.createur.email],
      ['Rôle', collecte.createur.role],
      ['Date de génération', new Date().toLocaleDateString('fr-FR')],
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { 
      fillColor: [70, 70, 70],
      textColor: 255,
      fontStyle: 'bold'
    },
  });
  
  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      105,
      290,
      { align: 'center' }
    );
  }
  
  // Sauvegarder le PDF
  doc.save(`collecte-${collecte.id}-${new Date().toISOString().split('T')[0]}.pdf`);
};
