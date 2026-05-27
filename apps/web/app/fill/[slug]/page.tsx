"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  Sparkles,
  Terminal,
  Flame,
  CheckSquare,
} from "lucide-react";
import { Abstract3DBackground } from "~/components/Abstract3DBackground";

// Custom ambient floating particles configuration (micro-scale, slow drifting)
const AMBIENT_PARTICLES = Array.from({ length: 12 }).map((_, idx) => {
  const startX = (Math.random() * 260) - 130; // -130px to 130px
  const startY = (Math.random() * 160) - 80;  // -80px to 80px
  const driftX = 15 + Math.random() * 20;     // drift 15-35px horizontally
  const driftY = 20 + Math.random() * 25;     // drift 20-45px vertically
  
  const colors = ["#818CF8", "#34D399", "#FBBF24", "#F87171", "#60A5FA", "#F472B6"];
  const color = colors[idx % colors.length];
  const size = 1.5 + Math.random() * 2; // microscopic floating specs (1.5px - 3.5px)
  
  const shapes = ["square", "rectangle", "triangle"];
  const shape = shapes[idx % shapes.length];
  const width = size;
  const height = shape === "rectangle" ? size * 1.5 : size;
  
  const duration = 8 + Math.random() * 6; // very slow drifting (8s - 14s)
  const delay = Math.random() * -10; // offset starting times so they are out of sync on load
  
  return { id: idx, startX, startY, driftX, driftY, color, width, height, shape, duration, delay };
});

export default function FormFillingPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Password state
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // Stepper state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // Synchronous answer ref to prevent state-batching race conditions
  const answersRef = useRef<Record<string, any>>({});
  // Auto advance timer handle ref
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  };

  // Focus ref for auto-focusing inputs on slide change
  const inputRef = useRef<any>(null);

  // Queries
  const {
    data: form,
    isLoading: formLoading,
    error: formError,
    refetch: refetchForm,
  } = trpc.form.getPublicBySlug.useQuery(
    { slug, password },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Submit Mutation
  const submitMutation = trpc.response.submit.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Response submitted successfully! 🚀");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit response.");
    },
  });

  // Auto focus first or active field
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus?.();
      }, 300);
    }
  }, [currentIndex, form]);

  if (formLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm text-zinc-400">Opening secure formspace portal...</p>
      </div>
    );
  }

  // Handle Form Lock Screen
  if (formError || !form) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white p-6 relative">
        <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center max-w-sm flex flex-col gap-4 items-center z-10 shadow-2xl">
          <Lock className="w-12 h-12 text-rose-400 animate-pulse" />
          <div>
            <h2 className="text-xl font-bold">Closed Portal</h2>
            <p className="text-xs text-zinc-400 mt-1.5">
              {formError?.message || "This form is unavailable or has been archived."}
            </p>
          </div>
          <Link
            href="/"
            className="w-full bg-white text-zinc-950 font-bold py-2.5 rounded-xl text-xs hover:bg-zinc-200 transition-colors inline-block"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // If form is password protected and hasn't unlocked yet
  if (form.isPasswordProtected && !form.passwordMatched) {
    const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!passwordInput.trim()) {
        toast.error("Please enter a password.");
        return;
      }
      setPassword(passwordInput);
      // Wait for React to cycle state before fetching
      setTimeout(() => {
        refetchForm();
      }, 50);
    };

    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white p-6 relative">
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-sm w-full flex flex-col gap-5 items-center z-10 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-black">Encrypted Formspace</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Enter credentials below to view the questionnaire.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-3">
            <input
              type="password"
              placeholder="Enter password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-center focus:outline-none focus:border-indigo-500 transition-all font-mono"
              required
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-black hover:opacity-90 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-indigo-500/10"
            >
              Verify Key
            </button>
          </form>
        </div>
      </div>
    );
  }

  const fields = form.fields || [];

  const getOrbGradient = (themeName: string) => {
    switch (themeName) {
      case "manga pop":
      case "anime":
        return {
          blueOrb: 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(236, 72, 153, 0.1) 45%, rgba(5, 5, 5, 0) 75%)',
          orangeOrb: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(5, 5, 5, 0) 75%)',
        };
      case "fresh leaf":
      case "tech":
        return {
          blueOrb: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0.1) 45%, rgba(5, 5, 5, 0) 75%)',
          orangeOrb: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(5, 5, 5, 0) 75%)',
        };
      case "pure abstract":
      case "retro":
      default:
        return {
          blueOrb: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 45%, rgba(5, 5, 5, 0) 75%)',
          orangeOrb: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(5, 5, 5, 0) 75%)',
        };
    }
  };

  // Theme-specific styles config (Unified premium liquid glass interaction)
  const getThemeStyles = () => {
    return {
      themeName: form.theme,
      primaryText: "text-zinc-200",
      primaryBorder: "border-white/10",
      focusBorder: "focus:border-white/30 focus:bg-white/[0.08]",
      glowBorder: "border-white/20 shadow-white/5",
      activeBg: "bg-white/[0.1] text-white border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]",
      buttonColor: "bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_8px_24px_rgba(255,255,255,0.15)]",
      icon: <Sparkles className="w-4 h-4 text-zinc-300" />,
    };
  };

  const style = getThemeStyles();
  const activeField = fields[currentIndex];

  // ----------------------------------------------------
  // Navigation & Answers Validator
  // ----------------------------------------------------
  const handleAnswerChange = (val: any) => {
    if (!activeField) return;
    const updatedAnswers = {
      ...answersRef.current,
      [activeField.id]: val,
    };
    answersRef.current = updatedAnswers;
    setAnswers(updatedAnswers);
  };

  const validateCurrentStep = (): boolean => {
    if (!activeField) return true;
    const value = answersRef.current[activeField.id];

    // Check required constraint
    if (activeField.required) {
      if (activeField.type === "checkbox" && value !== "Yes") {
        toast.warning(`Please accept the required statement before moving forward.`);
        return false;
      }
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        toast.warning(`Please complete this required question before moving forward.`);
        return false;
      }
    }

    if (value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
      // Validate email format
      if (activeField.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          toast.warning("Invalid email format. Please check and try again.");
          return false;
        }
      }

      // Validate numbers
      if (activeField.type === "number" && isNaN(Number(value))) {
        toast.warning("This field requires a numerical input.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    clearAutoAdvance();
    if (!validateCurrentStep()) return;
    setIsTyping(false);

    if (currentIndex < fields.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Trigger submission!
      submitMutation.mutate({
        formId: form.id,
        answers: answersRef.current,
      });
    }
  };

  const handlePrev = () => {
    clearAutoAdvance();
    setIsTyping(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // If it is a textarea, let standard line break happen
      if (activeField?.type === "long_text") return;
      e.preventDefault();
      handleNext();
    }
  };

  // Completion calculation
  const progressPercent = isSubmitted
    ? 100
    : fields.length > 0
    ? Math.round((currentIndex / fields.length) * 100)
    : 0;

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden pt-28">
      
      {/* Immersive Landing Page background theme & glowing orbs */}
      {form.theme === "pure abstract" ? (
        <Abstract3DBackground />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-[#050505] z-0 pointer-events-none select-none overflow-hidden">
          {/* Subtle Cyberpunk/Tech Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
          
          {/* Luminous Top-Left Brand Blue Orb */}
          <div 
            className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full opacity-[0.5]"
            style={{
              background: getOrbGradient(form.theme).blueOrb,
              filter: 'blur(60px)',
            }}
          />

          {/* Luminous Bottom-Right Brand Orange Orb */}
          <div 
            className="absolute -bottom-[15%] -right-[10%] w-[55vw] h-[55vw] rounded-full opacity-[0.3]"
            style={{
              background: getOrbGradient(form.theme).orangeOrb,
              filter: 'blur(60px)',
            }}
          />
        </div>
      )}

      {/* Landing Page Top Bar locked to top - Brand Logo Only */}
      <header
        className="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-xl py-4 px-6 md:px-12 flex justify-start items-center navbar-gradient-border"
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
      </header>

      {/* Centered Liquid Glass Card */}
      <div className="w-full max-w-2xl bg-white/[0.04] backdrop-blur-3xl border border-white/[0.08] p-8 md:p-12 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] flex flex-col justify-between min-h-[420px] relative overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06] z-10">
        
        {/* Background Liquid Glass reflection effects inside the card */}
        <div className="absolute -top-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-white/[0.02] filter blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full bg-white/[0.01] filter blur-[40px] pointer-events-none" />

        {/* Card Header (Clean & Minimal with Auto-Advance Toggle) */}
        {!isSubmitted && (
          <div className="flex justify-end items-center mb-6 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Auto Next
              </span>
              <button
                type="button"
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 relative flex items-center cursor-pointer border ${
                  autoAdvance
                    ? "bg-white/20 border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                    : "bg-white/[0.03] border-white/10"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full shadow-sm transform transition-all duration-300 ${
                    autoAdvance
                      ? "translate-x-4 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                      : "translate-x-0 bg-zinc-500"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-grow flex flex-col justify-center w-full gap-6 relative z-10"
            >
              {/* Question counter */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-[#52a3dd] to-[#e47939] font-sans">
                    Question {currentIndex + 1} of {fields.length}
                  </span>
                  {activeField?.required && (
                    <span className="text-[10px] bg-rose-500/10 border border-rose-500/25 text-rose-400 font-bold px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>

                {/* Question label prompt */}
                <h2 className="text-xl md:text-2xl font-semibold text-white leading-tight font-sans">
                  {activeField?.label}
                </h2>
                {activeField?.description && (
                  <p className="text-xs text-zinc-400 mt-1">{activeField.description}</p>
                )}
              </div>

              {/* Input Elements Render Switch */}
              <div className="my-4">
                {/* Short Text */}
                {activeField?.type === "short_text" && (
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={activeField.placeholder || "Type your answer here..."}
                    value={answers[activeField.id] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    onKeyDown={handleKeyPress}
                    className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all ${style.focusBorder}`}
                  />
                )}

                {/* Essay / Long Text */}
                {activeField?.type === "long_text" && (
                  <textarea
                    ref={inputRef}
                    placeholder={activeField.placeholder || "Type detailed answer here..."}
                    value={answers[activeField.id] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all h-28 resize-none ${style.focusBorder}`}
                  />
                )}

                {/* Email */}
                {activeField?.type === "email" && (
                  <input
                    ref={inputRef}
                    type="email"
                    placeholder={activeField.placeholder || "name@example.com"}
                    value={answers[activeField.id] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    onKeyDown={handleKeyPress}
                    className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all ${style.focusBorder}`}
                  />
                )}

                {/* Number */}
                {activeField?.type === "number" && (
                  <input
                    ref={inputRef}
                    type="number"
                    placeholder={activeField.placeholder || "Enter a number"}
                    value={answers[activeField.id] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    onKeyDown={handleKeyPress}
                    className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all ${style.focusBorder}`}
                  />
                )}

                {/* Single Choice Select */}
                {activeField?.type === "single_select" && (
                  <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {(activeField.options as string[])?.map((opt, oIdx) => {
                      const isSelected = answers[activeField.id] === opt;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            handleAnswerChange(opt);
                            if (autoAdvance) {
                              clearAutoAdvance();
                              autoAdvanceTimeoutRef.current = setTimeout(() => {
                                handleNext();
                              }, 350);
                            }
                          }}
                          className={`w-full p-4 rounded-xl border text-left font-semibold text-xs transition-all flex justify-between items-center cursor-pointer ${
                            isSelected
                              ? style.activeBg
                              : "bg-white/[0.02] border-white/5 hover:border-white/15"
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Multi Select */}
                {activeField?.type === "multi_select" && (
                  <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {(activeField.options as string[])?.map((opt, oIdx) => {
                      const currentList = Array.isArray(answers[activeField.id])
                        ? (answers[activeField.id] as string[])
                        : [];
                      const isSelected = currentList.includes(opt);

                      const toggleChoice = () => {
                        let nextList;
                        if (isSelected) {
                          nextList = currentList.filter((item) => item !== opt);
                        } else {
                          nextList = [...currentList, opt];
                        }
                        handleAnswerChange(nextList);

                        // Smart debounced auto-advance for multiple selection
                        if (autoAdvance) {
                          clearAutoAdvance();
                          autoAdvanceTimeoutRef.current = setTimeout(() => {
                            handleNext();
                          }, 1500); // 1.5s delay to let users pick multiple items before advancing
                        }
                      };

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={toggleChoice}
                          className={`w-full p-4 rounded-xl border text-left font-semibold text-xs transition-all flex justify-between items-center cursor-pointer ${
                            isSelected
                              ? style.activeBg
                              : "bg-white/[0.02] border-white/5 hover:border-white/15"
                          }`}
                        >
                          <span>{opt}</span>
                          <div
                            className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                              isSelected ? "bg-white border-white text-black" : "border-white/20 bg-transparent"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Yes/No Checkbox */}
                {activeField?.type === "checkbox" && (
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = answers[activeField.id] === "Yes" ? "No" : "Yes";
                      handleAnswerChange(newVal);
                      if (autoAdvance && newVal === "Yes") {
                        clearAutoAdvance();
                        autoAdvanceTimeoutRef.current = setTimeout(() => {
                          handleNext();
                        }, 350);
                      }
                    }}
                    className={`w-full p-4 rounded-xl border text-left font-semibold text-xs transition-all flex justify-between items-center cursor-pointer ${
                      answers[activeField.id] === "Yes"
                        ? style.activeBg
                        : "bg-white/[0.02] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare className={`w-4.5 h-4.5 ${answers[activeField.id] === "Yes" ? "text-white" : "text-zinc-500"}`} />
                      <span>I accept/agree to this statement</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        answers[activeField.id] === "Yes"
                          ? "bg-white border-white text-black"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {answers[activeField.id] === "Yes" && <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />}
                    </div>
                  </button>
                )}

                {/* Star Rating (1-5) */}
                {activeField?.type === "rating" && (
                  <div className="flex items-center justify-center gap-3 py-2">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isSelected = Number(answers[activeField.id]) >= starVal;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => {
                            handleAnswerChange(starVal);
                            if (autoAdvance) {
                              clearAutoAdvance();
                              autoAdvanceTimeoutRef.current = setTimeout(() => {
                                handleNext();
                              }, 350);
                            }
                          }}
                          className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-10 h-10 transition-all ${
                              isSelected
                                ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                                : "text-zinc-600 hover:text-zinc-400"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Date Selector */}
                {activeField?.type === "date" && (
                  <input
                    ref={inputRef}
                    type="date"
                    value={answers[activeField.id] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all text-zinc-300 ${style.focusBorder}`}
                  />
                )}
              </div>

              {/* Footer Controls */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5 gap-4 relative z-20">
                {/* Previous button */}
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer relative z-30 font-sans"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                {/* Next / Submit button */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitMutation.isPending}
                  className="px-5 py-3 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-[0_0_20px_rgba(82,163,221,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all text-white relative z-30 font-sans"
                  style={{ background: 'linear-gradient(90deg, #52A3DD 0%, #E47939 100%)' }}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : currentIndex === fields.length - 1 ? (
                    <>
                      Submit Response
                      <Check className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            // Success Screen layout
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-grow flex flex-col justify-center items-center text-center max-w-sm w-full mx-auto gap-5 relative z-10"
            >
              {/* Container for smiley emoji and its background confetti burst */}
              <div className="relative flex items-center justify-center w-20 h-20 mb-2">
                {/* Ambient micro floating particles (delicate & slow) */}
                <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-0">
                  {AMBIENT_PARTICLES.map((p) => (
                    <motion.div
                      key={p.id}
                      className="absolute"
                      initial={{ x: p.startX, y: p.startY, opacity: 0.3 }}
                      animate={{
                        x: [p.startX, p.startX + p.driftX, p.startX - p.driftX, p.startX],
                        y: [p.startY, p.startY - p.driftY, p.startY + p.driftY, p.startY],
                        opacity: [0.3, 0.8, 0.4, 0.9, 0.3],
                        scale: [0.8, 1.1, 0.9, 1.2, 0.8],
                        rotate: [0, 120, 240, 360]
                      }}
                      transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut"
                      }}
                      style={{
                        width: p.shape !== "triangle" ? p.width : undefined,
                        height: p.shape !== "triangle" ? p.height : undefined,
                        backgroundColor: p.shape !== "triangle" ? p.color : undefined,
                        borderRadius: "0.5px", // clean sharp edges
                        borderLeft: p.shape === "triangle" ? `${p.width / 2}px solid transparent` : undefined,
                        borderRight: p.shape === "triangle" ? `${p.width / 2}px solid transparent` : undefined,
                        borderBottom: p.shape === "triangle" ? `${p.height}px solid ${p.color}` : undefined,
                      }}
                    />
                  ))}
                </div>

                {/* Static smiley emoji */}
                <div className="text-4xl select-none z-10 relative">
                  😊
                </div>
              </div>
              
              <div className="z-10">
                <h2 className="text-xl font-light text-white font-sans">Submission Successful! 🎉</h2>
                <p className="text-xs text-zinc-400 mt-1.5 font-sans">
                  Thank you for your response.
                </p>
              </div>
              
              <Link
                href="/"
                className="px-6 py-3 text-white font-medium rounded-xl text-xs cursor-pointer shadow-md hover:shadow-[0_0_20px_rgba(82,163,221,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 z-10"
                style={{ background: 'linear-gradient(90deg, #52A3DD 0%, #E47939 100%)' }}
              >
                <span>Return to FormSpace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stepper Progress indicators */}
        <div className="mt-8 flex flex-col gap-2 w-full pointer-events-none relative z-10">
          <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold font-sans">
            <span>PROGRESS</span>
            <span>{progressPercent}% COMPLETE</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
