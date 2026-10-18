import React from 'react';
import { X, Server, Database, Cloud, ShieldCheck, Cpu, Layers, HardDrive, CheckCircle2, AlertTriangle, ArrowRight, Code } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-start sm:items-center justify-center p-1.5 sm:p-4 overflow-x-hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[calc(100vw-12px)] sm:max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh] min-w-0">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold font-['Outfit'] truncate">
                Arquitetura de Nuvem (AWS) & Backend Java
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1">
                Guia técnico para produção: Quarkus/Spring Boot, PostgreSQL + JSONB e AWS S3
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg cursor-pointer shrink-0 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 text-xs text-slate-700">
          {/* Section 1: Banco de Dados - Relacional vs JSON */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                1. Banco de Dados: Relacional ou JSON? (Recomendação Técnica)
              </h3>
            </div>
            <p className="leading-relaxed">
              Para uma clínica médica de oxigenoterapia hiperbárica, a melhor prática do mercado é o <strong>Modelo Híbrido com PostgreSQL</strong> (utilizando tabelas relacionais com campos flexíveis em <code>JSONB</code>).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="bg-white p-3.5 rounded-lg border border-emerald-200 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Por que Relacional (PostgreSQL) para o Core?</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li><strong>Integridade Referencial:</strong> O <code>registro_ohb</code> e <code>cpf</code> são indexados como chaves únicas. Todas as sessões, agendamentos e documentos apontam para o mesmo paciente com garantia de integridade (Foreign Keys).</li>
                  <li><strong>Conformidade Legal (CFM e LGPD):</strong> Registros de prontuário e sessões não podem sofrer perda ou corrupção silenciosa; transações ACID garantem auditoria rígida.</li>
                  <li><strong>Consultas Rápidas:</strong> Buscar pacientes por número OHB ou intervalo de datas de sessões é instantâneo via índices B-Tree.</li>
                </ul>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-cyan-200 space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-800 font-bold">
                  <Layers className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Onde usar JSON (JSONB no PostgreSQL)?</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li><strong>Evoluções de Enfermagem & SAE:</strong> Diagnósticos de enfermagem dinâmicos (PR, ME, PI, A, R) e questionários pré-câmara podem ser salvos em colunas <code>jsonb</code> sem precisar alterar o schema do banco a cada novo protocolo.</li>
                  <li><strong>Metadados dos Documentos:</strong> Dimensões da imagem, hash SHA-256 do arquivo e tags de escaneamento.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Armazenamento de Imagens e Prontuários no AWS S3 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                2. Como Salvar Imagens de Prontuários Antigos (AWS S3 + Pre-Signed URLs)
              </h3>
            </div>
            <p className="leading-relaxed">
              <strong>Regra de Ouro:</strong> Nunca salve arquivos binários pesados (JPEGs, PNGs, PDFs) dentro do banco de dados (como BLOBs). Isso sobrecarrega a memória RAM do servidor e torna os backups impraticáveis.
            </p>

            <div className="bg-slate-900 text-cyan-300 p-3.5 rounded-lg font-mono text-[11px] space-y-1 overflow-x-auto">
              <p className="text-slate-400">// Estrutura de Pastas no Bucket S3:</p>
              <p className="break-all">s3://clinica-ohb-prontuarios/<span className="text-white font-bold">{'{registro_ohb}'}</span>/ano-<span className="text-white">2024</span>/<span className="text-yellow-300">doc_uuid.webp</span></p>
              <p className="text-slate-400 pt-1">// Fluxo de Acesso Seguro:</p>
              <p>1. Usuário envia a imagem escaneada.</p>
              <p>2. Backend Java gera uma Pre-Signed URL segura (válida por 5 minutos) direto para o S3.</p>
              <p>3. Banco salva apenas a chave S3, registro_ohb, CPF, data física e metadados.</p>
              <p>4. Imagens com mais de 5 anos migram automaticamente para o S3 Glacier (reduz custo em 90% e atende a guarda legal de 20 anos do CFM).</p>
            </div>
          </div>

          {/* Section 3: Backend Java: Spring Boot vs Quarkus */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                3. Backend em Java: Spring Boot ou Quarkus?
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Quarkus (Recomendado para AWS)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Ultra Leve</span>
                </h4>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                  <li><strong>Consumo de RAM:</strong> ~35 MB em modo Native (GraalVM) ou ~120 MB em JVM tradicional.</li>
                  <li><strong>Cold-Start:</strong> ~0.02 segundos. Perfeito para AWS ECS Fargate com auto-scaling ou AWS Lambda.</li>
                  <li><strong>Custo na AWS:</strong> Como consome menos de 0.25 vCPU e 512MB RAM, a fatura mensal cai drasticamente.</li>
                  <li><strong>Compatível:</strong> Hibernate com Panache, RESTEasy Reactive e AWS SDK v2.</li>
                </ul>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Spring Boot 3 (Java 21)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Mais Conhecido</span>
                </h4>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                  <li><strong>Familiaridade:</strong> Se você já programa em Spring Boot, o tempo de desenvolvimento inicial é menor.</li>
                  <li><strong>Consumo de RAM:</strong> ~250MB a 400MB por contêiner.</li>
                  <li><strong>Ecossistema:</strong> Spring Security (OAuth2/JWT), Spring Data JPA e Flyway para migrações do banco.</li>
                  <li><strong>Ideal para:</strong> Instância ECS Fargate de tamanho 0.5 vCPU / 1GB RAM rodando contínuo.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Arquitetura Geral da AWS (Diagrama) */}
          <div className="border border-cyan-200 bg-cyan-50/30 rounded-xl p-3.5 sm:p-4">
            <h4 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-cyan-700" />
              Arquitetura Geral de Produção na AWS
            </h4>

            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center text-xs">
              <div className="bg-white border border-slate-200 p-3 rounded-lg w-full md:w-1/4 shadow-2xs">
                <span className="font-bold text-slate-900 block">Frontend (React)</span>
                <span className="text-[10px] text-slate-500">AWS CloudFront + S3 Bucket (CDN rápida e barata)</span>
              </div>

              <ArrowRight className="w-4 h-4 text-cyan-600 shrink-0 hidden md:block" />

              <div className="bg-white border border-cyan-300 p-3 rounded-lg w-full md:w-1/4 shadow-2xs">
                <span className="font-bold text-cyan-900 block">API Backend (Java)</span>
                <span className="text-[10px] text-slate-500">AWS ECS Fargate (Quarkus ou Spring Boot)</span>
              </div>

              <ArrowRight className="w-4 h-4 text-cyan-600 shrink-0 hidden md:block" />

              <div className="bg-white border border-slate-200 p-3 rounded-lg w-full md:w-1/4 shadow-2xs">
                <span className="font-bold text-slate-900 block">Dados & Imagens</span>
                <span className="text-[10px] text-slate-500">Amazon Aurora PostgreSQL (DB) + S3 (Arquivos)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-sm text-center cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
