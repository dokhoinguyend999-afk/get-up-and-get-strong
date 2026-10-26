import React, { useState } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { RunningGame } from './components/RunningGame';
import { HowToPlayModal } from './components/HowToPlayModal';
import { soundService } from './services/audioService';

export default function App() {
  const [gameState, setGameState] = useState<'title' | 'playing'>('title');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundService.setMuted(nextMuted);
  };

  const handleStartGame = () => {
    // Unlock browser audio context on user gesture
    soundService.registerUserInteraction();
    // Play "Stay Hard!" on game start as required in Section 9
    soundService.playStartMotivational();
    // Start background running pulse
    soundService.startBackgroundMusic();
    setGameState('playing');
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden font-sans select-none">
      {/* 16:9 Aspect Ratio Game Container */}
      <div className="relative w-full h-full max-w-[177.78vh] max-h-[56.25vw] bg-slate-950 flex flex-col overflow-hidden shadow-2xl">
        {gameState === 'title' && (
          <TitleScreen
            onStartGame={handleStartGame}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {gameState === 'playing' && (
          <RunningGame
            onReturnTitle={() => {
              soundService.stopCurrentVoice();
              soundService.stopBackgroundMusic();
              setGameState('title');
            }}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Global How to Play Modal */}
        {showHowToPlay && (
          <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
        )}
      </div>
    </div>
  );
}
