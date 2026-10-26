import React, { useEffect, useRef } from 'react';
import { RotateCcw, Download } from 'lucide-react';
import { soundService } from '../services/audioService';

interface VictoryScreenProps {
  totalDistanceRunMi: number;
  rerunCount: number;
  totalTimeSeconds: number;
  onPlayAgain: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  totalDistanceRunMi,
  rerunCount,
  totalTimeSeconds,
  onPlayAgain,
}) => {
  const hasPlayedAudioRef = useRef<boolean>(false);

  // Synchronize audio playback with the exact moment the quote appears
  useEffect(() => {
    if (!hasPlayedAudioRef.current) {
      hasPlayedAudioRef.current = true;
      try {
        soundService.playVictoryMotivational();
      } catch (err) {
        console.warn('Unable to play victory audio:', err);
      }
    }
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-slate-950 select-none overflow-hidden animate-in fade-in duration-500">
      {/* Subtle dramatic lighting & ambient atmospheric spotlight */}
      <div className="absolute inset-0 bg-radial from-amber-600/10 via-slate-950/90 to-slate-950 pointer-events-none" />
      <div className="absolute w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Dramatic Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-auto">
        {/* Subtle Milestone Completion Tag */}
        <div className="mb-4 text-xs sm:text-sm font-mono tracking-[0.35em] uppercase text-amber-400/90 font-bold animate-fade-in-delayed">
          CHALLENGE COMPLETE · 5.2 MILES
        </div>

        {/* The Exact Dramatic Quote with Fade-In + Slight Scale-Up Animation */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white uppercase drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] animate-stay-hard leading-none">
          “STAY HARD.”
        </h1>

        {/* Motivational Subtext */}
        <p className="mt-6 text-sm sm:text-base text-slate-400 font-medium max-w-md mx-auto leading-relaxed animate-fade-in-delayed">
          Build healthy habits. Stay consistent. Keep moving forward.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-delayed">
          <button
            type="button"
            onClick={onPlayAgain}
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/20 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-200" />
            <span>PLAY AGAIN</span>
          </button>

          <a
            href="/get-up-and-get-strong.html"
            download="get-up-and-get-strong.html"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-sm tracking-wide transition-all cursor-pointer"
            title="Tải toàn bộ game thành 1 file HTML duy nhất"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>TẢI FILE HTML</span>
          </a>
        </div>
      </div>
    </div>
  );
};
