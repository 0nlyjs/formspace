"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronDown, User, Scissors, Sparkles, Monitor, Terminal, Code, Cpu } from "lucide-react";

export const TechFloatingGlassCard: React.FC = () => {
  // Stateful interactivity for tech inputs
  const [isDark, setIsDark] = useState(true);
  const [preferredOS, setPreferredOS] = useState("macOS (Darwin)");
  const [favoriteTerminal, setFavoriteTerminal] = useState("Warp / iTerm2");
  const [favoriteEditor, setFavoriteEditor] = useState("VS Code / Cursor / Neovim");
  const [yearsExp, setYearsExp] = useState("Senior (5+ Years)");
  const [favLanguage, setFavLanguage] = useState("TypeScript / Rust");

  // DOM Ref to bypass React state for high-performance 120fps CSS 3D updates on the entire group
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card) return;

    // Window mouse coordinates for tilt
    let isHovered = false;

    // Spring physics variables for ultra-smooth transitions
    let currentRotateX = 0;
    let currentRotateY = 0;
    let currentTranslateY = 0;
    let currentScale = 1.0;

    let targetRotateX = 0;
    let targetRotateY = 0;
    let targetTranslateY = 0;
    let targetScale = 1.0;

    // Glare position variables
    let glareX = 0;
    let glareY = 0;
    let targetGlareX = 0;
    let targetGlareY = 0;

    const handleWindowMouseMove = (e: MouseEvent) => {
      // 1. Calculate normalized coordinates (-1 to 1) for the whole window
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;

      // 2. Set target rotations (max 12 degrees tilt)
      targetRotateX = -normY * 12;
      targetRotateY = normX * 12;

      // 3. Map to card local coordinates for glare reflection
      const rect = card.getBoundingClientRect();
      targetGlareX = e.clientX - rect.left;
      targetGlareY = e.clientY - rect.top;
    };

    const handleMouseEnter = () => {
      isHovered = true;
      targetScale = 1.04; // scale up slightly more on hover for premium depth
    };

    const handleMouseLeave = () => {
      isHovered = false;
      targetScale = 1.0;
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    let animationFrameId: number;
    const startTime = Date.now();

    const updatePhysics = () => {
      animationFrameId = requestAnimationFrame(updatePhysics);

      const elapsed = (Date.now() - startTime) / 1000;
      
      // Gentle floating bobbing loop (using sine wave)
      // Amplitude: 12px, Period: ~4.5 seconds
      // On hover, we can slightly dampen the bobbing amplitude for better usability of form elements
      const bobAmplitude = isHovered ? 3 : 12;
      const bobFreq = 1.4; // rads per sec
      targetTranslateY = Math.sin(elapsed * bobFreq) * bobAmplitude;

      // Spring physics interpolation (lerp with damping)
      currentRotateX += (targetRotateX - currentRotateX) * 0.08;
      currentRotateY += (targetRotateY - currentRotateY) * 0.08;
      currentTranslateY += (targetTranslateY - currentTranslateY) * 0.08;
      currentScale += (targetScale - currentScale) * 0.1;

      // Apply gorgeous premium 3D transforms:
      card.style.transform = `scale(${currentScale}) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) translateY(${currentTranslateY}px)`;

      // Smoothly interpolate glare coordinates
      if (glare) {
        glareX += (targetGlareX - glareX) * 0.15;
        glareY += (targetGlareY - glareY) * 0.15;
        glare.style.background = `radial-gradient(circle 250px at ${glareX}px ${glareY}px, rgba(144, 205, 255, 0.22) 0%, transparent 80%)`;
      }
    };

    updatePhysics();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="w-full flex flex-col items-center gap-6"
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
        transform: "scale(1) rotateX(0deg) rotateY(0deg) translateY(0px)",
      }}
    >
      
      {/* 1. Main Glassmorphism Card (Tech Theme) */}
      <div
        className="w-full rounded-[1.8rem] p-5 md:p-6 overflow-hidden select-none transition-shadow duration-300"
        style={{
          transformStyle: "preserve-3d",
          background:
            "linear-gradient(135deg, rgba(8, 20, 32, 0.70) 0%, rgba(3, 10, 16, 0.80) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(82, 163, 221, 0.25)",
          boxShadow:
            "0 15px 40px rgba(0, 0, 0, 0.75), 0 0 30px rgba(82, 163, 221, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Subtle cyan corner light flares */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#52a3dd]/15 to-transparent blur-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#52a3dd]/10 to-transparent blur-xl pointer-events-none" />

        {/* Diagonally sweep glass shine animation */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.15) 45%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.15) 55%, transparent 65%)",
            backgroundSize: "200% 200%",
            animation: "navbar-bg-sweep 12s linear infinite",
          }}
        />

        {/* Dynamic interactive cursor spotlight glare reflection */}
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none z-15 mix-blend-screen opacity-100 transition-opacity duration-300"
          style={{
            background: "radial-gradient(circle 250px at 50% 50%, rgba(144, 205, 255, 0.22) 0%, transparent 80%)"
          }}
        />

        {/* Card Content Wrapper with translate-z for 3D depth pop */}
        <div style={{ transform: "translateZ(40px)" }} className="relative z-10 flex flex-col gap-4">
          
          {/* Header section */}
          <div className="flex items-center gap-3">
            {/* Sci-fi Terminal Icon (SVG) */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#52a3dd]/30 to-[#90cdff]/10 border border-[#52a3dd]/40 flex items-center justify-center shadow-[0_0_12px_rgba(82,163,221,0.2)]">
              <Monitor className="w-5 h-5 text-[#90cdff]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-white text-sm md:text-base font-black tracking-wider uppercase font-sans">
                Tech Community Survey 2077
              </h3>
            </div>
          </div>

          {/* Section subtitle */}
          <div className="border-t border-[#52a3dd]/15 pt-2">
            <span className="text-[#52a3dd] text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(82,163,221,0.2)]">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Section 2: Operating Systems & Developer Tools
            </span>
          </div>

          {/* Main Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3.5 text-left">
            
            {/* Preferred OS */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Preferred OS:
              </label>
              <div className="relative group/field">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52a3dd]">
                  <Scissors className="w-3 h-3 rotate-90" />
                </div>
                <select
                  value={preferredOS}
                  onChange={(e) => setPreferredOS(e.target.value)}
                  className="w-full bg-black/45 border border-[#52a3dd]/20 group-hover/field:border-[#52a3dd]/40 focus:border-[#90cdff] rounded-xl pl-8.5 pr-8 py-2 text-[11px] text-zinc-200 font-medium tracking-wide outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="macOS (Darwin)" className="bg-[#0b131a] text-zinc-300">macOS (Darwin)</option>
                  <option value="Linux (Arch/Ubuntu)" className="bg-[#0b131a] text-zinc-300">Linux (Arch/Ubuntu)</option>
                  <option value="Windows 11 (WSL2)" className="bg-[#0b131a] text-zinc-300">Windows 11 (WSL2)</option>
                  <option value="BSD / Unix" className="bg-[#0b131a] text-zinc-300">BSD / Unix</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Favorite Terminal */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Favorite Terminal:
              </label>
              <div className="relative group/field">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52a3dd]">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={favoriteTerminal}
                  onChange={(e) => setFavoriteTerminal(e.target.value)}
                  className="w-full bg-black/45 border border-[#52a3dd]/20 group-hover/field:border-[#52a3dd]/40 focus:border-[#90cdff] rounded-xl pl-8.5 pr-4 py-2 text-[11px] text-zinc-200 font-medium tracking-wide outline-none transition-all"
                  placeholder="e.g. iTerm2 / Warp"
                />
              </div>
            </div>

            {/* Favorite Text Editor */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Favorite Text Editor:
              </label>
              <div className="relative group/field">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52a3dd]">
                  <Code className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={favoriteEditor}
                  onChange={(e) => setFavoriteEditor(e.target.value)}
                  className="w-full bg-black/45 border border-[#52a3dd]/20 group-hover/field:border-[#52a3dd]/40 focus:border-[#90cdff] rounded-xl pl-8.5 pr-4 py-2 text-[11px] text-zinc-200 font-medium tracking-wide outline-none transition-all"
                  placeholder="e.g. Cursor / VS Code"
                />
              </div>
            </div>

            {/* Do you prefer Dark mode or Light mode? */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Do you prefer Dark or Light?
              </label>
              <div className="flex items-center gap-3 bg-black/35 border border-[#52a3dd]/15 rounded-xl px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setIsDark(!isDark)}
                  className="relative w-10 h-5.5 rounded-full bg-slate-950 border border-[#52a3dd]/30 transition-all flex items-center px-0.5"
                >
                  <motion.div
                    animate={{ x: isDark ? 0 : 18 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="w-3.5 h-3.5 rounded-full bg-[#90cdff] shadow-[0_0_8px_rgba(144,205,255,0.7)]"
                  />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  [{" "}
                  <span
                    onClick={() => setIsDark(true)}
                    className={`cursor-pointer transition-colors ${
                      isDark ? "text-[#90cdff] drop-shadow-[0_0_6px_rgba(144,205,255,0.6)] font-extrabold" : "hover:text-zinc-300"
                    }`}
                  >
                    Dark
                  </span>{" "}
                  |{" "}
                  <span
                    onClick={() => setIsDark(false)}
                    className={`cursor-pointer transition-colors ${
                      !isDark ? "text-[#90cdff] drop-shadow-[0_0_6px_rgba(144,205,255,0.6)] font-extrabold" : "hover:text-zinc-300"
                    }`}
                  >
                    Light
                  </span>{" "}
                  ]
                </span>
              </div>
            </div>

            {/* Years of Coding Experience */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Coding Experience:
              </label>
              <div className="relative group/field">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52a3dd]">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <select
                  value={yearsExp}
                  onChange={(e) => setYearsExp(e.target.value)}
                  className="w-full bg-black/45 border border-[#52a3dd]/20 group-hover/field:border-[#52a3dd]/40 focus:border-[#90cdff] rounded-xl pl-8.5 pr-8 py-2 text-[11px] text-zinc-200 font-medium tracking-wide outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="Junior (0-2 Years)" className="bg-[#0b131a] text-zinc-300">Junior (0-2 Years)</option>
                  <option value="Mid-level (2-5 Years)" className="bg-[#0b131a] text-zinc-300">Mid-level (2-5 Years)</option>
                  <option value="Senior (5+ Years)" className="bg-[#0b131a] text-zinc-300">Senior (5+ Years)</option>
                  <option value="Principal (10+ Years)" className="bg-[#0b131a] text-zinc-300">Principal (10+ Years)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Favorite Programming Language */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Favorite Language:
              </label>
              <div className="relative group/field">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52a3dd]">
                  <Code className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={favLanguage}
                  onChange={(e) => setFavLanguage(e.target.value)}
                  className="w-full bg-black/45 border border-[#52a3dd]/20 group-hover/field:border-[#52a3dd]/40 focus:border-[#90cdff] rounded-xl pl-8.5 pr-4 py-2 text-[11px] text-zinc-200 font-medium tracking-wide outline-none transition-all"
                  placeholder="e.g. TypeScript / Rust / Go"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Separate Floating Glass Button Panels Underneath (Tethered in 3D Space) */}
      <div className="flex gap-4 w-[75%] -mt-2" style={{ transformStyle: "preserve-3d" }}>
        
        {/* Floating Prev Button Card */}
        <div
          className="flex-1 rounded-xl py-3.5 text-center cursor-pointer transition-colors duration-300 select-none"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(20px)",
            background:
              "linear-gradient(135deg, rgba(8, 20, 32, 0.65) 0%, rgba(3, 10, 16, 0.75) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(82, 163, 221, 0.25)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          }}
        >
          <span className="text-[12.5px] font-black uppercase tracking-wider text-[#90cdff] drop-shadow-[0_0_6px_rgba(144,205,255,0.2)]">
            &lt; Prev
          </span>
        </div>

        {/* Floating Next Button Card */}
        <div
          className="flex-1 rounded-xl py-3.5 text-center cursor-pointer transition-colors duration-300 select-none shadow-[0_0_15px_rgba(82,163,221,0.35)]"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(20px)",
            background: "linear-gradient(90deg, #90cdff 0%, #52a3dd 100%)",
            boxShadow: "0 10px 30px rgba(82, 163, 221, 0.25)",
          }}
        >
          <span className="text-[12.5px] font-black uppercase tracking-wider text-[#030a10]">
            Next &gt;
          </span>
        </div>

      </div>

    </div>
  );
};

export default TechFloatingGlassCard;
