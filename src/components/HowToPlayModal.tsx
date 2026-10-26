import React from 'react';
import { X, Play, RotateCcw, CheckCircle, Award, Flame, Footprints } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">How To Play</h2>
              <p className="text-xs text-slate-400">“GET UP AND GET STRONG!” Rules &amp; Mechanics</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Mechanics List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <Play className="w-4 h-4 fill-current" />
              <span>1. Run Alongside Goggins</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Start at the starting line. Both you and David Goggins run continuously forward across 5 changing outdoor environments spanning 5.2 miles.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
              <Award className="w-4 h-4" />
              <span>2. Milestone Checkpoints</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              At each of the 5 numbered milestones, both runners visibly slow down and stop. A lifestyle quiz checkpoint appears over the course.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-600/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>3. Correct Answer Logic</span>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              Pick the right answer (A, B, C, or D). It turns green, the chime plays, and after a brief pause both runners resume running to the next milestone!
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-600/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-400 text-sm font-bold">
              <RotateCcw className="w-4 h-4" />
              <span>4. Goggins' Rerun Rule</span>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              Pick an incorrect answer and you pay the price! Both runners turn around, run backward to the start of that current segment, turn back around, and rerun it!
            </p>
          </div>
        </div>

        {/* 5 Course Milestones Overview */}
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col gap-2 text-xs">
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            The 5 Checkpoints &amp; Topics
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-slate-300 font-mono text-[11px] pt-1">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
              <span className="text-amber-400 block font-bold">M1 · 1.0 MI</span>
              <span>Habit Formation</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
              <span className="text-emerald-400 block font-bold">M2 · 2.0 MI</span>
              <span>Balanced Diet</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
              <span className="text-cyan-400 block font-bold">M3 · 3.0 MI</span>
              <span>Regular Exercise</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
              <span className="text-purple-400 block font-bold">M4 · 4.0 MI</span>
              <span>Vital Hydration</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
              <span className="text-pink-400 block font-bold">M5 · 5.0 MI</span>
              <span>Stress &amp; Mindset</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide uppercase transition-colors"
        >
          Got It · Let's Run!
        </button>
      </div>
    </div>
  );
};
