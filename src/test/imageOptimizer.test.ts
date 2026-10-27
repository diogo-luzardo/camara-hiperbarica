import { describe, it, expect } from 'vitest';
import { optimizeImageFile, isPdfDataUrl, isPdfFile } from '../utils/imageOptimizer';

describe('imageOptimizer - PDF & Validações de Importação', () => {
  it('deve identificar arquivos e DataURLs PDF corretamente', () => {
    const pdfFile = new File(['%PDF-1.4 dummy'], 'laudo.pdf', { type: 'application/pdf' });
    const pdfFileNoMime = new File(['%PDF-1.4 dummy'], 'exame.PDF', { type: '' });
    const imgFile = new File(['dummy'], 'foto.jpg', { type: 'image/jpeg' });

    expect(isPdfFile(pdfFile)).toBe(true);
    expect(isPdfFile(pdfFileNoMime)).toBe(true);
    expect(isPdfFile(imgFile)).toBe(false);

    expect(isPdfDataUrl('data:application/pdf;base64,JVBERi0xLjQ=')).toBe(true);
    expect(isPdfDataUrl('data:image/jpeg;base64,/9j/4AAQ')).toBe(false);
  });

  it('deve permitir importar um arquivo PDF válido convertendo para DataURL application/pdf', async () => {
    const pdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n';
    const pdfFile = new File([pdfContent], 'prontuario-antigo.pdf', { type: 'application/pdf' });

    const result = await optimizeImageFile(pdfFile);
    expect(result.dataUrl.startsWith('data:application/pdf;base64,')).toBe(true);
    expect(result.sizeKb).toBeGreaterThanOrEqual(1);
    expect(isPdfDataUrl(result.dataUrl)).toBe(true);
  });

  it('deve retornar mensagem de erro clara quando o arquivo estiver vazio', async () => {
    const emptyFile = new File([], 'vazio.pdf', { type: 'application/pdf' });
    await expect(optimizeImageFile(emptyFile)).rejects.toThrow(/está vazio/i);
  });

  it('deve retornar mensagem de erro clara quando o formato não for suportado', async () => {
    const invalidFile = new File(['conteudo texto'], 'planilha.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    await expect(optimizeImageFile(invalidFile)).rejects.toThrow(/Formato não suportado/i);
  });
});

