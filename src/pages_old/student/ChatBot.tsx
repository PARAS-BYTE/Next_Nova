"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, X, Copy, Check, Sparkles, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { palette as themePalette } from "@/theme/palette";
import { toast } from "sonner";

export const palette = themePalette;

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<any>(null);
  const [mode, setMode] = useState("standard");
  const [language, setLanguage] = useState("english");
  const [voiceStyle, setVoiceStyle] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = {
      role: "user",
      content: input,
      id: Date.now(),
      time: new Date(),
    };

    setMessages((p) => [...p, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          mode,
          language,
          voiceStyle,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Mistral winds are still.");
      }

      const data = await response.json();
      
      setMessages((p) => [...p, {
        role: "model",
        content: data.reply || data.message,
        id: Date.now(),
        time: new Date()
      }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      let errorMsg = "⚠️ Mana flow interrupted. Mistral is unresponsive.";
      
      setMessages((p) => [...p, {
        role: "model",
        content: errorMsg,
        id: Date.now(),
        time: new Date()
      }]);
      toast.error("NovaAI connection lost.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-screen" style={{ background: '#050507', color: '#FFFFFF' }}>

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#0A0A0C' }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl border-2" style={{ background: 'rgba(124,106,250,0.1)', borderColor: 'rgba(124,106,250,0.2)' }}>
            <Bot className="text-[#7C6AFA] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-xl uppercase tracking-wider text-white">
              Nova<span style={{ color: '#7C6AFA' }}>AI</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8_#34D399]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Legendary Companion</p>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            onClick={clearChat}
            variant="ghost"
            className="rounded-xl text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" /> Clear Log
          </Button>
        )}
      </motion.header>

      {/* SETTINGS BAR */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#08080A' }}>
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white/70 focus:outline-none cursor-pointer">
          <option value="standard">Standard</option>
          <option value="doubt">Doubt Solving</option>
          <option value="simple">Simple Explain</option>
        </select>

        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white/70 focus:outline-none cursor-pointer">
          <option value="english">English</option>
          <option value="hinglish">Hinglish</option>
          <option value="hindi">Hindi</option>
        </select>

        <button onClick={() => setVoiceStyle(!voiceStyle)} className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-colors ${voiceStyle ? 'bg-[#7C6AFA]/20 border-[#7C6AFA]/40 text-[#7C6AFA]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'}`}>
          🗣 Conversational Voice
        </button>
      </div>

      {/* MESSAGES */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border-2 border-dashed"
              style={{ borderColor: 'rgba(124,106,250,0.1)', background: 'rgba(124,106,250,0.03)' }}>
              <Sparkles className="w-10 h-10 text-[#7C6AFA]/50" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider text-white mb-2">
              Summon Knowledge
            </h2>
            <p className="text-xs font-medium max-w-sm text-white/30 uppercase tracking-widest leading-relaxed">
              Ask about your courses, assignments, or any quest in the realm of LearnNova.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
              {["Explain React", "Study help", "Quest tips"].map((q) => (
                <Button
                  key={q}
                  onClick={() => setInput(q)}
                  variant="outline"
                  className="rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all hover:border-[#7C6AFA] hover:text-[#7C6AFA]"
                  style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
                >
                  {q}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[80%]">
                {m.role === "model" && (
                  <div className="flex items-center gap-2 mb-2 ml-1">
                    <Bot className="text-[#7C6AFA] w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#7C6AFA]">NovaAI</span>
                  </div>
                )}

                 <div
                  className={`p-4 rounded-2xl border-2 transition-all ${m.role === "user"
                      ? "bg-[#7C6AFA] border-[#7C6AFA] text-white rounded-br-none shadow-[0_4px_15_px_rgba(124,106,250,0.3)]"
                      : "bg-[#0A0A0C] border-white/5 text-white/80 rounded-bl-none"
                    }`}
                >
                  <div className="text-sm leading-relaxed">
                    <MarkdownPreview 
                      source={m.content} 
                      data-color-mode="dark"
                      style={{ 
                        background: 'transparent', 
                        color: m.role === 'user' ? '#FFFFFF' : 'rgba(255,255,255,0.8)',
                        fontSize: '0.875rem'
                      }}
                      className="markdown-override"
                    />
                  </div>
                </div>

                {m.role === "model" && (
                  <div className="flex items-center gap-3 mt-2 ml-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.content);
                        setCopiedId(m.id);
                        setTimeout(() => setCopiedId(null), 1500);
                      }}
                      className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      {copiedId === m.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      {copiedId === m.id ? "Copied" : "Copy"}
                    </button>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/10">
                      {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 text-white/30">
            <div className="p-2 bg-white/5 rounded-lg">
              <Loader2 className="animate-spin w-4 h-4 text-[#7C6AFA]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Consulting the archives...</span>
          </motion.div>
        )}

        <div ref={endRef} />
      </main>

      {/* INPUT */}
      <footer className="p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#0A0A0C' }}>
        <form onSubmit={sendMsg} className="flex gap-3 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your companion..."
              className="h-12 bg-white/[0.03] border-2 border-white/5 rounded-2xl text-white placeholder:text-white/20 px-6 text-sm focus:border-[#7C6AFA] transition-all"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-12 w-12 rounded-2xl p-0 transition-transform active:scale-95 shadow-lg shadow-[#7C6AFA]/20"
            style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', color: '#FFFFFF' }}
          >
            <Send size={18} />
          </Button>
        </form>
      </footer>

    </div>
  );
}