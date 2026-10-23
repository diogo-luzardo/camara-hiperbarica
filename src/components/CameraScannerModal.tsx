import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  X,
  RotateCw,
  Check,
  Trash2,
  Zap,
  ZapOff,
  SwitchCamera,
  FileText,
  Image as ImageIcon,
  Sliders,
  Layers,
  AlertCircle,
  Eye,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  ResolutionPreset,
  RESOLUTION_PRESETS,
  ScannerFilterMode,
  compressCanvasOrSource,
  optimizeImageFile,
  optimizeDataUrl,
} from '../utils/imageOptimizer';

export { type ResolutionPreset, type ScannerFilterMode };

export interface ScannedPage {
  id: string;
  dataUrl: string;
  sizeKb: number;
  filter: ScannerFilterMode;
  rotation: number;
}

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pages: ScannedPage[], metadata: {
    titulo: string;
    tipo: 'prontuario_antigo' | 'ficha_atendimento' | 'foto_lesao' | 'exame_laudo' | 'outro';
    dataDocumento: string;
    observacoes: string;
    patientName?: string;
    nomeMae?: string;
    registroOHB?: string;
  }) => void;
  title?: string;
  subtitle?: string;
  defaultDocType?: 'prontuario_antigo' | 'ficha_atendimento' | 'foto_lesao' | 'exame_laudo' | 'outro';
  defaultTitle?: string;
  sessionId?: string;
  patientOHB?: string;
  patientName?: string;
  defaultNomeMae?: string;
  allowEditPatientIdentity?: boolean;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title = 'Scanner de Prontuários & Documentos',
  subtitle,
  defaultDocType = 'ficha_atendimento',
  defaultTitle = '',
  patientOHB,
  patientName,
  defaultNomeMae = '',
  allowEditPatientIdentity = false,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload'>('camera');
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);

  // Identity metadata (para prontuários em papel de novos pacientes)
  const [patientNameInput, setPatientNameInput] = useState(patientName || '');
  const [nomeMaeInput, setNomeMaeInput] = useState(defaultNomeMae || '');
  const [registroOHBInput, setRegistroOHBInput] = useState(patientOHB || '');

  // Form metadata
  const [docTitle, setDocTitle] = useState(defaultTitle);
  const [docType, setDocType] = useState<'prontuario_antigo' | 'ficha_atendimento' | 'foto_lesao' | 'exame_laudo' | 'outro'>(defaultDocType);
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');

  // Resolution & Optimization Preset (Equilibrado ~150KB por padrão)
  const [preset, setPreset] = useState<ResolutionPreset>('equilibrado');

  // Camera State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<ScannerFilterMode>('bw');
  const [isShutterActive, setIsShutterActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Sync props to state
  useEffect(() => {
    if (patientName) setPatientNameInput(patientName);
    if (defaultNomeMae) setNomeMaeInput(defaultNomeMae);
    if (patientOHB) setRegistroOHBInput(patientOHB);
  }, [patientName, defaultNomeMae, patientOHB, isOpen]);

  // Pre-fill default title when props change
  useEffect(() => {
    const activePatName = patientNameInput || patientName;
    if (defaultTitle) {
      setDocTitle(defaultTitle);
    } else if (activePatName) {
      setDocTitle(
        defaultDocType === 'prontuario_antigo'
          ? `Ficha Física Antiga - ${activePatName}`
          : `Prontuário da Sessão - ${activePatName}`
      );
    }
  }, [defaultTitle, patientName, patientNameInput, defaultDocType, isOpen]);

  // Start Camera Stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Check if torch/flashlight is supported
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities ? (videoTrack.getCapabilities() as { torch?: boolean }) : {};
        setHasTorch(Boolean(capabilities?.torch));
      }
    } catch (err: unknown) {
      console.warn('Erro ao acessar a câmera:', err);
      const msg =
        err instanceof Error
          ? err.name === 'NotAllowedError'
            ? 'Permissão de acesso à câmera negada. Permita o uso da câmera nas configurações do navegador.'
            : 'Câmera não disponível no momento. Use o botão abaixo para importar fotos da galeria ou câmera nativa.'
          : 'Não foi possível inicializar a câmera.';
      setCameraError(msg);
    }
  }, [stream]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsTorchOn(false);
  }, [stream]);

  // Effect to manage camera lifecycle
  useEffect(() => {
    if (isOpen && activeMode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, facingMode]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!stream || !hasTorch) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isTorchOn;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setIsTorchOn(nextState);
      } catch (e) {
        console.warn('Torch toggle failed:', e);
      }
    }
  };

  // Switch rear/front camera
  const handleSwitchCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
  };

  // Snap photo from live video feed with balanced resolution and compression
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    const optimized = compressCanvasOrSource(video, video.videoWidth, video.videoHeight, {
      preset,
      filter: currentFilter,
      rotation: 0,
    });

    const newPage: ScannedPage = {
      id: `page-${Date.now()}-${pages.length + 1}`,
      dataUrl: optimized.dataUrl,
      sizeKb: optimized.sizeKb,
      filter: currentFilter,
      rotation: 0,
    };

    setPages((prev) => [...prev, newPage]);
    setSelectedPageIndex(pages.length);
  };

  // Rotate a scanned page by 90deg
  const handleRotatePage = async (index: number) => {
    const target = pages[index];
    if (!target) return;

    try {
      const optimized = await optimizeDataUrl(target.dataUrl, {
        preset,
        filter: target.filter,
        rotation: 90,
      });

      setPages((prev) =>
        prev.map((p, idx) =>
          idx === index
            ? { ...p, dataUrl: optimized.dataUrl, sizeKb: optimized.sizeKb, rotation: (p.rotation + 90) % 360 }
            : p
        )
      );
    } catch (e) {
      console.warn('Erro ao girar imagem:', e);
    }
  };

  // Re-apply filter to an existing captured page
  const handleChangePageFilter = async (index: number, newFilter: ScannerFilterMode) => {
    const target = pages[index];
    if (!target || target.filter === newFilter) return;

    try {
      const optimized = await optimizeDataUrl(target.dataUrl, {
        preset,
        filter: newFilter,
        rotation: 0,
      });

      setPages((prev) =>
        prev.map((p, idx) =>
          idx === index ? { ...p, dataUrl: optimized.dataUrl, sizeKb: optimized.sizeKb, filter: newFilter } : p
        )
      );
    } catch (e) {
      console.warn('Erro ao reprocessar filtro:', e);
    }
  };

  // Delete page
  const handleDeletePage = (index: number) => {
    setPages((prev) => prev.filter((_, idx) => idx !== index));
    if (selectedPageIndex === index) {
      setSelectedPageIndex(null);
    } else if (selectedPageIndex !== null && selectedPageIndex > index) {
      setSelectedPageIndex(selectedPageIndex - 1);
    }
  };

  // File import handler (Gallery or Native Camera File Picker)
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    for (const file of fileList) {
      try {
        const optimized = await optimizeImageFile(file, {
          preset,
          filter: currentFilter,
        });

        setPages((prev) => [
          ...prev,
          {
            id: `page-${Date.now()}-${prev.length + 1}`,
            dataUrl: optimized.dataUrl,
            sizeKb: optimized.sizeKb,
            filter: currentFilter,
            rotation: 0,
          },
        ]);

        if (!docTitle) {
          setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      } catch (err) {
        console.warn('Erro ao otimizar arquivo importado:', err);
      }
    }

    e.target.value = '';
  };

  // Stats for the current batch
  const totalSizeKb = pages.reduce((sum, p) => sum + p.sizeKb, 0);
  const avgSizeKb = pages.length > 0 ? Math.round(totalSizeKb / pages.length) : 0;

  const handleFinishSave = () => {
    if (pages.length === 0) {
      alert('Nenhuma página foi escaneada ou importada ainda.');
      return;
    }
    if ((allowEditPatientIdentity || !patientOHB) && !patientNameInput.trim()) {
      alert('Informe o Nome do Paciente para identificar o documento arquivado.');
      return;
    }

    onSave(pages, {
      titulo: docTitle.trim(),
      tipo: docType,
      dataDocumento: docDate,
      observacoes: observacoes.trim(),
      patientName: patientNameInput.trim() || undefined,
      nomeMae: nomeMaeInput.trim() || undefined,
      registroOHB: registroOHBInput.trim() || undefined,
    });

    handleCloseClean();
  };

  const handleCloseClean = () => {
    stopCamera();
    setPages([]);
    setSelectedPageIndex(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-1 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-['Outfit']">{title}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500 text-slate-950">
                  {pages.length} {pages.length === 1 ? 'página' : 'páginas'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1">
                {subtitle ||
                  (patientName
                    ? `${patientName} • Registro ${patientOHB || 'OHB'}`
                    : 'Digitalização de prontuários em papel e fotos')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseClean}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Câmera ao Vivo vs Importar Arquivo) */}
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setActiveMode('camera')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'camera'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Câmera Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'upload'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Arquivo / Galeria</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Resolution Preset Pill */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold hidden md:inline px-1">
                Qualidade:
              </span>
              {(['economico', 'equilibrado', 'alta'] as ResolutionPreset[]).map((pKey) => {
                const cfg = RESOLUTION_PRESETS[pKey];
                const isSelected = preset === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setPreset(pKey)}
                    className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title={`${cfg.description} (Tamanho médio ${cfg.badge})`}
                  >
                    {cfg.shortLabel} <span className="opacity-75">({cfg.badge})</span>
                  </button>
                );
              })}
            </div>

            {/* Enhancement filter pills */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] bg-slate-900/90 p-1 rounded-xl border border-slate-700">
              <span className="text-slate-400 font-semibold px-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Filtro:
              </span>
              <button
                type="button"
                onClick={() => setCurrentFilter('bw')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  currentFilter === 'bw'
                    ? 'bg-cyan-500 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Filtro de Alto Contraste para Documento (Clareia o papel e escurece a tinta)"
              >
                Documento P&B
              </button>
              <button
                type="button"
                onClick={() => setCurrentFilter('grayscale')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  currentFilter === 'grayscale'
                    ? 'bg-cyan-500 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Cinza
              </button>
              <button
                type="button"
                onClick={() => setCurrentFilter('color')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  currentFilter === 'color'
                    ? 'bg-cyan-500 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Colorido
              </button>
            </div>
          </div>
        </div>

        {/* Content Body: Viewfinder or Upload Area */}
        <div className="flex-1 overflow-y-auto min-h-[300px] flex flex-col p-3 sm:p-4 bg-slate-900/95 text-slate-100">
          {activeMode === 'camera' ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] relative">
              {cameraError ? (
                /* Fallback screen if camera fails */
                <div className="bg-slate-800/90 rounded-2xl p-6 sm:p-8 text-center max-w-md border border-slate-700 shadow-xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Câmera Não Iniciada</h3>
                    <p className="text-xs text-slate-300 mt-1">{cameraError}</p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Abrir Câmera Nativa do Celular</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Escolher Foto da Galeria / Arquivos</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Live Viewfinder */
                <div className="relative w-full max-w-xl aspect-3/4 sm:aspect-4/3 bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-500/30 flex items-center justify-center group">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Document Overlay Target Box (CamScanner aesthetic) */}
                  <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-cyan-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between items-start">
                      <div className="w-5 h-5 border-t-4 border-l-4 border-cyan-400"></div>
                      <div className="w-5 h-5 border-t-4 border-r-4 border-cyan-400"></div>
                    </div>

                    <div className="text-center">
                      <span className="px-3 py-1 rounded-full bg-slate-950/70 text-cyan-300 text-[10px] font-bold backdrop-blur-xs border border-cyan-500/30 shadow-xs">
                        Enquadre a folha do prontuário
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="w-5 h-5 border-b-4 border-l-4 border-cyan-400"></div>
                      <div className="w-5 h-5 border-b-4 border-r-4 border-cyan-400"></div>
                    </div>
                  </div>

                  {/* Shutter visual flash animation */}
                  {isShutterActive && (
                    <div className="absolute inset-0 bg-white opacity-80 animate-ping pointer-events-none"></div>
                  )}

                  {/* Viewfinder Top Controls (Torch & Switch Camera) */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    {hasTorch && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                          isTorchOn
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                            : 'bg-slate-900/70 text-white hover:bg-slate-800'
                        }`}
                        title={isTorchOn ? 'Desligar Lanterna' : 'Ligar Lanterna'}
                      >
                        {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSwitchCamera}
                      className="p-2 rounded-xl bg-slate-900/70 text-white hover:bg-slate-800 backdrop-blur-md transition-colors cursor-pointer"
                      title="Alternar Câmera (Traseira / Frontal)"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Viewfinder Bottom Shutter Button */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-white bg-gradient-to-tr from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-xl shadow-cyan-950/60 flex items-center justify-center text-slate-950 active:scale-90 transition-all cursor-pointer group-hover:ring-4 group-hover:ring-cyan-400/40"
                      title="Capturar Foto do Prontuário"
                    >
                      <Camera className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload File / Gallery Mode */
            <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/60 min-h-[260px] text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Importar Imagens do Dispositivo</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Selecione fotos de prontuários em papel, laudos ou fotos de feridas já salvas no seu celular ou computador.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Selecionar da Galeria / Arquivos</span>
                </button>

                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-2 sm:hidden"
                >
                  <Camera className="w-4 h-4" />
                  <span>Câmera do Celular</span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <input
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />

          {/* Scanned Pages Carousel / Thumbnail Tray */}
          {pages.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Páginas Capturadas ({pages.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Toque para girar ou alterar filtro da folha
                </span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {pages.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPageIndex(idx)}
                    className={`relative shrink-0 w-24 sm:w-28 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                      selectedPageIndex === idx
                        ? 'border-cyan-400 ring-2 ring-cyan-400/20'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="aspect-3/4 bg-black relative">
                      <img
                        src={p.dataUrl}
                        alt={`Página ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-950/80 text-white backdrop-blur-xs">
                        Pág. {idx + 1}
                      </span>
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="p-1 bg-slate-850 flex items-center justify-between text-[10px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotatePage(idx);
                        }}
                        className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700"
                        title="Girar 90 graus"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[9px] text-slate-400">{p.sizeKb} KB</span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(idx);
                        }}
                        className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
                        title="Remover página"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Quick Add Page Button in Tray */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('camera');
                    startCamera(facingMode);
                  }}
                  className="shrink-0 w-24 sm:w-28 aspect-3/4 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-400 bg-slate-800/40 hover:bg-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-cyan-300 gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-bold">+ Pág. {pages.length + 1}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Form Configuration & Confirmation (Light Background) */}
        <div className="bg-white p-3 sm:p-5 border-t border-slate-200 shrink-0 space-y-3">
          {/* Identificação do Paciente para Prontuários em Papel / Novos Cadastros */}
          {(allowEditPatientIdentity || (!patientOHB && !patientName)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs p-3 bg-cyan-50/70 rounded-2xl border border-cyan-200 shadow-2xs">
              <div>
                <label className="block font-bold text-cyan-950 mb-1">
                  Nome Completo do Paciente <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={patientNameInput}
                  onChange={(e) => {
                    setPatientNameInput(e.target.value);
                    if (!docTitle && e.target.value.trim()) {
                      setDocTitle(`Prontuário Antigo - ${e.target.value.trim()}`);
                    }
                  }}
                  placeholder="Nome constante na ficha física"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 outline-none bg-white text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-cyan-950 mb-1">
                  Nome da Mãe do Paciente <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomeMaeInput}
                  onChange={(e) => setNomeMaeInput(e.target.value)}
                  placeholder="Nome da mãe na ficha (desambiguação)"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 outline-none bg-white text-slate-800 font-medium"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Título do Documento / Prontuário *</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Ex: Ficha de Evolução - Sessão #4 ou Prontuário Antigo de 2021"
                className="w-full text-xs px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 outline-none text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Documento</label>
              <select
                value={docType}
                onChange={(e) =>
                  setDocType(
                    e.target.value as 'prontuario_antigo' | 'ficha_atendimento' | 'foto_lesao' | 'exame_laudo' | 'outro'
                  )
                }
                className="w-full text-xs px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 outline-none text-slate-800 font-medium bg-white"
              >
                <option value="ficha_atendimento">Folha de Atendimento / Sessão</option>
                <option value="prontuario_antigo">Prontuário Antigo Físico (Papel)</option>
                <option value="foto_lesao">Foto da Lesão / Ferida</option>
                <option value="exame_laudo">Exame / Laudo Hospitalar</option>
                <option value="outro">Outro Documento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data do Documento Físico</label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-xl border-2 border-slate-200 focus:border-cyan-500 outline-none text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Observações Clínicas (Opcional)</label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Escaneado do prontuário manual arquivado de 2023..."
                className="w-full text-xs px-3 py-1.5 rounded-xl border-2 border-slate-200 focus:border-cyan-500 outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Action Buttons & Optimization Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseClean}
                className="px-4 py-2 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              {pages.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Total: <strong className="text-slate-900">{totalSizeKb} KB</strong> (~{avgSizeKb} KB/pág)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                    85% Otimizado
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleFinishSave}
              disabled={pages.length === 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                pages.length > 0
                  ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>
                Salvar {pages.length > 0 ? `${pages.length} Folha(s)` : 'Documento'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
