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
  UserCheck,
  Crown,
  Stethoscope,
  FileText,
  Lock,
  Sparkles,
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
  const { user, role, switchRole, logout, isStrictMode } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
      ? 'w-full px-4 sm:px-6 lg:px-8 2xl:px-12'
      : layoutMode === 'compact'
      ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      : 'max-w-[2100px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12';

  const rolePills: { role: UserRole; icon: React.ElementType }[] = [
    { role: 'administrador', icon: Crown },
    { role: 'operacional', icon: Stethoscope },
    { role: 'administrativo', icon: FileText },
    { role: 'financeiro', icon: DollarSign },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top institutional sub-bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-cyan-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Centro Europa de Feridas Refratárias
          </span>
          <span className="text-slate-600">|</span>
          <span>Medicina Hiperbárica Zona Sul</span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline">Dr. Carlos Henrique Esteves (CRM 62.139)</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-slate-400">
          <span className="hidden lg:inline">Rua das Pitombeiras, 175 - Jabaquara, SP</span>

          {/* Seletor de Aproveitamento de Tela / Monitor Grande */}
          {onLayoutModeChange && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-1 hidden xl:inline">Tela:</span>
              <button
                type="button"
                onClick={() => onLayoutModeChange('ultrawide')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  layoutMode === 'ultrawide'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Monitor Grande (Otimizado com até 5-6 colunas)"
              >
                <Monitor className="w-3 h-3" />
                <span className="hidden sm:inline">Monitor Grande</span>
              </button>
              <button
                type="button"
                onClick={() => onLayoutModeChange('full')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  layoutMode === 'full'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo 100% Tela Cheia (Fluido ponta a ponta)"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">100% Fluido</span>
              </button>
              <button
                type="button"
                onClick={() => onLayoutModeChange('compact')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  layoutMode === 'compact'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Compacto Centralizado (1280px)"
              >
                <Minimize2 className="w-3 h-3" />
                <span className="hidden sm:inline">Compacto</span>
              </button>
            </div>
          )}

          {/* Backup Button */}
          {onOpenBackup && (
            <button
              onClick={onOpenBackup}
              className="flex items-center gap-1 hover:text-cyan-300 transition-colors text-xs text-slate-300 cursor-pointer"
              title="Exportar/Importar Backup JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Backup / Dados</span>
            </button>
          )}

          {/* Matriz RBAC Button */}
          {onOpenPermissions && (
            <button
              type="button"
              onClick={onOpenPermissions}
              className="flex items-center gap-1 text-cyan-300 hover:text-white bg-slate-900 border border-cyan-800/80 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer"
              title="Ver Matriz de Permissões RBAC (Quem vê o quê)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Perfis & Acessos</span>
            </button>
          )}

          {/* User Profile Widget & Dropdown */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="flex items-center gap-1.5 max-w-[130px] sm:max-w-[180px] truncate">
                  <span className="font-semibold text-white truncate text-[11px]">{user.name}</span>
                </div>
                <RoleBadge role={role} size="xs" />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Details */}
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-white truncate text-xs">{user.name}</p>
                      </div>
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

      {/* Main Bar */}
      <div className={navContainerClass}>
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('pacientes')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-['Outfit']">
                  CLÍNICA <span className="text-cyan-400">OHB</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-medium">
                  2.4 ATA
                </span>
              </div>
              <p className="text-xs text-slate-400 -mt-0.5">Oxigenoterapia Hiperbárica & Feridas</p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
            {/* 1. Pacientes */}
            <button
              onClick={() => onNavigate('pacientes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'pacientes'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pacientes ({patientCount})</span>
            </button>

            {/* 2. Agendamentos */}
            <button
              onClick={() => onNavigate('agendamentos')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'agendamentos'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agendamentos</span>
              {appointmentCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeView === 'agendamentos' ? 'bg-slate-950 text-cyan-300' : 'bg-cyan-400/20 text-cyan-300'
                  }`}
                >
                  {appointmentCount}
                </span>
              )}
            </button>

            {/* 3. Sessões & Enfermagem (Operacional) */}
            <button
              onClick={() => onNavigate('pacientes')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer"
              title="Atendimentos clínicos e fichas SAE do paciente"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Sessões & Enfermagem ({sessionCount})</span>
            </button>

            {/* 4. Prontuários Antigos Escaneados (Cofre) */}
            <button
              onClick={() => onNavigate('acervo')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'acervo'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>Prontuários Antigos ({documentCount})</span>
            </button>

            {/* 5. Financeiro & Convênios (NOVO MÓDULO PARA O PERFIL FINANCEIRO) */}
            <button
              onClick={() => onNavigate('financeiro')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'financeiro'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <DollarSign className={`w-4 h-4 ${activeView === 'financeiro' ? 'text-slate-950' : 'text-emerald-400'}`} />
              <span>Financeiro & Convênios</span>
            </button>

            {/* 6. Arquitetura AWS & Java (Admin) */}
            <button
              onClick={() => onNavigate('arquitetura')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'arquitetura'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>AWS & Java</span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewAppointment}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold border border-cyan-700/80 transition-colors shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>+ Agendar</span>
            </button>

            <button
              onClick={onNewPatient}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Paciente</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation tab bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-800 no-scrollbar">
          <button
            onClick={() => onNavigate('pacientes')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'pacientes' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Pacientes ({patientCount})
          </button>
          <button
            onClick={() => onNavigate('agendamentos')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'agendamentos' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Agendamentos ({appointmentCount})
          </button>
          <button
            onClick={() => onNavigate('acervo')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'acervo' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Prontuários Digitalizados
          </button>
          <button
            onClick={() => onNavigate('financeiro')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'financeiro' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Financeiro & TISS
          </button>
          <button
            onClick={() => onNavigate('arquitetura')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium cursor-pointer ${
              activeView === 'arquitetura' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            AWS / Java
          </button>
        </div>
      </div>
    </header>
  );
};
