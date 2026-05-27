"use client";

import React, { useEffect, useRef } from "react";

interface RightInteractiveParticlesProps {
  pageType: "dashboard" | "builder";
}

export const RightInteractiveParticles: React.FC<RightInteractiveParticlesProps> = ({ pageType }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    interface Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      angle: number;
      speed: number;
      driftRadius: number;
    }

    const particles: Particle[] = [];
    const count = 286; // Elegant density covering the entire content area (increased by 1.3x)

    // Generates a random color matching the cyberpunk theme palette at 20-30% opacity
    const getPremiumColor = () => {
      const rand = Math.random();
      const alpha = 0.2 + Math.random() * 0.1; // 20% to 30% transparency

      if (rand < 0.6) {
        // Brand Blue: rgb(82, 163, 221)
        return `rgba(82, 163, 221, ${alpha})`;
      } else if (rand < 0.8) {
        // Brand Orange: rgb(228, 121, 57)
        return `rgba(228, 121, 57, ${alpha})`;
      } else {
        // Brand Light White/Slate: rgb(229, 226, 225)
        return `rgba(229, 226, 225, ${alpha})`;
      }
    };

    // Calculate left boundary based on sidebar layout
    const getLeftBoundary = (currentWidth: number) => {
      if (pageType === "dashboard") {
        return 256; // Dashboard sidebar is always w-64 (256px)
      } else {
        // Form Builder sidebar is lg:w-[360px] (360px) on screen width >= 1024px, stacked on mobile
        return currentWidth >= 1024 ? 360 : 0;
      }
    };

    let minX = getLeftBoundary(width);

    // Initialize particles to the right of the sidebar boundary
    for (let i = 0; i < count; i++) {
      const baseX = minX + Math.random() * (width - minX);
      const baseY = height * Math.random();
      
      particles.push({
        x: baseX,
        y: baseY,
        baseX,
        baseY,
        vx: 0,
        vy: 0,
        size: 1.2 + Math.random() * 2.3, // Small elegant dot size
        color: getPremiumColor(),
        angle: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.008, // Slow organic drifting
        driftRadius: 10 + Math.random() * 20, // Drift range around home
      });
    }

    const mouse = {
      x: -1000,
      y: -1000,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      const oldWidth = width;
      const oldHeight = height;
      const oldMinX = minX;

      width = window.innerWidth;
      height = window.innerHeight;
      minX = getLeftBoundary(width);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Re-scale baseline coordinates proportionally to match the new screen width minus the sidebar boundary
      for (let i = 0; i < count; i++) {
        const p = particles[i]!;
        const percentX = oldWidth - oldMinX > 0 ? (p.baseX - oldMinX) / (oldWidth - oldMinX) : Math.random();
        p.baseX = minX + percentX * (width - minX);
        p.baseY = height * (p.baseY / oldHeight);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Physics parameters
    const repelRadius = 220;
    const repelRadiusSq = repelRadius * repelRadius; // Precompute squared radius to avoid expensive Math.sqrt calls
    const repelStrength = 0.65;
    const springStrength = 0.02;
    const friction = 0.88;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouse.x;
      const my = mouse.y;
      const len = particles.length;

      // High-performance flat for-loop to eliminate GC allocations and closures overhead
      for (let i = 0; i < len; i++) {
        const p = particles[i]!;

        // 1. Organic slow drift
        p.angle += p.speed;
        const homeX = p.baseX + Math.cos(p.angle) * p.driftRadius;
        const homeY = p.baseY + Math.sin(p.angle) * p.driftRadius;

        // 2. Mouse repulsion (optimized with squared-distance threshold comparison)
        const dx = p.x - mx;
        const dy = p.y - my;
        const distSq = dx * dx + dy * dy;

        if (distSq < repelRadiusSq) {
          const dist = Math.sqrt(distSq);
          if (dist > 0) {
            const force = (repelRadius - dist) / repelRadius; // 0 to 1 based on proximity
            
            // Direction of push
            const pushX = (dx / dist) * force * repelStrength;
            const pushY = (dy / dist) * force * repelStrength;

            p.vx += pushX;
            p.vy += pushY;
          }
        }

        // 3. Restoring spring pull to floating home position
        const springX = (homeX - p.x) * springStrength;
        const springY = (homeY - p.y) * springStrength;

        p.vx += springX;
        p.vy += springY;

        // 4. Dampen speed with friction
        p.vx *= friction;
        p.vy *= friction;

        // 5. Update positions
        p.x += p.vx;
        p.y += p.vy;

        // 6. Draw clean circles
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pageType]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none overflow-hidden bg-transparent"
    />
  );
};
