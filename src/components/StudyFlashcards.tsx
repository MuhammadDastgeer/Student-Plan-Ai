import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { useAuth } from "../lib/authStore";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

interface FlashcardDeck {
  id: string;
  name: string;
  cards: Flashcard[];
}

export default function StudyFlashcards() {
  const { currentUser } = useAuth();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [error, setError] = useState("");

  // Card list and active slide index
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Manual Card form
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  const storageKey = currentUser ? `flowbase_user_${currentUser.email}_flashcards` : "flowbase_flashcards";

  // Load from Local Storage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDecks(parsed);
        if (parsed.length > 0) {
          setSelectedDeckId(parsed[0].id);
        } else {
          setSelectedDeckId("");
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setDecks([]);
      setSelectedDeckId("");
      localStorage.setItem(storageKey, JSON.stringify([]));
    }
  }, [storageKey]);

  const saveDecks = (updatedDecks: FlashcardDeck[]) => {
    setDecks(updatedDecks);
    localStorage.setItem(storageKey, JSON.stringify(updatedDecks));
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    const newDeck: FlashcardDeck = {
      id: `deck-${Date.now()}`,
      name: newDeckName.trim(),
      cards: []
    };
    const updated = [...decks, newDeck];
    saveDecks(updated);
    setSelectedDeckId(newDeck.id);
    setNewDeckName("");
    setActiveCardIdx(0);
    setIsFlipped(false);
  };

  const handleDeleteDeck = (deckId: string) => {
    const updated = decks.filter(d => d.id !== deckId);
    saveDecks(updated);
    if (selectedDeckId === deckId) {
      setSelectedDeckId(updated.length > 0 ? updated[0].id : "");
      setActiveCardIdx(0);
      setIsFlipped(false);
    }
  };

  // OpenAI Flashcard Generator
  const handleGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setIsGenerating(true);
    setError("");

    const clientApiKey = localStorage.getItem("openai_api_key") || "";
    const systemPrompt = `You are an advanced educational tutor and AI learning engine.
Your task is to take a textbook topic, subject, or reading excerpt, and extract or create exactly 5-8 high-quality study flashcards.
Each flashcard must contain:
1. Front: A concise question, term, or concept to define.
2. Back: A clear, accurate, and easy-to-digest answer or definition (1-3 sentences).

You must respond ONLY with a valid JSON object. Do not include markdown wraps or explanation text outside the JSON.
The JSON object must look exactly like this:
{
  "deckName": "Name of deck based on topic",
  "cards": [
    {
      "front": "What is Mitochondria?",
      "back": "Mitochondria is often called the powerhouse of the cell, generating adenosine triphosphate (ATP) which serves as cell energy."
    },
    {
      "front": "What is cellular respiration?",
      "back": "A set of metabolic reactions and processes that take place in the cells of organisms to convert biochemical energy from nutrients into ATP."
    }
  ]
}`;

    try {
      let resultData: any = null;

      // Try Backend proxy first
      try {
        const response = await fetch("/api/notes/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Generate flashcards for topic: ${aiTopic}`,
            context: systemPrompt,
            apiKey: clientApiKey || undefined
          })
        });

        if (response.ok) {
          const data = await response.json();
          const cleanJson = cleanJsonResponse(data.response);
          resultData = JSON.parse(cleanJson);
        }
      } catch (err) {
        console.warn("Backend failed, trying direct OpenAI api", err);
      }

      // Direct fallback
      if (!resultData) {
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
              { role: "user", content: `Generate a flashcard deck on: ${aiTopic}` }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          })
        });

        if (!directResponse.ok) {
          throw new Error("OpenAI API returned an error. Check key or rate limits.");
        }

        const dData = await directResponse.json();
        const content = dData.choices?.[0]?.message?.content;
        if (!content) throw new Error("No flashcards returned.");
        resultData = JSON.parse(cleanJsonResponse(content));
      }

      if (resultData && resultData.cards) {
        const generatedCards: Flashcard[] = resultData.cards.map((c: any, idx: number) => ({
          id: `card-${Date.now()}-${idx}`,
          front: c.front || "Concept",
          back: c.back || "Definition",
          mastered: false
        }));

        const newDeck: FlashcardDeck = {
          id: `deck-${Date.now()}`,
          name: resultData.deckName || aiTopic,
          cards: generatedCards
        };

        const updated = [...decks, newDeck];
        saveDecks(updated);
        setSelectedDeckId(newDeck.id);
        setAiTopic("");
        setActiveCardIdx(0);
        setIsFlipped(false);
      } else {
        throw new Error("Invalid structure returned from AI.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate cards. Check API key.");
    } finally {
      setIsGenerating(false);
    }
  };

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

  const handleAddManualCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim() || !selectedDeckId) return;

    const updated = decks.map(d => {
      if (d.id === selectedDeckId) {
        const newCard: Flashcard = {
          id: `card-${Date.now()}`,
          front: newFront.trim(),
          back: newBack.trim(),
          mastered: false
        };
        return {
          ...d,
          cards: [...d.cards, newCard]
        };
      }
      return d;
    });

    saveDecks(updated);
    setNewFront("");
    setNewBack("");
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = decks.map(d => {
      if (d.id === selectedDeckId) {
        const filtered = d.cards.filter(c => c.id !== cardId);
        return { ...d, cards: filtered };
      }
      return d;
    });
    saveDecks(updated);
    if (activeCardIdx >= (selectedDeck?.cards.length || 1) - 1) {
      setActiveCardIdx(Math.max(0, (selectedDeck?.cards.length || 1) - 2));
    }
    setIsFlipped(false);
  };

  const toggleCardMastered = (cardId: string) => {
    const updated = decks.map(d => {
      if (d.id === selectedDeckId) {
        return {
          ...d,
          cards: d.cards.map(c => c.id === cardId ? { ...c, mastered: !c.mastered } : c)
        };
      }
      return d;
    });
    saveDecks(updated);
  };

  const selectedDeck = decks.find(d => d.id === selectedDeckId);
  const totalCards = selectedDeck?.cards.length || 0;
  const activeCard = selectedDeck?.cards[activeCardIdx];
  const masteredCount = selectedDeck?.cards.filter(c => c.mastered).length || 0;
  const progressPercent = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  return (
    <div id="flashcards-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div id="flashcards-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2EC] text-[#c67f43] flex items-center justify-center shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl text-[#221C18] tracking-tight font-display">AI Flashcard Generator</h1>
            <p className="text-xs text-stone-500 font-medium">Turn reading notes, study topics, or lists into active recall study decks instantly.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column Decks list & Generator forms */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* AI Generator Card */}
          <div id="ai-generator-card" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c67f43]" /> AI Card Builder
            </h2>
            <form onSubmit={handleGenerateCards} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Enter Topic or Text</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="e.g. Photosynthesis light reactions, French vocabulary on food, or paste your raw notes here..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl p-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating cards...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Build Deck with AI
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Saved Decks List */}
          <div id="decks-panel" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-stone-400" /> Flashcard Decks
            </h2>
            
            <form onSubmit={handleCreateDeck} className="flex gap-2 mb-4">
              <input 
                type="text" 
                required
                placeholder="New deck name..."
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="flex-grow bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white font-medium"
              />
              <button 
                type="submit"
                className="p-2 bg-[#FAF2EC] hover:bg-[#FAF2EC]/80 border border-[#FAF2EC] text-[#c67f43] rounded-xl transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {decks.length === 0 ? (
                <p className="text-xs text-stone-400">No study decks created. Create one above!</p>
              ) : (
                decks.map((deck) => {
                  const isSelected = deck.id === selectedDeckId;
                  return (
                    <div 
                      key={deck.id}
                      onClick={() => {
                        setSelectedDeckId(deck.id);
                        setActiveCardIdx(0);
                        setIsFlipped(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer group transition-all ${
                        isSelected 
                          ? "border-[#c67f43] bg-[#FAF2EC]/50 font-bold" 
                          : "border-[#EFECE6] hover:bg-stone-50"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs text-stone-800 truncate leading-snug">{deck.name}</p>
                        <span className="text-[10px] text-stone-400 font-bold">{deck.cards.length} cards</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDeck(deck.id);
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

        {/* Right Column Interactive Flashcard Stage & Manual Adder */}
        <div className="lg:col-span-8 space-y-6">
          {selectedDeck ? (
            <div className="space-y-6 text-left">
              
              {/* Deck Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFECE6] px-5 py-4 rounded-xl">
                <div>
                  <h2 className="text-sm font-bold text-[#221C18]">{selectedDeck.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-stone-500 font-bold">
                    <span>Mastered: {masteredCount} / {totalCards}</span>
                    <span>•</span>
                    <span>Progress: {progressPercent}%</span>
                  </div>
                </div>
                
                <div className="w-full sm:w-48 bg-stone-100 h-2 rounded-full overflow-hidden shrink-0">
                  <div 
                    className="bg-[#c67f43] h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Central Card Slide Canvas */}
              {totalCards === 0 ? (
                <div className="bg-white border border-[#EFECE6] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 h-[350px]">
                  <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-700">Deck is empty</h3>
                    <p className="text-[11px] text-stone-400 mt-1 max-w-xs">
                      Generate some card components with the AI on the left, or add them manually below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Card Display Stage */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="relative w-full h-[280px] cursor-pointer"
                    style={{ perspective: "1000px" }}
                  >
                    <div 
                      className={`absolute w-full h-full transition-transform duration-500 transform-gpu relative`}
                      style={{ 
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                      }}
                    >
                      {/* Front of card */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs select-none backface-hidden text-center"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <div className="flex justify-between items-center text-stone-400 text-[10px] font-bold">
                          <span>Active Recall</span>
                          <span>{activeCardIdx + 1} / {totalCards}</span>
                        </div>
                        <div className="flex-grow flex items-center justify-center px-4">
                          <p className="font-sans font-semibold text-stone-800 text-sm sm:text-base leading-relaxed tracking-wide">
                            {activeCard?.front}
                          </p>
                        </div>
                        <div className="flex justify-center items-center gap-1 text-[11px] text-[#c67f43] font-bold uppercase tracking-wider">
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Tap to reveal answer</span>
                        </div>
                      </div>

                      {/* Back of card (flipped) */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-stone-50 border border-[#EFECE6] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs select-none text-center transform rotateY-180"
                        style={{ 
                          backfaceVisibility: "hidden", 
                          transform: "rotateY(180deg)" 
                        }}
                      >
                        <div className="flex justify-between items-center text-stone-400 text-[10px] font-bold">
                          <span className="text-emerald-600 font-bold flex items-center gap-1">Answer Revealed</span>
                          <span>{activeCardIdx + 1} / {totalCards}</span>
                        </div>
                        <div className="flex-grow flex items-center justify-center px-4 overflow-y-auto">
                          <p className="font-sans text-stone-700 text-xs sm:text-sm leading-relaxed font-medium">
                            {activeCard?.back}
                          </p>
                        </div>
                        <div className="flex justify-center items-center gap-1 text-[11px] text-[#c67f43] font-bold uppercase tracking-wider">
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Tap to show concept</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Navigation controls & Mastery Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Mastery Toggles */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          if (activeCard) toggleCardMastered(activeCard.id);
                        }}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeCard?.mastered 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                            : "bg-white border-[#EFECE6] text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <CheckCircle className={`w-4 h-4 ${activeCard?.mastered ? "text-emerald-600" : "text-stone-400"}`} />
                        <span>{activeCard?.mastered ? "Mastered!" : "Mark Mastered"}</span>
                      </button>

                      <button 
                        onClick={() => {
                          if (activeCard) handleDeleteCard(activeCard.id);
                        }}
                        className="p-2.5 border border-[#EFECE6] hover:border-red-100 hover:bg-red-50 hover:text-red-500 text-stone-400 rounded-xl transition-all"
                        title="Delete this card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Left / Right switches */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          setActiveCardIdx(prev => Math.max(0, prev - 1));
                          setIsFlipped(false);
                        }}
                        disabled={activeCardIdx === 0}
                        className="p-2.5 bg-white border border-[#EFECE6] rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4 text-stone-600" />
                      </button>

                      <span className="text-xs font-bold text-stone-500 tracking-wider">
                        {activeCardIdx + 1} of {totalCards}
                      </span>

                      <button 
                        onClick={() => {
                          setActiveCardIdx(prev => Math.min(totalCards - 1, prev + 1));
                          setIsFlipped(false);
                        }}
                        disabled={activeCardIdx === totalCards - 1}
                        className="p-2.5 bg-white border border-[#EFECE6] rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4 text-stone-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Manual Cards Form */}
              <div id="manual-card-builder" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-stone-400" /> Add Custom Flashcard to Deck
                </h3>
                
                <form onSubmit={handleAddManualCard} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Front (Question / Concept)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. What is polymorphism?" 
                      value={newFront}
                      onChange={(e) => setNewFront(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Back (Answer / Definition)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Ability of an object to take many forms..." 
                      value={newBack}
                      onChange={(e) => setNewBack(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button 
                      type="submit"
                      className="bg-[#FAF2EC] hover:bg-[#FAF2EC]/80 border border-[#FAF2EC] text-[#c67f43] text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Card
                    </button>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#EFECE6] rounded-2xl p-12 shadow-2xs text-center flex flex-col items-center justify-center space-y-3 h-[450px]">
              <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-[#c67f43]">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-700">No active deck selected</h3>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Create a custom deck or build one with AI on the left menu, then select it to start practicing your active recall.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
