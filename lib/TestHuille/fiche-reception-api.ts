// lib/TestHuille/fiche-reception-api.ts

import api from '@/api/api';
import type { 
  FicheReception, 
  CreateFicheReceptionData, 
  UpdateFicheReceptionData,
  FicheReceptionResponse,
  FicheReceptionsResponse,
  ApiResponse,
  FicheReceptionStatut,
  Fournisseur,
  InfosFournisseurResponse,
  FournisseursDisponiblesResponse,
  PaiementAvance
} from './fiche-reception-types';

/**
 * Normalise l'heure au format HH:mm (ex: 9:5 → 09:05)
 */
const normalizeHeure = (heure: string): string => {
  if (!heure || typeof heure !== 'string') return '';
  const [h = '00', m = '00'] = heure.split(':');
  const hours = h.padStart(2, '0').slice(0, 2);
  const minutes = m.padStart(2, '0').slice(0, 2);
  return `${hours}:${minutes}`;
};

/**
 * Valide le format H:i (00:00 à 23:59)
 */
const isValidHeureFormat = (heure: string): boolean => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(heure);
};

export const ficheReceptionApi = {
  // Créer une fiche de réception
  create: async (data: CreateFicheReceptionData): Promise<FicheReceptionResponse> => {
    const normalized = {
      ...data,
      heure_reception: normalizeHeure(data.heure_reception)
    };

    if (!isValidHeureFormat(normalized.heure_reception)) {
      return {
        success: false,
        message: 'Format d\'heure invalide. Utilisez HH:MM (ex: 14:30)',
        data: {} as FicheReception
      };
    }

    const response = await api.post<FicheReceptionResponse>('/fiche-receptions', normalized);
    return response.data;
  },

  // Récupérer toutes les fiches
  getAll: async (): Promise<FicheReceptionsResponse> => {
    const response = await api.get<FicheReceptionsResponse>('/fiche-receptions');
    return response.data;
  },

  // Récupérer par ID
  getById: async (id: number): Promise<FicheReceptionResponse> => {
    const response = await api.get<FicheReceptionResponse>(`/fiche-receptions/${id}`);
    return response.data;
  },

  // Mettre à jour
  update: async (id: number, data: UpdateFicheReceptionData): Promise<FicheReceptionResponse> => {
    try {
      // Normaliser l'heure si présente
      const payload: UpdateFicheReceptionData = {
        ...data,
      };

      if (data.heure_reception !== undefined) {
        const normalized = normalizeHeure(data.heure_reception);
        if (!isValidHeureFormat(normalized)) {
          return {
            success: false,
            message: 'Erreur de validation',
            errors: {
              heure_reception: ['The heure reception field must match the format H:i.']
            }
          } as any;
        }
        payload.heure_reception = normalized;
      }

      // Normaliser poids_brut si présent
      if (data.poids_brut !== undefined) {
        const poids = parseFloat(data.poids_brut as any);
        if (isNaN(poids) || poids <= 0) {
          return {
            success: false,
            message: 'Le poids brut doit être un nombre positif',
            data: {} as FicheReception
          };
        }
        payload.poids_brut = poids;
      }

      const response = await api.put<FicheReceptionResponse>(`/fiche-receptions/${id}`, payload);
      return response.data;

    } catch (error: any) {
      console.error('Erreur API update fiche:', error);

      // Gestion détaillée des erreurs de validation Laravel
      if (error.response?.status === 422 && error.response?.data?.errors) {
        return {
          success: false,
          message: 'Erreur de validation',
          errors: error.response.data.errors
        } as any;
      }

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur lors de la mise à jour',
        data: {} as FicheReception
      };
    }
  },

  // Supprimer
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/fiche-receptions/${id}`);
    return response.data;
  },

  // Mettre à jour le statut
  updateStatut: async (id: number, statut: FicheReceptionStatut): Promise<FicheReceptionResponse> => {
    const response = await api.put<FicheReceptionResponse>(`/fiche-receptions/${id}/statut`, { statut });
    return response.data;
  },

  // Récupérer les fournisseurs disponibles (commun avec PV)
  getFournisseursDisponibles: async (): Promise<FournisseursDisponiblesResponse> => {
    try {
      const response = await api.get<FournisseursDisponiblesResponse>('/pv-receptions/fournisseurs-disponibles');
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération fournisseurs disponibles:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur lors de la récupération des fournisseurs',
        data: [],
        count: 0
      };
    }
  },

  // Récupérer les informations d'un fournisseur (commun avec PV)
  getInfosFournisseur: async (fournisseur_id: number): Promise<InfosFournisseurResponse> => {
    try {
      const response = await api.get<InfosFournisseurResponse>(`/pv-receptions/fournisseur/${fournisseur_id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération infos fournisseur:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur lors de la récupération des informations du fournisseur',
        data: {
          fournisseur: {} as Fournisseur,
          paiements_avance: {
            total_disponibles: 0,
            total_en_attente: 0,
            details_disponibles: [],
            details_en_attente: []
          },
          resume: {
            peut_creer_pv: false,
            montant_utilisable: 0,
            alertes: null
          }
        }
      };
    }
  },

  // NOUVELLE : Récupérer les informations d'un fournisseur pour les fiches
  getInfosFournisseurFiche: async (fournisseur_id: number): Promise<any> => {
    try {
      const response = await api.get(`/fiche-receptions/fournisseur/${fournisseur_id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération infos fournisseur fiche:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur lors de la récupération des informations du fournisseur',
        data: null
      };
    }
  }
};

// Utilitaires de validation
export const ficheReceptionUtils = {
  validerDonnees: (data: CreateFicheReceptionData | UpdateFicheReceptionData): string[] => {
    const erreurs: string[] = [];

    if ('date_reception' in data && !data.date_reception) {
      erreurs.push('La date de réception est requise');
    }

    if ('heure_reception' in data) {
      const heure = normalizeHeure(data.heure_reception as string);
      if (!heure) {
        erreurs.push('L\'heure de réception est requise');
      } else if (!isValidHeureFormat(heure)) {
        erreurs.push('L\'heure doit être au format HH:MM (ex: 14:30)');
      }
    }

    if ('fournisseur_id' in data && (!data.fournisseur_id || data.fournisseur_id <= 0)) {
      erreurs.push('Le fournisseur est requis');
    }

    if ('site_collecte_id' in data && (!data.site_collecte_id || data.site_collecte_id <= 0)) {
      erreurs.push('Le site de collecte est requis');
    }

    if ('poids_brut' in data) {
      const poids = parseFloat(data.poids_brut as any);
      if (isNaN(poids) || poids <= 0) {
        erreurs.push('Le poids brut doit être supérieur à 0');
      }
    }

    return erreurs;
  },

  // NOUVEAU : Calculer le poids net selon la logique backend
  calculerPoidsNet: (data: {
    poidsBrut: number;
    poidsEmballage?: number;
    tauxHumidite?: number;
    tauxDessiccation?: number;
  }): number => {
    const poidsSansEmballage = data.poidsBrut - (data.poidsEmballage || 0);
    
    // Logique EXACTE du backend : dessiccation seulement si humidité > taux dessiccation
    if (data.tauxHumidite !== undefined && 
        data.tauxHumidite !== null &&
        data.tauxDessiccation !== undefined && 
        data.tauxDessiccation !== null && 
        data.tauxHumidite > data.tauxDessiccation) {
      const excesHumidite = data.tauxHumidite - data.tauxDessiccation;
      const dessiccation = poidsSansEmballage * (excesHumidite / 100);
      return poidsSansEmballage - dessiccation;
    }
    
    return poidsSansEmballage;
  },

  // NOUVEAU : Simuler l'utilisation des paiements d'avance
  simulerPaiements: (prixTotal: number, paiementsDisponibles: PaiementAvance[] = []): {
    montantUtilise: number;
    resteAPayer: number;
    details: Array<{
      id: number;
      reference: string;
      montantTotal: number;
      montantUtilise: number;
      montantRestant: number;
      statut: string;
    }>;
  } => {
    let montantRestant = prixTotal;
    let totalUtilise = 0;
    const details: Array<{
      id: number;
      reference: string;
      montantTotal: number;
      montantUtilise: number;
      montantRestant: number;
      statut: string;
    }> = [];

    for (const paiement of paiementsDisponibles) {
      if (montantRestant <= 0) break;
      
      const montantDisponible = paiement.montant || 0;
      const montantAUtiliser = Math.min(montantDisponible, montantRestant);
      
      if (montantAUtiliser <= 0) continue;
      
      const montantRestantApres = montantDisponible - montantAUtiliser;
      const statutApres = montantRestantApres === 0 ? 'utilise' : 'arrivé';
      
      details.push({
        id: paiement.id,
        reference: paiement.reference,
        montantTotal: montantDisponible,
        montantUtilise: montantAUtiliser,
        montantRestant: montantRestantApres,
        statut: statutApres
      });
      
      totalUtilise += montantAUtiliser;
      montantRestant -= montantAUtiliser;
    }

    return {
      montantUtilise: totalUtilise,
      resteAPayer: montantRestant,
      details
    };
  }
};

// Mise à jour des types pour inclure les nouvelles informations
export interface InfosFournisseurFicheResponse {
  success: boolean;
  message: string;
  data?: {
    fournisseur: Fournisseur;
    paiements_avance: {
      total_disponibles: number;
      total_en_attente: number;
      details_disponibles: Array<PaiementAvance & {
        montant_utilise?: number;
        montant_restant?: number;
        pourcentage_utilise?: number;
        pourcentage_restant?: number;
      }>;
      details_en_attente: Array<PaiementAvance & {
        montant_utilise?: number;
        montant_restant?: number;
        delai_heures?: number;
        est_en_retard?: boolean;
        temps_restant?: string;
      }>;
    };
    resume: {
      peut_creer_fiche: boolean;
      montant_utilisable: number;
      a_des_paiements_disponibles: boolean;
      a_des_paiements_en_attente: boolean;
      alertes: string | null;
    };
  };
}

// Alias pour compatibilité
export const ficheService = ficheReceptionApi;