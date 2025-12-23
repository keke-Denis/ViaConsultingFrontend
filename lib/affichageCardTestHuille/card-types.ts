// lib/affichageCardTestHuille/card-types.ts

export interface FicheStatistique {
  total_fiches: number
  fiches_en_attente: number
  stock_brut_total: number
  stock_net_total: number
  en_attente_test: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface CardStats {
  totalFiches: number
  awaitingTest: number
  totalStock: number
  totalPoidsNet: number
}
