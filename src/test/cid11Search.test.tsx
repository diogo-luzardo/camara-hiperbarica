import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { searchLocalCids, COMMON_CID_OHB_EXTENDED } from '../data/cidDataset';
import { StorageService } from '../services/storage';
import { PatientFormModal } from '../components/PatientFormModal';

describe('Catálogo de CID-11 e Busca Integrada', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve buscar patologias locais por termo, código CID-11 e código CID-10', () => {
    // Busca por termo comum
    const diabeticos = searchLocalCids('diabetico');
    expect(diabeticos.length).toBeGreaterThan(0);
    expect(diabeticos.some((c) => c.codigoCid11 === '5A14')).toBe(true);
    expect(diabeticos.some((c) => c.codigoCid10 === 'E11.5')).toBe(true);

    // Busca por código CID-11 direto
    const porCid11 = searchLocalCids('FB84.1');
    expect(porCid11.length).toBeGreaterThan(0);
    expect(porCid11[0].nome).toContain('Osteomielite');

    // Busca por código CID-10 direto
    const porCid10 = searchLocalCids('M72.6');
    expect(porCid10.length).toBeGreaterThan(0);
    expect(porCid10[0].codigoCid11).toBe('1B74');
  });

  it('deve retornar lista completa de atalhos rápidos com CID-11 e CID-10 correspondentes', () => {
    expect(COMMON_CID_OHB_EXTENDED.length).toBeGreaterThanOrEqual(8);
    const peDiabetico = COMMON_CID_OHB_EXTENDED.find((item) => item.cid10 === 'E11.5');
    expect(peDiabetico).toBeDefined();
    expect(peDiabetico?.cid11).toBe('5A14');

    const fournier = COMMON_CID_OHB_EXTENDED.find((item) => item.cid10 === 'M72.6');
    expect(fournier).toBeDefined();
    expect(fournier?.cid11).toBe('1B74');
  });

  it('deve pesquisar via StorageService e realizar fallback se API offline', async () => {
    // Simula API offline (fetch falha)
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    const results = await StorageService.searchCids('osteomielite', 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nome.toLowerCase()).toContain('osteomielite');
  });

  it('deve permitir buscar e selecionar patologia no PatientFormModal preenchendo CID-11 e CID-10', async () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <PatientFormModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
        existingPatientsCount={10}
      />
    );

    // Navega para a aba OHB
    const ohbTabButton = screen.getByText(/4\. Protocolo OHB/i);
    fireEvent.click(ohbTabButton);

    // Localiza campo de busca de CID
    const searchInput = screen.getByPlaceholderText(/Digite patologia, sintoma ou código/i);
    expect(searchInput).toBeInTheDocument();

    // Digita busca por "Fournier"
    fireEvent.change(searchInput, { target: { value: 'Fournier' } });

    // Aguarda dropdown com sugestões
    await waitFor(() => {
      expect(screen.getByText(/Resultados Encontrados/i)).toBeInTheDocument();
    });

    // Clica no resultado encontrado
    const resultadoItem = await screen.findByText(/Gangrena de Fournier/i);
    fireEvent.mouseDown(resultadoItem);

    // Verifica se os campos foram preenchidos sincronizadamente
    const cid11Input = screen.getByPlaceholderText(/Ex: 5A14/i) as HTMLInputElement;
    const cid10Input = screen.getByPlaceholderText(/Ex: E11.5/i) as HTMLInputElement;

    expect(cid11Input.value).toBe('1B74');
    expect(cid10Input.value).toBe('M72.6');
  });

  it('deve permitir usar os botões de atalho rápido de OHB para preencher CID-11 e CID-10', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <PatientFormModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
        existingPatientsCount={10}
      />
    );

    // Navega para a aba OHB
    const ohbTabButton = screen.getByText(/4\. Protocolo OHB/i);
    fireEvent.click(ohbTabButton);

    // Encontra o atalho rápido para Sofrimento de Enxertos (NE81 / T86.8)
    const enxertosButton = screen.getByText(/Sofrimento de Enxertos e Retalhos/i);
    fireEvent.click(enxertosButton);

    const cid11Input = screen.getByPlaceholderText(/Ex: 5A14/i) as HTMLInputElement;
    const cid10Input = screen.getByPlaceholderText(/Ex: E11.5/i) as HTMLInputElement;

    expect(cid11Input.value).toBe('NE81');
    expect(cid10Input.value).toBe('T86.8');
  });
});
