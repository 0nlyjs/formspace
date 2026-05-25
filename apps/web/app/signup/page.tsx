"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { InteractiveBackground } from "~/components/InteractiveBackground";
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
    onSuccess: (res) => {
      localStorage.setItem("token", res.token);
      toast.success(`Welcome to Formspace, ${res.fullName}!`);
      // Force hard-reload immediately to set cookies/state and overwrite history cleanly
      window.location.replace("/dashboard");
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

  // While verifying, show a high-fidelity loading gate to skip the form flash
  if (meLoading || me) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-[#e5e2e1] relative font-sans">
        <InteractiveBackground />
        <div className="ambient-glow" />
        <div className="glass-level-1 rounded-2xl p-8 text-center max-w-sm flex flex-col gap-3 items-center z-10 shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#52a3dd] mb-2" />
          <h3 className="font-bold text-sm text-[#e5e2e1] tracking-wide">Accessing Secure Space...</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verifying session keys and authenticating credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#050505] font-sans p-6 overflow-hidden select-none">
      {/* 3D Interactive Points Background */}
      <InteractiveBackground />
      
      {/* Pulsing Ambient Orb Glow */}
      <div className="ambient-glow" />

      <div className="w-full max-w-[480px] px-4 relative z-10 py-10 flex flex-col justify-center min-h-screen">
        <div className="glass-level-1 rounded-2xl p-8 flex flex-col gap-8 shadow-2xl relative my-auto">
          
          {/* Header / Logo */}
          <div className="flex flex-col items-center gap-4 text-center">
            <img 
              id="app-logo"
              alt="FormSpace Logo" 
              className="h-12 object-contain w-auto mx-auto select-none" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIN8_hMTBYEGrpk3uRvOfz07E8YNUiGE687uhRHfb1clW0yc8X6UDsun8-_OG6Dlx6QnaLaltNfBAqCsAy1i1bW_45Npo79qXLRzOMICMhscWGiyqAQyqPKVIxlQgjpt5Xe9iD5GQoQYzk3PP3VtwvbJQ7EYNTrYYxpHaC4RIk9M6dUIDW3qZ8VNf5uhSzI2aMiFE3XrnYmjlNgTj3lPGYH_0lP8uT0CwAz5nWqZbfVqbN2YP6uwyLCshPyrGGTFuppmqo_L3XBvM7"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e1]">
              Create an account
            </h1>
            <p className="text-sm text-[#bfc7d1]">
              Get started to build interstellar forms.
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Full Name field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wider uppercase text-neutral-300" htmlFor="name">
                Full Name
              </label>
              <div className="relative input-glow rounded-lg transition-all duration-300 bg-[rgba(255,255,255,0.02)] border border-white/5 focus-within:border-[#52a3dd] focus-within:bg-[#0e0e0e]/50">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input 
                  id="name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name" 
                  className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-sm text-[#e5e2e1] focus:outline-none placeholder:text-neutral-600 rounded-lg outline-none"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wider uppercase text-neutral-300" htmlFor="email">
                Email
              </label>
              <div className="relative input-glow rounded-lg transition-all duration-300 bg-[rgba(255,255,255,0.02)] border border-white/5 focus-within:border-[#52a3dd] focus-within:bg-[#0e0e0e]/50">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-sm text-[#e5e2e1] focus:outline-none placeholder:text-neutral-600 rounded-lg outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wider uppercase text-neutral-300" htmlFor="password">
                Password
              </label>
              <div className="relative input-glow rounded-lg transition-all duration-300 bg-[rgba(255,255,255,0.02)] border border-white/5 focus-within:border-[#52a3dd] focus-within:bg-[#0e0e0e]/50">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  className="w-full bg-transparent border-none py-3 pl-10 pr-10 text-sm text-[#e5e2e1] focus:outline-none placeholder:text-neutral-600 rounded-lg outline-none"
                  required
                />
                <button 
                  id="visibility-icon"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              id="auth-submit-btn"
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full bg-[#52a3dd] text-[#003755] font-semibold text-sm py-3 rounded-lg hover:bg-[#90cdff] hover:text-[#001e30] transition-all duration-300 shadow-[0_0_20px_rgba(82,163,221,0.15)] hover:shadow-[0_0_25px_rgba(82,163,221,0.35)] flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#003755]" />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-[#bfc7d1]">
              Already have an account?{" "}
              <Link 
                id="switch-auth-mode"
                href="/login"
                className="text-[#90cdff] hover:text-[#52a3dd] hover:underline transition-all font-medium cursor-pointer"
              >
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
