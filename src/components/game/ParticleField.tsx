'use client';
/* ═══════════════════════════════════════════════════════
   Particle Field — Animated background canvas
   ═══════════════════════════════════════════════════════ */

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

const COLORS = ['#7C6AFA', '#22D3EE', '#A78BFA', '#34D399'];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const PARTICLE_COUNT = 50;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        if (p.y < 0) p.y = canvas!.height;
        if (p.y > canvas!.height) p.y = 0;

        // Glow
        ctx!.beginPath();
        const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, p.color + '00');
        ctx!.fillStyle = gradient;
        ctx!.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx!.fill();

        // Core dot
        ctx!.beginPath();
        ctx!.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx!.beginPath();
            ctx!.strokeStyle = p.color + Math.round((1 - dist / 150) * 0.08 * 255).toString(16).padStart(2, '0');
            ctx!.lineWidth = 0.5;
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      });

      animRef.current = requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
