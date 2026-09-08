/**
 * Integração com API ViaCEP para consulta e preenchimento automático de endereço
 */

export interface ViaCepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  erro?: boolean;
}

export function cleanCEP(cep: string): string {
  return cep.replace(/\D/g, '');
}

export function formatCEP(cep: string): string {
  const digits = cleanCEP(cep).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResult | null> {
  const digits = cleanCEP(cep);
  if (digits.length !== 8) {
    throw new Error('CEP deve conter exatamente 8 dígitos numéricos.');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Falha ao consultar CEP (HTTP ${response.status})`);
    }

    const data: ViaCepResult = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado na base dos Correios.');
    }

    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Tempo limite esgotado ao consultar CEP.');
      }
      throw err;
    }
    throw new Error('Erro inesperado ao consultar CEP.');
  }
}
