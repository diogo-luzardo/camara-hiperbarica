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
} from 'lucide-react';
import { Patient } from '../types';
import { formatCPF, isValidCPF, cleanCPF } from '../utils/cpfValidator';
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

  // CEP Search State
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  // Street Name Search State
  const [addressSearchMode, setAddressSearchMode] = useState<'cep' | 'rua'>('cep');
  const [streetUf, setStreetUf] = useState('SP');
  const [streetCity, setStreetCity] = useState('São Paulo');
  const [streetName, setStreetName] = useState('');
  const [streetResults, setStreetResults] = useState<ViaCepResult[]>([]);
  const [isStreetLoading, setIsStreetLoading] = useState(false);
  const [streetError, setStreetError] = useState<string | null>(null);

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
    setStreetError(null);
    setStreetResults([]);
  }, [initialPatient, existingPatientsCount, isOpen]);

  if (!isOpen) return null;

  // Real-time CPF checks
  const rawCpfDigits = cleanCPF(formData.cpf || '');
  const isCpfFilled = rawCpfDigits.length === 11;
  const isCpfValid = isCpfFilled ? isValidCPF(formData.cpf || '') : false;

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

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setFormData((prev) => ({ ...prev, cep: formatted }));
    setCepError(null);
  };

  const handleSearchCep = async () => {
    const digits = cleanCEP(formData.cep || '');
    if (digits.length !== 8) {
      setCepError('Digite os 8 dígitos do CEP.');
      return;
    }

    setIsCepLoading(true);
    setCepError(null);
    try {
      const data = await fetchAddressByCep(digits);
      if (data) {
        setFormData((prev) => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          municipio: data.localidade || prev.municipio,
          uf: data.uf || prev.uf,
          complemento: data.complemento || prev.complemento,
        }));
      }
    } catch (err: unknown) {
      setCepError(err instanceof Error ? err.message : 'Erro ao consultar CEP.');
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleSearchStreet = async () => {
    if (streetName.trim().length < 3) {
      setStreetError('Digite pelo menos 3 caracteres do nome da rua/logradouro.');
      return;
    }
    if (!streetCity.trim() || streetCity.trim().length < 3) {
      setStreetError('Informe a cidade (mínimo 3 letras).');
      return;
    }

    setIsStreetLoading(true);
    setStreetError(null);
    setStreetResults([]);
    try {
      const results = await searchAddressByStreet(streetUf, streetCity, streetName);
      if (results.length === 0) {
        setStreetError('Nenhum endereço encontrado para esta rua na cidade informada.');
      }
      setStreetResults(results);
    } catch (err: unknown) {
      setStreetError(err instanceof Error ? err.message : 'Erro ao pesquisar rua.');
    } finally {
      setIsStreetLoading(false);
    }
  };

  const handleSelectStreetResult = (item: ViaCepResult) => {
    setFormData((prev) => ({
      ...prev,
      cep: formatCEP(item.cep),
      endereco: item.logradouro,
      bairro: item.bairro,
      municipio: item.localidade,
      uf: item.uf,
      complemento: item.complemento || prev.complemento,
    }));
    setStreetResults([]);
    setAddressSearchMode('cep');
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

    onSave(formData as Patient);
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
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2.5 sm:pt-3 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dados'
                ? 'bg-white border-cyan-600 text-cyan-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Dados Pessoais & Modalidade</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('endereco')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'endereco'
                ? 'bg-white border-cyan-600 text-cyan-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>2. Endereço & Busca Rua/CEP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinico')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'clinico'
                ? 'bg-white border-cyan-600 text-cyan-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>3. Avaliação Clínica</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ohb')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ohb'
                ? 'bg-white border-cyan-600 text-cyan-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>4. Protocolo OHB</span>
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

          {/* TAB 2: ENDEREÇO COM BUSCA POR CEP E BUSCA POR NOME DE RUA */}
          {activeTab === 'endereco' && (
            <div className="space-y-4">
              {/* Header com Seletor: Buscar por CEP ou Buscar por Nome de Rua */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Localização & Endereço Automático (ViaCEP / Correios):</span>
                  </div>

                  {/* Switch entre Busca por CEP e Busca por Nome de Rua */}
                  <div className="flex bg-white p-0.5 rounded-lg border border-emerald-300 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setAddressSearchMode('cep')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        addressSearchMode === 'cep'
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Buscar por CEP
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressSearchMode('rua')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        addressSearchMode === 'rua'
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Compass className="w-3 h-3" />
                      <span>Não sei o CEP (Buscar Rua)</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800">
                  {addressSearchMode === 'cep'
                    ? 'Digite o CEP com 8 dígitos e clique em Buscar para preencher logradouro, bairro, cidade e estado automaticamente.'
                    : 'Digite o nome da rua ou avenida e a cidade para consultar a base dos Correios e encontrar o CEP e dados completos.'}
                </p>
              </div>

              {/* MODO 1: BUSCA POR CEP */}
              {addressSearchMode === 'cep' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CEP (Código Postal)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={9}
                        value={formData.cep || ''}
                        onChange={handleCepChange}
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                        placeholder="00000-000"
                      />
                      <button
                        type="button"
                        onClick={handleSearchCep}
                        disabled={isCepLoading}
                        className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {isCepLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        <span>Buscar CEP</span>
                      </button>
                    </div>
                    {cepError && <p className="text-[11px] text-rose-600 font-medium mt-1">{cepError}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro / Endereço</label>
                    <input
                      type="text"
                      value={formData.endereco || ''}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="Rua, Avenida, Praça..."
                    />
                  </div>
                </div>
              )}

              {/* MODO 2: BUSCA POR NOME DE RUA (QUANDO NÃO SOUBER O CEP) */}
              {addressSearchMode === 'rua' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">UF (Estado)</label>
                      <select
                        value={streetUf}
                        onChange={(e) => setStreetUf(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                      >
                        <option value="SP">SP</option>
                        <option value="RJ">RJ</option>
                        <option value="MG">MG</option>
                        <option value="PR">PR</option>
                        <option value="SC">SC</option>
                        <option value="RS">RS</option>
                        <option value="BA">BA</option>
                        <option value="DF">DF</option>
                        <option value="ES">ES</option>
                        <option value="GO">GO</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade / Município</label>
                      <input
                        type="text"
                        value={streetCity}
                        onChange={(e) => setStreetCity(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="Ex: São Paulo"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Rua / Avenida</label>
                      <input
                        type="text"
                        value={streetName}
                        onChange={(e) => setStreetName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchStreet())}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="Ex: Pitombeiras, Paulista, Domingos..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleSearchStreet}
                        disabled={isStreetLoading}
                        className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isStreetLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Search className="w-3.5 h-3.5" />
                        )}
                        <span>Pesquisar</span>
                      </button>
                    </div>
                  </div>

                  {streetError && <p className="text-xs text-rose-600 font-semibold">{streetError}</p>}

                  {/* Resultados da busca por rua */}
                  {streetResults.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 block">
                        Selecione o endereço correto ({streetResults.length} encontrados):
                      </span>
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white shadow-xs">
                        {streetResults.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectStreetResult(item)}
                            className="p-2.5 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{item.logradouro}</p>
                              <p className="text-[11px] text-slate-500">
                                {item.bairro} • {item.localidade}/{item.uf}
                              </p>
                            </div>
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                              CEP: {item.cep}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Campo de logradouro preenchido */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro Selecionado</label>
                    <input
                      type="text"
                      value={formData.endereco || ''}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 bg-white"
                      placeholder="Nome da rua após selecionar acima..."
                    />
                  </div>
                </div>
              )}

              {/* Número, Complemento, Bairro, Cidade, UF */}
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={formData.bairro || ''}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Município / UF</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={formData.municipio || ''}
                      onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                      className="w-3/4 text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="São Paulo"
                    />
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.uf || ''}
                      onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                      className="w-1/4 text-xs font-bold text-center px-1 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="SP"
                    />
                  </div>
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="paciente@email.com"
                    />
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
              <div className="bg-slate-900 text-white rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  Diagnóstico Nosológico & CID-10 para Oxigenoterapia Hiperbárica
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
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
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Código CID-10</label>
                    <input
                      type="text"
                      value={formData.cid10 || ''}
                      onChange={(e) => setFormData({ ...formData, cid10: e.target.value })}
                      className="w-full text-xs font-mono font-bold text-cyan-300 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 focus:ring-2 focus:ring-cyan-500"
                      placeholder="E11.5"
                    />
                  </div>
                </div>

                {/* Sugestões Rápidas de CID-10 Frequentes em OHB */}
                <div className="mt-3">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Atalhos Rápidos de Patologias Cobertas por CFM em OHB:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_CID_OHB.map((cid) => (
                      <button
                        key={cid.code}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            cid10: cid.code,
                            diagnostico: cid.label,
                          })
                        }
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-600 transition-colors cursor-pointer"
                      >
                        <strong className="text-cyan-400">{cid.code}</strong> - {cid.label}
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
          <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              * Campos obrigatórios para abertura e conformidade de prontuário OHB.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
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
