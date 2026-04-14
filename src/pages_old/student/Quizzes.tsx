"use client";
import { useNavStore } from '@/store/useNavStore';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileQuestion,
  Clock,
  Zap,
  Target,
  Brain,
  Sparkles,
  Trophy,
  Loader2,
  Search,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { palette } from "@/theme/palette";

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const QUIZZES_PER_PAGE = 6;

  // ─── Fetch Existing Quizzes ───────────────────────────────
  async function fetchQuizzes() {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/quiz/", {
        withCredentials: true,
      });
      if (data?.quizzes) {
        setQuizzes(data.quizzes);
        setFeatured(data.quizzes.slice(0, 3));
        setFiltered(data.quizzes);
      }
    } catch (err) {
      console.error("⚠️ Fetch Quizzes Error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // ─── Handle Navigation ───────────────────────────────
  const handleNavigate = (id) => (useNavStore.getState().setNavState(id), router.push("/student/takequiz"));

  // ─── Handle Back Navigation ───────────────────────────────
  const handleBack = () => router.back();

  // ─── Search Filter ───────────────────────────────
  useEffect(() => {
    const results = quizzes.filter((quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFiltered(results);
    setPage(1); // reset page when searching
  }, [searchQuery, quizzes]);

  // ─── Random Quiz ───────────────────────────────
  const handleRandomQuiz = () => {
    if (!quizzes.length) return alert("No quizzes available.");
    const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    (useNavStore.getState().setNavState(randomQuiz._id), router.push("/student/takequiz"));
  };

  // ─── Generate AI Quiz ───────────────────────────────
  async function generateAIQuiz() {
    if (!topic.trim()) return alert("Please enter a topic.");
    setAiLoading(true);

    try {
      const { data } = await axios.post(
        "/api/quiz/genai",
        { topic, difficulty, numberOfQuestions: numQuestions },
        { withCredentials: true }
      );

      if (data?.quizId) {
        setShowAIDialog(false);
        (useNavStore.getState().setNavState(data.quizId), router.push("/student/takequiz"));
      } else {
        alert("Something went wrong while generating quiz.");
      }
    } catch (err) {
      console.error("⚠️ AI Quiz Generation Error:", err);
      alert("Failed to generate quiz.");
    } finally {
      setAiLoading(false);
    }
  }

  // ─── Paginated Data ───────────────────────────────
  const startIndex = (page - 1) * QUIZZES_PER_PAGE;
  const endIndex = startIndex + QUIZZES_PER_PAGE;
  const displayedQuizzes = filtered.slice(startIndex, endIndex);

  const hasNext = endIndex < filtered.length;
  const hasPrev = page > 1;

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ background: '#FFFFFF', color: '#000000' }}>
         <div className="w-10 h-10 border-2 border-[#1E4D3B] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-10" style={{ background: '#FFFFFF' }}>
      {/* ─── Header with Back Button ─────────────────────────────── */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
          className="flex-shrink-0 border-2 rounded-xl"
          style={{ 
            borderColor: 'rgba(30, 77, 59, 0.1)', 
            color: '#000000',
            background: '#FFFFFF' 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F0FDF4';
            e.currentTarget.style.borderColor = '#1E4D3B';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = 'rgba(30, 77, 59, 0.1)';
          }}
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight italic text-black">
            Quizzes & Assessments
          </h1>
          <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#1E4D3B]/60">
            Test your skills and boost your mastery
          </p>
        </div>
      </div>

      {/* ─── Search ─────────────────────────────── */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
        <Input
          placeholder="Search quizzes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 sm:pl-10 text-xs h-11 bg-slate-50 border-2 border-slate-50 rounded-xl text-black placeholder:text-slate-200 focus:border-[#1E4D3B]"
        />
      </div>

      {/* ─── Quiz Modes ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Random Quiz */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="hover:scale-[1.02] transition-transform cursor-pointer h-full border-2 rounded-2xl bg-white" style={{ borderColor: 'rgba(30, 77, 59, 0.1)' }}>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
                <Sparkles className="w-5 h-5" style={{ color: '#1E4D3B' }} />
                Random Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
                Start a random quiz instantly from the available ones.
              </p>
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 border-slate-100 hover:bg-[#F0FDF4] hover:text-[#1E4D3B] hover:border-[#1E4D3B] transition-all"
                onClick={handleRandomQuiz}
              >
                Surprise Me
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Quiz Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Card className="hover:scale-[1.02] transition-transform cursor-pointer h-full border-2 rounded-2xl bg-white" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <CardHeader className="p-6">
                  <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
                    <Brain className="w-5 h-5" style={{ color: '#1E4D3B' }} />
                    AI Quiz Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
                    Instantly create a new quiz using AI on your chosen topic.
                  </p>
                  <Button className="w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-widest bg-black text-white hover:bg-[#1E4D3B] transition-all">
                    Generate Quiz
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>

            {/* Dialog */}
            <DialogContent className="sm:max-w-md rounded-2xl border-2 bg-white" style={{ borderColor: 'rgba(30, 77, 59, 0.2)' }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight italic text-black">
                  <Brain className="w-6 h-6" style={{ color: '#1E4D3B' }} />
                  Generate AI Quiz
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Topic</label>
                  <Input
                    className="h-11 rounded-xl bg-slate-50 border-2 border-slate-50 font-bold text-xs"
                    placeholder="e.g., Data Structures"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Difficulty</label>
                     <select
                       className="w-full h-11 rounded-xl border-2 border-slate-50 bg-slate-50 font-bold px-3 text-xs appearance-none"
                       value={difficulty}
                       onChange={(e) => setDifficulty(e.target.value)}
                     >
                       <option value="easy">Easy</option>
                       <option value="medium">Medium</option>
                       <option value="hard">Hard</option>
                     </select>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Questions</label>
                     <Input
                       type="number"
                       className="h-11 rounded-xl bg-slate-50 border-2 border-slate-50 font-bold text-xs"
                       min="5"
                       max="20"
                       value={numQuestions}
                       onChange={(e) => setNumQuestions(Number(e.target.value))}
                     />
                   </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 border-slate-100 hover:bg-slate-50"
                    onClick={() => setShowAIDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-11 rounded-xl font-black text-[9px] uppercase tracking-widest bg-black text-white hover:bg-[#1E4D3B] transition-all flex items-center justify-center gap-2"
                    onClick={generateAIQuiz}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> SYNCING...
                      </>
                    ) : (
                      "Generate Quiz"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      {/* ─── Featured Quizzes ─────────────────────── */}
      {featured.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-lg font-black text-black uppercase tracking-wider flex items-center gap-2 italic">
            <Trophy className="w-5 h-5" style={{ color: '#1E4D3B' }} /> Featured Quizzes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((quiz, i) => (
              <motion.div
                key={quiz._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => handleNavigate(quiz._id)}
                className="cursor-pointer group"
              >
                <Card
                  className="h-full border-2 rounded-2xl bg-white group-hover:border-[#1E4D3B]/20 transition-all shadow-sm"
                  style={{ borderColor: 'rgba(0,0,0,0.03)' }}
                >
                  <CardHeader className="p-5">
                    <CardTitle className="text-sm font-black text-black group-hover:text-[#1E4D3B] transition-colors">{quiz.title}</CardTitle>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1E4D3B]/60 mt-1">
                      {quiz.category} • {quiz.level}
                    </p>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-300">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-black" /> {quiz.timeLimit} min</span>
                    <span className="flex items-center gap-1.5"><Zap size={14} className="text-[#1E4D3B]" /> {quiz.totalMarks} Marks</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── All Quizzes ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-6"
      >
        <h2 className="text-lg font-black text-black uppercase tracking-wider italic">All Quizzes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              onClick={() => handleNavigate(quiz._id)}
              className="cursor-pointer group"
            >
              <Card
                className="h-full border-2 rounded-2xl bg-white group-hover:border-[#1E4D3B]/20 transition-all shadow-sm"
                style={{ borderColor: 'rgba(0,0,0,0.03)' }}
              >
                <CardHeader className="p-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors bg-slate-50 group-hover:bg-[#F0FDF4] group-hover:text-[#1E4D3B] text-slate-300">
                    <FileQuestion className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-sm font-black text-black group-hover:text-[#1E4D3B] transition-colors">{quiz.title}</CardTitle>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">
                    {quiz.course?.title || quiz.category}
                  </p>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-[9px] font-black uppercase tracking-widest text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{quiz.timeLimit} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{quiz.totalMarks} Marks</span>
                    </div>
                  </div>
                  <Button className="w-full h-10 rounded-xl font-black text-[9px] uppercase tracking-widest bg-slate-50 text-black border-2 border-slate-50 hover:bg-black hover:text-white transition-all">
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {filtered.length > QUIZZES_PER_PAGE && (
          <div className="flex justify-center items-center gap-6 pt-10">
            {hasPrev && (
              <Button 
                variant="outline" 
                onClick={() => setPage(page - 1)} 
                className="h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 border-slate-100 hover:bg-slate-50"
              >
                Previous
              </Button>
            )}
            <span className="text-[10px] font-black text-slate-200">PAGE {page}</span>
            {hasNext && (
              <Button 
                variant="outline" 
                onClick={() => setPage(page + 1)} 
                className="h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 border-slate-100 hover:bg-slate-50"
              >
                Next
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* ─── Empty State ───────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
             <FileQuestion className="w-8 h-8 text-slate-200" />
          </div>
          <h3 className="text-base font-black text-black uppercase tracking-widest mb-2">No quizzes found</h3>
          <p className="text-[10px] text-slate-300 uppercase tracking-widest">Recalibrate your search telemetry</p>
        </motion.div>
      )}
    </div>
  );
};

export default Quizzes;