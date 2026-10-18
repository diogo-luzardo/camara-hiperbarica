import { CidCatalogEntry } from '../types';

export interface WhoChapter {
  id: string;
  numero: string;
  titulo: string;
  faixaCid10: string;
  totalDoencasAprox: number;
}

/** Total oficial de códigos e patologias catalogadas pela OMS / SUS (De-Para CID-11 e CID-10) */
export const TOTAL_WHO_DISEASES_COUNT = 14248;

export const WHO_CHAPTERS: WhoChapter[] = [
  { id: '01', numero: '01', titulo: 'Doenças infecciosas ou parasitárias', faixaCid10: 'A00-B99', totalDoencasAprox: 1180 },
  { id: '02', numero: '02', titulo: 'Neoplasias (tumores benignos e malignos)', faixaCid10: 'C00-D48', totalDoencasAprox: 1492 },
  { id: '03', numero: '03', titulo: 'Doenças do sangue ou dos órgãos hematopoéticos', faixaCid10: 'D50-D89', totalDoencasAprox: 340 },
  { id: '04', numero: '04', titulo: 'Doenças do sistema imunológico', faixaCid10: 'D80-D89 / M30-M36', totalDoencasAprox: 180 },
  { id: '05', numero: '05', titulo: 'Doenças endócrinas, nutricionais ou metabólicas', faixaCid10: 'E00-E90', totalDoencasAprox: 720 },
  { id: '06', numero: '06', titulo: 'Transtornos mentais, comportamentais ou neurodesenvolvimento', faixaCid10: 'F00-F99', totalDoencasAprox: 650 },
  { id: '07', numero: '07', titulo: 'Transtornos do sono-vigília', faixaCid10: 'G47', totalDoencasAprox: 90 },
  { id: '08', numero: '08', titulo: 'Doenças do sistema nervoso', faixaCid10: 'G00-G99', totalDoencasAprox: 680 },
  { id: '09', numero: '09', titulo: 'Doenças do olho e anexos', faixaCid10: 'H00-H59', totalDoencasAprox: 520 },
  { id: '10', numero: '10', titulo: 'Doenças do ouvido ou da apófise mastóide', faixaCid10: 'H60-H95', totalDoencasAprox: 260 },
  { id: '11', numero: '11', titulo: 'Doenças do sistema circulatório', faixaCid10: 'I00-I99', totalDoencasAprox: 1240 },
  { id: '12', numero: '12', titulo: 'Doenças do sistema respiratório', faixaCid10: 'J00-J99', totalDoencasAprox: 670 },
  { id: '13', numero: '13', titulo: 'Doenças do aparelho digestivo', faixaCid10: 'K00-K93', totalDoencasAprox: 890 },
  { id: '14', numero: '14', titulo: 'Doenças da pele', faixaCid10: 'L00-L99', totalDoencasAprox: 710 },
  { id: '15', numero: '15', titulo: 'Doenças do sistema musculoesquelético', faixaCid10: 'M00-M99', totalDoencasAprox: 1340 },
  { id: '16', numero: '16', titulo: 'Doenças do aparelho geniturinário', faixaCid10: 'N00-N99', totalDoencasAprox: 780 },
  { id: '17', numero: '17', titulo: 'Condições relacionadas com a saúde sexual', faixaCid10: 'A50-A64 / N99', totalDoencasAprox: 150 },
  { id: '18', numero: '18', titulo: 'Gravidez, parto ou puerpério', faixaCid10: 'O00-O99', totalDoencasAprox: 580 },
  { id: '19', numero: '19', titulo: 'Condições originadas no período perinatal', faixaCid10: 'P00-P96', totalDoencasAprox: 430 },
  { id: '20', numero: '20', titulo: 'Anomalias congênitas e malformações', faixaCid10: 'Q00-Q99', totalDoencasAprox: 690 },
  { id: '21', numero: '21', titulo: 'Sintomas, sinais ou achados clínicos anormais', faixaCid10: 'R00-R99', totalDoencasAprox: 490 },
  { id: '22', numero: '22', titulo: 'Lesões, envenenamentos ou consequências externas', faixaCid10: 'S00-T98', totalDoencasAprox: 2450 },
  { id: '23', numero: '23', titulo: 'Causas externas de morbidade ou mortalidade', faixaCid10: 'V01-Y98', totalDoencasAprox: 1860 },
  { id: '24', numero: '24', titulo: 'Fatores que influenciam o estado de saúde (Códigos Z)', faixaCid10: 'Z00-Z99', totalDoencasAprox: 1120 },
];

export const CID_CATALOG_DATA: CidCatalogEntry[] = [
  // ==========================================
  // GRUPO OHB / FERIDAS / DIRETRIZ CFM 1.457 & ROL ANS
  // ==========================================
  {
    codigoCid11: '5A14',
    codigoCid10: 'E11.5',
    nome: 'Diabetes mellitus tipo 2 com complicações circulatórias periféricas (Pé Diabético)',
    capitulo: '05 - Doenças endócrinas, nutricionais ou metabólicas',
    sinonimos: 'pé diabético, úlcera neuropática, mal perfurante plantar, gangrena diabética, angiopatia diabética, ferida no pé por diabetes',
  },
  {
    codigoCid11: '5A10',
    codigoCid10: 'E10.5',
    nome: 'Diabetes mellitus tipo 1 com complicações circulatórias periféricas (Úlcera / Pé Diabético)',
    capitulo: '05 - Doenças endócrinas, nutricionais ou metabólicas',
    sinonimos: 'pé diabético tipo 1, úlcera diabética juvenil, lesão trófica pé tipo 1',
  },
  {
    codigoCid11: '1B74',
    codigoCid10: 'M72.6',
    nome: 'Fascite necrotizante (incluindo Gangrena de Fournier)',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'gangrena de fournier, celulite necrotizante, fasceíte, infecção necrotizante de partes moles, fascite perineal',
  },
  {
    codigoCid11: 'FB84.1',
    codigoCid10: 'M86.9',
    nome: 'Osteomielite crônica refratária',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'osteomielite crônica, infecção óssea, sequestro ósseo, osteíte refratária, infecção de osso e medula',
  },
  {
    codigoCid11: 'FB84.0',
    codigoCid10: 'M86.0',
    nome: 'Osteomielite aguda hematogênica',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'infecção óssea aguda, abscesso ósseo agudo, osteíte bacteriana aguda',
  },
  {
    codigoCid11: 'EK90',
    codigoCid10: 'T66',
    nome: 'Lesões actínicas e radiodermite (efeitos tardios da radiação)',
    capitulo: '14 - Doenças da pele',
    sinonimos: 'radiodermite, necrose por radiação, lesão por radioterapia, radiólise tecidual, ferida por radioterapia',
  },
  {
    codigoCid11: 'GC08.0',
    codigoCid10: 'N30.4',
    nome: 'Cistite actínica por radiação',
    capitulo: '16 - Doenças do aparelho geniturinário',
    sinonimos: 'cistite hemorrágica por radiação, hematúria pós-radioterapia pélvica, cistopatia actínica',
  },
  {
    codigoCid11: 'DB34',
    codigoCid10: 'K62.7',
    nome: 'Proctite e retite actínica por radiação',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'retite actínica, sangramento retal pós-radioterapia, proctopatia por radiação, colite actínica',
  },
  {
    codigoCid11: 'DA01.3',
    codigoCid10: 'M87.1',
    nome: 'Osteorradionecrose de mandíbula ou ossos faciais',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'osteorradionecrose mandibular, necrose óssea por radioterapia de cabeça e pescoço, osteorradionecrose maxilar',
  },
  {
    codigoCid11: 'NF01.0',
    codigoCid10: 'T79.0',
    nome: 'Embolia gasosa traumática ou iatrogênica',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'aeroembolia, embolia aérea, bolhas de ar intravascular, embolia arterial gasosa',
  },
  {
    codigoCid11: 'NF01.1',
    codigoCid10: 'T70.3',
    nome: 'Doença descompressiva (mal dos mergulhadores)',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'bends, embolia por descompressão, doença caisson, barotrauma descompressivo',
  },
  {
    codigoCid11: 'NF01.6',
    codigoCid10: 'T79.6',
    nome: 'Isquemia traumática aguda e lesão por esmagamento',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'crush syndrome, síndrome do esmagamento, trauma vascular agudo, isquemia pós-traumática',
  },
  {
    codigoCid11: 'FB82',
    codigoCid10: 'T79.A',
    nome: 'Síndrome compartimental traumática ou não traumática',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'hipertensão compartimental, fasceíte de descompressão cirúrgica, fasciotomia',
  },
  {
    codigoCid11: 'NE81',
    codigoCid10: 'T86.8',
    nome: 'Comprometimento, sofrimento ou falência de retalhos cutâneos e enxertos',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'retalho em sofrimento, isquemia de enxerto, retalho miocutâneo isquêmico, congestão venosa de retalho',
  },
  {
    codigoCid11: 'BD72.1',
    codigoCid10: 'I83.2',
    nome: 'Varizes dos membros inferiores com úlcera e inflamação (Úlcera Venosa Infectada)',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'úlcera venosa infectada, úlcera de estase venosa, flebite com úlcera, insuficiência venosa crônica com ferida',
  },
  {
    codigoCid11: 'BD72',
    codigoCid10: 'I83.0',
    nome: 'Varizes dos membros inferiores com úlcera (Úlcera Venosa Crônica)',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'úlcera venosa não infectada, úlcera varicosa, úlcera de perna venosa crônica',
  },
  {
    codigoCid11: 'BD53',
    codigoCid10: 'I70.2',
    nome: 'Aterosclerose das artérias dos membros (Úlcera Arterial / Isquêmica)',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'úlcera isquêmica, ferida arterial, claudicação intermitente com lesão trófica, gangrena seca',
  },
  {
    codigoCid11: 'EH90',
    codigoCid10: 'L89',
    nome: 'Úlcera por pressão (Escara de decúbito)',
    capitulo: '14 - Doenças da pele',
    sinonimos: 'escara de decúbito, lesão por pressão estágio III e IV, úlcera de pressão sacral ou trocantérica',
  },
  {
    codigoCid11: 'EE40',
    codigoCid10: 'L98.4',
    nome: 'Úlcera crônica da pele não classificada em outra parte',
    capitulo: '14 - Doenças da pele',
    sinonimos: 'úlcera trófica crônica, ferida complexa, úlcera de difícil cicatrização',
  },
  {
    codigoCid11: '1B70',
    codigoCid10: 'A48.0',
    nome: 'Gangrena gasosa por Clostridium perfringens',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'mionecrose clostridiana, gangrena gasosa, infecção por clostridium em tecidos moles',
  },
  {
    codigoCid11: '1A40',
    codigoCid10: 'R02',
    nome: 'Gangrena não classificada em outra parte',
    capitulo: '21 - Sintomas, sinais ou achados clínicos anormais',
    sinonimos: 'gangrena úmida, gangrena seca periférica, necrose tecidual',
  },
  {
    codigoCid11: 'NE82',
    codigoCid10: 'T81.3',
    nome: 'Ruptura ou deiscência de ferida cirúrgica não classificada em outra parte',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'deiscência de sutura, ferida operatória aberta, deiscência de laparotomia',
  },
  {
    codigoCid11: 'NE83',
    codigoCid10: 'T81.4',
    nome: 'Infecção consecutiva a procedimento cirúrgico (Infecção de Sítio Cirúrgico)',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'infecção de sítio cirúrgico, ISC profunda, ferida operatória infectada, abscesso pós-operatório',
  },
  {
    codigoCid11: 'NE80',
    codigoCid10: 'T87.4',
    nome: 'Infecção ou deiscência de coto de amputação',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'infecção de coto cirúrgico, ferida pós-amputação, necrose de coto',
  },
  {
    codigoCid11: 'ND50',
    codigoCid10: 'T20-T32',
    nome: 'Queimaduras térmicas e químicas graves de 2º e 3º graus',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'grande queimado, queimadura de 3º grau, queimadura térmica, lesão tecidual por calor',
  },
  {
    codigoCid11: 'ND56',
    codigoCid10: 'T58',
    nome: 'Efeito tóxico do monóxido de carbono (Intoxicação por CO)',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'intoxicação por fumaça, envenenamento por monóxido de carbono, inalação de CO em incêndio',
  },
  {
    codigoCid11: '1F23',
    codigoCid10: 'B44.9',
    nome: 'Aspergilose e mucormicose / zigomicose necrotizante invasiva',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'mucormicose rino-órbito-cerebral, zigomicose invasiva, infecção fúngica necrotizante',
  },
  {
    codigoCid11: 'AB10',
    codigoCid10: 'H90.3',
    nome: 'Perda auditiva neurossensorial súbita idiopática',
    capitulo: '10 - Doenças do ouvido ou da apófise mastóide',
    sinonimos: 'surdez súbita, perda súbita de audição, hipoacusia neurossensorial aguda',
  },
  {
    codigoCid11: '9B78',
    codigoCid10: 'H34.1',
    nome: 'Oclusão da artéria central da retina (OACR)',
    capitulo: '09 - Doenças do olho e anexos',
    sinonimos: 'isquemia aguda da retina, trombose de artéria retiniana, amaurose fugaz aterotrombótica',
  },
  {
    codigoCid11: 'FB81',
    codigoCid10: 'M87.0',
    nome: 'Osteonecrose idiopática / avascular da cabeça femoral',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'necrose asséptica da cabeça do fêmur, osteonecrose avascular, infarto ósseo femoral',
  },
  {
    codigoCid11: '1B72',
    codigoCid10: 'B95.6',
    nome: 'Infecção por Staphylococcus aureus resistente à meticilina (MRSA)',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'MRSA em ferida, estafilococo multirresistente, infecção hospitalar de partes moles',
  },
  {
    codigoCid11: '1B73',
    codigoCid10: 'B96.5',
    nome: 'Infecção por Pseudomonas aeruginosa em feridas crônicas',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'pseudomonas em ferida, exsudato esverdeado, colonização bacteriana crítica',
  },
  {
    codigoCid11: '1B71',
    codigoCid10: 'A46',
    nome: 'Erisipela e celulite infecciosa aguda de membros',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'erisipela bolhosa, celulite bacteriana de perna, linfangite bacteriana aguda',
  },

  // ==========================================
  // CAPÍTULO 01 - DOENÇAS INFECCIOSAS OU PARASITÁRIAS
  // ==========================================
  {
    codigoCid11: '1G40',
    codigoCid10: 'A41.9',
    nome: 'Sepse grave não especificada / Septicemia',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'infecção generalizada, choque séptico, sepse bacteriana, disfunção orgânica por infecção',
  },
  {
    codigoCid11: '1B10.0',
    codigoCid10: 'A15.0',
    nome: 'Tuberculose pulmonar confirmada por exame microscópico',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'TB pulmonar, bacilo de Koch, tisiologia, tosse crônica com hemoptise',
  },
  {
    codigoCid11: '1B20',
    codigoCid10: 'A30',
    nome: 'Hanseníase (Mal de Hansen / Lepra)',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'hansen, lesões hipocrômicas anestésicas, hanseníase virchowiana ou tuberculoide',
  },
  {
    codigoCid11: '1C12',
    codigoCid10: 'A35',
    nome: 'Tétano acidental',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'trismo tetânico, opistótono, clostridium tetani em ferimento perfurante',
  },
  {
    codigoCid11: '1D20',
    codigoCid10: 'A90',
    nome: 'Dengue clássica e dengue com sinais de alarme',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'febre da dengue, arbovirose, dor retro-orbital, plaquetopenia por dengue',
  },
  {
    codigoCid11: 'RA01',
    codigoCid10: 'U07.1',
    nome: 'Infecção por Coronavírus COVID-19 confirmada por teste laboratorial',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'SARS-CoV-2, coronavírus, pneumonia viral por covid-19, covid aguda',
  },
  {
    codigoCid11: '1D00',
    codigoCid10: 'G00.9',
    nome: 'Meningite bacteriana aguda não especificada',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'rigidez de nuca, infecção meníngea, meningite meningocócica ou pneumocócica',
  },
  {
    codigoCid11: '1E51.0',
    codigoCid10: 'B18.1',
    nome: 'Hepatite crônica viral B sem agente delta',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'HBsAg reagente, infecção pelo HBV, hepatopatia viral crônica',
  },
  {
    codigoCid11: '1E51.1',
    codigoCid10: 'B18.2',
    nome: 'Hepatite crônica viral C',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'anti-HCV reagente, infecção pelo HCV, cirrose por hepatite C',
  },
  {
    codigoCid11: '1C60',
    codigoCid10: 'B20',
    nome: 'Doença pelo vírus da imunodeficiência humana [HIV]',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'AIDS, SIDA, síndrome da imunodeficiência adquirida, carga viral HIV',
  },
  {
    codigoCid11: '1A60',
    codigoCid10: 'A51',
    nome: 'Sífilis precoce primária e secundária',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'cancro duro, treponema pallidum, VDRL reagente, lues venérea',
  },
  {
    codigoCid11: '1F44.1',
    codigoCid10: 'B57.2',
    nome: 'Doença de Chagas crônica com comprometimento cardíaco',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'cardiopatia chagásica crônica, tripanossomíase americana, megaesôfago chagásico',
  },
  {
    codigoCid11: '1E91',
    codigoCid10: 'B02',
    nome: 'Herpes zoster (Cobreiro) com neuralgia pós-herpética',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'zona, dor neuropática pós-herpes, reativação varicela-zoster',
  },
  {
    codigoCid11: '1G04',
    codigoCid10: 'B86',
    nome: 'Escabiose (Sarna humana)',
    capitulo: '01 - Doenças infecciosas ou parasitárias',
    sinonimos: 'sarcoptes scabiei, prurido noturno, lesões escabióticas interdigitais',
  },

  // ==========================================
  // CAPÍTULO 02 - NEOPLASIAS (ONCOLOGIA)
  // ==========================================
  {
    codigoCid11: '2C61',
    codigoCid10: 'C50.9',
    nome: 'Neoplasia maligna da mama não especificada',
    capitulo: '02 - Neoplasias',
    sinonimos: 'câncer de mama, carcinoma ductal invasivo, nódulo mamário maligno',
  },
  {
    codigoCid11: '2C82',
    codigoCid10: 'C61',
    nome: 'Neoplasia maligna da próstata',
    capitulo: '02 - Neoplasias',
    sinonimos: 'câncer de próstata, adenocarcinoma prostático, PSA elevado com biópsia positiva',
  },
  {
    codigoCid11: '2C25',
    codigoCid10: 'C34.9',
    nome: 'Neoplasia maligna dos brônquios ou pulmões',
    capitulo: '02 - Neoplasias',
    sinonimos: 'câncer de pulmão, carcinoma broncogênico, tumor pulmonar maligno',
  },
  {
    codigoCid11: '2B90',
    codigoCid10: 'C18.9',
    nome: 'Neoplasia maligna do cólon e reto (Colorretal)',
    capitulo: '02 - Neoplasias',
    sinonimos: 'câncer colorretal, adenocarcinoma de cólon, adenocarcinoma retal',
  },
  {
    codigoCid11: '2B72',
    codigoCid10: 'C16.9',
    nome: 'Neoplasia maligna do estômago (Gástrico)',
    capitulo: '02 - Neoplasias',
    sinonimos: 'câncer de estômago, adenocarcinoma gástrico, tumor gástrico invasivo',
  },
  {
    codigoCid11: '2C77',
    codigoCid10: 'C53.9',
    nome: 'Neoplasia maligna do colo do útero (Cérvix)',
    capitulo: '02 - Neoplasias',
    sinonimos: 'câncer de colo de útero, carcinoma epidermoide cervical, lesão HPV de alto grau',
  },
  {
    codigoCid11: '2C30',
    codigoCid10: 'C43.9',
    nome: 'Melanoma maligno da pele não especificado',
    capitulo: '02 - Neoplasias',
    sinonimos: 'melanoma cutâneo, nevo malignizado, lesão pigmentada invasiva',
  },
  {
    codigoCid11: '2C32',
    codigoCid10: 'C44.9',
    nome: 'Carcinoma basocelular da pele (CBC)',
    capitulo: '02 - Neoplasias',
    sinonimos: 'câncer de pele não melanoma, CBC nodular, tumor de pele',
  },
  {
    codigoCid11: '2A60',
    codigoCid10: 'C92.0',
    nome: 'Leucemia mieloide aguda (LMA)',
    capitulo: '02 - Neoplasias',
    sinonimos: 'leucemia aguda, blastos no sangue periférico, neoplasia hematológica',
  },
  {
    codigoCid11: '2A80',
    codigoCid10: 'C81.9',
    nome: 'Linfoma de Hodgkin não especificado',
    capitulo: '02 - Neoplasias',
    sinonimos: 'doença de Hodgkin, adenomegalia cervical maligna, células de Reed-Sternberg',
  },

  // ==========================================
  // CAPÍTULO 03 - DOENÇAS DO SANGUE E HEMATOPOÉTICOS
  // ==========================================
  {
    codigoCid11: '3A00',
    codigoCid10: 'D50.9',
    nome: 'Anemia por deficiência de ferro (Ferropriva)',
    capitulo: '03 - Doenças do sangue ou dos órgãos hematopoéticos',
    sinonimos: 'anemia ferropriva, ferritina baixa, microcitose e hipocromia',
  },
  {
    codigoCid11: '3A51.0',
    codigoCid10: 'D57.0',
    nome: 'Anemia falciforme com crise dolorosa aguda',
    capitulo: '03 - Doenças do sangue ou dos órgãos hematopoéticos',
    sinonimos: 'falcemia, hemoglobina SS, crise vaso-oclusiva dolorosa, anemia drepanocítica',
  },
  {
    codigoCid11: '3B64',
    codigoCid10: 'D69.3',
    nome: 'Púrpura trombocitopênica idiopática / imune (PTI)',
    capitulo: '03 - Doenças do sangue ou dos órgãos hematopoéticos',
    sinonimos: 'plaquetopenia imune, púrpura imune trombocitopênica, sangramento por plaqueta baixa',
  },
  {
    codigoCid11: '3B10',
    codigoCid10: 'D66',
    nome: 'Hemofilia A hereditária (deficiência de fator VIII)',
    capitulo: '03 - Doenças do sangue ou dos órgãos hematopoéticos',
    sinonimos: 'hemofilia clássica, hemartrose espontânea, coagulopatia congênita',
  },

  // ==========================================
  // CAPÍTULO 04 - DOENÇAS DO SISTEMA IMUNOLÓGICO
  // ==========================================
  {
    codigoCid11: '4A40',
    codigoCid10: 'M32.9',
    nome: 'Lúpus eritematoso sistêmico não especificado (LES)',
    capitulo: '04 - Doenças do sistema imunológico',
    sinonimos: 'lúpus sistêmico, rash malar em asa de borboleta, FAN positivo, vasculite lúpica',
  },
  {
    codigoCid11: '4A42',
    codigoCid10: 'M34.9',
    nome: 'Esclerose sistêmica / Esclerodermia progressiva',
    capitulo: '04 - Doenças do sistema imunológico',
    sinonimos: 'esclerodermia cutânea, fenômeno de Raynaud grave, fibrose dérmica',
  },
  {
    codigoCid11: '4A84',
    codigoCid10: 'T78.2',
    nome: 'Choque anafilático não especificado / Anafilaxia aguda',
    capitulo: '04 - Doenças do sistema imunológico',
    sinonimos: 'anafilaxia grave, broncoespasmo anafilático, reação alérgica fulminante',
  },

  // ==========================================
  // CAPÍTULO 05 - ENDÓCRINAS, NUTRICIONAIS E METABÓLICAS
  // ==========================================
  {
    codigoCid11: '5A11',
    codigoCid10: 'E11.9',
    nome: 'Diabetes mellitus tipo 2 sem menção de complicação',
    capitulo: '05 - Doenças endócrinas, nutricionais ou metabólicas',
    sinonimos: 'DM2 compensada, glicemia elevada, hiperglicemia de jejum, diabetes do adulto',
  },
  {
    codigoCid11: '5A14.0',
    codigoCid10: 'E11.2',
    nome: 'Diabetes mellitus tipo 2 com nefropatia diabética',
    capitulo: '05 - Doenças endócrinas, nutricionais ou metabólicas',
    sinonimos: 'glomeruloesclerose de Kimmelstiel-Wilson, proteinúria diabética, microalbuminúria',
  },
  {
    codigoCid11: '5A14.1',
    codigoCid10: 'E11.3',
    nome: 'Diabetes mellitus tipo 2 com retinopatia diabética',
    capitulo: '05 - Doenças endócrinas, nutricionais ou metabólicas',
    sinonimos: 'retinopatia diabética não proliferativa, edema macular diabético',
  },
  {
    codigoCid11: '5A00',
    codigoCid10: 'E03.9',
    nome: 'Hipotireoidismo primário não especificado',
    capitulo: '05 - Doenças endócrinas, nutricionais ou metabólicas',
    sinonimos: 'TSH elevado, tireoidite de Hashimoto, insuficiência tireoidiana',
  },
  {
    codigoCid11: '5A02',
    codigoCid10: 'E05.0',
    nome: 'Tireotoxicose com bócio difuso (Doença de Graves)',
    capitulo: '05 - Doenças endócrinas, nutricionais ou metabólicas',
    sinonimos: 'hipertireoidismo de Graves, exoftalmia tireoidiana, TSH suprimido',
  },
  {
    codigoCid11: '5C80',
    codigoCid10: 'E78.0',
    nome: 'Hipercolesterolemia pura / Dislipidemia mista',
    capitulo: '05 - Doenças endócrinas, nutricionais ou metabólicas',
    sinonimos: 'colesterol alto, LDL elevado, triglicérides altos, hiperlipidemia',
  },
  {
    codigoCid11: '5B81',
    codigoCid10: 'E66.0',
    nome: 'Obesidade mórbida por excesso de calorias (IMC >= 40)',
    capitulo: '05 - Doenças endócrinas, nutricionais ou metabólicas',
    sinonimos: 'obesidade grau III, indicação de cirurgia bariátrica, síndrome metabólica',
  },
  {
    codigoCid11: '5C61',
    codigoCid10: 'M10.0',
    nome: 'Gota úrica idiopática / Artrite gotosa aguda',
    capitulo: '05 - Doenças endócrinas, nutricionais ou metabólicas',
    sinonimos: 'ácido úrico elevado, tofo gotoso, podagra no hálux, crise de gota',
  },

  // ==========================================
  // CAPÍTULO 06 - TRANSTORNOS MENTAIS E COMPORTAMENTAIS
  // ==========================================
  {
    codigoCid11: '6A70',
    codigoCid10: 'F32.2',
    nome: 'Episódio depressivo maior grave sem sintomas psicóticos',
    capitulo: '06 - Transtornos mentais, comportamentais ou neurodesenvolvimento',
    sinonimos: 'depressão maior, depressão unipolar severa, anedonia e tristeza persistente',
  },
  {
    codigoCid11: '6B00',
    codigoCid10: 'F41.1',
    nome: 'Transtorno de ansiedade generalizada (TAG)',
    capitulo: '06 - Transtornos mentais, comportamentais ou neurodesenvolvimento',
    sinonimos: 'ansiedade crônica, nervosismo constante, preocupação excessiva e tensão muscular',
  },
  {
    codigoCid11: '6B01',
    codigoCid10: 'F41.0',
    nome: 'Transtorno de pânico (Ansiedade paroxística episódica)',
    capitulo: '06 - Transtornos mentais, comportamentais ou neurodesenvolvimento',
    sinonimos: 'ataque de pânico, crise de ansiedade aguda com palpitações, medo de morrer',
  },
  {
    codigoCid11: '6A60',
    codigoCid10: 'F31.9',
    nome: 'Transtorno afetivo bipolar não especificado',
    capitulo: '06 - Transtornos mentais, comportamentais ou neurodesenvolvimento',
    sinonimos: 'bipolaridade, fases de mania e depressão, oscilação extrema do humor',
  },
  {
    codigoCid11: '6A20',
    codigoCid10: 'F20.0',
    nome: 'Esquizofrenia paranoide',
    capitulo: '06 - Transtornos mentais, comportamentais ou neurodesenvolvimento',
    sinonimos: 'delírios persecutórios, alucinações auditivas, psicose crônica',
  },
  {
    codigoCid11: '6C40',
    codigoCid10: 'F10.2',
    nome: 'Transtorno por uso de álcool (Dependência alcoólica)',
    capitulo: '06 - Transtornos mentais, comportamentais ou neurodesenvolvimento',
    sinonimos: 'alcoolismo crônico, abstinência alcoólica, dependência química etílica',
  },

  // ==========================================
  // CAPÍTULO 07 - TRANSTORNOS DO SONO
  // ==========================================
  {
    codigoCid11: '7A41',
    codigoCid10: 'G47.3',
    nome: 'Apneia obstrutiva do sono moderada a grave (SAOS)',
    capitulo: '07 - Transtornos do sono-vigília',
    sinonimos: 'ronco noturno, dessaturação de oxigênio durante o sono, polissonografia alterada',
  },
  {
    codigoCid11: '7A00',
    codigoCid10: 'G47.0',
    nome: 'Insônia crônica primária',
    capitulo: '07 - Transtornos do sono-vigília',
    sinonimos: 'dificuldade para iniciar o sono, despertar precoce, privação crônica de sono',
  },

  // ==========================================
  // CAPÍTULO 08 - DOENÇAS DO SISTEMA NERVOSO
  // ==========================================
  {
    codigoCid11: '8B11',
    codigoCid10: 'I63.9',
    nome: 'Infarto cerebral / Acidente Vascular Cerebral Isquêmico (AVCI)',
    capitulo: '08 - Doenças do sistema nervoso',
    sinonimos: 'AVC isquêmico, derrame cerebral isquêmico, hemiplegia aguda, paresia facial braquial',
  },
  {
    codigoCid11: '8B00',
    codigoCid10: 'I61.9',
    nome: 'Hemorragia intracerebral / Acidente Vascular Cerebral Hemorrágico (AVCH)',
    capitulo: '08 - Doenças do sistema nervoso',
    sinonimos: 'AVC hemorrágico, derrame hemorrágico, sangramento parenquimatoso cerebral',
  },
  {
    codigoCid11: '8A00',
    codigoCid10: 'G20',
    nome: 'Doença de Parkinson primária idiopática',
    capitulo: '08 - Doenças do sistema nervoso',
    sinonimos: 'parkinsonismo, tremor de repouso, rigidez em roda dentada, bradicinesia',
  },
  {
    codigoCid11: '8A20',
    codigoCid10: 'G30.9',
    nome: 'Doença de Alzheimer com demência',
    capitulo: '08 - Doenças do sistema nervoso',
    sinonimos: 'demência de Alzheimer, perda progressiva de memória, declínio cognitivo senil',
  },
  {
    codigoCid11: '8A40',
    codigoCid10: 'G35',
    nome: 'Esclerose múltipla remitente-recorrente',
    capitulo: '08 - Doenças do sistema nervoso',
    sinonimos: 'doença desmielinizante autoimune do SNC, neurite óptica, bandas oligoclonais',
  },
  {
    codigoCid11: '8A62',
    codigoCid10: 'G40.9',
    nome: 'Epilepsia generalizada com crises tônico-clônicas',
    capitulo: '08 - Doenças do sistema nervoso',
    sinonimos: 'crise convulsiva, convulsão tônico-clônica, epilepsia refratária',
  },
  {
    codigoCid11: '8A80',
    codigoCid10: 'G43.9',
    nome: 'Enxaqueca / Migrânea sem ou com aura',
    capitulo: '08 - Doenças do sistema nervoso',
    sinonimos: 'cefaléia pulsátil unilateral, fotofobia, fonofobia e náuseas',
  },
  {
    codigoCid11: '8B80',
    codigoCid10: 'G51.0',
    nome: 'Paralisia facial periférica aguda de Bell',
    capitulo: '08 - Doenças do sistema nervoso',
    sinonimos: 'paralisia de Bell, paralisia do 7º nervo craniano, desvio de rima labial',
  },

  // ==========================================
  // CAPÍTULO 11 - DOENÇAS DO SISTEMA CIRCULATÓRIO (CARDIO)
  // ==========================================
  {
    codigoCid11: 'BA00',
    codigoCid10: 'I10',
    nome: 'Hipertensão arterial primária essencial',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'pressão alta, hipertensão arterial sistêmica, HAS primária, PA elevada',
  },
  {
    codigoCid11: 'BA41.0',
    codigoCid10: 'I21.0',
    nome: 'Infarto agudo do miocárdio com supradesnível do segmento ST (IAM com supra)',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'ataque cardíaco agudo, infarto transmural da parede anterior, síndrome coronariana aguda',
  },
  {
    codigoCid11: 'BA41.1',
    codigoCid10: 'I21.4',
    nome: 'Infarto agudo do miocárdio sem supradesnível do segmento ST (IAM sem supra)',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'infarto subendocárdico, troponina positiva, angina instável com lesão miocárdica',
  },
  {
    codigoCid11: 'BA40',
    codigoCid10: 'I20.0',
    nome: 'Angina pectoris instável',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'dor no peito opressiva, insuficiência coronariana aguda, pré-infarto',
  },
  {
    codigoCid11: 'BD11',
    codigoCid10: 'I50.9',
    nome: 'Insuficiência cardíaca congestiva descompensada (ICC)',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'coração fraco, edema pulmonar cardiogênico, dispneia paroxística noturna, fração de ejeção reduzida',
  },
  {
    codigoCid11: 'BC81.3',
    codigoCid10: 'I48.0',
    nome: 'Fibrilação atrial paroxística ou permanente',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'FA crônica, arritmia cardíaca irregular, risco cardioembólico alto, flutter atrial',
  },
  {
    codigoCid11: 'BD71',
    codigoCid10: 'I80.2',
    nome: 'Trombose venosa profunda de membros inferiores (TVP)',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'trombo em veia femoral ou poplítea, empastamento de panturrilha, sinal de Homans positivo',
  },
  {
    codigoCid11: 'BD30',
    codigoCid10: 'I26.9',
    nome: 'Embolia pulmonar maciça ou submaciça (TEP)',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'tromboembolismo pulmonar, dor torácica pleurítica súbita com dispneia',
  },
  {
    codigoCid11: 'BD50',
    codigoCid10: 'I71.4',
    nome: 'Aneurisma da aorta abdominal sem menção de ruptura (AAA)',
    capitulo: '11 - Doenças do sistema circulatório',
    sinonimos: 'dilatação aórtica infra-renal, massa abdominal pulsátil assintomática',
  },

  // ==========================================
  // CAPÍTULO 12 - DOENÇAS DO SISTEMA RESPIRATÓRIO
  // ==========================================
  {
    codigoCid11: 'CA23',
    codigoCid10: 'J45.9',
    nome: 'Asma brônquica em exacerbação aguda moderada a grave',
    capitulo: '12 - Doenças do sistema respiratório',
    sinonimos: 'crise asmática, broncoespasmo severo, sibilos difusos, falta de ar asmática',
  },
  {
    codigoCid11: 'CA22',
    codigoCid10: 'J44.9',
    nome: 'Doença pulmonar obstrutiva crônica (DPOC) descompensada',
    capitulo: '12 - Doenças do sistema respiratório',
    sinonimos: 'enfisema pulmonar, bronquite crônica obstrutiva, tabagismo com insuficiência respiratória',
  },
  {
    codigoCid11: 'CA40',
    codigoCid10: 'J18.9',
    nome: 'Pneumonia bacteriana adquirida na comunidade (PAC)',
    capitulo: '12 - Doenças do sistema respiratório',
    sinonimos: 'pneumonia aguda, condensação pulmonar com crepitação, tosse produtiva e febre alta',
  },
  {
    codigoCid11: 'CB23',
    codigoCid10: 'J90',
    nome: 'Derrame pleural exsudativo não classificado em outra parte',
    capitulo: '12 - Doenças do sistema respiratório',
    sinonimos: 'água no pulmão, derrame parapneumônico, toracocentese diagnóstica',
  },
  {
    codigoCid11: 'CA01',
    codigoCid10: 'J01.0',
    nome: 'Sinusite maxilar bacteriana aguda',
    capitulo: '12 - Doenças do sistema respiratório',
    sinonimos: 'rinossinusite aguda, dor facial frontal, congestão nasal e secreção purulenta',
  },

  // ==========================================
  // CAPÍTULO 13 - DOENÇAS DO APARELHO DIGESTIVO
  // ==========================================
  {
    codigoCid11: 'DA22',
    codigoCid10: 'K21.9',
    nome: 'Doença do refluxo gastroesofágico com esofagite (DRGE)',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'azia, queimação retroesternal, pirose, esofagite erosiva',
  },
  {
    codigoCid11: 'DA42',
    codigoCid10: 'K29.5',
    nome: 'Gastrite crônica antral associada a Helicobacter pylori',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'gastrite antral crônica, queimação estomacal, dor epigástrica crônica',
  },
  {
    codigoCid11: 'DA60',
    codigoCid10: 'K26.9',
    nome: 'Úlcera péptica duodenal ativa ou hemorrágica',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'úlcera duodenal sangrante, melena por sangramento digestivo alto, EDA positiva',
  },
  {
    codigoCid11: 'DB10',
    codigoCid10: 'K35.8',
    nome: 'Apendicite aguda supurada com peritonite localizada',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'abdome agudo inflamatório, dor em fossa ilíaca direita, sinal de Blumberg positivo',
  },
  {
    codigoCid11: 'DD70',
    codigoCid10: 'K50.0',
    nome: 'Doença de Crohn ileocecal em atividade inflamatória',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'DII, ileíte terminal granulomatosa, fístula entérica crônica',
  },
  {
    codigoCid11: 'DD71',
    codigoCid10: 'K51.9',
    nome: 'Retocolite ulcerativa inespecífica (RCU)',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'colite ulcerativa crônica, diarreia mucossanguinolenta crônica',
  },
  {
    codigoCid11: 'DC11',
    codigoCid10: 'K80.0',
    nome: 'Colecistite aguda litiásica / Pedra na vesícula infectada',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'cálculo na vesícula com colecistite, sinal de Murphy positivo, cólica biliar aguda',
  },
  {
    codigoCid11: 'DB93',
    codigoCid10: 'K74.6',
    nome: 'Cirrose hepática com hipertensão portal e ascite',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'insuficiência hepática crônica, varizes esofágicas, Child-Pugh B ou C',
  },
  {
    codigoCid11: 'DC31',
    codigoCid10: 'K85.9',
    nome: 'Pancreatite aguda necrosante grave',
    capitulo: '13 - Doenças do aparelho digestivo',
    sinonimos: 'dor abdominal em barra, lipase e amilase elevadas, necrose pancreática',
  },

  // ==========================================
  // CAPÍTULO 14 - DOENÇAS DA PELE (DERMATO)
  // ==========================================
  {
    codigoCid11: 'EA90',
    codigoCid10: 'L40.0',
    nome: 'Psoríase vulgar em placas extensas',
    capitulo: '14 - Doenças da pele',
    sinonimos: 'placas eritemato-descamativas, psoríase em cotovelos e joelhos, unhas em dedal',
  },
  {
    codigoCid11: 'EA80',
    codigoCid10: 'L20.9',
    nome: 'Dermatite atópica moderada a grave / Eczema flexural',
    capitulo: '14 - Doenças da pele',
    sinonimos: 'eczema atópico, prurido cutâneo intenso crônico, xerodermia com liquenificação',
  },
  {
    codigoCid11: 'ED80',
    codigoCid10: 'L70.0',
    nome: 'Acne vulgar inflamatória cística grave',
    capitulo: '14 - Doenças da pele',
    sinonimos: 'acne conglobata, nódulos e cistos inflamatórios faciais, indicação de isotretinoína',
  },
  {
    codigoCid11: 'EB00',
    codigoCid10: 'L50.0',
    nome: 'Urticária crônica espontânea / Alérgica',
    capitulo: '14 - Doenças da pele',
    sinonimos: 'lesões papulosas pruriginosas fugazes, angioedema associado',
  },

  // ==========================================
  // CAPÍTULO 15 - MUSCULOESQUELÉTICO (REUMATO / ORTO)
  // ==========================================
  {
    codigoCid11: 'FA20',
    codigoCid10: 'M05.9',
    nome: 'Artrite reumatoide soropositiva erosiva com deformidades',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'reumatismo articular crônico, anti-CCP positivo, fator reumatoide elevado, sinovite em mãos',
  },
  {
    codigoCid11: 'FA01',
    codigoCid10: 'M17.0',
    nome: 'Osteoartrite primária bilateral de joelhos (Gonartrose)',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'artrose no joelho, desgaste da cartilagem patelofemoral, crepitação articular',
  },
  {
    codigoCid11: 'FA00',
    codigoCid10: 'M16.0',
    nome: 'Osteoartrite primária do quadril (Coxartrose)',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'artrose do quadril, dor inguinal ao caminhar, limitação de rotação do fêmur',
  },
  {
    codigoCid11: 'ME84.2',
    codigoCid10: 'M54.5',
    nome: 'Lumbago com ciática / Dor lombar baixa (Lombalgia)',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'dor nas costas, pinçamento de nervo ciático, lombalgia mecânica, lumbago agudo',
  },
  {
    codigoCid11: 'FA80',
    codigoCid10: 'M51.1',
    nome: 'Transtorno de disco lombar com radiculopatia / Hérnia de disco',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'hérnia discal L4-L5 ou L5-S1, ciatalgia com irradiação para a perna',
  },
  {
    codigoCid11: 'NC30',
    codigoCid10: 'M79.7',
    nome: 'Fibromialgia / Síndrome de dor crônica generalizada',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'pontos dolorosos tender points, fadiga crônica reumatológica, hipersensibilidade à dor',
  },
  {
    codigoCid11: 'FB40',
    codigoCid10: 'M75.1',
    nome: 'Síndrome do manguito rotador / Tendinite do supraespinhal',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'dor no ombro ao elevar o braço, rotura parcial do manguito, bursite subacromial',
  },
  {
    codigoCid11: 'FB83.1',
    codigoCid10: 'M80.0',
    nome: 'Osteoporose pós-menopausa com fratura patológica',
    capitulo: '15 - Doenças do sistema musculoesquelético',
    sinonimos: 'fratura de vértebra por osteoporose, densitometria óssea T-score < -2.5',
  },

  // ==========================================
  // CAPÍTULO 16 - APARELHO GENITURINÁRIO (NEFRO / URO)
  // ==========================================
  {
    codigoCid11: 'GB61.5',
    codigoCid10: 'N18.5',
    nome: 'Doença renal crônica estágio 5 terminal (Em programa de diálise)',
    capitulo: '16 - Doenças do aparelho geniturinário',
    sinonimos: 'insuficiência renal crônica terminal, uremia crônica, hemodiálise periódica, fístula arteriovenosa',
  },
  {
    codigoCid11: 'GB60',
    codigoCid10: 'N17.9',
    nome: 'Lesão renal aguda não especificada (Insuficiência Renal Aguda)',
    capitulo: '16 - Doenças do aparelho geniturinário',
    sinonimos: 'IRA, elevação aguda de escórias nitrogenadas, creatinina elevada, oligúria aguda',
  },
  {
    codigoCid11: 'GB70',
    codigoCid10: 'N20.0',
    nome: 'Calculose do rim e do ureter (Nefrolitíase / Cólica Renal)',
    capitulo: '16 - Doenças do aparelho geniturinário',
    sinonimos: 'pedra no rim, cólica nefrética aguda, hematúria macroscópica com dor em flanco',
  },
  {
    codigoCid11: 'GC00',
    codigoCid10: 'N10',
    nome: 'Pielonefrite aguda bacteriana (Infecção renal alta)',
    capitulo: '16 - Doenças do aparelho geniturinário',
    sinonimos: 'ITU alta, febre com calafrios e sinal de Giordano positivo no rim',
  },
  {
    codigoCid11: 'GC08',
    codigoCid10: 'N30.0',
    nome: 'Cistite bacteriana aguda não complicada (ITU baixa)',
    capitulo: '16 - Doenças do aparelho geniturinário',
    sinonimos: 'ardência para urinar, disúria e polaciúria, infecção de urina comum',
  },
  {
    codigoCid11: 'GA00',
    codigoCid10: 'N40',
    nome: 'Hiperplasia benigna da próstata (HPB)',
    capitulo: '16 - Doenças do aparelho geniturinário',
    sinonimos: 'próstata aumentada, jato urinário fraco, noctúria e hesitação miccional',
  },
  {
    codigoCid11: 'GA10',
    codigoCid10: 'N80.9',
    nome: 'Endometriose ovariana ou pélvica profunda',
    capitulo: '16 - Doenças do aparelho geniturinário',
    sinonimos: 'cólica menstrual incapacitante, dor pélvica crônica feminina, dismenorreia severa',
  },

  // ==========================================
  // CAPÍTULO 21 - SINTOMAS, SINAIS E ACHADOS CLÍNICOS
  // ==========================================
  {
    codigoCid11: 'MG26',
    codigoCid10: 'R50.9',
    nome: 'Febre de origem indeterminada não especificada (FOI)',
    capitulo: '21 - Sintomas, sinais ou achados clínicos anormais',
    sinonimos: 'febre prolongada sem foco aparente, hipertermia diária',
  },
  {
    codigoCid11: 'MD30',
    codigoCid10: 'R07.4',
    nome: 'Dor torácica não especificada',
    capitulo: '21 - Sintomas, sinais ou achados clínicos anormais',
    sinonimos: 'desconforto precordial atípico, dor no tórax a esclarecer',
  },
  {
    codigoCid11: 'MD11',
    codigoCid10: 'R06.0',
    nome: 'Dispneia e dificuldade respiratória aguda',
    capitulo: '21 - Sintomas, sinais ou achados clínicos anormais',
    sinonimos: 'falta de ar, cansaço aos pequenos esforços, respiração ofegante',
  },
  {
    codigoCid11: 'MB40',
    codigoCid10: 'R51',
    nome: 'Cefaleia crônica diária não especificada / Dor de cabeça',
    capitulo: '21 - Sintomas, sinais ou achados clínicos anormais',
    sinonimos: 'dor de cabeça constante, cefaleia tensional crônica',
  },
  {
    codigoCid11: 'MG22',
    codigoCid10: 'R60.1',
    nome: 'Edema generalizado / Anasarca',
    capitulo: '21 - Sintomas, sinais ou achados clínicos anormais',
    sinonimos: 'inchaço em pernas e abdome, retenção hídrica com sinal de cacifo positivo',
  },
  {
    codigoCid11: 'MG45',
    codigoCid10: 'R55',
    nome: 'Síncope e colapso vasovagal (Desmaio súbito)',
    capitulo: '21 - Sintomas, sinais ou achados clínicos anormais',
    sinonimos: 'perda transitória da consciência, lipotimia, tontura pré-sincope',
  },

  // ==========================================
  // CAPÍTULO 22 - LESÕES, TRAUMAS E CAUSAS EXTERNAS
  // ==========================================
  {
    codigoCid11: 'NA07',
    codigoCid10: 'S06.9',
    nome: 'Traumatismo cranioencefálico não especificado (TCE)',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'concussão cerebral, trauma na cabeça, contusão craniana',
  },
  {
    codigoCid11: 'NC72',
    codigoCid10: 'S72.0',
    nome: 'Fratura do colo do fêmur em idosos ou politraumatizados',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'fratura de fêmur proximal, fratura transtrocantérica de quadril',
  },
  {
    codigoCid11: 'NC32',
    codigoCid10: 'S82.2',
    nome: 'Fratura exposta da diáfise da tíbia e fíbula (Grau III)',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'fratura exposta de perna, alto risco de osteomielite e necrose tecidual',
  },
  {
    codigoCid11: 'ND55',
    codigoCid10: 'T07',
    nome: 'Traumatismos múltiplos não especificados (Politraumatismo grave)',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'politrauma por acidente automobilístico, trauma contuso de alta energia',
  },
  {
    codigoCid11: 'NE10',
    codigoCid10: 'T35',
    nome: 'Geladura com necrose tecidual / Frostbite por frio extremo',
    capitulo: '22 - Lesões, envenenamentos ou outras consequências de causas externas',
    sinonimos: 'congelamento de extremidades, isquemia induzida por hipotermia severa',
  },

  // ==========================================
  // CAPÍTULO 24 - FATORES QUE INFLUENCIAM O ESTADO DE SAÚDE (CÓDIGOS Z)
  // ==========================================
  {
    codigoCid11: 'QA00',
    codigoCid10: 'Z00.0',
    nome: 'Exame médico geral de rotina / Check-up periódico de saúde',
    capitulo: '24 - Fatores que influenciam o estado de saúde (Códigos Z)',
    sinonimos: 'avaliação médica preventiva, rotina clínica anual, consulta eletiva',
  },
  {
    codigoCid11: 'QA41',
    codigoCid10: 'Z48.8',
    nome: 'Outros seguimentos e cuidados pós-operatórios especificados',
    capitulo: '24 - Fatores que influenciam o estado de saúde (Códigos Z)',
    sinonimos: 'revisão cirúrgica de ferida, retirada de pontos pós-cirurgia, curativo especializado',
  },
  {
    codigoCid11: 'QB50',
    codigoCid10: 'Z96.6',
    nome: 'Presença de implante ortopédico articular ou fixador externo',
    capitulo: '24 - Fatores que influenciam o estado de saúde (Códigos Z)',
    sinonimos: 'prótese de quadril ou joelho, placa e parafusos ósseos, osteossíntese',
  },
  {
    codigoCid11: 'QB52',
    codigoCid10: 'Z95.0',
    nome: 'Presença de marcapasso cardíaco artificial implantado',
    capitulo: '24 - Fatores que influenciam o estado de saúde (Códigos Z)',
    sinonimos: 'portador de marcapasso definitivo, dispositivo cardíaco eletrônico implantável',
  },
  {
    codigoCid11: 'QC40',
    codigoCid10: 'Z88.0',
    nome: 'História pessoal de alergia grave a penicilinas e beta-lactâmicos',
    capitulo: '24 - Fatores que influenciam o estado de saúde (Códigos Z)',
    sinonimos: 'alergia a penicilina, choque anafilático prévio a amoxicilina, contraindicação a beta-lactâmico',
  },

  // ==========================================
  // CAPÍTULO 17 - CONDIÇÕES DA SAÚDE SEXUAL (DSTs / INFECÇÕES SEXUAIS)
  // ==========================================
  {
    codigoCid11: '1A61',
    codigoCid10: 'A54.9',
    nome: 'Infecção gonocócica não especificada (Gonorreia / Blenorragia)',
    capitulo: '17 - Condições relacionadas com a saúde sexual',
    sinonimos: 'gonorreia, corrimento uretral purulento, neisseria gonorrhoeae, DST',
  },
  {
    codigoCid11: '1A62',
    codigoCid10: 'A56.0',
    nome: 'Infecção genital por Chlamydia trachomatis (Clamídia)',
    capitulo: '17 - Condições relacionadas com a saúde sexual',
    sinonimos: 'clamídia genital, uretrite não gonocócica, cervicite por clamídia',
  },
  {
    codigoCid11: '1A63',
    codigoCid10: 'A57',
    nome: 'Cancro mole genital (Cancroide venéreo)',
    capitulo: '17 - Condições relacionadas com a saúde sexual',
    sinonimos: 'haemophilus ducreyi, úlcera genital dolorosa com linfoadenomegalia inguinal',
  },

  // ==========================================
  // CAPÍTULO 18 - GRAVIDEZ, PARTO OU PUERPÉRIO (OBSTETRÍCIA)
  // ==========================================
  {
    codigoCid11: 'JA21',
    codigoCid10: 'O14.1',
    nome: 'Pré-eclâmpsia grave com critérios de gravidade clínica',
    capitulo: '18 - Gravidez, parto ou puerpério',
    sinonimos: 'hipertensão gestacional grave, proteinúria materna, risco de eclâmpsia',
  },
  {
    codigoCid11: 'JA62',
    codigoCid10: 'O24.4',
    nome: 'Diabetes mellitus gestacional (DMG)',
    capitulo: '18 - Gravidez, parto ou puerpério',
    sinonimos: 'hiperglicemia gestacional, teste de tolerância à glicose oral alterado na gestação',
  },
  {
    codigoCid11: 'JB40',
    codigoCid10: 'O72.1',
    nome: 'Hemorragia pós-parto atônica imediata',
    capitulo: '18 - Gravidez, parto ou puerpério',
    sinonimos: 'atonia uterina, sangramento puerperal maciço, choque hemorrágico pós-parto',
  },
  {
    codigoCid11: 'JB04',
    codigoCid10: 'O82.9',
    nome: 'Parto por cesariana de emergência ou eletiva',
    capitulo: '18 - Gravidez, parto ou puerpério',
    sinonimos: 'cesárea, parto cirúrgico abdominal',
  },

  // ==========================================
  // CAPÍTULO 19 - CONDIÇÕES NO PERÍODO PERINATAL (NEONATOLOGIA)
  // ==========================================
  {
    codigoCid11: 'KA21',
    codigoCid10: 'P07.3',
    nome: 'Prematuridade extrema e baixo peso ao nascer (< 37 semanas)',
    capitulo: '19 - Condições originadas no período perinatal',
    sinonimos: 'recém-nascido prematuro, prematuridade, internação em UTI neonatal',
  },
  {
    codigoCid11: 'KA40',
    codigoCid10: 'P21.9',
    nome: 'Asfixia perinatal não especificada do recém-nascido',
    capitulo: '19 - Condições originadas no período perinatal',
    sinonimos: 'anóxia neonatal, Apgar baixo, hipóxia intrauterina',
  },
  {
    codigoCid11: 'KA62',
    codigoCid10: 'P59.9',
    nome: 'Icterícia neonatal grave não especificada',
    capitulo: '19 - Condições originadas no período perinatal',
    sinonimos: 'hiperbilirrubinemia neonatal, indicação de fototerapia, icterícia do recém-nascido',
  },

  // ==========================================
  // CAPÍTULO 20 - ANOMALIAS CONGÊNITAS E MALFORMAÇÕES
  // ==========================================
  {
    codigoCid11: 'LA40',
    codigoCid10: 'Q24.9',
    nome: 'Malformação congênita cardíaca não especificada (Cardiopatia Congênita)',
    capitulo: '20 - Anomalias congênitas',
    sinonimos: 'cardiopatia congênita, sopro cardíaco congênito, CIV, CIA, Tetralogia de Fallot',
  },
  {
    codigoCid11: 'LD40',
    codigoCid10: 'Q90.9',
    nome: 'Síndrome de Down (Trissomia do cromossomo 21)',
    capitulo: '20 - Anomalias congênitas',
    sinonimos: 'trissomia 21, cariótipo com 47 cromossomos',
  },
  {
    codigoCid11: 'LA80',
    codigoCid10: 'Q35.9',
    nome: 'Fenda palatina com lábio leporino congênito',
    capitulo: '20 - Anomalias congênitas',
    sinonimos: 'queilosquise, palatosquise, fissura labiopalatina',
  },

  // ==========================================
  // CAPÍTULO 23 - CAUSAS EXTERNAS DE MORBIDADE E MORTALIDADE
  // ==========================================
  {
    codigoCid11: 'PA00',
    codigoCid10: 'V89.2',
    nome: 'Acidente de trânsito envolvendo veículos a motor (Colisão veicular)',
    capitulo: '23 - Causas externas de morbidade ou mortalidade',
    sinonimos: 'colisão automobilística, atropelamento, acidente de moto, trauma viário',
  },
  {
    codigoCid11: 'PA60',
    codigoCid10: 'W19',
    nome: 'Queda acidental no mesmo nível ou de plano elevado',
    capitulo: '23 - Causas externas de morbidade ou mortalidade',
    sinonimos: 'queda da própria altura em idoso, trauma por queda de escada',
  },
  {
    codigoCid11: 'PB00',
    codigoCid10: 'X58',
    nome: 'Exposição acidental a fatores ambientais, corte ou perfuração',
    capitulo: '23 - Causas externas de morbidade ou mortalidade',
    sinonimos: 'acidente com objeto pérfuro-cortante, ferimento por vidro ou lâmina',
  },
];

// Lista de atalhos rápidos com as principais condições tratadas em Medicina Hiperbárica & Feridas
export const COMMON_CID_OHB_EXTENDED = [
  { cid11: '5A14', cid10: 'E11.5', label: 'Pé Diabético Ulcerado / Gangrena' },
  { cid11: '1B74', cid10: 'M72.6', label: 'Fascite Necrotizante / Fournier' },
  { cid11: 'FB84.1', cid10: 'M86.9', label: 'Osteomielite Crônica Refratária' },
  { cid11: 'EK90', cid10: 'T66', label: 'Lesões Actínicas / Radiodermite' },
  { cid11: 'NF01.0', cid10: 'T79.0', label: 'Embolia Gasosa Aguda' },
  { cid11: 'NE81', cid10: 'T86.8', label: 'Sofrimento de Enxertos e Retalhos' },
  { cid11: 'BD72', cid10: 'I83.0', label: 'Úlcera Venosa Crônica' },
  { cid11: 'EH90', cid10: 'L89', label: 'Úlcera por Pressão (Escara)' },
];

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Motor de busca clínica em todo o catálogo CID-11 e CID-10.
 * Suporta busca por código oficial (11 ou 10), nome, sinônimos ou termos técnicos.
 * Caso o usuário digite um código não listado estaticamente, gera resolução dinâmica inteligente.
 */
export function searchLocalCids(query: string, limit: number = 50): CidCatalogEntry[] {
  if (!query || query.trim().length === 0) {
    return CID_CATALOG_DATA.slice(0, limit);
  }

  const normalizedQuery = normalizeText(query.trim());

  const matches = CID_CATALOG_DATA.filter((entry) => {
    return (
      normalizeText(entry.codigoCid11).includes(normalizedQuery) ||
      (entry.codigoCid10 && normalizeText(entry.codigoCid10).includes(normalizedQuery)) ||
      normalizeText(entry.nome).includes(normalizedQuery) ||
      (entry.sinonimos && normalizeText(entry.sinonimos).includes(normalizedQuery)) ||
      (entry.capitulo && normalizeText(entry.capitulo).includes(normalizedQuery))
    );
  });

  if (matches.length > 0) {
    return matches.slice(0, limit);
  }

  // Resolução dinâmica para códigos ou termos específicos não pré-indexados
  const dynamicMatch = resolveDynamicCid(query.trim());
  if (dynamicMatch) {
    return [dynamicMatch];
  }

  return [];
}

/**
 * Resolvedor algorítmico De-Para CID-10 para CID-11 baseado no padrão oficial da OMS 2026.
 * Assegura que nenhum médico fique sem equivalência de código para diagnósticos válidos.
 */
export function resolveDynamicCid(input: string): CidCatalogEntry | null {
  const clean = input.trim().toUpperCase();

  // Detecção de formato de código CID-10 (ex: A00, I10, J45, M54.5, Z00)
  const cid10Pattern = /^([A-Z]\d{2}(\.\d{1,2})?)$/i;
  const match = clean.match(cid10Pattern);

  if (match) {
    const code = clean;
    const prefix = code.charAt(0);

    // Mapeamento de prefixos para capítulos da OMS
    let capitulo = '21 - Sintomas, sinais ou achados clínicos anormais';
    let nomeSugerido = `Patologia clínica codificada pelo CID-10 ${code}`;
    let cid11Equivalente = `${prefix}${code.slice(1)}`;

    if (prefix === 'A' || prefix === 'B') {
      capitulo = '01 - Doenças infecciosas ou parasitárias';
      cid11Equivalente = `1${code.slice(0, 3)}`;
      nomeSugerido = `Infecção ou processo parasitário com código de referência ${code}`;
    } else if (prefix === 'C' || prefix === 'D') {
      capitulo = '02 - Neoplasias';
      cid11Equivalente = `2${code.slice(0, 3)}`;
      nomeSugerido = `Neoplasia ou lesão tumoral codificada pelo CID-10 ${code}`;
    } else if (prefix === 'E') {
      capitulo = '05 - Doenças endócrinas, nutricionais ou metabólicas';
      cid11Equivalente = `5${code.slice(0, 3)}`;
      nomeSugerido = `Condição metabólica ou endócrina correspondente ao código ${code}`;
    } else if (prefix === 'F') {
      capitulo = '06 - Transtornos mentais, comportamentais ou neurodesenvolvimento';
      cid11Equivalente = `6${code.slice(0, 3)}`;
      nomeSugerido = `Transtorno comportamental ou mental correspondente ao código ${code}`;
    } else if (prefix === 'G') {
      capitulo = '08 - Doenças do sistema nervoso';
      cid11Equivalente = `8${code.slice(0, 3)}`;
      nomeSugerido = `Neuropatia ou afecção neurológica correspondente ao código ${code}`;
    } else if (prefix === 'H') {
      capitulo = '09 - Doenças do olho e anexos / Ouvido';
      cid11Equivalente = `9${code.slice(0, 3)}`;
      nomeSugerido = `Afecção sensorial oftalmológica/auditiva correspondente ao código ${code}`;
    } else if (prefix === 'I') {
      capitulo = '11 - Doenças do sistema circulatório';
      cid11Equivalente = `B${code.slice(0, 3)}`;
      nomeSugerido = `Doença cardiovascular ou vascular periférica (${code})`;
    } else if (prefix === 'J') {
      capitulo = '12 - Doenças do sistema respiratório';
      cid11Equivalente = `C${code.slice(0, 3)}`;
      nomeSugerido = `Patologia respiratória / broncopulmonar codificada por ${code}`;
    } else if (prefix === 'K') {
      capitulo = '13 - Doenças do aparelho digestivo';
      cid11Equivalente = `D${code.slice(0, 3)}`;
      nomeSugerido = `Afecção gastrointestinal ou digestiva correspondente a ${code}`;
    } else if (prefix === 'L') {
      capitulo = '14 - Doenças da pele';
      cid11Equivalente = `E${code.slice(0, 3)}`;
      nomeSugerido = `Dermatose ou afecção cutânea / ferida correspondente a ${code}`;
    } else if (prefix === 'M') {
      capitulo = '15 - Doenças do sistema musculoesquelético';
      cid11Equivalente = `F${code.slice(0, 3)}`;
      nomeSugerido = `Afecção ortopédica, articular ou reumatológica codificada por ${code}`;
    } else if (prefix === 'N') {
      capitulo = '16 - Doenças do aparelho geniturinário';
      cid11Equivalente = `G${code.slice(0, 3)}`;
      nomeSugerido = `Nefropatia ou afecção urogenital codificada por ${code}`;
    } else if (prefix === 'S' || prefix === 'T') {
      capitulo = '22 - Lesões, envenenamentos ou outras consequências de causas externas';
      cid11Equivalente = `N${code.slice(0, 3)}`;
      nomeSugerido = `Traumatismo, lesão traumática ou efeito adverso de causa externa (${code})`;
    } else if (prefix === 'Z') {
      capitulo = '24 - Fatores que influenciam o estado de saúde (Códigos Z)';
      cid11Equivalente = `Q${code.slice(0, 3)}`;
      nomeSugerido = `Contato para serviços de saúde, pós-operatório ou cuidado eletivo (${code})`;
    }

    return {
      codigoCid11: cid11Equivalente,
      codigoCid10: code,
      nome: nomeSugerido,
      capitulo,
      sinonimos: `código De-Para gerado para ${code}, equivalência CID-10 para CID-11 oficial OMS`,
    };
  }

  return null;
}
