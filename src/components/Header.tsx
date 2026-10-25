import React from 'react';
import type { GameMode } from '../types/chess';
import { Volume2, VolumeX, Upload, Sparkles, Swords, History, GraduationCap, Plus } from 'lucide-react';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenNewGameModal: () => void;
  onOpenFenModal: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  savedGamesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenNewGameModal,
  onOpenFenModal,
  isMuted,
  onToggleMute,
  savedGamesCount = 0,
}) => {
  const isLearnMode =
    currentMode === 'learn' ||
    currentMode === 'tutorial' ||
    currentMode === 'openings' ||
    currentMode === 'puzzles';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      {/* Zone 1: Wordmark with Chess Icon */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => onSelectMode('play')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600/30 group-hover:border-emerald-400/60 transition-all">
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 22H5v-2h14v2Zm-1-4H6l1.2-6.5h9.6L18 18Zm-9.6-8.5.6-3.5 2-1 2 1 .6 3.5H8.4Zm-2.7 0L5 8.2l2.3-1.4 1 2.7H5.7Zm12.6 0h-2.6l1-2.7 2.3 1.4-.7 1.3Z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              ChessMastery
            </span>
            <span className="hidden sm:inline-block text-[10px] text-emerald-400/90 font-mono ml-2 uppercase tracking-wider font-semibold">
              Pro Studio
            </span>
          </div>
        </button>

        {/* Zone 2: Streamlined 4 Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={() => onSelectMode('play')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentMode === 'play'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Play</span>
          </button>

          <button
            onClick={() => onSelectMode('analysis')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentMode === 'analysis'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Game Review</span>
          </button>

          <button
            onClick={() => onSelectMode('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentMode === 'history'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            {savedGamesCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">
                {savedGamesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectMode('learn')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isLearnMode
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Learn & Practice</span>
          </button>
        </nav>
      </div>

      {/* Zone 3: Clean Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenFenModal}
          title="Import FEN / PGN setup"
          className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-medium"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import FEN</span>
        </button>

        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Chess Sounds' : 'Mute Chess Sounds'}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenNewGameModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md hover:shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>
    </header>
  );
};
