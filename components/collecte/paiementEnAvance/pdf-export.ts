import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PaiementEnAvance, StatutPaiement } from "@/lib/paiementEnAvance/paiementEnAvance-types";

const COLOR = "#72bc21";

// Types pour l'export
interface ExportPaiement extends PaiementEnAvance {
  delaiRestant?: string;
  estEnRetard?: boolean;
}

// Formater le délai initial
const formatDelaiInitial = (delaiMinutes: number | null) => {
  if (!delaiMinutes) return "06:00:00";
  
  const totalSeconds = delaiMinutes * 60;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// Formater le statut
const getStatusText = (statut: StatutPaiement) => {
  switch (statut) {
    case 'arrivé': return 'Arrivé';
    case 'annulé': return 'Annulé';
    case 'en_attente': return 'En attente';
    default: return statut;
  }
};

// Calculer le délai restant pour l'export
const calculateCountdownForExport = (paiement: PaiementEnAvance) => {
  if (paiement.type !== "avance") return null;

  const delaiMinutes = paiement.delaiHeures || 360;
  const dateCreation = new Date(paiement.created_at || paiement.date);
  const dateLimite = new Date(dateCreation.getTime() + delaiMinutes * 60 * 1000);
  const currentTime = new Date();
  const difference = dateLimite.getTime() - currentTime.getTime();

  if (difference <= 0) {
    return { texte: "00:00:00", estEnRetard: true };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    texte: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    estEnRetard: false
  };
};

// Générer l'en-tête du PDF
const generateHeader = (doc: jsPDF, title: string, showArchives: boolean) => {
  // Logo et titre
  doc.setFillColor(parseInt(COLOR.slice(1, 3), 16), parseInt(COLOR.slice(3, 5), 16), parseInt(COLOR.slice(5, 7), 16));
  doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F');
  
  // Titre principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 25);
  
  // Sous-titre
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(showArchives ? "Archives des paiements annulés" : "Gestion des avances fournisseurs en cours", 20, 35);
  
  // Date de génération
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 45);
  
  // Réinitialiser la couleur du texte
  doc.setTextColor(0, 0, 0);
};

// Générer le pied de page
const generateFooter = (doc: jsPDF, pageNumber: number, totalPages: number) => {
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFillColor(parseInt(COLOR.slice(1, 3), 16), parseInt(COLOR.slice(3, 5), 16), parseInt(COLOR.slice(5, 7), 16));
  doc.rect(0, pageHeight - 30, doc.internal.pageSize.width, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Copyright et informations
  doc.text("Système de Gestion des Paiements - Avances Fournisseurs", 20, pageHeight - 15);
  doc.text(`Page ${pageNumber} sur ${totalPages}`, doc.internal.pageSize.width - 40, pageHeight - 15);
};

// Fonction principale d'export PDF
export const exportPaiementsToPDF = async (
  paiements: PaiementEnAvance[], 
  showArchives: boolean,
  searchTerm?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Initialiser le PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let currentY = 70;
      let pageNumber = 1;
      const totalPages = Math.ceil(paiements.length / 15) + 1; // Estimation

      // Titre selon le contexte
      const title = showArchives 
        ? "ARCHIVES DES PAIEMENTS" 
        : "GESTION DES AVANCES FOURNISSEURS";

      // Générer l'en-tête
      generateHeader(doc, title, showArchives);

      // Informations de résumé
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      // Résumé statistique
      const stats = {
        total: paiements.length,
        enAttente: paiements.filter(p => p.statut === 'en_attente').length,
        paye: paiements.filter(p => p.statut === 'arrivé').length,
        annule: paiements.filter(p => p.statut === 'annulé').length,
        totalMontant: paiements.reduce((sum, p) => sum + p.montant, 0)
      };

      doc.text(`Total: ${stats.total} paiement(s)`, 20, currentY);
      currentY += 8;
      
      if (!showArchives) {
        doc.text(`En attente: ${stats.enAttente} | Arrivés: ${stats.paye}`, 20, currentY);
      } else {
        doc.text(`Annulés: ${stats.annule}`, 20, currentY);
      }
      currentY += 8;
      
      doc.text(`Montant total: ${stats.totalMontant.toLocaleString()} Ar`, 20, currentY);
      currentY += 15;

      // Si recherche, afficher le terme
      if (searchTerm) {
        doc.setTextColor(100, 100, 100);
        doc.text(`Résultats pour: "${searchTerm}"`, 20, currentY);
        doc.setTextColor(0, 0, 0);
        currentY += 10;
      }

      // Préparer les données pour le tableau
      const tableData = paiements.map((paiement, index) => {
        const countdown = calculateCountdownForExport(paiement);
        
        const baseData = [
          (index + 1).toString(),
          paiement.reference,
          `${paiement.fournisseur.nom} ${paiement.fournisseur.prenom}`,
          paiement.fournisseur.contact,
          `${paiement.montant.toLocaleString()} Ar`,
          new Date(paiement.date).toLocaleDateString('fr-FR'),
          getStatusText(paiement.statut)
        ];

        // Colonnes supplémentaires pour les archives
        if (!showArchives) {
          return [
            ...baseData,
            formatDelaiInitial(paiement.delaiHeures),
            countdown?.texte || "—",
            countdown?.estEnRetard ? "OUI" : "NON"
          ];
        }

        return baseData;
      });

      // En-têtes du tableau
      const headers = [
        '#',
        'Référence',
        'Fournisseur',
        'Contact',
        'Montant',
        'Date',
        'Statut'
      ];

      // Colonnes supplémentaires pour les archives
      if (!showArchives) {
        headers.push('Délai initial', 'Délai restant', 'En retard');
      }

      // Générer le tableau avec autoTable
      autoTable(doc, {
        startY: currentY,
        head: [headers],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [parseInt(COLOR.slice(1, 3), 16), parseInt(COLOR.slice(3, 5), 16), parseInt(COLOR.slice(5, 7), 16)],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        didDrawPage: (data) => {
          // Pied de page sur chaque page
          generateFooter(doc, data.pageNumber, totalPages);
        },
        margin: { top: currentY, right: 20, bottom: 40, left: 20 }
      });

      // Sauvegarder le PDF
      const fileName = showArchives 
        ? `archives-paiements-${new Date().toISOString().split('T')[0]}.pdf`
        : `paiements-actifs-${new Date().toISOString().split('T')[0]}.pdf`;

      doc.save(fileName);
      resolve();
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      reject(error);
    }
  });
};

// Export pour un seul paiement (détail)
export const exportSinglePaiementToPDF = async (paiement: PaiementEnAvance): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // En-tête
      generateHeader(doc, "DÉTAIL DU PAIEMENT", false);
      
      let currentY = 70;
      
      // Informations détaillées
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMATIONS DU PAIEMENT", 20, currentY);
      currentY += 15;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      const details = [
        { label: "Référence", value: paiement.reference },
        { label: "Type", value: paiement.type },
        { label: "Fournisseur", value: `${paiement.fournisseur.nom} ${paiement.fournisseur.prenom}` },
        { label: "Contact", value: paiement.fournisseur.contact },
        { label: "Montant", value: `${paiement.montant.toLocaleString()} Ar` },
        { label: "Montant dû", value: paiement.montantDu ? `${paiement.montantDu.toLocaleString()} Ar` : "0 Ar" },
        { label: "Date", value: new Date(paiement.date).toLocaleDateString('fr-FR') },
        { label: "Heure", value: new Date(paiement.date).toLocaleTimeString('fr-FR') },
        { label: "Statut", value: getStatusText(paiement.statut) },
      ];
      
      details.forEach(detail => {
        doc.setFont("helvetica", "bold");
        doc.text(`${detail.label}:`, 20, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(detail.value, 60, currentY);
        currentY += 8;
      });
      
      // Délai pour les avances
      if (paiement.type === "avance") {
        currentY += 5;
        doc.setFont("helvetica", "bold");
        doc.text("INFORMATIONS DE LIVRAISON", 20, currentY);
        currentY += 10;
        
        doc.setFont("helvetica", "normal");
        const countdown = calculateCountdownForExport(paiement);
        
        const livraisonDetails = [
          { label: "Délai initial", value: formatDelaiInitial(paiement.delaiHeures) },
          { label: "Délai restant", value: countdown?.texte || "—" },
          { label: "Statut délai", value: countdown?.estEnRetard ? "EN RETARD" : "Dans les temps" },
        ];
        
        livraisonDetails.forEach(detail => {
          doc.setFont("helvetica", "bold");
          doc.text(`${detail.label}:`, 20, currentY);
          doc.setFont("helvetica", "normal");
          doc.text(detail.value, 60, currentY);
          currentY += 8;
        });
      }
      
      // Pied de page
      generateFooter(doc, 1, 1);
      
      // Sauvegarder
      doc.save(`paiement-${paiement.reference}-${new Date().toISOString().split('T')[0]}.pdf`);
      resolve();
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF détaillé:', error);
      reject(error);
    }
  });
};