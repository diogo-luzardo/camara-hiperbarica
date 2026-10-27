import React, { useState, useMemo } from 'react';
import { Patient, HyperbaricSession, FinancialBillingItem } from '../types';
import { RoleBadge } from './RoleBadge';
import {
  DollarSign,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  Receipt,
  FileText,
  Clock,
  ShieldAlert,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface FinancialDashboardProps {
  patients: Patient[];
  sessions: HyperbaricSession[];
  onSelectPatient?: (patientId: string) => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  patients,
  sessions,
  onSelectPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConvenio, setSelectedConvenio] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  // Gerar dados de faturamento baseados nas sessões e pacientes reais cadastrados
  const billingItems: FinancialBillingItem[] = useMemo(() => {
    if (sessions.length === 0 && patients.length > 0) {
      // Caso não haja sessões salvas, gerar projeção das sessões previstas dos pacientes
      return patients.map((p, idx) => ({
        id: `bill-${p.id}`,
        patientId: p.id,
        patientName: p.nome,
        registroOHB: p.registroOHB,
        convenio: p.convenio || 'Particular',
        plano: p.plano || 'Standard',
        dataSessao: p.createdAt ? p.createdAt.split('T')[0] : '2026-10-14',
        sessaoNumero: 1,
        codigoTUSS: '20101202',
        descricaoProcedimento: 'Oxigenoterapia Hiperbárica em câmara monopaciente/multipaciente (por sessão)',
        valorSessao: p.convenio === 'Particular' ? 520 : 420,
        statusGuia: idx % 3 === 0 ? 'faturado' : idx % 3 === 1 ? 'autorizado' : 'pago',
        numeroGuia: `GUIA-2026-${1000 + idx}`,
        loteFaturamento: `LOTE-10/26`,
      }));
    }

    return sessions.map((s, idx) => {
      const patient = patients.find((p) => p.id === s.patientId || p.registroOHB === s.registroOHB);
      const isSessionParticular = s.modalidade === 'particular' || (patient?.convenio || '').toLowerCase().includes('particular');
      const convenio = isSessionParticular ? (s.modalidade === 'particular' ? 'Particular (Sessão Avulsa)' : 'Particular') : (patient?.convenio || 'Bradesco Saúde');
      const valorBase = isSessionParticular ? 550 : 420;

      const statuses: ('autorizado' | 'faturado' | 'em_analise' | 'pago' | 'glosado')[] = [
        'faturado',
        'pago',
        'autorizado',
        'em_analise',
      ];
      const statusGuia = statuses[idx % statuses.length];

      return {
        id: `bill-${s.id}`,
        patientId: s.patientId,
        patientName: patient?.nome || 'Paciente ' + s.registroOHB,
        registroOHB: s.registroOHB,
        convenio,
        plano: patient?.plano || 'Nacional Especial',
        dataSessao: s.data,
        sessaoNumero: s.sessionNumber,
        codigoTUSS: '20101202',
        descricaoProcedimento: `Oxigenoterapia Hiperbárica ${s.ata} ATA (${s.duracaoMinutos || 90} min)`,
        valorSessao: valorBase,
        statusGuia,
        numeroGuia: `TISS-${s.registroOHB.replace('OHB-', '')}-${String(s.sessionNumber).padStart(2, '0')}`,
        loteFaturamento: 'LOTE-10/2026',
      };
    });
  }, [sessions, patients]);

  // Lista única de convênios para o filtro
  const conveniosList = useMemo(() => {
    const set = new Set<string>();
    billingItems.forEach((b) => {
      if (b.convenio) set.add(b.convenio);
    });
    return Array.from(set);
  }, [billingItems]);

  // Itens filtrados
  const filteredItems = useMemo(() => {
    return billingItems.filter((item) => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.registroOHB.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numeroGuia.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesConvenio = selectedConvenio === 'todos' || item.convenio === selectedConvenio;
      const matchesStatus = selectedStatus === 'todos' || item.statusGuia === selectedStatus;

      return matchesSearch && matchesConvenio && matchesStatus;
    });
  }, [billingItems, searchTerm, selectedConvenio, selectedStatus]);

  // Totais e KPIs Financeiros
  const kpis = useMemo(() => {
    const totalFaturado = filteredItems.reduce((acc, curr) => acc + curr.valorSessao, 0);
    const totalPago = filteredItems
      .filter((i) => i.statusGuia === 'pago')
      .reduce((acc, curr) => acc + curr.valorSessao, 0);
    const pendentes = filteredItems.filter((i) => i.statusGuia === 'autorizado' || i.statusGuia === 'em_analise').length;
    const glosados = filteredItems.filter((i) => i.statusGuia === 'glosado').length;
    const ticketMedio = filteredItems.length > 0 ? totalFaturado / filteredItems.length : 0;

    return { totalFaturado, totalPago, pendentes, glosados, ticketMedio };
  }, [filteredItems]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: FinancialBillingItem['statusGuia']) => {
    switch (status) {
      case 'pago':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Pago
          </span>
        );
      case 'faturado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <FileCheck2 className="w-3 h-3 text-blue-600" />
            Faturado
          </span>
        );
      case 'autorizado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
            <Clock className="w-3 h-3 text-cyan-600" />
            Autorizado
          </span>
        );
      case 'em_analise':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Em Auditoria
          </span>
        );
      case 'glosado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            Glosado
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = ['Registro OHB', 'Paciente', 'Convênio', 'Data Sessão', 'Sessão', 'Código TUSS', 'Valor', 'Status', 'Guia'];
    const rows = filteredItems.map((item) => [
      item.registroOHB,
      item.patientName,
      item.convenio,
      item.dataSessao,
      item.sessaoNumero,
      item.codigoTUSS,
      item.valorSessao,
      item.statusGuia,
      item.numeroGuia,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `faturamento_ohb_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-600" />
              Módulo Financeiro & Convênios
            </span>
            <RoleBadge role="financeiro" size="xs" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900">
            Faturamento de Sessões & Guias TISS / TUSS
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl">
            Gestão de autorizações de convênios, controle de glosas e faturamento por sessão de oxigenoterapia
            hiperbárica sob código TUSS 20101202.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full sm:w-auto justify-center px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Lote TISS (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Otimizados para mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Faturado */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
              Faturamento
            </span>
            <h3 className="text-lg sm:text-2xl font-bold font-['Outfit'] text-slate-900 truncate">
              {formatCurrency(kpis.totalFaturado)}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
              {filteredItems.length} sessões
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Total Liquidado / Pago */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
              Recebido
            </span>
            <h3 className="text-lg sm:text-2xl font-bold font-['Outfit'] text-emerald-700 truncate">
              {formatCurrency(kpis.totalPago)}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 truncate">
              Liquidado
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Pendentes de Auditoria */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
              Em Análise
            </span>
            <h3 className="text-lg sm:text-2xl font-bold font-['Outfit'] text-amber-600 truncate">
              {kpis.pendentes} guias
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Auditoria</p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
              Ticket Médio
            </span>
            <h3 className="text-lg sm:text-2xl font-bold font-['Outfit'] text-slate-900 truncate">
              {formatCurrency(kpis.ticketMedio)}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Média por sessão</p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <Receipt className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Mobile Responsivo) */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="w-full md:flex-1 md:max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Paciente, Registro OHB ou Nº de Guia..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs w-full md:w-auto">
          {/* Convênio Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 sm:py-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-semibold shrink-0">Convênio:</span>
            <select
              value={selectedConvenio}
              onChange={(e) => setSelectedConvenio(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos ({conveniosList.length})</option>
              {conveniosList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 sm:py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-semibold shrink-0">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="pago">Pago</option>
              <option value="faturado">Faturado</option>
              <option value="autorizado">Autorizado</option>
              <option value="em_analise">Em Auditoria</option>
              <option value="glosado">Glosado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Billing Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile View: Cards para Celulares (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-slate-400 p-4">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-medium text-xs">Nenhum faturamento encontrado.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {onSelectPatient ? (
                      <button
                        type="button"
                        onClick={() => onSelectPatient(item.patientId)}
                        className="font-bold text-slate-900 text-sm hover:text-cyan-800 text-left flex items-center gap-1 group transition-colors"
                      >
                        <span className="group-hover:underline truncate">Paciente: {item.patientName}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      </button>
                    ) : (
                      <span className="font-bold text-slate-900 text-sm truncate block">Paciente: {item.patientName}</span>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                      <span className="font-bold text-cyan-800 bg-cyan-100/60 px-1.5 py-0.5 rounded">
                        {item.registroOHB}
                      </span>
                      <span className="text-slate-500 truncate">{item.convenio}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 text-sm block font-mono">
                      {formatCurrency(item.valorSessao)}
                    </span>
                    <div className="mt-1">{getStatusBadge(item.statusGuia)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Sessão / Procedimento</span>
                    <span className="font-semibold text-slate-800">Sessão #{item.sessaoNumero} • TUSS {item.codigoTUSS}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Nº da Guia</span>
                    <span className="font-mono font-bold text-slate-700 text-[11px]">{item.numeroGuia}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Tabela Completa (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Paciente & Registro OHB</th>
                <th className="py-3.5 px-3">Convênio & Plano</th>
                <th className="py-3.5 px-3">Data / Sessão</th>
                <th className="py-3.5 px-3">Código TUSS & Procedimento</th>
                <th className="py-3.5 px-3 text-right">Valor da Sessão</th>
                <th className="py-3.5 px-3 text-center">Status da Guia</th>
                <th className="py-3.5 px-4 text-right">Nº da Guia / Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Nenhum faturamento encontrado para os filtros selecionados.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      {onSelectPatient ? (
                        <button
                          type="button"
                          onClick={() => onSelectPatient(item.patientId)}
                          className="font-bold text-slate-900 hover:text-cyan-800 hover:bg-cyan-100/70 px-2 py-0.5 -mx-2 rounded-lg text-left flex items-center gap-1 group transition-all cursor-pointer"
                          title={`Abrir prontuário completo de ${item.patientName}`}
                        >
                          <span className="group-hover:underline decoration-cyan-400 decoration-2 underline-offset-2">{item.patientName}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-cyan-600 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      ) : (
                        <div className="font-bold text-slate-900">{item.patientName}</div>
                      )}
                      <div className="text-[11px] font-mono text-cyan-700 font-bold">{item.registroOHB}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{item.convenio}</div>
                      <div className="text-[11px] text-slate-500">{item.plano}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800">{item.dataSessao}</div>
                      <div className="text-[11px] font-semibold text-slate-500">Sessão #{item.sessaoNumero}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        TUSS {item.codigoTUSS}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{item.descricaoProcedimento}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-slate-900 text-sm">
                        {formatCurrency(item.valorSessao)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(item.statusGuia)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono text-xs font-semibold text-slate-700">{item.numeroGuia}</div>
                      {onSelectPatient && (
                        <button
                          type="button"
                          onClick={() => onSelectPatient(item.patientId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 hover:border-cyan-400 text-cyan-800 text-[11px] font-bold shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer mt-1"
                        >
                          <span>Ver Prontuário</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Total de {filteredItems.length} guias listadas • Faturamento padrão ANS / DMED</span>
          </div>
          <span className="font-bold text-slate-800">
            Soma: {formatCurrency(kpis.totalFaturado)}
          </span>
        </div>
      </div>
    </div>
  );
};
