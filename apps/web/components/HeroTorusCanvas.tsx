"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const HeroTorusCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene, Camera and Renderer
    const scene = new THREE.Scene();
    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 400;
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Add subtle lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x90cdff, 2, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 3. Create the Main Torus Mesh (glowing outer structure)
    // Using a sleek wireframe Torus geometry
    const torusGeom = new THREE.TorusGeometry(6, 1.8, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x52a3dd,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const mainTorus = new THREE.Mesh(torusGeom, torusMat);
    scene.add(mainTorus);

    // 4. Create the Orbiting Particles
    const particleCount = 600;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);
    const tubeAngles = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);

    const R = 6.0; // Torus Major Radius
    const r = 1.8; // Torus Minor Radius

    for (let i = 0; i < particleCount; i++) {
      // theta goes around the major ring
      const theta = Math.random() * Math.PI * 2;
      // phi goes around the tube
      const phi = Math.random() * Math.PI * 2;

      angles[i] = theta;
      tubeAngles[i] = phi;
      speeds[i] = 0.008 + Math.random() * 0.012;
      offsets[i] = Math.random() * Math.PI * 2;

      // Position calculations for Torus
      const x = (R + r * Math.cos(phi)) * Math.cos(theta);
      const y = (R + r * Math.cos(phi)) * Math.sin(theta);
      const z = r * Math.sin(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    particlesGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Sleek cyan points material
    const particlesMat = new THREE.PointsMaterial({
      color: 0x90cdff,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
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

      // Rotate the main Torus
      mainTorus.rotation.x = time * 0.12;
      mainTorus.rotation.y = time * 0.18;

      // Animate flowing particles orbiting the Torus tube
      const posAttr = particlesGeom.getAttribute("position") as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const speed = speeds[i] ?? 0;
        const currentAngle = angles[i] ?? 0;
        const currentTubeAngle = tubeAngles[i] ?? 0;

        const nextAngle = currentAngle + speed;
        const nextTubeAngle = currentTubeAngle + speed * 2;

        angles[i] = nextAngle;
        tubeAngles[i] = nextTubeAngle;

        const theta = nextAngle;
        const phi = nextTubeAngle;
        const offsetVal = offsets[i] ?? 0;

        // Add a slight wave/breathing distortion to make it look organic
        const currentR = R + Math.sin(time * 0.5 + offsetVal) * 0.3;
        const currentr = r + Math.cos(time * 1.5 + offsetVal) * 0.15;

        const x = (currentR + currentr * Math.cos(phi)) * Math.cos(theta);
        const y = (currentR + currentr * Math.cos(phi)) * Math.sin(theta);
        const z = currentr * Math.sin(phi);

        array[i * 3] = x;
        array[i * 3 + 1] = y;
        array[i * 3 + 2] = z;
      }
      posAttr.needsUpdate = true;

      // Spin particles structure overall as well
      particles.rotation.x = time * 0.12;
      particles.rotation.y = time * 0.18;

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
      torusGeom.dispose();
      torusMat.dispose();
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
export default HeroTorusCanvas;
