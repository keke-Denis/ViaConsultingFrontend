// Lib/affichageSolde/affichageSolde-api.ts
import api from '@/api/api';
import type { SoldeActuelResponse } from './affichageSolde-type';

export const fetchSoldeActuel = async (): Promise<SoldeActuelResponse> => {
  const response = await api.get<SoldeActuelResponse>('/caissiers');
  return response.data;
};