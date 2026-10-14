export type UserRole = 'administrador' | 'administrativo' | 'operacional' | 'financeiro';

export type Permission =
  // Pacientes
  | 'patients:view'
  | 'patients:create'
  | 'patients:edit'
  | 'patients:delete'
  // Sessões Hiperbáricas & SAE
  | 'sessions:view'
  | 'sessions:create'
  | 'sessions:edit'
  | 'sessions:delete'
  // Agendamentos
  | 'appointments:view'
  | 'appointments:create'
  | 'appointments:edit'
  | 'appointments:delete'
  // Acervo Digital & Prontuários Escaneados
  | 'vault:view'
  | 'vault:upload'
  | 'vault:delete'
  // Financeiro & Faturamento OHB
  | 'finance:view'
  | 'finance:edit'
  | 'finance:export'
  // Governança & Arquitetura
  | 'system:architecture'
  | 'system:users'
  | 'system:settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  registrationNumber?: string; // CRM, COREN, Matrícula
  department: string;
  avatarUrl?: string;
  permissions: Permission[];
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  colorHex: string;
  defaultPermissions: Permission[];
  primaryModules: string[];
}

export interface RolePermissionCategory {
  category: string;
  description: string;
  permissions: {
    key: Permission;
    label: string;
    description: string;
  }[];
}

export interface FinancialBillingItem {
  id: string;
  patientId: string;
  patientName: string;
  registroOHB: string;
  convenio: string;
  plano: string;
  dataSessao: string;
  sessaoNumero: number;
  codigoTUSS: string; // Ex: 20101202 - Oxigenoterapia hiperbárica
  descricaoProcedimento: string;
  valorSessao: number;
  statusGuia: 'autorizado' | 'faturado' | 'em_analise' | 'pago' | 'glosado';
  numeroGuia: string;
  loteFaturamento?: string;
}
