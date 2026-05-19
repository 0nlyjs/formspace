"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { ThreeBackground } from "~/components/ThreeBackground";
import { toast } from "sonner";
import { Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (user) => {
      toast.success(`Welcome to Formspace, ${user.fullName}!`);
      router.push("/dashboard");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to sign up. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    signupMutation.mutate({ fullName, email, password });
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-zinc-950 font-sans p-6 overflow-hidden">
      {/* 3D background */}
      <ThreeBackground theme="anime" />

      <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-black/80 z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <Link href="/" className="inline-flex justify-center items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center">
              <span className="font-extrabold text-xs text-black">FS</span>
            </div>
            <span className="font-black text-lg text-white">formspace.</span>
          </Link>
          <h2 className="text-2xl font-black text-white">Get Started</h2>
          <p className="text-sm text-zinc-400">Create a creator account and start building</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 active:scale-[0.98] transition-all py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-white shadow-md shadow-pink-500/10 cursor-pointer"
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="text-center text-xs text-zinc-500 border-t border-white/5 pt-4">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-white hover:text-pink-400 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
