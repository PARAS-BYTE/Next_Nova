"use client";
import { useNavStore } from '@/store/useNavStore';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
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

const MyLearning = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCourse, setActiveCourse] = useState<any | null>(null);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [courseLoading, setCourseLoading] = useState(false);
  const [lessonNotes, setLessonNotes] = useState<{ [key: string]: any }>({});
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const router = useRouter();

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/courses/my", { withCredentials: true });
      setCourses(data);
      
      const notesMap: { [key: string]: any } = {};
      for (const course of data) {
        if (course.modules) {
          for (const module of course.modules) {
            if (module.lessons) {
              for (const lesson of module.lessons) {
                try {
                  const noteRes = await axios.get(`/api/notes/${lesson._id}`, { withCredentials: true });
                  if (noteRes.data?.note?.note) notesMap[lesson._id] = noteRes.data.note.note;
                } catch (err) { /* Note doesn't exist */ }
              }
            }
          }
        }
      }
      setLessonNotes(notesMap);
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
  useEffect(() => {
    const handleFocus = () => fetchMyCourses();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const filteredCourses = courses.filter((course) =>
    (course?.title || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return { bg: 'rgba(52,211,153,0.1)', text: '#34D399', border: 'rgba(52,211,153,0.2)' };
      case 'intermediate': return { bg: 'rgba(251,191,36,0.1)', text: '#FBBF24', border: 'rgba(251,191,36,0.2)' };
      case 'advanced': return { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', border: 'rgba(239,68,68,0.2)' };
      default: return { bg: 'rgba(124,106,250,0.1)', text: '#7C6AFA', border: 'rgba(124,106,250,0.2)' };
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 min-h-screen" style={{ background: '#050507' }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #FFFFFF, #7C6AFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          <Shield className="w-8 h-8 text-[#7C6AFA]" /> My Dungeons
        </h1>
        <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">
          Continue your enrolled dungeon campaigns
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <Input
          placeholder="Search dungeons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 text-xs bg-white/5 border-2 border-white/5 rounded-xl text-white placeholder:text-white/15 focus:border-[#7C6AFA]"
        />
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-[#7C6AFA] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-white/30 uppercase tracking-widest font-black">Scanning realm...</p>
        </div>
      )}
      {error && <p className="text-center text-red-400 text-xs font-bold">{error}</p>}

      {/* Course Cards */}
      {!loading && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const diffColor = getDifficultyColor(course.level);
            const isComplete = course.progress === 100;

            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  className="h-full rounded-2xl border-2 overflow-hidden transition-all group"
                  style={{
                    background: '#0A0A0C',
                    borderColor: isComplete ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <CardHeader className="pb-3">
                    {/* Thumbnail */}
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 relative border border-white/5">
                      <img
                        src={course.thumbnail || "https://via.placeholder.com/400x250?text=Dungeon+Map"}
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Overlay badges */}
                      <div className="absolute top-2 left-2 flex gap-2">
                        <Badge className="text-[8px] font-black uppercase px-1.5 py-0" style={{ background: diffColor.bg, color: diffColor.text, border: `1px solid ${diffColor.border}` }}>
                          {course.level || 'Unknown'}
                        </Badge>
                      </div>
                      {isComplete && (
                        <div className="absolute top-2 right-2">
                          <Badge className="text-[8px] font-black uppercase px-1.5 py-0" style={{ background: 'rgba(52,211,153,0.9)', color: '#000' }}>
                            <Crown className="w-2.5 h-2.5 mr-0.5" /> Conquered
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardTitle className="text-base font-black text-white mb-1">{course.title}</CardTitle>
                    <p className="text-[10px] text-white/40 line-clamp-2">{course.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-black text-white/30">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#22D3EE]" /> {course.duration || 0}H
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Sword className="w-3 h-3 text-[#FBBF24]" /> {course.modules?.length || 0} Levels
                      </span>
                    </div>

                    {/* XP Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                        <span className="text-white/30">Dungeon Mastery</span>
                        <span style={{ color: isComplete ? '#34D399' : '#7C6AFA' }}>{course.progress || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress || 0}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{
                            background: isComplete ? 'linear-gradient(90deg, #34D399, #22D3EE)' : 'linear-gradient(90deg, #7C6AFA, #22D3EE)',
                            boxShadow: `0 0 8px ${isComplete ? 'rgba(52,211,153,0.4)' : 'rgba(124,106,250,0.4)'}`,
                          }}
                        />
                      </div>
                      {isComplete && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black mt-1.5 text-[#34D399] uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> Dungeon Conquered!
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest"
                        style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', color: '#fff', boxShadow: '0 4px 15px rgba(124,106,250,0.2)' }}
                        onClick={() => handleContinue(course._id)}
                        disabled={courseLoading && activeCourse?._id === course._id}
                      >
                        <Play className="w-3 h-3 mr-1.5" />
                        {courseLoading && activeCourse?._id === course._id ? "Loading..." : isComplete ? "Replay" : "Continue"}
                      </Button>
                      <Button
                        className="h-10 rounded-xl font-black text-[9px] uppercase tracking-widest border-2"
                        variant="outline"
                        style={{ borderColor: 'rgba(124,106,250,0.2)', color: '#7C6AFA', background: 'transparent' }}
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
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 border-2 border-dashed" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <Shield className="w-10 h-10 text-white/10" />
            </div>
            <p className="text-sm font-black text-white/30 uppercase tracking-widest mb-2">No Dungeons Found</p>
            <p className="text-[10px] text-white/15 uppercase tracking-wider">
              You haven't enlisted in any dungeon campaigns yet.
            </p>
          </div>
        )
      )}

      {/* ─── Course Player Section ───────────────────────────── */}
      {(courseLoading || activeCourse) && (
        <div className="space-y-6 pt-6 border-t-2" style={{ borderColor: 'rgba(124,106,250,0.1)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sword className="w-5 h-5 text-[#7C6AFA]" /> Combat Arena
              </h2>
              {activeCourse && <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">{activeCourse.title}</p>}
            </div>
            {activeCourse && (
              <Button
                variant="outline"
                className="font-black text-[9px] uppercase tracking-widest border-2 rounded-xl h-10"
                style={{ borderColor: 'rgba(124,106,250,0.2)', color: '#7C6AFA', background: 'transparent' }}
                onClick={() => (useNavStore.getState().setNavState(activeCourse._id), router.push("/student/ground"))}
              >
                <Target className="w-3 h-3 mr-1.5" /> Full Workspace
              </Button>
            )}
          </div>

          {courseLoading && !activeCourse && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#7C6AFA] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-white/30 uppercase tracking-widest font-black">Entering dungeon...</p>
            </div>
          )}

          {activeCourse && (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-4">
                <Card className="rounded-2xl border-2 overflow-hidden" style={{ background: '#0A0A0C', borderColor: 'rgba(124,106,250,0.15)' }}>
                  <CardContent className="p-0">
                    {activeLesson ? (
                      <>
                        <div className="rounded-t-2xl overflow-hidden">
                          <VideoPlayer url={activeLesson.videoUrl} title={activeLesson.title} />
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-black text-white">{activeLesson.title}</h3>
                          <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">
                            {activeLesson.duration || 0} min mission
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="h-[320px] flex items-center justify-center">
                        <p className="text-xs text-white/20 uppercase tracking-widest font-black">Select a mission to begin</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {activeLesson && (
                  <Card className="rounded-2xl border-2" style={{ background: '#0A0A0C', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <CardHeader className="bg-gradient-to-r from-[rgba(255,255,255,0.03)] to-transparent">
                      <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-white/50">
                        <Scroll className="w-3.5 h-3.5 text-[#FBBF24]" /> Intel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs leading-relaxed max-h-[200px] overflow-y-auto whitespace-pre-line text-white/40">
                        {transcript || "Intel unavailable."}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Lesson List */}
              <Card className="rounded-2xl border-2 max-h-[600px] overflow-y-auto" style={{ background: '#0A0A0C', borderColor: 'rgba(255,255,255,0.05)' }}>
                <CardHeader className="sticky top-0 z-10" style={{ background: '#0A0A0C' }}>
                  <CardTitle className="text-[10px] uppercase font-black tracking-widest text-white/40">
                    Mission Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeCourse.modules?.length ? (
                    activeCourse.modules.map((mod: any, modIndex: number) => (
                      <div key={modIndex} className="space-y-2">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-[#7C6AFA]">
                          Level {modIndex + 1} — {mod.title || `Zone ${modIndex + 1}`}
                        </h4>
                        <div className="space-y-1.5">
                          {mod.lessons?.length ? (
                            mod.lessons.map((lesson: any) => {
                              const isActive = activeLesson?._id === lesson._id;
                              return (
                                <motion.button
                                  key={lesson._id || `${modIndex}-${lesson.title}`}
                                  whileHover={{ x: 3 }}
                                  onClick={() => handleLessonSelect(lesson)}
                                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left border-2 transition-all`}
                                  style={{
                                    background: isActive ? 'rgba(124,106,250,0.1)' : 'transparent',
                                    borderColor: isActive ? 'rgba(124,106,250,0.3)' : 'transparent',
                                  }}
                                >
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{ background: isActive ? 'rgba(124,106,250,0.15)' : 'rgba(255,255,255,0.03)', borderColor: isActive ? 'rgba(124,106,250,0.3)' : 'rgba(255,255,255,0.05)' }}>
                                    {isActive ? <Play className="w-3 h-3 text-[#7C6AFA]" /> : <span className="text-[8px] font-black text-white/20">{mod.lessons.indexOf(lesson) + 1}</span>}
                                  </div>
                                  <span className={`flex-1 text-xs font-bold truncate ${isActive ? 'text-white' : 'text-white/50'}`}>{lesson.title}</span>
                                  <span className="text-[8px] text-white/20 font-bold">{lesson.duration || 0}m</span>
                                </motion.button>
                              );
                            })
                          ) : (
                            <p className="text-[9px] text-white/15 font-bold pl-2">No missions in this zone</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/20 font-bold">No zones available</p>
                  )}
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
