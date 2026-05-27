"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const WavySphereCanvas: React.FC<{ shape?: "sphere" | "box" }> = ({ shape = "sphere" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Scene, Camera, and WebGL Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 10;

    // Use discrete GPU on multi-GPU systems (MacBooks etc.) and skip MSAA on Retina
    // (Retina already supersamples via DPR=2, MSAA on top is wasteful)
    const isRetina = window.devicePixelRatio > 1;
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isRetina,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Custom Wavy Shader Material
    const uniforms = {
      uTime: { value: 0 },
      uScale: { value: 1.0 },
      uMouseX: { value: 0 },
      uMouseY: { value: 0 },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: `
        uniform float uTime;
        uniform float uScale;
        uniform float uMouseX;
        uniform float uMouseY;
        varying vec3 vPosition;
        varying vec3 vNormal;

        // Custom displacement to create gorgeous wavy coordinate ridges
        void main() {
          vPosition = position;
          vNormal = normal;

          // Organic wavy wave pattern using multi-frequency sine and cosine math
          float wave = sin(position.x * 2.0 + uTime * 1.3) * 
                       cos(position.y * 2.0 + uTime * 1.1) * 
                       sin(position.z * 2.0 + uTime * 0.9);
          
          // Micro-ripple wave based on position coordinates
          wave += sin(position.y * 3.5 - uTime * 1.5) * 0.15;
          wave += cos(position.x * 4.0 + uTime * 2.0) * 0.10;

          // React to mouse coordinates slightly to alter displacement wave shapes organically
          wave += sin(position.z * 1.8 + uMouseX * 2.0) * cos(position.y * 1.8 + uMouseY * 2.0) * 0.15;

          // Slightly expand vertices based on uScale and displacement waves (tuned to keep a perfect spherical circular boundary)
          vec3 displacedPosition = position + normal * wave * 0.20 * uScale;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          // Primary Color 1 (Cyan/Blue): #52a3dd -> rgb(0.32, 0.64, 0.87)
          vec3 color1 = vec3(0.32, 0.64, 0.87);
          
          // Primary Color 2 (Orange/Peach): #e47939 -> rgb(0.89, 0.47, 0.22)
          vec3 color2 = vec3(0.89, 0.47, 0.22);

          // Generate dynamic blending mapping based on coordinates, normals and time
          float mixFactor = sin(vPosition.y * 0.55 + uTime * 0.5) * 0.5 + 0.5;
          
          // Incorporate camera depth normal for shiny holographic edge highlights
          mixFactor = clamp(mixFactor + vNormal.z * 0.25, 0.0, 1.0);
          
          vec3 finalColor = mix(color1, color2, mixFactor);

          // Brighten fragment output for glowing light wireframe look
          gl_FragColor = vec4(finalColor, 0.70);
        }
      `,
      wireframe: true,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    // 3. Create Wavy Wireframe Geometry
    // PERF: IcosahedronGeometry detail 3 = 642 vertices (was detail 5 = 10,242 verts — 94% reduction)
    let sphereGeometry: THREE.BufferGeometry;
    if (shape === "box") {
      // Subdivision-rich 3D box/cube — 8×8×8 segments (was 14×14×14, saves ~17k vertices)
      sphereGeometry = new THREE.BoxGeometry(3.3, 3.3, 3.3, 8, 8, 8);
    } else {
      // Base 3D wireframe sphere — detail 3 (642 verts) vs detail 5 (10,242 verts)
      sphereGeometry = new THREE.IcosahedronGeometry(2.8, 3);
    }
    const sphereMesh = new THREE.Mesh(sphereGeometry, shaderMaterial);
    scene.add(sphereMesh);

    // 4. Mouse Move Tracking (Viewport Level) with Spring Physics Damping
    let normMouseX = 0;
    let normMouseY = 0;

    let targetRotX = 0;
    let targetRotY = 0;
    let targetScale = 1.0;

    let currentRotX = 0;
    let currentRotY = 0;
    let currentScale = 1.0;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse positions (-1 to 1)
      normMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      normMouseY = (e.clientY / window.innerHeight) * 2 - 1;

      // Rotate sphere on cursor move
      targetRotX = normMouseY * 0.5;
      targetRotY = normMouseX * 0.5;

      // Expand sphere based on mouse distance from screen center (25% expansion limit)
      const distance = Math.sqrt(normMouseX * normMouseX + normMouseY * normMouseY);
      targetScale = 1.0 + Math.min(distance * 0.25, 0.25);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 5. Animation Loop
    let animationFrameId: number;
    let isAnimating = false;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Pass time and state into shader uniforms
      uniforms.uTime.value = time;
      uniforms.uMouseX.value = normMouseX;
      uniforms.uMouseY.value = normMouseY;

      // Apply spring physics linear interpolation (lerp) for smooth movements
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;
      currentScale += (targetScale - currentScale) * 0.06;

      // Rotate sphere itself gently in time + mouse rotation offsets
      sphereMesh.rotation.x = time * 0.06 + currentRotX;
      sphereMesh.rotation.y = time * 0.09 + currentRotY;

      // Gentle pulsing base scale modulation
      const pulse = Math.sin(time * 1.5) * 0.03;
      const finalScaleVal = currentScale + pulse;
      uniforms.uScale.value = finalScaleVal;

      renderer.render(scene, camera);
    };

    // 6. IntersectionObserver — pause rendering when off-screen to save GPU
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && !isAnimating) {
          isAnimating = true;
          animate();
        } else if (!entry.isIntersecting && isAnimating) {
          isAnimating = false;
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(container);

    // 7. Tab visibility — pause when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
        isAnimating = false;
      } else if (!isAnimating) {
        isAnimating = true;
        animate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 8. Handle Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      sphereGeometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-transparent"
    />
  );
};

export default WavySphereCanvas;
