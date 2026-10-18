import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_CONFIGS, PERMISSION_CATEGORIES, MOCK_USERS } from '../utils/rbac';
import { UserRole } from '../types/auth';
import {
  X,
  ShieldCheck,
  Check,
  Ban,
  Crown,
  Stethoscope,
  FileText,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Info,
  Sparkles,
  RotateCcw,
  MousePointerClick,
} from 'lucide-react';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose }) => {
  const {
    role: currentRole,
    switchRole,
    isStrictMode,
    setStrictMode,
    rolePermissions,
    toggleRolePermission,
    resetRolePermissions,
  } = useAuth();

  if (!isOpen) return null;

  const rolesList: UserRole[] = ['administrador', 'operacional', 'administrativo', 'financeiro'];

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'administrador':
        return Crown;
      case 'operacional':
        return Stethoscope;
      case 'administrativo':
        return FileText;
      case 'financeiro':
        return DollarSign;
    }
  };

  // Contagem de modificações em relação às permissões padrão
  const customCount = rolesList.reduce((acc, r) => {
    const cfg = ROLE_CONFIGS[r];
    const current = rolePermissions[r] || cfg.defaultPermissions;
    const added = current.filter((p) => !cfg.defaultPermissions.includes(p)).length;
    const removed = cfg.defaultPermissions.filter((p) => !current.includes(p)).length;
    return acc + added + removed;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-xl font-bold font-['Outfit'] text-white truncate">
                  Matriz de Acessos & Separação por Perfil (RBAC)
                </h2>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Totalmente Editável
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                Clique diretamente em qualquer célula para conceder ou revogar liberações específicas por perfil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header banner: Strict vs Permissive mode toggle */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 max-w-2xl">
            <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700">
              <p className="font-bold text-slate-900">
                Status da Política de Acesso: {isStrictMode ? 'Modo Rigoroso (Produção)' : 'Modo Aberto (Permissivo)'}
              </p>
              <p className="text-slate-600">
                {isStrictMode
                  ? 'Cada perfil obedece rigorosamente às permissões marcadas na matriz abaixo.'
                  : 'Acesso liberado a todas as abas durante o período de avaliação, mantendo as responsabilidades auditadas.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setStrictMode(!isStrictMode)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isStrictMode
                  ? 'bg-purple-900 text-white border-purple-700 shadow-xs'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
              }`}
            >
              {isStrictMode ? (
                <>
                  <ToggleRight className="w-4 h-4 text-purple-300" />
                  <span>Modo Estrito: Ativado</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-emerald-600" />
                  <span>Modo Permissivo: Liberado</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Matrix Instructions & Reset Bar */}
        <div className="bg-cyan-950/10 border-b border-cyan-800/20 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <MousePointerClick className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>
              <strong>Matriz 100% Interativa:</strong> Clique em qualquer ícone da tabela para{' '}
              <span className="text-emerald-700 font-bold">liberar (verde)</span> ou{' '}
              <span className="text-slate-500 font-bold">revogar (cinza)</span>. Ícones com{' '}
              <span className="text-cyan-600 font-bold">ponto azul</span> indicam permissões personalizadas.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {customCount > 0 && (
              <span className="text-[11px] font-bold text-cyan-700 bg-cyan-100 border border-cyan-300 px-2 py-0.5 rounded-lg">
                {customCount} {customCount === 1 ? 'personalização' : 'personalizações'}
              </span>
            )}
            <button
              type="button"
              onClick={resetRolePermissions}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:text-slate-900"
              title="Restaurar todas as permissões para a matriz padrão do sistema"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Padrões</span>
            </button>
          </div>
        </div>

        {/* Quick Role Switcher Inside Modal */}
        <div className="p-4 sm:px-6 bg-slate-100/70 border-b border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Simular Visão de Usuário Ativo (Clique para Alternar):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {rolesList.map((r) => {
              const cfg = ROLE_CONFIGS[r];
              const user = MOCK_USERS.find((u) => u.role === r);
              const isActive = currentRole === r;
              const Icon = getRoleIcon(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => switchRole(r)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 relative ${
                    isActive
                      ? 'bg-gradient-to-br from-white to-cyan-50/90 border-cyan-500 shadow-md ring-4 ring-cyan-500/20 -translate-y-0.5'
                      : 'bg-white border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 hover:shadow-md hover:-translate-y-0.5 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-cyan-500/20 ring-2 ring-cyan-400/50' : 'bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: cfg.colorHex }} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate leading-tight ${isActive ? 'text-slate-950 font-extrabold' : 'text-slate-800'}`}>
                        {cfg.label.split('&')[0]}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.name.split(' ')[0]}</p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-600 text-white shadow-2xs shrink-0">
                      Ativo
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Content: Permissions Matrix */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Profiles Description Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {rolesList.map((r) => {
              const cfg = ROLE_CONFIGS[r];
              const Icon = getRoleIcon(r);
              const currentList = rolePermissions[r] || cfg.defaultPermissions;
              const isActive = currentRole === r;
              return (
                <div
                  key={r}
                  className={`p-3.5 rounded-2xl border-2 ${cfg.badgeBg} ${cfg.borderColor} flex flex-col justify-between transition-all ${
                    isActive ? 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-sm' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-white/80 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" style={{ color: cfg.colorHex }} />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 truncate">{cfg.label}</h3>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/90 text-slate-700 border border-slate-200 shrink-0">
                        {currentList.length} ativas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-snug">{cfg.description}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                      Módulos Principais:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cfg.primaryModules.map((m, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] bg-white/90 text-slate-800 px-1.5 py-0.5 rounded font-medium border border-slate-200"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Matrix Table */}
          <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs min-w-[560px]">
              <thead className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-1/3">Capacidade / Ação Clínica & Administrativa</th>
                  {rolesList.map((r) => {
                    const isSimulated = currentRole === r;
                    const cfg = ROLE_CONFIGS[r];
                    return (
                      <th
                        key={r}
                        className={`py-3 px-2 text-center transition-all ${
                          isSimulated
                            ? 'bg-slate-800 text-white font-extrabold ring-2 ring-inset ring-cyan-400'
                            : ''
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span style={{ color: cfg.colorHex }}>{cfg.label.split('&')[0]}</span>
                          {isSimulated && (
                            <span className="text-[9px] uppercase tracking-normal px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-black shadow-2xs">
                              Seu Perfil
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSION_CATEGORIES.map((cat, catIdx) => (
                  <React.Fragment key={catIdx}>
                    <tr className="bg-slate-100/90 font-bold text-slate-800 text-[11px]">
                      <td colSpan={5} className="py-2.5 px-4 uppercase tracking-wider text-slate-700 bg-slate-100">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.permissions.map((perm) => {
                      return (
                        <tr
                          key={perm.key}
                          className="hover:bg-cyan-50/60 transition-colors duration-150 border-l-4 border-l-transparent hover:border-l-cyan-500 group"
                        >
                          <td className="py-2.5 px-4">
                            <p className="font-semibold text-slate-900 group-hover:text-cyan-950">{perm.label}</p>
                            <p className="text-[11px] text-slate-500">{perm.description}</p>
                          </td>
                          {rolesList.map((r) => {
                            const cfg = ROLE_CONFIGS[r];
                            const currentList = rolePermissions[r] || cfg.defaultPermissions;
                            const has = currentList.includes(perm.key);
                            const isDefault = cfg.defaultPermissions.includes(perm.key);
                            const isCustomized = has !== isDefault;
                            const isSimulated = currentRole === r;

                            return (
                              <td
                                key={r}
                                className={`py-2 px-2 text-center transition-colors ${
                                  isSimulated ? 'bg-cyan-50/30' : ''
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleRolePermission(r, perm.key)}
                                  title={`${has ? 'Revogar' : 'Liberar'} "${perm.label}" para ${cfg.label} (Clique para alterar)`}
                                  className={`group/btn relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 select-none ${
                                    has
                                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/30 hover:scale-115 active:scale-95 border-2 border-emerald-600 hover:ring-2 hover:ring-emerald-400/50'
                                      : 'bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 border-2 border-slate-200 hover:border-emerald-400 hover:shadow-md hover:scale-115 active:scale-95'
                                  } ${isCustomized ? 'ring-2 ring-cyan-500 ring-offset-1' : ''}`}
                                >
                                  {has ? (
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] transition-transform group-hover/btn:scale-110" />
                                  ) : (
                                    <Ban className="w-4 h-4 stroke-[2] opacity-50 group-hover/btn:opacity-90 group-hover/btn:text-emerald-600 transition-all" />
                                  )}
                                  {isCustomized && (
                                    <span
                                      className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-white shadow-sm ring-1 ring-cyan-400"
                                      title="Permissão personalizada em relação ao padrão original"
                                    />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">Permissões persistidas no armazenamento seguro local (LGPD / CFM).</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
          >
            Concluir / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

