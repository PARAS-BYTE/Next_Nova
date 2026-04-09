"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface StopwatchContextType {
  elapsedTime: number;
  formatTime: (ms: number) => string;
}

const StopwatchContext = createContext<StopwatchContextType | undefined>(undefined);

export const useStopwatch = () => {
  const context = useContext(StopwatchContext);
  if (!context) {
    throw new Error("useStopwatch must be used within a StopwatchProvider");
  }
  return context;
};

const StopwatchProvider = ({ children }: { children: React.ReactNode }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("stopwatchData");
    
    let elapsed = 0;
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        elapsed = data.elapsedTime || 0;
      }
    }

    setElapsedTime(elapsed);
    setIsInitialized(true);

    const sessionStartTime = Date.now();
    localStorage.setItem(
      "stopwatchData",
      JSON.stringify({
        date: today,
        elapsedTime: elapsed,
        sessionStartTime: sessionStartTime,
      })
    );

    const timer = setInterval(() => {
      const now = Date.now();
      const sessionElapsed = now - sessionStartTime;
      const totalElapsed = elapsed + sessionElapsed;
      
      setElapsedTime(totalElapsed);
      
      localStorage.setItem(
        "stopwatchData",
        JSON.stringify({
          date: today,
          elapsedTime: totalElapsed,
          sessionStartTime: sessionStartTime,
        })
      );
    }, 1000);

    const handleBeforeUnload = () => {
      const now = Date.now();
      const sessionElapsed = now - sessionStartTime;
      const totalElapsed = elapsed + sessionElapsed;
      
      localStorage.setItem(
        "stopwatchData",
        JSON.stringify({
          date: today,
          elapsedTime: totalElapsed,
          sessionStartTime: null,
        })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <StopwatchContext.Provider value={{ elapsedTime, formatTime }}>
      {children}
    </StopwatchContext.Provider>
  );
};

export const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StopwatchProvider>
          {children}
          <Toaster />
          <Sonner />
        </StopwatchProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
