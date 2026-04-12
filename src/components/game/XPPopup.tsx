'use client';
/* ═══════════════════════════════════════════════════════
   XP Popup — Floating notification on XP gain
   ═══════════════════════════════════════════════════════ */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useGameStore } from '@/game/useGameStore';

export default function XPPopup() {
  const xpEvents = useGameStore(s => s.xpEvents);
  const dismissXPEvent = useGameStore(s => s.dismissXPEvent);

  /* Auto-dismiss after 2.5s */
  useEffect(() => {
    if (xpEvents.length === 0) return;
    const latest = xpEvents[xpEvents.length - 1];
    const timer = setTimeout(() => dismissXPEvent(latest.id), 2500);
    return () => clearTimeout(timer);
  }, [xpEvents, dismissXPEvent]);

  return (
    <div className="fixed top-20 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {xpEvents.slice(-3).map((evt) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, x: 80, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.6 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl pointer-events-auto"
            style={{
              background: 'rgba(124, 106, 250, 0.15)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(124, 106, 250, 0.3)',
              boxShadow: '0 0 30px rgba(124, 106, 250, 0.2), 0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-5 h-5 text-[#7C6AFA]" />
            </motion.div>

            <div>
              <p className="text-sm font-bold text-[#7C6AFA]">
                +{evt.amount} XP
              </p>
              <p className="text-[10px] text-[#8B92B3]">{evt.source}</p>
            </div>

            {/* Glow pulse */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ background: 'rgba(124, 106, 250, 0.1)' }}
              animate={{ opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
