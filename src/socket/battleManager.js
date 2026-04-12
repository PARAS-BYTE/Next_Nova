import User from '../Models/User.js';

const queues = {
  general: []
};

const activeBattles = new Map();

// Helper to generate some dummy MCQs for battle if DB fetch is omitted
const generateBattleQuestions = () => [
  { id: 1, text: 'What is 5 + 7?', options: ['10', '11', '12', '14'], answer: 2 },
  { id: 2, text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 1 },
  { id: 3, text: 'What does CPU stand for?', options: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Central Processor Unit'], answer: 1 },
  { id: 4, text: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: 2 },
  { id: 5, text: 'Which is the fastest land animal?', options: ['Cheetah', 'Lion', 'Horse', 'Leopard'], answer: 0 }
];

export default function initBattleSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Student connected: ${socket.id}`);

    // Join Matchmaking Queue
    socket.on('join_queue', async (data) => {
      const { userId, username, level } = data || {};
      if (!userId || !username) {
        return socket.emit('error', 'User data required to join queue');
      }

      console.log(`[Queue] ${username} joined queue`);
      
      const player = { socketId: socket.id, userId, username, level: level || 1, score: 0 };
      queues.general.push(player);

      socket.emit('queue_status', { message: 'Waiting for opponent...', queueLength: queues.general.length });

      // Matchmaking Logic: 1v1
      if (queues.general.length >= 2) {
        const p1 = queues.general.shift();
        const p2 = queues.general.shift();

        const battleId = `battle_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        activeBattles.set(battleId, {
          players: {
            [p1.socketId]: { ...p1, answers: [] },
            [p2.socketId]: { ...p2, answers: [] },
          },
          questions: generateBattleQuestions(),
          currentQuestionIndex: 0,
          status: 'starting'
        });

        // Join socket room
        const s1 = io.sockets.sockets.get(p1.socketId);
        const s2 = io.sockets.sockets.get(p2.socketId);
        
        if (s1) s1.join(battleId);
        if (s2) s2.join(battleId);

        io.to(battleId).emit('match_found', { 
          battleId, 
          opponent: {
            [p1.socketId]: p2.username,
            [p2.socketId]: p1.username
          }
        });

        // Start countdown
        setTimeout(() => {
          startNextQuestion(io, battleId);
        }, 3000);
      }
    });

    // Handle answer submission
    socket.on('submit_answer', (data) => {
      const { battleId, questionIndex, selectedOptionIndex, timeTaken } = data;
      const battle = activeBattles.get(battleId);
      
      if (!battle) return;

      const player = battle.players[socket.id];
      if (!player) return;

      const question = battle.questions[questionIndex];
      if (!question) return;

      const isCorrect = question.answer === selectedOptionIndex;
      const points = isCorrect ? Math.max(10, 100 - (timeTaken / 1000) * 5) : 0; // faster = more points

      player.score += Math.round(points);
      player.answers.push({ isCorrect, timeTaken });

      // Check if both players answered
      const playersList = Object.values(battle.players);
      const bothAnswered = playersList.every(p => p.answers.length > battle.currentQuestionIndex);

      if (bothAnswered) {
        // Emit current scores
        io.to(battleId).emit('round_result', {
          players: playersList.map(p => ({ username: p.username, score: p.score }))
        });

        battle.currentQuestionIndex++;
        
        if (battle.currentQuestionIndex >= battle.questions.length) {
          endBattle(io, battleId);
        } else {
          setTimeout(() => {
            startNextQuestion(io, battleId);
          }, 3000); // 3 seconds between questions
        }
      }
    });

    // Handle leaderboard fetch
    socket.on('get_live_leaderboard', async () => {
      try {
        const users = await User.find({ role: 'student' }).sort({ focusScore: -1, xp: -1 }).limit(10).select('username xp level focusScore streakDays');
        socket.emit('live_leaderboard_data', users);
      } catch (err) {
        console.error("Leaderboard fetch error via socket", err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Student disconnected: ${socket.id}`);
      
      // Remove from queue
      const qIndex = queues.general.findIndex(p => p.socketId === socket.id);
      if (qIndex > -1) queues.general.splice(qIndex, 1);

      // Handle active battles (opponent wins by forfeit)
      for (const [battleId, battle] of activeBattles.entries()) {
        if (battle.players[socket.id]) {
          io.to(battleId).emit('opponent_disconnected', { message: 'Opponent disconnected. You win!' });
          activeBattles.delete(battleId);
          break;
        }
      }
    });
  });
}

function startNextQuestion(io, battleId) {
  const battle = activeBattles.get(battleId);
  if (!battle) return;

  const question = battle.questions[battle.currentQuestionIndex];
  
  // Safe emit without the answer index
  const safeQuestion = {
    id: question.id,
    index: battle.currentQuestionIndex,
    text: question.text,
    options: question.options,
    timeLimit: 15 // 15 seconds per question
  };

  io.to(battleId).emit('next_question', safeQuestion);
}

async function endBattle(io, battleId) {
  const battle = activeBattles.get(battleId);
  if (!battle) return;

  const players = Object.values(battle.players);
  const p1 = players[0];
  const p2 = players[1];

  let winner = null;
  if (p1.score > p2.score) winner = p1;
  else if (p2.score > p1.score) winner = p2;
  
  io.to(battleId).emit('battle_ended', {
    winner: winner ? winner.username : 'Draw',
    results: players.map(p => ({ username: p.username, score: p.score }))
  });

  // Award XP based on win/loss (simulate async DB update)
  try {
    if (winner) {
      const dbWinner = await User.findById(winner.userId);
      if (dbWinner) {
        dbWinner.addXP(50); // Winner bonus
        await dbWinner.save();
      }
    }
  } catch (err) {
    console.error("Battle end XP award error", err);
  }

  activeBattles.delete(battleId);
}
