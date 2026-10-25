import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { Header } from './components/Header';
import { ChessBoard } from './components/ChessBoard';
import { EvalBar } from './components/EvalBar';
import { MoveHistoryLog } from './components/MoveHistoryLog';
import { BotSelectorModal } from './components/BotSelectorModal';
import { AnalysisPanel } from './components/AnalysisPanel';
import { LearnHub } from './components/LearnHub';
import { OpeningInfo } from './components/OpeningExplorer';
import { CustomFenModal } from './components/CustomFenModal';
import { GameHistoryView } from './components/GameHistoryView';
import { BOT_PROFILES, getBotMove } from './engine/botEngine';
import { evaluateBoard, PIECE_VALUES } from './engine/evaluation';
import { analyzeGame } from './engine/gameAnalyzer';
import { soundFx } from './utils/audio';
import type {
  GameMode,
  BotProfile,
  BoardTheme,
  CapturedPieces,
  GameAnalysisResult,
  MoveClassification,
  SavedGame,
} from './types/chess';
import {
  RotateCcw,
  Sparkles,
  User,
  Clock,
  Swords,
  Trophy,
  Flag,
  ArrowRight,
  Shield,
  Layers,
  History,
  CheckCircle2,
} from 'lucide-react';

interface GameMoveRecord {
  san: string;
  from: Square;
  to: Square;
  promotion?: string;
  piece: string;
  captured?: string;
  fen: string;
  classification?: MoveClassification;
}

export default function App() {
  // Navigation & Mode: 'play' | 'analysis' | 'history' | 'learn'
  const [currentMode, setCurrentMode] = useState<GameMode>('play');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('tournament');
  const [boardOrientation, setBoardOrientation] = useState<Color>('w');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFenModalOpen, setIsFenModalOpen] = useState<boolean>(false);

  // Bot & Game Setup
  const [isBotModalOpen, setIsBotModalOpen] = useState<boolean>(false);
  const [currentBot, setCurrentBot] = useState<BotProfile>(BOT_PROFILES[2]); // Club Dennis 1200
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [chessInstance, setChessInstance] = useState<Chess>(() => new Chess());

  // Clocks
  const [timeControlSeconds, setTimeControlSeconds] = useState<number | null>(null);
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);

  // Moves & Navigation
  const [moveHistory, setMoveHistory] = useState<GameMoveRecord[]>([]);
  const [navigatedIndex, setNavigatedIndex] = useState<number>(-1);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);

  // Game Status
  const [gameOverResult, setGameOverResult] = useState<string | null>(null);

  // Real-time Evaluation & Analysis
  const [currentEvalCp, setCurrentEvalCp] = useState<number>(0);
  const [gameAnalysis, setGameAnalysis] = useState<GameAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [isShowingBestMove, setIsShowingBestMove] = useState<boolean>(true);

  // Saved Games Archive: Strictly user's real games only (no mock or made-up games)
  const [savedGames, setSavedGames] = useState<SavedGame[]>(() => {
    try {
      const stored = localStorage.getItem('chessmastery_game_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Purge any pre-seeded mock games (like Morphy Opera 'sg-opera')
          const clean = parsed.filter(
            (g) => g && g.id !== 'sg-opera' && !String(g.id).startsWith('mock-')
          );
          if (clean.length !== parsed.length) {
            localStorage.setItem('chessmastery_game_history', JSON.stringify(clean));
          }
          return clean;
        }
      }
    } catch {
      // Fallback to empty history
    }
    return [];
  });

  // Keep board orientation synced with player color on new games unless manually flipped
  useEffect(() => {
    setBoardOrientation(playerColor);
  }, [playerColor]);

  // Compute live board position for current view
  // If user clicked backward in history, show that past FEN on the board
  const activeChess = React.useMemo(() => {
    if (navigatedIndex === -1) {
      if (moveHistory.length === 0) return chessInstance;
      // Starting position before move 1
      return new Chess();
    }
    if (navigatedIndex >= 0 && navigatedIndex < moveHistory.length) {
      const pastFen = moveHistory[navigatedIndex].fen;
      return new Chess(pastFen);
    }
    return chessInstance;
  }, [navigatedIndex, moveHistory, chessInstance]);

  // Compute captured pieces from current board
  const capturedPieces = React.useMemo<CapturedPieces>(() => {
    const fullSet: Record<Color, Record<PieceSymbol, number>> = {
      w: { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 },
      b: { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 },
    };

    const currentCounts: Record<Color, Record<PieceSymbol, number>> = {
      w: { p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 },
      b: { p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 },
    };

    const board = activeChess.board();
    for (const row of board) {
      for (const sq of row) {
        if (sq) {
          currentCounts[sq.color][sq.type]++;
        }
      }
    }

    const capturedW: PieceSymbol[] = [];
    const capturedB: PieceSymbol[] = [];
    let whiteMaterial = 0;
    let blackMaterial = 0;

    (['p', 'n', 'b', 'r', 'q'] as PieceSymbol[]).forEach((pType) => {
      const lostW = Math.max(0, fullSet.w[pType] - currentCounts.w[pType]);
      for (let i = 0; i < lostW; i++) capturedW.push(pType);

      const lostB = Math.max(0, fullSet.b[pType] - currentCounts.b[pType]);
      for (let i = 0; i < lostB; i++) capturedB.push(pType);

      whiteMaterial += currentCounts.w[pType] * PIECE_VALUES[pType];
      blackMaterial += currentCounts.b[pType] * PIECE_VALUES[pType];
    });

    const materialDifference = Math.round((whiteMaterial - blackMaterial) / 100);

    return {
      w: capturedW,
      b: capturedB,
      materialDifference,
    };
  }, [activeChess]);

  // Update evaluation whenever active position changes
  useEffect(() => {
    const cp = evaluateBoard(activeChess);
    setCurrentEvalCp(cp);
  }, [activeChess]);

  // Clock interval
  useEffect(() => {
    if (!isClockRunning || timeControlSeconds === null || gameOverResult) return;

    const interval = setInterval(() => {
      const turn = chessInstance.turn();
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setGameOverResult('Black wins on time!');
            setIsClockRunning(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setGameOverResult('White wins on time!');
            setIsClockRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isClockRunning, timeControlSeconds, chessInstance, gameOverResult]);

  // Sound mute sync
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  };

  // Check king square in check
  const kingSquareInCheck = React.useMemo<Square | null>(() => {
    if (!activeChess.inCheck()) return null;
    const turn = activeChess.turn();
    const board = activeChess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return (String.fromCharCode('a'.charCodeAt(0) + c) + (8 - r)) as Square;
        }
      }
    }
    return null;
  }, [activeChess]);

  // Save Game Record to User's History (Only actual games played)
  const saveGameRecord = (
    resultReason: string,
    outcome: 'win' | 'loss' | 'draw',
    historySnapshot: GameMoveRecord[]
  ) => {
    if (historySnapshot.length === 0) return;
    const newGame: SavedGame = {
      id: `game-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      opponentName: currentBot.name,
      opponentElo: currentBot.elo,
      playerColor,
      result: outcome,
      resultReason,
      totalMoves: historySnapshot.length,
      pgn: chessInstance.pgn(),
      fen: chessInstance.fen(),
      moveHistory: [...historySnapshot],
    };

    setSavedGames((prev) => {
      const updated = [newGame, ...prev];
      try {
        localStorage.setItem('chessmastery_game_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Check Game Termination
  const checkGameTermination = (
    c: Chess,
    currentMoves: GameMoveRecord[]
  ) => {
    if (c.isGameOver()) {
      setIsClockRunning(false);
      let outcome: 'win' | 'loss' | 'draw' = 'draw';
      let reason = 'Game Drawn';

      if (c.isCheckmate()) {
        const winner = c.turn() === 'w' ? 'Black' : 'White';
        reason = `Checkmate! ${winner} wins.`;
        outcome =
          (winner === 'White' && playerColor === 'w') ||
          (winner === 'Black' && playerColor === 'b')
            ? 'win'
            : 'loss';
        setGameOverResult(reason);
        soundFx.playCheckmate();
      } else if (c.isDraw()) {
        if (c.isStalemate()) {
          reason = 'Draw by Stalemate!';
        } else if (c.isThreefoldRepetition()) {
          reason = 'Draw by Threefold Repetition!';
        } else if (c.isInsufficientMaterial()) {
          reason = 'Draw by Insufficient Material!';
        } else {
          reason = 'Draw (50-move rule)!';
        }
        outcome = 'draw';
        setGameOverResult(reason);
      }

      saveGameRecord(reason, outcome, currentMoves);
    }
  };

  // Bot turn triggering
  const triggerBotMove = useCallback(
    async (currentChess: Chess, currentHistory: GameMoveRecord[]) => {
      if (currentChess.isGameOver()) return;
      setIsBotThinking(true);

      try {
        const botMove = await getBotMove(currentChess, currentBot);
        if (botMove) {
          const moveRes = currentChess.move(botMove);
          if (moveRes) {
            if (moveRes.san === 'O-O' || moveRes.san === 'O-O-O') {
              soundFx.playCastle();
            } else if (moveRes.captured) {
              soundFx.playCapture();
            } else {
              soundFx.playMove();
            }

            if (currentChess.inCheck()) {
              if (currentChess.isCheckmate()) {
                soundFx.playCheckmate();
              } else {
                soundFx.playCheck();
              }
            }

            const newRecord: GameMoveRecord = {
              san: moveRes.san,
              from: moveRes.from,
              to: moveRes.to,
              promotion: moveRes.promotion,
              piece: moveRes.piece,
              captured: moveRes.captured,
              fen: currentChess.fen(),
            };

            const updated = [...currentHistory, newRecord];
            setMoveHistory(updated);
            setNavigatedIndex(updated.length - 1);
            setLastMove({ from: moveRes.from, to: moveRes.to });
            const nextChess = new Chess(currentChess.fen());
            setChessInstance(nextChess);

            // Check game over
            checkGameTermination(nextChess, updated);
          }
        }
      } catch (e) {
        console.error('Bot move failed', e);
      } finally {
        setIsBotThinking(false);
      }
    },
    [currentBot, playerColor]
  );

  // Player Move Handler
  const handlePlayerMove = (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
    if (gameOverResult || isBotThinking) return false;

    // Must be playing on latest position
    if (navigatedIndex !== moveHistory.length - 1 && moveHistory.length > 0) {
      setNavigatedIndex(moveHistory.length - 1);
    }

    // Check player turn
    if (chessInstance.turn() !== playerColor) return false;

    try {
      const moveRes = chessInstance.move({
        from,
        to,
        promotion: promotion || 'q',
      });

      if (!moveRes) return false;

      if (!isClockRunning && timeControlSeconds !== null) {
        setIsClockRunning(true);
      }

      if (moveRes.san === 'O-O' || moveRes.san === 'O-O-O') {
        soundFx.playCastle();
      } else if (moveRes.captured) {
        soundFx.playCapture();
      } else {
        soundFx.playMove();
      }

      if (chessInstance.inCheck()) {
        if (chessInstance.isCheckmate()) {
          soundFx.playCheckmate();
        } else {
          soundFx.playCheck();
        }
      }

      const newRecord: GameMoveRecord = {
        san: moveRes.san,
        from: moveRes.from,
        to: moveRes.to,
        promotion: moveRes.promotion,
        piece: moveRes.piece,
        captured: moveRes.captured,
        fen: chessInstance.fen(),
      };

      const updatedHistory = [...moveHistory, newRecord];
      setMoveHistory(updatedHistory);
      setNavigatedIndex(updatedHistory.length - 1);
      setLastMove({ from, to });
      const nextChess = new Chess(chessInstance.fen());
      setChessInstance(nextChess);

      if (nextChess.isGameOver()) {
        checkGameTermination(nextChess, updatedHistory);
      } else {
        // Trigger bot turn
        setTimeout(() => {
          triggerBotMove(nextChess, updatedHistory);
        }, 150);
      }

      return true;
    } catch {
      return false;
    }
  };

  // Reset or Start New Game
  const handleStartGame = (bot: BotProfile, pColor: Color, timeSeconds: number | null) => {
    setCurrentBot(bot);
    setPlayerColor(pColor);
    setTimeControlSeconds(timeSeconds);

    if (timeSeconds) {
      setWhiteTime(timeSeconds);
      setBlackTime(timeSeconds);
      setIsClockRunning(false);
    }

    const fresh = new Chess();
    setChessInstance(fresh);
    setMoveHistory([]);
    setNavigatedIndex(-1);
    setLastMove(null);
    setGameOverResult(null);
    setGameAnalysis(null);
    setIsShowingBestMove(false);
    setCurrentMode('play');

    // If player chose Black, bot moves first!
    if (pColor === 'b') {
      setTimeout(() => {
        triggerBotMove(fresh, []);
      }, 500);
    }
  };

  // Resign Game
  const handleResign = () => {
    if (moveHistory.length === 0 || gameOverResult) return;
    const winner = playerColor === 'w' ? 'Black' : 'White';
    const reason = `${winner} wins by resignation!`;
    setGameOverResult(reason);
    setIsClockRunning(false);
    soundFx.playCheckmate();
    saveGameRecord(reason, 'loss', moveHistory);
  };

  // Run Post-Game Engine Review (Chess.com style)
  const handleRunAnalysis = useCallback(() => {
    if (moveHistory.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    setTimeout(() => {
      const result = analyzeGame(moveHistory, (prog) => {
        setAnalysisProgress(prog);
      });

      // Augment move history with classifications
      const updatedHistory = moveHistory.map((m, idx) => ({
        ...m,
        classification: result.moves[idx]?.classification,
      }));

      setMoveHistory(updatedHistory);
      setGameAnalysis(result);
      setIsAnalyzing(false);
      setCurrentMode('analysis');
      setNavigatedIndex(0);
    }, 100);
  }, [moveHistory]);

  // Load an Opening from Opening Explorer
  const handleLoadOpening = (op: OpeningInfo) => {
    const openingChess = new Chess();
    const records: GameMoveRecord[] = [];

    for (const san of op.moves) {
      const res = openingChess.move(san);
      if (res) {
        records.push({
          san: res.san,
          from: res.from,
          to: res.to,
          piece: res.piece,
          captured: res.captured,
          fen: openingChess.fen(),
        });
      }
    }

    setChessInstance(openingChess);
    setMoveHistory(records);
    setNavigatedIndex(records.length - 1);
    setLastMove(
      records.length > 0
        ? { from: records[records.length - 1].from, to: records[records.length - 1].to }
        : null
    );
    setGameOverResult(null);
    setGameAnalysis(null);
    setCurrentMode('play');
    setPlayerColor(openingChess.turn() === 'w' ? 'w' : 'b');
  };

  // Practice vs Bot from a custom position
  const handlePracticeVsBot = (fen: string) => {
    try {
      const testChess = new Chess(fen);
      setChessInstance(testChess);
      setMoveHistory([]);
      setNavigatedIndex(-1);
      setLastMove(null);
      setGameOverResult(null);
      setGameAnalysis(null);
      setPlayerColor(testChess.turn());
      setCurrentMode('play');
    } catch (e) {
      console.error('Invalid FEN for bot practice', e);
    }
  };

  // Analyze Opening in depth
  const handleAnalyzeOpening = (op: OpeningInfo) => {
    handleLoadOpening(op);
    setTimeout(() => {
      handleRunAnalysis();
    }, 200);
  };

  // Load Custom FEN from Modal
  const handleLoadFen = (fen: string, playMode: 'play' | 'analysis') => {
    try {
      const testChess = new Chess(fen);
      setChessInstance(testChess);
      setMoveHistory([]);
      setNavigatedIndex(-1);
      setLastMove(null);
      setGameOverResult(null);
      setGameAnalysis(null);
      setPlayerColor(testChess.turn());
      setCurrentMode(playMode);
    } catch (e) {
      console.error('Failed to load custom FEN', e);
    }
  };

  // Format Clock seconds (e.g. 05:24)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Review Game from User's History
  const handleReviewGame = (game: SavedGame) => {
    const moves = game.moveHistory.map((m) => ({
      san: m.san,
      from: m.from,
      to: m.to,
      piece: m.piece,
      captured: m.captured,
      fen: m.fen,
    }));
    setMoveHistory(moves);
    setChessInstance(new Chess(game.fen));
    setGameOverResult(game.resultReason);
    setCurrentMode('analysis');
    setIsShowingBestMove(true);

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeGame(moves, () => {});
      const updatedHistory = moves.map((m, idx) => ({
        ...m,
        classification: result.moves[idx]?.classification,
      }));
      setMoveHistory(updatedHistory);
      setGameAnalysis(result);
      setIsAnalyzing(false);
      setNavigatedIndex(0);
    }, 100);
  };

  const handlePlayRematch = (opponentName: string, opponentElo: number) => {
    const matched = BOT_PROFILES.find((b) => b.name === opponentName) || currentBot;
    handleStartGame(matched, playerColor, timeControlSeconds);
  };

  const handleDeleteGame = (id: string) => {
    setSavedGames((prev) => {
      const filtered = prev.filter((g) => g.id !== id);
      try {
        localStorage.setItem('chessmastery_game_history', JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
  };

  const handleClearHistory = () => {
    setSavedGames([]);
    try {
      localStorage.removeItem('chessmastery_game_history');
    } catch {}
  };

  // Keyboard navigation: Left Arrow (prev move), Right Arrow (next move)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentMode === 'learn' || currentMode === 'tutorial') return;
      if (e.key === 'ArrowLeft') {
        setNavigatedIndex((prev) => Math.max(-1, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setNavigatedIndex((prev) => Math.min(moveHistory.length - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHistory.length, currentMode]);

  // Active analysis move in Game Review mode
  const activeAnalysisMove = React.useMemo(() => {
    if (
      currentMode === 'analysis' &&
      gameAnalysis &&
      navigatedIndex >= 0 &&
      navigatedIndex < gameAnalysis.moves.length
    ) {
      return gameAnalysis.moves[navigatedIndex];
    }
    return null;
  }, [currentMode, gameAnalysis, navigatedIndex]);

  // Chess.com-style Played Move Arrow (Red = blunder, Magenta = miss, Orange = mistake, Yellow = inaccuracy)
  const playedMoveArrow = React.useMemo(() => {
    if (activeAnalysisMove) {
      return {
        from: activeAnalysisMove.from,
        to: activeAnalysisMove.to,
        classification: activeAnalysisMove.classification,
      };
    }
    return null;
  }, [activeAnalysisMove]);

  // Chess.com-style Move Classification Badge on target square
  const moveBadge = React.useMemo(() => {
    if (activeAnalysisMove) {
      return {
        square: activeAnalysisMove.to,
        classification: activeAnalysisMove.classification,
      };
    }
    return null;
  }, [activeAnalysisMove]);

  // Chess.com-style Best Move Recommendation Arrow (Bright Green: "Where you could've played")
  const bestMoveHighlight = React.useMemo(() => {
    if (isShowingBestMove && activeAnalysisMove) {
      return {
        from: activeAnalysisMove.bestMoveFrom,
        to: activeAnalysisMove.bestMoveTo,
      };
    }
    return null;
  }, [isShowingBestMove, activeAnalysisMove]);

  // Handle header mode selection with smart default for Game Review
  const handleSelectMode = (mode: GameMode) => {
    if (mode === 'analysis') {
      if (!gameAnalysis && moveHistory.length > 0) {
        handleRunAnalysis();
        return;
      }
    }
    setCurrentMode(mode);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Streamlined Top Bar */}
      <Header
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        onOpenNewGameModal={() => setIsBotModalOpen(true)}
        onOpenFenModal={() => setIsFenModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        savedGamesCount={savedGames.length}
      />

      {/* Main Layout Area */}
      <main className="flex-1 w-full max-w-[1580px] mx-auto px-4 lg:px-8 py-5">
        {/* VIEW 1: LEARN & PRACTICE (Unified Hub) */}
        {(currentMode === 'learn' ||
          currentMode === 'tutorial' ||
          currentMode === 'openings' ||
          currentMode === 'puzzles') && (
          <LearnHub
            initialTab={
              currentMode === 'openings'
                ? 'openings'
                : currentMode === 'puzzles'
                ? 'puzzles'
                : 'lessons'
            }
            onBackToPlay={() => setCurrentMode('play')}
            onPracticeVsBot={handlePracticeVsBot}
            onLoadOpening={handleLoadOpening}
            onAnalyzeOpening={handleAnalyzeOpening}
          />
        )}

        {/* VIEW 2: GAME HISTORY ARCHIVE (User's actual games only) */}
        {currentMode === 'history' && (
          <GameHistoryView
            games={savedGames}
            onReviewGame={handleReviewGame}
            onPlayRematch={handlePlayRematch}
            onDeleteGame={handleDeleteGame}
            onClearHistory={handleClearHistory}
            onStartNewGame={() => setIsBotModalOpen(true)}
          />
        )}

        {/* VIEW 3: PLAY BOT & GAME REVIEW */}
        {(currentMode === 'play' || currentMode === 'analysis') && (
          <>
            {/* If in Game Review mode with no game available */}
            {currentMode === 'analysis' && !gameAnalysis && moveHistory.length === 0 ? (
              <div className="max-w-[720px] mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">No Active Game to Review</h2>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Play a match against any AI bot, or select an archived match from your Game History to get Chess.com-style accuracy, coach feedback, blunder badges, and tactical arrows.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setCurrentMode('play');
                      setIsBotModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Swords className="w-4 h-4" />
                    <span>Play vs Bot</span>
                  </button>
                  <button
                    onClick={() => setCurrentMode('history')}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <History className="w-4 h-4" />
                    <span>View Game History</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Center Column: Chessboard & Player Cards (7 cols) */}
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
                  {/* Opponent Card (Top) */}
                  <div className="w-full max-w-[700px] xl:max-w-[760px] mb-2.5 flex items-center justify-between bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl shadow-md">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentBot.avatarUrl}
                        alt={currentBot.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-800 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{currentBot.name}</span>
                          <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.2 rounded">
                            {currentBot.elo} Elo
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {isBotThinking ? (
                            <span className="text-amber-400 animate-pulse font-medium">
                              Thinking move...
                            </span>
                          ) : (
                            currentBot.title
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Opponent Clock */}
                    {timeControlSeconds !== null && (
                      <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-sm font-bold tabular-nums text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {playerColor === 'w' ? formatTime(blackTime) : formatTime(whiteTime)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Chessboard + Eval Bar Container */}
                  <div className="flex items-stretch gap-3 w-full max-w-[700px] xl:max-w-[760px] justify-center">
                    <EvalBar centipawns={currentEvalCp} orientation={boardOrientation} />
                    <div className="flex-1">
                      <ChessBoard
                        chess={activeChess}
                        orientation={boardOrientation}
                        theme={boardTheme}
                        interactive={currentMode === 'play' && !gameOverResult && !isBotThinking}
                        onMove={handlePlayerMove}
                        lastMove={
                          activeAnalysisMove
                            ? { from: activeAnalysisMove.from, to: activeAnalysisMove.to }
                            : lastMove
                        }
                        bestMoveHighlight={bestMoveHighlight}
                        playedMoveArrow={playedMoveArrow}
                        moveBadge={moveBadge}
                        isCheck={activeChess.inCheck()}
                        kingSquare={kingSquareInCheck}
                      />
                    </div>
                  </div>

                  {/* Player Card (Bottom) */}
                  <div className="w-full max-w-[700px] xl:max-w-[760px] mt-2.5 flex items-center justify-between bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                        <User className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">You</span>
                          <span className="text-[11px] font-mono text-slate-400">
                            ({playerColor === 'w' ? 'White' : 'Black'})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {chessInstance.turn() === playerColor && !gameOverResult
                            ? 'Your turn to move'
                            : 'Waiting for opponent'}
                        </span>
                      </div>
                    </div>

                    {/* Player Clock */}
                    {timeControlSeconds !== null && (
                      <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-sm font-bold tabular-nums text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {playerColor === 'w' ? formatTime(whiteTime) : formatTime(blackTime)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Game Over Banner */}
                  {gameOverResult && (
                    <div className="w-full max-w-[700px] xl:max-w-[760px] mt-3.5 p-4 bg-slate-900 border border-emerald-600/60 rounded-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                      <div>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-0.5">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span>{gameOverResult}</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Game saved to history. Analyze every move with the built-in coach or start a rematch.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={handleRunAnalysis}
                          disabled={isAnalyzing}
                          className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isAnalyzing ? `Analyzing ${analysisProgress}%` : 'Review Game'}</span>
                        </button>
                        <button
                          onClick={() => setIsBotModalOpen(true)}
                          className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                        >
                          Rematch
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Board Controls Toolbar */}
                  <div className="w-full max-w-[700px] xl:max-w-[760px] mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
                    {/* Left: Theme Switcher */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 mr-1">Theme:</span>
                      {(['tournament', 'obsidian', 'walnut', 'royal', 'rosewood'] as BoardTheme[]).map(
                        (t) => (
                          <button
                            key={t}
                            onClick={() => setBoardTheme(t)}
                            className={`capitalize px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                              boardTheme === t
                                ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                                : 'hover:text-white'
                            }`}
                          >
                            {t}
                          </button>
                        )
                      )}
                    </div>

                    {/* Right: Flip Board & Review Action */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBoardOrientation(boardOrientation === 'w' ? 'b' : 'w')}
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                        title="Flip Board View"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Flip</span>
                      </button>

                      {moveHistory.length > 0 && currentMode === 'play' && (
                        <button
                          onClick={handleRunAnalysis}
                          disabled={isAnalyzing}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isAnalyzing ? `Analyzing (${analysisProgress}%)` : 'Run Game Review'}</span>
                        </button>
                      )}

                      {currentMode === 'analysis' && (
                        <button
                          onClick={() => setCurrentMode('play')}
                          className="text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer text-[11px]"
                        >
                          <span>Exit Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Move History Log or Built-in Game Review Engine (5 cols) */}
                <div className="lg:col-span-5 xl:col-span-4 h-[680px] xl:h-[740px] flex flex-col">
                  {currentMode === 'analysis' && gameAnalysis ? (
                    <AnalysisPanel
                      analysis={gameAnalysis}
                      selectedMoveIndex={Math.max(0, navigatedIndex)}
                      onSelectMove={(idx) => setNavigatedIndex(idx)}
                      onShowBestMoveToggle={() => setIsShowingBestMove(!isShowingBestMove)}
                      isShowingBestMove={isShowingBestMove}
                    />
                  ) : (
                    <MoveHistoryLog
                      moves={moveHistory}
                      currentMoveIndex={navigatedIndex}
                      onSelectMove={(idx) => setNavigatedIndex(idx)}
                      onReset={() => handleStartGame(currentBot, playerColor, timeControlSeconds)}
                      onResign={handleResign}
                      capturedPieces={capturedPieces}
                      fen={activeChess.fen()}
                      pgn={chessInstance.pgn()}
                      isGameOver={!!gameOverResult}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bot Selector & Difficulty Setup Modal */}
      <BotSelectorModal
        isOpen={isBotModalOpen}
        onClose={() => setIsBotModalOpen(false)}
        onStartGame={handleStartGame}
        currentBot={currentBot}
      />

      {/* Custom FEN Modal */}
      <CustomFenModal
        isOpen={isFenModalOpen}
        onClose={() => setIsFenModalOpen(false)}
        onLoadFen={handleLoadFen}
      />
    </div>
  );
}
