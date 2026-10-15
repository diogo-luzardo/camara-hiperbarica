import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanCEP, formatCEP, fetchAddressByCep, fetchCepsByAddress } from '../utils/cepService';

describe('cepService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('deve limpar caracteres não numéricos do CEP', () => {
    expect(cleanCEP('04.343-160')).toBe('04343160');
    expect(cleanCEP('04343160')).toBe('04343160');
    expect(cleanCEP('abc123xyz')).toBe('123');
  });

  it('deve formatar o CEP com traço', () => {
    expect(formatCEP('04343160')).toBe('04343-160');
    expect(formatCEP('04343')).toBe('04343');
  });

  it('deve buscar CEP válido por número via ViaCEP API', async () => {
    const mockResponse = {
      cep: '04343-160',
      logradouro: 'Rua das Pitombeiras',
      bairro: 'Jabaquara',
      localidade: 'São Paulo',
      uf: 'SP',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as unknown as Response);

    const result = await fetchAddressByCep('04343160');
    expect(result).toEqual(mockResponse);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/04343160/json/',
      expect.any(Object)
    );
  });

  it('deve lançar erro para CEP com dígitos insuficientes', async () => {
    await expect(fetchAddressByCep('1234')).rejects.toThrow(
      'CEP deve conter exatamente 8 dígitos numéricos.'
    );
  });

  it('deve buscar CEPs pelo nome da rua/logradouro via ViaCEP API', async () => {
    const mockList = [
      {
        cep: '04343-160',
        logradouro: 'Rua das Pitombeiras',
        bairro: 'Jabaquara',
        localidade: 'São Paulo',
        uf: 'SP',
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockList,
    } as unknown as Response);

    const results = await fetchCepsByAddress('SP', 'São Paulo', 'Pitombeiras');
    expect(results).toHaveLength(1);
    expect(results[0].logradouro).toBe('Rua das Pitombeiras');
    expect(results[0].cep).toBe('04343-160');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/SP/S%C3%A3o%20Paulo/Pitombeiras/json/',
      expect.any(Object)
    );
  });

  it('deve validar parâmetros na busca de CEP por nome da rua', async () => {
    await expect(fetchCepsByAddress('S', 'São Paulo', 'Pitombeiras')).rejects.toThrow(
      'UF deve conter exatamente 2 letras (ex: SP, RJ).'
    );
    await expect(fetchCepsByAddress('SP', 'SP', 'Pitombeiras')).rejects.toThrow(
      'O nome da cidade/município deve ter no mínimo 3 caracteres.'
    );
    await expect(fetchCepsByAddress('SP', 'São Paulo', 'R')).rejects.toThrow(
      'O nome do logradouro/rua deve ter pelo menos 3 caracteres.'
    );
  });
});
