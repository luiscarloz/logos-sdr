import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, RotateCcw } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import type { ChatMessage } from '../hooks/useChat';
import { TypingIndicator } from './TypingIndicator';

interface ChatWidgetProps {
  apiKey: string;
  tenantName: string;
  assistantName: string;
  accentColor: string;
  onClose: () => void;
  suggestedMessages?: string[];
  avatarEmoji?: string;
}

export function ChatWidget({
  apiKey,
  tenantName,
  assistantName,
  accentColor,
  onClose,
  suggestedMessages = [],
  avatarEmoji = '🤖',
}: ChatWidgetProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, currentStep, sendMessage, reset } = useChat({
    apiKey,
    phone: `demo-${Date.now()}`,
    name: 'Visitante Demo',
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleSuggestion = (msg: string) => {
    if (isLoading) return;
    sendMessage(msg);
  };

  const stepLabels: Record<string, string> = {
    greeting: 'Boas-vindas',
    qualification: 'Qualificação',
    needs_discovery: 'Entendendo necessidades',
    recommendation: 'Recomendações',
    objection_handling: 'Negociação',
    scheduling: 'Agendamento',
    handoff: 'Transferência',
    nurturing: 'Nutrição',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-6 right-6 w-[420px] h-[620px] bg-surface-light rounded-2xl shadow-2xl border border-white/5 flex flex-col overflow-hidden z-50"
      style={{ boxShadow: `0 0 60px ${accentColor}15, 0 25px 50px rgba(0,0,0,0.5)` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-white/5"
        style={{ background: `linear-gradient(135deg, ${accentColor}15, transparent)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: `${accentColor}20` }}
          >
            {avatarEmoji}
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{assistantName}</div>
            <div className="text-xs text-gray-400">{tenantName}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Step indicator */}
          <div
            className="text-[10px] px-2 py-1 rounded-full font-medium"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            {stepLabels[currentStep] ?? currentStep}
          </div>
          <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Reiniciar conversa">
            <RotateCcw size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-8"
          >
            <div className="text-4xl mb-3">{avatarEmoji}</div>
            <p className="text-gray-400 text-sm mb-1">Olá! Eu sou {assistantName}.</p>
            <p className="text-gray-500 text-xs">Envie uma mensagem para começar a conversa.</p>

            {suggestedMessages.length > 0 && (
              <div className="mt-5 space-y-2">
                {suggestedMessages.map((msg, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    onClick={() => handleSuggestion(msg)}
                    className="block w-full text-left text-xs px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-gray-300 transition-colors"
                  >
                    💬 {msg}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg: ChatMessage) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-2xl rounded-br-sm text-white'
                    : 'rounded-2xl rounded-bl-sm bg-card text-gray-200'
                }`}
                style={msg.role === 'user' ? { background: accentColor } : undefined}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5 bg-surface-light">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1 bg-card rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none border border-white/5 focus:border-brand/30 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl text-white transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
            style={{ background: accentColor }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
