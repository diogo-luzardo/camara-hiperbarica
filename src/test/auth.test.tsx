import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoginPage } from '../components/LoginPage';
import { FinancialDashboard } from '../components/FinancialDashboard';
import { PermissionsModal } from '../components/PermissionsModal';
import { checkPermission, ROLE_CONFIGS } from '../utils/rbac';
import { Patient, HyperbaricSession } from '../types';

describe('RBAC & Auth Utilities', () => {
  it('deve liberar todas as permissões quando o modo estrito estiver desativado (modo permissivo)', () => {
    // Modo permissivo (padrão solicitado)
    expect(checkPermission('financeiro', 'sessions:delete', false)).toBe(true);
    expect(checkPermission('operacional', 'finance:export', false)).toBe(true);
    expect(checkPermission('administrativo', 'system:architecture', false)).toBe(true);
  });

  it('deve restringir permissões corretamente quando o modo estrito estiver ativado', () => {
    // Administrador: acesso total
    expect(checkPermission('administrador', 'system:architecture', true)).toBe(true);
    expect(checkPermission('administrador', 'finance:view', true)).toBe(true);

    // Financeiro: tem acesso ao financeiro, mas não a deletar sessões
    expect(checkPermission('financeiro', 'finance:view', true)).toBe(true);
    expect(checkPermission('financeiro', 'sessions:delete', true)).toBe(false);
    expect(checkPermission('financeiro', 'system:architecture', true)).toBe(false);

    // Operacional: tem acesso a sessões, mas não ao financeiro restrito
    expect(checkPermission('operacional', 'sessions:view', true)).toBe(true);
    expect(checkPermission('operacional', 'sessions:create', true)).toBe(true);
    expect(checkPermission('operacional', 'finance:export', true)).toBe(false);

    // Administrativo: tem acesso a pacientes e agendamentos, mas não a sessões clínicas
    expect(checkPermission('administrativo', 'patients:create', true)).toBe(true);
    expect(checkPermission('administrativo', 'appointments:create', true)).toBe(true);
    expect(checkPermission('administrativo', 'sessions:delete', true)).toBe(false);
  });

  it('deve conter as 4 roles solicitadas configuradas corretamente', () => {
    expect(ROLE_CONFIGS.administrador).toBeDefined();
    expect(ROLE_CONFIGS.operacional).toBeDefined();
    expect(ROLE_CONFIGS.administrativo).toBeDefined();
    expect(ROLE_CONFIGS.financeiro).toBeDefined();
  });
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('deve renderizar a tela de login com os 4 perfis de acesso rápido para testes', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByText('Sistema Integrado de')).toBeInTheDocument();
    expect(screen.getByText('Medicina Hiperbárica')).toBeInTheDocument();
    expect(screen.getByText('Acesso Rápido por Perfil (1 Clique)')).toBeInTheDocument();

    // Os 4 perfis solicitados
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Operacional')).toBeInTheDocument();
    expect(screen.getByText('Administrativo')).toBeInTheDocument();
    expect(screen.getByText('Financeiro')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('usuario@ohb.med.br')).toBeInTheDocument();
    expect(screen.getByText('Entrar no Sistema')).toBeInTheDocument();
  });

  it('deve realizar login rápido ao clicar no botão do perfil Operacional', async () => {
    const TestConsumer = () => {
      const { user, isAuthenticated } = useAuth();
      return (
        <div>
          <LoginPage />
          {isAuthenticated && <div data-testid="user-role">{user?.role}</div>}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Clica no card de acesso rápido Operacional
    const opButton = screen.getByText('Enfª. Juliana Ramos');
    fireEvent.click(opButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-role')).toHaveTextContent('operacional');
    });
  });
});

describe('FinancialDashboard Component', () => {
  const mockPatients: Patient[] = [
    {
      id: 'pat-1',
      registroOHB: 'OHB-1082',
      registroHospitalar: 'RH-49201',
      unidade: 'Hospital São Luiz',
      nome: 'Sebastião Pereira dos Santos',
      convenio: 'Bradesco Saúde',
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
      createdAt: '2026-10-14T10:00:00Z',
      updatedAt: '',
    },
  ];

  const mockSessions: HyperbaricSession[] = [
    {
      id: 'ses-1',
      patientId: 'pat-1',
      registroOHB: 'OHB-1082',
      sessionNumber: 1,
      data: '2026-10-14',
      hora: '08:30',
      ata: 2.4,
      pa: '120/80',
      glicemia: '110',
      temperatura: '36.5',
      duracaoMinutos: 90,
      tratamentoMedicacao: 'Oxigênio 100%',
      intercorrencias: 'Sem intercorrências.',
      medicoResponsavel: 'Dr. Carlos Henrique',
      enfermeiroResponsavel: 'Enf. Juliana Ramos',
      tecnicoResponsavel: 'Fabio Santos',
      conferenciaNome: true,
      roupaAlgodao: true,
      pulseiraEstatica: true,
      removerMetaisEletronicos: true,
      retirarProteses: true,
      sondaVesicalAberta: false,
      avpAvcPicc: false,
      velocidadeCompressao: '0.2 ATA/min',
      velocidadeDescompressao: '0.2 ATA/min',
      covidFebreTosse: false,
      diagDor: 'ME',
      diagQueda: 'A',
      diagDeambulacao: 'ME',
      diagGlicemia: 'A',
      diagPele: 'PR',
      diagContaminacao: 'A',
      diagAnsiedade: 'A',
      evolucaoEnfermagem: 'Paciente tolerou bem a descompressão.',
      status: 'concluida',
    },
  ];

  it('deve renderizar o painel financeiro com dados de faturamento e código TUSS', () => {
    render(
      <FinancialDashboard
        patients={mockPatients}
        sessions={mockSessions}
        onSelectPatient={vi.fn()}
      />
    );

    expect(screen.getByText('Faturamento de Sessões & Guias TISS / TUSS')).toBeInTheDocument();
    expect(screen.getByText('Sebastião Pereira dos Santos')).toBeInTheDocument();
    expect(screen.getByText('TUSS 20101202')).toBeInTheDocument();
    expect(screen.getAllByText('Bradesco Saúde').length).toBeGreaterThan(0);
  });
});

describe('PermissionsModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve renderizar a matriz de governança RBAC e permitir alternar modo estrito', () => {
    render(
      <AuthProvider>
        <PermissionsModal isOpen={true} onClose={vi.fn()} />
      </AuthProvider>
    );

    expect(screen.getByText('Matriz de Acessos & Separação por Perfil (RBAC)')).toBeInTheDocument();
    expect(screen.getByText(/Status da Política de Acesso/)).toBeInTheDocument();
    expect(screen.getByText('Capacidade / Ação Clínica & Administrativa')).toBeInTheDocument();
    expect(screen.getByText('Totalmente Editável')).toBeInTheDocument();
  });

  it('deve permitir editar permissão de Cadastrar Paciente para o Operacional ao clicar na célula', async () => {
    const TestMatrixConsumer = () => {
      const { user, hasPermission, setStrictMode, isStrictMode } = useAuth();
      return (
        <div>
          <PermissionsModal isOpen={true} onClose={vi.fn()} />
          <div data-testid="strict-mode">{String(isStrictMode)}</div>
          <div data-testid="can-create-patient">{String(hasPermission('patients:create'))}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestMatrixConsumer />
      </AuthProvider>
    );

    // 1. Simular troca para perfil Operacional
    const opButton = screen.getByText('Enfª.');
    fireEvent.click(opButton);

    // 2. Ativar modo estrito
    const strictToggle = screen.getByText(/Modo Permissivo: Liberado/i);
    fireEvent.click(strictToggle);

    // No padrão inicial do modo estrito, operacional não tem permissão para cadastrar paciente
    expect(screen.getByTestId('can-create-patient')).toHaveTextContent('false');

    // 3. Clicar no botão da célula "Cadastrar Paciente" para Operacional
    const cellBtn = screen.getByTitle(/Liberar "Cadastrar Paciente" para Operacional & Enfermagem/i);
    expect(cellBtn).toBeInTheDocument();
    fireEvent.click(cellBtn);

    // 4. Agora o operacional deve ter permissão concedida em tempo real
    await waitFor(() => {
      expect(screen.getByTestId('can-create-patient')).toHaveTextContent('true');
    });

    // 5. Clicar em Restaurar Padrões restaura a configuração inicial
    const resetBtn = screen.getByText('Restaurar Padrões');
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByTestId('can-create-patient')).toHaveTextContent('false');
    });
  });
});

