import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Trophy, Target, Zap, Users, ArrowRight, Star, GraduationCap, ShieldCheck, BookOpen, Heart } from 'lucide-react';
import { palette } from '@/theme/palette';

const Landing = () => {
  const highlights = [
    { icon: Brain, title: 'Adaptive Learning', description: 'AI-driven study paths tailored to your pace' },
    { icon: Sparkles, title: 'AI Assessments', description: 'Smart quizzes that help you master your subjects' },
    { icon: Trophy, title: 'Student Streaks', description: 'Gamified rewards to keep your learning consistent' },
    { icon: ShieldCheck, title: 'Verified Progress', description: 'Official certificates for your academic achievements' },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden pt-20" style={{ background: palette.bg }}>
      
      {/* ═══ Header ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="container max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E4D3B] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1E4D3B]">LearnNova</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-semibold text-slate-600 hover:text-[#1E4D3B]">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm font-bold bg-[#1E4D3B] hover:bg-[#143429] text-white rounded-xl px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section className="container max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center relative">
         <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-100/50 rounded-full blur-[100px] z-0" />
         <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#1E4D3B]/5 rounded-full blur-[100px] z-0" />

         <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 space-y-6"
         >
            <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-sm border border-slate-100 mb-4">
               <Sparkles size={16} className="text-[#1E4D3B]" />
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] max-w-4xl mx-auto">
               The Smarter Way to <br/>
               <span className="text-[#1E4D3B]">Master Any Subject</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
               Experience an adaptive student portal that focuses on your success. Learn easier, track your milestones, and reach your goals faster with AI.
            </p>

            <div className="pt-8 flex flex-wrap justify-center gap-4">
               <Link href="/signup">
                  <Button size="lg" className="h-14 px-10 rounded-2xl bg-[#1E4D3B] hover:bg-[#143429] text-white font-bold text-lg shadow-xl shadow-emerald-900/20">
                     Join for Free
                     <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
               </Link>
               <Link href="/login">
                  <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 text-slate-700 font-bold text-lg hover:bg-slate-50">
                     Explore Dashboard
                  </Button>
               </Link>
            </div>
         </motion.div>
      </section>

      {/* ═══ Stats Section ═══ */}
      <section className="bg-white py-20 border-y border-slate-100">
         <div className="container max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                  { label: "Active Students", value: "25K+" },
                  { label: "AI Quizzes Daily", value: "10K+" },
                  { label: "Courses", value: "500+" },
                  { label: "Satisfaction", value: "99%" }
               ].map((stat, i) => (
                  <div key={i} className="text-center">
                     <p className="text-3xl md:text-4xl font-bold text-slate-900">{stat.value}</p>
                     <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">{stat.label}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="py-24 md:py-32 container max-w-7xl mx-auto px-6">
         <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Education Meets Intelligence</h2>
            <p className="text-slate-500 font-medium">Built specifically for the modern student experience with minimal distractions and maximum focus.</p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, i) => (
               <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all space-y-4"
               >
                  <div className="w-14 h-14 rounded-2xl bg-[#1E4D3B]/5 flex items-center justify-center">
                     <item.icon className="w-7 h-7 text-[#1E4D3B]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-white border-t border-slate-100 py-12">
         <div className="container max-w-7xl mx-auto px-6 text-center space-y-6">
            <Link href="/" className="flex items-center justify-center gap-2.5">
               <div className="w-8 h-8 rounded-lg bg-[#1E4D3B] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
               </div>
               <span className="text-lg font-bold text-[#1E4D3B]">LearnNova</span>
            </Link>
            <p className="text-slate-400 text-sm font-medium">
               An Educational Initiative by <span className="text-slate-600">Hex Visionaries</span>. Made with <Heart className="inline-block w-4 h-4 text-red-500 fill-red-500" /> by Paras & Harshit
            </p>
         </div>
      </footer>

    </div>
  );
};

export default Landing;