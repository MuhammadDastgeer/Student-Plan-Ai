import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { callOpenAITemplateGenerate } from "../lib/openaiFallback";
import { 
  Sparkles, 
  Wrench, 
  Plus, 
  Trash2, 
  Check, 
  Layout, 
  Play, 
  Zap,
  Eye,
  Edit3,
  Lock,
  RefreshCw,
  X,
  ChevronRight,
  ClipboardList,
  Save,
  Clock,
  History,
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  FileText,
  ArrowLeft
} from "lucide-react";

interface TemplateField {
  id: string;
  label: string;
  type: "text" | "number" | "checkbox" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
}

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

interface TemplateLog {
  id: string;
  date: string;
  values: Record<string, any>;
}

interface AppletTemplate {
  id: string;
  name: string;
  desc: string;
  prompt: string;
  pinned: boolean;
  status: "Active" | "Draft";
  createdAt: string;
  fields: TemplateField[];
  checklist: ChecklistItem[];
  aiAdvice: string;
  logs?: TemplateLog[];
}

export default function WorkspaceTemplateBuilder() {
  // 1. Start with completely empty templates by default ("pale say koi b ni ho")
  const [templates, setTemplates] = useState<AppletTemplate[]>(() => {
    const saved = localStorage.getItem("workspace_templates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse workspace_templates", e);
      }
    }
    return []; // Completely empty on first load
  });

  // OpenAI API Key state (saved in localStorage for convenience)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem("openai_api_key") || "";
  });

  // Creator Form States
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [buildSuccess, setBuildSuccess] = useState(false);

  // Active view states
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isFullView, setIsFullView] = useState(false);

  // Dynamic input states for the active logging form
  const [logFormValues, setLogFormValues] = useState<Record<string, any>>({});

  // Edit template form states
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrompt, setEditPrompt] = useState("");

  // Sync templates to localStorage
  useEffect(() => {
    localStorage.setItem("workspace_templates", JSON.stringify(templates));
  }, [templates]);

  // Sync API key to localStorage
  useEffect(() => {
    if (apiKey.trim()) {
      localStorage.setItem("openai_api_key", apiKey.trim());
    } else {
      localStorage.removeItem("openai_api_key");
    }
  }, [apiKey]);

  // Handle template creation using OpenAI Endpoint
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrompt.trim()) return;

    setErrorMsg("");
    setIsGenerating(true);
    setBuildSuccess(false);

    const activeApiKey = apiKey.trim() || localStorage.getItem("openai_api_key")?.trim() || "";

    try {
      let generatedData: any = null;
      try {
        const response = await fetch("/api/templates/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newName.trim(),
            description: newDesc.trim() || "AI built custom workspace module.",
            prompt: newPrompt.trim(),
            apiKey: activeApiKey || undefined,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          let serverError = "Failed to generate template.";
          try {
            const parsed = JSON.parse(errText);
            serverError = parsed.error || serverError;
          } catch (e) {}
          throw new Error(serverError);
        }

        const data = await response.json();
        generatedData = data.template;
      } catch (err: any) {
        console.warn("Backend API failed, trying direct OpenAI fallback:", err);
        const directRes = await callOpenAITemplateGenerate({
          name: newName.trim(),
          description: newDesc.trim() || "AI built custom workspace module.",
          prompt: newPrompt.trim(),
          apiKey: apiKey.trim() || undefined
        });
        generatedData = directRes.template;
      }

      const newTmpl: AppletTemplate = {
        id: "tmpl-" + Math.random().toString(36).substr(2, 9),
        name: newName.trim(),
        desc: newDesc.trim() || "AI built custom workspace module.",
        prompt: newPrompt.trim(),
        pinned: false,
        status: "Active",
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        fields: generatedData.fields || [],
        checklist: generatedData.checklist || [],
        aiAdvice: generatedData.aiAdvice || "Use this template daily to track your workflow progress and establish productive habits.",
        logs: [],
      };

      setTemplates((prev) => [newTmpl, ...prev]);
      setNewName("");
      setNewDesc("");
      setNewPrompt("");
      setBuildSuccess(true);
      setTimeout(() => setBuildSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while calling the OpenAI service.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete a template
  const deleteTemplate = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this template?");
    if (!confirmed) return;

    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedTemplateId === id) setSelectedTemplateId(null);
    if (editingTemplateId === id) setEditingTemplateId(null);
  };

  // Toggle checklist item complete state
  const handleToggleChecklist = (templateId: string, itemId: string) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === templateId) {
          const updatedChecklist = t.checklist.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          );
          return { ...t, checklist: updatedChecklist };
        }
        return t;
      })
    );
  };

  // Submit a log entry in a template
  const handleAddLogEntry = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return;

    const entryValues: Record<string, any> = {};
    tmpl.fields.forEach((f) => {
      entryValues[f.id] = logFormValues[f.id] !== undefined ? logFormValues[f.id] : "";
    });

    const newLog: TemplateLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      values: entryValues,
    };

    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === templateId) {
          return {
            ...t,
            logs: [newLog, ...(t.logs || [])],
          };
        }
        return t;
      })
    );

    // Reset log input states
    setLogFormValues({});
  };

  // Delete a specific log entry
  const handleDeleteLogEntry = (templateId: string, logId: string) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === templateId) {
          return {
            ...t,
            logs: (t.logs || []).filter((l) => l.id !== logId),
          };
        }
        return t;
      })
    );
  };

  // Edit template basic details and triggers
  const handleStartEdit = (tmpl: AppletTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemplateId(tmpl.id);
    setEditName(tmpl.name);
    setEditDesc(tmpl.desc);
    setEditPrompt(tmpl.prompt);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setTemplates((prev) =>
      prev.map((t) =>
        t.id === editingTemplateId
          ? {
              ...t,
              name: editName.trim(),
              desc: editDesc.trim(),
              prompt: editPrompt.trim(),
            }
          : t
      )
    );

    setEditingTemplateId(null);
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // If we are in full screen view mode, render a custom high-end standalone cockpit!
  if (isFullView && selectedTemplate) {
    const isCurrentlyEditingThis = editingTemplateId === selectedTemplate.id;

    return (
      <div id="full-screen-app" className="p-6 md:p-10 bg-[#FAF8F5] min-h-[calc(100vh-60px)] text-left flex flex-col space-y-8 animate-fade-in">
        
        {/* Navigation & Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FAF2EC] pb-6">
          <div className="space-y-2">
            <button
              onClick={() => {
                setIsFullView(false);
                setEditingTemplateId(null);
              }}
              className="group flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-[#E05A47] transition-colors bg-white px-3.5 py-2 rounded-xl border border-[#EFECE6] shadow-3xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Template Builder</span>
            </button>
            
            <div className="flex items-center gap-3 pt-2">
              <div className="p-3 bg-[#FAF2EC] text-[#c67f43] rounded-2xl border border-[#F4E3D4] shadow-3xs">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-3xl font-extrabold text-[#221C18]">{selectedTemplate.name}</h1>
                  <span className="text-[10px] bg-[#FAF2EC] text-[#c67f43] border border-[#F4E3D4] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Micro App Live
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-semibold mt-1">{selectedTemplate.desc}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleStartEdit(selectedTemplate, e)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#EFECE6] text-xs font-bold text-stone-700 rounded-xl hover:bg-stone-50 cursor-pointer shadow-3xs transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              <span>Configure Layout</span>
            </button>
            <button
              onClick={(e) => {
                const confirmed = window.confirm("Are you sure you want to delete this app?");
                if (confirmed) {
                  setTemplates((prev) => prev.filter((t) => t.id !== selectedTemplate.id));
                  setSelectedTemplateId(null);
                  setIsFullView(false);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 border border-red-100 text-xs font-bold text-red-700 rounded-xl hover:bg-red-100 cursor-pointer shadow-3xs transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete App</span>
            </button>
          </div>
        </div>

        {/* Overlay Configuration Edit Modal when activated from full screen */}
        <AnimatePresence>
          {isCurrentlyEditingThis && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#FFFDFB] border-2 border-[#F4E3D4] rounded-2xl p-6 shadow-md space-y-4 max-w-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#FAF2EC] pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4.5 h-4.5 text-[#c67f43]" />
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Configure Micro App Structure</h3>
                </div>
                <button
                  onClick={() => setEditingTemplateId(null)}
                  className="p-1 hover:bg-stone-100 rounded text-stone-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">App Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Description</label>
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full bg-white border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Prompt / AI Guidelines Reference</label>
                  <textarea
                    rows={3}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="w-full bg-white border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#FAF2EC]">
                  <button
                    type="button"
                    onClick={() => setEditingTemplateId(null)}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold px-4 py-2 rounded-xl text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold px-5 py-2 rounded-xl text-center shadow-3xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cozy Advice Ribbon */}
        {selectedTemplate.aiAdvice && (
          <div className="bg-[#FAF2EC]/50 border border-[#F4E3D4] p-5 rounded-2xl flex items-start gap-3.5 shadow-3xs">
            <div className="p-2 bg-[#FAF2EC] text-[#c67f43] rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-extrabold text-[#c67f43] uppercase tracking-wider mb-0.5">AI Guidelines & Workflow Advice</h4>
              <p className="text-xs text-[#221C18] leading-relaxed font-semibold">
                {selectedTemplate.aiAdvice}
              </p>
            </div>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Operational Inputs Console */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Daily Habit/Prep Checklist */}
            {selectedTemplate.checklist && selectedTemplate.checklist.length > 0 && (
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#FAF2EC] pb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4.5 h-4.5 text-[#c67f43]" />
                    <h3 className="font-serif text-base font-bold text-[#221C18]">Daily Prep Checklist</h3>
                  </div>
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-bold">
                    {selectedTemplate.checklist.filter(c => c.completed).length} / {selectedTemplate.checklist.length} Done
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedTemplate.checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF8F5]/40 hover:bg-[#FAF2EC]/20 border border-[#EFECE6]/40 cursor-pointer select-none transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(selectedTemplate.id, item.id)}
                        className="rounded text-[#E05A47] focus:ring-[#E05A47] border-stone-300 w-4.5 h-4.5 mt-0.5"
                      />
                      <span className={`text-xs font-semibold leading-relaxed ${item.completed ? "line-through text-stone-400" : "text-stone-800"}`}>
                        {item.task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Log Event Inputs Form */}
            {selectedTemplate.fields && selectedTemplate.fields.length > 0 && (
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center gap-2 border-b border-[#FAF2EC] pb-3">
                  <FileText className="w-4.5 h-4.5 text-[#c67f43]" />
                  <h3 className="font-serif text-base font-bold text-[#221C18]">Log New Event</h3>
                </div>

                <div className="space-y-4">
                  {selectedTemplate.fields.map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <label className="text-xs font-bold text-[#221C18] tracking-wide block">{f.label}</label>
                      {f.type === "textarea" ? (
                        <textarea
                          rows={3}
                          placeholder={f.placeholder}
                          value={logFormValues[f.id] || ""}
                          onChange={(e) => setLogFormValues({ ...logFormValues, [f.id]: e.target.value })}
                          className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl p-3 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700 transition-colors"
                        />
                      ) : f.type === "select" ? (
                        <select
                          value={logFormValues[f.id] || ""}
                          onChange={(e) => setLogFormValues({ ...logFormValues, [f.id]: e.target.value })}
                          className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl p-3 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700 transition-colors"
                        >
                          <option value="">Select option...</option>
                          {f.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : f.type === "checkbox" ? (
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#221C18] bg-stone-50 p-3 rounded-xl border border-[#EFECE6]/60">
                          <input
                            type="checkbox"
                            checked={logFormValues[f.id] || false}
                            onChange={(e) => setLogFormValues({ ...logFormValues, [f.id]: e.target.checked })}
                            className="rounded text-[#E05A47] border-stone-300 focus:ring-[#E05A47] w-4 h-4"
                          />
                          <span>Yes / Completed</span>
                        </label>
                      ) : (
                        <input
                          type={f.type === "number" ? "number" : "text"}
                          placeholder={f.placeholder}
                          value={logFormValues[f.id] || ""}
                          onChange={(e) => setLogFormValues({ ...logFormValues, [f.id]: e.target.value })}
                          className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700 transition-colors"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAddLogEntry(selectedTemplate.id)}
                  className="w-full bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold py-3.5 rounded-xl shadow-2xs cursor-pointer text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4.5 h-4.5" /> Submit Log to History
                </button>
              </div>
            )}

          </div>

          {/* Right Column: Historical Logs Database */}
          <div className="lg:col-span-7 bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FAF2EC] pb-4">
              <div className="flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-[#c67f43]" />
                <h3 className="font-serif text-base font-bold text-[#221C18]">Historical Logs Registry</h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                {selectedTemplate.logs?.length || 0} Records Stored
              </span>
            </div>

            <div className="space-y-4">
              {!selectedTemplate.logs || selectedTemplate.logs.length === 0 ? (
                <div className="py-20 text-center space-y-3 border border-dashed border-[#EFECE6] rounded-2xl bg-[#FAF8F5]/40">
                  <ClipboardList className="w-12 h-12 text-stone-200 mx-auto" />
                  <h4 className="text-xs font-bold text-stone-500">Registry is Empty</h4>
                  <p className="text-[10px] text-stone-400 max-w-[240px] mx-auto">Fill out the form on the left to record your first routine checkpoint.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                  {selectedTemplate.logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="border border-[#EFECE6] bg-[#FAF8F5]/30 rounded-xl p-4 space-y-3 relative group/log shadow-3xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#c67f43] font-bold bg-[#FAF2EC] px-2 py-0.5 rounded border border-[#F4E3D4] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {log.date}
                        </span>
                        <button
                          onClick={() => handleDeleteLogEntry(selectedTemplate.id, log.id)}
                          className="text-stone-300 hover:text-red-500 opacity-0 group-hover/log:opacity-100 transition-opacity p-1 hover:bg-stone-100 rounded"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2 pt-2.5 border-t border-[#FAF2EC]">
                        {selectedTemplate.fields.map((field) => (
                          <div key={field.id} className="text-xs">
                            <span className="text-stone-400 font-semibold block">{field.label}:</span>
                            <p className="text-stone-800 font-bold break-words mt-0.5">
                              {log.values[field.id] === true ? (
                                <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-extrabold text-[10px] border border-green-200">
                                  <Check className="w-3 h-3 text-green-600" /> Complete
                                </span>
                              ) : log.values[field.id] === false ? (
                                <span className="inline-flex items-center gap-1 text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded font-extrabold text-[10px] border border-green-200">
                                  No
                                </span>
                              ) : (
                                String(log.values[field.id] || "—")
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div id="workspace-template-builder" className="p-6 md:p-8 bg-[#FAF8F5] min-h-[calc(100vh-60px)] flex flex-col space-y-6">
      
      {/* Page Title Header */}
      <div className="text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF2EC] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FAF2EC] text-[#c67f43] rounded-xl border border-[#F4E3D4]">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#221C18]">AI Template Builder</h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">Generate, configure, and operate custom micro productivity tools tailored to your routine.</p>
          </div>
        </div>

        {/* API Key configuration in the UI itself as requested */}
        <div className="flex items-center gap-2 bg-white border border-[#EFECE6] px-3.5 py-1.5 rounded-xl shadow-3xs max-w-sm">
          <Lock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
          <input
            type="password"
            placeholder="OpenAI Key (Leave blank to use Server key)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="text-[11px] text-stone-700 bg-transparent border-none focus:outline-none w-48 font-mono"
            title="Optional. If omitted, the server's OPENAI_API_KEY env variable will be used automatically."
          />
          {apiKey ? (
            <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-md font-bold uppercase whitespace-nowrap">Loaded</span>
          ) : (
            <span className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-md font-bold uppercase whitespace-nowrap">Default</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        
        {/* LEFT PANEL: GENERATOR FORM */}
        <div className="lg:col-span-4 bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#221C18]">Generate Micro App</h3>
            <p className="text-xs text-stone-400 font-medium">Describe any tool you need, and the AI will code its checklist, fields, and workflow advice.</p>
          </div>

          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Template Name</label>
              <input
                type="text"
                required
                disabled={isGenerating}
                placeholder="e.g. Daily Gym Logger"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Short Description</label>
              <input
                type="text"
                disabled={isGenerating}
                placeholder="e.g. Log barbell weights and cardiovascular intervals."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">AI Generator Prompt</label>
              <textarea
                rows={4}
                required
                disabled={isGenerating}
                placeholder="e.g. I need a weight lifting tracker with fields for Exercise name, Sets, Reps, and Target Weight. Include a custom checklist for gym prep, warm-up stretches, and post-workout protein shakes."
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700 resize-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating || !newName.trim() || !newPrompt.trim()}
              className="bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  <span>AI is building custom app...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Template</span>
                </>
              )}
            </button>
          </form>

          {/* Alert messages */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[11px] leading-relaxed flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Generation failed</span>
                  <p className="text-red-700">{errorMsg}</p>
                </div>
              </motion.div>
            )}

            {buildSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-bold flex items-center gap-2"
              >
                <Check className="w-4.5 h-4.5 text-green-600 flex-shrink-0" />
                <span>Custom template generated and deployed!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Ideas panel */}
          <div className="pt-3 border-t border-[#FAF2EC] space-y-2">
            <div className="flex items-center gap-1.5 text-[#c67f43] text-[11px] font-bold">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Cozy Workspace App Ideas</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setNewName("Mindfulness Tracker");
                  setNewDesc("Track visual meditation logs and focus status.");
                  setNewPrompt("Mindful session logger with fields for Duration, Meditation focus topic, and overall Calm level on a scale from 1 to 10. Checklist items include: prepare dark ambient room, start sine wave breath synthesizer, note distraction loops.");
                }}
                className="text-[9px] bg-stone-50 hover:bg-[#FAF2EC] hover:text-[#c67f43] px-2 py-1 rounded-md border border-stone-100 font-semibold cursor-pointer transition-colors"
              >
                Zen Breath Logger
              </button>
              <button
                onClick={() => {
                  setNewName("Client Briefing Planner");
                  setNewDesc("Brief notes log and dynamic transcription prep.");
                  setNewPrompt("Brief compiler with fields for Client Name, Deliverable Priority level, and Next Action deadline. Checklist includes: review previous transcripts, verify sandbox keys, and outline summary presentation.");
                }}
                className="text-[9px] bg-stone-50 hover:bg-[#FAF2EC] hover:text-[#c67f43] px-2 py-1 rounded-md border border-stone-100 font-semibold cursor-pointer transition-colors"
              >
                Client Planner
              </button>
              <button
                onClick={() => {
                  setNewName("Cozy Budget Ledger");
                  setNewDesc("Track daily grocery list expenses.");
                  setNewPrompt("Budget log with fields for Item category (select options: Groceries, Subscriptions, Workspace tools, Leisure), Spent Amount (number), and Purchase Date. Checklist items include: check receipts, reconcile account sheets, update weekly report.");
                }}
                className="text-[9px] bg-stone-50 hover:bg-[#FAF2EC] hover:text-[#c67f43] px-2 py-1 rounded-md border border-stone-100 font-semibold cursor-pointer transition-colors"
              >
                Budget Tracker
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE PANEL: YOUR GENERATED TEMPLATES LIST */}
        <div className="lg:col-span-8 bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="font-serif text-[17px] font-bold text-[#221C18]">My Micro Apps ({templates.length})</h3>
            <p className="text-xs text-stone-400 font-medium">Click any template below to view, operate, and log events on its dedicated workspace page.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
            {templates.length === 0 ? (
              <div className="col-span-1 md:col-span-2 py-12 px-4 text-center space-y-2 border border-dashed border-[#EFECE6] rounded-2xl bg-[#FAF8F5]/30">
                <ClipboardList className="w-10 h-10 text-stone-200 mx-auto" />
                <p className="text-xs font-bold text-stone-500">No Templates Found</p>
                <p className="text-[10px] text-stone-400 max-w-[200px] mx-auto">Create a template above. The AI will custom-code the layout instantly!</p>
              </div>
            ) : (
              templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    setIsFullView(true);
                  }}
                  className="p-5 rounded-xl border transition-all text-left relative group cursor-pointer bg-stone-50/40 hover:bg-[#FAF2EC]/10 border-[#EFECE6] hover:border-stone-300 shadow-3xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
                      {tmpl.status}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          handleStartEdit(tmpl, e);
                          setSelectedTemplateId(tmpl.id);
                          setIsFullView(true);
                        }}
                        className="p-1 hover:bg-stone-100 rounded text-stone-500"
                        title="Edit Template Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => deleteTemplate(tmpl.id, e)}
                        className="p-1 hover:bg-red-50 rounded text-stone-400 hover:text-red-500"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <h4 className="text-xs font-bold text-[#221C18] flex items-center gap-1.5">
                      {tmpl.name}
                    </h4>
                    <p className="text-[10px] text-stone-400 font-semibold line-clamp-2 leading-relaxed">{tmpl.desc}</p>
                  </div>

                  <div className="pt-2.5 mt-3 border-t border-[#FAF8F5] flex items-center justify-between text-[9px] text-stone-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-300" /> {tmpl.createdAt}
                    </span>
                    <span
                      className="text-[#c67f43] hover:text-[#E05A47] hover:underline flex items-center gap-0.5 font-extrabold"
                    >
                      View App (Next Page) <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
