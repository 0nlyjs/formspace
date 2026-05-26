"use client";

import React from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { InteractiveBackground } from "~/components/InteractiveBackground";
import { HeroTorusCanvas } from "~/components/HeroTorusCanvas";
import { FeatureSphereCanvas } from "~/components/FeatureSphereCanvas";
import {
  Sparkles,
  ArrowRight,
  Play,
  User,
  ExternalLink,
  Copy,
  Loader2,
  Check,
  Twitter,
  Github,
  Linkedin,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  // Query session to conditionally toggle header action
  const { data: me } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Query public explore forms
  const { data: publicForms, isLoading: publicFormsLoading } = trpc.form.listPublic.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <main className="relative min-h-screen text-zinc-100 overflow-x-hidden bg-[#050505] font-sans flex flex-col">
      {/* 3D Solar Coordinate Particle Background */}
      <InteractiveBackground />

      {/* Header / Navbar */}
      <header className="sticky top-0 w-full z-50 bg-[#050505]/40 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        <Link href="/" className="flex items-center group">
          <img
            src="/logo.png"
            alt="FormSpace Logo"
            className="h-10 w-auto object-contain brightness-100 group-hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Navigation Items (text-xs to text-sm) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">
            Product
          </Link>
          <Link href="#features" className="hover:text-white transition-colors">
            Templates
          </Link>
          <Link href="#public-forms" className="hover:text-white transition-colors">
            Resources
          </Link>
          <Link href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Right CTA Actions (text-xs to text-sm) */}
        <div className="flex items-center gap-6">
          {me ? (
            <Link
              href="/dashboard"
              className="text-sm font-bold uppercase tracking-wider bg-transparent text-white border border-[#52a3dd]/40 hover:border-[#90cdff] hover:bg-[#52a3dd]/10 transition-all rounded-xl px-5 py-2.5 shadow-[0_0_15px_rgba(82,163,221,0.1)] hover:shadow-[0_0_20px_rgba(82,163,221,0.2)]"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-bold uppercase tracking-wider bg-transparent text-white border border-[#52a3dd]/40 hover:border-[#90cdff] hover:bg-[#52a3dd]/10 transition-all rounded-xl px-5 py-2.5 shadow-[0_0_15px_rgba(82,163,221,0.1)] hover:shadow-[0_0_20px_rgba(82,163,221,0.2)]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-grow flex items-center px-6 py-16 md:py-28 md:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            {/* Holographic Badge (text-xs to text-sm) */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffb690]/5 border border-[#ffb690]/15 w-max text-sm font-semibold text-[#ffb690]/95 shadow-[0_0_15px_rgba(255,182,144,0.03)] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#ffb690] animate-pulse" />
              Space Form Builder v2.0
            </div>

            {/* Big Premium Header (text-5xl/text-7xl to text-6xl/text-8xl) */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.05] text-white">
              Build the <br />
              <span 
                className="bg-clip-text text-transparent animate-spatial-gradient filter drop-shadow-[0_0_30px_rgba(144,205,255,0.15)] inline-block"
                style={{
                  backgroundImage: "linear-gradient(90deg, #52a3dd 0%, #e47939 33%, #52a3dd 66%, #e47939 100%)",
                  backgroundSize: "200% 100%"
                }}
              >
                future of
              </span>
              <br />
              <span 
                className="bg-clip-text text-transparent animate-spatial-gradient filter drop-shadow-[0_0_30px_rgba(144,205,255,0.15)] inline-block"
                style={{
                  backgroundImage: "linear-gradient(90deg, #52a3dd 0%, #e47939 33%, #52a3dd 66%, #e47939 100%)",
                  backgroundSize: "200% 100%",
                  animationDelay: "-2.75s"
                }}
              >
                forms.
              </span>
            </h1>

            {/* Description Subtext (text-sm/text-base to text-base/text-lg) */}
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-xl font-medium font-sans">
              Create interactive, three-dimensional survey spaces that captivate participants. With high-fidelity reactive characters, dynamic transitions, and real-time response capture, FormSpace redefines user inputs for the spatial web.
            </p>

            {/* Action Buttons (text-xs to text-sm) */}
            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                href={me ? "/dashboard" : "/signup"}
                className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider text-black bg-[#90cdff] hover:bg-[#52a3dd] transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(82,163,221,0.3)] duration-300"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/fill/anime-survey"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-[1.02] duration-300"
              >
                <Play className="w-3.5 h-3.5 fill-current text-zinc-300" />
                Test 3D Form
              </Link>
            </div>
          </div>

          {/* Right Column: Beautiful Holographic 3D Torus */}
          <div className="lg:col-span-5 flex justify-center items-center w-full">
            <div className="relative group w-full max-w-sm aspect-square rounded-[2rem] bg-[#0c0c0e]/80 border border-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden backdrop-blur-xl">
              {/* Subtle internal glowing orb */}
              <div className="absolute -inset-10 bg-radial from-[#52a3dd]/8 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
              <HeroTorusCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section (Interactive coordinates sphere) */}
      <section id="features" className="relative px-6 py-20 md:py-32 md:px-12 max-w-7xl mx-auto w-full z-10 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          {/* Left Column: Beautiful 3D Sphere Mesh inside Card */}
          <div className="lg:col-span-5 order-last lg:order-first flex justify-center items-center w-full">
            <div className="relative group w-full max-w-sm aspect-square rounded-[2rem] bg-[#0c0c0e]/80 border border-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden backdrop-blur-xl">
              {/* Subtle internal glowing orb */}
              <div className="absolute -inset-10 bg-radial from-[#e47939]/8 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
              <FeatureSphereCanvas />
            </div>
          </div>

          {/* Right Column: Heading, description and explore button */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            {/* Orange secondary accent badge (text-xs to text-sm) */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffb690]/5 border border-[#ffb690]/15 w-max text-sm font-semibold text-[#ffb690]/95 tracking-wider uppercase">
              Formspace Dimensions
            </div>

            {/* Glowing Header (text-4xl/text-5xl to text-5xl/text-6xl) */}
            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
              Give your questions a <br />
              <span 
                className="bg-clip-text text-transparent animate-spatial-gradient filter drop-shadow-[0_0_25px_rgba(255,182,144,0.15)] inline-block"
                style={{
                  backgroundImage: "linear-gradient(90deg, #52a3dd 0%, #e47939 33%, #52a3dd 66%, #e47939 100%)",
                  backgroundSize: "200% 100%"
                }}
              >
                sense of space.
              </span>
            </h2>

            {/* Paragraph Subtext (text-sm/text-base to text-base/text-lg) */}
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-xl font-medium">
              Transform monotonous surveys into immersive spatial environments. Our engine translates form logic into interactive 3D coordinates, giving every input field, drop-down, and slide a literal dimension. Increase engagement up to 180% with layouts designed for the spatial computing age.
            </p>

            {/* CTA Glass Button (text-xs to text-sm) */}
            <div className="mt-2">
              <Link
                href="/fill/anime-survey"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-white border border-[#52a3dd]/40 hover:border-[#90cdff] hover:bg-[#52a3dd]/10 shadow-[0_0_15px_rgba(82,163,221,0.05)] hover:shadow-[0_0_20px_rgba(82,163,221,0.15)] transition-all duration-300"
              >
                Explore Templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC EXPLORE & TEMPLATE GALLERY */}
      <section id="public-forms" className="relative px-6 py-20 md:py-32 md:px-12 max-w-7xl mx-auto w-full z-10 border-t border-white/5 flex flex-col gap-12">
        <div className="text-center md:text-left flex flex-col items-center md:items-start gap-4">
          {/* badge (text-xs to text-sm) */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#52a3dd]/5 border border-[#52a3dd]/15 w-max text-sm font-semibold text-[#90cdff] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#90cdff]" />
            Featured Galleries
          </div>
          {/* title (text-3xl/text-5xl to text-4xl/text-6xl) */}
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white">
            Publicly Shared Forms
          </h2>
          {/* description (text-sm/text-base to text-base/text-lg) */}
          <p className="text-zinc-400 text-base md:text-lg max-w-xl font-medium">
            Explore interactive spaces created by our community. Test custom 3D animations and live reactions.
          </p>
        </div>

        {publicFormsLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#90cdff]" />
          </div>
        ) : !publicForms || publicForms.length === 0 ? (
          <div className="border border-white/5 bg-[#0c0c0e]/80 backdrop-blur-md p-16 rounded-[2rem] text-center flex flex-col items-center gap-4">
            <p className="text-zinc-500 text-base">
              No public forms found in the explore registry yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicForms.map((form) => (
              <div
                key={form.id}
                className="group/explore bg-[#0c0c0e]/80 border border-white/5 hover:border-white/10 hover:shadow-md p-6 rounded-2xl flex flex-col justify-between gap-5 transition-all duration-300 relative overflow-hidden backdrop-blur-xl"
              >
                {/* Glowing theme-color overlay on card hover */}
                <div
                  className={`absolute -inset-10 bg-radial ${
                    form.theme === "anime"
                      ? "from-pink-500/5"
                      : form.theme === "tech"
                        ? "from-emerald-500/5"
                        : "from-amber-500/5"
                  } via-transparent to-transparent opacity-0 group-hover/explore:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex justify-between items-start gap-2">
                    {/* Theme Badge (text-[10px] to text-xs) */}
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        form.theme === "anime"
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                          : form.theme === "tech"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {form.theme === "anime"
                        ? "🌸 Anime"
                        : form.theme === "tech"
                          ? "🌐 Cyberpunk"
                          : "👾 Retro"}
                    </span>

                    {/* Date (text-[10px] to text-xs) */}
                    <span className="text-xs font-semibold text-zinc-500">
                      {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>

                  <div>
                    {/* title (text-base to text-lg) */}
                    <h4 className="font-extrabold text-lg text-zinc-100 group-hover/explore:text-white transition-colors line-clamp-1">
                      {form.title}
                    </h4>
                    {/* description (text-xs to text-sm) */}
                    <p className="text-sm text-zinc-400 line-clamp-2 mt-1 min-h-[2rem] leading-relaxed">
                      {form.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5 relative z-10 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between">
                    {/* Creator (text-[10px] to text-xs) */}
                    <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      By <span className="font-bold text-zinc-200">{form.creatorName}</span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Open button (text-xs to text-sm) */}
                    <a
                      href={`/fill/${form.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-grow bg-[#0c0c0e] hover:bg-white/5 text-zinc-100 border border-white/10 py-3 rounded-xl text-sm font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      Open Form
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </a>

                    {/* Copy button (text-xs to text-sm) */}
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/fill/${form.slug}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Public link copied to clipboard!");
                      }}
                      className="px-3.5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                      title="Copy Public Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="relative px-6 py-20 md:py-32 md:px-12 max-w-7xl mx-auto w-full z-10 border-t border-white/5 flex flex-col gap-16">
        <div className="text-center flex flex-col items-center gap-4">
          {/* badge (text-xs to text-sm) */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffb690]/5 border border-[#ffb690]/15 w-max text-sm font-semibold text-[#ffb690] uppercase tracking-wider">
            Pricing Plans
          </div>
          {/* title (text-3xl/text-5xl to text-4xl/text-6xl) */}
          <h2 className="text-4xl md:text-6xl font-black text-white">
            Simple, transparent pricing
          </h2>
          {/* description (text-sm/text-base to text-base/text-lg) */}
          <p className="text-zinc-400 text-base md:text-lg max-w-xl font-medium">
            Choose the perfect plan for your business, completely transparent.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
          {/* Card 1: Free Tier (Highlighted / Featured) */}
          <div className="relative group bg-[#0c0c0e]/90 border border-[#52a3dd]/40 p-8 rounded-[2rem] flex flex-col justify-between backdrop-blur-xl shadow-[0_0_50px_rgba(82,163,221,0.15)] hover:border-[#52a3dd]/70 transition-all duration-300">
            {/* "Popular" floating badge (text-[9px] to text-[11px]) */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#52a3dd] text-black font-black uppercase text-[11px] tracking-widest px-4 py-1.5 rounded-full shadow-lg">
              Popular Plan
            </div>

            <div className="flex flex-col gap-6">
              <div>
                {/* label (text-xs to text-sm) */}
                <span className="text-[#90cdff] text-sm font-bold uppercase tracking-widest">Free</span>
                {/* price (text-4xl to text-5xl, text-xs to text-sm) */}
                <div className="flex items-baseline gap-1 mt-2 text-white">
                  <span className="text-5xl font-black">$0</span>
                  <span className="text-zinc-500 text-sm font-semibold">/ mo</span>
                </div>
                {/* description (text-xs to text-sm) */}
                <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                  Perfect for personal forms, light surveys, and testing out the interactive features.
                </p>
              </div>

              {/* Feature Checklist (text-xs to text-sm) */}
              <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#52a3dd]/25 border border-[#52a3dd]/40 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#90cdff]" />
                  </div>
                  <span className="text-sm text-zinc-200 font-medium">3 Active survey spaces</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#52a3dd]/25 border border-[#52a3dd]/40 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#90cdff]" />
                  </div>
                  <span className="text-sm text-zinc-200 font-medium">50 Monthly active responses</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#52a3dd]/25 border border-[#52a3dd]/40 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#90cdff]" />
                  </div>
                  <span className="text-sm text-zinc-200 font-medium">Standard character templates</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {/* button (text-xs to text-sm) - Pressed but no redirect */}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.success("Free plan selected! Welcome to FormSpace.");
                }}
                className="w-full text-center block bg-[#90cdff] hover:bg-[#52a3dd] text-black font-black py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(82,163,221,0.25)] transition-all hover:scale-[1.02] duration-300 cursor-pointer active:scale-95 duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Card 2: Standard Plan */}
          <div className="relative group bg-[#0c0c0e]/80 border border-white/5 p-8 rounded-[2rem] flex flex-col justify-between backdrop-blur-xl hover:border-white/10 transition-colors duration-300">
            <div className="flex flex-col gap-6">
              <div>
                {/* label (text-xs to text-sm) */}
                <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Standard</span>
                {/* price (text-4xl to text-5xl, text-xs to text-sm) */}
                <div className="flex items-baseline gap-1 mt-2 text-white">
                  <span className="text-5xl font-black">$29</span>
                  <span className="text-zinc-500 text-sm font-semibold">/ mo</span>
                </div>
                {/* description (text-xs to text-sm) */}
                <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
                  Best for creators, growing startups, and companies building rich interactive workflows.
                </p>
              </div>

              {/* Feature Checklist (text-xs to text-sm) */}
              <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#52a3dd]/10 border border-[#52a3dd]/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#90cdff]" />
                  </div>
                  <span className="text-sm text-zinc-300">Unlimited survey spaces</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#52a3dd]/10 border border-[#52a3dd]/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#90cdff]" />
                  </div>
                  <span className="text-sm text-zinc-300">2,000 Active responses / mo</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#52a3dd]/10 border border-[#52a3dd]/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#90cdff]" />
                  </div>
                  <span className="text-sm text-zinc-300">High-fidelity 3D templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#52a3dd]/10 border border-[#52a3dd]/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#90cdff]" />
                  </div>
                  <span className="text-sm text-zinc-300">Scalar API integrations</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {/* button (text-xs to text-sm) - Functionally Locked */}
              <Link
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-full text-center block bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer pointer-events-none"
              >
                Coming Soon
              </Link>
            </div>
          </div>

          {/* Card 3: Pro Tier */}
          <div className="relative group bg-[#0c0c0e]/80 border border-white/5 p-8 rounded-[2rem] flex flex-col justify-between backdrop-blur-xl hover:border-white/10 transition-colors duration-300">
            <div className="flex flex-col gap-6">
              <div>
                {/* label (text-xs to text-sm) */}
                <span className="text-[#ffb690] text-sm font-bold uppercase tracking-widest">Pro</span>
                {/* price (text-4xl to text-5xl, text-xs to text-sm) */}
                <div className="flex items-baseline gap-1 mt-2 text-white">
                  <span className="text-5xl font-black">$89</span>
                  <span className="text-zinc-500 text-sm font-semibold">/ mo</span>
                </div>
                {/* description (text-xs to text-sm) */}
                <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
                  Tailored for corporations requiring absolute customization, enterprise scale, and support.
                </p>
              </div>

              {/* Feature Checklist (text-xs to text-sm) */}
              <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ffb690]/10 border border-[#ffb690]/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#ffb690]" />
                  </div>
                  <span className="text-sm text-zinc-300">Unlimited response quotas</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ffb690]/10 border border-[#ffb690]/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#ffb690]" />
                  </div>
                  <span className="text-sm text-zinc-300">Custom 3D character avatars</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ffb690]/10 border border-[#ffb690]/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#ffb690]" />
                  </div>
                  <span className="text-sm text-zinc-300">Advanced webhook streaming</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ffb690]/10 border border-[#ffb690]/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#ffb690]" />
                  </div>
                  <span className="text-sm text-zinc-300">1-on-1 Dedicated support</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {/* button (text-xs to text-sm) - Functionally Locked */}
              <Link
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-full text-center block bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#ffb690]/40 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:text-[#ffb690] cursor-pointer pointer-events-none"
              >
                Coming Soon
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#08080a]/90 backdrop-blur-xl z-10 px-6 py-12 md:py-16 md:px-12 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          {/* Logo & Description */}
          <div className="flex flex-col gap-4 max-w-sm">
            <Link href="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="FormSpace Logo"
                className="h-8 w-auto object-contain brightness-100 group-hover:opacity-90 transition-opacity"
              />
            </Link>
            {/* description (text-xs to text-sm) */}
            <p className="text-zinc-500 text-sm leading-relaxed mt-1">
              Building the future of spatial questionnaires. Create gorgeously optimized, 3D interactive surveys with character reactions, Scalar analytics integration, and gorgeous templates.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 mt-2">
              <a href="https://github.com/0nlyjs" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://x.com/mistjsx" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-[#90cdff] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/in/mistjs" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-[#90cdff] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Columns (text-xs to text-sm) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-white text-sm font-bold uppercase tracking-widest">Product</span>
              <Link href="#features" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Features</Link>
              <Link href="#features" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Templates</Link>
              <Link href="#pricing" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Pricing</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white text-sm font-bold uppercase tracking-widest">Company</span>
              <span className="text-zinc-500 text-sm">About Us</span>
              <span className="text-zinc-500 text-sm">Careers</span>
              <span className="text-zinc-500 text-sm">Contact</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white text-sm font-bold uppercase tracking-widest">Resources</span>
              <span className="text-zinc-500 text-sm">Documentation</span>
              <span className="text-zinc-500 text-sm">Help Center</span>
              <span className="text-zinc-500 text-sm">Community</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white text-sm font-bold uppercase tracking-widest">Legal</span>
              <span className="text-zinc-500 text-sm hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
              <span className="text-zinc-500 text-sm hover:text-zinc-300 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar (text-[10px] to text-xs) */}
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600 font-semibold uppercase tracking-wider">
          <p>© 2026 Formspace Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
