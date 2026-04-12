import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Trophy, Target, Zap, Users, ArrowRight, Star, Layers, Rocket } from 'lucide-react';
import { palette } from '@/theme/palette';

/* ── Animation variants ────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Floating Orb component ────────────────────── */
const FloatingOrb = ({ size, color, delay, x, y }: { size: number; color: string; delay: number; x: string; y: string }) => (
  <motion.div
    className="absolute rounded-full blur-3xl pointer-events-none"
    style={{ width: size, height: size, background: color, left: x, top: y }}
    animate={{ y: [0, -30, 0], scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
    transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

/* ── Animated Grid Background ─────────────────── */
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Grid */}
    <div className="absolute inset-0 opacity-[0.04]"
      style={{ backgroundImage: `linear-gradient(rgba(124,106,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,250,0.5) 1px, transparent 1px)`, backgroundSize: '80px 80px' }}
    />
    {/* Radial fade */}
    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, #0B0D17 70%)' }} />
    {/* Orbs */}
    <FloatingOrb size={500} color="rgba(124,106,250,0.12)" delay={0} x="-10%" y="10%" />
    <FloatingOrb size={400} color="rgba(34,211,238,0.08)" delay={2} x="70%" y="20%" />
    <FloatingOrb size={300} color="rgba(124,106,250,0.1)" delay={4} x="30%" y="60%" />
  </div>
);

/* ── Stat Pill ─────────────────────────────────── */
const StatPill = ({ icon: Icon, label, value, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="glass rounded-2xl px-5 py-3 flex items-center gap-3"
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: palette.accentSoft }}>
      <Icon className="w-5 h-5" style={{ color: palette.accent }} />
    </div>
    <div>
      <p className="text-lg font-bold" style={{ color: palette.text }}>{value}</p>
      <p className="text-xs" style={{ color: palette.text2 }}>{label}</p>
    </div>
  </motion.div>
);

const Landing = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    { icon: Brain, title: 'Adaptive Learning', description: 'AI adjusts to your pace and learning style for maximum efficiency', gradient: 'linear-gradient(135deg, rgba(124,106,250,0.15), rgba(124,106,250,0.05))' },
    { icon: Sparkles, title: 'AI Quizzes', description: 'Smart assessments that identify and target your weak points precisely', gradient: 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(34,211,238,0.03))' },
    { icon: Trophy, title: 'Gamified XP & Streaks', description: 'Stay motivated with rewards, achievements, and daily challenges', gradient: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.03))' },
    { icon: Target, title: 'AI Course Builder', description: 'Educators can create adaptive courses with AI assistance in minutes', gradient: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.03))' },
  ];

  const stats = [
    { icon: Users, label: 'Active Learners', value: '10K+', delay: 0.8 },
    { icon: Layers, label: 'Courses Created', value: '500+', delay: 1.0 },
    { icon: Star, label: 'Avg. Rating', value: '4.9', delay: 1.2 },
  ];

  return (
    <div ref={targetRef} className="min-h-screen overflow-hidden relative" style={{ background: palette.bg }}>
      <GridBackground />

      {/* ═══ Navbar ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
        style={{ borderBottom: `1px solid ${palette.border}` }}
      >
        <div className="container max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: palette.gradient1 }}>
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold shimmer-text">LearnNova</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium" style={{ color: palette.text2 }}>
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm font-semibold rounded-xl px-5" style={{ background: palette.accent, color: '#fff' }}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ═══ Hero Section ═══ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8">
              <Sparkles className="w-4 h-4" style={{ color: palette.accent }} />
              <span className="text-sm font-medium" style={{ color: palette.text2 }}>AI-Powered Learning Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-[1.05] tracking-tight" style={{ color: palette.text }}>
              Your Smartest{' '}
              <span className="shimmer-text">Study Companion</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: palette.text2 }}>
              Experience adaptive learning that evolves with you. Master any subject with AI-powered insights, gamification, and personalized study paths.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] border-0 group"
                  style={{ background: palette.gradient1, color: '#fff', boxShadow: `0 10px 40px -10px ${palette.accentGlow}` }}
                >
                  <Users className="mr-2 w-5 h-5" />
                  Start Learning
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 rounded-2xl font-semibold hover:scale-[1.03] transition-all duration-300"
                  style={{ background: 'transparent', color: palette.text, borderColor: palette.borderHover }}
                >
                  <Brain className="mr-2 w-5 h-5" style={{ color: palette.accent }} />
                  I'm an Educator
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-20 flex flex-wrap justify-center gap-4"
          >
            {stats.map((stat) => (
              <StatPill key={stat.label} {...stat} />
            ))}
          </motion.div>

          {/* Animated Brain Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 relative"
          >
            <div className="w-48 h-48 mx-auto rounded-full flex items-center justify-center animate-float animate-pulse-glow"
              style={{ background: `radial-gradient(circle, ${palette.accentSoft} 0%, transparent 70%)` }}
            >
              <Brain className="w-24 h-24" style={{ color: palette.accent, filter: `drop-shadow(0 0 20px ${palette.accentGlow})` }} />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section className="relative py-32 px-4">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-6">
              <Zap className="w-4 h-4" style={{ color: palette.secondary }} />
              <span className="text-sm font-medium" style={{ color: palette.text2 }}>Powerful Features</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-black mb-5" style={{ color: palette.text }}>
              Why Choose <span className="text-gradient">LearnNova</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg max-w-xl mx-auto" style={{ color: palette.text2 }}>
              The most adaptive and intelligent learning platform built for the modern student.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="rounded-2xl p-6 transition-all duration-300 cursor-pointer group gradient-border"
                style={{ background: feature.gradient }}
              >
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: palette.accentSoft }}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: palette.accent }} />
                </motion.div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-gradient transition-colors" style={{ color: palette.text }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: palette.text2 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="relative py-32 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl p-14 relative overflow-hidden"
            style={{ background: palette.card, border: `1px solid ${palette.border}` }}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 30% 50%, ${palette.accentSoft} 0%, transparent 50%), radial-gradient(circle at 70% 50%, ${palette.secondarySoft} 0%, transparent 50%)` }} />
            
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-black mb-6"
                style={{ color: palette.text }}
              >
                Ready to{' '}
                <span className="shimmer-text">Transform</span>
                {' '}Your Learning?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg mb-10"
                style={{ color: palette.text2 }}
              >
                Join thousands of students already learning smarter with AI
              </motion.p>
              <Link href="/student">
                <Button
                  size="lg"
                  className="text-base px-10 py-6 rounded-2xl font-semibold shadow-2xl hover:scale-[1.04] transition-all duration-300 border-0 group"
                  style={{ background: palette.gradient1, color: '#fff', boxShadow: `0 15px 50px -12px ${palette.accentGlow}` }}
                >
                  <Rocket className="mr-2 w-5 h-5" />
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative py-8 px-6 text-center" style={{ borderTop: `1px solid ${palette.border}` }}>
        <p className="text-sm" style={{ color: palette.textMuted }}>
          © {new Date().getFullYear()} LearnNova by <span className="font-medium" style={{ color: palette.text2 }}>Hex Visionaries</span>. Made with <span className="text-red-400">❤️</span> by Paras & Harshit
        </p>
      </footer>
    </div>
  );
};

export default Landing;