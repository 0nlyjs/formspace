"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronDown, User, Scissors, Sparkles } from "lucide-react";

export const FloatingGlassCard: React.FC = () => {
  // Stateful interactivity for high-fidelity feel
  const [isSubs, setIsSubs] = useState(true);
  const [favoriteGenre, setFavoriteGenre] = useState("Action / Sci-Fi");
  const [rating, setRating] = useState("8.5");
  const [favoriteSeries, setFavoriteSeries] = useState("Jujutsu Kaisen");

  // DOM Ref to bypass React state for high-performance 120fps CSS 3D updates
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
      className="w-full rounded-[1.8rem] p-5 md:p-6 overflow-hidden select-none transition-shadow duration-300"
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
        // Default flat transformation scaled to 100% before events start firing
        transform: "scale(1) rotateX(0deg) rotateY(0deg) translateY(0px)",
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
          {/* Cute Stylized Anime Character Head (SVG) */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#52a3dd]/30 to-[#90cdff]/10 border border-[#52a3dd]/40 flex items-center justify-center shadow-[0_0_12px_rgba(82,163,221,0.2)]">
            <svg
              viewBox="0 0 100 100"
              className="w-6 h-6 text-[#90cdff]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15,50 C15,25 35,15 50,15 C65,15 85,25 85,50 C85,60 80,75 75,80 C65,72 50,85 50,85 C50,85 35,72 25,80 C20,75 15,60 15,50 Z"
                fill="currentColor"
                fillOpacity="0.15"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M25,45 H75 C78,45 80,48 78,52 L74,62 C73,65 70,67 67,67 H33 C30,67 27,65 26,62 L22,52 C20,48 22,45 25,45 Z"
                fill="currentColor"
                fillOpacity="0.4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="50" cy="27" r="4.5" fill="#52a3dd" stroke="currentColor" strokeWidth="1.5" />
              <path d="M50,15 V22" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-white text-sm md:text-base font-black tracking-wider uppercase font-sans">
              Anime Community Survey 2077
            </h3>
          </div>
        </div>

        {/* Section subtitle */}
        <div className="border-t border-[#52a3dd]/15 pt-2">
          <span className="text-[#52a3dd] text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(82,163,221,0.2)]">
            <Sparkles className="w-3 h-3 animate-pulse" />
            Section 3: Anime Preferences & Favorites
          </span>
        </div>

        {/* Main Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3.5 text-left">
          
          {/* Preferred Genre */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Preferred Genre:
            </label>
            <div className="relative group/field">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52a3dd]">
                <Scissors className="w-3 h-3 rotate-90" />
              </div>
              <select
                value={favoriteGenre}
                onChange={(e) => setFavoriteGenre(e.target.value)}
                className="w-full bg-black/45 border border-[#52a3dd]/20 group-hover/field:border-[#52a3dd]/40 focus:border-[#90cdff] rounded-xl pl-8.5 pr-8 py-2 text-[11px] text-zinc-200 font-medium tracking-wide outline-none appearance-none transition-all cursor-pointer"
                style={{ textShadow: "0 0 5px rgba(255,255,255,0.1)" }}
              >
                <option value="Action / Sci-Fi" className="bg-[#0b131a] text-zinc-300">Action / Sci-Fi</option>
                <option value="Cyberpunk / Mecha" className="bg-[#0b131a] text-zinc-300">Cyberpunk / Mecha</option>
                <option value="Fantasy / Shonen" className="bg-[#0b131a] text-zinc-300">Fantasy / Shonen</option>
                <option value="Slice of Life / Drama" className="bg-[#0b131a] text-zinc-300">Slice of Life / Drama</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Rating of Last Watched Series */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Rating of Last Watched Series (0-10):
            </label>
            <div className="relative group/field">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52a3dd]">
                <Star className="w-3 h-3 fill-[#52a3dd]/20" />
              </div>
              <input
                type="text"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-black/45 border border-[#52a3dd]/20 group-hover/field:border-[#52a3dd]/40 focus:border-[#90cdff] rounded-xl pl-8.5 pr-4 py-2 text-[11px] text-[#90cdff] font-bold tracking-wide outline-none transition-all placeholder-zinc-600"
                placeholder="e.g. 8.5"
              />
            </div>
          </div>

          {/* Favorite Series */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Favorite Series:
            </label>
            <div className="relative group/field">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52a3dd]">
                <User className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={favoriteSeries}
                onChange={(e) => setFavoriteSeries(e.target.value)}
                className="w-full bg-black/45 border border-[#52a3dd]/20 group-hover/field:border-[#52a3dd]/40 focus:border-[#90cdff] rounded-xl pl-8.5 pr-4 py-2 text-[11px] text-zinc-300 font-medium tracking-wide outline-none transition-all placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Do you prefer Subs or Dubs? */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Do you prefer Subs or Dubs?
            </label>
            <div className="flex items-center gap-3 bg-black/35 border border-[#52a3dd]/15 rounded-xl px-3 py-1.5">
              <button
                type="button"
                onClick={() => setIsSubs(!isSubs)}
                className="relative w-10 h-5.5 rounded-full bg-slate-950 border border-[#52a3dd]/30 transition-all flex items-center px-0.5"
              >
                <motion.div
                  animate={{ x: isSubs ? 0 : 18 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="w-3.5 h-3.5 rounded-full bg-[#90cdff] shadow-[0_0_8px_rgba(144,205,255,0.7)]"
                />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                [{" "}
                <span
                  onClick={() => setIsSubs(true)}
                  className={`cursor-pointer transition-colors ${
                    isSubs ? "text-[#90cdff] drop-shadow-[0_0_6px_rgba(144,205,255,0.6)] font-extrabold" : "hover:text-zinc-300"
                  }`}
                >
                  Subs
                </span>{" "}
                |{" "}
                <span
                  onClick={() => setIsSubs(false)}
                  className={`cursor-pointer transition-colors ${
                    !isSubs ? "text-[#90cdff] drop-shadow-[0_0_6px_rgba(144,205,255,0.6)] font-extrabold" : "hover:text-zinc-300"
                  }`}
                >
                  Dubs
                </span>{" "}
                ]
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Actions section */}
        <div className="flex justify-end gap-3 mt-1.5 border-t border-[#52a3dd]/15 pt-3">
          {/* Prev Button */}
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#90cdff] border border-[#52a3dd]/35 hover:border-[#90cdff] hover:bg-[#52a3dd]/10 active:scale-95 transition-all duration-200"
          >
            &lt; Prev
          </button>
          {/* Next Button */}
          <button
            type="button"
            className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-black bg-[#90cdff] hover:bg-[#52a3dd] hover:shadow-[0_0_12px_rgba(82,163,221,0.5)] active:scale-95 transition-all duration-200 shadow-[0_0_8px_rgba(82,163,221,0.3)]"
          >
            Next &gt;
          </button>
        </div>

      </div>
    </div>
  );
};

export default FloatingGlassCard;
