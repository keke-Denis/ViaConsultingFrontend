// lib/export/pdf-export.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Destinateur } from "@/lib/destinateur/destinateur-types";

const COLOR = "#72bc21";

export const exportDestinateursToPDF = (destinateurs: Destinateur[], title: string = "Liste des Destinataires") => {
  // Créer une instance de jsPDF
  const doc = new jsPDF();

  // Convertir la couleur hex en RGB pour jsPDF
  const primaryColor = hexToRgb(COLOR);

  // En-tête du document
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Titre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, 105, 18, { align: "center" });

  // Sous-titre
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 25, { align: "center" });

  // Préparer les données pour le tableau
  const tableData = destinateurs.map((dest, index) => [
    (index + 1).toString(),
    dest.nom_entreprise,
    dest.nom_prenom,
    dest.contact,
    new Date(dest.created_at).toLocaleDateString('fr-FR'),
    dest.createur?.prenom && dest.createur?.nom 
      ? `${dest.createur.prenom} ${dest.createur.nom}`
      : "Utilisateur inconnu"
  ]);

  // Créer le tableau
  autoTable(doc, {
    startY: 40,
    head: [
      ['#', 'Entreprise', 'Contact', 'Téléphone', 'Date création', 'Créé par']
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 40 },
    didDrawPage: (data) => {
      // Pied de page
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
  });

  // Sauvegarder le PDF
  const fileName = `destinataires_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportDestinateurDetailToPDF = (destinateur: Destinateur) => {
  const doc = new jsPDF();
  const primaryColor = hexToRgb(COLOR);

  // En-tête
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Fiche Destinataire", 105, 18, { align: "center" });

  let yPosition = 45;

  // Informations principales
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMATIONS PRINCIPALES", 15, yPosition);
  
  yPosition += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  doc.text(`Entreprise: ${destinateur.nom_entreprise}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Contact: ${destinateur.nom_prenom}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Téléphone: ${destinateur.contact}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Date de création: ${new Date(destinateur.created_at).toLocaleDateString('fr-FR')}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Créé par: ${destinateur.createur?.prenom && destinateur.createur?.nom 
    ? `${destinateur.createur.prenom} ${destinateur.createur.nom}`
    : "Utilisateur inconnu"}`, 20, yPosition);

  yPosition += 15;

  // Observation
  if (destinateur.observation) {
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVATION", 15, yPosition);
    
    yPosition += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    const splitObservation = doc.splitTextToSize(destinateur.observation, 180);
    doc.text(splitObservation, 20, yPosition);
  }

  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 10,
    { align: "center" }
  );

  const fileName = `destinataire_${destinateur.nom_entreprise}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Fonction utilitaire pour convertir hex en RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 114, g: 188, b: 33 }; 
};