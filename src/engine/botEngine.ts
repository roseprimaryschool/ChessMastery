import { Chess, Move } from 'chess.js';
import { evaluateBoard, PIECE_VALUES } from './evaluation';
import type { BotProfile } from '../types/chess';

export const BOT_PROFILES: BotProfile[] = [
  {
    id: 'bot_400',
    name: 'Bobby Pawn',
    title: 'Beginner',
    elo: 400,
    description: 'Learning the rules. Makes frequent blunders and misses simple tactics.',
    avatarUrl: '/src/assets/images/chess_bot_apprentice_1792958845103.jpg',
    personality: 'Still figuring out where the knights like to jump!',
    depth: 1,
    blunderRate: 0.40,
    noise: 180,
  },
  {
    id: 'bot_800',
    name: 'Scout Nora',
    title: 'Casual Player',
    elo: 800,
    description: 'Plays straightforward chess. Captures free pieces but falls for simple traps.',
    avatarUrl: '/src/assets/images/chess_bot_apprentice_1792958845103.jpg',
    personality: 'I love opening with e4 and developing my bishops!',
    depth: 2,
    blunderRate: 0.22,
    noise: 110,
  },
  {
    id: 'bot_1200',
    name: 'Club Dennis',
    title: 'Club Player',
    elo: 1200,
    description: 'Solid basic fundamentals. Castles early, controls the center, rarely gives away pieces.',
    avatarUrl: '/src/assets/images/chess_bot_apprentice_1792958845103.jpg',
    personality: 'Pawn structure and king safety come first.',
    depth: 2,
    blunderRate: 0.10,
    noise: 55,
  },
  {
    id: 'bot_1600',
    name: 'Elena Strategist',
    title: 'Intermediate',
    elo: 1600,
    description: 'Sharp tactical eye. Executes forks, pins, and skewers with precision.',
    avatarUrl: '/src/assets/images/chess_bot_gm_1792958844894.jpg',
    personality: 'Every move must create a threat or improve a piece.',
    depth: 3,
    blunderRate: 0.04,
    noise: 25,
  },
  {
    id: 'bot_2000',
    name: 'Master Viktor',
    title: 'Chess Master',
    elo: 2000,
    description: 'Deep calculations, solid opening repertoire, and relentless tactical punishment.',
    avatarUrl: '/src/assets/images/chess_bot_gm_1792958844894.jpg',
    personality: 'Weaknesses in your position will be found and exploited.',
    depth: 3,
    blunderRate: 0.01,
    noise: 10,
  },
  {
    id: 'bot_2400',
    name: 'Aegis-7 Automaton',
    title: 'Grandmaster',
    elo: 2400,
    description: 'Maximum engine depth, alpha-beta pruning, quiescence search, and ruthless endgame conversion.',
    avatarUrl: '/src/assets/images/chess_bot_gm_1792958844894.jpg',
    personality: 'Precision without emotion. Inevitable checkmate.',
    depth: 4,
    blunderRate: 0.0,
    noise: 0,
  },
];

/**
 * Move ordering: checks and captures first with MVV-LVA
 */
function sortMoves(moves: Move[]): Move[] {
  return moves.slice().sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
    }
    if (a.san.includes('+')) scoreA += 50;
    if (a.promotion) scoreA += 800;

    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
    }
    if (b.san.includes('+')) scoreB += 50;
    if (b.promotion) scoreB += 800;

    return scoreB - scoreA;
  });
}

/**
 * Quiescence search to avoid horizon effect on captures
 */
function quiescence(chess: Chess, alpha: number, beta: number, maxDepth = 2): number {
  const standPat = evaluateBoard(chess);
  if (maxDepth <= 0) return standPat;

  if (chess.turn() === 'w') {
    if (standPat >= beta) return beta;
    let currentAlpha = Math.max(alpha, standPat);

    // Only search captures
    const captureMoves = sortMoves(chess.moves({ verbose: true }).filter(m => m.captured || m.promotion));
    for (const move of captureMoves) {
      chess.move(move);
      const score = quiescence(chess, currentAlpha, beta, maxDepth - 1);
      chess.undo();

      if (score >= beta) return beta;
      currentAlpha = Math.max(currentAlpha, score);
    }
    return currentAlpha;
  } else {
    if (standPat <= alpha) return alpha;
    let currentBeta = Math.min(beta, standPat);

    const captureMoves = sortMoves(chess.moves({ verbose: true }).filter(m => m.captured || m.promotion));
    for (const move of captureMoves) {
      chess.move(move);
      const score = quiescence(chess, alpha, currentBeta, maxDepth - 1);
      chess.undo();

      if (score <= alpha) return alpha;
      currentBeta = Math.min(currentBeta, score);
    }
    return currentBeta;
  }
}

/**
 * Minimax with Alpha-Beta Pruning
 */
export function minimaxAlphaBeta(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; bestMove?: Move } {
  if (depth <= 0 || chess.isGameOver()) {
    return { score: quiescence(chess, alpha, beta, 2) };
  }

  const rawMoves = chess.moves({ verbose: true });
  if (rawMoves.length === 0) {
    return { score: evaluateBoard(chess) };
  }

  const moves = sortMoves(rawMoves);
  let bestMove: Move = moves[0];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const result = minimaxAlphaBeta(chess, depth - 1, alpha, beta, false);
      chess.undo();

      if (result.score > maxEval) {
        maxEval = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) {
        break; // Beta cut-off
      }
    }
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const result = minimaxAlphaBeta(chess, depth - 1, alpha, beta, true);
      chess.undo();

      if (result.score < minEval) {
        minEval = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, result.score);
      if (beta <= alpha) {
        break; // Alpha cut-off
      }
    }
    return { score: minEval, bestMove };
  }
}

/**
 * Select the best move tailored to the selected Bot Elo
 */
export async function getBotMove(
  chess: Chess,
  bot: BotProfile
): Promise<Move | null> {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  // Add realistic thinking delay (250ms - 600ms)
  await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 250) + 250));

  // Check if bot triggers a deliberate blunder / random mistake based on its Elo blunderRate
  if (Math.random() < bot.blunderRate && legalMoves.length > 1) {
    // Pick a random legal move or second/third worst
    const nonOptimal = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return nonOptimal;
  }

  const isWhite = chess.turn() === 'w';
  const scoredMoves: { move: Move; score: number }[] = [];

  for (const move of legalMoves) {
    chess.move(move);
    let evalResult = minimaxAlphaBeta(
      chess,
      bot.depth - 1,
      -Infinity,
      Infinity,
      !isWhite
    );
    chess.undo();

    // Add noise based on Elo
    const noiseOffset = bot.noise > 0 ? (Math.random() * 2 - 1) * bot.noise : 0;
    const finalScore = evalResult.score + noiseOffset;

    scoredMoves.push({ move, score: finalScore });
  }

  // Sort based on turn: White wants highest score, Black wants lowest score
  scoredMoves.sort((a, b) => isWhite ? b.score - a.score : a.score - b.score);

  // For lower Elo bots, pick among top 2-3 moves
  if (bot.elo <= 800 && scoredMoves.length > 2 && Math.random() < 0.4) {
    return scoredMoves[Math.floor(Math.random() * Math.min(3, scoredMoves.length))].move;
  }

  return scoredMoves[0].move;
}
