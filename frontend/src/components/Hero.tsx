import { motion } from 'framer-motion';
import { Bot, Zap, ArrowDown } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden grid-bg">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <img src="/logos/logostech-color.png" alt="Logos Tech" className="h-10 object-contain" />
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 mb-8"
      >
        <Bot size={16} className="text-brand" />
        <span className="text-sm text-brand-light font-medium">SDR Automatizado com IA</span>
        <Zap size={14} className="text-accent-orange" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-5xl md:text-7xl font-bold text-center leading-tight max-w-4xl"
      >
        <span className="text-white">Seu vendedor IA</span>
        <br />
        <span className="gradient-text">que nunca dorme</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mt-6 leading-relaxed"
      >
        Atendimento 24/7 no WhatsApp. Qualifica leads, recomenda produtos e agenda reuniões
        — tudo com conversa natural que seus clientes vão amar.
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="flex flex-wrap justify-center gap-8 mt-12"
      >
        {[
          { value: '< 5s', label: 'Tempo de resposta' },
          { value: '24/7', label: 'Disponibilidade' },
          { value: '3x', label: 'Mais agendamentos' },
          { value: '85%', label: 'Taxa de qualificação' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-12 flex flex-col items-center gap-4"
      >
        <a
          href="#demos"
          className="px-8 py-4 bg-brand hover:bg-brand-light text-white font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand/20 active:scale-95"
        >
          Testar demos ao vivo ↓
        </a>
        <span className="text-xs text-gray-600">Sem cadastro. Converse agora com a IA.</span>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ArrowDown size={20} className="text-gray-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}
