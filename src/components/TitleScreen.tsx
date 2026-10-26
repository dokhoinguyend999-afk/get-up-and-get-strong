import React from 'react';
import { Play, Volume2, VolumeX, HelpCircle, Flame, ShieldAlert, Award, Download } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenHowToPlay,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden select-none">
      {/* Background Cinematic Energy Gradient */}
      <div className="absolute inset-0 bg-radial from-amber-600/15 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* Decorative Running Course Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <span className="font-extrabold tracking-widest text-xs uppercase text-slate-400">
            FITNESS RUNNING CHALLENGE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
          <button
            type="button"
            onClick={onOpenHowToPlay}
            title="How to Play"
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Hero Section */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center my-auto py-6">
        {/* Athletic Badge Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4 tracking-wide uppercase">
          <Award className="w-3.5 h-3.5" />
          5 Checkpoint Milestones · Stay Hard Discipline
        </div>

        {/* Game Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-amber-400 tracking-tight leading-none mb-3 drop-shadow-md">
          GET UP AND GET STRONG!
        </h1>

        <p className="text-base sm:text-xl font-medium text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
          Run 5.2 continuous miles alongside coach <strong className="text-amber-400 font-bold">David Goggins</strong>. Answer healthy lifestyle questions at each checkpoint—or rerun the miles!
        </p>

        {/* Start Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            type="button"
            onClick={onStartGame}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg tracking-wide uppercase shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
            <span>START CHALLENGE</span>
          </button>

          <button
            type="button"
            onClick={onOpenHowToPlay}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-sm tracking-wide transition-all cursor-pointer"
          >
            <span>RULES &amp; COURSE</span>
          </button>

          <a
            href="/get-up-and-get-strong.html"
            download="get-up-and-get-strong.html"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 hover:border-emerald-500 text-emerald-300 font-bold text-sm tracking-wide transition-all cursor-pointer"
            title="Tải toàn bộ game thành 1 file HTML duy nhất chạy offline"
          >
            <Download className="w-5 h-5 text-emerald-400" />
            <span>TẢI FILE HTML</span>
          </a>
        </div>

        {/* Goggins' Uncompromising Rule Notice */}
        <div className="mt-8 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Goggins' Checkpoint Rule:</strong> A wrong answer sends both runners back to the segment's starting point to rerun it!
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-900 pt-4">
        <div>
          <span>Course: Greenway · Stadium · Mountain Trail · Fitness Arena · Summit</span>
        </div>
        <div>
          <span>"The only person you are competing against is yourself."</span>
        </div>
      </div>
    </div>
  );
};
