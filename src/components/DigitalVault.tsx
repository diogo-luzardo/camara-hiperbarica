import React, { useState, useRef, useEffect } from 'react';
import { FolderArchive, Upload, Search, ZoomIn, ZoomOut, RotateCw, Download, Trash2, X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Filter, Eye } from 'lucide-react';
import { DigitalizedDocument, Patient } from '../types';
import { StorageService } from '../services/storage';

interface DigitalVaultProps {
  documents: DigitalizedDocument[];
  patients: Patient[];
  onRefreshDocs: () => void;
  selectedPatientOHB?: string;
}

export const DigitalVault: React.FC<DigitalVaultProps> = ({
  documents,
  patients,
  onRefreshDocs,
  selectedPatientOHB,
}) => {
  const [searchTerm, setSearchTerm] = useState(selectedPatientOHB || '');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [isUploading, setIsUploading] = useState(false);

  // Form State for new upload
  const [targetOHB, setTargetOHB] = useState(selectedPatientOHB || '');
  const [targetCPF, setTargetCPF] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<DigitalizedDocument['tipo']>('prontuario_antigo');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');
  const [previewImages, setPreviewImages] = useState<{ name: string; dataUrl: string; sizeKb: number }[]>([]);

  // Lightbox Modal State
  const [viewingDoc, setViewingDoc] = useState<DigitalizedDocument | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When patient selection changes
  useEffect(() => {
    if (selectedPatientOHB) {
      setSearchTerm(selectedPatientOHB);
      setTargetOHB(selectedPatientOHB);
      const pat = patients.find((p) => p.registroOHB === selectedPatientOHB);
      if (pat) setTargetCPF(pat.cpf);
    }
  }, [selectedPatientOHB, patients]);

  const handlePatientSelectChange = (ohb: string) => {
    setTargetOHB(ohb);
    const pat = patients.find((p) => p.registroOHB === ohb);
    if (pat) {
      setTargetCPF(pat.cpf);
      if (!docTitle) {
        setDocTitle(`Prontuário Antigo Escaneado - ${pat.nome}`);
      }
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target?.result as string;
        setPreviewImages((prev) => [
          ...prev,
          {
            name: file.name,
            dataUrl,
            sizeKb: Math.round(file.size / 1024),
          },
        ]);
        if (!docTitle) {
          setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveUploads = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOHB.trim()) {
      alert('Informe o Registro OHB para vincular os documentos.');
      return;
    }
    if (previewImages.length === 0) {
      alert('Selecione pelo menos uma imagem para enviar.');
      return;
    }

    setIsUploading(true);
    try {
      const patient = patients.find(
        (p) => p.registroOHB.trim().toUpperCase() === targetOHB.trim().toUpperCase()
      );

      for (let i = 0; i < previewImages.length; i++) {
        const item = previewImages[i];
        const newDoc: DigitalizedDocument = {
          id: `doc-${Date.now()}-${i}`,
          registroOHB: targetOHB.trim().toUpperCase(),
          cpf: targetCPF || (patient ? patient.cpf : ''),
          patientId: patient?.id,
          patientName: patient?.nome,
          titulo: previewImages.length === 1 ? docTitle : `${docTitle} (Pág. ${i + 1})`,
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
      onRefreshDocs();
      alert(`${previewImages.length} documento(s) arquivado(s) e vinculado(s) ao Registro ${targetOHB} com sucesso!`);
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

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    const matchSearch =
      !cleanSearch ||
      doc.registroOHB.toLowerCase().includes(cleanSearch) ||
      doc.cpf.replace(/\D/g, '').includes(cleanSearch.replace(/\D/g, '')) ||
      (doc.patientName && doc.patientName.toLowerCase().includes(cleanSearch)) ||
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
            {/* Vinculação do Registro OHB */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registro OHB para Vinculação <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={targetOHB}
                  onChange={(e) => setTargetOHB(e.target.value)}
                  placeholder="Ex: OHB-1082"
                  className="w-full text-xs font-mono font-bold text-cyan-900 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 uppercase"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Identificador central de arquivos da clínica</p>
            </div>

            {/* Ou selecione paciente existente */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vincular a Paciente Cadastrado</label>
              <select
                value={targetOHB}
                onChange={(e) => handlePatientSelectChange(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
              >
                <option value="">-- Selecione ou digite acima --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.registroOHB}>
                    {p.registroOHB} - {p.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* CPF */}
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

            {/* Upload Area (Drag & Drop / Selector) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Selecionar Imagens / Escaneamentos</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-slate-50 hover:bg-cyan-50/30 rounded-xl p-4 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFilesSelected}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-700 text-xs">Arraste ou clique para selecionar fotos</p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG, WebP (Suporta múltiplas páginas)</p>
              </div>
            </div>

            {/* Previews */}
            {previewImages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>{previewImages.length} imagem(ns) selecionada(s)</span>
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
                      <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
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
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por Registro OHB (ex: OHB-1082), CPF ou Nome..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Tipo:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
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
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col group"
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
                    <img
                      src={doc.imageUrl}
                      alt={doc.titulo}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-opacity">
                        <Eye className="w-3.5 h-3.5 text-cyan-600" />
                        Visualizar Detalhes
                      </span>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 text-cyan-300 backdrop-blur-xs">
                        {doc.registroOHB}
                      </span>
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
                        <p className="text-slate-600 text-[11px] truncate font-medium mt-0.5">
                          {doc.patientName}
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
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4">
          {/* Lightbox Toolbar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-cyan-500 text-slate-950">
                  {viewingDoc.registroOHB}
                </span>
                <h3 className="font-bold text-sm">{viewingDoc.titulo}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {viewingDoc.patientName ? `Paciente: ${viewingDoc.patientName}` : 'Paciente vinculado por Registro OHB'} • CPF: {viewingDoc.cpf || 'Não informado'} • Data Doc: {viewingDoc.dataDocumento}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Girar 90 graus"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <a
                href={viewingDoc.imageUrl}
                download={`${viewingDoc.registroOHB}_${viewingDoc.titulo}.png`}
                className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                title="Baixar imagem original"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => handleDeleteDoc(viewingDoc.id)}
                className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white"
                title="Excluir do acervo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Canvas View */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
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
          </div>

          {/* Lightbox Footer Note */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Zoom: {Math.round(zoomLevel * 100)}% | Rotação: {rotation}° | Observações: {viewingDoc.observacoes || 'Nenhuma'}
          </div>
        </div>
      )}
    </div>
  );
};
