import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission, RoleConfig } from '../types/auth';
import { MOCK_USERS, ROLE_CONFIGS, checkPermission, VIEW_ROLE_MAPPING } from '../utils/rbac';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isStrictMode: boolean;
  roleConfig: RoleConfig;
  setStrictMode: (enabled: boolean) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  canAccessView: (view: 'pacientes' | 'agendamentos' | 'acervo' | 'financeiro' | 'arquitetura') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ohb_auth_user_v1';
const STRICT_MODE_KEY = 'ohb_rbac_strict_mode_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização segura pelo localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role && ROLE_CONFIGS[parsed.role as UserRole]) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar sessão de usuário:', e);
    }
    // Por padrão no primeiro carregamento, deixa deslogado para apresentar a tela de login
    return null;
  });

  // Strict mode: desligado por padrão conforme solicitado:
  // "por enquanto da pra deixar o acesso para liberado para todos os perfis porém preciso separar entre financeiro, operacional, administrativo e administrador"
  const [isStrictMode, setIsStrictModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STRICT_MODE_KEY);
      return saved === 'true'; // Padrão false (permissivo)
    } catch {
      return false;
    }
  });

  const setStrictMode = (enabled: boolean) => {
    setIsStrictModeState(enabled);
    localStorage.setItem(STRICT_MODE_KEY, String(enabled));
  };

  const role: UserRole = user ? user.role : 'administrador';
  const roleConfig = ROLE_CONFIGS[role];

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulação assíncrona de autenticação
    await new Promise((resolve) => setTimeout(resolve, 500));

    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      // Aceita também login genérico se senha tiver mais de 3 caracteres para facilitar testes
      if (cleanEmail.includes('@') && password.length >= 3) {
        // Criar usuário customizado padrão Administrador
        const customUser: User = {
          id: 'user-custom-' + Date.now(),
          name: cleanEmail.split('@')[0].toUpperCase(),
          email: cleanEmail,
          role: 'administrador',
          roleLabel: 'Administrador Clínico',
          title: 'Profissional de Saúde',
          department: 'Medicina Hiperbárica',
          permissions: ROLE_CONFIGS.administrador.defaultPermissions,
        };
        setUser(customUser);
        if (rememberMe) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
        }
        return { success: true };
      }
      return { success: false, error: 'E-mail ou credenciais não encontrados no sistema.' };
    }

    // Senha padrão nos mocks aceita qualquer senha >= 3 caracteres para facilidade de demonstração
    if (password.length < 3) {
      return { success: false, error: 'A senha informada deve ter no mínimo 3 caracteres.' };
    }

    setUser(matchedUser);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser));
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser));
    }

    return { success: true };
  };

  // Login rápido de 1 clique por perfil
  const quickLogin = (targetRole: UserRole) => {
    const matched = MOCK_USERS.find((u) => u.role === targetRole) || MOCK_USERS[0];
    setUser(matched);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
  };

  // Alternância rápida de perfil para testes na barra de navegação
  const switchRole = (newRole: UserRole) => {
    const matched = MOCK_USERS.find((u) => u.role === newRole);
    if (matched) {
      setUser(matched);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
    } else if (user) {
      const updatedUser: User = {
        ...user,
        role: newRole,
        roleLabel: ROLE_CONFIGS[newRole].label,
        permissions: ROLE_CONFIGS[newRole].defaultPermissions,
      };
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return checkPermission(user.role, permission, isStrictMode);
  };

  const canAccessView = (view: 'pacientes' | 'agendamentos' | 'acervo' | 'financeiro' | 'arquitetura'): boolean => {
    if (!isStrictMode) return true; // Modo permissivo: todos os perfis podem ver tudo
    if (!user) return false;
    const viewMapping = VIEW_ROLE_MAPPING[view];
    if (!viewMapping) return true;
    return viewMapping.primaryRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isStrictMode,
        roleConfig,
        setStrictMode,
        login,
        quickLogin,
        switchRole,
        logout,
        hasPermission,
        canAccessView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
