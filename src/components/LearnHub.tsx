import React, { useState } from 'react';
import { TutorialView } from './TutorialView';
import { OpeningExplorer, OpeningInfo } from './OpeningExplorer';
import { PuzzleTrainer } from './PuzzleTrainer';
import { BookOpen, Compass, Zap } from 'lucide-react';

interface LearnHubProps {
  initialTab?: 'lessons' | 'openings' | 'puzzles';
  onBackToPlay?: () => void;
  onPracticeVsBot?: (fen: string) => void;
  onLoadOpening?: (op: OpeningInfo) => void;
  onAnalyzeOpening?: (op: OpeningInfo) => void;
}

export const LearnHub: React.FC<LearnHubProps> = ({
  initialTab = 'lessons',
  onBackToPlay,
  onPracticeVsBot,
  onLoadOpening,
  onAnalyzeOpening,
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'openings' | 'puzzles'>(initialTab);

  return (
    <div className="w-full max-w-[1400px] mx-auto py-2 space-y-6">
      {/* Sub-navigation Segmented Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/90 px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>ChessMastery Academy</span>
          </h2>
          <p className="text-xs text-slate-400">
            Interactive masterclasses, master opening theory, and tactical checkmate drills
          </p>
        </div>

        {/* Clean Segmented Tab Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Lessons</span>
          </button>

          <button
            onClick={() => setActiveTab('openings')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'openings'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Opening Repertoire</span>
          </button>

          <button
            onClick={() => setActiveTab('puzzles')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'puzzles'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Tactical Puzzles</span>
          </button>
        </div>
      </div>

      {/* Active Learning Section */}
      <div className="transition-all duration-200">
        {activeTab === 'lessons' && (
          <TutorialView
            onBackToPlay={onBackToPlay}
            onPracticeVsBot={onPracticeVsBot}
          />
        )}

        {activeTab === 'openings' && (
          <OpeningExplorer
            onLoadOpening={(op) => {
              if (onLoadOpening) onLoadOpening(op);
            }}
            onAnalyzeOpening={(op) => {
              if (onAnalyzeOpening) onAnalyzeOpening(op);
            }}
          />
        )}

        {activeTab === 'puzzles' && (
          <PuzzleTrainer />
        )}
      </div>
    </div>
  );
};
