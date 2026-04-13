import { motion } from 'framer-motion';
import { Sparkles, Target, Clock, Brain, ArrowRightLeft, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Rapport Automático',
    description: 'Detecta estilo do lead: formal, informal, uso de emoji, velocidade. Espelha o tom da conversa.',
    color: '#8B5CF6',
  },
  {
    icon: Target,
    title: 'Qualificação Natural',
    description: 'Extrai BANT/SPIN organicamente sem interrogatório. Conversa fluida que qualifica.',
    color: '#3B82F6',
  },
  {
    icon: Clock,
    title: 'Timing Humano',
    description: 'Respostas com delay realista de 5-60s. Simula digitação. Parece gente de verdade.',
    color: '#10B981',
  },
  {
    icon: Brain,
    title: 'Memória Persistente',
    description: 'Retoma conversas semanas depois com contexto total. Nunca esquece um lead.',
    color: '#F59E0B',
  },
  {
    icon: ArrowRightLeft,
    title: 'Escalação Inteligente',
    description: 'Frustração, negociação, alta intenção → humano com briefing completo.',
    color: '#EC4899',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Nativo',
    description: 'Opera no canal que o lead já usa, sem fricção. Integração direta com Evolution API.',
    color: '#06B6D4',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export function Features() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Não é um chatbot.
            <br />
            <span className="gradient-text">É um vendedor de verdade.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Tecnologia de ponta que entende, qualifica e converte — com a naturalidade
            de uma conversa entre humanos.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative p-6 rounded-2xl bg-card border border-white/5 hover:border-white/10 transition-all duration-300 cursor-default"
              style={{
                boxShadow: `0 0 0 rgba(0,0,0,0)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 40px ${feature.color}10, 0 4px 20px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${feature.color}15` }}
              >
                <feature.icon size={20} style={{ color: feature.color }} />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
