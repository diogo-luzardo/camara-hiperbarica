import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  UserPlus,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Activity,
  Calendar,
  ShieldCheck,
  HeartPulse,
  Stethoscope,
  AlertCircle,
} from 'lucide-react';
import { Patient, HyperbaricSession, Appointment } from '../types';
import { CoverageBadge } from './CoverageBadge';

interface PatientListProps {
  patients: Patient[];
  sessions: HyperbaricSession[];
  appointments: Appointment[];
  onSelectPatient: (patientId: string) => void;
  onNewPatient: () => void;
  onNewSession: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  sessions,
  appointments,
  onSelectPatient,
  onNewPatient,
  onNewSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'em_tratamento' | 'alta'>('todos');
  const [selectedConvenio, setSelectedConvenio] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Extrair lista única de convênios presentes
  const conveniosList = useMemo(() => {
    const set = new Set<string>();
    patients.forEach((p) => {
      if (p.convenio) set.add(p.convenio);
    });
    return Array.from(set).sort();
  }, [patients]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const cleanSearch = searchTerm.toLowerCase().trim();
      const matchSearch =
        !cleanSearch ||
        patient.nome.toLowerCase().includes(cleanSearch) ||
        patient.registroOHB.toLowerCase().includes(cleanSearch) ||
        patient.cpf.replace(/\D/g, '').includes(cleanSearch.replace(/\D/g, '')) ||
        patient.diagnostico.toLowerCase().includes(cleanSearch) ||
        patient.cid10.toLowerCase().includes(cleanSearch) ||
        (patient.endereco && patient.endereco.toLowerCase().includes(cleanSearch)) ||
        (patient.bairro && patient.bairro.toLowerCase().includes(cleanSearch)) ||
        (patient.convenio && patient.convenio.toLowerCase().includes(cleanSearch));

      const matchConvenio =
        selectedConvenio === 'todos' ||
        (selectedConvenio === 'Particular'
          ? patient.convenio.toLowerCase().includes('particular')
          : patient.convenio === selectedConvenio);

      const patientSessions = sessions.filter((s) => s.patientId === patient.id);
      const isCompleted = patientSessions.length >= patient.numeroTratamentosPrevisto;

      if (!matchSearch || !matchConvenio) return false;

      if (selectedFilter === 'em_tratamento') return !isCompleted;
      if (selectedFilter === 'alta') return isCompleted;
      return true;
    });
  }, [patients, sessions, searchTerm, selectedConvenio, selectedFilter]);

  // Sempre que os filtros ou termos mudam, reseta para a página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter, selectedConvenio, pageSize]);

  const totalItems = filteredPatients.length;
  const effectivePageSize = pageSize >= 999 ? totalItems || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));

  // Ajusta se a página atual ultrapassar totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = Math.min(startIndex + effectivePageSize, totalItems);

  const paginatedPatients = useMemo(() => {
    if (pageSize >= 999) return filteredPatients;
    return filteredPatients.slice(startIndex, endIndex);
  }, [filteredPatients, startIndex, endIndex, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (listTopRef.current) {
        listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const emTratamentoCount = patients.filter((p) => {
    const sCount = sessions.filter((s) => s.patientId === p.id).length;
    return sCount < p.numeroTratamentosPrevisto;
  }).length;

  const altaCount = patients.filter((p) => {
    const sCount = sessions.filter((s) => s.patientId === p.id).length;
    return sCount >= p.numeroTratamentosPrevisto;
  }).length;

  return (
    <div ref={listTopRef} className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 2xl:gap-5">
        <div className="bg-white rounded-xl p-3 sm:p-4 2xl:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500">Pacientes Ativos</p>
            <p className="text-xl sm:text-2xl 2xl:text-3xl font-bold font-mono text-slate-900 mt-0.5 sm:mt-1">{patients.length}</p>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-emerald-600 font-medium">Em protocolo de OHB</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 2xl:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500">Sessões Realizadas</p>
            <p className="text-xl sm:text-2xl 2xl:text-3xl font-bold font-mono text-slate-900 mt-0.5 sm:mt-1">{sessions.length}</p>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-cyan-600 font-medium">Pressão 2.4 ATA padrão</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 2xl:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500">Agendamentos Ativos</p>
            <p className="text-xl sm:text-2xl 2xl:text-3xl font-bold font-mono text-slate-900 mt-0.5 sm:mt-1">{appointments.length}</p>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-purple-600 font-medium">Sincronizados com celular</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 2xl:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500">Segurança da Câmara</p>
            <p className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-slate-900 mt-0.5 sm:mt-1">100%</p>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-emerald-600 font-medium">Checklist SAE ativo</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Action */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px] max-w-lg 2xl:max-w-2xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por Registro OHB, CPF, Nome, CID-10, Rua ou Bairro..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Convênio */}
          <select
            value={selectedConvenio}
            onChange={(e) => setSelectedConvenio(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
          >
            <option value="todos">Todos os Convênios</option>
            <option value="Particular">Particular (Sessões / Consultas)</option>
            {conveniosList
              .filter((c) => !c.toLowerCase().includes('particular'))
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          {/* Abas de Status */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setSelectedFilter('todos')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedFilter === 'todos' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({patients.length})
            </button>
            <button
              onClick={() => setSelectedFilter('em_tratamento')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedFilter === 'em_tratamento' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Em Tratamento ({emTratamentoCount})
            </button>
            <button
              onClick={() => setSelectedFilter('alta')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedFilter === 'alta' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alta Clínica ({altaCount})
            </button>
          </div>

          <button
            onClick={onNewPatient}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Paciente</span>
          </button>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[2200px]:grid-cols-6 gap-4 2xl:gap-5">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">Nenhum paciente encontrado</h3>
            <p className="text-xs text-slate-500 mt-1">Verifique o termo digitado ou cadastre um novo prontuário.</p>
          </div>
        ) : (
          paginatedPatients.map((patient) => {
            const patientSessions = sessions.filter((s) => s.patientId === patient.id);
            const completedCount = patientSessions.length;
            const progressPercent = Math.min(
              Math.round((completedCount / (patient.numeroTratamentosPrevisto || 20)) * 100),
              100
            );
            const patientAppointments = appointments.filter((a) => a.patientId === patient.id);

            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Registro OHB and Convenio */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500 text-slate-950">
                      {patient.registroOHB}
                    </span>
                    <CoverageBadge convenio={patient.convenio} plano={patient.plano} size="xs" />
                  </div>

                  {/* Patient Name & Details */}
                  <h3
                    onClick={() => onSelectPatient(patient.id)}
                    className="font-bold text-slate-900 text-base group-hover:text-cyan-700 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>{patient.nome}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>{patient.idade} anos</span>
                    <span>•</span>
                    <span>CPF: <strong className="font-mono text-slate-700">{patient.cpf}</strong></span>
                  </div>

                  {/* Diagnostico & CID-10 */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5 font-medium">
                      <span>DIAGNÓSTICO & CID</span>
                      <span className="font-mono font-bold text-cyan-800">{patient.cid10}</span>
                    </div>
                    <p className="font-medium text-slate-800 line-clamp-2">{patient.diagnostico}</p>
                  </div>

                  {/* Alergias Warning if any */}
                  {patient.alergias && !patient.alergias.toLowerCase().includes('nega') && (
                    <div className="mt-2 text-[11px] text-rose-700 font-semibold flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Alergia: {patient.alergias}</span>
                    </div>
                  )}

                  {/* Treatment Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Evolução do Ciclo:</span>
                      <span className="font-bold font-mono text-slate-900">
                        {completedCount} / {patient.numeroTratamentosPrevisto} sessões ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {patientAppointments.length > 0
                      ? `Próx: ${patientAppointments[0].data.split('-').reverse().join('/')}`
                      : 'Sem agendamento'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onNewSession(patient)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1 transition-colors"
                      title="Registrar Sessão OHB"
                    >
                      <HeartPulse className="w-3.5 h-3.5 text-cyan-600" />
                      <span>+ Sessão</span>
                    </button>
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
                    >
                      Prontuário
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {filteredPatients.length > 0 && (
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Informações da página e Seletor de Tamanho */}
          <div className="flex flex-wrap items-center gap-3 text-slate-600 w-full md:w-auto justify-between md:justify-start">
            <span>
              Mostrando <strong className="font-mono text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</strong> a{' '}
              <strong className="font-mono text-slate-900">{endIndex}</strong> de{' '}
              <strong className="font-mono text-slate-900">{totalItems}</strong> pacientes
              {totalItems !== patients.length && (
                <span className="text-slate-400 ml-1">(filtrados do total de {patients.length})</span>
              )}
            </span>

            <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-slate-200">
              <span className="text-slate-500 font-medium">Exibir:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-cyan-500 focus:bg-white cursor-pointer"
              >
                <option value={12}>12 por pág</option>
                <option value={24}>24 por pág</option>
                <option value={48}>48 por pág</option>
                <option value={999}>Todos ({filteredPatients.length})</option>
              </select>
            </div>
          </div>

          {/* Botões de Navegação Numerados */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Primeira página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {getPageNumbers().map((p, idx) =>
                  typeof p === 'number' ? (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-[34px] h-8 px-2 rounded-lg font-mono font-bold text-xs transition-all ${
                        currentPage === p
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={idx} className="px-1.5 text-slate-400 font-bold">
                      ...
                    </span>
                  )
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
