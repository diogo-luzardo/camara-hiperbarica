# 🏥 Sistema da Clínica de Medicina Hiperbárica (OHB)

Aplicação web e backend para gestão clínica de medicina e oxigenoterapia hiperbárica, prontuário eletrônico de pacientes, protocolo de segurança da câmara hiperbárica (enfermagem), agendamentos e cofre digital com AWS S3.

## 📄 Documentação & Manual do Operador
Para ler o manual passo a passo de como operar o sistema (cadastro, câmara, agendamento, scanner e faturamento) e a arquitetura técnica, consulte:
👉 **[DOCUMENTACAO.md](DOCUMENTACAO.md)**

## 🚀 Início Rápido

### Backend (Quarkus + H2 Local / PostgreSQL)
```bash
cd backend
./mvnw quarkus:dev
```
- API REST: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/q/swagger-ui`
- H2 Console: `http://localhost:8082`

### 📦 Coleção do Postman (Testes de API com 1-Click)
- Importe o arquivo **[`clinica_ohb_postman_collection.json`](clinica_ohb_postman_collection.json)** diretamente no Postman ou Insomnia.
- A coleção possui variáveis automáticas (`{{patientId}}`, `{{sessionId}}`, `{{appointmentId}}`) que são salvas dinamicamente ao criar registros!

### Frontend (React + Vite)
```bash
npm install
npm run dev
```
- Interface Web: `http://localhost:3000`
