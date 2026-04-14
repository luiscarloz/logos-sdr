import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const GEMINI_KEY = process.env.GEMINI_API_KEY ?? 'YOUR_GEMINI_KEY';

// ============================================================
// TENANTS
// ============================================================

const tenants = [
  {
    slug: 'imobiliaria-demo',
    name: 'Imobiliária Prime',
    industry: 'real_estate',
    api_key: `sdr_${randomBytes(32).toString('hex')}`,
    llm_provider: 'gemini',
    llm_model: 'gemini-2.5-flash',
    llm_api_key: GEMINI_KEY,
    system_prompt: `Você é a Sofia, assistente virtual da Imobiliária Prime.

SOBRE A EMPRESA:
- Imobiliária com 15 anos de atuação em Brasília
- Especializada em apartamentos e casas no Plano Piloto, Lago Sul, Lago Norte, Águas Claras e Noroeste
- Foco em imóveis de R$ 200 mil a R$ 1,5 milhão
- Diferenciais: atendimento personalizado, visitas virtuais, financiamento facilitado

SEU PAPEL:
- Atender leads interessados em comprar ou alugar imóveis
- Qualificar o perfil (orçamento, tipo, localização, urgência)
- Recomendar imóveis do catálogo
- Agendar visitas com corretores
- Ser consultiva, nunca insistente

TOM DE VOZ:
- Simpática, profissional e acolhedora
- Use "você" (não "senhor/senhora" a menos que o lead prefira)
- Emojis com moderação (1-2 por mensagem)
- Sempre em português brasileiro`,
    config: {
      timezone: 'America/Sao_Paulo',
      business_hours: { start: '08:00', end: '20:00' },
      handoff_email: 'corretores@imobiliariaprime.com.br',
    },
  },
  {
    slug: 'escola-ingles-demo',
    name: 'English Plus Academy',
    industry: 'english_school',
    api_key: `sdr_${randomBytes(32).toString('hex')}`,
    llm_provider: 'gemini',
    llm_model: 'gemini-2.5-flash',
    llm_api_key: GEMINI_KEY,
    system_prompt: `Você é o Lucas, assistente virtual da English Plus Academy.

SOBRE A EMPRESA:
- Escola de inglês com método comunicativo e imersivo
- Turmas presenciais e online
- Níveis: básico, intermediário, avançado e business english
- Faixa de preço: R$ 199 a R$ 599/mês
- Diferenciais: professores nativos, turmas pequenas (máx 8 alunos), certificação internacional

SEU PAPEL:
- Atender leads interessados em aprender inglês
- Entender nível atual, objetivo e disponibilidade
- Recomendar o curso adequado
- Agendar aula experimental gratuita
- Ser motivador e empático

TOM DE VOZ:
- Jovem, entusiasmado mas profissional
- Motivador sem ser forçado
- Use português brasileiro, pode inserir expressões em inglês de forma leve
- Emojis com moderação`,
    config: {
      timezone: 'America/Sao_Paulo',
      business_hours: { start: '09:00', end: '21:00' },
      handoff_email: 'matriculas@englishplus.com.br',
      trial_class_duration: 50,
    },
  },
  {
    slug: 'advocacia-demo',
    name: 'Escritório Martins & Associados',
    industry: 'law_firm',
    api_key: `sdr_${randomBytes(32).toString('hex')}`,
    llm_provider: 'gemini',
    llm_model: 'gemini-2.5-flash',
    llm_api_key: GEMINI_KEY,
    system_prompt: `Você é a Dra. Ana, assistente virtual do escritório Martins & Associados.

SOBRE O ESCRITÓRIO:
- Escritório de advocacia com 20 anos de experiência
- Áreas de atuação: direito de família, trabalhista, cível, empresarial e imobiliário
- Equipe de 12 advogados especializados
- Atendimento presencial em Brasília e consultas online para todo Brasil

SEU PAPEL:
- Atender potenciais clientes que precisam de assessoria jurídica
- Entender o tipo de demanda (área do direito, urgência, contexto)
- Qualificar o caso (complexidade, documentação necessária)
- Agendar consulta inicial (primeira consulta de avaliação gratuita)
- Transmitir confiança e profissionalismo

TOM DE VOZ:
- Profissional, acolhedora e confiante
- Use linguagem acessível (evite juridiquês desnecessário)
- Trate por "você" de forma respeitosa
- Nunca dê parecer jurídico — seu papel é acolher e agendar
- IMPORTANTE: Sempre diga que o advogado especialista vai analisar o caso na consulta

REGRA CRÍTICA:
- NUNCA dê conselho jurídico ou opinião sobre chances de sucesso
- Sempre encaminhe para a consulta com o advogado especialista`,
    config: {
      timezone: 'America/Sao_Paulo',
      business_hours: { start: '08:00', end: '18:00' },
      handoff_email: 'atendimento@martinsadvocacia.com.br',
      free_consultation: true,
    },
  },
];

// ============================================================
// STEP PROMPTS POR INDÚSTRIA
// ============================================================

const industryStepPrompts: Record<string, Record<string, string>> = {
  real_estate: {
    greeting: `ETAPA: Abordagem Inicial — Imobiliária
Objetivo: Engajar o lead sobre imóveis.

1. Cumprimente pelo nome
2. Mencione o contexto do interesse (anúncio, portal, indicação)
3. Pergunte: "Você está procurando para morar ou investir?"

Se responder, sugira next_step: "qualification".`,

    qualification: `ETAPA: Qualificação — Imobiliária
Colete (naturalmente, 1-2 por vez):
- Finalidade: morar ou investir
- Tipo: apartamento, casa, lote, comercial
- Região/bairro desejado
- Faixa de preço / orçamento
- Prazo: quando pretende comprar

Score signals:
- has_budget: mencionou valor ou faixa
- timeline_urgent: quer em até 3 meses
- has_specific_need: sabe o tipo e região
- decision_maker: é quem decide a compra

Quando tiver tipo + região + orçamento, sugira next_step: "needs_discovery".`,

    needs_discovery: `ETAPA: Entendimento Profundo — Imobiliária
Colete detalhes para match perfeito:
- Quantidade de quartos/suítes
- Vagas de garagem
- Andar preferido (se apartamento)
- Diferenciais: varanda, churrasqueira, piscina, academia
- Condomínio: aceita condomínio alto ou tem limite?
- Família: filhos, pets, trabalha em casa?
- Bairro específico ou aceita região próxima?

Extraia tudo em extracted_data.
Quando tiver detalhes suficientes, sugira next_step: "recommendation".`,

    recommendation: `ETAPA: Recomendação — Imobiliária
CATÁLOGO DISPONÍVEL:
{catalog_results}

Apresente 2-3 imóveis que combinam com o perfil.
Para cada um, destaque:
- Localização e tipo
- Preço e condições
- Diferenciais que atendem ao que o lead pediu
- Metragem e configuração

Finalize com: "Gostou de alguma opção? Posso agendar uma visita!"
Se demonstrar interesse, sugira next_step: "scheduling".`,

    scheduling: `ETAPA: Agendamento — Imobiliária
Agende uma VISITA ao imóvel.

HORÁRIOS DISPONÍVEIS:
{available_slots}

1. Pergunte qual imóvel quer visitar
2. Ofereça datas/horários
3. Confirme: nome, telefone, imóvel, data/hora
4. Informe que o corretor vai acompanhar

Ao confirmar, sugira next_step: "handoff".`,
  },

  english_school: {
    greeting: `ETAPA: Abordagem Inicial — Escola de Inglês
Objetivo: Engajar o lead sobre aprender inglês.

1. Cumprimente pelo nome
2. Mencione o contexto ("vi que você se interessou pela English Plus!")
3. Pergunte: "O que te motivou a buscar um curso de inglês agora?"

Se responder, sugira next_step: "qualification".`,

    qualification: `ETAPA: Qualificação — Escola de Inglês
Colete (naturalmente):
- Nível atual: nunca estudou, básico, intermediário, avançado
- Objetivo: viagem, trabalho, certificação, hobby, mudança de país
- Modalidade preferida: presencial ou online
- Disponibilidade de horário: manhã, tarde, noite, fim de semana
- Orçamento mensal

Score signals:
- has_budget: mencionou valor ou não se preocupa com preço
- timeline_urgent: precisa pra viagem/trabalho em breve
- has_specific_need: sabe o nível e objetivo
- decision_maker: é pra ele mesmo (não está perguntando pra filho/amigo)

Quando tiver nível + objetivo + disponibilidade, sugira next_step: "needs_discovery".`,

    needs_discovery: `ETAPA: Entendimento Profundo — Escola de Inglês
Colete:
- Experiências anteriores com inglês (já fez curso? Por que parou?)
- Frequência desejada: 2x, 3x semana ou intensivo
- Preferência: turma ou individual
- Precisa de certificação? (TOEFL, IELTS, Cambridge)
- Tem urgência? (entrevista, viagem, prova)

Extraia tudo em extracted_data.
Quando tiver detalhes suficientes, sugira next_step: "recommendation".`,

    recommendation: `ETAPA: Recomendação — Escola de Inglês
CURSOS DISPONÍVEIS:
{catalog_results}

Apresente 2-3 cursos que combinam com o perfil.
Para cada um, destaque:
- Nome e nível do curso
- Modalidade e horários
- Preço mensal
- Diferenciais (professor nativo, turma pequena, certificação)

Finalize com: "Que tal fazer uma aula experimental gratuita pra sentir como é o método?"
Se demonstrar interesse, sugira next_step: "scheduling".`,

    scheduling: `ETAPA: Agendamento — Escola de Inglês
Agende uma AULA EXPERIMENTAL GRATUITA.

HORÁRIOS DISPONÍVEIS:
{available_slots}

1. Confirme o curso de interesse
2. Ofereça datas/horários para a aula experimental
3. Informe: duração de 50 minutos, sem compromisso
4. Confirme: nome, telefone, data/hora, modalidade (presencial/online)

Ao confirmar, sugira next_step: "handoff".`,
  },

  law_firm: {
    greeting: `ETAPA: Abordagem Inicial — Advocacia
Objetivo: Acolher o potencial cliente com empatia.

1. Cumprimente pelo nome
2. Transmita acolhimento: "Entendo que questões jurídicas podem ser delicadas"
3. Pergunte: "Poderia me contar brevemente sobre a sua situação? Assim posso direcionar para o advogado mais adequado."

IMPORTANTE: Nunca dê parecer jurídico.
Se responder, sugira next_step: "qualification".`,

    qualification: `ETAPA: Qualificação — Advocacia
Colete (com sensibilidade):
- Área do direito: família, trabalhista, cível, empresarial, imobiliário
- Natureza: está processando ou sendo processado? Prevenção?
- Urgência: tem prazo judicial? Audiência marcada?
- Já tem advogado ou é primeira consulta?

Score signals:
- has_budget: mencionou orçamento ou não se preocupa
- timeline_urgent: tem prazo judicial ou audiência próxima
- has_specific_need: sabe a área e o tipo de problema
- decision_maker: é ele mesmo o interessado

NUNCA opine sobre o caso. Diga: "Entendo, esse é um caso que nosso especialista em [área] pode avaliar na consulta."

Quando identificar a área + urgência, sugira next_step: "needs_discovery".`,

    needs_discovery: `ETAPA: Entendimento Profundo — Advocacia
Colete para encaminhar ao advogado certo:
- Breve contexto do caso (sem entrar em juridiquês)
- Documentos que já possui
- Se já tentou resolver de outra forma
- Expectativa (o que espera como resultado)
- Preferência: consulta presencial ou online

NUNCA dê opinião jurídica. Frases seguras:
- "Entendo sua situação, é importante que nosso especialista avalie."
- "Esse tipo de caso tem várias possibilidades, o advogado vai orientar melhor."

Extraia tudo em extracted_data.
Quando tiver contexto suficiente, sugira next_step: "recommendation".`,

    recommendation: `ETAPA: Recomendação — Advocacia
SERVIÇOS DISPONÍVEIS:
{catalog_results}

Apresente a área de atuação que mais se encaixa.
Destaque:
- Experiência do escritório nessa área
- Que a primeira consulta de avaliação é GRATUITA
- Que o advogado especialista vai analisar o caso com atenção

Finalize com: "Posso agendar uma consulta de avaliação gratuita com nosso especialista?"
Se demonstrar interesse, sugira next_step: "scheduling".`,

    scheduling: `ETAPA: Agendamento — Advocacia
Agende uma CONSULTA DE AVALIAÇÃO GRATUITA.

HORÁRIOS DISPONÍVEIS:
{available_slots}

1. Confirme a área do caso
2. Ofereça datas/horários
3. Informe: consulta de 30-40 minutos, gratuita, sigilosa
4. Confirme: nome, telefone, data/hora, presencial ou online
5. Peça para trazer documentos relevantes

Ao confirmar, sugira next_step: "handoff".`,
  },
};

// ============================================================
// CATÁLOGO POR INDÚSTRIA
// ============================================================

function realEstateCatalog(tenantId: string) {
  return [
    {
      tenant_id: tenantId,
      category: 'apartamento',
      title: 'Apartamento 2 quartos - Vila Mariana',
      description: 'Lindo apartamento reformado, 65m², 2 quartos sendo 1 suíte, varanda gourmet com churrasqueira. Condomínio com piscina, academia e playground.',
      attributes: { price: 380000, bedrooms: 2, suites: 1, parking: 1, area: 65, floor: 8, neighborhood: 'Vila Mariana', condo_fee: 850, has_pool: true, has_gym: true },
      tags: ['reformado', 'varanda-gourmet', 'lazer-completo'],
    },
    {
      tenant_id: tenantId,
      category: 'apartamento',
      title: 'Apartamento 3 quartos - Moema',
      description: 'Amplo apartamento de 95m², 3 quartos sendo 1 suíte, 2 vagas. Próximo ao shopping e metrô. Condomínio com área de lazer completa.',
      attributes: { price: 650000, bedrooms: 3, suites: 1, parking: 2, area: 95, floor: 12, neighborhood: 'Moema', condo_fee: 1200, has_pool: true, has_gym: true },
      tags: ['próximo-metrô', 'lazer-completo', 'amplo'],
    },
    {
      tenant_id: tenantId,
      category: 'apartamento',
      title: 'Studio moderno - Pinheiros',
      description: 'Studio de 35m² todo mobiliado, ideal para jovens profissionais. Building com coworking, rooftop e bike sharing.',
      attributes: { price: 290000, bedrooms: 1, suites: 0, parking: 0, area: 35, floor: 15, neighborhood: 'Pinheiros', condo_fee: 600, has_pool: false, has_gym: true },
      tags: ['mobiliado', 'moderno', 'coworking'],
    },
    {
      tenant_id: tenantId,
      category: 'casa',
      title: 'Casa 4 quartos - Brooklin',
      description: 'Casa espaçosa de 200m² em terreno de 300m². 4 quartos, 2 suítes, quintal com churrasqueira, 3 vagas. Rua arborizada e tranquila.',
      attributes: { price: 1200000, bedrooms: 4, suites: 2, parking: 3, area: 200, neighborhood: 'Brooklin', has_pool: false, has_backyard: true },
      tags: ['quintal', 'família-grande', 'tranquilo'],
    },
    {
      tenant_id: tenantId,
      category: 'apartamento',
      title: 'Apartamento 2 quartos - Santo Amaro',
      description: 'Apartamento novo de 55m², 2 quartos, 1 vaga. Condomínio com lazer. Aceita financiamento e FGTS. Ótimo custo-benefício.',
      attributes: { price: 250000, bedrooms: 2, suites: 0, parking: 1, area: 55, floor: 5, neighborhood: 'Santo Amaro', condo_fee: 450, has_pool: true, has_gym: false },
      tags: ['novo', 'aceita-fgts', 'custo-benefício'],
    },
  ];
}

function englishSchoolCatalog(tenantId: string) {
  return [
    {
      tenant_id: tenantId,
      category: 'basico',
      title: 'English Start - Básico',
      description: 'Curso para quem nunca estudou inglês ou tem noções muito básicas. Método comunicativo desde a primeira aula.',
      attributes: { price_monthly: 249, level: 'A1-A2', duration_months: 12, classes_per_week: 2, class_duration: 60, modality: 'presencial e online', max_students: 8, has_native_teacher: false },
      tags: ['iniciante', 'comunicativo', 'turma-pequena'],
    },
    {
      tenant_id: tenantId,
      category: 'intermediario',
      title: 'English Boost - Intermediário',
      description: 'Para quem já tem base e quer ganhar fluência. Foco em conversação, listening e vocabulário do dia a dia.',
      attributes: { price_monthly: 349, level: 'B1-B2', duration_months: 12, classes_per_week: 2, class_duration: 60, modality: 'presencial e online', max_students: 8, has_native_teacher: true },
      tags: ['conversação', 'fluência', 'professor-nativo'],
    },
    {
      tenant_id: tenantId,
      category: 'avancado',
      title: 'English Pro - Avançado',
      description: 'Curso avançado com professor nativo. Foco em proficiência, debates, apresentações e escrita acadêmica.',
      attributes: { price_monthly: 449, level: 'C1-C2', duration_months: 8, classes_per_week: 2, class_duration: 90, modality: 'presencial e online', max_students: 6, has_native_teacher: true },
      tags: ['avançado', 'proficiência', 'professor-nativo'],
    },
    {
      tenant_id: tenantId,
      category: 'business',
      title: 'Business English',
      description: 'Inglês para o mundo corporativo. Reuniões, emails, negociações, apresentações. Turmas ou individual.',
      attributes: { price_monthly: 599, level: 'B2-C1', duration_months: 6, classes_per_week: 3, class_duration: 60, modality: 'presencial e online', max_students: 6, has_native_teacher: true },
      tags: ['corporativo', 'negócios', 'individual-disponível'],
    },
    {
      tenant_id: tenantId,
      category: 'intensivo',
      title: 'Intensivão - Preparatório TOEFL/IELTS',
      description: 'Curso intensivo de preparação para certificações internacionais. Material incluso. Simulados semanais.',
      attributes: { price_monthly: 499, level: 'B2+', duration_months: 4, classes_per_week: 4, class_duration: 90, modality: 'presencial e online', max_students: 6, has_native_teacher: true, certification_prep: true },
      tags: ['certificação', 'toefl', 'ielts', 'intensivo'],
    },
  ];
}

function lawFirmCatalog(tenantId: string) {
  return [
    {
      tenant_id: tenantId,
      category: 'familia',
      title: 'Direito de Família',
      description: 'Divórcio, guarda de filhos, pensão alimentícia, inventário, testamento, adoção, união estável.',
      attributes: { area: 'família', experience_years: 20, consultation_free: true, online_available: true },
      tags: ['divórcio', 'guarda', 'pensão', 'inventário'],
    },
    {
      tenant_id: tenantId,
      category: 'trabalhista',
      title: 'Direito Trabalhista',
      description: 'Rescisão indevida, horas extras, assédio moral, acidentes de trabalho, reconhecimento de vínculo.',
      attributes: { area: 'trabalhista', experience_years: 15, consultation_free: true, online_available: true },
      tags: ['rescisão', 'horas-extras', 'assédio', 'vínculo'],
    },
    {
      tenant_id: tenantId,
      category: 'civel',
      title: 'Direito Cível',
      description: 'Indenizações, contratos, cobranças, danos morais e materiais, responsabilidade civil, direito do consumidor.',
      attributes: { area: 'cível', experience_years: 18, consultation_free: true, online_available: true },
      tags: ['indenização', 'contrato', 'consumidor', 'danos'],
    },
    {
      tenant_id: tenantId,
      category: 'empresarial',
      title: 'Direito Empresarial',
      description: 'Abertura e encerramento de empresas, contratos societários, compliance, recuperação judicial, fusões.',
      attributes: { area: 'empresarial', experience_years: 12, consultation_free: true, online_available: true },
      tags: ['empresa', 'societário', 'compliance', 'recuperação'],
    },
    {
      tenant_id: tenantId,
      category: 'imobiliario',
      title: 'Direito Imobiliário',
      description: 'Compra e venda, locação, usucapião, regularização, contratos imobiliários, condomínios.',
      attributes: { area: 'imobiliário', experience_years: 15, consultation_free: true, online_available: true },
      tags: ['imóvel', 'usucapião', 'locação', 'contrato'],
    },
  ];
}

// ============================================================
// SCORING RULES POR INDÚSTRIA
// ============================================================

function realEstateScoringRules(tenantId: string) {
  return [
    { tenant_id: tenantId, rule_name: 'Tem orçamento definido', condition: { field: 'budget', operator: 'exists', value: true }, points: 20, priority: 1 },
    { tenant_id: tenantId, rule_name: 'Orçamento acima de 500k', condition: { field: 'budget', operator: 'gte', value: 500000 }, points: 10, priority: 2 },
    { tenant_id: tenantId, rule_name: 'Prazo urgente', condition: { field: 'timeline', operator: 'eq', value: 'urgente' }, points: 25, priority: 3 },
    { tenant_id: tenantId, rule_name: 'Sabe o bairro', condition: { field: 'neighborhood', operator: 'exists', value: true }, points: 15, priority: 1 },
    { tenant_id: tenantId, rule_name: 'Quer morar (não investir)', condition: { field: 'purpose', operator: 'eq', value: 'morar' }, points: 10, priority: 1 },
  ];
}

function englishSchoolScoringRules(tenantId: string) {
  return [
    { tenant_id: tenantId, rule_name: 'Objetivo claro', condition: { field: 'objective', operator: 'exists', value: true }, points: 20, priority: 1 },
    { tenant_id: tenantId, rule_name: 'Precisa pra trabalho', condition: { field: 'objective', operator: 'eq', value: 'trabalho' }, points: 15, priority: 2 },
    { tenant_id: tenantId, rule_name: 'Tem disponibilidade', condition: { field: 'schedule_preference', operator: 'exists', value: true }, points: 15, priority: 1 },
    { tenant_id: tenantId, rule_name: 'Quer certificação', condition: { field: 'needs_certification', operator: 'eq', value: true }, points: 20, priority: 2 },
    { tenant_id: tenantId, rule_name: 'Urgência (viagem/entrevista)', condition: { field: 'timeline', operator: 'eq', value: 'urgente' }, points: 25, priority: 3 },
  ];
}

function lawFirmScoringRules(tenantId: string) {
  return [
    { tenant_id: tenantId, rule_name: 'Área identificada', condition: { field: 'legal_area', operator: 'exists', value: true }, points: 20, priority: 1 },
    { tenant_id: tenantId, rule_name: 'Tem prazo judicial', condition: { field: 'has_deadline', operator: 'eq', value: true }, points: 30, priority: 3 },
    { tenant_id: tenantId, rule_name: 'Primeiro advogado', condition: { field: 'has_lawyer', operator: 'eq', value: false }, points: 15, priority: 1 },
    { tenant_id: tenantId, rule_name: 'Caso urgente', condition: { field: 'urgency', operator: 'eq', value: 'alta' }, points: 25, priority: 2 },
    { tenant_id: tenantId, rule_name: 'É o interessado direto', condition: { field: 'is_direct_party', operator: 'eq', value: true }, points: 10, priority: 1 },
  ];
}

// ============================================================
// MAIN SEED
// ============================================================

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data (in order due to foreign keys)
  console.log('🗑️  Clearing existing data...');
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('scoring_rules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('scoring_thresholds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('availability_slots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('catalog_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('catalog_schemas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tenant_prompts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tenant_channels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tenants').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const tenantData of tenants) {
    // Create tenant
    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert(tenantData)
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to create tenant ${tenantData.slug}:`, error.message);
      continue;
    }

    console.log(`✅ Tenant: ${tenant.name} (${tenant.slug})`);
    console.log(`   API Key: ${tenant.api_key}`);

    // Insert step prompts
    const stepPrompts = industryStepPrompts[tenant.industry];
    if (stepPrompts) {
      for (const [step, prompt] of Object.entries(stepPrompts)) {
        await supabase.from('tenant_prompts').insert({
          tenant_id: tenant.id,
          step,
          system_prompt: prompt,
          temperature: 0.7,
          max_tokens: 1024,
        });
      }
      console.log(`   📝 ${Object.keys(stepPrompts).length} step prompts created`);
    }

    // Insert catalog
    let catalogItems: ReturnType<typeof realEstateCatalog> = [];
    if (tenant.industry === 'real_estate') catalogItems = realEstateCatalog(tenant.id);
    if (tenant.industry === 'english_school') catalogItems = englishSchoolCatalog(tenant.id);
    if (tenant.industry === 'law_firm') catalogItems = lawFirmCatalog(tenant.id);

    for (const item of catalogItems) {
      await supabase.from('catalog_items').insert(item);
    }
    console.log(`   📦 ${catalogItems.length} catalog items created`);

    // Insert scoring rules
    let rules: ReturnType<typeof realEstateScoringRules> = [];
    if (tenant.industry === 'real_estate') rules = realEstateScoringRules(tenant.id);
    if (tenant.industry === 'english_school') rules = englishSchoolScoringRules(tenant.id);
    if (tenant.industry === 'law_firm') rules = lawFirmScoringRules(tenant.id);

    for (const rule of rules) {
      await supabase.from('scoring_rules').insert(rule);
    }
    console.log(`   📊 ${rules.length} scoring rules created`);

    // Insert scoring thresholds
    await supabase.from('scoring_thresholds').insert({
      tenant_id: tenant.id,
      hot_min: 70,
      warm_min: 40,
    });

    // Insert availability slots (Mon-Fri, 9-18h)
    for (let day = 1; day <= 5; day++) {
      await supabase.from('availability_slots').insert({
        tenant_id: tenant.id,
        agent_name: tenant.industry === 'real_estate' ? 'Corretor Carlos' : tenant.industry === 'english_school' ? 'Teacher Sarah' : 'Dr. Martins',
        day_of_week: day,
        start_time: '09:00',
        end_time: '18:00',
        slot_duration_minutes: tenant.industry === 'english_school' ? 50 : 60,
      });
    }
    console.log(`   📅 Availability slots created (Mon-Fri)`);

    console.log('');
  }

  console.log('🎉 Seed complete!\n');
  console.log('=== API Keys (use with X-API-Key header) ===');
  for (const t of tenants) {
    console.log(`${t.name}: ${t.api_key}`);
  }
}

seed().catch(console.error);
