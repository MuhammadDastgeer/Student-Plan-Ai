import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  Search, 
  FileText, 
  Mic, 
  Check, 
  Bookmark, 
  BookOpen, 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  List, 
  ListOrdered,
  Strikethrough,
  Save,
  MicOff,
  AlertCircle,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  ChevronDown,
  Eye,
  EyeOff,
  Table,
  AlignJustify,
  Printer,
  Settings,
  Sparkles,
  ArrowLeftRight,
  X,
  Send,
  Copy
} from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  wordCount: number;
  isPinned: boolean;
  isDeleted?: boolean;
}

export default function WorkspaceNotes() {
  // Load notes from localStorage on mount.
  // Initially, there are no default pre-written notes ("pale say kuch b written ni ho").
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("workspace_notes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse saved notes", e);
      }
    }
    return [];
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => {
    const savedSelected = localStorage.getItem("selected_note_id");
    if (savedSelected) {
      localStorage.removeItem("selected_note_id");
      return savedSelected;
    }
    const saved = localStorage.getItem("workspace_notes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const active = parsed.filter((n: Note) => !n.isDeleted);
          if (active.length > 0) return active[0].id;
          if (parsed.length > 0) return parsed[0].id;
        }
      } catch (e) {}
    }
    return "";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isDictating, setIsDictating] = useState(false);
  const [dictationInterval, setDictationInterval] = useState<any>(null);
  const [sidebarView, setSidebarView] = useState<"active" | "trash">("active");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  // AI Assistant states
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ sender: "user" | "ai"; text: string; date: string }>>([]);
  const [aiInputText, setAiInputText] = useState("");
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [showAllowDialog, setShowAllowDialog] = useState(false);
  const [textToInsert, setTextToInsert] = useState("");
  const aiMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedNoteIdRef = useRef(selectedNoteId);

  const isDictatingRef = useRef(isDictating);
  useEffect(() => {
    isDictatingRef.current = isDictating;
  }, [isDictating]);

  const [dictationLang, setDictationLang] = useState<string>(() => localStorage.getItem("dictation_lang") || "ur-PK");

  useEffect(() => {
    localStorage.setItem("dictation_lang", dictationLang);
  }, [dictationLang]);

  const languageOptions = [
    { code: "ur-PK", name: "اردو (Pakistan)" },
    { code: "ur-IN", name: "اردو (India)" },
    { code: "hi-IN", name: "हिन्दी (Hindi)" },
    { code: "pa-IN", name: "ਪੰਜਾਬੀ (Punjabi)" },
    { code: "pa-PK", name: "پنجابی (Punjabi PK)" },
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Español (España)" },
    { code: "ar-SA", name: "العربية (Saudi Arabia)" },
    { code: "fr-FR", name: "Français (France)" },
    { code: "tr-TR", name: "Türkçe (Turkey)" },
    { code: "zh-CN", name: "中文 (Chinese)" },
  ];

  // Dropdown states for Microsoft Word / Google Docs style editing toolbar
  const [showToolbar, setShowToolbar] = useState(true);
  const [paperStyle, setPaperStyle] = useState<"white" | "ivory" | "grid" | "lined" | "yellow" | "dark">("white");
  const [showFormattingSymbols, setShowFormattingSymbols] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);

  const [currentFont, setCurrentFont] = useState("Sans Serif");
  const [currentFontSize, setCurrentFontSize] = useState("14px");
  const [currentBlock, setCurrentBlock] = useState("Normal text");

  const editorRef = useRef<HTMLDivElement>(null);

  const activeNotes = notes.filter(n => !n.isDeleted);
  const trashNotes = notes.filter(n => n.isDeleted);

  // Sorting active notes so pinned notes are ALWAYS at the top
  const sortedActiveNotes = [...activeNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const displayedNotes = sidebarView === "active" ? sortedActiveNotes : trashNotes;
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // Convert markdown-formatted text to beautiful, highly styled HTML elements ("full style ke saath")
  const convertMarkdownToStyledHTML = (text: string): string => {
    let html = text;

    // Escape basic HTML tags to prevent broken nested layouts
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Convert Blockquotes
    html = html.replace(/^\s*&gt;\s*(.*)$/gm, '<blockquote style="border-left: 4px solid #c67f43; padding-left: 1rem; color: #64748b; font-style: italic; margin: 0.8rem 0; background: rgba(198,127,67,0.04); border-radius: 6px; padding-top: 0.5rem; padding-bottom: 0.5rem;">$1</blockquote>');

    // Convert Headings
    html = html.replace(/^\s*###\s*(.*)$/gm, '<h3 style="font-size: 1.25rem; font-weight: 700; color: #c67f43; margin-top: 1rem; margin-bottom: 0.4rem; font-family: Playfair Display, Georgia, serif;">$1</h3>');
    html = html.replace(/^\s*##\s*(.*)$/gm, '<h2 style="font-size: 1.5rem; font-weight: 800; color: #221C18; margin-top: 1.2rem; margin-bottom: 0.5rem; font-family: Playfair Display, Georgia, serif; border-bottom: 1px solid #F0EBE5; padding-bottom: 0.25rem;">$1</h2>');
    html = html.replace(/^\s*#\s*(.*)$/gm, '<h1 style="font-size: 1.85rem; font-weight: 900; color: #221C18; margin-top: 1.5rem; margin-bottom: 0.6rem; font-family: Playfair Display, Georgia, serif;">$1</h1>');

    // Bold, Italic & Strikethrough
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 700; color: #221C18;">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em style="font-style: italic;">$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em style="font-style: italic;">$1</em>');
    html = html.replace(/~~([^~]+)~~/g, '<span style="text-decoration: line-through; color: #a8a29e;">$1</span>');

    // Inline Code and Code Blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre style="background: #FAF8F5; border: 1px solid #EFECE6; padding: 0.75rem; border-radius: 8px; font-family: Courier New, monospace; font-size: 13px; margin: 0.75rem 0; overflow-x: auto; color: #475569; line-height: 1.5;">$1</pre>');
    html = html.replace(/`([^`]+)`/g, '<code style="background: #FAF2EC; padding: 0.15rem 0.35rem; border-radius: 4px; font-family: Courier New, monospace; color: #c67f43; font-weight: 600; font-size: 90%;">$1</code>');

    // Horizontal Rule
    html = html.replace(/^\s*---\s*$/gm, '<hr style="border: none; border-top: 1px solid #EFECE6; margin: 1.25rem 0;" />');

    // Convert bulleted and numbered lists cleanly
    const lines = html.split("\n");
    let inList = false;
    let listType: "ul" | "ol" | null = null;
    let processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);
      const numberMatch = line.match(/^\s*\d+\.\s+(.*)$/);

      if (bulletMatch) {
        if (!inList || listType !== "ul") {
          if (inList) processedLines.push(listType === "ul" ? "</ul>" : "</ol>");
          processedLines.push('<ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; color: inherit;">');
          inList = true;
          listType = "ul";
        }
        processedLines.push(`<li style="margin-bottom: 0.35rem; line-height: 1.6;">${bulletMatch[1]}</li>`);
      } else if (numberMatch) {
        if (!inList || listType !== "ol") {
          if (inList) processedLines.push(listType === "ul" ? "</ul>" : "</ol>");
          processedLines.push('<ol style="list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; color: inherit;">');
          inList = true;
          listType = "ol";
        }
        processedLines.push(`<li style="margin-bottom: 0.35rem; line-height: 1.6;">${numberMatch[1]}</li>`);
      } else {
        if (inList) {
          processedLines.push(listType === "ul" ? "</ul>" : "</ol>");
          inList = false;
          listType = null;
        }

        const trimmed = line.trim();
        // Prevent wrap for structural HTML blocks
        if (trimmed && !trimmed.startsWith("<h") && !trimmed.startsWith("<blockquote") && !trimmed.startsWith("<pre") && !trimmed.startsWith("<hr") && !trimmed.startsWith("<ul") && !trimmed.startsWith("<ol") && !trimmed.startsWith("<li")) {
          processedLines.push(`<p style="margin-bottom: 0.6rem; line-height: 1.7;">${line}</p>`);
        } else {
          processedLines.push(line);
        }
      }
    }

    if (inList) {
      processedLines.push(listType === "ul" ? "</ul>" : "</ol>");
    }

    return processedLines.join("\n");
  };

  // AI Assistant side panel handlers
  const sendAIMessage = async (text: string, action?: string) => {
    const inputToUse = text || aiInputText;
    if (!inputToUse.trim() && !action) return;

    // Scroll to end of AI chat
    setTimeout(() => {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    let displayMessage = inputToUse;
    if (action === "summarize") displayMessage = "Summarize this note";
    else if (action === "improve") displayMessage = "Polish / Correct grammar";
    else if (action === "urdu") displayMessage = "Translate this note to Urdu";
    else if (action === "english") displayMessage = "Translate this note to English";
    else if (action === "expand") displayMessage = "Expand this note content";

    const userMsg = {
      sender: "user" as const,
      text: displayMessage,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setAiInputText("");
    setAiIsTyping(true);

    // Detect if user is specifically asking to add/insert this generated note content
    const lowerInput = displayMessage.toLowerCase();
    const asksToAdd = lowerInput.includes("add") || 
                      lowerInput.includes("insert") || 
                      lowerInput.includes("shamil") || 
                      lowerInput.includes("likh") || 
                      lowerInput.includes("put in") || 
                      lowerInput.includes("document me") || 
                      lowerInput.includes("note me");

    try {
      // Get pure text content from note HTML
      let plainTextContext = "";
      if (selectedNote) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = selectedNote.content;
        plainTextContext = tempDiv.textContent || tempDiv.innerText || "";
      }

      const response = await fetch("/api/notes/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: inputToUse,
          context: plainTextContext,
          action: action
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact OpenAI API server");
      }

      const data = await response.json();
      const aiResponseText = data.response;

      setAiMessages((prev) => [
        ...prev,
        {
          sender: "ai" as const,
          text: aiResponseText,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      // If user prompt asks to add, or action is summary/improve/translation and tells us to put it, ask for permission!
      if (asksToAdd) {
        setTimeout(() => {
          setTextToInsert(aiResponseText);
          setShowAllowDialog(true);
        }, 500);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      setAiMessages((prev) => [
        ...prev,
        {
          sender: "ai" as const,
          text: `Error: ${error.message || "Could not connect to AI services."} Please verify if you have configured your OPENAI_API_KEY in the Secrets panel.`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiIsTyping(false);
      setTimeout(() => {
        aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  const handleInsertAIText = (text: string) => {
    if (!selectedNote || selectedNote.isDeleted) return;
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Convert Markdown to beautiful highly styled HTML block elements
      const styledHTML = convertMarkdownToStyledHTML(text);

      document.execCommand("insertHTML", false, styledHTML);
      
      // Update state and save
      setSaveStatus("saving");
      const html = editorRef.current.innerHTML;
      const cleanText = editorRef.current.textContent || "";
      const words = cleanText === "" ? 0 : cleanText.trim().split(/\s+/).length;

      setNotes(prevNotes => {
        const updated = prevNotes.map(n => n.id === selectedNoteId ? {
          ...n,
          content: html,
          wordCount: words,
          updatedAt: "Just now"
        } : n);
        localStorage.setItem("workspace_notes", JSON.stringify(updated));
        return updated;
      });

      setTimeout(() => {
        setSaveStatus("saved");
      }, 600);
    }
  };

  // Update editor contents ONLY when selectedNoteId changes.
  // This prevents cursor jumping during active typing!
  useEffect(() => {
    if (editorRef.current && selectedNote) {
      if (editorRef.current.innerHTML !== selectedNote.content) {
        editorRef.current.innerHTML = selectedNote.content;
      }
    }
    selectedNoteIdRef.current = selectedNoteId;
  }, [selectedNoteId]);

  // Synchronize with localStorage on every notes modification
  const saveToLocalStorage = (updatedNotes: Note[]) => {
    localStorage.setItem("workspace_notes", JSON.stringify(updatedNotes));
  };

  const handleCreateNote = () => {
    const newId = "note-" + Math.random().toString(36).substr(2, 9);
    const newNote: Note = {
      id: newId,
      title: "Untitled Note",
      content: "", // Starts completely empty ("kuch b written ni ho")
      updatedAt: "Just now",
      wordCount: 0,
      isPinned: false,
      isDeleted: false
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveToLocalStorage(updated);
    setSelectedNoteId(newId);
    setSidebarView("active");

    // Clear focus states
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        editorRef.current.focus();
      }
    }, 50);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!selectedNoteId) return;
    setSaveStatus("saving");
    const html = e.currentTarget.innerHTML;
    
    // Parse word count safely stripping HTML tags
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const cleanText = textContent.trim();
    const words = cleanText === "" ? 0 : cleanText.split(/\s+/).length;

    const updated = notes.map(n => n.id === selectedNoteId ? { 
      ...n, 
      content: html, 
      wordCount: words,
      updatedAt: "Just now" 
    } : n);

    setNotes(updated);
    saveToLocalStorage(updated);

    setTimeout(() => {
      setSaveStatus("saved");
    }, 600);
  };

  const handleTitleChange = (title: string) => {
    setSaveStatus("saving");
    const updated = notes.map(n => n.id === selectedNoteId ? { 
      ...n, 
      title, 
      updatedAt: "Just now" 
    } : n);
    setNotes(updated);
    saveToLocalStorage(updated);
    setTimeout(() => {
      setSaveStatus("saved");
    }, 600);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Move to Trash
    const updatedNotes = notes.map(n => n.id === id ? { ...n, isDeleted: true, isPinned: false } : n);
    setNotes(updatedNotes);
    saveToLocalStorage(updatedNotes);
    
    // Auto-select next available active note
    if (selectedNoteId === id) {
      const remainingActive = updatedNotes.filter(n => !n.isDeleted);
      if (remainingActive.length > 0) {
        setSelectedNoteId(remainingActive[0].id);
      } else {
        setSelectedNoteId("");
      }
    }
  };

  const handlePermanentDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    saveToLocalStorage(remaining);
    
    if (selectedNoteId === id) {
      const remainingTrash = remaining.filter(n => n.isDeleted);
      if (remainingTrash.length > 0) {
        setSelectedNoteId(remainingTrash[0].id);
      } else {
        setSelectedNoteId("");
      }
    }
  };

  const handleRestoreNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedNotes = notes.map(n => n.id === id ? { ...n, isDeleted: false } : n);
    setNotes(updatedNotes);
    saveToLocalStorage(updatedNotes);

    if (selectedNoteId === id || !selectedNoteId) {
      setSelectedNoteId(id);
    }
  };

  const handlePinNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    setNotes(updated);
    saveToLocalStorage(updated);
  };

  // Microsoft Word format executor helper
  const executeCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      // Manually trigger handleInput logic to save instantly
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.textContent || "";
      const cleanText = text.trim();
      const words = cleanText === "" ? 0 : cleanText.split(/\s+/).length;
      
      const updated = notes.map(n => n.id === selectedNoteId ? {
        ...n,
        content: html,
        wordCount: words,
        updatedAt: "Just now"
      } : n);
      setNotes(updated);
      saveToLocalStorage(updated);
    }
  };

  const handleInsertTable = () => {
    const tableHTML = `
      <div class="my-4 overflow-x-auto">
        <table class="border-collapse border border-stone-300 w-full text-xs" style="min-width: 300px;">
          <thead>
            <tr class="bg-stone-50">
              <th class="border border-stone-300 p-2.5 text-left font-bold text-stone-700">Column 1</th>
              <th class="border border-stone-300 p-2.5 text-left font-bold text-stone-700">Column 2</th>
              <th class="border border-stone-300 p-2.5 text-left font-bold text-stone-700">Column 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-stone-300 p-2.5 text-stone-600">Cell 1</td>
              <td class="border border-stone-300 p-2.5 text-stone-600">Cell 2</td>
              <td class="border border-stone-300 p-2.5 text-stone-600">Cell 3</td>
            </tr>
            <tr>
              <td class="border border-stone-300 p-2.5 text-stone-600">Cell 4</td>
              <td class="border border-stone-300 p-2.5 text-stone-600">Cell 5</td>
              <td class="border border-stone-300 p-2.5 text-stone-600">Cell 6</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>&nbsp;</p>
    `;
    executeCommand("insertHTML", tableHTML);
  };

  // Voice simulation & Real Recognition
  const recognitionRef = useRef<any>(null);

  const startSimulationFallback = () => {
    if (dictationInterval) return; // already running

    const spokenPhrases = [
      " I am writing down my ideas live with auto-save active.",
      " Every format style applies instantly to my notes desk.",
      " Dictation saves your thinking directly to local storage."
    ];
    let phraseIdx = 0;

    const interval = setInterval(() => {
      if (phraseIdx < spokenPhrases.length) {
        const appendText = spokenPhrases[phraseIdx];
        if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand("insertText", false, appendText);
          
          setSaveStatus("saving");

          // Sync state and autosave
          const html = editorRef.current.innerHTML;
          const text = editorRef.current.textContent || "";
          const cleanText = text.trim();
          const words = cleanText === "" ? 0 : cleanText.split(/\s+/).length;
          
          setNotes(prevNotes => {
            const updated = prevNotes.map(n => n.id === selectedNoteIdRef.current ? {
              ...n,
              content: html,
              wordCount: words,
              updatedAt: "Just now"
            } : n);
            localStorage.setItem("workspace_notes", JSON.stringify(updated));
            return updated;
          });

          setTimeout(() => {
            setSaveStatus("saved");
          }, 600);
        }
        phraseIdx++;
      } else {
        clearInterval(interval);
        setDictationInterval(null);
        setIsDictating(false);
      }
    }, 2500);

    setDictationInterval(interval);
  };

  const toggleDictation = () => {
    if (isDictating) {
      setIsDictating(false);
      if (dictationInterval) {
        clearInterval(dictationInterval);
        setDictationInterval(null);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
    } else {
      setIsDictating(true);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          // Re-create SpeechRecognition to apply selected language
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = false;
          rec.lang = dictationLang;
          
          rec.onresult = (event: any) => {
            const resultIndex = event.resultIndex;
            const transcript = event.results[resultIndex][0].transcript;
            
            if (editorRef.current) {
              editorRef.current.focus();
              
              // Cleanly insert text with correct space formatting
              const currentHTML = editorRef.current.innerHTML.trim();
              const needsSpace = currentHTML.length > 0 && !currentHTML.endsWith(" ") && !currentHTML.endsWith("&nbsp;");
              const insertStr = (needsSpace ? " " : "") + transcript.trim();
              
              document.execCommand("insertText", false, insertStr);
              
              setSaveStatus("saving");

              // Live save note to database/localStorage
              const html = editorRef.current.innerHTML;
              const text = editorRef.current.textContent || "";
              const cleanText = text.trim();
              const words = cleanText === "" ? 0 : cleanText.split(/\s+/).length;
              
              setNotes(prevNotes => {
                const updated = prevNotes.map(n => n.id === selectedNoteIdRef.current ? {
                  ...n,
                  content: html,
                  wordCount: words,
                  updatedAt: "Just now"
                } : n);
                localStorage.setItem("workspace_notes", JSON.stringify(updated));
                return updated;
              });

              setTimeout(() => {
                setSaveStatus("saved");
              }, 600);
            }
          };

          rec.onerror = (err: any) => {
            console.warn("Speech recognition error:", err.error);
            if (err.error === "not-allowed") {
              alert("Microphone permission denied. Please allow microphone access to dictate notes in real-time.");
              setIsDictating(false);
            }
          };

          rec.onend = () => {
            // Keep active if isDictating stays true
            if (isDictatingRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {}
            }
          };

          recognitionRef.current = rec;
          rec.start();
        } catch (e) {
          console.warn("Failed starting native voice, fallback to simulator:", e);
          startSimulationFallback();
        }
      } else {
        startSimulationFallback();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (dictationInterval) clearInterval(dictationInterval);
    };
  }, [dictationInterval]);

  const filteredNotes = displayedNotes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colors = [
    { name: "Default", value: "#221C18" },
    { name: "Slate", value: "#475569" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Green", value: "#16a34a" },
    { name: "Blue", value: "#2563eb" },
    { name: "Purple", value: "#9333ea" },
    { name: "Amber", value: "#d97706" }
  ];

  const highlights = [
    { name: "None", value: "transparent" },
    { name: "Yellow", value: "#fef08a" },
    { name: "Green", value: "#bbf7d0" },
    { name: "Blue", value: "#bfdbfe" },
    { name: "Pink", value: "#fbcfe8" },
    { name: "Purple", value: "#e9d5ff" }
  ];

  const fonts = [
    { name: "Sans Serif", value: "system-ui, sans-serif" },
    { name: "Elegant Serif", value: "Georgia, serif" },
    { name: "Tech Monospace", value: "Courier New, Courier, monospace" },
    { name: "Playful Cursive", value: "cursive" }
  ];

  const blocks = [
    { name: "Normal text", command: "p" },
    { name: "Heading 1", command: "h1" },
    { name: "Heading 2", command: "h2" },
    { name: "Heading 3", command: "h3" },
    { name: "Blockquote", command: "blockquote" }
  ];

  return (
    <div id="workspace-notes" className="p-6 md:p-8 bg-[#FAF8F5] min-h-[calc(100vh-60px)] flex flex-col space-y-6">
      
      {/* Styles for rendering clean element styling within contentEditable div */}
      <style dangerouslySetInnerHTML={{ __html: `
        .rich-editor h1 { font-size: 1.75rem !important; font-weight: 800 !important; color: inherit !important; margin: 0.8rem 0 0.4rem 0 !important; }
        .rich-editor h2 { font-size: 1.4rem !important; font-weight: 700 !important; color: inherit !important; margin: 0.6rem 0 0.3rem 0 !important; }
        .rich-editor h3 { font-size: 1.15rem !important; font-weight: 650 !important; color: inherit !important; margin: 0.5rem 0 0.2rem 0 !important; }
        .rich-editor ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important; }
        .rich-editor ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important; }
        .rich-editor blockquote { border-left: 4px solid #cbd5e1 !important; padding-left: 1rem !important; color: #64748b !important; font-style: italic !important; margin: 0.8rem 0 !important; background: rgba(0,0,0,0.02) !important; border-radius: 4px !important; padding-top: 0.4rem !important; padding-bottom: 0.4rem !important; }
        .rich-editor p { margin-bottom: 0.5rem !important; line-height: 1.65 !important; }
        .rich-editor { outline: none !important; }
        .rich-editor[contenteditable]:empty:before {
          content: attr(placeholder);
          color: #a8a29e;
          cursor: text;
        }

        /* Formatting symbols like Microsoft Word */
        .show-symbols p::after {
          content: " ¶";
          color: #cbd5e1;
          font-weight: normal;
          opacity: 0.7;
          font-size: 0.85em;
        }
        .show-symbols li::after {
          content: " ¶";
          color: #cbd5e1;
          font-weight: normal;
          opacity: 0.7;
          font-size: 0.85em;
        }

        /* Custom paper backgrounds styling */
        .paper-grid {
          background-size: 24px 24px !important;
          background-image: linear-gradient(to right, rgba(14, 165, 233, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.08) 1px, transparent 1px) !important;
        }
        .paper-lined {
          background-size: 100% 28px !important;
          background-image: linear-gradient(to bottom, rgba(14, 165, 233, 0.12) 1px, transparent 1px) !important;
          line-height: 28px !important;
        }
        .paper-yellow {
          background-size: 100% 28px !important;
          background-image: linear-gradient(to bottom, rgba(14, 165, 233, 0.08) 1px, transparent 1px) !important;
          border-left: 2px solid rgba(239, 68, 68, 0.35) !important;
          padding-left: 2.5rem !important;
          line-height: 28px !important;
        }
      `}} />

      {/* Top Page Header */}
      <div className="text-left">
        <h1 className="font-serif text-3xl font-bold text-[#221C18]">
          Capture the shape of your thinking.
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Library Column Sidebar */}
        <div className={`${showAISidebar ? "lg:col-span-3" : "lg:col-span-4"} bg-white border border-[#EFECE6] rounded-2xl p-4 shadow-2xs space-y-4 text-left transition-all duration-300`}>
          
          <div className="flex items-center justify-between">
            <div 
              onClick={() => setSidebarView("active")} 
              className="cursor-pointer flex flex-col"
            >
              <h3 className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">
                {sidebarView === "trash" ? "Deleted" : "Library"}
              </h3>
              <h4 className="text-xs font-bold text-[#221C18] flex items-center gap-1.5">
                {sidebarView === "trash" ? "Trash Desk" : "Notes desk"}
                {sidebarView === "trash" && (
                  <span className="text-[9px] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md text-red-600 font-semibold uppercase tracking-wider">
                    Trash
                  </span>
                )}
              </h4>
            </div>
            
            {sidebarView === "trash" ? (
              <button
                onClick={() => setSidebarView("active")}
                className="text-stone-600 hover:text-[#c67f43] text-xs font-bold px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg transition-all cursor-pointer"
              >
                ← Active
              </button>
            ) : (
              <button
                onClick={handleCreateNote}
                className="bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-3xs"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            )}
          </div>

          {/* Library stats indicator */}
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest pb-2 border-b border-[#FAF8F5]">
            {notes.filter(n => !n.isDeleted).length} active • {notes.filter(n => !n.isDeleted && n.isPinned).length} pinned • {notes.filter(n => n.isDeleted).length} trashed
          </div>

          {/* Search Notes input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder={sidebarView === "trash" ? "Search trashed notes" : "Search notes"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
            />
          </div>

          {/* Notes list */}
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs font-medium">
                {sidebarView === "trash" ? "No trashed notes found" : "No active notes found"}
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = note.id === selectedNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors group relative border ${
                      isActive
                        ? "bg-[#FAF2EC]/80 border-[#F4E3D4] text-[#c67f43]"
                        : "bg-white border-[#EFECE6] hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg ${isActive ? "bg-[#FAF2EC] text-[#c67f43]" : "bg-stone-100 text-stone-400"}`}>
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="text-xs font-bold text-[#221C18] truncate flex items-center gap-1 text-left">
                          {note.isPinned && sidebarView === "active" && (
                            <Bookmark className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                          <span className="truncate">{note.title}</span>
                        </h4>
                        <p className="text-[10px] text-stone-400 font-semibold mt-0.5">{note.updatedAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {sidebarView === "trash" ? (
                        <>
                          {/* Restore trigger */}
                          <button
                            onClick={(e) => handleRestoreNote(note.id, e)}
                            className="p-1 text-stone-400 hover:text-green-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Restore Note"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          {/* Permanent Delete trigger */}
                          <button
                            onClick={(e) => handlePermanentDeleteNote(note.id, e)}
                            className="p-1 text-stone-400 hover:text-red-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Pin trigger */}
                          <button
                            onClick={(e) => handlePinNote(note.id, e)}
                            className={`p-1 rounded-md transition-opacity cursor-pointer ${
                              note.isPinned 
                                ? "text-yellow-500 opacity-100" 
                                : "text-stone-300 opacity-100 md:opacity-0 group-hover:opacity-100 hover:text-stone-500"
                            }`}
                            title={note.isPinned ? "Unpin Note" : "Pin Note"}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>
                          {/* Delete trigger */}
                          <button
                            onClick={(e) => handleDeleteNote(note.id, e)}
                            className="p-1 text-stone-300 hover:text-red-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Sidebar Row: Trash with counter */}
          <div 
            onClick={() => setSidebarView(sidebarView === "trash" ? "active" : "trash")}
            className={`pt-3 border-t border-[#F0EBE5]/60 flex items-center justify-between text-xs font-bold cursor-pointer transition-all ${
              sidebarView === "trash" ? "text-red-500" : "text-stone-400 hover:text-red-500"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> {sidebarView === "trash" ? "Active Notes Desk" : "Trash Desk"}
            </span>
            <span className={`border px-2 py-0.5 rounded-md text-[10px] ${
              sidebarView === "trash" ? "bg-red-50 border-red-200 text-red-600 font-extrabold" : "bg-stone-50 border-[#EFECE6] text-stone-400"
            }`}>
              {notes.filter(n => n.isDeleted).length}
            </span>
          </div>

        </div>

        {/* Right Note Editor Area */}
        <div className={`${showAISidebar ? "lg:col-span-6" : "lg:col-span-8"} bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs text-left space-y-4 transition-all duration-300`}>
          
          {selectedNote ? (
            <>
              {/* Trash Restoring warning banner at the top */}
              {selectedNote.isDeleted && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 font-semibold text-left">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>This note is in the Trash. Restore it to edit or apply Google Docs formatting styles.</span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={(e) => handleRestoreNote(selectedNote.id, e)}
                      className="px-3 py-1.5 bg-[#c67f43] hover:bg-[#b06f37] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Restore Note
                    </button>
                    <button
                      onClick={(e) => handlePermanentDeleteNote(selectedNote.id, e)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Permanent Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Header stats row */}
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 pb-3 border-b border-[#F0EBE5]/60">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedNote.isDeleted ? "bg-red-500" : "bg-emerald-500"}`} />
                  <span>{selectedNote.isDeleted ? "In Trash Desk" : `Updated ${selectedNote.updatedAt}`}</span>
                </div>

                <div className="flex items-center gap-4">
                  {!selectedNote.isDeleted && (
                    <span className={`transition-all duration-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                      saveStatus === "saving"
                        ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                        : "bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]"
                    }`}>
                      {saveStatus === "saving" ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-0.5" />
                          Autosaving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 text-[#15803D]" /> Autosaved live
                        </>
                      )}
                    </span>
                  )}
                  <span>{selectedNote.wordCount} words</span>

                  {!selectedNote.isDeleted && (
                    <button
                      onClick={() => setShowAISidebar(!showAISidebar)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        showAISidebar 
                          ? "bg-[#E05A47] text-white shadow-3xs" 
                          : "bg-[#FAF2EC] hover:bg-[#E05A47]/10 text-[#c67f43]"
                      }`}
                      title={showAISidebar ? "Hide AI Assistant" : "Ask Cozy AI Assistant"}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${showAISidebar ? "animate-spin" : ""}`} />
                      <span>{showAISidebar ? "Hide AI" : "Ask AI"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Title input editable */}
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={selectedNote.isDeleted}
                className="w-full text-2xl font-serif font-bold text-[#221C18] outline-none border-none focus:ring-0 placeholder-stone-300 disabled:opacity-50"
                placeholder="Title your note..."
              />

              {/* Premium Controls Row (Show/Hide Toolbar, Page Colors, Word Options) */}
              <div className={`flex flex-wrap items-center justify-between gap-3 bg-stone-100/60 p-2.5 border border-stone-200/50 rounded-xl text-xs text-stone-500 font-bold select-none ${selectedNote.isDeleted ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Show / Hide formatting toolbar */}
                  <button
                    onClick={() => setShowToolbar(!showToolbar)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-stone-700 cursor-pointer shadow-3xs transition-all"
                    title={showToolbar ? "Hide Formatting Toolbar" : "Show Formatting Toolbar"}
                  >
                    {showToolbar ? <EyeOff className="w-3.5 h-3.5 text-stone-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{showToolbar ? "Hide Ribbon" : "Show Ribbon"}</span>
                  </button>

                  <div className="w-[1px] h-4 bg-stone-300 hidden sm:block" />

                  {/* Toggle formatting symbols (¶) */}
                  <button
                    onClick={() => setShowFormattingSymbols(!showFormattingSymbols)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-lg cursor-pointer shadow-3xs transition-all ${
                      showFormattingSymbols ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold" : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                    }`}
                    title="Show / Hide Paragraph Marks (Word symbols)"
                  >
                    <span>¶ Marks</span>
                  </button>

                  <div className="w-[1px] h-4 bg-stone-300 hidden sm:block" />

                  {/* Insert Table Shortcut */}
                  <button
                    onClick={handleInsertTable}
                    disabled={selectedNote.isDeleted}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-stone-700 cursor-pointer shadow-3xs transition-all disabled:opacity-50"
                    title="Insert Microsoft Word Style Table"
                  >
                    <Table className="w-3.5 h-3.5 text-sky-500" />
                    <span className="hidden xs:inline">Add Table</span>
                  </button>

                  {/* Print Document */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-stone-700 cursor-pointer shadow-3xs transition-all"
                    title="Print / PDF Mode"
                  >
                    <Printer className="w-3.5 h-3.5 text-purple-500" />
                    <span className="hidden xs:inline">Print</span>
                  </button>
                </div>

                {/* Paper Theme Selectors */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase text-stone-400 tracking-wider">Page:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: "white", name: "White", bg: "bg-white border-stone-300" },
                      { id: "ivory", name: "Ivory", bg: "bg-[#FCF9F2] border-[#E8E2D5]" },
                      { id: "grid", name: "Grid Paper", bg: "bg-stone-50 border-sky-200" },
                      { id: "lined", name: "Ruled Notebook", bg: "bg-stone-50 border-indigo-200" },
                      { id: "yellow", name: "Legal Yellow Pad", bg: "bg-yellow-50 border-yellow-200" },
                      { id: "dark", name: "Midnight Dark", bg: "bg-stone-800 border-stone-900" }
                    ].map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setPaperStyle(theme.id as any)}
                        className={`w-4 h-4 rounded-full border cursor-pointer transition-all ${theme.bg} ${
                          paperStyle === theme.id ? "scale-125 ring-2 ring-amber-500" : "hover:scale-110"
                        }`}
                        title={`Page theme: ${theme.name}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Microsoft Word / Google Docs Style Toolbar (Show/Hide Ribbon) */}
              <AnimatePresence>
                {showToolbar && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-wrap items-center gap-1.5 p-2 bg-stone-50/90 border border-stone-200/60 rounded-xl text-stone-600 relative select-none overflow-hidden ${selectedNote.isDeleted ? "opacity-30 pointer-events-none select-none" : ""}`}
                  >
                    {/* Font Selector Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowFontDropdown(!showFontDropdown);
                          setShowFontSizeDropdown(false);
                          setShowBlockDropdown(false);
                          setShowColorDropdown(false);
                          setShowHighlightDropdown(false);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium cursor-pointer"
                        title="Change Font Family"
                      >
                        <span>{currentFont}</span>
                        <ChevronDown className="w-3 h-3 text-stone-400" />
                      </button>
                      {showFontDropdown && (
                        <div className="absolute left-0 mt-1 w-44 bg-white border border-stone-200 rounded-lg shadow-md z-20 p-1 flex flex-col text-left">
                          {fonts.map(font => (
                            <button
                              key={font.name}
                              onClick={() => {
                                setCurrentFont(font.name);
                                executeCommand("fontName", font.value);
                                setShowFontDropdown(false);
                              }}
                              className="px-2.5 py-1.5 hover:bg-stone-50 text-xs font-medium text-stone-700 text-left rounded-md transition-colors cursor-pointer"
                              style={{ fontFamily: font.value }}
                            >
                              {font.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Font Size Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowFontSizeDropdown(!showFontSizeDropdown);
                          setShowFontDropdown(false);
                          setShowBlockDropdown(false);
                          setShowColorDropdown(false);
                          setShowHighlightDropdown(false);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium cursor-pointer"
                        title="Change Font Size"
                      >
                        <span>{currentFontSize}</span>
                        <ChevronDown className="w-3 h-3 text-stone-400" />
                      </button>
                      {showFontSizeDropdown && (
                        <div className="absolute left-0 mt-1 w-28 bg-white border border-stone-200 rounded-lg shadow-md z-20 p-1 flex flex-col text-left">
                          {[
                            { label: "12px", value: "1" },
                            { label: "14px", value: "2" },
                            { label: "16px", value: "3" },
                            { label: "20px", value: "4" },
                            { label: "28px", value: "5" },
                            { label: "36px", value: "6" },
                            { label: "48px", value: "7" }
                          ].map(sz => (
                            <button
                              key={sz.label}
                              onClick={() => {
                                setCurrentFontSize(sz.label);
                                executeCommand("fontSize", sz.value);
                                setShowFontSizeDropdown(false);
                              }}
                              className="px-2.5 py-1.5 hover:bg-stone-50 text-xs font-medium text-stone-700 text-left rounded-md transition-colors cursor-pointer"
                            >
                              {sz.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Heading/Block Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowBlockDropdown(!showBlockDropdown);
                          setShowFontDropdown(false);
                          setShowFontSizeDropdown(false);
                          setShowColorDropdown(false);
                          setShowHighlightDropdown(false);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium cursor-pointer"
                        title="Text Style"
                      >
                        <span>{currentBlock}</span>
                        <ChevronDown className="w-3 h-3 text-stone-400" />
                      </button>
                      {showBlockDropdown && (
                        <div className="absolute left-0 mt-1 w-40 bg-white border border-stone-200 rounded-lg shadow-md z-20 p-1 flex flex-col text-left">
                          {blocks.map(block => (
                            <button
                              key={block.name}
                              onClick={() => {
                                setCurrentBlock(block.name);
                                executeCommand("formatBlock", block.command);
                                setShowBlockDropdown(false);
                              }}
                              className="px-2.5 py-1.5 hover:bg-stone-50 text-xs font-medium text-stone-700 text-left rounded-md transition-colors cursor-pointer"
                            >
                              {block.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="w-[1px] h-5 bg-stone-300 mx-1" />

                    {/* Undo / Redo */}
                    <button
                      onClick={() => executeCommand("undo")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors cursor-pointer"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => executeCommand("redo")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors cursor-pointer"
                      title="Redo (Ctrl+Y)"
                    >
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-5 bg-stone-300 mx-1" />

                    {/* Bold, Italic, Underline, Strikethrough */}
                    <button
                      onClick={() => executeCommand("bold")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 font-extrabold transition-colors cursor-pointer"
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => executeCommand("italic")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 italic transition-colors cursor-pointer"
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => executeCommand("underline")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 underline transition-colors cursor-pointer"
                      title="Underline (Ctrl+U)"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => executeCommand("strikeThrough")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 line-through transition-colors cursor-pointer"
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-5 bg-stone-300 mx-1" />

                    {/* Subscript / Superscript */}
                    <button
                      onClick={() => executeCommand("subscript")}
                      className="p-1 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer text-[10px] font-mono font-bold w-7 h-7 flex items-center justify-center"
                      title="Subscript"
                    >
                      X₂
                    </button>
                    <button
                      onClick={() => executeCommand("superscript")}
                      className="p-1 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer text-[10px] font-mono font-bold w-7 h-7 flex items-center justify-center"
                      title="Superscript"
                    >
                      X²
                    </button>

                    <div className="w-[1px] h-5 bg-stone-300 mx-1" />

                    {/* Indents */}
                    <button
                      onClick={() => executeCommand("outdent")}
                      className="p-1 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer text-[10px] font-mono font-bold px-1.5 h-7 flex items-center justify-center"
                      title="Decrease Indent (Shift+Tab)"
                    >
                      ← Tab
                    </button>
                    <button
                      onClick={() => executeCommand("indent")}
                      className="p-1 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer text-[10px] font-mono font-bold px-1.5 h-7 flex items-center justify-center"
                      title="Increase Indent (Tab)"
                    >
                      Tab →
                    </button>

                    <div className="w-[1px] h-5 bg-stone-300 mx-1" />

                    {/* Text Color Selector */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowColorDropdown(!showColorDropdown);
                          setShowFontDropdown(false);
                          setShowFontSizeDropdown(false);
                          setShowBlockDropdown(false);
                          setShowHighlightDropdown(false);
                        }}
                        className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-700 flex items-center gap-0.5 cursor-pointer"
                        title="Text Color"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <ChevronDown className="w-2.5 h-2.5 text-stone-400" />
                      </button>
                      {showColorDropdown && (
                        <div className="absolute left-0 mt-1 w-36 bg-white border border-stone-200 rounded-lg shadow-md z-20 p-2 grid grid-cols-4 gap-1.5">
                          {colors.map(color => (
                            <button
                              key={color.name}
                              onClick={() => {
                                executeCommand("foreColor", color.value);
                                setShowColorDropdown(false);
                              }}
                              className="w-5 h-5 rounded-full border border-stone-300 cursor-pointer shadow-3xs"
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Highlight/Background Color Selector */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowHighlightDropdown(!showHighlightDropdown);
                          setShowFontDropdown(false);
                          setShowFontSizeDropdown(false);
                          setShowBlockDropdown(false);
                          setShowColorDropdown(false);
                        }}
                        className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-700 flex items-center gap-0.5 cursor-pointer"
                        title="Highlight Color"
                      >
                        <Highlighter className="w-3.5 h-3.5" />
                        <ChevronDown className="w-2.5 h-2.5 text-stone-400" />
                      </button>
                      {showHighlightDropdown && (
                        <div className="absolute left-0 mt-1 w-36 bg-white border border-stone-200 rounded-lg shadow-md z-20 p-2 grid grid-cols-3 gap-1.5">
                          {highlights.map(hl => (
                            <button
                              key={hl.name}
                              onClick={() => {
                                executeCommand("hiliteColor", hl.value);
                                setShowHighlightDropdown(false);
                              }}
                              className="h-5 px-1 border border-stone-200 text-[10px] font-bold rounded cursor-pointer text-stone-600 shadow-3xs truncate text-center"
                              style={{ backgroundColor: hl.value === "transparent" ? "#f5f5f4" : hl.value }}
                              title={hl.name}
                            >
                              {hl.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="w-[1px] h-5 bg-stone-300 mx-1" />

                    {/* Lists */}
                    <button
                      onClick={() => executeCommand("insertUnorderedList")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => executeCommand("insertOrderedList")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-5 bg-stone-300 mx-1" />

                    {/* Alignments */}
                    <button
                      onClick={() => executeCommand("justifyLeft")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer"
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => executeCommand("justifyCenter")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer"
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => executeCommand("justifyRight")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer"
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => executeCommand("justifyFull")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer"
                      title="Justify Align"
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-5 bg-stone-300 mx-1" />

                    {/* Divider shortcut */}
                    <button
                      onClick={() => executeCommand("insertHTML", "<hr class='my-6 border-t-2 border-dashed border-stone-200' />")}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer"
                      title="Insert Horizontal Rule Line"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Clear Formatting */}
                    <button
                      onClick={() => {
                        executeCommand("removeFormat");
                        setCurrentFont("Sans Serif");
                        setCurrentFontSize("14px");
                        setCurrentBlock("Normal text");
                      }}
                      className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Clear Formatting"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                    </button>

                    {/* Speak to Note Voice controls */}
                    <div className="ml-auto flex items-center gap-1.5">
                      <select
                        value={dictationLang}
                        onChange={(e) => setDictationLang(e.target.value)}
                        disabled={selectedNote.isDeleted || isDictating}
                        className="bg-[#FAF2EC] text-[#c67f43] border border-[#E8D9CE] text-[11px] font-semibold px-2 py-1 rounded-lg outline-none focus:border-[#E05A47] transition-all cursor-pointer disabled:opacity-60"
                        title="Voice Input Language"
                      >
                        {languageOptions.map((opt) => (
                          <option key={opt.code} value={opt.code}>
                            {opt.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={toggleDictation}
                        disabled={selectedNote.isDeleted}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          isDictating 
                            ? "bg-red-500 text-white animate-pulse shadow-xs" 
                            : "bg-[#FAF2EC] hover:bg-[#E05A47]/10 text-[#c67f43]"
                        }`}
                      >
                        {isDictating ? (
                          <>
                            <MicOff className="w-3 h-3 animate-spin" /> Stop Dictating
                          </>
                        ) : (
                          <>
                            <Mic className="w-3 h-3" /> + Speak
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Physical paper-sheet-style Editor Canvas */}
              <div 
                className={`border rounded-xl shadow-xs p-6 md:p-8 min-h-[400px] relative transition-all duration-300 ${
                  selectedNote.isDeleted ? "opacity-40 pointer-events-none select-none" : ""
                } ${
                  paperStyle === "ivory" 
                    ? "bg-[#FCF9F2] border-[#E8E2D5] text-[#2C2519]" 
                    : paperStyle === "grid" 
                    ? "bg-white paper-grid border-stone-200 text-stone-800" 
                    : paperStyle === "lined" 
                    ? "bg-[#fafaf9] paper-lined border-stone-200 text-stone-800" 
                    : paperStyle === "yellow" 
                    ? "bg-[#FEFCE8] paper-yellow border-[#EAE3A5] text-[#3F2B00]" 
                    : paperStyle === "dark" 
                    ? "bg-[#1E1E1E] border-[#2D2D2D] text-[#E5E5E5]" 
                    : "bg-white border-stone-200 text-stone-800"
                }`}
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                <div
                  ref={editorRef}
                  contentEditable={!selectedNote.isDeleted}
                  onInput={handleInput}
                  className={`rich-editor w-full min-h-[350px] focus:outline-none text-[14px] leading-relaxed select-text ${
                    showFormattingSymbols ? "show-symbols" : ""
                  }`}
                  placeholder="Type something amazing like in Google Docs..."
                />
              </div>

              {/* Dictation Live status box */}
              {isDictating && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-semibold animate-pulse text-left">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>AI Voice Dictation Active: Appending spoken brainstorm ideas directly to your document.</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-white border border-[#EFECE6] rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-stone-50 rounded-full border border-[#FAF2EC]">
                <BookOpen className="w-8 h-8 text-stone-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#221C18]">
                  No active note selected
                </h3>
                <p className="text-stone-400 text-xs max-w-xs mx-auto">
                  Start fresh with an empty canvas. Create your first note to begin capturing thoughts!
                </p>
              </div>
              <button
                onClick={handleCreateNote}
                className="bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create first note
              </button>
            </div>
          )}

        </div>

        {/* AI Assistant Sidebar Panel */}
        <AnimatePresence>
          {showAISidebar && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-3 bg-white border border-[#EFECE6] rounded-2xl p-4 shadow-2xs flex flex-col h-[calc(100vh-180px)] min-h-[500px] text-left relative overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE5]/60 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#FAF2EC] text-[#c67f43] rounded-lg">
                    <Sparkles className="w-4 h-4 text-[#c67f43]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-xs text-[#221C18]">Cozy Notes AI</h3>
                    <p className="text-[10px] text-stone-400 font-medium">Ask, polish, or translate</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAISidebar(false)}
                  className="p-1.5 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer transition-colors"
                  title="Hide AI Assistant"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Actions Panel */}
              <div className="py-2 flex flex-wrap gap-1 border-b border-[#F0EBE5]/60 flex-shrink-0">
                <button
                  onClick={() => sendAIMessage("", "summarize")}
                  disabled={!selectedNote || selectedNote.isDeleted || aiIsTyping}
                  className="text-[9px] font-bold bg-[#FAF2EC] hover:bg-[#E05A47]/10 text-[#c67f43] px-2 py-1 rounded-md transition-all cursor-pointer disabled:opacity-50"
                  title="Summarize Note"
                >
                  Summarize
                </button>
                <button
                  onClick={() => sendAIMessage("", "improve")}
                  disabled={!selectedNote || selectedNote.isDeleted || aiIsTyping}
                  className="text-[9px] font-bold bg-[#FAF2EC] hover:bg-[#E05A47]/10 text-[#c67f43] px-2 py-1 rounded-md transition-all cursor-pointer disabled:opacity-50"
                  title="Correct Grammar / Polish"
                >
                  Polish Text
                </button>
                <button
                  onClick={() => sendAIMessage("", "urdu")}
                  disabled={!selectedNote || selectedNote.isDeleted || aiIsTyping}
                  className="text-[9px] font-bold bg-[#FAF2EC] hover:bg-[#E05A47]/10 text-[#c67f43] px-2 py-1 rounded-md transition-all cursor-pointer disabled:opacity-50"
                  title="Translate to Urdu"
                >
                  Translate Urdu
                </button>
                <button
                  onClick={() => sendAIMessage("", "english")}
                  disabled={!selectedNote || selectedNote.isDeleted || aiIsTyping}
                  className="text-[9px] font-bold bg-[#FAF2EC] hover:bg-[#E05A47]/10 text-[#c67f43] px-2 py-1 rounded-md transition-all cursor-pointer disabled:opacity-50"
                  title="Translate to English"
                >
                  Translate English
                </button>
                <button
                  onClick={() => sendAIMessage("", "expand")}
                  disabled={!selectedNote || selectedNote.isDeleted || aiIsTyping}
                  className="text-[9px] font-bold bg-[#FAF2EC] hover:bg-[#E05A47]/10 text-[#c67f43] px-2 py-1 rounded-md transition-all cursor-pointer disabled:opacity-50"
                  title="Expand Note Content"
                >
                  Expand Note
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-grow overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                {aiMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 text-stone-400">
                    <Sparkles className="w-8 h-8 text-[#FAF2EC] fill-current animate-pulse text-stone-300" />
                    <p className="font-sans font-bold text-stone-600 text-xs">What can I draft for you?</p>
                    <p className="text-[10px] text-stone-400 leading-relaxed max-w-[180px]">
                      Ask questions, translate, or use the quick buttons above to edit the current note with OpenAI.
                    </p>
                  </div>
                ) : (
                  aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col space-y-1 max-w-[95%] ${
                        msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div className={`rounded-xl p-2.5 text-[11px] leading-relaxed shadow-3xs ${
                        msg.sender === "user"
                          ? "bg-[#FAF2EC] text-stone-800 rounded-tr-none text-right"
                          : "bg-stone-50 border border-[#EFECE6] text-[#221C18] rounded-tl-none text-left"
                      }`}>
                        <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                      </div>
                      
                      {/* Insert to Note Button for AI replies */}
                      {msg.sender === "ai" && selectedNote && !selectedNote.isDeleted && (
                        <button
                          onClick={() => {
                            setTextToInsert(msg.text);
                            setShowAllowDialog(true);
                          }}
                          className="text-[9px] font-extrabold text-[#c67f43] hover:text-[#e05a47] flex items-center gap-0.5 mt-0.5 cursor-pointer hover:underline transition-colors"
                          title="Insert AI content directly into your active note"
                        >
                          <Plus className="w-2.5 h-2.5" /> Insert into Note
                        </button>
                      )}
                      
                      <span className="text-[8px] text-stone-400 font-semibold tracking-wide uppercase">
                        {msg.date}
                      </span>
                    </div>
                  ))
                )}
                {aiIsTyping && (
                  <div className="flex gap-2 mr-auto items-center text-left">
                    <div className="bg-stone-50 border border-[#EFECE6] rounded-xl rounded-tl-none p-2 flex gap-1 items-center justify-center">
                      <span className="w-1 h-1 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-1 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-1 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={aiMessagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="mt-auto border-t border-[#F0EBE5]/60 pt-2 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendAIMessage(aiInputText);
                  }}
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    value={aiInputText}
                    onChange={(e) => setAiInputText(e.target.value)}
                    placeholder="Ask Cozy AI..."
                    className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl pl-3 pr-10 py-1.5 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
                    disabled={aiIsTyping}
                  />
                  <button
                    type="submit"
                    disabled={!aiInputText.trim() || aiIsTyping}
                    className="absolute right-2 p-1 rounded-lg bg-[#FAF2EC] hover:bg-[#E05A47]/15 text-[#c67f43] cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Permission Approval Dialog ("Allow me ocha") */}
      <AnimatePresence>
        {showAllowDialog && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-stone-200/80 shadow-2xl max-w-md w-full p-6 text-left space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FAF2EC] text-[#c67f43] rounded-xl border border-[#FAF2EC]/80">
                  <Sparkles className="w-5 h-5 text-[#c67f43]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-800">Allow AI Insertion?</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Cozy AI is asking to insert custom styled content into your active note document.</p>
                </div>
              </div>

              <div className="bg-stone-50 border border-[#EFECE6] p-3.5 rounded-xl max-h-48 overflow-y-auto text-xs text-stone-700 font-medium leading-relaxed custom-scrollbar">
                <span className="font-bold text-[10px] uppercase text-stone-400 block mb-1 tracking-wider">Preview of Content to Add:</span>
                <p className="whitespace-pre-wrap select-text font-serif text-stone-600">{textToInsert}</p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAllowDialog(false);
                    setTextToInsert("");
                  }}
                  className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer transition-colors text-center border border-stone-200/40"
                >
                  Cancel / Reject (Ikar)
                </button>
                <button
                  onClick={() => {
                    handleInsertAIText(textToInsert);
                    setShowAllowDialog(false);
                    setTextToInsert("");
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-red-100 transition-colors text-center"
                >
                  Allow / Insert (Ijazat dein)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

