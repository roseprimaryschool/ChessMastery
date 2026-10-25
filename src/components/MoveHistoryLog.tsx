import React, { useRef, useEffect } from 'react';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Copy,
  Check,
  RotateCcw,
  Flag,
  Download,
} from 'lucide-react';
import type { MoveClassification, CapturedPieces } from '../types/chess';
import { ChessPieceSvg } from './ChessPieceSvg';

interface MoveRecord {
  san: string;
  from: string;
  to: string;
  fen: string;
  classification?: MoveClassification;
}

interface MoveHistoryLogProps {
  moves: MoveRecord[];
  currentMoveIndex: number; // -1 is start position, 0 is first move
  onSelectMove: (index: number) => void;
  onReset?: () => void;
  onResign?: () => void;
  capturedPieces: CapturedPieces;
  fen: string;
  pgn: string;
  isGameOver?: boolean;
}

export const MoveHistoryLog: React.FC<MoveHistoryLogProps> = ({
  moves,
  currentMoveIndex,
  onSelectMove,
  onReset,
  onResign,
  capturedPieces,
  fen,
  pgn,
  isGameOver,
}) => {
  const [copiedType, setCopiedType] = React.useState<'fen' | 'pgn' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group moves into pairs (White & Black)
  const movePairs: { num: number; white: MoveRecord; black?: MoveRecord; whiteIdx: number; blackIdx?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
      whiteIdx: i,
      blackIdx: i + 1 < moves.length ? i + 1 : undefined,
    });
  }

  // Auto-scroll to active move
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('.active-move');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentMoveIndex]);

  const copyToClipboard = (text: string, type: 'fen' | 'pgn') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const renderBadge = (classification?: MoveClassification) => {
    if (!classification) return null;
    switch (classification) {
      case 'brilliant':
        return <span className="ml-1 text-[11px] text-cyan-400 font-bold" title="Brilliant (!!)">!!</span>;
      case 'best':
        return <span className="ml-1 text-[11px] text-emerald-400 font-bold" title="Best Move">★</span>;
      case 'excellent':
        return <span className="ml-1 text-[11px] text-teal-400 font-bold" title="Excellent">✓</span>;
      case 'inaccuracy':
        return <span className="ml-1 text-[11px] text-amber-400 font-bold" title="Inaccuracy (?)">?</span>;
      case 'mistake':
        return <span className="ml-1 text-[11px] text-orange-400 font-bold" title="Mistake (?!)">?!</span>;
      case 'blunder':
        return <span className="ml-1 text-[11px] text-rose-500 font-bold" title="Blunder (??)">??</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Captured Pieces & Material Count Bar */}
      <div className="px-4 py-3 bg-slate-850/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-h-[22px]">
          <span className="text-slate-400 text-[11px] mr-1">Captured:</span>
          {/* Black pieces captured by White */}
          <div className="flex -space-x-1 items-center">
            {capturedPieces.b.map((p, idx) => (
              <div key={idx} className="w-4 h-4">
                <ChessPieceSvg piece={p} color="b" />
              </div>
            ))}
          </div>
          {capturedPieces.materialDifference > 0 && (
            <span className="text-[11px] font-mono text-emerald-400 font-semibold ml-1">
              +{capturedPieces.materialDifference}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 min-h-[22px]">
          {/* White pieces captured by Black */}
          <div className="flex -space-x-1 items-center">
            {capturedPieces.w.map((p, idx) => (
              <div key={idx} className="w-4 h-4">
                <ChessPieceSvg piece={p} color="w" />
              </div>
            ))}
          </div>
          {capturedPieces.materialDifference < 0 && (
            <span className="text-[11px] font-mono text-rose-400 font-semibold ml-1">
              +{Math.abs(capturedPieces.materialDifference)}
            </span>
          )}
        </div>
      </div>

      {/* Move History Table */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 font-mono text-xs select-none max-h-[340px]"
      >
        {movePairs.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-center px-4 font-sans">
            <span className="text-sm font-medium text-slate-400 mb-1">Game Ready</span>
            <span className="text-xs">Make a move on the board to begin the game</span>
          </div>
        ) : (
          movePairs.map((pair) => (
            <div key={pair.num} className="grid grid-cols-12 py-1.5 px-2 hover:bg-slate-800/40 rounded transition-colors">
              <span className="col-span-2 text-slate-500 text-[11px] tabular-nums flex items-center">
                {pair.num}.
              </span>

              {/* White Move */}
              <button
                onClick={() => onSelectMove(pair.whiteIdx)}
                className={`col-span-5 text-left py-0.5 px-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                  currentMoveIndex === pair.whiteIdx
                    ? 'active-move bg-slate-700/80 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{pair.white.san}</span>
                {renderBadge(pair.white.classification)}
              </button>

              {/* Black Move */}
              {pair.black && pair.blackIdx !== undefined ? (
                <button
                  onClick={() => onSelectMove(pair.blackIdx!)}
                  className={`col-span-5 text-left py-0.5 px-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                    currentMoveIndex === pair.blackIdx
                      ? 'active-move bg-slate-700/80 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{pair.black.san}</span>
                  {renderBadge(pair.black.classification)}
                </button>
              ) : (
                <div className="col-span-5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Navigation Controls: |< < > >| */}
      <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectMove(-1)}
            disabled={currentMoveIndex === -1}
            title="First Move"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectMove(Math.max(-1, currentMoveIndex - 1))}
            disabled={currentMoveIndex <= -1}
            title="Previous Move"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectMove(Math.min(moves.length - 1, currentMoveIndex + 1))}
            disabled={currentMoveIndex >= moves.length - 1}
            title="Next Move"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectMove(moves.length - 1)}
            disabled={currentMoveIndex === moves.length - 1}
            title="Latest Move"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons: FEN / PGN Copy & PGN Download */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => copyToClipboard(pgn || 'No moves', 'pgn')}
            title="Copy PGN text to clipboard"
            className="px-2 py-1 text-[11px] font-sans font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedType === 'pgn' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            PGN
          </button>
          <button
            onClick={() => copyToClipboard(fen, 'fen')}
            title="Copy FEN position"
            className="px-2 py-1 text-[11px] font-sans font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedType === 'fen' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            FEN
          </button>
          {pgn && pgn.trim().length > 0 && (
            <button
              onClick={() => {
                const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `chess_game_${new Date().toISOString().slice(0, 10)}.pgn`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              title="Download PGN File"
              className="px-2 py-1 text-[11px] font-sans font-medium text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* In-game controls: Resign or Restart */}
      {!isGameOver && onResign && (
        <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            onClick={onResign}
            className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 text-xs py-1 px-2 rounded hover:bg-slate-800 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Resign Game
          </button>
          {onReset && (
            <button
              onClick={onReset}
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1.5 text-xs py-1 px-2 rounded hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Board
            </button>
          )}
        </div>
      )}
    </div>
  );
};
