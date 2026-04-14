"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { cn } from '@/lib/utils';
import {
  CalendarDays, Flame, CheckCircle2, Target, BookOpen, Zap, RefreshCw, Plus, ChevronLeft, ChevronRight, Swords, Trophy, Coins, Map as MapIcon, Flag, Timer, LayoutGrid, Sparkles, Skull, CircleDashed, Backpack, Crosshair, Hammer, Eye, Scroll
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { palette } from "@/theme/palette";

interface Task {
  taskId: string;
  _id?: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "completed" | "in-progress";
  category: string;
  priority: "low" | "medium" | "high";
  type: "study" | "quiz" | "reading" | "practice" | "assignment" | "review";
  estimatedDuration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface CalendarData {
  tasks: Task[]; todayTasks: Task[]; upcomingTasks: Task[];
  streak: { currentStreak: number; longestStreak: number };
  statistics: { totalTasksCompleted: number; completionRate: number; totalStudyTime: number; averageDailyTasks: number };
}

const Calendar = () => {
  const router = useRouter();
  const [calendarData, setCalendarData] = useState<CalendarData>({
    tasks: [], todayTasks: [], upcomingTasks: [],
    streak: { currentStreak: 0, longestStreak: 0 },
    statistics: { totalTasksCompleted: 0, completionRate: 0, totalStudyTime: 0, averageDailyTasks: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    type: "study",
    category: "General",
    priority: "medium",
    estimatedDuration: 30,
    difficulty: "beginner",
  });

  useEffect(() => { fetchCalendarData(); }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/calendar", { withCredentials: true });
      setCalendarData(res.data);
    } catch (err: any) {
      toast.error("Process Timeout");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      toast.error("Metadata Insufficient");
      return;
    }
    try {
      setCreating(true);
      await axios.post("/api/calendar/create-task", taskForm, { withCredentials: true });
      await fetchCalendarData();
      toast.success("Protocol Initialized");
      setIsCreateDialogOpen(false);
      setTaskForm({
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        type: "study",
        category: "General",
        priority: "medium",
        estimatedDuration: 30,
        difficulty: "beginner",
      });
    } catch (err: any) {
      toast.error("Authorization Error");
    } finally {
      setCreating(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8">
       <div className="w-14 h-14 rounded-full border-4 border-slate-50 border-t-[#1E4D3B] animate-spin" />
       <p className="text-[#1E4D3B] font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Synchronizing Roadmap…</p>
    </div>
  );

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  return (
    <div className="p-4 sm:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-black flex items-center gap-4 uppercase tracking-tighter">
            <MapIcon className="w-10 h-10 text-[#1E4D3B]" /> Hero's Roadmap
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1 opacity-70">Synchronizing Academic Milestones</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-14 px-10 rounded-[20px] bg-[#1E4D3B] text-white hover:bg-black font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-emerald-900/30 transition-all border-0 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-3" /> Initialize Protocol
        </Button>
      </div>

      {/* STATS ROW (BOOSTED COLORS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         <StatBox title="Active Streak" value={`${calendarData.streak.currentStreak} Days`} icon={<Flame size={20}/>} color="#1E4D3B" bg="bg-emerald-50/50" />
         <StatBox title="Clearance Rate" value={`${calendarData.statistics.completionRate}%`} icon={<CheckCircle2 size={20}/>} color="#000000" bg="bg-slate-50/50" />
         <StatBox title="Grand Mastery" value={`${calendarData.statistics.totalTasksCompleted}`} icon={<Trophy size={20}/>} color="#1E4D3B" bg="bg-emerald-50/50" />
         <StatBox title="Stamina Pool" value={`${calendarData.statistics.totalStudyTime}h`} icon={<Target size={20}/>} color="#000000" bg="bg-slate-50/50" />
      </div>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
         
         {/* Calendar Grid Section (BOOSTED CONTRAST) */}
         <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[48px] border-slate-100 shadow-[0_32px_64px_-16px_rgba(30,77,59,0.08)] overflow-hidden bg-white group">
               <CardHeader className="flex flex-row items-center justify-between p-10 border-b border-slate-50">
                  <CardTitle className="text-2xl font-black text-black flex items-center gap-5 uppercase tracking-tight">
                     <CalendarDays className="text-[#1E4D3B] group-hover:scale-110 transition-transform duration-500" size={28} />
                     {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" className="rounded-2xl w-11 h-11 border-slate-100 hover:border-[#1E4D3B] transition-all" onClick={() => navigateMonth('prev')}><ChevronLeft size={20} /></Button>
                     <Button variant="outline" size="icon" className="rounded-2xl w-11 h-11 border-slate-100 hover:border-[#1E4D3B] transition-all" onClick={() => navigateMonth('next')}><ChevronRight size={20} /></Button>
                  </div>
               </CardHeader>
               <CardContent className="p-12 pt-10">
                  <div className="grid grid-cols-7 mb-10 text-center">
                     {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                        <div key={d} className="text-[12px] font-black text-slate-300 tracking-[0.3em]">{d}</div>
                     ))}
                  </div>
                  <div className="grid grid-cols-7 gap-6 sm:gap-7 md:gap-8">
                     {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                     {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
                        const hasTask = calendarData.tasks.some(t => new Date(t.date).toDateString() === date.toDateString());
                        const isTaskCompleted = calendarData.tasks.some(t => new Date(t.date).toDateString() === date.toDateString() && t.status === "completed");
                        const isCurrent = date.toDateString() === new Date().toDateString();

                        return (
                           <motion.div
                              key={dayNum}
                              whileHover={{ scale: 1.2, y: -4, rotate: 2 }}
                              className={cn(
                                 "aspect-square flex items-center justify-center rounded-[24px] text-[16px] font-black transition-all border-2 relative cursor-pointer shadow-sm",
                                 isCurrent ? "bg-black text-white border-black shadow-2xl shadow-black/30" : "bg-white text-black border-slate-50 hover:border-[#1E4D3B]/20 hover:shadow-xl hover:shadow-emerald-900/5",
                                 isTaskCompleted && "border-[#1E4D3B] bg-[#1E4D3B] text-white shadow-lg shadow-emerald-900/20"
                              )}
                              onClick={() => {
                                 const task = calendarData.tasks.find(t => new Date(t.date).toDateString() === date.toDateString());
                                 if (task) router.push(`/task/${task.taskId}`);
                              }}
                           >
                              {dayNum}
                              {hasTask && !isTaskCompleted && !isCurrent && <div className="absolute bottom-3 w-2 h-2 rounded-full bg-[#1E4D3B] shadow-[0_0_8px_rgba(30,77,59,0.5)]" />}
                              {isTaskCompleted && <CheckCircle2 size={12} className="absolute top-2.5 right-2.5 text-white/50" />}
                           </motion.div>
                        );
                     })}
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Today & Upcoming Section (BOOSTED COLORS) */}
         <div className="space-y-8">
            <div className="px-2 flex items-center justify-between">
               <h3 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-3">
                  <Swords size={24} className="text-[#1E4D3B]" /> Directives
               </h3>
               <Badge className="bg-[#1E4D3B] text-white border-0 uppercase tracking-[0.2em] text-[9px] font-black px-4 py-1.5 rounded-xl shadow-lg shadow-emerald-900/40">{calendarData.todayTasks.length} ACTIVE</Badge>
            </div>
            
            <div className="space-y-5">
               {calendarData.todayTasks.map((task, i) => (
                  <ModuleItem key={task.taskId} task={task} index={i} onClick={() => router.push(`/task/${task.taskId}`)} />
               ))}
               {calendarData.todayTasks.length === 0 && (
                  <div className="p-16 text-center rounded-[48px] border-2 border-dashed border-slate-100 space-y-4 bg-slate-50/30">
                     <Sparkles className="mx-auto text-slate-100" size={48} />
                     <p className="text-[11px] font-black uppercase text-slate-300 tracking-[0.4em]">Grid Synchronized</p>
                  </div>
               )}
            </div>

            <div className="p-8 rounded-[40px] bg-black text-white space-y-5 shadow-2xl shadow-black/20 group">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1E4D3B]">AI Intelligence Link</h4>
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#1E4D3B] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500"><Zap size={18} className="text-white animate-pulse" /></div>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed">System scan reveals multiple curriculum targets in the next 24H cycle. Execute tasks to maintain your rank.</p>
               </div>
               <Button className="w-full h-12 bg-white text-black hover:bg-[#1E4D3B] hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all duration-300">ENGAGE FULL HUD</Button>
            </div>
         </div>
      </div>

      {/* CREATE TASK DIALOG (STRICT THEME) */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-[52px] border-0 p-12 bg-white shadow-2xl">
          <DialogHeader className="text-center space-y-4">
             <div className="w-20 h-20 rounded-[28px] bg-[#1E4D3B] text-white flex items-center justify-center mx-auto mb-2 shadow-2xl rotate-3">
                <Plus size={40} />
             </div>
             <DialogTitle className="text-3xl font-black tracking-tighter text-center uppercase">INCEPT CUSTOM MODULE</DialogTitle>
             <DialogDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Configure Protocol Parameters</DialogDescription>
          </DialogHeader>

          <div className="space-y-8 pt-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 text-slate-400">Class Identity</Label>
              <Input
                placeholder="Ex: QUANTUM MECHANICS 101"
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                className="rounded-2xl border-slate-100 h-16 bg-slate-50 font-black text-lg focus:border-[#1E4D3B] transition-all px-6"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 text-slate-400">Class Scope</Label>
              <Textarea
                placeholder="Declare module directives here…"
                value={taskForm.description}
                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                className="rounded-2xl border-slate-100 min-h-[120px] bg-slate-50 font-bold focus:border-[#1E4D3B] transition-all p-6"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 text-slate-400">Cycle Date</Label>
                 <Input
                   type="date"
                   value={taskForm.date}
                   onChange={e => setTaskForm({ ...taskForm, date: e.target.value })}
                   className="rounded-2xl border-slate-100 h-12 bg-slate-50 font-black px-4"
                 />
              </div>
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 text-slate-400">Module Type</Label>
                 <Select value={taskForm.type} onValueChange={val => setTaskForm({ ...taskForm, type: val })}>
                    <SelectTrigger className="rounded-2xl border-slate-100 h-12 bg-slate-50 font-black">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-50">
                       <SelectItem value="study">STUDY</SelectItem>
                       <SelectItem value="quiz">QUIZ</SelectItem>
                       <SelectItem value="reading">READING</SelectItem>
                       <SelectItem value="practice">PRACTICE</SelectItem>
                       <SelectItem value="assignment">ASSIGNMENT</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-12">
            <Button 
               disabled={creating}
               onClick={handleCreateTask}
               className="w-full h-16 bg-[#1E4D3B] hover:bg-black text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-emerald-900/40 transition-all active:scale-95"
            >
               {creating ? "AUTHORIZING…" : "EXECUTE PROTOCOL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

/* ── HELPERS RE-STYLED (BOOSTED COLORS) ── */

function StatBox({ title, value, icon, color, bg }: any) {
   return (
      <Card className={cn("rounded-[36px] border-slate-50 shadow-sm p-7 hover:shadow-2xl transition-all duration-500 bg-white group hover:-translate-y-2", bg)}>
         <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{title}</span>
            <div className="p-3 rounded-2xl bg-white text-black border border-slate-100 group-hover:bg-[#1E4D3B] group-hover:text-white group-hover:border-[#1E4D3B] transition-all duration-500 shadow-sm">{icon}</div>
         </div>
         <p className="text-3xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left" style={{ color: color }}>{value}</p>
      </Card>
   );
}

function ModuleItem({ task, index, onClick }: { task: Task; index: number; onClick: () => void }) {
   const isCompleted = task.status === "completed";
   return (
      <motion.div 
         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
         onClick={onClick}
         className={cn(
            "p-8 rounded-[40px] border transition-all duration-500 flex items-center gap-6 group cursor-pointer",
            isCompleted 
               ? "bg-[#1E4D3B] border-[#1E4D3B] shadow-2xl shadow-emerald-900/20" 
               : "bg-white border-slate-100 hover:border-[#1E4D3B]/40 hover:shadow-3xl hover:shadow-[#1E4D3B]/5 shadow-sm"
         )}
      >
         <div className={cn(
            "w-16 h-16 rounded-[24px] flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-lg",
            isCompleted 
               ? "bg-white text-[#1E4D3B]" 
               : "bg-black text-white group-hover:bg-[#1E4D3B]"
         )}>
            <BookOpen size={28} />
         </div>
         <div className="flex-1 min-w-0">
            <h4 className={cn(
               "text-xl font-black uppercase tracking-tight truncate pb-1 leading-none transition-colors duration-500", 
               isCompleted ? "text-white" : "text-black group-hover:text-[#1E4D3B]",
               isCompleted && "line-through opacity-70"
            )}>{task.title}</h4>
            <div className="flex items-center gap-4 mt-1">
               <span className={cn("text-[11px] font-black uppercase tracking-[0.2em]", isCompleted ? "text-white/60" : "text-slate-300")}>{task.difficulty}</span>
               <div className="flex items-center gap-2"><Zap size={10} className={isCompleted ? "text-white" : "text-[#1E4D3B]"} /><span className={cn("text-[11px] font-black", isCompleted ? "text-white" : "text-black")}>+50 MASTERY</span></div>
            </div>
         </div>
         <ChevronRight size={24} className={cn("transition-transform duration-500 group-hover:translate-x-2", isCompleted ? "text-white/40" : "text-slate-100")} />
      </motion.div>
   );
}

export default Calendar;