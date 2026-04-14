"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState } from 'react';

import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, BookOpen, Zap, Shield, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { palette } from '@/theme/palette';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        '/api/auth/register',
        { username, email, password },
        { withCredentials: true }
      );

      if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      // Extract error message from response
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to create account. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const highlights = [
    { icon: Zap, label: 'Interactive Learning' },
    { icon: Shield, label: 'Progress Tracking' },
    { icon: Users, label: 'Community Support' },
  ];

  return (
    <div className="min-h-screen overflow-hidden relative flex items-center justify-center p-4" style={{ background: palette.bg }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `linear-gradient(rgba(124,106,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,250,0.5) 1px, transparent 1px)`, backgroundSize: '80px 80px' }}
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, #0B0D17 70%)' }} />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(34,211,238,0.08)', right: '-15%', top: '15%' }}
          animate={{ y: [0, -25, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'rgba(124,106,250,0.08)', left: '-10%', bottom: '10%' }}
          animate={{ y: [0, 20, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <Link href="/" className="flex items-center gap-2 mb-8 group transition-colors" style={{ color: palette.text2 }}>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium group-hover:text-white transition-colors">Back to Home</span>
        </Link>

        <Card className="glass rounded-2xl shadow-2xl overflow-hidden" style={{ border: `1px solid ${palette.border}` }}>
          {/* Gradient top line */}
          <div className="h-1 w-full" style={{ background: palette.gradient2 }} />

          <CardHeader className="text-center space-y-4 pb-6 pt-8">
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow"
              style={{ background: palette.accentSoft }}
            >
              <BookOpen className="w-8 h-8" style={{ color: palette.accent }} />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-black mb-2" style={{ color: palette.text }}>
                Join <span className="text-gradient">LearnNova</span>
              </CardTitle>
              <CardDescription className="text-base" style={{ color: palette.text2 }}>
                Start your personalized learning journey
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4" style={{ color: palette.text2 }} />
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="pl-10 h-12 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-offset-0"
                    style={{ 
                      color: palette.text, 
                      borderColor: palette.border, 
                      backgroundColor: palette.bgSecondary,
                      '--tw-ring-color': palette.accent + '40'
                    } as React.CSSProperties & { '--tw-ring-color': string }}
                  />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4" style={{ color: palette.text2 }} />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-offset-0"
                    style={{ 
                      color: palette.text, 
                      borderColor: palette.border, 
                      backgroundColor: palette.bgSecondary,
                      '--tw-ring-color': palette.accent + '40'
                    } as React.CSSProperties & { '--tw-ring-color': string }}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
              >
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4" style={{ color: palette.text2 }} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (min 6 characters)"
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-12 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-offset-0"
                    style={{ 
                      color: palette.text, 
                      borderColor: palette.border, 
                      backgroundColor: palette.bgSecondary,
                      '--tw-ring-color': palette.accent + '40'
                    } as React.CSSProperties & { '--tw-ring-color': string }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 transition-colors hover:scale-110"
                    style={{ color: palette.text2 }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 text-sm rounded-xl overflow-hidden"
                    style={{ background: 'rgba(248,113,113,0.1)', color: palette.error, border: `1px solid rgba(248,113,113,0.2)` }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 font-semibold text-base rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 border-0"
                  style={{ 
                    background: palette.gradient1, 
                    color: '#fff',
                    boxShadow: `0 10px 30px -8px ${palette.accentGlow}`
                  }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: palette.border }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 rounded-full" style={{ background: palette.card, color: palette.text2 }}>Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                href="/login"
                className="font-medium text-sm transition-all duration-300 inline-flex items-center gap-1 group"
                style={{ color: palette.text2 }}
              >
                Sign in to your account
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          {highlights.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="glass rounded-xl p-3 text-center group hover:scale-105 transition-transform duration-300 cursor-default"
              style={{ border: `1px solid ${palette.border}` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: palette.accentSoft }}>
                <item.icon className="w-4 h-4" style={{ color: palette.accent }} />
              </div>
              <p className="text-xs font-medium" style={{ color: palette.text2 }}>{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;