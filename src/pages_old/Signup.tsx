"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState } from 'react';

import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

      localStorage.setItem('userInfo', JSON.stringify(response.data));
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative" style={{ background: '#FFFFFF' }}>
      {/* Background Decor (Strict G/W/B) */}
      <div className="absolute top-0 left-0 w-full h-[45vh] bg-[#1E4D3B] z-0" />
      <div className="absolute top-[40vh] left-0 w-full h-[15vh] bg-gradient-to-b from-[#1E4D3B] to-transparent z-0 opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black border border-black hover:bg-black hover:text-white transition-all text-xs font-black uppercase tracking-widest shadow-lg">
               <ArrowLeft className="w-4 h-4" />
               Exit to Portal
            </Link>
        </div>

        <Card className="rounded-[40px] shadow-2xl border-0 overflow-hidden bg-white">
          <CardHeader className="text-center pt-12 pb-8 px-10">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-black flex items-center justify-center shadow-2xl shadow-black/20 mb-8 overflow-hidden relative">
               <div className="absolute inset-0 bg-[#1E4D3B] opacity-10" />
               <UserPlus className="w-10 h-10 text-white relative z-10" />
            </div>
            <CardTitle className="text-4xl font-black text-black tracking-tight">Initialize Profile</CardTitle>
            <CardDescription className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Create your secure student credentials</CardDescription>
          </CardHeader>

          <CardContent className="px-10 pb-12 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-black ml-1 uppercase tracking-[0.2em]">Student Name</label>
                   <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                     <Input
                       type="text"
                       placeholder="Full Identity Name"
                       value={username}
                       onChange={e => setUsername(e.target.value)}
                       required
                       className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-100 focus:border-black focus:ring-black/5 transition-all font-bold"
                     />
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-black ml-1 uppercase tracking-[0.2em]">Academic Email</label>
                   <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                     <Input
                       type="email"
                       placeholder="id@university.edu"
                       value={email}
                       onChange={e => setEmail(e.target.value)}
                       required
                       className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-100 focus:border-black focus:ring-black/5 transition-all font-bold"
                     />
                   </div>
                 </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black ml-1 uppercase tracking-[0.2em]">Secret Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 encrypted characters"
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 h-14 rounded-2xl bg-slate-50 border-slate-100 focus:border-black focus:ring-black/5 transition-all font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-black text-white text-xs font-bold border border-black shadow-lg"
                  >
                    Authorization Failure: {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-black hover:bg-[#1E4D3B] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 transition-all text-xs mt-4"
              >
                {loading ? "Registering Metadata..." : "Authorize Account"}
              </Button>
            </form>

            <div className="relative flex items-center gap-4 py-2">
               <div className="h-px bg-slate-100 flex-1" />
               <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">or</span>
               <div className="h-px bg-slate-100 flex-1" />
            </div>

            <p className="text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              Previously Registered?{" "}
              <Link href="/login" className="font-black text-black hover:text-[#1E4D3B] hover:underline px-1">
                Establish Protocol
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;