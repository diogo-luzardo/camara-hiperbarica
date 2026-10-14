// Script to generate high-fidelity 50 patients, sessions, appointments and docs for Hyperbaric Clinic
const fs = require('fs');
const path = require('path');

const DOCTORS = [
  'Dr. Carlos Henrique Esteves (CRM 62.139)',
  'Dra. Mariana Vasconcelos (CRM 74.820)',
  'Dr. Roberto Albuquerque (CRM 55.431)',
  'Dra. Fernanda Takahashi (CRM 91.204)'
];

const NURSES = [
  'Enf. Renan Matos (COREN-SP 214.901)',
  'Enf. Camila Duarte (COREN-SP 189.340)',
  'Enf. Thiago Sampaio (COREN-SP 230.112)',
  'Enf. Beatriz Nogueira (COREN-SP 245.890)'
];

const TECHNICIANS = [
  'Téc. Lucas Silva',
  'Téc. Amanda Prado',
  'Téc. Marcos Vinicius',
  'Téc. Juliana Prado'
];

const PATIENT_PROFILES = [
  {
    nome: 'Sebastião Pereira dos Santos',
    sexo: 'M',
    idade: 64,
    dataNasc: '1962-04-18',
    convenio: 'Bradesco Saúde',
    plano: 'Top Nacional',
    cid10: 'E11.5',
    diagnostico: 'Pé Diabético Complicado com Úlcera e Osteomielite Refratária',
    bairro: 'Jabaquara',
    endereco: 'Rua das Pitombeiras, 175',
    previsto: 30,
    realizados: 18,
    ata: 2.4
  },
  {
    nome: 'Helena Ribeiro de Castro',
    sexo: 'F',
    idade: 51,
    dataNasc: '1974-11-23',
    convenio: 'SulAmérica',
    plano: 'Especial 100',
    cid10: 'M72.6',
    diagnostico: 'Fascite Necrotizante Pós-Debridamento em Membro Inferior',
    bairro: 'Planalto Paulista',
    endereco: 'Avenida Indianópolis, 1240',
    previsto: 20,
    realizados: 14,
    ata: 2.4
  },
  {
    nome: 'Benedito da Silva Moreira',
    sexo: 'M',
    idade: 72,
    dataNasc: '1954-08-12',
    convenio: 'Prevent Senior',
    plano: 'Master 500',
    cid10: 'I83.0',
    diagnostico: 'Úlcera Venosa Crônica de Estase em Terço Inferior de Perna E',
    bairro: 'Ipiranga',
    endereco: 'Rua Silva Bueno, 890',
    previsto: 20,
    realizados: 20, // Concluído
    ata: 2.0
  },
  {
    nome: 'Maria de Fátima Alencar',
    sexo: 'F',
    idade: 68,
    dataNasc: '1958-03-30',
    convenio: 'Unimed',
    plano: 'Central Nacional Especial',
    cid10: 'T66',
    diagnostico: 'Cistite Actínica Hemorrágica Pós-Radioterapia Pélvica',
    bairro: 'Vila Mariana',
    endereco: 'Rua Domingos de Morais, 2150',
    previsto: 30,
    realizados: 22,
    ata: 2.4
  },
  {
    nome: 'Antônio Carlos Guimarães',
    sexo: 'M',
    idade: 59,
    dataNasc: '1967-07-04',
    convenio: 'Amil',
    plano: 'Amil One S2500',
    cid10: 'M86.6',
    diagnostico: 'Osteomielite Crônica Refratária em Fêmur Direito',
    bairro: 'Moema',
    endereco: 'Avenida Moema, 345',
    previsto: 30,
    realizados: 8,
    ata: 2.4
  },
  {
    nome: 'Cleide Regina Vasconcelos',
    sexo: 'F',
    idade: 45,
    dataNasc: '1981-01-15',
    convenio: 'Particular',
    plano: 'Sessões Particulares Avulsas',
    cid10: 'T81.3',
    diagnostico: 'Deiscência de Ferida Operatória com Isquemia de Retalho Abdominal',
    bairro: 'Jardins',
    endereco: 'Alameda Lorena, 1620',
    previsto: 15,
    realizados: 7,
    ata: 2.4
  },
  {
    nome: 'Geraldo Magela Fontes',
    sexo: 'M',
    idade: 79,
    dataNasc: '1947-09-20',
    convenio: 'NotreDame Intermédica',
    plano: 'Advance 600',
    cid10: 'E11.5',
    diagnostico: 'Úlcera Neuroisquêmica em Maléolo Externo Esquerdo',
    bairro: 'Santo Amaro',
    endereco: 'Rua Amador Bueno, 412',
    previsto: 30,
    realizados: 30, // Concluído
    ata: 2.4
  },
  {
    nome: 'Aparecida Donizete Lima',
    sexo: 'F',
    idade: 62,
    dataNasc: '1964-06-11',
    convenio: 'Porto Seguro Saúde',
    plano: 'Ouro Mais',
    cid10: 'T66',
    diagnostico: 'Osteorradionecrose Mandibular Pós-Tratamento Neoplásico',
    bairro: 'Saúde',
    endereco: 'Avenida Bosque da Saúde, 780',
    previsto: 40,
    realizados: 25,
    ata: 2.4
  },
  {
    nome: 'Lucas Vinicius Silveira',
    sexo: 'M',
    idade: 28,
    dataNasc: '1998-05-19',
    convenio: 'Bradesco Saúde',
    plano: 'Saúde Plus',
    cid10: 'T79.6',
    diagnostico: 'Isquemia Traumática Aguda pós-Acidente Motociclístico com Enxerto',
    bairro: 'Pinheiros',
    endereco: 'Rua Teodoro Sampaio, 1420',
    previsto: 15,
    realizados: 12,
    ata: 2.8
  },
  {
    nome: 'Dirce Mendonça de Paula',
    sexo: 'F',
    idade: 83,
    dataNasc: '1943-12-02',
    convenio: 'Prevent Senior',
    plano: 'Premium 1000',
    cid10: 'L98.4',
    diagnostico: 'Lesão por Pressão Sacral Estágio IV com Exposição Óssea',
    bairro: 'Vila Clementino',
    endereco: 'Rua Sena Madureira, 980',
    previsto: 30,
    realizados: 19,
    ata: 2.0
  },
  {
    nome: 'Valter Rodrigues de Souza',
    sexo: 'M',
    idade: 61,
    dataNasc: '1965-02-28',
    convenio: 'SulAmérica',
    plano: 'Clássico',
    cid10: 'M72.6',
    diagnostico: 'Síndrome de Fournier em Fase de Granulação Pós-Debridamento',
    bairro: 'Campo Belo',
    endereco: 'Rua Vieira de Morais, 540',
    previsto: 20,
    realizados: 20, // Concluído
    ata: 2.4
  },
  {
    nome: 'Luciana Pacheco Barreto',
    sexo: 'F',
    idade: 39,
    dataNasc: '1987-10-14',
    convenio: 'Care Plus',
    plano: 'Master I',
    cid10: 'T86.8',
    diagnostico: 'Sofrimento de Retalho Microcirúrgico Cutâneo em Mama Esquerda',
    bairro: 'Itaim Bibi',
    endereco: 'Rua Joaquim Floriano, 820',
    previsto: 10,
    realizados: 4,
    ata: 2.4
  },
  {
    nome: 'João Batista da Conceição',
    sexo: 'M',
    idade: 67,
    dataNasc: '1959-05-08',
    convenio: 'Unimed',
    plano: 'Unimed Fesp Estilo',
    cid10: 'T87.4',
    diagnostico: 'Infecção e Necrose Secundária em Coto de Amputação Transtibial',
    bairro: 'Cursino',
    endereco: 'Avenida do Cursino, 1650',
    previsto: 25,
    realizados: 11,
    ata: 2.4
  },
  {
    nome: 'Tânia Regina Farias',
    sexo: 'F',
    idade: 56,
    dataNasc: '1970-08-25',
    convenio: 'Amil',
    plano: 'Amil S750',
    cid10: 'I83.0',
    diagnostico: 'Úlcera Venosa Recidivante com Lipodermatoesclerose',
    bairro: 'Mirandópolis',
    endereco: 'Praça Santa Rita de Cássia, 45',
    previsto: 20,
    realizados: 6,
    ata: 2.0
  },
  {
    nome: 'Francisco de Assis Prado',
    sexo: 'M',
    idade: 75,
    dataNasc: '1951-03-17',
    convenio: 'Particular',
    plano: 'Particular Integral',
    cid10: 'E11.5',
    diagnostico: 'Pé Diabético com Mal Perfurante Plantar e Celulite Adjacente',
    bairro: 'Paraíso',
    endereco: 'Rua Abílio Soares, 600',
    previsto: 20,
    realizados: 2, // Recém iniciado
    ata: 2.4
  },
  {
    nome: 'Beatriz Martins Coimbra',
    sexo: 'F',
    idade: 49,
    dataNasc: '1977-11-09',
    convenio: 'Bradesco Saúde',
    plano: 'Top Nacional',
    cid10: 'T66',
    diagnostico: 'Retite Actínica com Sangramento Retal Pós-Radioterapia Ginecológica',
    bairro: 'Bela Vista',
    endereco: 'Rua Treze de Maio, 1020',
    previsto: 30,
    realizados: 16,
    ata: 2.4
  },
  {
    nome: 'Nelson Kazuo Tanaka',
    sexo: 'M',
    idade: 66,
    dataNasc: '1960-06-22',
    convenio: 'Omint',
    plano: 'Corporate C19',
    cid10: 'T81.4',
    diagnostico: 'Infecção Profunda de Sítio Cirúrgico com Exposição de Prótese de Quadril',
    bairro: 'Liberdade',
    endereco: 'Rua Galvão Bueno, 710',
    previsto: 30,
    realizados: 24,
    ata: 2.4
  },
  {
    nome: 'Sueli Mara de Oliveira',
    sexo: 'F',
    idade: 58,
    dataNasc: '1968-04-03',
    convenio: 'NotreDame Intermédica',
    plano: 'Smart 500',
    cid10: 'E11.5',
    diagnostico: 'Pé Diabético Isquêmico com Necrose Seca em 5º Pododáctilo D',
    bairro: 'Sacomã',
    endereco: 'Rua Bom Pastor, 2100',
    previsto: 25,
    realizados: 9,
    ata: 2.4
  },
  {
    nome: 'Cláudio Roberto Peixoto',
    sexo: 'M',
    idade: 53,
    dataNasc: '1973-09-15',
    convenio: 'SulAmérica',
    plano: 'Especial 100',
    cid10: 'S81.8',
    diagnostico: 'Esmagamento Traumático de Pé Direito com Síndrome Isquêmica Revascularizada',
    bairro: 'Vila Mascote',
    endereco: 'Avenida Vereador João de Luca, 450',
    previsto: 20,
    realizados: 20, // Concluído
    ata: 2.8
  },
  {
    nome: 'Neuza Maria Guimarães',
    sexo: 'F',
    idade: 71,
    dataNasc: '1955-01-28',
    convenio: 'Prevent Senior',
    plano: 'Master',
    cid10: 'L98.4',
    diagnostico: 'Úlcera de Decúbito Trocantérica Direita Grau III refratária',
    bairro: 'Aclimação',
    endereco: 'Rua Pires da Mota, 520',
    previsto: 20,
    realizados: 15,
    ata: 2.0
  },
  {
    nome: 'Paulo César Antunes',
    sexo: 'M',
    idade: 48,
    dataNasc: '1978-07-12',
    convenio: 'Porto Seguro Saúde',
    plano: 'Prata',
    cid10: 'M86.6',
    diagnostico: 'Osteomielite Estafilocócica em Tíbia Esquerda Pós-Fratura Exposta',
    bairro: 'Brooklin',
    endereco: 'Rua Nova York, 380',
    previsto: 30,
    realizados: 17,
    ata: 2.4
  },
  {
    nome: 'Rosana Albuquerque Maia',
    sexo: 'F',
    idade: 52,
    dataNasc: '1974-03-18',
    convenio: 'Unimed',
    plano: 'Seguros Unimed Superior',
    cid10: 'T81.3',
    diagnostico: 'Deiscência de Laparotomia com Fístula Enterocutânea de Baixo Débito',
    bairro: 'Chácara Klabin',
    endereco: 'Rua Vergueiro, 3500',
    previsto: 20,
    realizados: 13,
    ata: 2.4
  },
  {
    nome: 'Eduardo Henrique Nogueira',
    sexo: 'M',
    idade: 37,
    dataNasc: '1989-12-05',
    convenio: 'Bradesco Saúde',
    plano: 'Top Nacional',
    cid10: 'M72.6',
    diagnostico: 'Fascite Necrotizante de Coxa e Períneo Secundária a Abscesso Isquiorretal',
    bairro: 'Perdizes',
    endereco: 'Rua Cardoso de Almeida, 940',
    previsto: 20,
    realizados: 5,
    ata: 2.4
  },
  {
    nome: 'Iracema Toledo Pires',
    sexo: 'F',
    idade: 80,
    dataNasc: '1946-08-31',
    convenio: 'Prevent Senior',
    plano: 'Premium',
    cid10: 'I83.0',
    diagnostico: 'Úlcera Venosa Extensa Circunferencial em Perna Direita',
    bairro: 'Saúde',
    endereco: 'Rua Carneiro da Cunha, 620',
    previsto: 30,
    realizados: 30, // Concluído
    ata: 2.0
  },
  {
    nome: 'Marcelo Augusto Siqueira',
    sexo: 'M',
    idade: 43,
    dataNasc: '1983-05-24',
    convenio: 'Amil',
    plano: 'Amil One S1500',
    cid10: 'T86.8',
    diagnostico: 'Sofrimento Isquêmico de Retalho de Grande Dorsal Pós-Reconstrução',
    bairro: 'Vila Olímpia',
    endereco: 'Rua Funchal, 200',
    previsto: 10,
    realizados: 8,
    ata: 2.4
  },
  {
    nome: 'Denise Cristina Carvalho',
    sexo: 'F',
    idade: 65,
    dataNasc: '1961-09-07',
    convenio: 'Particular',
    plano: 'Particular',
    cid10: 'E11.5',
    diagnostico: 'Pé Diabético com Fascite Plantar e Celulite de Retropé',
    bairro: 'Moema',
    endereco: 'Avenida Pavão, 580',
    previsto: 20,
    realizados: 1, // Novo
    ata: 2.4
  },
  {
    nome: 'Osmar Ferreira da Costa',
    sexo: 'M',
    idade: 70,
    dataNasc: '1956-02-14',
    convenio: 'SulAmérica',
    plano: 'Exato',
    cid10: 'T66',
    diagnostico: 'Cistite Radíaca Hemorrágica Crônica Pós-Radioterapia de Próstata',
    bairro: 'Vila Mariana',
    endereco: 'Rua Loefgreen, 1530',
    previsto: 30,
    realizados: 19,
    ata: 2.4
  },
  {
    nome: 'Zilda Ramos de Carvalho',
    sexo: 'F',
    idade: 77,
    dataNasc: '1949-10-01',
    convenio: 'NotreDame Intermédica',
    plano: 'Advance 600',
    cid10: 'E11.5',
    diagnostico: 'Úlcera Diabética em Dorso de Pé E com Exposição de Tendão Extensor',
    bairro: 'Jabaquara',
    endereco: 'Rua George Corbisier, 880',
    previsto: 30,
    realizados: 26,
    ata: 2.4
  },
  {
    nome: 'Rogério Tadeu Cavalcanti',
    sexo: 'M',
    idade: 55,
    dataNasc: '1971-04-19',
    convenio: 'Bradesco Saúde',
    plano: 'Ideal',
    cid10: 'T81.4',
    diagnostico: 'Infecção Estafilocócica em Enxerto Ósseo Vascularizado de Fíbula',
    bairro: 'Santana',
    endereco: 'Rua Voluntários da Pátria, 1980',
    previsto: 25,
    realizados: 21,
    ata: 2.4
  },
  {
    nome: 'Marilene Gouveia Paes',
    sexo: 'F',
    idade: 63,
    dataNasc: '1963-07-27',
    convenio: 'Unimed',
    plano: 'Central Nacional',
    cid10: 'T66',
    diagnostico: 'Lesão Actínica de Parede Torácica com Necrose Cutânea Pós-Mastectomia',
    bairro: 'Jardim Paulista',
    endereco: 'Alameda Campinas, 1100',
    previsto: 30,
    realizados: 30, // Concluído
    ata: 2.4
  },
  {
    nome: 'Alexandre Bonfim de Abreu',
    sexo: 'M',
    idade: 34,
    dataNasc: '1992-08-16',
    convenio: 'Care Plus',
    plano: 'Master I',
    cid10: 'T79.6',
    diagnostico: 'Síndrome Compartimental Traumática em Antebraço D Pós-Queda de Altura',
    bairro: 'Morumbi',
    endereco: 'Avenida Giovanni Gronchi, 3200',
    previsto: 15,
    realizados: 11,
    ata: 2.8
  },
  {
    nome: 'Vera Lúcia Bittencourt',
    sexo: 'F',
    idade: 69,
    dataNasc: '1957-11-13',
    convenio: 'SulAmérica',
    plano: 'Especial 100',
    cid10: 'I83.0',
    diagnostico: 'Úlcera de Estase Venosa em Terço Médio de Perna D com Infecção Secundária',
    bairro: 'Granja Julieta',
    endereco: 'Rua Alexandre Dumas, 1500',
    previsto: 20,
    realizados: 18,
    ata: 2.0
  },
  {
    nome: 'Waldemar Pinheiro Neto',
    sexo: 'M',
    idade: 81,
    dataNasc: '1945-06-03',
    convenio: 'Prevent Senior',
    plano: 'Master',
    cid10: 'E11.5',
    diagnostico: 'Pé Diabético com Celulite e Osteomielite no 1º e 2º Raios Podálicos',
    bairro: 'Mirandópolis',
    endereco: 'Rua Luís Góis, 1200',
    previsto: 30,
    realizados: 4,
    ata: 2.4
  },
  {
    nome: 'Eunice Prado Medeiros',
    sexo: 'F',
    idade: 73,
    dataNasc: '1953-09-29',
    convenio: 'Bradesco Saúde',
    plano: 'Top Nacional',
    cid10: 'M86.6',
    diagnostico: 'Osteomielite Crônica em Mandíbula Refratária a Tratamento Conservador',
    bairro: 'Consolação',
    endereco: 'Rua Augusta, 1450',
    previsto: 30,
    realizados: 30, // Concluído
    ata: 2.4
  },
  {
    nome: 'Fábio Junqueira Brandão',
    sexo: 'M',
    idade: 46,
    dataNasc: '1980-03-08',
    convenio: 'Porto Seguro Saúde',
    plano: 'Ouro Mais',
    cid10: 'M72.6',
    diagnostico: 'Fascite Necrotizante de Parede Abdominal Secundária a Apendicite Perfurada',
    bairro: 'Tatuapé',
    endereco: 'Rua Coelho Lisboa, 480',
    previsto: 20,
    realizados: 16,
    ata: 2.4
  },
  {
    nome: 'Elisabete Rocha Fagundes',
    sexo: 'F',
    idade: 54,
    dataNasc: '1972-12-19',
    convenio: 'Amil',
    plano: 'Amil S450',
    cid10: 'T81.3',
    diagnostico: 'Deiscência de Parede com Exposição de Tela Cirúrgica de Polipropileno',
    bairro: 'Vila Madalena',
    endereco: 'Rua Harmonia, 310',
    previsto: 20,
    realizados: 7,
    ata: 2.4
  },
  {
    nome: 'Vicente de Paulo Barcellos',
    sexo: 'M',
    idade: 65,
    dataNasc: '1961-10-30',
    convenio: 'Particular',
    plano: 'Particular',
    cid10: 'E11.5',
    diagnostico: 'Úlcera Plantar em Pé Neuropático Diabético Charcot Ativo',
    bairro: 'Campo Limpo',
    endereco: 'Estrada do Campo Limpo, 2100',
    previsto: 30,
    realizados: 0, // Novo / Triagem
    ata: 2.4
  },
  {
    nome: 'Miriam Stela Vasconcelos',
    sexo: 'F',
    idade: 41,
    dataNasc: '1985-04-12',
    convenio: 'SulAmérica',
    plano: 'Especial 100',
    cid10: 'T86.8',
    diagnostico: 'Isquemia e Sofrimento de Enxerto Cutâneo em Coxa Esquerda pós-Queimadura',
    bairro: 'Alto de Pinheiros',
    endereco: 'Avenida Pedroso de Morais, 1800',
    previsto: 10,
    realizados: 10, // Concluído
    ata: 2.4
  },
  {
    nome: 'Rubens de Mattos Villela',
    sexo: 'M',
    idade: 69,
    dataNasc: '1957-01-22',
    convenio: 'Unimed',
    plano: 'Central Nacional',
    cid10: 'T66',
    diagnostico: 'Osteorradionecrose Mandibular com Fístula Extraoral',
    bairro: 'Higienópolis',
    endereco: 'Rua Maranhão, 600',
    previsto: 40,
    realizados: 28,
    ata: 2.4
  },
  {
    nome: 'Célia Regina Bordon',
    sexo: 'F',
    idade: 60,
    dataNasc: '1966-07-15',
    convenio: 'NotreDame Intermédica',
    plano: 'Advance 600',
    cid10: 'I83.0',
    diagnostico: 'Úlcera Venosa Crônica Infectada por Pseudomonas aeruginosa',
    bairro: 'Jabaquara',
    endereco: 'Rua dos Comerciários, 310',
    previsto: 20,
    realizados: 12,
    ata: 2.0
  },
  {
    nome: 'Dário Guimarães Rezende',
    sexo: 'M',
    idade: 58,
    dataNasc: '1968-08-14',
    convenio: 'Bradesco Saúde',
    plano: 'Top Nacional',
    cid10: 'T81.4',
    diagnostico: 'Infecção Profunda com Osteomielite pós-Osteossíntese de Fíbula',
    bairro: 'Saúde',
    endereco: 'Avenida Jabaquara, 1900',
    previsto: 25,
    realizados: 15,
    ata: 2.4
  },
  {
    nome: 'Glória Maria Fontoura',
    sexo: 'F',
    idade: 76,
    dataNasc: '1950-02-10',
    convenio: 'Prevent Senior',
    plano: 'Master',
    cid10: 'L98.4',
    diagnostico: 'Úlcera por Pressão Isquiática Bilateral Estágio IV',
    bairro: 'Vila Mariana',
    endereco: 'Rua Cubatão, 810',
    previsto: 30,
    realizados: 23,
    ata: 2.0
  },
  {
    nome: 'Hélio dos Santos Figueiredo',
    sexo: 'M',
    idade: 63,
    dataNasc: '1963-05-01',
    convenio: 'Amil',
    plano: 'Amil S750',
    cid10: 'E11.5',
    diagnostico: 'Pé Diabético Isquêmico com Amputação Prévia de Hálux e Deiscência',
    bairro: 'Moema',
    endereco: 'Alameda dos Maracatins, 1100',
    previsto: 30,
    realizados: 30, // Concluído
    ata: 2.4
  },
  {
    nome: 'Inês Aparecida Guimarães',
    sexo: 'F',
    idade: 57,
    dataNasc: '1969-09-19',
    convenio: 'Particular',
    plano: 'Particular',
    cid10: 'T66',
    diagnostico: 'Cistite Radíaca Hemorrágica Refratária com Hematúria Recorrente',
    bairro: 'Cerqueira César',
    endereco: 'Rua Oscar Freire, 1420',
    previsto: 25,
    realizados: 5,
    ata: 2.4
  },
  {
    nome: 'Jamil Salomão Kfouri',
    sexo: 'M',
    idade: 74,
    dataNasc: '1952-11-25',
    convenio: 'SulAmérica',
    plano: 'Especial 100',
    cid10: 'M86.6',
    diagnostico: 'Osteomielite Crônica de Calcâneo com Fístula Drenante',
    bairro: 'Jardins',
    endereco: 'Rua Bela Cintra, 2100',
    previsto: 30,
    realizados: 21,
    ata: 2.4
  },
  {
    nome: 'Kátia Cilene Morgado',
    sexo: 'F',
    idade: 47,
    dataNasc: '1979-03-05',
    convenio: 'Bradesco Saúde',
    plano: 'Top Nacional',
    cid10: 'T81.3',
    diagnostico: 'Deiscência de Ferida Perineal e Vaginal pós-Cirurgia Oncológica',
    bairro: 'Vila Nova Conceição',
    endereco: 'Rua Afonso Braz, 560',
    previsto: 20,
    realizados: 17,
    ata: 2.4
  },
  {
    nome: 'Laerte Silveira Bueno',
    sexo: 'M',
    idade: 52,
    dataNasc: '1974-06-18',
    convenio: 'Unimed',
    plano: 'Central Nacional Especial',
    cid10: 'S81.8',
    diagnostico: 'Lesão por Esmagamento de Pé com Necrose de Pele e Retalho Isquêmico',
    bairro: 'Penha',
    endereco: 'Avenida Penha de França, 720',
    previsto: 20,
    realizados: 20, // Concluído
    ata: 2.8
  },
  {
    nome: 'Marta Helena Gusmão',
    sexo: 'F',
    idade: 66,
    dataNasc: '1960-12-14',
    convenio: 'NotreDame Intermédica',
    plano: 'Smart 500',
    cid10: 'I83.0',
    diagnostico: 'Úlcera Venosa Maleolar Interna com Dermatofibrose Acentuada',
    bairro: 'Ipiranga',
    endereco: 'Rua Bom Pastor, 950',
    previsto: 20,
    realizados: 11,
    ata: 2.0
  },
  {
    nome: 'Otávio Mesquita Beltrão',
    sexo: 'M',
    idade: 68,
    dataNasc: '1958-10-09',
    convenio: 'Prevent Senior',
    plano: 'Master',
    cid10: 'E11.5',
    diagnostico: 'Pé Diabético com Osteomielite Subaguda de Metatarso D',
    bairro: 'Chácara Santo Antônio',
    endereco: 'Rua Alexandre Dumas, 850',
    previsto: 30,
    realizados: 2, // Recém iniciado
    ata: 2.4
  },
  {
    nome: 'Priscila Renata Valadares',
    sexo: 'F',
    idade: 36,
    dataNasc: '1990-07-21',
    convenio: 'Particular',
    plano: 'Particular',
    cid10: 'M72.6',
    diagnostico: 'Fascite Necrotizante Pós-Cesariana de Urgência com Debridamento Amplo',
    bairro: 'Moema',
    endereco: 'Avenida Ibirapuera, 2450',
    previsto: 15,
    realizados: 9,
    ata: 2.4
  }
];

function generateMockFile() {
  const patients = [];
  const sessions = [];
  const appointments = [];
  const documents = [];

  const baseToday = new Date('2026-10-14T08:00:00Z');

  PATIENT_PROFILES.forEach((profile, index) => {
    const idNum = index + 1;
    const patientId = `pat-${idNum}`;
    const registroOHB = `OHB-${1082 + index}`;
    const rh = `RH-${49200 + idNum}`;

    // Generate deterministic CPF
    const cpfBase = String(100000000 + idNum * 17923481).padStart(9, '0').slice(0, 9);
    const d1 = (idNum * 3 + 2) % 10;
    const d2 = (idNum * 7 + 4) % 10;
    const cpfFormatted = `${cpfBase.slice(0, 3)}.${cpfBase.slice(3, 6)}.${cpfBase.slice(6, 9)}-${d1}${d2}`;

    const rgFormatted = `${(12 + (idNum % 30))}.${String(100 + idNum * 13).slice(0, 3)}.${String(200 + idNum * 7).slice(0, 3)}-${(idNum % 9)}`;

    const phoneFixed = `(11) 501${(idNum % 9)}-${String(1000 + idNum * 23).slice(0, 4)}`;
    const phoneCell = `(11) 987${String(10 + idNum).slice(0, 2)}-${String(4000 + idNum * 37).slice(0, 4)}`;
    const email = `${profile.nome.toLowerCase().replace(/[^a-z]/g, '.')}.${idNum}@email.com`;

    const doctor = DOCTORS[index % DOCTORS.length];
    const nurse = NURSES[index % NURSES.length];
    const technician = TECHNICIANS[index % TECHNICIANS.length];

    const isParticularPatient = profile.convenio.toLowerCase().includes('particular');

    const patient = {
      id: patientId,
      registroOHB,
      registroHospitalar: rh,
      unidade: 'Hospital São Luiz Jabaquara - Pitombeiras',
      nome: profile.nome,
      convenio: profile.convenio,
      plano: profile.plano,
      matriculaConvenio: isParticularPatient ? 'N/A (Particular)' : `${84920000000 + idNum * 14321}`,
      validadeConvenio: isParticularPatient ? 'N/A' : '12/2028',
      dataNascimento: profile.dataNasc,
      idade: profile.idade,
      sexo: profile.sexo,
      estadoCivil: idNum % 3 === 0 ? 'Solteiro(a)' : idNum % 3 === 1 ? 'Casado(a)' : 'Viúvo(a)',
      rg: rgFormatted,
      cpf: cpfFormatted,
      profissao: idNum % 4 === 0 ? 'Aposentado(a)' : idNum % 4 === 1 ? 'Autônomo(a)' : idNum % 4 === 2 ? 'Professor(a)' : 'Comerciante',
      nomeMae: `Dona Maria ${profile.nome.split(' ').slice(-1)[0]} da Silva`,
      cep: `043${String(10 + (idNum % 80)).padStart(2, '0')}-000`,
      endereco: profile.endereco.split(',')[0],
      numero: profile.endereco.split(',')[1] ? profile.endereco.split(',')[1].trim() : `${100 + idNum * 12}`,
      complemento: idNum % 3 === 0 ? `Apto ${20 + idNum}` : idNum % 5 === 0 ? 'Casa 2' : '',
      bairro: profile.bairro,
      municipio: 'São Paulo',
      uf: 'SP',
      telefonesFixos: phoneFixed,
      celular: phoneCell,
      email,
      procedencia: 'Ambulatório Especializado de Feridas e Cirurgia Reparadora',
      remocao: 'Própria (veículo particular)',
      medicoIndicou: doctor,
      acompanhante: idNum % 2 === 0 ? 'Familiar direto' : 'Não necessita',
      historiaClinica: `Paciente com diagnóstico de ${profile.diagnostico} (CID: ${profile.cid10}). Encaminhado para protocolo de Oxigenoterapia Hiperbárica em câmara hiperbárica para acelerar cicatrização, controle de proliferação bacteriana anaeróbia e estímulo de angiogênese tecidual.`,
      exameFisicoResumido: `BEG, corado, hidratado, eupneico. Pulsos periféricos avaliados. Ausência de sinais de congestão pulmonar. Condições clínicas adequadas para pressurização a ${profile.ata} ATA.`,
      localCurativos: 'Clínica Especializada / Domiciliar com coberturas especiais',
      avaliacaoDor: (idNum * 2) % 8 + 1,
      grauEntendimento: 'Bom entendimento e plena cooperação com os procedimentos de descompressão e equalização de ouvidos.',
      tempoExistenciaPatologia: `${(idNum % 6) + 1} meses`,
      descricaoLesao: `Lesão tecidual com componente exsudativo moderado, leito com tecido de granulação e fibrina. Ausência de celulite circundante ativa no momento. Dimensão aprox: ${(idNum % 5) + 3} x ${(idNum % 4) + 2} cm.`,
      diagnostico: profile.diagnostico,
      cid10: profile.cid10,
      numeroTratamentosPrevisto: profile.previsto,
      medicamentosEmUso: idNum % 2 === 0 ? 'Losartana 50mg, AAS 100mg, Insulina NPH' : 'Dipirona 1g se dor, Ceftriaxona 1g IV, Metformina 850mg',
      alergias: idNum % 4 === 0 ? 'Penicilina e derivados' : idNum % 6 === 0 ? 'Iodo tópico' : 'Nega alergias conhecidas',
      vicios: idNum % 5 === 0 ? 'Ex-tabagista' : 'Nega etilismo e tabagismo',
      otoscopia: 'Membrana timpânica íntegra bilateralmente, boa capacidade de compensação tubária (Manobra de Valsalva positiva).',
      proteses: idNum % 4 === 0 ? 'Prótese dentária removível (retirar antes da sessão)' : 'Nenhuma',
      ventilacao: 'Espontânea em ar ambiente',
      createdAt: new Date(baseToday.getTime() - (profile.realizados * 2 + 10) * 86400000).toISOString(),
      updatedAt: new Date(baseToday.getTime() - 86400000).toISOString()
    };
    patients.push(patient);

    // Generate Sessions for this patient (1 up to profile.realizados)
    for (let s = 1; s <= profile.realizados; s++) {
      const daysAgo = Math.max(0, (profile.realizados - s));
      const sessionDate = new Date(baseToday.getTime() - daysAgo * 86400000);
      const sessionDateStr = sessionDate.toISOString().split('T')[0];

      // Test session-level modality switcher:
      // If patient is convenio, make every 7th session 'particular' (avulsa particular) to test modality switcher
      let sessionModality = isParticularPatient ? 'particular' : 'convenio';
      if (!isParticularPatient && s % 7 === 0) {
        sessionModality = 'particular'; // Consulta ou sessão extra particular para paciente de convênio!
      }

      const hourSlots = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30'];
      const hour = hourSlots[(idNum + s) % hourSlots.length];

      const sessionObj = {
        id: `ses-${patientId}-${s}`,
        patientId,
        registroOHB,
        sessionNumber: s,
        data: sessionDateStr,
        hora: hour,
        ata: profile.ata,
        pa: `${120 + ((s * 3) % 25)}/${75 + ((s * 2) % 15)}`,
        glicemia: `${110 + ((s * 7) % 50)}`,
        temperatura: (36.2 + ((s % 5) * 0.1)).toFixed(1),
        duracaoMinutos: 150, // Padrão travado 150 min
        modalidade: sessionModality,
        convenio: sessionModality === 'particular' ? 'Particular' : profile.convenio,
        tratamentoMedicacao: `Protocolo OHB O2 100% a ${profile.ata} ATA por 150 minutos. Pausas de ar ambiente a cada 30 min.`,
        intercorrencias: s === 1 ? 'Adaptação tranquila, leve equalização de tímpano com deglutição.' : s % 6 === 0 ? 'Boa tolerância, sinais vitais estáveis em todo o ciclo.' : 'Sessão transcorreu sem queixas ou intercorrências.',
        medicoResponsavel: doctor,
        enfermeiroResponsavel: nurse,
        tecnicoResponsavel: technician,
        conferenciaNome: true,
        roupaAlgodao: true,
        pulseiraEstatica: true,
        removerMetaisEletronicos: true,
        retirarProteses: patient.proteses.includes('retirar'),
        sondaVesicalAberta: false,
        avpAvcPicc: false,
        velocidadeCompressao: '0.1 ATA/min lenta e gradual com checagem auditiva',
        velocidadeDescompressao: '0.1 ATA/min lenta e contínua',
        covidFebreTosse: false,
        diagDor: s > 10 ? 'ME' : 'PR',
        diagQueda: 'PR',
        diagDeambulacao: s > 8 ? 'ME' : 'PR',
        diagGlicemia: 'ME',
        diagPele: s > 12 ? 'ME' : 'PR',
        diagContaminacao: s > 15 ? 'R' : 'ME',
        diagAnsiedade: s > 2 ? 'R' : 'ME',
        evolucaoEnfermagem: `Paciente admitido lúcido e orientado para a sessão #${s}. Checklist de segurança hiperbárica 100% checado. ${sessionModality === 'particular' ? '[MODALIDADE: SESSÃO PARTICULAR AVULSA AUTORIZADA] ' : ''}Pressurização realizada a ${profile.ata} ATA por 150 min. Ao término, despressurização gradual sem queixas óticas.`,
        status: 'concluida'
      };
      sessions.push(sessionObj);
    }

    // Generate Appointments for in-progress or newly started patients
    if (profile.realizados < profile.previsto) {
      // 1 or 2 appointments (today or future)
      const nextSessionNum = profile.realizados + 1;
      const appDateOffset = (idNum % 4) - 1; // -1 (ontem/hoje), 0 (hoje 2026-10-14), 1 (amanhã), 2 (depois de amanhã)
      const appDate = new Date(baseToday.getTime() + appDateOffset * 86400000);
      const appDateStr = appDate.toISOString().split('T')[0];

      const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const diaSemana = diasSemana[appDate.getDay()];
      const hourSlots = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30'];
      const horario = hourSlots[idNum % hourSlots.length];

      const isAppParticular = isParticularPatient || (nextSessionNum % 7 === 0);

      const appStatus = appDateOffset < 0 ? 'realizado' : appDateOffset === 0 ? 'confirmado' : 'agendado';

      appointments.push({
        id: `app-${patientId}-next`,
        patientId,
        patientName: patient.nome,
        registroOHB,
        cpf: patient.cpf,
        convenio: patient.convenio,
        modalidade: isAppParticular ? 'particular' : 'convenio',
        duracaoMinutos: 150,
        data: appDateStr,
        horario,
        diaSemana,
        sessaoNumero: nextSessionNum,
        pressaoATA: profile.ata,
        status: appStatus,
        observacoes: isAppParticular ? 'Sessão na modalidade Particular. Checar glicemia pré-câmara.' : 'Verificar curativo secundário antes da entrada.',
        telefonePaciente: phoneCell
      });

      // Se o paciente tiver mais sessões futuras, agenda mais uma sessão daqui a 3 dias
      if (profile.previsto - profile.realizados > 2 && idNum % 2 === 0) {
        const appDate2 = new Date(baseToday.getTime() + (appDateOffset + 3) * 86400000);
        appointments.push({
          id: `app-${patientId}-next2`,
          patientId,
          patientName: patient.nome,
          registroOHB,
          cpf: patient.cpf,
          convenio: patient.convenio,
          modalidade: isParticularPatient ? 'particular' : 'convenio',
          duracaoMinutos: 150,
          data: appDate2.toISOString().split('T')[0],
          horario,
          diaSemana: diasSemana[appDate2.getDay()],
          sessaoNumero: nextSessionNum + 1,
          pressaoATA: profile.ata,
          status: 'agendado',
          observacoes: 'Protocolo de continuidade. Paciente orientado.',
          telefonePaciente: phoneCell
        });
      }
    }

    // Generate Vault Documents for some patients
    if (idNum % 4 === 1 || idNum === 1 || idNum === 2) {
      documents.push({
        id: `doc-${idNum}`,
        registroOHB,
        cpf: patient.cpf,
        patientId,
        patientName: patient.nome,
        titulo: idNum === 1 ? 'Prontuário Físico Histórico Escaneado (Ano 2022)' : `Ficha de Admissão e TCLE - ${patient.nome}`,
        tipo: idNum === 1 ? 'prontuario_antigo' : idNum % 3 === 0 ? 'foto_lesao' : 'exame_laudo',
        dataDocumento: '2026-08-15',
        dataUpload: new Date(baseToday.getTime() - idNum * 86400000).toISOString(),
        observacoes: `Arquivo digitalizado do paciente ${patient.nome} (${registroOHB}). Termo de consentimento e laudo histopatológico.`,
        imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850"><rect width="600" height="850" fill="%23f8fafc"/><rect x="25" y="25" width="550" height="800" rx="8" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><text x="300" y="80" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="%230f172a">CLINICA DE MEDICINA HIPERBARICA</text><text x="300" y="110" font-family="sans-serif" font-size="13" text-anchor="middle" fill="%2364748b">Registro ${registroOHB} - ${patient.nome}</text><line x1="50" y1="140" x2="550" y2="140" stroke="%23cbd5e1" stroke-width="2"/><text x="60" y="190" font-family="sans-serif" font-size="14" fill="%231e293b">Documento Digitalizado Oficial</text><text x="60" y="220" font-family="sans-serif" font-size="12" fill="%23475569">CID-10: ${profile.cid10} - ${profile.diagnostico}</text><text x="60" y="250" font-family="sans-serif" font-size="12" fill="%23475569">Convenio: ${profile.convenio} | Status: Conforme</text></svg>`,
        tamanhoKb: 245 + (idNum * 12)
      });
    }
  });

  const fileContent = `// Mock Data completo para testes extensivos de filtros, buscas, tabelas e relatórios
// Gerado automaticamente com 50 pacientes, ${sessions.length} sessões e ${appointments.length} agendamentos.
import { Patient, HyperbaricSession, Appointment, DigitalizedDocument } from '../types';

export const MOCK_PATIENTS_50: Patient[] = ${JSON.stringify(patients, null, 2)};

export const MOCK_SESSIONS_50: HyperbaricSession[] = ${JSON.stringify(sessions, null, 2)};

export const MOCK_APPOINTMENTS_50: Appointment[] = ${JSON.stringify(appointments, null, 2)};

export const MOCK_DOCUMENTS_50: DigitalizedDocument[] = ${JSON.stringify(documents, null, 2)};
`;

  const targetDir = path.resolve(__dirname, '../src/data');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, 'mockPatients50.ts');
  fs.writeFileSync(targetFile, fileContent, 'utf-8');
  console.log(`Sucesso: ${targetFile} gerado! Pacientes: ${patients.length}, Sessoes: ${sessions.length}, Agendamentos: ${appointments.length}`);
}

generateMockFile();
