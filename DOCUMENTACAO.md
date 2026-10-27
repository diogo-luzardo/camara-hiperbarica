# 🏥 Sistema da Clínica de Medicina Hiperbárica (OHB)
## Manual Completo do Operador e Documentação do Sistema

> **Guia Oficial de Utilização e Referência Técnica**  
> *Desenvolvido para operadores, recepcionistas, equipe de enfermagem, médicos hiperbaristas, analistas de faturamento e administradores de TI.*

---

## 📑 Índice Geral

- [🌟 PARTE 1: MANUAL DO OPERADOR (GUIA PRÁTICO PASSO A PASSO)](#-parte-1-manual-do-operador-guia-prático-passo-a-passo)
  - [1. O que é o Sistema e Como ele Ajuda a Clínica](#1-o-que-é-o-sistema-e-como-ele-ajuda-a-clínica)
  - [2. Tabela Rápida: "O que você deseja fazer hoje?"](#2-tabela-rápida-o-que-você-deseja-fazer-hoje)
  - [3. Como Entrar no Sistema e Escolher seu Perfil (Login & Acessos)](#3-como-entrar-no-sistema-e-escolher-seu-perfil-login--acessos)
  - [4. Como Cadastrar e Localizar Pacientes](#4-como-cadastrar-e-localizar-pacientes)
    - [4.1 Localizar um Paciente Rápido (Busca Inteligente)](#41-localizar-um-paciente-rápido-busca-inteligente)
    - [4.2 Passo a Passo para Cadastrar um Novo Paciente](#42-passo-a-passo-para-cadastrar-um-novo-paciente)
  - [5. Ficha do Paciente: O Prontuário Central](#5-ficha-do-paciente-o-prontuário-central)
  - [6. Como Registrar uma Sessão Hiperbárica (Enfermagem & Técnicos)](#6-como-registrar-uma-sessão-hiperbárica-enfermagem--técnicos)
    - [6.1 Passo a Passo do Registro da Sessão](#61-passo-a-passo-do-registro-da-sessão)
    - [6.2 Checklist de Segurança da Câmara (Obrigatório)](#62-checklist-de-segurança-da-câmara-obrigatório)
    - [6.3 Diagnósticos de Enfermagem (SAE) e Evolução](#63-diagnósticos-de-enfermagem-sae-e-evolução)
  - [7. Como Fazer Agendamentos e Avisar Pacientes por WhatsApp](#7-como-fazer-agendamentos-e-avisar-pacientes-por-whatsapp)
    - [7.1 Agendar 1 Sessão Avulsa](#71-agendar-1-sessão-avulsa)
    - [7.2 Agendar Pacote Completo (10 ou 20 sessões em 1 clique)](#72-agendar-pacote-completo-10-ou-20-sessões-em-1-clique)
    - [7.3 Enviar Lembrete no WhatsApp do Paciente](#73-enviar-lembrete-no-whatsapp-do-paciente)
    - [7.4 Alterar Status de Presença e Imprimir Grade](#74-alterar-status-de-presença-e-imprimir-grade)
  - [8. Cofre Digital e Scanner com Câmera (Fotos de Feridas e Documentos Antigos)](#8-cofre-digital-e-scanner-com-câmera-fotos-de-feridas-e-documentos-antigos)
    - [8.1 Tirar Fotos ou Escanear Fichas com a Câmera](#81-tirar-fotos-ou-escanear-fichas-com-a-câmera)
    - [8.2 Escolhendo os Filtros Certos (Texto P&B vs Ferida Colorida)](#82-escolhendo-os-filtros-certos-texto-pb-vs-ferida-colorida)
    - [8.3 Consultar e Ampliar Fotos Anexadas](#83-consultar-e-ampliar-fotos-anexadas)
  - [9. Como Consultar o Catálogo de Doenças (CID-11 e CID-10)](#9-como-consultar-o-catálogo-de-doenças-cid-11-e-cid-10)
  - [10. Painel Financeiro e Faturamento de Convênios](#10-painel-financeiro-e-faturamento-de-convênios)
  - [11. Impressão de Fichas e Prontuários Oficiais](#11-impressão-de-fichas-e-prontuários-oficiais)
  - [12. Dicas e Resolução de Dúvidas do Dia a Dia](#12-dicas-e-resolução-de-dúvidas-do-dia-a-dia)

---

- [⚙️ PARTE 2: GUIA TÉCNICO E ARQUITETURA DO SISTEMA (TI & DESENVOLVEDORES)](#️-parte-2-guia-técnico-e-arquitetura-do-sistema-ti--desenvolvedores)
  - [13. Visão Geral da Arquitetura](#13-visão-geral-da-arquitetura)
  - [14. Como Rodar o Sistema Localmente](#14-como-rodar-o-sistema-localmente)
  - [15. Banco de Dados Local (H2 & PostgreSQL)](#15-banco-de-dados-local-h2--postgresql)
  - [16. Auditoria de Dados e Exclusão Lógica (Soft Delete)](#16-auditoria-de-dados-e-exclusão-lógica-soft-delete)
  - [17. Armazenamento em Nuvem (AWS S3 Presigned URLs)](#17-armazenamento-em-nuvem-aws-s3-presigned-urls)
  - [18. Endpoints da API REST (Quarkus)](#18-endpoints-da-api-rest-quarkus)
  - [19. Coleção Postman e Testes de API](#19-coleção-postman-e-testes-de-api)
  - [20. Testes Automatizados no Frontend](#20-testes-automatizados-no-frontend)

---

# 🌟 PARTE 1: MANUAL DO OPERADOR (GUIA PRÁTICO PASSO A PASSO)

---

## 1. O que é o Sistema e Como ele Ajuda a Clínica

O **Sistema da Clínica de Medicina Hiperbárica (OHB)** é a ferramenta central de trabalho de toda a clínica. Ele substitui as antigas fichas de papel e centraliza em um só lugar:

1. **Recepção e Cadastro**: Registro completo dos dados do paciente, convênio e endereço com busca automática por CEP.
2. **Câmara Hiperbárica (Segurança & Enfermagem)**: Protocolo de checagem obrigatório contra riscos de incêndio e barotrauma (roupa 100% algodão, proibição de metais/eletrônicos, controle de glicemia capilar e pressão arterial).
3. **Agendamento Inteligente**: Marcação de sessões individuais ou pacotes de 10 a 20 sessões diárias com envio de confirmação no WhatsApp com 1 clique.
4. **Acervo Digital & Scanner com Câmera**: Digitalização de folhas de papel antigas e fotos coloridas de evolução de feridas (pé diabético, osteomielite, etc.) usando a própria câmera do tablet ou do computador.
5. **Catálogo de Doenças (CID-11 & CID-10)**: Consulta rápida de diagnósticos aprovados pelo Conselho Federal de Medicina (CFM) e Rol da ANS.
6. **Financeiro e Guias**: Controle de faturamento sob o código TUSS 20101202 da Oxigenoterapia Hiperbárica e exportação para planilhas.

---

## 2. Tabela Rápida: "O que você deseja fazer hoje?"

Use este índice para encontrar rapidamente a função desejada:

| O que você quer fazer? | Onde clicar na tela? | O que vai acontecer? |
| :--- | :--- | :--- |
| **Cadastrar um novo paciente** | Botão azul/verde **`+ Novo Paciente`** no topo da tela | Abre a ficha de cadastro completa com 5 abas |
| **Escanear ficha física de paciente antigo** | Botão verde **`Escanear Ficha`** no topo da tela | Abre a câmera para fotografar o prontuário de papel e já cadastrar o paciente |
| **Achar um paciente já cadastrado** | Caixa de busca na aba **`Pacientes`** | Digite o nome, CPF (com ou sem pontos) ou Registro OHB |
| **Registrar uma sessão realizada hoje** | Abra o paciente ➡️ Botão **`+ Nova Sessão Hiperbárica`** | Abre o checklist de segurança, sinais vitais e evolução |
| **Agendar uma sessão ou pacote** | Aba **`Agendamentos`** ➡️ Botão **`+ Agendar`** | Permite agendar 1 sessão ou 10/20 sessões de segunda a sexta |
| **Mandar mensagem no WhatsApp do paciente** | Aba **`Agendamentos`** ➡️ Ícone do **WhatsApp** verde | Abre o WhatsApp Web com mensagem pronta de lembrete |
| **Ver fotos da ferida ou documentos** | Aba **`Prontuários Antigos`** (ou dentro do paciente) | Galeria com ampliação (zoom), rotação e download |
| **Imprimir a folha oficial de atendimento** | Na ficha do paciente ➡️ Botão **`Imprimir Ficha`** | Gera a folha formatada pronta para enviar à impressora |
| **Descobrir o código CID da doença** | Botão **`Consultar CID-11`** no topo da tela | Dicionário de patologias com protocolo recomendado da SBMH |
| **Ver o faturamento do mês** | Aba **`Financeiro & Convênios`** | Gráficos de valores, guias autorizadas e exportação para Excel |
| **Trocar de usuário / perfil** | Clique no seu nome no canto superior direito | Permite alternar entre Administrador, Enfermagem, Recepção e Financeiro |

> 💡 **Interface Limpa e Sem Repetições (Single Source of Truth)**:  
> Todas as ações de criação e consulta global (`+ Novo Paciente`, `Escanear Ficha`, `+ Agendar` e `Consultar CID-11`) estão centralizadas **exclusivamente na barra superior de navegação (Navbar)**. Isso elimina botões repetidos na mesma tela, deixando as barras de pesquisa e filtros focadas e os cartões de pacientes visíveis sem rolagem desnecessária.

---

## 3. Como Entrar no Sistema e Escolher seu Perfil (Login & Acessos)

### 3.1 Tela de Acesso
Ao abrir o sistema, você verá a tela de identificação:
- Você pode digitar seu **E-mail** e **Senha** habituais;
- Ou, para testes e agilidade na clínica, basta clicar em um dos **4 Cartões de Acesso Rápido de 1 Clique**:
  1. 👑 **Administrador (Dr. Carlos Henrique - Diretor Clínico)**: Acesso completo a todas as funções, relatórios e configurações.
  2. 🩺 **Operacional (Enfª. Juliana Ramos - Enfermagem)**: Foco total no registro de sessões na câmara, sinais vitais e checklist de segurança.
  3. 📄 **Administrativo (Roberto Mendes - Recepção)**: Foco no cadastro de novos pacientes, endereços e agendamento de consultas.
  4. 💲 **Financeiro (Marina Albuquerque - Faturamento)**: Foco na conferência de guias de convênios e lotes TISS.

### 3.2 Como Alternar de Perfil sem Sair do Sistema
Caso você precise mudar de função (por exemplo, a enfermeira que precisa cadastrar um paciente rapidamente):
1. No **canto superior direito**, clique no seu **nome/foto**.
2. No menu que se abre, clique diretamente sobre o perfil desejado (*Administrador, Operacional, Administrativo ou Financeiro*).
3. O sistema atualiza a sua identidade e permissões instantaneamente.

### 3.3 Entendendo o "Modo Rigoroso" vs "Modo Aberto"
- **Modo Aberto (Permissivo)**: Padrão inicial. Qualquer membro da equipe pode navegar por todas as telas para facilitar o dia a dia.
- **Modo Rigoroso (Restrito / Produção)**: Cada operador só consegue abrir as telas do seu setor (exemplo: a recepção não acessa dados financeiros confidenciais). Pode ser ligado a qualquer momento no botão **`Perfis & Acessos`** na barra superior.

---

## 4. Como Cadastrar e Localizar Pacientes

### 4.1 Localizar um Paciente Rápido (Busca Inteligente)
Na tela principal **`Pacientes`**, você encontra uma barra de pesquisa muito potente:
- **Você pode digitar de qualquer jeito**: Com letra maiúscula, minúscula, com ou sem acentos (ex: `antonio` acha `Antônio`).
- **Pelo CPF**: Digite apenas os números (ex: `123456`), não precisa colocar pontos nem traço.
- **Pelo Registro da Clínica**: Digite o número do registro (ex: `1082` ou `OHB-1082`).
- **Por Telefone, Bairro ou Diagnóstico**: Digite parte do telefone, nome do médico indicante ou o nome da ferida (ex: `diabetico`).
- **Filtros por Abas**:
  - **Todos**: Mostra todos os pacientes da clínica.
  - **Em Tratamento**: Mostra apenas quem ainda está realizando sessões na câmara.
  - **Alta Clínica**: Mostra quem já completou todas as sessões prescritas.
  - **Filtro de Convênios**: Permite ver apenas pacientes de um plano específico (ex: *Bradesco*, *Unimed*, *Particular*).

---

### 4.2 Passo a Passo para Cadastrar um Novo Paciente
Clique no botão **`+ Novo Paciente`** no topo da tela. O formulário é dividido em 5 abas organizadas:

#### 📋 Aba 1: Dados Pessoais
1. **Registro OHB**: Já vem preenchido automaticamente com o próximo número sequencial da clínica (você pode ajustar se for um número histórico).
2. **Nome Completo**: Digite o nome do paciente.
3. **CPF**: Digite os 11 números. O sistema formata automaticamente (`000.000.000-00`) e avisa com um ícone verde se o CPF é matematicamente válido.
4. **Data de Nascimento**: Ao escolher a data, o sistema **calcula a idade exata do paciente sozinho**.
5. **Sexo e Estado Civil**: Selecione nas caixas de seleção.
6. **Celular e E-mail**: O celular é muito importante para os lembretes automáticos de agendamento no WhatsApp.

#### 📍 Aba 2: Endereço (Preenchimento Automático por CEP)
1. **Campo CEP**: Digite os 8 números do CEP do paciente.
2. O sistema faz a busca na internet imediatamente e **preenche sozinho**:
   - Rua / Avenida (Logradouro);
   - Bairro;
   - Cidade (Município);
   - Estado (UF).
3. **Você só precisa preencher**: O **Número** da casa e o **Complemento** (se for apartamento, bloco, etc.).
4. *Dica*: Se o paciente não souber o CEP, você pode digitar o nome da rua para o sistema sugerir o endereço.

#### 🩺 Aba 3: Histórico Clínico & Exame Físico
1. **Médico Indicante**: Nome do médico cirurgião, ortopedista ou vascular que encaminhou o paciente.
2. **Escala de Dor (0 a 10)**: Selecione o nível de dor relatado pelo paciente (0 = sem dor, 10 = dor insuportável).
3. **História Clínica e Exame Físico**: Campo para descrever o estado da ferida, tamanho em centímetros, secreções e aspecto das bordas.
4. **Medicamentos em uso e Alergias**: Liste os remédios atuais e alergias a medicamentos (penicilina, dipirona, etc.).
5. **Checagem do Ouvido (Otoscopia)**: Registro do aspecto da membrana timpânica (normal, opaca, retraída) para garantir que o paciente pode ser comprimido na câmara.

#### 🫁 Aba 4: OHB & CID (Diagnóstico)
1. **Diagnóstico da Doença**: Descreva a indicação (ex: *Pé diabético complicado com celulite e osteomielite*).
2. **Busca Integrada de CID-11 e CID-10**:
   - Clique na caixinha de pesquisa de CID e comece a digitar o nome da doença (ex: `diabetico`, `osteomielite`, `queimadura`).
   - O sistema exibe as sugestões com o código CID-11 novo da OMS e o CID-10 tradicional dos convênios.
   - Ao clicar na sugestão, os dois campos são preenchidos juntos!
3. **Sessões Previstas**: Quantidade de sessões recomendadas pelo médico (geralmente 20 a 30 sessões).
4. **Convênio e Matrícula**: Selecione se o atendimento é por plano de saúde ou se é Particular.

#### 📷 Aba 5: Scanner de Papel (Prontuário Físico Antigo)
- Se o paciente trouxer uma pasta de papel ou fichas antigas, você não precisa digitar tudo!
- Basta clicar em **`Abrir Câmera / Escanear`** para fotografar as folhas de papel. Elas ficarão guardadas para sempre no prontuário digital do paciente.
- Clique em **`Salvar Cadastro`** para concluir.

---

## 5. Ficha do Paciente: O Prontuário Central

Ao clicar em qualquer paciente na lista, você abre a **Ficha Completa do Paciente**. Nesta tela você tem uma visão panorâmica:

- **Cabeçalho com Dados Vitais**: Nome, Registro OHB, idade, telefone, convênio e barra de progresso do tratamento (ex: `12 de 20 sessões realizadas - 60% concluído`).
- **Botões de Ação Rápida no Topo**:
  - **`Editar Cadastro`**: Permite corrigir telefones, endereço ou dados clínicos.
  - **`+ Nova Sessão Hiperbárica`**: Abre a tela para a equipe de enfermagem registrar o atendimento de hoje.
  - **`+ Novo Agendamento`**: Marca novas datas para o paciente vir à clínica.
  - **`Escanear Documento`**: Tira foto de novo exame, laudo ou foto da ferida.
  - **`Imprimir Ficha`**: Gera o papel timbrado para assinatura manual.
- **Abas Internas**:
  - **Histórico de Sessões**: Lista todas as sessões já realizadas com data, pressão em ATA, sinais vitais e evolução.
  - **Documentos & Fotos de Feridas**: Galeria visual com todas as fotos anexadas.
  - **Agendamentos**: Próximas datas agendadas para o paciente.
  - **Dados Cadastrais**: Exibição completa de endereço, contatos e anamnese.

---

## 6. Como Registrar uma Sessão Hiperbárica (Enfermagem & Técnicos)

Esta é a rotina mais importante da equipe assistencial dentro da clínica. O preenchimento garante a segurança física do paciente dentro da câmara pressurizada e cumpre as normas do Conselho Federal de Medicina (CFM 1.457/95).

### 6.1 Passo a Passo do Registro da Sessão
1. Abra a ficha do paciente e clique em **`+ Nova Sessão Hiperbárica`**.
2. **Número da Sessão**: O sistema já calcula automaticamente (se o paciente já fez 4 sessões, ele sugere a Sessão 5).
3. **Data e Horário**: Já vêm com a data e hora atuais.
4. **Pressão em ATA (Obrigatório)**: Sem valor padrão pré-selecionado por segurança médica. O operador deve selecionar obrigatoriamente a pressão exata prescrita pelo médico hiperbarista (ex: `1.8`, `2.0`, `2.2`, `2.4`, `2.5` ou `2.8 ATA`) antes de salvar no prontuário.
5. **Duração em Minutos**: Habitualmente **90 minutos** (ou 120 minutos conforme protocolo).

---

### 6.2 Checklist de Segurança da Câmara (Obrigatório)
Antes de fechar a porta da câmara, a enfermagem deve marcar os itens de checagem. Isso previne faíscas estáticas (risco grave em ambiente com 100% de oxigênio) e barotrauma:

- [x] **Conferência de Nome e Pulseira**: Confirmação verbal com o paciente.
- [x] **Vestimenta 100% Algodão**: Paciente sem roupas sintéticas (lycra, poliéster, nylon).
- [x] **Uso de Pulseira Antiestática**: Aterramento estático conectado.
- [x] **Sem Objetos Metálicos ou Eletrônicos**: Proibido entrar com celular, relógio, chaves, moedas, joias, isqueiro ou fósforos.
- [x] **Sem Pomadas ou Cosméticos Oleosos**: Rosto e corpo livres de vaselina, óleos minerais, esmaltes frescos ou maquiagem.
- [x] **Retirada de Próteses**: Remoção de dentaduras móveis, aparelhos auditivos e lentes de contato.
- [x] **Alívio de Sondas e Drenos**: Sonda vesical desobstruída e aberta (evita expansão de gases).
- [x] **Triagem de Gripe / Resfriado**: Paciente sem congestão nasal grave que impeça a equalização dos ouvidos.

---

### 6.3 Sinais Vitais, SAE e Evolução
1. **Pressão Arterial (PA)**: Medida antes da entrada (ex: `120/80 mmHg`).
2. **Glicemia Capilar (HGT)**: **Obrigatório para diabéticos!** O oxigênio hiperbárico consome glicose. Se a glicemia estiver abaixo de 100 mg/dL, o paciente deve receber uma colação antes de entrar na câmara para evitar hipoglicemia.
3. **Diagnósticos de Enfermagem (SAE)**:
   - Avalie itens como: *Dor, Integridade da Pele/Ferida, Risco de Queda, Ansiedade, Descontrole Glicêmico*.
   - Use os botões rápidos:
     - **PR** = Presente;
     - **ME** = Melhorado;
     - **PI** = Piorado;
     - **A** = Ausente;
     - **R** = Resolvido.
4. **Evolução Diária de Enfermagem**: Campo de texto livre para registrar intercorrências, queixas otológicas na compressão, descompressão e resposta do paciente.
5. **Foto da Folha Física ou da Ferida**: No final do formulário, há o botão **`Anexar com Câmera`** caso queira fotografar a ferida logo após o curativo ou a folha de papel assinada.
6. Clique em **`Salvar Sessão`**.

---

## 7. Como Fazer Agendamentos e Avisar Pacientes por WhatsApp

Acesse a aba **`Agendamentos`** na barra superior.

### 7.1 Agendar 1 Sessão Avulsa
1. Clique no botão **`+ Agendar`** (ou no topo da tela).
2. Escolha o **Paciente** na lista suspensa.
3. Escolha a **Data** e o **Horário** (ex: `08:30`).
4. Selecione obrigatoriamente a **Pressão de Trabalho (ATA)** prescrita pelo médico (não há valor padrão pré-selecionado) e preencha as observações (ex: *curativo será feito após a sessão*).
5. Clique em **`Salvar Agendamento`**.

---

### 7.2 Agendar Pacote Completo (10 ou 20 sessões em 1 clique)
Como o tratamento de oxigenoterapia hiperbárica costuma ser diário, você não precisa agendar dia por dia!
1. Na tela de agendamentos, clique no botão **`Agendar Pacote de Sessões`**.
2. Selecione o paciente.
3. Escolha quantas sessões serão (ex: `10` ou `20` sessões).
4. Escolha a **Data de Início** e o **Horário habitual** (ex: todo dia às `09:00`).
5. O sistema calcula automaticamente os próximos dias úteis (Segunda a Sexta-feira), pulando finais de semana!
6. Clique em **`Gerar Pacote de Agendamentos`** e a grade do mês inteiro estará preenchida!

---

### 7.3 Enviar Lembrete no WhatsApp do Paciente
Na lista de agendamentos, cada linha possui ferramentas de comunicação:
1. Clique no ícone verde do **WhatsApp** ao lado do agendamento.
2. O sistema abre o WhatsApp Web ou o aplicativo do WhatsApp no celular/tablet com a mensagem pronta:
   > *"Olá, [Nome do Paciente]! Confirmamos sua Sessão de Oxigenoterapia Hiperbárica na Clínica OHB no dia [Data] às [Horário]. Lembre-se de vir com roupas 100% algodão e sem joias ou metais. Em caso de dúvidas, responda esta mensagem."*
3. Basta apertar enviar! Não precisa digitar nem salvar o número na agenda do telefone.

---

### 7.4 Alterar Status de Presença e Imprimir Grade
- **Mudar Status**: Com um simples clique no botão de status, você altera entre:
  - 🟡 **Agendado**;
  - 🔵 **Confirmado** (paciente avisou que vai comparecer);
  - 🟢 **Realizado** (já fez a sessão);
  - 🔴 **Cancelado** (faltou ou desmarcou).
- **Adicionar ao Google Agenda / Outlook**: Há botões de 1 clique para baixar o arquivo de calendário (`.ics`) ou sincronizar no Google Calendar.
- **Imprimir Grade de Horários**: Clique no botão com ícone de **Impressora** para imprimir a folha de horários e entregar ao paciente ou acompanhante na recepção.

---

## 8. Cofre Digital e Scanner com Câmera (Fotos de Feridas e Documentos Antigos)

Acesse a aba **`Prontuários Antigos`** (ou Acervo Digital). Este módulo serve para guardar:
1. Folhas de papel antigas escaneadas;
2. Fotos da ferida/lesão para acompanhar a cicatrização semana a semana;
3. Laudos de exames de sangue, raio-X, ressonância ou biópsia.

---

### 8.1 Tirar Fotos ou Escanear Fichas com a Câmera
1. Clique no botão verde **`Escanear com Câmera`** (ou no topo da página).
2. O sistema ativará a câmera do seu tablet, celular ou webcam do computador.
3. Se o dispositivo tiver câmera traseira e frontal, use o botão **`Trocar Câmera`**. Se estiver no celular/tablet, você também pode ligar a **Lanterna** para iluminar a folha de papel ou a ferida.
4. Aponte a câmera para o documento ou ferida e clique no botão circular azul **`Capturar Foto`**.
5. Você pode tirar várias fotos seguidas (Página 1, Página 2, Página 3...) para documentos de várias folhas.

---

### 8.2 Escolhendo os Filtros Certos (Texto P&B vs Ferida Colorida)
Na barra lateral do scanner, você pode escolher o filtro visual ideal:
- 📄 **P&B Prontuário (Preto e Branco)**: O melhor para folhas de papel com letras escritas à caneta ou impressas. Remove o fundo amarelado do papel, deixa o texto com alto contraste preto e faz o arquivo ficar super leve (não consome memória do computador).
- 🎨 **Foto Colorida Real**: **Use sempre para feridas e curativos!** Mantém as cores vivas e reais do tecido de granulação, esfacelos e bordas da lesão para avaliação médica.
- 🌫️ **Tons de Cinza**: Ideal para formulários com carimbos e assinaturas.
- 🔄 **Girar 90°**: Se a folha ficou deitada ou de ponta cabeça, clique no botão de rotação até ficar na posição correta de leitura.

---

### 8.3 Consultar e Ampliar Fotos Anexadas
Na tela do acervo ou na ficha do paciente:
1. Clique em cima de qualquer foto ou documento para abrir a **Tela Cheia (Lightbox)**.
2. Use os botões **`+` (Zoom In)** e **`-` (Zoom Out)** para ampliar e ver detalhes mínimos da cicatrização ou letras pequenas de um exame.
3. Se precisar salvar a imagem no seu computador, clique no botão **`Download`**.

---

## 9. Como Consultar o Catálogo de Doenças (CID-11 e CID-10)

No topo da tela, clique no botão **`Consultar CID-11`**.

1. **O que é**: É o dicionário de medicina hiperbárica integrado ao sistema.
2. **Como pesquisar**: Digite o nome da doença, sintomas ou código:
   - Exemplo: `pe diabetico` ➡️ Encontra o código novo da OMS (CID-11) e o código tradicional (CID-10 `E11.5`).
   - Exemplo: `osteomielite` ➡️ Mostra as indicações para infecções ósseas refratárias.
   - Exemplo: `radiodermite` ou `cistite actinica` ➡️ Mostra as lesões causadas por radioterapia.
3. **Selo de Cobertura Rol ANS**: O sistema exibe um selo verde quando a doença possui **cobertura obrigatória pelos planos de saúde** segundo as diretrizes da Agência Nacional de Saúde Suplementar (ANS) e da Sociedade Brasileira de Medicina Hiperbárica (SBMH).
4. **Protocolo Recomendado**: Cada cartão mostra a pressão sugerida (ex: `2.4 ATA`) e a média de sessões necessárias para o tratamento daquela patologia.
5. **Copiar Códigos**: Há botões de 1 clique para copiar o código CID-11 ou CID-10 e colar em laudos ou relatórios.

---

## 10. Painel Financeiro e Faturamento de Convênios

Acesse a aba **`Financeiro & Convênios`** na barra superior.

### 10.1 Indicadores no Topo da Tela (KPIs)
- **Faturamento Estimado**: Valor total gerado pelas sessões hiperbáricas cadastradas.
- **Sessões Realizadas**: Quantidade total de atendimentos executados na câmara.
- **Guias Pendentes de Autorização**: Sessões que precisam de conferência com a operadora do convênio.
- **Ticket Médio**: Valor médio cobrado por sessão hiperbárica.

### 10.2 Tabela de Guias e Código TUSS
- Toda sessão hiperbárica é padronizada sob o código oficial **TUSS 20101202** (*Oxigenoterapia Hiperbárica em câmara por sessão*).
- Você pode filtrar por convênio (ex: *Bradesco, SulAmérica, Amil, Unimed ou Particular*).
- Status da Guia: *Autorizada, Em Análise, Faturada, Paga ou Glosada*.

### 10.3 Exportar Relatório para Excel / Contabilidade
- Clique no botão **`Exportar CSV / Excel`** no canto superior da tabela.
- O sistema gera um arquivo pronto para ser aberto no Microsoft Excel com nome dos pacientes, convênio, data da sessão, número da guia TISS e valores para fechamento do mês.

---

## 11. Impressão de Fichas e Prontuários Oficiais

Na ficha de qualquer paciente, clique no botão **`Imprimir Ficha`**.

Você pode escolher entre 3 modelos oficiais:
1. **Ficha de Tratamento Clínico**: Contém o cabeçalho oficial da clínica, dados cadastrais do paciente, diagnóstico, médico responsável e a lista de sessões realizadas com pressão ATA e evolução.
2. **Ficha de Enfermagem**: Focada nos sinais vitais (PA, glicemia) e checklist de segurança da câmara.
3. **Grade de Agendamentos**: Lista de dias e horários para entregar em mãos ao paciente.

*Ao abrir a tela de visualização, basta clicar no botão azul **`Imprimir`** para mandar direto para a impressora física ou salvar como arquivo PDF no seu computador.*

---

## 12. Dicas e Resolução de Dúvidas do Dia a Dia

### "O que fazer se o paciente faltar à sessão?"
Vá na aba **`Agendamentos`**, localize o horário do paciente e clique no status para mudar para **`Cancelado`**. Em seguida, clique em **`+ Agendar`** para remarcar para um novo dia.

### "Posso usar o sistema no tablet perto da câmara?"
**Sim!** O sistema foi desenhado especialmente para telas de tablet. Toda a barra de ferramentas e os botões de checklist são grandes e fáceis de tocar com os dedos. O tablet pode ser conectado via Wi-Fi na rede interna da clínica.

### "Se a internet cair, o sistema para de funcionar?"
O sistema possui armazenamento local seguro no próprio navegador e no servidor da clínica. Ele continua operando para consultas e registros sem interrupção.

### "Como alterar o tamanho da tela?"
Na barra superior há três opções de tamanho de tela:
- **Grande**: Aproveita monitores modernos com visualização ampla.
- **100%**: Preenche a tela de ponta a ponta.
- **Compacto**: Centraliza a tela para monitores menores ou notebooks.

---

---

# ⚙️ PARTE 2: GUIA TÉCNICO E ARQUITETURA DO SISTEMA (TI & DESENVOLVEDORES)

---

## 13. Visão Geral da Arquitetura

O sistema adota uma arquitetura em camadas de alta performance, projetada para conformidade com a LGPD e normas do Conselho Federal de Medicina (CFM 2.299/2021):

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (React 19)                  │
│   Vite + TypeScript + TailwindCSS + Lucide Icons       │
│   IndexedDB (Cofre Local) + HTML5 Camera API           │
└───────────────────────────┬────────────────────────────┘
                            │ Chamadas HTTP REST (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   BACKEND (Quarkus 3)                  │
│   Java 21 / Quarkus 3.39.2 + Panache Hibernate ORM     │
│   Segurança RBAC + OpenAPI / Swagger UI                │
└─────────────┬────────────────────────────┬─────────────┘
              │ JDBC                       │ AWS SDK v2
              ▼                            ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│   BANCO DE DADOS LOCAL    │ │     ARMAZENAMENTO S3     │
│  H2 Database (Dev/Offline)│ │  Bucket AWS S3 Seguro    │
│  PostgreSQL (Produção)    │ │  Presigned Upload URLs   │
└───────────────────────────┘ └──────────────────────────┘
```

---

## 14. Como Rodar o Sistema Localmente

### 14.1 Pré-requisitos
- **Java 21 LTS** ou superior instalado (`java -version`).
- **Node.js 18+** e **npm** instalados (`node -v` e `npm -v`).

### 14.2 Passo 1: Executando o Backend (Quarkus)
Abra o terminal na pasta do projeto e execute:
```powershell
cd backend
.\mvnw.cmd quarkus:dev
```
*O Quarkus inicializará em modo de desenvolvimento com Live Reload ativado na porta 8080.*
- **API REST**: `http://localhost:8080`
- **Swagger UI interativo**: `http://localhost:8080/q/swagger-ui`
- **Console do Banco H2**: `http://localhost:8082`

### 14.3 Passo 2: Executando o Frontend (Vite & React)
Abra um segundo terminal na raiz do projeto:
```powershell
npm install
npm run dev
```
- **Aplicação Web**: `http://localhost:3000` (ou porta informada pelo Vite).
- **Acesso via Tablet na Rede Local**: `http://IP_DA_MAQUINA:3000`

---

## 15. Banco de Dados Local (H2 & PostgreSQL)

O arquivo de configuração do backend encontra-se em:  
[`backend/src/main/resources/application.properties`](file:///c:/Workspace/Hiperbarica/camara-hiperbarica/backend/src/main/resources/application.properties)

### Ambientes:
1. **Desenvolvimento (`%dev`)**:
   - Utiliza **H2 Database embutido em arquivo**: `jdbc:h2:file:./data/clinica_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL`.
   - Os dados persistem na pasta `backend/data/` mesmo ao reiniciar o servidor.
2. **Produção (`%prod`)**:
   - Conexão nativa com **PostgreSQL** configurada via variáveis de ambiente (`DB_URL`, `DB_USER`, `DB_PASSWORD`).
3. **Acesso ao H2 Console**:
   - URL: `http://localhost:8082`
   - JDBC URL: `jdbc:h2:file:./data/clinica_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL`
   - Usuário: `sa` | Senha: `sa`

---

## 16. Auditoria de Dados e Exclusão Lógica (Soft Delete)

Por exigência legal de prontuários médicos (CFM), nenhum registro de paciente ou atendimento clínico é destruído fisicamente do banco de dados.

Todas as entidades (`Patient`, `HyperbaricSession`, `Appointment`, `DigitalizedDocument`) contam com campos de temporalidade:
- **`created_at`**: Timestamp gerado automaticamente via `@PrePersist`.
- **`updated_at`**: Timestamp atualizado a cada alteração via `@PreUpdate`.
- **`deleted_at`**: Timestamp de exclusão lógica (*Soft Delete*).

### Como funciona:
- Ao executar `DELETE /api/patients/{id}`, o registro **não é apagado**. O sistema apenas preenche `deleted_at = NOW()`.
- Todas as consultas `GET /api/patients` filtram automaticamente os registros ativos (`WHERE deleted_at IS NULL`).
- Caso um paciente excluído seja recadastrado com o mesmo CPF ou Registro OHB, o backend reativa o registro existente (`deleted_at = NULL`) e atualiza os dados (*Upsert Inteligente*).

---

## 17. Armazenamento em Nuvem (AWS S3 Presigned URLs)

O armazenamento de fotos pesadas de lesões e prontuários digitalizados utiliza URLs Pré-Assinadas (*Presigned URLs*) do Amazon S3:

1. O Frontend solicita autorização de upload ao backend via `POST /api/documents/presigned-upload-url`.
2. O Backend gera uma URL temporária com permissão restrita de escrita para o bucket S3 configurado.
3. O Frontend faz o upload binário direto do navegador para a AWS, sem transitar os megabytes pelo servidor da aplicação (economizando memória e CPU).
4. No ambiente offline ou local sem AWS configurada, os arquivos são guardados de forma transparente no **IndexedDB** do navegador com otimização automática de compressão (`src/utils/imageOptimizer.ts`).

---

## 18. Endpoints da API REST (Quarkus)

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/patients` | Lista pacientes ativos (suporta filtro `?search=termo`) |
| `POST` | `/api/patients` | Cria novo paciente ou atualiza paciente existente (*Upsert*) |
| `GET` | `/api/patients/{id}` | Retorna dados completos do paciente pelo UUID |
| `PUT` | `/api/patients/{id}` | Atualiza cadastro do paciente |
| `DELETE` | `/api/patients/{id}` | Exclusão lógica (*Soft Delete*) do paciente |
| `GET` | `/api/sessions` | Lista sessões hiperbáricas (suporta `?patientId={id}`) |
| `POST` | `/api/sessions` | Registra nova sessão com checklist e numeração automática |
| `DELETE` | `/api/sessions/{id}` | Exclusão lógica de sessão |
| `GET` | `/api/appointments` | Lista agendamentos |
| `POST` | `/api/appointments` | Cria ou atualiza agendamento de consulta/sessão |
| `DELETE` | `/api/appointments/{id}` | Cancela e remove agendamento |
| `GET` | `/api/cids` | Consulta catálogo de patologias CID-11 e CID-10 |
| `POST` | `/api/documents/presigned-upload-url` | Gera URL de upload para o AWS S3 |

---

## 19. Coleção Postman e Testes de API

Na raiz do projeto está disponível o arquivo:  
[`clinica_ohb_postman_collection.json`](file:///c:/Workspace/Hiperbarica/camara-hiperbarica/clinica_ohb_postman_collection.json)

- **Importação**: Abra o Postman ou Insomnia e importe o arquivo diretamente.
- **Variáveis Dinâmicas**: A coleção possui scripts automáticos que salvam os identificadores gerados (`{{patientId}}`, `{{sessionId}}`, `{{appointmentId}}`) para permitir testes em cadeia sequenciais sem precisar copiar e colar UUIDs manualmente.

---

## 20. Testes Automatizados no Frontend

O projeto possui suíte completa de testes unitários e de integração utilizando **Vitest** e **Testing Library**:

```powershell
npm test
```
*Cobertura inclui: validação matemática de CPF, validação rigorosa de e-mails, cálculo de idade, preenchimento automático por CEP, busca de CID-11, matriz de permissões RBAC e serviços de armazenamento.*

---

> 🏥 **Sistema de Gestão Clínica de Medicina Hiperbárica (OHB)**  
> *Documentação atualizada em Outubro de 2026.*
