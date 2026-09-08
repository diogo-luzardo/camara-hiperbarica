import { Patient, HyperbaricSession, Appointment, DigitalizedDocument } from '../types';

const DB_NAME = 'ClinicaOHB_Database';
const DB_VERSION = 1;
const STORE_DOCS = 'digitalized_documents';

const STORAGE_KEYS = {
  PATIENTS: 'ohb_patients_v1',
  SESSIONS: 'ohb_sessions_v1',
  APPOINTMENTS: 'ohb_appointments_v1',
};

// IndexedDB Helper para armazenar fotos e prontuários digitalizados em alta resolução
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        const store = db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
        store.createIndex('registroOHB', 'registroOHB', { unique: false });
        store.createIndex('cpf', 'cpf', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Exemplos realistas baseados nas fichas fornecidas
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    registroOHB: 'OHB-1082',
    registroHospitalar: 'RH-49201',
    unidade: 'Hospital São Luiz Jabaquara - Pitombeiras',
    nome: 'Sebastião Pereira dos Santos',
    convenio: 'Bradesco Saúde',
    plano: 'Top Nacional',
    matriculaConvenio: '84920193021',
    validadeConvenio: '12/2027',
    dataNascimento: '1962-04-18',
    idade: 64,
    sexo: 'M',
    estadoCivil: 'Casado',
    rg: '14.892.301-X',
    cpf: '529.982.247-25',
    profissao: 'Comerciante aposentado',
    nomeMae: 'Francisca Pereira dos Santos',
    cep: '04343-160',
    endereco: 'Rua das Pitombeiras',
    numero: '175',
    complemento: 'Apto 42',
    bairro: 'Jabaquara',
    municipio: 'São Paulo',
    uf: 'SP',
    telefonesFixos: '(11) 5017-0698',
    celular: '(11) 98765-4321',
    email: 'sebastiao.santos@email.com',
    procedencia: 'Ambulatório de Feridas Complexas',
    remocao: 'Própria (veículo particular)',
    medicoIndicou: 'Dr. Carlos Henrique Esteves (CRM 62.139)',
    acompanhante: 'Dona Maria de Lourdes (Esposa)',
    historiaClinica: 'Paciente diabético há 18 anos, hipertenso. Evoluiu com úlcera neuropática plantar profunda no hálux e antepé direito há 4 meses, com sinais de osteomielite refratária ao tratamento antibiótico venoso prévio.',
    exameFisicoResumido: 'BEG, lúcido, eupneico. Pulsos pedioso e tibial posterior diminuídos à D (+/4+). Ausência de sopros carotídeos.',
    localCurativos: 'Ambulatório Especializado de Feridas / Domiciliar com Hidrogel com Prata',
    avaliacaoDor: 5,
    grauEntendimento: 'Bom entendimento e aderência às orientações de descompressão e dieta.',
    tempoExistenciaPatologia: '4 meses',
    descricaoLesao: 'Úlcera em antepé plantar direito de 4.5 x 3.0 cm, com 60% de tecido de granulação e 40% de esfacelo. Bordas maceradas, secreção serossanguinolenta moderada. Sem odor fétido atual.',
    diagnostico: 'Pé Diabético Complicado com Úlcera e Osteomielite Refratária',
    cid10: 'E11.5',
    numeroTratamentosPrevisto: 30,
    medicamentosEmUso: 'Metformina 850mg 2x/dia, Insulina NPH 22UI manhã, Losartana 50mg/dia, Ciprofloxacino 500mg 12/12h',
    alergias: 'Penicilinas (urticária e broncoespasmo)',
    vicios: 'Ex-tabagista (parou há 8 anos, carga 20 anos/maço)',
    otoscopia: 'Membrana timpânica íntegra bilateralmente, translúcida, sem hiperemia ou abaulamentos. Manobra de Valsalva positiva.',
    proteses: 'Prótese dentária superior móvel (deve ser retirada antes de entrar na câmara)',
    ventilacao: 'Espontânea em ar ambiente',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-09-02T14:30:00Z',
  },
  {
    id: 'pat-2',
    registroOHB: 'OHB-1095',
    registroHospitalar: 'RH-53102',
    unidade: 'Hospital São Luiz Jabaquara - Pitombeiras',
    nome: 'Helena Ribeiro de Castro',
    convenio: 'SulAmérica',
    plano: 'Especial 100',
    matriculaConvenio: '90184729012',
    validadeConvenio: '08/2028',
    dataNascimento: '1974-11-23',
    idade: 51,
    sexo: 'F',
    estadoCivil: 'Solteira',
    rg: '28.109.844-3',
    cpf: '153.508.897-56',
    profissao: 'Arquiteta',
    nomeMae: 'Carmen Lúcia Ribeiro',
    cep: '04071-000',
    endereco: 'Avenida Indianópolis',
    numero: '1240',
    complemento: 'Conj 501',
    bairro: 'Planalto Paulista',
    municipio: 'São Paulo',
    uf: 'SP',
    telefonesFixos: '(11) 5055-1234',
    celular: '(11) 99123-8877',
    email: 'helena.castro.arq@email.com',
    procedencia: 'Hospital Albert Sabin',
    remocao: 'Ambulatório',
    medicoIndicou: 'Dra. Patricia Mendonça - Cirurgia Vascular (CRM 88.412)',
    acompanhante: 'Irmã (Juliana)',
    historiaClinica: 'Paciente submetida a debridamento cirúrgico de urgência por Fascite Necrotizante de panturrilha esquerda após pequeno trauma com espinho de roseira. Encaminhada para protocolo adjuvante de Oxigenoterapia Hiperbárica.',
    exameFisicoResumido: 'Lúcida, corada, hidratada. Ausculta pulmonar limpa. Ferida cruenta em granulação após debridamento.',
    localCurativos: 'Enfermagem da Clínica Hiperbárica',
    avaliacaoDor: 3,
    grauEntendimento: 'Excelente, compreende o papel da hiperoxigenação no controle bacteriano anaeróbio.',
    tempoExistenciaPatologia: '3 semanas',
    descricaoLesao: 'Ferida pós-operatória aberta em face posterior de perna E medindo 12 x 7 cm, fundo 80% fibrina/granulação, pouca secreção.',
    diagnostico: 'Fascite Necrotizante Pós-Debridamento em Membro Inferior',
    cid10: 'M72.6',
    numeroTratamentosPrevisto: 20,
    medicamentosEmUso: 'Ceftriaxona 2g IV 1x/dia, Dipirona 1g se dor',
    alergias: 'Nega alergias medicamentosas ou alimentares',
    vicios: 'Nenhum',
    otoscopia: 'MT preservada bilateralmente',
    proteses: 'Nenhuma',
    ventilacao: 'Espontânea',
    createdAt: '2026-08-28T10:30:00Z',
    updatedAt: '2026-09-05T16:00:00Z',
  }
];

const INITIAL_SESSIONS: HyperbaricSession[] = [
  {
    id: 'ses-1',
    patientId: 'pat-1',
    registroOHB: 'OHB-1082',
    sessionNumber: 1,
    data: '2026-08-16',
    hora: '08:30',
    ata: 2.4,
    pa: '130/80',
    glicemia: '142',
    temperatura: '36.4',
    duracaoMinutos: 90,
    tratamentoMedicacao: 'Protocolo de O2 a 100% sob 2.4 ATA em câmara multipaciente',
    intercorrencias: 'Boa adaptação à compressão. Leve desconforto em ouvido médio compensado com deglutição.',
    medicoResponsavel: 'Dr. Carlos Henrique Esteves (CRM 62.139)',
    enfermeiroResponsavel: 'Enf. Renan Matos (COREN-SP 214.901)',
    tecnicoResponsavel: 'Téc. Lucas Silva',
    conferenciaNome: true,
    roupaAlgodao: true,
    pulseiraEstatica: true,
    removerMetaisEletronicos: true,
    retirarProteses: true,
    sondaVesicalAberta: false,
    avpAvcPicc: false,
    velocidadeCompressao: '0.1 ATA/min lenta e gradual',
    velocidadeDescompressao: '0.1 ATA/min lenta',
    covidFebreTosse: false,
    diagDor: 'PR',
    diagQueda: 'PR',
    diagDeambulacao: 'PR',
    diagGlicemia: 'ME',
    diagPele: 'PR',
    diagContaminacao: 'PR',
    diagAnsiedade: 'ME',
    evolucaoEnfermagem: 'Paciente admitido calmo, glicemia pré 142 mg/dL. Retirada prótese móvel. Sessão transcorreu sem intercorrências vitais.',
    status: 'concluida',
  },
  {
    id: 'ses-2',
    patientId: 'pat-1',
    registroOHB: 'OHB-1082',
    sessionNumber: 2,
    data: '2026-08-18',
    hora: '08:30',
    ata: 2.4,
    pa: '125/75',
    glicemia: '135',
    temperatura: '36.5',
    duracaoMinutos: 90,
    tratamentoMedicacao: 'Protocolo O2 a 100% 2.4 ATA',
    intercorrencias: 'Sem queixas de dor ou barotrauma.',
    medicoResponsavel: 'Dr. Carlos Henrique Esteves (CRM 62.139)',
    enfermeiroResponsavel: 'Enf. Renan Matos',
    tecnicoResponsavel: 'Téc. Lucas Silva',
    conferenciaNome: true,
    roupaAlgodao: true,
    pulseiraEstatica: true,
    removerMetaisEletronicos: true,
    retirarProteses: true,
    sondaVesicalAberta: false,
    avpAvcPicc: false,
    velocidadeCompressao: '0.15 ATA/min',
    velocidadeDescompressao: '0.1 ATA/min',
    covidFebreTosse: false,
    diagDor: 'ME',
    diagQueda: 'PR',
    diagDeambulacao: 'PR',
    diagGlicemia: 'ME',
    diagPele: 'ME',
    diagContaminacao: 'PR',
    diagAnsiedade: 'A',
    evolucaoEnfermagem: 'Curativo preservado limpo e seco na saída da câmara. Paciente refere melhora importante na sensação de queimação no pé.',
    status: 'concluida',
  },
  {
    id: 'ses-3',
    patientId: 'pat-1',
    registroOHB: 'OHB-1082',
    sessionNumber: 3,
    data: '2026-08-20',
    hora: '08:30',
    ata: 2.4,
    pa: '120/80',
    glicemia: '128',
    temperatura: '36.3',
    duracaoMinutos: 90,
    tratamentoMedicacao: 'Protocolo O2 a 100% 2.4 ATA',
    intercorrencias: 'Nenhuma',
    medicoResponsavel: 'Dr. Carlos Henrique Esteves (CRM 62.139)',
    enfermeiroResponsavel: 'Enfª. Juliana Martins (COREN-SP 189.442)',
    tecnicoResponsavel: 'Téc. Lucas Silva',
    conferenciaNome: true,
    roupaAlgodao: true,
    pulseiraEstatica: true,
    removerMetaisEletronicos: true,
    retirarProteses: true,
    sondaVesicalAberta: false,
    avpAvcPicc: false,
    velocidadeCompressao: '0.15 ATA/min',
    velocidadeDescompressao: '0.1 ATA/min',
    covidFebreTosse: false,
    diagDor: 'ME',
    diagQueda: 'PR',
    diagDeambulacao: 'PR',
    diagGlicemia: 'R',
    diagPele: 'ME',
    diagContaminacao: 'ME',
    diagAnsiedade: 'A',
    evolucaoEnfermagem: 'Lesão com neovascularização visível na borda superior.',
    status: 'concluida',
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    patientId: 'pat-1',
    patientName: 'Sebastião Pereira dos Santos',
    registroOHB: 'OHB-1082',
    cpf: '529.982.247-25',
    data: '2026-09-09',
    horario: '08:30',
    diaSemana: 'Quarta-feira',
    sessaoNumero: 9,
    pressaoATA: 2.4,
    status: 'confirmado',
    observacoes: 'Verificar glicemia capilar antes da entrada na câmara.',
    telefonePaciente: '(11) 98765-4321',
  },
  {
    id: 'app-2',
    patientId: 'pat-1',
    patientName: 'Sebastião Pereira dos Santos',
    registroOHB: 'OHB-1082',
    cpf: '529.982.247-25',
    data: '2026-09-11',
    horario: '08:30',
    diaSemana: 'Sexta-feira',
    sessaoNumero: 10,
    pressaoATA: 2.4,
    status: 'agendado',
    observacoes: 'Sessão 10: Avaliação médica de meio de ciclo com Dr. Carlos Henrique.',
    telefonePaciente: '(11) 98765-4321',
  },
  {
    id: 'app-3',
    patientId: 'pat-2',
    patientName: 'Helena Ribeiro de Castro',
    registroOHB: 'OHB-1095',
    cpf: '153.508.897-56',
    data: '2026-09-09',
    horario: '10:30',
    diaSemana: 'Quarta-feira',
    sessaoNumero: 4,
    pressaoATA: 2.4,
    status: 'confirmado',
    observacoes: 'Troca de curativo na saída da câmara pela enfermagem.',
    telefonePaciente: '(11) 99123-8877',
  },
  {
    id: 'app-4',
    patientId: 'pat-2',
    patientName: 'Helena Ribeiro de Castro',
    registroOHB: 'OHB-1095',
    cpf: '153.508.897-56',
    data: '2026-09-11',
    horario: '10:30',
    diaSemana: 'Sexta-feira',
    sessaoNumero: 5,
    pressaoATA: 2.4,
    status: 'agendado',
    observacoes: 'Protocolo de cicatrização pós-debridamento.',
    telefonePaciente: '(11) 99123-8877',
  }
];

// Helper para criar SVGs ilustrativos de exemplo quando não houver upload do usuário
function createSampleDocSvg(title: string, subtitle: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
    <rect width="600" height="850" fill="#f8fafc"/>
    <rect x="25" y="25" width="550" height="800" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="40" y="40" width="520" height="70" rx="6" fill="${color}" fill-opacity="0.1" stroke="${color}" stroke-dasharray="4 4"/>
    <text x="60" y="70" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0f172a">MEDICINA HIPERBÁRICA ZONA SUL</text>
    <text x="60" y="92" font-family="sans-serif" font-size="12" fill="#475569">Centro Europa - Unidade Pitombeiras 175 | Tel: (11) 5017-0698</text>
    <text x="300" y="150" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#0f172a">${title.toUpperCase()}</text>
    <text x="300" y="175" font-family="sans-serif" font-size="13" text-anchor="middle" fill="#64748b">${subtitle}</text>
    <line x1="50" y1="200" x2="550" y2="200" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="50" y="230" width="500" height="30" rx="4" fill="#f1f5f9"/>
    <text x="65" y="250" font-family="sans-serif" font-size="12" font-weight="bold" fill="#334155">REGISTRO OHB: VINCULADO AO PACIENTE</text>
    <rect x="50" y="280" width="500" height="480" rx="6" fill="#fcfcfd" stroke="#e2e8f0"/>
    <line x1="70" y1="330" x2="530" y2="330" stroke="#cbd5e1" stroke-dasharray="3 3"/>
    <line x1="70" y1="380" x2="530" y2="380" stroke="#cbd5e1" stroke-dasharray="3 3"/>
    <line x1="70" y1="430" x2="530" y2="430" stroke="#cbd5e1" stroke-dasharray="3 3"/>
    <line x1="70" y1="480" x2="530" y2="480" stroke="#cbd5e1" stroke-dasharray="3 3"/>
    <line x1="70" y1="530" x2="530" y2="530" stroke="#cbd5e1" stroke-dasharray="3 3"/>
    <line x1="70" y1="580" x2="530" y2="580" stroke="#cbd5e1" stroke-dasharray="3 3"/>
    <text x="70" y="320" font-family="monospace" font-size="12" fill="#475569">Digitalização de documento histórico arquivado</text>
    <text x="70" y="370" font-family="monospace" font-size="12" fill="#475569">Registro físico transferido para prontuário digital</text>
    <text x="70" y="420" font-family="monospace" font-size="12" fill="#475569">Compatível com AWS S3 storage e indexação relacional</text>
    <circle cx="480" cy="710" r="36" fill="none" stroke="${color}" stroke-width="2"/>
    <text x="480" y="705" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle" fill="${color}">MEDICINA</text>
    <text x="480" y="718" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle" fill="${color}">HIPERBÁRICA</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const StorageService = {
  // === PACIENTES ===
  getPatients(): Patient[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PATIENTS;
    }
  },

  savePatient(patient: Patient): Patient {
    const list = this.getPatients();
    const idx = list.findIndex((p) => p.id === patient.id);
    if (idx >= 0) {
      list[idx] = { ...patient, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({
        ...patient,
        id: patient.id || `pat-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(list));
    return patient;
  },

  deletePatient(id: string): void {
    const list = this.getPatients().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(list));
  },

  getPatientById(id: string): Patient | undefined {
    return this.getPatients().find((p) => p.id === id);
  },

  getPatientByRegistroOHB(registroOHB: string): Patient | undefined {
    const clean = registroOHB.trim().toUpperCase();
    return this.getPatients().find((p) => p.registroOHB.trim().toUpperCase() === clean);
  },

  getPatientByCPF(cpf: string): Patient | undefined {
    const clean = cpf.replace(/\D/g, '');
    return this.getPatients().find((p) => p.cpf.replace(/\D/g, '') === clean);
  },

  // === SESSÕES OHB ===
  getSessions(patientId?: string): HyperbaricSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    let list: HyperbaricSession[] = [];
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
      list = INITIAL_SESSIONS;
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_SESSIONS;
      }
    }
    if (patientId) {
      return list.filter((s) => s.patientId === patientId).sort((a, b) => a.sessionNumber - b.sessionNumber);
    }
    return list.sort((a, b) => b.data.localeCompare(a.data));
  },

  saveSession(session: HyperbaricSession): HyperbaricSession {
    const list = this.getSessions();
    const idx = list.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      list[idx] = session;
    } else {
      list.push({ ...session, id: session.id || `ses-${Date.now()}` });
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
    return session;
  },

  deleteSession(id: string): void {
    const list = this.getSessions().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
  },

  // === AGENDAMENTOS ===
  getAppointments(): Appointment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  },

  saveAppointment(appointment: Appointment): Appointment {
    const list = this.getAppointments();
    const idx = list.findIndex((a) => a.id === appointment.id);
    if (idx >= 0) {
      list[idx] = appointment;
    } else {
      list.push({ ...appointment, id: appointment.id || `app-${Date.now()}` });
    }
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    return appointment;
  },

  deleteAppointment(id: string): void {
    const list = this.getAppointments().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
  },

  // === DOCUMENTOS DIGITALIZADOS (INDEXED DB) ===
  async getAllDigitalizedDocs(): Promise<DigitalizedDocument[]> {
    try {
      const db = await openIndexedDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DOCS, 'readonly');
        const store = tx.objectStore(STORE_DOCS);
        const request = store.getAll();
        request.onsuccess = () => {
          let docs = request.result as DigitalizedDocument[];
          if (!docs || docs.length === 0) {
            // Seed inicial com documentos vinculados ao OHB-1082 e OHB-1095
            docs = [
              {
                id: 'doc-1',
                registroOHB: 'OHB-1082',
                cpf: '529.982.247-25',
                patientId: 'pat-1',
                patientName: 'Sebastião Pereira dos Santos',
                titulo: 'Prontuário Físico Histórico Escaneado (Ano 2022)',
                tipo: 'prontuario_antigo',
                dataDocumento: '2022-09-14',
                dataUpload: '2026-08-15T10:00:00Z',
                observacoes: 'Digitalização da ficha original de admissão prévia e biópsia óssea.',
                imageUrl: createSampleDocSvg('Prontuário Antigo Digitalizado', 'Registro OHB-1082 | Paciente: Sebastião Pereira dos Santos', '#0284c7'),
                tamanhoKb: 245,
              },
              {
                id: 'doc-2',
                registroOHB: 'OHB-1082',
                cpf: '529.982.247-25',
                patientId: 'pat-1',
                patientName: 'Sebastião Pereira dos Santos',
                titulo: 'Foto de Admissão da Lesão em Antepé',
                tipo: 'foto_lesao',
                dataDocumento: '2026-08-15',
                dataUpload: '2026-08-15T10:15:00Z',
                observacoes: 'Úlcera plantar antes de iniciar as sessões hiperbáricas.',
                imageUrl: createSampleDocSvg('Foto da Lesão - Admissão', 'Área: 4.5 x 3.0 cm | Tecido de granulação inicial', '#059669'),
                tamanhoKb: 380,
              },
              {
                id: 'doc-3',
                registroOHB: 'OHB-1095',
                cpf: '153.508.897-56',
                patientId: 'pat-2',
                patientName: 'Helena Ribeiro de Castro',
                titulo: 'Laudo Cirúrgico de Debridamento Hospital Albert Sabin',
                tipo: 'exame_laudo',
                dataDocumento: '2026-08-27',
                dataUpload: '2026-08-28T11:00:00Z',
                observacoes: 'Encaminhamento com descrição minuciosa da área debridada.',
                imageUrl: createSampleDocSvg('Laudo Cirúrgico Digitalizado', 'Registro OHB-1095 | Fascite Necrotizante', '#7c3aed'),
                tamanhoKb: 310,
              }
            ];
            // Salvar no IndexedDB
            const writeTx = db.transaction(STORE_DOCS, 'readwrite');
            const writeStore = writeTx.objectStore(STORE_DOCS);
            docs.forEach(d => writeStore.put(d));
          }
          resolve(docs.sort((a, b) => b.dataUpload.localeCompare(a.dataUpload)));
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  },

  async saveDigitalizedDoc(doc: DigitalizedDocument): Promise<DigitalizedDocument> {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOCS, 'readwrite');
      const store = tx.objectStore(STORE_DOCS);
      const record = {
        ...doc,
        id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        dataUpload: doc.dataUpload || new Date().toISOString(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  },

  async deleteDigitalizedDoc(id: string): Promise<void> {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOCS, 'readwrite');
      const store = tx.objectStore(STORE_DOCS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getDocsByRegistroOHB(registroOHB: string): Promise<DigitalizedDocument[]> {
    const all = await this.getAllDigitalizedDocs();
    const clean = registroOHB.trim().toUpperCase();
    return all.filter((d) => d.registroOHB.trim().toUpperCase() === clean);
  },

  async getDocsByCPF(cpf: string): Promise<DigitalizedDocument[]> {
    const all = await this.getAllDigitalizedDocs();
    const clean = cpf.replace(/\D/g, '');
    return all.filter((d) => d.cpf.replace(/\D/g, '') === clean);
  },

  // Exportação e Importação completa de Dados em JSON
  async exportFullBackup(): Promise<string> {
    const patients = this.getPatients();
    const sessions = this.getSessions();
    const appointments = this.getAppointments();
    const docs = await this.getAllDigitalizedDocs();

    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      clinica: 'Medicina Hiperbárica Zona Sul / Centro Europa',
      data: {
        patients,
        sessions,
        appointments,
        digitalizedDocuments: docs,
      },
    };

    return JSON.stringify(payload, null, 2);
  },

  async importFullBackup(jsonString: string): Promise<{ patients: number; sessions: number; docs: number }> {
    const parsed = JSON.parse(jsonString);
    if (!parsed.data) throw new Error('Formato de backup inválido.');

    if (Array.isArray(parsed.data.patients)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(parsed.data.patients));
    }
    if (Array.isArray(parsed.data.sessions)) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(parsed.data.sessions));
    }
    if (Array.isArray(parsed.data.appointments)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(parsed.data.appointments));
    }
    if (Array.isArray(parsed.data.digitalizedDocuments)) {
      const db = await openIndexedDB();
      const tx = db.transaction(STORE_DOCS, 'readwrite');
      const store = tx.objectStore(STORE_DOCS);
      for (const d of parsed.data.digitalizedDocuments) {
        store.put(d);
      }
    }

    return {
      patients: parsed.data.patients?.length || 0,
      sessions: parsed.data.sessions?.length || 0,
      docs: parsed.data.digitalizedDocuments?.length || 0,
    };
  },
};
