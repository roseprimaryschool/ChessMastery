import React, { useState } from 'react';
import { Color } from 'chess.js';
import { BOT_PROFILES } from '../engine/botEngine';
import type { BotProfile } from '../types/chess';
import { Bot, User, Clock, ShieldCheck, X } from 'lucide-react';

interface BotSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (bot: BotProfile, playerColor: Color, timeSeconds: number | null) => void;
  currentBot: BotProfile;
}

export const BotSelectorModal: React.FC<BotSelectorModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  currentBot,
}) => {
  const [selectedBot, setSelectedBot] = useState<BotProfile>(currentBot);
  const [selectedColor, setSelectedColor] = useState<Color | 'random'>('w');
  const [timeControl, setTimeControl] = useState<number | null>(null); // null = unlimited

  if (!isOpen) return null;

  const handleStart = () => {
    let finalColor: Color = 'w';
    if (selectedColor === 'random') {
      finalColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
      finalColor = selectedColor;
    }
    onStartGame(selectedBot, finalColor, timeControl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Challenge Chess Bot</h2>
            <p className="text-xs text-slate-400">Select bot Elo rating, color, and clock controls</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Bot Roster Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Choose Opponent Elo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BOT_PROFILES.map((bot) => {
                const isSelected = selectedBot.id === bot.id;
                return (
                  <div
                    key={bot.id}
                    onClick={() => setSelectedBot(bot)}
                    className={`relative p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={bot.avatarUrl}
                        alt={bot.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover border border-slate-700 bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-slate-100 truncate">{bot.name}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-400">
                          {bot.elo} ELO
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {bot.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Play As
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedColor('w')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium cursor-pointer transition-all ${
                  selectedColor === 'w'
                    ? 'bg-slate-100 text-slate-900 border-white shadow'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 shadow-inner" />
                White (First Move)
              </button>

              <button
                type="button"
                onClick={() => setSelectedColor('random')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium cursor-pointer transition-all ${
                  selectedColor === 'random'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Random Color
              </button>

              <button
                type="button"
                onClick={() => setSelectedColor('b')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium cursor-pointer transition-all ${
                  selectedColor === 'b'
                    ? 'bg-slate-950 text-white border-slate-600 shadow'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-600 shadow-inner" />
                Black (Second Move)
              </button>
            </div>
          </div>

          {/* Time Controls */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Clock Control
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Casual (No Timer)', value: null },
                { label: '10 Min Rapid', value: 600 },
                { label: '5 Min Blitz', value: 300 },
                { label: '3 Min Blitz', value: 180 },
              ].map((tc) => (
                <button
                  key={tc.label}
                  type="button"
                  onClick={() => setTimeControl(tc.value)}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    timeControl === tc.value
                      ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-semibold shadow-sm'
                      : 'bg-slate-850/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {tc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Selected:</span>
            <span className="font-semibold text-slate-200">{selectedBot.name}</span>
            <span className="font-mono text-emerald-400">({selectedBot.elo})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all shadow-md hover:shadow-emerald-900/30 cursor-pointer"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
