import React, { useEffect, useRef } from 'react';
import { Particle } from '../types';

// Cyberpunk Neon Palette
const COLORS = ['#00f3ff', '#ff00ff', '#bc13fe', '#0aff0a', '#ffffff'];

const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>(0);

  const createParticle = (x: number, y: number): Particle => ({
    x,
    y,
    w: Math.random() * 8 + 2, // Smaller, more digital bits
    h: Math.random() * 8 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 12,
    vy: (Math.random() - 0.5) * 12 - 6, 
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 15,
    life: 1.0,
  });

  const spawnConfetti = (w: number, h: number) => {
    // Spawn from bottom center
    for (let i = 0; i < 4; i++) {
       particles.current.push(createParticle(w / 2, h * 0.8));
    }
    // Random glitches
    if (Math.random() > 0.6) {
        particles.current.push(createParticle(Math.random() * w, Math.random() * h));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Initial burst
    for(let i=0; i<80; i++) {
        particles.current.push(createParticle(window.innerWidth / 2, window.innerHeight / 2));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Add a slight trail effect for "speed"
      // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      // ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (particles.current.length < 250) {
        spawnConfetti(canvas.width, canvas.height);
      }

      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity
        p.vx *= 0.98; // Air resistance
        p.rotation += p.rotationSpeed;
        p.life -= 0.005;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        
        // Draw squares (pixels)
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        if (p.life <= 0 || p.y > canvas.height + 50) {
          particles.current.splice(i, 1);
          i--;
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-10 mix-blend-screen"
    />
  );
};

export default Confetti;