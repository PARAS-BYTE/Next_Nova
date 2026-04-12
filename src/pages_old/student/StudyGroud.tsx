"use client";
import { useNavStore } from '@/store/useNavStore';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Sword,
  Shield,
  Scroll,
  Trophy,
  Zap,
  Lock,
  Sparkles,
  Crown,
  Flame,
  Target,
  Map as MapIcon,
  Send,
  Bot,
  X,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import VideoPlayer from '@/components/VideoPlayer';
import LessonNotes from '@/components/LessonNotes';

// ─── AI Chatbot Component ────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AIChatbot = ({ courseTitle, lessonTitle }: { courseTitle: string; lessonTitle: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post('/api/chatbot', {
        message: userMessage,
        context: `The student is currently studying the course "${courseTitle}", lesson: "${lessonTitle}". Help them understand the material. Be concise and helpful. Use gaming terminology where appropriate (e.g., "quest", "level up", "power-up knowledge").`,
        history: messages.slice(-6),
      }, { withCredentials: true });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply || res.data.message || "I couldn't process that. Try again!" }]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Connection lost. The Nova AI Companion is recharging..." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all"
        style={{
          background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)',
          borderColor: '#7C6AFA',
          boxShadow: '0 0 25px rgba(124, 106, 250, 0.4)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] rounded-2xl border-2 overflow-hidden flex flex-col"
            style={{
              background: '#0A0A0C',
              borderColor: 'rgba(124, 106, 250, 0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(124, 106, 250, 0.1)',
            }}
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-[rgba(124,106,250,0.1)] to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7C6AFA]/20 border border-[#7C6AFA]/30">
                  <Bot className="w-5 h-5 text-[#7C6AFA]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Nova AI Companion</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Study Assistant • Online</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#34D399]" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px]" style={{ scrollbarWidth: 'thin' }}>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-[#7C6AFA] mx-auto mb-3 opacity-50" />
                  <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Ask me anything about your quest</p>
                  <p className="text-[10px] text-white/20 mt-1">I know everything about "{lessonTitle}"</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#7C6AFA] text-white rounded-br-sm'
                        : 'bg-white/5 text-white/80 border border-white/5 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl rounded-bl-sm">
                    <Loader2 className="w-4 h-4 text-[#7C6AFA] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5 bg-black/40">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your companion..."
                  className="flex-1 h-10 bg-white/5 border-white/10 rounded-xl text-xs text-white placeholder:text-white/20 focus:border-[#7C6AFA]"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="h-10 w-10 rounded-xl p-0"
                  style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)' }}
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Main StudyGround Component ────────────────────────────────
const StudyGround = () => {
  const courseId = useNavStore(s => s.navState);
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [videoWatchTime, setVideoWatchTime] = useState<{ [key: string]: number }>({});

  // ─── Track Course Access ────────────────────────────────
  const trackAccess = async () => {
    if (!courseId) return;
    try {
      await axios.post(`/api/courses/${courseId}/access`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Track access error:', err);
    }
  };

  // ─── Fetch Course ────────────────────────────────
  const fetchCourse = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/courses/getsingle', { courseId }, { withCredentials: true });
      setCourse(data);
      await trackAccess();

      if (data.completedLessons) {
        const completed = new Set(data.completedLessons.map((l: any) => l.lessonId?.toString()));
        setCompletedLessons(completed);
      }

      const firstLesson = data.modules[0]?.lessons[0];
      if (firstLesson) {
        setActiveVideo(firstLesson);
        fetchTranscript(firstLesson.videoUrl);
      }
    } catch (err) {
      console.error('❌ Fetch Course Error:', err);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch Transcript ────────────────────────────────
  const isYouTubeUrl = (url: string) => /youtube\.com|youtu\.be/.test(url || '');

  const fetchTranscript = async (videoUrl: string) => {
    try {
      if (!videoUrl) { setTranscript('Transcript unavailable for this video.'); return; }
      if (!isYouTubeUrl(videoUrl)) { setTranscript('Transcript is currently available only for YouTube lessons.'); return; }
      setTranscript('Loading transcript...');
      const { data } = await axios.post('/trans', { videoUrl });
      setTranscript(data.transcript || 'Transcript not available.');
    } catch (err) {
      console.error('⚠️ Transcript Fetch Error:', err);
      setTranscript('Transcript unavailable for this video.');
    }
  };

  useEffect(() => {
    if (courseId) { fetchCourse(); } else { toast.error('No course selected'); router.push('/student/learning'); }
  }, [courseId]);

  const handleLessonSelect = (lesson: any) => {
    if (!lesson) return;
    if (activeVideo?.videoUrl === lesson.videoUrl) return;
    setActiveVideo(lesson);
  };

  const markLessonComplete = async (lesson: any) => {
    if (!courseId || !lesson) return;
    try {
      const { data } = await axios.post(`/api/courses/${courseId}/complete-lesson`, { lessonId: lesson._id, videoUrl: lesson.videoUrl }, { withCredentials: true });
      if (data.success) {
        if (lesson._id) setCompletedLessons(new Set([...completedLessons, lesson._id.toString()]));
        if (course) {
          setCourse({ ...course, userProgress: { ...course.userProgress, progress: data.progress, completed: data.completed } });
        }
        if (data.xpGained > 0) toast.success(`Mission complete! +${data.xpGained} XP earned!`);
      }
    } catch (err: any) {
      console.error('Complete lesson error:', err);
      toast.error(err.response?.data?.message || 'Failed to mark lesson as complete');
    }
  };

  const handleVideoEnd = () => {
    if (activeVideo && !completedLessons.has(activeVideo._id?.toString() || '')) {
      const views = videoWatchTime[activeVideo.videoUrl] || 0;
      if (views >= 1) markLessonComplete(activeVideo);
    }
  };

  const handleNextLesson = () => {
    if (!course) return;
    for (let i = 0; i < course.modules.length; i++) {
      const lessons = course.modules[i].lessons;
      for (let j = 0; j < lessons.length; j++) {
        if (lessons[j].videoUrl === activeVideo.videoUrl) {
          if (lessons[j + 1]) { handleLessonSelect(lessons[j + 1]); }
          else if (course.modules[i + 1]?.lessons[0]) { handleLessonSelect(course.modules[i + 1].lessons[0]); }
          return;
        }
      }
    }
  };

  const isLessonCompleted = (lesson: any) => {
    if (!lesson._id) return false;
    return completedLessons.has(lesson._id.toString());
  };

  useEffect(() => {
    if (!activeVideo?.videoUrl) return;
    fetchTranscript(activeVideo.videoUrl);
    setVideoWatchTime(prev => ({ ...prev, [activeVideo.videoUrl]: (prev[activeVideo.videoUrl] || 0) + 1 }));
  }, [activeVideo?.videoUrl]);

  // ─── Calculate Stats ────────────────────────────────
  const totalLessons = course?.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedCount = completedLessons.size;
  const progressPercent = course?.userProgress?.progress || 0;

  // ─── Get current module/lesson index for "Level" display ────────────────────────
  const getCurrentLevel = () => {
    if (!course || !activeVideo) return { module: 1, lesson: 1 };
    for (let i = 0; i < course.modules.length; i++) {
      const lessons = course.modules[i].lessons;
      for (let j = 0; j < lessons.length; j++) {
        if (lessons[j].videoUrl === activeVideo.videoUrl) {
          return { module: i + 1, lesson: j + 1 };
        }
      }
    }
    return { module: 1, lesson: 1 };
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]" style={{ background: '#050507' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <Loader2 className="w-10 h-10 text-[#7C6AFA] animate-spin mx-auto mb-4" />
        <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-black">Loading Dungeon...</p>
      </motion.div>
    </div>
  );

  if (!course) return (
    <div className="flex justify-center items-center h-[80vh]" style={{ background: '#050507' }}>
      <p className="text-red-400 font-black uppercase tracking-widest text-sm">Course not found in the realm.</p>
    </div>
  );

  const level = getCurrentLevel();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: '#050507', color: '#FFFFFF' }}>
      {/* ─── Hero Banner ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl border-2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(124,106,250,0.08), rgba(34,211,238,0.05), rgba(0,0,0,0.9))',
          borderColor: 'rgba(124, 106, 250, 0.15)',
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #7C6AFA 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/student/learning')}
              className="text-white/50 hover:text-white font-black text-[10px] uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retreat
            </Button>
            <Badge className="text-[9px] font-black uppercase px-2 py-0" style={{ background: '#7C6AFA', color: '#fff' }}>
              LVL {level.module}.{level.lesson}
            </Badge>
            {course.userProgress?.completed && (
              <Badge className="text-[9px] font-black uppercase px-2 py-0" style={{ background: '#34D399', color: '#000' }}>
                <Crown className="w-3 h-3 mr-1" /> Conquered
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2" style={{ background: 'linear-gradient(135deg, #FFFFFF, #7C6AFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {course.title}
          </h1>
          <p className="text-xs text-white/40 mb-4 max-w-2xl">{course.description}</p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-widest font-black mb-4">
            <span className="flex items-center gap-2 text-white/50">
              <MapIcon className="w-3.5 h-3.5 text-[#7C6AFA]" /> {course.category}
            </span>
            <span className="flex items-center gap-2 text-white/50">
              <Clock className="w-3.5 h-3.5 text-[#22D3EE]" /> {course.duration}H Quest
            </span>
            <span className="flex items-center gap-2 text-white/50">
              <Sword className="w-3.5 h-3.5 text-[#FBBF24]" /> {course.level}
            </span>
            <span className="flex items-center gap-2 text-white/50">
              <Target className="w-3.5 h-3.5 text-[#34D399]" /> {completedCount}/{totalLessons} Missions
            </span>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
              <span className="text-white/40">Dungeon Mastery</span>
              <span style={{ color: '#7C6AFA' }}>{progressPercent}%</span>
            </div>
            <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: progressPercent === 100
                    ? 'linear-gradient(90deg, #34D399, #22D3EE)'
                    : 'linear-gradient(90deg, #7C6AFA, #22D3EE)',
                  boxShadow: `0 0 15px ${progressPercent === 100 ? 'rgba(52,211,153,0.5)' : 'rgba(124,106,250,0.5)'}`,
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Course Layout: Video + Sidebar ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Video + Transcript + Notes Section */}
        <div className="space-y-6">
          {/* Video Player */}
          <Card className="rounded-2xl border-2 overflow-hidden" style={{ background: '#0A0A0C', borderColor: 'rgba(124, 106, 250, 0.15)' }}>
            <CardContent className="p-0">
              {activeVideo ? (
                <div>
                  <div className="rounded-t-2xl overflow-hidden">
                    <VideoPlayer url={activeVideo.videoUrl} title={activeVideo.title} onEnded={handleVideoEnd} />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2" style={{ background: isLessonCompleted(activeVideo) ? 'rgba(52,211,153,0.1)' : 'rgba(124,106,250,0.1)', borderColor: isLessonCompleted(activeVideo) ? 'rgba(52,211,153,0.3)' : 'rgba(124,106,250,0.3)' }}>
                          {isLessonCompleted(activeVideo) ? <CheckCircle2 className="w-5 h-5 text-[#34D399]" /> : <Play className="w-5 h-5 text-[#7C6AFA]" />}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white">{activeVideo.title}</h3>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                            {activeVideo.duration || 0} MIN • Mission {level.lesson}
                          </p>
                        </div>
                      </div>
                      {isLessonCompleted(activeVideo) && (
                        <Badge className="text-[9px] font-black uppercase" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}>
                          <Sparkles className="w-3 h-3 mr-1" /> Cleared
                        </Badge>
                      )}
                    </div>

                    {!isLessonCompleted(activeVideo) && (
                      <div className="flex gap-3 mt-4">
                        <Button
                          onClick={() => markLessonComplete(activeVideo)}
                          className="flex-1 h-11 rounded-xl font-black text-xs uppercase tracking-widest"
                          style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', color: '#fff', boxShadow: '0 4px 15px rgba(124,106,250,0.3)' }}
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          Claim Victory
                        </Button>
                        <Button
                          onClick={handleNextLesson}
                          variant="outline"
                          className="h-11 rounded-xl font-black text-xs uppercase tracking-widest border-2"
                          style={{ borderColor: 'rgba(124,106,250,0.2)', color: '#7C6AFA', background: 'transparent' }}
                        >
                          Skip <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}

                    {isLessonCompleted(activeVideo) && (
                      <Button
                        onClick={handleNextLesson}
                        className="w-full mt-4 h-11 rounded-xl font-black text-xs uppercase tracking-widest"
                        style={{ background: 'rgba(34,211,238,0.1)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.2)' }}
                      >
                        Next Mission <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[450px] flex flex-col justify-center items-center">
                  <Shield className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-xs text-white/30 uppercase tracking-widest font-black">Select a mission to begin</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript - Intel Scroll */}
          {activeVideo && (
            <>
              <Card className="rounded-2xl border-2 overflow-hidden" style={{ background: '#0A0A0C', borderColor: 'rgba(255,255,255,0.05)' }}>
                <CardHeader className="bg-gradient-to-r from-[rgba(255,255,255,0.03)] to-transparent">
                  <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-white/50">
                    <Scroll className="w-4 h-4 text-[#FBBF24]" /> Intel Scroll
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-line text-white/50 scrollbar-thin p-1">
                    {transcript}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <LessonNotes
                lessonId={activeVideo?._id}
                courseId={course?._id}
                moduleId={course?.modules?.find((mod: any) =>
                  mod.lessons?.some((l: any) => l._id?.toString() === activeVideo?._id?.toString())
                )?._id}
              />
            </>
          )}
        </div>

        {/* ─── Sidebar - Dungeon Map ───────────────────────────── */}
        <div className="lg:h-[calc(100vh-180px)] overflow-y-auto pr-1 space-y-4 scrollbar-thin">
          <div className="sticky top-0 z-10 pb-3 pt-1" style={{ background: '#050507' }}>
            <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 flex items-center gap-2">
              <MapIcon className="w-3.5 h-3.5" /> Dungeon Map
            </h2>
          </div>

          {course.modules?.map((mod: any, modIndex: number) => {
            const modLessons = mod.lessons || [];
            const modCompleted = modLessons.filter((l: any) => isLessonCompleted(l)).length;
            const modTotal = modLessons.length;
            const modProgress = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
            const isExpanded = expandedModule === modIndex;
            const isModuleComplete = modCompleted === modTotal && modTotal > 0;

            return (
              <motion.div
                key={modIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: modIndex * 0.05 }}
              >
                <Card
                  className="rounded-2xl border-2 transition-all overflow-hidden"
                  style={{
                    background: isModuleComplete ? 'rgba(52,211,153,0.03)' : '#0A0A0C',
                    borderColor: isModuleComplete ? 'rgba(52,211,153,0.15)' : isExpanded ? 'rgba(124,106,250,0.2)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <CardHeader
                    className="cursor-pointer p-4"
                    onClick={() => setExpandedModule(isExpanded ? null : modIndex)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center border-2 text-xs font-black"
                          style={{
                            background: isModuleComplete ? 'rgba(52,211,153,0.1)' : 'rgba(124,106,250,0.1)',
                            borderColor: isModuleComplete ? 'rgba(52,211,153,0.2)' : 'rgba(124,106,250,0.2)',
                            color: isModuleComplete ? '#34D399' : '#7C6AFA',
                          }}
                        >
                          {isModuleComplete ? <Crown className="w-4 h-4" /> : `${modIndex + 1}`}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-black text-white">{mod.title || `Level ${modIndex + 1}`}</CardTitle>
                          <p className="text-[9px] uppercase tracking-widest font-bold text-white/30 mt-0.5">
                            {modCompleted}/{modTotal} Missions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black" style={{ color: isModuleComplete ? '#34D399' : '#7C6AFA' }}>
                          {modProgress}%
                        </span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
                      </div>
                    </div>

                    {/* Module XP bar */}
                    <div className="mt-3 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${modProgress}%` }}
                        className="h-full rounded-full"
                        style={{ background: isModuleComplete ? '#34D399' : '#7C6AFA' }}
                      />
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="space-y-2 pt-0 pb-4">
                          {modLessons.map((lesson: any, index: number) => {
                            const completed = isLessonCompleted(lesson);
                            const isActive = activeVideo?.videoUrl === lesson.videoUrl;

                            return (
                              <motion.button
                                key={index}
                                whileHover={{ x: 4 }}
                                onClick={() => handleLessonSelect(lesson)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2 ${isActive ? '' : 'hover:bg-white/[0.02]'}`}
                                style={{
                                  background: isActive ? 'rgba(124,106,250,0.1)' : 'transparent',
                                  borderColor: isActive ? 'rgba(124,106,250,0.3)' : completed ? 'rgba(52,211,153,0.1)' : 'transparent',
                                }}
                              >
                                {/* Mission Icon */}
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                  style={{
                                    background: completed ? 'rgba(52,211,153,0.1)' : isActive ? 'rgba(124,106,250,0.15)' : 'rgba(255,255,255,0.03)',
                                    borderColor: completed ? 'rgba(52,211,153,0.2)' : isActive ? 'rgba(124,106,250,0.3)' : 'rgba(255,255,255,0.05)',
                                  }}
                                >
                                  {completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                                  ) : isActive ? (
                                    <Play className="w-4 h-4 text-[#7C6AFA]" />
                                  ) : (
                                    <span className="text-[10px] font-black text-white/20">{index + 1}</span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-bold truncate ${completed ? 'text-[#34D399]' : isActive ? 'text-white' : 'text-white/60'}`}>
                                    {lesson.title}
                                  </p>
                                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-wider">
                                    {lesson.duration || 0} min
                                  </p>
                                </div>

                                {/* Reward indicator */}
                                {!completed && (
                                  <div className="text-[9px] font-black text-yellow-400/50 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    +{10}
                                  </div>
                                )}
                              </motion.button>
                            );
                          })}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Completion Banner ───────────────────────────── */}
      {course.userProgress?.completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-10 p-8 rounded-2xl border-2 relative overflow-hidden"
          style={{ background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.2)' }}
        >
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #34D399 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
          <Crown className="w-12 h-12 text-[#34D399] mx-auto mb-3" />
          <p className="text-xl font-black uppercase tracking-wider text-[#34D399]">
            Dungeon Conquered!
          </p>
          <p className="text-xs text-white/40 mt-2 uppercase tracking-widest font-bold">
            You have mastered "{course.title}"
          </p>
        </motion.div>
      )}

      {/* ─── AI Chatbot ───────────────────────────── */}
      <AIChatbot courseTitle={course?.title || ''} lessonTitle={activeVideo?.title || ''} />
    </div>
  );
};

export default StudyGround;
