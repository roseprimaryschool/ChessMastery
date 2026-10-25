import React, { useState } from 'react';
import type { GameAnalysisResult, MoveAnalysis, MoveClassification } from '../types/chess';
import { formatEvalScore } from '../engine/evaluation';
import { CLASSIFICATION_COLORS, CLASSIFICATION_SYMBOLS } from './ChessBoard';
import {
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  ListOrdered,
  BarChart3,
  Eye,
  EyeOff,
  User,
  Bot,
} from 'lucide-react';

interface AnalysisPanelProps {
  analysis: GameAnalysisResult;
  selectedMoveIndex: number;
  onSelectMove: (index: number) => void;
  onShowBestMoveToggle?: () => void;
  isShowingBestMove?: boolean;
}

const CLASSIFICATION_ORDER: { key: MoveClassification; label: string; desc: string }[] = [
  { key: 'brilliant', label: 'Brilliant', desc: 'Inspired tactical sacrifice' },
  { key: 'great', label: 'Great', desc: 'Critical only move found' },
  { key: 'best', label: 'Best', desc: 'Top engine recommendation' },
  { key: 'excellent', label: 'Excellent', desc: 'Maintains full advantage' },
  { key: 'good', label: 'Good', desc: 'Solid continuation' },
  { key: 'book', label: 'Book', desc: 'Standard opening theory' },
  { key: 'inaccuracy', label: 'Inaccuracy', desc: 'Slight slip in pressure' },
  { key: 'mistake', label: 'Mistake', desc: 'Noticeable error' },
  { key: 'miss', label: 'Miss', desc: 'Missed tactical opportunity' },
  { key: 'blunder', label: 'Blunder', desc: 'Critical game-changing blunder' },
];

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  analysis,
  selectedMoveIndex,
  onSelectMove,
  onShowBestMoveToggle,
  isShowingBestMove = true,
}) => {
  const [activeTab, setActiveTab] = useState<'coach' | 'moves' | 'breakdown'>('coach');

  const currentMoveAnalysis: MoveAnalysis | undefined = analysis.moves[selectedMoveIndex];

  // Find next key moment (blunder, mistake, miss, or inaccuracy)
  const handleNextKeyMoment = () => {
    const errorTypes: MoveClassification[] = ['blunder', 'miss', 'mistake', 'inaccuracy'];
    for (let i = selectedMoveIndex + 1; i < analysis.moves.length; i++) {
      if (errorTypes.includes(analysis.moves[i].classification)) {
        onSelectMove(i);
        return;
      }
    }
    // Loop around to first key moment
    for (let i = 0; i <= selectedMoveIndex; i++) {
      if (errorTypes.includes(analysis.moves[i].classification)) {
        onSelectMove(i);
        return;
      }
    }
  };

  // Find prev key moment
  const handlePrevKeyMoment = () => {
    const errorTypes: MoveClassification[] = ['blunder', 'miss', 'mistake', 'inaccuracy'];
    for (let i = selectedMoveIndex - 1; i >= 0; i--) {
      if (errorTypes.includes(analysis.moves[i].classification)) {
        onSelectMove(i);
        return;
      }
    }
    // Loop around from end
    for (let i = analysis.moves.length - 1; i >= selectedMoveIndex; i--) {
      if (errorTypes.includes(analysis.moves[i].classification)) {
        onSelectMove(i);
        return;
      }
    }
  };

  // SVG Evaluation Graph
  const graphWidth = 360;
  const graphHeight = 70;
  const movesCount = analysis.moves.length;

  const points = analysis.moves.map((m, idx) => {
    const x = movesCount > 1 ? (idx / (movesCount - 1)) * graphWidth : graphWidth / 2;
    const clampedCp = Math.max(-1000, Math.min(1000, m.evalAfter));
    const normalized = (clampedCp + 1000) / 2000;
    const y = graphHeight - normalized * graphHeight;
    return { x, y, idx, eval: m.evalAfter };
  });

  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const activePoint = points[selectedMoveIndex];

  // Group moves into pairs (White and Black) for Moves tab
  const movePairs: {
    num: number;
    white?: MoveAnalysis;
    whiteIdx?: number;
    black?: MoveAnalysis;
    blackIdx?: number;
  }[] = [];

  for (let i = 0; i < analysis.moves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: analysis.moves[i],
      whiteIdx: i,
      black: analysis.moves[i + 1],
      blackIdx: i + 1 < analysis.moves.length ? i + 1 : undefined,
    });
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-xs">
      {/* Top Banner: Dual Accuracy & Performance CAPS (Chess.com Style) */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-white tracking-tight">Game Review</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {analysis.moves.length} plies · Depth 16
          </span>
        </div>

        {/* Dual Accuracy Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-inner">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-100 ring-2 ring-slate-400/50" />
                White
              </span>
              <span className="font-mono text-base font-bold text-white tabular-nums">
                {analysis.accuracyWhite}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${analysis.accuracyWhite}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Performance</span>
              <span className="font-mono font-semibold text-emerald-400">
                ~{analysis.performanceWhite} Elo
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-inner">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-700 ring-2 ring-slate-600" />
                Black
              </span>
              <span className="font-mono text-base font-bold text-white tabular-nums">
                {analysis.accuracyBlack}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${analysis.accuracyBlack}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Performance</span>
              <span className="font-mono font-semibold text-cyan-400">
                ~{analysis.performanceBlack} Elo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Control Navigation Tabs */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 p-0.5 bg-slate-800/80 rounded-lg">
          <button
            onClick={() => setActiveTab('coach')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
              activeTab === 'coach'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Coach Review
          </button>
          <button
            onClick={() => setActiveTab('moves')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
              activeTab === 'moves'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Moves ({analysis.moves.length})
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
              activeTab === 'breakdown'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Breakdown
          </button>
        </div>

        {/* Key Moments Jumper */}
        <button
          onClick={handleNextKeyMoment}
          title="Jump to Next Blunder / Mistake / Miss"
          className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>Key Moments</span>
        </button>
      </div>

      {/* Evaluation Advantage Graph */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/20">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Evaluation Flow
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            {currentMoveAnalysis
              ? `${formatEvalScore(currentMoveAnalysis.evalAfter)} (${currentMoveAnalysis.winChanceAfter}% win)`
              : '0.00'}
          </span>
        </div>

        <div className="relative bg-slate-950 rounded-lg p-2 border border-slate-800 overflow-hidden">
          <svg
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            className="w-full h-12 overflow-visible cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              const targetIdx = Math.max(0, Math.min(analysis.moves.length - 1, Math.round(ratio * (analysis.moves.length - 1))));
              onSelectMove(targetIdx);
            }}
          >
            {/* Center zero line */}
            <line
              x1="0"
              y1={graphHeight / 2}
              x2={graphWidth}
              y2={graphHeight / 2}
              stroke="#334155"
              strokeDasharray="2,2"
              strokeWidth="1"
            />

            {/* Eval Line */}
            {points.length > 0 && (
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Active move pin */}
            {activePoint && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={0}
                  x2={activePoint.x}
                  y2={graphHeight}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="4"
                  fill="#f59e0b"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: COACH REVIEW (Interactive Chess.com Coach Feedback) */}
        {activeTab === 'coach' && currentMoveAnalysis && (
          <div className="space-y-4">
            {/* Chess.com Coach Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-3">
              {/* Move classification header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md border border-white/50 ${
                      CLASSIFICATION_COLORS[currentMoveAnalysis.classification]?.bg || 'bg-slate-600'
                    }`}
                  >
                    {CLASSIFICATION_SYMBOLS[currentMoveAnalysis.classification]}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white capitalize">
                      {currentMoveAnalysis.classification}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {currentMoveAnalysis.turn === 'w' ? 'White' : 'Black'}: {currentMoveAnalysis.san}
                    </span>
                  </div>
                </div>

                <div className="font-mono text-xs font-bold text-slate-200 tabular-nums">
                  {formatEvalScore(currentMoveAnalysis.evalAfter)}
                </div>
              </div>

              {/* Coach Explanation */}
              <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {currentMoveAnalysis.commentary}
              </p>

              {/* Engine Recommendation Arrow Banner (Where you could've played) */}
              {currentMoveAnalysis.bestMoveSan !== currentMoveAnalysis.san ? (
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Best Move Alternative
                    </span>
                    <span className="font-mono font-bold text-emerald-300 text-sm">
                      {currentMoveAnalysis.bestMoveSan}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    The green arrow on the board shows where you should have played.
                  </p>
                  {onShowBestMoveToggle && (
                    <button
                      onClick={onShowBestMoveToggle}
                      className="w-full py-1.5 px-3 text-[11px] font-semibold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isShowingBestMove ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isShowingBestMove ? 'Hide Arrows' : 'Show Chess.com Arrows'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-2.5 flex items-center gap-2 text-emerald-300 text-xs font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    ★
                  </div>
                  <span>You played the engine's best move!</span>
                </div>
              )}
            </div>

            {/* Quick Move Stepper */}
            <div className="flex items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <button
                onClick={() => onSelectMove(Math.max(0, selectedMoveIndex - 1))}
                disabled={selectedMoveIndex <= 0}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous Move
              </button>

              <span className="font-mono text-xs text-slate-400">
                Move {selectedMoveIndex + 1} of {analysis.moves.length}
              </span>

              <button
                onClick={() => onSelectMove(Math.min(analysis.moves.length - 1, selectedMoveIndex + 1))}
                disabled={selectedMoveIndex >= analysis.moves.length - 1}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                Next Move
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MOVES LIST (Chess.com Move Notation with Badges on Every Move) */}
        {activeTab === 'moves' && (
          <div className="space-y-1">
            {movePairs.map((pair) => (
              <div
                key={pair.num}
                className="grid grid-cols-12 gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-800/40 transition-colors text-xs items-center"
              >
                <span className="col-span-2 font-mono text-slate-400 text-[11px] font-semibold">
                  {pair.num}.
                </span>

                {/* White move */}
                <div className="col-span-5">
                  {pair.white && (
                    <button
                      onClick={() => onSelectMove(pair.whiteIdx!)}
                      className={`w-full text-left py-1 px-2 rounded-lg flex items-center justify-between font-mono transition-colors cursor-pointer ${
                        selectedMoveIndex === pair.whiteIdx
                          ? 'bg-emerald-600 text-white font-bold shadow-md'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{pair.white.san}</span>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shadow-sm ${
                          CLASSIFICATION_COLORS[pair.white.classification]?.bg || 'bg-slate-700'
                        }`}
                      >
                        {CLASSIFICATION_SYMBOLS[pair.white.classification]}
                      </span>
                    </button>
                  )}
                </div>

                {/* Black move */}
                <div className="col-span-5">
                  {pair.black && (
                    <button
                      onClick={() => onSelectMove(pair.blackIdx!)}
                      className={`w-full text-left py-1 px-2 rounded-lg flex items-center justify-between font-mono transition-colors cursor-pointer ${
                        selectedMoveIndex === pair.blackIdx
                          ? 'bg-emerald-600 text-white font-bold shadow-md'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{pair.black.san}</span>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shadow-sm ${
                          CLASSIFICATION_COLORS[pair.black.classification]?.bg || 'bg-slate-700'
                        }`}
                      >
                        {CLASSIFICATION_SYMBOLS[pair.black.classification]}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: BREAKDOWN (Full White vs Black Classification Comparison) */}
        {activeTab === 'breakdown' && (
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 px-3 pb-2 border-b border-slate-800">
              <span className="col-span-2 text-center">White</span>
              <span className="col-span-8 text-center">Move Classification</span>
              <span className="col-span-2 text-center">Black</span>
            </div>

            {CLASSIFICATION_ORDER.map(({ key, label, desc }) => {
              const whiteCount = analysis.summaryWhite[key] || 0;
              const blackCount = analysis.summaryBlack[key] || 0;
              const colorInfo = CLASSIFICATION_COLORS[key];
              const symbol = CLASSIFICATION_SYMBOLS[key];

              return (
                <div
                  key={key}
                  className="grid grid-cols-12 items-center py-1.5 px-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs"
                >
                  <span className="col-span-2 text-center font-mono font-bold text-white tabular-nums">
                    {whiteCount}
                  </span>

                  <div className="col-span-8 flex items-center justify-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm ${
                        colorInfo?.bg || 'bg-slate-600'
                      }`}
                    >
                      {symbol}
                    </span>
                    <span className="font-semibold text-slate-200">{label}</span>
                  </div>

                  <span className="col-span-2 text-center font-mono font-bold text-white tabular-nums">
                    {blackCount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
