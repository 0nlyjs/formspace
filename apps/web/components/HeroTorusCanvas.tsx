"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Loader2 } from "lucide-react";

export const HeroTorusCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Scene, Camera and Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Add gorgeous premium dual-tone gradient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Cyan/blue main directional light from top-left
    const dirLight1 = new THREE.DirectionalLight(0x90cdff, 3.5);
    dirLight1.position.set(10, 12, 10);
    scene.add(dirLight1);

    // Orange/peach secondary directional light from bottom-right
    const dirLight2 = new THREE.DirectionalLight(0xffb690, 2.5);
    dirLight2.position.set(-10, -12, -10);
    scene.add(dirLight2);

    // Purple point light for additional highlight details
    const purpleLight = new THREE.PointLight(0xd946ef, 3.0, 30);
    purpleLight.position.set(5, 5, 5);
    scene.add(purpleLight);

    // 3. Load GLB Model
    const loader = new GLTFLoader();
    loader.load(
      "/sec1.glb",
      (gltf) => {
        const model = gltf.scene;

        // Auto-center and auto-scale model to fit a standard size
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Adjust position to center of bounding box
        model.position.x += -center.x;
        model.position.y += -center.y;
        model.position.z += -center.z;

        // Scale to standard height/width
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scale = 9.5 / maxDim;
          model.scale.set(scale, scale, scale);
        }

        scene.add(model);
        modelRef.current = model;
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error("Error loading GLB:", error);
        setLoading(false);
      },
    );

    // 4. Setup Interactivity Tracking (Mouse and Scroll) with Spring Physics
    const MAX_ROTATION_OTHER = (5 * Math.PI) / 180; // 5 degrees in radians (0.0873)
    const MAX_ROTATION_Y = (15 * Math.PI) / 180; // 15 degrees in radians (0.2618)

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let scrollY = 0;

    // Physics state tracking variables
    let currentRotX = 0;
    let currentRotY = 0;
    let currentRotZ = 0;

    let velX = 0;
    let velY = 0;
    let velZ = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize coordinate: -1 to 1 across the screen
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    // 5. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth interpolation for mouse inputs
      targetMouseX += (mouseX - targetMouseX) * 0.05;
      targetMouseY += (mouseY - targetMouseY) * 0.05;

      // 1. Calculate target rotations with strict clamp locks
      // Scroll mapping: 0px to 800px scroll shifts Y-rotation by up to +/- 7.5 degrees
      const scrollProgress = Math.min(scrollY / 800, 1);
      const scrollRotY = (scrollProgress - 0.5) * ((15 * Math.PI) / 180);

      // Mouse mapping: cursor shifts Y-rotation by up to +/- 5 degrees
      const mouseRotY = targetMouseX * ((5 * Math.PI) / 180);

      // Idle pendulum: gentle oscillation on Y-axis (up to 2 degrees)
      const idleRotY = Math.sin(time * 0.8) * ((2 * Math.PI) / 180);

      // Ensure the combined target Y-rotation NEVER exceeds the 15-degree hard limit
      const targetY = Math.max(
        -MAX_ROTATION_Y,
        Math.min(MAX_ROTATION_Y, scrollRotY + mouseRotY + idleRotY),
      );

      // X-axis target: mouse-move (+/- 3 degrees) + slow wave vertical bobbing (+/- 1.5 degrees)
      // Ensure the combined target X-rotation NEVER exceeds the 5-degree hard limit
      const mouseRotX = targetMouseY * ((3 * Math.PI) / 180);
      const idleRotX = Math.sin(time * 0.5) * ((1.5 * Math.PI) / 180);
      const targetX = Math.max(
        -MAX_ROTATION_OTHER,
        Math.min(MAX_ROTATION_OTHER, mouseRotX + idleRotX),
      );

      // Z-axis target: gentle roll proportional to mouse-move X (+/- 2 degrees)
      // Ensure the target Z-rotation NEVER exceeds the 5-degree hard limit
      const targetZ = Math.max(
        -MAX_ROTATION_OTHER,
        Math.min(MAX_ROTATION_OTHER, targetMouseX * ((2 * Math.PI) / 180)),
      );

      // 2. Physics Simulation: High-Fidelity Spring + Boundary Collisions
      // X-Axis (Strictly locked to 5 degrees)
      let forceX = (targetX - currentRotX) * 0.18;
      velX += forceX;
      velX *= 0.8; // friction/damping
      currentRotX += velX;

      // Handle soft momentum-reversal bounce when hitting boundaries
      if (currentRotX > MAX_ROTATION_OTHER) {
        currentRotX = MAX_ROTATION_OTHER;
        velX = -velX * 0.55; // bounce back with 55% energy
      } else if (currentRotX < -MAX_ROTATION_OTHER) {
        currentRotX = -MAX_ROTATION_OTHER;
        velX = -velX * 0.55; // bounce back
      }

      // Y-Axis (Strictly locked to 15 degrees)
      let forceY = (targetY - currentRotY) * 0.18;
      velY += forceY;
      velY *= 0.8;
      currentRotY += velY;

      // Elastic rebound bounce on Y-boundary
      if (currentRotY > MAX_ROTATION_Y) {
        currentRotY = MAX_ROTATION_Y;
        velY = -velY * 0.55;
      } else if (currentRotY < -MAX_ROTATION_Y) {
        currentRotY = -MAX_ROTATION_Y;
        velY = -velY * 0.55;
      }

      // Z-Axis (Strictly locked to 5 degrees)
      let forceZ = (targetZ - currentRotZ) * 0.18;
      velZ += forceZ;
      velZ *= 0.8;
      currentRotZ += velZ;

      // Elastic rebound bounce on Z-boundary
      if (currentRotZ > MAX_ROTATION_OTHER) {
        currentRotZ = MAX_ROTATION_OTHER;
        velZ = -velZ * 0.55;
      } else if (currentRotZ < -MAX_ROTATION_OTHER) {
        currentRotZ = -MAX_ROTATION_OTHER;
        velZ = -velZ * 0.55;
      }

      if (modelRef.current) {
        // Apply physics-calculated rotations to the model (with Y rotated 180 degrees by default)
        modelRef.current.rotation.x = currentRotX;
        modelRef.current.rotation.y = Math.PI + currentRotY;
        modelRef.current.rotation.z = currentRotZ;

        // Dynamic vertical float animation
        modelRef.current.position.y = Math.sin(time * 1.5) * 0.25;
      }

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
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[320px] md:min-h-[400px] flex items-center justify-center bg-transparent overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#90cdff]" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
};

export default HeroTorusCanvas;
