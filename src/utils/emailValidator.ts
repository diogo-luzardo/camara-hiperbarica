/**
 * Utilitário de validação e normalização de e-mails
 */

// Regex para validação de formato de e-mail RFC 5322 simplificado
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Remove espaços e converte para minúsculas
 */
export function cleanEmail(email?: string | null): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Valida se uma string é um endereço de e-mail sintaticamente válido.
 * 
 * Regras:
 * - Não pode conter espaços
 * - Deve conter parte local antes do '@' (máximo 64 caracteres)
 * - Deve conter domínio após o '@' com pelo menos um ponto
 * - O TLD (extensão do domínio) deve ter no mínimo 2 caracteres alfabéticos
 * - Não pode conter pontos consecutivos ('..')
 * - Tamanho total máximo de 254 caracteres
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email) return false;

  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;

  // Não permite espaços no meio
  if (/\s/.test(trimmed)) return false;

  // Não permite pontos duplos/consecutivos
  if (trimmed.includes('..')) return false;

  // Deve ter exatamente uma divisão básica de partes ou estrutura aceita
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) return false;
  if (localPart.length > 64) return false;

  // Domínio deve conter pelo menos um ponto e TLD com pelo menos 2 caracteres
  const domainSegments = domainPart.split('.');
  if (domainSegments.length < 2) return false;

  const tld = domainSegments[domainSegments.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;

  return EMAIL_REGEX.test(trimmed);
}
