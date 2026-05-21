"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { ThreeBackground } from "~/components/ThreeBackground";
import { toast } from "sonner";
import { Lock, Mail, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
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

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (user) => {
      toast.success(`Welcome to Formspace, ${user.fullName}!`);
      // Force hard-reload immediately to set cookies/state and overwrite the history stack entry cleanly
      window.location.replace("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to sign up. Please try again.");
    },
  });

  // While verifying, show a high-fidelity loading gate to skip the form flash
  if (meLoading || me) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-50 relative">
        <ThreeBackground theme="tech" />
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl text-center max-w-sm flex flex-col gap-3 items-center z-10 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <h3 className="font-extrabold text-sm text-slate-50">Accessing Secure Space...</h3>
          <p className="text-xs text-slate-400">
            Verifying session keys and authentication cookies.
          </p>
        </div>
      </div>
    );
  }

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
    <main className="relative min-h-screen flex items-center justify-center bg-slate-950 font-sans p-6 overflow-hidden">
      {/* 3D background */}
      <ThreeBackground theme="tech" />

      <div className="absolute inset-0 bg-radial-gradient from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl shadow-blue-900/20 z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <Link href="/" className="inline-flex justify-center items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center">
              <span className="font-extrabold text-xs text-white">FS</span>
            </div>
            <span className="font-black text-lg text-slate-50">formspace.</span>
          </Link>
          <h2 className="text-2xl font-black text-slate-50">Get Started</h2>
          <p className="text-sm text-slate-400">Create a creator account and start building</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 active:scale-[0.98] transition-all py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-white shadow-md shadow-blue-600/20 cursor-pointer"
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
        <div className="text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-slate-200 hover:text-blue-400 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
