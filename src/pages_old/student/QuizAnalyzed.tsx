"use client";
import React from "react";
import { useNavStore } from '@/store/useNavStore';
import { useRouter } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Target,
  Clock,
  Award,
  ArrowLeft,
  Activity,
  BarChart3,
  PieChart as PieIcon,
  Sword,
  Shield,
  Trophy,
  Zap,
  Sparkles,
  Flame,
  Scroll,
  TrendingUp,
  Brain,
} from "lucide-react";

// Gaming Theme Colors
const COLORS = ["#10B981", "#EF4444"]; // Green for Correct, Red for Wrong
const ACCENT = "#7C6AFA";
const BG_DARK = "#050507";
const CARD_BG = "#0A0A0C";
const BORDER = "rgba(124, 106, 250, 0.15)";

const QuizAnalyzed = () => {
  const state = useNavStore(s => s.navState);
  const router = useRouter();
  const analysis = state?.analysis || state;

  if (!analysis)
    return (
      <div className="flex justify-center items-center h-[80vh] text-white/30 font-black uppercase tracking-widest text-xs">
        Data Desynchronized. Return to base.
      </div>
    );

  const {
    quizTitle = "Mission Analysis",
    correctCount = 0,
    wrongCount = 0,
    accuracy = 0,
    totalMarks = 0,
    scoredMarks = 0,
    timeTaken = "0m 0s",
    xpGained = 0,
    questionAnalysis = [],
    charts = { pie: [], bar: [] },
  } = analysis;

  const timeValue = (() => {
    const t = String(timeTaken).split(" ")[0];
    return isNaN(parseInt(t)) ? 0 : parseInt(t);
  })();

  const isVictory = Number(accuracy) >= 50;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8" style={{ background: BG_DARK, color: '#FFFFFF' }}>
      
      {/* ─── Hero Section: Victory/Defeat ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative p-8 rounded-3xl border-2 overflow-hidden text-center"
        style={{
          background: `linear-gradient(135deg, ${isVictory ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}, ${CARD_BG})`,
          borderColor: isVictory ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          boxShadow: `0 0 30px ${isVictory ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
        }}
      >
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #7C6AFA 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ y: -20, rotate: -10 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {isVictory ? (
              <Trophy className="w-20 h-20 text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            ) : (
              <Sword className="w-20 h-20 text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            )}
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2" style={{ background: 'linear-gradient(180deg, #FFFFFF, rgba(255,255,255,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isVictory ? 'Victory Achieved' : 'Mission Failed'}
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-6">
            {quizTitle}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
              <span className="text-[10px] block uppercase font-black text-white/30 tracking-widest">Accuracy</span>
              <span className="text-lg font-black text-white">{accuracy}%</span>
            </div>
            <div className="px-4 py-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
              <span className="text-[10px] block uppercase font-black text-white/30 tracking-widest">Time Spent</span>
              <span className="text-lg font-black text-white">{timeTaken}</span>
            </div>
            <div className="px-4 py-2 rounded-xl border border-[#7C6AFA]/30 bg-[#7C6AFA]/10 backdrop-blur-sm">
              <span className="text-[10px] block uppercase font-black text-[#7C6AFA] tracking-widest">XP Reward</span>
              <span className="text-lg font-black text-white">+{xpGained} XP</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Navigation ───────────────────────────── */}
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => router.push("/student/quizzes")}
          className="font-black text-[10px] uppercase tracking-widest text-white/50 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Arena
        </Button>
        <div className="h-px flex-1 mx-8 bg-white/5" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7C6AFA]">Combat Log #00{Math.floor(Math.random()*999)}</p>
      </div>

      {/* ─── Battle Stats Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Critical Hits", val: correctCount, icon: <CheckCircle2 className="text-green-400" />, border: "rgba(16, 185, 129, 0.2)" },
          { label: "Damage Taken", val: wrongCount, icon: <XCircle className="text-red-500" />, border: "rgba(239, 68, 68, 0.2)" },
          { label: "Total Score", val: `${scoredMarks}/${totalMarks}`, icon: <Target className="text-[#22D3EE]" />, border: "rgba(34, 211, 238, 0.2)" },
          { label: "Level Up", val: `+${xpGained}`, icon: <Zap className="text-yellow-400" />, border: "rgba(250, 204, 21, 0.2)" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-2xl border-2 overflow-hidden" style={{ background: CARD_BG, borderColor: stat.border }}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-white">{stat.val}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 bg-white/5">
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ─── Charts: Data Visualizer ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Distribution */}
        <Card className="rounded-2xl border-2" style={{ background: CARD_BG, borderColor: BORDER }}>
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#7C6AFA]" /> Tactical Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.pie || []}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {(charts?.pie || []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Progression */}
        <Card className="rounded-2xl border-2" style={{ background: CARD_BG, borderColor: BORDER }}>
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#22D3EE]" /> Strike Chain Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.bar || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="question" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'rgba(124, 106, 250, 0.1)' }} contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar 
                  dataKey="result" 
                  fill={ACCENT} 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                >
                  {(charts?.bar || []).map((entry, index) => (
                    <Cell key={index} fill={entry.result === 1 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ─── Performance Attribute Radar ───────────────────────────── */}
      <Card className="rounded-2xl border-2" style={{ background: CARD_BG, borderColor: BORDER }}>
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
            <Brain className="w-4 h-4 text-pink-500" /> Cognitive Radar
          </CardTitle>
        </CardHeader>
        <CardContent className="h-96 p-6">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={[
                { metric: "Accuracy", value: Number(accuracy) || 0 },
                { metric: "Speed", value: Math.max(0, 100 - timeValue * 10) },
                { metric: "Mastery", value: Math.min(100, (scoredMarks / totalMarks) * 100) },
                { metric: "Perseverance", value: Math.min(100, questionAnalysis.length * 10) },
                { metric: "XP Potency", value: Math.min(100, xpGained * 5) },
              ]}
            >
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} />
              <PolarRadiusAxis hide domain={[0, 100]} />
              <Radar
                name="Stats"
                dataKey="value"
                stroke={ACCENT}
                fill={ACCENT}
                fillOpacity={0.3}
              />
              <Tooltip contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ─── Combat Log: Detailed Breakdown ───────────────────────────── */}
      <Card className="rounded-2xl border-2" style={{ background: CARD_BG, borderColor: BORDER }}>
        <CardHeader className="border-b border-white/5 px-8 py-6">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-[#7C6AFA] flex items-center gap-3">
            <Scroll className="w-5 h-5" /> Combat Intel Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            {questionAnalysis.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all hover:bg-white/[0.02]"
                style={{
                  borderColor: q.result === "✅" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  background: q.result === "✅" ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)'
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2" style={{
                  background: q.result === "✅" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderColor: q.result === "✅" ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                }}>
                  {q.result === "✅" ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-500" />}
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Mission {i + 1}</span>
                    <Badge className="text-[8px] font-black uppercase" style={{ background: q.result === "✅" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: q.result === "✅" ? '#10B981' : '#EF4444' }}>
                      {q.result === "✅" ? 'Critical Success' : 'Failed'}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-white mb-4 leading-relaxed">{q.questionText}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <p className="text-[8px] uppercase font-black text-white/20 tracking-tighter mb-1">Your Strike</p>
                      <p className={`text-xs font-black ${q.result === "✅" ? 'text-green-400' : 'text-red-400'}`}>
                        {q.selected || "Fumbled"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <p className="text-[8px] uppercase font-black text-white/20 tracking-tighter mb-1">True Path</p>
                      <p className="text-xs font-black text-white/60">
                        {q.correct}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Footer Action ───────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center pt-6"
      >
        <Button
          onClick={() => router.push("/student/quizzes")}
          className="h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#7C6AFA]/20 group"
          style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', color: '#FFFFFF' }}
        >
          <Sparkles className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
          Finalize Mission Data
        </Button>
      </motion.div>

    </div>
  );
};

export default QuizAnalyzed;
