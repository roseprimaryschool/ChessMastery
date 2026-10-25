import { Chess, PieceSymbol, Color, Square } from 'chess.js';

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (from White's perspective, rank 8 down to rank 1, a to h)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE_MIDDLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

const KING_TABLE_END = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50
];

function getSquareIndex(square: Square, color: Color): number {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1], 10) - 1; // 0 to 7
  
  if (color === 'w') {
    // 0 is a8, 63 is h1
    const row = 7 - rank;
    return row * 8 + file;
  } else {
    // Flip perspective for black
    const row = rank;
    return row * 8 + file;
  }
}

function getPSTValue(piece: PieceSymbol, square: Square, color: Color, isEndgame: boolean): number {
  const idx = getSquareIndex(square, color);
  switch (piece) {
    case 'p': return PAWN_TABLE[idx] || 0;
    case 'n': return KNIGHT_TABLE[idx] || 0;
    case 'b': return BISHOP_TABLE[idx] || 0;
    case 'r': return ROOK_TABLE[idx] || 0;
    case 'q': return QUEEN_TABLE[idx] || 0;
    case 'k': return isEndgame ? KING_TABLE_END[idx] || 0 : KING_TABLE_MIDDLE[idx] || 0;
    default: return 0;
  }
}

/**
 * Static evaluation function.
 * Returns score in centipawns:
 * Positive = White is winning, Negative = Black is winning.
 */
export function evaluateBoard(chess: Chess): number {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      // If white to move and mated -> black wins (-99999). If black to move -> white wins (+99999)
      return chess.turn() === 'w' ? -99999 : 99999;
    }
    if (chess.isDraw()) {
      return 0;
    }
  }

  let whiteMaterial = 0;
  let blackMaterial = 0;
  let whitePST = 0;
  let blackPST = 0;

  let totalNonPawnMaterial = 0;

  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const sq = (String.fromCharCode('a'.charCodeAt(0) + c) + (8 - r)) as Square;
      const val = PIECE_VALUES[piece.type];

      if (piece.type !== 'p' && piece.type !== 'k') {
        totalNonPawnMaterial += val;
      }

      if (piece.color === 'w') {
        whiteMaterial += val;
      } else {
        blackMaterial += val;
      }
    }
  }

  const isEndgame = totalNonPawnMaterial < 1400; // Queens gone or mostly minor pieces

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const sq = (String.fromCharCode('a'.charCodeAt(0) + c) + (8 - r)) as Square;
      const pstVal = getPSTValue(piece.type, sq, piece.color, isEndgame);

      if (piece.color === 'w') {
        whitePST += pstVal;
      } else {
        blackPST += pstVal;
      }
    }
  }

  // Slight mobility bonus: legal moves count
  const legalMovesCount = chess.moves().length;
  const mobility = (chess.turn() === 'w' ? 1 : -1) * (legalMovesCount * 4);

  const whiteScore = whiteMaterial + whitePST;
  const blackScore = blackMaterial + blackPST;

  return whiteScore - blackScore + mobility;
}

/**
 * Calculates winning chance percentage (0 - 100) based on centipawns
 * Using the standard sigmoid curve calibrated to Lichess/FIDE winrates
 */
export function winChanceFromCentipawns(cp: number): number {
  if (cp > 90000) return 100;
  if (cp < -90000) return 0;
  // Limit extreme cp for math stability
  const clamped = Math.max(-2000, Math.min(2000, cp));
  const winRate = 50 + 50 * (2 / (1 + Math.exp(-0.00368 * clamped)) - 1);
  return Math.max(0, Math.min(100, Math.round(winRate * 10) / 10));
}

/**
 * Human-readable evaluation string: "+1.4", "-0.8", "0.0", "M3", "-M2"
 */
export function formatEvalScore(cp: number): string {
  if (cp > 90000) {
    const mateIn = Math.ceil((100000 - cp) / 2);
    return `M${Math.max(1, mateIn)}`;
  }
  if (cp < -90000) {
    const mateIn = Math.ceil((100000 + cp) / 2);
    return `-M${Math.max(1, mateIn)}`;
  }
  const pawns = cp / 100;
  if (pawns > 0) {
    return `+${pawns.toFixed(1)}`;
  }
  return pawns.toFixed(1);
}
