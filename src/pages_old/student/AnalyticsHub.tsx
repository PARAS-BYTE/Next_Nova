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

// ─── Theme ────────────────────────────────────────────────────
const C = { purple: "#7C6AFA", cyan: "#22D3EE", green: "#10B981", red: "#EF4444", yellow: "#FBBF24", bg: "#050507", card: "#0A0A0C" };

const StatCard = ({ icon, label, value, sub, color = C.purple }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="p-5 rounded-2xl border-2 flex items-center gap-4"
    style={{ background: C.card, borderColor: `${color}25` }}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
      {sub && <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

const Section = ({ title, icon, children }: any) => (
  <div className="rounded-2xl border-2 overflow-hidden" style={{ background: C.card, borderColor: "rgba(124,106,250,0.1)" }}>
    <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
      <div className="text-[#7C6AFA]">{icon}</div>
      <h2 className="text-[10px] font-black uppercase tracking-widest text-white/50">{title}</h2>
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
    ["A+", "A"].includes(grade) ? C.green : ["B+", "B"].includes(grade) ? C.cyan : ["C+", "C"].includes(grade) ? C.yellow : C.red;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: C.bg, color: "#fff" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ background: `linear-gradient(135deg, #7C6AFA, #22D3EE)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Analytics Hub
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">AI-Powered Performance Intelligence</p>
        </div>
        <button onClick={runReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ background: `linear-gradient(135deg, ${C.purple}, #5D4AD4)`, boxShadow: `0 4px 20px ${C.purple}40` }}>
          <Sparkles size={14} /> Generate Report Card
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all"
            style={{
              background: activeTab === tab.id ? `${C.purple}20` : "transparent",
              borderColor: activeTab === tab.id ? `${C.purple}60` : "rgba(255,255,255,0.08)",
              color: activeTab === tab.id ? C.purple : "rgba(255,255,255,0.3)",
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
              <Section title="7-Day Focus Radar" icon={<Activity size={16} />}>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={focusData.last7Days || []}>
                    <defs>
                      <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.purple} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: C.card, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="focusScore" stroke={C.purple} fill="url(#focusGrad)" strokeWidth={2} dot={{ fill: C.purple, r: 4 }} />
                    <Area type="monotone" dataKey="minutes" stroke={C.cyan} fill="transparent" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-4 justify-center">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: C.purple }} /><span className="text-[10px] text-white/30 uppercase font-black">Focus %</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: C.cyan }} /><span className="text-[10px] text-white/30 uppercase font-black">Minutes</span></div>
                </div>
              </Section>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Predict My Score", icon: <TrendingUp size={16} />, action: runPredict, color: C.cyan, tab: "predict" },
                { label: "Detect Learning Style", icon: <Brain size={16} />, action: runStyle, color: C.green, tab: "style" },
                { label: "Get Recommendations", icon: <Sparkles size={16} />, action: runRec, color: C.yellow, tab: "overview" },
              ].map((btn) => (
                <button key={btn.label} onClick={async () => { await btn.action(); if (btn.tab !== "overview") setActiveTab(btn.tab as any); }}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] text-left w-full"
                  style={{ background: `${btn.color}08`, borderColor: `${btn.color}25` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${btn.color}20`, color: btn.color }}>
                    {btn.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{btn.label}</span>
                  <ChevronRight size={14} className="ml-auto text-white/20" />
                </button>
              ))}
            </div>

            {/* Quick Recommendations */}
            {recommendations && (
              <Section title="Quest Map — Study Plan" icon={<Scroll size={16} />}>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Next Topics to Conquer</p>
                    <div className="flex flex-wrap gap-2">
                      {(recommendations.nextTopics || []).map((t: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border" style={{ background: `${C.purple}15`, borderColor: `${C.purple}30`, color: C.purple }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  {recommendations.weeklyPlan && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Weekly Battle Plan</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px]">
                          <thead><tr className="border-b border-white/5">{["Day", "Focus", "Duration", "Type"].map(h => <th key={h} className="text-left py-2 pr-4 font-black uppercase tracking-widest text-white/20">{h}</th>)}</tr></thead>
                          <tbody>
                            {recommendations.weeklyPlan.map((d: any, i: number) => (
                              <tr key={i} className="border-b border-white/5">
                                <td className="py-2 pr-4 font-black text-white/60">{d.day}</td>
                                <td className="py-2 pr-4 text-white/40">{d.focus}</td>
                                <td className="py-2 pr-4 text-white/40">{d.duration}m</td>
                                <td className="py-2"><span className="px-2 py-0.5 rounded-lg font-black" style={{ background: d.type === "learn" ? `${C.green}20` : d.type === "practice" ? `${C.cyan}20` : `${C.yellow}20`, color: d.type === "learn" ? C.green : d.type === "practice" ? C.cyan : C.yellow }}>{d.type}</span></td>
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
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <TrendingUp className="text-[#7C6AFA]" size={48} style={{ opacity: 0.5 }} />
                <p className="text-xs font-black uppercase tracking-widest text-white/30">Press "Predict My Score" to activate the Oracle</p>
                <button onClick={runPredict} className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white" style={{ background: `linear-gradient(135deg, ${C.cyan}, #0891B2)` }}>
                  Run Prediction
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard icon={<TrendingUp size={20} style={{ color: C.cyan }} />} label="Exam Success" value={`${prediction.examSuccessProbability}%`} sub="predicted probability" color={C.cyan} />
                  <StatCard icon={<Activity size={20} style={{ color: C.purple }} />} label="Score Trend" value={prediction.nextScoreTrend?.toUpperCase()} sub={`Predicted: ${prediction.predictedNextScore}%`} color={C.purple} />
                  <StatCard icon={<Shield size={20} style={{ color: C.green }} />} label="Confidence" value={`${prediction.confidenceLevel}%`} sub={`~${prediction.estimatedDaysToMastery}d to mastery`} color={C.green} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Section title="Strength Areas" icon={<Trophy size={14} />}>
                    <div className="space-y-2">{(prediction.strengthAreas || []).map((a: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${C.green}10` }}>
                        <Star size={12} style={{ color: C.green }} />
                        <span className="text-xs font-bold text-white/70">{a}</span>
                      </div>
                    ))}</div>
                  </Section>
                  <Section title="Weak Areas — Mission Targets" icon={<Target size={14} />}>
                    <div className="space-y-2">{(prediction.weakAreas || []).map((a: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${C.red}10` }}>
                        <Zap size={12} style={{ color: C.red }} />
                        <span className="text-xs font-bold text-white/70">{a}</span>
                      </div>
                    ))}</div>
                  </Section>
                </div>
                <Section title="Improvement Tips" icon={<Sparkles size={14} />}>
                  <div className="space-y-3">{(prediction.improvementTips || []).map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0" style={{ background: `${C.purple}20`, color: C.purple }}>{i + 1}</span>
                      <p className="text-xs text-white/60 leading-relaxed">{tip}</p>
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
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <Brain className="text-[#10B981]" size={48} style={{ opacity: 0.5 }} />
                <p className="text-xs font-black uppercase tracking-widest text-white/30">Detect your learning DNA from behaviour</p>
                <button onClick={runStyle} className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white" style={{ background: `linear-gradient(135deg, ${C.green}, #059669)` }}>
                  Detect Style
                </button>
              </div>
            ) : (
              <>
                <div className="p-8 rounded-2xl border-2 text-center" style={{ background: `${C.green}08`, borderColor: `${C.green}25` }}>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: `${C.green}20` }}>
                    <Brain size={36} style={{ color: C.green }} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">{learningStyle.primaryStyle} Learner</h2>
                  <p className="text-sm text-white/50 max-w-md mx-auto">{learningStyle.description}</p>
                  <div className="mt-4 px-4 py-2 inline-block rounded-xl" style={{ background: `${C.green}20` }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.green }}>Confidence: {learningStyle.confidence}%</span>
                  </div>
                </div>
                {learningStyle.recommendations && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Ideal Session", value: `${learningStyle.recommendations.idealSessionLength}m` },
                      { label: "Break Every", value: `${learningStyle.recommendations.breakFrequency}m` },
                      { label: "Content Format", value: learningStyle.recommendations.contentFormat },
                      { label: "Difficulty", value: learningStyle.recommendations.difficultyAdjustment },
                      { label: "Revision", value: learningStyle.recommendations.revisionFrequency?.replace("_", " ") },
                      { label: "Style Code", value: learningStyle.primaryStyle?.toUpperCase() },
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-2xl border border-white/5 text-center" style={{ background: C.card }}>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{item.label}</p>
                        <p className="text-sm font-black text-white">{item.value}</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard icon={<Eye size={20} style={{ color: C.cyan }} />} label="Current Focus Score" value={`${focusData.currentFocusScore}%`} sub="global rolling avg" color={C.cyan} />
                  <StatCard icon={<Clock size={20} style={{ color: C.purple }} />} label="Total Study Time" value={`${Math.round((focusData.totalStudyMinutes || 0) / 60)}h`} sub={`${focusData.totalStudyMinutes} minutes`} color={C.purple} />
                  <StatCard icon={<Activity size={20} style={{ color: C.green }} />} label="Total Sessions" value={focusData.totalSessions || 0} sub="all time" color={C.green} />
                </div>
                <Section title="7-Day Focus History" icon={<BarChart3 size={14} />}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={focusData.last7Days || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: C.card, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                      <Bar dataKey="focusScore" fill={C.cyan} radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </Section>
              </>
            ) : (
              <div className="text-center py-20 text-white/30">
                <Eye size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-xs font-black uppercase tracking-widest">No focus data yet. Start a Focus Mode session!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── REPORT CARD TAB ── */}
        {activeTab === "report" && (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {!report ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <Scroll className="text-[#FBBF24]" size={48} style={{ opacity: 0.5 }} />
                <p className="text-xs font-black uppercase tracking-widest text-white/30">Generate your AI-powered performance report</p>
                <button onClick={runReport} className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white" style={{ background: `linear-gradient(135deg, ${C.yellow}, #D97706)` }}>
                  Generate Report Card
                </button>
              </div>
            ) : (
              <>
                {/* Overall Grade */}
                <div className="p-8 rounded-2xl border-2 text-center" style={{ background: `${gradeColor(report.overallGrade)}08`, borderColor: `${gradeColor(report.overallGrade)}30` }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Overall Performance Grade</p>
                  <div className="text-8xl font-black mb-2" style={{ color: gradeColor(report.overallGrade) }}>{report.overallGrade}</div>
                  <p className="text-2xl font-black text-white">{report.overallScore}/100</p>
                  <p className="text-sm text-white/40 mt-3 max-w-lg mx-auto">{report.personalizedAdvice}</p>
                </div>
                {/* Category breakdown */}
                <Section title="Performance Breakdown" icon={<BarChart3 size={14} />}>
                  <div className="space-y-3">
                    {(report.categories || []).map((cat: any) => (
                      <div key={cat.name} className="flex items-center gap-4">
                        <div className="w-24 shrink-0">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{cat.name}</p>
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${cat.score}%` }} transition={{ delay: 0.1, duration: 0.8 }}
                            className="h-full rounded-full" style={{ background: gradeColor(cat.grade) }} />
                        </div>
                        <span className="w-8 text-right text-[10px] font-black shrink-0" style={{ color: gradeColor(cat.grade) }}>{cat.grade}</span>
                        <p className="text-[9px] text-white/30 flex-1 min-w-0 truncate">{cat.feedback}</p>
                      </div>
                    ))}
                  </div>
                </Section>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Section title="Strengths" icon={<Trophy size={14} />}>
                    <div className="space-y-2">{(report.strengths || []).map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${C.green}10` }}>
                        <Award size={12} style={{ color: C.green }} />
                        <span className="text-xs text-white/70">{s}</span>
                      </div>
                    ))}</div>
                  </Section>
                  <Section title="Areas to Improve" icon={<Target size={14} />}>
                    <div className="space-y-2">{(report.areasToImprove || []).map((a: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${C.yellow}10` }}>
                        <Zap size={12} style={{ color: C.yellow }} />
                        <span className="text-xs text-white/70">{a}</span>
                      </div>
                    ))}</div>
                  </Section>
                </div>
                <div className="p-5 rounded-2xl border border-white/5 text-center" style={{ background: C.card }}>
                  <p className="text-[9px] uppercase font-black tracking-widest text-white/30 mb-1">Next Milestone</p>
                  <p className="text-sm font-bold text-white/70">{report.nextMilestone}</p>
                </div>
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
