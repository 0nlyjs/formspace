"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
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

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"forms" | "analytics" | "dev">("forms");
  
  // Create form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTheme, setNewTheme] = useState<"anime" | "tech" | "retro">("anime");
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
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [user, userLoading, router]);

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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-sm text-zinc-400">Loading creator dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-sm text-zinc-400">Redirecting to login...</p>
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
      theme: newTheme,
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
      case "tech":
        return { label: "Cyberpunk Tech", icon: <Terminal className="w-4 h-4 text-emerald-400" />, color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" };
      case "retro":
        return { label: "Classic Retro", icon: <Sparkles className="w-4 h-4 text-amber-400" />, color: "border-amber-500/20 bg-amber-500/5 text-amber-400" };
      default:
        return { label: "Anime & Manga", icon: <Flame className="w-4 h-4 text-pink-400" />, color: "border-pink-500/20 bg-pink-500/5 text-pink-400" };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
      {/* Navbar */}
      <header className="border-b border-white/5 bg-zinc-900/60 backdrop-blur-md px-6 md:px-12 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center">
            <span className="font-extrabold text-xs text-black">FS</span>
          </div>
          <span className="font-black text-lg text-white">formspace.</span>
        </div>

        <div className="flex items-center gap-6">
          {/* User profile identifier */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{user.fullName}</p>
              <p className="text-[10px] text-zinc-500 leading-tight">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-1.5 text-xs font-bold bg-white/5 border border-white/15 hover:bg-white/10 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-zinc-900/20 p-6 flex flex-col gap-1.5 shrink-0">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">
            Creator Panel
          </h3>
          
          <button
            onClick={() => setActiveTab("forms")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === "forms" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"
            }`}
          >
            <List className="w-4 h-4" />
            My Forms
          </button>

          <button
            onClick={() => {
              setActiveTab("analytics");
              // Pick first form if available and none picked yet
              if (!selectedAnalyticsFormId && forms && forms.length > 0 && forms[0]) {
                setSelectedAnalyticsFormId(forms[0].id);
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === "analytics" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Analytics Charts
          </button>

          <button
            onClick={() => setActiveTab("dev")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === "dev" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"
            }`}
          >
            <Code className="w-4 h-4" />
            Developer / Scalar API
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full">
          {/* TAB 1: MY FORMS */}
          {activeTab === "forms" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold">My Forms</h1>
                  <p className="text-sm text-zinc-400 mt-0.5">Create, edit, and publish dynamic schemas.</p>
                </div>
                <button
                  onClick={() => { setClosingModal(false); setShowCreateModal(true); }}
                  className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-md shadow-white/5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create Form
                </button>
              </div>

              {formsLoading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              ) : !forms || forms.length === 0 ? (
                <div className="border border-white/5 bg-zinc-900/10 p-12 rounded-3xl text-center flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10">
                    <List className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">No forms created yet</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                      Build your first Typeform-style question schema with immersive 3D template support!
                    </p>
                  </div>
                  <button
                    onClick={() => { setClosingModal(false); setShowCreateModal(true); }}
                    className="bg-white text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {forms.map((form) => {
                    const theme = getThemeDetails(form.theme);
                    return (
                      <div
                        key={form.id}
                        className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-white/20 hover:bg-zinc-900/60 transition-all duration-300"
                      >
                        <div className="flex flex-col gap-2">
                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border rounded-full flex items-center gap-1 shrink-0 ${theme.color}`}>
                              {theme.icon}
                              {theme.label}
                            </span>
                            
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              form.visibility === "public"
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}>
                              {form.visibility}
                            </span>

                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              form.status === "published"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-zinc-800 text-zinc-400 border border-white/5"
                            }`}>
                              {form.status}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors mt-2">
                            {form.title}
                          </h3>
                          <p className="text-xs text-zinc-400 line-clamp-2">
                            {form.description || "No description provided."}
                          </p>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                          <span className="text-xs font-semibold text-zinc-500">
                            Responses:{" "}
                            <span className="text-white font-bold">{form.responseCount}</span>
                          </span>

                          <div className="flex gap-2">
                            {form.status === "published" && (
                              <Link
                                href={`/fill/${form.slug}`}
                                target="_blank"
                                className="group/btn relative w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-950 text-[9px] font-bold text-white border border-white/10 rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-100 whitespace-nowrap shadow-xl z-20">
                                  Open Form
                                </span>
                              </Link>
                            )}

                            <button
                              onClick={() => {
                                const url = `${window.location.origin}/fill/${form.slug}`;
                                navigator.clipboard.writeText(url);
                                toast.success("Form link copied to clipboard!");
                              }}
                              className="group/btn relative w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-950 text-[9px] font-bold text-white border border-white/10 rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-100 whitespace-nowrap shadow-xl z-20">
                                Copy Link
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAnalyticsFormId(form.id);
                                setActiveTab("analytics");
                              }}
                              className="group/btn relative w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 transition-colors cursor-pointer"
                            >
                              <BarChart2 className="w-3.5 h-3.5" />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-950 text-[9px] font-bold text-white border border-white/10 rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-100 whitespace-nowrap shadow-xl z-20">
                                View Analytics
                              </span>
                            </button>

                            <Link
                              href={`/forms/${form.id}/edit`}
                              className="group/btn relative w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-950 text-[9px] font-bold text-white border border-white/10 rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-100 whitespace-nowrap shadow-xl z-20">
                                Edit Fields
                              </span>
                            </Link>

                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this form and all its responses?")) {
                                  deleteFormMutation.mutate({ formId: form.id });
                                }
                              }}
                              className="group/btn relative w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-950 text-[9px] font-bold text-white border border-white/10 rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-100 whitespace-nowrap shadow-xl z-20">
                                Delete Form
                              </span>
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

          {/* TAB 2: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold">Analytics Dashboard</h1>
                  <p className="text-sm text-zinc-400 mt-0.5">Visualize user submissions and ratings.</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Select Form:</span>
                  <select
                    value={selectedAnalyticsFormId}
                    onChange={(e) => setSelectedAnalyticsFormId(e.target.value)}
                    className="bg-zinc-900 border border-white/15 px-3 py-2 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition-colors min-w-[200px]"
                  >
                    <option value="" disabled>-- Pick a Form --</option>
                    {forms?.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedAnalyticsFormId ? (
                <div className="py-20 text-center text-zinc-500">
                  <p className="text-sm">Please select a form from the dropdown to load analytics.</p>
                </div>
              ) : analyticsLoading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              ) : !analytics ? (
                <div className="py-20 text-center text-red-400">
                  <p className="text-sm">Failed to load analytics details.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Summary row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Submissions</p>
                      <h2 className="text-3xl font-black mt-2 text-white">{analytics.totalSubmissions}</h2>
                    </div>

                    <div className="bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Completion Rate</p>
                      <h2 className="text-3xl font-black mt-2 text-indigo-400">
                        {analytics.totalSubmissions > 0 ? "100.0%" : "0.0%"}
                      </h2>
                    </div>

                    <div className="bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Active Status</p>
                      <h2 className="text-3xl font-black mt-2 text-emerald-400">Accepting</h2>
                    </div>
                  </div>

                  {/* Submission Trend Timeline */}
                  <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-base flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        Submission Timelines (Last 7 Days)
                      </h3>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.timeline}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                          <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                          <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Questions Summary */}
                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-base">Question Breakdown</h3>
                    
                    {analytics.fieldsSummary.map((field) => (
                      <div key={field.fieldId} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-zinc-100">{field.label}</h4>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1 inline-block">
                              Type: {field.type.replace("_", " ")}
                            </span>
                          </div>
                          
                          {field.type === "rating" && (
                            <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-lg">
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
                                    <div className="flex justify-between text-zinc-400">
                                      <span className="font-semibold text-white">{choice}</span>
                                      <span>{count} votes ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                                      <div
                                        className="bg-indigo-500 h-full rounded-full"
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
                                  <XAxis dataKey="name" fontSize={9} stroke="#71717a" />
                                  <YAxis fontSize={9} stroke="#71717a" allowDecimals={false} />
                                  <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
                                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                                    {Object.entries(field.choicesBreakdown).map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#ec4899"} />
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
                            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Recent Responses</h5>
                            <div className="flex flex-col gap-1.5">
                              {field.recentResponses.map((textVal, idx) => (
                                <div key={idx} className="bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-zinc-300">
                                  {textVal}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Empty responses state */}
                        {(!field.choicesBreakdown && !field.recentResponses && field.type !== "rating") && (
                          <p className="text-xs text-zinc-500">No submission inputs recorded for this field.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEVELOPER & SCALAR API */}
          {activeTab === "dev" && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-extrabold">Developer Integration</h1>
                <p className="text-sm text-zinc-400 mt-0.5">Use secure tokens to query responses via Scalar OpenAPI.</p>
              </div>

              {/* Scalar details card */}
              <div className="bg-indigo-950/20 border border-indigo-500/20 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-base text-indigo-400 flex items-center gap-1.5">
                    <ExternalLink className="w-5 h-5" />
                    Interactive Scalar API Documentation
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                    Every endpoint in our tRPC routing compiles to standard OpenAPI. Navigate to the documentation to try endpoints directly from your browser!
                  </p>
                </div>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-zinc-200 transition-all shrink-0 cursor-pointer shadow-md"
                >
                  Open Scalar Docs
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {/* Generate API Key */}
                <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                  <h3 className="font-bold text-base">Generate API Key</h3>
                  
                  <form onSubmit={handleGenerateKeySubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Key Description</label>
                      <input
                        type="text"
                        placeholder="e.g. My Website Integration"
                        value={keyDescription}
                        onChange={(e) => setKeyDescription(e.target.value)}
                        className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={generateKeyMutation.isPending}
                      className="bg-white text-zinc-950 font-bold py-2.5 rounded-xl text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                      <div className="flex items-center gap-2 bg-zinc-950 border border-white/5 p-2.5 rounded-lg text-xs font-mono select-all">
                        {generatedKey}
                      </div>
                    </div>
                  )}
                </div>

                {/* Active keys list */}
                <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                  <h3 className="font-bold text-base">Active API Keys</h3>

                  {!apiKeys || apiKeys.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-4">No active API keys found. Generate one to start query integrations.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="bg-zinc-950 border border-white/5 rounded-xl p-3.5 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{key.description}</p>
                            <p className="text-[9px] text-zinc-500 mt-1">
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
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !isRedirecting) closeModal(); }}
        >
          <div className={`bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full flex flex-col gap-6 relative ${closingModal ? 'modal-panel-exit' : 'modal-panel-enter'}`}>
            {isRedirecting ? (
              <div className="flex flex-col items-center justify-center py-12 gap-5 text-center content-fade-in">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-black bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent animate-pulse">
                    Assembling Workspace...
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-xs leading-relaxed font-medium">
                    Initializing your 3D canvas, configuring fields, and loading Sakura stardust particle fields. Please wait!
                  </p>
                </div>
              </div>
            ) : (
              <div className="content-fade-in">
                <div>
                  <h2 className="text-xl font-bold">Create a New Form</h2>
                  <p className="text-xs text-zinc-400 mt-1">Specify basic settings and pick a visual template style.</p>
                </div>

                <form onSubmit={handleCreateFormSubmit} className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Form Title</label>
                    <input
                      type="text"
                      placeholder="e.g. User Feedback Survey"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description (Optional)</label>
                    <textarea
                      placeholder="Summarize the intent of this form..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-all duration-200 h-20"
                    />
                  </div>

                  {/* Theme Template Selection */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Choose Theme Template</label>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Anime */}
                      <button
                        type="button"
                        onClick={() => setNewTheme("anime")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                          newTheme === "anime"
                            ? "bg-pink-500/10 border-pink-500/40 text-pink-400 scale-[1.03]"
                            : "bg-zinc-950 border-white/5 text-zinc-400 hover:border-white/10 hover:scale-[1.02]"
                        }`}
                      >
                        <Flame className="w-5 h-5" />
                        <span className="text-[10px] font-bold">Anime</span>
                      </button>

                      {/* Tech */}
                      <button
                        type="button"
                        onClick={() => setNewTheme("tech")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                          newTheme === "tech"
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 scale-[1.03]"
                            : "bg-zinc-950 border-white/5 text-zinc-400 hover:border-white/10 hover:scale-[1.02]"
                        }`}
                      >
                        <Terminal className="w-5 h-5" />
                        <span className="text-[10px] font-bold">Cyberpunk</span>
                      </button>

                      {/* Retro */}
                      <button
                        type="button"
                        onClick={() => setNewTheme("retro")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                          newTheme === "retro"
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400 scale-[1.03]"
                            : "bg-zinc-950 border-white/5 text-zinc-400 hover:border-white/10 hover:scale-[1.02]"
                        }`}
                      >
                        <Sparkles className="w-5 h-5" />
                        <span className="text-[10px] font-bold">Retro</span>
                      </button>
                    </div>
                  </div>

                  {/* Visibility selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Visibility Mode</label>
                    <div className="flex gap-4 bg-zinc-950 border border-white/10 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setNewVisibility("public")}
                        className={`flex-grow font-bold py-2 rounded-lg text-xs cursor-pointer transition-all duration-200 ${
                          newVisibility === "public" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Public (Shown in explore)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVisibility("unlisted")}
                        className={`flex-grow font-bold py-2 rounded-lg text-xs cursor-pointer transition-all duration-200 ${
                          newVisibility === "unlisted" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"
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
                      className="flex-1 border border-white/10 hover:bg-white/5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createFormMutation.isPending}
                      className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 py-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-white/5 disabled:opacity-60"
                    >
                      {createFormMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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
