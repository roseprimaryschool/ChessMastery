import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { X, Upload, Sparkles, Play, FileText, AlertCircle } from 'lucide-react';

interface CustomFenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadFen: (fen: string, playMode: 'play' | 'analysis') => void;
}

const HISTORIC_PRESETS = [
  {
    name: 'The Opera Game (Morphy vs Brunswick, 1858)',
    desc: 'The defining masterpiece of open piece activity and mating pins.',
    fen: '4kb1r/p2rqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1',
  },
  {
    name: 'Kasparov\'s Immortal (Kasparov vs Topalov, 1999)',
    desc: 'The most ferocious king hunt in modern chess history.',
    fen: 'b2r3r/4k1pp/p2b1p2/8/2BRPP2/1P6/P4BPP/3R2K1 b - - 0 23',
  },
  {
    name: 'Game of the Century (Byrne vs Fischer, 1956)',
    desc: '13-year-old Bobby Fischer unleashes a shocking Queen sacrifice.',
    fen: 'r3k2r/pp2bppp/2n1pn2/q1pp4/3P1B2/1PPBPN2/P4PPP/R2QK2R w KQkq - 1 11',
  },
  {
    name: 'The Immortal Game (Anderssen vs Kieseritzky, 1851)',
    desc: 'Anderssen sacrifices both rooks and his queen for a minor piece mate.',
    fen: 'r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b - - 1 23',
  },
];

export const CustomFenModal: React.FC<CustomFenModalProps> = ({
  isOpen,
  onClose,
  onLoadFen,
}) => {
  const [fenInput, setFenInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateAndLoad = (fenString: string, mode: 'play' | 'analysis') => {
    setError(null);
    const clean = fenString.trim();
    if (!clean) {
      setError('Please provide a valid FEN string.');
      return;
    }

    try {
      const testChess = new Chess(clean);
      if (testChess) {
        onLoadFen(clean, mode);
        onClose();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid FEN notation. Check piece placement.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Load Custom Position (FEN)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* FEN Textarea Input */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Paste FEN String
            </label>
            <textarea
              rows={3}
              value={fenInput}
              onChange={(e) => {
                setFenInput(e.target.value);
                setError(null);
              }}
              placeholder="e.g. r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleValidateAndLoad(fenInput, 'play')}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play vs Bot from Here
            </button>
            <button
              onClick={() => handleValidateAndLoad(fenInput, 'analysis')}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Analyze with Engine
            </button>
          </div>

          {/* Historic Masterpiece Presets */}
          <div className="pt-3 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Or Choose a Grandmaster Masterpiece:
            </label>
            <div className="space-y-2">
              {HISTORIC_PRESETS.map((preset) => (
                <div
                  key={preset.name}
                  className="p-3 bg-slate-850/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white block truncate">
                      {preset.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">{preset.desc}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleValidateAndLoad(preset.fen, 'play')}
                      className="px-2.5 py-1 text-[11px] bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-300 border border-emerald-800/60 rounded-md transition-all cursor-pointer font-medium"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => handleValidateAndLoad(preset.fen, 'analysis')}
                      className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md transition-all cursor-pointer font-medium"
                    >
                      Analyze
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
