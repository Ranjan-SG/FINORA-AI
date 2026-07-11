import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, X, MessageSquare, HelpCircle, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIFloatingChatProps {
  chatHistory: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
  currencySymbol: string;
}

export default function AIFloatingChat({
  chatHistory,
  onSendMessage,
  onClearHistory,
  currencySymbol
}: AIFloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = async () => {
    setInputValue('');
    setIsTyping(false);
    await onClearHistory();
  };

  const chips = [
    'Analyze spending',
    'Suggest savings',
    'What is budgeting?',
    'SIP vs Fixed Deposit',
    'Emergency Fund explanation'
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, chatHistory, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setIsTyping(true);
    setInputValue('');
    try {
      await onSendMessage(text);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSend(inputValue);
    }
  };

  return (
    <div id="ai-floating-assistant" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* AnimatePresence for glassmorphic slide-up chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-compact-chat-window"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-4 w-90 max-w-[calc(100vw-32px)] h-120 max-h-[calc(100vh-100px)] rounded-3xl bg-[#0a0a0f]/80 border border-indigo-500/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden shadow-indigo-500/5"
          >
            {/* Glassmorphic header wrapper */}
            <div className="p-4 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center border border-indigo-400/20 shadow-lg shadow-indigo-500/25">
                  <Bot className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest font-mono">FINORA AI Advisor</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                    </span>
                    <span className="text-[9px] font-bold font-mono text-indigo-400 tracking-wider uppercase">Active Status</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  id="btn-clear-chat-history"
                  onClick={handleClear}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5 transition"
                  title="Reset Chat Logs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  id="btn-close-compact-chat"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5 transition"
                  title="Minimize Advisor"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-950/20 text-xs">
              {chatHistory.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`p-1.5 rounded-xl shrink-0 h-fit border transition-all duration-300 ${
                    m.sender === 'user'
                      ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                      : 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {m.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  <div className={`p-3 rounded-2xl space-y-1 transition-all duration-300 shadow-md ${
                    m.sender === 'user'
                      ? 'bg-blue-950/30 border border-blue-500/15 text-blue-200'
                      : 'bg-slate-900/40 border border-slate-900 text-slate-200'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap font-sans">{m.text}</p>
                    <span className="text-[7.5px] text-slate-500 block text-right font-mono tracking-wider font-bold">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 max-w-[80%]">
                  <div className="p-1.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl h-fit">
                    <Bot className="h-3.5 w-3.5 animate-bounce" />
                  </div>
                  <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center">
                    <span className="text-[10px] text-slate-400 font-mono tracking-wide flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      Analyzing ledger...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Footer with suggested chips and input area */}
            <div className="p-3 bg-slate-950/60 border-t border-slate-900 space-y-2.5 backdrop-blur-md">
              {/* Chip suggestions wrapper */}
              <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-none select-none">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-600/10 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/20 text-[9.5px] font-bold font-sans rounded-full text-slate-400 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Message submit form */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask FINORA AI..."
                  className="flex-1 bg-slate-950/70 border border-slate-900 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none placeholder-slate-700 font-sans transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-900 disabled:to-slate-950 disabled:text-slate-700 text-white rounded-xl transition duration-300 shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating circular glowing button */}
      <button
        id="btn-ai-floating-assistant"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative h-14 w-14 rounded-full flex items-center justify-center text-white cursor-pointer select-none border shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] ${
          isOpen
            ? 'bg-slate-950 border-indigo-500/40 text-indigo-400 shadow-indigo-500/20'
            : 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 border-indigo-400/30 shadow-indigo-500/30'
        }`}
        title="FINORA AI Assistant"
      >
        {/* Glow pulsing effect circle behind */}
        <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-60 scale-105 pointer-events-none" />

        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
}
