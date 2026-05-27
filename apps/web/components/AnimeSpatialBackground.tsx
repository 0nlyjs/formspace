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

interface WindPetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  colorType: "pink" | "green";
  speed: number;
}


export function AnimeSpatialBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageLoadedRef = useRef<boolean>(false);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // Mouse tracking state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, speedX: 0, lastX: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Particle systems refs
  const rainDropsRef = useRef<RainDrop[]>([]);
  const petalsRef = useRef<WindPetal[]>([]);
  const windRef = useRef<number>(0);

  // Soaring bird state
  const birdRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    wingAngle: 0,
    glideFactor: 0,
  });

  // Initialize background image
  useEffect(() => {
    const img = new Image();
    img.src = "/anime-bg.jpg";
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
      const rainCount = Math.min(85, Math.floor(width * 0.1));
      const drops: RainDrop[] = [];
      for (let i = 0; i < rainCount; i++) {
        drops.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          speed: 7 + Math.random() * 6,
          length: 12 + Math.random() * 12,
          opacity: 0.12 + Math.random() * 0.18,
          width: 0.7 + Math.random() * 0.5,
        });
      }
      rainDropsRef.current = drops;

      // 2. Wind Petals (Pink cherry blossoms and Ghibli-green leaves)
      const petalCount = Math.min(28, Math.floor(width * 0.035));
      const pList: WindPetal[] = [];
      for (let i = 0; i < petalCount; i++) {
        pList.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0.5 + Math.random() * 0.8,
          vy: 0.2 + Math.random() * 0.4,
          size: 4 + Math.random() * 5,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          alpha: 0.35 + Math.random() * 0.45,
          colorType: Math.random() > 0.45 ? "pink" : "green",
          speed: 0.4 + Math.random() * 0.5,
        });
      }
      petalsRef.current = pList;
      // Initialize bird position in the sky
      birdRef.current.x = width * 0.18;
      birdRef.current.y = height * 0.18;
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

      // 2. Base Background Layer (Parallax Translation with High-Res Aspect-Ratio Cover)
      if (imageLoadedRef.current && bgImageRef.current) {
        const imgW = bgImageRef.current.width;
        const imgH = bgImageRef.current.height;
        const imgRatio = imgW / imgH;
        const canvasRatio = width / height;

        let drawW = width;
        let drawH = height;

        if (canvasRatio > imgRatio) {
          // Canvas is wider than image aspect ratio
          drawW = width;
          drawH = width / imgRatio;
        } else {
          // Canvas is taller than image aspect ratio
          drawW = height * imgRatio;
          drawH = height;
        }

        // Add 1.08x scale factor to allow parallax shifting space without showing black borders
        const scale = 1.08;
        const finalW = drawW * scale;
        const finalH = drawH * scale;

        const offsetX = (width - finalW) / 2 + mouseRef.current.x * 15;
        const offsetY = (height - finalH) / 2 + mouseRef.current.y * 15;

        ctx.drawImage(bgImageRef.current, offsetX, offsetY, finalW, finalH);
      } else {
        // Sunset orange-peach gradient fallback
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#fb923c"); // sunset orange
        bgGrad.addColorStop(0.5, "#f43f5e"); // rose pink
        bgGrad.addColorStop(1, "#1e1b4b"); // deep twilight indigo
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }


      // 4. Update and Draw Rain Drops (slanting, with NO drop ripple/splash effect at bottom)
      ctx.strokeStyle = "rgba(224, 242, 254, 0.28)";
      ctx.lineWidth = 1;
      
      const rainAngle = windRef.current - 0.08; // slight natural slant leftwards
      
      rainDropsRef.current.forEach((drop) => {
        // Fall down
        drop.y += drop.speed;
        drop.x += rainAngle * drop.speed;

        // Wrap around boundaries
        if (drop.y > height) {
          drop.y = -drop.length - Math.random() * 20;
          drop.x = Math.random() * width;
        }
        if (drop.x > width) drop.x = 0;
        if (drop.x < 0) drop.x = width;

        ctx.strokeStyle = `rgba(224, 242, 254, ${drop.opacity})`;
        ctx.lineWidth = drop.width;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + rainAngle * drop.length, drop.y + drop.length);
        ctx.stroke();
      });

      // 5. Procedurally Animate Soaring Eagle / Falcon (Top-Left sky)
      // Glides smoothly in the sky, tilting and reacting to the cursor!
      const bird = birdRef.current;
      bird.wingAngle += 0.045; // wings slowly flap

      // Soft glide path chasing target
      const targetBirdX = width * 0.18 + mouseRef.current.x * -35;
      const targetBirdY = height * 0.18 + mouseRef.current.y * -20;
      bird.x += (targetBirdX - bird.x) * 0.05;
      bird.y += (targetBirdY - bird.y) * 0.05;

      // Draw soaring eagle outline
      ctx.save();
      ctx.translate(bird.x, bird.y);
      
      // Dynamic banking/tilting rotation based on mouse translation
      const bankAngle = mouseRef.current.x * 0.15;
      ctx.rotate(bankAngle);

      // Stylized eagle silhouette (low-poly vector/Ghibli shadow style)
      ctx.fillStyle = "rgba(45, 40, 48, 0.9)";
      ctx.strokeStyle = "rgba(25, 20, 28, 0.95)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      // Body core
      ctx.moveTo(0, -10); // Beak
      ctx.quadraticCurveTo(4, -12, 6, -8); // head
      ctx.lineTo(3, 12); // tail
      ctx.lineTo(-3, 12);
      ctx.lineTo(-6, -8);
      ctx.closePath();
      ctx.fill();

      // Wing flaps offset
      const wingFlap = Math.sin(bird.wingAngle) * 6;

      // Left Wing
      ctx.beginPath();
      ctx.moveTo(-5, -5);
      ctx.bezierCurveTo(-22, -18 + wingFlap, -48, -12 + wingFlap * 1.5, -55, 2 + wingFlap);
      ctx.bezierCurveTo(-40, 10, -20, 4, -5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Wing
      ctx.beginPath();
      ctx.moveTo(5, -5);
      ctx.bezierCurveTo(22, -18 + wingFlap, 48, -12 + wingFlap * 1.5, 55, 2 + wingFlap);
      ctx.bezierCurveTo(40, 10, 20, 4, 5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      // 6. Update and Draw Floating Anime Wind Petals (Pink blossoms / Ghibli green leaves)
      // Floating across diagonally, repelling from cursor on hover
      petalsRef.current.forEach((petal) => {
        petal.x += petal.vx * petal.speed;
        petal.y += petal.vy * petal.speed;
        petal.rotation += petal.rotSpeed;

        // Wrap around boundaries
        if (petal.x > width + 30 || petal.y > height + 30) {
          petal.x = -20 - Math.random() * 50;
          petal.y = Math.random() * (height * 0.7) - 50;
        }

        // Mouse Repulsion Mechanics
        if (isHovered) {
          const localMouseX = ((mouseRef.current.targetX + 1) / 2) * width;
          const localMouseY = ((mouseRef.current.targetY + 1) / 2) * height;

          const dx = petal.x - localMouseX;
          const dy = petal.y - localMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 130;

          if (dist < repelRadius) {
            const force = (repelRadius - dist) / repelRadius;
            const pushX = (dx / dist) * force * 1.5;
            const pushY = (dy / dist) * force * 1.5;
            
            petal.x += pushX * 0.15;
            petal.y += pushY * 0.15;
          }
        }

        // Draw Petal
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);

        if (petal.colorType === "pink") {
          // Delicate pink cherry blossom petal
          ctx.fillStyle = `rgba(251, 207, 232, ${petal.alpha})`;
          ctx.strokeStyle = `rgba(244, 114, 182, ${petal.alpha * 0.7})`;
        } else {
          // Vibrant Ghibli bright green leaf
          ctx.fillStyle = `rgba(167, 243, 208, ${petal.alpha * 0.95})`;
          ctx.strokeStyle = `rgba(52, 211, 153, ${petal.alpha * 0.7})`;
        }

        ctx.lineWidth = 1;
        ctx.beginPath();
        // Tear drop petal shape
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-petal.size, -petal.size * 1.2, -petal.size * 0.4, -petal.size * 2.2, 0, -petal.size * 2);
        ctx.bezierCurveTo(petal.size * 0.4, -petal.size * 2.2, petal.size, -petal.size * 1.2, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      // 7. Draw Procedural Blowing Grass & Yellow Flower heads (Bottom-Right Cliff Edge matching!)
      // Shifting opposite and faster than the background to create high depth
      const fgOffsetX = -mouseRef.current.x * 24;
      const fgOffsetY = -mouseRef.current.y * 16;

      ctx.fillStyle = "rgba(35, 68, 48, 0.95)"; // lush deep Ghibli forest green
      ctx.strokeStyle = "rgba(22, 48, 32, 0.98)";
      
      const drawGrassBlade = (x: number, y: number, h: number, curve: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + curve + fgOffsetX * 0.4, y - h * 0.55 + fgOffsetY * 0.4, x + curve * 1.8 + fgOffsetX * 0.6, y - h + fgOffsetY * 0.6);
        ctx.quadraticCurveTo(x + curve * 0.5 + fgOffsetX * 0.3, y - h * 0.35 + fgOffsetY * 0.3, x + 6, y);
        ctx.closePath();
        ctx.fill();
      };

      const drawYellowFlower = (x: number, y: number, stemH: number) => {
        const stalkX = x + fgOffsetX * 0.6;
        const stalkY = y - stemH + fgOffsetY * 0.6;

        // Thin grass green stem
        ctx.strokeStyle = "rgba(42, 85, 54, 0.95)";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(stalkX, y + 10);
        ctx.quadraticCurveTo(stalkX - 10, y - stemH * 0.5, stalkX, stalkY);
        ctx.stroke();

        // 4 small yellow petals and dark core (matching Ghibli flowers on the cliff)
        ctx.fillStyle = "rgba(253, 224, 71, 0.98)"; // bright yellow
        ctx.beginPath();
        ctx.arc(stalkX - 4, stalkY, 4, 0, Math.PI * 2);
        ctx.arc(stalkX + 4, stalkY, 4, 0, Math.PI * 2);
        ctx.arc(stalkX, stalkY - 4, 4, 0, Math.PI * 2);
        ctx.arc(stalkX, stalkY + 4, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(120, 53, 4, 0.95)"; // brown center core
        ctx.beginPath();
        ctx.arc(stalkX, stalkY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      };

      // Draw series of Grass Blades and flower stalks at the bottom right corner
      const bladeCount = Math.min(18, Math.floor(width * 0.025));
      for (let i = 0; i < bladeCount; i++) {
        const rx = width - i * 15 + 20;
        const rh = 65 + Math.cos(i) * 35;
        const rCurve = -12 - Math.sin(i) * 12;
        drawGrassBlade(rx, height + 10, rh, rCurve);
        
        // Spawn small yellow flowers on every 3rd blade
        if (i % 3 === 1) {
          drawYellowFlower(width - i * 15 - 5, height + 10, 60 + Math.sin(i) * 20);
        }
      }

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
        // Soft warm sunset peach glow
        lightGrad.addColorStop(0, "rgba(251, 146, 60, 0.06)");
        lightGrad.addColorStop(0.5, "rgba(244, 63, 94, 0.015)");
        lightGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(localMouseX, localMouseY, 150, 0, Math.PI * 2);
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
      className="absolute inset-0 w-full h-full z-0 overflow-hidden select-none pointer-events-none bg-[#cfe9f5]"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-auto"
        style={{ contentVisibility: "auto" }}
      />
    </div>
  );
}
