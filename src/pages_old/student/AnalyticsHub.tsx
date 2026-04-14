"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from "recharts";
import {
  Brain, TrendingUp, Target, Zap, Shield, Trophy, Clock,
  Flame, BarChart3, BookOpen, Sparkles, RefreshCw, Star,
  Activity, Eye, ChevronRight, Award, Scroll
} from "lucide-react";
import { toast } from "sonner";

// ─── Theme (Strict University Palette) ────────────────────────────────────────────────────
const C = { 
  primary: "#1E4D3B", 
  black: "#000000", 
  white: "#FFFFFF", 
  slate: "#F8FAFC", 
  gray: "#A1A1AA",
  accent: "#1E4D3B",
  bg: "#FFFFFF", 
  card: "#FFFFFF",
  neonGreen: "#1E4D3B",
  neonCyan: "#1E4D3B",
  neonPurple: "#000000"
};

const StatCard = ({ icon, label, value, sub, color = C.primary }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="p-5 rounded-2xl border-2 flex items-center gap-4 bg-white shadow-sm"
    style={{ borderColor: 'rgba(0,0,0,0.03)' }}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F0FDF4', border: `1px solid rgba(30, 77, 59, 0.1)` }}>
      <div style={{ color: C.primary }}>{icon}</div>
    </div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-black/30">{label}</p>
      <p className="text-xl font-black text-black">{value}</p>
      {sub && <p className="text-[10px] text-black/40 font-bold uppercase mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

const Section = ({ title, icon, children }: any) => (
  <div className="rounded-2xl border-2 overflow-hidden bg-white shadow-sm" style={{ borderColor: "rgba(0,0,0,0.03)" }}>
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
      <div className="text-[#1E4D3B]">{icon}</div>
      <h2 className="text-[10px] font-black uppercase tracking-widest text-black/40">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function AnalyticsHub() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [learningStyle, setLearningStyle] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [focusData, setFocusData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "predict" | "style" | "focus" | "report">("overview");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const opts = { withCredentials: true };
      const [focusRes] = await Promise.allSettled([
        axios.get("/api/focus/score", opts),
      ]);
      if (focusRes.status === "fulfilled") setFocusData(focusRes.value.data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const runPredict = async () => {
    toast.info("Consulting the Oracle…");
    try {
      const { data } = await axios.post("/api/ai/predict", {}, { withCredentials: true });
      setPrediction(data);
      toast.success("Prediction ready!");
    } catch { toast.error("Prediction failed"); }
  };

  const runStyle = async () => {
    toast.info("Analysing your learning DNA…");
    try {
      const { data } = await axios.post("/api/ai/learning-style", {}, { withCredentials: true });
      setLearningStyle(data);
      toast.success("Learning style detected!");
    } catch { toast.error("Detection failed"); }
  };

  const runRec = async () => {
    toast.info("Generating quest map…");
    try {
      const { data } = await axios.post("/api/ai/recommendations", {}, { withCredentials: true });
      setRecommendations(data);
      toast.success("Recommendations ready!");
    } catch { toast.error("Recommendation failed"); }
  };

  const runReport = async () => {
    toast.info("Generating your report card…");
    try {
      const { data } = await axios.post("/api/ai/report-card", {}, { withCredentials: true });
      setReport(data);
      setActiveTab("report");
      toast.success("Report card generated!");
    } catch { toast.error("Report generation failed"); }
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
    { id: "predict", label: "Predictor", icon: <TrendingUp size={14} /> },
    { id: "style", label: "Learning DNA", icon: <Brain size={14} /> },
    { id: "focus", label: "Focus", icon: <Eye size={14} /> },
    { id: "report", label: "Report Card", icon: <Scroll size={14} /> },
  ] as const;

  const gradeColor = (grade: string) =>
    ["A+", "A"].includes(grade) ? C.primary : ["B+", "B"].includes(grade) ? C.black : ["C+", "C"].includes(grade) ? C.primary : C.black;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: C.bg, color: "#000" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black italic">
            Performance Index
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1E4D3B] mt-1 italic">Scholar Performance Intelligence</p>
        </div>
        <button onClick={runReport}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 bg-black hover:bg-[#1E4D3B]">
          <Sparkles size={14} /> Generate Report Card
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all shadow-sm"
            style={{
              background: activeTab === tab.id ? `#F0FDF4` : "white",
              borderColor: activeTab === tab.id ? `#1E4D3B` : "rgba(0,0,0,0.03)",
              color: activeTab === tab.id ? C.primary : "rgba(0,0,0,0.3)",
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Focus Chart */}
            {focusData && (
              <Section title="Focus Chronology" icon={<Activity size={16} />}>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={focusData.last7Days || []}>
                    <defs>
                      <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.primary} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis dataKey="day" stroke="rgba(0,0,0,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(0,0,0,0.2)" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "#FFF", border: "1px solid rgba(0,0,0,0.05)", borderRadius: 16 }} />
                    <Area type="monotone" dataKey="focusScore" stroke={C.primary} fill="url(#focusGrad)" strokeWidth={3} dot={{ fill: C.primary, r: 4 }} />
                    <Area type="monotone" dataKey="minutes" stroke="#000000" fill="transparent" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-4 justify-center">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: C.primary }} /><span className="text-[10px] text-black/40 uppercase font-black">Focus Coefficient</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#000' }} /><span className="text-[10px] text-black/40 uppercase font-black">Temporal Minutes</span></div>
                </div>
              </Section>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Predict Institutional Rank", icon: <TrendingUp size={16} />, action: runPredict, color: "#1E4D3B", bg: "#F0FDF4", tab: "predict" },
                { label: "Analyze Academic DNA", icon: <Brain size={16} />, action: runStyle, color: "#000000", bg: "#F8FAFC", tab: "style" },
                { label: "Fetch Study Directives", icon: <Sparkles size={16} />, action: runRec, color: "#1E4D3B", bg: "#F0FDF4", tab: "overview" },
              ].map((btn) => (
                <button key={btn.label} onClick={async () => { await btn.action(); if (btn.tab !== "overview") setActiveTab(btn.tab as any); }}
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] text-left w-full bg-white shadow-sm"
                  style={{ borderColor: 'rgba(0,0,0,0.03)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: btn.bg, color: btn.color }}>
                    {btn.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{btn.label}</span>
                  <ChevronRight size={14} className="ml-auto text-black/10" />
                </button>
              ))}
            </div>

            {/* Quick Recommendations */}
            {recommendations && (
              <Section title="Strategic Study Protocol" icon={<Scroll size={16} />}>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30 mb-4">Target Curriculum Areas</p>
                    <div className="flex flex-wrap gap-2">
                       {(recommendations.nextTopics || []).map((t: string, i: number) => (
                        <span key={i} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border bg-slate-50 border-slate-100 text-[#1E4D3B]">{t}</span>
                      ))}
                    </div>
                  </div>
                  {recommendations.weeklyPlan && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30 mb-4">Tactical Weekly Schedule</p>
                      <div className="overflow-x-auto rounded-2xl border border-slate-50 bg-white">
                        <table className="w-full text-[10px]">
                          <thead><tr className="border-b border-slate-50 bg-slate-50/50">{["Day", "Objective", "Duration", "Execution"].map(h => <th key={h} className="text-left p-4 font-black uppercase tracking-[0.2em] text-black/40">{h}</th>)}</tr></thead>
                          <tbody>
                            {recommendations.weeklyPlan.map((d: any, i: number) => (
                              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-black text-black">{d.day}</td>
                                <td className="p-4 text-black/60 font-bold uppercase tracking-tight">{d.focus}</td>
                                <td className="p-4 text-black/40 font-black">{d.duration}M</td>
                                <td className="p-4"><span className="px-3 py-1 rounded-lg font-black uppercase text-[9px] tracking-widest" style={{ background: d.type === "learn" ? `#F0FDF4` : d.type === "practice" ? `#F8FAFC` : `#F0FDF4`, color: d.type === "learn" ? C.primary : d.type === "practice" ? '#000' : C.primary }}>{d.type}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}
          </motion.div>
        )}

        {/* ── PREDICTOR TAB ── */}
        {activeTab === "predict" && (
          <motion.div key="predict" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {!prediction ? (
              <div className="flex flex-col items-center justify-center py-24 gap-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <TrendingUp className="text-[#1E4D3B]" size={64} style={{ opacity: 0.1 }} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Activate Oracle for Performance Projections</p>
                <button onClick={runPredict} className="h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all hover:scale-105 bg-black hover:bg-[#1E4D3B] shadow-xl">
                  Run Predictive Scan
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard icon={<TrendingUp size={20} />} label="Fulfillment Matrix" value={`${prediction.examSuccessProbability}%`} sub="mastery probability" color={C.primary} />
                  <StatCard icon={<Activity size={20} />} label="Academic Velocity" value={prediction.nextScoreTrend?.toUpperCase()} sub={`Projected: ${prediction.predictedNextScore}%`} color={C.black} />
                  <StatCard icon={<Shield size={20} />} label="Statistical Integrity" value={`${prediction.confidenceLevel}%`} sub={`~${prediction.estimatedDaysToMastery}D to mastery`} color={C.primary} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Section title="Mastery Dominance" icon={<Trophy size={14} />}>
                    <div className="space-y-3">{(prediction.strengthAreas || []).map((a: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#F0FDF4] border border-[#1E4D3B]/10">
                        <Star size={14} className="text-[#1E4D3B]" />
                        <span className="text-xs font-black uppercase tracking-tight text-black">{a}</span>
                      </div>
                    ))}</div>
                  </Section>
                  <Section title="Intervention Required" icon={<Target size={14} />}>
                    <div className="space-y-3">{(prediction.weakAreas || []).map((a: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <Zap size={14} className="text-black" />
                        <span className="text-xs font-black uppercase tracking-tight text-black/60">{a}</span>
                      </div>
                    ))}</div>
                  </Section>
                </div>
                <Section title="Strategic Refinement" icon={<Sparkles size={14} />}>
                  <div className="space-y-4">{(prediction.improvementTips || []).map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center bg-black text-white shrink-0 shadow-lg">{i + 1}</span>
                      <p className="text-xs text-black font-bold leading-relaxed uppercase tracking-tight">{tip}</p>
                    </div>
                  ))}</div>
                </Section>
              </>
            )}
          </motion.div>
        )}

        {/* ── LEARNING STYLE TAB ── */}
        {activeTab === "style" && (
          <motion.div key="style" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {!learningStyle ? (
              <div className="flex flex-col items-center justify-center py-24 gap-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Brain className="text-black" size={64} style={{ opacity: 0.1 }} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Deconstruct Learning DNA Patterns</p>
                <button onClick={runStyle} className="h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 bg-black hover:bg-[#1E4D3B]">
                  Initialize Neural Scan
                </button>
              </div>
            ) : (
              <>
                <div className="p-12 rounded-[40px] border-2 text-center bg-white shadow-2xl" style={{ borderColor: 'rgba(30, 77, 59, 0.05)' }}>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 shadow-xl bg-[#F0FDF4] border-2 border-[#1E4D3B]/20">
                    <Brain size={42} className="text-[#1E4D3B]" />
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-black mb-3 italic">{learningStyle.primaryStyle} Specialist</h2>
                  <p className="text-sm font-bold text-black/40 max-w-lg mx-auto uppercase tracking-tight">{learningStyle.description}</p>
                  <div className="mt-8 px-6 py-2.5 inline-block rounded-full bg-black text-white shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest">Statistical Confidence: {learningStyle.confidence}%</span>
                  </div>
                </div>
                {learningStyle.recommendations && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {[
                      { label: "Execution Duration", value: `${learningStyle.recommendations.idealSessionLength}M` },
                      { label: "Rest Interval", value: `${learningStyle.recommendations.breakFrequency}M` },
                      { label: "Curriculum Format", value: learningStyle.recommendations.contentFormat },
                      { label: "Complexity Level", value: learningStyle.recommendations.difficultyAdjustment },
                      { label: "Interation Pattern", value: learningStyle.recommendations.revisionFrequency?.replace("_", " ") },
                      { label: "Neural Code", value: learningStyle.primaryStyle?.toUpperCase() },
                    ].map((item) => (
                      <div key={item.label} className="p-6 rounded-2xl border-2 bg-white shadow-sm transition-all hover:shadow-lg" style={{ borderColor: 'rgba(0,0,0,0.02)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/20 mb-2 italic">{item.label}</p>
                        <p className="text-sm font-black text-[#1E4D3B] uppercase tracking-tight">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ── FOCUS TAB ── */}
        {activeTab === "focus" && (
          <motion.div key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {focusData ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard icon={<Eye size={20} />} label="Focus Coefficient" value={`${focusData.currentFocusScore}%`} sub="institutional rolling avg" color={C.primary} />
                  <StatCard icon={<Clock size={20} />} label="Accumulated Presence" value={`${Math.round((focusData.totalStudyMinutes || 0) / 60)}H`} sub={`${focusData.totalStudyMinutes} MIN`} color={C.black} />
                  <StatCard icon={<Activity size={20} />} label="Sync Sessions" value={focusData.totalSessions || 0} sub="total logs" color={C.primary} />
                </div>
                <Section title="Temporal Persistence Matrix" icon={<BarChart3 size={14} />}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={focusData.last7Days || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(0,0,0,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(0,0,0,0.2)" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "#FFF", border: "1px solid rgba(0,0,0,0.05)", borderRadius: 16 }} />
                      <Bar dataKey="focusScore" fill={C.primary} radius={[12, 12, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </Section>
              </>
            ) : (
              <div className="text-center py-24 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                <Eye size={64} className="mx-auto mb-6 opacity-5" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">No Temporal Logs Detected</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── REPORT CARD TAB ── */}
        {activeTab === "report" && (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {!report ? (
              <div className="flex flex-col items-center justify-center py-24 gap-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Scroll className="text-black" size={64} style={{ opacity: 0.1 }} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Synthesize Institutional Performance Record</p>
                <button onClick={runReport} className="h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 bg-black hover:bg-[#1E4D3B]">
                  Inscribe Report Card
                </button>
              </div>
            ) : (
              <>
                {/* Overall Grade */}
                <div className="p-12 rounded-[48px] border-2 text-center bg-white shadow-2xl relative overflow-hidden" style={{ borderColor: 'rgba(30, 77, 59, 0.05)' }}>
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none italic font-black text-9xl">PRO</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20 mb-6 italic">Permanent Performance Record</p>
                  <div className="text-[140px] leading-none font-black italic mb-4" style={{ color: gradeColor(report.overallGrade), letterSpacing: '-0.1em' }}>{report.overallGrade}</div>
                  <p className="text-4xl font-black text-black tracking-tighter">SUCCESS INDEX: {report.overallScore}%</p>
                  <p className="text-[11px] font-bold text-black/40 mt-8 max-w-xl mx-auto uppercase leading-relaxed tracking-tight">{report.personalizedAdvice}</p>
                </div>
                {/* Category breakdown */}
                <Section title="Institutional KPI Assessment" icon={<BarChart3 size={14} />}>
                  <div className="space-y-6">
                    {(report.categories || []).map((cat: any) => (
                      <div key={cat.name} className="flex items-center gap-6">
                        <div className="w-32 shrink-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-black/30 italic">{cat.name}</p>
                        </div>
                        <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-50">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${cat.score}%` }} transition={{ delay: 0.1, duration: 1 }}
                            className="h-full rounded-full" style={{ background: gradeColor(cat.grade) }} />
                        </div>
                        <span className="w-12 text-right text-xs font-black italic shrink-0" style={{ color: gradeColor(cat.grade) }}>{cat.grade}</span>
                        <p className="text-[10px] font-bold text-black/40 flex-1 min-w-0 truncate uppercase tracking-tight">{cat.feedback}</p>
                      </div>
                    ))}
                  </div>
                </Section>
                <div className="grid sm:grid-cols-2 gap-8">
                  <Section title="Strategic Dominance" icon={<Trophy size={14} />}>
                    <div className="space-y-4">{(report.strengths || []).map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-[#F0FDF4] border border-[#1E4D3B]/10 shadow-sm">
                        <Award size={16} className="text-[#1E4D3B]" />
                        <span className="text-[11px] font-black uppercase tracking-tight text-black">{s}</span>
                      </div>
                    ))}</div>
                  </Section>
                  <Section title="Intervention Requirements" icon={<Target size={14} />}>
                    <div className="space-y-4">{(report.areasToImprove || []).map((a: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <Zap size={16} className="text-black" />
                        <span className="text-[11px] font-black uppercase tracking-tight text-black/60">{a}</span>
                      </div>
                    ))}</div>
                  </Section>
                </div>
                <div className="p-8 rounded-3xl border-2 border-slate-50 text-center bg-white shadow-sm">
                  <p className="text-[10px] uppercase font-black tracking-[0.4em] text-black/20 mb-2">Institutional Milestone</p>
                  <p className="text-sm font-black text-[#1E4D3B] italic uppercase tracking-tight">{report.nextMilestone}</p>
                </div>
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
