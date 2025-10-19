const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
function resize() { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
window.addEventListener("resize", resize); resize();

let fireworks = [];
let palette = ['#ffcc33','#ff3366','#33ff99','#66ccff','#ff9933'];
let autoMode = false;

// === Sounds ===
const crack = new Audio('crackers.mp3');
const boom = new Audio('crackers.mp3');
crack.volume = boom.volume = 0.5;

// === Music ===
const bgMusic = new Audio('song.mp3');
bgMusic.loop = true;
let musicPlaying = false;
document.getElementById("toggleMusic").onclick = () => {
  if (!musicPlaying) { bgMusic.play(); document.getElementById("toggleMusic").textContent = "Pause Music"; }
  else { bgMusic.pause(); document.getElementById("toggleMusic").textContent = "Play Music"; }
  musicPlaying = !musicPlaying;
};

// === Fireworks ===
class Firework {
  constructor(x, y, color) {
    this.particles = [];
    for (let i=0;i<50;i++) {
      this.particles.push({
        x, y,
        angle: Math.random()*Math.PI*2,
        speed: Math.random()*5+2,
        alpha: 1,
        color
      });
    }
  }
  update() {
    this.particles.forEach(p=>{
      p.x += Math.cos(p.angle)*p.speed;
      p.y += Math.sin(p.angle)*p.speed;
      p.speed *= 0.96;
      p.alpha -= 0.02;
    });
    this.particles = this.particles.filter(p=>p.alpha>0);
  }
  draw() {
    this.particles.forEach(p=>{
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x,p.y,2,0,Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}
function launchFirework(x, y, sound="crack") {
  const color = palette[Math.floor(Math.random()*palette.length)];
  fireworks.push(new Firework(x,y,color));
  (sound==="boom"?boom:crack).cloneNode().play();
}
document.getElementById("launchBurst").onclick = ()=> {
  for (let i=0;i<3;i++)
    launchFirework(Math.random()*canvas.width,Math.random()*canvas.height/2,"boom");
};
canvas.addEventListener("click", e=>{
  const rect = canvas.getBoundingClientRect();
  launchFirework(e.clientX-rect.left,e.clientY-rect.top);
});
// ==== Rocket Launch ====
function launchRocket() {
  const rocket = document.createElement("div");
  rocket.className = "rocket";
  rocket.style.left = Math.random() * 90 + "vw";
  document.body.appendChild(rocket);

  // When rocket reaches top, explode into fireworks
  setTimeout(() => {
    const rect = rocket.getBoundingClientRect();
    launchFirework(rect.left, window.innerHeight * 0.1, "boom");
    rocket.remove();
  }, 1800);
}

// Multiple rockets launcher
function launchMultipleRockets() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => launchRocket(), i * 300);
  }
}

document.getElementById("launchRockets").onclick = launchMultipleRockets;


// === Auto Fireworks Toggle ===
document.getElementById("autoFireworks").onclick = () => {
  autoMode = !autoMode;
  document.getElementById("autoFireworks").textContent = `Auto Fireworks: ${autoMode ? 'On' : 'Off'}`;
};
setInterval(() => {
  if (autoMode) launchFirework(Math.random()*canvas.width,Math.random()*canvas.height/2,"boom");
}, 600);

// === Animation Loop ===
function animate() {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  fireworks.forEach(f=>{ f.update(); f.draw(); });
  fireworks = fireworks.filter(f=>f.particles.length>0);
  requestAnimationFrame(animate);
}
animate();

// === Countdown ===
const countdown = document.getElementById("countdown");
const targetDate = new Date("2025-10-20T00:00:00");
let celebrationMode = false;
function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;
  if (diff <= 0 && !celebrationMode) startCelebration();
  if (diff <= 0) return;
  const d = Math.floor(diff/(1000*60*60*24));
  const h = Math.floor((diff/(1000*60*60))%24);
  const m = Math.floor((diff/(1000*60))%60);
  const s = Math.floor((diff/1000)%60);
  countdown.textContent = `${d}d ${h}h ${m}m ${s}s`;
}
setInterval(updateCountdown,1000);
updateCountdown();

// ==== Celebration Mode ====
function startCelebration() {
  celebrationMode = true;
  countdown.textContent = "🎉 Happy Diwali! 🎉";

  // Bright festive background
  document.body.style.background = "linear-gradient(45deg, #ff6a00, #ee0979, #ffeb3b)";
  document.body.style.transition = "background 2s ease-in-out";

  // Show glowing banner
  const banner = document.getElementById("celebrationBanner");
  banner.style.opacity = 1;
  banner.innerHTML = "🪔✨ Happy Diwali! ✨🪔";
  banner.style.textShadow = "0 0 40px gold, 0 0 80px orange";

  // Play background music
  bgMusic.play();
  musicPlaying = true;

  // Continuous fireworks
  setInterval(() => {
    launchFirework(Math.random() * canvas.width, Math.random() * canvas.height / 2, "boom");
  }, 400);

  // Floating diyas and sparkles
  setInterval(() => {
    const emojiList = ["🪔", "🎇", "🎆", "✨", "💥"];
    const e = document.createElement("div");
    e.className = "floating-emoji";
    e.textContent = emojiList[Math.floor(Math.random() * emojiList.length)];
    e.style.left = Math.random() * 100 + "vw";
    e.style.fontSize = (20 + Math.random() * 25) + "px";
    e.style.filter = "drop-shadow(0 0 10px gold)";
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 4000);
  }, 300);

  // Add glowing border animation
  document.querySelector(".card").style.boxShadow = "0 0 40px gold, 0 0 100px orange";
}


// === Share Button ===
document.getElementById("shareBtn").onclick = async () => {
  const shareData = {
    title: "Happy Diwali 🎆",
    text: "Celebrate Diwali with me! 🪔✨",
    url: window.location.href
  };
  if (navigator.share) {
    await navigator.share(shareData);
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  }
};















