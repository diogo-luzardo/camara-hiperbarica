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

  it('deve fatiar corretamente 50 pacientes em páginas de 12 itens', () => {
    const patients = StorageService.getLocalPatients();
    const pageSize = 12;
    const totalPages = Math.ceil(patients.length / pageSize);
    expect(totalPages).toBe(5); // 50 / 12 = 4.16 -> 5 páginas

    // Página 1 (12 itens)
    const page1 = patients.slice(0, 12);
    expect(page1.length).toBe(12);
    expect(page1[0].registroOHB).toBe('OHB-1082');

    // Página 5 (última página, 2 itens restantes: 50 - 48 = 2)
    const page5 = patients.slice(48, 60);
    expect(page5.length).toBe(2);
  });

  it('deve realizar busca LIKE insensível a acentos (ex: "Ant", "antonio", "Antônio") e documentos (CPF, OHB)', () => {
    const patients = StorageService.getLocalPatients();

    function normalizeText(str?: string): string {
      if (!str) return '';
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    }

    function searchPatients(term: string) {
      const rawSearch = term.trim();
      const normalizedTerm = normalizeText(rawSearch);
      const rawDigits = rawSearch.replace(/\D/g, '');

      return patients.filter((patient) => {
        let matchDoc = false;
        if (rawDigits.length > 0) {
          const rawCpf = (patient.cpf || '').replace(/\D/g, '');
          const rawRg = (patient.rg || '').replace(/\D/g, '');
          const rawOhb = (patient.registroOHB || '').replace(/\D/g, '');
          matchDoc = rawCpf.includes(rawDigits) || rawRg.includes(rawDigits) || rawOhb.includes(rawDigits);
        }

        const matchText =
          normalizeText(patient.nome).includes(normalizedTerm) ||
          normalizeText(patient.registroOHB).includes(normalizedTerm) ||
          normalizeText(patient.cpf).includes(normalizedTerm) ||
          normalizeText(patient.diagnostico).includes(normalizedTerm);

        return matchDoc || matchText;
      });
    }

    // 1. Busca por "Ant" deve encontrar Antônio Carlos Guimarães
    const resultsAnt = searchPatients('Ant');
    expect(resultsAnt.some((p) => p.nome === 'Antônio Carlos Guimarães')).toBe(true);

    // 2. Busca por "antonio" (sem acento) deve encontrar Antônio Carlos Guimarães
    const resultsSemAcento = searchPatients('antonio');
    expect(resultsSemAcento.some((p) => p.nome === 'Antônio Carlos Guimarães')).toBe(true);

    // 3. Busca por "Antônio" (com acento) deve encontrar Antônio Carlos Guimarães
    const resultsComAcento = searchPatients('Antônio');
    expect(resultsComAcento.some((p) => p.nome === 'Antônio Carlos Guimarães')).toBe(true);

    // 4. Busca por CPF digitado ("189" ou "189617") deve encontrar Antônio Carlos Guimarães
    const resultsDoc = searchPatients('189.617');
    expect(resultsDoc.some((p) => p.nome === 'Antônio Carlos Guimarães')).toBe(true);

    // 5. Busca por registro numérico ("1086") deve encontrar OHB-1086
    const resultsOHB = searchPatients('1086');
    expect(resultsOHB.some((p) => p.registroOHB === 'OHB-1086')).toBe(true);
  });
});
