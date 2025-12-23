// contexts/auth-context.tsx
"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import type { User, LoginData, RegisterData, AuthResponse } from "@/lib/auth"
import { authAPI, getStoredUser, isAuthenticated, logoutUser, authenticateUser } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (credentials: LoginData) => Promise<AuthResponse>
  register: (userData: RegisterData) => Promise<AuthResponse>
  logout: () => Promise<void>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      
      if (isAuthenticated()) {
        const currentUser = await authAPI.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        } else {
          // Token invalide, nettoyer
          await logoutUser()
        }
      } else {
        // Vérifier le stockage local comme fallback
        const storedUser = getStoredUser()
        if (storedUser) {
          setUser(storedUser)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
      await logoutUser()
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (credentials: LoginData): Promise<AuthResponse> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await authAPI.login(credentials)
      
      if (response.success && response.data) {
        setUser(response.data)
        localStorage.setItem('access_token', response.access_token)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la connexion'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await authAPI.register(userData)
      
      if (response.success && response.data) {
        setUser(response.data)
        localStorage.setItem('access_token', response.access_token)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      await logoutUser()
      setUser(null)
      setError(null)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = () => setError(null)

  const value: AuthContextType = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isLoading,
      error,
      clearError,
    }),
    [user, isLoading, error, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
