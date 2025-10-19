const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const boom = new Audio("crackers.mp3");
const whoosh = new Audio("boom.mp3");
const bgMusic = new Audio("jethalal _happy Diwali _shorts_(MP3_160K).mp3");
bgMusic.loop = true;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

/* ===== Lights Generation ===== */
const lightsContainer = document.getElementById("lights");
const colors = ["red", "yellow", "green", "blue", "pink", "orange"];
for (let i = 0; i < 25; i++) {
  const bulb = document.createElement("div");
  bulb.classList.add("light");
  bulb.style.setProperty("--color", colors[i % colors.length]);
  lightsContainer.appendChild(bulb);
}

/* ===== Fireworks System ===== */
let particles = [];
function launchFirework(x, y) {
  boom.cloneNode().play();
  for (let i = 0; i < 50; i++) {
    particles.push({
      x, y,
      radius: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      speed: Math.random() * 5 + 2,
      angle: Math.random() * Math.PI * 2,
      alpha: 1
    });
  }
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    const vx = Math.cos(p.angle) * p.speed;
    const vy = Math.sin(p.angle) * p.speed + 1;
    p.x += vx;
    p.y += vy;
    p.alpha -= 0.015;
    if (p.alpha <= 0) particles.splice(i, 1);
    ctx.beginPath();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(animate);
}
animate();

/* ===== Buttons ===== */
document.getElementById("launchBurst").onclick = () => {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      launchFirework(Math.random() * canvas.width, Math.random() * canvas.height / 2);
    }, i * 300);
  }
};

document.getElementById("launchRocket").onclick = () => {
  for (let i = 0; i < 3; i++) setTimeout(launchRocket, i * 400);
};

document.getElementById("toggleMusic").onclick = () => {
  if (bgMusic.paused) {
    bgMusic.play();
    document.getElementById("toggleMusic").innerText = "Pause Music 🎶";
  } else {
    bgMusic.pause();
    document.getElementById("toggleMusic").innerText = "Play Music 🎵";
  }
};

document.getElementById("shareBtn").onclick = async () => {
  await navigator.share({
    title: "Happy Diwali 🎆",
    text: "Celebrate Diwali with fireworks and joy!",
    url: window.location.href
  });
};

let auto = false, interval;
document.getElementById("autoFireworks").onclick = () => {
  auto = !auto;
  const btn = document.getElementById("autoFireworks");
  if (auto) {
    btn.textContent = "Auto Crackers: On";
    interval = setInterval(() => {
      launchFirework(Math.random() * canvas.width, Math.random() * canvas.height / 2);
    }, 800);
  } else {
    btn.textContent = "Auto Crackers: Off";
    clearInterval(interval);
  }
};

/* ===== Rocket Function ===== */
function launchRocket() {
  const rocket = document.createElement("div");
  rocket.className = "rocket";
  rocket.style.left = Math.random() * 90 + 5 + "%";
  document.body.appendChild(rocket);
  whoosh.cloneNode().play();

  setTimeout(() => {
    rocket.remove();
    launchFirework(Math.random() * canvas.width, Math.random() * canvas.height / 3);
  }, 1800);
}

/* ===== Click Anywhere for Fireworks ===== */
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  launchFirework(x, y);
});





















