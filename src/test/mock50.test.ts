import { describe, it, expect, beforeEach } from 'vitest';
import { MOCK_PATIENTS_50, MOCK_SESSIONS_50, MOCK_APPOINTMENTS_50, MOCK_DOCUMENTS_50 } from '../data/mockPatients50';
import { StorageService } from '../services/storage';

describe('Dataset de 50 Pacientes Mock e Integridade dos Filtros', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve conter pelo menos 50 pacientes detalhados com CIDs e indicações de OHB', () => {
    expect(MOCK_PATIENTS_50.length).toBeGreaterThanOrEqual(50);

    // Valida que todos os pacientes possuem campos essenciais
    MOCK_PATIENTS_50.forEach((p) => {
      expect(p.id).toBeDefined();
      expect(p.registroOHB).toMatch(/^OHB-\d+/);
      expect(p.nome.length).toBeGreaterThan(3);
      expect(p.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      expect(p.cid10).toBeDefined();
      expect(p.diagnostico.length).toBeGreaterThan(5);
      expect(p.numeroTratamentosPrevisto).toBeGreaterThan(0);
      expect(p.convenio).toBeDefined();
      expect(p.endereco).toBeDefined();
    });
  });

  it('deve conter sessões hiperbáricas com protocolo padrão de 150 minutos e modalidades convênio/particular', () => {
    expect(MOCK_SESSIONS_50.length).toBeGreaterThanOrEqual(100);

    // Valida duração de 150 minutos em todas as sessões do protocolo
    const duracaoCorreta = MOCK_SESSIONS_50.every((s) => s.duracaoMinutos === 150);
    expect(duracaoCorreta).toBe(true);

    // Valida existência de sessões na modalidade particular
    const sessoesParticulares = MOCK_SESSIONS_50.filter((s) => s.modalidade === 'particular');
    expect(sessoesParticulares.length).toBeGreaterThan(0);

    // Valida existência de sessões de convênio
    const sessoesConvenio = MOCK_SESSIONS_50.filter((s) => s.modalidade === 'convenio');
    expect(sessoesConvenio.length).toBeGreaterThan(0);
  });

  it('deve conter agendamentos distribuídos entre modalidades e dias da semana', () => {
    expect(MOCK_APPOINTMENTS_50.length).toBeGreaterThanOrEqual(30);

    MOCK_APPOINTMENTS_50.forEach((app) => {
      expect(app.patientName).toBeDefined();
      expect(app.registroOHB).toMatch(/^OHB-\d+/);
      expect(app.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(app.horario).toMatch(/^\d{2}:\d{2}$/);
      expect(app.pressaoATA).toBeGreaterThanOrEqual(2.0);
    });
  });

  it('StorageService deve popular automaticamente o localStorage com os 50 pacientes e permitir busca e filtros', () => {
    const patients = StorageService.getLocalPatients();
    expect(patients.length).toBe(50);

    const sessions = StorageService.getLocalSessions();
    expect(sessions.length).toBeGreaterThanOrEqual(100);

    const appointments = StorageService.getLocalAppointments();
    expect(appointments.length).toBeGreaterThanOrEqual(30);

    // Teste de filtro por convênio Bradesco
    const bradesco = patients.filter((p) => p.convenio === 'Bradesco Saúde');
    expect(bradesco.length).toBeGreaterThan(0);

    // Teste de filtro por Particular
    const particulares = patients.filter((p) => p.convenio.toLowerCase().includes('particular'));
    expect(particulares.length).toBeGreaterThan(0);

    // Teste de busca por termo clínico (Pé Diabético / E11.5)
    const diabeticos = patients.filter((p) => p.cid10 === 'E11.5');
    expect(diabeticos.length).toBeGreaterThan(0);

    // Teste de busca por endereço/rua
    const ruaPitombeiras = patients.filter((p) => p.endereco.toLowerCase().includes('pitombeiras'));
    expect(ruaPitombeiras.length).toBeGreaterThan(0);
  });
});
