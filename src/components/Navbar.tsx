import React from 'react';
import { Activity, Users, Calendar, FolderArchive, Server, Plus, Download, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: 'patients' | 'appointments' | 'sessions' | 'digitalVault' | 'architecture';
  setCurrentTab: (tab: 'patients' | 'appointments' | 'sessions' | 'digitalVault' | 'architecture') => void;
  onNewPatient: () => void;
  onNewAppointment: () => void;
  onOpenBackup: () => void;
  patientCount: number;
  upcomingCount: number;
  docCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onNewPatient,
  onNewAppointment,
  onOpenBackup,
  patientCount,
  upcomingCount,
  docCount,
}) => {
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
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden md:inline">Rua das Pitombeiras, 175 - Jabaquara, SP</span>
          <button
            onClick={onOpenBackup}
            className="flex items-center gap-1 hover:text-cyan-300 transition-colors text-xs text-slate-300"
            title="Exportar/Importar Backup JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Backup / Dados</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('patients')}>
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
              onClick={() => setCurrentTab('patients')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'patients'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pacientes ({patientCount})</span>
            </button>

            <button
              onClick={() => setCurrentTab('appointments')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'appointments'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agendamentos</span>
              {upcomingCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  currentTab === 'appointments' ? 'bg-slate-950 text-cyan-300' : 'bg-cyan-400/20 text-cyan-300'
                }`}>
                  {upcomingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('sessions')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'sessions'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sessões & Enfermagem</span>
            </button>

            <button
              onClick={() => setCurrentTab('digitalVault')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'digitalVault'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>Prontuários Antigos ({docCount})</span>
            </button>

            <button
              onClick={() => setCurrentTab('architecture')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'architecture'
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ Agendar</span>
            </button>

            <button
              onClick={onNewPatient}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Paciente</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation tab bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-800 no-scrollbar">
          <button
            onClick={() => setCurrentTab('patients')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              currentTab === 'patients' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Pacientes ({patientCount})
          </button>
          <button
            onClick={() => setCurrentTab('appointments')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              currentTab === 'appointments' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Agendamentos ({upcomingCount})
          </button>
          <button
            onClick={() => setCurrentTab('sessions')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              currentTab === 'sessions' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Sessões OHB
          </button>
          <button
            onClick={() => setCurrentTab('digitalVault')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              currentTab === 'digitalVault' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            Prontuários Digitalizados
          </button>
          <button
            onClick={() => setCurrentTab('architecture')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              currentTab === 'architecture' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 bg-slate-800/80'
            }`}
          >
            AWS / Java
          </button>
        </div>
      </div>
    </header>
  );
};
