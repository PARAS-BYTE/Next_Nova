"use client";
import { useNavStore } from '@/store/useNavStore';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";

import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, RefreshCw, XCircle, ArrowLeft } from "lucide-react";
import { palette } from "@/theme/palette";

const TakeQuiz = () => {
  const quizId = useNavStore(s => s.navState);
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);

  // ─── Fetch Quiz Data ───────────────────────────────
  async function fetchQuiz() {
    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/quiz/single",
        { id: quizId },
        { withCredentials: true }
      );
      setQuiz(data);
      setTimeLeft(data.timeLimit * 60);
      setStartTime(Date.now());
    } catch (err) {
      console.error("❌ Fetch Quiz Error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuiz();
  }, []);

  // ─── Timer Logic ───────────────────────────────
  useEffect(() => {
    if (!timeLeft || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // ─── Handle Option Select ─────────────────────
  const handleOptionSelect = (qId, optionIndex) => {
    if (submitted) return;
    setError("");
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex + 1, // store as 1-based index
    }));
  };

  // ─── Submit Quiz ──────────────────────────────
  const handleSubmit = async(auto = false) => {
    if (!quiz || submitted) return;

    const totalQuestions = quiz.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions && !auto) {
      setError(`⚠️ Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    // ─── Calculate Time Taken ─────────────────────
    const endTime = Date.now();
    const diffSec = Math.round((endTime - startTime) / 1000);
    const formattedTime = `${Math.floor(diffSec / 60)}m ${diffSec % 60}s`;

    // ─── Prepare Submission Data ─────────────────
    const selectedArray = quiz.questions.map((q) =>
      answers[q.id] ? answers[q.id] : null
    );

    const submission = {
      selected: selectedArray,
      timeTaken: formattedTime,
      quizId :quizId,
    };

    console.log("🧾 Final Submission Object:", submission);

    setSubmitted(true); // Safely lock the UI into Loading state
    try {
        let some = await axios.post("/api/quiz/evaluate", submission, { withCredentials: true });
        (useNavStore.getState().setNavState(some.data), router.push("/student/quizresult"));
    } catch(err) {
        console.error(err);
        alert("Failed to analyze quiz! Reverting form. " + err.message);
        setSubmitted(false);
    }
  };

  // ─── Retake Quiz ──────────────────────────────
  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setSubmitted(false);
    setError("");
    setTimeLeft(quiz.timeLimit * 60);
    setStartTime(Date.now());
    setSubmissionData(null);
  };

  // ─── Format Timer ─────────────────────────────
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ─── Handle Back Navigation ───────────────────
  const handleBack = () => {
    if (!submitted) {
      const confirmLeave = window.confirm("Are you sure you want to leave? Your progress will be lost.");
      if (!confirmLeave) return;
    }
    router.push(-1);
  };

  // ─── Loading ───────────────────────────
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ background: palette.bg, color: palette.text2 }}>
        Loading quiz...
      </div>
    );

  if (!quiz)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4" style={{ background: palette.bg, color: '#EF4444' }}>
        <XCircle className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-bold mb-2">Quiz not found</h2>
        <p className="mb-4" style={{ color: palette.text2 }}>The requested quiz could not be loaded.</p>
        <Button
          onClick={handleBack}
          style={{ background: palette.accentDeep, color: palette.card }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );

  if (submitted)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center space-y-6 p-4 sm:p-6" style={{ background: palette.bg }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}>
          <RefreshCw className="w-16 h-16 animate-spin" style={{ color: palette.accent }} />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold animate-pulse" style={{ color: palette.text }}>Generating your Performance Analytics...</h2>
        <p style={{ color: palette.text2 }}>Please wait while we route you to the Dashboard.</p>
        <Progress value={100} className="w-64 h-2 mt-4 animate-pulse" style={{ background: palette.progressTrack }} />
      </div>
    );

  // ─── Active Quiz ─────────────────────────────
  const q = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-4 sm:space-y-6 min-h-screen" style={{ background: palette.bg }}>
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="flex-shrink-0"
            style={{ 
              borderColor: palette.border, 
              color: palette.text,
              background: palette.card 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = palette.accentSoft;
              e.currentTarget.style.borderColor = palette.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = palette.card;
              e.currentTarget.style.borderColor = palette.border;
            }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: palette.text }}>{quiz.title}</h1>
        </div>
        <div className="flex items-center gap-2 font-semibold text-sm sm:text-base" style={{ color: palette.accent }}>
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" style={{ background: palette.progressTrack }} />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm mt-2 p-3 rounded-lg" style={{ background: '#EF44441A', color: '#EF4444', border: `1px solid #EF444480` }}>
          <XCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Question */}
      <motion.div
        key={q.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1"
      >
        <Card style={{ background: palette.card, border: `1px solid ${palette.border}` }} className="h-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl" style={{ color: palette.text }}>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg mb-4 sm:mb-6" style={{ color: palette.text }}>{q.questionText}</p>
            <div className="space-y-2 sm:space-y-3">
              {q.options.map((opt, i) => (
                <Button
                  key={i}
                  variant={answers[q.id] === i + 1 ? "default" : "outline"}
                  className="w-full justify-start text-sm sm:text-base py-3 h-auto min-h-[3rem]"
                  style={
                    answers[q.id] === i + 1
                      ? { background: palette.accentDeep, color: palette.card }
                      : { borderColor: palette.border, color: palette.text }
                  }
                  onMouseEnter={(e) => {
                    if (answers[q.id] !== i + 1) {
                      e.currentTarget.style.background = palette.accentSoft;
                      e.currentTarget.style.borderColor = palette.accent;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (answers[q.id] !== i + 1) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = palette.border;
                    }
                  }}
                  onClick={() => handleOptionSelect(q.id, i)}
                >
                  <span className="text-left">{opt}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
          className="w-full sm:w-auto text-sm sm:text-base"
          style={{ borderColor: palette.border, color: palette.text }}
          onMouseEnter={(e) => {
            if (currentQuestion > 0) {
              e.currentTarget.style.background = palette.accentSoft;
            }
          }}
          onMouseLeave={(e) => {
            if (currentQuestion > 0) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          Previous
        </Button>

        <div className="text-sm text-center" style={{ color: palette.text2 }}>
          Answered: {Object.keys(answers).length} / {quiz.questions.length}
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <Button 
            onClick={() => handleSubmit(false)} 
            className="w-full sm:w-auto text-sm sm:text-base"
            style={{ background: '#10B981', color: palette.card }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            className="w-full sm:w-auto text-sm sm:text-base"
            style={{ background: palette.accentDeep, color: palette.card }}
            onMouseEnter={(e) => e.currentTarget.style.background = palette.accent}
            onMouseLeave={(e) => e.currentTarget.style.background = palette.accentDeep}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;