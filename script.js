/* --------- Setup --------- */
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
function resize() { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
window.addEventListener("resize", resize);
resize();

let fireworks = [];
const palette = ['#ffcc33','#ff3366','#33ff99','#66ccff','#ff9933'];

/* --------- Sounds & Music (safe play) --------- */
const crackUrl = 'crackers.mp3';
const boomUrl = 'crackers.mp3';
const musicUrl = 'song.mp3';

function makeAudio(url, volume=0.4) {
  const a = new Audio(url);
  a.volume = volume;
  return a;
}
const crack = makeAudio(crackUrl, 0.4);
const boom = makeAudio(boomUrl, 0.45);
const bgMusic = makeAudio(musicUrl, 0.45);
bgMusic.loop = true;
let musicPlaying = false;

/* Toggle music safely — user click will allow playback */
document.getElementById("toggleMusic").addEventListener("click", async () => {
  try {
    if (!musicPlaying) {
      await bgMusic.play();
      document.getElementById("toggleMusic").textContent = "Pause Music";
      musicPlaying = true;
    } else {
      bgMusic.pause();
      document.getElementById("toggleMusic").textContent = "Play Music";
      musicPlaying = false;
    }
  } catch (e) {
    // autoplay / user gesture issue — ignore silently
    console.warn("Music play failed:", e);
  }
});

/* --------- Firework implementation --------- */
class Firework {
  constructor(x, y, color) {
    this.particles = [];
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x, y,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 6 + 1.5,
        alpha: 1,
        color
      });
    }
  }
  update() {
    this.particles.forEach(p => {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.speed *= 0.96;
      p.alpha -= 0.02;
    });
    this.particles = this.particles.filter(p => p.alpha > 0);
  }
  draw() {
    this.particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}

/* play sound with clone to allow overlapping */
function playSound(soundAudio) {
  try {
    const s = soundAudio.cloneNode();
    s.volume = soundAudio.volume;
    s.play().catch(() => {}); // swallow play error
  } catch (e) { console.warn("playSound error", e); }
}

function launchFirework(x, y, type = "crack") {
  const color = palette[Math.floor(Math.random() * palette.length)];
  fireworks.push(new Firework(x, y, color));
  playSound(type === "boom" ? boom : crack);
}

/* click canvas to launch small firework */
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  launchFirework(e.clientX - rect.left, e.clientY - rect.top, 'crack');
});

/* launch burst button */
document.getElementById("launchBurst").addEventListener("click", () => {
  for (let i = 0; i < 4; i++) {
    launchFirework(Math.random() * canvas.width, Math.random() * (canvas.height / 2), 'boom');
  }
});

/* --------- Auto Crackers toggle (the fix) --------- */
let autoCrackersOn = false;
let autoCrackersInterval = null;

const autoBtn = document.getElementById("autoCrackers");
if (autoBtn) {
  autoBtn.addEventListener("click", () => {
    // Toggle state
    autoCrackersOn = !autoCrackersOn;
    if (autoCrackersOn) {
      autoBtn.textContent = "Auto Crackers: ON";
      // launch patterns: mixed booms + crackles
      autoCrackersInterval = setInterval(() => {
        // occasionally create small bursts vs big booms
        const isBig = Math.random() < 0.5;
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height / 2);
        launchFirework(x, y, isBig ? "boom" : "crack");
        // sometimes launch a small cluster nearby
        if (Math.random() < 0.25) {
          for (let k = 0; k < 2; k++) {
            launchFirework(x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 40, "crack");
          }
        }
      }, 450); // every 450ms
    } else {
      autoBtn.textContent = "Auto Crackers: OFF";
      if (autoCrackersInterval) { clearInterval(autoCrackersInterval); autoCrackersInterval = null; }
    }
    // user interaction — allow audio autoplay for sounds (some browsers require gesture)
    try { crack.play().then(()=>crack.pause()).catch(()=>{}); } catch(e){/* ignore */ }
  });
} else {
  console.warn("Auto Crackers button not found (id mismatch).");
}

/* --------- Animation loop --------- */
function animate() {
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  fireworks.forEach(f => { f.update(); f.draw(); });
  fireworks = fireworks.filter(f => f.particles.length > 0);
  requestAnimationFrame(animate);
}
animate();

/* --------- Countdown + celebration --------- */
const countdown = document.getElementById("countdown");
const targetDate = new Date("2025-10-20T00:00:00");
let celebrationMode = false;
let celebrationFireworkInterval = null;
let floatingEmojiInterval = null;

function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;
  if (diff <= 0 && !celebrationMode) startCelebration();
  if (diff <= 0) return;
  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  countdown.textContent = `${d}d ${h}h ${m}m ${s}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

function startCelebration() {
  celebrationMode = true;
  countdown.textContent = "🎉 Happy Diwali! 🎉";
  document.body.style.background = "linear-gradient(45deg,#ff4081,#ffeb3b,#ff9800)";
  document.getElementById("celebrationBanner").style.opacity = "1";
  bgMusic.play().catch(()=>{});
  musicPlaying = true;

  // ensure any existing autoCrackers keep running; also start a celebration-specific interval
  if (!celebrationFireworkInterval) {
    celebrationFireworkInterval = setInterval(() => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height / 2);
      launchFirework(x, y, Math.random() < 0.6 ? "boom" : "crack");
    }, 360);
  }

  if (!floatingEmojiInterval) {
    floatingEmojiInterval = setInterval(() => {
      const emojiList = ["🪔","🎆","🎇","💥","✨"];
      const e = document.createElement("div");
      e.className = "floating-emoji";
      e.textContent = emojiList[Math.floor(Math.random() * emojiList.length)];
      e.style.left = Math.random() * 100 + "vw";
      e.style.fontSize = (20 + Math.random() * 30) + "px";
      document.body.appendChild(e);
      setTimeout(() => e.remove(), 4200);
    }, 280);
  }
}

/* --------- Clean up on page unload --------- */
window.addEventListener("beforeunload", () => {
  if (autoCrackersInterval) clearInterval(autoCrackersInterval);
  if (celebrationFireworkInterval) clearInterval(celebrationFireworkInterval);
  if (floatingEmojiInterval) clearInterval(floatingEmojiInterval);
});

// ==== Share Button ====
document.getElementById("shareBtn").addEventListener("click", async () => {
  const shareData = {
    title: "🎆 Happy Diwali Celebration 🪔",
    text: "Join me in celebrating Diwali with fireworks and fun!",
    url: window.location.href
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      console.log("Shared successfully");
    } catch (err) {
      console.log("Share canceled or failed", err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied! 🎉 Share it with your friends.");
    } catch {
      prompt("Copy this link to share:", window.location.href);
    }
  }
});










