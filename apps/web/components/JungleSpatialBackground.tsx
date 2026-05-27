"use client";

import React, { useEffect, useRef, useState } from "react";

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  width: number;
}

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  speed: number;
  alpha: number;
  maxAlpha: number;
  pulseSpeed: number;
  colorType: "gold" | "white";
}

interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  active: boolean;
  opacity: number;
}

export function JungleSpatialBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageLoadedRef = useRef<boolean>(false);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // Mouse tracking state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, speedX: 0, lastX: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Particle systems refs
  const rainDropsRef = useRef<RainDrop[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const ripplesRef = useRef<WaterRipple[]>([]);
  const windRef = useRef<number>(0);
  
  // Shooting star state
  const shootingStarRef = useRef<ShootingStar>({
    x: 0,
    y: 0,
    length: 0,
    speed: 0,
    active: false,
    opacity: 0,
  });
  const shootingStarTimerRef = useRef<number>(120);

  // Initialize background image
  useEffect(() => {
    const img = new Image();
    img.src = "/twilight-bg.jpg";
    img.onload = () => {
      bgImageRef.current = img;
      imageLoadedRef.current = true;
    };
  }, []);

  // Initialize and run Canvas loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let isVisible = true;

    // High DPI Scaling
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Populate particles
    const initParticles = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;

      // 1. Rain Drops
      const rainCount = Math.min(100, Math.floor(width * 0.12));
      const drops: RainDrop[] = [];
      for (let i = 0; i < rainCount; i++) {
        drops.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          speed: 9 + Math.random() * 8,
          length: 14 + Math.random() * 18,
          opacity: 0.12 + Math.random() * 0.22,
          width: 0.8 + Math.random() * 0.6,
        });
      }
      rainDropsRef.current = drops;

      // 2. Starry Fireflies (Warm golden fireflies and glowing twilight white particles)
      const flyCount = Math.min(35, Math.floor(width * 0.04));
      const flies: Firefly[] = [];
      for (let i = 0; i < flyCount; i++) {
        flies.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size: 1.2 + Math.random() * 2.0,
          angle: Math.random() * Math.PI * 2,
          speed: 0.12 + Math.random() * 0.15,
          alpha: Math.random() * 0.7,
          maxAlpha: 0.4 + Math.random() * 0.55,
          pulseSpeed: 0.008 + Math.random() * 0.015,
          colorType: Math.random() > 0.4 ? "gold" : "white",
        });
      }
      firefliesRef.current = flies;
      ripplesRef.current = [];
    };

    initParticles();

    // Mouse events inside container
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      // Normalized coordinates (-1 to 1)
      mouseRef.current.targetX = (mx / rect.width) * 2 - 1;
      mouseRef.current.targetY = (my / rect.height) * 2 - 1;
      
      // Track velocity/speed for rain wind gusts
      mouseRef.current.speedX = mx - mouseRef.current.lastX;
      mouseRef.current.lastX = mx;

      // Trigger pond ripples if cursor crosses bottom water boundary (bottom 32% of screen)
      if (my > rect.height * 0.68 && Math.abs(mouseRef.current.speedX) > 4) {
        if (Math.random() < 0.22 && ripplesRef.current.length < 15) {
          ripplesRef.current.push({
            x: mx,
            y: my,
            radius: 2,
            maxRadius: 28 + Math.random() * 32,
            alpha: 0.55,
            speed: 0.5 + Math.random() * 0.5,
          });
        }
      }
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.speedX = 0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Main 60FPS Draw Loop
    const draw = (timestamp: number) => {
      if (!isVisible) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Smooth Mouse Inertia (lerp)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Smoothly decay wind factor from mouse speed
      windRef.current += (mouseRef.current.speedX * 0.015 - windRef.current) * 0.04;
      windRef.current *= 0.98;

      // 2. Base Background Layer (Parallax Translation)
      if (imageLoadedRef.current && bgImageRef.current) {
        const scale = 1.08;
        const w = width * scale;
        const h = height * scale;
        const offsetX = (width - w) / 2 + mouseRef.current.x * 12;
        const offsetY = (height - h) / 2 + mouseRef.current.y * 12;

        ctx.drawImage(bgImageRef.current, offsetX, offsetY, w, h);
      } else {
        // Twilight sky gradient fallback
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#0b1d3a");
        bgGrad.addColorStop(0.5, "#182c4f");
        bgGrad.addColorStop(1, "#0a1329");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Dynamic Shooting Star (streaks across the twilight sky)
      if (shootingStarRef.current.active) {
        const ss = shootingStarRef.current;
        ss.x += ss.speed;
        ss.y += ss.speed * 0.55; // diagonal fall
        ss.opacity -= 0.012;

        if (ss.opacity <= 0 || ss.x > width || ss.y > height * 0.6) {
          ss.active = false;
        } else {
          // Draw thin white laser streak matching the vector shooting star
          ctx.strokeStyle = `rgba(255, 255, 255, ${ss.opacity})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(ss.x - ss.length, ss.y - ss.length * 0.55);
          ctx.stroke();

          // Sparkle tail glow
          ctx.fillStyle = `rgba(186, 230, 253, ${ss.opacity * 0.4})`;
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Decrement timer to spawn next shooting star
        shootingStarTimerRef.current -= 1;
        if (shootingStarTimerRef.current <= 0) {
          // Spawn shooting star from top left / middle region
          shootingStarRef.current = {
            x: Math.random() * (width * 0.55),
            y: Math.random() * (height * 0.25),
            length: 60 + Math.random() * 70,
            speed: 12 + Math.random() * 8,
            active: true,
            opacity: 0.95,
          };
          // Reset timer to spawn again in 200 to 450 frames
          shootingStarTimerRef.current = 200 + Math.floor(Math.random() * 250);
        }
      }

      // 4. Render Concentric Water Ripples (at bottom pond area)
      ctx.lineWidth = 1.2;
      ripplesRef.current = ripplesRef.current.filter((r) => {
        r.radius += r.speed;
        r.alpha -= 0.008;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) return false;

        // Twilight-themed ripples: soft cyan/blue and sunset rose/pink
        ctx.strokeStyle = `rgba(147, 197, 253, ${r.alpha})`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius * 1.6, r.radius * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(244, 63, 94, ${r.alpha * 0.35})`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius * 0.95, r.radius * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();

        return true;
      });

      // 5. Update and Draw Rain Drops (dynamic slanting)
      ctx.strokeStyle = "rgba(186, 230, 253, 0.32)";
      ctx.lineWidth = 1;
      
      const rainAngle = windRef.current;
      
      rainDropsRef.current.forEach((drop) => {
        drop.y += drop.speed;
        drop.x += rainAngle * drop.speed;

        // Wrap around boundaries
        if (drop.y > height) {
          drop.y = -drop.length - Math.random() * 20;
          drop.x = Math.random() * width;
          
          // Trigger raindrop ripple when hitting the bottom pond water surface
          if (drop.y < 0 && Math.random() < 0.08) {
            const rx = drop.x;
            const ry = height * 0.74 + Math.random() * (height * 0.24);
            if (ripplesRef.current.length < 20) {
              ripplesRef.current.push({
                x: rx,
                y: ry,
                radius: 1,
                maxRadius: 10 + Math.random() * 12,
                alpha: 0.32,
                speed: 0.4 + Math.random() * 0.3,
              });
            }
          }
        }
        if (drop.x > width) drop.x = 0;
        if (drop.x < 0) drop.x = width;

        ctx.strokeStyle = `rgba(186, 230, 253, ${drop.opacity})`;
        ctx.lineWidth = drop.width;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + rainAngle * drop.length, drop.y + drop.length);
        ctx.stroke();
      });

      // 6. Update and Draw Glowing Starry Fireflies (Brownian drift + cursor repulsion)
      firefliesRef.current.forEach((fly) => {
        // Organic Brownian motion
        fly.angle += (Math.random() - 0.5) * 0.35;
        fly.vx += Math.cos(fly.angle) * fly.speed * 0.15;
        fly.vy += Math.sin(fly.angle) * fly.speed * 0.15;

        // Clamp max velocities
        const maxV = 0.9;
        fly.vx = Math.max(-maxV, Math.min(maxV, fly.vx));
        fly.vy = Math.max(-maxV, Math.min(maxV, fly.vy));

        fly.x += fly.vx;
        fly.y += fly.vy;

        // Pulse alpha
        fly.alpha += fly.pulseSpeed;
        if (fly.alpha > fly.maxAlpha || fly.alpha < 0.05) {
          fly.pulseSpeed = -fly.pulseSpeed;
        }
        fly.alpha = Math.max(0.02, Math.min(fly.maxAlpha, fly.alpha));

        // Screen boundary bounce
        if (fly.x < 10 || fly.x > width - 10) fly.vx = -fly.vx;
        if (fly.y < 10 || fly.y > height - 10) fly.vy = -fly.vy;

        // Mouse Repulsion Mechanics
        if (isHovered) {
          const localMouseX = ((mouseRef.current.targetX + 1) / 2) * width;
          const localMouseY = ((mouseRef.current.targetY + 1) / 2) * height;

          const dx = fly.x - localMouseX;
          const dy = fly.y - localMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 150;

          if (dist < repelRadius) {
            const force = (repelRadius - dist) / repelRadius;
            const pushX = (dx / dist) * force * 1.7;
            const pushY = (dy / dist) * force * 1.7;
            
            fly.vx += pushX * 0.12;
            fly.vy += pushY * 0.12;
          }
        }

        // Draw soft glowing firefly circle (Gold / Soft Sunset White colors)
        const glowRad = fly.size * 4.2;
        const radGrad = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, glowRad);
        
        if (fly.colorType === "gold") {
          radGrad.addColorStop(0, `rgba(253, 224, 71, ${fly.alpha})`);
          radGrad.addColorStop(0.4, `rgba(234, 179, 8, ${fly.alpha * 0.4})`);
          radGrad.addColorStop(1, "rgba(234, 179, 8, 0)");
        } else {
          radGrad.addColorStop(0, `rgba(255, 255, 255, ${fly.alpha * 0.95})`);
          radGrad.addColorStop(0.4, `rgba(186, 230, 253, ${fly.alpha * 0.35})`);
          radGrad.addColorStop(1, "rgba(186, 230, 253, 0)");
        }

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Tiny bright core
        ctx.fillStyle = fly.colorType === "gold" ? `rgba(254, 240, 138, ${fly.alpha * 1.25})` : `rgba(255, 255, 255, ${fly.alpha * 1.3})`;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7. Draw Rich 3D Procedural Silhouette Foreground Elements (Grassy stalks and Red/White lavender flower stems)
      // Shifting opposite and faster than the background to create spatial depth
      const fgOffsetX = -mouseRef.current.x * 26;
      const fgOffsetY = -mouseRef.current.y * 20;

      // Draw stylized grass blades at the bottom left & right corners
      ctx.fillStyle = "rgba(7, 15, 30, 0.96)"; // deep indigo shadow color
      ctx.strokeStyle = "rgba(6, 12, 24, 0.98)";
      
      const drawBlade = (x: number, y: number, h: number, curve: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + curve + fgOffsetX * 0.4, y - h * 0.5 + fgOffsetY * 0.4, x + curve * 2 + fgOffsetX * 0.6, y - h + fgOffsetY * 0.6);
        ctx.quadraticCurveTo(x + curve * 0.6 + fgOffsetX * 0.3, y - h * 0.4 + fgOffsetY * 0.3, x + 8, y);
        ctx.closePath();
        ctx.fill();
      };

      // Draw series of Grass Blades
      const grassCount = Math.min(22, Math.floor(width * 0.03));
      for (let i = 0; i < grassCount; i++) {
        // Bottom-left grass blades cluster
        const lx = i * 14 - 30;
        const lh = 70 + Math.sin(i) * 35;
        const lCurve = 10 + Math.cos(i) * 15;
        drawBlade(lx, height + 10, lh, lCurve);

        // Bottom-right grass blades cluster
        const rx = width - i * 14 + 10;
        const rh = 70 + Math.cos(i) * 35;
        const rCurve = -10 - Math.sin(i) * 15;
        drawBlade(rx, height + 10, rh, rCurve);
      }

      // Draw Premium Red & White vector flower/lavender stalks (exactly matching the photo foreground!)
      const drawFlowerStalk = (x: number, y: number, height: number, type: "red" | "white") => {
        const stalkX = x + fgOffsetX * 0.75;
        const stalkTopY = y - height + fgOffsetY * 0.75;

        // Draw the thin stem
        ctx.strokeStyle = "rgba(8, 18, 36, 0.95)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(stalkX, y + 10);
        ctx.quadraticCurveTo(stalkX - 10, y - height * 0.5, stalkX, stalkTopY);
        ctx.stroke();

        // Draw overlapping flower heads along the upper half of the stem
        const headCount = 7;
        const color = type === "red" ? "rgba(244, 63, 94, 0.95)" : "rgba(244, 244, 245, 0.96)";
        const shadeColor = type === "red" ? "rgba(190, 24, 74, 0.96)" : "rgba(209, 213, 219, 0.95)";
        
        ctx.fillStyle = color;
        for (let j = 0; j < headCount; j++) {
          const t = j / (headCount - 1);
          const py = y - height * 0.4 - (height * 0.55) * t + fgOffsetY * 0.75;
          const px = stalkX - 5 * Math.sin(t * Math.PI * 1.5) + (py - (y - height * 0.5)) * -0.05;

          const leafSize = 7 - j * 0.5;

          // Draw double leaf nodes
          ctx.fillStyle = shadeColor;
          ctx.beginPath();
          ctx.ellipse(px - 4, py, leafSize, leafSize * 0.6, -0.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.ellipse(px + 4, py, leafSize, leafSize * 0.6, 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Draw center node
          ctx.beginPath();
          ctx.arc(px, py - 2, leafSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      // Draw stylized lavender stalks at bottom-left corner
      drawFlowerStalk(width * 0.05, height + 10, 160, "red");
      drawFlowerStalk(width * 0.12, height + 10, 195, "white");
      drawFlowerStalk(width * 0.08, height + 10, 140, "red");

      // Draw stylized lavender stalks at bottom-right corner
      drawFlowerStalk(width * 0.88, height + 10, 185, "red");
      drawFlowerStalk(width * 0.93, height + 10, 205, "white");
      drawFlowerStalk(width * 0.84, height + 10, 150, "white");

      // 8. Dynamic Twilight Ambient Sunset/Sunrise Glow behind cursor
      if (isHovered) {
        const localMouseX = ((mouseRef.current.targetX + 1) / 2) * width;
        const localMouseY = ((mouseRef.current.targetY + 1) / 2) * height;

        const lightGrad = ctx.createRadialGradient(
          localMouseX, 
          localMouseY, 
          0, 
          localMouseX, 
          localMouseY, 
          170
        );
        // Soft peach sunset golden glow matching the horizon
        lightGrad.addColorStop(0, "rgba(251, 146, 60, 0.07)");
        lightGrad.addColorStop(0.5, "rgba(244, 63, 94, 0.015)");
        lightGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(localMouseX, localMouseY, 170, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    // Optimize tab sleeping with Intersection Observer and Tab Visibility API
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start Draw animation
    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, [isHovered]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0 overflow-hidden select-none pointer-events-none bg-[#050c18]"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-auto"
        style={{ contentVisibility: "auto" }}
      />
    </div>
  );
}
