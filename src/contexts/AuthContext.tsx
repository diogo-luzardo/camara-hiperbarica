import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission, RoleConfig } from '../types/auth';
import { MOCK_USERS, ROLE_CONFIGS, checkPermission, VIEW_ROLE_MAPPING } from '../utils/rbac';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isStrictMode: boolean;
  roleConfig: RoleConfig;
  rolePermissions: Record<UserRole, Permission[]>;
  setStrictMode: (enabled: boolean) => void;
  toggleRolePermission: (role: UserRole, permission: Permission) => void;
  resetRolePermissions: () => void;
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
const ROLE_PERMISSIONS_STORAGE_KEY = 'ohb_custom_role_permissions_v1';

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

  // Strict mode: desligado por padrão conforme solicitado
  const [isStrictMode, setIsStrictModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STRICT_MODE_KEY);
      return saved === 'true'; // Padrão false (permissivo)
    } catch {
      return false;
    }
  });

  // Permissões customizadas por papel editáveis em tempo real
  const [rolePermissions, setRolePermissionsState] = useState<Record<UserRole, Permission[]>>(() => {
    try {
      const saved = localStorage.getItem(ROLE_PERMISSIONS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar permissões personalizadas:', e);
    }
    return {
      administrador: [...ROLE_CONFIGS.administrador.defaultPermissions],
      operacional: [...ROLE_CONFIGS.operacional.defaultPermissions],
      administrativo: [...ROLE_CONFIGS.administrativo.defaultPermissions],
      financeiro: [...ROLE_CONFIGS.financeiro.defaultPermissions],
    };
  });

  const setStrictMode = (enabled: boolean) => {
    setIsStrictModeState(enabled);
    localStorage.setItem(STRICT_MODE_KEY, String(enabled));
  };

  const toggleRolePermission = (targetRole: UserRole, permission: Permission) => {
    setRolePermissionsState((prev) => {
      const currentList = prev[targetRole] || ROLE_CONFIGS[targetRole].defaultPermissions;
      const nextList = currentList.includes(permission)
        ? currentList.filter((p) => p !== permission)
        : [...currentList, permission];

      const updated = {
        ...prev,
        [targetRole]: nextList,
      };

      try {
        localStorage.setItem(ROLE_PERMISSIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Erro ao salvar permissões personalizadas:', err);
      }

      if (user && user.role === targetRole) {
        const updatedUser: User = {
          ...user,
          permissions: nextList,
        };
        setUser(updatedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      }

      return updated;
    });
  };

  const resetRolePermissions = () => {
    const defaults: Record<UserRole, Permission[]> = {
      administrador: [...ROLE_CONFIGS.administrador.defaultPermissions],
      operacional: [...ROLE_CONFIGS.operacional.defaultPermissions],
      administrativo: [...ROLE_CONFIGS.administrativo.defaultPermissions],
      financeiro: [...ROLE_CONFIGS.financeiro.defaultPermissions],
    };
    setRolePermissionsState(defaults);
    localStorage.removeItem(ROLE_PERMISSIONS_STORAGE_KEY);
    if (user) {
      const updatedUser: User = {
        ...user,
        permissions: defaults[user.role],
      };
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    }
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
    const matchedUser = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        u.email.split('@')[0].toLowerCase() === cleanEmail ||
        u.role.toLowerCase() === cleanEmail
    );

    if (!matchedUser) {
      // Aceita também login genérico com usuário/nome se senha tiver mais de 3 caracteres para facilitar testes
      if (cleanEmail.length > 0 && password.length >= 3) {
        const username = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
        // Criar usuário customizado padrão Administrador
        const customUser: User = {
          id: 'user-custom-' + Date.now(),
          name: username.toUpperCase(),
          email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@ohb.med.br`,
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
      return { success: false, error: 'Usuário ou credenciais não encontrados no sistema.' };
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
    if (!isStrictMode) return true; // Modo permissivo: todas as ações liberadas
    const currentList = rolePermissions[user.role] || ROLE_CONFIGS[user.role]?.defaultPermissions || [];
    return currentList.includes(permission);
  };

  const canAccessView = (view: 'pacientes' | 'agendamentos' | 'acervo' | 'financeiro' | 'arquitetura'): boolean => {
    if (!isStrictMode) return true; // Modo permissivo: todos os perfis podem ver tudo
    if (!user) return false;
    const viewMapping = VIEW_ROLE_MAPPING[view];
    if (!viewMapping) return true;
    return hasPermission(viewMapping.requiredPermission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isStrictMode,
        roleConfig,
        rolePermissions,
        setStrictMode,
        toggleRolePermission,
        resetRolePermissions,
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
    // Fallback gracioso para testes unitários ou renderizações isoladas
    return {
      user: null,
      role: 'administrador',
      isAuthenticated: false,
      isStrictMode: false,
      roleConfig: ROLE_CONFIGS.administrador,
      rolePermissions: {
        administrador: [...ROLE_CONFIGS.administrador.defaultPermissions],
        operacional: [...ROLE_CONFIGS.operacional.defaultPermissions],
        administrativo: [...ROLE_CONFIGS.administrativo.defaultPermissions],
        financeiro: [...ROLE_CONFIGS.financeiro.defaultPermissions],
      },
      setStrictMode: () => {},
      toggleRolePermission: () => {},
      resetRolePermissions: () => {},
      login: async () => ({ success: true }),
      quickLogin: () => {},
      switchRole: () => {},
      logout: () => {},
      hasPermission: () => true,
      canAccessView: () => true,
    };
  }
  return context;
};

