import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PatientFormModal } from '../components/PatientFormModal';
import { AuthProvider } from '../contexts/AuthContext';
import { LoginPage } from '../components/LoginPage';

describe('Validação de E-mail nos Cadastros', () => {
  it('deve bloquear submissão no formulário de paciente se o e-mail for inválido', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <PatientFormModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        existingPatientsCount={5}
      />
    );

    // Preenche Nome (obrigatório)
    const nomeInput = screen.getByPlaceholderText(/Nome do paciente/i);
    fireEvent.change(nomeInput, { target: { value: 'Paciente Teste Validação' } });

    // Alterna para a aba 2 (Endereço e Contatos)
    const tabEndereco = screen.getByRole('button', { name: /Endereço Completo/i });
    fireEvent.click(tabEndereco);

    // Preenche um e-mail com formato inválido
    const emailInput = screen.getByPlaceholderText(/paciente@exemplo\.com\.br/i);
    fireEvent.change(emailInput, { target: { value: 'email_invalido_sem_arroba' } });

    // Verifica que o badge de "E-mail Inválido" apareceu
    expect(screen.getByText(/^E-mail Inválido$/i)).toBeInTheDocument();

    // Tenta submeter o formulário
    const form = screen.getByRole('button', { name: /Salvar Cadastro Clínico/i }).closest('form')!;
    fireEvent.submit(form);

    // Verifica que o erro foi exibido e onSave NÃO foi chamado
    expect(screen.getByText(/O e-mail informado é inválido/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('deve permitir salvar paciente com e-mail válido e normalizado para minúsculas', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <PatientFormModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        existingPatientsCount={5}
      />
    );

    const nomeInput = screen.getByPlaceholderText(/Nome do paciente/i);
    fireEvent.change(nomeInput, { target: { value: 'Carlos Drummond de Andrade' } });

    // Alterna para aba 2
    const tabEndereco = screen.getByRole('button', { name: /Endereço Completo/i });
    fireEvent.click(tabEndereco);

    const emailInput = screen.getByPlaceholderText(/paciente@exemplo\.com\.br/i);
    fireEvent.change(emailInput, { target: { value: 'Carlos.Drummond@Poesia.COM.BR' } });

    // Verifica badge de E-mail Válido
    expect(screen.getByText(/E-mail Válido/i)).toBeInTheDocument();

    const form = screen.getByRole('button', { name: /Salvar Cadastro Clínico/i }).closest('form')!;
    fireEvent.submit(form);

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedData = onSave.mock.calls[0][0];
    expect(savedData.email).toBe('carlos.drummond@poesia.com.br');
  });

  it('deve permitir salvar paciente sem e-mail (campo opcional)', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <PatientFormModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        existingPatientsCount={5}
      />
    );

    const nomeInput = screen.getByPlaceholderText(/Nome do paciente/i);
    fireEvent.change(nomeInput, { target: { value: 'Paciente Sem Email' } });

    const form = screen.getByRole('button', { name: /Salvar Cadastro Clínico/i }).closest('form')!;
    fireEvent.submit(form);

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedData = onSave.mock.calls[0][0];
    expect(savedData.email).toBe('');
  });

  it('deve permitir login com nome de usuário ou admin sem exigir formato de e-mail', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const userInput = screen.getByPlaceholderText('usuario@ohb.med.br');
    fireEvent.change(userInput, { target: { value: 'admin' } });

    // Não deve exibir erro ou badge de formato inválido
    expect(screen.queryByText(/Formato inválido/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/E-mail Inválido/i)).not.toBeInTheDocument();

    const form = screen.getByRole('button', { name: /Entrar no Sistema/i }).closest('form')!;
    fireEvent.submit(form);

    // Não deve bloquear com mensagem de validação de formato de e-mail
    expect(
      screen.queryByText(/Por favor, informe um endereço de e-mail válido/i)
    ).not.toBeInTheDocument();
  });
});
