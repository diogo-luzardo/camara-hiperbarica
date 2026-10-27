import React, { useState, useRef, useEffect } from 'react';
import { FolderArchive, Upload, Search, ZoomIn, ZoomOut, RotateCw, Download, Trash2, X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Filter, Eye, Camera, User, Sparkles, FilePlus, Users } from 'lucide-react';
import { DigitalizedDocument, Patient, HyperbaricSession } from '../types';
import { StorageService } from '../services/storage';
import { CameraScannerModal, ScannedPage } from './CameraScannerModal';
import { optimizeImageFile, isPdfDataUrl } from '../utils/imageOptimizer';

interface DigitalVaultProps {
  documents: DigitalizedDocument[];
  patients: Patient[];
  sessions?: HyperbaricSession[];
  onRefreshDocs: () => void;
  selectedPatientOHB?: string;
}

export const DigitalVault: React.FC<DigitalVaultProps> = ({
  documents,
  patients,
  sessions = [],
  onRefreshDocs,
  selectedPatientOHB,
}) => {
  const [searchTerm, setSearchTerm] = useState(selectedPatientOHB || '');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [isUploading, setIsUploading] = useState(false);

  // Modo de cadastro no acervo:
  // 'novo_papel': Para prontuários em papel de pacientes que ainda NÃO estão cadastrados na plataforma
  // 'cadastrado': Para anexar a um paciente já existente no sistema
  const [recordMode, setRecordMode] = useState<'novo_papel' | 'cadastrado'>(
    selectedPatientOHB ? 'cadastrado' : 'novo_papel'
  );

  // Campos para Novo Prontuário em Papel (sem cadastro prévio no sistema)
  const [newPatientName, setNewPatientName] = useState('');
  const [newNomeMae, setNewNomeMae] = useState('');
  const [newRegistroFisico, setNewRegistroFisico] = useState('');
  const [newCPF, setNewCPF] = useState('');

  // Form State para paciente já cadastrado
  const [targetOHB, setTargetOHB] = useState(selectedPatientOHB || '');
  const [targetCPF, setTargetCPF] = useState('');
  const [targetSessionId, setTargetSessionId] = useState('');

  // Metadados do documento
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<DigitalizedDocument['tipo']>('prontuario_antigo');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');
  const [previewImages, setPreviewImages] = useState<{ name: string; dataUrl: string; sizeKb: number }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // Lightbox Modal State
  const [viewingDoc, setViewingDoc] = useState<DigitalizedDocument | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Target patient sessions
  const targetPatient = patients.find(
    (p) => p.registroOHB.trim().toUpperCase() === targetOHB.trim().toUpperCase()
  );
  const targetPatientSessions = targetPatient
    ? sessions.filter(
        (s) => s.patientId === targetPatient.id || s.registroOHB === targetPatient.registroOHB
      )
    : [];

  // When patient selection changes
  useEffect(() => {
    if (selectedPatientOHB) {
      setRecordMode('cadastrado');
      setSearchTerm(selectedPatientOHB);
      setTargetOHB(selectedPatientOHB);
      const pat = patients.find((p) => p.registroOHB === selectedPatientOHB);
      if (pat) setTargetCPF(pat.cpf);
    }
  }, [selectedPatientOHB, patients]);

  const handlePatientSelectChange = (ohb: string) => {
    setTargetOHB(ohb);
    setTargetSessionId('');
    const pat = patients.find((p) => p.registroOHB === ohb);
    if (pat) {
      setTargetCPF(pat.cpf);
      if (!docTitle) {
        setDocTitle(`Prontuário Antigo Escaneado - ${pat.nome}`);
      }
    }
  };

  const handleScannerSaved = async (
    pages: ScannedPage[],
    meta: {
      titulo: string;
      tipo: DigitalizedDocument['tipo'];
      dataDocumento: string;
      observacoes: string;
      patientName?: string;
      nomeMae?: string;
      registroOHB?: string;
    }
  ) => {
    setIsCameraScannerOpen(false);

    const resolvedPatientName = (meta.patientName || newPatientName).trim();
    const resolvedNomeMae = (meta.nomeMae || newNomeMae).trim();
    const resolvedRegistro = (meta.registroOHB || newRegistroFisico).trim();
    const resolvedTitle = (meta.titulo || docTitle).trim();
    const resolvedType = meta.tipo || docType;
    const resolvedDate = meta.dataDocumento || docDate;
    const resolvedObs = meta.observacoes || observations;

    // Se todos os dados necessários já foram informados no Scanner Modal, arquiva direto no Acervo!
    if (recordMode === 'novo_papel' && resolvedPatientName && resolvedNomeMae && pages.length > 0) {
      setIsUploading(true);
      try {
        const digits = resolvedRegistro.replace(/\D/g, '');
        const finalRegistroOHB = digits
          ? `OHB-${digits}`
          : `OHB-${Date.now().toString().slice(-4)}`;

        for (let i = 0; i < pages.length; i++) {
          const p = pages[i];
          const newDoc: DigitalizedDocument = {
            id: `doc-${Date.now()}-${i}`,
            registroOHB: finalRegistroOHB,
            cpf: newCPF.trim(),
            patientId: undefined,
            patientName: resolvedPatientName,
            nomeMae: resolvedNomeMae,
            titulo:
              pages.length === 1
                ? resolvedTitle || `Prontuário Antigo - ${resolvedPatientName}`
                : `${resolvedTitle || `Prontuário Antigo - ${resolvedPatientName}`} (Pág. ${i + 1})`,
            tipo: resolvedType,
            dataDocumento: resolvedDate,
            dataUpload: new Date().toISOString(),
            observacoes: resolvedObs,
            imageUrl: p.dataUrl,
            tamanhoKb: p.sizeKb,
          };
          await StorageService.saveDigitalizedDoc(newDoc);
        }

        setPreviewImages([]);
        setDocTitle('');
        setObservations('');
        setNewPatientName('');
        setNewNomeMae('');
        setNewRegistroFisico('');
        setNewCPF('');
        onRefreshDocs();
        alert(
          `${pages.length} arquivo(s) arquivado(s) no acervo com sucesso para ${resolvedPatientName}! (Registro: ${finalRegistroOHB})`
        );
        return;
      } catch (err) {
        console.error('Erro ao arquivar direto do scanner:', err);
      } finally {
        setIsUploading(false);
      }
    } else if (recordMode === 'cadastrado' && targetOHB.trim() && pages.length > 0) {
      setIsUploading(true);
      try {
        const patient = patients.find(
          (p) => p.registroOHB.trim().toUpperCase() === targetOHB.trim().toUpperCase()
        );
        const finalPatientName = patient?.nome || targetOHB;
        const finalRegistroOHB = targetOHB.trim().toUpperCase();
        const selectedSession = targetPatientSessions.find((s) => s.id === targetSessionId);

        for (let i = 0; i < pages.length; i++) {
          const p = pages[i];
          const newDoc: DigitalizedDocument = {
            id: `doc-${Date.now()}-${i}`,
            registroOHB: finalRegistroOHB,
            cpf: targetCPF || patient?.cpf || '',
            patientId: patient?.id,
            patientName: finalPatientName,
            nomeMae: patient?.nomeMae,
            sessionId: selectedSession?.id,
            sessionNumber: selectedSession?.sessionNumber,
            titulo:
              pages.length === 1
                ? resolvedTitle || `Prontuário Escaneado - ${finalPatientName}`
                : `${resolvedTitle || `Prontuário Escaneado - ${finalPatientName}`} (Pág. ${i + 1})`,
            tipo: resolvedType,
            dataDocumento: resolvedDate,
            dataUpload: new Date().toISOString(),
            observacoes: resolvedObs,
            imageUrl: p.dataUrl,
            tamanhoKb: p.sizeKb,
          };
          await StorageService.saveDigitalizedDoc(newDoc);
        }

        setPreviewImages([]);
        setDocTitle('');
        setObservations('');
        onRefreshDocs();
        alert(
          `${pages.length} arquivo(s) arquivado(s) no acervo com sucesso para ${finalPatientName}! (Registro: ${finalRegistroOHB})`
        );
        return;
      } catch (err) {
        console.error('Erro ao arquivar direto do scanner:', err);
      } finally {
        setIsUploading(false);
      }
    }

    // Fallback: preenche no formulário lateral caso falte algum dado obrigatório
    pages.forEach((p, idx) => {
      setPreviewImages((prev) => [
        ...prev,
        {
          name: pages.length === 1 ? meta.titulo : `${meta.titulo} (Pág. ${idx + 1})`,
          dataUrl: p.dataUrl,
          sizeKb: p.sizeKb,
        },
      ]);
    });
    if (meta.titulo && !docTitle) setDocTitle(meta.titulo);
    if (meta.tipo) setDocType(meta.tipo);
    if (meta.dataDocumento) setDocDate(meta.dataDocumento);
    if (meta.observacoes) setObservations(meta.observacoes);
    if (meta.patientName && !newPatientName) setNewPatientName(meta.patientName);
    if (meta.nomeMae && !newNomeMae) setNewNomeMae(meta.nomeMae);
    if (meta.registroOHB && !newRegistroFisico) setNewRegistroFisico(meta.registroOHB);
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    for (const file of Array.from(files) as File[]) {
      try {
        const optimized = await optimizeImageFile(file, { preset: 'equilibrado' });
        setPreviewImages((prev) => [
          ...prev,
          {
            name: file.name,
            dataUrl: optimized.dataUrl,
            sizeKb: optimized.sizeKb,
          },
        ]);
        if (!docTitle) {
          setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      } catch (err: any) {
        console.warn('Erro ao otimizar imagem para o acervo:', err);
        setUploadError(err?.message || `Não foi possível importar "${file.name}".`);
      }
    }
    e.target.value = '';
  };

  const handleSaveUploads = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalPatientId: string | undefined;
    let finalPatientName: string;
    let finalNomeMae: string | undefined;
    let finalRegistroOHB: string;
    let finalCPF: string;
    let selectedSession: HyperbaricSession | undefined;

    if (recordMode === 'novo_papel') {
      if (!newPatientName.trim()) {
        alert('Informe o Nome do Paciente para criar o novo cadastro no acervo.');
        return;
      }
      if (!newNomeMae.trim()) {
        alert('Informe o Nome da Mãe do Paciente (essencial para identificação e busca de prontuários em papel).');
        return;
      }
      finalPatientName = newPatientName.trim();
      finalNomeMae = newNomeMae.trim();
      const digits = newRegistroFisico.replace(/\D/g, '');
      finalRegistroOHB = digits
        ? `OHB-${digits}`
        : `OHB-${Date.now().toString().slice(-4)}`;
      finalCPF = newCPF.trim();
      finalPatientId = undefined;
    } else {
      if (!targetOHB.trim()) {
        alert('Selecione ou informe o Registro OHB para vincular os documentos.');
        return;
      }
      const patient = patients.find(
        (p) => p.registroOHB.trim().toUpperCase() === targetOHB.trim().toUpperCase()
      );
      finalPatientId = patient?.id;
      finalPatientName = patient?.nome || targetOHB;
      finalNomeMae = patient?.nomeMae;
      finalRegistroOHB = targetOHB.trim().toUpperCase();
      finalCPF = targetCPF || patient?.cpf || '';
      selectedSession = targetPatientSessions.find((s) => s.id === targetSessionId);
    }

    if (previewImages.length === 0) {
      alert('Selecione ou escaneie pelo menos uma folha para arquivar.');
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < previewImages.length; i++) {
        const item = previewImages[i];
        const newDoc: DigitalizedDocument = {
          id: `doc-${Date.now()}-${i}`,
          registroOHB: finalRegistroOHB,
          cpf: finalCPF,
          patientId: finalPatientId,
          patientName: finalPatientName,
          nomeMae: finalNomeMae,
          sessionId: selectedSession?.id,
          sessionNumber: selectedSession?.sessionNumber,
          titulo:
            previewImages.length === 1
              ? docTitle.trim() || `Prontuário Antigo - ${finalPatientName}`
              : `${docTitle.trim() || `Prontuário Antigo - ${finalPatientName}`} (Pág. ${i + 1})`,
          tipo: docType,
          dataDocumento: docDate,
          dataUpload: new Date().toISOString(),
          observacoes: observations,
          imageUrl: item.dataUrl,
          tamanhoKb: item.sizeKb,
        };
        await StorageService.saveDigitalizedDoc(newDoc);
      }

      setPreviewImages([]);
      setDocTitle('');
      setObservations('');
      if (recordMode === 'novo_papel') {
        setNewPatientName('');
        setNewNomeMae('');
        setNewRegistroFisico('');
        setNewCPF('');
      }
      onRefreshDocs();
      alert(
        `${previewImages.length} folha(s) arquivada(s) no acervo com sucesso para o paciente ${finalPatientName}! (Registro: ${finalRegistroOHB})`
      );
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar documentos no acervo digital.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (confirm('Deseja realmente remover este prontuário escaneado do acervo?')) {
      await StorageService.deleteDigitalizedDoc(id);
      if (viewingDoc?.id === id) setViewingDoc(null);
      onRefreshDocs();
    }
  };

  // Filtered documents (Busca universal por Nome, Nome da Mãe, Registro e CPF)
  const filteredDocs = documents.filter((doc) => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    const cleanDigits = cleanSearch.replace(/\D/g, '');
    const matchSearch =
      !cleanSearch ||
      doc.registroOHB.toLowerCase().includes(cleanSearch) ||
      (cleanDigits.length > 0 && doc.cpf.replace(/\D/g, '').includes(cleanDigits)) ||
      (doc.patientName && doc.patientName.toLowerCase().includes(cleanSearch)) ||
      (doc.nomeMae && doc.nomeMae.toLowerCase().includes(cleanSearch)) ||
      doc.titulo.toLowerCase().includes(cleanSearch);

    const matchType = selectedType === 'todos' || doc.tipo === selectedType;

    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
              Acervo de Digitalização & Arquivo Morto
            </span>
            <span className="text-xs text-slate-500">• Indexação Universal por Registro OHB & CPF</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900">
            Prontuários Antigos Escaneados & Imagens Clínicas
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl">
            Solução de alta capacidade para arquivamento de fichas históricas digitalizadas, laudos e fotos evolutivas das feridas. Vinculação automática a pacientes pelo Registro OHB da clínica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-900 font-mono">{documents.length}</span>
            <p className="text-[11px] text-slate-500">Documentos no Acervo</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
            <FolderArchive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Upload Box + Search & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 min-[2000px]:grid-cols-5 gap-6">
        {/* COL 1: Upload & Digitalization Panel */}
        <div className="lg:col-span-1 xl:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-600" />
              Digitalizar / Anexar Imagens
            </h2>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-mono rounded">
              IndexedDB / S3
            </span>
          </div>

          <form onSubmit={handleSaveUploads} className="space-y-3.5 text-xs">
            {/* Seletor de Modo: Ficha Nova em Papel vs Paciente Já Cadastrado */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Origem do Documento
              </label>
              <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRecordMode('novo_papel')}
                  className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    recordMode === 'novo_papel'
                      ? 'bg-white text-cyan-800 shadow-xs font-bold border border-cyan-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FilePlus className="w-3.5 h-3.5 text-cyan-600" />
                  <span>✨ Novo em Papel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecordMode('cadastrado')}
                  className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    recordMode === 'cadastrado'
                      ? 'bg-white text-cyan-800 shadow-xs font-bold border border-cyan-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-cyan-600" />
                  <span>📁 Já Cadastrado</span>
                </button>
              </div>
            </div>

            {/* Campos quando for NOVO EM PAPEL (sem vínculo inicial e sem cadastro prévio) */}
            {recordMode === 'novo_papel' ? (
              <div className="space-y-2.5 p-3 rounded-xl bg-cyan-50/40 border border-cyan-100">
                <div className="flex items-start gap-1.5 text-[11px] text-cyan-900">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                  <span>
                    Cadastre diretamente a ficha em papel informando o <strong>Nome do Paciente</strong> e o <strong>Nome da Mãe</strong> (essencial para desempate de homônimos).
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">
                    Nome Completo do Paciente <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={(e) => {
                      setNewPatientName(e.target.value);
                      if (!docTitle) setDocTitle(`Prontuário Antigo - ${e.target.value}`);
                    }}
                    placeholder="Ex: Maria Aparecida da Silva"
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">
                    Nome da Mãe do Paciente <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newNomeMae}
                    onChange={(e) => setNewNomeMae(e.target.value)}
                    placeholder="Ex: Joana Ferreira da Silva"
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Obrigatório para identificação segura e busca no acervo</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">
                      Nº Prontuário Antigo / Pasta
                    </label>
                    <div className="flex items-stretch rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-cyan-500 bg-white overflow-hidden">
                      <span className="px-2 py-1.5 bg-cyan-100 text-cyan-950 font-mono font-bold text-xs border-r border-cyan-200 flex items-center select-none">
                        OHB-
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={newRegistroFisico.replace(/\D/g, '')}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setNewRegistroFisico(digits ? `OHB-${digits}` : '');
                        }}
                        placeholder="1042"
                        className="w-full text-xs font-mono font-bold text-cyan-900 px-2 py-1.5 bg-transparent outline-none"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">Digite apenas o número</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">
                      CPF (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newCPF}
                      onChange={(e) => setNewCPF(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Campos para PACIENTE JÁ CADASTRADO NO SISTEMA */
              <div className="space-y-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vincular a Paciente Cadastrado <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={targetOHB}
                    onChange={(e) => handlePatientSelectChange(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white font-medium"
                  >
                    <option value="">-- Selecione o Paciente --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.registroOHB}>
                        {p.registroOHB} - {p.nome} {p.nomeMae ? `(Mãe: ${p.nomeMae})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Registro OHB <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-stretch rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-cyan-500 bg-cyan-50/30 overflow-hidden">
                    <span className="px-2.5 py-2 bg-cyan-100/80 text-cyan-950 font-mono font-bold text-xs border-r border-cyan-200 flex items-center select-none">
                      OHB-
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={targetOHB.replace(/\D/g, '')}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setTargetOHB(digits ? `OHB-${digits}` : '');
                      }}
                      placeholder="1082"
                      className="w-full text-xs font-mono font-bold text-cyan-900 px-2.5 py-2 bg-transparent outline-none"
                    />
                  </div>
                </div>

                {targetPatientSessions.length > 0 && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Vincular à Sessão Específica (Opcional)
                    </label>
                    <select
                      value={targetSessionId}
                      onChange={(e) => {
                        setTargetSessionId(e.target.value);
                        const s = targetPatientSessions.find((x) => x.id === e.target.value);
                        if (s) {
                          setDocTitle(`Prontuário Sessão #${s.sessionNumber} - ${s.data}`);
                          setDocType('ficha_atendimento');
                        }
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                    >
                      <option value="">Geral / Sem vínculo com sessão</option>
                      {targetPatientSessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          Sessão #{s.sessionNumber} - {s.data} ({s.ata} ATA)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CPF Vinculado</label>
                  <input
                    type="text"
                    value={targetCPF}
                    onChange={(e) => setTargetCPF(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Tipo de Documento */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Documento</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="prontuario_antigo">Prontuário Antigo</option>
                  <option value="ficha_atendimento">Ficha de Atendimento</option>
                  <option value="foto_lesao">Foto da Lesão / Ferida</option>
                  <option value="exame_laudo">Laudo / Exame</option>
                  <option value="outro">Outro Documento</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data do Documento</label>
                <input
                  type="date"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            {/* Título do Documento */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Título ou Descrição do Arquivo</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Ex: Ficha de Evolução Hospitalar 2021"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Upload Area (Opção de Câmera Scanner ou Importação de Arquivo) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Capturar ou Importar Documentos
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraScannerOpen(true)}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Escanear com Câmera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importar da Galeria / PC</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.pdf"
                onChange={handleFilesSelected}
                className="hidden"
              />

              {uploadError && (
                <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span className="font-semibold">{uploadError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="text-rose-500 hover:text-rose-800 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Previews */}
            {previewImages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>{previewImages.length} arquivo(s) selecionado(s)</span>
                  <button
                    type="button"
                    onClick={() => setPreviewImages([])}
                    className="text-rose-600 hover:underline"
                  >
                    Limpar
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-100 rounded-lg">
                  {previewImages.map((img, idx) => (
                    <div key={idx} className="relative rounded overflow-hidden border border-slate-200 aspect-3/4 bg-white">
                      {isPdfDataUrl(img.dataUrl) ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-700 p-1 text-center">
                          <FileText className="w-6 h-6 mb-0.5" />
                          <span className="text-[9px] font-bold uppercase">PDF</span>
                          <span className="text-[8px] text-slate-500 truncate w-full px-1">{img.name}</span>
                        </div>
                      ) : (
                        <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-[9px] text-white p-0.5 truncate text-center">
                        {img.sizeKb} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notas Clínicas / Histórico</label>
              <textarea
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: Escaneamento da pasta original de admissão; presença de biópsia óssea..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || previewImages.length === 0}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Arquivando...' : 'Arquivar Documento no Acervo'}</span>
            </button>
          </form>
        </div>

        {/* COL 2 & 3: Gallery & Search Filters */}
        <div className="lg:col-span-2 xl:col-span-3 min-[2000px]:col-span-4 space-y-4">
          {/* Search bar & Type Filter */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por Registro OHB (ex: OHB-1082), CPF ou Nome..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto">
              <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Tipo:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white w-full sm:w-auto cursor-pointer"
              >
                <option value="todos">Todos os tipos</option>
                <option value="prontuario_antigo">Prontuário Antigo</option>
                <option value="foto_lesao">Foto da Lesão</option>
                <option value="ficha_atendimento">Ficha de Atendimento</option>
                <option value="exame_laudo">Laudos & Exames</option>
              </select>
            </div>
          </div>

          {/* Documents Grid */}
          {filteredDocs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
              <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Nenhum prontuário escaneado encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Utilize o formulário ao lado para carregar e indexar fotos de prontuários antigos vinculadas ao Registro OHB.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[2200px]:grid-cols-5 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border-2 border-slate-200/80 hover:border-cyan-400 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 overflow-hidden flex flex-col group"
                >
                  {/* Image Thumbnail with Overlay */}
                  <div
                    onClick={() => {
                      setViewingDoc(doc);
                      setZoomLevel(1);
                      setRotation(0);
                    }}
                    className="relative aspect-4/3 bg-slate-100 cursor-pointer overflow-hidden border-b border-slate-100"
                  >
                    {isPdfDataUrl(doc.imageUrl) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-700 p-4 text-center">
                        <FileText className="w-12 h-12 mb-1.5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Documento PDF</span>
                      </div>
                    ) : (
                      <img
                        src={doc.imageUrl}
                        alt={doc.titulo}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-opacity">
                        <Eye className="w-3.5 h-3.5 text-cyan-600" />
                        Visualizar Detalhes
                      </span>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 text-cyan-300 backdrop-blur-xs">
                        {doc.registroOHB}
                      </span>
                      {!doc.patientId && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 shadow-xs">
                          📄 Ficha Papel
                        </span>
                      )}
                      {doc.sessionNumber && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 shadow-xs">
                          Sessão #{doc.sessionNumber}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-xs ${
                        doc.tipo === 'prontuario_antigo'
                          ? 'bg-blue-600/80 text-white'
                          : doc.tipo === 'foto_lesao'
                          ? 'bg-emerald-600/80 text-white'
                          : 'bg-purple-600/80 text-white'
                      }`}>
                        {doc.tipo === 'prontuario_antigo'
                          ? 'Prontuário'
                          : doc.tipo === 'foto_lesao'
                          ? 'Foto Lesão'
                          : 'Exame'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-cyan-700 transition-colors">
                        {doc.titulo}
                      </h4>
                      {doc.patientName && (
                        <p className="text-slate-800 text-[11px] truncate font-semibold mt-0.5 flex items-center gap-1">
                          <User className="w-3 h-3 text-cyan-600 shrink-0" />
                          <span>{doc.patientName}</span>
                        </p>
                      )}
                      {doc.nomeMae && (
                        <p className="text-slate-500 text-[10px] truncate mt-0.5 pl-4">
                          <span className="text-slate-400 font-medium">Mãe:</span> {doc.nomeMae}
                        </p>
                      )}
                      {doc.observacoes && (
                        <p className="text-slate-500 text-[11px] line-clamp-2 mt-1 italic">
                          "{doc.observacoes}"
                        </p>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Doc: {doc.dataDocumento.split('-').reverse().join('/')}</span>
                      <span>{doc.tamanhoKb} KB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX / FULL-SCREEN VIEWER MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-2 sm:p-4">
          {/* Lightbox Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white pb-3 border-b border-slate-800 gap-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-cyan-500 text-slate-950 shrink-0">
                  {viewingDoc.registroOHB}
                </span>
                <h3 className="font-bold text-xs sm:text-sm truncate">{viewingDoc.titulo}</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">
                {viewingDoc.patientName ? `Paciente: ${viewingDoc.patientName}` : 'Paciente vinculado por Registro OHB'}
                {viewingDoc.nomeMae ? ` • Mãe: ${viewingDoc.nomeMae}` : ''}
                {!viewingDoc.patientId ? ' • (Ficha Física em Papel)' : ''}
                {` • CPF: ${viewingDoc.cpf || 'Não informado'} • Data: ${viewingDoc.dataDocumento}`}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Girar 90 graus"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <a
                href={viewingDoc.imageUrl}
                download={`${viewingDoc.registroOHB}_${viewingDoc.titulo}.${isPdfDataUrl(viewingDoc.imageUrl) ? 'pdf' : 'png'}`}
                className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold cursor-pointer"
                title="Baixar arquivo original"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => handleDeleteDoc(viewingDoc.id)}
                className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white cursor-pointer"
                title="Excluir do acervo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 ml-1 sm:ml-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Canvas View */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {isPdfDataUrl(viewingDoc.imageUrl) ? (
              <iframe
                src={viewingDoc.imageUrl}
                title={viewingDoc.titulo}
                className="w-full max-w-4xl h-[78vh] bg-white rounded-lg shadow-2xl border-0"
              />
            ) : (
              <div
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="max-w-4xl max-h-[80vh] shadow-2xl rounded-lg overflow-hidden bg-white"
              >
                <img
                  src={viewingDoc.imageUrl}
                  alt={viewingDoc.titulo}
                  className="w-auto h-auto max-h-[75vh] object-contain"
                />
              </div>
            )}
          </div>

          {/* Lightbox Footer Note */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Zoom: {Math.round(zoomLevel * 100)}% | Rotação: {rotation}° | Observações: {viewingDoc.observacoes || 'Nenhuma'}
          </div>
        </div>
      )}

      {/* Embedded Camera Scanner Modal */}
      {isCameraScannerOpen && (
        <CameraScannerModal
          isOpen={isCameraScannerOpen}
          onClose={() => setIsCameraScannerOpen(false)}
          onSave={handleScannerSaved}
          title={
            recordMode === 'novo_papel'
              ? 'Escanear Prontuário em Papel'
              : 'Escanear Documento para o Acervo'
          }
          subtitle={
            recordMode === 'novo_papel'
              ? (newPatientName ? `${newPatientName} • ${newNomeMae ? `Mãe: ${newNomeMae}` : 'Novo Acervo'}` : 'Novo Prontuário em Papel (Sem Cadastro Prévio)')
              : (targetPatient
                  ? `${targetPatient.nome} • ${targetPatient.registroOHB}`
                  : 'Digitalização para o Acervo Digital')
          }
          defaultDocType={docType}
          defaultTitle={
            docTitle ||
            (recordMode === 'novo_papel'
              ? (newPatientName ? `Prontuário Antigo - ${newPatientName}` : 'Prontuário Físico Escaneado')
              : (targetPatient ? `Prontuário Escaneado - ${targetPatient.nome}` : 'Documento Escaneado'))
          }
          patientOHB={recordMode === 'novo_papel' ? (newRegistroFisico || 'PAPEL') : targetOHB}
          patientName={recordMode === 'novo_papel' ? newPatientName : targetPatient?.nome}
          defaultNomeMae={recordMode === 'novo_papel' ? newNomeMae : targetPatient?.nomeMae}
          allowEditPatientIdentity={recordMode === 'novo_papel'}
        />
      )}
    </div>
  );
};
