import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, AlertCircle, Loader2, Sparkles, HeartPulse, User, MapPin, FileText, Stethoscope } from 'lucide-react';
import { Patient } from '../types';
import { formatCPF, isValidCPF, cleanCPF } from '../utils/cpfValidator';
import { fetchAddressByCep, formatCEP, cleanCEP } from '../utils/cepService';

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

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPatient,
  existingPatientsCount,
}) => {
  const [activeTab, setActiveTab] = useState<'dados' | 'endereco' | 'clinico' | 'ohb'>('dados');
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

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
    } else {
      // Auto-generate sequential Registro OHB
      const nextNum = 1080 + existingPatientsCount + 1;
      setFormData((prev) => ({
        ...prev,
        registroOHB: `OHB-${nextNum}`,
        registroHospitalar: `RH-${Math.floor(40000 + Math.random() * 20000)}`,
      }));
    }
  }, [initialPatient, existingPatientsCount, isOpen]);

  if (!isOpen) return null;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
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

  const isCpfValid = formData.cpf ? isValidCPF(formData.cpf) : false;
  const isCpfFilled = !!formData.cpf && cleanCPF(formData.cpf).length === 11;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.registroOHB) {
      alert('Por favor, preencha o Nome do Paciente e o Registro OHB.');
      return;
    }
    if (formData.cpf && !isCpfValid) {
      alert('O CPF digitado é inválido. Por favor, verifique os dígitos verificadores.');
      return;
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
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1">
                Folha de Tratamento, Admissão e Evolução Médica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2.5 sm:pt-3 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'dados'
                ? 'bg-white border-cyan-600 text-cyan-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Dados Pessoais</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('endereco')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'endereco'
                ? 'bg-white border-cyan-600 text-cyan-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>2. Endereço & Contato</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinico')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
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
          {/* TAB 1: DADOS PESSOAIS & CONVÊNIO */}
          {activeTab === 'dados' && (
            <div className="space-y-4">
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-cyan-900">
                <div>
                  <span className="font-bold text-cyan-950">Identificadores Institucionais Clínicos:</span>
                  <p className="text-cyan-800">O Registro OHB é o identificador central para todos os prontuários e fotos escaneadas.</p>
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

              {/* CPF com validação matemática ativa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      CPF <span className="text-rose-500">*</span>
                    </label>
                    {isCpfFilled && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${
                        isCpfValid ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isCpfValid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> CPF Válido
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" /> CPF Inválido
                          </>
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
                  <p className="text-[10px] text-slate-400 mt-0.5">Validação oficial por algoritmo de dígitos verificadores</p>
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

              {/* Informações de Convênio */}
              <div className="border-t border-slate-200 pt-4 mt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Dados do Convênio & Matrícula
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Convênio</label>
                    <input
                      type="text"
                      value={formData.convenio || ''}
                      onChange={(e) => setFormData({ ...formData, convenio: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="Ex: Bradesco, Unimed, Particular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Plano</label>
                    <input
                      type="text"
                      value={formData.plano || ''}
                      onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="Ex: Especial, Básico"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nº Matrícula no Convênio</label>
                    <input
                      type="text"
                      value={formData.matriculaConvenio || ''}
                      onChange={(e) => setFormData({ ...formData, matriculaConvenio: e.target.value })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Validade da Carteirinha</label>
                    <input
                      type="text"
                      value={formData.validadeConvenio || ''}
                      onChange={(e) => setFormData({ ...formData, validadeConvenio: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="MM/AAAA"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENDEREÇO COM VIACEP & CONTATO */}
          {activeTab === 'endereco' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
                <span className="font-bold flex items-center gap-1 text-emerald-950">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Preenchimento Automático por CEP (ViaCEP):
                </span>
                <p className="text-emerald-800">
                  Digite o CEP e clique em "Buscar CEP" para autocompletar logradouro, bairro, município e UF instantaneamente com os dados oficiais dos Correios.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CEP (Código de Endereçamento Postal)
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
                      className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isCepLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>Buscar</span>
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
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Fixo</label>
                    <input
                      type="text"
                      value={formData.telefonesFixos || ''}
                      onChange={(e) => setFormData({ ...formData, telefonesFixos: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="(11) 5017-0000"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remoção / Meio de Transporte</label>
                  <input
                    type="text"
                    value={formData.remocao || ''}
                    onChange={(e) => setFormData({ ...formData, remocao: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Acompanhante Habitual</label>
                  <input
                    type="text"
                    value={formData.acompanhante || ''}
                    onChange={(e) => setFormData({ ...formData, acompanhante: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AVALIAÇÃO CLÍNICA & LESÃO */}
          {activeTab === 'clinico' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Médico que Indicou / Assistente (Nome e CRM)
                </label>
                <input
                  type="text"
                  value={formData.medicoIndicou || ''}
                  onChange={(e) => setFormData({ ...formData, medicoIndicou: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">História Clínica Detalhada</label>
                <textarea
                  rows={3}
                  value={formData.historiaClinica || ''}
                  onChange={(e) => setFormData({ ...formData, historiaClinica: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Antecedentes patológicos (Diabetes, HAS, tabagismo), cirurgias prévias, evolução da lesão..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exame Físico Resumido</label>
                <textarea
                  rows={2}
                  value={formData.exameFisicoResumido || ''}
                  onChange={(e) => setFormData({ ...formData, exameFisicoResumido: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Estado geral, ausculta cardíaca/pulmonar, pulsos periféricos..."
                />
              </div>

              {/* Diagnóstico & CID 10 com atalhos frequentes */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Diagnóstico Principal & CID-10</h4>
                  <span className="text-[11px] text-slate-500">Clique para selecionar patologia comum de OHB:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CID_OHB.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setFormData({ ...formData, cid10: item.code, diagnostico: item.label })}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                        formData.cid10 === item.code
                          ? 'bg-cyan-600 text-white border-cyan-600 font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-cyan-400 hover:bg-cyan-50/50'
                      }`}
                    >
                      <span className="font-mono font-bold mr-1">{item.code}</span>
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição do Diagnóstico</label>
                    <input
                      type="text"
                      value={formData.diagnostico || ''}
                      onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="Diagnóstico clínico"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CID-10</label>
                    <input
                      type="text"
                      value={formData.cid10 || ''}
                      onChange={(e) => setFormData({ ...formData, cid10: e.target.value })}
                      className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                      placeholder="E11.5"
                    />
                  </div>
                </div>
              </div>

              {/* Descrição da lesão & Dor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição Minuciosa da Lesão (Local anatômico, dimensões, tecido)
                </label>
                <textarea
                  rows={2}
                  value={formData.descricaoLesao || ''}
                  onChange={(e) => setFormData({ ...formData, descricaoLesao: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Dimensões (cm), % granulação, esfacelo, necrose, bordas, exsudato..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Avaliação da Dor (EVA 0 a 10): <span className="font-bold text-cyan-700">{formData.avaliacaoDor}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.avaliacaoDor || 0}
                    onChange={(e) => setFormData({ ...formData, avaliacaoDor: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0 (Sem dor)</span>
                    <span>5 (Moderada)</span>
                    <span>10 (Insuportável)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tempo de Existência da Patologia</label>
                  <input
                    type="text"
                    value={formData.tempoExistenciaPatologia || ''}
                    onChange={(e) => setFormData({ ...formData, tempoExistenciaPatologia: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ex: 3 meses, 4 semanas"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Local Realização de Curativos</label>
                  <input
                    type="text"
                    value={formData.localCurativos || ''}
                    onChange={(e) => setFormData({ ...formData, localCurativos: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROTOCOLO OHB & SEGURANÇA */}
          {activeTab === 'ohb' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                <span className="font-bold flex items-center gap-1 text-amber-950">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Triagem Crítica de Segurança Hiperbárica:
                </span>
                <p className="text-amber-800">
                  A oxigenoterapia hiperbárica requer avaliação otoscópica para prevenção de barotrauma de ouvido médio e verificação estrita de alergias e próteses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Tratamentos / Sessões Previsto
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={formData.numeroTratamentosPrevisto || 20}
                    onChange={(e) => setFormData({ ...formData, numeroTratamentosPrevisto: parseInt(e.target.value, 10) || 1 })}
                    className="w-full text-xs font-bold text-cyan-900 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Média recomendada: 20 a 30 sessões em câmara a 2.4 ATA</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Otoscopia Bilateral Pré-Tratamento
                  </label>
                  <input
                    type="text"
                    value={formData.otoscopia || ''}
                    onChange={(e) => setFormData({ ...formData, otoscopia: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Membranas timpânicas íntegras, Valsalva..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Alergias (Alerta de Segurança)
                </label>
                <input
                  type="text"
                  value={formData.alergias || ''}
                  onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                  className="w-full text-xs font-semibold text-rose-900 bg-rose-50/50 px-3 py-2 rounded-lg border border-rose-300 focus:ring-2 focus:ring-rose-500"
                  placeholder="Ex: Penicilinas, Dipirona, Látex (ou Nega alergias)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medicamentos em Uso Habitual</label>
                <textarea
                  rows={2}
                  value={formData.medicamentosEmUso || ''}
                  onChange={(e) => setFormData({ ...formData, medicamentosEmUso: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Insulinas, anti-hipertensivos, antibióticos, anticoagulantes..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vícios / Hábitos</label>
                  <input
                    type="text"
                    value={formData.vicios || ''}
                    onChange={(e) => setFormData({ ...formData, vicios: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ex-tabagista, nega..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Próteses / Dispositivos</label>
                  <input
                    type="text"
                    value={formData.proteses || ''}
                    onChange={(e) => setFormData({ ...formData, proteses: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Dentária móvel, auditiva, marcapasso..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Padrão Ventilatório</label>
                  <input
                    type="text"
                    value={formData.ventilacao || ''}
                    onChange={(e) => setFormData({ ...formData, ventilacao: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Espontânea em ar ambiente"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span>Vinculação direta ao <strong>Registro OHB: {formData.registroOHB}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 rounded-lg shadow-md transition-all shadow-cyan-900/20"
              >
                {initialPatient ? 'Salvar Alterações' : 'Cadastrar Prontuário'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
