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
  onNewAppointment: () => void;
  onOpenBackup?: () => void;
  onOpenPermissions?: () => void;
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
  onNewAppointment,
  onOpenBackup,
  onOpenPermissions,
  patientCount,
  sessionCount,
  appointmentCount,
  documentCount,
  layoutMode = 'ultrawide',
  onLayoutModeChange,
}) => {
  const { user, role, switchRole, logout, isStrictMode, hasPermission } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
      {/* 1. TOP INSTITUTIONAL SUB-BAR (Linha única, sem quebra vertical) */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-3 sm:px-6 2xl:px-10 h-9 flex items-center justify-between text-xs text-slate-400 gap-3">
        {/* Lado Esquerdo: Identificação Clínica Institucional */}
        <div className="flex items-center gap-2 min-w-0 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="text-cyan-400 font-semibold truncate whitespace-nowrap">
            Centro Europa de Feridas Refratárias
          </span>
          <span className="text-slate-600 hidden md:inline shrink-0">|</span>
          <span className="hidden md:inline text-slate-400 truncate whitespace-nowrap">
            Medicina Hiperbárica Zona Sul
          </span>
          <span className="text-slate-600 hidden xl:inline shrink-0">|</span>
          <span className="hidden xl:inline text-slate-400 truncate whitespace-nowrap">
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
              className="flex items-center gap-1.5 text-cyan-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-cyan-800/80 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
              title="Ver Matriz de Permissões RBAC (Quem vê o quê)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Perfis & Acessos</span>
            </button>
          )}

          {/* User Profile Widget & Dropdown */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 rounded-lg px-2.5 py-1 text-xs text-slate-200 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-inner">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <span className="font-semibold text-white max-w-[110px] sm:max-w-[150px] truncate text-[11px]">
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

      {/* 2. MAIN NAV BAR (Linha única, altura uniforme de 56px, botões horizontais com whitespace-nowrap) */}
      <div className={navContainerClass}>
        <div className="flex items-center justify-between h-14 2xl:h-16 gap-3">
          {/* Logo & Marca da Clínica */}
          <div
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            onClick={() => onNavigate('pacientes')}
          >
            <div className="w-9 h-9 2xl:w-10 2xl:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-900/30 shrink-0">
              <Activity className="w-5 h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base 2xl:text-lg tracking-tight text-white font-['Outfit'] whitespace-nowrap">
                  CLÍNICA <span className="text-cyan-400">OHB</span>
                </span>
                <span className="text-[9px] 2xl:text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold whitespace-nowrap">
                  2.4 ATA
                </span>
              </div>
              <p className="text-[10px] 2xl:text-xs text-slate-400 -mt-0.5 hidden sm:block whitespace-nowrap">
                Oxigenoterapia Hiperbárica & Feridas
              </p>
            </div>
          </div>

          {/* Abas de Navegação (Desktop): Linha única limpa, sem quebra de texto */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 shrink-0">
            {/* 1. Pacientes */}
            <button
              type="button"
              onClick={() => onNavigate('pacientes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'agendamentos'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-400 scale-[1.02]'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/80 hover:scale-105 active:scale-95'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Agendamentos</span>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/80 hover:scale-105 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              title="Atendimentos clínicos e fichas SAE do paciente"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Sessões OHB</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 shrink-0">
                {sessionCount}
              </span>
            </button>

            {/* 4. Prontuários Antigos Escaneados (Cofre) */}
            <button
              type="button"
              onClick={() => onNavigate('acervo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'acervo'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-400 scale-[1.02]'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/80 hover:scale-105 active:scale-95'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 shrink-0" />
              <span>Prontuários Antigos</span>
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
              <span>Financeiro & Convênios</span>
            </button>

            {/* 6. Arquitetura AWS & Java (Admin) */}
            <button
              type="button"
              onClick={() => onNavigate('arquitetura')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'arquitetura'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-400 scale-[1.02]'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/80 hover:scale-105 active:scale-95'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>AWS & Java</span>
            </button>
          </nav>

          {/* Botões de Ação Rápida no Topo */}
          <div className="flex items-center gap-2 shrink-0">
            {canCreateAppointment && (
              <button
                type="button"
                onClick={onNewAppointment}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 2xl:py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold border border-cyan-700/80 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>+ Agendar</span>
              </button>
            )}

            {canCreatePatient ? (
              <button
                type="button"
                onClick={onNewPatient}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 2xl:py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span>Novo Paciente</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Ação restrita pela política de acessos do perfil ativo (Requer permissão de Cadastrar Paciente)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 2xl:py-2 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-500 font-medium text-xs whitespace-nowrap cursor-not-allowed opacity-60"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span>Novo Paciente</span>
              </button>
            )}
          </div>

        </div>

        {/* Barra de Navegação Mobile (Scroll horizontal suave sem quebra) */}
        <div className="flex lg:hidden overflow-x-auto py-1.5 gap-1.5 border-t border-slate-800 no-scrollbar">
          <button
            type="button"
            onClick={() => onNavigate('pacientes')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'pacientes'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-800/80'
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
                : 'text-slate-400 bg-slate-800/80'
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
                : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Prontuários Digitalizados
          </button>
          <button
            type="button"
            onClick={() => onNavigate('financeiro')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'financeiro'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-800/80'
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
                : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            AWS / Java
          </button>
        </div>
      </div>
    </header>
  );
};
