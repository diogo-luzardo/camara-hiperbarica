import React from 'react';
import { DollarSign, ShieldCheck, Building2, UserCheck } from 'lucide-react';

interface CoverageBadgeProps {
  convenio?: string;
  plano?: string;
  modalidade?: 'particular' | 'convenio';
  size?: 'xs' | 'sm' | 'md';
  showPlano?: boolean;
  className?: string;
}

export const isParticular = (convenio?: string, modalidade?: 'particular' | 'convenio'): boolean => {
  if (modalidade === 'particular') return true;
  if (modalidade === 'convenio') return false;
  if (!convenio) return true;
  const clean = convenio.trim().toLowerCase();
  return clean === '' || clean === 'particular' || clean === 'privado';
};

export const CoverageBadge: React.FC<CoverageBadgeProps> = ({
  convenio,
  plano,
  modalidade,
  size = 'xs',
  showPlano = false,
  className = '',
}) => {
  const particular = isParticular(convenio, modalidade);

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3 py-1 gap-1.5',
  }[size];

  if (particular) {
    return (
      <span
        className={`inline-flex items-center font-bold tracking-wide rounded-full border shadow-2xs bg-amber-50 text-amber-900 border-amber-300 ${sizeClasses} ${className}`}
        title="Paciente na modalidade Particular"
      >
        <UserCheck className="w-3 h-3 text-amber-600 shrink-0" />
        <span>Particular</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide rounded-full border shadow-2xs bg-blue-50 text-blue-900 border-blue-300 ${sizeClasses} ${className}`}
      title={`Convênio de Saúde: ${convenio}${plano ? ` (${plano})` : ''}`}
    >
      <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
      <span className="truncate max-w-[140px] sm:max-w-[200px]">{convenio}</span>
      {showPlano && plano && plano !== 'Particular' && plano !== 'Padrão' && (
        <span className="text-[10px] text-blue-700 font-normal">({plano})</span>
      )}
    </span>
  );
};
