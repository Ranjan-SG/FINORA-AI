import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, RefreshCw, Sparkles, Mic, MicOff, 
  ArrowRight, HelpCircle, CheckCircle, Volume2, Info 
} from 'lucide-react';
import { ChatMessage } from '../types';
import GlowTiltCard from './GlowTiltCard';

interface AIAdvisorChatProps {
  chatHistory: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
  currencySymbol: string;
}

export default function AIAdvisorChat({
  chatHistory,
  onSendMessage,
  onClearHistory,
  currencySymbol
}: AIAdvisorChatProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Standard prompt suggestion chips
  const suggestionChips = [
    "How can I cut subscription costs?",
    "Where is my largest spending leakage?",
    "How do I reach my Tokyo Vacation goal faster?",
    "Suggest a growth portfolio for my risk profile"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput('');
    try {
      await onSendMessage(text);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleVoiceToggle = () => {
    setIsVoiceListening(!isVoiceListening);
    if (!isVoiceListening) {
      // Simulate listening, then input a custom speech prompt
      setTimeout(() => {
        setIsVoiceListening(false);
        setInput("Summarize my financial standing and tell me how to increase my health score.");
      }, 3000);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, sending]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2 tracking-tight">
          Interactive Advisory Chatbot
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Have an end-to-end conversation with our deep-learning advisor regarding asset weightings and ledger entries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left pane: advisory metadata & speech metrics */}
        <div className="lg:col-span-1 space-y-4">
          <GlowTiltCard 
            glowColor="rgba(99, 102, 241, 0.15)"
            className="p-5 h-full flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-900">
                <h3 className="text-xs font-bold font-mono tracking-widest text-indigo-400 uppercase">AI Capability Mesh</h3>
                <p className="text-[10px] text-slate-400 mt-1">Learn what queries the deep neural network can process instantly.</p>
              </div>

              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl space-y-1 hover:border-indigo-500/10 transition">
                  <span className="text-[9px] font-mono text-indigo-300 uppercase tracking-widest font-bold block">Ledger Audits</span>
                  <p className="text-slate-400 leading-relaxed font-sans">Ask "What did I spend at Amazon?" or "Filter food expenses over ₹2,500".</p>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl space-y-1 hover:border-emerald-500/10 transition">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">Milestone Boosters</span>
                  <p className="text-slate-400 leading-relaxed font-sans">Ask "How can I save ₹50,000 for my Emergency buffer?" or "Calculate completion dates".</p>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl space-y-1 hover:border-amber-500/10 transition">
                  <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-bold block">Portfolio Builders</span>
                  <p className="text-slate-400 leading-relaxed font-sans">Ask "Evaluate my risk assets" or "Suggest alternative equity ETFs".</p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-900/60">
              <button 
                onClick={onClearHistory}
                className="w-full py-2 border border-slate-850 hover:border-rose-500/20 bg-slate-950/50 hover:bg-rose-950/10 text-slate-450 hover:text-rose-400 text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition duration-300"
              >
                Clear History Logs
              </button>
            </div>
          </GlowTiltCard>
        </div>

        {/* Right pane: conversational container */}
        <div className="lg:col-span-2 flex flex-col h-[520px] rounded-[24px] border border-slate-850/75 bg-[#07070c]/70 backdrop-blur-xl overflow-hidden shadow-2xl relative">
          
          {/* Header */}
          <div className="p-4 bg-slate-950/65 border-b border-slate-900/80 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block tracking-wide font-sans">Personal Financial Intelligence</span>
                <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> CONTEXT SYNCED
                </span>
              </div>
            </div>
            
            {/* Visual voice assistant equalizer */}
            {isVoiceListening && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                <span className="h-2.5 w-[2px] bg-rose-500 animate-[bounce_0.8s_infinite]" />
                <span className="h-3 w-[2px] bg-rose-500 animate-[bounce_0.5s_infinite]" style={{ animationDelay: '0.15s' }} />
                <span className="h-2 w-[2px] bg-rose-500 animate-[bounce_0.6s_infinite]" style={{ animationDelay: '0.3s' }} />
                LISTENING...
              </div>
            )}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-[#09090e]/20 to-[#07070b]/20">
            {chatHistory.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`p-2 rounded-xl shrink-0 h-fit border transition-all duration-300 ${
                  m.sender === 'user' 
                    ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                    : 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                }`}>
                  {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`p-3 rounded-2xl space-y-1.5 transition-all duration-300 shadow-lg ${
                  m.sender === 'user' 
                    ? 'bg-blue-950/20 border border-blue-500/15 text-blue-200' 
                    : 'bg-slate-900/40 border border-slate-850/60 text-slate-200'
                }`}>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">{m.text}</p>
                  <span className="text-[8px] text-slate-500 block text-right font-mono mt-1 tracking-wider font-bold">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="p-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl h-fit">
                  <Bot className="h-4 w-4 animate-bounce" />
                </div>
                <div className="p-3 bg-slate-900/40 border border-slate-850/60 rounded-2xl">
                  <span className="text-xs text-slate-400 font-mono tracking-wide flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    Processing financial graph...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chips & Footer form */}
          <div className="p-4 bg-slate-950/50 border-t border-slate-900 space-y-3 backdrop-blur-md">
            
            {/* suggestion chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {suggestionChips.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1.5 text-[10px] bg-slate-900/60 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-300 rounded-full border border-slate-850 hover:border-indigo-500/30 transition-all duration-300 shrink-0 font-sans font-medium tracking-wide"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  isVoiceListening 
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse' 
                    : 'bg-slate-900/80 hover:bg-slate-850 border-slate-850 text-slate-450 hover:text-slate-200'
                }`}
                title="Voice Dictation"
              >
                {isVoiceListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <input 
                type="text"
                placeholder="Ask advice (e.g. 'How can I save for vacation?')..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
              />

              <button
                onClick={() => handleSend(input)}
                disabled={sending || !input.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition duration-200 shadow-lg shadow-indigo-600/15 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
