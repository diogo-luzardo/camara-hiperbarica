import React from 'react';
import { Activity, Users, Calendar, FolderArchive, Server, Plus, Download, ShieldCheck, Monitor, Maximize2, Minimize2 } from 'lucide-react';

export type LayoutWidthMode = 'ultrawide' | 'full' | 'compact';

interface NavbarProps {
  activeView: 'pacientes' | 'agendamentos' | 'acervo' | 'arquitetura';
  onNavigate: (view: 'pacientes' | 'agendamentos' | 'acervo' | 'arquitetura') => void;
  onNewPatient: () => void;
  onNewAppointment: () => void;
  onOpenBackup?: () => void;
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
  patientCount,
  sessionCount,
  appointmentCount,
  documentCount,
  layoutMode = 'ultrawide',
  onLayoutModeChange,
}) => {
  const navContainerClass =
    layoutMode === 'full'
      ? 'w-full px-4 sm:px-6 lg:px-8 2xl:px-12'
      : layoutMode === 'compact'
      ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      : 'max-w-[2100px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12';

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
          <span className="hidden md:inline">Rua das Pitombeiras, 175 - Jabaquara, SP</span>

          {/* Seletor de Aproveitamento de Tela / Monitor Grande (visível em tablets e desktops) */}
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

          {onOpenBackup && (
            <button
              onClick={onOpenBackup}
              className="flex items-center gap-1 hover:text-cyan-300 transition-colors text-xs text-slate-300"
              title="Exportar/Importar Backup JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Backup / Dados</span>
            </button>
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
            <button
              onClick={() => onNavigate('pacientes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'pacientes'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pacientes ({patientCount})</span>
            </button>

            <button
              onClick={() => onNavigate('agendamentos')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'agendamentos'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agendamentos</span>
              {appointmentCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeView === 'agendamentos' ? 'bg-slate-950 text-cyan-300' : 'bg-cyan-400/20 text-cyan-300'
                }`}>
                  {appointmentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('pacientes')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sessões & Enfermagem ({sessionCount})</span>
            </button>

            <button
              onClick={() => onNavigate('acervo')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'acervo'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>Prontuários Antigos ({documentCount})</span>
            </button>

            <button
              onClick={() => onNavigate('arquitetura')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'arquitetura'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Arquitetura AWS & Java</span>
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
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeView === 'pacientes' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Pacientes ({patientCount})
          </button>
          <button
            onClick={() => onNavigate('agendamentos')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeView === 'agendamentos' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Agendamentos ({appointmentCount})
          </button>
          <button
            onClick={() => onNavigate('acervo')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeView === 'acervo' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Prontuários Digitalizados
          </button>
          <button
            onClick={() => onNavigate('arquitetura')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeView === 'arquitetura' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            AWS / Java
          </button>
        </div>
      </div>
    </header>
  );
};
