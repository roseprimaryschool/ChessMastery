import { Chess, Square } from 'chess.js';
import { evaluateBoard, winChanceFromCentipawns } from './evaluation';
import { minimaxAlphaBeta } from './botEngine';
import type { MoveAnalysis, GameAnalysisResult, MoveClassification } from '../types/chess';

interface HistoryMoveRecord {
  san: string;
  from: Square;
  to: Square;
  promotion?: string;
  captured?: string;
  piece: string;
}

const COMMON_BOOK_MOVES = new Set([
  'e4', 'e5', 'd4', 'd5', 'c4', 'c5', 'Nf3', 'Nc6', 'Nf6', 'Nc3',
  'g3', 'g6', 'Bg2', 'Bg7', 'Bb5', 'Bc4', 'Be2', 'd6', 'e6',
  'O-O', 'b3', 'b6', 'Bb2', 'Bb7', 'c6', 'a6', 'Bf4', 'Bf5',
]);

/**
 * Generate human-like coaching commentary for chess analysis just like in Chess.com
 */
function generateCommentary(
  classification: MoveClassification,
  san: string,
  bestSan: string,
  piece: string,
  captured?: string,
  evalDropCp: number = 0
): string {
  if (classification === 'brilliant') {
    return `Brilliant! An inspired piece sacrifice that maintains full control and active attack.`;
  }
  if (classification === 'great') {
    return `Great find! You found the critical continuation that keeps the upper hand.`;
  }
  if (classification === 'book') {
    return `Book move. A recognized standard theoretical opening line.`;
  }
  if (classification === 'best') {
    if (san.includes('#')) return `Checkmate! The king has no escape.`;
    if (san.includes('+')) return `Best move. Delivers check while keeping continuous initiative.`;
    if (san === 'O-O' || san === 'O-O-O') return `Best move. Castles the king to safety and activates the rook.`;
    return `The engine's top choice. Maximizes piece activity and coordination.`;
  }
  if (classification === 'excellent') {
    return `Strong move! Preserves your dynamic advantage and controls key squares.`;
  }
  if (classification === 'good') {
    return `A solid move, though ${bestSan} offered a sharper tactical continuation.`;
  }
  if (classification === 'inaccuracy') {
    return `Inaccuracy. A slight slip that eases pressure. Better was ${bestSan}.`;
  }
  if (classification === 'mistake') {
    return `Mistake. Leaves your position vulnerable and cedes tempo. Better was ${bestSan}.`;
  }
  if (classification === 'miss') {
    return `Miss! You missed an opportunity to capitalize on a tactical flaw or win material. Best was ${bestSan}.`;
  }
  if (classification === 'blunder') {
    if (captured) {
      return `Blunder! Misses a major counter-tactic. ${bestSan} was required.`;
    }
    return `Blunder! Swings the evaluation substantially. Best was ${bestSan}.`;
  }
  return `Natural move continuation.`;
}

/**
 * Analyzes a full game history from start to finish
 */
export function analyzeGame(
  moveHistory: HistoryMoveRecord[],
  onProgress?: (progress: number) => void
): GameAnalysisResult {
  const chess = new Chess();
  const analyses: MoveAnalysis[] = [];

  let whiteAccuracySum = 0;
  let whiteMoveCount = 0;
  let blackAccuracySum = 0;
  let blackMoveCount = 0;

  const summaryWhite = {
    brilliant: 0,
    great: 0,
    best: 0,
    excellent: 0,
    good: 0,
    book: 0,
    inaccuracy: 0,
    mistake: 0,
    miss: 0,
    blunder: 0,
  };

  const summaryBlack = {
    brilliant: 0,
    great: 0,
    best: 0,
    excellent: 0,
    good: 0,
    book: 0,
    inaccuracy: 0,
    mistake: 0,
    miss: 0,
    blunder: 0,
  };

  const totalMoves = moveHistory.length;

  for (let i = 0; i < totalMoves; i++) {
    const record = moveHistory[i];
    const turn = chess.turn();
    const fenBefore = chess.fen();

    // 1. Evaluate position before move & find engine's best move
    const isWhiteTurn = turn === 'w';
    const evalBefore = evaluateBoard(chess);
    const winBefore = winChanceFromCentipawns(evalBefore);

    // Engine best move search (depth 2 for swift real-time review)
    const engineSearch = minimaxAlphaBeta(chess, 2, -Infinity, Infinity, isWhiteTurn);
    const bestMove = engineSearch.bestMove;
    const bestMoveSan = bestMove ? bestMove.san : record.san;
    const bestMoveFrom = bestMove ? bestMove.from : record.from;
    const bestMoveTo = bestMove ? bestMove.to : record.to;
    const bestMoveEval = engineSearch.score;

    // 2. Play the move that was actually played
    chess.move({
      from: record.from,
      to: record.to,
      promotion: record.promotion,
    });

    const fenAfter = chess.fen();
    const evalAfter = evaluateBoard(chess);
    const winAfter = winChanceFromCentipawns(evalAfter);

    // 3. Compute loss relative to player's turn
    const evalLossCp = isWhiteTurn 
      ? Math.max(0, bestMoveEval - evalAfter)
      : Math.max(0, evalAfter - bestMoveEval);

    const winDrop = isWhiteTurn 
      ? Math.max(0, winBefore - winAfter)
      : Math.max(0, (100 - winBefore) - (100 - winAfter));

    // 4. Classify move with Chess.com granularity
    let classification: MoveClassification = 'good';

    const isSacrifice = !record.captured && (record.piece === 'q' || record.piece === 'r' || record.piece === 'b' || record.piece === 'n') && evalLossCp < 20 && (isWhiteTurn ? evalAfter > 150 : evalAfter < -150);
    const hadSignificantAdvantage = isWhiteTurn ? (evalBefore >= 180 || winBefore >= 65) : (evalBefore <= -180 || winBefore <= 35);

    if (i < 8 && COMMON_BOOK_MOVES.has(record.san) && evalLossCp <= 30) {
      classification = 'book';
    } else if (isSacrifice && i > 4) {
      classification = 'brilliant';
    } else if (record.san === bestMoveSan && (winBefore < 40 || (isWhiteTurn ? evalBefore < -150 : evalBefore > 150))) {
      classification = 'great';
    } else if (record.san === bestMoveSan || evalLossCp <= 15) {
      classification = 'best';
    } else if (evalLossCp <= 45 || winDrop <= 3) {
      classification = 'excellent';
    } else if (hadSignificantAdvantage && (evalLossCp >= 200 || winDrop >= 18)) {
      classification = 'miss';
    } else if (evalLossCp <= 110 || winDrop <= 8) {
      classification = 'good';
    } else if (evalLossCp <= 220 || winDrop <= 18) {
      classification = 'inaccuracy';
    } else if (evalLossCp <= 400 || winDrop <= 30) {
      classification = 'mistake';
    } else {
      classification = 'blunder';
    }

    // Move accuracy formula (0-100%)
    const moveAccuracy = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.0035 * evalLossCp) - 3.1668));

    if (isWhiteTurn) {
      whiteAccuracySum += moveAccuracy;
      whiteMoveCount++;
      summaryWhite[classification]++;
    } else {
      blackAccuracySum += moveAccuracy;
      blackMoveCount++;
      summaryBlack[classification]++;
    }

    const commentary = generateCommentary(
      classification,
      record.san,
      bestMoveSan,
      record.piece,
      record.captured,
      evalLossCp
    );

    analyses.push({
      moveIndex: Math.floor(i / 2) + 1,
      ply: i + 1,
      turn,
      san: record.san,
      from: record.from,
      to: record.to,
      promotion: record.promotion,
      fenBefore,
      fenAfter,
      evalBefore,
      evalAfter,
      winChanceBefore: winBefore,
      winChanceAfter: winAfter,
      bestMoveSan,
      bestMoveFrom,
      bestMoveTo,
      classification,
      commentary,
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalMoves) * 100));
    }
  }

  const accuracyWhite = whiteMoveCount > 0 ? Math.round((whiteAccuracySum / whiteMoveCount) * 10) / 10 : 100;
  const accuracyBlack = blackMoveCount > 0 ? Math.round((blackAccuracySum / blackMoveCount) * 10) / 10 : 100;

  const performanceWhite = Math.min(2850, Math.max(600, Math.round(700 + (accuracyWhite * 18.5))));
  const performanceBlack = Math.min(2850, Math.max(600, Math.round(700 + (accuracyBlack * 18.5))));

  return {
    accuracyWhite,
    accuracyBlack,
    performanceWhite,
    performanceBlack,
    moves: analyses,
    summaryWhite,
    summaryBlack,
  };
}
