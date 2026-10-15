import { describe, it, expect } from 'vitest';
import { isValidEmail, cleanEmail } from '../utils/emailValidator';

describe('emailValidator', () => {
  describe('isValidEmail', () => {
    it('deve validar e-mails com formatos válidos comuns', () => {
      expect(isValidEmail('paciente@exemplo.com')).toBe(true);
      expect(isValidEmail('paciente.silva@exemplo.com.br')).toBe(true);
      expect(isValidEmail('doutor+ohb@clinica.med.br')).toBe(true);
      expect(isValidEmail('admin_123@hospital.org')).toBe(true);
      expect(isValidEmail('usuario-teste@sub.dominio.com.br')).toBe(true);
      expect(isValidEmail('contato@ohb.med.br')).toBe(true);
    });

    it('deve rejeitar e-mails sem @ ou sem domínio', () => {
      expect(isValidEmail('paciente')).toBe(false);
      expect(isValidEmail('paciente@')).toBe(false);
      expect(isValidEmail('@dominio.com')).toBe(false);
      expect(isValidEmail('paciente@com')).toBe(false); // sem TLD separado
    });

    it('deve rejeitar e-mails com espaços', () => {
      expect(isValidEmail('paciente @exemplo.com')).toBe(false);
      expect(isValidEmail('paciente@ exemplo.com')).toBe(false);
      expect(isValidEmail('paciente@exemplo .com')).toBe(false);
    });

    it('deve rejeitar e-mails com múltiplos @ ou pontos consecutivos', () => {
      expect(isValidEmail('paciente@@exemplo.com')).toBe(false);
      expect(isValidEmail('paciente@exemplo..com')).toBe(false);
      expect(isValidEmail('paciente..silva@exemplo.com')).toBe(false);
    });

    it('deve rejeitar valores nulos, vazios ou indefinidos', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });

    it('deve rejeitar e-mails com extensões de domínio (TLD) inválidas', () => {
      expect(isValidEmail('paciente@dominio.c')).toBe(false); // apenas 1 letra no TLD
      expect(isValidEmail('paciente@dominio.123')).toBe(false); // TLD numérico
    });
  });

  describe('cleanEmail', () => {
    it('deve aparar espaços e converter para minúsculas', () => {
      expect(cleanEmail('  Paciente@Exemplo.COM  ')).toBe('paciente@exemplo.com');
      expect(cleanEmail('ADMIN@OHB.MED.BR')).toBe('admin@ohb.med.br');
      expect(cleanEmail('')).toBe('');
      expect(cleanEmail(null)).toBe('');
      expect(cleanEmail(undefined)).toBe('');
    });
  });
});
