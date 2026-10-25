import React from 'react';
import type { Color } from 'chess.js';
import { formatEvalScore } from '../engine/evaluation';

interface EvalBarProps {
  centipawns: number;
  orientation?: Color;
}

export const EvalBar: React.FC<EvalBarProps> = ({ centipawns, orientation = 'w' }) => {
  // Convert centipawns to percentage (0% to 100%)
  // 50% is equal (0.00). Max cap at +1000cp (+10) -> 95%, -1000cp (-10) -> 5%
  let whitePercent = 50;

  if (centipawns > 90000) {
    whitePercent = 98;
  } else if (centipawns < -90000) {
    whitePercent = 2;
  } else {
    // Sigmoidal mapping for natural feel
    const clampedCp = Math.max(-1200, Math.min(1200, centipawns));
    const winRate = 50 + 50 * (2 / (1 + Math.exp(-0.004 * clampedCp)) - 1);
    whitePercent = Math.max(4, Math.min(96, winRate));
  }

  // If orientation is black, flip vertical representation so player's side is at bottom
  const fillBottomPercent = orientation === 'w' ? whitePercent : 100 - whitePercent;

  const scoreText = formatEvalScore(centipawns);

  return (
    <div className="relative w-7 sm:w-8 h-full max-h-[680px] xl:max-h-[740px] 2xl:max-h-[800px] rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 flex flex-col justify-between shadow-lg select-none">
      {/* Top Black Advantage Fill */}
      <div
        className="w-full bg-slate-800 transition-all duration-300 ease-out flex items-start justify-center pt-1.5"
        style={{ height: `${100 - fillBottomPercent}%` }}
      >
        {orientation === 'w' && centipawns < -50 && (
          <span className="text-[10px] font-mono font-bold text-slate-300 leading-none tabular-nums">
            {scoreText}
          </span>
        )}
        {orientation === 'b' && centipawns > 50 && (
          <span className="text-[10px] font-mono font-bold text-slate-300 leading-none tabular-nums">
            {scoreText}
          </span>
        )}
      </div>

      {/* Bottom White Advantage Fill */}
      <div
        className="w-full bg-slate-100 transition-all duration-300 ease-out flex items-end justify-center pb-1.5"
        style={{ height: `${fillBottomPercent}%` }}
      >
        {orientation === 'w' && centipawns >= -50 && (
          <span className="text-[10px] font-mono font-bold text-slate-900 leading-none tabular-nums">
            {scoreText}
          </span>
        )}
        {orientation === 'b' && centipawns <= 50 && (
          <span className="text-[10px] font-mono font-bold text-slate-900 leading-none tabular-nums">
            {scoreText}
          </span>
        )}
      </div>
    </div>
  );
};
