'use client';
/* ═══════════════════════════════════════════════════════
   Certificate Unlock — Epic reward screen animation
   ═══════════════════════════════════════════════════════ */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ShieldCheck, ExternalLink, Download, Share2, X } from 'lucide-react';
import { palette } from '@/theme/palette';

interface CertificateUnlockProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: {
    courseName: string;
    studentName: string;
    date: string;
    hash?: string;
    verifyUrl?: string;
  };
}

export default function CertificateUnlock({ isOpen, onClose, certificate }: CertificateUnlockProps) {
  const [phase, setPhase] = useState<'reveal' | 'display'>('reveal');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)' }}
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 max-w-lg w-full mx-4"
            initial={{ scale: 0.3, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
            onAnimationComplete={() => setPhase('display')}
          >
            {/* Close button */}
            <motion.button
              className="absolute -top-10 right-0 p-2 rounded-full"
              style={{ background: palette.card, color: palette.text2 }}
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Epic radial glow */}
            <motion.div
              className="absolute -inset-32 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(124, 106, 250, 0.15) 0%, transparent 60%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: i % 3 === 0 ? '#7C6AFA' : i % 3 === 1 ? '#22D3EE' : '#FFD700',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}

            {/* Certificate Card */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: palette.card,
                border: '2px solid rgba(124, 106, 250, 0.4)',
                boxShadow: '0 0 80px rgba(124, 106, 250, 0.3), 0 30px 80px rgba(0,0,0,0.5)',
              }}
            >
              {/* Top shimmer bar */}
              <div className="relative h-2 overflow-hidden" style={{ background: palette.gradient1 }}>
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </div>

              {/* Header */}
              <div className="text-center pt-8 pb-4 px-6">
                <motion.div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124, 106, 250, 0.2), rgba(34, 211, 238, 0.2))',
                    border: '2px solid rgba(124, 106, 250, 0.4)',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(124, 106, 250, 0.2)',
                      '0 0 50px rgba(124, 106, 250, 0.5)',
                      '0 0 20px rgba(124, 106, 250, 0.2)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="w-10 h-10 text-[#7C6AFA]" />
                </motion.div>

                <motion.p
                  className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2 shimmer-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Certificate of Achievement
                </motion.p>

                <motion.h2
                  className="text-2xl font-black mb-1"
                  style={{ color: palette.text }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  {certificate.courseName}
                </motion.h2>

                <motion.p
                  className="text-sm"
                  style={{ color: palette.text2 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  Awarded to <span className="text-gradient font-semibold">{certificate.studentName}</span>
                </motion.p>
              </div>

              {/* Decorative divider */}
              <div className="flex items-center gap-3 px-8">
                <div className="flex-1 h-px" style={{ background: palette.border }} />
                <ShieldCheck className="w-5 h-5 text-[#34D399]" />
                <div className="flex-1 h-px" style={{ background: palette.border }} />
              </div>

              {/* Details */}
              <motion.div
                className="p-6 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: palette.text2 }}>Date Earned</span>
                  <span className="font-medium" style={{ color: palette.text }}>{certificate.date}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: palette.text2 }}>Verification</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                    <span className="text-[#34D399] font-medium text-xs">Blockchain Verified</span>
                  </span>
                </div>

                {certificate.hash && (
                  <div className="text-sm">
                    <span style={{ color: palette.text2 }}>TX Hash</span>
                    <p className="font-mono text-xs mt-0.5 truncate" style={{ color: palette.accent }}>
                      {certificate.hash}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                className="px-6 pb-6 flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
              >
                {certificate.verifyUrl && (
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
                    style={{
                      background: 'rgba(52, 211, 153, 0.1)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      color: '#34D399',
                    }}
                    whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.open(certificate.verifyUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Verify
                  </motion.button>
                )}

                <motion.button
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: palette.gradient1,
                    boxShadow: '0 4px 20px rgba(124, 106, 250, 0.3)',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </motion.button>

                <motion.button
                  className="flex items-center justify-center p-3 rounded-xl"
                  style={{
                    background: palette.accentSoft,
                    border: `1px solid ${palette.border}`,
                    color: palette.accent,
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
