import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { MOCK_USERS, ROLE_CONFIGS } from '../utils/rbac';
import {
  Activity,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  Crown,
  FileText,
  DollarSign,
  Sparkles,
  User,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState('admin@ohb.med.br');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu usuário ou e-mail de acesso.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Falha no login. Verifique suas credenciais.');
      }
    } catch {
      setErrorMessage('Ocorreu um erro no servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuickProfile = (role: UserRole) => {
    const user = MOCK_USERS.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword('demo123');
      setErrorMessage(null);
      // Login imediato para agilidade de demonstração
      quickLogin(role);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col justify-between text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/3"></div>

      {/* Top Header Institutional Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-300">Centro Europa de Feridas Refratárias</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline">Medicina Hiperbárica Zona Sul</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:inline">Dr. Carlos Henrique Esteves (CRM 62.139)</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[11px] font-medium hidden xs:inline">Ambiente Seguro LGPD</span>
        </div>
      </header>

      {/* Main Content Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 my-4 sm:my-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Clinic Presentation & Quick Role Selection */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-800/80 text-cyan-300 text-xs font-semibold shadow-inner">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Oxigenoterapia Hiperbárica • Plataforma Clínica Unificada</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-['Outfit'] text-white">
                Sistema Integrado de <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  Medicina Hiperbárica
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Prontuário eletrônico completo, segurança em oxigenoterapia hiperbárica (SAE),
                agendamentos com sincronização no celular e gestão financeira de convênios.
              </p>
            </div>

            {/* Quick Profiles Switcher Card (Ambiente de Demonstração) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Acesso Rápido por Perfil (1 Clique)
                  </span>
                </div>
                <span className="text-[11px] text-cyan-400/90 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-medium">
                  Modo Demonstração
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Selecione qualquer perfil abaixo para entrar imediatamente e testar a visão de cada equipe:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* 1. Administrador */}
                <button
                  type="button"
                  onClick={() => handleSelectQuickProfile('administrador')}
                  className="flex items-start gap-3 p-3 rounded-xl border border-purple-800/60 bg-purple-950/30 hover:bg-purple-950/60 hover:border-purple-600 transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-900/80 border border-purple-700/80 flex items-center justify-center text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Crown className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-purple-200">Administrador</span>
                      <span className="text-[9px] bg-purple-900/90 text-purple-300 px-1.5 py-0.2 rounded font-mono">Full</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">Dr. Carlos Henrique</p>
                    <p className="text-[10px] text-purple-300/80">Diretoria & Auditoria Geral</p>
                  </div>
                </button>

                {/* 2. Operacional */}
                <button
                  type="button"
                  onClick={() => handleSelectQuickProfile('operacional')}
                  className="flex items-start gap-3 p-3 rounded-xl border border-cyan-800/60 bg-cyan-950/30 hover:bg-cyan-950/60 hover:border-cyan-600 transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-cyan-900/80 border border-cyan-700/80 flex items-center justify-center text-cyan-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-cyan-200">Operacional</span>
                      <span className="text-[9px] bg-cyan-900/90 text-cyan-300 px-1.5 py-0.2 rounded font-mono">Câmara</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">Enfª. Juliana Ramos</p>
                    <p className="text-[10px] text-cyan-300/80">Enfermagem & Câmara OHB</p>
                  </div>
                </button>

                {/* 3. Administrativo */}
                <button
                  type="button"
                  onClick={() => handleSelectQuickProfile('administrativo')}
                  className="flex items-start gap-3 p-3 rounded-xl border border-amber-800/60 bg-amber-950/30 hover:bg-amber-950/60 hover:border-amber-600 transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-900/80 border border-amber-700/80 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-200">Administrativo</span>
                      <span className="text-[9px] bg-amber-900/90 text-amber-300 px-1.5 py-0.2 rounded font-mono">Recepção</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">Roberto Mendes</p>
                    <p className="text-[10px] text-amber-300/80">Recepção, Triagem & Agenda</p>
                  </div>
                </button>

                {/* 4. Financeiro */}
                <button
                  type="button"
                  onClick={() => handleSelectQuickProfile('financeiro')}
                  className="flex items-start gap-3 p-3 rounded-xl border border-emerald-800/60 bg-emerald-950/30 hover:bg-emerald-950/60 hover:border-emerald-600 transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-900/80 border border-emerald-700/80 flex items-center justify-center text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
                    <DollarSign className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-200">Financeiro</span>
                      <span className="text-[9px] bg-emerald-900/90 text-emerald-300 px-1.5 py-0.2 rounded font-mono">TISS</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">Marina Albuquerque</p>
                    <p className="text-[10px] text-emerald-300/80">Convênios & Guias TUSS</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Medical Pillars Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Protocolos CFM 1.457/95</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Cofre Digital & S3</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Separação RBAC</span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Login Form */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              {/* Form Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl tracking-tight text-white font-['Outfit']">
                      CLÍNICA <span className="text-cyan-400">OHB</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Acesso Seguro à Plataforma</p>
                </div>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username or Email Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Usuário ou E-mail
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="usuario@ohb.med.br"
                      required
                      className="w-full bg-slate-950/90 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Senha de Acesso
                    </label>
                    <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer">
                      Esqueceu a senha?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-950/90 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                      title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <span className="text-xs text-slate-300">Lembrar neste navegador</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Validando credenciais...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar no Sistema</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Badge in Card */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sessão Criptografada SSL</span>
                </span>
                <span>v2.4.0 (2026)</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Institutional Info */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3 text-center text-xs text-slate-500 relative z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>Unidade: Hospital São Luiz Jabaquara • Rua das Pitombeiras, 175 - São Paulo/SP</span>
        </div>
        <div className="mx-auto sm:mx-0 text-[11px]">
          Central Telefônica: (11) 5017-0698 • Resp. Técnico: Dr. Carlos H. Esteves
        </div>
      </footer>
    </div>
  );
};
