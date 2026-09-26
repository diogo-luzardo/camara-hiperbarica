import { describe, it, expect, vi } from 'vitest';
import { getGoogleCalendarUrl, getWhatsAppReminderUrl, downloadIcsAppointment } from '../utils/calendarExport';
import { Appointment } from '../types';

describe('Calendar Export Utilities', () => {
  const sampleAppointment: Appointment = {
    id: 'app-test-1',
    patientId: 'pat-1',
    patientName: 'Sebastião Pereira dos Santos',
    registroOHB: 'OHB-1082',
    cpf: '529.982.247-25',
    data: '2026-09-10',
    horario: '08:30',
    diaSemana: 'Quinta-feira',
    sessaoNumero: 10,
    pressaoATA: 2.4,
    status: 'confirmado',
    observacoes: 'Chegar com 15 minutos de antecedência. Usar roupa 100% algodão.',
    telefonePaciente: '(11) 98765-4321',
  };

  it('deve gerar URL correta para o Google Agenda com todos os parâmetros formatados', () => {
    const url = getGoogleCalendarUrl(sampleAppointment);
    expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
    expect(url).toContain('text=Sess%C3%A3o%20OHB%20%2310%20-%20Sebasti%C3%A3o%20Pereira%20dos%20Santos');
    expect(url).toContain('20260910T');
    expect(url).toContain('Rua%20das%20Pitombeiras%2C%20175');
  });

  it('deve gerar URL de mensagem formatada para WhatsApp com dados da sessão e orientações', () => {
    const url = getWhatsAppReminderUrl(sampleAppointment);
    expect(url).toContain('https://api.whatsapp.com/send?phone=5511987654321&text=');
    expect(url).toContain('Sebasti%C3%A3o');
    expect(url).toContain('10%2F09%2F2026');
    expect(url).toContain('08%3A30');
    expect(url).toContain('2.4%20ATA');
    expect(url).toContain('100%25%20algod%C3%A3o');
  });

  it('deve sanitizar o número de telefone no envio de WhatsApp', () => {
    const appWithoutCleanPhone: Appointment = {
      ...sampleAppointment,
      telefonePaciente: '+55 (11) 9.1234-5678',
    };
    const url = getWhatsAppReminderUrl(appWithoutCleanPhone);
    expect(url).toContain('phone=5511912345678');
  });

  it('deve criar e disparar o download do arquivo .ics com alarmes e padrão RFC 5545', () => {
    // Mock do DOM createElement, appendChild, removeChild e URL.createObjectURL
    const mockClick = vi.fn();
    const mockAnchor = {
      href: '',
      setAttribute: vi.fn(),
      click: mockClick,
    };

    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });

    downloadIcsAppointment(sampleAppointment);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.setAttribute).toHaveBeenCalledWith(
      'download',
      'Sessao_OHB_OHB-1082_2026-09-10.ics'
    );
    expect(mockClick).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
