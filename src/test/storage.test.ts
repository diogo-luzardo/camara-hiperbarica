import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../services/storage';
import { Patient, HyperbaricSession, Appointment } from '../types';

describe('StorageService (Local Storage & API Fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockPatient: Patient = {
    id: 'pat-test-100',
    registroOHB: 'OHB-9999',
    registroHospitalar: 'RH-99999',
    unidade: 'Hospital São Luiz Jabaquara',
    nome: 'Carlos Drummond de Andrade',
    convenio: 'Amil Saúde',
    plano: 'Blue 400',
    matriculaConvenio: '123456789',
    validadeConvenio: '10/2028',
    dataNascimento: '1970-05-15',
    idade: 56,
    sexo: 'M',
    estadoCivil: 'Casado',
    rg: '20.123.456-7',
    cpf: '123.456.789-00',
    profissao: 'Engenheiro',
    nomeMae: 'Maria Drummond',
    cep: '04343-160',
    endereco: 'Rua das Pitombeiras',
    numero: '100',
    complemento: '',
    bairro: 'Jabaquara',
    municipio: 'São Paulo',
    uf: 'SP',
    telefonesFixos: '(11) 5011-0000',
    celular: '(11) 99999-8888',
    email: 'carlos@drummond.com',
    procedencia: 'Ambulatório',
    remocao: 'Própria',
    medicoIndicou: 'Dr. Carlos Henrique Esteves',
    acompanhante: 'Esposa',
    historiaClinica: 'Úlcera neuropática em membro inferior.',
    exameFisicoResumido: 'BEG, corado.',
    localCurativos: 'Ambulatorial',
    avaliacaoDor: 4,
    grauEntendimento: 'Excelente',
    tempoExistenciaPatologia: '3 meses',
    descricaoLesao: 'Lesão de 3x2 cm com tecido de granulação.',
    diagnostico: 'Pé Diabético com Lesão Neuropática',
    cid10: 'E11.5',
    numeroTratamentosPrevisto: 20,
    medicamentosEmUso: 'Losartana 50mg',
    alergias: 'Nega alergias',
    vicios: 'Não tabagista',
    otoscopia: 'Íntegra bilateral',
    proteses: 'Nenhuma',
    ventilacao: 'Espontânea em ar ambiente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('deve carregar lista inicial de pacientes quando o armazenamento estiver limpo', async () => {
    // Simula backend offline para testar o fallback garantido de storage local
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const patients = await StorageService.getPatients();
    expect(patients.length).toBeGreaterThan(0);
    expect(patients[0].nome).toBeDefined();
    expect(patients[0].registroOHB).toBeDefined();
  });

  it('deve cadastrar um novo paciente e persistir no armazenamento local', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    await StorageService.savePatient(mockPatient);
    const patients = await StorageService.getPatients();
    const found = patients.find((p) => p.registroOHB === 'OHB-9999');

    expect(found).toBeDefined();
    expect(found?.nome).toBe('Carlos Drummond de Andrade');
    expect(found?.idade).toBe(56);
    expect(found?.diagnostico).toBe('Pé Diabético com Lesão Neuropática');
  });

  it('deve atualizar um paciente existente mantendo dados íntegros', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    await StorageService.savePatient(mockPatient);
    const updatedPatient: Patient = {
      ...mockPatient,
      avaliacaoDor: 2,
      descricaoLesao: 'Lesão em cicatrização acelerada, 1.5x1 cm com 90% granulação.',
    };
    await StorageService.savePatient(updatedPatient);

    const patients = await StorageService.getPatients();
    const found = patients.find((p) => p.id === mockPatient.id);

    expect(found?.avaliacaoDor).toBe(2);
    expect(found?.descricaoLesao).toContain('cicatrização acelerada');
  });

  it('deve salvar e listar sessões hiperbáricas vinculadas a um paciente', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const newSession: HyperbaricSession = {
      id: 'ses-test-1',
      patientId: mockPatient.id,
      registroOHB: mockPatient.registroOHB,
      sessionNumber: 1,
      data: '2026-09-26',
      hora: '09:00',
      ata: 2.4,
      pa: '120/80',
      glicemia: '110',
      temperatura: '36.5',
      duracaoMinutos: 90,
      tratamentoMedicacao: 'Oxigênio a 100% a 2.4 ATA',
      intercorrencias: 'Sem intercorrências',
      medicoResponsavel: 'Dr. Carlos Henrique',
      enfermeiroResponsavel: 'Enf. Renan',
      tecnicoResponsavel: 'Téc. Lucas',
      conferenciaNome: true,
      roupaAlgodao: true,
      pulseiraEstatica: true,
      removerMetaisEletronicos: true,
      retirarProteses: true,
      sondaVesicalAberta: false,
      avpAvcPicc: false,
      velocidadeCompressao: '0.1 ATA/min',
      velocidadeDescompressao: '0.1 ATA/min',
      covidFebreTosse: false,
      diagDor: 'ME',
      diagQueda: 'PR',
      diagDeambulacao: 'PR',
      diagGlicemia: 'ME',
      diagPele: 'ME',
      diagContaminacao: 'PR',
      diagAnsiedade: 'ME',
      evolucaoEnfermagem: 'Sessão iniciada sem queixas.',
      status: 'concluida',
    };

    await StorageService.saveSession(newSession);
    const sessions = await StorageService.getSessions();
    const foundSession = sessions.find((s) => s.id === 'ses-test-1');

    expect(foundSession).toBeDefined();
    expect(foundSession?.ata).toBe(2.4);
    expect(foundSession?.roupaAlgodao).toBe(true);
    expect(foundSession?.pulseiraEstatica).toBe(true);
  });

  it('deve excluir uma sessão hiperbárica com sucesso', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const session: HyperbaricSession = {
      id: 'ses-to-delete',
      patientId: 'pat-1',
      registroOHB: 'OHB-1082',
      sessionNumber: 99,
      data: '2026-09-26',
      hora: '10:00',
      ata: 2.4,
      pa: '120/80',
      glicemia: '100',
      temperatura: '36.5',
      duracaoMinutos: 90,
      tratamentoMedicacao: 'Protocolo OHB',
      intercorrencias: '',
      medicoResponsavel: 'Dr. Carlos',
      enfermeiroResponsavel: 'Enf. Renan',
      tecnicoResponsavel: 'Téc. Lucas',
      conferenciaNome: true,
      roupaAlgodao: true,
      pulseiraEstatica: true,
      removerMetaisEletronicos: true,
      retirarProteses: true,
      sondaVesicalAberta: false,
      avpAvcPicc: false,
      velocidadeCompressao: 'Lenta',
      velocidadeDescompressao: 'Lenta',
      covidFebreTosse: false,
      diagDor: 'PR',
      diagQueda: 'PR',
      diagDeambulacao: 'PR',
      diagGlicemia: 'PR',
      diagPele: 'PR',
      diagContaminacao: 'PR',
      diagAnsiedade: 'PR',
      evolucaoEnfermagem: 'Normal',
      status: 'concluida',
    };

    await StorageService.saveSession(session);
    let sessions = await StorageService.getSessions();
    expect(sessions.some((s) => s.id === 'ses-to-delete')).toBe(true);

    await StorageService.deleteSession('ses-to-delete');
    sessions = await StorageService.getSessions();
    expect(sessions.some((s) => s.id === 'ses-to-delete')).toBe(false);
  });

  it('deve salvar, listar e alternar status de agendamentos', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const app: Appointment = {
      id: 'app-test-55',
      patientId: 'pat-1',
      patientName: 'Sebastião Pereira',
      registroOHB: 'OHB-1082',
      cpf: '529.982.247-25',
      data: '2026-09-30',
      horario: '14:00',
      diaSemana: 'Quarta-feira',
      sessaoNumero: 15,
      pressaoATA: 2.4,
      status: 'agendado',
      observacoes: 'Sessão 15 do protocolo',
      telefonePaciente: '(11) 98765-4321',
    };

    await StorageService.saveAppointment(app);
    let apps = await StorageService.getAppointments();
    expect(apps.some((a) => a.id === 'app-test-55')).toBe(true);

    // Atualiza status para confirmado
    await StorageService.saveAppointment({ ...app, status: 'confirmado' });
    apps = await StorageService.getAppointments();
    const updated = apps.find((a) => a.id === 'app-test-55');
    expect(updated?.status).toBe('confirmado');

    // Deleta agendamento
    await StorageService.deleteAppointment('app-test-55');
    apps = await StorageService.getAppointments();
    expect(apps.some((a) => a.id === 'app-test-55')).toBe(false);
  });
});
