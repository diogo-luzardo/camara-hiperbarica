import { Appointment } from '../types';

/**
 * Utilitários para sincronização de sessões na agenda do celular (.ics),
 * Google Agenda e lembretes via WhatsApp.
 */

export function downloadIcsAppointment(appointment: Appointment, clinicName = 'Medicina Hiperbárica Zona Sul'): void {
  // Parse date and time
  const [year, month, day] = appointment.data.split('-').map(Number);
  const [hour, minute] = appointment.horario.split(':').map(Number);

  const startDate = new Date(year, month - 1, day, hour, minute);
  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000); // 90 min de sessão típica

  const formatDateForIcs = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const startStr = formatDateForIcs(startDate);
  const endStr = formatDateForIcs(endDate);
  const nowStr = formatDateForIcs(new Date());

  const title = `Sessão OHB #${appointment.sessaoNumero} - ${appointment.patientName}`;
  const description = [
    `Oxigenoterapia Hiperbárica - Sessão Nº ${appointment.sessaoNumero} (${appointment.pressaoATA} ATA)`,
    `Paciente: ${appointment.patientName}`,
    `Registro OHB: ${appointment.registroOHB}`,
    `Recomendações Obrigatórias:`,
    `- Comparecer com 15 minutos de antecedência`,
    `- Trajar roupa 100% algodão sem adereços sintéticos`,
    `- Proibido entrar com eletrônicos, baterias, isqueiros, metais e joias`,
    `- Fazer refeição leve prévia e verificar glicemia/pressão na chegada`,
    `Local: Unidade Pitombeiras, 175 - Jabaquara | Tel: (11) 5017-0698`,
  ].join('\\n');

  const location = 'Rua das Pitombeiras, 175, Jabaquara, São Paulo - SP, Brasil';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Clinica OHB Medicina Hiperbarica//BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:ohb-${appointment.id}-${Date.now()}@clinicaohb.com.br`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    // Alarme 2 horas antes
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete de Sessão de Oxigenoterapia Hiperbárica',
    'END:VALARM',
    // Alarme 24 horas antes
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Sessão de Oxigenoterapia Hiperbárica amanhã',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Sessao_OHB_${appointment.registroOHB}_${appointment.data}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(appointment: Appointment): string {
  const [year, month, day] = appointment.data.split('-').map(Number);
  const [hour, minute] = appointment.horario.split(':').map(Number);

  const startDate = new Date(year, month - 1, day, hour, minute);
  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);

  const formatGoogleDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
  const title = encodeURIComponent(`Sessão OHB #${appointment.sessaoNumero} - ${appointment.patientName}`);
  const details = encodeURIComponent(
    `Sessão de Oxigenoterapia Hiperbárica (${appointment.pressaoATA} ATA)\nRegistro OHB: ${appointment.registroOHB}\nLembrete de segurança: Vestir 100% algodão, retirar relógios/metais/eletrônicos.\nTel: (11) 5017-0698`
  );
  const location = encodeURIComponent('Rua das Pitombeiras, 175, Jabaquara, São Paulo - SP');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export function getWhatsAppReminderUrl(appointment: Appointment): string {
  const cleanPhone = (appointment.telefonePaciente || '').replace(/\D/g, '');
  const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  const message = [
    `Olá, *${appointment.patientName}*! 👋`,
    ``,
    `Confirmamos o agendamento da sua próxima sessão de *Oxigenoterapia Hiperbárica* na *Medicina Hiperbárica Zona Sul*:`,
    `🗓️ *Data:* ${appointment.data.split('-').reverse().join('/')} (${appointment.diaSemana})`,
    `⏰ *Horário:* ${appointment.horario}`,
    `📍 *Sessão Nº:* ${appointment.sessaoNumero} (${appointment.pressaoATA} ATA)`,
    ``,
    `*Orientações importantes para sua segurança:*`,
    `✔️ Trajar roupa 100% algodão fornecida ou limpa sem elásticos sintéticos.`,
    `✔️ Não entrar na câmara com celulares, relógios, isqueiros, moedas ou joias.`,
    `✔️ Alimente-se de forma leve antes da sessão.`,
    ``,
    `Ocorrendo qualquer anormalidade ou necessidade de reagendamento, entre em contato: (11) 5017-0698 / (11) 5012-1010.`,
  ].join('\n');

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}
