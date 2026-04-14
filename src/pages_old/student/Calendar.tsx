"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import {
  CalendarDays,
  Flame,
  CheckCircle2,
  Target,
  BookOpen,
  FileText,
  HelpCircle,
  Zap,
  TrendingUp,
  Lock,
  RefreshCw,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Swords,
  Scroll,
  Shield,
  Map as MapIcon,
  Crown,
  Trophy,
  Dumbbell,
  Hammer,
  Eye,
  Crosshair,
  Skull,
  Coins,
  Sparkles,
  CircleDashed,
  Sword,
  Gem,
  Backpack
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
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
import { Calendar as DatePicker } from "@/components/ui/calendar"; 
import { toast } from "sonner";
import { palette } from "@/theme/palette";

// Types
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
  aiGenerated: boolean;
  completedAt?: string;
  content?: any;
}

interface StudyPreferences {
  subjects: string[];
  difficultyLevel: string;
  dailyStudyTime: number;
  learningGoals: string[];
  preferredLearningStyles: string[];
}

interface CalendarData {
  tasks: Task[];
  todayTasks: Task[];
  upcomingTasks: Task[];
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  statistics: {
    totalTasksCompleted: number;
    completionRate: number;
    totalStudyTime: number;
    averageDailyTasks: number;
  };
  studyPreferences: StudyPreferences;
}

// Update these in your TaskItem component
const typeIcons = {
  study: Scroll,
  quiz: Swords,
  reading: BookOpen,
  practice: Crosshair,
  assignment: Hammer,
  review: Eye 
};

const typeColors = {
  study: "text-blue-400",
  quiz: "text-red-400",
  reading: "text-green-400",
  practice: "text-yellow-400",
  assignment: "text-orange-400",
  review: "text-pink-400"
};

// Fixed ShapeCell Component with visible numbers
const ShapeCell = ({
  day,
  isToday,
  isCompleted,
  isFuture,
  hasTask,
  onClick
}: {
  day: number;
  isToday: boolean;
  isCompleted: boolean;
  isFuture: boolean;
  hasTask: boolean;
  onClick?: () => void;
}) => {
  
  const getStyles = () => {
    if (isCompleted) {
      return {
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        textColor: '#34D399',
        borderColor: '#34D399',
        glow: 'rgba(52, 211, 153, 0.3)'
      };
    }
    if (isToday) {
      return {
        backgroundColor: 'rgba(124, 106, 250, 0.2)',
        textColor: '#FFFFFF',
        borderColor: '#7C6AFA',
        glow: 'rgba(124, 106, 250, 0.5)'
      };
    }
    if (hasTask) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        textColor: '#7C6AFA',
        borderColor: 'rgba(124, 106, 250, 0.4)',
        glow: 'transparent'
      };
    }
    return {
      backgroundColor: 'transparent',
      textColor: 'rgba(255, 255, 255, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      glow: 'transparent'
    };
  };

  const styles = getStyles();
  const hoverScale = hasTask && !isFuture ? 1.1 : 1;
  const cursorStyle = isFuture ? "cursor-not-allowed opacity-40" : hasTask ? "cursor-pointer" : "cursor-default";

  return (
    <motion.div
      whileHover={{ 
        scale: hoverScale,
        boxShadow: hasTask ? `0 0 15px ${styles.borderColor}` : 'none'
      }}
      onClick={hasTask && !isFuture ? onClick : undefined}
      className={`relative w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all border-2 ${cursorStyle} overflow-hidden`}
      style={{
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        boxShadow: styles.glow !== 'transparent' ? `inset 0 0 10px ${styles.glow}` : 'none'
      }}
    >
      {/* Background Pattern for gaming look */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

      <span style={{ color: styles.textColor, position: 'relative', zIndex: 1 }}>
        {day}
      </span>

      {isCompleted && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center bg-[#34D399] border-2 border-[#000]">
          <CheckCircle2 className="w-2.5 h-2.5 text-[#000]" />
        </div>
      )}

      {isToday && !isCompleted && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#7C6AFA] shadow-[0_0_8px_#7C6AFA] animate-pulse" />
      )}

      {hasTask && !isCompleted && !isToday && (
        <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[#7C6AFA] opacity-60" />
      )}
    </motion.div>
  );
};

// Task Item Component
const TaskItem = ({
  task,
  onComplete,
  onRegenerate
}: {
  task: Task;
  onComplete?: (taskId: string) => void;
  onRegenerate?: () => void;
}) => {
  const router = useRouter();
  const TypeIcon = typeIcons[task.type] || Scroll;

  const isTaskAvailable = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() <= today.getTime();
  };

  const handleTaskClick = () => {
    if (isTaskAvailable() && task.status !== "completed") {
      router.push(`/task/${task.taskId}`);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTaskAvailable() && task.status !== "completed" && onComplete) {
      onComplete(task.taskId);
    }
  };

  const isCompleted = task.status === "completed";
  const isLocked = !isTaskAvailable();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={!isLocked ? { x: 5, boxShadow: `0 0 20px rgba(124, 106, 250, 0.15)` } : {}}
      className={`relative group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all overflow-hidden`}
      style={{
        backgroundColor: isCompleted ? 'rgba(52, 211, 153, 0.05)' : isLocked ? 'rgba(255, 255, 255, 0.02)' : 'rgba(124, 106, 250, 0.03)',
        borderColor: isCompleted ? 'rgba(52, 211, 153, 0.3)' : isLocked ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 106, 250, 0.2)',
        cursor: isLocked || isCompleted ? "default" : "pointer"
      }}
      onClick={handleTaskClick}
    >
      {/* RPG rarity-like vertical bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ 
          background: isCompleted ? '#34D399' : isLocked ? '#4B5563' : '#7C6AFA',
          boxShadow: !isLocked && !isCompleted ? '0 0 10px #7C6AFA' : 'none'
        }} 
      />

      {/* Quest Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2"
        style={{
          backgroundColor: isCompleted ? 'rgba(52, 211, 153, 0.1)' : isLocked ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 106, 250, 0.1)',
          borderColor: isCompleted ? 'rgba(52, 211, 153, 0.2)' : isLocked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(124, 106, 250, 0.3)',
        }}
      >
        <TypeIcon className={`w-6 h-6 ${isCompleted ? 'text-[#34D399]' : isLocked ? 'text-gray-500' : 'text-[#7C6AFA]'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h4
              className={`text-base font-bold truncate`}
              style={{ color: isCompleted ? '#34D399' : isLocked ? '#6B7280' : '#FFFFFF' }}
            >
              {task.title}
            </h4>
            {isCompleted && <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Badge 
              variant="outline" 
              className="px-2 py-0 text-[10px] uppercase font-black" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                color: isCompleted ? '#34D399' : '#7C6AFA',
                borderColor: isCompleted ? 'rgba(52, 211, 153, 0.3)' : 'rgba(124, 106, 250, 0.3)'
              }}
            >
              {task.type}
            </Badge>
          </div>
        </div>

        <p className="text-xs line-clamp-2 mb-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          {task.description}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>+{30 + (task.difficulty === "advanced" ? 20 : task.difficulty === "intermediate" ? 10 : 0)} XP</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            <Coins className="w-3.5 h-3.5 text-yellow-500" />
            <span>+{task.difficulty === "advanced" ? 20 : task.difficulty === "intermediate" ? 10 : 5} Coins</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold ml-auto" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
            <Skull className="w-3.5 h-3.5" />
            <span className="capitalize">{task.difficulty}</span>
          </div>
        </div>

        {!isCompleted && !isLocked && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              onClick={handleComplete}
              className="flex-1 h-9 rounded-lg font-black text-xs uppercase tracking-wider transition-all"
              style={{ 
                background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)',
                color: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(124, 106, 250, 0.3)'
              }}
            >
              <Trophy className="w-3.5 h-3.5 mr-2" />
              Complete Quest
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onRegenerate?.(); }}
              className="w-9 h-9 rounded-lg shrink-0 border-2"
              style={{ borderColor: 'rgba(124, 106, 250, 0.2)', backgroundColor: 'transparent' }}
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#7C6AFA]" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const HeroStatsCard = ({ preferences }: { preferences: StudyPreferences }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner": return "text-green-400";
      case "intermediate": return "text-yellow-400";
      case "advanced": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <Card className="rounded-2xl border-2 overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
      <CardHeader className="bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-transparent">
        <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          <Backpack className="w-4 h-4 text-orange-400" /> Hero Class Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black opacity-40">Combat Level</span>
          <Badge variant="outline" className={`capitalize font-black text-[10px] ${getDifficultyColor(preferences.difficultyLevel)}`} style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'transparent' }}>
            {preferences.difficultyLevel}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black opacity-40">Stamina Buffer</span>
          <span className="text-xs font-black" style={{ color: '#FFFFFF' }}>
            {preferences.dailyStudyTime} MIN
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-black opacity-40 block mb-2">Techniques</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {preferences.subjects.slice(0, 4).map((subject, index) => (
              <Badge key={index} variant="secondary" className="text-[9px] font-black uppercase rounded-md" style={{ backgroundColor: 'rgba(124, 106, 250, 0.1)', color: '#7C6AFA', borderColor: 'rgba(124, 106, 250, 0.2)' }}>
                {subject}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl border border-dashed border-gray-800 bg-black/20">
          <span className="text-[10px] uppercase font-black opacity-40 block mb-2">Grand Ambitions</span>
          <div className="space-y-2">
            {preferences.learningGoals.slice(0, 2).map((goal, index) => (
              <div key={index} className="flex items-start gap-2 text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <CircleDashed className="w-3 h-3 text-[#7C6AFA] mt-0.5 shrink-0" />
                <span className="break-words line-clamp-2">{goal}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Calendar Component
const Calendar = () => {
  const router = useRouter();
  const [calendarData, setCalendarData] = useState<CalendarData>({
    tasks: [],
    todayTasks: [],
    upcomingTasks: [],
    streak: { currentStreak: 0, longestStreak: 0 },
    statistics: {
      totalTasksCompleted: 0,
      completionRate: 0,
      totalStudyTime: 0,
      averageDailyTasks: 0
    },
    studyPreferences: {
      subjects: [],
      difficultyLevel: "beginner",
      dailyStudyTime: 60,
      learningGoals: [],
      preferredLearningStyles: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    date: new Date(),
    type: "study",
    category: "General",
    priority: "medium",
    estimatedDuration: 30,
    difficulty: "beginner",
  });

  const today = new Date();

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Refresh when navigating back to calendar
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCalendarData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const normalizeTask = (task: any): Task => {
    if (!task) return task;
    const identifier =
      task.taskId ||
      (task._id ? task._id.toString() : undefined) ||
      new Date().getTime().toString();

    const questions = Array.isArray(task.content?.questions)
      ? task.content.questions.map((question: any, index: number) => ({
        ...question,
        questionNumber:
          question?.questionNumber !== undefined
            ? question.questionNumber
            : index + 1,
      }))
      : undefined;

    return {
      ...task,
      taskId: identifier,
      content: {
        ...task.content,
        questions,
      },
    } as Task;
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/calendar", {
        withCredentials: true,
      });
      
      const todayTasks = Array.isArray(res.data.todayTasks) ? res.data.todayTasks : [];

      if (todayTasks.length === 0 && res.data.tasks && res.data.tasks.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTask = res.data.tasks.find((t: Task) => {
          const taskDate = new Date(t.date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });
        if (todayTask) {
          res.data.todayTasks = [todayTask];
        }
      }

      setCalendarData({
        ...res.data,
        tasks: Array.isArray(res.data.tasks) ? res.data.tasks.map(normalizeTask) : [],
        todayTasks: Array.isArray(res.data.todayTasks)
          ? res.data.todayTasks.map(normalizeTask)
          : [],
      });

      if (!res.data.todayTasks || res.data.todayTasks.length === 0) {
        setTimeout(async () => {
          try {
            await axios.post(
              "/api/calendar/regenerate-today",
              {},
              { withCredentials: true }
            );
            await fetchCalendarData();
          } catch (err) {
            console.error("Auto-generate failed:", err);
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error("❌ Calendar fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setCompleting(taskId);
      const res = await axios.patch(
        `/api/calendar/complete/${taskId}`,
        {},
        { withCredentials: true }
      );

      await fetchCalendarData();
      const xpGained = res.data.xpGained || 0;
      toast.success(`${res.data.message} +${xpGained} XP earned! 🎉`);
    } catch (err: any) {
      console.error("Complete task error:", err);
      toast.error(err.response?.data?.message || "Failed to complete task");
    } finally {
      setCompleting(null);
    }
  };

  const handleRegenerateTask = async () => {
    try {
      setRegenerating(true);
      const res = await axios.post(
        "/api/calendar/regenerate-today",
        {},
        { withCredentials: true }
      );

      await fetchCalendarData();
      toast.success("Task regenerated with AI!");
    } catch (err: any) {
      console.error("Regenerate task error:", err);
      toast.error(err.response?.data?.message || "Failed to regenerate task");
    } finally {
      setRegenerating(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      toast.error("Please fill in title and description");
      return;
    }

    try {
      setCreating(true);
      const res = await axios.post(
        "/api/calendar/create-task",
        {
          ...taskForm,
          date: taskForm.date.toISOString().split('T')[0],
        },
        { withCredentials: true }
      );

      await fetchCalendarData();
      toast.success(res.data.message || "Custom task created successfully! 🎉");
      setIsCreateDialogOpen(false);
      setTaskForm({
        title: "",
        description: "",
        date: new Date(),
        type: "study",
        category: "General",
        priority: "medium",
        estimatedDuration: 30,
        difficulty: "beginner",
      });
    } catch (err: any) {
      console.error("Create task error:", err);
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  // Calendar navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const isCompleted = (date: Date) => {
    const tasks = calendarData.tasks || [];
    return tasks.some((t: Task) => {
      const taskDate = new Date(t.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === date.getTime() && t.status === "completed";
    });
  };

  const isFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
  };

  const hasTaskForDate = (date: Date): boolean => {
    const tasks = calendarData.tasks || [];
    return tasks.some((t: Task) => {
      const taskDate = new Date(t.date);
      taskDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return taskDate.getTime() === date.getTime();
    });
  };

  const handleDayClick = (date: Date) => {
    const tasks = calendarData.tasks || [];
    const task = tasks.find((t: Task) => {
      const taskDate = new Date(t.date);
      taskDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return taskDate.getTime() === date.getTime();
    });
    
    if (task && task.status !== "completed") {
      router.push(`/task/${task.taskId}`);
    }
  };

  // Generate calendar grid
  const generateCalendarGrid = () => {
    const totalDays = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8 sm:w-10 sm:h-10" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const hasTask = hasTaskForDate(date);

      days.push(
        <ShapeCell
          key={day}
          day={day}
          isToday={isToday(date)}
          isCompleted={isCompleted(date)}
          isFuture={isFuture(date)}
          hasTask={hasTask}
          onClick={() => handleDayClick(date)}
        />
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center" style={{ backgroundColor: palette.bg, color: palette.text }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: palette.text }}></div>
          <p style={{ color: palette.text2 }}>AI is generating your daily task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen space-y-8" style={{ backgroundColor: palette.bg, color: palette.text }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3 text-gradient uppercase tracking-tighter">
            <MapIcon className="w-8 h-8 text-[#7C6AFA]" /> Hero's Journey
          </h1>
          <p className="text-sm sm:text-base mt-1 font-medium opacity-60">
            Conquer your daily quests and climb the ranks of LearnNova.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full sm:w-auto h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
            style={{ 
              background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', 
              color: '#fff',
              boxShadow: '0 8px 20px rgba(124, 106, 250, 0.3)'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Custom Quest
          </Button>
        </div>
      </div>
      
      {/* Streak & Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-2" style={{ backgroundColor: 'rgba(124, 106, 250, 0.05)', borderColor: 'rgba(124, 106, 250, 0.1)' }}>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-50">
              <Flame className="w-4 h-4 text-orange-500" /> Battle Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-black text-gradient">
              {calendarData.streak.currentStreak} DAYS
            </div>
            <div className="text-[10px] uppercase font-bold opacity-40">
              Best: {calendarData.streak.longestStreak}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2" style={{ backgroundColor: 'rgba(52, 211, 153, 0.05)', borderColor: 'rgba(52, 211, 153, 0.1)' }}>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-50">
              <Sword className="w-4 h-4 text-[#34D399]" /> Quests Won
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-black text-[#34D399]">
              {calendarData.statistics.totalTasksCompleted}
            </div>
            <div className="text-[10px] uppercase font-bold opacity-40">
              TOTAL CLEARED
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2" style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)', borderColor: 'rgba(251, 191, 36, 0.1)' }}>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-50">
              <Crown className="w-4 h-4 text-[#FBBF24]" /> Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-black text-[#FBBF24]">
              {calendarData.statistics.completionRate}%
            </div>
            <div className="text-[10px] uppercase font-bold opacity-40">
              OVERALL RANK
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2" style={{ backgroundColor: 'rgba(236, 72, 153, 0.05)', borderColor: 'rgba(236, 72, 153, 0.1)' }}>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-50">
              <Gem className="w-4 h-4 text-[#EC4899]" /> Play Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-black text-[#EC4899]">
              {Math.round(calendarData.statistics.totalStudyTime / 60)}H
            </div>
            <div className="text-[10px] uppercase font-bold opacity-40">
              LIFETIME HOURS
            </div>
          </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm" style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}` }}>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
              <CardTitle className="text-lg flex items-center gap-2 min-w-0" style={{ color: palette.text }}>
                <CalendarDays className="w-5 h-5 shrink-0" />
                <span className="truncate">
                  {currentMonth.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  style={{ borderColor: palette.border, color: palette.text, backgroundColor: palette.card }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                  style={{ borderColor: palette.border, color: palette.text, backgroundColor: palette.card }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  style={{ borderColor: palette.border, color: palette.text, backgroundColor: palette.card }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week Headers */}
              <div className="grid grid-cols-7 text-center mb-4 text-[10px] sm:text-sm font-medium" style={{ color: palette.text2 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2 truncate">{day}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 justify-items-center">
                {generateCalendarGrid()}
              </div>

              {/* Updated Legend */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: palette.accentDeep }}></div>
                  <span style={{ color: palette.text2 }}>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: palette.accent }}></div>
                  <span style={{ color: palette.text2 }}>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: palette.text }}></div>
                  <span style={{ color: palette.text2 }}>Pending Task</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border" style={{ backgroundColor: palette.card, borderColor: palette.border }}></div>
                  <span style={{ color: palette.text2 }}>No Task</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-2 overflow-hidden" style={{ backgroundColor: 'rgba(124, 106, 250, 0.05)', borderColor: 'rgba(124, 106, 250, 0.1)' }}>
            <CardHeader className="bg-gradient-to-r from-[rgba(124,106,250,0.1)] to-transparent">
              <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest" style={{ color: '#FFFFFF' }}>
                <Target className="w-4 h-4 text-[#7C6AFA]" /> Active Campaign
                <Badge variant="secondary" className="ml-auto text-[10px] font-black" style={{ backgroundColor: '#7C6AFA', color: '#FFFFFF' }}>
                  {calendarData.todayTasks?.length || 0}/1
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {calendarData.todayTasks?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-700 bg-gray-900">
                    <MapIcon className="w-8 h-8 text-gray-700" />
                  </div>
                  <p className="text-xs font-bold mb-4 opacity-50 uppercase tracking-widest">
                    No active quest in your region.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleRegenerateTask}
                    disabled={regenerating}
                    className="w-full h-10 rounded-xl font-black text-xs uppercase tracking-wider"
                    style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', color: '#FFFFFF' }}
                  >
                    {regenerating ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {regenerating ? "SCRYING..." : "FORGE NEW QUEST"}
                  </Button>
                </div>
              ) : (
                calendarData.todayTasks.map((task) => (
                  <TaskItem
                    key={task.taskId}
                    task={task}
                    onComplete={handleCompleteTask}
                    onRegenerate={handleRegenerateTask}
                  />
                ))
              )}

              {/* Progress visual */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                  <span>Quest Integrity</span>
                  <span style={{ color: '#7C6AFA' }}>
                    {calendarData.todayTasks?.some(t => t.status === "completed") ? "100%" : "0%"}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: calendarData.todayTasks?.some(t => t.status === "completed") ? '100%' : '0%' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#7C6AFA] to-[#22D3EE]"
                    style={{ boxShadow: '0 0 10px rgba(124, 106, 250, 0.5)' }}
                   />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hero Stats */}
          <HeroStatsCard preferences={calendarData.studyPreferences} />
          
          {/* Statistics */}
          <Card className="rounded-2xl border-2" style={{ backgroundColor: 'rgba(34, 211, 238, 0.05)', borderColor: 'rgba(34, 211, 238, 0.1)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-50">
                <TrendingUp className="w-4 h-4 text-[#22D3EE]" /> Adventurer Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="opacity-40 uppercase">AVG CLEAR RATE</span>
                <span className="text-[#22D3EE]">
                  {calendarData.statistics.averageDailyTasks.toFixed(1)} PER DAY
                </span>
              </div>
              <div className="text-[10px] uppercase font-black tracking-widest mt-4 p-4 rounded-xl bg-black/40 border border-[#7C6AFA]/20 text-[#7C6AFA]">
                 <span className="flex items-center gap-2">
                   <Shield className="w-3 h-3" /> TIP: Keep the fire burning to gain +XP buffs!
                 </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Quest Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2" style={{ backgroundColor: '#0A0A0C', borderColor: 'rgba(124, 106, 250, 0.3)', color: '#FFFFFF' }}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-gradient">Summon New Quest</DialogTitle>
            <DialogDescription className="text-xs font-medium opacity-50 uppercase tracking-widest">
              Forge a custom trial to test your limits and claim legendary rewards.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest opacity-40">Quest Title</Label>
              <Input
                id="title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Name your challenge..."
                className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-[#7C6AFA] focus:ring-1 focus:ring-[#7C6AFA]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest opacity-40">Quest Intelligence</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="What must be done for victory?"
                rows={3}
                className="bg-white/5 border-white/10 rounded-xl focus:border-[#7C6AFA] focus:ring-1 focus:ring-[#7C6AFA]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest opacity-40">Target Date</Label>
                <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <DatePicker
                    mode="single"
                    selected={taskForm.date}
                    onSelect={(date) => date && setTaskForm({ ...taskForm, date })}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3 bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest opacity-40">Quest Archetype</Label>
                  <Select
                    value={taskForm.type}
                    onValueChange={(value) => setTaskForm({ ...taskForm, type: value as Task['type'] })}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0C] border-white/10">
                      <SelectItem value="study" className="focus:bg-[#7C6AFA]">Scroll (Study)</SelectItem>
                      <SelectItem value="quiz" className="focus:bg-[#7C6AFA]">Battle (Quiz)</SelectItem>
                      <SelectItem value="reading" className="focus:bg-[#7C6AFA]">Research (Reading)</SelectItem>
                      <SelectItem value="practice" className="focus:bg-[#7C6AFA]">Training (Practice)</SelectItem>
                      <SelectItem value="assignment" className="focus:bg-[#7C6AFA]">Bounty (Assignment)</SelectItem>
                      <SelectItem value="review" className="focus:bg-[#7C6AFA]">Scouting (Review)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-[10px] font-black uppercase tracking-widest opacity-40">Stamina (min)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={taskForm.estimatedDuration}
                        onChange={(e) => setTaskForm({ ...taskForm, estimatedDuration: parseInt(e.target.value) || 30 })}
                        className="h-12 bg-white/5 border-white/10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-[10px] font-black uppercase tracking-widest opacity-40">Danger Level</Label>
                      <Select
                        value={taskForm.difficulty}
                        onValueChange={(value) => setTaskForm({ ...taskForm, difficulty: value as Task['difficulty'] })}
                      >
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0A0C] border-white/10">
                          <SelectItem value="beginner" className="text-green-400">Safe</SelectItem>
                          <SelectItem value="intermediate" className="text-yellow-400">Risky</SelectItem>
                          <SelectItem value="advanced" className="text-red-400">Deadly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
              className="font-black text-xs uppercase tracking-widest opacity-50 hover:opacity-100"
            >
              Abandon
            </Button>
            <Button
                onClick={handleCreateTask}
                disabled={creating}
                className="h-12 px-8 rounded-xl font-black text-xs uppercase tracking-widest"
                style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', color: '#FFFFFF' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {creating ? "FORGING..." : "FORGE QUEST"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;