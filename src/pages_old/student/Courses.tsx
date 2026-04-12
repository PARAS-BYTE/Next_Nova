import Link from 'next/link';
import { motion } from "framer-motion";
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
} from "lucide-react";

import { palette } from "../../theme/palette";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  thumbnail: string;
  price: number;
  link: string;
  instructorName?: string;
  instructor?: {
    username: string;
    email: string;
  };
  progress?: number;
  isEnrolled?: boolean;
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState<string | null>(null);

  // ─── Fetch all courses ────────────────────────────────
  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch enrolled courses first to check enrollment status
      const enrolledResponse = await axios.get('/api/courses/my', {
        withCredentials: true,
      }).catch(() => ({ data: [] }));
      
      const enrolledMap = new Map();
      enrolledResponse.data.forEach((c: Course) => enrolledMap.set(c._id, c));
      
      const enrolledIds = new Set(enrolledMap.keys());
      setEnrolledCourseIds(enrolledIds);
      
      // Fetch all courses
      const { data } = await axios.get("/api/courses", {
        withCredentials: true,
      });
      
      // Mark courses as enrolled and inject actual progress
      const coursesWithEnrollment = data.map((course: Course) => {
        const enData = enrolledMap.get(course._id);
        return {
          ...course,
          isEnrolled: !!enData,
          progress: enData ? (enData.progress || 0) : (course.progress || 0),
        };
      });
      
      // Include private courses created by the user (which are not in the public /api/courses data)
      const privateCreatedCourses = enrolledResponse.data
        .filter((c: Course) => c.isCreatedByMe && !data.some((d: Course) => d._id === c._id))
        .map((c: Course) => ({
          ...c,
          isEnrolled: true, // The creator is auto-enrolled
          instructorName: "You (Creator)",
          category: c.category || "Custom Course",
          duration: c.duration || 0,
        }));
      
      setCourses([...coursesWithEnrollment, ...privateCreatedCourses]);
    } catch (err: any) {
      console.error("Fetch Courses Error:", err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ─── Enroll in a Course ────────────────────────────────
  const handleEnroll = async (courseId: string) => {
    // Check if already enrolled
    if (enrolledCourseIds.has(courseId)) {
      return;
    }

    try {
      setEnrolling(courseId);

      const { data } = await axios.post(
        "/api/courses/enroll",
        { courseId },
        { withCredentials: true }
      );

      console.log('Enrollment Success:', data);

      // Add to enrolled courses set
      setEnrolledCourseIds(prev => new Set([...prev, courseId]));
      
      // Update course enrollment status
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course._id === courseId 
            ? { ...course, isEnrolled: true }
            : course
        )
      );

      // Show success message
      alert(`✅ ${data.message}`);
    } catch (err: any) {
      console.error('Enrollment Error:', err);
      const errorMessage = err.response?.data?.message || '❌ Enrollment failed. Please try again.';
      
      // Check if already enrolled error
      if (errorMessage.includes('Already enrolled')) {
        setEnrolledCourseIds(prev => new Set([...prev, courseId]));
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId 
              ? { ...course, isEnrolled: true }
              : course
          )
        );
      }
      
      alert(errorMessage);
    } finally {
      setEnrolling(null);
    }
  };

  // ─── Filtered Courses ────────────────────────────────
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const actionButtons = [
    { href: "/student/createcourse", icon: PlusCircle, label: "Create Your Own Course", gradient: "linear-gradient(135deg, #7C6AFA, #6151E0)" },
    { href: "/student/generatecourse", icon: Brain, label: "Build With Nova", gradient: "linear-gradient(135deg, #22D3EE, #06B6D4)" },
    { href: "/student/viaplaylist", icon: Youtube, label: "Build With Playlist", gradient: "linear-gradient(135deg, #F87171, #EF4444)" },
    { href: "/student/roadmap", icon: BookAudioIcon, label: "RoadMaps", gradient: "linear-gradient(135deg, #34D399, #10B981)" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8" style={{ background: palette.bg }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 text-gradient">
          My Courses
        </h1>
        <p className="text-sm sm:text-base md:text-lg" style={{ color: palette.text2 }}>
          Continue your learning journey
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative w-full sm:max-w-md mb-4 sm:mb-6"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: palette.text2 }} />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 sm:pl-10 text-sm rounded-xl h-11 transition-all duration-300 focus:ring-2 focus:ring-offset-0"
          style={{ 
            background: palette.card, 
            borderColor: palette.border, 
            color: palette.text,
            '--tw-ring-color': palette.accent + '40',
          } as any}
        />
      </motion.div>

      {/* Creation Options */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-wrap gap-3 sm:gap-3 mb-6 sm:mb-8"
      >
        {actionButtons.map((btn, i) => (
          <Link key={btn.href} href={btn.href} className="w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="w-full sm:w-auto gap-2 rounded-xl border-0 font-medium shadow-lg"
                style={{ background: btn.gradient, color: '#fff' }}
              >
                <btn.icon className="w-4 h-4" />
                {btn.label}
              </Button>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: palette.border, borderTopColor: palette.accent }} />
            <p className="text-sm" style={{ color: palette.text2 }}>Loading courses...</p>
          </div>
        </div>
      )}
      {error && <p className="text-center" style={{ color: palette.error }}>{error}</p>}

      {/* Courses Grid */}
      {!loading && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="h-full transition-all duration-300 cursor-pointer rounded-2xl border-0 overflow-hidden group"
                style={{ background: palette.card, boxShadow: `0 0 0 1px ${palette.border}` }}
              >
                {/* Gradient top bar */}
                <div className="h-1 w-full" style={{ background: palette.gradient1 }} />
                
                <CardHeader className="pb-4">
                  <div className="aspect-video rounded-xl overflow-hidden mb-4" style={{ background: palette.bgSecondary }}>
                    <img
                      src={
                        course.thumbnail ||
                        "https://via.placeholder.com/400x250?text=Course+Image"
                      }
                      alt={course.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-2" style={{ color: palette.text }}>
                    {course.title}
                  </CardTitle>
                  <p className="text-xs sm:text-sm line-clamp-2" style={{ color: palette.text2 }}>
                    {course.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm flex-wrap" style={{ color: palette.text2 }}>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>
                        {course.instructorName || course.instructor?.username || 'Instructor'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration || 0}h</span>
                    </div>
                    {course.price !== undefined && course.price > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold" style={{ color: palette.accent }}>${course.price}</span>
                      </div>
                    )}
                    {course.link && (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="w-4 h-4" />
                        <a
                          href={course.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          style={{ color: palette.secondary }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Course Link
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: palette.text2 }}>Progress</span>
                      <span className="font-medium" style={{ color: palette.accent }}>
                        {course.progress || 0}%
                      </span>
                    </div>
                    <Progress value={course.progress || 0} className="h-1.5 rounded-full" style={{ background: palette.progressTrack }} />
                  </div>

                  {/* Enroll / Complete Buttons */}
                  <div className="flex gap-2">
                    {course.isEnrolled ? (
                      <Button className="flex-1 rounded-xl" disabled variant="outline" 
                        style={{ borderColor: palette.border, color: palette.text2, background: 'transparent' }}>
                        <CheckCircle2 className="w-4 h-4 mr-2" style={{ color: palette.success }} />
                        Already enrolled
                      </Button>
                    ) : course.progress === 100 ? (
                      <Button className="flex-1 rounded-xl border-0" disabled style={{ background: palette.accentSoft, color: palette.accent }}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </Button>
                    ) : (
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className="w-full rounded-xl shadow-lg border-0"
                          style={{ background: palette.gradient1, color: '#fff' }}
                          disabled={enrolling === course._id}
                          onClick={() => handleEnroll(course._id)}
                        >
                          {enrolling === course._id ? (
                            "Enrolling..."
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Enroll
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>

                  {/* Category Tag */}
                  <div className="pt-2" style={{ borderTop: `1px solid ${palette.border}` }}>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ background: palette.accentSoft, color: palette.accent }}>
                      {course.category || "General"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: palette.text2 }} />
            <p style={{ color: palette.text2 }}>
              No courses found matching your search.
            </p>
          </motion.div>
        )
      )}
    </div>
  );
};

export default Courses;
