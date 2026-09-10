import { Patient, HyperbaricSession, Appointment, DigitalizedDocument } from '../types';

const API_BASE = 'http://localhost:8080/api';
const DB_NAME = 'ClinicaOHB_Database';
const DB_VERSION = 1;
const STORE_DOCS = 'digitalized_documents';

const STORAGE_KEYS = {
  PATIENTS: 'ohb_patients_v1',
  SESSIONS: 'ohb_sessions_v1',
  APPOINTMENTS: 'ohb_appointments_v1',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id?: string): boolean {
  return !!id && UUID_REGEX.test(id);
}

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
  }
];

function mapBackendPatientToFrontend(b: any): Patient {
  return {
    ...b,
    id: String(b.id),
    idade: typeof b.idade === 'number' ? b.idade : (b.idade ? parseInt(b.idade) : 0),
    avaliacaoDor: typeof b.avaliacaoDor === 'number' ? b.avaliacaoDor : (b.avaliacaoDor ? parseInt(b.avaliacaoDor) : 0),
    numeroTratamentosPrevisto: typeof b.numeroTratamentosPrevisto === 'number' ? b.numeroTratamentosPrevisto : (b.numeroTratamentosPrevisto ? parseInt(b.numeroTratamentosPrevisto) : 0),
  };
}

function mapBackendSessionToFrontend(s: any): HyperbaricSession {
  return {
    ...s,
    id: String(s.id),
    patientId: s.patient ? String(s.patient.id) : (s.patientId || ''),
    sessionNumber: typeof s.sessionNumber === 'number' ? s.sessionNumber : parseInt(s.sessionNumber || '1'),
    ata: typeof s.ata === 'number' ? s.ata : parseFloat(s.ata || '2.4'),
    duracaoMinutos: typeof s.duracaoMinutos === 'number' ? s.duracaoMinutos : parseInt(s.duracaoMinutos || '90'),
  };
}

function mapBackendAppointmentToFrontend(a: any): Appointment {
  return {
    ...a,
    id: String(a.id),
    patientId: a.patient ? String(a.patient.id) : (a.patientId || ''),
    sessaoNumero: typeof a.sessaoNumero === 'number' ? a.sessaoNumero : parseInt(a.sessaoNumero || '1'),
    pressaoATA: typeof a.pressaoATA === 'number' ? a.pressaoATA : parseFloat(a.pressaoATA || '2.4'),
  };
}

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
    <text x="70" y="320" font-family="monospace" font-size="12" fill="#475569">Digitalização de documento histórico arquivado</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const StorageService = {
  // === PACIENTES ===
  async getPatients(): Promise<Patient[]> {
    try {
      const res = await fetch(`${API_BASE}/patients`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const patients = data.map(mapBackendPatientToFrontend);
          localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
          return patients;
        } else {
          // Se o H2 estiver vazio, envia os pacientes locais para popular o H2
          const local = this.getLocalPatients();
          for (const pat of local) {
            await this.sendPatientToApi(pat);
          }
          const retryRes = await fetch(`${API_BASE}/patients`);
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            const patients = retryData.map(mapBackendPatientToFrontend);
            localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
            return patients;
          }
        }
      }
    } catch (err) {
      console.warn('Servidor Quarkus REST indisponível, utilizando cache do localStorage:', err);
    }
    return this.getLocalPatients();
  },

  getLocalPatients(): Patient[] {
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

  async sendPatientToApi(patient: Patient): Promise<Patient | null> {
    try {
      const payload: any = { ...patient };
      if (!isValidUUID(payload.id)) {
        delete payload.id;
      }
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.deletedAt;

      const res = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return mapBackendPatientToFrontend(data);
      }
    } catch (err) {
      console.error('Erro ao enviar paciente ao Quarkus H2:', err);
    }
    return null;
  },

  async savePatient(patient: Patient): Promise<Patient> {
    // 1. Envia para o Quarkus / H2 Database
    let saved = await this.sendPatientToApi(patient);

    if (!saved) {
      // Fallback local se o backend não respondeu
      saved = {
        ...patient,
        id: patient.id || `pat-${Date.now()}`,
        createdAt: patient.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // 2. Atualiza local storage cache
    const list = this.getLocalPatients();
    const idx = list.findIndex(
      (p) =>
        p.id === saved!.id ||
        p.registroOHB === saved!.registroOHB ||
        (p.cpf && saved!.cpf && p.cpf.replace(/\D/g, '') === saved!.cpf.replace(/\D/g, ''))
    );
    if (idx >= 0) {
      list[idx] = saved;
    } else {
      list.unshift(saved);
    }
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(list));
    return saved;
  },

  async deletePatient(id: string): Promise<void> {
    try {
      if (isValidUUID(id)) {
        await fetch(`${API_BASE}/patients/${id}`, { method: 'DELETE' });
      }
    } catch (err) {
      console.error('Erro ao remover paciente do H2:', err);
    }
    const list = this.getLocalPatients().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(list));
  },

  async getPatientById(id: string): Promise<Patient | undefined> {
    const patients = await this.getPatients();
    return patients.find((p) => p.id === id);
  },

  async getPatientByRegistroOHB(registroOHB: string): Promise<Patient | undefined> {
    const clean = registroOHB.trim().toUpperCase();
    const patients = await this.getPatients();
    return patients.find((p) => p.registroOHB.trim().toUpperCase() === clean);
  },

  async getPatientByCPF(cpf: string): Promise<Patient | undefined> {
    const clean = cpf.replace(/\D/g, '');
    const patients = await this.getPatients();
    return patients.find((p) => p.cpf.replace(/\D/g, '') === clean);
  },

  // === SESSÕES OHB ===
  async getSessions(patientId?: string): Promise<HyperbaricSession[]> {
    try {
      const url = patientId ? `${API_BASE}/sessions?patientId=${patientId}` : `${API_BASE}/sessions`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const sessions = data.map(mapBackendSessionToFrontend);
          localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
          return sessions;
        }
      }
    } catch (err) {
      console.warn('Servidor Quarkus indisponível para sessões:', err);
    }
    const local = this.getLocalSessions();
    if (patientId) {
      return local.filter((s) => s.patientId === patientId).sort((a, b) => a.sessionNumber - b.sessionNumber);
    }
    return local.sort((a, b) => b.data.localeCompare(a.data));
  },

  getLocalSessions(): HyperbaricSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SESSIONS;
    }
  },

  async saveSession(session: HyperbaricSession): Promise<HyperbaricSession> {
    try {
      const payload: any = { ...session };
      if (!isValidUUID(payload.id)) delete payload.id;
      if (session.patientId && isValidUUID(session.patientId)) {
        payload.patient = { id: session.patientId };
      }
      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const saved = mapBackendSessionToFrontend(data);
        const list = this.getLocalSessions();
        const idx = list.findIndex((s) => s.id === saved.id);
        if (idx >= 0) list[idx] = saved;
        else list.push(saved);
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
        return saved;
      }
    } catch (err) {
      console.error('Erro ao salvar sessão no backend:', err);
    }
    // Fallback local
    const list = this.getLocalSessions();
    const idx = list.findIndex((s) => s.id === session.id);
    if (idx >= 0) list[idx] = session;
    else list.push({ ...session, id: session.id || `ses-${Date.now()}` });
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
    return session;
  },

  async deleteSession(id: string): Promise<void> {
    try {
      if (isValidUUID(id)) {
        await fetch(`${API_BASE}/sessions/${id}`, { method: 'DELETE' });
      }
    } catch (err) {
      console.error('Erro ao deletar sessão:', err);
    }
    const list = this.getLocalSessions().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
  },

  // === AGENDAMENTOS ===
  async getAppointments(): Promise<Appointment[]> {
    try {
      const res = await fetch(`${API_BASE}/appointments`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const appointments = data.map(mapBackendAppointmentToFrontend);
          localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
          return appointments;
        }
      }
    } catch (err) {
      console.warn('Servidor Quarkus indisponível para agendamentos:', err);
    }
    return this.getLocalAppointments();
  },

  getLocalAppointments(): Appointment[] {
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

  async saveAppointment(appointment: Appointment): Promise<Appointment> {
    try {
      const payload: any = { ...appointment };
      if (!isValidUUID(payload.id)) delete payload.id;
      if (appointment.patientId && isValidUUID(appointment.patientId)) {
        payload.patient = { id: appointment.patientId };
      }
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const saved = mapBackendAppointmentToFrontend(data);
        const list = this.getLocalAppointments();
        const idx = list.findIndex((a) => a.id === saved.id);
        if (idx >= 0) list[idx] = saved;
        else list.push(saved);
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
        return saved;
      }
    } catch (err) {
      console.error('Erro ao salvar agendamento no backend:', err);
    }
    const list = this.getLocalAppointments();
    const idx = list.findIndex((a) => a.id === appointment.id);
    if (idx >= 0) list[idx] = appointment;
    else list.push({ ...appointment, id: appointment.id || `app-${Date.now()}` });
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    return appointment;
  },

  async deleteAppointment(id: string): Promise<void> {
    try {
      if (isValidUUID(id)) {
        await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
      }
    } catch (err) {
      console.error('Erro ao deletar agendamento:', err);
    }
    const list = this.getLocalAppointments().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
  },

  // === DOCUMENTOS DIGITALIZADOS (INDEXED DB + BACKEND) ===
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
              }
            ];
            const writeTx = db.transaction(STORE_DOCS, 'readwrite');
            const writeStore = writeTx.objectStore(STORE_DOCS);
            docs.forEach((d) => writeStore.put(d));
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

  async exportFullBackup(): Promise<string> {
    const patients = await this.getPatients();
    const sessions = await this.getSessions();
    const appointments = await this.getAppointments();
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
      for (const p of parsed.data.patients) {
        await this.savePatient(p);
      }
    }
    if (Array.isArray(parsed.data.sessions)) {
      for (const s of parsed.data.sessions) {
        await this.saveSession(s);
      }
    }
    if (Array.isArray(parsed.data.appointments)) {
      for (const a of parsed.data.appointments) {
        await this.saveAppointment(a);
      }
    }
    if (Array.isArray(parsed.data.digitalizedDocuments)) {
      for (const d of parsed.data.digitalizedDocuments) {
        await this.saveDigitalizedDoc(d);
      }
    }

    return {
      patients: parsed.data.patients?.length || 0,
      sessions: parsed.data.sessions?.length || 0,
      docs: parsed.data.digitalizedDocuments?.length || 0,
    };
  },
};
