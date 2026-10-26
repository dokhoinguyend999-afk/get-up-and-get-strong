import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Zap,
  HelpCircle,
  Flag,
  Award,
  Download,
} from 'lucide-react';
import { MILESTONES } from '../data/quizData';

interface GameHUDProps {
  completedMilestones: number[]; // e.g. [1, 2]
  currentMilestoneIndex: number; // 0 to 4
  currentDistanceMi: number;
  totalDistanceMi: number;
  paceMinPerMi: string;
  gameStatus: 'running' | 'checkpoint' | 'returning' | 'finish_sprint' | 'paused';
  isMuted: boolean;
  volume: number;
  speedMultiplier: number;
  onToggleMute: () => void;
  onVolumeChange: (newVol: number) => void;
  onToggleSpeed: () => void;
  onTogglePause: () => void;
  onOpenHowToPlay: () => void;
  onRestartGame: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  completedMilestones,
  currentMilestoneIndex,
  currentDistanceMi,
  totalDistanceMi,
  paceMinPerMi,
  gameStatus,
  isMuted,
  volume,
  speedMultiplier,
  onToggleMute,
  onVolumeChange,
  onToggleSpeed,
  onTogglePause,
  onOpenHowToPlay,
  onRestartGame,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [showConfirmRestart, setShowConfirmRestart] = useState<boolean>(false);

  // Status badge styling
  const getStatusBadge = () => {
    switch (gameStatus) {
      case 'running':
        return {
          label: 'RUNNING TO CHECKPOINT',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'checkpoint':
        return {
          label: 'CHECKPOINT REACHED',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
        };
      case 'returning':
        return {
          label: 'RERUNNING SEGMENT (WRONG ANSWER)',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
        };
      case 'finish_sprint':
        return {
          label: 'FINAL SPRINT TO FINISH!',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse',
        };
      case 'paused':
        return {
          label: 'GAME PAUSED',
          color: 'bg-slate-700/50 text-slate-300 border-slate-600',
        };
      default:
        return { label: 'RUNNING', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4 flex flex-col gap-2">
      {/* Top Bar with Title, Progress, and Controls */}
      <div className="flex items-center justify-between gap-4 pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5 shadow-lg">
        {/* Brand & Active Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm sm:text-base tracking-wider uppercase">
              GET UP AND GET STRONG!
            </span>
          </div>

          <div
            className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${statusBadge.color}`}
          >
            {statusBadge.label}
          </div>
        </div>

        {/* Milestone Tracker (5 checkpoints + Finish Line) */}
        <div className="hidden lg:flex items-center gap-2">
          {MILESTONES.map((m, idx) => {
            const isCompleted = completedMilestones.includes(m.id);
            const isCurrent = currentMilestoneIndex === idx;

            let dotColor = 'bg-slate-800 text-slate-500 border-slate-700';
            if (isCompleted) {
              dotColor = 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold';
            } else if (isCurrent) {
              dotColor = 'bg-amber-500 text-slate-950 border-amber-400 font-bold ring-2 ring-amber-400/50';
            }

            return (
              <div key={m.id} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs border ${dotColor}`}
                  title={`${m.title}: ${m.subheading}`}
                >
                  {isCompleted ? '✓' : m.id}
                </div>
                {idx < MILESTONES.length - 1 && (
                  <div
                    className={`w-3 h-0.5 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            );
          })}

          <div className="w-3 h-0.5 bg-slate-700" />
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs border ${
              completedMilestones.length === 5
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/50'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title="Finish Line"
          >
            <Flag className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Live Metrics: Distance & Pace */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">DISTANCE</span>
            <span className="text-emerald-400 font-bold tabular-nums text-sm">
              {currentDistanceMi.toFixed(1)} / {totalDistanceMi.toFixed(1)} MI
            </span>
          </div>

          <div className="hidden sm:block text-right border-l border-slate-800 pl-4">
            <span className="text-slate-400 block text-[10px]">PACE</span>
            <span className="text-slate-200 font-bold tabular-nums text-sm">
              {paceMinPerMi}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Turbo Speed Button */}
          <button
            type="button"
            onClick={onToggleSpeed}
            title={speedMultiplier > 1 ? 'Turbo Speed 1.5x Active' : 'Normal Speed 1x'}
            className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
              speedMultiplier > 1
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline font-mono">{speedMultiplier}x</span>
          </button>

          {/* Sound Toggle & Volume Slider */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleMute}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowVolumeSlider((prev) => !prev);
              }}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className={`p-2 rounded-lg border transition-colors ${
                isMuted
                  ? 'bg-rose-950/50 border-rose-600/50 text-rose-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Quick volume popover on hover/click */}
            {showVolumeSlider && (
              <div className="absolute right-0 top-12 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl flex flex-col gap-2 z-50 w-36">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Volume</span>
                  <span className="font-mono text-white">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={onTogglePause}
            title={gameStatus === 'paused' ? 'Resume Run' : 'Pause Run'}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {gameStatus === 'paused' ? (
              <Play className="w-4 h-4 text-emerald-400" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>

          {/* How to play modal */}
          <button
            type="button"
            onClick={onOpenHowToPlay}
            title="How to Play"
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Download 1-File HTML button */}
          <a
            href="/get-up-and-get-strong.html"
            download="get-up-and-get-strong.html"
            title="Tải toàn bộ game thành 1 file HTML duy nhất"
            className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 hover:bg-emerald-900 transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Restart Button */}
          <button
            type="button"
            onClick={() => setShowConfirmRestart(true)}
            title="Restart Challenge"
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Restart */}
      {showConfirmRestart && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Restart the Challenge?</h3>
            <p className="text-xs text-slate-400">
              This will return you to the Start Line (0.0 Miles) and reset your milestone progress.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setShowConfirmRestart(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmRestart(false);
                  onRestartGame();
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
              >
                Yes, Restart Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
