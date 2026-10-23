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

export type ScannerFilterMode = 'color' | 'bw' | 'grayscale';

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
  }) => void;
  title?: string;
  subtitle?: string;
  defaultDocType?: 'prontuario_antigo' | 'ficha_atendimento' | 'foto_lesao' | 'exame_laudo' | 'outro';
  defaultTitle?: string;
  sessionId?: string;
  patientOHB?: string;
  patientName?: string;
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
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload'>('camera');
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);

  // Form metadata
  const [docTitle, setDocTitle] = useState(defaultTitle);
  const [docType, setDocType] = useState<'prontuario_antigo' | 'ficha_atendimento' | 'foto_lesao' | 'exame_laudo' | 'outro'>(defaultDocType);
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');

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

  // Pre-fill default title when props change
  useEffect(() => {
    if (defaultTitle) {
      setDocTitle(defaultTitle);
    } else if (patientName) {
      setDocTitle(
        defaultDocType === 'prontuario_antigo'
          ? `Ficha Física Antiga - ${patientName}`
          : `Prontuário da Sessão - ${patientName}`
      );
    }
  }, [defaultTitle, patientName, defaultDocType, isOpen]);

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

  // Apply filters to canvas image (Color, Document B&W high contrast, Grayscale)
  const applyFilterToCanvas = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filter: ScannerFilterMode
  ) => {
    if (filter === 'color') return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Perceptual luminance
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      if (filter === 'grayscale') {
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      } else if (filter === 'bw') {
        // High contrast document filter (CamScanner style):
        // Enhances ink readability, removes paper shadows and yellowish tinge
        const contrastFactor = 1.6;
        let enhanced = (gray - 128) * contrastFactor + 140;
        if (enhanced > 255) enhanced = 255;
        if (enhanced < 0) enhanced = 0;

        // Binarize slightly for crisp text
        const finalVal = enhanced < 115 ? Math.max(0, enhanced * 0.7) : Math.min(255, enhanced * 1.08);

        data[i] = finalVal;
        data[i + 1] = finalVal;
        data[i + 2] = finalVal;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  // Snap photo from live video feed
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply document enhancement filter
    applyFilterToCanvas(ctx, canvas.width, canvas.height, currentFilter);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

    const newPage: ScannedPage = {
      id: `page-${Date.now()}-${pages.length + 1}`,
      dataUrl,
      sizeKb,
      filter: currentFilter,
      rotation: 0,
    };

    setPages((prev) => [...prev, newPage]);
    setSelectedPageIndex(pages.length);
  };

  // Rotate a scanned page by 90deg
  const handleRotatePage = (index: number) => {
    const target = pages[index];
    if (!target) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Swap width and height for 90deg rotation
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      const sizeKb = Math.round((rotatedDataUrl.length * 3) / 4 / 1024);

      setPages((prev) =>
        prev.map((p, idx) =>
          idx === index
            ? { ...p, dataUrl: rotatedDataUrl, sizeKb, rotation: (p.rotation + 90) % 360 }
            : p
        )
      );
    };
    img.src = target.dataUrl;
  };

  // Re-apply filter to an existing captured page
  const handleChangePageFilter = (index: number, newFilter: ScannerFilterMode) => {
    const target = pages[index];
    if (!target || target.filter === newFilter) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      applyFilterToCanvas(ctx, canvas.width, canvas.height, newFilter);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

      setPages((prev) =>
        prev.map((p, idx) => (idx === index ? { ...p, dataUrl, sizeKb, filter: newFilter } : p))
      );
    };
    img.src = target.dataUrl;
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
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const rawDataUrl = loadEvt.target?.result as string;

        // Process image to normalize orientation and apply default filter
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Limit max dimension to 2400px for optimal speed and memory
          const maxDim = 2400;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(img, 0, 0, width, height);
          if (currentFilter !== 'color') {
            applyFilterToCanvas(ctx, width, height, currentFilter);
          }

          const processedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          const sizeKb = Math.round((processedDataUrl.length * 3) / 4 / 1024);

          setPages((prev) => [
            ...prev,
            {
              id: `page-${Date.now()}-${prev.length + 1}`,
              dataUrl: processedDataUrl,
              sizeKb,
              filter: currentFilter,
              rotation: 0,
            },
          ]);
        };
        img.src = rawDataUrl;

        if (!docTitle) {
          setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleFinishSave = () => {
    if (pages.length === 0) {
      alert('Nenhuma página foi escaneada ou importada ainda.');
      return;
    }
    if (!docTitle.trim()) {
      alert('Informe um título para o documento.');
      return;
    }

    onSave(pages, {
      titulo: docTitle.trim(),
      tipo: docType,
      dataDocumento: docDate,
      observacoes: observacoes.trim(),
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

          {/* Enhancement filter pills */}
          <div className="hidden sm:flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Filtro:
            </span>
            <button
              type="button"
              onClick={() => setCurrentFilter('bw')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                currentFilter === 'bw'
                  ? 'bg-cyan-500 text-slate-950 shadow-2xs'
                  : 'text-slate-300 bg-slate-900 hover:bg-slate-700'
              }`}
              title="Filtro de Alto Contraste para Documento (Clareia o papel e escurece a tinta)"
            >
              Documento P&B
            </button>
            <button
              type="button"
              onClick={() => setCurrentFilter('grayscale')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                currentFilter === 'grayscale'
                  ? 'bg-cyan-500 text-slate-950 shadow-2xs'
                  : 'text-slate-300 bg-slate-900 hover:bg-slate-700'
              }`}
            >
              Cinza
            </button>
            <button
              type="button"
              onClick={() => setCurrentFilter('color')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                currentFilter === 'color'
                  ? 'bg-cyan-500 text-slate-950 shadow-2xs'
                  : 'text-slate-300 bg-slate-900 hover:bg-slate-700'
              }`}
            >
              Colorido
            </button>
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseClean}
              className="px-4 py-2 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleFinishSave}
              disabled={pages.length === 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer ${
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
