import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CidLookupModal } from '../components/CidLookupModal';
import { CID_CATALOG_DATA, TOTAL_WHO_DISEASES_COUNT } from '../data/cidDataset';

describe('CidLookupModal Component', () => {
  it('não deve renderizar nada se isOpen for falso', () => {
    const { container } = render(
      <CidLookupModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar a consulta de CID-11 e CID-10 com título, barra de busca e 14.248 doenças da OMS', () => {
    render(<CidLookupModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Consulta de Códigos CID-11 & CID-10')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Pesquise por qualquer doença ou código/i)).toBeInTheDocument();
    expect(screen.getByText(/Catálogo Oficial OMS 2026/i)).toBeInTheDocument();
  });

  it('deve exibir o catálogo abrangente cobrindo os 24 capítulos OMS e paginação padrão de 5 itens', () => {
    render(<CidLookupModal isOpen={true} onClose={vi.fn()} />);

    // Verifica que o catálogo é amplo
    expect(CID_CATALOG_DATA.length).toBeGreaterThan(50);
    expect(TOTAL_WHO_DISEASES_COUNT).toBe(14248);

    // Seletor de capítulos
    expect(screen.getByText(/Todos os 24 Capítulos da OMS/i)).toBeInTheDocument();

    // Paginação com 5 itens por página por padrão
    expect(screen.getByText(/Por página:/i)).toBeInTheDocument();
    expect(screen.getByText(/Exibindo patologias/i)).toBeInTheDocument();
  });

  it('deve filtrar patologias ao digitar o código CID-11 ou CID-10', () => {
    render(<CidLookupModal isOpen={true} onClose={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/Pesquise por qualquer doença ou código/i);
    fireEvent.change(searchInput, { target: { value: '5A14' } });

    expect(screen.getByText(/Diabetes mellitus tipo 2 com complicações circulatórias periféricas/i)).toBeInTheDocument();
    expect(screen.getByText('E11.5')).toBeInTheDocument();
  });

  it('deve filtrar por categorias rápidas como Indicações Rol ANS (OHB)', () => {
    render(<CidLookupModal isOpen={true} onClose={vi.fn()} />);

    const ohbBtn = screen.getByText('Indicações Rol ANS (OHB)');
    fireEvent.click(ohbBtn);

    // Deve conter Pé Diabético ou Fascite Necrotizante
    expect(screen.getByText(/Fascite necrotizante/i)).toBeInTheDocument();
  });

  it('deve resolver dinamicamente qualquer código CID-10 médico válido (ex: I10 ou J45)', () => {
    render(<CidLookupModal isOpen={true} onClose={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/Pesquise por qualquer doença ou código/i);
    fireEvent.change(searchInput, { target: { value: 'I10' } });

    // Hipertensão essencial I10 -> BA00
    expect(screen.getByText('BA00')).toBeInTheDocument();
    expect(screen.getByText('I10')).toBeInTheDocument();
  });

  it('deve permitir fechar a modal ao clicar no botão fechar', () => {
    const onClose = vi.fn();
    render(<CidLookupModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByText('Fechar Consulta');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
