import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-3 bg-card rounded-2xl rounded-bl-sm w-fit"
    >
      <div className="flex gap-1">
        <span className="typing-dot w-2 h-2 rounded-full bg-brand/60 inline-block" />
        <span className="typing-dot w-2 h-2 rounded-full bg-brand/60 inline-block" />
        <span className="typing-dot w-2 h-2 rounded-full bg-brand/60 inline-block" />
      </div>
      <span className="text-xs text-gray-500 ml-1">digitando...</span>
    </motion.div>
  );
}
