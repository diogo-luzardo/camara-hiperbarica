import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Patient, HyperbaricSession, Appointment } from '../types';

interface PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tratamento' | 'agendamento' | 'enfermagem';
  patient: Patient;
  sessions: HyperbaricSession[];
  appointments: Appointment[];
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  isOpen,
  onClose,
  type,
  patient,
  sessions,
  appointments,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:border-none print:shadow-none print:rounded-none">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold font-['Outfit'] text-sm">
              Visualização para Impressão da Ficha Clínica Oficial
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Documento</span>
            </button>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-8 overflow-y-auto print:p-4 text-slate-900 font-sans text-xs bg-white">
          {/* Header replicating the actual medical sheet */}
          <div className="border-b-2 border-slate-800 pb-4 mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-950 uppercase font-['Outfit']">
                Medicina Hiperbárica Zona Sul • Clínica Médica & Terapia Intensiva
              </h1>
              <p className="text-[11px] text-slate-700 font-medium">
                Dr. Carlos Henrique Esteves • CRM 62.139
              </p>
              <p className="text-[10px] text-slate-500">
                Rua das Pitombeiras, 175 - Jabaquara - São Paulo/SP | Tel: (11) 5017-0698
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 border-2 border-slate-900 font-mono font-bold text-xs">
                REGISTRO OHB: {patient.registroOHB}
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">RH: {patient.registroHospitalar || 'N/A'}</p>
            </div>
          </div>

          {/* Patient Details Bar */}
          <div className="bg-slate-50 border border-slate-300 rounded p-3 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">PACIENTE:</span>
              <strong className="text-slate-950 uppercase">{patient.nome}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">CPF:</span>
              <span className="font-mono font-bold">{patient.cpf}</span>
            </div>
            <div>
              <span className="text-slate-500 block">IDADE / SEXO:</span>
              <span>{patient.idade} anos ({patient.sexo})</span>
            </div>
            <div>
              <span className="text-slate-500 block">CONVÊNIO / PLANO:</span>
              <span>{patient.convenio || 'Particular'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block">DIAGNÓSTICO:</span>
              <strong>
                {patient.diagnostico} ({patient.cid11 ? `CID-11: ${patient.cid11} | ` : ''}CID-10: {patient.cid10})
              </strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block">MÉDICO ASSISTENTE:</span>
              <span>{patient.medicoIndicou}</span>
            </div>
          </div>

          {/* TYPE 1: FOLHA DE TRATAMENTO E EVOLUÇÃO MÉDICA */}
          {type === 'tratamento' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-center border-y border-slate-300 py-1 bg-slate-100">
                Folha de Tratamento e Evolução Médica de Paciente
              </h2>

              <table className="w-full border-collapse border border-slate-400 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-400 font-bold">
                    <th className="border border-slate-300 p-1.5 text-center">Nº</th>
                    <th className="border border-slate-300 p-1.5">DATA</th>
                    <th className="border border-slate-300 p-1.5">HORA</th>
                    <th className="border border-slate-300 p-1.5">ATA</th>
                    <th className="border border-slate-300 p-1.5">P.A.</th>
                    <th className="border border-slate-300 p-1.5">GLIC.</th>
                    <th className="border border-slate-300 p-1.5">TEMP.</th>
                    <th className="border border-slate-300 p-1.5">DUR.</th>
                    <th className="border border-slate-300 p-1.5">INTERCORRÊNCIAS / EVOLUÇÃO MÉDICA</th>
                    <th className="border border-slate-300 p-1.5">MÉDICO / ASSINATURA</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b border-slate-300">
                      <td className="border border-slate-300 p-1.5 text-center font-bold font-mono">#{s.sessionNumber}</td>
                      <td className="border border-slate-300 p-1.5 whitespace-nowrap">{s.data.split('-').reverse().join('/')}</td>
                      <td className="border border-slate-300 p-1.5">{s.hora}</td>
                      <td className="border border-slate-300 p-1.5 font-bold">{s.ata} ATA</td>
                      <td className="border border-slate-300 p-1.5">{s.pa}</td>
                      <td className="border border-slate-300 p-1.5">{s.glicemia}</td>
                      <td className="border border-slate-300 p-1.5">{s.temperatura ? `${s.temperatura}°C` : '-'}</td>
                      <td className="border border-slate-300 p-1.5">{s.duracaoMinutos}m</td>
                      <td className="border border-slate-300 p-1.5 max-w-xs">{s.intercorrencias || 'Sem intercorrências.'}</td>
                      <td className="border border-slate-300 p-1.5 whitespace-nowrap text-[9px]">{s.medicoResponsavel || 'Dr. Carlos Henrique'}</td>
                    </tr>
                  ))}
                  {/* Empty rows to complete page if few sessions */}
                  {Array.from({ length: Math.max(0, 10 - sessions.length) }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="border-b border-slate-200 text-slate-300 h-8">
                      <td className="border border-slate-300 p-1.5 text-center font-mono">#{sessions.length + idx + 1}</td>
                      <td className="border border-slate-300 p-1.5"></td>
                      <td className="border border-slate-300 p-1.5"></td>
                      <td className="border border-slate-300 p-1.5"></td>
                      <td className="border border-slate-300 p-1.5"></td>
                      <td className="border border-slate-300 p-1.5"></td>
                      <td className="border border-slate-300 p-1.5"></td>
                      <td className="border border-slate-300 p-1.5"></td>
                      <td className="border border-slate-300 p-1.5"></td>
                      <td className="border border-slate-300 p-1.5"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TYPE 2: FICHA DE AGENDAMENTO INDIVIDUAL */}
          {type === 'agendamento' && (
            <div className="space-y-4 max-w-md mx-auto border-2 border-slate-800 p-6 rounded-lg">
              <div className="text-center border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold uppercase">Ficha de Agendamento • Sessões Hiperbáricas</h2>
                <p className="text-[10px] text-slate-600">Centro Europa - Jabaquara</p>
              </div>

              <div className="space-y-2 py-2">
                <p><strong>Paciente:</strong> {patient.nome}</p>
                <p><strong>Registro OHB:</strong> <span className="font-mono font-bold">{patient.registroOHB}</span></p>
              </div>

              <table className="w-full border-collapse border border-slate-800 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-800">
                    <th className="border border-slate-800 p-2">Data | Mês</th>
                    <th className="border border-slate-800 p-2">Dia da Semana</th>
                    <th className="border border-slate-800 p-2">Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 10).map((app) => (
                    <tr key={app.id} className="border-b border-slate-400 text-center">
                      <td className="border border-slate-800 p-2 font-bold">{app.data.split('-').reverse().join('/')}</td>
                      <td className="border border-slate-800 p-2">{app.diaSemana}</td>
                      <td className="border border-slate-800 p-2 font-mono font-bold">{app.horario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-center italic text-slate-600">
                "Ocorrendo qualquer anormalidade retorne a este serviço. Rua das Pitombeiras, 175 - Jabaquara | Tel: (11) 5017-0698"
              </div>
            </div>
          )}

          {/* Footer Notice */}
          <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
            <span>Sistema Oxigenoterapia Hiperbárica • Registro Clínico Oficial</span>
            <span>Documento emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
