"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star } from 'lucide-react';
import { palette } from '@/theme/palette';

interface XPEvent {
  id: number;
  amount: number;
  label: string;
  x: number;
  y: number;
}

let xpListeners: ((amount: number, label: string) => void)[] = [];

export const triggerXP = (amount: number, label = '') => {
  xpListeners.forEach((fn) => fn(amount, label));
};

export default function XPPopup() {
  const [events, setEvents] = useState<XPEvent[]>([]);

  useEffect(() => {
    const handler = (amount: number, label: string) => {
      const id = Date.now() + Math.random();
      const x = 40 + Math.random() * 20;
      const y = 30 + Math.random() * 20;
      setEvents((prev) => [...prev, { id, amount, label, x, y }]);
      setTimeout(() => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }, 2000);
    };
    xpListeners.push(handler);
    return () => {
      xpListeners = xpListeners.filter((fn) => fn !== handler);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {events.map((evt) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -100, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="absolute flex flex-col items-center gap-1"
            style={{ left: `${evt.x}%`, top: `${evt.y}%` }}
          >
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(6,182,212,0.7))',
                boxShadow: `0 0 20px ${palette.accentGlow}, 0 0 40px rgba(6,182,212,0.3)`,
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: palette.gold }} />
              +{evt.amount} XP
            </div>
            {evt.label && (
              <span className="text-[10px] font-mono" style={{ color: palette.cyan }}>
                {evt.label}
              </span>
            )}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: i % 2 === 0 ? palette.accent : palette.cyan,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: -40 - Math.random() * 40,
                  x: (Math.random() - 0.5) * 60,
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 1.2 + Math.random() * 0.5 }}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
