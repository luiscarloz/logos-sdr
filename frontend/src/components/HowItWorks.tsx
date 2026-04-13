import { motion } from 'framer-motion';
import { Smartphone, Brain, BarChart3, CalendarCheck, UserCheck } from 'lucide-react';

const steps = [
  {
    icon: Smartphone,
    number: '01',
    title: 'Lead entra',
    description: 'WhatsApp, landing page, Instagram — o lead chega por qualquer canal e é atendido em menos de 5 segundos.',
    color: '#6C63FF',
  },
  {
    icon: Brain,
    number: '02',
    title: 'IA qualifica',
    description: 'Conversa natural que extrai necessidades, orçamento, urgência e perfil sem parecer interrogatório.',
    color: '#3B82F6',
  },
  {
    icon: BarChart3,
    number: '03',
    title: 'Lead scoring',
    description: 'Sistema de pontuação automática classifica: quente, morno ou frio. Priorize quem está pronto.',
    color: '#F59E0B',
  },
  {
    icon: CalendarCheck,
    number: '04',
    title: 'Agendamento',
    description: 'A IA agenda visitas, aulas experimentais ou consultas direto na agenda do time.',
    color: '#10B981',
  },
  {
    icon: UserCheck,
    number: '05',
    title: 'Handoff',
    description: 'Lead qualificado é transferido pro vendedor com briefing completo: perfil, necessidades e histórico.',
    color: '#EC4899',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 w-[300px] h-[600px] bg-brand/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Como funciona
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Do primeiro contato ao agendamento — em minutos, não dias.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[39px] top-0 bottom-0 w-px bg-gradient-to-b from-brand/20 via-brand/10 to-transparent hidden md:block" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex items-start gap-6 group"
              >
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center border border-white/5"
                    style={{ background: `${step.color}10` }}
                  >
                    <step.icon size={28} style={{ color: step.color }} />
                  </motion.div>
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: step.color }}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-light transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
