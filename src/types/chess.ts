import type { Square, PieceSymbol, Color } from 'chess.js';

export type GameMode = 'play' | 'analysis' | 'history' | 'learn' | 'tutorial' | 'openings' | 'puzzles';

export interface BotProfile {
  id: string;
  name: string;
  title: string;
  elo: number;
  description: string;
  avatarUrl: string;
  personality: string;
  depth: number;
  blunderRate: number; // 0 to 1
  noise: number; // random score variance
}

export type MoveClassification = 
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'miss'
  | 'blunder';

export interface MoveAnalysis {
  moveIndex: number;
  ply: number;
  turn: 'w' | 'b';
  san: string;
  from: Square;
  to: Square;
  promotion?: string;
  fenBefore: string;
  fenAfter: string;
  evalBefore: number; // Centipawns (+ for white, - for black)
  evalAfter: number;
  winChanceBefore: number; // 0 to 100
  winChanceAfter: number;
  bestMoveSan: string;
  bestMoveFrom: Square;
  bestMoveTo: Square;
  classification: MoveClassification;
  commentary: string;
}

export interface MoveSummaryCounts {
  brilliant: number;
  great: number;
  best: number;
  excellent: number;
  good: number;
  book: number;
  inaccuracy: number;
  mistake: number;
  miss: number;
  blunder: number;
}

export interface GameAnalysisResult {
  accuracyWhite: number;
  accuracyBlack: number;
  performanceWhite: number; // Estimated performance rating, e.g. 1850
  performanceBlack: number; // Estimated performance rating, e.g. 1450
  moves: MoveAnalysis[];
  summaryWhite: MoveSummaryCounts;
  summaryBlack: MoveSummaryCounts;
}

export interface SavedGame {
  id: string;
  date: string;
  opponentName: string;
  opponentElo: number;
  playerColor: Color;
  result: 'win' | 'loss' | 'draw';
  resultReason: string;
  accuracyWhite?: number;
  accuracyBlack?: number;
  totalMoves: number;
  pgn: string;
  fen: string;
  moveHistory: {
    san: string;
    from: Square;
    to: Square;
    piece: string;
    captured?: string;
    fen: string;
    classification?: MoveClassification;
  }[];
}

export interface TutorialStep {
  from: Square;
  to: Square;
  explanation: string;
  botReply?: {
    from: Square;
    to: Square;
    san: string;
  };
}

export interface TutorialLesson {
  id: string;
  module: string;
  moduleTitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  subtitle: string;
  description: string;
  keyConcepts: string[];
  initialFen: string;
  orientation: Color;
  steps: TutorialStep[];
  successTitle: string;
  successMessage: string;
  hint: string;
}

export type BoardTheme = 'tournament' | 'obsidian' | 'walnut' | 'royal' | 'rosewood';

export interface CapturedPieces {
  w: PieceSymbol[];
  b: PieceSymbol[];
  materialDifference: number; // + is white ahead, - is black ahead
}

export interface PuzzleProblem {
  id: string;
  title: string;
  theme: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master';
  rating: number;
  fen: string;
  orientation: Color;
  solution: { from: Square; to: Square; san: string }[];
  botReplies?: { from: Square; to: Square; san: string }[];
  description: string;
}
