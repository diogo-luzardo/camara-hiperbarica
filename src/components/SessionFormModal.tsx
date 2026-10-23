import React, { useState, useEffect, useRef } from 'react';
import { X, HeartPulse, ShieldCheck, Stethoscope, AlertTriangle, CheckCircle, Clock, Lock, CreditCard, Building2, UserCheck, Camera, Upload, Trash2, Paperclip } from 'lucide-react';
import { HyperbaricSession, Patient, DigitalizedDocument } from '../types';
import { CoverageBadge, isParticular } from './CoverageBadge';
import { CameraScannerModal, ScannedPage } from './CameraScannerModal';
import { StorageService } from '../services/storage';
import { optimizeImageFile } from '../utils/imageOptimizer';

export interface SessionAttachmentItem {
  id: string;
  dataUrl: string;
  sizeKb: number;
  title: string;
}

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: HyperbaricSession, attachedDocs?: SessionAttachmentItem[]) => void;
  patient: Patient;
  nextSessionNumber: number;
  initialSession?: HyperbaricSession | null;
}

export const SessionFormModal: React.FC<SessionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patient,
  nextSessionNumber,
  initialSession,
}) => {
  const [sessionModalidade, setSessionModalidade] = useState<'particular' | 'convenio'>(
    isParticular(patient.convenio) ? 'particular' : 'convenio'
  );

  const [formData, setFormData] = useState<Partial<HyperbaricSession>>({
    patientId: patient.id,
    registroOHB: patient.registroOHB,
    sessionNumber: nextSessionNumber,
    convenio: patient.convenio,
    modalidade: isParticular(patient.convenio) ? 'particular' : 'convenio',
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    ata: 2.4,
    pa: '120/80',
    glicemia: '120',
    temperatura: '36.4',
    duracaoMinutos: 150, // Fixo no protocolo padrão OHB: 150 minutos
    tratamentoMedicacao: 'Protocolo de O2 a 100% sob pressão hiperbárica.',
    intercorrencias: 'Paciente tolerou bem a compressão e descompressão, sem queixas de barotrauma de ouvido.',
    medicoResponsavel: 'Dr. Carlos Henrique Esteves (CRM 62.139)',
    enfermeiroResponsavel: 'Enf. Renan Matos (COREN-SP 214.901)',
    tecnicoResponsavel: 'Téc. Lucas Silva',
    // Checagens de Segurança da Câmara
    conferenciaNome: true,
    roupaAlgodao: true,
    pulseiraEstatica: true,
    removerMetaisEletronicos: true,
    retirarProteses: true,
    sondaVesicalAberta: false,
    avpAvcPicc: false,
    velocidadeCompressao: '0.15 ATA/min lenta e gradual',
    velocidadeDescompressao: '0.10 ATA/min lenta',
    covidFebreTosse: false,
    // Diagnósticos de Enfermagem
    diagDor: 'ME',
    diagQueda: 'PR',
    diagDeambulacao: 'PR',
    diagGlicemia: 'ME',
    diagPele: 'ME',
    diagContaminacao: 'PR',
    diagAnsiedade: 'A',
    evolucaoEnfermagem: 'Sinais vitais estáveis. Curativo oclusivo íntegro mantido. Paciente orientado sobre manobras de compensação auditiva.',
    status: 'concluida',
  });

  useEffect(() => {
    if (initialSession) {
      const mod = initialSession.modalidade || (isParticular(initialSession.convenio || patient.convenio) ? 'particular' : 'convenio');
      setSessionModalidade(mod);
      setFormData({
        ...initialSession,
        duracaoMinutos: 150, // Travado em 150 minutos pelo protocolo
        convenio: initialSession.convenio || (mod === 'particular' ? 'Particular' : patient.convenio),
        modalidade: mod,
      });
    } else {
      const mod = isParticular(patient.convenio) ? 'particular' : 'convenio';
      setSessionModalidade(mod);
      setFormData((prev) => ({
        ...prev,
        patientId: patient.id,
        registroOHB: patient.registroOHB,
        convenio: mod === 'particular' ? 'Particular' : patient.convenio,
        modalidade: mod,
        sessionNumber: nextSessionNumber,
        duracaoMinutos: 150,
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5),
      }));
    }
  }, [initialSession, patient, nextSessionNumber, isOpen]);

  const [attachedPages, setAttachedPages] = useState<SessionAttachmentItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing session documents if editing
  useEffect(() => {
    if (initialSession && initialSession.id) {
      StorageService.getDocsBySessionId(initialSession.id).then((existingDocs) => {
        if (existingDocs && existingDocs.length > 0) {
          setAttachedPages(
            existingDocs.map((d) => ({
              id: d.id,
              dataUrl: d.imageUrl,
              sizeKb: d.tamanhoKb,
              title: d.titulo,
            }))
          );
        } else {
          setAttachedPages([]);
        }
      });
    } else {
      setAttachedPages([]);
    }
  }, [initialSession, isOpen]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files) as File[]) {
      try {
        const optimized = await optimizeImageFile(file, { preset: 'equilibrado' });
        setAttachedPages((prev) => [
          ...prev,
          {
            id: `attach-${Date.now()}-${prev.length + 1}`,
            dataUrl: optimized.dataUrl,
            sizeKb: optimized.sizeKb,
            title: file.name.replace(/\.[^/.]+$/, ''),
          },
        ]);
      } catch (err) {
        console.warn('Erro ao otimizar imagem da sessão:', err);
      }
    }
    e.target.value = '';
  };

  const handleScannerSave = (pages: ScannedPage[], meta: { titulo: string }) => {
    const newItems: SessionAttachmentItem[] = pages.map((p, idx) => ({
      id: `scanned-${Date.now()}-${idx + 1}`,
      dataUrl: p.dataUrl,
      sizeKb: p.sizeKb,
      title: pages.length === 1 ? meta.titulo : `${meta.titulo} (Pág. ${idx + 1})`,
    }));
    setAttachedPages((prev) => [...prev, ...newItems]);
    setIsScannerOpen(false);
  };

  const removeAttachedPage = (index: number) => {
    setAttachedPages((prev) => prev.filter((_, idx) => idx !== index));
  };

  if (!isOpen) return null;

  const glicemiaNum = Number(formData.glicemia);
  const isGlicemiaAlert = !isNaN(glicemiaNum) && (glicemiaNum < 100 || glicemiaNum > 250);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        ...(formData as HyperbaricSession),
        duracaoMinutos: 150, // Garante que a duração fica fixada em 150 min
        modalidade: sessionModalidade,
        convenio: sessionModalidade === 'particular' ? 'Particular' : (patient.convenio || 'Particular'),
      },
      attachedPages
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-start sm:items-center justify-center p-1.5 sm:p-4 overflow-x-hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[calc(100vw-12px)] sm:max-w-3xl my-auto overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] min-w-0">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shrink-0">
              <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold font-['Outfit']">
                  {initialSession ? 'Editar Sessão OHB' : 'Registrar Sessão OHB'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500 text-slate-950">
                  Sessão #{formData.sessionNumber}
                </span>
                <CoverageBadge
                  convenio={sessionModalidade === 'particular' ? 'Particular' : patient.convenio}
                  plano={sessionModalidade === 'particular' ? undefined : patient.plano}
                  modalidade={sessionModalidade}
                  size="xs"
                />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1">
                {patient.nome} • <span className="font-mono text-cyan-300 font-bold">{patient.registroOHB}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          {/* Modalidade de Cobrança desta Sessão */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-cyan-600" />
                <span>Modalidade Desta Sessão:</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {sessionModalidade === 'particular'
                  ? 'Faturar como Particular'
                  : `Convênio (${patient.convenio || 'Padrão'})`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSessionModalidade('convenio')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  sessionModalidade === 'convenio'
                    ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    sessionModalidade === 'convenio' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {patient.convenio && !isParticular(patient.convenio)
                      ? `Convênio: ${patient.convenio}`
                      : 'Convênio de Saúde'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {patient.plano ? `Plano ${patient.plano}` : 'Guia autorizada'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSessionModalidade('particular')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  sessionModalidade === 'particular'
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    sessionModalidade === 'particular' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Atendimento Particular</p>
                  <p className="text-[10px] text-slate-500">Sessão avulsa ou consulta extra</p>
                </div>
              </button>
            </div>

            {sessionModalidade === 'particular' && patient.convenio && !isParticular(patient.convenio) && (
              <div className="text-[11px] text-amber-900 bg-amber-100/70 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  O paciente possui o convênio <strong>{patient.convenio}</strong> cadastrado, mas{' '}
                  <strong>esta sessão #{formData.sessionNumber}</strong> será faturada como <strong>Particular</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Section 1: Dados da Sessão e Parâmetros Hiperbáricos */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-600" />
              1. Parâmetros de Câmara e Horário
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nº da Sessão</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.sessionNumber || 1}
                  onChange={(e) => setFormData({ ...formData, sessionNumber: parseInt(e.target.value, 10) || 1 })}
                  className="w-full text-xs font-bold text-cyan-900 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={formData.data || ''}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hora de Início</label>
                <input
                  type="time"
                  required
                  value={formData.hora || ''}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pressão (ATA)</label>
                <select
                  value={formData.ata || 2.4}
                  onChange={(e) => setFormData({ ...formData, ata: parseFloat(e.target.value) })}
                  className="w-full text-xs font-bold text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                >
                  <option value={1.8}>1.8 ATA</option>
                  <option value={2.0}>2.0 ATA</option>
                  <option value={2.4}>2.4 ATA (Padrão Feridas)</option>
                  <option value={2.5}>2.5 ATA</option>
                  <option value={2.8}>2.8 ATA (Embolia/Gangrena)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Sinais Vitais Médicos */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              2. Sinais Vitais Pré / Pós Sessão
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">P.A. (mmHg)</label>
                <input
                  type="text"
                  value={formData.pa || ''}
                  onChange={(e) => setFormData({ ...formData, pa: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                  placeholder="120/80"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Glicemia (mg/dL)</label>
                  {isGlicemiaAlert && (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> Atenção
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.glicemia || ''}
                  onChange={(e) => setFormData({ ...formData, glicemia: e.target.value })}
                  className={`w-full text-xs font-bold px-3 py-2 rounded-lg border transition-colors bg-white ${
                    isGlicemiaAlert ? 'border-amber-500 text-amber-700 bg-amber-50/30' : 'border-slate-300'
                  }`}
                  placeholder="110"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Ideal pré-câmara: 100 - 200 mg/dL</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temperatura (°C)</label>
                <input
                  type="text"
                  value={formData.temperatura || ''}
                  onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                  placeholder="36.4"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Duração</label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/90 border border-amber-200 px-1.5 py-0.5 rounded">
                    <Lock className="w-2.5 h-2.5" /> Fixo (150m)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value="150 min (Protocolo Fixo)"
                    readOnly
                    disabled
                    className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 bg-slate-100 text-slate-700 cursor-not-allowed select-none pr-8"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Travado pelo protocolo OHB (150 min).</p>
              </div>
            </div>
          </div>

          {/* Section 3: Checagens de Segurança da Câmara Hiperbárica (Enfermagem) */}
          <div className="border border-cyan-200 bg-cyan-50/40 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-700" />
              3. Sistematização de Enfermagem: Controles Obrigatórios de Segurança
            </h3>
            <p className="text-xs text-cyan-800">
              Protocolo da câmara para prevenção de acidentes estáticos e barotrauma:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-cyan-200 hover:border-cyan-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.roupaAlgodao || false}
                  onChange={(e) => setFormData({ ...formData, roupaAlgodao: e.target.checked })}
                  className="rounded text-cyan-600 accent-cyan-600"
                />
                <span className="font-medium text-slate-800">Roupa 100% Algodão (Sem sintéticos)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-cyan-200 hover:border-cyan-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.removerMetaisEletronicos || false}
                  onChange={(e) => setFormData({ ...formData, removerMetaisEletronicos: e.target.checked })}
                  className="rounded text-cyan-600 accent-cyan-600"
                />
                <span className="font-medium text-slate-800">Sem Metais / Celular / Isqueiros / Pilhas</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-cyan-200 hover:border-cyan-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pulseiraEstatica || false}
                  onChange={(e) => setFormData({ ...formData, pulseiraEstatica: e.target.checked })}
                  className="rounded text-cyan-600 accent-cyan-600"
                />
                <span className="font-medium text-slate-800">Pulseira Estática Conectada</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-cyan-200 hover:border-cyan-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.retirarProteses || false}
                  onChange={(e) => setFormData({ ...formData, retirarProteses: e.target.checked })}
                  className="rounded text-cyan-600 accent-cyan-600"
                />
                <span className="font-medium text-slate-800">Retirada de Próteses Dentárias / Lentes</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-cyan-200 hover:border-cyan-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.conferenciaNome || false}
                  onChange={(e) => setFormData({ ...formData, conferenciaNome: e.target.checked })}
                  className="rounded text-cyan-600 accent-cyan-600"
                />
                <span className="font-medium text-slate-800">Conferência de Identidade e Pulseira</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-cyan-200 hover:border-cyan-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sondaVesicalAberta || false}
                  onChange={(e) => setFormData({ ...formData, sondaVesicalAberta: e.target.checked })}
                  className="rounded text-cyan-600 accent-cyan-600"
                />
                <span className="font-medium text-slate-800">Sondas e Drenos Descomprimidos</span>
              </label>
            </div>
          </div>

          {/* Section 4: Diagnósticos de Enfermagem (PR / ME / PI / A / R) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Avaliação Diagnóstica de Enfermagem
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                PR=Presente | ME=Melhorado | PI=Piorado | A=Ausente | R=Resolvido
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Dor Aguda/Crônica</label>
                <select
                  value={formData.diagDor || 'ME'}
                  onChange={(e) => setFormData({ ...formData, diagDor: e.target.value as any })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="PR">PR - Presente</option>
                  <option value="ME">ME - Melhorado</option>
                  <option value="PI">PI - Piorado</option>
                  <option value="A">A - Ausente</option>
                  <option value="R">R - Resolvido</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Integ. Pele Prejudicada</label>
                <select
                  value={formData.diagPele || 'ME'}
                  onChange={(e) => setFormData({ ...formData, diagPele: e.target.value as any })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="PR">PR - Presente</option>
                  <option value="ME">ME - Melhorado</option>
                  <option value="PI">PI - Piorado</option>
                  <option value="A">A - Ausente</option>
                  <option value="R">R - Resolvido</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Contaminação / Infecção</label>
                <select
                  value={formData.diagContaminacao || 'PR'}
                  onChange={(e) => setFormData({ ...formData, diagContaminacao: e.target.value as any })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="PR">PR - Presente</option>
                  <option value="ME">ME - Melhorado</option>
                  <option value="PI">PI - Piorado</option>
                  <option value="A">A - Ausente</option>
                  <option value="R">R - Resolvido</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Ansiedade / Medo</label>
                <select
                  value={formData.diagAnsiedade || 'A'}
                  onChange={(e) => setFormData({ ...formData, diagAnsiedade: e.target.value as any })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="PR">PR - Presente</option>
                  <option value="ME">ME - Melhorado</option>
                  <option value="PI">PI - Piorado</option>
                  <option value="A">A - Ausente</option>
                  <option value="R">R - Resolvido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Observações, Intercorrências e Responsáveis */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intercorrências e Observações Médicas
              </label>
              <textarea
                rows={2}
                value={formData.intercorrencias || ''}
                onChange={(e) => setFormData({ ...formData, intercorrencias: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                placeholder="Ex: Tolerou bem a sessão; queixas de ouvido; náuseas..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Evolução e Anotação de Enfermagem
              </label>
              <textarea
                rows={2}
                value={formData.evolucaoEnfermagem || ''}
                onChange={(e) => setFormData({ ...formData, evolucaoEnfermagem: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                placeholder="Curativo mantido, pele ao redor hidratada, manobra de Valsalva sem dor..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Médico Responsável</label>
                <input
                  type="text"
                  value={formData.medicoResponsavel || ''}
                  onChange={(e) => setFormData({ ...formData, medicoResponsavel: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enfermeiro(a) Responsável</label>
                <input
                  type="text"
                  value={formData.enfermeiroResponsavel || ''}
                  onChange={(e) => setFormData({ ...formData, enfermeiroResponsavel: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Técnico Operador</label>
                <input
                  type="text"
                  value={formData.tecnicoResponsavel || ''}
                  onChange={(e) => setFormData({ ...formData, tecnicoResponsavel: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Prontuário Manual Escaneado / Fotos da Sessão */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-600" />
                  6. Prontuário Manual Escaneado / Fotos da Sessão
                </h3>
                <p className="text-[11px] text-slate-500">
                  Escaneie a folha de atendimento física ou fotos da evolução da ferida nesta sessão #{formData.sessionNumber}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Escanear com Câmera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar Arquivo</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </div>
            </div>

            {/* Attached Pages List */}
            {attachedPages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {attachedPages.map((page, idx) => (
                  <div key={page.id} className="relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs group">
                    <div className="aspect-3/4 bg-slate-100 relative">
                      <img src={page.dataUrl} alt={page.title} className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900/80 text-white">
                        Pág. {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachedPage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-rose-600/90 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                        title="Remover anexo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="p-1.5 text-[10px] text-slate-700">
                      <p className="font-semibold truncate">{page.title}</p>
                      <p className="text-slate-400 text-[9px]">{page.sizeKb} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center text-slate-400 text-xs">
                Nenhum prontuário manual ou foto anexada a esta sessão ainda.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 rounded-lg shadow-md transition-all shadow-cyan-900/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{initialSession ? 'Salvar Sessão' : 'Concluir Registro'}</span>
            </button>
          </div>
        </form>

        {/* Embedded Camera Scanner Modal */}
        {isScannerOpen && (
          <CameraScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onSave={handleScannerSave}
            title="Escanear Prontuário da Sessão"
            subtitle={`${patient.nome} • Sessão #${formData.sessionNumber}`}
            defaultDocType="ficha_atendimento"
            defaultTitle={`Prontuário da Sessão #${formData.sessionNumber} - ${formData.data}`}
            patientOHB={patient.registroOHB}
            patientName={patient.nome}
          />
        )}
      </div>
    </div>
  );
};
