# 🏥 Documentação do Sistema de Clínica de Medicina Hiperbárica (OHB)

Bem-vindo à documentação oficial da aplicação **Clínica Câmara Hiperbárica**. Este documento detalha a arquitetura do sistema, todas as suas funcionalidades, como funcionam internamente e o passo a passo completo para testar cada módulo localmente.

---

## 📑 Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Ambiente e Configuração Rápida](#2-ambiente-e-configuração-rápida)
3. [Módulos e Funcionalidades](#3-módulos-e-funcionalidades)
   - [3.1 Módulo de Gestão de Pacientes](#31-módulo-de-gestão-de-pacientes)
   - [3.2 Módulo de Sessões Hiperbáricas (Enfermagem & Segurança)](#32-módulo-de-sessões-hiperbáricas-enfermagem--segurança)
   - [3.3 Módulo de Agendamentos e Consultas](#33-módulo-de-agendamentos-e-consultas)
   - [3.4 Cofre Digital e Anexo de Documentos (AWS S3)](#34-cofre-digital-e-anexo-de-documentos-aws-s3)
   - [3.5 Banco de Dados Local (H2 & PostgreSQL)](#35-banco-de-dados-local-h2--postgresql)
4. [Guia Passo a Passo de Testes](#4-guia-passo-a-passo-de-testes)
   - [Testando o Backend (API REST & Swagger)](#testando-o-backend-api-rest--swagger)
   - [Testando o Banco Local H2 Console](#testando-o-banco-local-h2-console)
   - [Testando o Frontend (Web / Tablet Interface)](#testando-o-frontend-web--tablet-interface)
5. [End-to-End Test Workflow (Exemplo Prático)](#5-end-to-end-test-workflow-exemplo-prático)

---

## 1. Visão Geral da Arquitetura

O sistema é dividido em duas partes principais:

- **Backend (`/backend`)**: Desenvolvido em **Java 25** com **Quarkus 3.39.2** e **Hibernate ORM / Panache**.
  - **Banco de Dados Local**: **H2 Database** embutido (modo arquivo `./data/clinica_db` com compatibilidade PostgreSQL para desenvolvimento zero-config).
  - **Banco de Produção**: Suporte nativo a **PostgreSQL**.
  - **Armazenamento de Arquivos**: Integração com **AWS S3** para fotos de lesões e prontuários digitalizados usando URLs pré-assinadas (*Presigned URLs*).
  - **Documentação de API**: Swagger UI integrado (`http://localhost:8080/q/swagger-ui`).
- **Frontend (`/src`)**: Desenvolvido em **React 18**, **TypeScript**, **TailwindCSS**, **Lucide Icons** e **Vite**.
  - Interface responsiva com foco em usabilidade para uso em desktop e tablets na área da câmara hiperbárica.

---

## 2. Ambiente e Configuração Rápida

### Pré-requisitos
- **Java 21 ou superior** (Recomendado Java 21/25).
- **Node.js 18+** e **npm**.

### 🚀 Rodando o Backend (Quarkus)
```bash
# Entre na pasta backend
cd backend

# Execute em modo desenvolvimento (com Live Reload e Banco H2 Local automático)
./mvnw quarkus:dev
```
- **Porta da API**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/q/swagger-ui`
- **H2 Console**: `http://localhost:8082`

### 📦 Coleção Pronta para o Postman
Na raiz do projeto está disponível o arquivo **[`clinica_ohb_postman_collection.json`](clinica_ohb_postman_collection.json)**.
Ele contém todas as requisições pré-configuradas com corpos JSON pré-preenchidos e scripts automáticos que salvam os IDs (`patientId`, `sessionId`, `appointmentId`, `documentId`) para permitir testes em cadeia.

### 💻 Rodando o Frontend (React / Vite)
```bash
# Na raiz do projeto
npm install
npm run dev
```
- **Interface Web**: `http://localhost:5173`

---

## 3. Módulos e Funcionalidades

### 3.1 Módulo de Gestão de Pacientes
Permite o cadastro completo do prontuário médico de oxigenoterapia hiperbárica.

#### Funcionalidades:
- **Dados Cadastrais**: Registro OHB (ID único da clínica), Registro Hospitalar, Unidade, Nome Completo, CPF, RG, Data de Nascimento, Idade, Sexo, Estado Civil, Nome da Mãe, Profissão, Telefones, Endereço e Convênio.
- **Histórico Clínico & Exame Físico**:
  - História clínica detalhada e exame físico resumido.
  - Médico indicante, procedência e meio de remoção.
  - Avaliação de Dor (Escala de 0 a 10).
  - Descrição da lesão/ferida e localização dos curativos.
  - Diagnóstico nosológico, CID-10 e número de sessões previstas.
  - Medicamentos em uso, alergias, vícios, otoscopia (checagem da membrana timpânica), próteses e ventilação.
- **Busca dinâmica**: Filtro em tempo real por nome, CPF ou Registro OHB.
- **Unicidade Inteligente & Upsert (Update or Insert)**:
  - Se for enviado um `POST /api/patients` informando um **`id`**, **`registroOHB`** ou **`cpf`** de um paciente já cadastrado no sistema, o backend identifica o paciente existente e **atualiza os seus dados** automaticamente (retornando HTTP 200) em vez de falhar por chave duplicada.
  - Caso o paciente estivesse **excluído logicamente** (`deleted_at != null`), o cadastro é automaticamente **reativado** (`deleted_at = null`) com as informações mais recentes!

---

### 3.2 Módulo de Sessões Hiperbáricas (Enfermagem & Segurança)
Ficha clínica de atendimento preenchida pelos enfermeiros e técnicos antes e durante a sessão dentro da câmara hiperbárica.

#### Funcionalidades:
- **Identificação da Sessão**: Número sequencial automático da sessão do paciente (ex: Sessão 1, 2, 3...), Data, Horário e Duração.
- **Parâmetros Técnicos & Sinais Vitais**:
  - Pressão atmosférica em ATA (ex: 2.0 ATA, 2.4 ATA).
  - Sinais vitais: Pressão Arterial (PA), Glicemia Capilar (mg/dL), Temperatura (°C).
  - Medicamentos ministrados durante o tratamento e registro de intercorrências.
  - Responsáveis: Médico, Enfermeiro e Técnico.
- **Checagens de Segurança da Câmara (Prevenção de Incêndios e Barotrauma)**:
  - ✅ Conferência de Nome e Pulseira de Identificação.
  - ✅ Vestuário 100% Algodão (Prevenção de Eletricidade Estática).
  - ✅ Uso de Pulseira Antiestática.
  - ✅ Remoção de Objetos Metálicos, Relógios e Eletrônicos.
  - ✅ Retirada de Próteses Dentárias/Auditivas.
  - ✅ Abertura de Sonda Vesical (Prevenção de barotrauma).
  - ✅ Avaliação de Acessos Venosos (AVP / AVC / PICC).
  - ✅ Velocidade de Compressão e Descompressão.
  - ✅ Triagem de Sintomas Respiratórios.
- **Diagnósticos de Enfermagem**:
  - Avaliação por status: `PR` (Presente), `ME` (Melhorado), `PI` (Piorado), `A` (Ausente), `R` (Resolvido).
  - Categorias: Dor, Risco de Queda, Dificuldade de Deambulação, Descontrole Glicêmico, Integridade da Pele, Risco de Contaminação, Ansiedade.
  - Anotação e Evolução Diária de Enfermagem.

---

### 3.3 Módulo de Agendamentos e Consultas
Controle de horários e status de presença na clínica.

#### Funcionalidades:
- **Agendamento de Sessões/Consultas**: Vinculação com paciente, data, horário, dia da semana, número da sessão e pressão ATA prevista.
- **Controle de Status**: `agendado`, `confirmado`, `realizado`, `cancelado`.
- **Filtros por Data e Paciente**: Listagem por dia ou histórico por paciente.

---

### 3.4 Cofre Digital e Anexo de Documentos (AWS S3)
Armazenamento seguro de fotos de evolução de lesões, prontuários antigos e laudos.

#### Funcionalidades:
- **Upload Seguro via S3 Presigned URL**:
  1. O cliente solicita uma URL pré-assinada ao backend (`POST /api/documents/presigned-upload-url`).
  2. O arquivo é enviado diretamente do navegador/tablet para o bucket AWS S3 sem sobrecarregar o servidor backend.
  3. Os metadados do documento são salvos no banco de dados local.
- **Categorização**: `prontuario_antigo`, `ficha_atendimento`, `foto_lesao`, `exame_laudo`, `outro`.

---

### 3.5 Banco de Dados Local (H2 & PostgreSQL)
- **Desenvolvimento (`%dev`)**: H2 embutido em arquivo (`./backend/data/clinica_db.mv.db`), permitindo reiniciar o servidor sem perder os dados cadastrados.
- **Testes (`%test`)**: H2 em memória (`mem:test_db`).
- **Produção (`%prod`)**: Conexão com PostgreSQL via JDBC (`DB_URL`, `DB_USER`, `DB_PASSWORD`).
- **H2 Console**: Interface web para explorar tabelas e executar queries SQL diretamente no navegador (`http://localhost:8082`).

---

### 3.6 Auditoria e Exclusão Lógica (Soft Delete)
Todas as tabelas do sistema contam com controle de auditoria de temporalidade e integridade dos dados:
- **`created_at`**: Data e hora exatas da criação do registro (preenchido automaticamente via `@PrePersist`).
- **`updated_at`**: Data e hora da última modificação do registro (preenchido automaticamente via `@PreUpdate`).
- **`deleted_at`**: Timestamp de exclusão lógica (*Soft Delete*).
  - Ao chamar o método `DELETE /api/{recurso}/{id}`, a linha **permanece salva no banco de dados** para fins de auditoria médica e segurança jurídica, tendo apenas o campo `deleted_at` preenchido.
  - Todas as chamadas `GET` (listagens, buscas e detalhes) filtram automaticamente os registros ativos (`deleted_at IS NULL`).

---

## 4. Guia Passo a Passo de Testes

### Testando o Backend (API REST & Swagger)

1. Acesse o **Swagger UI**: `http://localhost:8080/q/swagger-ui`
2. **Testar Cadastro de Paciente**:
   - Expanda o endpoint `POST /api/patients`.
   - Clique em **Try it out** e envie o seguinte JSON:
     ```json
     {
       "registroOHB": "OHB-2026-001",
       "nome": "Maria Silva Santos",
       "cpf": "123.456.789-00",
       "dataNascimento": "1980-05-15",
       "sexo": "F",
       "convenio": "Unimed",
       "celular": "(11) 98765-4321",
       "diagnostico": "Úlceras de pé diabético",
       "cid10": "E11.5",
       "avaliacaoDor": 4
     }
     ```
   - Clique em **Execute** e verifique a resposta `201 Created` contendo o `id` (UUID gerado).

3. **Testar Listagem e Busca de Pacientes**:
   - Execute `GET /api/patients` para listar todos os pacientes.
   - Execute `GET /api/patients?search=Maria` para validar a busca por nome.

4. **Testar Criação de Sessão Hiperbárica**:
   - Expanda `POST /api/sessions` e envie:
     ```json
     {
       "patient": { "id": "COPIE_O_UUID_DO_PACIENTE_CRIADO" },
       "ata": 2.40,
       "pa": "120/80",
       "glicemia": "110",
       "duracaoMinutos": 90,
       "roupaAlgodao": true,
       "pulseiraEstatica": true,
       "conferenciaNome": true,
       "diagDor": "PR",
       "diagPele": "PR",
       "evolucaoEnfermagem": "Paciente tolerou bem a compressão a 2.4 ATA sem queixas otológicas."
     }
     ```
   - Verifique se o `sessionNumber` foi gerado automaticamente como `1`.

---

### Testando o Banco Local H2 Console

1. Abra o navegador em: **`http://localhost:8082`**
2. Preencha os campos de conexão conforme configurado:
   - **Driver Class**: `org.h2.Driver`
   - **JDBC URL**: `jdbc:h2:file:./data/clinica_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL`
   - **User Name**: `sa`
   - **Password**: `sa`
3. Clique em **Connect**.
4. Teste executar consultas SQL de verificação de auditoria e exclusão lógica (*Soft Delete*):
   ```sql
   -- Listar pacientes ativos
   SELECT id, registro_ohb, nome, created_at, updated_at, deleted_at FROM patients WHERE deleted_at IS NULL;

   -- Verificar registros excluídos logicamente (auditados)
   SELECT id, nome, created_at, deleted_at FROM patients WHERE deleted_at IS NOT NULL;
   SELECT id, patient_id, session_number, created_at, deleted_at FROM hyperbaric_sessions;
   ```
5. Note que os dados persistem na pasta `./backend/data/clinica_db` mesmo após reiniciar o servidor Quarkus!

---

### Testando o Frontend (Web / Tablet Interface)

1. Certifique-se de que o backend Quarkus e o Vite estão rodando.
2. Acesse: `http://localhost:5173`
3. **Testes Visuais e Interativos**:
   - **Navegação**: Use a barra superior/menu lateral para alternar entre *Pacientes*, *Agendamentos*, *Cofre Digital* e *Arquitetura*.
   - **Novo Paciente**: Clique no botão "+ Novo Paciente", preencha a ficha completa e salve.
   - **Ficha do Paciente**: Clique sobre um paciente cadastrado para visualizar detalhes, histórico de sessões e anexos.
   - **Nova Sessão (Tablet Check-in)**: Na ficha do paciente, clique em "Nova Sessão Hiperbárica", marque as checagens de segurança (vestuário, próteses, estática) e salve.
   - **Impressão de Fichas**: No menu do paciente, teste o botão de "Imprimir Ficha" para visualizar a formatação oficial de impressão da clínica.

---

## 5. End-to-End Test Workflow (Exemplo Prático)

Para validar o fluxo completo da clínica:

1. **Cadastrar Paciente**: Cadastre o paciente "João Ferreira", Registro OHB "OHB-100".
2. **Agendar Consulta**: Crie um agendamento para a data de hoje às 09:00 para o João Ferreira com status `confirmado`.
3. **Iniciar Atendimento na Câmara**:
   - Entre no prontuário do João Ferreira.
   - Abra a modal de **Nova Sessão Hiperbárica**.
   - Preencha os sinais vitais (PA 130/80, Glicemia 105 mg/dL) e selecione 2.0 ATA por 90 minutos.
   - Marque todas as checagens de segurança da câmara.
   - Salve a sessão.
4. **Verificar Persistência**:
   - Atualize a página do frontend ou faça query no H2 Console (`SELECT * FROM hyperbaric_sessions`).
   - Verifique que a sessão #1 foi registrada com sucesso vinculada ao paciente João Ferreira.

---
*Documentação gerada para a aplicação Clínica Câmara Hiperbárica.*
