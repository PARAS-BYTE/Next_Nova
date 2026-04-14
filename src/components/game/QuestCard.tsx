'use client';
/* ═══════════════════════════════════════════════════════
   Quest Card — Strict G/W/B Optimized for Premium Visuals
   ═══════════════════════════════════════════════════════ */

import { motion } from 'framer-motion';
import { Swords, Zap, Coins, Lock, CheckCircle2, ChevronRight, Sparkles, Target } from 'lucide-react';
import type { Quest } from '@/game/types';
import { palette } from '@/theme/palette';

interface QuestCardProps {
  quest: Quest;
  index?: number;
  onStart?: () => void;
}

export default function QuestCard({ quest, index = 0, onStart }: QuestCardProps) {
  const isLocked = quest.status === 'locked';
  const isCompleted = quest.status === 'completed';
  const isActive = quest.status === 'in_progress';

  const typeLabels = {
    main: 'Primary Module',
    side: 'Elective Study',
    daily: 'Daily Sync',
    weekly: 'Assessment',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      whileHover={!isLocked ? { scale: 1.02, y: -4 } : {}}
      className={cn(
        "relative rounded-[28px] overflow-hidden border-2 transition-all duration-500 bg-white group",
        isLocked ? "opacity-30 grayscale pointer-events-none" : "cursor-pointer",
        isActive ? "border-[#1E4D3B] shadow-[0_20px_40px_-12px_rgba(30,77,59,0.15)]" : "border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 hover:border-slate-100"
      )}
    >
      {/* Background Subtle Gradient */}
      <div className={cn(
         "absolute top-0 right-0 w-32 h-32 bg-[#1E4D3B] opacity-0 blur-[40px] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-700",
         isActive && "opacity-[0.05]"
      )} />

      <div className="p-6 md:p-8 space-y-6">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            {/* Quest icon */}
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border",
                isCompleted ? "bg-black text-white border-black" : "bg-white text-[#1E4D3B] border-slate-50 group-hover:bg-[#1E4D3B] group-hover:text-white group-hover:border-[#1E4D3B]"
              )}
            >
              {isLocked ? (
                <Lock className="w-6 h-6" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-6 h-6 animate-in zoom-in-50 duration-500" />
              ) : (
                <Swords className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E4D3B]">
                   {typeLabels[quest.type]}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 text-slate-400 rounded-lg border border-slate-100">
                   {quest.difficulty.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-black text-black tracking-tight leading-tight group-hover:text-[#1E4D3B] transition-colors duration-300">
                {quest.title}
              </h3>
            </div>
          </div>

          {/* Rewards */}
          <div className="flex flex-col items-end gap-2 p-3 rounded-2xl bg-slate-50/50 border border-slate-50 group-hover:bg-white group-hover:shadow-sm transition-all">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#1E4D3B] animate-pulse" />
              <span className="text-xs font-black text-black">+{quest.xpReward}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-black opacity-20" />
              <span className="text-[11px] font-black text-slate-300">+{quest.coinReward}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm font-medium text-slate-400 leading-relaxed line-clamp-2">
          {quest.description}
        </p>

        {/* Progress System */}
        <div className="space-y-4">
           <div className="relative h-2 w-full bg-slate-50 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-[#1E4D3B] rounded-full shadow-[0_0_12px_rgba(30,77,59,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${quest.progress}%` }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
           </div>
           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="text-slate-300">SYNC: {quest.progress}%</span>
              <span className="text-[#1E4D3B]">{quest.currentStep} / {quest.totalSteps} PHASE</span>
           </div>
        </div>

        {/* Action Button */}
        {!isLocked && !isCompleted && (
          <button
            className={cn(
               "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500",
               isActive 
               ? "bg-[#1E4D3B] text-white shadow-xl shadow-emerald-900/20 hover:bg-black" 
               : "bg-black text-white hover:bg-[#1E4D3B] shadow-lg shadow-black/10 hover:shadow-emerald-900/40"
            )}
            onClick={onStart}
          >
            {isActive ? 'Continue Protocol' : 'Initialize Mission'}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {isCompleted && (
          <div className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-50 text-slate-300 font-black uppercase tracking-[0.2em] text-[10px] border border-slate-100 italic">
            <Sparkles className="w-4 h-4" />
            Module Synchronized
          </div>
        )}
      </div>
    </motion.div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
