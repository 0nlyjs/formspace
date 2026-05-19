"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  theme?: "anime" | "tech" | "retro";
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ theme = "anime" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    
    // 2. Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 40;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    // 5. Create objects based on theme
    let particlesGeometry: THREE.BufferGeometry;
    let particlesMaterial: THREE.PointsMaterial;
    let particles: THREE.Points;

    const particleCount = theme === "tech" ? 300 : theme === "retro" ? 200 : 250;
    const positions = new Float32Array(particleCount * 3);
    const velocities: number[] = [];

    // Setup coordinates and velocities
    for (let i = 0; i < particleCount * 3; i += 3) {
      // spread particles inside a box
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = (Math.random() - 0.5) * 80;
      positions[i + 2] = (Math.random() - 0.5) * 60;

      // Random velocities
      velocities.push((Math.random() - 0.5) * 0.05); // x
      velocities.push((Math.random() - 0.5) * 0.05 - 0.02); // y (slight downwards drift)
      velocities.push((Math.random() - 0.5) * 0.05); // z
    }

    particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Choose particle appearance by theme
    let particleColor = 0xffa3b1; // Sakura Pink (Anime)
    let particleSize = 0.6;

    if (theme === "tech") {
      particleColor = 0x00f0ff; // Neon Cyan (Tech)
      particleSize = 0.4;
    } else if (theme === "retro") {
      particleColor = 0xffaa00; // Retro Orange (Retro Games)
      particleSize = 0.8;
    }

    particlesMaterial = new THREE.PointsMaterial({
      color: particleColor,
      size: particleSize,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Theme-specific extra mesh
    let centralMesh: THREE.Mesh | null = null;
    if (theme === "tech") {
      // Wireframe torus
      const geom = new THREE.TorusGeometry(12, 3, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      });
      centralMesh = new THREE.Mesh(geom, mat);
      scene.add(centralMesh);
    } else if (theme === "retro") {
      // Floating 3D crystal (octahedron)
      const geom = new THREE.OctahedronGeometry(10);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        roughness: 0.1,
        metalness: 0.8,
        wireframe: true,
      });
      centralMesh = new THREE.Mesh(geom, mat);
      scene.add(centralMesh);
    } else {
      // Anime: Soft glowing sphere
      const geom = new THREE.IcosahedronGeometry(8, 2);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      });
      centralMesh = new THREE.Mesh(geom, mat);
      scene.add(centralMesh);
    }

    // 6. Interaction with cursor
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - width / 2) * 0.05;
      mouseY = (event.clientY - height / 2) * 0.05;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 7. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth cursor follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (-mouseY - targetY) * 0.05; // note negative y direction

      // Shift camera slightly based on mouse
      camera.position.x = targetX * 0.3;
      camera.position.y = targetY * 0.3;
      camera.lookAt(scene.position);

      // Rotate extra central mesh
      if (centralMesh) {
        centralMesh.rotation.x += 0.003;
        centralMesh.rotation.y += 0.005;
      }

      // Animate particles
      const positionsAttr = particlesGeometry.getAttribute("position") as THREE.BufferAttribute;
      const array = positionsAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        // Apply velocity
        const vx = velocities[idx] ?? 0;
        const vy = velocities[idx + 1] ?? 0;
        const vz = velocities[idx + 2] ?? 0;
        const valX = array[idx] ?? 0;
        const valY = array[idx + 1] ?? 0;

        array[idx] = valX + vx;
        array[idx + 1] = valY + vy;
        array[idx + 2] = (array[idx + 2] ?? 0) + vz;

        // Drift towards cursor
        array[idx] = (array[idx] ?? 0) + (targetX * 0.001 - (array[idx] ?? 0)) * 0.002;

        // Wrap around bounds
        if ((array[idx + 1] ?? 0) < -40) {
          array[idx + 1] = 40;
        }
        if (Math.abs(array[idx] ?? 0) > 50) {
          array[idx] = (Math.random() - 0.5) * 80;
        }
      }
      positionsAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 9. Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // dispose resources
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      if (centralMesh) {
        centralMesh.geometry.dispose();
        if (Array.isArray(centralMesh.material)) {
          centralMesh.material.forEach((m) => m.dispose());
        } else {
          centralMesh.material.dispose();
        }
      }
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 w-full h-full overflow-hidden bg-transparent"
      style={{ pointerEvents: "none" }}
    />
  );
};
