export interface Patient {
  id: string;
  registroOHB: string; // Número de registro que acompanha a clínica (ex: OHB-2024-001)
  registroHospitalar: string;
  unidade: string;
  nome: string;
  convenio: string;
  plano: string;
  matriculaConvenio: string;
  validadeConvenio: string;
  dataNascimento: string;
  idade: number;
  sexo: 'M' | 'F' | 'Outro';
  estadoCivil: string;
  rg: string;
  cpf: string;
  profissao: string;
  nomeMae: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  telefonesFixos: string;
  celular: string;
  email: string;
  procedencia: string;
  remocao: string;
  medicoIndicou: string;
  acompanhante: string;
  historiaClinica: string;
  exameFisicoResumido: string;
  localCurativos: string;
  avaliacaoDor: number; // 0 a 10
  grauEntendimento: string;
  tempoExistenciaPatologia: string;
  descricaoLesao: string;
  diagnostico: string;
  cid10: string;
  numeroTratamentosPrevisto: number;
  medicamentosEmUso: string;
  alergias: string;
  vicios: string;
  otoscopia: string;
  proteses: string;
  ventilacao: string;
  createdAt: string;
  updatedAt: string;
}

export interface HyperbaricSession {
  id: string;
  patientId: string;
  registroOHB: string;
  sessionNumber: number;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  ata: number; // Ex: 2.0, 2.4, 2.8 ATA
  pa: string; // Ex: 120/80 mmHg
  glicemia: string; // mg/dL
  temperatura: string; // °C
  duracaoMinutos: number; // 90 min
  tratamentoMedicacao: string;
  intercorrencias: string;
  medicoResponsavel: string;
  enfermeiroResponsavel: string;
  tecnicoResponsavel: string;
  // Checagens de Segurança da Câmara (Sistematização de Enfermagem)
  conferenciaNome: boolean;
  roupaAlgodao: boolean;
  pulseiraEstatica: boolean;
  removerMetaisEletronicos: boolean;
  retirarProteses: boolean;
  sondaVesicalAberta: boolean;
  avpAvcPicc: boolean;
  velocidadeCompressao: string;
  velocidadeDescompressao: string;
  covidFebreTosse: boolean;
  // Diagnósticos de Enfermagem (PR: Presente, ME: Melhorado, PI: Piorado, A: Ausente, R: Resolvido)
  diagDor: 'PR' | 'ME' | 'PI' | 'A' | 'R' | '';
  diagQueda: 'PR' | 'ME' | 'PI' | 'A' | 'R' | '';
  diagDeambulacao: 'PR' | 'ME' | 'PI' | 'A' | 'R' | '';
  diagGlicemia: 'PR' | 'ME' | 'PI' | 'A' | 'R' | '';
  diagPele: 'PR' | 'ME' | 'PI' | 'A' | 'R' | '';
  diagContaminacao: 'PR' | 'ME' | 'PI' | 'A' | 'R' | '';
  diagAnsiedade: 'PR' | 'ME' | 'PI' | 'A' | 'R' | '';
  evolucaoEnfermagem: string;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  registroOHB: string;
  cpf: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  diaSemana: string;
  sessaoNumero: number;
  pressaoATA: number;
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado';
  observacoes: string;
  telefonePaciente: string;
}

export interface DigitalizedDocument {
  id: string;
  registroOHB: string;
  cpf: string;
  patientId?: string;
  patientName?: string;
  titulo: string;
  tipo: 'prontuario_antigo' | 'ficha_atendimento' | 'foto_lesao' | 'exame_laudo' | 'outro';
  dataDocumento: string;
  dataUpload: string;
  observacoes: string;
  imageUrl: string; // Base64 ou URL de armazenamento
  tamanhoKb: number;
}
