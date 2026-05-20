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
import { ThreeBackground } from "~/components/ThreeBackground";
import { InteractiveCharacterCanvas } from "~/components/InteractiveCharacterCanvas";

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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white p-6 relative">
        <ThreeBackground theme="anime" />
        <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center max-w-sm flex flex-col gap-4 items-center z-10 shadow-2xl">
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white p-6 relative">
        <ThreeBackground theme="tech" />
        <div className="bg-zinc-900/85 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-sm w-full flex flex-col gap-5 items-center z-10 shadow-2xl">
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

  // Theme-specific styles config
  const getThemeStyles = () => {
    switch (form.theme) {
      case "tech":
        return {
          themeName: "tech" as const,
          primaryText: "text-emerald-400",
          primaryBorder: "border-emerald-500/20",
          focusBorder: "focus:border-emerald-400",
          glowBorder: "border-emerald-500/40 shadow-emerald-500/10",
          activeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          buttonColor: "bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20",
          icon: <Terminal className="w-4 h-4 text-emerald-400" />,
        };
      case "retro":
        return {
          themeName: "retro" as const,
          primaryText: "text-amber-400",
          primaryBorder: "border-amber-500/20",
          focusBorder: "focus:border-amber-400",
          glowBorder: "border-amber-500/40 shadow-amber-500/10",
          activeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          buttonColor: "bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20",
          icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        };
      default:
        return {
          themeName: "anime" as const,
          primaryText: "text-pink-400",
          primaryBorder: "border-pink-500/20",
          focusBorder: "focus:border-pink-400",
          glowBorder: "border-pink-500/40 shadow-pink-500/10",
          activeBg: "bg-pink-500/10 text-pink-400 border-pink-500/30",
          buttonColor: "bg-pink-500 text-black hover:bg-pink-400 shadow-pink-500/20",
          icon: <Flame className="w-4 h-4 text-pink-400" />,
        };
    }
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
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* Immersive 3D Space Background */}
      <ThreeBackground theme={style.themeName} />

      {/* Main Container */}
      <div className="flex-grow flex flex-col lg:flex-row z-10">
        
        {/* LEFT PANEL: 2D Step Questionnaire */}
        <div className="w-full lg:w-[60%] flex flex-col justify-between p-6 md:p-16 lg:p-24 bg-zinc-950/85 backdrop-blur-md border-r border-white/5 h-screen overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center">
                <span className="font-extrabold text-[10px] text-black">FS</span>
              </div>
              <span className="font-bold text-xs tracking-wider text-zinc-300">formspace.</span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-full text-[10px] text-zinc-400">
              {style.icon}
              <span className="font-bold uppercase tracking-wider">{form.title}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex-grow flex flex-col justify-center max-w-xl w-full mx-auto gap-6"
              >
                {/* Question counter */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-widest ${style.primaryText}`}>
                      Question {currentIndex + 1} of {fields.length}
                    </span>
                    {activeField?.required && (
                      <span className="text-[10px] bg-rose-500/10 border border-rose-500/25 text-rose-400 font-bold px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                  </div>

                  {/* Question label prompt */}
                  <h2 className="text-xl md:text-3xl font-black text-white leading-tight">
                    {activeField?.label}
                  </h2>
                  {activeField?.description && (
                    <p className="text-sm text-zinc-400 mt-1">{activeField.description}</p>
                  )}
                </div>

                {/* Input Elements Render Switch */}
                <div className="my-6">
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
                      className={`w-full bg-zinc-900/60 border border-white/10 rounded-2xl px-5 py-4 text-base focus:outline-none transition-all ${style.focusBorder}`}
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
                      className={`w-full bg-zinc-900/60 border border-white/10 rounded-2xl px-5 py-4 text-base focus:outline-none transition-all h-32 resize-none ${style.focusBorder}`}
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
                      className={`w-full bg-zinc-900/60 border border-white/10 rounded-2xl px-5 py-4 text-base focus:outline-none transition-all ${style.focusBorder}`}
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
                      className={`w-full bg-zinc-900/60 border border-white/10 rounded-2xl px-5 py-4 text-base focus:outline-none transition-all ${style.focusBorder}`}
                    />
                  )}

                  {/* Single Choice Select */}
                  {activeField?.type === "single_select" && (
                    <div className="flex flex-col gap-3">
                      {(activeField.options as string[])?.map((opt, oIdx) => {
                        const isSelected = answers[activeField.id] === opt;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              handleAnswerChange(opt);
                              clearAutoAdvance();
                              autoAdvanceTimeoutRef.current = setTimeout(() => {
                                handleNext();
                              }, 350);
                            }}
                            className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all flex justify-between items-center cursor-pointer ${
                              isSelected
                                ? style.activeBg
                                : "bg-zinc-900/40 border-white/5 hover:border-white/15"
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multi Select */}
                  {activeField?.type === "multi_select" && (
                    <div className="flex flex-col gap-3">
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
                        };

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={toggleChoice}
                            className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all flex justify-between items-center cursor-pointer ${
                              isSelected
                                ? style.activeBg
                                : "bg-zinc-900/40 border-white/5 hover:border-white/15"
                            }`}
                          >
                            <span>{opt}</span>
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                isSelected ? "bg-white border-white text-black" : "border-white/20 bg-transparent"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
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
                      onClick={() => handleAnswerChange(answers[activeField.id] === "Yes" ? "No" : "Yes")}
                      className={`w-full p-5 rounded-2xl border text-left font-bold text-sm transition-all flex justify-between items-center cursor-pointer ${
                        answers[activeField.id] === "Yes"
                          ? style.activeBg
                          : "bg-zinc-900/40 border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CheckSquare className={`w-5 h-5 ${answers[activeField.id] === "Yes" ? style.primaryText : "text-zinc-500"}`} />
                        <span>I accept/agree to this statement</span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          answers[activeField.id] === "Yes"
                            ? "bg-white border-white text-black"
                            : "border-white/20 bg-transparent"
                        }`}
                      >
                        {answers[activeField.id] === "Yes" && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  )}

                  {/* Star Rating (1-5) */}
                  {activeField?.type === "rating" && (
                    <div className="flex items-center justify-center gap-4 py-4">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const isSelected = Number(answers[activeField.id]) >= starVal;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => {
                              handleAnswerChange(starVal);
                              clearAutoAdvance();
                              autoAdvanceTimeoutRef.current = setTimeout(() => {
                                handleNext();
                              }, 350);
                            }}
                            className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-12 h-12 transition-all ${
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
                      className={`w-full bg-zinc-900/60 border border-white/10 rounded-2xl px-5 py-4 text-base focus:outline-none transition-all text-zinc-300 ${style.focusBorder}`}
                    />
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5 gap-4 relative z-20">
                  {/* Previous button */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer relative z-30"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  {/* Next / Submit button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={submitMutation.isPending}
                    className={`px-6 py-3 font-extrabold rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.98] ${style.buttonColor} relative z-30`}
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
                className="flex-grow flex flex-col justify-center items-center text-center max-w-md w-full mx-auto gap-5"
              >
                <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center animate-bounce shadow-lg ${style.glowBorder} bg-zinc-900`}>
                  {style.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Transmission Received</h2>
                  <p className="text-sm text-zinc-400 mt-2">
                    Thank you! Your responses have been saved securely in our space hub database.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    answersRef.current = {};
                    setAnswers({});
                    setCurrentIndex(0);
                    setIsSubmitted(false);
                  }}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Submit another response
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Progress indicators */}
          <div className="mt-10 flex flex-col gap-2 max-w-xl mx-auto w-full pointer-events-none">
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold">
              <span>PROGRESS</span>
              <span>{progressPercent}% COMPLETE</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Dynamic 3D Character Sandbox */}
        <div className="hidden lg:flex lg:w-[40%] bg-zinc-900/10 border-l border-white/5 items-center justify-center p-6 h-full min-h-screen relative">
          
          <div className="w-full h-[500px] flex items-center justify-center z-10">
            <InteractiveCharacterCanvas
              isTyping={isTyping}
              activeField={activeField?.id || null}
              isSubmitting={submitMutation.isPending || isSubmitted}
              theme={form.theme}
            />
          </div>

          {/* Ambient overlays */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-zinc-950/20 to-zinc-950/50 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
