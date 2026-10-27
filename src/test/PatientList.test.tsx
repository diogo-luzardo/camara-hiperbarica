import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientList } from '../components/PatientList';
import { Patient, HyperbaricSession, Appointment } from '../types';

describe('PatientList Component', () => {
  const mockPatients: Patient[] = [
    {
      id: 'pat-1',
      registroOHB: 'OHB-1082',
      registroHospitalar: 'RH-49201',
      unidade: 'Hospital São Luiz',
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
      profissao: 'Comerciante',
      nomeMae: 'Francisca Pereira',
      cep: '04343-160',
      endereco: 'Rua das Pitombeiras',
      numero: '175',
      complemento: '',
      bairro: 'Jabaquara',
      municipio: 'São Paulo',
      uf: 'SP',
      telefonesFixos: '(11) 5017-0698',
      celular: '(11) 98765-4321',
      email: 'sebastiao@email.com',
      procedencia: 'Ambulatório',
      remocao: 'Própria',
      medicoIndicou: 'Dr. Carlos Henrique',
      acompanhante: 'Esposa',
      historiaClinica: 'Pé diabético com osteomielite.',
      exameFisicoResumido: 'BEG',
      localCurativos: 'Ambulatório',
      avaliacaoDor: 5,
      grauEntendimento: 'Bom',
      tempoExistenciaPatologia: '4 meses',
      descricaoLesao: 'Úlcera plantar 4.5x3.0 cm',
      diagnostico: 'Pé Diabético Complicado com Úlcera',
      cid10: 'E11.5',
      numeroTratamentosPrevisto: 30,
      medicamentosEmUso: 'Metformina, Losartana',
      alergias: 'Penicilinas',
      vicios: 'Ex-tabagista',
      otoscopia: 'Íntegra',
      proteses: 'Dentária móvel',
      ventilacao: 'Espontânea',
      createdAt: '2026-08-15T09:00:00Z',
      updatedAt: '2026-09-02T14:30:00Z',
    },
    {
      id: 'pat-2',
      registroOHB: 'OHB-1095',
      registroHospitalar: 'RH-53102',
      unidade: 'Hospital São Luiz',
      nome: 'Helena Ribeiro de Castro',
      convenio: 'SulAmérica',
      plano: 'Especial 100',
      matriculaConvenio: '90184729012',
      validadeConvenio: '08/2028',
      dataNascimento: '1974-11-23',
      idade: 51,
      sexo: 'F',
      estadoCivil: 'Divorciada',
      rg: '21.094.882-1',
      cpf: '153.500.857-56',
      profissao: 'Arquiteta',
      nomeMae: 'Lúcia Ribeiro',
      cep: '04343-160',
      endereco: 'Rua das Pitombeiras',
      numero: '200',
      complemento: '',
      bairro: 'Jabaquara',
      municipio: 'São Paulo',
      uf: 'SP',
      telefonesFixos: '',
      celular: '(11) 97123-4567',
      email: 'helena@email.com',
      procedencia: 'Cirurgia Plástica',
      remocao: 'Própria',
      medicoIndicou: 'Dra. Vanessa',
      acompanhante: 'Filha',
      historiaClinica: 'Fascite necrotizante.',
      exameFisicoResumido: 'BEG',
      localCurativos: 'Ambulatorial',
      avaliacaoDor: 3,
      grauEntendimento: 'Excelente',
      tempoExistenciaPatologia: '1 mês',
      descricaoLesao: 'Área cruenta em cicatrização',
      diagnostico: 'Fascite Necrotizante Pós-Debridamento',
      cid10: 'M72.6',
      numeroTratamentosPrevisto: 20,
      medicamentosEmUso: 'Analgésicos',
      alergias: 'Nega',
      vicios: 'Nega',
      otoscopia: 'Íntegra bilateral',
      proteses: 'Nenhuma',
      ventilacao: 'Espontânea',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-05T16:00:00Z',
    },
  ];

  const mockSessions: HyperbaricSession[] = [];
  const mockAppointments: Appointment[] = [];

  it('deve renderizar os indicadores principais e a lista de pacientes', () => {
    render(
      <PatientList
        patients={mockPatients}
        sessions={mockSessions}
        appointments={mockAppointments}
        onSelectPatient={vi.fn()}
        onNewPatient={vi.fn()}
        onNewSession={vi.fn()}
      />
    );

    // Métricas principais
    expect(screen.getByText('Pacientes Ativos')).toBeInTheDocument();
    expect(screen.getByText('Segurança da Câmara')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Pacientes renderizados
    expect(screen.getByText('Sebastião Pereira dos Santos')).toBeInTheDocument();
    expect(screen.getByText('OHB-1082')).toBeInTheDocument();
    expect(screen.getByText('Helena Ribeiro de Castro')).toBeInTheDocument();
    expect(screen.getByText('OHB-1095')).toBeInTheDocument();
  });

  it('deve filtrar pacientes ao digitar termo de busca por nome, CPF ou Registro OHB', () => {
    render(
      <PatientList
        patients={mockPatients}
        sessions={mockSessions}
        appointments={mockAppointments}
        onSelectPatient={vi.fn()}
        onNewPatient={vi.fn()}
        onNewSession={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Pesquisar por Registro OHB/i);

    // Busca por Registro OHB
    fireEvent.change(searchInput, { target: { value: 'OHB-1082' } });
    expect(screen.getByText('Sebastião Pereira dos Santos')).toBeInTheDocument();
    expect(screen.queryByText('Helena Ribeiro de Castro')).not.toBeInTheDocument();

    // Busca por CID-10
    fireEvent.change(searchInput, { target: { value: 'M72.6' } });
    expect(screen.getByText('Helena Ribeiro de Castro')).toBeInTheDocument();
    expect(screen.queryByText('Sebastião Pereira dos Santos')).not.toBeInTheDocument();
  });

  it('deve chamar onSelectPatient ao clicar no card ou botão Prontuário', () => {
    const onSelectMock = vi.fn();
    render(
      <PatientList
        patients={mockPatients}
        sessions={mockSessions}
        appointments={mockAppointments}
        onSelectPatient={onSelectMock}
        onNewPatient={vi.fn()}
        onNewSession={vi.fn()}
      />
    );

    const prontuarioButtons = screen.getAllByText('Prontuário');
    fireEvent.click(prontuarioButtons[0]);
    expect(onSelectMock).toHaveBeenCalledWith('pat-1');
  });

  it('deve disparar onNewPatient ao clicar em Cadastrar Paciente no estado vazio', () => {
    const onNewPatientMock = vi.fn();
    render(
      <PatientList
        patients={[]}
        sessions={[]}
        appointments={[]}
        onSelectPatient={vi.fn()}
        onNewPatient={onNewPatientMock}
        onNewSession={vi.fn()}
      />
    );

    const btn = screen.getByRole('button', { name: /Cadastrar Paciente/i });
    fireEvent.click(btn);
    expect(onNewPatientMock).toHaveBeenCalled();
  });
});
