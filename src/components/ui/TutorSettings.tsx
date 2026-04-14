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
import { Settings2, Volume2, Languages, Cpu, BrainCircuit } from "lucide-react";

export default function TutorSettings() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors">
          <Settings2 className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#0A0A0C] border-white/5 text-white" align="end">
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#7C6AFA]">Tutor Configuration</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        
        <DropdownMenuItem className="flex items-center gap-3 p-3 focus:bg-white/5 cursor-pointer">
          <Languages className="w-4 h-4 text-white/40" />
          <div className="flex flex-col">
            <span className="text-xs font-bold">Language Mode</span>
            <span className="text-[9px] text-white/20">English / Hinglish / Hindi</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-3 p-3 focus:bg-white/5 cursor-pointer">
          <Volume2 className="w-4 h-4 text-white/40" />
          <div className="flex flex-col">
            <span className="text-xs font-bold">Conversational Voice</span>
            <span className="text-[9px] text-white/20">Adaptive speech patterns</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-3 p-3 focus:bg-white/5 cursor-pointer">
          <BrainCircuit className="w-4 h-4 text-white/40" />
          <div className="flex flex-col">
            <span className="text-xs font-bold">Complexity Level</span>
            <span className="text-[9px] text-white/20">Auto-balancing to Lv.12</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/5" />
        
        <DropdownMenuItem className="flex items-center gap-3 p-3 focus:bg-white/5 cursor-pointer">
          <Cpu className="w-4 h-4 text-[#7C6AFA]" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#7C6AFA]">Advanced Memory</span>
            <span className="text-[9px] text-[#7C6AFA]/40">Active across 8 topics</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
