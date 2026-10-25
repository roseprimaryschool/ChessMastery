import React, { useState, useEffect } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import confetti from 'canvas-confetti';
import { TUTORIAL_LESSONS } from '../data/tutorials';
import type { TutorialLesson } from '../types/chess';
import { ChessBoard } from './ChessBoard';
import { soundFx } from '../utils/audio';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Trophy,
  ChevronRight,
  Eye,
  EyeOff,
  PlayCircle,
  Swords,
  Search,
  Filter,
} from 'lucide-react';

interface TutorialViewProps {
  onBackToPlay?: () => void;
  onPracticeVsBot?: (fen: string) => void;
}

export const TutorialView: React.FC<TutorialViewProps> = ({
  onBackToPlay,
  onPracticeVsBot,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(TUTORIAL_LESSONS[0].id);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chess_tutorial_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentLesson: TutorialLesson =
    TUTORIAL_LESSONS.find((l) => l.id === selectedLessonId) || TUTORIAL_LESSONS[0];

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [chessInstance, setChessInstance] = useState<Chess>(() => {
    try {
      return new Chess(currentLesson.initialFen);
    } catch {
      return new Chess();
    }
  });
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showBestMove, setShowBestMove] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isErrorShake, setIsErrorShake] = useState<boolean>(false);
  const [isBotReplying, setIsBotReplying] = useState<boolean>(false);

  // Reset board state when switching lesson
  useEffect(() => {
    try {
      const fresh = new Chess(currentLesson.initialFen);
      setChessInstance(fresh);
    } catch {
      setChessInstance(new Chess());
    }
    setStepIndex(0);
    setLastMove(null);
    setShowHint(false);
    setShowBestMove(false);
    setIsSuccess(false);
    setFeedbackMessage(null);
    setIsBotReplying(false);
  }, [currentLesson.id, currentLesson.initialFen]);

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  const handleReset = () => {
    try {
      const fresh = new Chess(currentLesson.initialFen);
      setChessInstance(fresh);
    } catch {
      setChessInstance(new Chess());
    }
    setStepIndex(0);
    setLastMove(null);
    setShowBestMove(false);
    setIsSuccess(false);
    setFeedbackMessage(null);
    setIsBotReplying(false);
  };

  const expectedStep = currentLesson.steps[stepIndex];

  const handlePlayerMove = (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
    if (isBotReplying) return false;
    if (!expectedStep) return false;

    // Check if player's move matches expected solution
    if (from === expectedStep.from && to === expectedStep.to) {
      try {
        const moveRes = chessInstance.move({
          from,
          to,
          promotion: promotion || 'q',
        });
        if (!moveRes) return false;

        if (moveRes.san === 'O-O' || moveRes.san === 'O-O-O') {
          soundFx.playCastle();
        } else if (moveRes.captured) {
          soundFx.playCapture();
        } else {
          soundFx.playMove();
        }

        setLastMove({ from, to });
        setFeedbackMessage(expectedStep.explanation);
        setShowBestMove(false);

        // Check if there's a bot reply
        if (expectedStep.botReply) {
          setIsBotReplying(true);
          setTimeout(() => {
            try {
              const botRes = chessInstance.move({
                from: expectedStep.botReply!.from,
                to: expectedStep.botReply!.to,
              });
              if (botRes && botRes.captured) {
                soundFx.playCapture();
              } else {
                soundFx.playMove();
              }
              setLastMove({
                from: expectedStep.botReply!.from,
                to: expectedStep.botReply!.to,
              });
              setChessInstance(new Chess(chessInstance.fen()));
            } catch (err) {
              console.error('Bot reply move failed', err);
            } finally {
              setIsBotReplying(false);
            }
          }, 450);
        }

        // Check if all steps in this lesson are finished
        if (stepIndex + 1 >= currentLesson.steps.length) {
          setIsSuccess(true);
          soundFx.playSuccess();
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {
            // Quiet fail
          }

          // Save completed state
          if (!completedLessonIds.includes(currentLesson.id)) {
            const updated = [...completedLessonIds, currentLesson.id];
            setCompletedLessonIds(updated);
            try {
              localStorage.setItem('chess_tutorial_completed_lessons', JSON.stringify(updated));
            } catch {
              // Ignore
            }
          }
        } else {
          setStepIndex(stepIndex + 1);
        }

        setChessInstance(new Chess(chessInstance.fen()));
        return true;
      } catch {
        return false;
      }
    } else {
      soundFx.playBlunder();
      setIsErrorShake(true);
      setFeedbackMessage(`Not quite! Look closely at the challenge or click "Show Best Move" to see the arrow.`);
      setTimeout(() => setIsErrorShake(false), 500);
      return false;
    }
  };

  // Play Solution Move
  const handlePlaySolutionMove = () => {
    if (expectedStep && !isSuccess && !isBotReplying) {
      handlePlayerMove(expectedStep.from, expectedStep.to);
    }
  };

  // Next lesson trigger
  const handleNextLesson = () => {
    const curIdx = TUTORIAL_LESSONS.findIndex((l) => l.id === currentLesson.id);
    if (curIdx < TUTORIAL_LESSONS.length - 1) {
      setSelectedLessonId(TUTORIAL_LESSONS[curIdx + 1].id);
    }
  };

  // Filter lessons
  const filteredLessons = TUTORIAL_LESSONS.filter((l) => {
    const matchesDiff = difficultyFilter === 'all' || l.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  // Group filtered lessons by module
  const modulesMap = filteredLessons.reduce<Record<string, { title: string; lessons: TutorialLesson[] }>>(
    (acc, item) => {
      if (!acc[item.module]) {
        acc[item.module] = { title: item.moduleTitle, lessons: [] };
      }
      acc[item.module].lessons.push(item);
      return acc;
    },
    {}
  );

  const completedCount = completedLessonIds.length;
  const totalCount = TUTORIAL_LESSONS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Active Best Move highlight coordinates
  const activeBestMoveHighlight = showBestMove && expectedStep
    ? { from: expectedStep.from, to: expectedStep.to }
    : null;

  return (
    <div className="max-w-[1560px] mx-auto px-4 lg:px-8 py-6">
      {/* Top Progress & Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Interactive Chess Academy</h1>
          </div>
          <p className="text-xs text-slate-400">
            {totalCount} hands-on interactive lessons across 6 comprehensive modules. Train piece movement, checkmates, tactical motifs, and endgame conversions.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700/60">
          <div>
            <div className="flex items-center justify-between text-xs mb-1 gap-6">
              <span className="text-slate-300 font-medium">Academy Progress</span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                {completedCount}/{totalCount} Completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-48 bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          {progressPercent === 100 && (
            <Trophy className="w-7 h-7 text-amber-400 animate-bounce" />
          )}
        </div>
      </div>

      {/* Main Grid: Sidebar List (3 cols) + Large Center Board (6 cols) + Instructions (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Modules Directory (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl max-h-[820px] overflow-y-auto space-y-4">
          {/* Search & Difficulty Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficultyFilter(lvl)}
                  className={`capitalize px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                    difficultyFilter === lvl
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {Object.entries(modulesMap).map(([modKey, mod]) => (
            <div key={modKey} className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                {mod.title}
              </h3>
              <div className="space-y-1">
                {mod.lessons.map((lesson) => {
                  const isCurrent = lesson.id === currentLesson.id;
                  const isDone = completedLessonIds.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonSelect(lesson.id)}
                      className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-800 border border-emerald-500/80 text-white shadow-sm'
                          : 'bg-slate-850/40 border border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate">{lesson.title}</span>
                          <span className={`text-[9px] px-1 rounded ${
                            lesson.difficulty === 'Beginner'
                              ? 'bg-emerald-950/40 text-emerald-400'
                              : lesson.difficulty === 'Intermediate'
                              ? 'bg-amber-950/40 text-amber-400'
                              : 'bg-rose-950/40 text-rose-400'
                          }`}>
                            {lesson.difficulty[0]}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {lesson.subtitle}
                        </span>
                      </div>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Center: Large Interactive Board (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className={`w-full max-w-[680px] xl:max-w-[740px] transition-transform duration-150 ${isErrorShake ? 'animate-shake' : ''}`}>
            <ChessBoard
              chess={chessInstance}
              orientation={currentLesson.orientation}
              theme="tournament"
              interactive={!isSuccess && !isBotReplying}
              onMove={handlePlayerMove}
              lastMove={lastMove}
              bestMoveHighlight={activeBestMoveHighlight}
            />
          </div>

          {/* Interactive Controls & Best Move Hint System */}
          <div className="w-full max-w-[680px] xl:max-w-[740px] mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="py-2 px-3 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>

              <button
                onClick={() => {
                  setShowHint(!showHint);
                  if (!showHint) setShowBestMove(true);
                }}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  showHint
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                {showHint ? 'Hide Hint' : 'Need a Hint?'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBestMove(!showBestMove)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                  showBestMove
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-800/60'
                }`}
              >
                {showBestMove ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                {showBestMove ? 'Hide Best Move Arrow' : 'Show Best Move Arrow'}
              </button>

              {expectedStep && !isSuccess && (
                <button
                  onClick={handlePlaySolutionMove}
                  className="py-2 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
                  Play Solution
                </button>
              )}
            </div>
          </div>

          {/* Hint Card */}
          {showHint && (
            <div className="w-full max-w-[680px] xl:max-w-[740px] mt-3 p-3.5 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200 animate-fade-in flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Tactical Clue:</span>
                {currentLesson.hint}
                {expectedStep && (
                  <span className="block mt-1 font-mono text-emerald-300 font-semibold">
                    Target Move: {expectedStep.from.toUpperCase()} → {expectedStep.to.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Challenge Guide & Success Card (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Challenge Description Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {currentLesson.moduleTitle}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentLesson.difficulty}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mb-1">{currentLesson.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{currentLesson.description}</p>
            </div>

            {/* Key Concepts */}
            <div>
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Key Fundamentals
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentLesson.keyConcepts.map((concept, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">·</span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instruction Callout */}
            <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-200 block mb-1">Your Objective:</span>
              <p className="text-xs text-slate-300">
                Play the correct move directly on the board, or use "Show Best Move Arrow" for on-board guidance.
              </p>
            </div>

            {/* Practice vs Bot from this Position */}
            {onPracticeVsBot && (
              <button
                onClick={() => onPracticeVsBot(currentLesson.initialFen)}
                className="w-full py-2 px-3 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5 text-emerald-400" />
                Practice vs Bot from Here
              </button>
            )}

            {/* Live Feedback Message */}
            {feedbackMessage && !isSuccess && (
              <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-200">
                {feedbackMessage}
              </div>
            )}
          </div>

          {/* Success Banner */}
          {isSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-600/60 rounded-xl p-5 shadow-xl text-center space-y-3 animate-scale-in">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-emerald-300">{currentLesson.successTitle}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentLesson.successMessage}
              </p>
              <button
                onClick={handleNextLesson}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Continue to Next Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
