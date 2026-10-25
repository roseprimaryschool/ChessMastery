import React, { useState, useEffect } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import confetti from 'canvas-confetti';
import { ChessBoard } from './ChessBoard';
import { soundFx } from '../utils/audio';
import type { PuzzleProblem } from '../types/chess';
import {
  Flame,
  Trophy,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export const TACTICAL_PUZZLES: PuzzleProblem[] = [
  {
    id: 'p1',
    title: 'The Smothered Checkmate',
    theme: 'Smothered Mate',
    difficulty: 'Intermediate',
    rating: 1350,
    fen: '6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1',
    orientation: 'w',
    solution: [{ from: 'h6', to: 'f7', san: 'Nf7#' }],
    description: 'Black king is suffocated by its own rook on g8 and pawns on g7/h7. Deliver the fatal blow with the knight!',
  },
  {
    id: 'p2',
    title: 'Morphy\'s Opera House Decapitation',
    theme: 'Pin & Removal of Defender',
    difficulty: 'Intermediate',
    rating: 1450,
    fen: '4kb1r/p2rqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1',
    orientation: 'w',
    solution: [{ from: 'd1', to: 'd7', san: 'Rxd7' }],
    description: 'Paul Morphy famous Opera House tactic: Black pinned rook on d7 has lost all defensive power. Strike it!',
  },
  {
    id: 'p3',
    title: 'Back-Rank Punishment',
    theme: 'Back-Rank Mate',
    difficulty: 'Beginner',
    rating: 1100,
    fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1',
    orientation: 'w',
    solution: [{ from: 'a1', to: 'a8', san: 'Ra8#' }],
    description: 'Black king neglected to push an escape square ("luft"). Deliver back-rank checkmate immediately!',
  },
  {
    id: 'p4',
    title: 'The Royal Knight Fork',
    theme: 'Knight Fork',
    difficulty: 'Intermediate',
    rating: 1380,
    fen: '4k3/8/4N3/3q4/8/8/8/6K1 w - - 0 1',
    orientation: 'w',
    solution: [
      { from: 'e6', to: 'c7', san: 'Nc7+' },
      { from: 'c7', to: 'd5', san: 'Nxd5' },
    ],
    botReplies: [{ from: 'e8', to: 'd7', san: 'Kd7' }],
    description: 'Attack both King and Queen simultaneously with your knight, then win the queen on the following move.',
  },
  {
    id: 'p5',
    title: 'The Classical Greek Gift',
    theme: 'Bishop Sacrifice',
    difficulty: 'Master',
    rating: 1650,
    fen: 'r1bq1rk1/ppp2ppp/2n5/3np3/8/2NB1N2/PPP2PPP/R2Q1RK1 w - - 0 1',
    orientation: 'w',
    solution: [{ from: 'd3', to: 'h7', san: 'Bxh7+' }],
    description: 'The ancient Greek Gift sacrifice: sacrifice your bishop on h7 with check to strip Black king of all defensive pawns!',
  },
  {
    id: 'p6',
    title: 'The Cross-Board Skewer',
    theme: 'Skewer',
    difficulty: 'Intermediate',
    rating: 1320,
    fen: '4q3/8/8/4k3/8/8/8/R5K1 w - - 0 1',
    orientation: 'w',
    solution: [
      { from: 'a1', to: 'e1', san: 'Re1+' },
      { from: 'e1', to: 'e8', san: 'Rxe8' },
    ],
    botReplies: [{ from: 'e5', to: 'd6', san: 'Kd6' }],
    description: 'Check the king along the e-file; when the king is forced to move, the queen directly behind it is captured!',
  },
  {
    id: 'p7',
    title: 'Corner King Checkmate',
    theme: 'Endgame Mate',
    difficulty: 'Beginner',
    rating: 1050,
    fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1',
    orientation: 'w',
    solution: [{ from: 'h1', to: 'a8', san: 'Qxa8#' }],
    description: 'White King on b6 provides an immovable shield. Drop your Queen to a8 for checkmate!',
  },
];

export const PuzzleTrainer: React.FC = () => {
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const currentPuzzle = TACTICAL_PUZZLES[puzzleIndex % TACTICAL_PUZZLES.length];

  const [stepIdx, setStepIdx] = useState<number>(0);
  const [chessInstance, setChessInstance] = useState<Chess>(() => new Chess(currentPuzzle.fen));
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [showBestMove, setShowBestMove] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isErrorShake, setIsErrorShake] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Gamification stats
  const [streak, setStreak] = useState<number>(0);
  const [tacticalRating, setTacticalRating] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('chess_tactical_rating');
      return saved ? parseInt(saved, 10) : 1200;
    } catch {
      return 1200;
    }
  });

  // Load new puzzle
  useEffect(() => {
    try {
      setChessInstance(new Chess(currentPuzzle.fen));
    } catch {
      setChessInstance(new Chess());
    }
    setStepIdx(0);
    setLastMove(null);
    setShowBestMove(false);
    setIsSuccess(false);
    setFeedback(null);
  }, [currentPuzzle.id, currentPuzzle.fen]);

  const expectedMove = currentPuzzle.solution[stepIdx];

  const handlePlayerMove = (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
    if (!expectedMove || isSuccess) return false;

    if (from === expectedMove.from && to === expectedMove.to) {
      try {
        const moveRes = chessInstance.move({
          from,
          to,
          promotion: promotion || 'q',
        });
        if (!moveRes) return false;

        if (moveRes.captured) {
          soundFx.playCapture();
        } else {
          soundFx.playMove();
        }

        setLastMove({ from, to });
        setShowBestMove(false);

        // Check if there is a bot reply in multi-step puzzle
        if (currentPuzzle.botReplies && currentPuzzle.botReplies[stepIdx]) {
          const reply = currentPuzzle.botReplies[stepIdx];
          setTimeout(() => {
            chessInstance.move({
              from: reply.from,
              to: reply.to,
            });
            soundFx.playMove();
            setLastMove({ from: reply.from, to: reply.to });
            setChessInstance(new Chess(chessInstance.fen()));
          }, 400);
        }

        // Check if final step
        if (stepIdx + 1 >= currentPuzzle.solution.length) {
          setIsSuccess(true);
          soundFx.playSuccess();
          try {
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {
            // Quiet fail
          }

          setStreak((prev) => prev + 1);
          setTacticalRating((prev) => {
            const next = prev + (showBestMove ? 5 : 15);
            try {
              localStorage.setItem('chess_tactical_rating', next.toString());
            } catch {
              // Ignore
            }
            return next;
          });
          setFeedback('Puzzle Solved! Magnificent tactical vision.');
        } else {
          setStepIdx(stepIdx + 1);
        }

        setChessInstance(new Chess(chessInstance.fen()));
        return true;
      } catch {
        return false;
      }
    } else {
      soundFx.playBlunder();
      setIsErrorShake(true);
      setStreak(0);
      setFeedback('Incorrect move. Look for the sharpest tactical blow!');
      setTimeout(() => setIsErrorShake(false), 500);
      return false;
    }
  };

  const handleNextPuzzle = () => {
    setPuzzleIndex((prev) => prev + 1);
  };

  const handleResetPuzzle = () => {
    setChessInstance(new Chess(currentPuzzle.fen));
    setStepIdx(0);
    setLastMove(null);
    setShowBestMove(false);
    setIsSuccess(false);
    setFeedback(null);
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 lg:px-8 py-6">
      {/* Top Banner & Stats */}
      <div className="mb-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Tactical Puzzle Arena</h1>
          </div>
          <p className="text-xs text-slate-400">
            Train your tactical intuition: solve forks, pins, skewers, Greek gift sacrifices, and checkmating nets.
          </p>
        </div>

        {/* Rating & Streak Badges */}
        <div className="flex items-center gap-4 bg-slate-850/80 px-4 py-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Streak</span>
              <span className="font-mono text-base font-bold text-white tabular-nums">{streak}</span>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-700/60" />

          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Rating</span>
              <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                {tacticalRating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Large Board (7 cols) + Problem Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Large Center Board */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
          <div className={`w-full max-w-[680px] xl:max-w-[740px] 2xl:max-w-[800px] transition-transform duration-150 ${isErrorShake ? 'animate-shake' : ''}`}>
            <ChessBoard
              chess={chessInstance}
              orientation={currentPuzzle.orientation}
              theme="tournament"
              interactive={!isSuccess}
              onMove={handlePlayerMove}
              lastMove={lastMove}
              bestMoveHighlight={
                showBestMove && expectedMove ? { from: expectedMove.from, to: expectedMove.to } : null
              }
            />
          </div>

          {/* Interactive Controls */}
          <div className="w-full max-w-[680px] xl:max-w-[740px] 2xl:max-w-[800px] mt-4 flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
            <button
              onClick={handleResetPuzzle}
              className="py-2 px-3 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Position
            </button>

            <button
              onClick={() => setShowBestMove(!showBestMove)}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                showBestMove
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-800/60'
              }`}
            >
              {showBestMove ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
              {showBestMove ? 'Hide Solution Arrow' : 'Show Solution Arrow'}
            </button>
          </div>
        </div>

        {/* Problem Card & Solution Details */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                Puzzle #{puzzleIndex + 1}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Rating: {currentPuzzle.rating} · {currentPuzzle.difficulty}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Theme: {currentPuzzle.theme}
              </span>
              <h2 className="text-lg font-bold text-white mb-2">{currentPuzzle.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{currentPuzzle.description}</p>
            </div>

            <div className="bg-slate-850/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-slate-200 block mb-1">Instruction:</span>
              <p>
                Find the best move for {currentPuzzle.orientation === 'w' ? 'White' : 'Black'}. Drag or click the piece to play.
              </p>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium animate-fade-in ${
                  isSuccess
                    ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                }`}
              >
                {feedback}
              </div>
            )}

            {isSuccess && (
              <button
                onClick={handleNextPuzzle}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-900/30 animate-scale-in"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
