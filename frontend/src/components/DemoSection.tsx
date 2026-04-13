import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Building2, GraduationCap, Scale } from 'lucide-react';
import { ChatWidget } from './ChatWidget';

interface DemoTenant {
  id: string;
  name: string;
  slug: string;
  apiKey: string;
  assistantName: string;
  icon: typeof Building2;
  accentColor: string;
  avatarEmoji: string;
  description: string;
  tags: string[];
  suggestedMessages: string[];
  gradient: string;
}

const demos: DemoTenant[] = [
  {
    id: 'imobiliaria',
    name: 'Imobiliária Prime',
    slug: 'imobiliaria-demo',
    apiKey: 'sdr_8f892cfc24f15c3226be78f7e1805931f0d762f1fa471c8c8d90c6017d3d77c2',
    assistantName: 'Sofia',
    icon: Building2,
    accentColor: '#8B5CF6',
    avatarEmoji: '🏠',
    description: 'SDR para imobiliárias. Qualifica compradores, recomenda imóveis e agenda visitas automaticamente.',
    tags: ['Imóveis', 'Visitas', 'Financiamento'],
    suggestedMessages: [
      'Oi, estou procurando um apartamento de 2 quartos na zona sul',
      'Quero comprar uma casa até 500 mil',
      'Vi um anúncio de vocês no Instagram sobre um AP em Moema',
    ],
    gradient: 'from-violet-500/20 to-purple-600/5',
  },
  {
    id: 'escola',
    name: 'English Plus Academy',
    slug: 'escola-ingles-demo',
    apiKey: 'sdr_06be227e6db80bb27c114de47488c108732559513c2a7a0de4c01bac5e966e09',
    assistantName: 'Lucas',
    icon: GraduationCap,
    accentColor: '#3B82F6',
    avatarEmoji: '📚',
    description: 'SDR para escolas de idiomas. Entende o nível do aluno, recomenda cursos e agenda aulas experimentais.',
    tags: ['Cursos', 'Certificação', 'Aula grátis'],
    suggestedMessages: [
      'Oi! Preciso aprender inglês pra uma entrevista de emprego',
      'Quanto custa o curso de inglês para negócios?',
      'Tenho nível intermediário e quero fazer TOEFL',
    ],
    gradient: 'from-blue-500/20 to-cyan-600/5',
  },
  {
    id: 'advocacia',
    name: 'Martins & Associados',
    slug: 'advocacia-demo',
    apiKey: 'sdr_c03db782ff69f478688a14500d48ee5e414b67ddef92560a25b6bd8cacff13ae',
    assistantName: 'Dra. Ana',
    icon: Scale,
    accentColor: '#10B981',
    avatarEmoji: '⚖️',
    description: 'SDR para escritórios de advocacia. Acolhe o cliente, entende o caso e agenda consultas com o especialista.',
    tags: ['Consulta grátis', 'Sigiloso', 'Online'],
    suggestedMessages: [
      'Boa tarde, estou passando por um divórcio e preciso de orientação',
      'Fui demitido sem justa causa, quais meus direitos?',
      'Preciso de um advogado para revisar um contrato',
    ],
    gradient: 'from-emerald-500/20 to-green-600/5',
  },
];

export function DemoSection() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const activeDemo = demos.find(d => d.id === activeChat);

  return (
    <section id="demos" className="py-24 px-6 relative">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20 mb-6">
            <MessageSquare size={14} className="text-accent-green" />
            <span className="text-sm text-accent-green font-medium">Demo ao vivo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Teste agora.{' '}
            <span className="gradient-text">Escolha uma indústria.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Cada demo tem sua própria personalidade, catálogo e fluxo de qualificação.
            Converse com a IA como se fosse um lead real.
          </p>
        </motion.div>

        {/* Demo cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demos.map((demo, i) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative group rounded-2xl border border-white/5 hover:border-white/10 overflow-hidden bg-gradient-to-br ${demo.gradient} backdrop-blur-sm transition-all duration-300 cursor-pointer`}
              onClick={() => setActiveChat(demo.id)}
              style={{
                boxShadow: activeChat === demo.id ? `0 0 40px ${demo.accentColor}20` : undefined,
              }}
            >
              {/* Card content */}
              <div className="p-7">
                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${demo.accentColor}15`, border: `1px solid ${demo.accentColor}25` }}
                  >
                    {demo.avatarEmoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{demo.name}</h3>
                    <p className="text-xs text-gray-400">Assistente: {demo.assistantName}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed mb-5">
                  {demo.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {demo.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: `${demo.accentColor}10`, color: demo.accentColor, border: `1px solid ${demo.accentColor}20` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
                  style={{ background: demo.accentColor }}
                >
                  <MessageSquare size={14} className="inline mr-2 -mt-0.5" />
                  Conversar com {demo.assistantName}
                </motion.button>
              </div>

              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 100%, ${demo.accentColor}08, transparent 70%)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Widget */}
      <AnimatePresence>
        {activeDemo && (
          <ChatWidget
            apiKey={activeDemo.apiKey}
            tenantName={activeDemo.name}
            assistantName={activeDemo.assistantName}
            accentColor={activeDemo.accentColor}
            onClose={() => setActiveChat(null)}
            suggestedMessages={activeDemo.suggestedMessages}
            avatarEmoji={activeDemo.avatarEmoji}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
