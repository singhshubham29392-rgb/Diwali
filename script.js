const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
function resize() { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
window.addEventListener("resize", resize); resize();

let fireworks = [];
let colors = ['#ffcc33','#ff3366','#33ff99','#66ccff','#ff9933'];

const boom = new Audio('crackers.mp3');
const whoosh = new Audio('https://cdn.pixabay.com/download/audio/2021/09/15/audio_76e08f5d17.mp3?filename=rocket-fly-2.mp3');
const music = new Audio('song.mp3');
music.loop = true;

let musicOn=false;
document.getElementById("toggleMusic").onclick=()=>{
  if(!musicOn){ music.play(); musicOn=true; document.getElementById("toggleMusic").textContent="Pause Music"; }
  else{ music.pause(); musicOn=false; document.getElementById("toggleMusic").textContent="Play Music"; }
};

class Firework {
  constructor(x, y, color) {
    this.particles=[];
    for(let i=0;i<50;i++){
      this.particles.push({x,y,angle:Math.random()*Math.PI*2,speed:Math.random()*5+2,alpha:1,color});
    }
  }
  update(){
    this.particles.forEach(p=>{
      p.x+=Math.cos(p.angle)*p.speed;
      p.y+=Math.sin(p.angle)*p.speed;
      p.speed*=0.96;
      p.alpha-=0.02;
    });
    this.particles=this.particles.filter(p=>p.alpha>0);
  }
  draw(){
    this.particles.forEach(p=>{
      ctx.globalAlpha=p.alpha;
      ctx.fillStyle=p.color;
      ctx.beginPath();
      ctx.arc(p.x,p.y,2,0,Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha=1;
  }
}

function launchFirework(x,y){
  fireworks.push(new Firework(x,y,colors[Math.floor(Math.random()*colors.length)]));
  boom.cloneNode().play();
}

function animate(){
  ctx.fillStyle="rgba(0,0,0,0.2)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  fireworks.forEach(f=>{f.update();f.draw();});
  fireworks=fireworks.filter(f=>f.particles.length>0);
  requestAnimationFrame(animate);
}
animate();

// ==== Rocket Function ====
function launchRocket(){
  const rocket=document.createElement("div");
  rocket.className="rocket";
  rocket.style.left=Math.random()*90+5+"%";
  document.body.appendChild(rocket);
  whoosh.cloneNode().play();
  setTimeout(()=>{
    rocket.remove();
    launchFirework(Math.random()*canvas.width,Math.random()*canvas.height/3);
  },2000);
}
document.getElementById("launchRocket").onclick=()=>{ 
  for(let i=0;i<3;i++) setTimeout(launchRocket,i*400); 
};

// Auto Fireworks
let auto=false,int;
document.getElementById("autoFireworks").onclick=()=>{
  auto=!auto;
  const btn=document.getElementById("autoFireworks");
  if(auto){
    btn.textContent="Auto Crackers: On";
    int=setInterval(()=>launchFirework(Math.random()*canvas.width,Math.random()*canvas.height/2),800);
  }else{
    btn.textContent="Auto Crackers: Off";
    clearInterval(int);
  }
};

// Countdown
const countdown=document.getElementById("countdown");
const target=new Date("2025-10-20T00:00:00");
let celebration=false;
function updateCountdown(){
  const diff=target-new Date();
  if(diff<=0 && !celebration) celebrate();
  if(diff<=0)return;
  const d=Math.floor(diff/86400000),
        h=Math.floor(diff/3600000)%24,
        m=Math.floor(diff/60000)%60,
        s=Math.floor(diff/1000)%60;
  countdown.textContent=`${d}d ${h}h ${m}m ${s}s`;
}
setInterval(updateCountdown,1000);updateCountdown();

function celebrate(){
  celebration=true;
  document.getElementById("celebrationBanner").style.opacity=1;
  music.play();
  setInterval(()=>launchFirework(Math.random()*canvas.width,Math.random()*canvas.height/2),400);
}

// Share
document.getElementById("shareBtn").onclick=async()=>{
  const data={title:"Happy Diwali 🎆",text:"Celebrate Diwali with fireworks and joy!",url:window.location.href};
  if(navigator.share) await navigator.share(data);
  else alert("Sharing not supported on this browser");
};
















