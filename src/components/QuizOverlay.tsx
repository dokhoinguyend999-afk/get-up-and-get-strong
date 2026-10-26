import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../data/quizData';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';

interface QuizOverlayProps {
  question: QuizQuestion;
  completedMilestonesCount: number;
  totalMilestones: number;
  onAnswerSelected: (selectedKey: 'A' | 'B' | 'C' | 'D') => void;
  isProcessing: boolean;
  answerResult: 'idle' | 'correct' | 'wrong';
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
}

export const QuizOverlay: React.FC<QuizOverlayProps> = ({
  question,
  completedMilestonesCount,
  totalMilestones,
  onAnswerSelected,
  isProcessing,
  answerResult,
  selectedOption,
}) => {
  // Support keyboard shortcuts (A, B, C, D or 1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing) return;
      const key = e.key.toUpperCase();
      if (key === 'A' || key === '1') {
        onAnswerSelected('A');
      } else if (key === 'B' || key === '2') {
        onAnswerSelected('B');
      } else if (key === 'C' || key === '3') {
        onAnswerSelected('C');
      } else if (key === 'D' || key === '4') {
        onAnswerSelected('D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, onAnswerSelected]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-slate-100">
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
                  {question.milestoneTitle}
                </span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-xs text-slate-400 font-medium">
                  {question.topic}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-300">
                Fitness & Lifestyle Checkpoint
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400">
              PROGRESS: <strong className="text-emerald-400 tabular-nums">{completedMilestonesCount}</strong> / {totalMilestones}
            </span>
          </div>
        </div>

        {/* Question Statement */}
        <div className="py-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {question.question}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose the correct habit to unlock the path forward. Answer correctly or run the segment again!
          </p>
        </div>

        {/* Answer Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((option) => {
            const isSelected = selectedOption === option.key;
            const isCorrectOption = option.key === question.correctAnswer;

            let buttonStyle = 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-200 hover:border-slate-500 hover:shadow-md';
            let badgeStyle = 'bg-slate-700 text-slate-300';

            if (answerResult === 'correct') {
              if (isCorrectOption) {
                buttonStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-950/50';
                badgeStyle = 'bg-emerald-500 text-slate-950 font-bold';
              } else {
                buttonStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
                badgeStyle = 'bg-slate-800 text-slate-600';
              }
            } else if (answerResult === 'wrong') {
              if (isSelected) {
                buttonStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 ring-2 ring-rose-500/60 shadow-lg shadow-rose-950/50';
                badgeStyle = 'bg-rose-500 text-white font-bold';
              } else if (isCorrectOption) {
                buttonStyle = 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200';
                badgeStyle = 'bg-emerald-600 text-white font-bold';
              } else {
                buttonStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-50';
                badgeStyle = 'bg-slate-800 text-slate-600';
              }
            }

            return (
              <button
                key={option.key}
                type="button"
                disabled={isProcessing}
                onClick={() => onAnswerSelected(option.key)}
                className={`relative flex items-center gap-3.5 p-4 rounded-xl border transition-all text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${buttonStyle}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${badgeStyle}`}
                >
                  {option.key}
                </div>
                <span className="text-sm sm:text-base font-medium flex-1">
                  {option.text}
                </span>

                {answerResult === 'correct' && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-in zoom-in-50" />
                )}
                {answerResult === 'wrong' && isSelected && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 animate-in zoom-in-50" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Banner */}
        {answerResult === 'correct' && (
          <div className="flex items-center gap-3 p-3.5 bg-emerald-900/30 border border-emerald-600/50 rounded-xl text-emerald-200 text-sm animate-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <span className="font-bold text-white">Correct! Keep going!</span>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                {question.coachEncouragement}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
          </div>
        )}

        {answerResult === 'wrong' && (
          <div className="flex items-center gap-3 p-3.5 bg-rose-900/40 border border-rose-600/60 rounded-xl text-rose-200 text-sm animate-in slide-in-from-bottom-2">
            <RotateCcw className="w-5 h-5 text-rose-400 shrink-0 animate-spin" />
            <div className="flex-1">
              <span className="font-bold text-white">Not quite! Run it again!</span>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Turn around and run back to the segment start! You must earn this checkpoint!
              </p>
            </div>
          </div>
        )}

        {/* Keyboard shortcut hint */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Keyboard: Press [A], [B], [C], [D] or [1], [2], [3], [4]</span>
          <span className="italic">Stay Hard · Never Give Up</span>
        </div>
      </div>
    </div>
  );
};
