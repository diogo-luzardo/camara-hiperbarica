import React from 'react';
import { UserRole } from '../types/auth';
import { ShieldCheck, Stethoscope, FileText, DollarSign, Crown } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showIcon = true,
  size = 'xs',
  className = '',
}) => {
  const getRoleConfig = () => {
    switch (role) {
      case 'administrador':
        return {
          label: 'Administrador',
          bg: 'bg-purple-950/80 text-purple-300 border-purple-700/80',
          lightBg: 'bg-purple-100 text-purple-800 border-purple-200',
          dotBg: 'bg-purple-400',
          icon: Crown,
        };
      case 'operacional':
        return {
          label: 'Operacional',
          bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80',
          lightBg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          dotBg: 'bg-cyan-400',
          icon: Stethoscope,
        };
      case 'administrativo':
        return {
          label: 'Administrativo',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
          lightBg: 'bg-amber-100 text-amber-800 border-amber-200',
          dotBg: 'bg-amber-400',
          icon: FileText,
        };
      case 'financeiro':
        return {
          label: 'Financeiro',
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80',
          lightBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dotBg: 'bg-emerald-400',
          icon: DollarSign,
        };
      default:
        return {
          label: role,
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          lightBg: 'bg-slate-100 text-slate-700 border-slate-200',
          dotBg: 'bg-slate-400',
          icon: ShieldCheck,
        };
    }
  };

  const config = getRoleConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3 py-1 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full border shadow-2xs ${config.bg} ${sizeClasses} ${className}`}
    >
      {showIcon && <IconComponent className="w-3 h-3 stroke-[2.5]" />}
      <span>{config.label}</span>
    </span>
  );
};
