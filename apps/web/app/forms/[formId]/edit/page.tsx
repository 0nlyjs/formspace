"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Terminal,
  Flame,
  Loader2,
  Eye,
  Settings2,
  HelpCircle,
  PlusCircle,
  Type,
  AlignLeft,
  Mail,
  Binary,
  CheckSquare,
  ListPlus,
  Star,
  Calendar,
  Lock,
} from "lucide-react";

interface FieldState {
  id?: string;
  type:
    | "short_text"
    | "long_text"
    | "email"
    | "number"
    | "single_select"
    | "multi_select"
    | "checkbox"
    | "rating"
    | "date";
  label: string;
  description?: string | null;
  required: boolean;
  placeholder?: string | null;
  options?: string[] | null;
  order: number;
}

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  // Local Form Settings States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [theme, setTheme] = useState<"anime" | "tech" | "retro">("anime");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [password, setPassword] = useState("");
  const [enablePassword, setEnablePassword] = useState(false);
  const [responseLimit, setResponseLimit] = useState<number | "">("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emailConfirmations, setEmailConfirmations] = useState(true);

  // Local Questions List State
  const [fields, setFields] = useState<FieldState[]>([]);

  // Selected Field for detailed custom options editing
  const [selectedFieldIdx, setSelectedFieldIdx] = useState<number | null>(null);

  // Queries
  const { data: formData, isLoading: formLoading, error: loadError } = trpc.form.get.useQuery(
    { formId },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Mutations
  const updateFormMutation = trpc.form.update.useMutation({
    onSuccess: () => {
      toast.success("Form changes saved successfully!");
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save form changes.");
    },
  });

  // Load backend details into local states
  useEffect(() => {
    if (formData) {
      setTitle(formData.title);
      setDescription(formData.description || "");
      setSlug(formData.slug);
      setTheme(formData.theme as "anime" | "tech" | "retro");
      setVisibility(formData.visibility as "public" | "unlisted");
      setStatus(formData.status as "draft" | "published");
      if (formData.password) {
        setPassword(formData.password);
        setEnablePassword(true);
      } else {
        setPassword("");
        setEnablePassword(false);
      }
      setResponseLimit(formData.responseLimit || "");
      setEmailNotifications(formData.emailNotifications ?? true);
      setEmailConfirmations(formData.emailConfirmations ?? true);
      
      if (formData.expiresAt) {
        const dateObj = new Date(formData.expiresAt);
        // format to yyyy-MM-ddThh:mm for datetime-local input
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const hh = String(dateObj.getHours()).padStart(2, "0");
        const min = String(dateObj.getMinutes()).padStart(2, "0");
        setExpiresAt(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      } else {
        setExpiresAt("");
      }

      // Sort initial fields by order
      const sortedFields = [...(formData.fields || [])].sort((a, b) => a.order - b.order);
      setFields(
        sortedFields.map((f) => ({
          id: f.id,
          type: f.type as any,
          label: f.label,
          description: f.description,
          required: f.required,
          placeholder: f.placeholder,
          options: Array.isArray(f.options) ? (f.options as string[]) : [],
          order: f.order,
        }))
      );
    }
  }, [formData]);

  if (formLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-sm text-zinc-400">Loading form builder canvas...</p>
        </div>
      </div>
    );
  }

  if (loadError || !formData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white p-6">
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl text-center max-w-md flex flex-col gap-4 items-center">
          <Lock className="w-12 h-12 text-red-400" />
          <div>
            <h2 className="text-xl font-bold">Error Loading Form</h2>
            <p className="text-sm text-zinc-400 mt-1">
              {loadError?.message || "This form might not exist or you do not have administrative permissions."}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="w-full bg-white text-zinc-950 font-bold py-3 rounded-2xl hover:bg-zinc-200 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Questions Handlers
  // ----------------------------------------------------
  const addQuestion = (type: FieldState["type"]) => {
    const defaultLabels: Record<FieldState["type"], string> = {
      short_text: "Untitled Short Answer Question",
      long_text: "Untitled Essay Question",
      email: "Please enter your email address",
      number: "Please enter a number",
      single_select: "Select an option from the list",
      multi_select: "Choose one or more answers",
      checkbox: "Do you agree to the terms and conditions?",
      rating: "How would you rate this service?",
      date: "Select a date",
    };

    const newField: FieldState = {
      type,
      label: defaultLabels[type],
      description: "",
      required: false,
      placeholder: type === "rating" ? "" : "Type your placeholder text here...",
      options: type === "single_select" || type === "multi_select" ? ["Option 1", "Option 2"] : [],
      order: fields.length,
    };

    setFields([...fields, newField]);
    setSelectedFieldIdx(fields.length); // Open detail editor instantly
    toast.success(`${type.replace("_", " ")} question added!`);
  };

  const deleteQuestion = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    // Reset orders
    const ordered = updated.map((f, i) => ({ ...f, order: i }));
    setFields(ordered);
    if (selectedFieldIdx === index) {
      setSelectedFieldIdx(null);
    } else if (selectedFieldIdx !== null && selectedFieldIdx > index) {
      setSelectedFieldIdx(selectedFieldIdx - 1);
    }
    toast.info("Question removed.");
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const newFields = [...fields];
    
    // Swap items
    const temp = newFields[index]!;
    newFields[index] = newFields[targetIdx]!;
    newFields[targetIdx] = temp;

    // Reset order index
    const ordered = newFields.map((f, i) => ({ ...f, order: i }));
    setFields(ordered);

    // Maintain focus index
    if (selectedFieldIdx === index) {
      setSelectedFieldIdx(targetIdx);
    } else if (selectedFieldIdx === targetIdx) {
      setSelectedFieldIdx(index);
    }
  };

  const updateQuestionField = (index: number, key: keyof FieldState, value: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index]!, [key]: value };
    setFields(updated);
  };

  // Option lists handlers (Selects)
  const addOptionToQuestion = (index: number) => {
    const currentOptions = fields[index]?.options || [];
    updateQuestionField(index, "options", [...currentOptions, `Option ${currentOptions.length + 1}`]);
  };

  const updateOptionInQuestion = (qIndex: number, optIndex: number, val: string) => {
    const currentOptions = [...(fields[qIndex]?.options || [])];
    currentOptions[optIndex] = val;
    updateQuestionField(qIndex, "options", currentOptions);
  };

  const removeOptionFromQuestion = (qIndex: number, optIndex: number) => {
    const currentOptions = (fields[qIndex]?.options || []).filter((_, idx) => idx !== optIndex);
    updateQuestionField(qIndex, "options", currentOptions);
  };

  // ----------------------------------------------------
  // Save Handler
  // ----------------------------------------------------
  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Form title is required.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug URL is required.");
      return;
    }
    if (fields.length === 0) {
      toast.error("You must add at least one question to your form.");
      return;
    }

    // Validate email format and check labels are filled
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i]!;
      if (!f.label.trim()) {
        toast.error(`Question #${i + 1} has an empty question label.`);
        return;
      }
      if ((f.type === "single_select" || f.type === "multi_select") && (!f.options || f.options.length === 0)) {
        toast.error(`Question "${f.label}" requires at least one option.`);
        return;
      }
    }

    const payload = {
      formId,
      title,
      description: description || null,
      slug: slug.toLowerCase().replace(/[^a-z0-9-_]+/g, "-"),
      theme,
      visibility,
      status,
      password: enablePassword && password ? password : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      responseLimit: responseLimit ? Number(responseLimit) : null,
      emailNotifications,
      emailConfirmations,
      fields: fields.map((f) => ({
        id: f.id,
        type: f.type,
        label: f.label,
        description: f.description || null,
        required: f.required,
        placeholder: f.placeholder || null,
        options: f.options || null,
        validations: null,
        logic: null,
        order: f.order,
      })),
    };

    updateFormMutation.mutate(payload);
  };

  // Helper icons for field types
  const getFieldIcon = (type: FieldState["type"]) => {
    switch (type) {
      case "short_text":
        return <Type className="w-4 h-4 text-sky-400" />;
      case "long_text":
        return <AlignLeft className="w-4 h-4 text-purple-400" />;
      case "email":
        return <Mail className="w-4 h-4 text-pink-400" />;
      case "number":
        return <Binary className="w-4 h-4 text-emerald-400" />;
      case "single_select":
        return <CheckSquare className="w-4 h-4 text-amber-400" />;
      case "multi_select":
        return <ListPlus className="w-4 h-4 text-indigo-400" />;
      case "checkbox":
        return <CheckSquare className="w-4 h-4 text-rose-400" />;
      case "rating":
        return <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />;
      case "date":
        return <Calendar className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      {/* Top Header / Action Bar */}
      <header className="border-b border-white/5 bg-zinc-900/60 backdrop-blur-md px-6 py-4 flex flex-wrap justify-between items-center z-20 gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Form Builder Space
              </span>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  status === "published"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                    : "bg-zinc-800 text-zinc-400 border border-white/5"
                }`}
              >
                {status}
              </span>
            </div>
            <h1 className="text-sm font-bold text-white max-w-[200px] sm:max-w-[400px] truncate">
              {title || "Untitled Form"}
            </h1>
          </div>
        </div>

        {/* Action button triggers */}
        <div className="flex items-center gap-2.5">
          {status === "published" && (
            <Link
              href={`/fill/${slug}`}
              target="_blank"
              className="px-4 py-2 bg-white/5 border border-white/15 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all text-zinc-300"
            >
              <Eye className="w-3.5 h-3.5" />
              Live Link
            </Link>
          )}

          <button
            onClick={handleSave}
            disabled={updateFormMutation.isPending}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-90 active:scale-[0.98] font-bold rounded-xl text-xs text-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-500/10"
          >
            {updateFormMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Schema
          </button>
        </div>
      </header>

      {/* Main Workspace split */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-73px)]">
        
        {/* LEFT COLUMN: Cyberpunk Form Settings Control panel */}
        <aside className="w-full lg:w-[360px] border-b lg:border-b-0 lg:border-r border-white/5 bg-zinc-900/20 p-6 overflow-y-auto shrink-0 flex flex-col gap-6 scrollbar-thin">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Settings2 className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Form Configuration
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* Title input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter form title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            {/* Description input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Description
              </label>
              <textarea
                placeholder="Enter form description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-colors h-14"
              />
            </div>

            {/* Slug input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Unique Slug URL
              </label>
              <div className="flex bg-zinc-950 border border-white/10 rounded-xl items-center overflow-hidden focus-within:border-purple-500 transition-all">
                <span className="text-[10px] text-zinc-500 bg-zinc-900/50 border-r border-white/5 px-2.5 py-2 font-mono">
                  /fill/
                </span>
                <input
                  type="text"
                  placeholder="custom-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]+/g, "-"))}
                  className="bg-transparent border-none px-3 py-2 text-xs focus:outline-none w-full font-mono text-indigo-300"
                  required
                />
              </div>
            </div>

            {/* Theme template choice */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Visual Template Theme
              </label>
              <div className="grid grid-cols-3 gap-2 bg-zinc-950 border border-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTheme("anime")}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                    theme === "anime"
                      ? "bg-pink-500/10 border border-pink-500/30 text-pink-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span className="text-[8px] font-extrabold uppercase">Anime</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("tech")}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                    theme === "tech"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span className="text-[8px] font-extrabold uppercase">Cyberpunk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("retro")}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                    theme === "retro"
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[8px] font-extrabold uppercase">Retro</span>
                </button>
              </div>
            </div>

            {/* Visibility choice */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Visibility Mode
              </label>
              <div className="flex bg-zinc-950 border border-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`flex-grow font-bold py-1.5 rounded-lg text-[10px] cursor-pointer transition-all ${
                    visibility === "public" ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("unlisted")}
                  className={`flex-grow font-bold py-1.5 rounded-lg text-[10px] cursor-pointer transition-all ${
                    visibility === "unlisted" ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Unlisted
                </button>
              </div>
            </div>

            {/* Status choice (Published or Draft) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Accepting Responses
              </label>
              <div className="flex bg-zinc-950 border border-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatus("draft")}
                  className={`flex-grow font-bold py-1.5 rounded-lg text-[10px] cursor-pointer transition-all ${
                    status === "draft" ? "bg-zinc-800 text-zinc-200" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  Draft / Locked
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("published")}
                  className={`flex-grow font-bold py-1.5 rounded-lg text-[10px] cursor-pointer transition-all ${
                    status === "published" ? "bg-emerald-500 text-zinc-950" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  Published / Active
                </button>
              </div>
            </div>

            {/* Advanced configurations */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
              <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                Advanced Security & Limits
              </h3>

              {/* Password Protection */}
              <div className="flex flex-col gap-2 bg-zinc-950/40 border border-white/5 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-300">
                    Require Password
                  </label>
                  <input
                    type="checkbox"
                    checked={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                {enablePassword && (
                  <input
                    type="text"
                    placeholder="Enter submission password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 transition-colors w-full mt-1.5 font-mono text-zinc-300"
                    required
                  />
                )}
              </div>

              {/* Response Limits */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  Response Cap Limit
                  <span className="text-[9px] text-zinc-600 font-normal normal-case">
                    (Leave empty for unlimited)
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={responseLimit}
                  onChange={(e) => setResponseLimit(e.target.value === "" ? "" : Number(e.target.value))}
                  className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Expiration date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Expiration Date/Time
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-colors text-zinc-300"
                />
              </div>

              {/* Email Settings */}
              <div className="flex flex-col gap-2.5 pt-2.5 border-t border-white/5">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  Email Dispatch Flow
                </h4>

                <div className="flex items-center justify-between bg-zinc-950/50 border border-white/5 rounded-xl p-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-zinc-200">Notify Creator</span>
                    <span className="text-[9px] text-zinc-500 leading-tight">Email me on new submissions</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-3.5 h-3.5 accent-purple-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between bg-zinc-950/50 border border-white/5 rounded-xl p-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-zinc-200">Respondent Receipt</span>
                    <span className="text-[9px] text-zinc-500 leading-tight">Send confirmation to respondents</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailConfirmations}
                    onChange={(e) => setEmailConfirmations(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MIDDLE COLUMN: Form Canvas & Questions Layout */}
        <main className="flex-grow p-6 overflow-y-auto h-full scrollbar-thin">
          <div className="max-w-xl mx-auto flex flex-col gap-6 pb-20">
            <div>
              <h2 className="text-xl font-bold">Question Blueprint</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Design the sequential fields. Respondents will complete these one by one.
              </p>
            </div>

            {/* List of current questions */}
            {fields.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                <HelpCircle className="w-10 h-10 text-zinc-600" />
                <div>
                  <h4 className="font-bold text-sm">Your Form is Empty</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Click any type in the Toolbox below to add your first question field.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {fields.map((field, idx) => {
                  const isSelected = selectedFieldIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedFieldIdx(idx)}
                      className={`border rounded-2xl p-5 flex flex-col gap-3 transition-all relative group cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900 border-purple-500/50 shadow-lg shadow-purple-500/5"
                          : "bg-zinc-900/30 border-white/5 hover:border-white/15"
                      }`}
                    >
                      {/* Left color bar based on selection */}
                      {isSelected && (
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-pink-500 rounded-l-2xl" />
                      )}

                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-zinc-500 font-bold bg-zinc-950 border border-white/5 w-6 h-6 rounded-lg flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 border rounded-md flex items-center gap-1.5 bg-zinc-950/80 border-white/10 text-zinc-400">
                            {getFieldIcon(field.type)}
                            {field.type.replace("_", " ")}
                          </span>
                        </div>

                        {/* Order controls & Delete */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveQuestion(idx, "up");
                            }}
                            disabled={idx === 0}
                            className="p-1 hover:bg-white/5 rounded text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveQuestion(idx, "down");
                            }}
                            disabled={idx === fields.length - 1}
                            className="p-1 hover:bg-white/5 rounded text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuestion(idx);
                            }}
                            className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded text-zinc-500 ml-1.5"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Display or Edit Input */}
                      {isSelected ? (
                        <div className="flex flex-col gap-3.5 mt-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                              Question Prompt / Label
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateQuestionField(idx, "label", e.target.value)}
                              className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 w-full"
                              placeholder="e.g. What is your full name?"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                              Help Description (Optional)
                            </label>
                            <input
                              type="text"
                              value={field.description || ""}
                              onChange={(e) => updateQuestionField(idx, "description", e.target.value)}
                              className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 w-full"
                              placeholder="e.g. Please enter first and last name"
                            />
                          </div>

                          {field.type !== "rating" && field.type !== "checkbox" && field.type !== "date" && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                Input Placeholder
                              </label>
                              <input
                                type="text"
                                value={field.placeholder || ""}
                                onChange={(e) => updateQuestionField(idx, "placeholder", e.target.value)}
                                className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 w-full"
                                placeholder="e.g. John Doe"
                              />
                            </div>
                          )}

                          {/* Options editor for choice based questions */}
                          {(field.type === "single_select" || field.type === "multi_select") && (
                            <div className="flex flex-col gap-2 bg-zinc-950 p-4 rounded-xl border border-white/5">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                                Configure Choices Options
                              </label>
                              
                              <div className="flex flex-col gap-2">
                                {field.options?.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => updateOptionInQuestion(idx, optIdx, e.target.value)}
                                      className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 w-full"
                                      placeholder={`Option ${optIdx + 1}`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeOptionFromQuestion(idx, optIdx)}
                                      disabled={field.options!.length <= 1}
                                      className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg disabled:opacity-30"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => addOptionToQuestion(idx)}
                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 text-left w-max cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                Add option Choice
                              </button>
                            </div>
                          )}

                          {/* Toggle constraints */}
                          <div className="flex justify-between items-center bg-zinc-950/60 p-3 rounded-xl">
                            <span className="text-[10px] font-bold text-zinc-400">
                              Respondent Answer Required
                            </span>
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateQuestionField(idx, "required", e.target.checked)}
                              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <h4 className="font-bold text-sm text-zinc-100 line-clamp-1">{field.label}</h4>
                          {field.description && (
                            <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{field.description}</p>
                          )}
                          {field.placeholder && (
                            <div className="bg-zinc-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-zinc-600 font-mono mt-2 w-max">
                              Placeholder: {field.placeholder}
                            </div>
                          )}
                          {(field.type === "single_select" || field.type === "multi_select") && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {field.options?.map((opt, oIdx) => (
                                <span
                                  key={oIdx}
                                  className="text-[9px] font-semibold bg-zinc-950 border border-white/10 rounded-full px-2 py-0.5 text-zinc-400"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Toolbox Section */}
            <div className="border-t border-white/5 pt-6 flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-pink-400" />
                Question Field Toolbox
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => addQuestion("short_text")}
                  className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all hover:bg-zinc-900 text-left text-xs font-bold cursor-pointer"
                >
                  <Type className="w-4 h-4 text-sky-400 shrink-0" />
                  Short Text
                </button>

                <button
                  onClick={() => addQuestion("long_text")}
                  className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all hover:bg-zinc-900 text-left text-xs font-bold cursor-pointer"
                >
                  <AlignLeft className="w-4 h-4 text-purple-400 shrink-0" />
                  Essay/Long Text
                </button>

                <button
                  onClick={() => addQuestion("email")}
                  className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all hover:bg-zinc-900 text-left text-xs font-bold cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-pink-400 shrink-0" />
                  Email Field
                </button>

                <button
                  onClick={() => addQuestion("number")}
                  className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all hover:bg-zinc-900 text-left text-xs font-bold cursor-pointer"
                >
                  <Binary className="w-4 h-4 text-emerald-400 shrink-0" />
                  Number Field
                </button>

                <button
                  onClick={() => addQuestion("single_select")}
                  className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all hover:bg-zinc-900 text-left text-xs font-bold cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                  Single Choice
                </button>

                <button
                  onClick={() => addQuestion("multi_select")}
                  className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all hover:bg-zinc-900 text-left text-xs font-bold cursor-pointer"
                >
                  <ListPlus className="w-4 h-4 text-indigo-400 shrink-0" />
                  Multi Choice
                </button>

                <button
                  onClick={() => addQuestion("checkbox")}
                  className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all hover:bg-zinc-900 text-left text-xs font-bold cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
                  Yes/No Checkbox
                </button>

                <button
                  onClick={() => addQuestion("rating")}
                  className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all hover:bg-zinc-900 text-left text-xs font-bold cursor-pointer"
                >
                  <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                  Star Rating (1-5)
                </button>

                <button
                  onClick={() => addQuestion("date")}
                  className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all hover:bg-zinc-900 text-left text-xs font-bold cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                  Date Selector
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
