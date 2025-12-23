// lib/export/pdf-export-livreurs.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { LivreurFromAPI } from "@/lib/livreur/livreur-types";

const COLOR = "#72bc21";

export const exportLivreursToPDF = (livreurs: LivreurFromAPI[], title: string = "Liste des Livreurs") => {
  const doc = new jsPDF();
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
  const tableData = livreurs.map((livreur, index) => [
    (index + 1).toString(),
    `${livreur.prenom} ${livreur.nom}`,
    livreur.cin,
    livreur.telephone,
    livreur.numero_vehicule,
    livreur.zone_livraison,
    `${livreur.createur.prenom} ${livreur.createur.nom}`
  ]);

  // Créer le tableau
  autoTable(doc, {
    startY: 40,
    head: [
      ['#', 'Nom complet', 'CIN', 'Téléphone', 'Véhicule', 'Zone', 'Créé par']
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
  const fileName = `livreurs_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportLivreurDetailToPDF = (livreur: LivreurFromAPI) => {
  const doc = new jsPDF();
  const primaryColor = hexToRgb(COLOR);

  // En-tête
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Fiche Livreur", 105, 18, { align: "center" });

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
  
  doc.text(`Nom complet: ${livreur.prenom} ${livreur.nom}`, 20, yPosition);
  yPosition += 7;
  doc.text(`CIN: ${livreur.cin}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Téléphone: ${livreur.telephone}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Date de naissance: ${new Date(livreur.date_naissance).toLocaleDateString('fr-FR')}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Lieu de naissance: ${livreur.lieu_naissance}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Contact famille: ${livreur.contact_famille}`, 20, yPosition);

  yPosition += 15;

  // Informations de livraison
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMATIONS DE LIVRAISON", 15, yPosition);
  
  yPosition += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  doc.text(`Véhicule: ${livreur.numero_vehicule}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Zone de livraison: ${livreur.zone_livraison}`, 20, yPosition);

  yPosition += 10;

  // Observation
  if (livreur.observation) {
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVATION", 15, yPosition);
    
    yPosition += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    const splitObservation = doc.splitTextToSize(livreur.observation, 180);
    doc.text(splitObservation, 20, yPosition);
    yPosition += splitObservation.length * 5;
  }

  yPosition += 10;

  // Informations de création
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMATIONS DE CRÉATION", 15, yPosition);
  
  yPosition += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  doc.text(`Créé par: ${livreur.createur.prenom} ${livreur.createur.nom} (${livreur.createur.role})`, 20, yPosition);
  yPosition += 7;
  doc.text(`Date de création: ${new Date(livreur.created_at).toLocaleDateString('fr-FR')}`, 20, yPosition);

  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 10,
    { align: "center" }
  );

  const fileName = `livreur_${livreur.prenom}_${livreur.nom}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Fonction utilitaire pour convertir hex en RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 114, g: 188, b: 33 }; // Valeur par défaut #72bc21
};