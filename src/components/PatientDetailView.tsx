import React, { useState } from 'react';
import { ArrowLeft, User, Phone, MapPin, HeartPulse, ShieldCheck, FolderArchive, Calendar, Plus, Printer, Edit, Trash2, Clock, AlertCircle, FileText, CheckCircle2, ChevronRight, Stethoscope, Lock } from 'lucide-react';
import { Patient, HyperbaricSession, Appointment, DigitalizedDocument } from '../types';
import { downloadIcsAppointment, getGoogleCalendarUrl, getWhatsAppReminderUrl } from '../utils/calendarExport';
import { CoverageBadge } from './CoverageBadge';

interface PatientDetailViewProps {
  patient: Patient;
  sessions: HyperbaricSession[];
  appointments: Appointment[];
  documents: DigitalizedDocument[];
  onBack: () => void;
  onEditPatient: (patient: Patient) => void;
  onNewSession: (patient: Patient) => void;
  onNewAppointment: (patient: Patient) => void;
  onUploadDocForPatient: (registroOHB: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onPrintSheet: (type: 'tratamento' | 'enfermagem' | 'agendamento', patient: Patient) => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  sessions,
  appointments,
  documents,
  onBack,
  onEditPatient,
  onNewSession,
  onNewAppointment,
  onUploadDocForPatient,
  onDeleteSession,
  onPrintSheet,
}) => {
  const [activeTab, setActiveTab] = useState<'sessoes' | 'enfermagem' | 'documentos' | 'agendamentos' | 'dados'>('sessoes');

  const completedCount = sessions.length;
  const progressPercent = Math.min(
    Math.round((completedCount / (patient.numeroTratamentosPrevisto || 20)) * 100),
    100
  );

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Pacientes</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onPrintSheet('tratamento', patient)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs transition-colors"
            title="Imprimir Folha de Tratamento Física"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir Folha</span>
          </button>

          <button
            onClick={() => onEditPatient(patient)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-slate-600" />
            <span>Editar Cadastro</span>
          </button>

          <button
            onClick={() => onNewSession(patient)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <HeartPulse className="w-4 h-4" />
            <span>+ Registrar Sessão OHB</span>
          </button>
        </div>
      </div>

      {/* Patient Master Card Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-950/20 shrink-0">
              {patient.nome.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500 text-slate-950 shadow-2xs">
                  {patient.registroOHB}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-slate-600 bg-slate-100 border border-slate-200">
                  {patient.registroHospitalar || 'Sem RH'}
                </span>
                <CoverageBadge convenio={patient.convenio} plano={patient.plano} size="sm" showPlano={true} />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900">
                {patient.nome}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                <span>{patient.idade} anos ({patient.sexo === 'M' ? 'Masc' : 'Fem'})</span>
                <span>•</span>
                <span>CPF: <strong className="font-mono text-slate-800">{patient.cpf}</strong></span>
                <span>•</span>
                <span>RG: {patient.rg || 'Não informado'}</span>
                <span>•</span>
                <span>Tel: {patient.celular || patient.telefonesFixos || 'Não informado'}</span>
              </div>

              {/* Alergias Warning */}
              {patient.alergias && !patient.alergias.toLowerCase().includes('nega') && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>ALERTA DE ALERGIA: {patient.alergias}</span>
                </div>
              )}
            </div>
          </div>

          {/* Treatment Progress Box */}
          <div className="lg:w-80 bg-slate-50 border border-slate-200/80 rounded-xl p-4 shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800">Ciclo de Sessões OHB</span>
              <span className="font-mono font-bold text-cyan-800 text-sm">
                {completedCount} / {patient.numeroTratamentosPrevisto}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{progressPercent}% do protocolo</span>
              <span>{Math.max(0, patient.numeroTratamentosPrevisto - completedCount)} restantes</span>
            </div>
          </div>
        </div>

        {/* Diagnosis Pill */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Diagnóstico Principal:</span>
            <span className="font-medium text-slate-900">{patient.diagnostico}</span>
            <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              CID-10: {patient.cid10}
            </span>
          </div>
          <div className="text-slate-500">
            Médico Indicou: <span className="font-medium text-slate-700">{patient.medicoIndicou}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('sessoes')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sessoes'
              ? 'border-cyan-600 text-cyan-700 bg-white shadow-xs rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Folha de Tratamento ({completedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('enfermagem')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'enfermagem'
              ? 'border-cyan-600 text-cyan-700 bg-white shadow-xs rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sistematização de Enfermagem</span>
        </button>

        <button
          onClick={() => setActiveTab('documentos')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'documentos'
              ? 'border-cyan-600 text-cyan-700 bg-white shadow-xs rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>Prontuários & Imagens ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('agendamentos')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'agendamentos'
              ? 'border-cyan-600 text-cyan-700 bg-white shadow-xs rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agendamentos Futuros ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dados')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'dados'
              ? 'border-cyan-600 text-cyan-700 bg-white shadow-xs rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Anamnese & Endereço Completo</span>
        </button>
      </div>

      {/* TAB CONTENT 1: SESSÕES (FOLHA DE TRATAMENTO) */}
      {activeTab === 'sessoes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              Evolução e Registro das Sessões Hiperbáricas
            </h2>
            <button
              onClick={() => onNewSession(patient)}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Nova Sessão</span>
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Nenhuma sessão registrada para este paciente</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Clique no botão abaixo para iniciar o registro da primeira sessão hiperbárica.
              </p>
              <button
                onClick={() => onNewSession(patient)}
                className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold text-xs shadow-sm"
              >
                + Registrar 1ª Sessão
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Mobile View: Cards de Sessões (< md) */}
              <div className="md:hidden divide-y divide-slate-100">
                {sessions.map((ses) => (
                  <div key={ses.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full">
                          #{ses.sessionNumber}
                        </span>
                        <CoverageBadge convenio={ses.convenio || patient.convenio} size="xs" />
                        <span className="font-bold text-slate-900 text-xs">
                          {ses.data.split('-').reverse().join('/')} às {ses.hora}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-800 text-xs bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          {ses.ata} ATA
                        </span>
                        <button
                          onClick={() => onDeleteSession(ses.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Vitals Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">P.A.</span>
                        <span className="font-mono font-bold text-slate-800">{ses.pa}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Glicemia</span>
                        <span className="font-mono font-bold text-slate-800">{ses.glicemia}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Temp.</span>
                        <span className="font-mono font-bold text-slate-800">{ses.temperatura ? `${ses.temperatura}°C` : '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Duração</span>
                        <span className="font-mono font-bold text-slate-800">{ses.duracaoMinutos || 150}m</span>
                      </div>
                    </div>

                    {ses.intercorrencias && (
                      <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                        {ses.intercorrencias}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Médico: {ses.medicoResponsavel || 'Dr. Carlos Henrique'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Full Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-3">No.</th>
                      <th className="py-3 px-3">Modalidade</th>
                      <th className="py-3 px-3">Data</th>
                      <th className="py-3 px-3">Hora</th>
                      <th className="py-3 px-3">ATA</th>
                      <th className="py-3 px-3">P.A. mmHg</th>
                      <th className="py-3 px-3">GLIC. mg/dL</th>
                      <th className="py-3 px-3">TEMP.</th>
                      <th className="py-3 px-3">Duração</th>
                      <th className="py-3 px-4">Intercorrências & Observações</th>
                      <th className="py-3 px-3">Médico</th>
                      <th className="py-3 px-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {sessions.map((ses) => (
                      <tr key={ses.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold font-mono text-cyan-900 whitespace-nowrap">
                          #{ses.sessionNumber}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <CoverageBadge
                            convenio={ses.convenio || patient.convenio}
                            modalidade={ses.modalidade}
                            size="xs"
                          />
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-900 font-semibold">
                          {ses.data.split('-').reverse().join('/')}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {ses.hora}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                          {ses.ata} ATA
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-800">
                          {ses.pa}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {ses.glicemia}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {ses.temperatura ? `${ses.temperatura}°C` : '-'}
                        </td>
                        <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-800">
                            {ses.duracaoMinutos || 150} min
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs">
                          <p className="line-clamp-2">{ses.intercorrencias || 'Sem intercorrências.'}</p>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-600 whitespace-nowrap">
                          {ses.medicoResponsavel || 'Dr. Carlos Henrique'}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onDeleteSession(ses.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Excluir Registro da Sessão"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: SISTEMATIZAÇÃO DE ENFERMAGEM (SAE) */}
      {activeTab === 'enfermagem' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950">
            <h4 className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Sistematização de Enfermagem em Medicina Hiperbárica (SAE)
            </h4>
            <p className="text-emerald-800">
              Registros detalhados de cada sessão com checklist de segurança da câmara hiperbárica (roupa de algodão, sem metais/eletrônicos, pulseira estática) e evolução de diagnósticos de enfermagem.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {sessions.map((ses) => (
              <div key={ses.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-600 text-white">
                      Sessão #{ses.sessionNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {ses.data.split('-').reverse().join('/')} às {ses.hora}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">({ses.ata} ATA - {ses.duracaoMinutos} min)</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Enfermeiro: <strong className="text-slate-700">{ses.enfermeiroResponsavel || 'Enf. Renan Matos'}</strong> | Técnico: <strong className="text-slate-700">{ses.tecnicoResponsavel || 'Téc. Lucas'}</strong>
                  </div>
                </div>

                {/* Controles de Segurança */}
                <div>
                  <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Checagens Obrigatórias de Segurança da Câmara:
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${ses.roupaAlgodao ? 'text-emerald-600' : 'text-slate-300'}`} />
                      Roupa 100% Algodão
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${ses.removerMetaisEletronicos ? 'text-emerald-600' : 'text-slate-300'}`} />
                      Sem Metais/Eletrônicos
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${ses.pulseiraEstatica ? 'text-emerald-600' : 'text-slate-300'}`} />
                      Pulseira Estática
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${ses.retirarProteses ? 'text-emerald-600' : 'text-slate-300'}`} />
                      Retirada de Próteses
                    </span>
                  </div>
                </div>

                {/* Diagnósticos de Enfermagem */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Diagnósticos de Enfermagem (Status na Sessão):
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Dor Aguda/Crônica:</span>
                      <strong className="text-slate-900">{ses.diagDor || 'ME'} (Melhorado)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Integridade da Pele:</span>
                      <strong className="text-slate-900">{ses.diagPele || 'ME'} (Melhorado)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Contaminação:</span>
                      <strong className="text-slate-900">{ses.diagContaminacao || 'PR'} (Presente)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Ansiedade / Medo:</span>
                      <strong className="text-slate-900">{ses.diagAnsiedade || 'A'} (Ausente)</strong>
                    </div>
                  </div>
                </div>

                {/* Evolução de Enfermagem */}
                <div className="text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Evolução e Cuidados de Enfermagem:</span>
                  <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                    {ses.evolucaoEnfermagem || 'Curativo oclusivo preservado limpo e seco. Sem intercorrências de barotrauma.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PRONTUÁRIOS & IMAGENS DIGITALIZADAS */}
      {activeTab === 'documentos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-cyan-600" />
                Documentos & Fotos Vinculados ao Registro OHB ({patient.registroOHB})
              </h2>
              <p className="text-xs text-slate-500">
                Prontuários escaneados, fotos das lesões e laudos hospitalares.
              </p>
            </div>

            <button
              onClick={() => onUploadDocForPatient(patient.registroOHB)}
              className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Anexar Prontuário Escaneado / Foto</span>
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Nenhum documento digitalizado para este registro</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Anexe fotos de prontuários antigos físicos ou da evolução da ferida.
              </p>
              <button
                onClick={() => onUploadDocForPatient(patient.registroOHB)}
                className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold text-xs shadow-sm"
              >
                + Fazer Upload de Imagem
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                  <div className="aspect-4/3 bg-slate-100 relative">
                    <img src={doc.imageUrl} alt={doc.titulo} className="w-full h-full object-cover object-top" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-cyan-300 backdrop-blur-xs">
                      {doc.dataDocumento}
                    </span>
                  </div>
                  <div className="p-3 text-xs space-y-1">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{doc.titulo}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{doc.observacoes || 'Sem observações.'}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{doc.tipo.replace('_', ' ').toUpperCase()}</span>
                      <span>{doc.tamanhoKb} KB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: AGENDAMENTOS FUTUROS */}
      {activeTab === 'agendamentos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              Sessões Agendadas & Sincronização Móvel
            </h2>

            <button
              onClick={() => onNewAppointment(patient)}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar Sessão</span>
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Nenhum agendamento futuro</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Agende as próximas sessões para disparar alertas na agenda do celular do paciente.
              </p>
              <button
                onClick={() => onNewAppointment(patient)}
                className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold text-xs shadow-sm"
              >
                + Agendar Sessão
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {appointments.map((app) => (
                <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Sessão #{app.sessaoNumero} ({app.pressaoATA} ATA)
                        </span>
                        <CoverageBadge convenio={app.convenio || patient.convenio} size="xs" />
                      </div>
                      <p className="text-xs text-slate-500">
                        {app.data.split('-').reverse().join('/')} ({app.diaSemana}) às {app.horario} • 150 min
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
                      {app.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{app.observacoes || 'Sessão rotineira de oxigenoterapia hiperbárica.'}"
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => downloadIcsAppointment(app)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-semibold flex items-center gap-1"
                    >
                      <span>Baixar para Celular (.ics)</span>
                    </button>

                    <a
                      href={getGoogleCalendarUrl(app)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold"
                    >
                      Google Agenda
                    </a>

                    <a
                      href={getWhatsAppReminderUrl(app)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold"
                    >
                      Lembrete WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: ANAMNESE & ENDEREÇO COMPLETO */}
      {activeTab === 'dados' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Card 1: Dados Pessoais & Endereço */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-600" />
              Endereço Residencial (ViaCEP) & Contatos
            </h3>

            <div className="text-xs space-y-2 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">Logradouro:</span>
                <span className="font-semibold">{patient.endereco}, {patient.numero} {patient.complemento && `(${patient.complemento})`}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Bairro:</span>
                  <span className="font-semibold">{patient.bairro}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">CEP:</span>
                  <span className="font-mono font-bold text-cyan-800">{patient.cep}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cidade / UF:</span>
                <span className="font-semibold">{patient.municipio} - {patient.uf}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Celular / WhatsApp:</span>
                  <span className="font-semibold text-cyan-900">{patient.celular || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Telefone Fixo:</span>
                  <span className="font-semibold">{patient.telefonesFixos || 'Não informado'}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">E-mail:</span>
                <span className="font-semibold">{patient.email || 'Não informado'}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px]">Nome da Mãe:</span>
                <span className="font-semibold">{patient.nomeMae || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Acompanhante:</span>
                <span className="font-semibold">{patient.acompanhante || 'Próprio paciente'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: História Médica & Descrição da Ferida */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              História Médica & Lesão
            </h3>

            <div className="text-xs space-y-3 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">História Clínica:</span>
                <p className="font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-0.5">
                  {patient.historiaClinica || 'Não informada.'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Descrição da Ferida / Lesão:</span>
                <p className="font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-0.5">
                  {patient.descricaoLesao || 'Não informada.'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Local dos Curativos:</span>
                <p className="font-medium text-slate-800">{patient.localCurativos || 'Ambulatorial / Domiciliar'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Avaliação da Dor (EVA):</span>
                  <span className="font-bold text-cyan-800 text-sm">{patient.avaliacaoDor} / 10</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tempo de Patologia:</span>
                  <span className="font-semibold">{patient.tempoExistenciaPatologia || '-'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Grau de Entendimento do Paciente:</span>
                <p className="font-medium text-slate-800">{patient.grauEntendimento || 'Adequado'}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Segurança Pré-Câmara & Exame Físico */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Segurança Pré-Câmara & Físico
            </h3>

            <div className="text-xs space-y-3 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">Exame Físico Resumido:</span>
                <p className="font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-0.5">
                  {patient.exameFisicoResumido || 'BEG, corado, hidratado.'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Otoscopia Prévia:</span>
                <p className="font-semibold text-cyan-900 bg-cyan-50/50 p-2 rounded-lg border border-cyan-100">
                  {patient.otoscopia || 'Membrana timpânica íntegra bilateralmente.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Próteses:</span>
                  <span className="font-semibold">{patient.proteses || 'Nega'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ventilação:</span>
                  <span className="font-semibold">{patient.ventilacao || 'Espontânea em ar ambiente'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px]">Alergias Relatadas:</span>
                <span className={`font-semibold ${patient.alergias && !patient.alergias.toLowerCase().includes('nega') ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                  {patient.alergias || 'Nega alergias conhecidas'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Vícios / Hábitos:</span>
                <span className="font-semibold">{patient.vicios || 'Nenhum relatado'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Procedência:</span>
                  <span className="font-semibold">{patient.procedencia || 'Ambulatório'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Remoção:</span>
                  <span className="font-semibold">{patient.remocao || 'Própria'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Medicamentos em Uso Contínuo:</span>
                <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {patient.medicamentosEmUso || 'Nenhum'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
