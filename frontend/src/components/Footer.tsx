import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para automatizar suas vendas?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Configure seu SDR em minutos. Funciona com qualquer indústria.
          </p>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand hover:bg-brand-light text-white font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand/20"
          >
            Falar com a equipe
          </a>
        </motion.div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <div className="flex items-center gap-3">
            <img src="/logos/logostech-color.png" alt="Logos Tech" className="h-6" />
          </div>
          <p className="text-xs text-gray-600">
            © 2026 Logos Tech. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
