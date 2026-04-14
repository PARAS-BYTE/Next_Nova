"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings2, Cpu, BrainCircuit, HelpCircle, Sparkles, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface TutorSettingsProps {
  mode: string;
  setMode: (m: string) => void;
  language: string;
  setLanguage: (l: string) => void;
}

export default function TutorSettings({ mode, setMode, language, setLanguage }: TutorSettingsProps) {
  const modes = [
    { id: "standard", label: "Standard", desc: "Balanced teaching", icon: BrainCircuit },
    { id: "socratic", label: "Socratic", desc: "Guiding questions", icon: HelpCircle },
    { id: "analogy", label: "Analogy", desc: "Real-world stories", icon: Sparkles },
    { id: "simple", label: "ELI5", desc: "For beginners", icon: Lightbulb },
    { id: "coding", label: "Code-First", desc: "Syntax & logic", icon: Cpu },
  ];

  const languages = [
    { id: "english", label: "English" },
    { id: "hinglish", label: "Hinglish" },
    { id: "hindi", label: "Hindi" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-900 transition-all">
          <Settings2 className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white border-zinc-200 text-zinc-900 shadow-2xl rounded-2xl p-2" align="end">
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-3 py-2">Neural Directives</DropdownMenuLabel>
        
        <div className="space-y-1">
          {modes.map((m) => (
            <DropdownMenuItem 
              key={m.id}
              onClick={() => { setMode(m.id); toast.success(`Teaching Style: ${m.label}`); }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${mode === m.id ? "bg-emerald-50 text-emerald-700" : "hover:bg-zinc-50"}`}
            >
              <div className={`p-2 rounded-lg ${mode === m.id ? "bg-emerald-500/10" : "bg-zinc-100"}`}>
                <m.icon className={`w-4 h-4 ${mode === m.id ? "text-emerald-600" : "text-zinc-400"}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">{m.label}</span>
                <span className={`text-[9px] ${mode === m.id ? "text-emerald-600/60" : "text-zinc-400"}`}>{m.desc}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="my-2 bg-zinc-100" />
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-3 py-2">Language Matrix</DropdownMenuLabel>
        
        <div className="flex gap-1 p-1 bg-zinc-50 rounded-xl">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => { setLanguage(l.id); toast.success(`Language Mode: ${l.label}`); }}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${language === l.id ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
