// lib/siteCollecte/site-collecte-types.ts

export interface SiteCollecte {
  id: number;
  Nom: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteCollecteData {
  Nom: string;
}

export interface SiteCollecteResponse {
  success: boolean;
  data: SiteCollecte;
  message?: string;
  errors?: any;
}

export interface SiteCollectesResponse {
  success: boolean;
  data: SiteCollecte[];
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
