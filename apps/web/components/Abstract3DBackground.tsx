"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const Abstract3DBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Scene, Camera, and WebGL Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Perspective camera placed at the center of the star dome
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 0.1); // slightly offset from origin

    const isRetina = window.devicePixelRatio > 1;
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isRetina,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Dynamic Mouse Point Light (For water specular reflections)
    const mousePointLight = new THREE.PointLight(0xffffff, 5.0, 15);
    mousePointLight.position.set(0, 0, 2);
    scene.add(mousePointLight);

    // 3. Generate Star Field Data (Increased to 4500 stars)
    const starCount = 4500;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinkleSpeeds = new Float32Array(starCount);
    const phases = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Uniform spherical distribution of stars
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Place stars in a wide spherical dome at distances between 10.0 and 32.0 units
      const r = 10.0 + Math.random() * 22.0;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Star size distribution: 85% tiny realistic background stars, 15% larger glowing specs
      const sizeRand = Math.random();
      if (sizeRand < 0.85) {
        sizes[i] = 0.04 + Math.random() * 0.08;
      } else {
        sizes[i] = 0.16 + Math.random() * 0.22;
      }

      // Individual speeds and phases for asynchronous GPU twinkling
      twinkleSpeeds[i] = 1.2 + Math.random() * 3.8;
      phases[i] = Math.random() * Math.PI * 2.0;

      // Lifelike star color variations: warm yellow/peach, cool light blue, and crisp white
      let rColor = 0.95, gColor = 0.95, bColor = 1.0;
      const colRand = Math.random();
      if (colRand < 0.12) {
        // Cool blue star
        rColor = 0.78; gColor = 0.86; bColor = 1.0;
      } else if (colRand < 0.24) {
        // Warm peach star
        rColor = 1.0; gColor = 0.91; bColor = 0.80;
      }

      colors[i * 3] = rColor;
      colors[i * 3 + 1] = gColor;
      colors[i * 3 + 2] = bColor;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    starGeometry.setAttribute("aTwinkleSpeed", new THREE.BufferAttribute(twinkleSpeeds, 1));
    starGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // 4. Custom GLSL Star Shader (Twigling on GPU, Perspective Size)
    const uniforms = {
      uTime: { value: 0 },
    };

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        attribute float aSize;
        attribute float aTwinkleSpeed;
        attribute float aPhase;
        attribute vec3 color;
        uniform float uTime;
        varying float vTwinkle;
        varying vec3 vColor;

        void main() {
          vColor = color;
          
          // Twinkle logic: range from 0.15 (dim) to 1.0 (bright)
          vTwinkle = 0.15 + 0.85 * sin(uTime * aTwinkleSpeed + aPhase);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Perspective sizing: closer stars appear larger
          gl_PointSize = aSize * (350.0 / -mvPosition.z);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vTwinkle;
        varying vec3 vColor;

        void main() {
          // Soft circular glows
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.05, dist);
          
          gl_FragColor = vec4(vColor, alpha * vTwinkle);
        }
      `,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Subtle Cosmic Nebula Layer (Soft background gas glow)
    const nebulaGeometry = new THREE.SphereGeometry(35, 16, 16);
    const nebulaMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          vec3 nebulaColor = vec3(0.04, 0.03, 0.08);
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1)), 2.5);
          gl_FragColor = vec4(nebulaColor * intensity, 0.07);
        }
      `,
    });
    const nebulaField = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebulaField);

    // 6. Highly Reflective Glistening Water Overlay - Ripple Buffer Setup
    const rippleCount = 6;
    const ripplesPos = Array.from({ length: rippleCount }, () => new THREE.Vector2(0, 0));
    const ripplesAge = Array.from({ length: rippleCount }, () => -999.0); // inactive
    let currentRippleIdx = 0;
    const lastRipplePos = new THREE.Vector3();

    const waterGeometry = new THREE.PlaneGeometry(36, 26, 128, 128);
    const waterMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      uniforms: {
        uTime: uniforms.uTime,
        uLightPos: { value: new THREE.Vector3(0, 0, 2.0) },
        uRipplesPos: { value: ripplesPos },
        uRipplesAge: { value: ripplesAge },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uRipplesPos[6];
        uniform float uRipplesAge[6];
        varying vec3 vPosition;
        varying vec3 vNormal;

        float getDisplacement(vec2 pos, float time) {
          float wave = sin(pos.x * 0.32 + time * 1.3) * 0.035;
          wave += cos(pos.y * 0.22 + time * 1.1) * 0.022;
          
          float totalRipple = 0.0;
          for (int i = 0; i < 6; i++) {
            float age = uRipplesAge[i];
            if (age >= 0.0 && age < 3.0) {
              float dist = distance(pos, uRipplesPos[i]);
              float speed = 4.5;
              float freq = 9.5;
              float decay = 1.1;
              float amplitude = 0.09;
              
              float w = dist * freq - age * speed;
              float ripple = sin(w) * exp(-age * decay) * exp(-dist * 0.14) * amplitude;
              float front = step(dist, age * speed);
              totalRipple += ripple * front;
            }
          }
          return wave + totalRipple;
        }

        void main() {
          
          float h = getDisplacement(position.xy, uTime);
          vec3 displaced = position;
          displaced.z += h;
          
          vPosition = displaced;
          
          // Numerical derivative for perfect smooth normals on GPU
          float eps = 0.04;
          float hX = getDisplacement(position.xy + vec2(eps, 0.0), uTime);
          float hY = getDisplacement(position.xy + vec2(0.0, eps), uTime);
          
          vec3 tangent = vec3(eps, 0.0, hX - h);
          vec3 bitangent = vec3(0.0, eps, hY - h);
          vNormal = normalize(cross(tangent, bitangent));
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uLightPos;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vec3 normal = normalize(vNormal);
          
          // Highly visible base space water color
          vec3 baseWaterColor = vec3(0.008, 0.035, 0.075);
          
          vec3 viewDir = normalize(vec3(0.0, 0.0, 5.0) - vPosition);
          vec3 lightDir = normalize(uLightPos - vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          
          float diff = max(dot(normal, lightDir), 0.0);
          
          // Highly responsive specular highlight
          float spec = pow(max(dot(normal, halfDir), 0.0), 96.0);
          
          // Fresnel reflection
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
          
          // Glowing cyan/indigo highlights on dynamic ripples to guarantee visibility on black!
          vec3 rippleGlow = vec3(0.15, 0.42, 0.75) * diff;
          vec3 specularGlisten = vec3(0.92, 0.95, 1.0) * spec * 2.5;
          
          vec3 color = baseWaterColor + rippleGlow + specularGlisten;
          
          float opacity = 0.22 + fresnel * 0.45;
          
          gl_FragColor = vec4(color, opacity);
        }
      `,
    });

    const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    waterMesh.position.set(0, 0, -5.5);
    scene.add(waterMesh);

    // 7. Mouse Interaction Tracking (Spring Physics Parallax & Raycasting)
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2(-1000, -1000);
    const targetMouse3D = new THREE.Vector3(0, 0, -5.5);
    const currentMouse3D = new THREE.Vector3(0, 0, -5.5);

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized coordinates (-1 to 1) for parallax
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Set mouseVec for raycasting
      mouseVec.x = normX;
      mouseVec.y = normY;

      // Parallax rotation bounds
      targetRotY = normX * 0.35;
      targetRotX = normY * 0.25;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 8. Animation Loop
    let animationFrameId: number;
    let isAnimating = false;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Pass elapsed time to twinkle shader
      uniforms.uTime.value = time;

      // Project mouse position using Raycaster onto the water plane to guide reflections and ripples
      if (mouseVec.x > -999) {
        raycaster.setFromCamera(mouseVec, camera);
        const intersects = raycaster.intersectObject(waterMesh);
        if (intersects.length > 0 && intersects[0]?.point) {
          const pt = intersects[0].point;
          targetMouse3D.copy(pt);

          // Emit ripples near the cursor when mouse moves
          const distSq = pt.distanceToSquared(lastRipplePos);
          if (distSq > 0.05) {
            const currentRipple = ripplesPos[currentRippleIdx];
            if (currentRipple) {
              currentRipple.set(pt.x, pt.y);
            }
            ripplesAge[currentRippleIdx] = 0.0;
            currentRippleIdx = (currentRippleIdx + 1) % rippleCount;
            lastRipplePos.copy(pt);
          }
        }
      }

      // Age all active ripples
      for (let i = 0; i < rippleCount; i++) {
        const age = ripplesAge[i];
        if (age !== undefined && age >= 0) {
          const nextAge = age + delta;
          ripplesAge[i] = nextAge;
          if (nextAge > 3.0) {
            ripplesAge[i] = -999.0; // deactivate expired ripples
          }
        }
      }

      // Smooth mouse point-light position and camera tilts using spring physics (lerp)
      currentMouse3D.lerp(targetMouse3D, 0.08);
      currentRotX += (targetRotX - currentRotX) * 0.04;
      currentRotY += (targetRotY - currentRotY) * 0.04;

      // Update point light position slightly in front of the water sheet
      mousePointLight.position.set(currentMouse3D.x, currentMouse3D.y, currentMouse3D.z + 1.25);
      if (waterMaterial.uniforms.uLightPos) {
        waterMaterial.uniforms.uLightPos.value.copy(mousePointLight.position);
      }

      // Rotate the star field based on both cursor tilt and a slow automatic spin
      starField.rotation.y = time * 0.008 + currentRotY;
      starField.rotation.x = currentRotX;

      // Nebula rotates slightly out of sync to build depth separation
      nebulaField.rotation.y = -time * 0.003 + currentRotY * 0.3;
      nebulaField.rotation.x = currentRotX * 0.3;

      renderer.render(scene, camera);
    };

    // 9. Intersection Observer (pause rendering when scrolled out of view)
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && !isAnimating) {
          isAnimating = true;
          clock.getDelta(); // reset clock delta
          animate();
        } else if (!entry.isIntersecting && isAnimating) {
          isAnimating = false;
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(container);

    // 10. Tab visibility listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
        isAnimating = false;
      } else if (!isAnimating) {
        isAnimating = true;
        clock.getDelta(); // reset clock delta
        animate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 11. Handle Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 12. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      
      starGeometry.dispose();
      starMaterial.dispose();
      nebulaGeometry.dispose();
      nebulaMaterial.dispose();
      waterGeometry.dispose();
      waterMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-[#020205]"
    />
  );
};

export default Abstract3DBackground;
