import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { isValidCPF, formatCPF, cleanCPF } from '../utils/cpfValidator';
import { CoverageBadge, isParticular } from '../components/CoverageBadge';
import { searchAddressByStreet, fetchAddressByCep } from '../utils/cepService';

describe('CPF Validator (Modulo 11)', () => {
  it('deve validar CPFs matematicamente válidos', () => {
    // CPFs válidos conhecidos para teste de algoritmo
    expect(isValidCPF('52998224725')).toBe(true);
    expect(isValidCPF('529.982.247-25')).toBe(true);
    expect(isValidCPF('11144477735')).toBe(true);
  });

  it('deve rejeitar CPFs com dígitos repetidos inválidos', () => {
    expect(isValidCPF('000.000.000-00')).toBe(false);
    expect(isValidCPF('111.111.111-11')).toBe(false);
    expect(isValidCPF('222.222.222-22')).toBe(false);
    expect(isValidCPF('999.999.999-99')).toBe(false);
  });

  it('deve rejeitar CPFs com tamanho incorreto ou caracteres inválidos', () => {
    expect(isValidCPF('123.456.789')).toBe(false);
    expect(isValidCPF('')).toBe(false);
    expect(isValidCPF('abc')).toBe(false);
    expect(isValidCPF('1234567890123')).toBe(false);
  });

  it('deve formatar CPF corretamente com máscara', () => {
    expect(formatCPF('52998224725')).toBe('529.982.247-25');
    expect(formatCPF('529982')).toBe('529.982');
    expect(cleanCPF('529.982.247-25')).toBe('52998224725');
  });
});

describe('Modalidade Particular vs Convênio', () => {
  it('isParticular deve identificar corretamente se é particular ou convênio', () => {
    expect(isParticular(undefined)).toBe(true);
    expect(isParticular('')).toBe(true);
    expect(isParticular('Particular')).toBe(true);
    expect(isParticular('particular')).toBe(true);
    expect(isParticular('Privado')).toBe(true);

    expect(isParticular('Unimed')).toBe(false);
    expect(isParticular('Bradesco Saúde')).toBe(false);
    expect(isParticular('SulAmérica')).toBe(false);
    expect(isParticular('Amil Fácil')).toBe(false);
  });

  it('CoverageBadge deve renderizar badge de Particular com estilo âmbar', () => {
    const { container } = render(<CoverageBadge convenio="Particular" size="sm" />);
    expect(screen.getByText('Particular')).toBeDefined();
    expect(container.firstChild).toHaveClass('bg-amber-50');
  });

  it('CoverageBadge com modalidade particular deve sobrepor o convenio do paciente', () => {
    // Paciente tem Bradesco Saúde, mas esta sessão específica foi marcada como particular
    const { container } = render(
      <CoverageBadge convenio="Bradesco Saúde" modalidade="particular" size="sm" />
    );
    expect(screen.getByText('Particular')).toBeDefined();
    expect(screen.queryByText('Bradesco Saúde')).toBeNull();
    expect(container.firstChild).toHaveClass('bg-amber-50');
  });

  it('CoverageBadge com modalidade convenio deve exibir o convenio do paciente', () => {
    const { container } = render(
      <CoverageBadge convenio="Bradesco Saúde" modalidade="convenio" size="sm" />
    );
    expect(screen.getByText('Bradesco Saúde')).toBeDefined();
    expect(container.firstChild).toHaveClass('bg-blue-50');
  });
});

describe('Busca de Endereço por Nome de Rua (ViaCEP API)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve lançar erro se os parâmetros forem insuficientes', async () => {
    await expect(searchAddressByStreet('SP', 'São Paulo', 'ab')).rejects.toThrow(
      'O nome do logradouro/rua deve ter pelo menos 3 caracteres.'
    );
  });

  it('deve buscar e retornar lista de logradouros via API', async () => {
    const mockResults = [
      {
        cep: '04304-000',
        logradouro: 'Avenida Jabaquara',
        complemento: '',
        bairro: 'Mirandópolis',
        localidade: 'São Paulo',
        uf: 'SP',
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResults,
    } as Response);

    const results = await searchAddressByStreet('SP', 'São Paulo', 'Jabaquara');
    expect(results).toHaveLength(1);
    expect(results[0].cep).toBe('04304-000');
    expect(results[0].logradouro).toBe('Avenida Jabaquara');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/SP/S%C3%A3o%20Paulo/Jabaquara/json/',
      expect.objectContaining({ signal: expect.any(Object) })
    );
  });
});
