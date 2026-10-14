import React, { useState } from 'react';
import { Calendar, Clock, Download, ExternalLink, MessageSquare, Plus, CheckCircle, Search, Filter, Printer, AlertCircle, Sparkles, User, ChevronRight, Lock } from 'lucide-react';
import { Appointment, Patient } from '../types';
import { downloadIcsAppointment, getGoogleCalendarUrl, getWhatsAppReminderUrl } from '../utils/calendarExport';
import { CoverageBadge, isParticular } from './CoverageBadge';

interface AppointmentManagerProps {
  appointments: Appointment[];
  patients: Patient[];
  onSaveAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onSelectPatient: (patientId: string) => void;
  onPrintAppointmentSheet: (patientName: string, appointments: Appointment[]) => void;
  autoOpenNewModal?: boolean;
  onCloseAutoOpenModal?: () => void;
}

const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export const AppointmentManager: React.FC<AppointmentManagerProps> = ({
  appointments,
  patients,
  onSaveAppointment,
  onDeleteAppointment,
  onSelectPatient,
  onPrintAppointmentSheet,
  autoOpenNewModal,
  onCloseAutoOpenModal,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'todos' | 'hoje' | 'semana'>('semana');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  React.useEffect(() => {
    if (autoOpenNewModal) {
      setIsModalOpen(true);
      if (onCloseAutoOpenModal) {
        onCloseAutoOpenModal();
      }
    }
  }, [autoOpenNewModal, onCloseAutoOpenModal]);

  // Single Appointment Form State
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('08:30');
  const [sessaoNumero, setSessaoNumero] = useState(1);
  const [pressaoATA, setPressaoATA] = useState(2.4);
  const [observacoes, setObservacoes] = useState('');

  // Batch Form State (Pacote de Sessões OHB)
  const [batchPatientId, setBatchPatientId] = useState(patients[0]?.id || '');
  const [batchCount, setBatchCount] = useState(10);
  const [batchStartDate, setBatchStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchTime, setBatchTime] = useState('08:30');
  const [batchDays, setBatchDays] = useState<number[]>([1, 2, 3, 4, 5]); // Seg a Sex

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const batchPatient = patients.find((p) => p.id === batchPatientId);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredAppointments = appointments.filter((app) => {
    const matchSearch =
      app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.registroOHB.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cpf.includes(searchTerm);

    if (!matchSearch) return false;

    if (filterPeriod === 'hoje') {
      return app.data === todayStr;
    }
    if (filterPeriod === 'semana') {
      const appDate = new Date(app.data);
      const today = new Date(todayStr);
      const diffDays = (appDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    return true;
  }).sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`));

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    const dateObj = new Date(data + 'T00:00:00');
    const diaSemana = DIAS_SEMANA[dateObj.getDay()];

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.nome,
      registroOHB: patient.registroOHB,
      cpf: patient.cpf,
      convenio: patient.convenio,
      modalidade: isParticular(patient.convenio) ? 'particular' : 'convenio',
      duracaoMinutos: 150,
      data,
      horario,
      diaSemana,
      sessaoNumero: Number(sessaoNumero),
      pressaoATA: Number(pressaoATA),
      status: 'confirmado',
      observacoes: observacoes || `Sessão OHB a ${pressaoATA} ATA`,
      telefonePaciente: patient.celular || patient.telefonesFixos,
    };

    onSaveAppointment(newApp);
    setIsModalOpen(false);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === batchPatientId);
    if (!patient) return;

    let currentDate = new Date(batchStartDate + 'T00:00:00');
    let created = 0;
    let currentSessionNum = 1;

    // Buscar última sessão existente para continuar
    const patientApps = appointments.filter((a) => a.patientId === patient.id);
    if (patientApps.length > 0) {
      const maxNum = Math.max(...patientApps.map((a) => a.sessaoNumero));
      currentSessionNum = maxNum + 1;
    }

    while (created < batchCount) {
      const dayOfWeek = currentDate.getDay();
      if (batchDays.includes(dayOfWeek)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const newApp: Appointment = {
          id: `app-${Date.now()}-${created}`,
          patientId: patient.id,
          patientName: patient.nome,
          registroOHB: patient.registroOHB,
          cpf: patient.cpf,
          convenio: patient.convenio,
          modalidade: isParticular(patient.convenio) ? 'particular' : 'convenio',
          duracaoMinutos: 150,
          data: dateStr,
          horario: batchTime,
          diaSemana: DIAS_SEMANA[dayOfWeek],
          sessaoNumero: currentSessionNum + created,
          pressaoATA: 2.4,
          status: 'agendado',
          observacoes: `Pacote de sessões diárias OHB (Sessão ${currentSessionNum + created})`,
          telefonePaciente: patient.celular || patient.telefonesFixos,
        };
        onSaveAppointment(newApp);
        created++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setIsBatchModalOpen(false);
  };

  const handleStatusToggle = (app: Appointment) => {
    const nextStatus =
      app.status === 'agendado'
        ? 'confirmado'
        : app.status === 'confirmado'
        ? 'realizado'
        : app.status === 'realizado'
        ? 'agendado'
        : 'agendado';
    onSaveAppointment({ ...app, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
              Controle de Agendamentos OHB
            </span>
            <span className="text-xs text-slate-500">• Sincronização direta com Agenda do Celular</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900">
            Grade de Sessões & Alertas Automáticos
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl">
            Inspirada na Ficha de Agendamento da Medicina Hiperbárica Zona Sul. Exporte compromissos direto para o iPhone/Android (.ics), adicione ao Google Agenda e envie lembretes formatados via WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>+ Pacote de Sessões</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md 2xl:max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Paciente, Registro OHB ou CPF..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setFilterPeriod('hoje')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterPeriod === 'hoje' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setFilterPeriod('semana')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterPeriod === 'semana' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Próximos 7 dias
            </button>
            <button
              onClick={() => setFilterPeriod('todos')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterPeriod === 'todos' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Todos ({appointments.length})
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile View: Cards para Celulares (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredAppointments.length === 0 ? (
            <div className="py-10 text-center text-slate-400 p-4">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-medium text-xs">Nenhum agendamento encontrado.</p>
            </div>
          ) : (
            filteredAppointments.map((app) => {
              const isToday = app.data === todayStr;
              return (
                <div key={app.id} className={`p-4 space-y-3 ${isToday ? 'bg-cyan-50/30' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectPatient(app.patientId)}
                          className="font-bold text-slate-900 text-sm hover:text-cyan-700 text-left flex items-center gap-1 group"
                        >
                          <span>{app.patientName}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <CoverageBadge convenio={app.convenio || patients.find(p => p.id === app.patientId)?.convenio} size="xs" />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                        <span className="font-bold text-cyan-800 bg-cyan-100/60 px-1.5 py-0.5 rounded">
                          {app.registroOHB}
                        </span>
                        <span>Sessão #{app.sessaoNumero} ({app.pressaoATA} ATA • 150m)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStatusToggle(app)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 cursor-pointer ${
                        app.status === 'confirmado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'realizado'
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                      title="Toque para alternar status"
                    >
                      {app.status === 'confirmado' ? 'Confirmado' : app.status === 'realizado' ? 'Realizado' : 'Agendado'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{app.data.split('-').reverse().join('/')} ({app.diaSemana})</span>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          HOJE
                        </span>
                      )}
                    </div>
                    <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {app.horario}
                    </span>
                  </div>

                  {/* Mobile Actions: Touch-friendly */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => downloadIcsAppointment(app)}
                      className="py-2 px-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
                      title="Salvar na Agenda do Celular"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Celular</span>
                    </button>

                    <a
                      href={getWhatsAppReminderUrl(app)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={getGoogleCalendarUrl(app)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Tabela Completa (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Paciente & Registro OHB</th>
                <th className="py-3.5 px-3">Data | Mês</th>
                <th className="py-3.5 px-3">Dia da Semana</th>
                <th className="py-3.5 px-3">Horário</th>
                <th className="py-3.5 px-3">Sessão & ATA</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Ações no Celular & Prontuário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Nenhum agendamento encontrado para o filtro atual.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Clique em "+ Novo Agendamento" ou crie um pacote de sessões recorrentes.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => {
                  const isToday = app.data === todayStr;
                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-cyan-50/40 transition-colors ${
                        isToday ? 'bg-cyan-50/20' : ''
                      }`}
                    >
                      {/* Patient & OHB */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectPatient(app.patientId)}
                            className="font-bold text-slate-900 hover:text-cyan-700 text-xs flex items-center gap-1 group text-left"
                          >
                            <span>{app.patientName}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <CoverageBadge convenio={app.convenio || patients.find(p => p.id === app.patientId)?.convenio} size="xs" />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                          <span className="font-bold text-cyan-800 bg-cyan-100/60 px-1.5 py-0.2 rounded">
                            {app.registroOHB}
                          </span>
                          <span>CPF: {app.cpf}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{app.data.split('-').reverse().join('/')}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              HOJE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Day of Week */}
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {app.diaSemana}
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Clock className="w-3 h-3 text-cyan-600" />
                          {app.horario}
                        </span>
                      </td>

                      {/* Session number & ATA */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">
                          Sessão #{app.sessaoNumero}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <span>{app.pressaoATA} ATA</span>
                          <span>•</span>
                          <span className="text-amber-800 font-semibold bg-amber-50 px-1 rounded">150m</span>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleStatusToggle(app)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            app.status === 'confirmado'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : app.status === 'realizado'
                              ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title="Clique para alternar status (Agendado -> Confirmado -> Realizado)"
                        >
                          {app.status === 'confirmado' ? 'Confirmado' : app.status === 'realizado' ? 'Realizado' : 'Agendado'}
                        </button>
                      </td>

                      {/* Action buttons (ICS, Google Calendar, WhatsApp, Prontuário) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Salvar na Agenda do Celular (.ics) */}
                          <button
                            onClick={() => downloadIcsAppointment(app)}
                            className="p-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Salvar na Agenda do Celular (Arquivo .ics com alertas 24h e 2h antes)"
                          >
                            <Download className="w-3.5 h-3.5 text-cyan-600" />
                            <span className="hidden sm:inline">Agenda Celular (.ics)</span>
                          </button>

                          {/* Google Agenda */}
                          <a
                            href={getGoogleCalendarUrl(app)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs transition-colors"
                            title="Adicionar ao Google Agenda"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* WhatsApp Reminder */}
                          <a
                            href={getWhatsAppReminderUrl(app)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs transition-colors"
                            title="Enviar Lembrete Formatado por WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          </a>

                          {/* Print patient card */}
                          <button
                            onClick={() => onPrintAppointmentSheet(app.patientName, [app])}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                            title="Imprimir Cartão de Agendamento da Clínica"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer notice mirroring the paper sheet */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <p className="italic text-[11px] text-slate-600">
            "Ocorrendo qualquer anormalidade retorne a este serviço. Rua das Pitombeiras, 175 - Jabaquara | Tel: (11) 5017-0698"
          </p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Alertas configurados com 2h e 24h de antecedência nos arquivos .ics</span>
          </div>
        </div>
      </div>

      {/* MODAL: NOVO AGENDAMENTO INDIVIDUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold font-['Outfit'] text-base">Novo Agendamento de Sessão</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSingle} className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Selecione o Paciente</label>
                  {selectedPatient && (
                    <CoverageBadge convenio={selectedPatient.convenio} plano={selectedPatient.plano} size="xs" />
                  )}
                </div>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.registroOHB}) - {p.convenio || 'Particular'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data da Sessão</label>
                  <input
                    type="date"
                    required
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sessão Nº</label>
                  <input
                    type="number"
                    min={1}
                    value={sessaoNumero}
                    onChange={(e) => setSessaoNumero(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pressão de Trabalho</label>
                  <select
                    value={pressaoATA}
                    onChange={(e) => setPressaoATA(parseFloat(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                  >
                    <option value={2.0}>2.0 ATA</option>
                    <option value={2.4}>2.4 ATA (Padrão)</option>
                    <option value={2.8}>2.8 ATA</option>
                  </select>
                </div>
              </div>

              {/* Duração Protocolo Fixo */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Duração Estimada da Sessão</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                  <Lock className="w-3 h-3" />
                  <span>150 min (Travado)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações de Preparo</label>
                <input
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Verificar glicemia em jejum, curativo especial..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PACOTE DE SESSÕES EM LOTE */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold font-['Outfit'] text-base">Agendar Ciclo de Sessões OHB</h3>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4 text-xs">
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-cyan-900">
                Gera automaticamente uma sequência diária ou semanal de sessões para o paciente, populando a grade e permitindo download imediato para a agenda do celular.
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Paciente</label>
                  {batchPatient && (
                    <CoverageBadge convenio={batchPatient.convenio} plano={batchPatient.plano} size="xs" />
                  )}
                </div>
                <select
                  value={batchPatientId}
                  onChange={(e) => setBatchPatientId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.registroOHB}) - {p.convenio || 'Particular'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Protocolo de tempo fixo */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                <span className="text-amber-900 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Tempo por Sessão (Protocolo OHB):
                </span>
                <span className="font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                  150 minutos (Fixo)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data de Início</label>
                  <input
                    type="date"
                    required
                    value={batchStartDate}
                    onChange={(e) => setBatchStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horário Diário</label>
                  <input
                    type="time"
                    required
                    value={batchTime}
                    onChange={(e) => setBatchTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantidade de Sessões</label>
                <div className="flex gap-2">
                  {[5, 10, 20, 30].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBatchCount(num)}
                      className={`flex-1 py-1.5 rounded-lg border font-bold ${
                        batchCount === num
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm"
                >
                  Gerar {batchCount} Sessões
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
