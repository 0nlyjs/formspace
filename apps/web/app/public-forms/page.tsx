"use client";

import React from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import dynamic from "next/dynamic";
import {
  Sparkles,
  ArrowLeft,
  User,
  ExternalLink,
  Copy,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Lazy-load interactive 3D background to match landing page aesthetic
const InteractiveBackground = dynamic(
  () => import("~/components/InteractiveBackground").then((m) => m.InteractiveBackground),
  { ssr: false }
);

export default function PublicFormsPage() {
  // Query all public shared forms
  const { data: publicForms, isLoading: publicFormsLoading } = trpc.form.listPublic.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <main className="relative min-h-screen text-zinc-100 bg-[#050505] font-sans flex flex-col">
      {/* 3D Solar Coordinate Particle Background */}
      <InteractiveBackground />

      {/* Header / Navbar */}
      <header
        className="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-xl py-4 px-6 md:px-12 flex justify-between items-center navbar-gradient-border"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,5,0.92) 0%, rgba(82,163,221,0.13) 30%, rgba(228,121,57,0.10) 55%, rgba(82,163,221,0.13) 80%, rgba(5,5,5,0.92) 100%)",
          animation: "navbar-bg-sweep 7s ease-in-out infinite",
          backgroundSize: "300% 100%",
        }}
      >
        <Link href="/" className="flex items-center group">
          <img
            src="/logo.png"
            alt="FormSpace Logo"
            className="h-10 w-auto object-contain brightness-100 group-hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Main Content Area */}
      <section className="relative flex-grow px-6 pt-32 pb-20 md:px-12 max-w-7xl mx-auto w-full z-10 flex flex-col gap-12">
        {/* Title Block */}
        <div className="text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#52a3dd]/5 border border-[#52a3dd]/15 w-max text-sm font-semibold text-[#90cdff] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#90cdff]" />
            Community Registry
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Publicly Shared Forms
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl font-medium text-center leading-relaxed">
            Browse through all interactive 3D survey spaces built and published by the Formspace community.
          </p>
        </div>

        {/* Grid Area */}
        {publicFormsLoading ? (
          <div className="py-32 flex justify-center items-center w-full">
            <Loader2 className="w-10 h-10 animate-spin text-[#90cdff]" />
          </div>
        ) : !publicForms || publicForms.length === 0 ? (
          <div className="border border-white/5 bg-[#0c0c0e]/80 backdrop-blur-md p-16 rounded-[2rem] text-center flex flex-col items-center gap-4 w-full">
            <p className="text-zinc-500 text-base">
              No public forms found in the explore registry yet.
            </p>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-[#90cdff] text-black font-bold uppercase text-xs tracking-wider hover:bg-[#52a3dd] transition-all"
            >
              Go Create One
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {publicForms.map((form) => (
              <div
                key={form.id}
                className="group/explore bg-[#0c0c0e]/80 border border-white/5 hover:border-white/10 hover:shadow-md p-6 rounded-2xl flex flex-col justify-between gap-5 transition-all duration-300 relative overflow-hidden backdrop-blur-xl"
              >
                {/* Glowing theme-color overlay on card hover */}
                <div
                  className={`absolute -inset-10 bg-radial ${
                    form.theme === "manga pop" || form.theme === "anime"
                      ? "from-pink-500/5"
                      : form.theme === "fresh leaf" || form.theme === "tech"
                        ? "from-emerald-500/5"
                        : "from-zinc-500/5"
                  } via-transparent to-transparent opacity-0 group-hover/explore:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex justify-between items-start gap-2">
                    {/* Theme Badge */}
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        form.theme === "manga pop" || form.theme === "anime"
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                          : form.theme === "fresh leaf" || form.theme === "tech"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-300 border border-zinc-500/20"
                      }`}
                    >
                      {form.theme === "manga pop" || form.theme === "anime"
                        ? "🌸 Manga Pop"
                        : form.theme === "fresh leaf" || form.theme === "tech"
                          ? "🌿 Fresh Leaf"
                          : "⚪ Pure Abstract"}
                    </span>

                    {/* Date */}
                    <span className="text-xs font-semibold text-zinc-500">
                      {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-lg text-zinc-100 group-hover/explore:text-white transition-colors line-clamp-1">
                      {form.title}
                    </h4>
                    <p className="text-sm text-zinc-400 line-clamp-2 mt-1 min-h-[2rem] leading-relaxed">
                      {form.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5 relative z-10 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      By <span className="font-bold text-zinc-200">{form.creatorName}</span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`/fill/${form.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-grow bg-[#0c0c0e] hover:bg-white/5 text-zinc-100 border border-white/10 py-3 rounded-xl text-sm font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      Open Form
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </a>

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

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#08080a]/90 backdrop-blur-xl z-10 px-6 py-8 md:px-12 w-full text-center text-xs text-zinc-600 font-semibold uppercase tracking-wider">
        <p>© 2026 Formspace Inc. All rights reserved.</p>
      </footer>
    </main>
  );
}
