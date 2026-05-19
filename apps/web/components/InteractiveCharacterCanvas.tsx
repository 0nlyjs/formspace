"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface InteractiveCharacterCanvasProps {
  isTyping: boolean;
  activeField: string | null;
  isSubmitting: boolean;
  theme: string;
}

export const InteractiveCharacterCanvas: React.FC<InteractiveCharacterCanvasProps> = ({
  isTyping,
  activeField,
  isSubmitting,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Keep refs to update inside loop
  const meshRef = useRef<THREE.Group | null>(null);
  const leftEyeRef = useRef<THREE.Mesh | null>(null);
  const rightEyeRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

    // 2. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // 4. Create low-poly character model group
    const characterGroup = new THREE.Group();
    meshRef.current = characterGroup;

    // Head body
    const headGeom = new THREE.IcosahedronGeometry(3, 1); // low-poly style
    let headColor = 0x6366f1; // default purple

    if (theme === "tech") headColor = 0x10b981; // emerald tech
    if (theme === "retro") headColor = 0xf59e0b; // amber retro

    const headMat = new THREE.MeshStandardMaterial({
      color: headColor,
      roughness: 0.2,
      metalness: 0.8,
      flatShading: true,
    });
    const headMesh = new THREE.Mesh(headGeom, headMat);
    characterGroup.add(headMesh);

    // Eyes
    const eyeGeom = new THREE.SphereGeometry(0.3, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const pupilGeom = new THREE.SphereGeometry(0.15, 8, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // Left Eye Assembly
    const leftEye = new THREE.Group();
    const leftEyeWhite = new THREE.Mesh(eyeGeom, eyeMat);
    const leftPupil = new THREE.Mesh(pupilGeom, pupilMat);
    leftPupil.position.z = 0.25; // pupil sticks out
    leftEye.add(leftEyeWhite);
    leftEye.add(leftPupil);
    leftEye.position.set(-0.8, 0.5, 2.5);
    characterGroup.add(leftEye);
    leftEyeRef.current = leftEye as any;

    // Right Eye Assembly
    const rightEye = new THREE.Group();
    const rightEyeWhite = new THREE.Mesh(eyeGeom, eyeMat);
    const rightPupil = new THREE.Mesh(pupilGeom, pupilMat);
    rightPupil.position.z = 0.25;
    rightEye.add(rightEyeWhite);
    rightEye.add(rightPupil);
    rightEye.position.set(0.8, 0.5, 2.5);
    characterGroup.add(rightEye);
    rightEyeRef.current = rightEye as any;

    scene.add(characterGroup);

    // 5. Track targets for animation
    let targetRotationX = 0;
    let targetRotationY = 0;
    let targetScale = 1.0;
    let pupilColorTarget = new THREE.Color(0x000000);

    // Animation Loop
    let animFrame: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Idle float animation
      characterGroup.position.y = Math.sin(time * 1.5) * 0.2;
      
      // Handle "Typing" reaction: tilt head down and shake left-to-right
      if (isTyping) {
        targetRotationX = 0.4; // look down
        targetRotationY = Math.sin(time * 10) * 0.15; // rapid typing vibration
        targetScale = 1.05; // slightly pulse in size
        pupilColorTarget.setHex(0xef4444); // red eyes when busy
      } else {
        targetRotationX = 0;
        targetRotationY = Math.sin(time * 0.5) * 0.1; // slow scan
        targetScale = 1.0;
        
        // Color eyes according to current theme
        if (theme === "tech") pupilColorTarget.setHex(0x10b981);
        else if (theme === "retro") pupilColorTarget.setHex(0xf59e0b);
        else pupilColorTarget.setHex(0xec4899);
      }

      // Handle "Submitting" transition: crazy 3D spin
      if (isSubmitting) {
        characterGroup.rotation.y += 0.4;
        characterGroup.rotation.x += 0.2;
        characterGroup.scale.setScalar(1.3);
      } else {
        // Smoothly interpolate positions & scales
        characterGroup.rotation.x += (targetRotationX - characterGroup.rotation.x) * 0.1;
        characterGroup.rotation.y += (targetRotationY - characterGroup.rotation.y) * 0.1;
        
        const currentScale = characterGroup.scale.x;
        const nextScale = currentScale + (targetScale - currentScale) * 0.1;
        characterGroup.scale.setScalar(nextScale);
      }

      // Update pupil colors smoothly
      pupilMat.color.lerp(pupilColorTarget, 0.1);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      headGeom.dispose();
      headMat.dispose();
      eyeGeom.dispose();
      eyeMat.dispose();
      pupilGeom.dispose();
      pupilMat.dispose();
      renderer.dispose();
    };
  }, [isTyping, activeField, isSubmitting, theme]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[300px] flex items-center justify-center bg-transparent">
      {/* Visual Indicator HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 text-center pointer-events-none">
        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
          3D Character Sandbox
        </h4>
        <p className="text-[10px] text-zinc-300">
          Character is currently:{" "}
          <span className="font-bold text-white">
            {isSubmitting ? "🚀 Submitting!" : isTyping ? "⌨️ Typing..." : "💤 Idle"}
          </span>
        </p>
      </div>
    </div>
  );
};
export default InteractiveCharacterCanvas;
