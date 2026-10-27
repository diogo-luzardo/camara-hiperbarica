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
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Patient, HyperbaricSession, Appointment } from '../types';
import { CoverageBadge } from './CoverageBadge';

// Normaliza texto removendo acentos e convertendo para minúsculas (ex: "Antônio" -> "antonio")
function normalizeText(str?: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

interface PatientListProps {
  patients: Patient[];
  sessions: HyperbaricSession[];
  appointments: Appointment[];
  onSelectPatient: (patientId: string) => void;
  onNewPatient: () => void;
  onNewPatientWithScanner?: () => void;
  onNewSession: (patient: Patient) => void;
  onOpenCidLookup?: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  sessions,
  appointments,
  onSelectPatient,
  onNewPatient,
  onNewPatientWithScanner,
  onNewSession,
  onOpenCidLookup,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'em_tratamento' | 'alta'>('todos');
  const [selectedConvenio, setSelectedConvenio] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const listTopRef = useRef<HTMLDivElement>(null);

  const { hasPermission } = useAuth();
  const canCreatePatient = hasPermission('patients:create');
  const canCreateSession = hasPermission('sessions:create');

  // Extrair lista única de convênios presentes
  const conveniosList = useMemo(() => {
    const set = new Set<string>();
    patients.forEach((p) => {
      if (p.convenio) set.add(p.convenio);
    });
    return Array.from(set).sort();
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const rawSearch = searchTerm.trim();
    const normalizedTerm = normalizeText(rawSearch);
    const rawDigits = rawSearch.replace(/\D/g, '');

    return patients.filter((patient) => {
      // 1. Filtro da Aba de Status (Todos / Em Tratamento / Alta Clínica)
      const patientSessions = sessions.filter((s) => s.patientId === patient.id);
      const isCompleted = patientSessions.length >= (patient.numeroTratamentosPrevisto || 20);

      if (selectedFilter === 'em_tratamento' && isCompleted) return false;
      if (selectedFilter === 'alta' && !isCompleted) return false;

      // 2. Filtro por Convênio
      if (selectedConvenio === 'Particular') {
        if (!patient.convenio.toLowerCase().includes('particular')) return false;
      } else if (selectedConvenio !== 'todos') {
        if (patient.convenio !== selectedConvenio) return false;
      }

      // 3. Se a busca estiver vazia, passa direto
      if (!rawSearch) return true;

      // 4. Busca por Dígitos de Documentos (CPF, RG, Registro OHB, Registro Hospitalar, Telefone, CEP)
      let matchDoc = false;
      if (rawDigits.length > 0) {
        const rawCpf = (patient.cpf || '').replace(/\D/g, '');
        const rawRg = (patient.rg || '').replace(/\D/g, '');
        const rawOhb = (patient.registroOHB || '').replace(/\D/g, '');
        const rawRh = (patient.registroHospitalar || '').replace(/\D/g, '');
        const rawTel = (patient.telefonesFixos || '').replace(/\D/g, '');
        const rawCel = (patient.celular || '').replace(/\D/g, '');
        const rawCep = (patient.cep || '').replace(/\D/g, '');
        const rawMatricula = (patient.matriculaConvenio || '').replace(/\D/g, '');

        matchDoc =
          rawCpf.includes(rawDigits) ||
          rawRg.includes(rawDigits) ||
          rawOhb.includes(rawDigits) ||
          rawRh.includes(rawDigits) ||
          rawTel.includes(rawDigits) ||
          rawCel.includes(rawDigits) ||
          rawCep.includes(rawDigits) ||
          rawMatricula.includes(rawDigits);
      }

      // 5. Busca Textual Insensível a Acentos e Maiúsculas (LIKE '%termo%')
      const matchText =
        normalizeText(patient.nome).includes(normalizedTerm) ||
        normalizeText(patient.registroOHB).includes(normalizedTerm) ||
        normalizeText(patient.registroHospitalar).includes(normalizedTerm) ||
        normalizeText(patient.cpf).includes(normalizedTerm) ||
        normalizeText(patient.rg).includes(normalizedTerm) ||
        normalizeText(patient.diagnostico).includes(normalizedTerm) ||
        normalizeText(patient.cid10).includes(normalizedTerm) ||
        (patient.cid11 ? normalizeText(patient.cid11).includes(normalizedTerm) : false) ||
        normalizeText(patient.convenio).includes(normalizedTerm) ||
        normalizeText(patient.plano).includes(normalizedTerm) ||
        normalizeText(patient.endereco).includes(normalizedTerm) ||
        normalizeText(patient.bairro).includes(normalizedTerm) ||
        normalizeText(patient.municipio).includes(normalizedTerm) ||
        normalizeText(patient.medicoIndicou).includes(normalizedTerm) ||
        normalizeText(patient.profissao).includes(normalizedTerm);

      return matchDoc || matchText;
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
      {/* Overview Cards (Otimizados para toque e telas menores) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 2xl:gap-5">
        <div className="bg-white rounded-xl p-2.5 sm:p-4 2xl:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">Pacientes Ativos</p>
            <p className="text-lg sm:text-2xl 2xl:text-3xl font-bold font-mono text-slate-900 mt-0.5 sm:mt-1">{patients.length}</p>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-emerald-600 font-medium truncate block">Em protocolo</span>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Activity className="w-3.5 h-3.5 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-2.5 sm:p-4 2xl:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">Sessões OHB</p>
            <p className="text-lg sm:text-2xl 2xl:text-3xl font-bold font-mono text-slate-900 mt-0.5 sm:mt-1">{sessions.length}</p>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-cyan-600 font-medium truncate block">ATA Obrigatória</span>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <HeartPulse className="w-3.5 h-3.5 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-2.5 sm:p-4 2xl:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">Agendamentos</p>
            <p className="text-lg sm:text-2xl 2xl:text-3xl font-bold font-mono text-slate-900 mt-0.5 sm:mt-1">{appointments.length}</p>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-purple-600 font-medium truncate block">Sync Celular</span>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-2.5 sm:p-4 2xl:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">Segurança da Câmara</p>
            <p className="text-lg sm:text-2xl 2xl:text-3xl font-bold text-slate-900 mt-0.5 sm:mt-1">100%</p>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-emerald-600 font-medium truncate block">Checklist SAE</span>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Action (Totalmente fluido para mobile) */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:flex-1 sm:max-w-lg 2xl:max-w-2xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por Registro OHB, Nome, CPF, CID-10..."
            className="w-full text-xs pl-9 pr-9 py-2.5 rounded-xl border-2 border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-2xs outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/80 transition-colors cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Filtro por Convênio */}
          <select
            value={selectedConvenio}
            onChange={(e) => setSelectedConvenio(e.target.value)}
            className="w-full sm:w-auto text-xs px-3 py-2 rounded-xl border-2 border-slate-200 hover:border-cyan-400 focus:border-cyan-500 bg-white text-slate-800 font-bold focus:ring-4 focus:ring-cyan-500/10 cursor-pointer shadow-2xs transition-all outline-none"
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
          <div className="grid grid-cols-3 sm:flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold gap-1">
            <button
              onClick={() => setSelectedFilter('todos')}
              className={`py-1.5 px-2 sm:px-3 rounded-lg text-center transition-all duration-150 cursor-pointer text-[11px] sm:text-xs ${
                selectedFilter === 'todos'
                  ? 'bg-white text-cyan-950 shadow-xs font-extrabold ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Todos ({patients.length})
            </button>
            <button
              onClick={() => setSelectedFilter('em_tratamento')}
              className={`py-1.5 px-2 sm:px-3 rounded-lg text-center transition-all duration-150 cursor-pointer text-[11px] sm:text-xs ${
                selectedFilter === 'em_tratamento'
                  ? 'bg-white text-cyan-950 shadow-xs font-extrabold ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Em Trat. ({emTratamentoCount})
            </button>
            <button
              onClick={() => setSelectedFilter('alta')}
              className={`py-1.5 px-2 sm:px-3 rounded-lg text-center transition-all duration-150 cursor-pointer text-[11px] sm:text-xs ${
                selectedFilter === 'alta'
                  ? 'bg-white text-cyan-950 shadow-xs font-extrabold ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Alta ({altaCount})
            </button>
          </div>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[2200px]:grid-cols-6 gap-4 2xl:gap-5">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">Nenhum paciente encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Verifique o termo digitado ou cadastre um novo paciente.</p>
            {canCreatePatient && (
              <button
                type="button"
                onClick={onNewPatient}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar Paciente</span>
              </button>
            )}
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
                className="bg-white rounded-2xl border-2 border-slate-200/80 hover:border-cyan-400 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Registro OHB and Convenio */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500 text-slate-950">
                      {patient.registroOHB}
                    </span>
                    <CoverageBadge convenio={patient.convenio} plano={patient.plano} size="xs" />
                  </div>

                  {/* Patient Name & Details with High-Visibility Interactive Hover */}
                  <div
                    onClick={() => onSelectPatient(patient.id)}
                    className="group/name -mx-2 px-2.5 py-1.5 rounded-xl hover:bg-cyan-50 border border-transparent hover:border-cyan-200 transition-all duration-150 cursor-pointer flex items-center justify-between shadow-none hover:shadow-xs mt-1"
                    title={`Abrir prontuário completo de ${patient.nome}`}
                  >
                    <h3 className="font-bold text-slate-900 text-base group-hover/name:text-cyan-800 transition-colors flex items-center gap-1.5">
                      <span>{patient.nome}</span>
                    </h3>
                    <span className="w-6 h-6 rounded-lg bg-slate-100 group-hover/name:bg-cyan-500 group-hover/name:text-white flex items-center justify-center text-slate-400 transition-all shrink-0 shadow-2xs group-hover/name:scale-110">
                      <ChevronRight className="w-4 h-4 transition-transform group-hover/name:translate-x-0.5" />
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>{patient.idade} anos</span>
                    <span>•</span>
                    <span>CPF: <strong className="font-mono text-slate-700">{patient.cpf}</strong></span>
                  </div>

                  {/* Diagnostico & CID-10 */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5 font-medium">
                      <span>DIAGNÓSTICO & CID</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold">
                        {patient.cid11 && (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] border border-emerald-200">
                            {patient.cid11}
                          </span>
                        )}
                        <span className="text-cyan-800">{patient.cid10}</span>
                      </div>
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
                    {canCreateSession && (
                      <button
                        onClick={() => onNewSession(patient)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-cyan-400 bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 font-bold text-xs flex items-center gap-1 shadow-2xs hover:shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        title="Registrar Sessão OHB"
                      >
                        <HeartPulse className="w-3.5 h-3.5 text-cyan-600" />
                        <span>+ Sessão</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-2xs hover:shadow-md hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Prontuário</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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

          {/* Botões de Navegação Numerados (Desktop & Mobile) */}
          {totalPages > 1 && (
            <>
              {/* Versão Compacta para Mobile (< sm) */}
              <div className="flex sm:hidden items-center justify-between w-full pt-2 border-t border-slate-100 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-cyan-50 text-slate-700 font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-cyan-50 text-slate-700 font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Versão Completa para Desktop (>= sm) */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border-2 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/60 hover:text-cyan-800 text-slate-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                  title="Primeira página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border-2 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/60 hover:text-cyan-800 text-slate-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
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
                        className={`min-w-[34px] h-8 px-2 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer ${
                          currentPage === p
                            ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/25 font-black scale-105 border-2 border-cyan-400'
                            : 'border-2 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/60 text-slate-700 hover:scale-105 shadow-2xs'
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
                  className="p-2 rounded-xl border-2 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/60 hover:text-cyan-800 text-slate-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                  title="Próxima página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border-2 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/60 hover:text-cyan-800 text-slate-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                  title="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
