import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HelpCircle, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle, 
  BookOpen, 
  AlertCircle,
  Lightbulb,
  MessageSquare,
  Search,
  Check,
  ChevronRight
} from "lucide-react";

interface Doubt {
  id: string;
  title: string;
  subject: string;
  question: string;
  status: "pending" | "solved";
  solution?: string;
  createdAt: string;
}

export default function CollaborateDoubtBoard() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [selectedDoubtId, setSelectedDoubtId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // New Doubt Form States
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");

  // AI Assistant Solver States
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("flowbase_doubts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDoubts(parsed);
        if (parsed.length > 0) {
          setSelectedDoubtId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultDoubts: Doubt[] = [
        {
          id: "doubt-1",
          title: "How does RNA splicing work?",
          subject: "Biochemistry",
          question: "Can someone explain exons, introns, and how spliceosomes remove introns? Also why alternative splicing is important?",
          status: "solved",
          solution: `**Here is a detailed explanation of RNA splicing:**

RNA splicing is a crucial post-transcriptional modification where **introns** (non-coding regions) are removed and **exons** (coding regions) are joined together.

### 1. Step-by-Step Mechanism
* **Transcription:** The gene is transcribed into pre-mRNA containing both introns and exons.
* **Spliceosome Assembly:** A massive complex called the **spliceosome** (made of snRNAs and proteins) identifies boundary markers at the 5' and 3' ends of introns.
* **Intron Removal:** The spliceosome loops the intron into a "lariat" shape, cuts it out, and ligates the exons securely together.

### 2. What is Alternative Splicing?
Think of exons like separate blocks of Lego. alternative splicing lets the cell pick and choose which blocks to join!
* For example, a single pre-mRNA can produce Protein Alpha (Exons 1-2-3) or Protein Beta (Exons 1-3-4).
* **Significance:** This is why humans only have ~20,000 genes but can produce over 100,000 distinct protein structures!

**Sabar aur focus se har concept clear ho sakta hai. Keep reading!**`,
          createdAt: "July 18, 2026"
        },
        {
          id: "doubt-2",
          title: "Integration by Parts formula trick",
          subject: "Mathematics",
          question: "I always get confused when choosing 'u' and 'dv' in integration by parts. Is there any quick rule?",
          status: "pending",
          createdAt: "July 20, 2026"
        }
      ];
      setDoubts(defaultDoubts);
      setSelectedDoubtId(defaultDoubts[0].id);
      localStorage.setItem("flowbase_doubts", JSON.stringify(defaultDoubts));
    }
  }, []);

  const saveDoubts = (updated: Doubt[]) => {
    setDoubts(updated);
    localStorage.setItem("flowbase_doubts", JSON.stringify(updated));
  };

  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) return;

    const newDoubt: Doubt = {
      id: `doubt-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim() || "General",
      question: question.trim(),
      status: "pending",
      createdAt: new Date().toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })
    };

    const updated = [newDoubt, ...doubts];
    saveDoubts(updated);
    setSelectedDoubtId(newDoubt.id);

    // Reset Form
    setTitle("");
    setSubject("");
    setQuestion("");
  };

  const handleDeleteDoubt = (id: string) => {
    const updated = doubts.filter(d => d.id !== id);
    saveDoubts(updated);
    if (selectedDoubtId === id) {
      setSelectedDoubtId(updated.length > 0 ? updated[0].id : "");
    }
  };

  // Solve the active doubt using OpenAI API key
  const handleSolveWithAi = async () => {
    if (!selectedDoubtId) return;
    const activeDoubt = doubts.find(d => d.id === selectedDoubtId);
    if (!activeDoubt) return;

    setIsSolving(true);
    setError("");

    const clientApiKey = localStorage.getItem("openai_api_key") || "";
    const systemPrompt = `You are Cozy AI Tutor, a friendly, hyper-intelligent academic assistant.
The student has raised a study doubt/question:
Title: "${activeDoubt.title}"
Subject: "${activeDoubt.subject}"
Question: "${activeDoubt.question}"

Write a detailed, beautifully structured solution.
Include:
1. A brief "Concept Summary" (in friendly, easy-to-understand terms).
2. "Step-by-Step Explanation" with clear headers.
3. A real-world "Analogy" to make the hard concepts super simple to visualize.
4. "Quick Practice Quiz" (1 multiple choice question with explanation).
Write with a cozy, helpful tone, and optionally use warm Roman-Urdu / Hindi blocks if appropriate. Limit response to 300 words.`;

    try {
      let responseText = "";

      // Try Backend proxy first
      try {
        const response = await fetch("/api/notes/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Resolve this academic doubt:\nTitle: ${activeDoubt.title}\nSubject: ${activeDoubt.subject}\nQuestion: ${activeDoubt.question}`,
            context: systemPrompt,
            apiKey: clientApiKey || undefined
          })
        });

        if (response.ok) {
          const data = await response.json();
          responseText = data.response;
        }
      } catch (err) {
        console.warn("Backend failed, trying direct OpenAI", err);
      }

      // Direct fallback
      if (!responseText) {
        const activeKey = clientApiKey.trim() || (import.meta as any).env?.VITE_OPENAI_API_KEY?.trim() || "";
        if (!activeKey) {
          throw new Error("No OpenAI API Key found. Please configure your OpenAI API Key in settings.");
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
              { role: "user", content: `Please solve this question: ${activeDoubt.question}` }
            ],
            temperature: 0.7
          })
        });

        if (!directResponse.ok) throw new Error("OpenAI error");
        const dData = await directResponse.json();
        responseText = dData.choices?.[0]?.message?.content || "No resolution advice generated.";
      }

      const updated = doubts.map(d => {
        if (d.id === selectedDoubtId) {
          return {
            ...d,
            status: "solved" as const,
            solution: responseText
          };
        }
        return d;
      });

      saveDoubts(updated);

    } catch (err: any) {
      setError("Unable to resolve doubt with AI. Ensure your OpenAI key is configured correctly.");
    } finally {
      setIsSolving(false);
    }
  };

  const filteredDoubts = doubts.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDoubt = doubts.find(d => d.id === selectedDoubtId);

  return (
    <div id="doubt-board-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div id="doubt-board-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2EC] text-[#c67f43] flex items-center justify-center shadow-xs">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl text-[#221C18] tracking-tight">Interactive Doubt Board</h1>
            <p className="text-xs text-stone-500 font-medium">Post tricky assignment doubts, tag subject tags, and use AI Tutor to generate analogies and step-by-step solutions.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Doubts List & Creator */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Post a Doubt Form */}
          <div id="post-doubt-card" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#c67f43]" /> Post a New Doubt
            </h2>

            <form onSubmit={handleCreateDoubt} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Doubt Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Mitosis vs Meiosis key differences" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Subject Tag *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Biology, Math, Calculus, History" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Your Question / Details *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Paste formula details, describe the problem, or specify where you are stuck..." 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl p-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Log Doubt
              </button>
            </form>
          </div>

          {/* Doubt Explorer List */}
          <div id="doubts-list-card" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Doubt Logs</h2>
              <span className="bg-[#FAF2EC] text-[#c67f43] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {filteredDoubts.length} Doubts
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search doubts or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-9 pr-4 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] font-medium"
              />
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {filteredDoubts.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">No doubts found matching search.</p>
              ) : (
                filteredDoubts.map((d) => {
                  const isSelected = d.id === selectedDoubtId;
                  const isSolved = d.status === "solved";

                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDoubtId(d.id)}
                      className={`p-3.5 border rounded-xl cursor-pointer group transition-all flex items-start gap-3 justify-between ${
                        isSelected 
                          ? "border-[#c67f43] bg-[#FAF2EC]/50 shadow-xs" 
                          : "border-[#EFECE6] hover:bg-stone-50"
                      }`}
                    >
                      <div className="overflow-hidden space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-extrabold bg-[#FAF2EC] text-[#c67f43] px-2 py-0.5 rounded-md uppercase">
                            {d.subject}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                            isSolved ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-stone-50 text-stone-500 border border-stone-100"
                          }`}>
                            {isSolved ? "Solved" : "Pending"}
                          </span>
                        </div>
                        
                        <p className="text-xs font-bold text-stone-800 truncate">{d.title}</p>
                        <p className="text-[10px] text-stone-400 font-semibold">{d.createdAt}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDoubt(d.id);
                          }}
                          className="p-1 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right: Active Doubt Solution Canvas */}
        <div className="lg:col-span-7">
          {selectedDoubt ? (
            <div className="space-y-6 text-left">
              
              {/* Question Showcase Card */}
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold bg-[#FAF2EC] text-[#c67f43] px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {selectedDoubt.subject} Question
                    </span>
                    <h2 className="text-base font-bold text-stone-800 mt-2">{selectedDoubt.title}</h2>
                  </div>

                  {selectedDoubt.status === "pending" && (
                    <button 
                      onClick={handleSolveWithAi}
                      disabled={isSolving}
                      className="bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60 shrink-0"
                    >
                      {isSolving ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Solving...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-white animate-pulse" />
                          <span>Solve with AI</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                  <p className="text-xs text-stone-600 font-medium leading-relaxed italic">
                    "{selectedDoubt.question}"
                  </p>
                </div>
              </div>

              {/* Solution Canvas */}
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg text-[#c67f43] flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">Solution / Study Guide</h3>
                    <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">Verified solutions & concepts</p>
                  </div>
                </div>

                {selectedDoubt.status === "solved" && selectedDoubt.solution ? (
                  <div className="space-y-4">
                    <div className="bg-stone-50/40 border border-stone-100 rounded-2xl p-4 sm:p-5 max-h-[350px] overflow-y-auto">
                      <div className="text-xs text-stone-700 font-medium leading-relaxed whitespace-pre-wrap text-left">
                        {selectedDoubt.solution}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center flex flex-col items-center justify-center space-y-3 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                    <Sparkles className="w-10 h-10 text-[#c67f43] animate-pulse" />
                    <p className="text-xs font-bold text-stone-600">This doubt is pending resolution</p>
                    <p className="text-[11px] text-stone-400 max-w-sm leading-relaxed">
                      Click the **Solve with AI** button at the top of the question to invoke Cozy AI and generate a fully structured conceptual solution.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#EFECE6] rounded-2xl p-12 shadow-2xs text-center flex flex-col items-center justify-center space-y-3 h-[450px]">
              <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-[#c67f43]">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-700">No active doubt selected</h3>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Add your doubt on the left panel or choose an existing record to read explanations, view analogical examples, and run active recall practice quizzes.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
