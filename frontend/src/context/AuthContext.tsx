import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  permissions?: string[];
  tenantId: string;
  tenant?: {
    id: string;
    nombre: string;
    logo?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Restaurar sesión desde localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData: User, newToken: string, newRefreshToken: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (currentRefreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken: currentRefreshToken });
      } catch (e) {
        console.error('Error al cerrar sesión en el servidor', e);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    // Super Admin tiene todo
    if (user.rol === 'SUPER_ADMIN') return true;
    return user.permissions?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
