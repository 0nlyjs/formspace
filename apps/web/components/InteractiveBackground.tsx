"use client";

import React, { useEffect, useRef } from 'react';

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
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
      z: number;
      color: string;
      size: number;
    }

    const particles: Particle[] = [];
    const count = 1600;

    const getSolarColor = () => {
      const isBlue = Math.random() > 0.45;
      if (isBlue) {
        const opacity = 0.4 + Math.random() * 0.5;
        return `rgba(82, 163, 221, ${opacity})`;
      } else {
        const opacity = 0.3 + Math.random() * 0.6;
        return `rgba(228, 121, 57, ${opacity})`;
      }
    };

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const r = 300 + Math.cbrt(Math.random()) * 1100;

      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta) * 0.65,
        z: r * Math.cos(phi),
        color: getSolarColor(),
        size: 0.8 + Math.random() * 1.8,
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let lastMouseMoveTime = Date.now();
    
    let autoAngleY = 0;
    let currentRenderAngleY = 0;
    let currentRenderAngleX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX - width / 2;
      mouseY = e.clientY - height / 2;
      lastMouseMoveTime = Date.now();
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const fov = 600;
    const cameraDistance = 1400;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      const idleTime = now - lastMouseMoveTime;
      const isIdle = idleTime > 800;

      const rotationSpeed = isIdle ? 0.00015 : 0.00035;
      autoAngleY += rotationSpeed;

      targetX += (mouseX - targetX) * 0.035;
      targetY += (mouseY - targetY) * 0.035;

      const targetAngleY = autoAngleY + (targetX * 0.0012);
      const targetAngleX = (targetY * 0.0005);

      currentRenderAngleY += (targetAngleY - currentRenderAngleY) * 0.04;
      currentRenderAngleX += (targetAngleX - currentRenderAngleX) * 0.04;

      const cosY = Math.cos(currentRenderAngleY);
      const sinY = Math.sin(currentRenderAngleY);
      const cosX = Math.cos(currentRenderAngleX);
      const sinX = Math.sin(currentRenderAngleX);

      particles.forEach((p) => {
        const rx = p.x * cosY - p.z * sinY;
        const rz = p.z * cosY + p.x * sinY;

        const ry = p.y * cosX - rz * sinX;
        const finalZ = rz * cosX + p.y * sinX;

        const projectedZ = finalZ + cameraDistance;

        if (projectedZ > 100) {
          const scale = fov / projectedZ;
          const projX = rx * scale + width / 2;
          const projY = ry * scale + height / 2;

          if (projX >= 0 && projX <= width && projY >= 0 && projY <= height) {
            ctx.beginPath();
            ctx.arc(projX, projY, p.size * scale * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-[#050505]" />;
};
