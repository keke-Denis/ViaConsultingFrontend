// utils/formatters.ts
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Non défini'
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  } catch {
    return 'Date invalide'
  }
}

export const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Non défini'
  try {
    return new Date(dateString).toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Date invalide'
  }
}

export const formatCurrency = (value: any): string => {
  if (value === null || value === undefined || value === '') return '0 Ar'
  try {
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value)
    return isNaN(num) ? '0 Ar' : `${num.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Ar`
  } catch {
    return '0 Ar'
  }
}

export const formatNumber = (value: any, decimals: number = 2): string => {
  if (value === null || value === undefined || value === '') return '-'
  try {
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value)
    return isNaN(num) ? '-' : num.toFixed(decimals)
  } catch {
    return '-'
  }
}

export const formatPercentage = (value: any): string => {
  if (value === null || value === undefined || value === '') return '-'
  try {
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value)
    return isNaN(num) ? '-' : `${num.toFixed(1)}%`
  } catch {
    return '-'
  }
}

export const getPoidsBruts = (f: any): number => {
  if (!f) return 0
  try {
    const raw = f?.poids_brut ?? f?.poids_bruts ?? f?.poids ?? f?.poidsBrut ?? 0
    const cleaned = typeof raw === 'string' ? raw.replace(',', '.') : raw
    const n = Number(cleaned)
    return isNaN(n) ? 0 : n
  } catch {
    return 0
  }
}

export const safeGet = (obj: any, path: string, defaultValue: any = null) => {
  try {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj)
  } catch {
    return defaultValue
  }
}

export const getStatusLabel = (statut: string | undefined): string => {
  const map: Record<string, string> = {
    'en attente de teste': "En attente test",
    'en cours de teste': "Test en cours",
    'Accepté': "Accepté",
    'Refusé': "Refusé",
    'A retraiter': "À retraiter",
    'en attente de paiement': "En attente paiement",
    'payé': "Payé",
  // reuse existing migration status 'incomplet' to mean partial transfer
  'incomplet': "Partiellement transféré",
    'payement incomplète': "Paiement incomplet",
    'En attente de livraison': "En attente livraison",
    'en cours de livraison': "Livraison en cours",
    'livré': "Transféré",
    // statuses used by livraison flow
    'partiellement transferer': 'Partiellement transféré',
    'partiellement transférer': 'Partiellement transféré',
    'transferer': 'Transféré',
    'transférer': 'Transféré',
  }
  return statut ? (map[statut] || statut) : 'Inconnu'
}

export const getTypeEmballageLabel = (type: string | undefined): string => {
  const map: Record<string, string> = {
    'sac': "Sac",
    'bidon': "Bidon",
    'fut': "Fut"
  }
  return type ? (map[type] || type) : 'Non défini'
}