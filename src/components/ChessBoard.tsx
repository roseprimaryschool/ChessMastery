import React, { useState } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { ChessPieceSvg } from './ChessPieceSvg';
import type { BoardTheme, MoveClassification } from '../types/chess';

export const CLASSIFICATION_COLORS: Record<MoveClassification, { bg: string; hex: string }> = {
  brilliant: { bg: 'bg-cyan-500', hex: '#06b6d4' },
  great: { bg: 'bg-sky-500', hex: '#0284c7' },
  best: { bg: 'bg-emerald-500', hex: '#10b981' },
  excellent: { bg: 'bg-teal-600', hex: '#0d9488' },
  good: { bg: 'bg-slate-500', hex: '#64748b' },
  book: { bg: 'bg-amber-700', hex: '#b45309' },
  inaccuracy: { bg: 'bg-yellow-500', hex: '#eab308' },
  mistake: { bg: 'bg-orange-500', hex: '#f97316' },
  miss: { bg: 'bg-fuchsia-600', hex: '#c026d3' },
  blunder: { bg: 'bg-red-600', hex: '#ef4444' },
};

export const CLASSIFICATION_SYMBOLS: Record<MoveClassification, string> = {
  brilliant: '!!',
  great: '!',
  best: '★',
  excellent: '✓',
  good: '✓',
  book: '📖',
  inaccuracy: '?!',
  mistake: '?',
  miss: '✕',
  blunder: '??',
};

interface ChessBoardProps {
  chess: Chess;
  orientation?: Color;
  theme?: BoardTheme;
  interactive?: boolean;
  onMove?: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  lastMove?: { from: Square; to: Square } | null;
  bestMoveHighlight?: { from: Square; to: Square } | null;
  playedMoveArrow?: { from: Square; to: Square; classification?: MoveClassification } | null;
  moveBadge?: { square: Square; classification: MoveClassification } | null;
  isCheck?: boolean;
  kingSquare?: Square | null;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  orientation = 'w',
  theme = 'tournament',
  interactive = true,
  onMove,
  lastMove,
  bestMoveHighlight,
  playedMoveArrow,
  moveBadge,
  isCheck,
  kingSquare,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  // Color schemes
  const themeColors: Record<BoardTheme, { light: string; dark: string; border: string }> = {
    tournament: {
      light: '#eeeed2',
      dark: '#769656',
      border: '#466034',
    },
    obsidian: {
      light: '#cbd5e1',
      dark: '#475569',
      border: '#1e293b',
    },
    walnut: {
      light: '#f0d9b5',
      dark: '#b58863',
      border: '#784e2d',
    },
    royal: {
      light: '#e0e7ff',
      dark: '#3b82f6',
      border: '#1d4ed8',
    },
    rosewood: {
      light: '#ffe4e6',
      dark: '#9f1239',
      border: '#4c0519',
    },
  };

  const currentTheme = themeColors[theme] || themeColors.tournament;

  // Squares array based on orientation
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = orientation === 'w' ? files : [...files].reverse();
  const displayRanks = orientation === 'w' ? ranks : [...ranks].reverse();

  // Find legal moves for square
  const getMovesForSquare = (sq: Square): Square[] => {
    try {
      const moves = chess.moves({ square: sq, verbose: true });
      return moves.map((m) => m.to as Square);
    } catch {
      return [];
    }
  };

  const handleSquareClick = (sq: Square) => {
    if (!interactive) return;

    if (pendingPromotion) return;

    const piece = chess.get(sq);

    // If square is already selected and clicked again -> deselect
    if (selectedSquare === sq) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // If we have a selected square and clicked a legal target square -> attempt move
    if (selectedSquare && legalMoves.includes(sq)) {
      const movingPiece = chess.get(selectedSquare);
      const isPawnPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && sq[1] === '8') ||
          (movingPiece.color === 'b' && sq[1] === '1'));

      if (isPawnPromotion) {
        setPendingPromotion({ from: selectedSquare, to: sq });
        return;
      }

      const success = onMove ? onMove(selectedSquare, sq) : false;
      if (success) {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
      return;
    }

    // Otherwise, select piece if it belongs to current player's turn
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(sq);
      setLegalMoves(getMovesForSquare(sq));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handlePromotionSelect = (promoPiece: PieceSymbol) => {
    if (!pendingPromotion) return;
    if (onMove) {
      onMove(pendingPromotion.from, pendingPromotion.to, promoPiece);
    }
    setPendingPromotion(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, sq: Square) => {
    if (!interactive) return;
    const piece = chess.get(sq);
    if (!piece || piece.color !== chess.turn()) {
      e.preventDefault();
      return;
    }
    setDraggedSquare(sq);
    setSelectedSquare(sq);
    setLegalMoves(getMovesForSquare(sq));
    e.dataTransfer.setData('text/plain', sq);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSq: Square) => {
    e.preventDefault();
    const sourceSq = draggedSquare || (e.dataTransfer.getData('text/plain') as Square);
    setDraggedSquare(null);

    if (!sourceSq || sourceSq === targetSq) return;

    if (legalMoves.includes(targetSq)) {
      const movingPiece = chess.get(sourceSq);
      const isPawnPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && targetSq[1] === '8') ||
          (movingPiece.color === 'b' && targetSq[1] === '1'));

      if (isPawnPromotion) {
        setPendingPromotion({ from: sourceSq, to: targetSq });
        return;
      }

      if (onMove) {
        onMove(sourceSq, targetSq);
      }
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Helper to convert board coordinates to 800x800 viewBox points
  const getArrowCoords = React.useCallback(
    (from: Square, to: Square) => {
      const colFrom = displayFiles.indexOf(from[0]);
      const rowFrom = displayRanks.indexOf(from[1]);
      const colTo = displayFiles.indexOf(to[0]);
      const rowTo = displayRanks.indexOf(to[1]);

      if (colFrom === -1 || rowFrom === -1 || colTo === -1 || rowTo === -1) return null;

      const cellSize = 100;
      return {
        x1: colFrom * cellSize + cellSize / 2,
        y1: rowFrom * cellSize + cellSize / 2,
        x2: colTo * cellSize + cellSize / 2,
        y2: rowTo * cellSize + cellSize / 2,
      };
    },
    [displayFiles, displayRanks]
  );

  // Compute SVG arrow coordinates for bestMoveHighlight
  const bestArrowCoordinates = React.useMemo(() => {
    if (!bestMoveHighlight) return null;
    return getArrowCoords(bestMoveHighlight.from, bestMoveHighlight.to);
  }, [bestMoveHighlight, getArrowCoords]);

  // Compute SVG arrow coordinates for playedMoveArrow
  const playedArrowCoordinates = React.useMemo(() => {
    if (!playedMoveArrow) return null;
    return getArrowCoords(playedMoveArrow.from, playedMoveArrow.to);
  }, [playedMoveArrow, getArrowCoords]);

  const playedArrowColor = playedMoveArrow?.classification
    ? CLASSIFICATION_COLORS[playedMoveArrow.classification]?.hex || '#ef4444'
    : '#ef4444';

  return (
    <div className="relative w-full max-w-[680px] xl:max-w-[740px] 2xl:max-w-[800px] aspect-square select-none rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900">
      {/* 8x8 Board Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayRanks.map((rank, rIdx) =>
          displayFiles.map((file, fIdx) => {
            const square = `${file}${rank}` as Square;
            const piece = chess.get(square);

            const fileNum = file.charCodeAt(0) - 'a'.charCodeAt(0);
            const rankNum = parseInt(rank, 10);
            const isDark = (fileNum + rankNum) % 2 === 0;

            const isSelected = selectedSquare === square;
            const isLegalTarget = legalMoves.includes(square);
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isBestMoveFrom = bestMoveHighlight?.from === square;
            const isBestMoveTo = bestMoveHighlight?.to === square;
            const isCheckedKing = isCheck && kingSquare === square;
            const isBadgedSquare = moveBadge && moveBadge.square === square;

            // Coordinates markings
            const showRankLabel = fIdx === 0;
            const showFileLabel = rIdx === 7;

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square)}
                style={{
                  backgroundColor: isDark ? currentTheme.dark : currentTheme.light,
                }}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                  isSelected ? 'ring-4 ring-inset ring-amber-400' : ''
                } ${isLastMoveFrom || isLastMoveTo ? 'after:absolute after:inset-0 after:bg-amber-400/30' : ''} ${
                  isBestMoveFrom ? 'ring-4 ring-inset ring-emerald-400 after:absolute after:inset-0 after:bg-emerald-500/35 animate-pulse' : ''
                } ${
                  isBestMoveTo ? 'ring-4 ring-inset ring-emerald-400 after:absolute after:inset-0 after:bg-emerald-400/40' : ''
                } ${isCheckedKing ? 'after:absolute after:inset-0 after:bg-rose-500/50 after:ring-4 after:ring-rose-500' : ''}`}
              >
                {/* Board edge coordinates */}
                {showRankLabel && (
                  <span
                    className={`absolute top-0.5 left-1 text-[11px] sm:text-xs font-semibold leading-none pointer-events-none select-none ${
                      isDark ? 'text-white/70' : 'text-slate-800/70'
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {showFileLabel && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[11px] sm:text-xs font-semibold leading-none pointer-events-none select-none ${
                      isDark ? 'text-white/70' : 'text-slate-800/70'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Target Move Indicators */}
                {isLegalTarget && !piece && (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900/35 pointer-events-none z-10 animate-scale-in" />
                )}

                {isLegalTarget && piece && (
                  <div className="absolute inset-1.5 rounded-full border-4 border-slate-900/40 pointer-events-none z-10" />
                )}

                {/* Chess.com-style Move Classification Badge */}
                {isBadgedSquare && moveBadge && (
                  <div
                    className={`absolute top-1 right-1 z-30 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-lg border border-white/60 pointer-events-none ${
                      CLASSIFICATION_COLORS[moveBadge.classification]?.bg || 'bg-red-600'
                    }`}
                    title={moveBadge.classification}
                  >
                    <span className="text-[10px] sm:text-xs font-black text-white leading-none">
                      {CLASSIFICATION_SYMBOLS[moveBadge.classification] || '!'}
                    </span>
                  </div>
                )}

                {/* Chess Piece with Drag & Drop */}
                {piece && (
                  <div
                    draggable={interactive && piece.color === chess.turn()}
                    onDragStart={(e) => handleDragStart(e, square)}
                    className={`w-[88%] h-[88%] flex items-center justify-center z-10 transition-transform duration-100 ${
                      interactive && piece.color === chess.turn() ? 'hover:scale-105 active:scale-95' : ''
                    } ${draggedSquare === square ? 'opacity-40' : ''}`}
                  >
                    <ChessPieceSvg piece={piece.type} color={piece.color} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Chess.com-style SVG Arrow Overlay for Played & Best Moves */}
      {(bestArrowCoordinates || playedArrowCoordinates) && (
        <svg
          viewBox="0 0 800 800"
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        >
          <defs>
            <marker
              id="best-arrow-head"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#10b981" />
            </marker>
            <marker
              id="played-arrow-head"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill={playedArrowColor} />
            </marker>
          </defs>

          {/* Played Move Arrow (Red/Orange/Yellow for Blunder/Mistake/Inaccuracy/Miss) */}
          {playedArrowCoordinates && (
            <line
              x1={playedArrowCoordinates.x1}
              y1={playedArrowCoordinates.y1}
              x2={playedArrowCoordinates.x2}
              y2={playedArrowCoordinates.y2}
              stroke={playedArrowColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeOpacity="0.8"
              markerEnd="url(#played-arrow-head)"
            />
          )}

          {/* Best Move Arrow (Bright Green: "Where you could've played") */}
          {bestArrowCoordinates && (
            <line
              x1={bestArrowCoordinates.x1}
              y1={bestArrowCoordinates.y1}
              x2={bestArrowCoordinates.x2}
              y2={bestArrowCoordinates.y2}
              stroke="#10b981"
              strokeWidth="14"
              strokeLinecap="round"
              strokeOpacity="0.9"
              markerEnd="url(#best-arrow-head)"
            />
          )}
        </svg>
      )}

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl flex flex-col items-center gap-3">
            <span className="text-sm font-semibold text-slate-200">Select Promotion Piece</span>
            <div className="flex gap-2">
              {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((pType) => (
                <button
                  key={pType}
                  onClick={() => handlePromotionSelect(pType)}
                  className="w-16 h-16 p-2 bg-slate-700/80 hover:bg-emerald-600/30 hover:border-emerald-500 border border-slate-600 rounded-lg transition-all transform hover:scale-110 active:scale-95"
                >
                  <ChessPieceSvg piece={pType} color={chess.turn()} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
