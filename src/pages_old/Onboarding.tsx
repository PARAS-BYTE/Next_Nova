"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Clock, 
  Trophy, 
  Rocket, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  Zap,
  Star,
  Sun,
  CloudSun,
  Sunset,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { palette } from '@/theme/palette';
import axios from 'axios';

const steps = [
  {
    id: 'goals',
    title: 'Your North Star',
    description: 'What is your primary learning goal?',
    icon: Target
  },
  {
    id: 'commitment',
    title: 'Daily Commitment',
    description: 'How many minutes can you dedicate daily?',
    icon: Clock
  },
  {
    id: 'experience',
    title: 'Experience Level',
    description: 'How would you describe your current skill level?',
    icon: Star
  },
  {
    id: 'preference',
    title: 'Golden Hour',
    description: 'When do you feel most productive?',
    icon: Zap
  }
];

const Onboarding = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    primaryGoal: '',
    dailyGoalMinutes: 30,
    skillLevel: 'beginner',
    studyTimePreference: 'morning',
    targetStreak: 7
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/update', {
        onboardingData: formData,
        onboardingCompleted: true
      }, { withCredentials: true });
      
      router.push('/student');
    } catch (error) {
      console.error('Onboarding update failed:', error);
      // Even if it fails, we should probably let them through to the dashboard
      router.push('/student');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'goals':
        return (
          <div className="space-y-4">
            {['Master JavaScript', 'Crack Coding Interviews', 'Learn AI/ML', 'General Upskilling'].map((goal) => (
              <button
                key={goal}
                onClick={() => {
                   setFormData({ ...formData, primaryGoal: goal });
                   setTimeout(nextStep, 300);
                }}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                  formData.primaryGoal === goal 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-[#1E2235] hover:border-purple-500/50 hover:bg-[#1E2235]/50'
                }`}
              >
                <span className="font-medium text-white">{goal}</span>
                {formData.primaryGoal === goal && <CheckCircle2 className="w-5 h-5 text-purple-500" />}
              </button>
            ))}
            <div className="pt-2">
               <Input 
                placeholder="Or type your own..." 
                className="bg-[#1E2235] border-[#1E2235] text-white"
                value={formData.primaryGoal}
                onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
               />
            </div>
          </div>
        );
      case 'commitment':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[15, 30, 60, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setFormData({ ...formData, dailyGoalMinutes: mins })}
                  className={`p-6 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    formData.dailyGoalMinutes === mins 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-[#1E2235] hover:border-purple-500/30'
                  }`}
                >
                  <span className="text-2xl font-bold text-white">{mins}</span>
                  <span className="text-xs text-slate-400">Minutes / Day</span>
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-slate-400 bg-[#1E2235]/50 p-3 rounded-lg flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Over 80% of successful students start with 30 mins!
            </div>
          </div>
        );
      case 'experience':
        return (
          <div className="space-y-4">
            {[
              { id: 'beginner', label: 'Beginner', desc: 'Starting from scratch' },
              { id: 'intermediate', label: 'Intermediate', desc: 'Have some solid foundation' },
              { id: 'advanced', label: 'Advanced', desc: 'Looking for mastery' }
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setFormData({ ...formData, skillLevel: lvl.id })}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${
                  formData.skillLevel === lvl.id 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-[#1E2235] hover:border-purple-500/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  formData.skillLevel === lvl.id ? 'bg-purple-500 text-white' : 'bg-[#1E2235] text-slate-400'
                }`}>
                   <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white">{lvl.label}</p>
                  <p className="text-xs text-slate-400">{lvl.desc}</p>
                </div>
              </button>
            ))}
          </div>
        );
      case 'preference':
        return (
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'morning', label: 'Morning', icon: <Sun className="w-8 h-8 text-yellow-500" /> },
              { id: 'afternoon', label: 'Afternoon', icon: <CloudSun className="w-8 h-8 text-orange-400" /> },
              { id: 'evening', label: 'Evening', icon: <Sunset className="w-8 h-8 text-pink-500" /> },
              { id: 'night', label: 'Night Owl', icon: <Moon className="w-8 h-8 text-blue-400" /> }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFormData({ ...formData, studyTimePreference: t.id })}
                className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                  formData.studyTimePreference === t.id 
                  ? 'border-purple-500 bg-purple-500/20 ring-1 ring-purple-500' 
                  : 'border-[#1E2235] bg-[#1E2235]/40 hover:bg-[#1E2235]'
                }`}
              >
                {t.icon}
                <span className="font-medium text-white">{t.label}</span>
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" 
         style={{ backgroundColor: palette.bg }}>
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-xl z-10">
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C6AFA]">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-xs font-medium text-slate-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-[#1E2235]" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-[#131521] border-[#1E2235] shadow-2xl rounded-3xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-blue-500" />
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                    {React.createElement(steps[currentStep].icon, { className: "w-6 h-6 text-purple-400" })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{steps[currentStep].title}</h2>
                    <p className="text-slate-400">{steps[currentStep].description}</p>
                  </div>
                </div>

                <div className="min-h-[280px]">
                  {renderStepContent()}
                </div>

                <div className="mt-12 flex items-center justify-between pt-6 border-t border-[#1E2235]">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="text-slate-400 hover:text-white hover:bg-[#1E2235]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  
                  <Button
                    onClick={nextStep}
                    disabled={
                      (steps[currentStep].id === 'goals' && !formData.primaryGoal) ||
                      loading
                    }
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(124,106,250,0.3)]"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {currentStep === steps.length - 1 ? 'Start Learning' : 'Continue'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 text-center flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-slate-500 font-medium">Personalized Path</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-slate-500 font-medium">Verified Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
