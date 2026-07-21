import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardList, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Bookmark
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "not_started" | "in_progress" | "submitted" | "graded";
  priority: "low" | "medium" | "high";
  notes?: string;
}

export default function StudyAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [notes, setNotes] = useState("");

  // AI Assistant Homework Helper states
  const [hwPrompt, setHwPrompt] = useState("");
  const [hwResult, setHwResult] = useState("Enter your assignment guidelines or essay prompt above, and Cozy AI will generate a detailed step-by-step blueprint, structured drafts, and references!");
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("flowbase_assignments");
    if (saved) {
      try {
        setAssignments(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      const sample = [
        {
          id: "hw-1",
          title: "Differential Equations Problem Set",
          subject: "Mathematics",
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          status: "in_progress" as const,
          priority: "high" as const,
          notes: "Solve problems 1-12 from Chapter 4."
        },
        {
          id: "hw-2",
          title: "Biochemistry Essay on Protein Folding",
          subject: "Chemistry",
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          status: "not_started" as const,
          priority: "medium" as const,
          notes: "Focus on chaperone proteins and misfolding diseases."
        }
      ];
      setAssignments(sample);
      localStorage.setItem("flowbase_assignments", JSON.stringify(sample));
    }
  }, []);

  const saveAssignments = (updated: Assignment[]) => {
    setAssignments(updated);
    localStorage.setItem("flowbase_assignments", JSON.stringify(updated));
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    const newHw: Assignment = {
      id: `hw-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: "not_started",
      priority: priority,
      notes: notes.trim()
    };

    const updated = [newHw, ...assignments];
    saveAssignments(updated);

    // Reset Form
    setTitle("");
    setSubject("");
    setDueDate("");
    setPriority("medium");
    setNotes("");
  };

  const handleDeleteAssignment = (id: string) => {
    const updated = assignments.filter(a => a.id !== id);
    saveAssignments(updated);
  };

  const handleUpdateStatus = (id: string, newStatus: Assignment["status"]) => {
    const updated = assignments.map(a => a.id === id ? { ...a, status: newStatus } : a);
    saveAssignments(updated);
  };

  // OpenAI Homework Outline Generator
  const handleSolveHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwPrompt.trim()) return;

    setIsSolving(true);
    setError("");

    const clientApiKey = localStorage.getItem("openai_api_key") || "";
    const systemPrompt = `You are a supportive academic tutor and homework helper.
Your job is to read an assignment prompt, essay topic, or problem description, and generate a highly organized, step-by-step solving outline.
Make your response detailed, beautiful, and structured with clear Markdown headers, bold highlights, bullet steps, and a section of recommended research references.
Provide helpful, high-quality, actionable directions without writing the actual essay/solution for the student, encouraging true learning.
You can include Roman-Urdu tips if appropriate to explain tough steps. Limit response to around 300 words.`;

    try {
      let responseText = "";

      // Try Backend proxy first
      try {
        const response = await fetch("/api/notes/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Deconstruct and generate a homework blueprint for this assignment: "${hwPrompt}"`,
            context: systemPrompt,
            apiKey: clientApiKey || undefined
          })
        });

        if (response.ok) {
          const data = await response.json();
          responseText = data.response;
        }
      } catch (err) {
        console.warn("Backend failed, trying direct OpenAI api", err);
      }

      // Direct fallback
      if (!responseText) {
        const activeKey = clientApiKey.trim() || (import.meta as any).env?.VITE_OPENAI_API_KEY?.trim() || "";
        if (!activeKey) {
          throw new Error("No OpenAI API Key found. Please configure your OpenAI API Key in Settings.");
        }

        const directResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Break down assignment: ${hwPrompt}` }
            ],
            temperature: 0.7
          })
        });

        if (!directResponse.ok) {
          throw new Error("OpenAI API returned an error.");
        }

        const dData = await directResponse.json();
        responseText = dData.choices?.[0]?.message?.content || "No advice returned.";
      }

      setHwResult(responseText);
    } catch (err: any) {
      console.error(err);
      setError("Failed to consult Cozy AI. Please check your OpenAI API key settings.");
    } finally {
      setIsSolving(false);
    }
  };

  const getPriorityColor = (p: string) => {
    if (p === "high") return "bg-red-50 text-red-700 border-red-100";
    if (p === "medium") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-stone-50 text-stone-600 border-stone-100";
  };

  return (
    <div id="assignments-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div id="assignments-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2EC] text-[#c67f43] flex items-center justify-center shadow-xs">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl text-[#221C18] tracking-tight">Assignment & Project Tracker</h1>
            <p className="text-xs text-stone-500 font-medium">Keep a clear record of homework deadlines, status updates, and homework helper tools.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Creator Form & AI Helper */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Quick Create Card */}
          <div id="add-assignment-card" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#c67f43]" /> New Assignment
            </h2>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase">Assignment Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Lab Report 2: Enzyme kinetics" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">Subject / Course *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Biology" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase">Priority</label>
                <div className="flex gap-2">
                  {["low", "medium", "high"].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p as any)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                        priority === p 
                          ? p === "high" 
                            ? "bg-red-500 border-red-500 text-white" 
                            : p === "medium" 
                              ? "bg-[#c67f43] border-[#c67f43] text-white" 
                              : "bg-stone-700 border-stone-700 text-white"
                          : "bg-stone-50 border-[#EFECE6] text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase">Description / Rubric Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Insert sub-goals, specifications, or word-counts..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl p-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Assignment
              </button>
            </form>
          </div>

          {/* AI Homework Solver Outline Widget */}
          <div id="ai-homework-solver" className="bg-[#FAF2EC]/40 border border-[#FAF2EC] rounded-2xl p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-[#c67f43] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#c67f43]" /> AI Homework Outline Helper
            </h2>
            
            <form onSubmit={handleSolveHomework} className="space-y-3">
              <div className="space-y-1">
                <textarea 
                  rows={3}
                  required
                  placeholder="Paste your assignment prompt or essay rubric guidelines..."
                  value={hwPrompt}
                  onChange={(e) => setHwPrompt(e.target.value)}
                  className="w-full bg-white border border-[#EFECE6] rounded-xl p-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] transition-all font-medium resize-none"
                />
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSolving}
                className="w-full bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 animate-pulse"
              >
                {isSolving ? "Deconstructing assignment..." : "Deconstruct & Solve with AI"}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Assignments Checklist Grid & Active AI Result */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Assignments checklist table */}
          <div id="assignments-manager-card" className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-[#221C18] flex items-center gap-2">
              <ClipboardList className="w-4.5 h-4.5 text-[#c67f43]" /> Assignments Checklist
            </h2>

            {assignments.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <ClipboardList className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                <p className="text-xs font-semibold">No homework listed yet. Add one on the left panel!</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {assignments.map((hw) => (
                  <div key={hw.id} className="p-4 bg-stone-50/50 hover:bg-stone-50 border border-[#EFECE6] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                    
                    <div className="space-y-1.5 overflow-hidden">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold bg-[#FAF2EC] text-[#c67f43] px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {hw.subject}
                        </span>
                        <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-md uppercase tracking-wider ${getPriorityColor(hw.priority)}`}>
                          {hw.priority} Priority
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-stone-800 leading-snug">{hw.title}</h3>
                      {hw.notes && (
                        <p className="text-[11px] text-stone-500 leading-normal">{hw.notes}</p>
                      )}
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-bold pt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due: {hw.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Status select drop */}
                      <select 
                        value={hw.status}
                        onChange={(e) => handleUpdateStatus(hw.id, e.target.value as any)}
                        className="bg-white border border-[#EFECE6] rounded-xl px-2.5 py-1.5 text-xs text-stone-700 font-semibold focus:outline-none focus:border-[#c67f43]"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="submitted">Submitted</option>
                        <option value="graded">Graded</option>
                      </select>

                      <button 
                        onClick={() => handleDeleteAssignment(hw.id)}
                        className="p-2 border border-[#EFECE6] hover:border-red-100 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Homework Solver Output Canvas */}
          <div id="ai-blueprint-stage" className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg text-[#c67f43] flex items-center justify-center shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">AI Homework Helper Result</h3>
                <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">Custom outline solution map</p>
              </div>
            </div>

            <div className="bg-stone-50/50 border border-stone-100 rounded-2xl p-4 sm:p-5 min-h-36 max-h-[300px] overflow-y-auto">
              <div className="text-xs text-stone-700 font-medium leading-relaxed whitespace-pre-wrap text-left">
                {hwResult}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
