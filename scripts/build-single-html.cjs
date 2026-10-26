const fs = require('fs');
const path = require('path');

const stayHardB64 = fs.readFileSync(path.join(__dirname, '../public/assets/david-goggins-stay-hard.mp3')).toString('base64');
const voicemodB64 = fs.readFileSync(path.join(__dirname, '../public/assets/david-goggins-made-with-Voicemod.mp3')).toString('base64');

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GET UP AND GET STRONG! - David Goggins Running Challenge</title>
  <meta name="description" content="A high-energy running challenge mini-game with David Goggins featuring continuous courses, animated runners, milestone checkpoints, and healthy lifestyle quizzes.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    body, html { width: 100%; height: 100%; background: #020617; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    
    #app-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      max-width: 177.78vh;
      max-height: 56.25vw;
      background: #020617;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }

    canvas { width: 100%; height: 100%; display: block; }

    /* Keyframes */
    @keyframes stayHardReveal {
      0% { opacity: 0; transform: scale(0.92); filter: blur(6px); }
      100% { opacity: 1; transform: scale(1); filter: blur(0); }
    }
    .animate-stay-hard {
      animation: stayHardReveal 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    .fade-in { animation: fadeIn 0.3s ease-out forwards; }

    @keyframes fadeInDelayed {
      0% { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .fade-in-delayed { animation: fadeInDelayed 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }

    /* UI Layer Styles */
    .screen-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      z-index: 30;
    }

    /* Common Button */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 800;
      cursor: pointer;
      border: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border-radius: 12px;
      font-family: inherit;
    }
    .btn:active { transform: scale(0.97); }

    .btn-primary {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #020617;
      box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(71, 85, 105, 0.5);
      color: #e2e8f0;
    }
    .btn-secondary:hover {
      background: rgba(51, 65, 85, 0.9);
      border-color: #94a3b8;
    }

    .btn-icon {
      padding: 8px 10px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(51, 65, 85, 0.6);
      color: #94a3b8;
      border-radius: 8px;
    }
    .btn-icon:hover { color: #f8fafc; border-color: #64748b; }

    /* Top HUD */
    #hud {
      position: absolute;
      top: 0; left: 0; right: 0;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 20;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(2, 6, 23, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 40;
    }
  </style>
</head>
<body>

<div id="app-container">
  <!-- 60FPS Game Canvas -->
  <canvas id="gameCanvas"></canvas>

  <!-- Title Screen -->
  <div id="titleScreen" class="screen-overlay" style="background: radial-gradient(circle at center, rgba(217, 119, 6, 0.12) 0%, rgba(2, 6, 23, 0.95) 75%); justify-content: space-between; padding: 24px 32px;">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">🔥</span>
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.15em; color: #94a3b8; text-transform: uppercase;">FITNESS RUNNING CHALLENGE</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="btnSoundTitle" class="btn btn-icon" title="Bật/Tắt âm thanh">🔊</button>
        <button id="btnHowToTitle" class="btn btn-icon" title="Hướng dẫn">❓</button>
      </div>
    </div>

    <div style="text-align: center; max-width: 680px; margin: auto;">
      <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; border-radius: 9999px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b; font-size: 11px; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">
        ★ 5 Checkpoint Milestones · Stay Hard Discipline
      </div>
      <h1 style="font-size: clamp(2rem, 5vw, 4rem); font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 12px; background: linear-gradient(180deg, #ffffff, #e2e8f0 60%, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        GET UP AND GET STRONG!
      </h1>
      <p style="font-size: clamp(0.9rem, 2vw, 1.15rem); color: #cbd5e1; line-height: 1.5; margin-bottom: 28px;">
        Chạy 5.2 dặm liên tục cùng huấn luyện viên <strong style="color: #f59e0b;">David Goggins</strong>. Vượt qua 5 trạm câu hỏi phong cách sống lành mạnh — trả lời sai phải quay đầu chạy lại!
      </p>

      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <button id="btnStart" class="btn btn-primary" style="padding: 14px 32px; font-size: 16px; letter-spacing: 0.05em;">
          ▶ BẮT ĐẦU THỬ THÁCH
        </button>
        <button id="btnHowToPlay" class="btn btn-secondary" style="padding: 14px 24px; font-size: 14px;">
          LUẬT CHƠI
        </button>
      </div>

      <div style="margin-top: 24px; display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51, 65, 85, 0.5); font-size: 11px; color: #94a3b8;">
        <span style="color: #f59e0b;">⚠️</span>
        <span><strong>Luật của Goggins:</strong> Trả lời sai sẽ lập tức quay đầu chạy lại từ đầu chặng đó!</span>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid rgba(30, 41, 59, 0.5); padding-top: 12px;">
      <span>Greenway · Olympic Stadium · Mountain Trail · Fitness Obstacle · Summit</span>
      <span>"Discipline Equals Freedom · Stay Hard"</span>
    </div>
  </div>

  <!-- HUD Layer -->
  <div id="hud" style="display: none;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-weight: 900; font-size: 13px; letter-spacing: 0.05em; color: #fff;">GET UP AND GET STRONG!</span>
      <span id="hudStatusTag" style="font-size: 10px; font-family: monospace; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">
        RUNNING
      </span>
    </div>

    <!-- 5 Checkpoint tracker -->
    <div id="milestonePills" style="display: flex; align-items: center; gap: 6px;"></div>

    <!-- Distance & Pace -->
    <div style="display: flex; align-items: center; gap: 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px;">
      <div>
        <span style="font-size: 9px; color: #94a3b8; display: block;">QUÃNG ĐƯỜNG</span>
        <span id="hudDistance" style="color: #34d399; font-weight: 700;">0.0 / 5.2 MI</span>
      </div>
      <div>
        <span style="font-size: 9px; color: #94a3b8; display: block;">TỐC ĐỘ</span>
        <span id="hudPace" style="color: #f1f5f9; font-weight: 700;">6:15 /MI</span>
      </div>
    </div>

    <!-- Controls -->
    <div style="display: flex; align-items: center; gap: 6px;">
      <button id="btnSpeed" class="btn btn-icon" style="font-weight: 700; font-size: 11px;" title="Tăng tốc">1x</button>
      <button id="btnSoundHud" class="btn btn-icon" title="Âm thanh">🔊</button>
      <button id="btnPause" class="btn btn-icon" title="Tạm dừng">⏸</button>
      <button id="btnRestart" class="btn btn-icon" title="Chạy lại từ đầu">🔄</button>
    </div>
  </div>

  <!-- Quiz Overlay Modal -->
  <div id="quizOverlay" class="modal-backdrop" style="display: none;">
    <div style="background: rgba(15, 23, 42, 0.96); border: 1px solid rgba(51, 65, 85, 0.8); border-radius: 20px; padding: 24px 32px; max-width: 640px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85); display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(51, 65, 85, 0.6); pb: 12px;">
        <div>
          <span id="quizMilestoneHeader" style="font-family: monospace; font-size: 11px; font-weight: 700; color: #f59e0b; text-transform: uppercase;">MILESTONE 1 / 5</span>
          <h3 id="quizTopic" style="font-size: 13px; color: #cbd5e1; font-weight: 600;">Healthy Lifestyle Checkpoint</h3>
        </div>
        <div style="font-family: monospace; font-size: 11px; color: #94a3b8;">
          TIẾN ĐỘ: <strong id="quizProgressNum" style="color: #34d399;">0</strong> / 5
        </div>
      </div>

      <div>
        <h2 id="quizQuestionText" style="font-size: clamp(1.1rem, 2.5vw, 1.45rem); font-weight: 800; color: #ffffff; line-height: 1.35;">
          Which habit helps you stay healthy?
        </h2>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Chọn đáp án đúng để mở đường tiếp tục. Trả lời sai sẽ bị phạt chạy lại chặng!</p>
      </div>

      <!-- 4 Option Buttons -->
      <div id="quizOptionsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>

      <!-- Feedback result banner -->
      <div id="quizFeedback" style="display: none; padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 600;"></div>

      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
        <span>Phím tắt: Bấm [A], [B], [C], [D] hoặc [1], [2], [3], [4]</span>
        <span style="font-style: italic;">Stay Hard · Never Give Up</span>
      </div>
    </div>
  </div>

  <!-- Final Victory Screen: STAY HARD. -->
  <div id="victoryScreen" class="screen-overlay" style="display: none; background: #020617; align-items: center; justify-content: center; text-align: center; padding: 24px;">
    <!-- Ambient glowing spotlight -->
    <div style="position: absolute; width: 600px; height: 350px; background: rgba(245, 158, 11, 0.1); border-radius: 9999px; filter: blur(80px); pointer-events: none;"></div>

    <div style="position: relative; z-index: 10; max-width: 800px; margin: auto;">
      <div class="fade-in-delayed" style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #f59e0b; letter-spacing: 0.35em; text-transform: uppercase; margin-bottom: 16px;">
        CHALLENGE COMPLETE · 5.2 MILES
      </div>

      <!-- The exact quote STAY HARD with fade-in + scale-up -->
      <h1 class="animate-stay-hard" style="font-size: clamp(3.5rem, 11vw, 8rem); font-weight: 900; color: #ffffff; letter-spacing: -0.03em; line-height: 1; text-transform: uppercase; text-shadow: 0 15px 35px rgba(0,0,0,0.9); margin-bottom: 20px;">
        “STAY HARD.”
      </h1>

      <p class="fade-in-delayed" style="font-size: clamp(0.95rem, 2vw, 1.2rem); color: #cbd5e1; max-width: 500px; margin: 0 auto 36px; line-height: 1.5;">
        Build healthy habits. Stay consistent. Keep moving forward.
      </p>

      <div class="fade-in-delayed">
        <button id="btnPlayAgain" class="btn btn-primary" style="padding: 16px 40px; font-size: 16px; letter-spacing: 0.05em;">
          🔄 PLAY AGAIN
        </button>
      </div>
    </div>
  </div>

  <!-- How to play modal -->
  <div id="howToModal" class="modal-backdrop" style="display: none;">
    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 20px; padding: 28px; max-width: 560px; width: 100%; max-height: 85vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #fff;">Luật Chơi &amp; Cơ Chế</h2>
        <button id="btnCloseHowTo" class="btn btn-icon">✕</button>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
        <div style="padding: 12px; background: rgba(30, 41, 59, 0.6); border-radius: 12px;">
          <strong style="color: #f59e0b;">1. Chạy cùng David Goggins:</strong> Cả hai cùng xuất phát từ vạch START và chạy liên tục qua 5 chặng phong cảnh outdoor (công viên, sân vận động, đường mòn núi, bãi tập thể lực, đỉnh vinh quang).
        </div>
        <div style="padding: 12px; background: rgba(30, 41, 59, 0.6); border-radius: 12px;">
          <strong style="color: #38bdf8;">2. Trạm Checkpoint:</strong> Khi đến mỗi mốc (Milestone 1 tới 5), cả 2 nhân vật sẽ chạy chậm lại và dừng lại. Bảng câu hỏi phong cách sống sẽ hiện ra.
        </div>
        <div style="padding: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px;">
          <strong style="color: #34d399;">3. Trả lời Đúng:</strong> Đáp án sáng màu xanh, âm thanh vinh quang vang lên, và cả 2 tiếp tục chạy tiếp chặng kế tiếp!
        </div>
        <div style="padding: 12px; background: rgba(225, 29, 72, 0.15); border: 1px solid rgba(225, 29, 72, 0.3); border-radius: 12px;">
          <strong style="color: #fb7185;">4. Trả lời Sai (Luật của Goggins):</strong> Giọng Goggins vang lên! Cả hai lập tức quay đầu chạy lùi về vạch xuất phát của CHẶNG ĐÓ và phải chạy lại từ đầu chặng đó! Các mốc đã hoàn thành trước đó không bị mất.
        </div>
        <div style="padding: 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px;">
          <strong style="color: #fbbf24;">5. Vạch Đích:</strong> Sau khi trả lời đúng Câu 5, cả 2 sẽ bứt tốc lao qua vạch đích, đứt dải ruy băng chiến thắng và xuất hiện màn hình “STAY HARD.” cùng âm thanh giọng nói của Goggins!
        </div>
      </div>
      <button id="btnGotItHowTo" class="btn btn-primary" style="width: 100%; margin-top: 20px; padding: 12px;">ĐÃ HIỂU · VÀO CHẠY NGAY!</button>
    </div>
  </div>
</div>

<script>
// --- EMBEDDED AUDIO ASSETS (BASE64) ---
const STAY_HARD_B64 = "${stayHardB64}";
const VOICEMOD_B64 = "${voicemodB64}";

const audioStayHard = new Audio("data:audio/mp3;base64," + STAY_HARD_B64);
const audioVoicemod = new Audio("data:audio/mp3;base64," + VOICEMOD_B64);

// Audio Controller
const SoundController = {
  muted: false,
  volume: 0.8,
  ctx: null,
  currentVoice: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  toggleMute() {
    this.muted = !this.muted;
    if (this.currentVoice) this.currentVoice.muted = this.muted;
    return this.muted;
  },
  stopVoice() {
    if (this.currentVoice) {
      try { this.currentVoice.pause(); this.currentVoice.currentTime = 0; } catch (e) {}
      this.currentVoice = null;
    }
  },
  playStayHard() {
    if (this.muted) return;
    this.stopVoice();
    try {
      audioStayHard.currentTime = 0;
      audioStayHard.volume = this.volume;
      audioStayHard.muted = this.muted;
      this.currentVoice = audioStayHard;
      audioStayHard.play().catch(e => console.warn(e));
    } catch(e) {}
  },
  playVoicemodFail() {
    if (this.muted) return;
    this.stopVoice();
    try {
      audioVoicemod.currentTime = 0;
      audioVoicemod.volume = this.volume;
      audioVoicemod.muted = this.muted;
      this.currentVoice = audioVoicemod;
      audioVoicemod.play().catch(e => console.warn(e));
    } catch(e) {}
  },
  playChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    [659.25, 880, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = this.ctx.currentTime + idx * 0.08;
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.12, st);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.38);
    });
  },
  playBuzzer() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  },
  playFinishHorn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.25);
    });
  }
};

// --- QUESTIONS DATA ---
const QUESTIONS = [
  {
    id: 1,
    title: 'MILESTONE 1 / 5',
    topic: 'Thói quen & Giấc ngủ hồi phục',
    question: 'Which habit helps you stay healthy?',
    options: [
      { key: 'A', text: 'Skipping breakfast every day' },
      { key: 'B', text: 'Getting enough sleep' },
      { key: 'C', text: 'Watching TV all day' },
      { key: 'D', text: 'Avoiding physical activity' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 2,
    title: 'MILESTONE 2 / 5',
    topic: 'Chế độ Dinh dưỡng Cân bằng',
    question: 'What should you do to maintain a balanced diet?',
    options: [
      { key: 'A', text: 'Eat only fast food' },
      { key: 'B', text: 'Skip meals regularly' },
      { key: 'C', text: 'Eat a variety of nutritious foods' },
      { key: 'D', text: 'Avoid drinking water' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 3,
    title: 'MILESTONE 3 / 5',
    topic: 'Vận động & Rèn luyện thể chất',
    question: 'Which activity is an example of regular exercise?',
    options: [
      { key: 'A', text: 'Walking briskly every day' },
      { key: 'B', text: 'Sitting for hours without moving' },
      { key: 'C', text: 'Playing video games all day' },
      { key: 'D', text: 'Sleeping throughout the day' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 4,
    title: 'MILESTONE 4 / 5',
    topic: 'Hydrat hóa & Chức năng cơ thể',
    question: 'Why is drinking enough water important?',
    options: [
      { key: 'A', text: 'It replaces the need for food' },
      { key: 'B', text: 'It makes exercise unnecessary' },
      { key: 'C', text: 'It guarantees that you never get sick' },
      { key: 'D', text: 'It helps your body function properly' }
    ],
    correctAnswer: 'D'
  },
  {
    id: 5,
    title: 'MILESTONE 5 / 5',
    topic: 'Kiểm soát Stress & Tinh thần thép',
    question: 'What is a healthy way to manage stress?',
    options: [
      { key: 'A', text: 'Ignore all your problems' },
      { key: 'B', text: 'Relax, exercise, or talk to someone you trust' },
      { key: 'C', text: 'Stop sleeping to finish more work' },
      { key: 'D', text: 'Avoid everyone permanently' }
    ],
    correctAnswer: 'B'
  }
];

// World Track Positions
const MILESTONE_POSITIONS = [300, 2500, 4900, 7300, 9700, 12100, 14000];
const MILESTONE_NAMES = [
  { num: 1, label: 'HABIT FORMATION', color: '#F59E0B' },
  { num: 2, label: 'BALANCED NUTRITION', color: '#10B981' },
  { num: 3, label: 'REGULAR EXERCISE', color: '#06B6D4' },
  { num: 4, label: 'VITAL HYDRATION', color: '#8B5CF6' },
  { num: 5, label: 'STRESS & MINDSET', color: '#EC4899' }
];

// --- GAME STATE ---
const Game = {
  canvas: document.getElementById('gameCanvas'),
  ctx: null,
  state: 'TITLE', // 'RUNNING', 'CHECKPOINT', 'RETURNING', 'FINISH_SPRINT', 'VICTORY'
  playerX: 300,
  gogginsX: 350,
  camX: 300,
  facingRight: true,
  runnerState: 'running',
  runCycle: 0,
  currentMilestoneIdx: 0,
  segmentStartX: 300,
  completedMilestones: [],
  speedMultiplier: 1,
  paused: false,
  finishTapeBroken: false,
  dustParticles: [],
  confettiParticles: [],
  lastTime: performance.now(),

  init() {
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindEvents();
    requestAnimationFrame(now => this.loop(now));
  },

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.ctx.scale(dpr, dpr);
  },

  bindEvents() {
    // Start Game
    document.getElementById('btnStart').onclick = () => {
      SoundController.init();
      SoundController.playStayHard();
      document.getElementById('titleScreen').style.display = 'none';
      document.getElementById('hud').style.display = 'flex';
      this.state = 'RUNNING';
      this.updateHud();
    };

    // Sound toggle
    const toggleSound = () => {
      const isMuted = SoundController.toggleMute();
      document.getElementById('btnSoundTitle').textContent = isMuted ? '🔇' : '🔊';
      document.getElementById('btnSoundHud').textContent = isMuted ? '🔇' : '🔊';
    };
    document.getElementById('btnSoundTitle').onclick = toggleSound;
    document.getElementById('btnSoundHud').onclick = toggleSound;

    // Speed toggle
    document.getElementById('btnSpeed').onclick = () => {
      this.speedMultiplier = this.speedMultiplier === 1 ? 1.5 : 1;
      document.getElementById('btnSpeed').textContent = this.speedMultiplier + 'x';
      document.getElementById('hudPace').textContent = this.speedMultiplier > 1 ? '4:45 /MI' : '6:15 /MI';
    };

    // Pause toggle
    document.getElementById('btnPause').onclick = () => {
      this.paused = !this.paused;
      document.getElementById('btnPause').textContent = this.paused ? '▶' : '⏸';
      document.getElementById('hudStatusTag').textContent = this.paused ? 'PAUSED' : 'RUNNING';
    };

    // Restart
    document.getElementById('btnRestart').onclick = () => this.restart();
    document.getElementById('btnPlayAgain').onclick = () => this.restart();

    // How to play modals
    const showHowTo = () => document.getElementById('howToModal').style.display = 'flex';
    const hideHowTo = () => document.getElementById('howToModal').style.display = 'none';
    document.getElementById('btnHowToTitle').onclick = showHowTo;
    document.getElementById('btnHowToPlay').onclick = showHowTo;
    document.getElementById('btnCloseHowTo').onclick = hideHowTo;
    document.getElementById('btnGotItHowTo').onclick = hideHowTo;

    // Keyboard answers
    window.addEventListener('keydown', e => {
      if (this.state !== 'CHECKPOINT') return;
      const k = e.key.toUpperCase();
      if (['A', '1'].includes(k)) this.handleAnswer('A');
      else if (['B', '2'].includes(k)) this.handleAnswer('B');
      else if (['C', '3'].includes(k)) this.handleAnswer('C');
      else if (['D', '4'].includes(k)) this.handleAnswer('D');
    });
  },

  restart() {
    SoundController.stopVoice();
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('quizOverlay').style.display = 'none';
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';
    this.playerX = MILESTONE_POSITIONS[0];
    this.gogginsX = MILESTONE_POSITIONS[0] + 50;
    this.camX = this.playerX;
    this.facingRight = true;
    this.runnerState = 'running';
    this.currentMilestoneIdx = 0;
    this.completedMilestones = [];
    this.segmentStartX = MILESTONE_POSITIONS[0];
    this.finishTapeBroken = false;
    this.state = 'RUNNING';
    this.confettiParticles = [];
    this.paused = false;
    SoundController.playStayHard();
    this.updateHud();
  },

  updateHud() {
    const totalDist = 5.2;
    const curDist = Math.min(totalDist, Math.max(0, ((this.playerX - 300) / (14000 - 300)) * totalDist)).toFixed(1);
    document.getElementById('hudDistance').textContent = curDist + ' / 5.2 MI';

    // Milestone indicator pills
    const container = document.getElementById('milestonePills');
    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const isDone = this.completedMilestones.includes(i);
      const isCur = this.currentMilestoneIdx === i - 1;
      const pill = document.createElement('div');
      pill.style.cssText = 'width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; border: 1px solid; ' +
        (isDone ? 'background: #10b981; color: #020617; border-color: #34d399;' :
         isCur ? 'background: #f59e0b; color: #020617; border-color: #fbbf24;' :
         'background: #1e293b; color: #64748b; border-color: #334155;');
      pill.textContent = isDone ? '✓' : i;
      container.appendChild(pill);
    }
  },

  showQuiz() {
    this.state = 'CHECKPOINT';
    this.runnerState = 'idle';
    document.getElementById('hudStatusTag').textContent = 'CHECKPOINT REACHED';
    document.getElementById('hudStatusTag').style.borderColor = 'rgba(245, 158, 11, 0.4)';
    document.getElementById('hudStatusTag').style.color = '#fbbf24';

    const q = QUESTIONS[this.currentMilestoneIdx];
    document.getElementById('quizMilestoneHeader').textContent = q.title;
    document.getElementById('quizTopic').textContent = q.topic;
    document.getElementById('quizProgressNum').textContent = this.completedMilestones.length;
    document.getElementById('quizQuestionText').textContent = q.question;

    const grid = document.getElementById('quizOptionsGrid');
    grid.innerHTML = '';
    const feedback = document.getElementById('quizFeedback');
    feedback.style.display = 'none';

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.cssText = 'padding: 14px 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; text-align: left; font-size: 14px;';
      btn.innerHTML = '<span style="width: 28px; height: 28px; border-radius: 8px; background: rgba(51, 65, 85, 0.6); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px;">' + opt.key + '</span><span style="flex: 1;">' + opt.text + '</span>';
      btn.onclick = () => this.handleAnswer(opt.key);
      grid.appendChild(btn);
    });

    document.getElementById('quizOverlay').style.display = 'flex';
  },

  handleAnswer(selectedKey) {
    const q = QUESTIONS[this.currentMilestoneIdx];
    const isCorrect = selectedKey === q.correctAnswer;
    const feedback = document.getElementById('quizFeedback');

    if (isCorrect) {
      SoundController.playChime();
      feedback.style.display = 'block';
      feedback.style.background = 'rgba(16, 185, 129, 0.2)';
      feedback.style.border = '1px solid #10b981';
      feedback.style.color = '#6ee7b7';
      feedback.textContent = '✓ Correct! Keep going! Tiếp tục chạy thẳng!';

      // Spawn small confetti
      for (let i = 0; i < 40; i++) {
        this.confettiParticles.push({
          x: this.playerX, y: 400,
          vx: (Math.random() - 0.5) * 8, vy: -Math.random() * 8,
          color: ['#10b981', '#34d399', '#f59e0b', '#ffffff'][Math.floor(Math.random() * 4)],
          life: 1.0
        });
      }

      setTimeout(() => {
        document.getElementById('quizOverlay').style.display = 'none';
        this.completedMilestones.push(q.id);
        if (this.currentMilestoneIdx < 4) {
          this.currentMilestoneIdx++;
          this.segmentStartX = MILESTONE_POSITIONS[this.currentMilestoneIdx];
          this.runnerState = 'running';
          this.state = 'RUNNING';
          document.getElementById('hudStatusTag').textContent = 'RUNNING';
          document.getElementById('hudStatusTag').style.color = '#34d399';
        } else {
          // Final Sprint!
          this.runnerState = 'sprinting';
          this.state = 'FINISH_SPRINT';
          document.getElementById('hudStatusTag').textContent = 'FINAL SPRINT!';
          document.getElementById('hudStatusTag').style.color = '#38bdf8';
        }
        this.updateHud();
      }, 1100);

    } else {
      SoundController.playBuzzer();
      SoundController.playVoicemodFail();
      feedback.style.display = 'block';
      feedback.style.background = 'rgba(225, 29, 72, 0.25)';
      feedback.style.border = '1px solid #f43f5e';
      feedback.style.color = '#fda4af';
      feedback.textContent = '✕ Not quite! Run it again! Quay đầu chạy lại chặng này!';

      setTimeout(() => {
        document.getElementById('quizOverlay').style.display = 'none';
        this.facingRight = false;
        this.runnerState = 'running';
        this.state = 'RETURNING';
        document.getElementById('hudStatusTag').textContent = 'RERUNNING SEGMENT';
        document.getElementById('hudStatusTag').style.color = '#fb7185';
      }, 1400);
    }
  },

  showVictory() {
    this.state = 'VICTORY';
    document.getElementById('hud').style.display = 'none';
    const vScreen = document.getElementById('victoryScreen');
    vScreen.style.display = 'flex';
    // Synchronize the appearance of "STAY HARD" with the audio playback!
    SoundController.playStayHard();
  },

  loop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (!this.paused) {
      const speed = 420 * this.speedMultiplier;

      if (this.state === 'RUNNING') {
        const targetX = MILESTONE_POSITIONS[this.currentMilestoneIdx + 1];
        this.playerX += speed * dt;
        this.gogginsX += speed * dt;
        this.runCycle += dt * 9 * this.speedMultiplier;

        if (this.playerX >= targetX) {
          this.playerX = targetX;
          this.gogginsX = targetX + 45;
          this.showQuiz();
        }
        this.updateHud();

      } else if (this.state === 'RETURNING') {
        const targetStart = this.segmentStartX;
        this.playerX -= speed * 1.15 * dt;
        this.gogginsX -= speed * 1.15 * dt;
        this.runCycle += dt * 9 * this.speedMultiplier;

        if (this.playerX <= targetStart) {
          this.playerX = targetStart;
          this.gogginsX = targetStart + 45;
          this.facingRight = true;
          this.state = 'RUNNING';
          document.getElementById('hudStatusTag').textContent = 'RUNNING';
          document.getElementById('hudStatusTag').style.color = '#34d399';
        }
        this.updateHud();

      } else if (this.state === 'FINISH_SPRINT') {
        const sprintSpeed = speed * 1.35;
        const finishX = MILESTONE_POSITIONS[6];
        this.playerX += sprintSpeed * dt;
        this.gogginsX += sprintSpeed * 1.05 * dt;
        this.runCycle += dt * 14 * this.speedMultiplier;

        if (this.playerX >= finishX && !this.finishTapeBroken) {
          this.finishTapeBroken = true;
          this.runnerState = 'celebrating';
          SoundController.playFinishHorn();

          // Confetti explosion
          for (let i = 0; i < 120; i++) {
            this.confettiParticles.push({
              x: finishX, y: 390,
              vx: Math.random() * 10 + 2, vy: (Math.random() - 0.7) * 10,
              color: ['#f59e0b', '#ef4444', '#10b981', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 5)],
              life: 1.2
            });
          }

          setTimeout(() => {
            this.showVictory();
          }, 1400);
        }
      }
    }

    // Camera follow
    const targetCam = this.playerX + (this.facingRight ? 160 : -160);
    this.camX += (targetCam - this.camX) * Math.min(1, dt * 5);

    this.render();
    requestAnimationFrame(now => this.loop(now));
  },

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    // Dynamic Sky Gradient
    const progress = Math.max(0, Math.min(1, this.playerX / 14000));
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    if (progress < 0.25) {
      sky.addColorStop(0, '#1E293B'); sky.addColorStop(0.5, '#334155'); sky.addColorStop(0.85, '#EA580C'); sky.addColorStop(1, '#FDE047');
    } else if (progress < 0.5) {
      sky.addColorStop(0, '#0F172A'); sky.addColorStop(0.5, '#1E3A8A'); sky.addColorStop(0.85, '#38BDF8'); sky.addColorStop(1, '#BAE6FD');
    } else if (progress < 0.75) {
      sky.addColorStop(0, '#0B0F19'); sky.addColorStop(0.5, '#1E1B4B'); sky.addColorStop(0.85, '#4338CA'); sky.addColorStop(1, '#818CF8');
    } else {
      sky.addColorStop(0, '#18181B'); sky.addColorStop(0.5, '#7C2D12'); sky.addColorStop(0.8, '#C2410C'); sky.addColorStop(1, '#F59E0B');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Far mountains (Parallax 0.08)
    const farOff = -(this.camX * 0.08) % 800;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    for (let i = -1; i < 4; i++) {
      const bx = farOff + i * 800;
      ctx.beginPath();
      ctx.moveTo(bx, 360); ctx.lineTo(bx + 200, 220); ctx.lineTo(bx + 380, 280); ctx.lineTo(bx + 540, 190); ctx.lineTo(bx + 700, 270); ctx.lineTo(bx + 800, 360);
      ctx.fill();
    }

    // Mid trees / stadium (Parallax 0.3)
    const midOff = -(this.camX * 0.3) % 600;
    for (let i = -1; i < 4; i++) {
      const bx = midOff + i * 600;
      ctx.fillStyle = 'rgba(20, 30, 48, 0.65)';
      ctx.beginPath();
      ctx.arc(bx + 120, 320, 50, 0, Math.PI * 2);
      ctx.arc(bx + 170, 310, 65, 0, Math.PI * 2);
      ctx.arc(bx + 220, 330, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(bx + 165, 360, 12, 40);

      // Light pole
      ctx.fillStyle = '#334155'; ctx.fillRect(bx + 440, 200, 8, 200);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(bx + 420, 190, 48, 14);
    }

    // Ground Track
    const gGrad = ctx.createLinearGradient(0, 380, 0, h);
    gGrad.addColorStop(0, '#064E3B'); gGrad.addColorStop(0.18, '#991B1B'); gGrad.addColorStop(0.7, '#7F1D1D'); gGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = gGrad;
    ctx.fillRect(0, 380, w, h - 380);

    // Track lane stripes
    ctx.save();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.setLineDash([25, 20]);
    ctx.lineDashOffset = (this.camX - w / 2) * 0.95;
    ctx.beginPath(); ctx.moveTo(0, 420); ctx.lineTo(w, 420); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 465); ctx.lineTo(w, 465); ctx.stroke();
    ctx.restore();

    // World milestones
    const screenCenter = w / 2;

    // Start Gate
    const sScreen = MILESTONE_POSITIONS[0] - this.camX + screenCenter;
    if (sScreen > -200 && sScreen < w + 200) {
      ctx.fillStyle = '#0F172A'; ctx.fillRect(sScreen - 15, 230, 26, 170);
      ctx.fillStyle = '#1E293B'; ctx.fillRect(sScreen - 120, 220, 240, 42);
      ctx.strokeStyle = '#06B6D4'; ctx.lineWidth = 3; ctx.strokeRect(sScreen - 120, 220, 240, 42);
      ctx.fillStyle = '#FFFFFF'; ctx.font = '900 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('STARTING LINE', sScreen, 245);
      ctx.fillStyle = '#67E8F9'; ctx.font = 'bold 11px monospace'; ctx.fillText('0.0 MILES · BEGIN CHALLENGE', sScreen, 258);
    }

    // Milestones 1 to 5
    for (let m = 1; m <= 5; m++) {
      const mx = MILESTONE_POSITIONS[m];
      const ms = mx - this.camX + screenCenter;
      if (ms > -250 && ms < w + 250) {
        const info = MILESTONE_NAMES[m - 1];
        ctx.fillStyle = '#1E293B'; ctx.fillRect(ms - 14, 210, 28, 190);
        ctx.fillStyle = info.color; ctx.fillRect(ms - 4, 220, 8, 170);
        ctx.fillStyle = '#0F172A'; ctx.fillRect(ms - 130, 195, 260, 52);
        ctx.strokeStyle = info.color; ctx.lineWidth = 3; ctx.strokeRect(ms - 130, 195, 260, 52);

        ctx.beginPath(); ctx.arc(ms, 195, 24, 0, Math.PI * 2);
        ctx.fillStyle = info.color; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '900 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(m.toString(), ms, 201);

        ctx.font = '900 14px sans-serif'; ctx.fillStyle = '#FFFFFF';
        ctx.fillText('MILESTONE ' + m, ms, 224);
        ctx.font = 'bold 10px monospace'; ctx.fillStyle = info.color;
        ctx.fillText(info.label, ms, 238);
      }
    }

    // Finish Gate
    const fScreen = MILESTONE_POSITIONS[6] - this.camX + screenCenter;
    if (fScreen > -300 && fScreen < w + 300) {
      ctx.fillStyle = '#18181B'; ctx.fillRect(fScreen - 16, 170, 32, 230);
      ctx.fillStyle = '#F59E0B'; ctx.fillRect(fScreen - 10, 180, 20, 215);
      ctx.fillStyle = '#09090B'; ctx.fillRect(fScreen - 160, 150, 320, 60);
      ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 4; ctx.strokeRect(fScreen - 160, 150, 320, 60);
      ctx.fillStyle = '#F59E0B'; ctx.font = '900 22px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('★ FINISH LINE ★', fScreen, 182);
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 12px monospace';
      ctx.fillText('5.2 MILES · VICTORY ZONE', fScreen, 199);

      if (!this.finishTapeBroken) {
        ctx.fillStyle = '#DC2626'; ctx.fillRect(fScreen - 3, 400, 6, 90);
      }
    }

    // Confetti particles
    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const p = this.confettiParticles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= 0.015;
      if (p.life <= 0) { this.confettiParticles.splice(i, 1); continue; }
      const ps = p.x - this.camX + screenCenter;
      ctx.fillStyle = p.color;
      ctx.fillRect(ps, p.y, 8, 5);
    }

    // Runners
    const cycle = this.runCycle;
    this.drawGoggins(ctx, this.gogginsX - this.camX + screenCenter, 410, this.facingRight, this.runnerState, cycle);
    this.drawPlayer(ctx, this.playerX - this.camX + screenCenter, 450, this.facingRight, this.runnerState, cycle);
  },

  drawGoggins(ctx, x, y, facingRight, state, cycle) {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) ctx.scale(-1, 1);

    const isRunning = ['running', 'sprinting', 'celebrating'].includes(state);
    const isCelebrating = state === 'celebrating';
    const bounce = isRunning ? Math.abs(Math.sin(cycle * 2)) * 6 : 0;
    const stride = isRunning ? Math.sin(cycle) : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 32, isRunning ? 26 : 20, 7, 0, 0, Math.PI * 2); ctx.fill();

    ctx.translate(0, -bounce);

    // Legs
    const skin = '#8D5B4C', shorts = '#27272A', shoe = '#0284C7';
    // Back leg
    this.drawLeg(ctx, stride * 0.7, stride > 0 ? stride * 0.8 : 0.2, skin, shorts, shoe, -4);
    // Front leg
    this.drawLeg(ctx, -stride * 0.7, stride < 0 ? -stride * 0.8 : 0.2, skin, shorts, shoe, 4);

    // Torso
    ctx.fillStyle = '#18181B';
    ctx.beginPath(); ctx.roundRect(-14, -40, 28, 42, 6); ctx.fill();
    ctx.fillStyle = '#EF4444'; ctx.fillRect(-6, -24, 12, 3); // STAY HARD logo

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(2, -54, 13, 0, Math.PI * 2); ctx.fill();
    // Headband
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-11, -61, 26, 6);

    // Arms
    const armAngle = isRunning ? Math.cos(cycle) * 0.9 : 0;
    this.drawArm(ctx, -armAngle, skin, '#18181B', -10, isCelebrating);
    this.drawArm(ctx, armAngle, skin, '#18181B', 10, isCelebrating);

    ctx.restore();
  },

  drawPlayer(ctx, x, y, facingRight, state, cycle) {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) ctx.scale(-1, 1);

    const isRunning = ['running', 'sprinting', 'celebrating'].includes(state);
    const isCelebrating = state === 'celebrating';
    const bounce = isRunning ? Math.abs(Math.sin(cycle * 2 + 0.3)) * 6 : 0;
    const stride = isRunning ? Math.sin(cycle + 0.3) : 0;

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 32, isRunning ? 24 : 18, 6, 0, 0, Math.PI * 2); ctx.fill();

    ctx.translate(0, -bounce);

    const skin = '#FBBF24', shorts = '#0F172A', shoe = '#10B981';
    this.drawLeg(ctx, stride * 0.7, stride > 0 ? stride * 0.8 : 0.2, skin, shorts, shoe, -4);
    this.drawLeg(ctx, -stride * 0.7, stride < 0 ? -stride * 0.8 : 0.2, skin, shorts, shoe, 4);

    // Teal shirt
    ctx.fillStyle = '#0D9488';
    ctx.beginPath(); ctx.roundRect(-12, -38, 24, 40, 5); ctx.fill();

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(1, -52, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#14B8A6'; ctx.fillRect(-11, -58, 24, 5); // Headband

    const armAngle = isRunning ? Math.cos(cycle + 0.3) * 0.85 : 0;
    this.drawArm(ctx, -armAngle, skin, '#0D9488', -8, isCelebrating);
    this.drawArm(ctx, armAngle, skin, '#0D9488', 8, isCelebrating);

    ctx.restore();
  },

  drawLeg(ctx, hip, knee, skin, shorts, shoe, ox) {
    ctx.save();
    ctx.translate(ox, 0); ctx.rotate(hip);
    ctx.fillStyle = shorts; ctx.fillRect(-5, 0, 10, 14);
    ctx.fillStyle = skin; ctx.fillRect(-4, 14, 8, 8);
    ctx.translate(0, 22); ctx.rotate(knee);
    ctx.fillStyle = skin; ctx.fillRect(-3.5, 0, 7, 18);
    ctx.fillStyle = shoe; ctx.beginPath(); ctx.roundRect(-4, 16, 15, 7, 3); ctx.fill();
    ctx.restore();
  },

  drawArm(ctx, angle, skin, sleeve, ox, celebrating) {
    ctx.save();
    ctx.translate(ox, -30);
    ctx.rotate(celebrating ? -2.2 : angle);
    ctx.fillStyle = sleeve; ctx.fillRect(-4, 0, 8, 8);
    ctx.fillStyle = skin; ctx.fillRect(-3.5, 6, 7, 14);
    ctx.translate(0, 18); ctx.rotate(celebrating ? -0.4 : 1.3);
    ctx.fillStyle = skin; ctx.fillRect(-3, 0, 6, 15);
    ctx.restore();
  }
};

window.onload = () => Game.init();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../public/get-up-and-get-strong.html'), htmlContent);
console.log('Successfully generated public/get-up-and-get-strong.html, size:', htmlContent.length);
