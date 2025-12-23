import api from '@/api/api';
import type { 
  PVReception, 
  PVReceptionFormData, 
  PVReceptionResponse, 
  PVReceptionsResponse, 
  ApiResponse,
  CalculPoidsNet,
  CalculPrixTotal,
  FournisseurDisponible,
  FournisseursDisponiblesResponse,
  PaiementAvanceUtilise
} from './pvreception-types';

export const pvReceptionAPI = {
  // Créer un PV de réception
  create: async (data: PVReceptionFormData): Promise<PVReceptionResponse> => {
    const response = await api.post<PVReceptionResponse>('/pv-receptions', data);
    return response.data;
  },

  // Récupérer tous les PV de réception
  getAll: async (): Promise<PVReceptionsResponse> => {
    const response = await api.get<PVReceptionsResponse>('/pv-receptions');
    return response.data;
  },

  // Récupérer un PV de réception par ID
  getById: async (id: number): Promise<PVReceptionResponse> => {
    const response = await api.get<PVReceptionResponse>(`/pv-receptions/${id}`);
    return response.data;
  },

  // Mettre à jour un PV de réception
  update: async (id: number, data: Partial<PVReceptionFormData>): Promise<PVReceptionResponse> => {
    const response = await api.put<PVReceptionResponse>(`/pv-receptions/${id}`, data);
    return response.data;
  },

  // Supprimer un PV de réception
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/pv-receptions/${id}`);
    return response.data;
  },

  // Récupérer les PV par type
  getByType: async (type: string): Promise<PVReceptionsResponse> => {
    const response = await api.get<PVReceptionsResponse>(`/pv-receptions?type=${type}`);
    return response.data;
  },

  // Récupérer les PV par statut
  getByStatut: async (statut: string): Promise<PVReceptionsResponse> => {
    const response = await api.get<PVReceptionsResponse>(`/pv-receptions?statut=${statut}`);
    return response.data;
  },

  // Récupérer les fournisseurs disponibles
  getFournisseursDisponibles: async (): Promise<FournisseursDisponiblesResponse> => {
    const response = await api.get<FournisseursDisponiblesResponse>('/pv-receptions/fournisseurs-disponibles');
    return response.data;
  },

  // Récupérer les informations d'un fournisseur
  getInfosFournisseur: async (fournisseurId: number): Promise<any> => {
    const response = await api.get(`/pv-receptions/fournisseur/${fournisseurId}`);
    return response.data;
  }
};

// Utilitaires de calcul - CORRIGÉS pour correspondre exactement au backend
export const pvReceptionUtils = {
  // Calculer le poids net selon la logique EXACTE du backend
  calculerPoidsNet: ({ poidsBrut, poidsEmballage, tauxHumidite, tauxDessiccation }: CalculPoidsNet): number => {
    const poidsSansEmballage = poidsBrut - poidsEmballage;
    
    // Logique EXACTE du backend : dessiccation seulement si humidité > taux dessiccation
    if (tauxHumidite !== undefined && 
        tauxHumidite !== null &&
        tauxDessiccation !== undefined && 
        tauxDessiccation !== null && 
        tauxHumidite > tauxDessiccation) {
      const excesHumidite = tauxHumidite - tauxDessiccation;
      const dessiccation = poidsSansEmballage * (excesHumidite / 100);
      return poidsSansEmballage - dessiccation;
    }
    
    // Pas de dessiccation si humidité <= taux cible ou données manquantes
    return poidsSansEmballage;
  },

  // Calculer le prix total
  calculerPrixTotal: ({ poidsNet, prixUnitaire }: CalculPrixTotal): number => {
    return poidsNet * prixUnitaire;
  },

  // Formater le numéro de document
  formaterNumeroDoc: (type: string, numero: number): string => {
    return `${type}-${numero.toString().padStart(6, '0')}`;
  },

  // Valider les données selon le type
  validerDonnees: (data: PVReceptionFormData): string[] => {
    const erreurs: string[] = [];

    if (!data.type) {
      erreurs.push('Le type est requis');
    }

    if (!data.date_reception) {
      erreurs.push('La date de réception est requise');
    }

    if (data.dette_fournisseur === undefined || data.dette_fournisseur < 0) {
      erreurs.push('La dette fournisseur est requise et ne peut pas être négative');
    }

    if (!data.utilisateur_id) {
      erreurs.push('L\'utilisateur est requis');
    }

    if (!data.fournisseur_id) {
      erreurs.push('Le fournisseur est requis');
    }

    if (!data.provenance_id) {
      erreurs.push('La provenance est requise');
    }

    if (!data.poids_brut || data.poids_brut <= 0) {
      erreurs.push('Le poids brut doit être supérieur à 0');
    }

    if (!data.type_emballage) {
      erreurs.push('Le type d\'emballage est requis');
    }

    if (!data.poids_emballage || data.poids_emballage < 0) {
      erreurs.push('Le poids de l\'emballage est requis');
    }

    if (!data.nombre_colisage || data.nombre_colisage <= 0) {
      erreurs.push('Le nombre de colisage doit être supérieur à 0');
    }

    if (!data.prix_unitaire || data.prix_unitaire <= 0) {
      erreurs.push('Le prix unitaire doit être supérieur à 0');
    }

    // Validation des taux (maintenant pour tous les types)
    if (data.taux_dessiccation !== undefined && (data.taux_dessiccation < 0 || data.taux_dessiccation > 100)) {
      erreurs.push('Le taux de dessiccation doit être entre 0 et 100%');
    }

    if (data.taux_humidite !== undefined && (data.taux_humidite < 0 || data.taux_humidite > 100)) {
      erreurs.push('Le taux d\'humidité doit être entre 0 et 100%');
    }

    // Validation du poids emballage vs poids brut
    if (data.poids_emballage >= data.poids_brut) {
      erreurs.push('Le poids de l\'emballage ne peut pas être supérieur ou égal au poids brut');
    }

    return erreurs;
  },

  // Calculer la dette fournisseur selon la logique backend avec paiements partiels
  calculerDetteFournisseur: (
    prixTotal: number, 
    montantVerse: number, 
    paiementsDisponibles: PaiementAvanceUtilise[] = []
  ): { 
    detteFinale: number;
    paiementsUtilises: PaiementAvanceUtilise[];
    totalPaiementsUtilises: number;
    resteACouvrir: number;
    montantACouvrirParPaiements: number;
  } => {
    // Montant que les paiements doivent couvrir
    const montantACouvrirParPaiements = Math.max(0, prixTotal - montantVerse);
    
    let montantRestantACouvrir = montantACouvrirParPaiements;
    let totalPaiementsUtilises = 0;
    const paiementsUtilises: PaiementAvanceUtilise[] = [];

    // Parcourir les paiements disponibles
    for (const paiement of paiementsDisponibles) {
      if (montantRestantACouvrir <= 0) break;
      
      // Calculer combien utiliser de ce paiement
      const montantDisponible = paiement.montantRestant;
      const montantAUtiliser = Math.min(montantDisponible, montantRestantACouvrir);
      
      if (montantAUtiliser <= 0) continue;
      
      // Mettre à jour les montants
      const montantUtiliseApres = paiement.montantUtilise + montantAUtiliser;
      const montantRestantApres = paiement.montant - montantUtiliseApres;
      const statutApres = montantRestantApres === 0 ? 'utilise' : 'arrivé';
      
      paiementsUtilises.push({
        ...paiement,
        montantUtilise: montantUtiliseApres,
        montantRestant: montantRestantApres,
        statut: statutApres,
        montantUtiliseCetteTransaction: montantAUtiliser
      });
      
      totalPaiementsUtilises += montantAUtiliser;
      montantRestantACouvrir -= montantAUtiliser;
    }

    // Calcul final de la dette
    const detteFinale = Math.max(0, prixTotal - montantVerse - totalPaiementsUtilises);
    
    return {
      detteFinale,
      paiementsUtilises,
      totalPaiementsUtilises,
      resteACouvrir: montantRestantACouvrir,
      montantACouvrirParPaiements
    };
  },

  // Simuler le calcul complet comme le backend avec paiements partiels
  simulerCalculBackend: (data: {
    poidsBrut: number;
    poidsEmballage: number;
    tauxHumidite?: number;
    tauxDessiccation?: number;
    prixUnitaire: number;
    montantVerse?: number;
    paiementsDisponibles?: PaiementAvanceUtilise[];
  }) => {
    const poidsSansEmballage = data.poidsBrut - data.poidsEmballage;
    
    let poidsNet = poidsSansEmballage;
    
    // Appliquer la dessiccation EXACTEMENT comme le backend
    if (data.tauxHumidite !== undefined && 
        data.tauxHumidite !== null &&
        data.tauxDessiccation !== undefined && 
        data.tauxDessiccation !== null && 
        data.tauxHumidite > data.tauxDessiccation) {
      const excesHumidite = data.tauxHumidite - data.tauxDessiccation;
      const dessiccation = poidsSansEmballage * (excesHumidite / 100);
      poidsNet = poidsSansEmballage - dessiccation;
    }
    
    const prixTotal = poidsNet * data.prixUnitaire;
    const montantVerse = data.montantVerse || 0;
    const paiementsDisponibles = data.paiementsDisponibles || [];
    
    // Calcul de la dette avec réutilisation des paiements
    const calculDette = pvReceptionUtils.calculerDetteFournisseur(
      prixTotal, 
      montantVerse, 
      paiementsDisponibles
    );

    // Déterminer le statut selon le backend
    const statut = calculDette.detteFinale === 0 ? 'paye' : 'non_paye';

    return {
      poidsNet: Number(poidsNet.toFixed(2)),
      prixTotal: Number(prixTotal.toFixed(2)),
      montantVerse,
      ...calculDette,
      statut,
      detailsPaiements: calculDette.paiementsUtilises.map(p => ({
        id: p.id,
        reference: p.reference,
        montantTotal: p.montant,
        montantUtiliseAvant: p.montantUtilise - (p.montantUtiliseCetteTransaction || 0),
        montantUtiliseCetteTransaction: p.montantUtiliseCetteTransaction || 0,
        montantUtiliseTotal: p.montantUtilise,
        montantRestant: p.montantRestant,
        type: p.type,
        statut: p.statut
      })),
      messagePaiements: calculDette.resteACouvrir > 0 
        ? `⚠️ Paiements d'avance insuffisants, reste à payer: ${calculDette.resteACouvrir.toLocaleString('fr-FR')} Ar`
        : '✅ Paiements d\'avance suffisants'
    };
  },

  // Vérifier si un fournisseur a des paiements en attente
  verifierPaiementsEnAttente: (fournisseurInfos: any): boolean => {
    return fournisseurInfos?.paiements_avance?.details_en_attente?.length > 0;
  },

  // Récupérer les paiements disponibles d'un fournisseur
  getPaiementsDisponibles: (fournisseurInfos: any): PaiementAvanceUtilise[] => {
    if (!fournisseurInfos?.paiements_avance?.details_disponibles) {
      return [];
    }

    return fournisseurInfos.paiements_avance.details_disponibles.map((paiement: any) => ({
      id: paiement.id,
      reference: paiement.reference,
      montant: paiement.montant,
      montantUtilise: 0, // À récupérer de la base de données
      montantRestant: paiement.montant, // À récupérer de la base de données
      type: paiement.type,
      date: paiement.date,
      description: paiement.description,
      statut: 'arrivé'
    }));
  },

  // Formater les détails des paiements pour l'affichage
  formaterDetailsPaiements: (paiementsUtilises: PaiementAvanceUtilise[]) => {
    return paiementsUtilises.map(p => ({
      id: p.id,
      reference: p.reference,
      montantTotal: p.montant,
      montantUtilise: p.montantUtiliseCetteTransaction || 0,
      montantRestant: p.montantRestant,
      type: p.type,
      statut: p.statut
    }));
  }
};