import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Users,
  Calendar,
  FolderArchive,
  Server,
  Plus,
  Download,
  ShieldCheck,
  Monitor,
  Maximize2,
  Minimize2,
  DollarSign,
  LogOut,
  ChevronDown,
  Crown,
  Stethoscope,
  FileText,
  Menu,
  X,
  BookOpen,
  Camera,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from './RoleBadge';
import { UserRole } from '../types/auth';
import { ROLE_CONFIGS } from '../utils/rbac';

export type LayoutWidthMode = 'ultrawide' | 'full' | 'compact';
export type AppNavView = 'pacientes' | 'agendamentos' | 'acervo' | 'financeiro' | 'arquitetura';

interface NavbarProps {
  activeView: AppNavView;
  onNavigate: (view: AppNavView) => void;
  onNewPatient: () => void;
  onNewPatientWithScanner?: () => void;
  onNewAppointment: () => void;
  onOpenBackup?: () => void;
  onOpenPermissions?: () => void;
  onOpenCidLookup?: () => void;
  patientCount: number;
  sessionCount: number;
  appointmentCount: number;
  documentCount: number;
  layoutMode?: LayoutWidthMode;
  onLayoutModeChange?: (mode: LayoutWidthMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onNewPatient,
  onNewPatientWithScanner,
  onNewAppointment,
  onOpenBackup,
  onOpenPermissions,
  onOpenCidLookup,
  patientCount,
  sessionCount,
  appointmentCount,
  documentCount,
  layoutMode = 'ultrawide',
  onLayoutModeChange,
}) => {
  const { user, role, switchRole, logout, isStrictMode, hasPermission } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const canCreatePatient = hasPermission('patients:create');
  const canCreateAppointment = hasPermission('appointments:create');

  // Fecha o menu de perfil ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navContainerClass =
    layoutMode === 'full'
      ? 'w-full px-3 sm:px-6 2xl:px-10'
      : layoutMode === 'compact'
      ? 'max-w-7xl mx-auto px-3 sm:px-6'
      : 'max-w-[2100px] mx-auto px-3 sm:px-6 2xl:px-10';

  const rolePills: { role: UserRole; icon: React.ElementType }[] = [
    { role: 'administrador', icon: Crown },
    { role: 'operacional', icon: Stethoscope },
    { role: 'administrativo', icon: FileText },
    { role: 'financeiro', icon: DollarSign },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md select-none">
      {/* 1. TOP INSTITUTIONAL SUB-BAR (Linha única, adaptável em mobile) */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-3 sm:px-6 2xl:px-10 h-8 sm:h-9 flex items-center justify-between text-xs text-slate-400 gap-2">
        {/* Lado Esquerdo: Identificação Clínica Institucional */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="text-cyan-400 font-semibold truncate whitespace-nowrap text-[11px] sm:text-xs">
            Centro Europa OHB
          </span>
          <span className="text-slate-600 hidden sm:inline shrink-0">|</span>
          <span className="hidden sm:inline text-slate-400 truncate whitespace-nowrap text-[11px] sm:text-xs">
            Medicina Hiperbárica Zona Sul
          </span>
          <span className="text-slate-600 hidden 2xl:inline shrink-0">|</span>
          <span className="hidden 2xl:inline text-slate-400 truncate whitespace-nowrap text-[11px] sm:text-xs">
            Dr. Carlos Henrique Esteves (CRM 62.139)
          </span>
        </div>

        {/* Lado Direito: Ferramentas, Perfis e Usuário */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Seletor de Aproveitamento de Tela (Discreto) */}
          {onLayoutModeChange && (
            <div className="hidden xl:flex items-center gap-0.5 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => onLayoutModeChange('ultrawide')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                  layoutMode === 'ultrawide'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Monitor Grande (Otimizado com até 5-6 colunas)"
              >
                <Monitor className="w-3 h-3" />
                <span>Grande</span>
              </button>
              <button
                type="button"
                onClick={() => onLayoutModeChange('full')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                  layoutMode === 'full'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo 100% Tela Cheia (Fluido ponta a ponta)"
              >
                <Maximize2 className="w-3 h-3" />
                <span>100%</span>
              </button>
              <button
                type="button"
                onClick={() => onLayoutModeChange('compact')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                  layoutMode === 'compact'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Compacto Centralizado (1280px)"
              >
                <Minimize2 className="w-3 h-3" />
                <span>Compacto</span>
              </button>
            </div>
          )}

          {/* Backup Button */}
          {onOpenBackup && (
            <button
              onClick={onOpenBackup}
              className="hidden lg:flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition-colors text-xs cursor-pointer"
              title="Exportar/Importar Backup JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Backup</span>
            </button>
          )}

          {/* Matriz RBAC Button */}
          {onOpenPermissions && (
            <button
              type="button"
              onClick={onOpenPermissions}
              className="flex items-center gap-1.5 text-cyan-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-cyan-800/80 px-2 sm:px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
              title="Ver Matriz de Permissões RBAC (Quem vê o quê)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Perfis & Acessos</span>
              <span className="md:hidden hidden sm:inline">Perfis</span>
            </button>
          )}

          {/* User Profile Widget & Dropdown */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 rounded-lg px-2 sm:px-2.5 py-1 text-xs text-slate-200 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-inner">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <span className="font-semibold text-white max-w-[85px] sm:max-w-[120px] 2xl:max-w-[150px] truncate text-[11px] hidden xs:inline">
                  {user.name}
                </span>
                <RoleBadge role={role} size="xs" />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Details */}
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate text-xs">{user.name}</p>
                      <p className="text-[11px] text-cyan-400">{user.title}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <RoleBadge role={role} size="xs" />
                        {user.registrationNumber && (
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                            {user.registrationNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Switch Active Role (Fast Demo Switcher) */}
                  <div className="py-3 border-b border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Alternar Perfil (Demonstração):
                      </span>
                      <span className="text-[9px] text-cyan-400 font-medium">1 Clique</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {rolePills.map(({ role: rRole, icon: IconComponent }) => {
                        const isCurrent = role === rRole;
                        const cfg = ROLE_CONFIGS[rRole];
                        return (
                          <button
                            key={rRole}
                            type="button"
                            onClick={() => {
                              switchRole(rRole);
                              setIsUserMenuOpen(false);
                            }}
                            className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5" style={{ color: cfg.colorHex }} />
                            <span className="text-[11px] capitalize truncate">{rRole}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Policy and Permissions Link */}
                  <div className="py-2.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Modo de Acesso:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        isStrictMode
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {isStrictMode ? 'Rigoroso (RBAC)' : 'Aberto (Permissivo)'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 space-y-1.5">
                    {onOpenPermissions && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenPermissions();
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Abrir Matriz de Permissões</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Encerrar Sessão / Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN NAV BAR (Fluido e responsivo, botões sempre visíveis sem corte) */}
      <div className={navContainerClass}>
        <div className="flex items-center justify-between h-14 2xl:h-16 gap-2 sm:gap-3">
          {/* Logo & Marca da Clínica */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => onNavigate('pacientes')}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-900/30 shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base 2xl:text-lg tracking-tight text-white font-['Outfit'] whitespace-nowrap">
                  CLÍNICA <span className="text-cyan-400">OHB</span>
                </span>
                <span className="text-[9px] 2xl:text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold whitespace-nowrap">
                  2.4 ATA
                </span>
              </div>
              <p className="text-[10px] 2xl:text-xs text-slate-400 -mt-0.5 hidden 2xl:block whitespace-nowrap">
                Oxigenoterapia Hiperbárica & Feridas
              </p>
            </div>
          </div>

          {/* Abas de Navegação (Desktop): Linha única limpa, compacta em telas intermediárias e completa em 2xl */}
          <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5 bg-slate-800/80 p-1 2xl:p-1.5 rounded-2xl border border-slate-700/80 shrink-0">
            {/* 1. Pacientes */}
            <button
              type="button"
              onClick={() => onNavigate('pacientes')}
              className={`flex items-center gap-1.5 px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'pacientes'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-400 scale-[1.02]'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/80 hover:scale-105 active:scale-95'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Pacientes</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                  activeView === 'pacientes'
                    ? 'bg-slate-950 text-cyan-300'
                    : 'bg-cyan-400/20 text-cyan-300'
                }`}
              >
                {patientCount}
              </span>
            </button>

            {/* 2. Agendamentos */}
            <button
              type="button"
              onClick={() => onNavigate('agendamentos')}
              className={`flex items-center gap-1.5 px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'agendamentos'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-400 scale-[1.02]'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/80 hover:scale-105 active:scale-95'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Agendamentos</span>
              <span className="2xl:hidden">Agenda</span>
              {appointmentCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                    activeView === 'agendamentos'
                      ? 'bg-slate-950 text-cyan-300'
                      : 'bg-cyan-400/20 text-cyan-300'
                  }`}
                >
                  {appointmentCount}
                </span>
              )}
            </button>

            {/* 3. Sessões & SAE (Operacional) */}
            <button
              type="button"
              onClick={() => onNavigate('pacientes')}
              className="flex items-center gap-1.5 px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/80 hover:scale-105 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              title="Atendimentos clínicos e fichas SAE do paciente"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden 2xl:inline">Sessões OHB</span>
              <span className="2xl:hidden">Sessões</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 shrink-0">
                {sessionCount}
              </span>
            </button>

            {/* 4. Prontuários Antigos Escaneados (Cofre) */}
            <button
              type="button"
              onClick={() => onNavigate('acervo')}
              className={`flex items-center gap-1.5 px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'acervo'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-400 scale-[1.02]'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/80 hover:scale-105 active:scale-95'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Prontuários Antigos</span>
              <span className="2xl:hidden">Acervo</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                  activeView === 'acervo'
                    ? 'bg-slate-950 text-cyan-300'
                    : 'bg-cyan-400/20 text-cyan-300'
                }`}
              >
                {documentCount}
              </span>
            </button>

            {/* 5. Financeiro & Convênios */}
            <button
              type="button"
              onClick={() => onNavigate('financeiro')}
              className={`flex items-center gap-1.5 px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'financeiro'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm border border-emerald-400 scale-[1.02]'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/80 hover:scale-105 active:scale-95'
              }`}
            >
              <DollarSign
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeView === 'financeiro' ? 'text-slate-950' : 'text-emerald-400'
                }`}
              />
              <span className="hidden 2xl:inline">Financeiro & Convênios</span>
              <span className="2xl:hidden">Financeiro</span>
            </button>

            {/* 6. Arquitetura AWS & Java (Admin) */}
            <button
              type="button"
              onClick={() => onNavigate('arquitetura')}
              className={`flex items-center gap-1.5 px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'arquitetura'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-400 scale-[1.02]'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/80 hover:scale-105 active:scale-95'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden 2xl:inline">AWS & Java</span>
              <span className="2xl:hidden">AWS</span>
            </button>
          </nav>

          {/* Botões de Ação no Topo & Gatilho Mobile/Tablet Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenCidLookup && (
              <button
                type="button"
                onClick={onOpenCidLookup}
                className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 2xl:px-3 py-1.5 2xl:py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white text-xs font-bold border border-cyan-700/80 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                title="Consultar Catálogo Oficial de CID-11 & CID-10"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="hidden 2xl:inline">Consultar CID-11</span>
                <span className="2xl:hidden">CID-11</span>
              </button>
            )}

            {canCreateAppointment && (
              <button
                type="button"
                onClick={onNewAppointment}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 2xl:py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold border border-cyan-700/80 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="hidden xs:inline">+ Agendar</span>
                <span className="xs:hidden">+</span>
              </button>
            )}

            {onNewPatientWithScanner && canCreatePatient && (
              <button
                type="button"
                onClick={onNewPatientWithScanner}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 2xl:py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
                title="Cadastrar paciente antigo digitalizando prontuário ou ficha de papel com a câmera"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span className="hidden sm:inline">Escanear Ficha</span>
                <span className="sm:hidden">Scan</span>
              </button>
            )}

            {canCreatePatient ? (
              <button
                type="button"
                onClick={onNewPatient}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 2xl:py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span className="hidden sm:inline">Novo Paciente</span>
                <span className="sm:hidden">Novo</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Ação restrita pela política de acessos do perfil ativo (Requer permissão de Cadastrar Paciente)"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 2xl:py-2 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-500 font-medium text-xs whitespace-nowrap cursor-not-allowed opacity-60"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span className="hidden sm:inline">Novo Paciente</span>
                <span className="sm:hidden">Novo</span>
              </button>
            )}

            {/* Botão Hambúrguer Mobile e Tablet (< xl) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="xl:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              aria-label="Abrir menu de navegação móvel"
            >
              <Menu className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Barra de Navegação Horizontal Secundária (Visível em Tablets e telas compactas: sm a xl) */}
        <div className="hidden sm:flex xl:hidden overflow-x-auto py-1.5 gap-1.5 border-t border-slate-800 no-scrollbar">
          <button
            type="button"
            onClick={() => onNavigate('pacientes')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'pacientes'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-800/80 hover:text-white'
            }`}
          >
            Pacientes ({patientCount})
          </button>
          <button
            type="button"
            onClick={() => onNavigate('agendamentos')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'agendamentos'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-800/80 hover:text-white'
            }`}
          >
            Agendamentos ({appointmentCount})
          </button>
          <button
            type="button"
            onClick={() => onNavigate('acervo')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'acervo'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-800/80 hover:text-white'
            }`}
          >
            Prontuários Digitalizados ({documentCount})
          </button>
          <button
            type="button"
            onClick={() => onNavigate('financeiro')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'financeiro'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-800/80 hover:text-white'
            }`}
          >
            Financeiro & TISS
          </button>
          <button
            type="button"
            onClick={() => onNavigate('arquitetura')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'arquitetura'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-800/80 hover:text-white'
            }`}
          >
            AWS / Java
          </button>
        </div>
      </div>

      {/* 3. BARRA DE NAVEGAÇÃO INFERIOR PARA CELULARES (Bottom Navigation Bar) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1 flex justify-around items-center shadow-2xl">
        {/* Tab 1: Pacientes */}
        <button
          type="button"
          onClick={() => onNavigate('pacientes')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeView === 'pacientes'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-cyan-500 text-slate-950">
              {patientCount}
            </span>
          </div>
          <span className="text-[10px] mt-0.5">Pacientes</span>
        </button>

        {/* Tab 2: Agendamentos */}
        <button
          type="button"
          onClick={() => onNavigate('agendamentos')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeView === 'agendamentos'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Calendar className="w-5 h-5" />
            {appointmentCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-cyan-500 text-slate-950">
                {appointmentCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Agenda</span>
        </button>

        {/* Tab 3: Botão de Ação Central (Cadastrar Paciente) */}
        {canCreatePatient && (
          <button
            type="button"
            onClick={onNewPatient}
            className="flex flex-col items-center justify-center -mt-4 bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 w-11 h-11 rounded-full shadow-lg shadow-cyan-500/40 border-2 border-slate-900 active:scale-95 transition-transform"
            title="Novo Paciente"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        )}

        {/* Tab 4: Prontuários & Acervo */}
        <button
          type="button"
          onClick={() => onNavigate('acervo')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeView === 'acervo'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderArchive className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Acervo</span>
        </button>

        {/* Tab 5: Menu Completo (Abre Gaveta Mobile) */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isMobileDrawerOpen
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Mais</span>
        </button>
      </nav>

      {/* 4. GAVETA MODAL MOBILE & TABLET (Drawer Completo com Perfil, Perfis RBAC e Links) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end xl:hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-slate-900 border-t border-slate-700/90 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho da Gaveta */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm text-white font-['Outfit']">
                  Menu da Clínica OHB
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Card do Usuário Logado & Alternar Perfil */}
            {user && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-xs truncate">{user.name}</p>
                    <p className="text-[11px] text-cyan-400 truncate">{user.title}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <RoleBadge role={role} size="xs" />
                      <span className="text-[10px] text-slate-400">
                        {isStrictMode ? 'Modo Rigoroso' : 'Modo Aberto'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alternador Rápido de Perfis (1 Toque) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Trocar Perfil (Demonstração):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {rolePills.map(({ role: rRole, icon: IconComponent }) => {
                      const isCurrent = role === rRole;
                      const cfg = ROLE_CONFIGS[rRole];
                      return (
                        <button
                          key={rRole}
                          type="button"
                          onClick={() => {
                            switchRole(rRole);
                            setIsMobileDrawerOpen(false);
                          }}
                          className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition-all ${
                            isCurrent
                              ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-xs'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <IconComponent className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.colorHex }} />
                          <span className="text-[11px] capitalize truncate">{rRole}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Links de Navegação Primários */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                Navegação:
              </span>

              <button
                type="button"
                onClick={() => {
                  onNavigate('pacientes');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeView === 'pacientes'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Prontuários de Pacientes</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/60 text-cyan-300">
                  {patientCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigate('agendamentos');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeView === 'agendamentos'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Central de Agendamentos</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/60 text-cyan-300">
                  {appointmentCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigate('acervo');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeView === 'acervo'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderArchive className="w-4 h-4 text-cyan-400" />
                  <span>Acervo de Prontuários Escaneados</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/60 text-cyan-300">
                  {documentCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigate('financeiro');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeView === 'financeiro'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Financeiro, Convênios & TISS</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigate('arquitetura');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeView === 'arquitetura'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Arquitetura AWS, H2 & Java</span>
                </div>
              </button>
            </div>

            {/* Ferramentas e Configurações */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              {onNewPatientWithScanner && canCreatePatient && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onNewPatientWithScanner();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 hover:from-emerald-900 hover:to-teal-900 border border-emerald-600/50 text-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Escanear Ficha Antiga (Papel)</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                    SCANNER
                  </span>
                </button>
              )}

              {onOpenCidLookup && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenCidLookup();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/80 text-xs font-bold transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>Consulta CID-11 & CID-10</span>
                  </div>
                  <span className="text-[9px] bg-cyan-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                    NOVO
                  </span>
                </button>
              )}

              {onOpenPermissions && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenPermissions();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Matriz de Permissões RBAC</span>
                </button>
              )}

              {onOpenBackup && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenBackup();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Exportar / Importar Backup</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Encerrar Sessão / Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
