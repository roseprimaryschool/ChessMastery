import React, { useState } from 'react';
import type { SavedGame } from '../types/chess';
import {
  History,
  Trophy,
  Swords,
  Sparkles,
  Download,
  Copy,
  Trash2,
  Calendar,
  Check,
  ArrowRight,
  Shield,
  Award,
} from 'lucide-react';

interface GameHistoryViewProps {
  games: SavedGame[];
  onReviewGame: (game: SavedGame) => void;
  onPlayRematch: (opponentName: string, opponentElo: number) => void;
  onDeleteGame: (id: string) => void;
  onClearHistory: () => void;
  onStartNewGame?: () => void;
}

export const GameHistoryView: React.FC<GameHistoryViewProps> = ({
  games,
  onReviewGame,
  onPlayRematch,
  onDeleteGame,
  onClearHistory,
  onStartNewGame,
}) => {
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const winsCount = games.filter((g) => g.result === 'win').length;
  const lossesCount = games.filter((g) => g.result === 'loss').length;
  const drawsCount = games.filter((g) => g.result === 'draw').length;
  const winRate = games.length > 0 ? Math.round((winsCount / games.length) * 100) : 0;

  const filteredGames = games.filter((g) => {
    if (filter === 'all') return true;
    return g.result === filter;
  });

  const handleCopyPgn = (id: string, pgn: string) => {
    navigator.clipboard.writeText(pgn);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadPgn = (game: SavedGame) => {
    const blob = new Blob([game.pgn], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chessmastery_${game.opponentName.toLowerCase().replace(/\s+/g, '_')}_${game.id}.pgn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1240px] mx-auto py-2 space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Your Game History</h1>
              <p className="text-xs text-slate-400">
                Personal archive of completed matches. Every game you play is stored here for review.
              </p>
            </div>
          </div>
        </div>

        {/* Aggregate Stats */}
        {games.length > 0 ? (
          <div className="flex items-center gap-6 bg-slate-950/70 border border-slate-800/80 px-5 py-3 rounded-xl">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total</span>
              <span className="text-base font-bold text-white font-mono">{games.length}</span>
            </div>
            <div className="w-px h-7 bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Wins</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{winsCount}</span>
            </div>
            <div className="w-px h-7 bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">Losses</span>
              <span className="text-base font-bold text-rose-400 font-mono">{lossesCount}</span>
            </div>
            <div className="w-px h-7 bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Draws</span>
              <span className="text-base font-bold text-amber-400 font-mono">{drawsCount}</span>
            </div>
            <div className="w-px h-7 bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Win %</span>
              <span className="text-base font-bold text-emerald-300 font-mono">{winRate}%</span>
            </div>
          </div>
        ) : (
          onStartNewGame && (
            <button
              onClick={onStartNewGame}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-auto"
            >
              <Swords className="w-4 h-4" />
              <span>Start a Game</span>
            </button>
          )
        )}
      </div>

      {/* Filter Segmented Control & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Games ({games.length})
          </button>
          <button
            onClick={() => setFilter('win')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'win'
                ? 'bg-slate-800 text-emerald-400 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wins ({winsCount})
          </button>
          <button
            onClick={() => setFilter('loss')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'loss'
                ? 'bg-slate-800 text-rose-400 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Losses ({lossesCount})
          </button>
          <button
            onClick={() => setFilter('draw')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'draw'
                ? 'bg-slate-800 text-amber-400 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Draws ({drawsCount})
          </button>
        </div>

        {games.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your game history?')) {
                onClearHistory();
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Game Cards or Clean Empty State */}
      {filteredGames.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-14 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mx-auto">
            <History className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-white mb-1.5">No Games Recorded Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Play a game against any AI bot or opponent. Once checkmate, stalemate, draw, or resignation occurs, your match will appear here for full move-by-move game review.
            </p>
            {onStartNewGame && (
              <button
                onClick={onStartNewGame}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>Play Your First Game</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGames.map((game) => {
            const isWin = game.result === 'win';
            const isLoss = game.result === 'loss';

            return (
              <div
                key={game.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl shadow-lg transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Top Row: Result Badge & Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                        isWin
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : isLoss
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      }`}
                    >
                      {game.result}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {game.date}
                    </span>
                  </div>

                  {/* Opponent Info & Outcome Reason */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-base text-white">
                        vs. {game.opponentName}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {game.opponentElo} Elo · Played as {game.playerColor === 'w' ? 'White' : 'Black'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-semibold text-slate-200 block">
                        {game.totalMoves} moves
                      </span>
                      <span className="text-[11px] text-slate-400 max-w-[160px] truncate block" title={game.resultReason}>
                        {game.resultReason}
                      </span>
                    </div>
                  </div>

                  {/* Accuracy Bar if evaluated */}
                  {(game.accuracyWhite !== undefined || game.accuracyBlack !== undefined) && (
                    <div className="mt-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        Accuracy:
                      </span>
                      <div className="flex items-center gap-3 font-mono font-semibold">
                        <span className="text-slate-200">W: {game.accuracyWhite || 0}%</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-200">B: {game.accuracyBlack || 0}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Strip */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyPgn(game.id, game.pgn)}
                      title="Copy PGN text to clipboard"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedId === game.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadPgn(game)}
                      title="Download PGN file"
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGame(game.id)}
                      title="Delete game from archive"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPlayRematch(game.opponentName, game.opponentElo)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Swords className="w-3.5 h-3.5 text-slate-400" />
                      <span>Rematch</span>
                    </button>

                    <button
                      onClick={() => onReviewGame(game)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Review Game</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
