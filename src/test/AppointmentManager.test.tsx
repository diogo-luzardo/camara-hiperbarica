import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppointmentManager } from '../components/AppointmentManager';
import { Appointment, Patient } from '../types';

describe('AppointmentManager Component', () => {
  const mockPatients: Patient[] = [
    {
      id: 'pat-1',
      registroOHB: 'OHB-1082',
      registroHospitalar: 'RH-49201',
      unidade: 'Hospital São Luiz',
      nome: 'Sebastião Pereira dos Santos',
      convenio: 'Bradesco',
      plano: 'Top',
      matriculaConvenio: '123',
      validadeConvenio: '12/2027',
      dataNascimento: '1962-04-18',
      idade: 64,
      sexo: 'M',
      estadoCivil: 'Casado',
      rg: '14.892.301-X',
      cpf: '529.982.247-25',
      profissao: 'Aposentado',
      nomeMae: 'Francisca',
      cep: '04343-160',
      endereco: 'Rua das Pitombeiras',
      numero: '175',
      complemento: '',
      bairro: 'Jabaquara',
      municipio: 'São Paulo',
      uf: 'SP',
      telefonesFixos: '',
      celular: '(11) 98765-4321',
      email: '',
      procedencia: '',
      remocao: '',
      medicoIndicou: '',
      acompanhante: '',
      historiaClinica: '',
      exameFisicoResumido: '',
      localCurativos: '',
      avaliacaoDor: 0,
      grauEntendimento: '',
      tempoExistenciaPatologia: '',
      descricaoLesao: '',
      diagnostico: 'Pé Diabético',
      cid10: 'E11.5',
      numeroTratamentosPrevisto: 30,
      medicamentosEmUso: '',
      alergias: '',
      vicios: '',
      otoscopia: '',
      proteses: '',
      ventilacao: '',
      createdAt: '',
      updatedAt: '',
    },
  ];

  const mockAppointments: Appointment[] = [
    {
      id: 'app-1',
      patientId: 'pat-1',
      patientName: 'Sebastião Pereira dos Santos',
      registroOHB: 'OHB-1082',
      cpf: '529.982.247-25',
      data: '2026-09-30',
      horario: '08:30',
      diaSemana: 'Quarta-feira',
      sessaoNumero: 10,
      pressaoATA: 2.4,
      status: 'confirmado',
      observacoes: 'Verificar glicemia antes da sessão.',
      telefonePaciente: '(11) 98765-4321',
    },
  ];

  it('deve renderizar o cabeçalho e os agendamentos cadastrados', () => {
    render(
      <AppointmentManager
        appointments={mockAppointments}
        patients={mockPatients}
        onSaveAppointment={vi.fn()}
        onDeleteAppointment={vi.fn()}
        onSelectPatient={vi.fn()}
        onPrintAppointmentSheet={vi.fn()}
      />
    );

    expect(screen.getByText('Grade de Sessões & Alertas Automáticos')).toBeInTheDocument();
    expect(screen.getAllByText('Sebastião Pereira dos Santos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('OHB-1082').length).toBeGreaterThan(0);
  });

  it('deve alternar status do agendamento ao clicar no botão de status', () => {
    const onSaveMock = vi.fn();
    render(
      <AppointmentManager
        appointments={mockAppointments}
        patients={mockPatients}
        onSaveAppointment={onSaveMock}
        onDeleteAppointment={vi.fn()}
        onSelectPatient={vi.fn()}
        onPrintAppointmentSheet={vi.fn()}
      />
    );

    // Clica no botão de status (ex: Confirmado -> Realizado)
    const statusBtns = screen.getAllByText('Confirmado');
    fireEvent.click(statusBtns[0]);

    expect(onSaveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'app-1',
        status: 'realizado',
      })
    );
  });

  it('deve abrir modal de agendamento ao clicar em Novo Agendamento', () => {
    render(
      <AppointmentManager
        appointments={mockAppointments}
        patients={mockPatients}
        onSaveAppointment={vi.fn()}
        onDeleteAppointment={vi.fn()}
        onSelectPatient={vi.fn()}
        onPrintAppointmentSheet={vi.fn()}
      />
    );

    const newBtn = screen.getByRole('button', { name: /Novo Agendamento/i });
    fireEvent.click(newBtn);

    expect(screen.getByText('Novo Agendamento de Sessão')).toBeInTheDocument();
  });
});
