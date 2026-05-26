"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const WavyClothCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Scene, Camera, and WebGL Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // Perspective camera positioned to view the wide horizontal cloth stretching across
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Custom Wavy Shader Material
    const uniforms = {
      uTime: { value: 0 },
      uWidth: { value: 26.4 }, // matching plane width (10% bigger than 24.0)
      uMousePos: { value: new THREE.Vector2(0, 0) },
      uMouseSpeed: { value: 0 },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMousePos;
        uniform float uMouseSpeed;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vPosition = position;
          vNormal = normal;

          // 1. Calculate continuous twisting angle along the horizontal X-axis
          // Makes the plane twist like a spiral ribbon
          float twist = position.x * 0.38 + uTime * 0.75;
          float cosA = cos(twist);
          float sinA = sin(twist);

          // 2. Base wave displacement values (depth deforms)
          float waveZ = sin(position.x * 0.45 + uTime * 1.3) * 
                        cos(position.y * 0.55 + uTime * 1.0) * 0.7;
          
          // Micro ripples running across the cloth
          waveZ += sin(position.x * 1.6 - uTime * 2.2) * 0.15;
          waveZ += cos(position.y * 2.0 + uTime * 1.8) * 0.10;

          // Localized mouse cursor ripples
          float distToMouse = distance(position.xy, uMousePos);
          float mouseRipple = sin(distToMouse * 2.0 - uTime * 3.5) * 0.40 * exp(-distToMouse * 0.20);
          
          // 3. Apply the 3D spiral twist rotation to Y and Z coordinates
          float py = position.y;
          float pz = position.z + waveZ + mouseRipple * (1.0 + uMouseSpeed * 1.2);

          vec3 displacedPosition = position;
          displacedPosition.y = py * cosA - pz * sinA;
          displacedPosition.z = py * sinA + pz * cosA;

          // 4. Slow undulating wave path for the overall ribbon sway
          displacedPosition.y += sin(position.x * 0.26 + uTime * 0.8) * 1.4;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uWidth;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          // Primary Color 1 (Cyan/Blue): #52a3dd -> rgb(0.32, 0.64, 0.87)
          vec3 color1 = vec3(0.32, 0.64, 0.87);
          
          // Primary Color 2 (Orange/Peach): #e47939 -> rgb(0.89, 0.47, 0.22)
          vec3 color2 = vec3(0.89, 0.47, 0.22);

          // Normalize horizontal position X from 0.0 (leftmost) to 1.0 (rightmost)
          float normX = (vPosition.x + (uWidth / 2.0)) / uWidth;
          normX = clamp(normX, 0.0, 1.0);

          // Blend transition: Orange on the left, blending to Cyan on the right
          vec3 finalColor = mix(color2, color1, normX);

          // Gradual opacity fade: 100% on the left, fading completely to 0% on the right
          // Apply smooth power curve for a seamless background blend
          float opacity = pow(1.0 - normX, 1.6);

          // Dim the opacity base factor to 0.34 to keep it subtle and prevent clashing with white text
          gl_FragColor = vec4(finalColor, opacity * 0.34);
        }
      `,
      wireframe: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // 3. Create Subdivision-Rich Horizontal Plane Geometry (Ribbon Cloth)
    // Width 26.4 (10% bigger than 24.0), height 4.84 (10% bigger than 4.4), with 80x22 segments for premium grid density
    const clothGeometry = new THREE.PlaneGeometry(26.4, 4.84, 80, 22);
    const clothMesh = new THREE.Mesh(clothGeometry, shaderMaterial);
    // Positioned horizontally centered
    clothMesh.position.set(0, 0, 0);
    scene.add(clothMesh);

    // 4. Viewport Level Mouse Tracking with Spring Physics & Speed
    let winMouseX = 0;
    let winMouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseSpeed = 0;

    let targetRotX = 0;
    let targetRotY = 0;
    let targetSpeed = 0;

    let currentRotX = 0;
    let currentRotY = 0;
    let currentSpeed = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // 1. Calculate normalized mouse coordinates (-1 to 1) for mesh tilting
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;

      // Slow mouse interaction rotation sensitivity by 30% (from 0.15 to 0.105)
      targetRotX = normY * 0.105;
      targetRotY = normX * 0.105;

      // 2. Map coordinates relative to the canvas bounds to pass local cursor into shader
      const rect = container.getBoundingClientRect();
      const localX = ((e.clientX - rect.left) / rect.width) * 24.0 - 12.0;
      const localY = -(((e.clientY - rect.top) / rect.height) * 4.4 - 2.2);
      
      uniforms.uMousePos.value.set(localX, localY);

      // 3. Calculate mouse speed to increase wave turbulence during movements
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Slow mouse ripple speed interaction sensitivity by 30% (from 0.05 / 1.5 to 0.035 / 1.05)
      targetSpeed = Math.min(dist * 0.035, 1.05);

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 5. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Pass time and interpolated mouse speed into shader uniforms
      uniforms.uTime.value = time;
      
      // Decay target speed down dynamically to return to calm waves when mouse is still
      targetSpeed += (0 - targetSpeed) * 0.08;

      // Apply spring physics linear interpolation (lerp)
      // Slow spring tracking transition rate by 30% to glide more smoothly (from 0.06 to 0.042 and 0.05 to 0.035)
      currentRotX += (targetRotX - currentRotX) * 0.042;
      currentRotY += (targetRotY - currentRotY) * 0.042;
      currentSpeed += (targetSpeed - currentSpeed) * 0.035;

      uniforms.uMouseSpeed.value = currentSpeed;

      // Rotate cloth mesh slightly in 3D in response to mouse movements
      clothMesh.rotation.x = currentRotX;
      clothMesh.rotation.y = currentRotY + Math.sin(time * 0.1) * 0.05; // slowly sway horizontally
      clothMesh.rotation.z = Math.sin(time * 0.2) * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      clothGeometry.dispose();
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

export default WavyClothCanvas;
