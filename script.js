const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    let fireworks = [];
    let auto = false;
    let palette = ['#ffcc33','#ff3366','#33ff99','#66ccff','#ff9933'];

    // 🔊 Load firecracker sounds
    const crackleSounds = [
      new Audio('sound.mp3'),
      new Audio('sound.mp3'),
    ];
    const boomSounds = [
      new Audio('sound.mp3'),
      new Audio('sound.mp3'),
    ];

    crackleSounds.forEach(s => s.volume = 0.4);
    boomSounds.forEach(s => s.volume = 0.5);

    function playSound(type = 'crackle') {
      const list = type === 'boom' ? boomSounds : crackleSounds;
      const s = list[Math.floor(Math.random() * list.length)];
      const clone = s.cloneNode();
      clone.volume = s.volume;
      clone.play().catch(() => {});
    }

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function random(min, max) { return Math.random() * (max - min) + min; }

    class Firework {
      constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.particles = [];
        for (let i = 0; i < 50; i++) {
          this.particles.push({
            x: x, y: y,
            angle: Math.random() * Math.PI * 2,
            speed: random(1, 6),
            alpha: 1
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
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
    }

    function launchFirework(x, y, soundType = 'crackle') {
      const color = palette[Math.floor(Math.random() * palette.length)];
      fireworks.push(new Firework(x, y, color));
      playSound(soundType);
    }

    function animate() {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      fireworks.forEach(fw => { fw.update(); fw.draw(); });
      fireworks = fireworks.filter(fw => fw.particles.length > 0);
      requestAnimationFrame(animate);
    }
    animate();

    // click → small crackle sound
    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      launchFirework(e.clientX - rect.left, e.clientY - rect.top, 'crackle');
      document.getElementById('touchHint').classList.add('hidden');
    });

    // burst → boom sound
    document.getElementById('launchBurst').onclick = () => {
      playSound('boom');
      for (let i = 0; i < 3; i++)
        launchFirework(random(0, canvas.width), random(0, canvas.height / 2));
    };

    document.getElementById('autoToggle').onclick = () => {
      auto = !auto;
      document.getElementById('autoToggle').textContent = `Auto Fireworks: ${auto ? 'On' : 'Off'}`;
    };

    setInterval(() => {
      if (auto) {
        const isBig = Math.random() > 0.6;
        const soundType = isBig ? 'boom' : 'crackle';
        launchFirework(random(0, canvas.width), random(0, canvas.height / 2), soundType);
      }
    }, 600);

    document.getElementById('changePalette').onclick = () => { palette = palette.reverse(); };

    document.getElementById('shareBtn').onclick = async () => {
      const shareData = { title: 'Happy Diwali', text: 'Celebrate Diwali with me! 🎆', url: window.location.href };
      if (navigator.share) await navigator.share(shareData);
      else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
    };

    const countdown = document.getElementById('countdown');
    const targetDate = new Date('2025-10-20T00:00:00');
    function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        countdown.textContent = '🎉 Happy Diwali! 🎉';
        playSound('boom');
        for (let i = 0; i < 5; i++)
          launchFirework(random(0, canvas.width), random(0, canvas.height / 2), 'boom');
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      countdown.textContent = `${d}d ${h}h ${m}m ${s}s`;
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();
