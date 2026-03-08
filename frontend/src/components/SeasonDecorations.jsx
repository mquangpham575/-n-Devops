import React, { useMemo, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

function DarkDecorations() {
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i,
    top: `${(i * 1.28 + 0.5) % 95}%`,
    left: `${(i * 1.27 + 1) % 99}%`,
    dur: `${1.5 + (i % 3)}s`,
    del: `${(i * 0.1) % 4}s`,
    sz: i % 10 === 0 ? 4 : i % 5 === 0 ? 3 : 2,
  })), []);

  return (
    <>
      {stars.map(s => (
        <div
          key={s.id}
          className="dark-star"
          style={{
            top: s.top,
            left: s.left,
            width: s.sz,
            height: s.sz,
            animationDuration: s.dur,
            animationDelay: s.del,
          }}
        />
      ))}
      <div style={{
        position: "fixed", top: -200, left: -200, width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(80,40,180,0.15), transparent 70%)",
        pointerEvents: "none", zIndex: 3,
        animation: "nebulaPulse 9s ease-in-out infinite",
      }} />
      <div style={{
        position: "fixed", bottom: -150, right: -150, width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,120,180,0.12), transparent 70%)",
        pointerEvents: "none", zIndex: 3,
        animation: "nebulaPulse 11s 3s ease-in-out infinite",
      }} />
    </>
  );
}

/* ═══════════════════════════════════════
   TẾT — Pháo hoa (canvas fireworks)
   ═══════════════════════════════════════ */
function TetDecorations() {
  const canvasRef = useRef(null);
  const audioRef  = useRef(null);
  const { volumeMap } = useTheme();

  // Background music
  useEffect(() => {
    const audio = new Audio('/sounds/tet.mp4');
    audio.loop   = true;
    audio.volume = volumeMap?.tet ?? 0.22;
    audioRef.current = audio;
    const tryPlay = () => audio.play().catch(() => {});
    tryPlay();
    document.addEventListener('click', tryPlay, { once: true });
    return () => {
      document.removeEventListener('click', tryPlay);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Sync volume when slider changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volumeMap?.tet ?? 0.22;
  }, [volumeMap?.tet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    let particles = [];   // sparks
    let rockets = [];     // ascending rockets
    let animId;
    let lastLaunch = 0;

    const PALETTES = [
      ["#ff0000", "#ff3300", "#ffc000", "#ffffff"],  // Tết: bright red-gold-white
      ["#ff1a1a", "#ff6644", "#ff9922", "#ffdd00"],  // red-gold warm
      ["#ff2288", "#ff66cc", "#cc22ff", "#ff99ff"],  // pink-purple
      ["#00cfff", "#44eeff", "#ffffff", "#aaffff"],  // ice blue
      ["#ffee00", "#ffaa00", "#ff6600", "#ff2200"],  // fire orange
    ];

    // Draw a glowing circle
    function glowCircle(x, y, r, color, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
      g.addColorStop(0, color);
      g.addColorStop(0.4, color);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function burst(x, y) {
      const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      // 4 types: 0=peony, 1=star, 2=chrysanthemum, 3=willow
      const type = Math.floor(Math.random() * 4);
      const n = type === 3 ? 55 : 52 + Math.floor(Math.random() * 26);

      // White flash
      particles.push({ flash: true, x, y, alpha: 1, decay: 0.08, r: 5 + Math.random() * 7, color: "#ffffff" });
      // Coloured halo
      particles.push({ flash: true, x, y, alpha: 0.55, decay: 0.035, r: 14 + Math.random() * 12, color: palette[0] });

      // Gold corona — 6 fast spike rays (gives a crown-flash look)
      for (let c = 0; c < 6; c++) {
        const a = (Math.PI * 2 / 6) * c + (Math.random() - 0.5) * 0.08;
        particles.push({
          x, y,
          vx: Math.cos(a) * (7 + Math.random() * 5),
          vy: Math.sin(a) * (7 + Math.random() * 5),
          alpha: 0.9, decay: 0.045,
          color: "#FFD700", size: 1.8,
          gravity: 0.018, trail: [], maxTrailLen: 4,
        });
      }

      for (let i = 0; i < n; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        let angle, speed, gravity, maxTrailLen, decay, size;
        if (type === 0) {
          // Peony: uniform sphere
          angle = (Math.PI * 2 / n) * i + (Math.random() - 0.5) * 0.22;
          speed = 2.8 + Math.random() * 4.5;
          gravity = 0.042; maxTrailLen = 5; decay = 0.011 + Math.random() * 0.013; size = 2 + Math.random() * 2;
        } else if (type === 1) {
          // Star: 5-arm burst
          const arm = Math.floor(i / (n / 5));
          angle = (Math.PI * 2 / 5) * arm + (Math.random() - 0.5) * 0.28;
          speed = (i % Math.ceil(n / 5) < 4) ? 5.5 + Math.random() * 3 : 1.8 + Math.random() * 2;
          gravity = 0.042; maxTrailLen = 5; decay = 0.011 + Math.random() * 0.012; size = 2 + Math.random() * 2;
        } else if (type === 2) {
          // Chrysanthemum: sine-wave speed
          angle = (Math.PI * 2 / n) * i;
          speed = 3.8 + Math.sin(i * 0.9) * 1.5 + Math.random();
          gravity = 0.042; maxTrailLen = 6; decay = 0.01 + Math.random() * 0.012; size = 2 + Math.random() * 1.8;
        } else {
          // Willow: heavy gravity, drooping elegance
          angle = (Math.PI * 2 / n) * i + (Math.random() - 0.5) * 0.18;
          speed = 1.8 + Math.random() * 3.5;
          gravity = 0.092; maxTrailLen = 9; decay = 0.007 + Math.random() * 0.009; size = 1.6 + Math.random() * 1.5;
        }
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1, decay, color, size, gravity,
          trail: [], maxTrailLen,
          twinkle: Math.random() > 0.72,
        });
      }

      // Glitter sparkles
      const g = 14 + Math.floor(Math.random() * 8);
      for (let i = 0; i < g; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          x, y,
          vx: Math.cos(angle) * (0.4 + Math.random() * 2.5),
          vy: Math.sin(angle) * (0.4 + Math.random() * 2.5),
          alpha: 0.8, decay: 0.024 + Math.random() * 0.018,
          color: "#ffffff", size: 0.9 + Math.random(),
          gravity: 0.055, trail: [], maxTrailLen: 3,
        });
      }
    }

    // 70% chance side (left or right), 30% middle
    function pickLaunchZone() {
      const r = Math.random();
      if (r < 0.35) {
        // Left side: tx 2%–20%, launch x 1%–15%
        return {
          tx: canvas.width * (0.02 + Math.random() * 0.18),
          ty: canvas.height * (0.04 + Math.random() * 0.5),
          lx: canvas.width * (0.01 + Math.random() * 0.14),
        };
      } else if (r < 0.70) {
        // Right side: tx 80%–98%, launch x 85%–99%
        return {
          tx: canvas.width * (0.80 + Math.random() * 0.18),
          ty: canvas.height * (0.04 + Math.random() * 0.5),
          lx: canvas.width * (0.85 + Math.random() * 0.14),
        };
      } else {
        // Center zone: tx 30%–70%
        return {
          tx: canvas.width * (0.30 + Math.random() * 0.40),
          ty: canvas.height * (0.04 + Math.random() * 0.38),
          lx: canvas.width * (0.25 + Math.random() * 0.50),
        };
      }
    }

    function launchRocket() {
      const zone = pickLaunchZone();
      rockets.push({
        x: zone.lx,
        y: canvas.height + 5,
        tx: zone.tx,
        ty: zone.ty,
        speed: 11 + Math.random() * 6,
        trailTick: 0,
        color: PALETTES[Math.floor(Math.random() * PALETTES.length)][0],
      });
    }

    function animate(ts) {
      animId = requestAnimationFrame(animate);
      // Clear fully each frame so background image shows through
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Launch new rocket — slightly faster cadence since we spread to sides
      if (ts - lastLaunch > 900 + Math.random() * 1100) {
        launchRocket();
        // Extra side rocket when random
        if (Math.random() > 0.5) setTimeout(launchRocket, 260);
        lastLaunch = ts;
      }

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        const dx = r.tx - r.x;
        const dy = r.ty - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < r.speed + 2) {
          burst(r.tx, r.ty);
          rockets.splice(i, 1);
          continue;
        }
        r.x += (dx / dist) * r.speed;
        r.y += (dy / dist) * r.speed;
        r.trailTick = (r.trailTick || 0) + 1;
        // Add trail spark every 3 frames only
        if (r.trailTick % 3 === 0) {
          particles.push({
            x: r.x, y: r.y,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2 + 0.6,
            alpha: 0.6,
            decay: 0.07,
            color: r.color,
            size: 1 + Math.random() * 0.8,
            gravity: 0.08,
            trail: [],
          });
        }
        // draw rocket head
        glowCircle(r.x, r.y, 2.5, r.color, 0.75);
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (p.flash) {
          // Explosion flash
          glowCircle(p.x, p.y, p.r, p.color, p.alpha);
          p.alpha -= p.decay;
          if (p.alpha <= 0) particles.splice(i, 1);
          continue;
        }

        p.vx *= 0.982;
        p.vy = p.vy * 0.982 + p.gravity;
        // Store trail position before moving
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > (p.maxTrailLen || 5)) p.trail.shift();
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }

        const displayAlpha = p.twinkle
          ? p.alpha * (0.5 + 0.5 * Math.sin(Date.now() * 0.015 + i))
          : p.alpha;

        ctx.save();
        // Draw trail as smooth path — prettier and faster than per-arc draws
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) ctx.lineTo(p.trail[t].x, p.trail[t].y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.65;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalAlpha = displayAlpha * 0.42;
          ctx.stroke();
        }
        // Particle body
        ctx.globalAlpha = displayAlpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        // White hot core
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      particles = [];
      rockets = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 9999,
      }}
    />
  );
}

/* ═══════════════════════════════════════
   TRUNG THU — Đèn ông sao nhấp nháy
   ═══════════════════════════════════════ */
function TrungThuDecorations() {
  const audioRef = useRef(null);
  const { volumeMap } = useTheme();

  const lanterns = useMemo(
    () => {
      // Pre-defined positions scattered naturally around the screen edges & corners
      const positions = [
        { left: '2%',  top: '4%'  },
        { left: '88%', top: '2%'  },
        { left: '12%', top: '58%' },
        { left: '91%', top: '55%' },
        { left: '42%', top: '3%'  },
        { left: '68%', top: '6%'  },
        { left: '1%',  top: '28%' },
        { left: '93%', top: '24%' },
        { left: '22%', top: '72%' },
        { left: '76%', top: '68%' },
        { left: '55%', top: '75%' },
        { left: '7%',  top: '45%' },
        { left: '84%', top: '40%' },
        { left: '35%', top: '78%' },
      ];
      return Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: positions[i].left,
        top: positions[i].top,
        size: 32 + (i % 5) * 8,
        color: ["#FF6600", "#FFD700", "#FF2200", "#FF69B4", "#FF8C00", "#FFAA00", "#FF4500"][i % 7],
        blinkDur: `${1.8 + (i % 4) * 0.7}s`,
        blinkDel: `${(i * 0.35) % 3}s`,
        swingDur: `${2.8 + (i % 3) * 0.9}s`,
        swingDel: `${(i * 0.25) % 2}s`,
      }));
    },
    []
  );

  useEffect(() => {
    const audio = new Audio('/sounds/trung-thu.mp4');
    audio.loop   = true;
    audio.volume = volumeMap?.trungthu ?? 0.22;
    audioRef.current = audio;
    const tryPlay = () => audio.play().catch(() => {});
    tryPlay();
    document.addEventListener('click', tryPlay, { once: true });
    return () => {
      document.removeEventListener('click', tryPlay);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volumeMap?.trungthu ?? 0.22;
  }, [volumeMap?.trungthu]);

  return (
    <>
      <style>{`
        @keyframes ttBlink {
          0%, 100% { opacity: 1; }
          45% { opacity: 0.45; }
          50% { opacity: 0.3; }
          55% { opacity: 0.5; }
        }
        @keyframes ttSwing {
          0%, 100% { transform: rotate(-9deg); }
          50%       { transform: rotate(9deg); }
        }
        .tt-lantern-wrap {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transform-origin: top center;
          animation:
            ttSwing var(--sw-dur) var(--sw-del) ease-in-out infinite,
            ttBlink var(--bl-dur) var(--bl-del) ease-in-out infinite;
          filter: drop-shadow(0 0 10px var(--lc));
        }
      `}</style>
      {lanterns.map((l) => (
        <div
          key={l.id}
          className="tt-lantern-wrap"
          style={{
            left: l.left,
            top: l.top,
            "--lc": l.color,
            "--sw-dur": l.swingDur,
            "--sw-del": l.swingDel,
            "--bl-dur": l.blinkDur,
            "--bl-del": l.blinkDel,
          }}
        >
          <svg
            width={l.size}
            height={Math.round(l.size * 1.5)}
            viewBox="0 0 60 90"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="30" y1="0" x2="30" y2="8" stroke="#8B4513" strokeWidth="2" />
            <polygon
              points="30,8 36,26 56,26 40,37 46,56 30,46 14,56 20,37 4,26 24,26"
              fill={l.color}
              stroke="#7B3000"
              strokeWidth="1.5"
            />
            <circle cx="30" cy="33" r="10" fill="rgba(255,255,180,0.55)" />
            <circle cx="25" cy="25" r="3" fill="rgba(255,255,255,0.45)" />
            <line x1="30" y1="56" x2="30" y2="72" stroke="#8B4513" strokeWidth="1.8" />
            <circle cx="30" cy="76" r="5" fill={l.color} />
            <line x1="26" y1="80" x2="24" y2="90" stroke={l.color} strokeWidth="1.5" />
            <line x1="29" y1="81" x2="28" y2="90" stroke={l.color} strokeWidth="1.5" />
            <line x1="31" y1="81" x2="32" y2="90" stroke={l.color} strokeWidth="1.5" />
            <line x1="34" y1="80" x2="36" y2="90" stroke={l.color} strokeWidth="1.5" />
          </svg>
        </div>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════
   GIÁNG SINH — Tuyết rơi
   ═══════════════════════════════════════ */
function Snowflake({ size, color }) {
  const sw = Math.max(1.4, size * 0.09);
  const arms = [0, 60, 120, 180, 240, 300];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <g transform="translate(50,50)">
        {arms.map(deg => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="0"  x2="0" y2="-44" stroke={color} strokeWidth={sw}         strokeLinecap="round" />
            <line x1="0" y1="-15" x2="11" y2="-24" stroke={color} strokeWidth={sw * 0.75} strokeLinecap="round" />
            <line x1="0" y1="-15" x2="-11" y2="-24" stroke={color} strokeWidth={sw * 0.75} strokeLinecap="round" />
            <line x1="0" y1="-28" x2="8"  y2="-35" stroke={color} strokeWidth={sw * 0.65} strokeLinecap="round" />
            <line x1="0" y1="-28" x2="-8" y2="-35" stroke={color} strokeWidth={sw * 0.65} strokeLinecap="round" />
            <line x1="0" y1="-40" x2="5"  y2="-46" stroke={color} strokeWidth={sw * 0.6}  strokeLinecap="round" />
            <line x1="0" y1="-40" x2="-5" y2="-46" stroke={color} strokeWidth={sw * 0.6}  strokeLinecap="round" />
          </g>
        ))}
        <circle cx="0" cy="0" r="5.5" fill={color} />
      </g>
    </svg>
  );
}

function GiangSinhDecorations() {
  const audioRef = useRef(null);
  const { volumeMap } = useTheme();

  const flakes = useMemo(
    () =>
      Array.from({ length: 52 }, (_, i) => ({
        id: i,
        left: `${(i * 1.96) % 100}%`,
        size: 14 + (i % 6) * 4,          // 14–38px — clearly visible
        dur: `${7 + (i % 7) * 1.5}s`,    // 7–17.5s fall duration
        del: `${(i * 0.24) % 12}s`,
        drift: `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 18))}px`,
        rotDeg: `${180 + (i % 5) * 90}deg`,
        opacity: 0.55 + (i % 5) * 0.08,
        color: i % 4 === 0 ? '#cce8ff' : 'white',
      })),
    []
  );

  useEffect(() => {
    const audio = new Audio('/sounds/giang-sinh.mp4');
    audio.loop   = true;
    audio.volume = volumeMap?.giangsinh ?? 0.22;
    audioRef.current = audio;
    const tryPlay = () => audio.play().catch(() => {});
    tryPlay();
    document.addEventListener('click', tryPlay, { once: true });
    return () => {
      document.removeEventListener('click', tryPlay);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volumeMap?.giangsinh ?? 0.22;
  }, [volumeMap?.giangsinh]);

  return (
    <>
      <style>{`
        @keyframes gsSnowyFall {
          0%   { transform: translateY(-80px) translateX(0) rotate(0deg);                opacity: 0; }
          6%   { opacity: var(--op); }
          91%  { opacity: calc(var(--op) * 0.8); }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }
        .gs-flake {
          position: fixed;
          top: 0;
          pointer-events: none;
          z-index: 9999;
          filter:
            drop-shadow(0 0 5px rgba(200,230,255,0.95))
            drop-shadow(0 0 2px rgba(255,255,255,0.8));
          animation: gsSnowyFall var(--dur) var(--del) linear infinite;
        }
      `}</style>
      {flakes.map((f) => (
        <div
          key={f.id}
          className="gs-flake"
          style={{
            left: f.left,
            '--dur': f.dur,
            '--del': f.del,
            '--drift': f.drift,
            '--rot': f.rotDeg,
            '--op': f.opacity,
          }}
        >
          <Snowflake size={f.size} color={f.color} />
        </div>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════
   Main export
   ═══════════════════════════════════════ */
export default function SeasonDecorations() {
  const { theme } = useTheme();
  if (theme === "dark")      return <DarkDecorations />;
  if (theme === "tet")       return <TetDecorations />;
  if (theme === "trungthu")  return <TrungThuDecorations />;
  if (theme === "giangsinh") return <GiangSinhDecorations />;
  return null;
}
