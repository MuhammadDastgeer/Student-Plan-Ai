import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Search, 
  Link2, 
  FileText, 
  Video, 
  Bookmark, 
  AlertCircle,
  Lightbulb,
  ExternalLink,
  Tag
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  category: "book" | "article" | "lecture" | "other";
  url?: string;
  author: string;
  tags: string[];
  notes?: string;
}

export default function ResourcesLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "book" | "article" | "lecture" | "other">("all");

  // New Resource Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"book" | "article" | "lecture" | "other">("book");
  const [url, setUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [notes, setNotes] = useState("");

  // AI Assistant States
  const [aiSummary, setAiSummary] = useState("Select a logged resource and click 'Summarize with AI' to generate executive abstracts, chapter outlines, and exam review notes!");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("flowbase_resources");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResources(parsed);
        if (parsed.length > 0) {
          setSelectedResourceId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultResources: Resource[] = [
        {
          id: "res-1",
          title: "Introduction to Algorithms (CLRS)",
          category: "book",
          url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/",
          author: "Thomas H. Cormen",
          tags: ["Computer Science", "Algorithms", "Data Structures"],
          notes: "Essential textbook for dynamic programming and sorting mechanisms."
        },
        {
          id: "res-2",
          title: "MIT 18.06 Linear Algebra lectures",
          category: "lecture",
          url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
          author: "Prof. Gilbert Strang",
          tags: ["Mathematics", "Linear Algebra", "MIT"],
          notes: "Focus on vector spaces, eigenvalues, and singular value decomposition."
        }
      ];
      setResources(defaultResources);
      setSelectedResourceId(defaultResources[0].id);
      localStorage.setItem("flowbase_resources", JSON.stringify(defaultResources));
    }
  }, []);

  const saveResources = (updated: Resource[]) => {
    setResources(updated);
    localStorage.setItem("flowbase_resources", JSON.stringify(updated));
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const tagsArray = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newRes: Resource = {
      id: `res-${Date.now()}`,
      title: title.trim(),
      category: category,
      url: url.trim() || undefined,
      author: author.trim(),
      tags: tagsArray,
      notes: notes.trim() || undefined
    };

    const updated = [newRes, ...resources];
    saveResources(updated);
    setSelectedResourceId(newRes.id);

    // Reset Form
    setTitle("");
    setCategory("book");
    setUrl("");
    setAuthor("");
    setTagsInput("");
    setNotes("");
  };

  const handleDeleteResource = (id: string) => {
    const updated = resources.filter(r => r.id !== id);
    saveResources(updated);
    if (selectedResourceId === id) {
      setSelectedResourceId(updated.length > 0 ? updated[0].id : "");
    }
  };

  // OpenAI Summary / Concept generator
  const handleSummarizeResource = async () => {
    if (!selectedResourceId) return;
    const activeRes = resources.find(r => r.id === selectedResourceId);
    if (!activeRes) return;

    setIsProcessing(true);
    setError("");

    const clientApiKey = localStorage.getItem("openai_api_key") || "";
    const systemPrompt = `You are Cozy AI Resource Librarian, an expert academic researcher.
The student wants an AI executive summary and a detailed study map for the following resource:
Title: "${activeRes.title}"
Category: "${activeRes.category}"
Author: "${activeRes.author}"
Tags: [${activeRes.tags.join(", ")}]
Notes/Focus area: "${activeRes.notes || "General academic overview"}"

Please produce a beautiful, highly informative output containing:
1. "Executive Abstract" - Summary of the core ideas in 2-3 sentences.
2. "Top 5 High-Yield Concepts" - Detailed bullet points describing core subtopics that frequently appear in university exams.
3. "Actionable Study Plan" - How to review this material effectively.
4. "Quick Recall Prompt" - A study question to test understanding.
Write with high-quality academic clarity while maintaining a supportive and cozy tone (optionally with Roman-Urdu hints where relevant). Limit response to 300 words.`;

    try {
      let responseText = "";

      // Try Backend proxy first
      try {
        const response = await fetch("/api/notes/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Generate study guide & summary for: "${activeRes.title}"`,
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
          throw new Error("No OpenAI API Key found. Set it in Settings -> AI settings.");
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
              { role: "user", content: `Please summarize details of: ${activeRes.title}` }
            ],
            temperature: 0.7
          })
        });

        if (!directResponse.ok) throw new Error();
        const dData = await directResponse.json();
        responseText = dData.choices?.[0]?.message?.content || "No summary returned.";
      }

      setAiSummary(responseText);

    } catch (err: any) {
      setError("AI was unable to summarize. Make sure your OpenAI key is configured.");
    } finally {
      setIsProcessing(false);
    }
  };

  // AI-generated curated reading list
  const handleGenerateReadingList = async () => {
    if (resources.length === 0) return;
    setIsProcessing(true);
    setError("");

    const clientApiKey = localStorage.getItem("openai_api_key") || "";
    const activeRes = resources.find(r => r.id === selectedResourceId) || resources[0];
    
    const systemPrompt = `You are Cozy AI Resource Librarian.
Based on the current collection of resources, specifically focusing on the theme: "${activeRes.title}" (${activeRes.tags.join(", ")}).
Recommend 3 highly acclaimed classic textbooks, research papers, or online open-source resources that would make a perfect complementary reading list.
Include titles, authors, and brief descriptions of why they are helpful. Format with nice Markdown headers. Write in a supportive, cozy tone.`;

    try {
      let responseText = "";

      // Try Backend proxy first
      try {
        const response = await fetch("/api/notes/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Generate complementary reading recommendations.`,
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

      if (!responseText) {
        const activeKey = clientApiKey.trim() || (import.meta as any).env?.VITE_OPENAI_API_KEY?.trim() || "";
        if (!activeKey) {
          throw new Error("No OpenAI Key configured.");
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
              { role: "user", content: `Please generate reading recommendations.` }
            ],
            temperature: 0.7
          })
        });

        if (!directResponse.ok) throw new Error();
        const dData = await directResponse.json();
        responseText = dData.choices?.[0]?.message?.content || "No recommendations generated.";
      }

      setAiSummary(responseText);

    } catch (err: any) {
      setError("AI was unable to generate reading list. Ensure your OpenAI key is configured.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.author.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const selectedResource = resources.find(r => r.id === selectedResourceId);

  const getCategoryIcon = (cat: string) => {
    if (cat === "book") return <BookOpen className="w-4 h-4 text-[#c67f43]" />;
    if (cat === "lecture") return <Video className="w-4 h-4 text-[#c67f43]" />;
    return <FileText className="w-4 h-4 text-[#c67f43]" />;
  };

  return (
    <div id="resource-library-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div id="resource-library-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2EC] text-[#c67f43] flex items-center justify-center shadow-xs">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl text-[#221C18] tracking-tight">Academic Resource Library</h1>
            <p className="text-xs text-stone-500 font-medium">Keep textbooks, syllabus links, and lecture playlists meticulously organized. Generate study maps and summaries with AI.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Resource Logger & List Filter */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Create Resource Card */}
          <div id="add-resource-card" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#c67f43]" /> Catalog New Resource
            </h2>

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Resource Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Campbell Biology 12th Ed." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Author / Speaker *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Campbell & Reece" 
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2.5 text-xs text-stone-700 font-semibold focus:outline-none focus:border-[#c67f43]"
                  >
                    <option value="book">Reference Book</option>
                    <option value="article">Paper / Article</option>
                    <option value="lecture">Lecture / Playlist</option>
                    <option value="other">Other Material</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Resource URL / Website Link</label>
                <input 
                  type="url" 
                  placeholder="e.g. https://mit.edu/lectures" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Tags (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Biology, Mitosis, Exam Review" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Focus / Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Insert specific study goals or context details..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl p-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Catalog Resource
              </button>
            </form>
          </div>

          {/* Filter & Catalog Sidebar */}
          <div id="catalog-explorer" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Catalog Explorer</h2>
            
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "All", value: "all" },
                { label: "Books", value: "book" },
                { label: "Articles", value: "article" },
                { label: "Lectures", value: "lecture" }
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setCategoryFilter(t.value as any)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === t.value 
                      ? "bg-[#c67f43] border-[#c67f43] text-white" 
                      : "bg-stone-50 border-[#EFECE6] text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search catalog title, authors, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-9 pr-4 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] font-medium"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {filteredResources.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">No materials matching criteria.</p>
              ) : (
                filteredResources.map((r) => {
                  const isSelected = r.id === selectedResourceId;
                  return (
                    <div 
                      key={r.id}
                      onClick={() => setSelectedResourceId(r.id)}
                      className={`p-3 border rounded-xl cursor-pointer group transition-all flex items-start gap-2 justify-between ${
                        isSelected 
                          ? "border-[#c67f43] bg-[#FAF2EC]/50 shadow-xs" 
                          : "border-[#EFECE6] hover:bg-stone-50"
                      }`}
                    >
                      <div className="overflow-hidden space-y-1">
                        <p className="text-xs font-bold text-[#221C18] truncate flex items-center gap-1.5">
                          {getCategoryIcon(r.category)}
                          <span className="truncate">{r.title}</span>
                        </p>
                        <p className="text-[10px] text-stone-400 font-semibold">{r.author}</p>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResource(r.id);
                        }}
                        className="p-1 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right: Selected Resource Detail & AI Study map */}
        <div className="lg:col-span-7 space-y-6">
          {selectedResource ? (
            <div className="space-y-6 text-left">
              
              {/* Resource Meta info */}
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold bg-[#FAF2EC] text-[#c67f43] px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {selectedResource.category} Catalog
                    </span>
                    <h2 className="text-base font-bold text-stone-800 mt-2">{selectedResource.title}</h2>
                    <p className="text-xs text-stone-500 font-semibold">Author: {selectedResource.author}</p>
                  </div>

                  {selectedResource.url && (
                    <a 
                      href={selectedResource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Go to source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {selectedResource.notes && (
                  <div className="p-3.5 bg-stone-50 border border-stone-100 rounded-xl">
                    <p className="text-[11px] text-stone-600 font-semibold">Study focus & annotations:</p>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{selectedResource.notes}</p>
                  </div>
                )}

                {/* Tags showcase */}
                {selectedResource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedResource.tags.map((t, idx) => (
                      <span key={idx} className="bg-[#FAF2EC] text-[#c67f43] border border-transparent text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase">
                        <Tag className="w-2.5 h-2.5" /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Study summarization and curriculum planner */}
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg text-[#c67f43] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">AI Study Map & Review Notes</h3>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">Custom study outlines</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleGenerateReadingList}
                      disabled={isProcessing}
                      className="text-xs font-bold border border-[#EFECE6] hover:bg-stone-50 text-stone-600 px-3 py-1.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Reading Recommendations
                    </button>
                    <button 
                      onClick={handleSummarizeResource}
                      disabled={isProcessing}
                      className="bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {isProcessing ? "Analyzing..." : "Summarize with AI"}
                    </button>
                  </div>
                </div>

                <div className="bg-stone-50/50 border border-stone-100 rounded-2xl p-4 sm:p-5 min-h-[250px] max-h-[350px] overflow-y-auto">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                      <svg className="animate-spin h-5 w-5 text-[#c67f43]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Cozy AI Librarian is compiling materials...</p>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-700 font-medium leading-relaxed whitespace-pre-wrap text-left">
                      {aiSummary}
                    </div>
                  )}
                </div>

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
                <Bookmark className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-700">No active catalog entry selected</h3>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Add your book, playlist link, or document on the left panel, and choose it to generate executive summaries, high-yield topics maps, and reading recommendations.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
