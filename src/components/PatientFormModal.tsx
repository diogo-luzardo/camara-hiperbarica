import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  HeartPulse,
  User,
  MapPin,
  FileText,
  Stethoscope,
  Building2,
  UserCheck,
  Compass,
  Lock,
  Clock,
  Mail,
} from 'lucide-react';
import { Patient, CidCatalogEntry } from '../types';
import { COMMON_CID_OHB_EXTENDED } from '../data/cidDataset';
import { storageService } from '../services/storage';
import { formatCPF, isValidCPF, cleanCPF } from '../utils/cpfValidator';
import { isValidEmail, cleanEmail } from '../utils/emailValidator';
import {
  fetchAddressByCep,
  searchAddressByStreet,
  formatCEP,
  cleanCEP,
  ViaCepResult,
} from '../utils/cepService';
import { isParticular } from './CoverageBadge';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  initialPatient?: Patient | null;
  existingPatientsCount: number;
}

const COMMON_CID_OHB = [
  { code: 'E11.5', label: 'Pé Diabético Ulcerado / Gangrena' },
  { code: 'M72.6', label: 'Fascite Necrotizante / Gangrena de Fournier' },
  { code: 'M86.9', label: 'Osteomielite Crônica Refratária' },
  { code: 'T66', label: 'Lesões Actínicas / Radiodermite / Cistite Actínica' },
  { code: 'T79.0', label: 'Embolia Gasosa / Isquemia Traumática Aguda' },
  { code: 'T86.8', label: 'Comprometimento de Enxertos e Retalhos' },
  { code: 'L97', label: 'Úlcera Crônica de Membro Inferior' },
];

const COMMON_HEALTH_PLANS = [
  'Bradesco Saúde',
  'SulAmérica Saúde',
  'Amil Saúde',
  'Unimed Central',
  'NotreDame Intermédica (GNDI)',
  'Porto Seguro Saúde',
  'Prevent Senior',
  'Cassi',
  'Allianz Saúde',
  'Care Plus',
  'Sompo Saúde',
];

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPatient,
  existingPatientsCount,
}) => {
  const [activeTab, setActiveTab] = useState<'dados' | 'endereco' | 'clinico' | 'ohb'>('dados');

  // CEP Auto-Search State
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isCepSuccess, setIsCepSuccess] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  // Street Name Autocomplete (Google Maps style)
  const [streetSuggestions, setStreetSuggestions] = useState<ViaCepResult[]>([]);
  const [isStreetLoading, setIsStreetLoading] = useState(false);
  const [showStreetDropdown, setShowStreetDropdown] = useState(false);
  const streetDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // CID-11 / CID-10 Autocomplete State
  const [cidSearchQuery, setCidSearchQuery] = useState('');
  const [cidSearchResults, setCidSearchResults] = useState<CidCatalogEntry[]>([]);
  const [isCidSearching, setIsCidSearching] = useState(false);
  const [showCidDropdown, setShowCidDropdown] = useState(false);
  const cidDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Modalidade de Atendimento: Particular vs Convênio
  const [isParticularMode, setIsParticularMode] = useState(false);

  // Validation Errors
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Patient>>({
    registroOHB: '',
    registroHospitalar: '',
    unidade: 'Hospital São Luiz Jabaquara - Pitombeiras',
    nome: '',
    convenio: '',
    plano: '',
    matriculaConvenio: '',
    validadeConvenio: '',
    dataNascimento: '',
    idade: 0,
    sexo: 'M',
    estadoCivil: 'Solteiro(a)',
    rg: '',
    cpf: '',
    profissao: '',
    nomeMae: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: 'São Paulo',
    uf: 'SP',
    telefonesFixos: '',
    celular: '',
    email: '',
    procedencia: 'Ambulatório de Feridas Complexas',
    remocao: 'Própria',
    medicoIndicou: 'Dr. Carlos Henrique Esteves (CRM 62.139)',
    acompanhante: '',
    historiaClinica: '',
    exameFisicoResumido: '',
    localCurativos: 'Ambulatório Especializado / Domiciliar',
    avaliacaoDor: 3,
    grauEntendimento: 'Adequado',
    tempoExistenciaPatologia: '',
    descricaoLesao: '',
    diagnostico: '',
    cid10: '',
    cid11: '',
    numeroTratamentosPrevisto: 20,
    medicamentosEmUso: '',
    alergias: 'Nega alergias relatadas',
    vicios: 'Nega etilismo e tabagismo',
    otoscopia: 'Membrana timpânica íntegra bilateralmente, translúcida.',
    proteses: 'Nenhuma',
    ventilacao: 'Espontânea em ar ambiente',
  });

  useEffect(() => {
    if (initialPatient) {
      setFormData(initialPatient);
      setIsParticularMode(isParticular(initialPatient.convenio));
    } else {
      // Auto-generate sequential Registro OHB
      const nextNum = 1080 + existingPatientsCount + 1;
      setFormData((prev) => ({
        ...prev,
        registroOHB: `OHB-${nextNum}`,
        registroHospitalar: `RH-${Math.floor(40000 + Math.random() * 20000)}`,
        convenio: '',
        plano: '',
      }));
      setIsParticularMode(false);
    }
    setFormError(null);
    setCepError(null);
    setIsCepSuccess(false);
    setStreetSuggestions([]);
    setShowStreetDropdown(false);
    setCidSearchQuery('');
    setCidSearchResults([]);
    setShowCidDropdown(false);
    setIsCidSearching(false);
  }, [initialPatient, existingPatientsCount, isOpen]);

  if (!isOpen) return null;

  // Real-time CPF checks
  const rawCpfDigits = cleanCPF(formData.cpf || '');
  const isCpfFilled = rawCpfDigits.length === 11;
  const isCpfValid = isCpfFilled ? isValidCPF(formData.cpf || '') : false;

  // Real-time E-mail checks
  const rawEmail = (formData.email || '').trim();
  const isEmailFilled = rawEmail.length > 0;
  const isEmailValid = isEmailFilled ? isValidEmail(rawEmail) : true;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
    setFormError(null);
  };

  const handleToggleModalidade = (particular: boolean) => {
    setIsParticularMode(particular);
    if (particular) {
      setFormData((prev) => ({
        ...prev,
        convenio: 'Particular',
        plano: 'Particular',
        matriculaConvenio: 'N/A',
        validadeConvenio: 'N/A',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        convenio: prev.convenio === 'Particular' ? '' : prev.convenio,
        plano: prev.plano === 'Particular' ? '' : prev.plano,
        matriculaConvenio: prev.matriculaConvenio === 'N/A' ? '' : prev.matriculaConvenio,
        validadeConvenio: prev.validadeConvenio === 'N/A' ? '' : prev.validadeConvenio,
      }));
    }
  };

  const autoFetchCep = async (rawDigits: string) => {
    if (rawDigits.length !== 8) return;
    setIsCepLoading(true);
    setCepError(null);
    setIsCepSuccess(false);
    try {
      const data = await fetchAddressByCep(rawDigits);
      if (data) {
        setFormData((prev) => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          municipio: data.localidade || prev.municipio,
          uf: data.uf || prev.uf,
          complemento: data.complemento || prev.complemento,
        }));
        setIsCepSuccess(true);
        setShowStreetDropdown(false);
      }
    } catch (err: unknown) {
      setCepError(err instanceof Error ? err.message : 'CEP não encontrado.');
      setIsCepSuccess(false);
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setFormData((prev) => ({ ...prev, cep: formatted }));
    setCepError(null);
    setIsCepSuccess(false);

    const digits = cleanCEP(formatted);
    if (digits.length === 8) {
      autoFetchCep(digits);
    }
  };

  const handleCepBlur = () => {
    const digits = cleanCEP(formData.cep || '');
    if (digits.length === 8 && !isCepSuccess) {
      autoFetchCep(digits);
    }
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, endereco: val }));

    if (streetDebounceRef.current) {
      clearTimeout(streetDebounceRef.current);
    }

    const trimmed = val.trim();
    if (trimmed.length < 3) {
      setStreetSuggestions([]);
      setShowStreetDropdown(false);
      setIsStreetLoading(false);
      return;
    }

    setIsStreetLoading(true);
    streetDebounceRef.current = setTimeout(async () => {
      try {
        const city = formData.municipio?.trim() || 'São Paulo';
        const uf = formData.uf?.trim() || 'SP';
        const results = await searchAddressByStreet(uf, city, trimmed);
        setStreetSuggestions(results);
        setShowStreetDropdown(results.length > 0);
      } catch (err) {
        setStreetSuggestions([]);
        setShowStreetDropdown(false);
      } finally {
        setIsStreetLoading(false);
      }
    }, 350);
  };

  const handleSelectStreetSuggestion = (item: ViaCepResult) => {
    setFormData((prev) => ({
      ...prev,
      endereco: item.logradouro,
      cep: formatCEP(item.cep),
      bairro: item.bairro || prev.bairro,
      municipio: item.localidade || prev.municipio,
      uf: item.uf || prev.uf,
      complemento: item.complemento || prev.complemento,
    }));
    setShowStreetDropdown(false);
    setStreetSuggestions([]);
    setIsCepSuccess(true);
    setCepError(null);
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    let calculatedAge = 0;
    if (dateStr) {
      const birth = new Date(dateStr);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      calculatedAge = age >= 0 ? age : 0;
    }
    setFormData((prev) => ({
      ...prev,
      dataNascimento: dateStr,
      idade: calculatedAge,
    }));
  };

  const handleCidSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCidSearchQuery(val);

    if (cidDebounceRef.current) {
      clearTimeout(cidDebounceRef.current);
    }

    const trimmed = val.trim();
    if (trimmed.length < 2) {
      setCidSearchResults([]);
      setShowCidDropdown(false);
      setIsCidSearching(false);
      return;
    }

    setIsCidSearching(true);
    cidDebounceRef.current = setTimeout(async () => {
      try {
        const results = await storageService.searchCids(trimmed, 12);
        setCidSearchResults(results);
        setShowCidDropdown(results.length > 0);
      } catch {
        setCidSearchResults([]);
        setShowCidDropdown(false);
      } finally {
        setIsCidSearching(false);
      }
    }, 250);
  };

  const handleSelectCid = (entry: CidCatalogEntry) => {
    setFormData((prev) => ({
      ...prev,
      diagnostico: entry.nome,
      cid11: entry.codigoCid11,
      cid10: entry.codigoCid10 || prev.cid10 || '',
    }));
    setCidSearchQuery('');
    setShowCidDropdown(false);
    setCidSearchResults([]);
  };

  const handleSelectQuickCid = (cid: { cid11: string; cid10: string; label: string }) => {
    setFormData((prev) => ({
      ...prev,
      diagnostico: cid.label,
      cid11: cid.cid11,
      cid10: cid.cid10,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nome || !formData.registroOHB) {
      setFormError('Por favor, preencha o Nome do Paciente e o Registro OHB.');
      setActiveTab('dados');
      return;
    }

    // Validador Rigoroso de CPF Oficial
    if (formData.cpf && formData.cpf.trim() !== '') {
      if (!isCpfValid) {
        setFormError('O CPF informado é inválido. Por favor, verifique os dígitos digitados.');
        setActiveTab('dados');
        return;
      }
    }

    // Validador de E-mail (quando preenchido)
    if (isEmailFilled && !isEmailValid) {
      setFormError('O e-mail informado é inválido. Por favor, verifique o formato digitado (ex: paciente@dominio.com).');
      setActiveTab('endereco');
      return;
    }

    const finalPatient: Patient = {
      ...(formData as Patient),
      email: isEmailFilled ? cleanEmail(rawEmail) : '',
    };

    onSave(finalPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold font-['Outfit'] flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>{initialPatient ? 'Editar Prontuário' : 'Novo Cadastro Clínico'}</span>
                <span className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
                  {formData.registroOHB || 'REGISTRO OHB'}
                </span>
                {isParticularMode ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Particular
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Convênio
                  </span>
                )}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1">
                Folha de Tratamento, Admissão e Evolução Médica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner if validation fails */}
        {formError && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-2 sm:px-6 pt-2 sm:pt-3 gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'dados'
                ? 'bg-white border-cyan-600 text-cyan-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span><span className="sm:hidden">1. Dados</span><span className="hidden sm:inline">1. Dados Pessoais & Modalidade</span></span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('endereco')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'endereco'
                ? 'bg-white border-cyan-600 text-cyan-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span><span className="sm:hidden">2. Endereço</span><span className="hidden sm:inline">2. Endereço Completo</span></span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinico')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'clinico'
                ? 'bg-white border-cyan-600 text-cyan-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            <span><span className="sm:hidden">3. Clínico</span><span className="hidden sm:inline">3. Avaliação Clínica</span></span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ohb')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'ohb'
                ? 'bg-white border-cyan-600 text-cyan-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartPulse className="w-4 h-4 shrink-0" />
            <span><span className="sm:hidden">4. Protocolo</span><span className="hidden sm:inline">4. Protocolo OHB</span></span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          {/* TAB 1: DADOS PESSOAIS & MODALIDADE (PARTICULAR OU CONVÊNIO) */}
          {activeTab === 'dados' && (
            <div className="space-y-4">
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-cyan-900">
                <div>
                  <span className="font-bold text-cyan-950">Identificadores Institucionais Clínicos:</span>
                  <p className="text-cyan-800">
                    O Registro OHB é o identificador central para todos os prontuários e fotos escaneadas.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-cyan-300 font-mono font-bold text-cyan-800">
                    Reg. OHB: {formData.registroOHB}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registro OHB <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.registroOHB || ''}
                    onChange={(e) => setFormData({ ...formData, registroOHB: e.target.value })}
                    className="w-full text-xs font-mono font-bold text-cyan-900 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50/40"
                    placeholder="OHB-1083"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nº Registro no Hospital (RH)
                  </label>
                  <input
                    type="text"
                    value={formData.registroHospitalar || ''}
                    onChange={(e) => setFormData({ ...formData, registroHospitalar: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="RH-49201"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade Clínica</label>
                  <input
                    type="text"
                    value={formData.unidade || ''}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Paciente <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Nome do paciente"
                />
              </div>

              {/* CPF com Validador Oficial Algorítmico */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      CPF <span className="text-slate-400 font-normal">(Validação Ativa)</span>
                    </label>

                    {/* Feedback em Tempo Real de Validação */}
                    {rawCpfDigits.length > 0 && (
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 ${
                          isCpfFilled
                            ? isCpfValid
                              ? 'text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded'
                              : 'text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded'
                            : 'text-slate-500'
                        }`}
                      >
                        {isCpfFilled ? (
                          isCpfValid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> CPF Válido
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-rose-600" /> CPF Inválido
                            </>
                          )
                        ) : (
                          <span>{rawCpfDigits.length}/11 dígitos</span>
                        )}
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    maxLength={14}
                    value={formData.cpf || ''}
                    onChange={handleCpfChange}
                    className={`w-full text-xs font-mono px-3 py-2 rounded-lg border transition-colors ${
                      isCpfFilled
                        ? isCpfValid
                          ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950 focus:ring-emerald-500'
                          : 'border-rose-500 bg-rose-50/40 text-rose-950 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-cyan-500'
                    }`}
                    placeholder="000.000.000-00"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Validação oficial por algoritmo de dígitos verificadores (módulo 11)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">R.G.</label>
                  <input
                    type="text"
                    value={formData.rg || ''}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="12.345.678-9"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Profissão</label>
                  <input
                    type="text"
                    value={formData.profissao || ''}
                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nascimento</label>
                  <input
                    type="date"
                    value={formData.dataNascimento || ''}
                    onChange={handleBirthDateChange}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Idade (anos)</label>
                  <input
                    type="number"
                    readOnly
                    value={formData.idade || 0}
                    className="w-full text-xs font-bold text-slate-700 px-3 py-2 rounded-lg border border-slate-200 bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={formData.sexo || 'M'}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value as 'M' | 'F' | 'Outro' })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estado Civil</label>
                  <select
                    value={formData.estadoCivil || 'Solteiro(a)'}
                    onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                  >
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                    <option value="União Estável">União Estável</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Mãe</label>
                <input
                  type="text"
                  value={formData.nomeMae || ''}
                  onChange={(e) => setFormData({ ...formData, nomeMae: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* SELEÇÃO DE MODALIDADE: PARTICULAR VS CONVÊNIO */}
              <div className="border-t border-slate-200 pt-4 mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Modalidade de Atendimento:</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Define o faturamento e as fichas de sessão
                  </span>
                </div>

                {/* Toggle Buttons: Particular vs Convênio */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleModalidade(true)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isParticularMode
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isParticularMode ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Atendimento Particular</p>
                      <p className="text-[11px] text-slate-500">
                        Paciente sem plano de saúde (pagamento direto / recibo médico)
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleModalidade(false)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      !isParticularMode
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/50 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        !isParticularMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Convênio de Saúde</p>
                      <p className="text-[11px] text-slate-500">
                        Atendimento coberto por operadora (Bradesco, Amil, Unimed, etc.)
                      </p>
                    </div>
                  </button>
                </div>

                {/* Campos do Convênio (Ativos quando não for particular) */}
                {!isParticularMode ? (
                  <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3.5 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Convênio / Operadora <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          list="convenios-list"
                          required={!isParticularMode}
                          value={formData.convenio || ''}
                          onChange={(e) => setFormData({ ...formData, convenio: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                          placeholder="Ex: Bradesco Saúde"
                        />
                        <datalist id="convenios-list">
                          {COMMON_HEALTH_PLANS.map((cp) => (
                            <option key={cp} value={cp} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Plano / Categoria</label>
                        <input
                          type="text"
                          value={formData.plano || ''}
                          onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder="Ex: Top Nacional, Especial"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nº Matrícula Carteirinha</label>
                        <input
                          type="text"
                          value={formData.matriculaConvenio || ''}
                          onChange={(e) => setFormData({ ...formData, matriculaConvenio: e.target.value })}
                          className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder="0000000000"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Validade Carteirinha</label>
                        <input
                          type="text"
                          value={formData.validadeConvenio || ''}
                          onChange={(e) => setFormData({ ...formData, validadeConvenio: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder="MM/AAAA"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-900">
                    <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Este paciente está configurado como <strong>Particular</strong>. As sessões hiperbáricas
                      terão o selo <strong>Particular</strong> em todas as telas de atendimento e faturamento.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ENDEREÇO COM AUTOCOMPLETAR INTELIGENTE (SEM BOTÕES) */}
          {activeTab === 'endereco' && (
            <div className="space-y-4">
              {/* Banner Informativo */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Preenchimento Automático de Endereço:</span>
                    <p className="text-[11px] text-emerald-800">
                      Digite o <strong>CEP</strong> (busca ao completar/mudar de campo) ou comece a digitar o{' '}
                      <strong>Nome da Rua</strong> para ver as sugestões em tempo real.
                    </p>
                  </div>
                </div>
              </div>

              {/* Linha 1: CEP e Logradouro com Autocomplete tipo Google Maps */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* CEP com busca automática */}
                <div className="sm:col-span-4 relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CEP (Código Postal)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={9}
                      value={formData.cep || ''}
                      onChange={handleCepChange}
                      onBlur={handleCepBlur}
                      className="w-full text-xs font-mono font-bold px-3 py-2 pr-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                      placeholder="00000-000"
                    />
                    <div className="absolute right-2.5 top-2.5 pointer-events-none">
                      {isCepLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />}
                      {isCepSuccess && !isCepLoading && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </div>
                  {cepError && <p className="text-[11px] text-rose-600 font-medium mt-1">{cepError}</p>}
                  {isCepSuccess && (
                    <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Endereço localizado pelo CEP</p>
                  )}
                </div>

                {/* Logradouro / Nome da Rua com Autocomplete */}
                <div className="sm:col-span-8 relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Logradouro / Nome da Rua
                    </label>
                    {isStreetLoading && (
                      <span className="text-[10px] text-cyan-700 font-medium flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Buscando sugestões...
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={formData.endereco || ''}
                      onChange={handleStreetChange}
                      onFocus={() => {
                        if (streetSuggestions.length > 0) setShowStreetDropdown(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowStreetDropdown(false), 250);
                      }}
                      className="w-full text-xs px-3 py-2 pr-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                      placeholder="Comece a digitar o nome da rua (ex: Jabaquara, Paulista, Pitombeiras...)"
                    />
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />

                    {/* Dropdown de Sugestões estilo Google Maps */}
                    {showStreetDropdown && streetSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Sugestões encontradas ({streetSuggestions.length})</span>
                          <span className="text-[9px] text-slate-400">Clique para preencher tudo</span>
                        </div>
                        {streetSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onMouseDown={() => handleSelectStreetSuggestion(item)}
                            className="p-2.5 hover:bg-cyan-50/80 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                          >
                            <div className="flex items-start gap-2 pr-2">
                              <MapPin className="w-3.5 h-3.5 text-cyan-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                              <div>
                                <p className="font-bold text-slate-900 group-hover:text-cyan-900">
                                  {item.logradouro}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {item.bairro} • {item.localidade}/{item.uf}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-100/70 border border-cyan-200 px-2 py-0.5 rounded shrink-0">
                              CEP: {item.cep}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Linha 2: Número, Complemento e Bairro */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={formData.numero || ''}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={formData.complemento || ''}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Apto, Bloco"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={formData.bairro || ''}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Bairro"
                  />
                </div>
              </div>

              {/* Linha 3: Município / Cidade e UF */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Município / Cidade</label>
                  <input
                    type="text"
                    value={formData.municipio || ''}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UF (Estado)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.uf || ''}
                    onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                    className="w-full text-xs font-bold text-center px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 uppercase"
                    placeholder="SP"
                  />
                </div>
              </div>

              {/* Telefones e Contato */}
              <div className="border-t border-slate-200 pt-4 mt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Contatos & Comunicação de Lembretes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Celular / WhatsApp (Para Lembretes)
                    </label>
                    <input
                      type="text"
                      value={formData.celular || ''}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Fixo</label>
                    <input
                      type="text"
                      value={formData.telefonesFixos || ''}
                      onChange={(e) => setFormData({ ...formData, telefonesFixos: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="(11) 5017-0698"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        E-mail <span className="text-slate-400 font-normal">(Opcional)</span>
                      </label>
                      {isEmailFilled && (
                        <span
                          className={`text-[10px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded ${
                            isEmailValid
                              ? 'text-emerald-700 bg-emerald-100'
                              : 'text-rose-700 bg-rose-100'
                          }`}
                        >
                          {isEmailValid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> E-mail Válido
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-rose-600" /> E-mail Inválido
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setFormError(null);
                        }}
                        className={`w-full text-xs px-3 py-2 rounded-lg border transition-colors ${
                          isEmailFilled
                            ? isEmailValid
                              ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950 focus:ring-emerald-500'
                              : 'border-rose-500 bg-rose-50/40 text-rose-950 focus:ring-rose-500'
                            : 'border-slate-300 focus:ring-cyan-500'
                        }`}
                        placeholder="paciente@exemplo.com.br"
                      />
                    </div>
                    {isEmailFilled && !isEmailValid ? (
                      <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" /> Formato de e-mail inválido. Exemplo: paciente@dominio.com.br
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Utilizado para avisos e envio de prontuários digitais.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AVALIAÇÃO CLÍNICA & HISTÓRIA MÉDICA */}
          {activeTab === 'clinico' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Procedência</label>
                  <input
                    type="text"
                    value={formData.procedencia || ''}
                    onChange={(e) => setFormData({ ...formData, procedencia: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meio de Remoção</label>
                  <input
                    type="text"
                    value={formData.remocao || ''}
                    onChange={(e) => setFormData({ ...formData, remocao: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Médico que Indicou</label>
                  <input
                    type="text"
                    value={formData.medicoIndicou || ''}
                    onChange={(e) => setFormData({ ...formData, medicoIndicou: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Acompanhante / Responsável</label>
                <input
                  type="text"
                  value={formData.acompanhante || ''}
                  onChange={(e) => setFormData({ ...formData, acompanhante: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">História Clínica Detalhada</label>
                <textarea
                  rows={3}
                  value={formData.historiaClinica || ''}
                  onChange={(e) => setFormData({ ...formData, historiaClinica: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Descreva a evolução da doença, procedimentos prévios, tempo de lesão..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exame Físico Resumido</label>
                <textarea
                  rows={2}
                  value={formData.exameFisicoResumido || ''}
                  onChange={(e) => setFormData({ ...formData, exameFisicoResumido: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Geral, ausculta cardíaca, pulmonar, pulsos periféricos..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Localização dos Curativos</label>
                  <input
                    type="text"
                    value={formData.localCurativos || ''}
                    onChange={(e) => setFormData({ ...formData, localCurativos: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ex: Pododáctilos e dorso do pé esquerdo"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Avaliação da Dor (0 a 10)</label>
                    <span className="text-xs font-bold text-cyan-800">{formData.avaliacaoDor || 0} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.avaliacaoDor || 0}
                    onChange={(e) => setFormData({ ...formData, avaliacaoDor: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Sem dor</span>
                    <span>Moderada</span>
                    <span>Insuportável</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grau de Entendimento</label>
                  <input
                    type="text"
                    value={formData.grauEntendimento || ''}
                    onChange={(e) => setFormData({ ...formData, grauEntendimento: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Adequado / Lúcido e orientado"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tempo de Lesão / Patologia</label>
                  <input
                    type="text"
                    value={formData.tempoExistenciaPatologia || ''}
                    onChange={(e) => setFormData({ ...formData, tempoExistenciaPatologia: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ex: 3 meses, 2 anos..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Minuciosa da Lesão</label>
                <textarea
                  rows={2}
                  value={formData.descricaoLesao || ''}
                  onChange={(e) => setFormData({ ...formData, descricaoLesao: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Aspecto do leito, bordas, exsudato, necrose, granulação..."
                ></textarea>
              </div>
            </div>
          )}

          {/* TAB 4: PROTOCOLO OHB & SEGURANÇA DA CÂMARA */}
          {activeTab === 'ohb' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-xl p-4 shadow-lg border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Diagnóstico Clínico & Classificação CID-11 / CID-10 (OMS & ANS)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Busque pelo nome da patologia, sintoma ou código para preenchimento automático sincronizado.
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Catálogo CID-11 Oficial Ativo
                  </span>
                </div>

                {/* Campo de Busca Inteligente de CID-11 / CID-10 */}
                <div className="relative mb-4">
                  <label className="block text-[11px] font-semibold text-cyan-300 mb-1">
                    Pesquisar no Catálogo de Doenças (CID-11 / CID-10 / Patologias OHB)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      {isCidSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      ) : (
                        <Search className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      id="cid-catalog-search-input"
                      value={cidSearchQuery}
                      onChange={handleCidSearchChange}
                      onFocus={() => {
                        if (cidSearchResults.length > 0) setShowCidDropdown(true);
                      }}
                      className="w-full text-xs pl-9 pr-8 py-2 rounded-lg border border-cyan-800/80 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 shadow-inner"
                      placeholder="Digite patologia, sintoma ou código (ex: pé diabético, osteomielite, fascite, 5A14, E11.5)..."
                    />
                    {cidSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setCidSearchQuery('');
                          setShowCidDropdown(false);
                          setCidSearchResults([]);
                        }}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                        title="Limpar busca"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Flutuante de Resultados do Catálogo */}
                  {showCidDropdown && cidSearchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-850 border border-slate-700 bg-slate-900 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1.5 bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Resultados Encontrados ({cidSearchResults.length})</span>
                        <span className="text-[9px] text-cyan-400">Clique para preencher diagnóstico e CIDs</span>
                      </div>
                      {cidSearchResults.map((entry) => (
                        <div
                          key={entry.codigoCid11}
                          onMouseDown={() => handleSelectCid(entry)}
                          className="p-3 hover:bg-slate-800 cursor-pointer text-xs transition-colors group flex items-start justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                              {entry.nome}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {entry.capitulo}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                            <span className="font-mono text-[11px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-700 px-2 py-0.5 rounded shadow-xs" title="Código CID-11 (OMS)">
                              CID-11: {entry.codigoCid11}
                            </span>
                            {entry.codigoCid10 && (
                              <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded shadow-xs" title="Código CID-10 de equivalência">
                                CID-10: {entry.codigoCid10}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campos Sincronizados de Diagnóstico, CID-11 e CID-10 */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-slate-800">
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Diagnóstico Principal <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.diagnostico || ''}
                      onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-cyan-500"
                      placeholder="Ex: Pé Diabético com úlcera isquêmica e infecção"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center justify-between">
                      <span>CID-11 (OMS)</span>
                      <span className="text-[10px] text-emerald-400 font-normal">Padrão Atual</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cid11 || ''}
                      onChange={(e) => setFormData({ ...formData, cid11: e.target.value })}
                      className="w-full text-xs font-mono font-bold text-emerald-300 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: 5A14"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-cyan-300 mb-1 flex items-center justify-between">
                      <span>CID-10 (ANS/TISS)</span>
                      <span className="text-[10px] text-cyan-400 font-normal">Faturamento</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cid10 || ''}
                      onChange={(e) => setFormData({ ...formData, cid10: e.target.value })}
                      className="w-full text-xs font-mono font-bold text-cyan-300 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 focus:ring-2 focus:ring-cyan-500"
                      placeholder="Ex: E11.5"
                    />
                  </div>
                </div>

                {/* Sugestões Rápidas de Patologias Frequentes em OHB com CID-11 e CID-10 */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
                    Atalhos Rápidos de Patologias Cobertas por CFM em OHB (Preenche CID-11 & CID-10):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_CID_OHB_EXTENDED.map((cid) => (
                      <button
                        key={cid.cid11}
                        type="button"
                        onClick={() => handleSelectQuickCid(cid)}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-600 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="text-emerald-400 font-mono font-bold">{cid.cid11}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-cyan-400 font-mono font-bold">{cid.cid10}</span>
                        <span className="text-slate-300 font-medium">{cid.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tratamentos Previstos
                  </label>
                  <input
                    type="number"
                    value={formData.numeroTratamentosPrevisto || 20}
                    onChange={(e) => setFormData({ ...formData, numeroTratamentosPrevisto: parseInt(e.target.value, 10) || 1 })}
                    className="w-full text-xs font-bold text-cyan-900 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Ciclo inicial: 20 a 30 sessões</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Duração por Sessão</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                      <Lock className="w-2.5 h-2.5" /> Fixo
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value="150 min (Protocolo OHB)"
                    className="w-full text-xs font-bold text-slate-700 px-3 py-2 rounded-lg border border-slate-300 bg-slate-100 cursor-not-allowed select-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Protocolo fixo não editável</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Otoscopia Prévia</label>
                  <input
                    type="text"
                    value={formData.otoscopia || ''}
                    onChange={(e) => setFormData({ ...formData, otoscopia: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Membrana timpânica íntegra bilateral"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medicamentos em Uso Contínuo</label>
                <textarea
                  rows={2}
                  value={formData.medicamentosEmUso || ''}
                  onChange={(e) => setFormData({ ...formData, medicamentosEmUso: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Insulina, anti-hipertensivos, antibióticos em uso..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alergias Relatadas</label>
                  <input
                    type="text"
                    value={formData.alergias || ''}
                    onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vícios / Hábitos de Vida</label>
                  <input
                    type="text"
                    value={formData.vicios || ''}
                    onChange={(e) => setFormData({ ...formData, vicios: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Próteses Metálicas / Marcapasso</label>
                  <input
                    type="text"
                    value={formData.proteses || ''}
                    onChange={(e) => setFormData({ ...formData, proteses: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Ventilação</label>
                  <input
                    type="text"
                    value={formData.ventilacao || ''}
                    onChange={(e) => setFormData({ ...formData, ventilacao: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500 order-2 sm:order-1 text-center sm:text-left">
              * Campos obrigatórios para abertura e conformidade de prontuário OHB.
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer text-center"
              >
                Salvar Cadastro Clínico
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
