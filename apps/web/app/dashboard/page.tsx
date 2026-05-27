"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { RightInteractiveParticles } from "~/components/RightInteractiveParticles";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  BarChart2,
  LogOut,
  User,
  Code,
  List,
  Sparkles,
  Terminal,
  Flame,
  Loader2,
  ExternalLink,
  TrendingUp,
  Copy,
  Gamepad2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const StaticBackground = () => (
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
    
    {/* Luminous Top-Left Brand Blue Orb - boosted intensity */}
    <div 
      className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full opacity-[1] animate-orb-1"
      style={{
        background: 'radial-gradient(circle, rgba(82, 163, 221, 0.45) 0%, rgba(82, 163, 221, 0.12) 45%, rgba(5, 5, 5, 0) 75%)',
        filter: 'blur(60px)',
      }}
    />

    {/* Luminous Bottom-Right Brand Orange Orb (Static & anti-aliased CSS gradient glow - 10% smaller) */}
    <div 
      className="absolute -bottom-[15%] -right-[10%] w-[55vw] h-[55vw] rounded-full opacity-[0.7] animate-orb-2"
      style={{
        background: 'radial-gradient(circle, rgba(228, 121, 57, 0.07) 0%, rgba(5, 5, 5, 0) 75%)',
      }}
    />

    {/* Interactive repelling particles on the right-side content background */}
    <RightInteractiveParticles pageType="dashboard" />
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"forms" | "analytics" | "dev">("forms");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Create form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTheme, setNewTheme] = useState<"manga pop" | "fresh leaf" | "pure abstract">("manga pop");
  const [newVisibility, setNewVisibility] = useState<"public" | "unlisted">("public");

  // Smooth close: trigger exit animation, then unmount
  const closeModal = React.useCallback(() => {
    setClosingModal(true);
    setTimeout(() => {
      setShowCreateModal(false);
      setClosingModal(false);
      setIsRedirecting(false);
    }, 220); // matches exit animation duration
  }, []);

  // Reset redirection state when modal closes
  React.useEffect(() => {
    if (!showCreateModal) {
      setIsRedirecting(false);
    }
  }, [showCreateModal]);

  // Selected form for analytics
  const [selectedAnalyticsFormId, setSelectedAnalyticsFormId] = useState<string>("");

  // Dev api key state
  const [keyDescription, setKeyDescription] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Queries
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: forms, isLoading: formsLoading, refetch: refetchForms } = trpc.form.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: analytics, isLoading: analyticsLoading } = trpc.response.getAnalytics.useQuery(
    { formId: selectedAnalyticsFormId },
    { enabled: !!selectedAnalyticsFormId }
  );

  const { data: apiKeys, refetch: refetchKeys } = trpc.apiKey.list.useQuery(undefined, {
    enabled: !!user && activeTab === "dev",
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!mounted) return;
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [user, userLoading, router, mounted]);

  // Mutations
  const createFormMutation = trpc.form.create.useMutation({
    onSuccess: (form) => {
      toast.success("Form created successfully!");
      setIsRedirecting(true);
      setNewTitle("");
      setNewDesc("");
      refetchForms();
      // Redirect to builder
      router.push(`/forms/${form.id}/edit`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form.");
    },
  });

  const deleteFormMutation = trpc.form.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted successfully.");
      refetchForms();
      if (selectedAnalyticsFormId) {
        setSelectedAnalyticsFormId("");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete form.");
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem("token");
      toast.success("Signed out successfully.");
      router.push("/");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
  });

  const generateKeyMutation = trpc.apiKey.generate.useMutation({
    onSuccess: (res) => {
      setGeneratedKey(res.key);
      setKeyDescription("");
      toast.success("API key generated successfully!");
      refetchKeys();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate key.");
    },
  });

  const deleteKeyMutation = trpc.apiKey.delete.useMutation({
    onSuccess: () => {
      toast.success("API key revoked successfully.");
      refetchKeys();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to revoke key.");
    },
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-[#e5e2e1] relative font-sans">
        <StaticBackground />
        <div className="glass-level-1 rounded-2xl p-8 text-center max-w-sm flex flex-col gap-3 items-center z-10 shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#52a3dd] mb-2" />
          <h3 className="font-bold text-sm text-[#e5e2e1] tracking-wide">Accessing Secure Space...</h3>
          <p className="text-xs text-[#bfc7d1] leading-relaxed">
            Verifying session keys and loading creator dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-[#e5e2e1] relative font-sans">
        <StaticBackground />
        <div className="glass-level-1 rounded-2xl p-8 text-center max-w-sm flex flex-col gap-3 items-center z-10 shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#52a3dd] mb-2" />
          <h3 className="font-bold text-sm text-[#e5e2e1] tracking-wide">Redirecting...</h3>
          <p className="text-xs text-[#bfc7d1] leading-relaxed">
            Unauthorized session. Returning to safe harbor.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) {
      toast.error("Please enter a title.");
      return;
    }
    createFormMutation.mutate({
      title: newTitle,
      description: newDesc,
      theme: (newTheme === "manga pop" ? "anime" : newTheme === "fresh leaf" ? "tech" : "retro") as "anime" | "tech" | "retro",
      visibility: newVisibility,
    });
  };

  const handleGenerateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateKeyMutation.mutate({ description: keyDescription });
  };

  // Helper to get theme details
  const getThemeDetails = (themeName: string) => {
    switch (themeName) {
      case "fresh leaf":
      case "tech":
        return {
          label: "Fresh Leaf",
          icon: <span className="text-sm select-none">🌿</span>,
          iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
          badgeBg: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
        };
      case "pure abstract":
      case "retro":
        return {
          label: "Pure Abstract",
          icon: <span className="text-sm select-none">⚪</span>,
          iconBg: "bg-white/10 text-white border border-white/20",
          badgeBg: "border-white/20 bg-white/5 text-white"
        };
      case "manga pop":
      case "anime":
      default:
        return {
          label: "Manga Pop",
          icon: <span className="text-sm select-none">🌸</span>,
          iconBg: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
          badgeBg: "border-pink-500/20 bg-pink-500/5 text-pink-400"
        };
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#e5e2e1] font-sans relative overflow-hidden select-none">
      
      {/* LEFT SIDEBAR - Spans full height of the viewport fixed to the left */}
      <aside className="w-64 border-r border-white/5 bg-[#08090b] flex flex-col justify-between p-6 shrink-0 h-screen fixed left-0 top-0 bottom-0 z-20">
        
        {/* Top Branding Section */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="px-1 select-none block mb-2">
            <img 
              id="app-logo"
              alt="FormSpace Logo" 
              className="h-10 object-contain w-auto select-none brightness-100" 
              src="/logo.png"
            />
          </Link>

          {/* Navigation links inside the sidebar */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("forms")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-l-xl text-sm font-bold transition-all text-left cursor-pointer border-y border-l border-r-0 relative ${
                activeTab === "forms" 
                  ? "bg-[#52a3dd]/8 text-[#52a3dd] border-[#52a3dd]/15" 
                  : "text-[#bfc7d1]/70 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
              My Forms
              {activeTab === "forms" && <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#52a3dd]" />}
            </button>

            <button
              onClick={() => {
                setActiveTab("analytics");
                // Pick first form if available and none picked yet
                if (!selectedAnalyticsFormId && forms && forms.length > 0 && forms[0]) {
                  setSelectedAnalyticsFormId(forms[0].id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-l-xl text-sm font-bold transition-all text-left cursor-pointer border-y border-l border-r-0 relative ${
                activeTab === "analytics" 
                  ? "bg-[#52a3dd]/8 text-[#52a3dd] border-[#52a3dd]/15" 
                  : "text-[#bfc7d1]/70 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Analytics
              {activeTab === "analytics" && <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#52a3dd]" />}
            </button>

            <button
              onClick={() => setActiveTab("dev")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-l-xl text-sm font-bold transition-all text-left cursor-pointer border-y border-l border-r-0 relative ${
                activeTab === "dev" 
                  ? "bg-[#52a3dd]/8 text-[#52a3dd] border-[#52a3dd]/15" 
                  : "text-[#bfc7d1]/70 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              <Code className="w-4 h-4" />
              Developer API
              {activeTab === "dev" && <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#52a3dd]" />}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Avatar details and Logout option */}
        <div className="flex flex-col gap-1 pt-6 border-t border-white/5">
          
          {/* Dynamic Profile Metadata card (Commander Shepard themed seed avatar) */}
          <div className="flex items-center gap-3 mb-4 px-1 select-none">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Shepard" 
              className="w-10 h-10 rounded-full bg-[#13151a] border border-white/10 p-0.5 select-none" 
              alt="Avatar" 
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white leading-tight truncate">{user.fullName}</p>
              <p className="text-[9px] text-neutral-400 mt-0.5 leading-none">Creator Panel</p>
            </div>
          </div>

          {/* Simple Clean Logout button */}
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-2 px-1 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-neutral-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA - Scrolls independently with visually stunning backgrounds */}
      <div className="flex-grow h-screen relative flex flex-col overflow-y-auto pl-64">
        
        {/* Animated Static Black Backdrop with Brand radial glows & grid outline */}
        <StaticBackground />

        {/* Inner core margin container matching large layout viewports */}
        <main className="relative z-10 flex-grow p-8 md:p-12 max-w-6xl w-full mx-auto flex flex-col gap-8">
          
          {/* TAB 1: MY FORMS VIEW */}
          {activeTab === "forms" && (
            <div className="flex flex-col gap-8">
              
              {/* Header section matching exact layout header */}
              <div className="flex justify-between items-end pb-6 border-b border-white/5">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">My Forms</h1>
                  <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">Create, edit, and publish dynamic schemas.</p>
                </div>
                <button
                  onClick={() => { setClosingModal(false); setShowCreateModal(true); }}
                  className="font-bold px-5 py-2.5 rounded-lg text-sm flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(82,163,221,0.25)] hover:shadow-[0_0_30px_rgba(228,121,57,0.35)] hover:opacity-90 cursor-pointer text-white"
                  style={{ background: 'linear-gradient(90deg, #52A3DD 0%, #E47939 100%)' }}
                >
                  <Plus className="w-4 h-4 text-white" />
                  Create Form
                </button>
              </div>

              {formsLoading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#52a3dd]" />
                </div>
              ) : !forms || forms.length === 0 ? (
                <div className="glass-level-1 p-12 rounded-2xl text-center flex flex-col items-center gap-4 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <List className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">No forms created yet</h3>
                    <p className="text-xs text-[#bfc7d1] mt-1 max-w-xs mx-auto leading-relaxed">
                      Build your first Typeform-style question schema with immersive 3D template support!
                    </p>
                  </div>
                  <button
                    onClick={() => { setClosingModal(false); setShowCreateModal(true); }}
                    className="bg-white text-[#050505] px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forms.map((form) => {
                    const theme = getThemeDetails(form.theme);
                    return (
                      <div
                        key={form.id}
                        className="glass-level-1 rounded-2xl p-6 flex flex-col justify-between gap-6 relative border border-white/5 hover:border-[#52a3dd]/30 transition-all duration-300 shadow-xl group"
                      >
                        <div className="flex flex-col gap-4 relative z-10">
                          {/* Top row elements: icon box on left, theme label badge on right */}
                          <div className="flex justify-between items-center">
                            <div className={`p-2.5 rounded-xl ${theme.iconBg} flex items-center justify-center`}>
                              {theme.icon}
                            </div>
                            <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 tracking-wider border rounded-full select-none leading-none ${theme.badgeBg}`}>
                              {theme.label}
                            </span>
                          </div>

                          {/* Middle row elements: card title and visibility status labels */}
                          <div className="flex flex-col gap-2 mt-2">
                            <h3 className="text-base font-bold text-white group-hover:text-[#52a3dd] transition-colors leading-tight line-clamp-2 min-h-[2.5rem]">
                              {form.title}
                            </h3>
                            
                            <div className="flex gap-2 items-center mt-1">
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#0e0e0e]/50 border border-white/5 text-neutral-400 select-none">
                                {form.visibility}
                              </span>
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#0e0e0e]/50 border border-white/5 text-neutral-400 select-none">
                                {form.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer row elements: dynamic responses on left, clean copy actions on right hover */}
                        <div className="flex justify-between items-center border-t border-white/5 pt-4 relative z-10">
                          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 select-none">
                            <User className="w-4 h-4 text-neutral-500" />
                            {form.responseCount} Responses
                          </span>

                          {/* Hover-reveal action indicators to guarantee visually stunning identical matching */}
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {form.status === "published" && (
                              <Link
                                href={`/fill/${form.slug}`}
                                target="_blank"
                                className="group/btn w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                            )}

                            <button
                              onClick={() => {
                                const url = `${window.location.origin}/fill/${form.slug}`;
                                navigator.clipboard.writeText(url);
                                toast.success("Form link copied to clipboard!");
                              }}
                              className="group/btn w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              href={`/forms/${form.id}/edit`}
                              className="group/btn w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this form?")) {
                                  deleteFormMutation.mutate({ formId: form.id });
                                }
                              }}
                              className="group/btn w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ANALYTICS VIEW */}
          {activeTab === "analytics" && (
            <div className="flex flex-col gap-6 font-sans">
              <div className="glass-level-1 p-6 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-xl">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Analytics Dashboard</h1>
                  <p className="text-sm text-[#bfc7d1] mt-0.5">Visualize user submissions and ratings.</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Select Form:</span>
                  <select
                    value={selectedAnalyticsFormId}
                    onChange={(e) => setSelectedAnalyticsFormId(e.target.value)}
                    className="bg-[#0e0e0e]/60 border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#52a3dd] transition-all min-w-[220px]"
                  >
                    <option value="" disabled className="bg-neutral-900">-- Pick a Form --</option>
                    {forms?.map((f) => (
                      <option key={f.id} value={f.id} className="bg-neutral-900 text-white">
                        {f.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedAnalyticsFormId ? (
                <div className="glass-level-1 py-20 text-center text-neutral-400 rounded-2xl shadow-xl">
                  <p className="text-sm">Please select a form from the dropdown to load analytics.</p>
                </div>
              ) : analyticsLoading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#52a3dd]" />
                </div>
              ) : !analytics ? (
                <div className="glass-level-1 py-20 text-center text-red-400 rounded-2xl shadow-xl">
                  <p className="text-sm">Failed to load analytics details.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Summary row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-level-1 p-6 rounded-2xl shadow-lg">
                      <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Submissions</p>
                      <h2 className="text-3xl font-black mt-2 text-white">{analytics.totalSubmissions}</h2>
                    </div>

                    <div className="glass-level-1 p-6 rounded-2xl shadow-lg">
                      <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Completion Rate</p>
                      <h2 className="text-3xl font-black mt-2 text-[#52a3dd]">
                        {analytics.totalSubmissions > 0 ? "100.0%" : "0.0%"}
                      </h2>
                    </div>

                    <div className="glass-level-1 p-6 rounded-2xl shadow-lg">
                      <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Active Status</p>
                      <h2 className="text-3xl font-black mt-2 text-emerald-400">Accepting</h2>
                    </div>
                  </div>

                  {/* Submission Trend Timeline */}
                  <div className="glass-level-1 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-base flex items-center gap-1.5 text-white">
                        <TrendingUp className="w-4 h-4 text-[#52a3dd]" />
                        Submission Timelines (Last 7 Days)
                      </h3>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.timeline}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#52a3dd" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#52a3dd" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="#8a929a" fontSize={11} tickLine={false} />
                          <YAxis stroke="#8a929a" fontSize={11} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ backgroundColor: "rgba(14, 14, 14, 0.85)", backdropFilter: "blur(16px)", borderColor: "rgba(255, 255, 255, 0.15)", borderRadius: "12px", color: "#fff" }} />
                          <Area type="monotone" dataKey="count" stroke="#52a3dd" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Questions Summary */}
                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-base text-white">Question Breakdown</h3>
                    
                    {analytics.fieldsSummary.map((field) => (
                      <div key={field.fieldId} className="glass-level-1 rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-white">{field.label}</h4>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-1 inline-block">
                              Type: {field.type.replace("_", " ")}
                            </span>
                          </div>
                          
                          {field.type === "rating" && (
                            <span className="text-xs bg-[#e47939]/10 border border-[#e47939]/20 text-[#e47939] font-bold px-2.5 py-1 rounded-lg">
                              Avg: {field.averageRating} ★
                            </span>
                          )}
                        </div>

                        {/* If choices breakdown */}
                        {field.choicesBreakdown && Object.keys(field.choicesBreakdown).length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            {/* List options counts */}
                            <div className="flex flex-col gap-1.5">
                              {Object.entries(field.choicesBreakdown as Record<string, number>).map(([choice, count]) => {
                                const total = Object.values(field.choicesBreakdown as Record<string, number>).reduce((a, b) => a + b, 0) || 1;
                                const pct = ((count / total) * 100).toFixed(0);
                                return (
                                  <div key={choice} className="flex flex-col gap-1 text-xs">
                                    <div className="flex justify-between text-neutral-400">
                                      <span className="font-semibold text-white">{choice}</span>
                                      <span>{count} votes ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-[#0e0e0e]/50 rounded-full h-2 overflow-hidden border border-white/5">
                                      <div
                                        className="bg-gradient-to-r from-[#52a3dd] to-[#90cdff] h-full rounded-full"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Chart */}
                            <div className="h-40">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={Object.entries(field.choicesBreakdown).map(([c, count]) => ({ name: c, count }))}>
                                  <XAxis dataKey="name" fontSize={9} stroke="#8a929a" />
                                  <YAxis fontSize={9} stroke="#8a929a" allowDecimals={false} />
                                  <Tooltip contentStyle={{ backgroundColor: "rgba(14, 14, 14, 0.85)", backdropFilter: "blur(16px)", borderColor: "rgba(255, 255, 255, 0.15)", borderRadius: "12px", color: "#fff" }} />
                                  <Bar dataKey="count" fill="#52a3dd" radius={[4, 4, 0, 0]}>
                                    {Object.entries(field.choicesBreakdown).map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#52a3dd" : "#e47939"} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* If text input */}
                        {field.recentResponses && field.recentResponses.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Recent Responses</h5>
                            <div className="flex flex-col gap-1.5">
                              {field.recentResponses.map((textVal, idx) => (
                                <div key={idx} className="bg-[#0e0e0e]/40 border border-white/5 rounded-xl p-3 text-xs text-[#bfc7d1]">
                                  {textVal}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Empty responses state */}
                        {(!field.choicesBreakdown && !field.recentResponses && field.type !== "rating") && (
                          <p className="text-xs text-neutral-500">No submission inputs recorded for this field.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEVELOPER & SCALAR API VIEW */}
          {activeTab === "dev" && (
            <div className="flex flex-col gap-6">
              <div className="glass-level-1 p-6 rounded-2xl shadow-xl flex flex-col gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">Developer Integration</h1>
                <p className="text-sm text-[#bfc7d1]">Use secure tokens to query responses via Scalar OpenAPI.</p>
              </div>

              {/* Scalar details card */}
              <div className="glass-level-1 border-[#52a3dd]/30 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
                <div>
                  <h3 className="font-bold text-base text-[#52a3dd] flex items-center gap-1.5">
                    <ExternalLink className="w-5 h-5" />
                    Interactive Scalar API Documentation
                  </h3>
                  <p className="text-xs text-[#bfc7d1] mt-1 max-w-xl">
                    Every endpoint in our tRPC routing compiles to standard OpenAPI. Navigate to the documentation to try endpoints directly from your browser!
                  </p>
                </div>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#52a3dd] text-[#003755] hover:bg-[#90cdff] hover:text-[#001e30] px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-[0_0_20px_rgba(82,163,221,0.15)]"
                >
                  Open Scalar Docs
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {/* Generate API Key */}
                <div className="glass-level-1 rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
                  <h3 className="font-bold text-base text-white">Generate API Key</h3>
                  
                  <form onSubmit={handleGenerateKeySubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Key Description</label>
                      <div className="relative input-glow rounded-lg transition-all duration-300 bg-[rgba(255,255,255,0.02)] border border-white/5 focus-within:border-[#52a3dd]">
                        <input
                          type="text"
                          placeholder="e.g. My Website Integration"
                          value={keyDescription}
                          onChange={(e) => setKeyDescription(e.target.value)}
                          className="w-full bg-transparent border-none py-3 px-4 text-sm text-[#e5e2e1] focus:outline-none placeholder:text-neutral-600 rounded-lg outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={generateKeyMutation.isPending}
                      className="bg-[#52a3dd] text-[#003755] hover:bg-[#90cdff] hover:text-[#001e30] font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(82,163,221,0.1)] hover:shadow-[0_0_20px_rgba(82,163,221,0.25)]"
                    >
                      {generateKeyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Generate Key
                    </button>
                  </form>

                  {generatedKey && (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl flex flex-col gap-2">
                      <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">
                        Key Generated (Copy now, it will not show again!)
                      </p>
                      <div className="flex items-center gap-2 bg-[#0e0e0e]/60 border border-white/5 p-2.5 rounded-lg text-xs font-mono select-all text-emerald-300">
                        {generatedKey}
                      </div>
                    </div>
                  )}
                </div>

                {/* Active keys list */}
                <div className="glass-level-1 rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
                  <h3 className="font-bold text-base text-white">Active API Keys</h3>

                  {!apiKeys || apiKeys.length === 0 ? (
                    <p className="text-xs text-neutral-500 py-4">No active API keys found. Generate one to start query integrations.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="bg-[#0e0e0e]/40 border border-white/5 rounded-xl p-3.5 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{key.description}</p>
                            <p className="text-[9px] text-[#bfc7d1] mt-1">
                              Created: {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : ""}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => {
                              if (confirm("Revoke this API key?")) {
                                deleteKeyMutation.mutate({ id: key.id });
                              }
                            }}
                            className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE FORM DIALOG / WIZARD MODAL */}
      {showCreateModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${closingModal ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !isRedirecting) closeModal(); }}
        >
          <div className={`glass-level-1 rounded-3xl p-8 max-w-lg w-full flex flex-col gap-6 relative shadow-2xl ${closingModal ? 'modal-panel-exit' : 'modal-panel-enter'}`}>
            {isRedirecting ? (
              <div className="flex flex-col items-center justify-center py-12 gap-5 text-center content-fade-in">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#52a3dd]/20 animate-ping" />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#52a3dd] to-[#e47939] flex items-center justify-center text-white shadow-lg shadow-[#52a3dd]/25">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-black bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent animate-pulse">
                    Assembling Workspace...
                  </h3>
                  <p className="text-xs text-[#bfc7d1] max-w-xs leading-relaxed font-medium">
                    Initializing your 3D canvas, configuring fields, and loading Sakura stardust particle fields. Please wait!
                  </p>
                </div>
              </div>
            ) : (
              <div className="content-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-white">Create a New Form</h2>
                  <p className="text-xs text-[#bfc7d1] mt-1">Specify basic settings and pick a visual template style.</p>
                </div>

                <form onSubmit={handleCreateFormSubmit} className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                      Form Title <span className="text-red-400 font-bold">*</span>
                    </label>
                    <div className="relative input-glow rounded-lg transition-all duration-300 bg-[rgba(255,255,255,0.02)] border border-white/5 focus-within:border-[#52a3dd]">
                      <input
                        type="text"
                        placeholder="e.g. User Feedback Survey"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-transparent border-none py-3 px-4 text-sm text-[#e5e2e1] focus:outline-none placeholder:text-neutral-600 rounded-lg outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Description (Optional)</label>
                    <div className="relative input-glow rounded-lg transition-all duration-300 bg-[rgba(255,255,255,0.02)] border border-white/5 focus-within:border-[#52a3dd]">
                      <textarea
                        placeholder="Summarize the intent of this form..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full bg-transparent border-none py-3 px-4 text-sm text-[#e5e2e1] focus:outline-none placeholder:text-neutral-600 rounded-lg outline-none h-20 resize-none"
                      />
                    </div>
                  </div>

                  {/* Theme Template Selection */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Choose Theme Template</label>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Manga Pop */}
                      <button
                        type="button"
                        onClick={() => setNewTheme("manga pop")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                          newTheme === "manga pop"
                            ? "bg-pink-500/10 border-pink-500/40 text-pink-400 scale-[1.03] shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                            : "bg-[#0e0e0e]/40 border-white/5 text-neutral-400 hover:border-white/10 hover:scale-[1.02]"
                        }`}
                      >
                        <span className="text-xl select-none">🌸</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">MANGA POP</span>
                      </button>

                      {/* Fresh Leaf */}
                      <button
                        type="button"
                        onClick={() => setNewTheme("fresh leaf")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                          newTheme === "fresh leaf"
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 scale-[1.03] shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "bg-[#0e0e0e]/40 border-white/5 text-neutral-400 hover:border-white/10 hover:scale-[1.02]"
                        }`}
                      >
                        <span className="text-xl select-none">🌿</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">FRESH LEAF</span>
                      </button>

                      {/* Pure Abstract */}
                      <button
                        type="button"
                        onClick={() => setNewTheme("pure abstract")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                          newTheme === "pure abstract"
                            ? "bg-white/10 border-white/40 text-white scale-[1.03] shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                            : "bg-[#0e0e0e]/40 border-white/5 text-neutral-400 hover:border-white/10 hover:scale-[1.02]"
                        }`}
                      >
                        <span className="text-xl select-none">⚪</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">PURE ABSTRACT</span>
                      </button>
                    </div>
                  </div>

                  {/* Visibility selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Visibility Mode</label>
                    <div className="flex gap-4 bg-[#0e0e0e]/60 border border-white/10 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setNewVisibility("public")}
                        className={`flex-grow font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-all duration-200 ${
                          newVisibility === "public" ? "bg-white text-zinc-950 shadow-sm font-extrabold" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        Public (Explore page)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVisibility("unlisted")}
                        className={`flex-grow font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-all duration-200 ${
                          newVisibility === "unlisted" ? "bg-white text-zinc-950 shadow-sm font-extrabold" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        Unlisted (Link only)
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => closeModal()}
                      className="flex-1 border border-white/10 hover:bg-white/5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-neutral-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createFormMutation.isPending}
                      className="flex-1 text-white py-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(82,163,221,0.2)] hover:opacity-90 disabled:opacity-60"
                      style={{ background: 'linear-gradient(90deg, #52A3DD 0%, #E47939 100%)' }}
                    >
                      {createFormMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                      Confirm
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
