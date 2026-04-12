"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { useEffect } from "react";
import { motion } from "framer-motion";
import { palette } from "@/theme/palette";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen overflow-hidden relative flex items-center justify-center" style={{ background: palette.bg }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `linear-gradient(rgba(124,106,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,250,0.5) 1px, transparent 1px)`, backgroundSize: '80px 80px' }}
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, #0B0D17 70%)' }} />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(124,106,250,0.08)', left: '-10%', top: '20%' }}
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'rgba(34,211,238,0.06)', right: '-10%', bottom: '20%' }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-7xl md:text-9xl font-black shimmer-text"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 text-xl md:text-2xl"
          style={{ color: palette.text2 }}
        >
          Oops! Page not found
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 font-semibold border-0"
            style={{ background: palette.gradient1, color: '#fff', boxShadow: `0 10px 30px ${palette.accentGlow}` }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
