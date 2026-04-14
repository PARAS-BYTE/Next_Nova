'use client';
/* ═══════════════════════════════════════════════════════
   Leaderboard — Strict G/W/B with academic styling
   ═══════════════════════════════════════════════════════ */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Crown, TrendingUp, Medal, Star } from 'lucide-react';
import { useGameStore } from '@/game/useGameStore';
import { getRankForLevel } from '@/game/gameConfig';
import GameAvatar from './AvatarSystem';
import { palette } from '@/theme/palette';
import type { AvatarSkin } from '@/game/types';

export default function Leaderboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await axios.get("/api/focus/leaderboard?type=xp", { withCredentials: true });
        setData(res.data.leaderboard || []);
      } catch (e) {
        console.error("Leaderboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, []);

  const leaderboard = data.length > 0 ? data : [];

  // Strict Color Mapping
  const topThreeColors = ['#1E4D3B', '#000000', '#1E4D3B'];

  return (
    <div
      className="rounded-[32px] overflow-hidden border border-slate-100 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center border border-slate-100 bg-slate-50"
          >
            <Trophy className="w-5 h-5 text-black" />
          </div>
          <div>
             <h3 className="text-sm font-black text-black uppercase tracking-tight">
               Academic Ranks
             </h3>
             <p className="text-[9px] font-black text-[#1E4D3B] uppercase tracking-widest opacity-60">Global Synchronization</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-2">
        {leaderboard.slice(0, 6).map((entry, i) => {
          const rankCfg = getRankForLevel(entry.level);
          const isTop3 = entry.rank <= 3;

          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 border ${
                entry.isCurrentUser ? 'border-[#1E4D3B] bg-emerald-50/30 shadow-lg shadow-emerald-700/5' : 'border-transparent hover:border-slate-50 hover:bg-slate-50'
              }`}
            >
              {/* Rank number */}
              <div className="w-6 text-center flex-shrink-0">
                {isTop3 ? (
                  <Star className="w-4 h-4 mx-auto" style={{ color: topThreeColors[entry.rank - 1] }} />
                ) : (
                  <span className="text-[10px] font-black text-slate-300">
                    #{entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div className="relative">
                 <GameAvatar skin={entry.avatar as AvatarSkin} level={entry.level} size={36} showRing={true} mood="idle" />
                 {entry.isCurrentUser && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#1E4D3B] rounded-full border-2 border-white" />
                 )}
              </div>

              {/* Name & Title */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-black truncate ${entry.isCurrentUser ? 'text-[#1E4D3B]' : 'text-black'}`}>
                  {entry.name} {entry.isCurrentUser && '(You)'}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                   {entry.title}
                </p>
              </div>

              {/* XP */}
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] font-black text-black tracking-tight">
                  {entry.xp.toLocaleString()}
                </p>
                <p className="text-[8px] font-black text-[#1E4D3B] uppercase tracking-widest opacity-40">MASTERY</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-[#1E4D3B] border-t border-slate-50 hover:bg-slate-50 transition-colors">
         Examine Global Standings
      </button>
    </div>
  );
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
