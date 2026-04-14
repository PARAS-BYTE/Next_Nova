"use client";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Clock,
  User,
  Search,
  Play,
  CheckCircle2,
  DollarSign,
  Link as LinkIcon,
  PlusCircle,
  Brain,
  Video as Youtube,
  BookAudioIcon,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const enrolledResponse = await axios.get('/api/courses/my', {
        withCredentials: true,
      }).catch(() => ({ data: [] }));
      
      const enrolledMap = new Map();
      enrolledResponse.data.forEach((c: any) => enrolledMap.set(c._id, c));
      setEnrolledCourseIds(new Set(enrolledMap.keys()));
      
      const { data } = await axios.get("/api/courses", { withCredentials: true });
      const coursesWithEnrollment = data.map((course: any) => ({
        ...course,
        isEnrolled: enrolledMap.has(course._id),
        progress: enrolledMap.has(course._id) ? (enrolledMap.get(course._id).progress || 0) : 0,
      }));
      
      setCourses(coursesWithEnrollment);
    } catch (err: any) {
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleEnroll = async (courseId: string) => {
    if (enrolledCourseIds.has(courseId)) return;
    try {
      setEnrolling(courseId);
      await axios.post("/api/courses/enroll", { courseId }, { withCredentials: true });
      setEnrolledCourseIds(prev => new Set([...prev, courseId]));
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, isEnrolled: true } : c));
      toast.success("Enrolled successfully!");
    } catch (err: any) {
      toast.error("Failed to enroll.");
    } finally {
      setEnrolling(null);
    }
  };

  const filteredCourses = courses.filter(
    (c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 min-h-screen bg-white" style={{ background: '#FFFFFF' }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight flex items-center gap-3 text-black italic">
          <BookOpen className="w-8 h-8 text-[#1E4D3B]" /> Courses
        </h1>
        <p className="text-xs text-slate-300 mt-1 uppercase tracking-[0.3em] font-black">
          Expand your knowledge and level up
        </p>
      </div>

      {/* Action Buttons (The "Quest Selection" area) */}
      <div className="flex flex-wrap gap-4">
        <Link href="/student/createcourse">
          <Button className="h-10 rounded-xl bg-black text-white hover:bg-[#1E4D3B] font-black uppercase tracking-widest text-[9px] px-6">
            <PlusCircle className="w-4 h-4 mr-2" /> Custom
          </Button>
        </Link>
        <Link href="/student/generatecourse">
          <Button className="h-10 rounded-xl bg-[#1E4D3B] text-white hover:bg-black font-black uppercase tracking-widest text-[9px] px-6">
            <Brain className="w-4 h-4 mr-2" /> AI Generate
          </Button>
        </Link>
        <Link href="/student/viaplaylist">
          <Button className="h-10 rounded-xl bg-black text-white hover:bg-[#1E4D3B] font-black uppercase tracking-widest text-[9px] px-6">
            <Youtube className="w-4 h-4 mr-2" /> Via Playlist
          </Button>
        </Link>
        <Link href="/student/roadmap">
          <Button className="h-10 rounded-xl bg-[#1E4D3B] text-white hover:bg-black font-black uppercase tracking-widest text-[9px] px-6">
            <BookAudioIcon className="w-4 h-4 mr-2" /> Roadmap
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <Input
          placeholder="Search for courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 text-xs bg-slate-50 border-2 border-slate-50 rounded-xl text-black placeholder:text-slate-200 focus:border-[#1E4D3B]"
        />
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-[#1E4D3B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-200 uppercase tracking-widest font-black">Loading Courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const isEnrolled = course.isEnrolled;
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="h-full rounded-2xl border-2 overflow-hidden transition-all group bg-white shadow-sm" style={{ borderColor: 'rgba(0,0,0,0.03)' }}>
                  <CardHeader className="p-4 pb-3">
                    {/* Thumbnail */}
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 relative border border-slate-50">
                      <img
                        src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80"}
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="text-[8px] font-black uppercase px-2 py-0.5 bg-black/80 text-white border-0">
                          {course.category || 'General'}
                        </Badge>
                      </div>
                    </div>

                    <CardTitle className="text-base font-black text-black group-hover:text-[#1E4D3B] transition-colors leading-none">{course.title}</CardTitle>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold line-clamp-2 leading-relaxed">{course.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4 p-4 pt-0">
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-black text-slate-300">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-black" /> {course.duration || 0}H</span>
                      <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#1E4D3B]" /> {course.level || 'Intermediate'}</span>
                    </div>

                    {isEnrolled && (
                      <div>
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                          <span className="text-slate-300">Progress</span>
                          <span style={{ color: '#1E4D3B' }}>{course.progress || 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress || 0}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{ background: '#1E4D3B' }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        className="w-full h-10 rounded-xl font-black text-[9px] uppercase tracking-widest text-white hover:bg-black transition-all"
                        style={{ background: isEnrolled ? '#000000' : '#1E4D3B' }}
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrolling === course._id || isEnrolled}
                      >
                        {enrolling === course._id ? "SYNCING..." : isEnrolled ? "ENROLLED" : "ENROLL NOW"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xs text-slate-300 font-black uppercase tracking-widest">No courses matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Courses;
