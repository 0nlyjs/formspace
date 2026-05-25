"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const FeatureSphereCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene, Camera and Renderer
    const scene = new THREE.Scene();
    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Setup ambient and glowing point lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const orangePointLight = new THREE.PointLight(0xffb690, 2.5, 40);
    orangePointLight.position.set(-10, -10, 10);
    scene.add(orangePointLight);

    // 3. Create the Wireframe Sphere Mesh
    const sphereGeom = new THREE.IcosahedronGeometry(5.2, 1); // low-poly wireframe sphere
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xe47939,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
    scene.add(sphereMesh);

    // 4. Create the Outer Shell Glowing Particle sphere
    const particleCount = 450;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const phaseOffsets = new Float32Array(particleCount);

    const radius = 5.2;

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      // Sphere coordinates
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      phaseOffsets[i] = Math.random() * Math.PI * 2;
    }

    particlesGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0xffb690,
      size: 0.1,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    // 5. Setup Cursor Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Get mouse position relative to container center
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      mouseX = x * 0.015;
      mouseY = y * 0.015;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth camera interpolation based on cursor tracking
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = -targetY;
      camera.lookAt(scene.position);

      // Rotate sphere structure
      sphereMesh.rotation.x = time * 0.08;
      sphereMesh.rotation.y = time * 0.12;

      // Animate flowing particle breathing / pulsing
      const posAttr = particlesGeom.getAttribute("position") as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const ox = originalPositions[idx] ?? 0;
        const oy = originalPositions[idx + 1] ?? 0;
        const oz = originalPositions[idx + 2] ?? 0;
        const phase = phaseOffsets[i] ?? 0;

        // Let the particles pulse outwards slightly over time
        const scale = 1.0 + Math.sin(time * 2.0 + phase) * 0.08;

        array[idx] = ox * scale;
        array[idx + 1] = oy * scale;
        array[idx + 2] = oz * scale;
      }
      posAttr.needsUpdate = true;

      // Rotate particles structure slightly faster
      particles.rotation.x = time * 0.08;
      particles.rotation.y = time * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      sphereGeom.dispose();
      sphereMat.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[320px] md:min-h-[400px] flex items-center justify-center bg-transparent relative overflow-hidden"
    />
  );
};
export default FeatureSphereCanvas;
