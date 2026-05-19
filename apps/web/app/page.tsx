"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThreeBackground } from "~/components/ThreeBackground";
import { Sparkles, Terminal, Flame, ArrowRight, CheckCircle2, Play } from "lucide-react";

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<"anime" | "tech" | "retro">("anime");

  return (
    <main className="relative min-h-screen text-white overflow-x-hidden bg-zinc-950 font-sans flex flex-col">
      {/* 3D Dynamic Background */}
      <ThreeBackground theme={selectedTheme} />

      {/* Header / Navbar */}
      <header className="sticky top-0 w-full z-50 bg-zinc-950/40 backdrop-blur-lg border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="font-extrabold text-sm text-black">FS</span>
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            formspace.
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold hover:text-purple-400 transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all rounded-xl px-5 py-2.5 shadow-md shadow-white/5"
          >
            Launch Builder
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-grow flex flex-col justify-center px-6 py-20 md:py-32 md:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="max-w-3xl flex flex-col gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 w-max text-xs font-semibold text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            Hackathon Production Starter
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.05] bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Form building,<br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
              dimensionally reimagined.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-medium">
            Build production-grade dynamic forms with high-fidelity, 3D character reactions. Tap into gorgeous pre-configured theme templates, manage responses from an optimized creator panel, and export via Scalar API.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 font-bold px-8 py-4 rounded-2xl shadow-lg shadow-purple-500/25 transition-all text-white"
            >
              Get Started (Demo Account)
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            {/* Quick Public Form Fill CTA */}
            <Link
              href="/fill/anime-survey"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 font-bold px-8 py-4 rounded-2xl transition-all"
            >
              <Play className="w-4 h-4 fill-current text-zinc-300" />
              Test Live 3D Form
            </Link>
          </div>
        </div>

        {/* Feature Theme Selection Tabs */}
        <div className="mt-20 md:mt-28 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Select Background Theme (Interactive 3D Backdrop)
            </h3>
            <p className="text-sm text-zinc-400">
              Pick a theme below to view the interactive particle shifts. These themes translate to custom 3D visual templates in our public questionnaire forms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
            {/* Anime Tab */}
            <button
              onClick={() => setSelectedTheme("anime")}
              className={`flex items-center gap-3 p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                selectedTheme === "anime"
                  ? "bg-pink-500/10 border-pink-500/40 shadow-lg shadow-pink-500/5"
                  : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base">Anime & Manga</h4>
                <p className="text-xs text-zinc-400">Flowing pink sakura stardust blossoms</p>
              </div>
            </button>

            {/* Tech Tab */}
            <button
              onClick={() => setSelectedTheme("tech")}
              className={`flex items-center gap-3 p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                selectedTheme === "tech"
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                  : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base">Cyberpunk OS</h4>
                <p className="text-xs text-zinc-400">Neon grids & matrix lines</p>
              </div>
            </button>

            {/* Retro Tab */}
            <button
              onClick={() => setSelectedTheme("retro")}
              className={`flex items-center gap-3 p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                selectedTheme === "retro"
                  ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5"
                  : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base">Classic Retro</h4>
                <p className="text-xs text-zinc-400">Nostalgic 8-bit voxel space dust</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-white/5 text-center text-xs text-zinc-500 z-10 px-6">
        <p>© 2026 Formspace Inc. Built with Next.js, Three.js, tRPC, and Drizzle for Hackathon Submission.</p>
      </footer>
    </main>
  );
}
