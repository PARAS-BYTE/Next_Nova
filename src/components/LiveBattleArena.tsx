"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { Loader2, Swords, Trophy, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { palette } from "@/theme/palette";

export default function LiveBattleArena({ username }) {
  const [socket, setSocket] = useState(null);
  const [queueStatus, setQueueStatus] = useState("");
  const [battle, setBattle] = useState(null); // { battleId, opponent }
  const [question, setQuestion] = useState(null); // { id, index, text, options, timeLimit }
  const [scores, setScores] = useState([]); // [{ username, score }]
  const [timer, setTimer] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [battleResult, setBattleResult] = useState(null); // { winner, results }

  useEffect(() => {
    const newSocket = io({ path: "/socket.io" });
    setSocket(newSocket);

    newSocket.on("queue_status", (data) => {
      setQueueStatus(`${data.message} (Players in queue: ${data.queueLength})`);
    });

    newSocket.on("match_found", (data) => {
      setQueueStatus("");
      setBattle({
        battleId: data.battleId,
        opponentName: data.opponent[newSocket.id] || "Unknown"
      });
      setScores([]);
      setBattleResult(null);
    });

    newSocket.on("next_question", (q) => {
      setQuestion(q);
      setSelectedOption(null);
      setTimer(q.timeLimit);
    });

    newSocket.on("round_result", (data) => {
      setScores(data.players);
    });

    newSocket.on("battle_ended", (data) => {
      setBattleResult(data);
      setQuestion(null);
      setBattle(null);
    });

    newSocket.on("opponent_disconnected", (data) => {
      setBattleResult({ winner: username, results: [], message: data.message });
      setQuestion(null);
      setBattle(null);
    });

    return () => newSocket.disconnect();
  }, [username]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (timer > 0 && question && !selectedOption) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleAnswerSelect(-1); // timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, question, selectedOption]);

  const joinQueue = () => {
    if (socket) {
      socket.emit("join_queue", { userId: "user_" + Date.now(), username: username || "Player", level: 1 });
      setBattleResult(null);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);

    const timeTaken = (question.timeLimit - timer) * 1000;
    socket.emit("submit_answer", {
      battleId: battle.battleId,
      questionIndex: question.index,
      selectedOptionIndex: optionIndex,
      timeTaken
    });
  };

  if (battleResult) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 bg-[#0A0A0C] border border-[#7C6AFA]/30 rounded-3xl shadow-[0_0_40px_rgba(124,106,250,0.1)]">
        <Trophy size={64} className="mx-auto text-yellow-400 mb-4" />
        <h2 className="text-3xl font-black uppercase text-white mb-2 tracking-widest">Battle Ended!</h2>
        <p className="text-xl text-[#7C6AFA] font-bold mb-4">{battleResult.message || `Winner: ${battleResult.winner}`}</p>
        
        {battleResult.results?.length > 0 && (
          <div className="space-y-3 mt-6 mb-8 text-left max-w-sm mx-auto">
            {battleResult.results.map((p, i) => (
              <div key={i} className="flex justify-between items-center bg-white/[0.03] p-4 rounded-xl border border-white/5">
                <span className="font-bold text-white">{p.username}</span>
                <span className="font-mono text-[#FBBF24] font-bold">{p.score} pts</span>
              </div>
            ))}
          </div>
        )}
        <Button onClick={joinQueue} className="bg-[#7C6AFA] hover:bg-[#6b5ae0] text-white font-bold py-3 px-8 rounded-xl tracking-widest uppercase">
          Play Again
        </Button>
      </motion.div>
    );
  }

  if (battle && question) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-[#0A0A0C] p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 font-black text-xl">You</div>
             <div>
               <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Score</p>
               <p className="text-lg font-mono font-bold text-white">{scores.find(s => s.username === username)?.score || 0}</p>
             </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-[#EF4444] font-black animate-pulse">VS</span>
            <Swords className="text-white/20 mt-1" />
          </div>
          <div className="flex items-center gap-3 text-right">
             <div>
               <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Score</p>
               <p className="text-lg font-mono font-bold text-white">{scores.find(s => s.username === battle.opponentName)?.score || 0}</p>
             </div>
             <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 font-black text-xl">Opp</div>
          </div>
        </div>

        <motion.div key={question.index} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-[#0A0A0C] p-8 rounded-3xl border border-[#7C6AFA]/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <motion.div initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: question.timeLimit, ease: "linear" }} className="h-full bg-[#7C6AFA]" />
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black uppercase text-[#7C6AFA] tracking-widest bg-[#7C6AFA]/10 px-3 py-1 rounded-lg">Question {question.index + 1}</span>
            <span className="flex items-center gap-1.5 font-mono text-white/60 font-bold"><Clock size={14} className={timer <= 5 ? "text-red-400 animate-bounce" : ""} /> {timer}s</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-8">{question.text}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.options.map((opt, i) => (
              <button
                key={i}
                disabled={selectedOption !== null}
                onClick={() => handleAnswerSelect(i)}
                className={`p-4 rounded-xl text-left border-2 transition-all font-medium ${
                  selectedOption === i 
                    ? "bg-[#7C6AFA] border-[#7C6AFA] text-white shadow-[0_0_20px_rgba(124,106,250,0.4)]" 
                    : selectedOption !== null 
                      ? "bg-white/5 border-white/5 text-white/30" 
                      : "bg-white/5 border-white/10 hover:border-[#7C6AFA]/50 text-white/80 hover:bg-[#7C6AFA]/10"
                }`}
              >
                <span className="inline-block w-6 h-6 rounded border border-current text-center text-sm mr-3 leading-[22px] opacity-60">
                  {["A", "B", "C", "D"][i]}
                </span>
                {opt}
              </button>
            ))}
          </div>
          {selectedOption !== null && (
            <p className="text-center mt-6 text-[10px] uppercase font-black tracking-widest text-[#FBBF24] animate-pulse">Waiting for opponent...</p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="text-center p-12 bg-white/[0.02] border border-white/10 rounded-3xl border-dashed">
      <Swords size={48} className="mx-auto text-[#7C6AFA] mb-4 opacity-80" />
      <h2 className="text-2xl font-black uppercase text-white mb-2 tracking-widest">Live 1v1 Battle</h2>
      <p className="text-white/40 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
        Test your knowledge against real players in real-time. Fast answers yield higher scores.
      </p>
      
      {queueStatus ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#7C6AFA]" size={32} />
          <p className="text-[#FBBF24] font-black uppercase tracking-widest text-sm animate-pulse">{queueStatus}</p>
        </div>
      ) : (
        <Button onClick={joinQueue} className="bg-[#7C6AFA] hover:bg-[#6b5ae0] text-white font-bold py-6 px-10 rounded-2xl tracking-[0.2em] uppercase text-sm shadow-[0_0_30px_rgba(124,106,250,0.3)] transition-all hover:scale-105">
          Find Match
        </Button>
      )}
    </div>
  );
}
