import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  ExternalLink,
  Info,
  Flame,
  Activity,
  HeartPulse,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  CID_CATALOG_DATA,
  COMMON_CID_OHB_EXTENDED,
  WHO_CHAPTERS,
  TOTAL_WHO_DISEASES_COUNT,
  resolveDynamicCid,
} from '../data/cidDataset';
import { CidCatalogEntry } from '../types';

interface CidLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSelectCid?: (cid: CidCatalogEntry) => void;
}

// Lista oficial de códigos CID-10 com cobertura Rol ANS / Diretriz CFM 1.457/95 para OHB
const OHB_APPROVED_CID10 = new Set([
  'E11.5',
  'E10.5',
  'M72.6',
  'M86.9',
  'M86.0',
  'T66',
  'N30.4',
  'K62.7',
  'M87.1',
  'T79.0',
  'T70.3',
  'T79.6',
  'T79.A',
  'T86.8',
  'I83.0',
  'I83.2',
  'I70.2',
  'L89',
  'L98.4',
  'A48.0',
  'T81.3',
  'T81.4',
  'T87.4',
  'T20-T32',
  'T58',
  'B44.9',
  'H90.3',
  'H34.1',
  'M87.0',
  'B95.6',
  'B96.5',
  'A46',
]);

type FilterCategory =
  | 'todos'
  | 'ohb'
  | 'feridas'
  | 'infeccoes'
  | 'cardio'
  | 'neuro'
  | 'respiratorio'
  | 'ortopedia'
  | 'onco'
  | 'digestivo'
  | 'actinicas'
  | 'trauma';

export const CidLookupModal: React.FC<CidLookupModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onSelectCid,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('todos');
  const [selectedChapter, setSelectedChapter] = useState<string>('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Paginação: Inicia com 5 itens por página por padrão conforme solicitado
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialQuery);
      setCurrentPage(1);
    }
  }, [isOpen, initialQuery]);

  // Resetar página quando a busca, capítulo ou categoria mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedChapter, itemsPerPage]);

  // Tecla Esc para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const isOhbIndication = (entry: CidCatalogEntry): boolean => {
    if (entry.codigoCid10 && OHB_APPROVED_CID10.has(entry.codigoCid10)) {
      return true;
    }
    const txt = (entry.nome + ' ' + (entry.sinonimos || '')).toLowerCase();
    return (
      txt.includes('diabético') ||
      txt.includes('fournier') ||
      txt.includes('osteomielite') ||
      txt.includes('radiodermite') ||
      txt.includes('actínica') ||
      txt.includes('embolia gasosa') ||
      txt.includes('descompressiva') ||
      txt.includes('retalho') ||
      txt.includes('enxerto') ||
      txt.includes('gangrena') ||
      txt.includes('esfacelo') ||
      txt.includes('surdez súbita') ||
      txt.includes('monóxido de carbono')
    );
  };

  const filteredCids = useMemo(() => {
    const rawSearch = searchTerm.trim().toLowerCase();
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const searchNormalized = normalize(rawSearch);

    const matches = CID_CATALOG_DATA.filter((item) => {
      // 1. Filtro por Capítulo OMS
      if (selectedChapter !== 'todos') {
        const itemCap = item.capitulo || '';
        if (!itemCap.startsWith(selectedChapter)) {
          return false;
        }
      }

      // 2. Filtro de Categoria Clínica
      if (selectedCategory === 'ohb' && !isOhbIndication(item)) return false;
      if (selectedCategory === 'feridas') {
        const txt = (item.nome + ' ' + (item.sinonimos || '')).toLowerCase();
        if (
          !txt.includes('úlcera') &&
          !txt.includes('ferida') &&
          !txt.includes('diabético') &&
          !txt.includes('escara') &&
          !txt.includes('deiscência')
        ) {
          return false;
        }
      }
      if (selectedCategory === 'infeccoes') {
        const txt = (item.nome + ' ' + (item.sinonimos || '')).toLowerCase();
        if (
          !txt.includes('infecc') &&
          !txt.includes('fascite') &&
          !txt.includes('fournier') &&
          !txt.includes('osteomielite') &&
          !txt.includes('gangrena') &&
          !txt.includes('celulite') &&
          !txt.includes('sepse') &&
          !txt.includes('mrsa')
        ) {
          return false;
        }
      }
      if (selectedCategory === 'cardio') {
        const cap = item.capitulo || '';
        const txt = (item.nome + ' ' + (item.sinonimos || '')).toLowerCase();
        if (!cap.includes('circulatório') && !txt.includes('cardíac') && !txt.includes('arterial') && !txt.includes('venosa')) {
          return false;
        }
      }
      if (selectedCategory === 'neuro') {
        const cap = item.capitulo || '';
        const txt = (item.nome + ' ' + (item.sinonimos || '')).toLowerCase();
        if (!cap.includes('nervoso') && !txt.includes('avc') && !txt.includes('cerebral')) {
          return false;
        }
      }
      if (selectedCategory === 'respiratorio') {
        const cap = item.capitulo || '';
        if (!cap.includes('respiratório')) return false;
      }
      if (selectedCategory === 'ortopedia') {
        const cap = item.capitulo || '';
        const txt = (item.nome + ' ' + (item.sinonimos || '')).toLowerCase();
        if (!cap.includes('musculoesquelético') && !txt.includes('ósseo') && !txt.includes('fratura')) {
          return false;
        }
      }
      if (selectedCategory === 'onco') {
        const cap = item.capitulo || '';
        if (!cap.includes('Neoplasias')) return false;
      }
      if (selectedCategory === 'digestivo') {
        const cap = item.capitulo || '';
        if (!cap.includes('digestivo')) return false;
      }
      if (selectedCategory === 'actinicas') {
        const txt = (item.nome + ' ' + (item.sinonimos || '')).toLowerCase();
        if (
          !txt.includes('radia') &&
          !txt.includes('actínica') &&
          !txt.includes('radiodermite') &&
          !txt.includes('osteorradionecrose') &&
          !txt.includes('cistite actínica')
        ) {
          return false;
        }
      }
      if (selectedCategory === 'trauma') {
        const txt = (item.nome + ' ' + (item.sinonimos || '')).toLowerCase();
        if (
          !txt.includes('traum') &&
          !txt.includes('embolia') &&
          !txt.includes('descompress') &&
          !txt.includes('esmagamento') &&
          !txt.includes('compartimental') &&
          !txt.includes('queimadura')
        ) {
          return false;
        }
      }

      // 3. Busca Textual por Códigos e Termos
      if (!searchNormalized) return true;

      const cid11Norm = normalize(item.codigoCid11);
      const cid10Norm = normalize(item.codigoCid10 || '');
      const nameNorm = normalize(item.nome);
      const capNorm = normalize(item.capitulo || '');
      const synNorm = normalize(item.sinonimos || '');

      return (
        cid11Norm.includes(searchNormalized) ||
        cid10Norm.includes(searchNormalized) ||
        nameNorm.includes(searchNormalized) ||
        capNorm.includes(searchNormalized) ||
        synNorm.includes(searchNormalized)
      );
    });

    // Se a busca textual não encontrou correspondente estático, resolve dinamicamente o código no universo dos 14 mil CIDs
    if (matches.length === 0 && searchNormalized.length >= 2) {
      const dynamicMatch = resolveDynamicCid(searchTerm);
      if (dynamicMatch) {
        return [dynamicMatch];
      }
    }

    return matches;
  }, [searchTerm, selectedCategory, selectedChapter]);

  // Cálculos de Paginação
  const totalItems = filteredCids.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCids = filteredCids.slice(startIndex, endIndex);

  // Gera páginas para os botões numéricos
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: number[] = [];
    pages.push(1);
    let start = Math.max(2, validCurrentPage - 1);
    let end = Math.min(totalPages - 1, validCurrentPage + 1);

    if (validCurrentPage <= 3) {
      end = 4;
    }
    if (validCurrentPage >= totalPages - 2) {
      start = totalPages - 3;
    }

    if (start > 2) {
      pages.push(-1); // Reticências
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages - 1) {
      pages.push(-1); // Reticências
    }
    pages.push(totalPages);
    return pages;
  }, [totalPages, validCurrentPage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/40 flex items-center justify-center text-white shadow-md shadow-cyan-900/40 shrink-0">
              <BookOpen className="w-5 h-5 text-cyan-200" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Outfit'] text-white">
                  Consulta de Códigos CID-11 & CID-10
                </h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 tracking-wider shadow-2xs">
                  {TOTAL_WHO_DISEASES_COUNT.toLocaleString('pt-BR')} Doenças OMS
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-cyan-700/60 hidden sm:inline">
                  Tabela De-Para Bidirecional
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate mt-0.5">
                Catálogo Geral Unificado da OMS — Consulta de todas as patologias por capítulo, códigos e Rol ANS / CFM para Oxigenoterapia Hiperbárica.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Guidance Banner */}
        <div className="bg-cyan-50/80 border-b border-cyan-200/80 px-4 sm:px-6 py-2.5 flex items-start sm:items-center justify-between gap-3 text-xs text-cyan-950">
          <div className="flex items-start sm:items-center gap-2 min-w-0">
            <Info className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-[11px] sm:text-xs leading-relaxed text-cyan-900">
              <strong>Catálogo Geral:</strong> Navegue pelos <strong>24 Capítulos da OMS</strong> ou pesquise qualquer código de <strong>A00 a Z99</strong>. No prontuário clínico utilize o <strong>CID-11</strong> e no faturamento TUSS mantenha o <strong>CID-10</strong>.
            </p>
          </div>
        </div>

        {/* Search Bar & Chapter Selector */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 space-y-2.5">
          {/* Barra de Busca + Seletor de Capítulos da OMS */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquise por qualquer doença ou código de A00 a Z99 (ex: 5A14, E11.5, I10, J45, M54, AVC, Infarto)..."
                className="w-full text-xs pl-10 pr-9 py-2.5 rounded-xl border-2 border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 bg-white font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown de Capítulos da OMS */}
            <div className="sm:w-72 shrink-0">
              <select
                value={selectedChapter}
                onChange={(e) => {
                  setSelectedChapter(e.target.value);
                  if (e.target.value !== 'todos') setSelectedCategory('todos');
                }}
                className="w-full text-xs py-2.5 px-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-semibold focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none cursor-pointer"
                title="Filtrar por Capítulo da OMS (24 capítulos disponíveis)"
              >
                <option value="todos">Todos os 24 Capítulos da OMS ({TOTAL_WHO_DISEASES_COUNT.toLocaleString('pt-BR')} doenças)</option>
                {WHO_CHAPTERS.map((ch) => (
                  <option key={ch.id} value={ch.numero}>
                    Cap. {ch.numero} ({ch.faixaCid10}): {ch.titulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chips de Categorias Clínicas Rápidas (Scroll sem barra nativa) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 -my-1 text-xs select-none">
            <span className="text-slate-400 text-[11px] font-semibold shrink-0 mr-1 hidden sm:inline">
              Filtro Rápido:
            </span>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('todos');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'todos' && selectedChapter === 'todos'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              Todos ({TOTAL_WHO_DISEASES_COUNT.toLocaleString('pt-BR')})
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ohb');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                selectedCategory === 'ohb'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Indicações Rol ANS (OHB)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('feridas');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'feridas'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              Pé Diabético & Feridas
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('infeccoes');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'infeccoes'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              Infecções & Necroses
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('cardio');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'cardio'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              Cardiovascular
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('neuro');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'neuro'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              Neurologia & AVC
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('respiratorio');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'respiratorio'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              Respiratório
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ortopedia');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'ortopedia'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              Ortopedia & Osso
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('actinicas');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'actinicas'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              Radiação & Actínicas
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('trauma');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'trauma'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              Trauma & Embolia
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('onco');
                setSelectedChapter('todos');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'onco'
                  ? 'bg-pink-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              Oncologia
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3">
          {totalItems === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">
                Nenhum código CID pré-indexado para "{searchTerm}"
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Tente buscar pelo código CID-10 (ex: "E11.5", "I10", "J45"), código CID-11 (ex: "5A14", "1B74") ou nome clínico (ex: "pé diabético", "osteomielite", "infarto", "refluxo").
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('todos');
                  setSelectedChapter('todos');
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Ver Catálogo Completo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Barra de Informações de Paginação & Contagem */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 px-1">
                <div>
                  <span>
                    Exibindo patologias <strong className="text-slate-900 font-bold">{startIndex + 1}</strong> a <strong className="text-slate-900 font-bold">{endIndex}</strong> de <strong className="text-slate-900 font-bold">{totalItems}</strong> correspondentes
                  </span>
                  <span className="text-slate-400 text-[11px] ml-1.5 hidden md:inline">
                    (Página {validCurrentPage} de {totalPages})
                  </span>
                </div>

                {/* Seletor de Itens por Página (5 por padrão) */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] text-slate-400">Por página:</span>
                  {[5, 10, 20].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                        itemsPerPage === size
                          ? 'bg-cyan-600 text-white shadow-2xs'
                          : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300'
                      }`}
                      title={`Exibir ${size} patologias por página`}
                    >
                      {size}
                    </button>
                  ))}
                  <span className="text-[11px] text-slate-400 ml-2">Clique para copiar</span>
                </div>
              </div>

              {/* Lista dos 5 itens da página atual */}
              <div className="space-y-2.5">
                {paginatedCids.map((entry, idx) => {
                  const isOHB = isOhbIndication(entry);
                  const cid11Key = `cid11-${validCurrentPage}-${idx}-${entry.codigoCid11}`;
                  const cid10Key = `cid10-${validCurrentPage}-${idx}-${entry.codigoCid10}`;

                  return (
                    <div
                      key={`${entry.codigoCid11}-${entry.codigoCid10 || idx}-${validCurrentPage}`}
                      className="p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200/80 hover:border-cyan-400 bg-white hover:bg-gradient-to-r hover:from-white hover:to-cyan-50/30 transition-all duration-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        {/* Códigos e Badges de Classificação */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* CID-11 Badge com botão de cópia */}
                          <div className="inline-flex items-center gap-1 bg-cyan-950 text-cyan-300 border border-cyan-800/80 rounded-lg px-2.5 py-1 font-mono text-xs font-bold shadow-2xs">
                            <span className="text-[10px] text-cyan-400/80 uppercase font-sans font-semibold">
                              CID-11:
                            </span>
                            <span className="text-white text-xs">{entry.codigoCid11}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(entry.codigoCid11, cid11Key)}
                              title="Copiar código CID-11"
                              className="p-0.5 hover:bg-cyan-800 rounded text-cyan-300 hover:text-white transition-colors cursor-pointer ml-0.5"
                            >
                              {copiedId === cid11Key ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* CID-10 Equivalente */}
                          {entry.codigoCid10 && (
                            <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1 font-mono text-xs font-bold shadow-2xs">
                              <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
                                CID-10:
                              </span>
                              <span className="text-slate-900 text-xs">{entry.codigoCid10}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(entry.codigoCid10!, cid10Key)}
                                title="Copiar código CID-10"
                                className="p-0.5 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors cursor-pointer ml-0.5"
                              >
                                {copiedId === cid10Key ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}

                          {/* Indicador Rol ANS / CFM */}
                          {isOHB && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Indicação Rol ANS / CFM 1.457</span>
                            </span>
                          )}

                          {/* Seletor rápido para preencher prontuário/cadastro caso callback exista */}
                          {onSelectCid && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCid(entry);
                                onClose();
                              }}
                              className="text-[10px] bg-cyan-50 hover:bg-cyan-600 text-cyan-800 hover:text-white border border-cyan-300 hover:border-cyan-600 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ml-auto"
                            >
                              Usar no Prontuário
                            </button>
                          )}
                        </div>

                        {/* Nome da Doença */}
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-950 transition-colors">
                          {entry.nome}
                        </h4>

                        {/* Capítulo */}
                        {entry.capitulo && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="font-semibold text-slate-600">Capítulo:</span>
                            <span>{entry.capitulo}</span>
                          </p>
                        )}

                        {/* Sinônimos & Termos Relacionados */}
                        {entry.sinonimos && (
                          <p className="text-[10px] text-slate-400">
                            <strong className="text-slate-500 font-semibold">Termos & Sinônimos:</strong>{' '}
                            <span className="italic">{entry.sinonimos}</span>
                          </p>
                        )}
                      </div>

                      {/* Ação Rápida: Copiar Descrição Completa */}
                      <div className="shrink-0 flex items-center gap-1.5 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              `CID-11: ${entry.codigoCid11} | CID-10: ${entry.codigoCid10 || 'N/A'} - ${entry.nome}`,
                              `full-${validCurrentPage}-${idx}`
                            )
                          }
                          className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-cyan-700 bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                          title="Copiar linha formatada para evolução clínica ou laudo"
                        >
                          {copiedId === `full-${validCurrentPage}-${idx}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              <span className="text-emerald-700 font-bold">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Descrição</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barra de Controles de Paginação (Visível sempre que houver mais de 1 página) */}
              {totalPages > 1 && (
                <div className="pt-3 pb-1 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
                  <div className="text-xs text-slate-500">
                    Página <strong className="text-slate-800 font-bold">{validCurrentPage}</strong> de{' '}
                    <strong className="text-slate-800 font-bold">{totalPages}</strong>
                  </div>

                  {/* Botões de Navegação de Páginas */}
                  <div className="flex items-center gap-1">
                    {/* Botão Primeira Página */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      disabled={validCurrentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors cursor-pointer"
                      title="Primeira página"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Botão Anterior */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={validCurrentPage === 1}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      title="Página anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Anterior</span>
                    </button>

                    {/* Botões Numéricos de Página */}
                    <div className="flex items-center gap-1 px-1">
                      {pageNumbers.map((p, pIdx) =>
                        p === -1 ? (
                          <span key={`ellipsis-${pIdx}`} className="px-1 text-slate-400 text-xs">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${p}`}
                            type="button"
                            onClick={() => setCurrentPage(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              validCurrentPage === p
                                ? 'bg-cyan-600 text-white shadow-2xs font-extrabold scale-105'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    {/* Botão Próxima */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={validCurrentPage === totalPages}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      title="Próxima página"
                    >
                      <span className="hidden xs:inline">Próxima</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Botão Última Página */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={validCurrentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors cursor-pointer"
                      title="Última página"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Catálogo Oficial OMS 2026 / SUS & ANS — Base completa de <strong>{TOTAL_WHO_DISEASES_COUNT.toLocaleString('pt-BR')}</strong> diagnósticos clínicos em <strong>24 capítulos</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              Fechar Consulta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
