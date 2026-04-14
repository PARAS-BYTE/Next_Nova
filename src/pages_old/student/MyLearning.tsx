"use client";
import { useNavStore } from '@/store/useNavStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Search,
  CheckCircle2,
  Play,
  FileText,
  ChevronDown,
  ChevronRight,
  Sword,
  Shield,
  Crown,
  Target,
  Zap,
  Sparkles,
  Trophy,
  Flame,
  Lock,
  Scroll,
} from "lucide-react";

import VideoPlayer from "@/components/VideoPlayer";
import { cn } from "@/lib/utils";

const MyLearning = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCourse, setActiveCourse] = useState<any | null>(null);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [courseLoading, setCourseLoading] = useState(false);
  const router = useRouter();

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/courses/my", { withCredentials: true });
      setCourses(data);
    } catch (err: any) {
      console.error("My Courses Fetch Error:", err);
      setError("Failed to load your quests.");
    } finally {
      setLoading(false);
    }
  };

  const isYouTubeUrl = (url: string) => /youtube\.com|youtu\.be/.test(url || "");

  const fetchTranscript = async (videoUrl: string) => {
    if (!videoUrl) { setTranscript("Intel unavailable."); return; }
    if (!isYouTubeUrl(videoUrl)) { setTranscript("Intel currently available only for YouTube missions."); return; }
    try {
      setTranscript("Decrypting intel...");
      const { data } = await axios.post("/trans", { videoUrl });
      setTranscript(data.transcript || "Intel not available.");
    } catch (error) {
      console.error("Transcript fetch error:", error);
      setTranscript("Intel unavailable.");
    }
  };

  const handleLessonSelect = (lesson: any) => {
    if (!lesson) return;
    setActiveLesson(lesson);
    fetchTranscript(lesson.videoUrl);
  };

  const handleContinue = async (courseId: string) => {
    try {
      setCourseLoading(true);
      setError("");
      const { data } = await axios.post("/api/courses/getsingle", { courseId }, { withCredentials: true });
      setActiveCourse(data);
      const firstLesson = data.modules?.[0]?.lessons?.[0];
      if (firstLesson) { setActiveLesson(firstLesson); fetchTranscript(firstLesson.videoUrl); }
      else { setActiveLesson(null); setTranscript("This dungeon has no missions yet."); }
    } catch (err: any) {
      console.error("Continue course error:", err);
      setError(err.response?.data?.message || "Failed to enter the dungeon.");
    } finally {
      setCourseLoading(false);
    }
  };

  useEffect(() => { fetchMyCourses(); }, []);

  const filteredCourses = courses.filter((course) =>
    (course?.title || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 min-h-screen bg-white" style={{ background: '#FFFFFF' }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight flex items-center gap-3 text-black italic">
          <Shield className="w-8 h-8 text-[#1E4D3B]" /> My Dungeons
        </h1>
        <p className="text-xs text-slate-300 mt-1 uppercase tracking-[0.3em] font-black">
          Continue your enrolled dungeon campaigns
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <Input
          placeholder="Search dungeons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 text-xs bg-slate-50 border-2 border-slate-50 rounded-xl text-black placeholder:text-slate-200 focus:border-[#1E4D3B]"
        />
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-[#1E4D3B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-200 uppercase tracking-widest font-black">Scanning realm...</p>
        </div>
      )}
      {error && <p className="text-center text-red-500 text-xs font-black uppercase tracking-widest">{error}</p>}

      {/* Course Cards */}
      {!loading && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const isComplete = course.progress === 100;
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  className="h-full rounded-2xl border-2 overflow-hidden transition-all group bg-white shadow-sm"
                  style={{
                    borderColor: isComplete ? 'rgba(30, 77, 59, 0.1)' : 'rgba(0,0,0,0.03)',
                  }}
                >
                  <CardHeader className="pb-3 p-4">
                    {/* Thumbnail */}
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 relative border border-slate-50">
                      <img
                        src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80"}
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <Badge className="text-[8px] font-black uppercase px-2 py-0.5 bg-black/80 text-white border-0">
                          {course.level || 'Unknown'}
                        </Badge>
                      </div>
                      {isComplete && (
                        <div className="absolute top-2 right-2">
                          <Badge className="text-[8px] font-black uppercase px-2 py-0.5 bg-[#1E4D3B] text-white border-0">
                            <Crown className="w-2.5 h-2.5 mr-0.5" /> Conquered
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardTitle className="text-base font-black text-black group-hover:text-[#1E4D3B] transition-colors leading-none">{course.title}</CardTitle>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold line-clamp-2 leading-relaxed">{course.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4 p-4 pt-0">
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-black text-slate-300">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-black" /> {course.duration || 0}H</span>
                      <span className="flex items-center gap-1.5"><Sword size={14} className="text-[#1E4D3B]" /> {course.modules?.length || 0} Levels</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                        <span className="text-slate-300">Dungeon Mastery</span>
                        <span style={{ color: isComplete ? '#000000' : '#1E4D3B' }}>{course.progress || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress || 0}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{
                            background: isComplete ? '#000000' : '#1E4D3B',
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest text-white hover:bg-black transition-all"
                        style={{ background: '#1E4D3B' }}
                        onClick={() => handleContinue(course._id)}
                        disabled={courseLoading && activeCourse?._id === course._id}
                      >
                        <Play className="w-3 h-3 mr-1.5" />
                        {courseLoading && activeCourse?._id === course._id ? "SYNCING..." : isComplete ? "REPLAY" : "CONTINUE"}
                      </Button>
                      <Button
                        className="h-10 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 border-slate-100 bg-white text-black hover:bg-slate-50 transition-all"
                        onClick={() => (useNavStore.getState().setNavState(course._id), router.push("/student/ground"))}
                      >
                        <Target className="w-3 h-3 mr-1.5" /> Workspace
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-16 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-white border border-slate-100 shadow-sm">
              <Shield className="w-10 h-10 text-slate-100" />
            </div>
            <p className="text-sm font-black text-black uppercase tracking-[0.4em] mb-2">No active dungeons</p>
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Enlist in a campaign to begin your scholarship.</p>
          </div>
        )
      )}

      {/* ─── Course Player Section ───────────────────────────── */}
      {(courseLoading || activeCourse) && (
        <div className="space-y-6 pt-10 border-t-2 border-slate-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-black uppercase tracking-wider flex items-center gap-2">
                <Sword className="w-5 h-5 text-[#1E4D3B]" /> Arena Dashboard
              </h2>
              {activeCourse && <p className="text-[10px] text-slate-300 uppercase tracking-widest font-black italic">{activeCourse.title}</p>}
            </div>
            {activeCourse && (
              <Button
                variant="outline"
                className="font-black text-[9px] uppercase tracking-widest border-2 border-slate-100 rounded-xl h-10 hover:bg-slate-50 text-black"
                onClick={() => (useNavStore.getState().setNavState(activeCourse._id), router.push("/student/ground"))}
              >
                <Target className="w-3 h-3 mr-1.5" /> Open full workspace
              </Button>
            )}
          </div>

          {activeCourse && (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-10">
                <Card className="rounded-2xl border-2 overflow-hidden bg-white shadow-2xl" style={{ borderColor: 'rgba(0,0,0,0.03)' }}>
                  <CardContent className="p-0">
                    {activeLesson ? (
                      <>
                        <div className="rounded-t-2xl overflow-hidden shadow-lg">
                          <VideoPlayer url={activeLesson.videoUrl} title={activeLesson.title} />
                        </div>
                        <div className="p-5 flex items-center justify-between border-t border-slate-50">
                          <div>
                             <h3 className="text-sm font-black text-black leading-none">{activeLesson.title}</h3>
                             <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1">
                               {activeLesson.duration || 0} MINUTES REMAINING
                             </p>
                          </div>
                          <Badge className="bg-[#1E4D3B] text-white border-0 px-2 py-1 text-[9px] font-black uppercase">ACTIVE SESSION</Badge>
                        </div>
                      </>
                    ) : (
                      <div className="h-[320px] flex items-center justify-center italic text-slate-200 uppercase font-black tracking-widest text-[10px]">
                        Select protocol phase to start sync
                      </div>
                    )}
                  </CardContent>
                </Card>

                {activeLesson && (
                  <Card className="rounded-2xl border-2 bg-white" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <CardHeader className="bg-slate-50/50 border-b border-slate-50 p-4">
                      <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.3em] text-black/40">
                        <Scroll className="w-3.5 h-3.5 text-[#1E4D3B]" /> Intelligence Stream
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-xs font-bold leading-relaxed max-h-[200px] overflow-y-auto whitespace-pre-line text-slate-400">
                        {transcript || "Synchronizing telemetry..."}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Lesson List */}
              <Card className="rounded-2xl border-2 bg-white max-h-[600px] overflow-y-auto shadow-sm" style={{ borderColor: 'rgba(0,0,0,0.03)' }}>
                <CardHeader className="sticky top-0 z-10 bg-white border-b border-slate-50 p-4">
                  <CardTitle className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-300">
                    Curriculum Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  {activeCourse.modules?.map((mod: any, modIndex: number) => (
                    <div key={modIndex} className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1E4D3B] border-l-4 border-[#1E4D3B] pl-2">
                        LEVEL {modIndex + 1} — {mod.title}
                      </h4>
                      <div className="space-y-1.5 pl-3">
                        {mod.lessons?.map((lesson: any, lIdx: number) => {
                          const isActive = activeLesson?._id === lesson._id;
                          return (
                            <motion.button
                              key={lesson._id}
                              whileHover={{ x: 3 }}
                              onClick={() => handleLessonSelect(lesson)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl text-left border-2 transition-all",
                                isActive ? 'bg-black text-white border-black' : 'bg-white border-transparent hover:bg-slate-50'
                              )}
                            >
                              <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center border font-black text-[9px]",
                                isActive ? 'bg-[#1E4D3B] text-white border-[#1E4D3B]' : 'bg-slate-50 border-slate-100 text-slate-300'
                              )}>
                                {isActive ? <Play className="w-3 h-3 px-0.5" /> : lIdx + 1}
                              </div>
                              <span className="flex-1 text-xs font-black truncate">{lesson.title}</span>
                              <span className="text-[8px] text-slate-200 font-black">{lesson.duration || 0}M</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyLearning;
