"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const SpatialFeatureCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Scene, Camera, and WebGL Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Positioned looking slightly down and to the side to see 3D grid and character depth
    camera.position.set(-2, 4.5, 17.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Cyber Lights (High-Contrast Dual Tone Glow)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Cyan main light from left
    const cyanLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    cyanLight.position.set(-6, 8, 5);
    scene.add(cyanLight);

    // Peach accent point light from right
    const peachLight = new THREE.PointLight(0xffb690, 3.5, 30);
    peachLight.position.set(6, -4, 4);
    scene.add(peachLight);

    // Purple point light above grid for floor reflection details
    const floorLight = new THREE.PointLight(0x8b5cf6, 2.5, 20);
    floorLight.position.set(0, -3.5, 2);
    scene.add(floorLight);

    // 3. Cybernetic Grid Floor (Flat, receding into perspective space)
    const grid = new THREE.GridHelper(32, 24, 0x52a3dd, 0x081928);
    grid.position.y = -3.8;
    scene.add(grid);

    // Add extra glowing cyan line down the middle for data flow feel
    const lineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -3.79, -16),
      new THREE.Vector3(0, -3.79, 16),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
    const centerLine = new THREE.Line(lineGeom, lineMat);
    scene.add(centerLine);

    // 4. Create Dynamically-Drawn Canvas Texture for Ultra-Sharp UI
    const uiCanvas = document.createElement("canvas");
    uiCanvas.width = 1024;
    uiCanvas.height = 576; // 16:9 aspect ratio
    const ctx = uiCanvas.getContext("2d");

    const drawUI = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, 1024, 576);

      // Background: Semi-transparent cyber-slate glass panel
      ctx.fillStyle = "rgba(6, 18, 28, 0.88)";
      ctx.beginPath();
      ctx.roundRect(0, 0, 1024, 576, 32);
      ctx.fill();

      // Border glow
      ctx.strokeStyle = "rgba(82, 163, 221, 0.35)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Header: Avatar circle & text
      ctx.fillStyle = "rgba(144, 205, 255, 0.15)";
      ctx.beginPath();
      ctx.arc(65, 65, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#52a3dd";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Avatar head symbol inside
      ctx.fillStyle = "#90cdff";
      ctx.beginPath();
      ctx.arc(65, 62, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(65, 82, 16, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "black 28px sans-serif";
      ctx.fillText("ANIME COMMUNITY SURVEY 2077", 110, 75);

      // Subtitle Section
      ctx.fillStyle = "#52a3dd";
      ctx.font = "bold 20px monospace";
      ctx.fillText("SECTION 3: ANIME PREFERENCES & FAVORITES", 45, 140);

      // Row 1 Columns
      // Left: Preferred Genre
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("Preferred Genre:", 45, 180);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.roundRect(45, 195, 430, 50, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(82, 163, 221, 0.3)";
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.fillText(" Action / Sci-Fi", 60, 227);

      // Right: Rating
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("Rating of Last Watched Series (0-10):", 530, 180);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.roundRect(530, 195, 430, 50, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#90cdff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("⭐ [ 8.5 ]", 550, 227);

      // Row 2 Columns
      // Left: Favorite Series list
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("Favorite Series (Top 3):", 45, 280);
      const series = ["1. Jujutsu Kaisen", "2. Chainsaw Man", "3. Attack on Titan"];
      series.forEach((val, idx) => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.roundRect(45, 295 + idx * 45, 430, 36, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "italic 14px sans-serif";
        ctx.fillText(val, 60, 318 + idx * 45);
      });

      // Right: Do you prefer Subs or Dubs
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("Do you prefer Subs or Dubs?", 530, 280);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.roundRect(530, 295, 430, 50, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#90cdff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("Toggle Switch  [ Subs | Dubs ]", 550, 327);

      // Right: Favorite Character
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("Favorite Character:", 530, 375);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.roundRect(530, 390, 430, 50, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.fillText(" Saber / Artoria Pendragon", 550, 422);

      // Bottom border line
      ctx.strokeStyle = "rgba(82, 163, 221, 0.2)";
      ctx.beginPath();
      ctx.moveTo(45, 475);
      ctx.lineTo(975, 475);
      ctx.stroke();
    };

    drawUI();

    const uiTexture = new THREE.CanvasTexture(uiCanvas);
    uiTexture.colorSpace = THREE.SRGBColorSpace;

    // 5. Tilted Floating 3D Glass Survey Card Panel
    const cardGeom = new THREE.PlaneGeometry(9.6, 5.4);
    const cardMat = new THREE.MeshPhysicalMaterial({
      map: uiTexture,
      transparent: true,
      opacity: 0.95,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.4,
      ior: 1.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cardMesh = new THREE.Mesh(cardGeom, cardMat);
    // Center it slightly to the left, tilted backwards and sideways exactly like the photo
    cardMesh.position.set(-1.8, 0.8, -0.5);
    cardMesh.rotation.set(-0.18, -0.26, 0.05);
    scene.add(cardMesh);

    // Glowing Cyan wireframe border for the card
    const cardEdges = new THREE.EdgesGeometry(cardGeom);
    const cardLine = new THREE.LineSegments(
      cardEdges,
      new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2.5 })
    );
    cardMesh.add(cardLine);

    // 6. Tilted Floating `< PREV` and `NEXT >` 3D Buttons in Front
    // Prev Button (Outlined Glass)
    const prevCanvas = document.createElement("canvas");
    prevCanvas.width = 256;
    prevCanvas.height = 128;
    const pCtx = prevCanvas.getContext("2d");
    if (pCtx) {
      pCtx.fillStyle = "rgba(6, 18, 28, 0.85)";
      pCtx.beginPath();
      pCtx.roundRect(0, 0, 256, 128, 16);
      pCtx.fill();
      pCtx.strokeStyle = "rgba(82, 163, 221, 0.4)";
      pCtx.lineWidth = 4;
      pCtx.stroke();
      pCtx.fillStyle = "#90cdff";
      pCtx.font = "bold 24px monospace";
      pCtx.textAlign = "center";
      pCtx.textBaseline = "middle";
      pCtx.fillText("< PREV", 128, 64);
    }
    const prevTexture = new THREE.CanvasTexture(prevCanvas);
    const btnGeom = new THREE.PlaneGeometry(3.0, 1.25);
    const prevMat = new THREE.MeshPhysicalMaterial({
      map: prevTexture,
      transparent: true,
      opacity: 0.92,
      roughness: 0.1,
      metalness: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const prevMesh = new THREE.Mesh(btnGeom, prevMat);
    // Floating forward-left
    prevMesh.position.set(-4.0, -2.6, 1.2);
    prevMesh.rotation.copy(cardMesh.rotation);
    scene.add(prevMesh);

    const prevEdges = new THREE.EdgesGeometry(btnGeom);
    const prevLine = new THREE.LineSegments(
      prevEdges,
      new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 })
    );
    prevMesh.add(prevLine);

    // Next Button (Solid Glowing Cyan)
    const nextCanvas = document.createElement("canvas");
    nextCanvas.width = 256;
    nextCanvas.height = 128;
    const nCtx = nextCanvas.getContext("2d");
    if (nCtx) {
      // Glowing Cyan background
      nCtx.fillStyle = "#90cdff";
      nCtx.beginPath();
      nCtx.roundRect(0, 0, 256, 128, 16);
      nCtx.fill();
      nCtx.fillStyle = "#030a10";
      nCtx.font = "bold 26px monospace";
      nCtx.textAlign = "center";
      nCtx.textBaseline = "middle";
      nCtx.fillText("NEXT >", 128, 64);
    }
    const nextTexture = new THREE.CanvasTexture(nextCanvas);
    const nextMat = new THREE.MeshStandardMaterial({
      map: nextTexture,
      roughness: 0.2,
      metalness: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const nextMesh = new THREE.Mesh(btnGeom, nextMat);
    // Floating forward-right
    nextMesh.position.set(-0.6, -2.6, 1.2);
    nextMesh.rotation.copy(cardMesh.rotation);
    scene.add(nextMesh);

    const nextEdges = new THREE.EdgesGeometry(btnGeom);
    const nextLine = new THREE.LineSegments(
      nextEdges,
      new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 })
    );
    nextMesh.add(nextLine);

    // 7. Construct Stylish Low-Poly 3D Anime Boy Character
    const characterGroup = new THREE.Group();
    // Floating on the right side of the screen
    characterGroup.position.set(4.2, 0.4, 1.5);
    scene.add(characterGroup);

    // Character Torso (Cyber Tech Jacket)
    const torsoGeom = new THREE.CylinderGeometry(0.7, 0.4, 2.2, 5);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // deep slate jacket
      roughness: 0.4,
      metalness: 0.7,
      flatShading: true,
    });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = -0.5;
    characterGroup.add(torso);

    // Jacket Neon Collar
    const collarGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.25, 5);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff, // glowing cyan collar
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8,
    });
    const collar = new THREE.Mesh(collarGeom, collarMat);
    collar.position.y = 0.65;
    characterGroup.add(collar);

    // Character Head (Peach low-poly sphere)
    const headGeom = new THREE.IcosahedronGeometry(0.7, 1);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffd1b3, // peach skin
      roughness: 0.6,
      metalness: 0.1,
      flatShading: true,
    });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 1.3;
    characterGroup.add(head);

    // Spiky Cyber Anime Hair (Cyan low-poly cones/boxes)
    const hairGroup = new THREE.Group();
    hairGroup.position.set(0, 1.45, 0);
    characterGroup.add(hairGroup);

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff, // neon cyber cyan hair
      roughness: 0.2,
      metalness: 0.8,
      flatShading: true,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.4,
    });

    // Generate spiky cyber locks
    for (let i = 0; i < 15; i++) {
      const lockGeom = new THREE.ConeGeometry(0.2, 0.65, 4);
      const lock = new THREE.Mesh(lockGeom, hairMat);
      
      // Position around head
      const theta = (i / 15) * Math.PI * 2;
      const x = Math.cos(theta) * 0.55;
      const z = Math.sin(theta) * 0.55;
      const y = Math.random() * 0.35 + 0.1;
      lock.position.set(x, y, z);
      
      // Point spikes outwards and slightly down
      lock.rotation.set(Math.random() * 0.4, 0, theta + Math.PI / 2);
      hairGroup.add(lock);
    }

    // Glowing Orange Visor/VR Headset
    const visorGeom = new THREE.BoxGeometry(0.9, 0.35, 0.4);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xff7c3b, // bright glowing orange visor
      emissive: 0xff5500,
      emissiveIntensity: 1.5,
      roughness: 0.05,
    });
    const visor = new THREE.Mesh(visorGeom, visorMat);
    visor.position.set(-0.05, 1.4, 0.6);
    visor.rotation.y = -0.3; // rotated facing slightly to screen
    characterGroup.add(visor);

    // Visor side straps
    const strapGeom = new THREE.BoxGeometry(1.4, 0.1, 0.8);
    const strapMat = new THREE.MeshBasicMaterial({ color: 0x0a1018 });
    const strap = new THREE.Mesh(strapGeom, strapMat);
    strap.position.set(0, 1.4, 0);
    characterGroup.add(strap);

    // Articulated Interaction Arms (Left & Right)
    // Left Arm (Tethered toward the glass screen)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.75, 0.25, 0.2);
    characterGroup.add(leftArmGroup);

    const armSegmentGeom = new THREE.CylinderGeometry(0.16, 0.12, 1.0, 4);
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      flatShading: true,
      roughness: 0.5,
    });

    const leftUpperArm = new THREE.Mesh(armSegmentGeom, armMat);
    leftUpperArm.position.y = -0.4;
    leftUpperArm.rotation.z = 0.5;
    leftUpperArm.rotation.x = -0.6;
    leftArmGroup.add(leftUpperArm);

    // Left hand pointing toward screen
    const handGeom = new THREE.SphereGeometry(0.18, 5, 5);
    const handMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3, flatShading: true });
    const leftHand = new THREE.Mesh(handGeom, handMat);
    leftHand.position.set(-0.4, -0.9, 0.6);
    leftArmGroup.add(leftHand);

    // Right Arm (Active Typing / Pressing screen)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.75, 0.25, 0.2);
    characterGroup.add(rightArmGroup);

    const rightUpperArm = new THREE.Mesh(armSegmentGeom, armMat);
    rightUpperArm.position.y = -0.4;
    rightUpperArm.rotation.z = -0.3;
    rightUpperArm.rotation.x = -0.8;
    rightArmGroup.add(rightUpperArm);

    // Right hand pointing directly to screen
    const rightHand = new THREE.Mesh(handGeom, handMat);
    rightHand.position.set(-0.2, -0.8, 0.75);
    rightArmGroup.add(rightHand);

    // 8. Dynamic Spring-Dampened Camera and Cursor Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetCamX = -2;
    let targetCamY = 4.5;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // Normalize mouse positions: -0.5 to 0.5 relative to center of viewport
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      mouseX = x;
      mouseY = y;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // 9. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Camera spring-damped parallax look-around (gives dramatic spatial feel)
      targetCamX += (-2 + mouseX * 4.2 - targetCamX) * 0.05;
      targetCamY += (4.5 - mouseY * 4.2 - targetCamY) * 0.05;

      camera.position.x = targetCamX;
      camera.position.y = targetCamY;
      // Keep looking towards the floating spatial card
      camera.lookAt(-1.5, 0.2, 0);

      // Character gentle float / bobbing animation on a slow wave
      const floatY = Math.sin(time * 1.5) * 0.15;
      characterGroup.position.y = 0.4 + floatY;

      // Character head bobbing looking at screen
      head.rotation.y = -0.22 + Math.sin(time * 0.8) * 0.04;
      head.rotation.x = Math.sin(time * 1.5) * 0.03;
      hairGroup.rotation.y = head.rotation.y;
      hairGroup.rotation.x = head.rotation.x;
      visor.rotation.y = -0.3 + head.rotation.y;

      // Animate active typing hand (Right Arm reaches and bob-taps forward/backward)
      const typingTap = Math.sin(time * 4.5) * 0.12;
      rightHand.position.z = 0.75 + typingTap;
      rightHand.position.y = -0.8 + Math.cos(time * 4.5) * 0.06;
      rightUpperArm.rotation.x = -0.8 + Math.sin(time * 4.5) * 0.08;

      // Animate left hand resting hovering
      leftHand.position.y = -0.9 + Math.sin(time * 2.0) * 0.05;
      leftUpperArm.rotation.x = -0.6 + Math.cos(time * 2.0) * 0.04;

      // Float the 3D Glass Screen and buttons in weightless space
      // Bobbing of main card
      const cardBob = Math.sin(time * 1.1) * 0.08;
      cardMesh.position.y = 0.8 + cardBob;
      cardLine.rotation.y = Math.sin(time * 0.5) * 0.01;

      // Bobbing of Buttons (slightly delayed phase)
      const btnBob = Math.sin(time * 1.1 + 0.4) * 0.06;
      prevMesh.position.y = -2.6 + btnBob;
      nextMesh.position.y = -2.6 + btnBob;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Handle Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      grid.dispose();
      lineGeom.dispose();
      lineMat.dispose();
      uiTexture.dispose();
      cardGeom.dispose();
      cardMat.dispose();
      cardEdges.dispose();
      cardLine.geometry.dispose();
      prevTexture.dispose();
      btnGeom.dispose();
      prevMat.dispose();
      prevEdges.dispose();
      prevLine.geometry.dispose();
      nextTexture.dispose();
      nextMat.dispose();
      nextEdges.dispose();
      nextLine.geometry.dispose();

      torsoGeom.dispose();
      torsoMat.dispose();
      collarGeom.dispose();
      collarMat.dispose();
      headGeom.dispose();
      headMat.dispose();
      hairMat.dispose();
      visorGeom.dispose();
      visorMat.dispose();
      strapGeom.dispose();
      strapMat.dispose();
      armSegmentGeom.dispose();
      armMat.dispose();
      handGeom.dispose();
      handMat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[350px] md:min-h-[440px] flex items-center justify-center bg-transparent relative overflow-hidden"
    />
  );
};

export default SpatialFeatureCanvas;
