"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { ThreeBackground } from "~/components/ThreeBackground";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Auto-redirect to dashboard if already authenticated
  const { data: me, isLoading: meLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (me) {
      router.replace("/dashboard");
    }
  }, [me, router]);

  // While verifying, show a high-fidelity loading gate to skip the form flash
  if (meLoading || me) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white relative">
        <ThreeBackground theme="tech" />
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-sm flex flex-col gap-3 items-center z-10 shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
          <h3 className="font-extrabold text-sm text-white">Accessing Secure Space...</h3>
          <p className="text-xs text-zinc-400">Verifying session keys and authentication cookies.</p>
        </div>
      </div>
    );
  }

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (user) => {
      toast.success(`Welcome back, ${user.fullName}!`);
      // Force hard-reload immediately to set cookies/state and overwrite the history stack entry cleanly
      window.location.replace("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to log in. Please check your credentials.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleFillDemo = () => {
    setEmail("test@mistjs.com");
    setPassword("mist@2434");
    toast.success("Demo credentials loaded! Click Sign In.");
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-zinc-950 font-sans p-6 overflow-hidden">
      {/* Dynamic 3D tech grid background */}
      <ThreeBackground theme="tech" />

      <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-black/80 z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <Link href="/" className="inline-flex justify-center items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center">
              <span className="font-extrabold text-xs text-black">FS</span>
            </div>
            <span className="font-black text-lg text-white">formspace.</span>
          </Link>
          <h2 className="text-2xl font-black text-white">Welcome Back</h2>
          <p className="text-sm text-zinc-400">Sign in to manage your 3D interactive forms</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-[0.98] transition-all py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-white shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Loader */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 items-center text-center">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Hackathon Demo Mode
          </div>
          <p className="text-xs text-zinc-400">
            Click below to load pre-seeded judge credentials with 3 themed forms and 50 responses!
          </p>
          <button
            onClick={handleFillDemo}
            type="button"
            className="mt-1 text-xs font-bold bg-white text-zinc-950 px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Load Demo Credentials
          </button>
        </div>

        {/* Switch to Signup */}
        <div className="text-center text-xs text-zinc-500 border-t border-white/5 pt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-white hover:text-indigo-400 transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
