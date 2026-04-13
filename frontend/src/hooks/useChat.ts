import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface UseChatOptions {
  apiKey: string;
  phone?: string;
  name?: string;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    const body = await res.text();
    const isRetryable = res.status === 503 || res.status === 429 || body.includes('high demand') || body.includes('overloaded');
    if (isRetryable && i < retries - 1) {
      await new Promise(r => setTimeout(r, delay * (i + 1)));
      continue;
    }
    throw new Error(body || `HTTP ${res.status}`);
  }
  throw new Error('Max retries reached');
}

export interface AppointmentInfo {
  date: string;
  time: string;
  type: string;
}

export interface LeadAdminData {
  leadId: string | null;
  conversationId: string | null;
  step: string;
  intent: string;
  score: number;
  scoreLabel: 'cold' | 'warm' | 'hot';
  profile: Record<string, unknown>;
  messageCount: number;
  startedAt: Date | null;
  appointment: AppointmentInfo | null;
}

export function useChat({ apiKey, phone, name }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('greeting');
  const [adminData, setAdminData] = useState<LeadAdminData>({
    leadId: null, conversationId: null, step: 'greeting', intent: '-',
    score: 0, scoreLabel: 'cold', profile: {}, messageCount: 0, startedAt: null, appointment: null,
  });
  const phoneRef = useRef(phone ?? `demo-${Date.now()}`);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`, role: 'user', content, timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetchWithRetry(`${apiBase}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
        body: JSON.stringify({ phone: phoneRef.current, name: name ?? 'Visitante', content }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.message || data.error);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`, role: 'assistant', content: data.reply,
        timestamp: new Date(), metadata: data.metadata,
      };
      setMessages(prev => [...prev, assistantMessage]);

      const meta = data.metadata ?? {};
      let step = (meta.step as string) ?? currentStep;

      // Also detect step from conversation content (backend may lag)
      const replyLower = (data.reply as string).toLowerCase();
      const allText = content.toLowerCase() + ' ' + replyLower;
      if (allText.includes('confirmado') || allText.includes('agendado') || allText.includes('marcado') || allText.includes('até amanhã') || allText.includes('se vê amanhã') || allText.includes('te espero')) {
        step = 'handoff';
      } else if (allText.includes('qual dia') || allText.includes('qual horário') || allText.includes('agendar') || allText.includes('visita') || allText.includes('aula experimental') || allText.includes('consulta')) {
        if (step !== 'handoff') step = Math.max(stepOrder(step), stepOrder('scheduling')) === stepOrder('scheduling') ? 'scheduling' : step;
      }

      setCurrentStep(step);

      // Detect cancellation
      const cancelDetected = detectCancellation(content, data.reply);

      // Extract appointment info from conversation
      const appointmentInfo = cancelDetected ? null : extractAppointment(content, data.reply);

      setAdminData(prev => {
        const mergedProfile = mergeProfile(prev.profile, content, step);
        const replyProfile = mergeProfile(mergedProfile, data.reply, step);
        const allMsgs = [...messages, userMessage, assistantMessage];

        // If cancelled, clear appointment and add cancellation to profile
        const updatedProfile = cancelDetected
          ? { ...replyProfile, status: '❌ Cancelado pelo lead' }
          : replyProfile;

        const updatedAppointment = cancelDetected ? null : (appointmentInfo ?? prev.appointment);

        const newScore = computeDemoScore(prev.score, step, (meta.intent as string) ?? '', updatedProfile, allMsgs);
        return {
          leadId: (meta.leadId as string) ?? prev.leadId,
          conversationId: (meta.conversationId as string) ?? prev.conversationId,
          step,
          intent: (meta.intent as string) ?? prev.intent,
          score: newScore,
          scoreLabel: computeScoreLabel(newScore),
          profile: updatedProfile,
          messageCount: prev.messageCount + 2,
          startedAt: prev.startedAt ?? new Date(),
          appointment: updatedAppointment,
        };
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '';
      const isOverload = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('429') || errMsg.includes('overloaded');
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`, role: 'assistant',
        content: isOverload ? '⏳ Alta demanda no servidor. Tente novamente em alguns segundos.' : 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, name, currentStep]);

  const reset = useCallback(() => {
    setMessages([]);
    setCurrentStep('greeting');
    setAdminData({ leadId: null, conversationId: null, step: 'greeting', intent: '-', score: 0, scoreLabel: 'cold', profile: {}, messageCount: 0, startedAt: null, appointment: null });
    phoneRef.current = `demo-${Date.now()}`;
  }, []);

  return { messages, isLoading, currentStep, sendMessage, reset, adminData };
}

/* ─── Scoring baseado em INTENÇÃO DE FECHAMENTO, não quantidade de mensagens ─── */
function computeDemoScore(_prev: number, step: string, intent: string, profile: Record<string, unknown>, allMessages: ChatMessage[]): number {
  let s = 0;

  // Sinais da conversa (análise de todas as mensagens)
  const allText = allMessages.map(m => m.content).join(' ').toLowerCase();

  // Sinais POSITIVOS de fechamento
  if (allText.match(/quero|preciso|necessito|urgente|rápido/)) s += 15;
  if (allText.match(/quanto custa|qual o valor|preço|orçamento|investimento/)) s += 10;
  if (allText.match(/pode ser|bora|vamos|fecha|quero fechar|tô dentro/)) s += 25;
  if (allText.match(/amanhã|próxima semana|essa semana|o quanto antes/)) s += 15;
  if (allText.match(/perfeito|ótimo|show|massa|top|gostei|adorei|excelente/)) s += 10;
  if (allText.match(/agendar|marcar|visita|aula experimental|consulta/)) s += 20;
  if (allText.match(/confirmado|marcado|agendado|combinado|fechado/)) s += 15;

  // Sinais NEGATIVOS
  if (allText.match(/não sei|talvez|vou pensar|depois|sem pressa/)) s -= 10;
  if (allText.match(/caro|muito caro|não tenho|sem grana|fora do orçamento/)) s -= 15;
  if (allText.match(/só pesquisando|só olhando|curiosidade/)) s -= 20;
  if (allText.match(/cancel|desist|não quero mais|querer mais não|desmarcar/)) s -= 35;
  if (allText.match(/não vou|não preciso|esquece|deixa pra lá/)) s -= 25;

  // Dados de perfil coletados = lead mais qualificado
  const profileKeys = Object.keys(profile);
  s += Math.min(profileKeys.length * 5, 20);

  // Step avançado = mais perto de fechar
  if (step === 'needs_discovery') s += 5;
  if (step === 'recommendation') s += 10;
  if (step === 'scheduling') s += 20;
  if (step === 'handoff') s += 25;

  // Intent do LLM
  if (intent === 'interested') s += 5;
  if (intent === 'ready_to_schedule') s += 20;
  if (intent === 'objection') s -= 10;
  if (intent === 'not_interested') s -= 25;

  return Math.min(100, Math.max(0, s));
}

function computeScoreLabel(score: number): 'cold' | 'warm' | 'hot' {
  if (score >= 65) return 'hot';
  if (score >= 35) return 'warm';
  return 'cold';
}

/* ─── Extração de perfil AGRESSIVA — pega tudo que puder do user E do assistant ─── */
function mergeProfile(prev: Record<string, unknown>, text: string, _step: string): Record<string, unknown> {
  const p = { ...prev };
  const l = text.toLowerCase();

  // ── Dinheiro / orçamento ──
  const money = l.match(/r\$\s*([\d.,]+)/);
  if (money) p['orçamento'] = `R$ ${money[1]}`;
  const mil = l.match(/(\d[\d.]*)\s*(mil|k)/);
  if (mil) p['orçamento'] = `${mil[1]} mil`;

  // ── Imobiliária ──
  const quartos = l.match(/(\d)\s*quarto/);
  if (quartos) p['quartos'] = `${quartos[1]} quartos`;
  const suites = l.match(/(\d)\s*su[ií]te/);
  if (suites) p['suítes'] = `${suites[1]} suíte(s)`;
  const vagas = l.match(/(\d)\s*vaga/);
  if (vagas) p['vagas'] = `${vagas[1]} vaga(s)`;
  if (l.includes('zona sul')) p['região'] = 'Zona Sul';
  if (l.includes('zona norte')) p['região'] = 'Zona Norte';
  if (l.includes('zona oeste')) p['região'] = 'Zona Oeste';
  if (l.includes('zona leste')) p['região'] = 'Zona Leste';
  if (l.includes('centro')) p['região'] = 'Centro';
  if (l.includes('moema')) p['bairro'] = 'Moema';
  if (l.includes('vila mariana')) p['bairro'] = 'Vila Mariana';
  if (l.includes('pinheiros')) p['bairro'] = 'Pinheiros';
  if (l.includes('brooklin')) p['bairro'] = 'Brooklin';
  if (l.includes('santo amaro')) p['bairro'] = 'Santo Amaro';
  if (l.match(/apart|ap\b/)) p['tipo'] = 'Apartamento';
  if (l.includes('casa')) p['tipo'] = 'Casa';
  if (l.includes('morar')) p['finalidade'] = 'Moradia';
  if (l.includes('investir') || l.includes('investimento')) p['finalidade'] = 'Investimento';
  if (l.includes('alugar') || l.includes('aluguel')) p['finalidade'] = 'Aluguel';

  // ── Escola de inglês ──
  if (l.includes('zero') || l.includes('do zero') || l.match(/nunca\s*(estud|fiz|fal)/)) p['nível'] = 'Iniciante (zero)';
  if (l.match(/básic/)) p['nível'] = 'Básico';
  if (l.match(/intermedi[áa]ri/)) p['nível'] = 'Intermediário';
  if (l.match(/avan[çc]ad/)) p['nível'] = 'Avançado';
  if (l.includes('business') || l.includes('negócio') || l.includes('corporativ')) p['curso'] = 'Business English';
  if (l.includes('toefl')) p['certificação'] = 'TOEFL';
  if (l.includes('ielts')) p['certificação'] = 'IELTS';
  if (l.includes('cambridge')) p['certificação'] = 'Cambridge';
  if (l.includes('trabalho') || l.includes('emprego') || l.includes('entrevista') || l.includes('promoção')) p['objetivo'] = 'Trabalho/Carreira';
  if (l.includes('viagem') || l.includes('intercâmbio') || l.includes('morar fora')) p['objetivo'] = 'Viagem/Intercâmbio';
  if (l.includes('online')) p['modalidade'] = 'Online';
  if (l.includes('presencial')) p['modalidade'] = 'Presencial';
  if (l.includes('individual')) p['formato'] = 'Individual';
  if (l.includes('turma') || l.includes('grupo')) p['formato'] = 'Em turma';
  const freq = l.match(/(\d)x\s*(semana|por semana|na semana)/);
  if (freq) p['frequência'] = `${freq[1]}x/semana`;
  if (l.match(/intensiv/)) p['formato'] = 'Intensivo';

  // ── Advocacia ──
  if (l.match(/divórcio|divorc|separação|separa[çc]/)) p['área'] = 'Direito de Família';
  if (l.match(/demitid|rescis|trabalhi|CLT|hora.?extra|ass[eé]dio/)) p['área'] = 'Direito Trabalhista';
  if (l.match(/contrato|indeniza|consum|dano/)) p['área'] = 'Direito Cível';
  if (l.match(/empresa|soci|CNPJ|abertura/)) p['área'] = 'Direito Empresarial';
  if (l.match(/imóvel|usucap|locação|inquilin/)) p['área'] = 'Direito Imobiliário';
  if (l.match(/guard|pensão|aliment|filho/)) p['detalhes'] = 'Envolve filhos/guarda';
  if (l.match(/audiência|prazo|urgente|urgência/)) p['urgência'] = 'Alta';

  // ── Prazos / datas (genérico) ──
  const meses = l.match(/(\d+)\s*mes/);
  if (meses) p['prazo'] = `${meses[1]} meses`;
  if (l.includes('daqui')) {
    const daqui = l.match(/daqui\s*(.*?)(\.|\!|\?|$)/);
    if (daqui) p['prazo'] = daqui[1].trim();
  }
  if (l.match(/semana que vem|próxima semana/)) p['prazo'] = 'Próxima semana';
  if (l.match(/esse mês|este mês/)) p['prazo'] = 'Este mês';
  if (l.match(/amanhã/)) p['prazo'] = 'Amanhã';

  // ── Horários mencionados ──
  const horario = l.match(/(\d{1,2})\s*(h|hora|:00|da manhã|da tarde|da noite)/);
  if (horario) {
    let h = parseInt(horario[1]);
    if (l.includes('da tarde') && h < 12) h += 12;
    if (l.includes('da noite') && h < 12) h += 12;
    p['horário'] = `${h}:00`;
  }
  if (l.includes('manhã') && !horario) p['período'] = 'Manhã';
  if (l.includes('tarde') && !horario) p['período'] = 'Tarde';
  if (l.includes('noite') && !horario) p['período'] = 'Noite';

  return p;
}

function detectCancellation(userMsg: string, assistantReply: string): boolean {
  const userLower = userMsg.toLowerCase();
  const replyLower = assistantReply.toLowerCase();

  const userWantsCancel = !!userLower.match(/cancel|desist|não quero mais|vou querer mais não|querer mais não|não vou|desmarcar|não preciso|so cancela|só cancela/);
  const assistantConfirmsCancel = !!replyLower.match(/cancelado|desmarcado|cancelei|tudo bem|entend|sem problema/);

  return userWantsCancel || (userWantsCancel && assistantConfirmsCancel);
}

function stepOrder(step: string): number {
  const order: Record<string, number> = {
    greeting: 0, qualification: 1, needs_discovery: 2,
    recommendation: 3, scheduling: 4, handoff: 5,
  };
  return order[step] ?? 0;
}

function extractAppointment(userMsg: string, assistantReply: string): AppointmentInfo | null {
  const all = (userMsg + ' ' + assistantReply).toLowerCase();

  const hasConfirmation = all.match(/confirmado|agendado|marcado|até amanhã|se vê|te espero|tá certo|tudo certo|combinado/);
  if (!hasConfirmation) return null;

  let date = 'A definir';
  let time = 'A definir';
  let type = 'Reunião';

  if (all.includes('amanhã')) date = 'Amanhã';
  if (all.includes('segunda')) date = 'Segunda-feira';
  if (all.includes('terça')) date = 'Terça-feira';
  if (all.includes('quarta')) date = 'Quarta-feira';
  if (all.includes('quinta')) date = 'Quinta-feira';
  if (all.includes('sexta')) date = 'Sexta-feira';
  if (all.includes('sábado')) date = 'Sábado';

  const timeMatch = all.match(/(\d{1,2})\s*(h|hora|:00|da manhã|da tarde)/);
  if (timeMatch) {
    let h = parseInt(timeMatch[1]);
    if (all.includes('da tarde') && h < 12) h += 12;
    time = `${String(h).padStart(2, '0')}:00`;
  }
  // Also try "às 9h" or "9 da manhã"
  const atMatch = all.match(/[àa]s\s*(\d{1,2})/);
  if (atMatch && time === 'A definir') {
    time = `${String(parseInt(atMatch[1])).padStart(2, '0')}:00`;
  }

  if (all.includes('visita')) type = 'Visita ao imóvel';
  if (all.includes('aula')) type = 'Aula experimental';
  if (all.includes('consulta')) type = 'Consulta jurídica';

  return { date, time, type };
}
