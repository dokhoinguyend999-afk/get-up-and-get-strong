import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RunningGameCanvas } from './RunningGameCanvas';
import { QuizOverlay } from './QuizOverlay';
import { GameHUD } from './GameHUD';
import { VictoryScreen } from './VictoryScreen';
import { HowToPlayModal } from './HowToPlayModal';
import { QUIZ_QUESTIONS, MILESTONES } from '../data/quizData';
import { soundService } from '../services/audioService';

interface RunningGameProps {
  onReturnTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

// Track World Coordinates
const MILESTONE_POSITIONS = [
  300,   // Start Line (0.0 MI)
  2500,  // Milestone 1 (1.0 MI)
  4900,  // Milestone 2 (2.0 MI)
  7300,  // Milestone 3 (3.0 MI)
  9700,  // Milestone 4 (4.0 MI)
  12100, // Milestone 5 (5.0 MI)
  14000, // Finish Line (5.2 MI)
];

const TOTAL_COURSE_MILES = 5.2;

export const RunningGame: React.FC<RunningGameProps> = ({
  onReturnTitle,
  isMuted,
  onToggleMute,
}) => {
  // Game State Machine
  const [gameState, setGameState] = useState<
    'RUNNING_TO_CHECKPOINT' | 'QUIZ_CHECKPOINT' | 'PROCESSING_ANSWER' | 'RUNNING_BACKWARD' | 'FINISH_SPRINT' | 'VICTORY'
  >('RUNNING_TO_CHECKPOINT');

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.8);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Position and Runner State
  const [playerX, setPlayerX] = useState<number>(MILESTONE_POSITIONS[0]);
  const [gogginsX, setGogginsX] = useState<number>(MILESTONE_POSITIONS[0] + 50);
  const [facingRight, setFacingRight] = useState<boolean>(true);
  const [runnerState, setRunnerState] = useState<'running' | 'idle' | 'sprinting' | 'celebrating'>('running');

  // Milestone Progress
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState<number>(0); // 0 to 4
  const [completedMilestones, setCompletedMilestones] = useState<number[]>([]);
  const [segmentStartX, setSegmentStartX] = useState<number>(MILESTONE_POSITIONS[0]);
  const [finishTapeBroken, setFinishTapeBroken] = useState<boolean>(false);

  // Quiz Overlay State
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [answerResult, setAnswerResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Statistics
  const [totalDistanceAccumulatedUnits, setTotalDistanceAccumulatedUnits] = useState<number>(0);
  const [rerunCount, setRerunCount] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Refs for animation loop
  const playerXRef = useRef<number>(playerX);
  const gogginsXRef = useRef<number>(gogginsX);
  const facingRightRef = useRef<boolean>(facingRight);
  const gameStateRef = useRef(gameState);
  const isPausedRef = useRef(isPaused);
  const speedMultRef = useRef(speedMultiplier);
  const currentMIndexRef = useRef(currentMilestoneIndex);
  const segmentStartXRef = useRef(segmentStartX);

  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);
  useEffect(() => {
    gogginsXRef.current = gogginsX;
  }, [gogginsX]);
  useEffect(() => {
    facingRightRef.current = facingRight;
  }, [facingRight]);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    speedMultRef.current = speedMultiplier;
  }, [speedMultiplier]);
  useEffect(() => {
    currentMIndexRef.current = currentMilestoneIndex;
  }, [currentMilestoneIndex]);
  useEffect(() => {
    segmentStartXRef.current = segmentStartX;
  }, [segmentStartX]);

  // Elapsed timer
  useEffect(() => {
    if (gameState === 'VICTORY' || isPaused) return;
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, isPaused]);

  // Calculate current distance on course
  const currentDistanceMi = Math.min(
    TOTAL_COURSE_MILES,
    Math.max(0, ((playerX - MILESTONE_POSITIONS[0]) / (MILESTONE_POSITIONS[6] - MILESTONE_POSITIONS[0])) * TOTAL_COURSE_MILES)
  );

  const totalDistanceRunMi =
    TOTAL_COURSE_MILES + (rerunCount * 1.0); // Course distance plus rerun miles

  // Main Movement Loop
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    let stepSoundCounter = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isPausedRef.current) {
        const state = gameStateRef.current;
        const speed = 420 * speedMultRef.current; // base running speed

        if (state === 'RUNNING_TO_CHECKPOINT') {
          const targetX = MILESTONE_POSITIONS[currentMIndexRef.current + 1];
          const newPlayerX = playerXRef.current + speed * dt;
          const newGogginsX = gogginsXRef.current + speed * dt;

          stepSoundCounter += dt;
          if (stepSoundCounter > 0.35) {
            stepSoundCounter = 0;
            soundService.playFootstepTap();
          }

          if (newPlayerX >= targetX) {
            // Arrived at milestone checkpoint! Visibly slow down and stop.
            playerXRef.current = targetX;
            gogginsXRef.current = targetX + 45;
            setPlayerX(targetX);
            setGogginsX(targetX + 45);
            setRunnerState('idle');
            setGameState('QUIZ_CHECKPOINT');
            setSelectedOption(null);
            setAnswerResult('idle');
            setIsProcessing(false);
          } else {
            playerXRef.current = newPlayerX;
            gogginsXRef.current = newGogginsX;
            setPlayerX(newPlayerX);
            setGogginsX(newGogginsX);
          }
        } else if (state === 'RUNNING_BACKWARD') {
          // Running backward after wrong answer to the segment start
          const targetStart = segmentStartXRef.current;
          const returnSpeed = speed * 1.15;
          const newPlayerX = playerXRef.current - returnSpeed * dt;
          const newGogginsX = gogginsXRef.current - returnSpeed * dt;

          stepSoundCounter += dt;
          if (stepSoundCounter > 0.35) {
            stepSoundCounter = 0;
            soundService.playFootstepTap();
          }

          if (newPlayerX <= targetStart) {
            // Reached segment start! Turn around and run forward again
            playerXRef.current = targetStart;
            gogginsXRef.current = targetStart + 45;
            setPlayerX(targetStart);
            setGogginsX(targetStart + 45);
            facingRightRef.current = true;
            setFacingRight(true);
            setRunnerState('running');
            setGameState('RUNNING_TO_CHECKPOINT');
          } else {
            playerXRef.current = newPlayerX;
            gogginsXRef.current = newGogginsX;
            setPlayerX(newPlayerX);
            setGogginsX(newGogginsX);
          }
        } else if (state === 'FINISH_SPRINT') {
          // Sprint to finish line!
          const sprintSpeed = speed * 1.35;
          const finishX = MILESTONE_POSITIONS[6];
          const newPlayerX = playerXRef.current + sprintSpeed * dt;
          const newGogginsX = gogginsXRef.current + sprintSpeed * 1.05 * dt;

          playerXRef.current = newPlayerX;
          gogginsXRef.current = newGogginsX;
          setPlayerX(newPlayerX);
          setGogginsX(newGogginsX);

          // Check if breaking finish tape
          if (newPlayerX >= finishX && !finishTapeBroken) {
            setFinishTapeBroken(true);
            setRunnerState('celebrating');
            soundService.playFinishHorn();

            // Grand confetti blast
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#F59E0B', '#EF4444', '#10B981', '#06B6D4', '#FFFFFF'],
            });

            // Transition to dramatic Victory Screen where "STAY HARD" quote and audio appear synchronized
            setTimeout(() => {
              setGameState('VICTORY');
            }, 1500);
          }
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [finishTapeBroken]);

  // Handle Answer Selected
  const handleAnswerSelected = useCallback(
    (key: 'A' | 'B' | 'C' | 'D') => {
      if (isProcessing || gameState !== 'QUIZ_CHECKPOINT') return;

      setIsProcessing(true);
      setSelectedOption(key);
      soundService.playButtonClick();

      const currentQuestion = QUIZ_QUESTIONS[currentMilestoneIndex];
      const isCorrect = key === currentQuestion.correctAnswer;

      if (isCorrect) {
        // --- CORRECT ANSWER LOGIC ---
        // 1. Highlight in green
        setAnswerResult('correct');
        // 2. Play subtle success sound
        soundService.playCorrectSound();
        // 3. Small confetti/particle burst
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#10B981', '#34D399', '#6EE7B7', '#FFFFFF'],
        });

        // 4. Update progress and resume run
        setTimeout(() => {
          const nextCompleted = [...completedMilestones, currentQuestion.milestoneId];
          setCompletedMilestones(nextCompleted);

          // Major milestone callout if appropriate (e.g. Milestone 3 or 4)
          if (currentQuestion.milestoneId === 3 || currentQuestion.milestoneId === 4) {
            soundService.playMajorMilestoneCallout(currentQuestion.milestoneId);
          }

          if (currentMilestoneIndex < 4) {
            // Advance to next milestone segment
            const nextIdx = currentMilestoneIndex + 1;
            const newSegmentStart = MILESTONE_POSITIONS[nextIdx];
            setCurrentMilestoneIndex(nextIdx);
            setSegmentStartX(newSegmentStart);
            setRunnerState('running');
            setGameState('RUNNING_TO_CHECKPOINT');
          } else {
            // All 5 milestones answered! Sprint to finish line!
            setRunnerState('sprinting');
            setGameState('FINISH_SPRINT');
          }

          setSelectedOption(null);
          setAnswerResult('idle');
          setIsProcessing(false);
        }, 1200);
      } else {
        // --- WRONG ANSWER LOGIC ---
        // 1. Highlight in red & show message
        setAnswerResult('wrong');
        soundService.playWrongBuzzer();
        // 2. Play Goggins motivational audio
        soundService.playWrongAnswerMotivational();
        setRerunCount((r) => r + 1);

        // 3. Quiz panel temporarily disappears, characters turn around and run back to segment start
        setTimeout(() => {
          setFacingRight(false);
          setRunnerState('running');
          setGameState('RUNNING_BACKWARD');
          setSelectedOption(null);
          setAnswerResult('idle');
          setIsProcessing(false);
        }, 1500);
      }
    },
    [isProcessing, gameState, currentMilestoneIndex, completedMilestones]
  );

  // Restart Game
  const handleRestart = () => {
    soundService.stopCurrentVoice();
    setGameState('RUNNING_TO_CHECKPOINT');
    setPlayerX(MILESTONE_POSITIONS[0]);
    setGogginsX(MILESTONE_POSITIONS[0] + 50);
    setFacingRight(true);
    setRunnerState('running');
    setCurrentMilestoneIndex(0);
    setCompletedMilestones([]);
    setSegmentStartX(MILESTONE_POSITIONS[0]);
    setFinishTapeBroken(false);
    setSelectedOption(null);
    setAnswerResult('idle');
    setIsProcessing(false);
    setRerunCount(0);
    setElapsedSeconds(0);
    setIsPaused(false);
    soundService.playStartMotivational();
  };

  // Toggle speed between 1x and 1.5x
  const handleToggleSpeed = () => {
    setSpeedMultiplier((prev) => (prev === 1 ? 1.5 : 1));
  };

  // Toggle pause
  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundService.setVolume(newVol);
  };

  // HUD Game Status Label
  let hudStatus: 'running' | 'checkpoint' | 'returning' | 'finish_sprint' | 'paused' = 'running';
  if (isPaused) {
    hudStatus = 'paused';
  } else if (gameState === 'QUIZ_CHECKPOINT') {
    hudStatus = 'checkpoint';
  } else if (gameState === 'RUNNING_BACKWARD') {
    hudStatus = 'returning';
  } else if (gameState === 'FINISH_SPRINT') {
    hudStatus = 'finish_sprint';
  }

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none flex flex-col">
      {/* 60FPS Running Canvas */}
      <RunningGameCanvas
        playerX={playerX}
        gogginsX={gogginsX}
        facingRight={facingRight}
        runnerState={runnerState}
        currentMilestoneIndex={currentMilestoneIndex}
        segmentStartX={segmentStartX}
        milestonePositions={MILESTONE_POSITIONS}
        finishTapeBroken={finishTapeBroken}
        speedMultiplier={speedMultiplier}
      />

      {/* Top HUD */}
      <GameHUD
        completedMilestones={completedMilestones}
        currentMilestoneIndex={currentMilestoneIndex}
        currentDistanceMi={currentDistanceMi}
        totalDistanceMi={TOTAL_COURSE_MILES}
        paceMinPerMi={speedMultiplier > 1 ? '4:45 /MI' : '6:15 /MI'}
        gameStatus={hudStatus}
        isMuted={isMuted}
        volume={volume}
        speedMultiplier={speedMultiplier}
        onToggleMute={onToggleMute}
        onVolumeChange={handleVolumeChange}
        onToggleSpeed={handleToggleSpeed}
        onTogglePause={handleTogglePause}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onRestartGame={handleRestart}
      />

      {/* Center Quiz Panel Overlay */}
      {gameState === 'QUIZ_CHECKPOINT' && (
        <QuizOverlay
          question={QUIZ_QUESTIONS[currentMilestoneIndex]}
          completedMilestonesCount={completedMilestones.length}
          totalMilestones={5}
          onAnswerSelected={handleAnswerSelected}
          isProcessing={isProcessing}
          answerResult={answerResult}
          selectedOption={selectedOption}
        />
      )}

      {/* Victory Screen Modal */}
      {gameState === 'VICTORY' && (
        <VictoryScreen
          totalDistanceRunMi={totalDistanceRunMi}
          rerunCount={rerunCount}
          totalTimeSeconds={elapsedSeconds}
          onPlayAgain={handleRestart}
        />
      )}

      {/* How to Play Modal */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
};
