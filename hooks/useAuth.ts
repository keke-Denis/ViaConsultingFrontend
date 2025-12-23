// hooks/useAuth.ts
import { useState, useEffect } from 'react';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  numero: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  return { user, loading };
};