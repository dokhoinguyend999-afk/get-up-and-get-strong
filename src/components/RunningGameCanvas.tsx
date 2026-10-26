import React, { useRef, useEffect } from 'react';

export interface RunnerState {
  x: number;
  y: number;
  vx: number;
  facingRight: boolean;
  state: 'running' | 'idle' | 'sprinting' | 'celebrating';
  runCycle: number;
}

interface RunningGameCanvasProps {
  playerX: number;
  gogginsX: number;
  facingRight: boolean;
  runnerState: 'running' | 'idle' | 'sprinting' | 'celebrating';
  currentMilestoneIndex: number; // 0 to 5 (0 = running to M1)
  segmentStartX: number;
  milestonePositions: number[]; // X coords for Start, M1, M2, M3, M4, M5, Finish
  finishTapeBroken: boolean;
  speedMultiplier: number;
}

export const RunningGameCanvas: React.FC<RunningGameCanvasProps> = ({
  playerX,
  gogginsX,
  facingRight,
  runnerState,
  currentMilestoneIndex,
  segmentStartX,
  milestonePositions,
  finishTapeBroken,
  speedMultiplier,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Smooth camera X tracking player with slight lookahead
  const cameraXRef = useRef<number>(playerX);
  const runCycleRef = useRef<number>(0);
  const dustParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[]>([]);
  const tapeParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; rot: number; vRot: number; color: string; life: number }[]>([]);

  // Track milestones details
  const MILESTONE_NAMES = [
    { num: 1, label: 'HABIT FORMATION', color: '#F59E0B' },
    { num: 2, label: 'BALANCED NUTRITION', color: '#10B981' },
    { num: 3, label: 'REGULAR EXERCISE', color: '#06B6D4' },
    { num: 4, label: 'VITAL HYDRATION', color: '#8B5CF6' },
    { num: 5, label: 'STRESS & MINDSET', color: '#EC4899' },
  ];

  // Spawn tape break confetti particles once tape is broken
  const tapeBrokenTriggered = useRef<boolean>(false);
  useEffect(() => {
    if (finishTapeBroken && !tapeBrokenTriggered.current) {
      tapeBrokenTriggered.current = true;
      const finishX = milestonePositions[milestonePositions.length - 1];
      const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FFFFFF'];
      for (let i = 0; i < 90; i++) {
        tapeParticlesRef.current.push({
          x: finishX + (Math.random() - 0.5) * 40,
          y: 380 + (Math.random() - 0.5) * 80,
          vx: (Math.random() * 8 + 3),
          vy: (Math.random() - 0.7) * 9,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1.0,
        });
      }
    } else if (!finishTapeBroken) {
      tapeBrokenTriggered.current = false;
      tapeParticlesRef.current = [];
    }
  }, [finishTapeBroken, milestonePositions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Update run cycle
      if (runnerState === 'running' || runnerState === 'sprinting' || runnerState === 'celebrating') {
        const cycleSpeed = (runnerState === 'sprinting' ? 14 : 9) * speedMultiplier;
        runCycleRef.current += dt * cycleSpeed;

        // Spawn dust particles while running
        if (Math.random() < 0.4) {
          const spawnX = facingRight ? playerX - 10 : playerX + 10;
          dustParticlesRef.current.push({
            x: spawnX,
            y: 440,
            vx: (facingRight ? -1 : 1) * (Math.random() * 2 + 1),
            vy: -Math.random() * 1.5,
            life: 0.6,
            maxLife: 0.6,
            size: Math.random() * 4 + 3,
          });
        }
        if (Math.random() < 0.4) {
          const gogginsSpawnX = facingRight ? gogginsX - 10 : gogginsX + 10;
          dustParticlesRef.current.push({
            x: gogginsSpawnX,
            y: 440,
            vx: (facingRight ? -1 : 1) * (Math.random() * 2 + 1),
            vy: -Math.random() * 1.5,
            life: 0.6,
            maxLife: 0.6,
            size: Math.random() * 5 + 3,
          });
        }
      }

      // Smooth camera interpolation towards player with offset
      const targetCamX = playerX + (facingRight ? 160 : -160);
      cameraXRef.current += (targetCamX - cameraXRef.current) * Math.min(1, dt * 5);

      const camX = cameraXRef.current;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // --- 1. DYNAMIC SKY GRADIENT ACCORDING TO BIOME & WORLD PROGRESSION ---
      const totalTrackDist = milestonePositions[milestonePositions.length - 1];
      const worldProgress = Math.max(0, Math.min(1, playerX / totalTrackDist));

      // Sky transitions: Morning gold -> Bright Athletic Blue -> Mountain Twilight -> Sunset Gold -> Champion Twilight
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.7);
      if (worldProgress < 0.25) {
        // Morning sunrise park
        skyGrad.addColorStop(0, '#1E293B');
        skyGrad.addColorStop(0.4, '#334155');
        skyGrad.addColorStop(0.8, '#EA580C');
        skyGrad.addColorStop(1, '#FDE047');
      } else if (worldProgress < 0.5) {
        // High noon athletic stadium
        skyGrad.addColorStop(0, '#0F172A');
        skyGrad.addColorStop(0.4, '#1E3A8A');
        skyGrad.addColorStop(0.8, '#38BDF8');
        skyGrad.addColorStop(1, '#BAE6FD');
      } else if (worldProgress < 0.75) {
        // Alpine mountain ridge
        skyGrad.addColorStop(0, '#0B0F19');
        skyGrad.addColorStop(0.4, '#1E1B4B');
        skyGrad.addColorStop(0.8, '#4338CA');
        skyGrad.addColorStop(1, '#818CF8');
      } else {
        // Golden hour victory summit
        skyGrad.addColorStop(0, '#18181B');
        skyGrad.addColorStop(0.4, '#7C2D12');
        skyGrad.addColorStop(0.75, '#C2410C');
        skyGrad.addColorStop(1, '#F59E0B');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Sun / Ambient glow
      const sunScreenX = ((width * 0.75 - camX * 0.03) % (width + 200) + width + 200) % (width + 200) - 100;
      const sunGrad = ctx.createRadialGradient(sunScreenX, 100, 10, sunScreenX, 100, 160);
      sunGrad.addColorStop(0, 'rgba(255, 245, 200, 0.85)');
      sunGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.4)');
      sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunScreenX, 100, 160, 0, Math.PI * 2);
      ctx.fill();

      // --- 2. FAR PARALLAX (Distant Mountains & Skyline, Factor 0.08) ---
      ctx.save();
      const farOffset = -(camX * 0.08) % 800;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      for (let i = -1; i < 4; i++) {
        const baseX = farOffset + i * 800;
        ctx.beginPath();
        ctx.moveTo(baseX, 360);
        ctx.lineTo(baseX + 200, 220);
        ctx.lineTo(baseX + 380, 280);
        ctx.lineTo(baseX + 540, 190);
        ctx.lineTo(baseX + 700, 270);
        ctx.lineTo(baseX + 800, 360);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // --- 3. MID PARALLAX (Trees, Bleachers, Stadium Lights, Factor 0.3) ---
      ctx.save();
      const midOffset = -(camX * 0.3) % 600;
      for (let i = -1; i < 4; i++) {
        const baseX = midOffset + i * 600;

        // Tree clusters / silhouettes
        ctx.fillStyle = 'rgba(20, 30, 48, 0.65)';
        ctx.beginPath();
        ctx.arc(baseX + 120, 320, 50, 0, Math.PI * 2);
        ctx.arc(baseX + 170, 310, 65, 0, Math.PI * 2);
        ctx.arc(baseX + 220, 330, 45, 0, Math.PI * 2);
        ctx.fill();

        // Tree trunks
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(baseX + 165, 360, 12, 40);

        // Stadium light pole
        ctx.fillStyle = '#334155';
        ctx.fillRect(baseX + 440, 200, 8, 200);
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(baseX + 420, 190, 48, 14);
        // Light glow
        const lightGlow = ctx.createRadialGradient(baseX + 444, 197, 2, baseX + 444, 197, 45);
        lightGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        lightGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = lightGlow;
        ctx.beginPath();
        ctx.arc(baseX + 444, 197, 45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // --- 4. GROUND & RUNNING TRACK (World Space, Camera Transform) ---
      const screenCenterX = width / 2;

      // Ground field background
      const groundGrad = ctx.createLinearGradient(0, 390, 0, height);
      groundGrad.addColorStop(0, '#064E3B'); // Lush green verge
      groundGrad.addColorStop(0.15, '#1E293B'); // Road edge
      groundGrad.addColorStop(0.2, '#991B1B'); // Tartan red athletic track
      groundGrad.addColorStop(0.7, '#7F1D1D');
      groundGrad.addColorStop(0.85, '#1E293B');
      groundGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 380, width, height - 380);

      // Running track lane lines & markings
      ctx.save();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.setLineDash([25, 20]);
      ctx.lineDashOffset = (camX - screenCenterX) * 0.95;

      // Lane 1 & Lane 2 white dividers
      ctx.beginPath();
      ctx.moveTo(0, 420);
      ctx.lineTo(width, 420);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 465);
      ctx.lineTo(width, 465);
      ctx.stroke();

      // Curb edge lines (solid)
      ctx.setLineDash([]);
      ctx.strokeStyle = '#F87171';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 395);
      ctx.lineTo(width, 395);
      ctx.moveTo(0, 495);
      ctx.lineTo(width, 495);
      ctx.stroke();
      ctx.restore();

      // --- 5. WORLD OBJECTS & MILESTONES (Camera offset) ---
      ctx.save();
      // Distance tick marks on track every 200 world units
      const startTick = Math.floor((camX - screenCenterX - 100) / 250) * 250;
      const endTick = Math.ceil((camX + screenCenterX + 100) / 250) * 250;

      for (let wx = startTick; wx <= endTick; wx += 250) {
        const sx = wx - camX + screenCenterX;
        if (sx < -50 || sx > width + 50) continue;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(sx, 485, 4, 15);

        // Milestone distance label (e.g. 0.5 mi, 1.0 mi)
        const miles = (wx / 2400).toFixed(1);
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`${miles} MI`, sx - 16, 515);
      }

      // Draw START LINE (Index 0)
      const startX = milestonePositions[0];
      const startScreenX = startX - camX + screenCenterX;
      if (startScreenX > -200 && startScreenX < width + 200) {
        drawStartGate(ctx, startScreenX);
      }

      // Draw MILESTONE ARCHES 1 through 5
      for (let m = 1; m <= 5; m++) {
        const mX = milestonePositions[m];
        const mScreenX = mX - camX + screenCenterX;
        if (mScreenX > -250 && mScreenX < width + 250) {
          const info = MILESTONE_NAMES[m - 1];
          const isPassed = currentMilestoneIndex >= m;
          const isCurrent = currentMilestoneIndex === m - 1;
          drawMilestoneArch(ctx, mScreenX, info.num, info.label, info.color, isPassed, isCurrent);
        }
      }

      // Draw FINISH LINE (Index 6)
      const finishX = milestonePositions[milestonePositions.length - 1];
      const finishScreenX = finishX - camX + screenCenterX;
      if (finishScreenX > -300 && finishScreenX < width + 300) {
        drawFinishArch(ctx, finishScreenX, finishTapeBroken);
      }

      // Segment Start Line Marker (visual indication of where rerun segment starts)
      if (segmentStartX > 0) {
        const segScreenX = segmentStartX - camX + screenCenterX;
        if (segScreenX > -100 && segScreenX < width + 100) {
          ctx.save();
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(segScreenX, 395);
          ctx.lineTo(segScreenX, 495);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#F59E0B';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('SEGMENT START', segScreenX - 45, 390);
          ctx.restore();
        }
      }

      ctx.restore();

      // --- 6. PARTICLES (Dust & Confetti Tape) ---
      // Update and draw dust particles
      ctx.save();
      for (let i = dustParticlesRef.current.length - 1; i >= 0; i--) {
        const p = dustParticlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        if (p.life <= 0) {
          dustParticlesRef.current.splice(i, 1);
          continue;
        }
        const screenP = p.x - camX + screenCenterX;
        const alpha = (p.life / p.maxLife) * 0.6;
        ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
        ctx.beginPath();
        ctx.arc(screenP, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw tape confetti particles
      for (let i = tapeParticlesRef.current.length - 1; i >= 0; i--) {
        const p = tapeParticlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += dt * 9.8 * 20; // gravity
        p.rot += p.vRot;
        p.life -= dt * 0.4;
        if (p.life <= 0) {
          tapeParticlesRef.current.splice(i, 1);
          continue;
        }
        const screenP = p.x - camX + screenCenterX;
        ctx.save();
        ctx.translate(screenP, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.fillRect(-6, -3, 12, 6);
        ctx.restore();
      }
      ctx.restore();

      // --- 7. CHARACTERS (DAVID GOGGINS & PLAYER ATHLETE) ---
      const cycle = runCycleRef.current;

      // Draw David Goggins (Running slightly ahead/beside)
      const gogginsScreenX = gogginsX - camX + screenCenterX;
      const gogginsY = 410; // Lane 1
      drawDavidGoggins(ctx, gogginsScreenX, gogginsY, facingRight, runnerState, cycle);

      // Draw Player Character
      const playerScreenX = playerX - camX + screenCenterX;
      const playerY = 450; // Lane 2
      drawPlayerAthlete(ctx, playerScreenX, playerY, facingRight, runnerState, cycle);

      // Continue animation loop
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [playerX, gogginsX, facingRight, runnerState, currentMilestoneIndex, segmentStartX, milestonePositions, finishTapeBroken, speedMultiplier]);

  // Handle high-DPI resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- DRAWING HELPER FUNCTIONS ---

  // 1. Start Gate Arch
  const drawStartGate = (ctx: CanvasRenderingContext2D, sx: number) => {
    ctx.save();
    // Pillars
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(sx - 15, 230, 26, 170);
    // Neon Teal Accents
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(sx - 18, 220, 32, 12);
    ctx.fillRect(sx - 18, 385, 32, 12);

    // Cross beam
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(sx - 120, 220, 240, 42);
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 3;
    ctx.strokeRect(sx - 120, 220, 240, 42);

    // Banner Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STARTING LINE', sx, 245);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#67E8F9';
    ctx.fillText('0.0 MILES · BEGIN THE CHALLENGE', sx, 258);

    // Checkered line on ground
    for (let c = 0; c < 12; c++) {
      ctx.fillStyle = c % 2 === 0 ? '#FFFFFF' : '#0F172A';
      ctx.fillRect(sx - 4, 395 + c * 8, 8, 8);
    }
    ctx.restore();
  };

  // 2. Milestone Arches
  const drawMilestoneArch = (
    ctx: CanvasRenderingContext2D,
    sx: number,
    num: number,
    title: string,
    color: string,
    isPassed: boolean,
    isCurrent: boolean
  ) => {
    ctx.save();
    // Arch Left Pillar
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(sx - 14, 210, 28, 190);

    // Glowing vertical light bar
    ctx.fillStyle = color;
    ctx.fillRect(sx - 4, 220, 8, 170);

    // Cross Arch Header
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(sx - 130, 195, 260, 52);
    ctx.strokeStyle = color;
    ctx.lineWidth = isCurrent ? 4 : 2;
    ctx.strokeRect(sx - 130, 195, 260, 52);

    // Milestone Badge Circle
    ctx.beginPath();
    ctx.arc(sx, 195, 26, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(num.toString(), sx, 202);

    // Text details
    ctx.font = '900 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`MILESTONE ${num}`, sx, 224);
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = color;
    ctx.fillText(title, sx, 238);

    // Checkpoint line across track
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sx, 395);
    ctx.lineTo(sx, 495);
    ctx.stroke();

    // Beacon pulse effect if this is the active current milestone
    if (isCurrent) {
      const pulse = (Math.sin(runCycleRef.current * 2) + 1) * 0.5;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3 + pulse * 0.5;
      ctx.strokeRect(sx - 135, 190, 270, 62);
    }
    ctx.restore();
  };

  // 3. Grand Finish Line Arch
  const drawFinishArch = (ctx: CanvasRenderingContext2D, sx: number, tapeBroken: boolean) => {
    ctx.save();
    // Golden Pillars
    const goldGrad = ctx.createLinearGradient(0, 180, 0, 400);
    goldGrad.addColorStop(0, '#F59E0B');
    goldGrad.addColorStop(0.5, '#FDE047');
    goldGrad.addColorStop(1, '#B45309');

    ctx.fillStyle = '#18181B';
    ctx.fillRect(sx - 16, 170, 32, 230);
    ctx.fillStyle = goldGrad;
    ctx.fillRect(sx - 10, 180, 20, 215);

    // Grand Arch Board
    ctx.fillStyle = '#09090B';
    ctx.fillRect(sx - 160, 150, 320, 60);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 4;
    ctx.strokeRect(sx - 160, 150, 320, 60);

    // Banner Text
    ctx.fillStyle = '#F59E0B';
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ FINISH LINE ★', sx, 182);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('5.2 MILES · VICTORY ZONE', sx, 199);

    // Checkered ground strip
    for (let c = 0; c < 12; c++) {
      ctx.fillStyle = c % 2 === 0 ? '#FFFFFF' : '#000000';
      ctx.fillRect(sx - 6, 395 + c * 8, 12, 8);
    }

    // Red Victory Finish Ribbon (Stretched before breaking, broken flutter after)
    if (!tapeBroken) {
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(sx - 3, 400, 6, 90);
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('FINISH', sx + 24, 440);
    } else {
      // Broken ribbon fluttering on edges
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(sx - 3, 400);
      ctx.lineTo(sx - 25, 410);
      ctx.lineTo(sx - 3, 420);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(sx + 3, 470);
      ctx.lineTo(sx + 30, 480);
      ctx.lineTo(sx + 3, 490);
      ctx.fill();
    }
    ctx.restore();
  };

  // 4. Procedural David Goggins Animator
  const drawDavidGoggins = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingRight: boolean,
    state: string,
    cycle: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    const isRunning = state === 'running' || state === 'sprinting' || state === 'celebrating';
    const isCelebrating = state === 'celebrating';

    // Kinematics calculations
    const bounce = isRunning ? Math.abs(Math.sin(cycle * 2)) * 6 : Math.sin(cycle * 0.8) * 1.5;
    const stride = isRunning ? Math.sin(cycle) : 0;
    const armStride = isRunning ? Math.cos(cycle) : 0;

    // Soft ground shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 32, isRunning ? 26 : 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.translate(0, -bounce);

    // --- LEGS ---
    const legColor = '#27272A'; // Dark athletic compression shorts
    const skinColor = '#8D5B4C'; // Muscular tanned tone
    const shoeColor = '#0284C7'; // Blue running shoe

    // Back Leg
    const backHipAngle = stride * 0.7;
    const backKneeBend = stride > 0 ? stride * 0.8 : 0.2;
    drawLeg(ctx, backHipAngle, backKneeBend, skinColor, legColor, shoeColor, -4);

    // --- TORSO ---
    // Muscular lean forward 7 degrees
    ctx.save();
    ctx.rotate((isRunning ? 0.12 : 0) + (isCelebrating ? -0.1 : 0));

    // Compression Tank Top (Black with white trim & athletic logo)
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.roundRect(-14, -40, 28, 42, 6);
    ctx.fill();

    // Muscle chest & lat highlights
    ctx.fillStyle = '#27272A';
    ctx.fillRect(-10, -32, 20, 18);

    // "STAY HARD" badge emblem
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-6, -24, 12, 3);

    // --- FRONT LEG ---
    const frontHipAngle = -stride * 0.7;
    const frontKneeBend = stride < 0 ? -stride * 0.8 : 0.2;
    drawLeg(ctx, frontHipAngle, frontKneeBend, skinColor, legColor, shoeColor, 4);

    // --- HEAD & FACE ---
    ctx.save();
    ctx.translate(2, -54);

    // Muscular Neck
    ctx.fillStyle = skinColor;
    ctx.fillRect(-6, 8, 12, 10);

    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    // Shaved head dark stubble shading
    ctx.fillStyle = 'rgba(24, 24, 27, 0.45)';
    ctx.beginPath();
    ctx.arc(0, -3, 12, Math.PI, Math.PI * 2);
    ctx.fill();

    // Iconic White Fitness Headband
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-13, -7, 26, 6);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.strokeRect(-13, -7, 26, 6);

    // Intense determined eye & eyebrow
    ctx.fillStyle = '#18181B';
    ctx.fillRect(4, -1, 4, 2); // eye
    ctx.fillRect(2, -4, 7, 2); // brow slant

    // Focused jawline
    ctx.strokeStyle = '#573327';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(3, 7);
    ctx.lineTo(8, 5);
    ctx.stroke();

    ctx.restore();

    // --- ARMS ---
    // Muscular Back Arm
    drawArm(ctx, -armStride * 0.9, skinColor, '#18181B', -10, isCelebrating);

    // Muscular Front Arm
    drawArm(ctx, armStride * 0.9, skinColor, '#18181B', 10, isCelebrating);

    // Sweat / Intensity steam droplet when running
    if (isRunning && Math.sin(cycle * 3) > 0.7) {
      ctx.fillStyle = '#67E8F9';
      ctx.beginPath();
      ctx.arc(10, -62, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // end torso rotate
    ctx.restore(); // end character translate
  };

  // 5. Procedural Player Athlete Animator
  const drawPlayerAthlete = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingRight: boolean,
    state: string,
    cycle: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    const isRunning = state === 'running' || state === 'sprinting' || state === 'celebrating';
    const isCelebrating = state === 'celebrating';

    // Kinematics calculations
    const bounce = isRunning ? Math.abs(Math.sin(cycle * 2 + 0.3)) * 6 : Math.sin(cycle * 0.8 + 0.3) * 1.5;
    const stride = isRunning ? Math.sin(cycle + 0.3) : 0;
    const armStride = isRunning ? Math.cos(cycle + 0.3) : 0;

    // Ground shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 32, isRunning ? 24 : 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.translate(0, -bounce);

    // Legs
    const skinColor = '#FBBF24'; // Warm athletic skin
    const shortsColor = '#0F172A'; // Navy athletic shorts
    const shoeColor = '#10B981'; // Electric emerald running shoe

    // Back leg
    const backHipAngle = stride * 0.7;
    const backKneeBend = stride > 0 ? stride * 0.8 : 0.2;
    drawLeg(ctx, backHipAngle, backKneeBend, skinColor, shortsColor, shoeColor, -4);

    // Torso (Electric Teal Athletic Tee)
    ctx.save();
    ctx.rotate((isRunning ? 0.1 : 0) + (isCelebrating ? -0.1 : 0));

    ctx.fillStyle = '#0D9488'; // Teal performance shirt
    ctx.beginPath();
    ctx.roundRect(-12, -38, 24, 40, 5);
    ctx.fill();

    // Shirt accent lines
    ctx.fillStyle = '#14B8A6';
    ctx.fillRect(-8, -26, 16, 2);

    // Front leg
    const frontHipAngle = -stride * 0.7;
    const frontKneeBend = stride < 0 ? -stride * 0.8 : 0.2;
    drawLeg(ctx, frontHipAngle, frontKneeBend, skinColor, shortsColor, shoeColor, 4);

    // Head & Hair
    ctx.save();
    ctx.translate(1, -52);

    // Neck
    ctx.fillStyle = skinColor;
    ctx.fillRect(-5, 8, 10, 8);

    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Sporty hair
    ctx.fillStyle = '#312E81';
    ctx.beginPath();
    ctx.arc(-2, -3, 13, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // Athletic teal headband
    ctx.fillStyle = '#14B8A6';
    ctx.fillRect(-12, -6, 24, 5);

    // Eye
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(4, -1, 3, 2);

    ctx.restore();

    // Arms
    drawArm(ctx, -armStride * 0.85, skinColor, '#0D9488', -8, isCelebrating);
    drawArm(ctx, armStride * 0.85, skinColor, '#0D9488', 8, isCelebrating);

    ctx.restore(); // end torso
    ctx.restore(); // end player translate
  };

  // Helper: Draw athletic leg with thigh, knee, calf, and shoe
  const drawLeg = (
    ctx: CanvasRenderingContext2D,
    hipAngle: number,
    kneeBend: number,
    skinColor: string,
    shortsColor: string,
    shoeColor: string,
    offsetX: number
  ) => {
    ctx.save();
    ctx.translate(offsetX, 0);
    ctx.rotate(hipAngle);

    // Thigh with athletic short
    ctx.fillStyle = shortsColor;
    ctx.fillRect(-5, 0, 10, 14);

    // Lower thigh / skin
    ctx.fillStyle = skinColor;
    ctx.fillRect(-4, 14, 8, 8);

    // Knee & Shin
    ctx.translate(0, 22);
    ctx.rotate(kneeBend);

    ctx.fillStyle = skinColor;
    ctx.fillRect(-3.5, 0, 7, 18);

    // Running Shoe
    ctx.fillStyle = shoeColor;
    ctx.beginPath();
    ctx.roundRect(-4, 16, 15, 7, 3);
    ctx.fill();

    // Sole
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-4, 21, 15, 3);

    ctx.restore();
  };

  // Helper: Draw athletic muscular arm
  const drawArm = (
    ctx: CanvasRenderingContext2D,
    swingAngle: number,
    skinColor: string,
    sleeveColor: string,
    shoulderX: number,
    celebrating: boolean
  ) => {
    ctx.save();
    ctx.translate(shoulderX, -30);

    if (celebrating) {
      // Victory Fist Pump in the air
      ctx.rotate(-2.2 + swingAngle * 0.2);
    } else {
      ctx.rotate(swingAngle);
    }

    // Shoulder sleeve
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(-4, 0, 8, 8);

    // Bicep / Upper Arm
    ctx.fillStyle = skinColor;
    ctx.fillRect(-3.5, 6, 7, 14);

    // Forearm flexed at ~90 degrees
    ctx.translate(0, 18);
    ctx.rotate(celebrating ? -0.4 : 1.3);

    ctx.fillStyle = skinColor;
    ctx.fillRect(-3, 0, 6, 15);

    // Clenched fist
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, 17, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
};
