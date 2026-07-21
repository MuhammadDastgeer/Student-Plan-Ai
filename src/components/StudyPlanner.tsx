import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  Sparkles, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ChevronRight,
  ListTodo
} from "lucide-react";

interface StudyTask {
  id: string;
  day: string;
  topic: string;
  duration: string;
  completed: boolean;
}

interface StudyPlan {
  id: string;
  subject: string;
  examDate: string;
  targetScore: string;
  tasks: StudyTask[];
  aiAdvice?: string;
}

export default function StudyPlanner() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  // Load plans from local storage
  useEffect(() => {
    const saved = localStorage.getItem("flowbase_study_plans");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlans(parsed);
        if (parsed.length > 0) {
          setSelectedPlanId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save plans to local storage
  const savePlans = (newPlans: StudyPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem("flowbase_study_plans", JSON.stringify(newPlans));
  };

  // Helper to query OpenAI
  async function generatePlanWithAI(subj: string, date: string, target: string, extraNotes: string) {
    const clientApiKey = localStorage.getItem("openai_api_key") || "";
    const systemPrompt = `You are an expert academic counselor and cozy AI study coach. 
Your task is to create a detailed, highly structured study plan for a student preparing for an exam.
You must return your output ONLY as a valid JSON object. Do not include any other markdown decoration or explanation text outside the JSON.
The JSON object must have this exact format:
{
  "tasks": [
    {
      "day": "Day 1: Foundation",
      "topic": "Core concepts and definitions review",
      "duration": "45 mins"
    },
    {
      "day": "Day 2: Depth",
      "topic": "Solving sample problems and active recall session",
      "duration": "60 mins"
    }
  ],
  "aiAdvice": "An encouraging study tip of 2-3 sentences, specific to the subject, containing coaching advice and motivation."
}
Create between 5 and 7 daily milestones/tasks based on the exam context. Keep it realistic, encouraging, and highly actionable.`;

    const userPrompt = `Subject: ${subj}
Exam Date: ${date}
Target Grade/Score: ${target}
Additional details/weaknesses: ${extraNotes}`;

    // Try backend proxy first
    try {
      const response = await fetch("/api/notes/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          context: systemPrompt,
          apiKey: clientApiKey || undefined
        })
      });
      if (response.ok) {
        const data = await response.json();
        const cleaned = cleanJsonResponse(data.response);
        return JSON.parse(cleaned);
      }
    } catch (e) {
      console.warn("Backend proxy failed, trying direct OpenAI fallback", e);
    }

    // Direct OpenAI fetch
    const activeKey = clientApiKey.trim() || (import.meta as any).env?.VITE_OPENAI_API_KEY?.trim() || "";
    if (!activeKey) {
      throw new Error("No OpenAI API Key found. Please configure your OpenAI API Key in the Settings panel.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${activeKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to communicate with OpenAI API.");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content received from AI.");
    return JSON.parse(cleanJsonResponse(content));
  }

  function cleanJsonResponse(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith("```json")) {
      clean = clean.substring(7);
    }
    if (clean.endsWith("```")) {
      clean = clean.substring(0, clean.length - 3);
    }
    return clean.trim();
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setIsGenerating(true);
    setError("");

    try {
      const aiResult = await generatePlanWithAI(
        subject,
        examDate || "Flexible Date",
        targetScore || "90%+",
        notes
      );

      const generatedTasks: StudyTask[] = (aiResult.tasks || []).map((t: any, index: number) => ({
        id: `task-${Date.now()}-${index}`,
        day: t.day || `Day ${index + 1}`,
        topic: t.topic || "Review material",
        duration: t.duration || "45 mins",
        completed: false
      }));

      const newPlan: StudyPlan = {
        id: `plan-${Date.now()}`,
        subject: subject.trim(),
        examDate: examDate || "Flexible",
        targetScore: targetScore || "A / High Pass",
        tasks: generatedTasks,
        aiAdvice: aiResult.aiAdvice || "Keep studying consistently. Break down tasks and test yourself often!"
      };

      const updatedPlans = [newPlan, ...plans];
      savePlans(updatedPlans);
      setSelectedPlanId(newPlan.id);

      // Reset form fields
      setSubject("");
      setExamDate("");
      setTargetScore("");
      setNotes("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate plan. Please verify your OpenAI key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskCompletion = (planId: string, taskId: string) => {
    const updated = plans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return p;
    });
    savePlans(updated);
  };

  const handleDeletePlan = (planId: string) => {
    const updated = plans.filter(p => p.id !== planId);
    savePlans(updated);
    if (selectedPlanId === planId) {
      setSelectedPlanId(updated.length > 0 ? updated[0].id : "");
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div id="study-planner-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div id="study-planner-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2EC] text-[#c67f43] flex items-center justify-center shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl text-[#221C18] tracking-tight">AI Study Planner</h1>
            <p className="text-xs text-stone-500 font-medium">Generate customized daily study roadmaps optimized for your exams.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Generator Form & Plans list */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Create Plan Form Card */}
          <div id="create-plan-card" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs text-left">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c67f43]" /> New Study Plan
            </h2>
            
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase">Subject / Course Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Calculus II, Biochemistry" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">Exam Date</label>
                  <input 
                    type="date" 
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">Target Grade / Score</label>
                  <input 
                    type="text" 
                    placeholder="e.g. A, 95%" 
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase">Topics or Areas of Weakness</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Integration by parts, electrostatics, need quick summary" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <p className="font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Study plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Generate Plan with AI
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Plans List Sidebar */}
          <div id="plans-sidebar" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs text-left">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-3">Saved Study Plans</h2>
            {plans.length === 0 ? (
              <p className="text-xs text-stone-400 font-medium py-3">No active study plans yet. Create your first one above!</p>
            ) : (
              <div className="space-y-2">
                {plans.map((p) => {
                  const completedCount = p.tasks.filter(t => t.completed).length;
                  const totalCount = p.tasks.length;
                  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  const isSelected = p.id === selectedPlanId;

                  return (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`group p-3 border rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? "border-[#c67f43] bg-[#FAF2EC]/50" 
                          : "border-[#EFECE6] hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="overflow-hidden">
                          <h3 className="text-xs font-bold text-[#221C18] truncate">{p.subject}</h3>
                          <p className="text-[10px] text-stone-400 mt-0.5 font-semibold">Exam: {p.examDate}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(p.id);
                          }}
                          className="p-1 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center text-[9px] text-stone-500 font-bold mb-1">
                          <span>Progress</span>
                          <span>{completedCount}/{totalCount} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#c67f43] h-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Study Plan Details */}
        <div className="lg:col-span-7">
          {selectedPlan ? (
            <div id="plan-detail-card" className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs text-left space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#FAF8F5]">
                <div>
                  <span className="bg-[#FAF2EC] text-[#c67f43] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Study Roadmap
                  </span>
                  <h2 className="text-lg font-bold text-[#221C18] mt-1">{selectedPlan.subject}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-[#EFECE6] rounded-xl text-[11px] text-stone-600 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#c67f43]" />
                    <span>Exam: {selectedPlan.examDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-[#EFECE6] rounded-xl text-[11px] text-stone-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Goal: {selectedPlan.targetScore}</span>
                  </div>
                </div>
              </div>

              {/* AI Coaching Tips */}
              {selectedPlan.aiAdvice && (
                <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>AI Coaching Advice</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    {selectedPlan.aiAdvice}
                  </p>
                </div>
              )}

              {/* Milestone checklist tasks */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-stone-400" /> Daily Roadmaps
                </h3>
                
                <div className="space-y-2">
                  {selectedPlan.tasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => toggleTaskCompletion(selectedPlan.id, task.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        task.completed 
                          ? "bg-stone-50/50 border-stone-200 text-stone-400 line-through" 
                          : "bg-white border-[#EFECE6] hover:border-stone-300 hover:shadow-2xs text-[#221C18]"
                      }`}
                    >
                      <button 
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          task.completed 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "border-stone-300 bg-white"
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-grow text-left space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${task.completed ? "text-stone-400" : "text-[#c67f43]"}`}>
                            {task.day}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-stone-400 font-bold">
                            <Clock className="w-3 h-3" /> {task.duration}
                          </span>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${task.completed ? "text-stone-400" : "text-stone-700"}`}>
                          {task.topic}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#EFECE6] rounded-2xl p-12 shadow-2xs text-center flex flex-col items-center justify-center space-y-3 h-[450px]">
              <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-[#c67f43]">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-700">No active plan selected</h3>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Generate a study plan with AI on the left, or select an existing study plan to view its daily roadmap and guidelines.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
