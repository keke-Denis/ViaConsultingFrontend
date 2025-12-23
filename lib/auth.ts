// lib/auth.ts
import api from '@/api/api'

export type UserRole = "admin" | "collecteur" | "vendeur" | "distilleur"

export interface User {
  id: number
  nom: string
  prenom: string
  numero: string
  CIN: string
  localisation_id: number
  role: UserRole
  created_at: string
  updated_at: string
  localisation?: {
    id: number
    Nom: string
    created_at: string
    updated_at: string
  }
}

export interface LoginData {
  numero: string
  password: string
}

export interface RegisterData {
  nom: string
  prenom: string
  numero: string
  CIN: string
  localisation_id: number
  password: string
  password_confirmation: string
  role?: UserRole
  admin_confirmation_password?: string 
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: User
  access_token: string
  token_type: string
}

// Points d'API pour l'authentification avec le backend Laravel
export const authAPI = {
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login', credentials)
    return response.data
  },
  
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/register', userData)
    return response.data
  },
  
  logout: async (): Promise<void> => {
    await api.post('/logout')
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<{ success: boolean; data: User }>('/user')
      return response.data.success ? response.data.data : null
    } catch (error) {
      return null
    }
  },
}
export interface RegisterData {
  nom: string
  prenom: string
  numero: string
  CIN: string
  localisation_id: number
  password: string
  password_confirmation: string
  role?: UserRole
  admin_confirmation_password?: string 
}
// Fonction d'authentification avec le backend
export const authenticateUser = async (numero: string, password: string): Promise<User | null> => {
  try {
    const response = await authAPI.login({ numero, password })
    
    if (response.success) {
      // Stocker le token et l'utilisateur
      localStorage.setItem('access_token', response.access_token)
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
      }
      return response.data || null
    }
    
    return null
  } catch (error: any) {
    console.error('Erreur de connexion:', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

// Fonction pour déconnecter
export const logoutUser = async (): Promise<void> => {
  try {
    await authAPI.logout()
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }
}

// Fonction pour vérifier si l'utilisateur est connecté
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token')
}

// Fonction pour récupérer l'utilisateur stocké
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// Fonction utilitaire pour les routes par rôle
export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/dashboard"
    case "collecteur":
      return "/collecte"
    case "distilleur":
      return "/distillation/expedition"
    case "vendeur":
      return "/vente/reception"
    default:
      return "/dashboard"
  }
}

// Vérifier les permissions par rôle
export function hasPermission(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(userRole)
}

// Obtenir le nom complet de l'utilisateur
export function getFullName(user: User): string {
  return `${user.prenom} ${user.nom}`
}
