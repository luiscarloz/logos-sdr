import { useState, useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Bot, Zap, ArrowDown, Sparkles, Target, Clock, Brain, ArrowRightLeft,
  MessageCircle, Smartphone, BarChart3, CalendarCheck, UserCheck,
  Send, X, RotateCcw, ChevronRight, Play,
} from 'lucide-react';
import { useChat } from './hooks/useChat';
import type { ChatMessage } from './hooks/useChat';

/* ─── Design tokens ─── */
const T = {
  bg: '#06070E',
  card: '#0F1120',
  cardBorder: 'rgba(255,255,255,0.07)',
  cardHoverBorder: 'rgba(108,99,255,0.25)',
  brand: '#6C63FF',
  brandLight: '#8B83FF',
  white: '#F1F5F9',
  gray: '#94A3B8',
  muted: '#64748B',
  dim: '#475569',
  dark: '#1E293B',
  radius: 24,
};

const cardStyle: CSSProperties = {
  background: T.card,
  border: `1px solid ${T.cardBorder}`,
  borderRadius: T.radius,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
};

/* ─── Reveal on scroll ─── */
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════ */
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 180]);
  const op = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '0%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <motion.div style={{ y, opacity: op, position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', width: '100%', maxWidth: 940, margin: '0 auto' }}>
        {/* Logo */}
        <motion.img src="/logos/icon.png" alt="Logos Tech"
          initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ height: 120, margin: '0 auto 48px', objectFit: 'contain' as const }} />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 100, background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)', marginBottom: 48 }}>
          <Bot size={15} color="#6C63FF" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc' }}>SDR Automatizado com IA</span>
          <Zap size={13} color="#FBBF24" />
        </motion.div>

        {/* Title */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
          <span style={{ display: 'block', fontSize: 'clamp(42px, 7.5vw, 84px)', fontWeight: 800, color: T.white, lineHeight: 1.0, letterSpacing: '-0.035em' }}>
            Seu vendedor IA
          </span>
          <span className="text-gradient" style={{ display: 'block', fontSize: 'clamp(42px, 7.5vw, 84px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.035em', marginTop: 4 }}>
            que nunca dorme.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          style={{ fontSize: 'clamp(16px, 2.2vw, 19px)', color: T.muted, fontWeight: 400, lineHeight: 1.7, maxWidth: 580, margin: '28px auto 0' }}>
          Atendimento <span style={{ color: T.white, fontWeight: 600 }}>24/7 no WhatsApp</span>. Qualifica leads,
          recomenda produtos e agenda reuniões — com conversa natural.
        </motion.p>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
          style={{ display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'center', gap: '48px', marginTop: 56 }}>
          {[{ v: '< 5s', l: 'Resposta' }, { v: '24/7', l: 'Disponível' }, { v: '3x', l: 'Agendamentos' }, { v: '85%', l: 'Qualificação' }].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 + i * 0.08, type: 'spring', stiffness: 200 }} style={{ textAlign: 'center' as const }}>
              <div style={{ fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 800, color: T.white, letterSpacing: '-0.02em' }}>{s.v}</div>
              <div style={{ fontSize: 11, color: T.dim, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginTop: 6 }}>{s.l}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          style={{ marginTop: 56, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 16 }}>
          <a href="#demos" className="btn-brand" style={{ fontSize: 16, padding: '18px 40px', borderRadius: 18 }}>
            <Play size={16} fill="white" /> Testar demos ao vivo
          </a>
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Sem cadastro. Converse com a IA agora.</span>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 2.5 }}
        style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)' }}>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
          <ArrowDown size={16} color="#475569" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════ */
const features = [
  { icon: Sparkles, title: 'Rapport Automático', desc: 'Detecta o estilo do lead — formal, informal, emojis, velocidade — e espelha automaticamente o tom ideal da conversa.', color: '#8B5CF6' },
  { icon: Target, title: 'Qualificação Natural', desc: 'Extrai orçamento, urgência, necessidades e perfil de forma orgânica, sem parecer um interrogatório chato.', color: '#3B82F6' },
  { icon: Clock, title: 'Timing Humano', desc: 'Respostas com delay realista de 5 a 60 segundos e simulação de digitação. Parece gente de verdade.', color: '#10B981' },
  { icon: Brain, title: 'Memória Persistente', desc: 'Retoma conversas semanas depois com contexto total. O lead nunca precisa repetir informação nenhuma.', color: '#F59E0B' },
  { icon: ArrowRightLeft, title: 'Escalação Inteligente', desc: 'Detecta frustração, negociação ou alta intenção e transfere para humano com briefing completo.', color: '#EC4899' },
  { icon: MessageCircle, title: 'WhatsApp Nativo', desc: 'Opera direto no canal que o lead já usa. Sem app novo, sem cadastro, sem fricção nenhuma.', color: '#06B6D4' },
];

function FeatureCard({ f, i }: { f: typeof features[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={i * 0.07}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...cardStyle,
          padding: '36px 32px',
          height: '100%',
          cursor: 'default',
          borderColor: hovered ? T.cardHoverBorder : T.cardBorder,
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered ? `0 20px 50px rgba(0,0,0,0.3), 0 0 30px ${f.color}08` : '0 4px 20px rgba(0,0,0,0.15)',
        }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${f.color}0D`, border: `1px solid ${f.color}18`,
          marginBottom: 24,
          transform: hovered ? 'scale(1.1) rotate(3deg)' : 'scale(1)',
          transition: 'transform 0.4s ease',
        }}>
          <f.icon size={22} color={f.color} strokeWidth={2} />
        </div>
        {/* Title */}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: T.white, marginBottom: 12, letterSpacing: '-0.01em' }}>{f.title}</h3>
        {/* Desc */}
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75 }}>{f.desc}</p>
      </div>
    </Reveal>
  );
}

function Features() {
  return (
    <section style={{ padding: '140px 24px', position: 'relative' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center' as const, marginBottom: 80 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: T.brand, marginBottom: 16 }}>Diferenciais</p>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: T.white, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Não é um chatbot.<br />
              <span className="text-gradient">É um vendedor de verdade.</span>
            </h2>
            <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.7, maxWidth: 540, margin: '20px auto 0', fontWeight: 400 }}>
              Tecnologia de ponta que entende, qualifica e converte com a naturalidade de uma conversa entre humanos.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {features.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════ */
const steps = [
  { icon: Smartphone, n: '01', title: 'Lead entra pelo WhatsApp', desc: 'Landing page, Instagram, portais — qualquer canal. Atendimento automático em menos de 5 segundos.', color: '#6C63FF' },
  { icon: Brain, n: '02', title: 'IA qualifica com conversa natural', desc: 'Extrai necessidades, orçamento, urgência e perfil com perguntas naturais — sem formulário.', color: '#3B82F6' },
  { icon: BarChart3, n: '03', title: 'Lead scoring automático', desc: 'Cada lead recebe pontuação: quente, morno ou frio. Seu time foca em quem está pronto.', color: '#F59E0B' },
  { icon: CalendarCheck, n: '04', title: 'Agendamento direto', desc: 'A IA agenda visitas, aulas experimentais ou consultas direto na agenda do time.', color: '#10B981' },
  { icon: UserCheck, n: '05', title: 'Handoff com briefing', desc: 'O vendedor recebe o lead com resumo completo: perfil, necessidades, histórico e score.', color: '#EC4899' },
];

function StepCard({ s, i }: { s: typeof steps[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={i * 0.08}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...cardStyle,
          padding: '32px 36px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 28,
          borderColor: hovered ? T.cardHoverBorder : T.cardBorder,
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.1)',
        }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${s.color}08`, border: `1px solid ${s.color}12`,
          }}>
            <s.icon size={26} color={s.color} strokeWidth={1.8} />
          </div>
          <div style={{
            position: 'absolute', top: -10, right: -10,
            width: 28, height: 28, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: s.color, fontSize: 10, fontWeight: 800, color: 'white',
            boxShadow: `0 4px 12px ${s.color}40`,
          }}>{s.n}</div>
        </div>
        <div style={{ paddingTop: 4 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: T.white, marginBottom: 8 }}>{s.title}</h3>
          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75 }}>{s.desc}</p>
        </div>
      </div>
    </Reveal>
  );
}

function HowItWorks() {
  return (
    <section style={{ padding: '140px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative' }}>
        <Reveal>
          <div style={{ textAlign: 'center' as const, marginBottom: 80 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: T.brand, marginBottom: 16 }}>Fluxo</p>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: T.white, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Do lead ao agendamento
            </h2>
            <p style={{ fontSize: 17, color: T.muted, marginTop: 16, fontWeight: 400 }}>Cinco etapas automáticas. De minutos, não dias.</p>
          </div>
        </Reveal>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          {steps.map((s, i) => <StepCard key={s.n} s={s} i={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN PANEL
   ═══════════════════════════════════════════════════ */
function AdminPanel({ adminData, color, assistant, isMobilePopup }: { adminData: import('./hooks/useChat').LeadAdminData; color: string; assistant: string; isMobilePopup?: boolean }) {
  const scoreColors = { cold: '#3B82F6', warm: '#F59E0B', hot: '#EF4444' };
  const scoreLabels = { cold: '❄️ Frio', warm: '🔥 Morno', hot: '🔥🔥 Quente' };
  const stepIcons: Record<string, string> = {
    greeting: '👋', qualification: '🎯', needs_discovery: '🔍',
    recommendation: '💡', scheduling: '📅', handoff: '🤝', nurturing: '🌱',
  };

  const profileEntries = Object.entries(adminData.profile).filter(([k]) => !k.startsWith('etapa_'));
  const elapsed = adminData.startedAt ? Math.round((Date.now() - adminData.startedAt.getTime()) / 1000) : 0;
  const hasAppointment = adminData.appointment !== null;
  const wasCancelled = adminData.profile.status === '❌ Cancelado pelo lead';
  const showBriefing = adminData.step === 'handoff' || adminData.score >= 60 || hasAppointment || wasCancelled;

  return (
    <motion.div initial={{ opacity: 0, x: isMobilePopup ? 0 : 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isMobilePopup ? 0 : 30 }}
      transition={{ type: 'spring', damping: 28, stiffness: 250 }}
      style={{
        ...(isMobilePopup
          ? { width: '100%', overflowY: 'auto' as const, padding: 0 }
          : { width: 360, height: 640, overflowY: 'auto' as const, background: '#0A0C18', borderRadius: 28, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', padding: 0 }),
      }}>

      {/* Header - only on desktop */}
      {!isMobilePopup && <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <BarChart3 size={18} color={color} />
        <span style={{ fontSize: 15, fontWeight: 700, color: T.white }}>Painel Admin</span>
        <span style={{ fontSize: 11, color: T.dim, marginLeft: 'auto' }}>tempo: {elapsed}s</span>
      </div>}

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column' as const, gap: 20 }}>

        {/* Score */}
        <div style={{ ...cardStyle, padding: '20px 24px', borderRadius: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Lead Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 64, height: 64 }}>
              <svg width={64} height={64} viewBox="0 0 64 64">
                <circle cx={32} cy={32} r={28} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
                <circle cx={32} cy={32} r={28} fill="none" stroke={scoreColors[adminData.scoreLabel]} strokeWidth={4}
                  strokeDasharray={`${(adminData.score / 100) * 176} 176`} strokeLinecap="round"
                  transform="rotate(-90 32 32)" style={{ transition: 'all 0.8s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: T.white }}>
                {adminData.score}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: scoreColors[adminData.scoreLabel] }}>
                {scoreLabels[adminData.scoreLabel]}
              </div>
              <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>{adminData.messageCount} mensagens trocadas</div>
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div style={{ ...cardStyle, padding: '20px 24px', borderRadius: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 14 }}>Pipeline</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['greeting', 'qualification', 'needs_discovery', 'recommendation', 'scheduling', 'handoff'].map((step) => {
              const isCurrent = step === adminData.step;
              const isPast = ['greeting', 'qualification', 'needs_discovery', 'recommendation', 'scheduling', 'handoff']
                .indexOf(step) < ['greeting', 'qualification', 'needs_discovery', 'recommendation', 'scheduling', 'handoff'].indexOf(adminData.step);
              return (
                <div key={step} style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: isCurrent ? color : isPast ? `${color}60` : 'rgba(255,255,255,0.06)',
                  transition: 'all 0.5s ease',
                }} title={step} />
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 20 }}>{stepIcons[adminData.step] ?? '📋'}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{adminData.step.replace(/_/g, ' ')}</span>
            <span style={{ fontSize: 12, color: T.dim }}>• intent: {adminData.intent}</span>
          </div>
        </div>

        {/* Profile collected */}
        <div style={{ ...cardStyle, padding: '20px 24px', borderRadius: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 14 }}>Perfil Coletado</div>
          {profileEntries.length === 0 ? (
            <p style={{ fontSize: 13, color: T.dim, fontStyle: 'italic' }}>Aguardando dados da conversa...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              {profileEntries.map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: T.muted, textTransform: 'capitalize' as const }}>{key.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.white, background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 8 }}>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment */}
        {hasAppointment && adminData.appointment && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ ...cardStyle, padding: '20px 24px', borderRadius: 20, borderColor: `${color}30` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: color, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 14 }}>📅 Agendamento</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: T.muted }}>Tipo</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.white }}>{adminData.appointment.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: T.muted }}>Data</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.white }}>{adminData.appointment.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: T.muted }}>Horário</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.white }}>{adminData.appointment.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: T.muted }}>Responsável</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.white }}>{assistant}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: T.muted }}>Status</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>✓ Confirmado</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Handoff briefing */}
        {showBriefing && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ ...cardStyle, padding: '20px 24px', borderRadius: 20, borderColor: '#EC489930' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#EC4899', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 14 }}>🤝 Resumo Executivo</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
              {/* Score badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', background: scoreColors[adminData.scoreLabel] }}>
                  {adminData.score}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.white }}>Lead {scoreLabels[adminData.scoreLabel].replace(/🔥|❄️ /g, '').trim()}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>{adminData.messageCount} mensagens em {elapsed}s</div>
                </div>
              </div>

              {/* Narrative briefing */}
              <p style={{ fontSize: 13, color: T.gray, lineHeight: 1.75, margin: 0 }}>
                {(() => {
                  const p = adminData.profile;
                  const parts: string[] = [];

                  // Build narrative from profile
                  if (p['área']) parts.push(`Precisa de atendimento em ${p['área']}.`);
                  if (p['tipo'] || p['curso']) parts.push(`Interesse em ${p['tipo'] || p['curso']}.`);
                  if (p['objetivo']) parts.push(`Objetivo: ${p['objetivo']}.`);
                  if (p['orçamento'] || p['preco_mencionado']) parts.push(`Orçamento: ${p['orçamento'] || p['preco_mencionado']}.`);
                  if (p['nível']) parts.push(`Nível atual: ${p['nível']}.`);
                  if (p['modalidade']) parts.push(`Prefere ${p['modalidade']}.`);
                  if (p['formato']) parts.push(`Formato: ${p['formato']}.`);
                  if (p['frequência']) parts.push(`Frequência: ${p['frequência']}.`);
                  if (p['quartos']) parts.push(`Busca ${p['quartos']}.`);
                  if (p['bairro'] || p['região']) parts.push(`Região: ${p['bairro'] || p['região']}.`);
                  if (p['finalidade']) parts.push(`Finalidade: ${p['finalidade']}.`);
                  if (p['urgência']) parts.push(`Urgência ${String(p['urgência']).toLowerCase()}.`);
                  if (p['prazo']) parts.push(`Prazo: ${p['prazo']}.`);

                  if (parts.length === 0) parts.push('Lead em fase inicial de qualificação.');

                  return parts.join(' ');
                })()}
              </p>

              {/* Appointment status */}
              {hasAppointment && adminData.appointment && (
                <div style={{ fontSize: 13, color: '#10B981', fontWeight: 600, background: 'rgba(16,185,129,0.08)', padding: '10px 14px', borderRadius: 12 }}>
                  Agendado: {adminData.appointment.type} — {adminData.appointment.date} as {adminData.appointment.time} com {assistant}
                </div>
              )}

              {wasCancelled && !hasAppointment && (
                <div style={{ fontSize: 13, color: '#EF4444', fontWeight: 600, background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 12 }}>
                  Lead cancelou. Mover para nutrição ou follow-up futuro.
                </div>
              )}

              {/* Action */}
              <div style={{ fontSize: 12, color: T.muted, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
                {wasCancelled
                  ? 'Ação: agendar follow-up em 7 dias.'
                  : hasAppointment
                    ? `Ação: ${assistant} confirmar presença e preparar atendimento.`
                    : `Ação: transferir para ${assistant} dar continuidade.`}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   CHAT WIDGET + ADMIN
   ═══════════════════════════════════════════════════ */
function ChatWidget({ apiKey, tenantName, assistant, color, emoji, msgs, onClose }: {
  apiKey: string; tenantName: string; assistant: string; color: string;
  emoji: string; msgs: string[]; onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, isLoading, currentStep, sendMessage, reset, adminData } = useChat({ apiKey, phone: `demo-${Date.now()}`, name: 'Visitante Demo' });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);
  const fire = () => { if (!input.trim() || isLoading) return; sendMessage(input.trim()); setInput(''); };

  const stepLabel: Record<string, string> = {
    greeting: '👋 Boas-vindas', qualification: '🎯 Qualificação', needs_discovery: '🔍 Descoberta',
    recommendation: '💡 Recomendação', scheduling: '📅 Agendamento', handoff: '🤝 Transferência',
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [mobileAdmin, setMobileAdmin] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      style={{
        position: 'fixed', zIndex: 50,
        ...(isMobile
          ? { inset: 0, display: 'flex', flexDirection: 'column' as const }
          : { bottom: 24, right: 24, display: 'flex', gap: 16, alignItems: 'flex-end' }),
      }}>

      {/* Admin Panel - desktop: side panel */}
      {!isMobile && (
        <AnimatePresence>
          {showAdmin && <AdminPanel adminData={adminData} color={color} assistant={assistant} />}
        </AnimatePresence>
      )}

      {/* Admin Panel - mobile: fullscreen popup */}
      <AnimatePresence>
        {isMobile && mobileAdmin && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: '#0A0C18', overflowY: 'auto' as const,
            }}>
            {/* Close bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky' as const, top: 0, background: '#0A0C18', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} color={color} />
                <span style={{ fontSize: 15, fontWeight: 700, color: T.white }}>Painel Admin</span>
              </div>
              <button onClick={() => setMobileAdmin(false)}
                style={{ padding: '8px 16px', borderRadius: 12, background: `${color}15`, border: 'none', color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Voltar ao chat
              </button>
            </div>
            <AdminPanel adminData={adminData} color={color} assistant={assistant} isMobilePopup />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat */}
      <div style={{
        ...(isMobile
          ? { width: '100%', height: '100%', borderRadius: 0 }
          : { width: 420, height: 640, borderRadius: 28 }),
        display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
        background: '#0A0C18',
        border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isMobile ? 'none' : `0 0 100px ${color}12, 0 40px 80px rgba(0,0,0,0.6)`,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: `${color}12`, border: `1px solid ${color}20` }}>{emoji}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.white }}>{assistant}</div>
              <div style={{ fontSize: 12, color: T.dim, marginTop: 2 }}>{tenantName}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, fontWeight: 600, background: `${color}12`, color }}>{stepLabel[currentStep] ?? currentStep}</span>
            <button onClick={() => isMobile ? setMobileAdmin(v => !v) : setShowAdmin(v => !v)} title="Painel Admin"
              style={{ padding: 8, borderRadius: 12, background: (showAdmin || mobileAdmin) ? `${color}18` : 'transparent', border: 'none', color: (showAdmin || mobileAdmin) ? color : T.dim, cursor: 'pointer', transition: 'all 0.2s' }}>
              <BarChart3 size={15} />
            </button>
            <button onClick={reset} style={{ padding: 8, borderRadius: 12, background: 'transparent', border: 'none', color: T.dim, cursor: 'pointer' }}><RotateCcw size={14} /></button>
            <button onClick={onClose} style={{ padding: 8, borderRadius: 12, background: 'transparent', border: 'none', color: T.dim, cursor: 'pointer' }}><X size={15} /></button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto' as const, padding: '24px 20px' }}>
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div style={{ textAlign: 'center' as const, marginBottom: 32, paddingTop: 16 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</div>
                <p style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 6 }}>Olá! Sou {assistant}.</p>
                <p style={{ fontSize: 13, color: T.dim }}>Clique em uma sugestão ou escreva sua mensagem.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {msgs.map((m, i) => (
                  <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
                    onClick={() => !isLoading && sendMessage(m)}
                    style={{
                      width: '100%', textAlign: 'left' as const, borderRadius: 18, padding: '16px 20px',
                      fontSize: 13, color: T.gray, lineHeight: 1.5,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer', transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = T.white; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = T.gray; }}>
                    {m}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            <AnimatePresence>
              {messages.map((msg: ChatMessage) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                  style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%', padding: '14px 20px', fontSize: 14, lineHeight: 1.65,
                    borderRadius: msg.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                    ...(msg.role === 'user' ? { background: color, color: 'white' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', color: '#D1D5DB' }),
                  }}>{msg.content}</div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', gap: 6, padding: '16px 20px', borderRadius: '20px 20px 20px 6px', width: 'fit-content', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[0, 1, 2].map(i => <span key={i} className="typing-dot" style={{ width: 8, height: 8, borderRadius: 4, background: T.dim, display: 'inline-block' }} />)}
              </motion.div>
            )}
          </div>
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fire()} placeholder="Digite sua mensagem..." disabled={isLoading}
              style={{
                flex: 1, padding: '14px 20px', fontSize: 16, borderRadius: 18, outline: 'none',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: T.white, opacity: isLoading ? 0.4 : 1,
              }} />
            <button onClick={fire} disabled={isLoading || !input.trim()}
              style={{ padding: 14, borderRadius: 16, background: color, color: 'white', border: 'none', cursor: 'pointer', opacity: (!input.trim() || isLoading) ? 0.2 : 1, transition: 'all 0.2s' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   DEMO CARDS
   ═══════════════════════════════════════════════════ */
const demos = [
  { id: 'imob', name: 'Imobiliária Prime', assistant: 'Sofia', emoji: '🏠', apiKey: 'sdr_8f892cfc24f15c3226be78f7e1805931f0d762f1fa471c8c8d90c6017d3d77c2', color: '#8B5CF6', desc: 'Qualifica compradores, recomenda imóveis do catálogo e agenda visitas com corretores automaticamente.', tags: ['Imóveis', 'Visitas', 'Financiamento'], msgs: ['Oi, estou procurando um apartamento de 2 quartos na zona sul', 'Quero comprar uma casa até 500 mil', 'Vi um anúncio de vocês sobre um AP em Moema'] },
  { id: 'escola', name: 'English Plus Academy', assistant: 'Lucas', emoji: '📚', apiKey: 'sdr_06be227e6db80bb27c114de47488c108732559513c2a7a0de4c01bac5e966e09', color: '#3B82F6', desc: 'Entende o nível do aluno, recomenda o curso ideal e agenda aulas experimentais gratuitas.', tags: ['Cursos', 'Certificação', 'Aula grátis'], msgs: ['Preciso aprender inglês pra uma entrevista de emprego', 'Quanto custa o curso de business english?', 'Tenho nível intermediário e quero fazer TOEFL'] },
  { id: 'adv', name: 'Martins & Associados', assistant: 'Dra. Ana', emoji: '⚖️', apiKey: 'sdr_c03db782ff69f478688a14500d48ee5e414b67ddef92560a25b6bd8cacff13ae', color: '#10B981', desc: 'Acolhe o potencial cliente com empatia, entende o caso jurídico e agenda consultas gratuitas.', tags: ['Consulta grátis', 'Sigiloso', 'Online'], msgs: ['Estou passando por um divórcio e preciso de orientação', 'Fui demitido sem justa causa, quais meus direitos?', 'Preciso de um advogado para revisar um contrato'] },
];

function DemoCard({ d, onClick }: { d: typeof demos[0]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        ...cardStyle,
        overflow: 'hidden', cursor: 'pointer',
        borderColor: hovered ? `${d.color}40` : T.cardBorder,
        transform: hovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 24px 60px rgba(0,0,0,0.35), 0 0 40px ${d.color}10` : '0 4px 20px rgba(0,0,0,0.15)',
      }}>
      {/* Top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${d.color}, ${d.color}50)` }} />

      <div style={{ padding: '36px 32px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0,
            background: `${d.color}0A`, border: `1px solid ${d.color}15`,
            transform: hovered ? 'scale(1.08) rotate(3deg)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}>{d.emoji}</div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: T.white, letterSpacing: '-0.01em' }}>{d.name}</h3>
            <p style={{ fontSize: 13, color: T.dim, marginTop: 3 }}>Assistente: <span style={{ color: T.gray }}>{d.assistant}</span></p>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75, marginBottom: 24 }}>{d.desc}</p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 28 }}>
          {d.tags.map(t => (
            <span key={t} style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 100, background: `${d.color}0C`, color: d.color, border: `1px solid ${d.color}18` }}>{t}</span>
          ))}
        </div>

        {/* CTA */}
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '16px 0', borderRadius: 18, fontSize: 14, fontWeight: 700, color: 'white',
          background: d.color, border: 'none', cursor: 'pointer',
          boxShadow: hovered ? `0 8px 30px ${d.color}35` : 'none',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'all 0.35s ease',
        }}>
          <MessageCircle size={16} /> Conversar com {d.assistant}
        </button>
      </div>
    </div>
  );
}

function DemoSection() {
  const [active, setActive] = useState<string | null>(null);
  const demo = demos.find(d => d.id === active);

  return (
    <section id="demos" style={{ padding: '140px 24px', position: 'relative' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative' }}>
        <Reveal>
          <div style={{ textAlign: 'center' as const, marginBottom: 80 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 100, marginBottom: 24, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
              <Play size={13} color="#34d399" fill="#34d399" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Demo ao vivo</span>
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: T.white, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Teste agora.<br /><span className="text-gradient">Escolha uma indústria.</span>
            </h2>
            <p style={{ fontSize: 17, color: T.muted, maxWidth: 520, margin: '20px auto 0', fontWeight: 400, lineHeight: 1.7 }}>
              Converse com a IA como se fosse um lead real. Cada demo tem personalidade e catálogo próprio.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {demos.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.1}>
              <DemoCard d={d} onClick={() => setActive(d.id)} />
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {demo && <ChatWidget apiKey={demo.apiKey} tenantName={demo.name} assistant={demo.assistant} color={demo.color} emoji={demo.emoji} msgs={demo.msgs} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ padding: '120px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' as const }}>
        <Reveal>
          <h2 style={{ fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 800, color: T.white, lineHeight: 1.15, marginBottom: 16 }}>
            Pronto para automatizar<br /><span className="text-gradient">suas vendas?</span>
          </h2>
          <p style={{ fontSize: 17, color: T.muted, marginBottom: 48, fontWeight: 400 }}>Configure seu SDR em minutos. Funciona com qualquer indústria.</p>
          <a href="https://wa.me/5561984188926" target="_blank" rel="noopener noreferrer" className="btn-brand" style={{ fontSize: 16, padding: '18px 40px', borderRadius: 18 }}>
            Falar com a equipe <ChevronRight size={17} />
          </a>
        </Reveal>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 96, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <img src="/logos/icon.png" alt="Logos Tech" style={{ height: 28, opacity: 0.5 }} />
          <p style={{ fontSize: 12, color: '#1F2937' }}>© 2026 Logos Tech. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════ */
export default function App() {
  return (
    <div style={{ minHeight: '100dvh', background: T.bg }}>
      <Hero />
      <Features />
      <HowItWorks />
      <DemoSection />
      <Footer />
    </div>
  );
}
