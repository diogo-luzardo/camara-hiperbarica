import { User, UserRole, Permission, RoleConfig, RolePermissionCategory } from '../types/auth';

export const ALL_PERMISSIONS: Permission[] = [
  'patients:view',
  'patients:create',
  'patients:edit',
  'patients:delete',
  'sessions:view',
  'sessions:create',
  'sessions:edit',
  'sessions:delete',
  'appointments:view',
  'appointments:create',
  'appointments:edit',
  'appointments:delete',
  'vault:view',
  'vault:upload',
  'vault:delete',
  'finance:view',
  'finance:edit',
  'finance:export',
  'system:architecture',
  'system:users',
  'system:settings',
];

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  administrador: {
    role: 'administrador',
    label: 'Administrador Geral',
    description: 'Acesso pleno e irrestrito a todos os módulos, parametrizações e auditoria clínica.',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    borderColor: 'border-purple-300',
    colorHex: '#9333ea',
    defaultPermissions: ALL_PERMISSIONS,
    primaryModules: ['Pacientes', 'Agendamentos', 'Sessões & SAE', 'Prontuários Antigos', 'Financeiro', 'Arquitetura AWS'],
  },
  administrativo: {
    role: 'administrativo',
    label: 'Administrativo & Recepção',
    description: 'Cadastro cadastral de pacientes, validação de convênios, controle de agenda e acervo.',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    borderColor: 'border-amber-300',
    colorHex: '#d97706',
    defaultPermissions: [
      'patients:view',
      'patients:create',
      'patients:edit',
      'appointments:view',
      'appointments:create',
      'appointments:edit',
      'appointments:delete',
      'vault:view',
      'vault:upload',
    ],
    primaryModules: ['Pacientes (Cadastro/Recepção)', 'Agendamentos & Lembretes', 'Acervo Digital de Prontuários'],
  },
  operacional: {
    role: 'operacional',
    label: 'Operacional & Enfermagem',
    description: 'Enfermagem, operador de câmara hiperbárica, monitoramento de ATA e evolução SAE.',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    borderColor: 'border-cyan-300',
    colorHex: '#0891b2',
    defaultPermissions: [
      'patients:view',
      'sessions:view',
      'sessions:create',
      'sessions:edit',
      'sessions:delete',
      'appointments:view',
      'vault:view',
      'vault:upload',
    ],
    primaryModules: ['Prontuário Clínico', 'Sessões Hiperbáricas (2.4 ATA)', 'Sistematização Enfermagem (SAE)', 'Acervo Digital'],
  },
  financeiro: {
    role: 'financeiro',
    label: 'Financeiro & Convênios',
    description: 'Faturamento de sessões OHB, autorizações TISS/TUSS, auditoria de glosas e relatórios.',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    colorHex: '#059669',
    defaultPermissions: [
      'patients:view',
      'appointments:view',
      'finance:view',
      'finance:edit',
      'finance:export',
    ],
    primaryModules: ['Painel Financeiro', 'Guias TISS/TUSS (20101202)', 'Fechamento de Convênios & Glosas', 'Pacientes (Dados de Convênio)'],
  },
};

export const MOCK_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Dr. Carlos Henrique Esteves',
    email: 'admin@ohb.med.br',
    role: 'administrador',
    roleLabel: 'Administrador Geral / Diretor Clínico',
    title: 'Diretor Clínico & Médico Hiperbarista',
    registrationNumber: 'CRM-SP 62.139',
    department: 'Diretoria Médica & Gestão',
    avatarUrl: '',
    permissions: ROLE_CONFIGS.administrador.defaultPermissions,
  },
  {
    id: 'user-operacional',
    name: 'Enfª. Juliana Ramos',
    email: 'operacional@ohb.med.br',
    role: 'operacional',
    roleLabel: 'Operacional & Enfermagem',
    title: 'Enfermeira Especialista em Estomaterapia & OHB',
    registrationNumber: 'COREN-SP 182.492',
    department: 'Enfermagem & Câmara Hiperbárica',
    avatarUrl: '',
    permissions: ROLE_CONFIGS.operacional.defaultPermissions,
  },
  {
    id: 'user-administrativo',
    name: 'Roberto Mendes',
    email: 'administrativo@ohb.med.br',
    role: 'administrativo',
    roleLabel: 'Administrativo & Recepção',
    title: 'Coordenador de Recepção & Prontuários',
    registrationNumber: 'MAT-4019',
    department: 'Recepção, Triagem & Atendimento',
    avatarUrl: '',
    permissions: ROLE_CONFIGS.administrativo.defaultPermissions,
  },
  {
    id: 'user-financeiro',
    name: 'Marina Albuquerque',
    email: 'financeiro@ohb.med.br',
    role: 'financeiro',
    roleLabel: 'Financeiro & Convênios',
    title: 'Analista de Faturamento Médico & TISS',
    registrationNumber: 'CRA-SP 89.201',
    department: 'Faturamento, Glosas & Convênios',
    avatarUrl: '',
    permissions: ROLE_CONFIGS.financeiro.defaultPermissions,
  },
];

export const PERMISSION_CATEGORIES: RolePermissionCategory[] = [
  {
    category: 'Gestão de Pacientes & Cadastros',
    description: 'Acesso aos dados demográficos, prontuários e convênios dos pacientes.',
    permissions: [
      { key: 'patients:view', label: 'Visualizar Pacientes', description: 'Consultar listagem e detalhes do prontuário' },
      { key: 'patients:create', label: 'Cadastrar Paciente', description: 'Adicionar novos pacientes no sistema' },
      { key: 'patients:edit', label: 'Editar Prontuário', description: 'Alterar dados cadastrais, clínicos e convênios' },
      { key: 'patients:delete', label: 'Excluir Paciente', description: 'Remover paciente ou arquivar registro' },
    ],
  },
  {
    category: 'Sessões Hiperbáricas (2.4 ATA) & SAE',
    description: 'Controle de câmara, sinais vitais, intercorrências e enfermagem.',
    permissions: [
      { key: 'sessions:view', label: 'Visualizar Sessões', description: 'Consultar histórico de sessões do paciente' },
      { key: 'sessions:create', label: 'Registrar Nova Sessão', description: 'Preencher ficha técnica, ATA e segurança' },
      { key: 'sessions:edit', label: 'Editar Ficha Clínica', description: 'Retificar anotações de evolução de enfermagem' },
      { key: 'sessions:delete', label: 'Excluir Sessão', description: 'Excluir registro incorreto de sessão' },
    ],
  },
  {
    category: 'Agenda & Lembretes Celular',
    description: 'Organização de horários, pacotes de sessões e disparos de alertas.',
    permissions: [
      { key: 'appointments:view', label: 'Visualizar Grade', description: 'Consultar agendamentos do dia e semana' },
      { key: 'appointments:create', label: 'Agendar Sessões', description: 'Criar agendamentos avulsos ou pacotes' },
      { key: 'appointments:edit', label: 'Alterar Horário/Status', description: 'Confirmar, reagendar ou remarcar' },
      { key: 'appointments:delete', label: 'Cancelar Agendamento', description: 'Cancelar sessões na grade da clínica' },
    ],
  },
  {
    category: 'Cofre Digital & Prontuários Escaneados',
    description: 'Histórico físico digitalizado, laudos e fotos de lesões.',
    permissions: [
      { key: 'vault:view', label: 'Consultar Acervo', description: 'Visualizar documentos e fotos no cofre' },
      { key: 'vault:upload', label: 'Digitalizar / Fazer Upload', description: 'Adicionar novas folhas e laudos digitalizados' },
      { key: 'vault:delete', label: 'Excluir Documento', description: 'Remover arquivos do cofre digital' },
    ],
  },
  {
    category: 'Financeiro, Faturamento & Convênios',
    description: 'Controle de faturamento por sessão, guias TISS/TUSS e auditoria.',
    permissions: [
      { key: 'finance:view', label: 'Visualizar Faturamento', description: 'Acessar valores de sessões e faturamento' },
      { key: 'finance:edit', label: 'Auditar & Faturar Guias', description: 'Alterar status de guias e lotes de convênios' },
      { key: 'finance:export', label: 'Exportar Relatórios TISS', description: 'Gerar XMLs, planilhas e relatórios contábeis' },
    ],
  },
  {
    category: 'Governança & Arquitetura do Sistema',
    description: 'Infraestrutura AWS, Quarkus, logs e controle de acessos.',
    permissions: [
      { key: 'system:architecture', label: 'Ver Arquitetura Técnica', description: 'Acessar diagrama AWS, Quarkus e PostgreSQL' },
      { key: 'system:users', label: 'Gerenciar Usuários & Perfis', description: 'Configurar permissões e contas de usuários' },
      { key: 'system:settings', label: 'Configurações Globais', description: 'Ajustes institucionais e parâmetros da clínica' },
    ],
  },
];

/**
 * Valida se um determinado perfil possui a permissão solicitada.
 * Se strictMode for falso (modo permissivo para testes), permite todos os acessos.
 */
export function checkPermission(
  userRole: UserRole | undefined,
  permission: Permission,
  isStrictMode: boolean = false
): boolean {
  // Se estiver em modo permissivo (como solicitado para testes iniciais), libera acesso
  if (!isStrictMode) return true;

  if (!userRole) return false;
  const config = ROLE_CONFIGS[userRole];
  if (!config) return false;

  return config.defaultPermissions.includes(permission);
}

/**
 * Mapeamento das visualizações da aplicação para os papéis sugeridos
 */
export const VIEW_ROLE_MAPPING: Record<
  'pacientes' | 'agendamentos' | 'acervo' | 'financeiro' | 'arquitetura',
  { primaryRoles: UserRole[]; label: string; iconName: string; requiredPermission: Permission }
> = {
  pacientes: {
    primaryRoles: ['administrador', 'administrativo', 'operacional', 'financeiro'],
    label: 'Pacientes & Prontuários',
    iconName: 'Users',
    requiredPermission: 'patients:view',
  },
  agendamentos: {
    primaryRoles: ['administrador', 'administrativo', 'operacional'],
    label: 'Agendamentos & Grade',
    iconName: 'Calendar',
    requiredPermission: 'appointments:view',
  },
  acervo: {
    primaryRoles: ['administrador', 'administrativo', 'operacional'],
    label: 'Prontuários Digitalizados',
    iconName: 'FolderArchive',
    requiredPermission: 'vault:view',
  },
  financeiro: {
    primaryRoles: ['administrador', 'financeiro'],
    label: 'Financeiro & Convênios',
    iconName: 'DollarSign',
    requiredPermission: 'finance:view',
  },
  arquitetura: {
    primaryRoles: ['administrador'],
    label: 'Arquitetura AWS & Java',
    iconName: 'Server',
    requiredPermission: 'system:architecture',
  },
};
