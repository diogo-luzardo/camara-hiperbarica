/**
 * imageOptimizer.ts
 * Utilitário para equilibrar resolução e tamanho de arquivos de prontuários escaneados.
 * Garante excelente nitidez de leitura clínica enquanto economiza 85-95% de armazenamento e dados.
 */

export type ResolutionPreset = 'economico' | 'equilibrado' | 'alta';
export type ScannerFilterMode = 'bw' | 'grayscale' | 'color';

export interface PresetConfig {
  id: ResolutionPreset;
  label: string;
  shortLabel: string;
  badge: string;
  maxDimension: number;
  quality: number; // 0 a 1
  approxKb: string;
  description: string;
}

export const RESOLUTION_PRESETS: Record<ResolutionPreset, PresetConfig> = {
  economico: {
    id: 'economico',
    label: 'Econômico (~80 KB)',
    shortLabel: 'Econômico',
    badge: '~80 KB',
    maxDimension: 1024,
    quality: 0.68,
    approxKb: '~80-120 KB',
    description: 'Ultra-leve. Ideal para conexão móvel 3G/4G e economia de memória.',
  },
  equilibrado: {
    id: 'equilibrado',
    label: 'Equilibrado (~150 KB)',
    shortLabel: 'Equilibrado',
    badge: '~150 KB',
    maxDimension: 1400,
    quality: 0.76,
    approxKb: '~130-220 KB',
    description: 'Recomendado. Nitidez perfeita de leitura de prontuário com baixo consumo.',
  },
  alta: {
    id: 'alta',
    label: 'Alta Nitidez (~350 KB)',
    shortLabel: 'Alta',
    badge: '~350 KB',
    maxDimension: 1800,
    quality: 0.84,
    approxKb: '~300-450 KB',
    description: 'Máxima fidelidade para fichas antigas com letras miúdas ou fotos de lesões.',
  },
};

export interface OptimizeOptions {
  preset?: ResolutionPreset;
  maxDimension?: number;
  quality?: number;
  filter?: ScannerFilterMode;
  rotation?: number; // 0, 90, 180, 270
}

export interface OptimizedImageResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
  originalSizeKb?: number;
  savedPercent?: number;
}

/**
 * Aplica filtros de processamento de imagem clínica no contexto Canvas:
 * - 'bw': Filtro CamScanner (fundo do papel branco/limpo, caneta e carimbos com contraste reforçado)
 * - 'grayscale': Escala de cinza perceptual
 * - 'color': Cores naturais preservadas
 */
export function applyCanvasFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: ScannerFilterMode
): void {
  if (filter === 'color') return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Luminância perceptual
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (filter === 'grayscale') {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else if (filter === 'bw') {
      // Realce de alto contraste para documento impresso ou manuscrito:
      // Remove tons amarelados/acinzentados de fundo do papel e destaca a tinta
      const contrastFactor = 1.6;
      let enhanced = (gray - 128) * contrastFactor + 140;
      if (enhanced > 255) enhanced = 255;
      if (enhanced < 0) enhanced = 0;

      // Suave binarização para leitura clínica
      const finalVal = enhanced < 118 ? Math.max(0, enhanced * 0.7) : Math.min(255, enhanced * 1.08);

      data[i] = finalVal;
      data[i + 1] = finalVal;
      data[i + 2] = finalVal;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Calcula dimensões proporcionais preservando proporção de aspecto (A4, retrato ou paisagem)
 */
export function calculateScaledDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  return { width, height };
}

/**
 * Otimiza e comprime uma imagem (a partir de elemento HTMLImageElement, HTMLVideoElement ou Canvas)
 */
export function compressCanvasOrSource(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  options: OptimizeOptions = {}
): OptimizedImageResult {
  const presetConfig = RESOLUTION_PRESETS[options.preset || 'equilibrado'];
  const maxDim = options.maxDimension || presetConfig.maxDimension;
  const quality = options.quality !== undefined ? options.quality : presetConfig.quality;
  const filter = options.filter || 'bw';
  const rotation = options.rotation || 0;

  const { width: targetWidth, height: targetHeight } = calculateScaledDimensions(
    sourceWidth,
    sourceHeight,
    maxDim
  );

  const canvas = document.createElement('canvas');

  // Ajusta dimensões do canvas se houver rotação de 90° ou 270°
  const isRotated90or270 = rotation % 180 !== 0;
  canvas.width = isRotated90or270 ? targetHeight : targetWidth;
  canvas.height = isRotated90or270 ? targetWidth : targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível obter o contexto 2D do Canvas.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (rotation !== 0) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(source, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
  } else {
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  }

  if (filter !== 'color') {
    applyCanvasFilter(ctx, canvas.width, canvas.height, filter);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

  return {
    dataUrl,
    sizeKb,
    width: canvas.width,
    height: canvas.height,
  };
}

export function isPdfDataUrl(dataUrl?: string): boolean {
  if (!dataUrl) return false;
  return dataUrl.startsWith('data:application/pdf');
}

export function isPdfFile(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  );
}

/**
 * Otimiza um arquivo (File do input ou galeria).
 * Suporta imagens (JPG, PNG, WEBP, HEIC suportado pelo navegador) e arquivos PDF.
 */
export async function optimizeImageFile(
  file: File,
  options: OptimizeOptions = {}
): Promise<OptimizedImageResult> {
  if (!file || file.size === 0) {
    throw new Error(`O arquivo "${file?.name || 'selecionado'}" está vazio ou corrompido.`);
  }

  const originalSizeKb = Math.max(1, Math.round(file.size / 1024));

  // Suporte direto a arquivos PDF
  if (isPdfFile(file)) {
    const maxPdfSizeMb = 15;
    if (file.size > maxPdfSizeMb * 1024 * 1024) {
      throw new Error(
        `O arquivo PDF "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB) excede o limite máximo de ${maxPdfSizeMb} MB.`
      );
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () =>
        reject(new Error(`Não foi possível ler o arquivo PDF "${file.name}". Verifique as permissões do arquivo.`));
      reader.onload = () => {
        let dataUrl = reader.result as string;
        if (!dataUrl) {
          reject(new Error(`O arquivo PDF "${file.name}" não pôde ser carregado.`));
          return;
        }
        // Garante que o MIME type seja data:application/pdf caso o SO/navegador envie application/octet-stream
        if (!dataUrl.startsWith('data:application/pdf') && dataUrl.includes(';base64,')) {
          dataUrl = `data:application/pdf;base64,${dataUrl.split(';base64,')[1]}`;
        }
        resolve({
          dataUrl,
          sizeKb: originalSizeKb,
          width: 600,
          height: 850,
          originalSizeKb,
          savedPercent: 0,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // Validação de tipo para arquivos que não são PDF nem imagem
  if (
    file.type &&
    !file.type.startsWith('image/') &&
    ! /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name)
  ) {
    throw new Error(
      `Formato não suportado para "${file.name}". Selecione uma foto (JPG, PNG, WEBP) ou documento PDF.`
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error(`Erro ao ler o arquivo "${file.name}".`));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () =>
        reject(
          new Error(
            `Não foi possível abrir "${file.name}". O arquivo pode estar corrompido ou em um formato não suportado pelo navegador.`
          )
        );
      img.onload = () => {
        try {
          const result = compressCanvasOrSource(img, img.naturalWidth, img.naturalHeight, options);
          const savedPercent =
            originalSizeKb > 0
              ? Math.max(0, Math.round(((originalSizeKb - result.sizeKb) / originalSizeKb) * 100))
              : 0;

          resolve({
            ...result,
            originalSizeKb,
            savedPercent,
          });
        } catch (err) {
          reject(
            err instanceof Error
              ? err
              : new Error(`Erro ao processar a imagem "${file.name}".`)
          );
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Otimiza uma dataURL existente (re-escalar e re-comprimir)
 */
export async function optimizeDataUrl(
  dataUrl: string,
  options: OptimizeOptions = {}
): Promise<OptimizedImageResult> {
  const originalSizeKb = Math.max(1, Math.round((dataUrl.length * 3) / 4 / 1024));

  if (isPdfDataUrl(dataUrl)) {
    return {
      dataUrl,
      sizeKb: originalSizeKb,
      width: 600,
      height: 850,
      originalSizeKb,
      savedPercent: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('Formato de imagem inválido'));
    img.onload = () => {
      const result = compressCanvasOrSource(img, img.naturalWidth, img.naturalHeight, options);
      const savedPercent =
        originalSizeKb > 0
          ? Math.max(0, Math.round(((originalSizeKb - result.sizeKb) / originalSizeKb) * 100))
          : 0;

      resolve({
        ...result,
        originalSizeKb,
        savedPercent,
      });
    };
    img.src = dataUrl;
  });
}
