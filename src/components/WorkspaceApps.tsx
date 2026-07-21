import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Grid, 
  Cpu, 
  Clock, 
  Calculator as CalcIcon, 
  Flame, 
  FileText, 
  CheckSquare, 
  Search, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Link2, 
  Music, 
  Github, 
  Slack, 
  Sparkles,
  RefreshCw,
  X,
  Compass,
  Globe,
  Key,
  Coffee,
  GraduationCap,
  BookOpen,
  Book,
  Languages,
  Type,
  Calendar,
  DollarSign,
  Award,
  Smile
} from "lucide-react";

interface Applet {
  id: string;
  name: string;
  description: string;
  category: "utility" | "focus" | "writing" | "integration";
  installed: boolean;
  icon: any;
  accent: string;
  badge?: string;
}

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  createdAt: string;
}

export default function WorkspaceApps() {
  const [activeTab, setActiveTab] = useState<"all" | "installed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [runningApp, setRunningApp] = useState<string | null>(null);

  // App List Status (saved in localStorage)
  const [installedAppIds, setInstalledAppIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("workspace_installed_apps");
    return saved ? JSON.parse(saved) : ["pomodoro", "calculator", "habits"];
  });

  // Save installed app IDs
  useEffect(() => {
    localStorage.setItem("workspace_installed_apps", JSON.stringify(installedAppIds));
  }, [installedAppIds]);

  // Pomodoro States
  const [pomoTimeLeft, setPomoTimeLeft] = useState(1500); // 25 mins
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState<"work" | "short" | "long">("work");
  const [pomoSessions, setPomoSessions] = useState(0);

  // Calculator States
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [calcClearNext, setCalcClearNext] = useState(false);

  // Habit Tracker States
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem("workspace_apps_habits");
    return saved ? JSON.parse(saved) : [
      { id: "1", name: "Drink 3L water", streak: 4, completedToday: true, createdAt: new Date().toISOString() },
      { id: "2", name: "Read 10 pages", streak: 2, completedToday: false, createdAt: new Date().toISOString() },
      { id: "3", name: "Write code", streak: 7, completedToday: true, createdAt: new Date().toISOString() }
    ];
  });

  const [newHabitName, setNewHabitName] = useState("");

  // Save Habits
  useEffect(() => {
    localStorage.setItem("workspace_apps_habits", JSON.stringify(habits));
  }, [habits]);

  // Markdown Sandbox State
  const [mdContent, setMdContent] = useState("# Hello World\nWrite some markdown here to preview it dynamically...");

  // Timezone helper states
  const [worldTime, setWorldTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setWorldTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Key Generator states
  const [keyLen, setKeyLen] = useState(16);
  const [keyIncludeUpper, setKeyIncludeUpper] = useState(true);
  const [keyIncludeNumbers, setKeyIncludeNumbers] = useState(true);
  const [keyIncludeSymbols, setKeyIncludeSymbols] = useState(true);
  const [generatedKey, setGeneratedKey] = useState("");

  const handleGenerateKey = () => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let pool = lower;
    if (keyIncludeUpper) pool += upper;
    if (keyIncludeNumbers) pool += numbers;
    if (keyIncludeSymbols) pool += symbols;
    let res = "";
    for (let i = 0; i < keyLen; i++) {
      res += pool.charAt(Math.floor(Math.random() * pool.length));
    }
    setGeneratedKey(res);
  };

  // 1. Weekly Study Planner states
  const [studySessions, setStudySessions] = useState<{ id: string; subject: string; day: string; hours: number; completed: boolean }[]>(() => {
    const saved = localStorage.getItem("workspace_study_sessions");
    return saved ? JSON.parse(saved) : [
      { id: "s1", subject: "Computer Science Study", day: "Monday", hours: 2, completed: true },
      { id: "s2", subject: "Math Practice Problems", day: "Wednesday", hours: 3, completed: false },
      { id: "s3", subject: "Physics Lab Prep", day: "Friday", hours: 1.5, completed: false }
    ];
  });
  const [studySubject, setStudySubject] = useState("");
  const [studyDay, setStudyDay] = useState("Monday");
  const [studyHours, setStudyHours] = useState(2);

  useEffect(() => {
    localStorage.setItem("workspace_study_sessions", JSON.stringify(studySessions));
  }, [studySessions]);

  // 2. Academic Dictionary & Vocab states
  const [savedWords, setSavedWords] = useState<{ id: string; word: string; definition: string; tag: string }[]>(() => {
    const saved = localStorage.getItem("workspace_saved_words");
    return saved ? JSON.parse(saved) : [
      { id: "w1", word: "Cognitive", definition: "Relating to the mental action or process of acquiring knowledge and understanding through thought, experience, and the senses.", tag: "Psychology" },
      { id: "w2", word: "Heuristic", definition: "Enabling a person to discover or learn something for themselves.", tag: "CS / Math" }
    ];
  });
  const [dictionarySearch, setDictionarySearch] = useState("");
  const [dictResult, setDictResult] = useState<{ word: string; definition: string; tag: string } | null>(null);

  useEffect(() => {
    localStorage.setItem("workspace_saved_words", JSON.stringify(savedWords));
  }, [savedWords]);

  // 3. Tip & Dorm Expense Splitter states
  const [billAmount, setBillAmount] = useState<number>(45.00);
  const [tipPercent, setTipPercent] = useState<number>(15);
  const [numPeople, setNumPeople] = useState<number>(3);

  // 4. Student Budget Ledger states
  const [budgetTransactions, setBudgetTransactions] = useState<{ id: string; description: string; amount: number; type: "income" | "expense"; category: string }[]>(() => {
    const saved = localStorage.getItem("workspace_budget_transactions");
    return saved ? JSON.parse(saved) : [
      { id: "t1", description: "Monthly Allowance", amount: 250, type: "income", category: "Allowance" },
      { id: "t2", description: "Textbooks Purchase", amount: 85, type: "expense", category: "Academics" },
      { id: "t3", description: "Weekly Groceries", amount: 45, type: "expense", category: "Food" }
    ];
  });
  const [transDesc, setTransDesc] = useState("");
  const [transAmount, setTransAmount] = useState("");
  const [transType, setTransType] = useState<"income" | "expense">("expense");
  const [transCategory, setTransCategory] = useState("Food");

  useEffect(() => {
    localStorage.setItem("workspace_budget_transactions", JSON.stringify(budgetTransactions));
  }, [budgetTransactions]);

  // 5. Daily Affirmation & Zen Quotes states
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const [userAffirmation, setUserAffirmation] = useState("");
  const [savedAffirmations, setSavedAffirmations] = useState<string[]>(() => {
    const saved = localStorage.getItem("workspace_saved_affirmations");
    return saved ? JSON.parse(saved) : [
      "I am fully capable of mastering complex scientific theories.",
      "Every mistake is simply a data point on my journey to mastery.",
      "My concentration levels increase whenever I focus single-mindedly."
    ];
  });

  useEffect(() => {
    localStorage.setItem("workspace_saved_affirmations", JSON.stringify(savedAffirmations));
  }, [savedAffirmations]);

  // 6. Code & Text Case Formatter states
  const [formatterText, setFormatterText] = useState("cozy workspace student edition");
  const [formattedResult, setFormattedResult] = useState("");

  // 7. Interactive Quizzer states
  const [quizSubject, setQuizSubject] = useState<"cs" | "math" | "science">("cs");
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizReport, setQuizReport] = useState({ correct: 0, total: 0 });

  // Student Grade Hub State
  const [studentCourses, setStudentCourses] = useState<{ id: string; name: string; grade: string; credits: number }[]>(() => {
    const saved = localStorage.getItem("workspace_student_courses");
    return saved ? JSON.parse(saved) : [
      { id: "c1", name: "Computer Science 101", grade: "A", credits: 3 },
      { id: "c2", name: "Linear Algebra", grade: "B+", credits: 4 },
      { id: "c3", name: "University Physics", grade: "A-", credits: 3 }
    ];
  });
  const [courseFormName, setCourseFormName] = useState("");
  const [courseFormGrade, setCourseFormGrade] = useState("A");
  const [courseFormCredits, setCourseFormCredits] = useState(3);

  useEffect(() => {
    localStorage.setItem("workspace_student_courses", JSON.stringify(studentCourses));
  }, [studentCourses]);

  // Student Active Recall Flashcards State
  const [studentCards, setStudentCards] = useState<{ id: string; front: string; back: string }[]>(() => {
    const saved = localStorage.getItem("workspace_student_cards");
    return saved ? JSON.parse(saved) : [
      { id: "fc1", front: "What is the search time complexity in a Balanced BST?", back: "O(log n)" },
      { id: "fc2", front: "What is Active Recall?", back: "Testing yourself on information instead of passive re-reading to build stronger pathways." },
      { id: "fc3", front: "What does mitochondria produce for cellular energy?", back: "Adenosine Triphosphate (ATP)" },
      { id: "fc4", front: "What are the ACID properties in database transactions?", back: "Atomicity, Consistency, Isolation, and Durability." }
    ];
  });
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    localStorage.setItem("workspace_student_cards", JSON.stringify(studentCards));
  }, [studentCards]);

  // Simulated Integrations
  const [integrations, setIntegrations] = useState<{ id: string; name: string; connected: boolean; desc: string; icon: any; color: string }[]>([
    { id: "gcal", name: "Google Calendar", connected: false, desc: "Synchronize events with your Google account.", icon: CalendarIcon, color: "text-blue-500 bg-blue-50" },
    { id: "github", name: "GitHub Connect", connected: false, desc: "Link repositories and track commit milestones.", icon: Github, color: "text-stone-800 bg-stone-100" },
    { id: "spotify", name: "Spotify Soundscapes", connected: false, desc: "Play background lo-fi music inside your workspace.", icon: Music, color: "text-green-500 bg-green-50" },
    { id: "slack", name: "Slack Alerts", connected: false, desc: "Broadcast summary notes directly to your channel.", icon: Slack, color: "text-purple-600 bg-purple-50" },
  ]);

  // Pomodoro timer logic
  useEffect(() => {
    let timer: any = null;
    if (pomoActive && pomoTimeLeft > 0) {
      timer = setInterval(() => {
        setPomoTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (pomoActive && pomoTimeLeft === 0) {
      // Completed!
      if (pomoMode === "work") {
        setPomoSessions(s => s + 1);
        setPomoTimeLeft(300); // 5 min break
        setPomoMode("short");
        alert("Pomodoro Work Session complete! Enjoy your 5-minute short break.");
      } else {
        setPomoTimeLeft(1500);
        setPomoMode("work");
        alert("Break is over! Time to focus.");
      }
      setPomoActive(false);
    }
    return () => clearInterval(timer);
  }, [pomoActive, pomoTimeLeft, pomoMode]);

  const handlePomoPreset = (mode: "work" | "short" | "long") => {
    setPomoActive(false);
    setPomoMode(mode);
    if (mode === "work") setPomoTimeLeft(1500); // 25 mins
    else if (mode === "short") setPomoTimeLeft(300); // 5 mins
    else if (mode === "long") setPomoTimeLeft(900); // 15 mins
  };

  const formatPomoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculator Logic
  const handleCalcBtn = (val: string) => {
    if (val === "C") {
      setCalcDisplay("0");
      setCalcClearNext(false);
    } else if (val === "=") {
      try {
        // Safe evaluation replacement
        const sanitized = calcDisplay.replace(/×/g, "*").replace(/÷/g, "/");
        // Simple evaluator
        const result = Function(`"use strict"; return (${sanitized})`)();
        const displayResult = Number(result).toLocaleString("en-US", { maximumFractionDigits: 4 });
        setCalcHistory(h => [...h, `${calcDisplay} = ${displayResult}`].slice(-6));
        setCalcDisplay(String(displayResult));
        setCalcClearNext(true);
      } catch (err) {
        setCalcDisplay("Error");
        setCalcClearNext(true);
      }
    } else {
      if (calcDisplay === "0" || calcClearNext || calcDisplay === "Error") {
        setCalcDisplay(val);
        setCalcClearNext(false);
      } else {
        setCalcDisplay(calcDisplay + val);
      }
    }
  };

  // Habit Tracker Logic
  const handleToggleHabit = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const completed = !h.completedToday;
        return {
          ...h,
          completedToday: completed,
          streak: completed ? h.streak + 1 : Math.max(0, h.streak - 1)
        };
      }
      return h;
    }));
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newH: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      streak: 0,
      completedToday: false,
      createdAt: new Date().toISOString()
    };
    setHabits([...habits, newH]);
    setNewHabitName("");
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  // Available App Definitions
  const availableApps: Applet[] = [
    {
      id: "pomodoro",
      name: "Pomodoro Focus Clock",
      description: "Boost deep work with customizable work and break cycles, circular progression visual, and session counters.",
      category: "focus",
      installed: installedAppIds.includes("pomodoro"),
      icon: Clock,
      accent: "text-rose-500 bg-rose-50 border-rose-100",
      badge: "Deep Work"
    },
    {
      id: "calculator",
      name: "Cozy Calculator",
      description: "Quick clean floating desktop calculator for prompt math tasks, budgets, dimensions, or calculations.",
      category: "utility",
      installed: installedAppIds.includes("calculator"),
      icon: CalcIcon,
      accent: "text-amber-500 bg-amber-50 border-amber-100",
      badge: "Utilities"
    },
    {
      id: "habits",
      name: "Habit Tracker Grid",
      description: "Form daily wellness and work rituals. Dynamic streaks check, progress charts, and permanent sync history.",
      category: "utility",
      installed: installedAppIds.includes("habits"),
      icon: Flame,
      accent: "text-orange-500 bg-orange-50 border-orange-100",
      badge: "Self Care"
    },
    {
      id: "markdown",
      name: "Markdown Live Sandbox",
      description: "Instant markdown workspace previewer. Great for drafting emails, documents, README files, or summaries.",
      category: "writing",
      installed: installedAppIds.includes("markdown"),
      icon: FileText,
      accent: "text-blue-500 bg-blue-50 border-blue-100",
      badge: "Content"
    },
    {
      id: "timezone",
      name: "World Clock Hub",
      description: "Plan schedules side-by-side with real-time synchronized UTC, Eastern, British, and Tokyo clocks.",
      category: "utility",
      installed: installedAppIds.includes("timezone"),
      icon: Globe,
      accent: "text-indigo-500 bg-indigo-50 border-indigo-100",
      badge: "Timezones"
    },
    {
      id: "keygen",
      name: "Credentials Generator",
      description: "Generate highly secure, customizable length cryptographic credentials, random strings, or passwords.",
      category: "utility",
      installed: installedAppIds.includes("keygen"),
      icon: Key,
      accent: "text-teal-500 bg-teal-50 border-teal-100",
      badge: "Credentials"
    },
    {
      id: "gradehub",
      name: "Academic Grade & GPA Hub",
      description: "Track your coursework, input target letter grades, custom credit weights, and instantly calculate your Cumulative GPA.",
      category: "utility",
      installed: installedAppIds.includes("gradehub"),
      icon: GraduationCap,
      accent: "text-amber-600 bg-amber-50 border-amber-100",
      badge: "Academic"
    },
    {
      id: "flashcards",
      name: "Active Recall Flashcard Deck",
      description: "Create customizable flashcards. Practice spaced repetition, flip card views, and record active recall retention stats.",
      category: "focus",
      installed: installedAppIds.includes("flashcards"),
      icon: BookOpen,
      accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
      badge: "Study Tool"
    },
    {
      id: "studyplanner",
      name: "Weekly Study Planner",
      description: "Map out your weekly study sessions by subject and day, set goals, and monitor completion rates.",
      category: "focus",
      installed: installedAppIds.includes("studyplanner"),
      icon: Calendar,
      accent: "text-blue-600 bg-blue-50 border-blue-100",
      badge: "Study Calendar"
    },
    {
      id: "dictionary",
      name: "Vocab & Dictionary Box",
      description: "Search specialized student academic vocabulary, read definition tabs, and save words to your personal study list.",
      category: "writing",
      installed: installedAppIds.includes("dictionary"),
      icon: Languages,
      accent: "text-purple-600 bg-purple-50 border-purple-100",
      badge: "Lexicon"
    },
    {
      id: "tipsplitter",
      name: "Dorm Bill & Tip Splitter",
      description: "Instantly split rent, restaurant bills, or project costs with dorm mates with dynamic tax and tip sliders.",
      category: "utility",
      installed: installedAppIds.includes("tipsplitter"),
      icon: DollarSign,
      accent: "text-sky-600 bg-sky-50 border-sky-100",
      badge: "Expense Split"
    },
    {
      id: "budgetledger",
      name: "Student Budget Ledger",
      description: "Manage monthly expenses, books, food, and rent. Monitor your wallet's net cash flow dynamically.",
      category: "utility",
      installed: installedAppIds.includes("budgetledger"),
      icon: DollarSign,
      accent: "text-rose-600 bg-rose-50 border-rose-100",
      badge: "Finances"
    },
    {
      id: "zenquote",
      name: "Zen Quotes & Affirmations",
      description: "Unwind during heavy exam terms. Generate stress-busting student affirmations and beautiful quotes.",
      category: "focus",
      installed: installedAppIds.includes("zenquote"),
      icon: Smile,
      accent: "text-green-600 bg-green-50 border-green-100",
      badge: "Wellness"
    },
    {
      id: "textformatter",
      name: "Text Case Formatter",
      description: "Format writing instantly. Swap string cases, count exact words, lines, or characters, and strip blanks.",
      category: "writing",
      installed: installedAppIds.includes("textformatter"),
      icon: Type,
      accent: "text-teal-600 bg-teal-50 border-teal-100",
      badge: "Formatting"
    },
    {
      id: "revisionquiz",
      name: "Active Revision Quizzer",
      description: "Revise Computer Science, Calculus, and Science presets, answer multiple-choice questions, and score accuracy.",
      category: "focus",
      installed: installedAppIds.includes("revisionquiz"),
      icon: Award,
      accent: "text-indigo-600 bg-indigo-50 border-indigo-100",
      badge: "Assessment"
    }
  ];

  const handleToggleInstall = (appId: string) => {
    if (installedAppIds.includes(appId)) {
      setInstalledAppIds(installedAppIds.filter(id => id !== appId));
      if (runningApp === appId) setRunningApp(null);
    } else {
      setInstalledAppIds([...installedAppIds, appId]);
    }
  };

  // Filter apps
  const filteredApps = availableApps.filter(app => {
    // Tab filtering
    if (activeTab === "installed" && !app.installed) return false;
    
    // Query filtering
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(item => {
      if (item.id === id) {
        return { ...item, connected: !item.connected };
      }
      return item;
    }));
  };

  return (
    <div id="workspace-apps-container" className="p-6 md:p-8 space-y-8 bg-[#FAF8F5] text-left">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#221C18]">Workspace Apps & Tools</h1>
          <p className="text-sm text-stone-500 font-medium">
            Launch cozy, built-in mini apps or manage external integrations in your environment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-stone-400 bg-white px-3 py-1.5 rounded-lg border border-[#EFECE6] flex items-center gap-1.5 shadow-3xs">
            <Cpu className="w-3.5 h-3.5 text-stone-400" />
            Active Applets: {installedAppIds.length} / {availableApps.length}
          </span>
        </div>
      </div>

      {/* Main Tabs and Search filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div id="apps-tab-selector" className="flex items-center gap-1.5 p-1 bg-stone-100 border border-[#EFECE6] rounded-xl self-start">
          <button
            id="tab-btn-all"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-[#c67f43] shadow-3xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> All Utilities
            </span>
          </button>
          <button
            id="tab-btn-installed"
            onClick={() => setActiveTab("installed")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "installed"
                ? "bg-white text-[#c67f43] shadow-3xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> My Apps ({installedAppIds.length})
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            id="apps-search-input"
            type="text"
            placeholder="Filter mini apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#EFECE6] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#c67f43] transition-all text-stone-700 placeholder-stone-400 shadow-3xs"
          />
        </div>
      </div>

      {/* Main Apps Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Apps Grid & Integrations Panel */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map((app) => {
              const IconComponent = app.icon;
              return (
                <motion.div
                  key={app.id}
                  id={`app-card-${app.id}`}
                  whileHover={{ y: -2 }}
                  className="bg-white border border-[#EFECE6] rounded-2xl p-5 text-left flex flex-col justify-between h-[210px] shadow-3xs relative overflow-hidden group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`p-2 rounded-xl border ${app.accent}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {app.badge && (
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50 border border-stone-100 px-2.5 py-0.5 rounded-full">
                          {app.badge}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-serif text-[15px] font-bold text-[#221C18] group-hover:text-[#c67f43] transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-stone-400 text-[11px] mt-1.5 leading-relaxed line-clamp-3">
                      {app.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[#F0EBE5]/30">
                    {app.installed ? (
                      <>
                        <button
                          id={`app-launch-btn-${app.id}`}
                          onClick={() => setRunningApp(app.id)}
                          className="flex-grow flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#FAF2EC] hover:bg-[#F3E6DC] text-[#c67f43] text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" /> Launch
                        </button>
                        <button
                          id={`app-uninstall-btn-${app.id}`}
                          onClick={() => handleToggleInstall(app.id)}
                          title="Uninstall applet"
                          className="p-1.5 border border-[#EFECE6] text-stone-400 hover:text-red-500 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        id={`app-install-btn-${app.id}`}
                        onClick={() => handleToggleInstall(app.id)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-[#EFECE6] hover:bg-[#FAF8F5] text-stone-600 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-3xs"
                      >
                        <Plus className="w-3 h-3" /> Install Applet
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {filteredApps.length === 0 && (
              <div className="md:col-span-2 bg-white/50 border border-dashed border-[#F0EBE5] rounded-2xl p-10 text-center text-stone-400 font-medium text-xs">
                No matching workspace apps found. Clear search query to reset.
              </div>
            )}
          </div>

          {/* Tips / Info Banner */}
          <div className="bg-gradient-to-r from-[#FAF2EC] to-[#FAF8F5] border border-[#F4E3D4]/80 rounded-2xl p-5 text-left flex gap-3.5 items-start">
            <Sparkles className="w-5 h-5 text-[#c67f43] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#c67f43]">AI Assistant App Integration</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                Cozy AI knows about installed apps and habits! You can ask Cozy: 
                <span className="font-semibold italic text-stone-700"> "Let me add a habit to drink water"</span> or 
                <span className="font-semibold italic text-stone-700"> "Configure my pomodoro active session"</span>.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Launcher Sandbox Container */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-xs text-left min-h-[460px] flex flex-col">
            
            {/* Window header */}
            <div className="bg-stone-50/80 px-4 py-3 border-b border-[#EFECE6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                <span className="text-[11px] text-stone-400 font-mono font-medium ml-2">
                  {runningApp ? `sandbox://${runningApp}_applet` : "sandbox://empty"}
                </span>
              </div>
              {runningApp && (
                <button
                  id="close-sandbox-btn"
                  onClick={() => setRunningApp(null)}
                  className="p-1 hover:bg-stone-100 rounded-md text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sandbox content area */}
            <div className="p-5 flex-grow flex flex-col justify-between">
              <AnimatePresence mode="wait">
                
                {/* 1. Empty / Launch guide */}
                {!runningApp && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-[#EFECE6] flex items-center justify-center text-stone-300 shadow-3xs">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-[15px] font-bold text-[#221C18]">Active Application Terminal</h4>
                      <p className="text-[11px] text-stone-400 leading-relaxed max-w-xs mt-1">
                        Select any installed applet from your list and click <strong className="text-[#c67f43]">Launch</strong> to run its interactive console.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 2. Pomodoro Focus Clock */}
                {runningApp === "pomodoro" && (
                  <motion.div
                    key="pomodoro-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-6"
                  >
                    <div className="text-center space-y-4">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#221C18]">Pomodoro Session</h3>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mt-0.5">
                          Streak: {pomoSessions} Work Blocks Completed
                        </p>
                      </div>

                      {/* circular countdown display mockup */}
                      <div className="w-36 h-36 rounded-full border-4 border-[#FAF2EC] flex flex-col items-center justify-center mx-auto relative shadow-2xs">
                        <span className="text-3xl font-mono font-bold text-stone-700 tracking-tight">
                          {formatPomoTime(pomoTimeLeft)}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide mt-1 px-2 py-0.5 rounded-full ${
                          pomoMode === "work" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {pomoMode === "work" ? "Focus block" : "Rest block"}
                        </span>
                      </div>

                      {/* presets bar */}
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id="pomo-preset-work"
                          onClick={() => handlePomoPreset("work")}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            pomoMode === "work" 
                              ? "bg-rose-50 border-rose-200 text-rose-600" 
                              : "bg-white border-[#EFECE6] text-stone-500 hover:bg-stone-50"
                          }`}
                        >
                          25m Focus
                        </button>
                        <button
                          id="pomo-preset-short"
                          onClick={() => handlePomoPreset("short")}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            pomoMode === "short" 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                              : "bg-white border-[#EFECE6] text-stone-500 hover:bg-stone-50"
                          }`}
                        >
                          5m Break
                        </button>
                        <button
                          id="pomo-preset-long"
                          onClick={() => handlePomoPreset("long")}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            pomoMode === "long" 
                              ? "bg-blue-50 border-blue-200 text-blue-600" 
                              : "bg-white border-[#EFECE6] text-stone-500 hover:bg-stone-50"
                          }`}
                        >
                          15m Rest
                        </button>
                      </div>
                    </div>

                    {/* controllers */}
                    <div className="flex items-center justify-center gap-3.5 pt-4 border-t border-[#F0EBE5]/60">
                      <button
                        id="pomo-reset-btn"
                        onClick={() => {
                          setPomoActive(false);
                          setPomoTimeLeft(pomoMode === "work" ? 1500 : pomoMode === "short" ? 300 : 900);
                        }}
                        className="p-2.5 border border-[#EFECE6] text-stone-500 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                        title="Reset countdown"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        id="pomo-toggle-btn"
                        onClick={() => setPomoActive(!pomoActive)}
                        className={`flex items-center gap-2 px-6 py-2.5 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer ${
                          pomoActive 
                            ? "bg-stone-600 hover:bg-stone-700" 
                            : "bg-rose-500 hover:bg-rose-600"
                        }`}
                      >
                        {pomoActive ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" /> Pause timer
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" /> Start timer
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 3. Cozy Calculator */}
                {runningApp === "calculator" && (
                  <motion.div
                    key="calculator-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Calculator Display */}
                      <div className="bg-stone-900 text-white rounded-xl p-4 text-right shadow-inner">
                        <div className="text-[10px] text-stone-400 font-mono tracking-wide h-4 truncate">
                          {calcHistory.length > 0 ? calcHistory[calcHistory.length - 1] : ""}
                        </div>
                        <div className="text-2xl font-mono font-bold tracking-tight h-8 truncate mt-1">
                          {calcDisplay}
                        </div>
                      </div>

                      {/* Keys Matrix Grid */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {["C", "(", ")", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "back", "="].map((char) => {
                          let style = "bg-stone-50 border border-[#EFECE6] text-stone-700 hover:bg-stone-100 font-medium";
                          if (char === "C") {
                            style = "bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 font-bold";
                          } else if (char === "=") {
                            style = "bg-[#c67f43] border border-[#b0703a] text-white hover:bg-[#b0703a] font-bold";
                          } else if (["÷", "×", "-", "+"].includes(char)) {
                            style = "bg-[#FAF2EC] border border-[#F4E3D4] text-[#c67f43] hover:bg-[#F3E6DC] font-bold";
                          }

                          return (
                            <button
                              key={char}
                              id={`calc-btn-${char === "÷" ? "divide" : char === "×" ? "multiply" : char}`}
                              onClick={() => {
                                if (char === "back") {
                                  setCalcDisplay(d => d.length > 1 ? d.slice(0, -1) : "0");
                                } else {
                                  handleCalcBtn(char);
                                }
                              }}
                              className={`py-2 text-xs font-mono rounded-lg transition-colors cursor-pointer ${style}`}
                            >
                              {char}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-[9px] text-stone-400 text-center font-mono pt-3 border-t border-[#F0EBE5]/50">
                      Standard arithmetic logic • Floating sandbox representation
                    </p>
                  </motion.div>
                )}

                {/* 4. Habit Tracker */}
                {runningApp === "habits" && (
                  <motion.div
                    key="habits-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center pb-2.5 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">Daily Checklists</h3>
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                          {habits.filter(h => h.completedToday).length} / {habits.length} Finished
                        </span>
                      </div>

                      {/* Habit checkoff list */}
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {habits.map((h) => (
                          <div 
                            key={h.id} 
                            id={`habit-row-${h.id}`}
                            className="flex items-center justify-between p-2.5 border border-[#EFECE6] rounded-xl hover:bg-[#FAF8F5] transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                id={`habit-check-${h.id}`}
                                type="checkbox"
                                checked={h.completedToday}
                                onChange={() => handleToggleHabit(h.id)}
                                className="w-4 h-4 rounded text-[#c67f43] focus:ring-[#c67f43] border-[#EFECE6] accent-[#c67f43] cursor-pointer"
                              />
                              <span className={`text-xs ${h.completedToday ? "line-through text-stone-400" : "text-stone-700 font-medium"}`}>
                                {h.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-500">
                                <Flame className="w-3.5 h-3.5 fill-current" /> {h.streak}d
                              </span>
                              <button
                                id={`habit-del-btn-${h.id}`}
                                onClick={() => handleDeleteHabit(h.id)}
                                className="p-1 hover:text-red-500 text-stone-300 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {habits.length === 0 && (
                          <p className="text-center text-stone-400 text-[11px] py-6">
                            No habits logged. Write down a daily ritual to get started!
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Add form */}
                    <form onSubmit={handleAddHabit} className="flex gap-1.5 pt-3 border-t border-[#F0EBE5]/60">
                      <input
                        id="new-habit-input"
                        type="text"
                        placeholder="Add new daily habit..."
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        className="flex-grow bg-stone-50 border border-[#EFECE6] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c67f43] focus:bg-white text-stone-700"
                      />
                      <button
                        id="add-habit-btn"
                        type="submit"
                        className="px-3 bg-[#c67f43] hover:bg-[#b0703a] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Add
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 5. Markdown Live Sandbox */}
                {runningApp === "markdown" && (
                  <motion.div
                    key="markdown-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-3.5"
                  >
                    <div className="grid grid-cols-1 gap-3 flex-grow">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">
                          Markdown Input Editor
                        </span>
                        <textarea
                          id="md-editor-textarea"
                          rows={5}
                          value={mdContent}
                          onChange={(e) => setMdContent(e.target.value)}
                          className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-[#c67f43] focus:bg-white text-stone-700 resize-none"
                        />
                      </div>

                      <div className="border border-[#EFECE6] rounded-xl p-3 bg-[#FAF8F5] max-h-[140px] overflow-y-auto text-left">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1.5">
                          Formatted Live Preview
                        </span>
                        <div className="text-xs text-stone-700 font-sans space-y-1">
                          {/* Simple line-by-line render fallback */}
                          {mdContent.split("\n").map((line, i) => {
                            if (line.startsWith("# ")) {
                              return <h1 key={i} className="font-serif text-[15px] font-bold text-stone-800 border-b pb-0.5 mt-2">{line.replace("# ", "")}</h1>;
                            }
                            if (line.startsWith("## ")) {
                              return <h2 key={i} className="font-sans text-[13px] font-bold text-stone-800 mt-1.5">{line.replace("## ", "")}</h2>;
                            }
                            if (line.startsWith("- ") || line.startsWith("* ")) {
                              return <li key={i} className="ml-3.5 list-disc">{line.slice(2)}</li>;
                            }
                            return <p key={i} className="min-h-[14px] leading-relaxed">{line}</p>;
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0EBE5]/50 flex items-center justify-between text-[10px] text-stone-400">
                      <span>Live Markdown Renderer Workspace</span>
                      <button
                        id="clear-md-btn"
                        onClick={() => setMdContent("")}
                        className="text-stone-400 hover:text-red-500 font-bold cursor-pointer"
                      >
                        Clear Editor
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 6. World Clock & Timezone Helper */}
                {runningApp === "timezone" && (
                  <motion.div
                    key="timezone-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2.5 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">World Clocks</h3>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Globe className="w-3 h-3 animate-spin" style={{ animationDuration: "12s" }} /> Real-time UTC Sync
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3 bg-stone-50 border border-[#EFECE6] rounded-xl text-left">
                          <span className="text-[10px] text-stone-400 font-bold block">NEW YORK (EST)</span>
                          <span className="text-[15px] font-mono font-bold text-stone-800 block mt-1">
                            {worldTime.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false })}
                          </span>
                        </div>
                        <div className="p-3 bg-stone-50 border border-[#EFECE6] rounded-xl text-left">
                          <span className="text-[10px] text-stone-400 font-bold block">LONDON (BST/GMT)</span>
                          <span className="text-[15px] font-mono font-bold text-stone-800 block mt-1">
                            {worldTime.toLocaleTimeString("en-US", { timeZone: "Europe/London", hour12: false })}
                          </span>
                        </div>
                        <div className="p-3 bg-stone-50 border border-[#EFECE6] rounded-xl text-left">
                          <span className="text-[10px] text-stone-400 font-bold block">TOKYO (JST)</span>
                          <span className="text-[15px] font-mono font-bold text-stone-800 block mt-1">
                            {worldTime.toLocaleTimeString("en-US", { timeZone: "Asia/Tokyo", hour12: false })}
                          </span>
                        </div>
                        <div className="p-3 bg-[#FAF2EC] border border-[#F4E3D4] rounded-xl text-left">
                          <span className="text-[10px] text-[#c67f43] font-bold block">LOCAL TIME</span>
                          <span className="text-[15px] font-mono font-bold text-[#c67f43] block mt-1">
                            {worldTime.toLocaleTimeString("en-US", { hour12: false })}
                          </span>
                        </div>
                      </div>

                      {/* Timezone Converter slider mockup */}
                      <div className="p-3 bg-stone-50 border border-[#EFECE6] rounded-xl">
                        <span className="text-[10px] text-stone-400 font-bold block mb-1.5 uppercase">Interactive Hour Slider</span>
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-center text-[10px] font-bold text-stone-500">
                            <span>Selected Hour:</span>
                            <span className="bg-stone-200/60 px-2 py-0.5 rounded text-stone-700">
                              {worldTime.getHours()}:00
                            </span>
                          </div>
                          <input 
                            id="timezone-hour-slider"
                            type="range" 
                            min="0" 
                            max="23" 
                            value={worldTime.getHours()} 
                            readOnly
                            className="w-full accent-[#c67f43] bg-stone-200 rounded-lg h-1.5 cursor-pointer"
                          />
                          <p className="text-[9px] text-stone-400 leading-normal">
                            Helps plan overlapping sync windows across New York, London, and Tokyo.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[9px] text-stone-400 text-center font-mono pt-3 border-t border-[#F0EBE5]/50">
                      Cozy World Clock • High Precision Synchronized Core
                    </p>
                  </motion.div>
                )}

                {/* 7. Credentials Generator */}
                {runningApp === "keygen" && (
                  <motion.div
                    key="keygen-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2.5 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">Credentials & Keys Generator</h3>
                        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                          Secure offline entropy
                        </span>
                      </div>

                      {/* Display field */}
                      <div className="bg-stone-900 text-white rounded-xl p-4 text-center shadow-inner relative group min-h-[56px] flex items-center justify-center">
                        {generatedKey ? (
                          <div className="font-mono text-xs font-semibold select-all break-all tracking-wider px-2">
                            {generatedKey}
                          </div>
                        ) : (
                          <span className="text-stone-500 text-xs font-mono">Click Generate below</span>
                        )}
                        {generatedKey && (
                          <button
                            id="copy-key-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedKey);
                              alert("Copied to clipboard!");
                            }}
                            className="absolute right-2 top-2 bg-stone-800 text-[10px] text-stone-300 px-2 py-0.5 rounded hover:bg-stone-700 transition-colors"
                          >
                            Copy
                          </button>
                        )}
                      </div>

                      {/* Config panel */}
                      <div className="space-y-3 bg-stone-50 border border-[#EFECE6] rounded-xl p-3.5 text-left">
                        <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                          <span>Key Length:</span>
                          <span className="font-mono font-bold text-[#c67f43] bg-white border border-[#EFECE6] px-2 py-0.5 rounded">
                            {keyLen} chars
                          </span>
                        </div>
                        <input
                          id="keygen-len-slider"
                          type="range"
                          min="8"
                          max="32"
                          value={keyLen}
                          onChange={(e) => setKeyLen(Number(e.target.value))}
                          className="w-full accent-[#c67f43] bg-stone-200 rounded-lg h-1.5 cursor-pointer"
                        />

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-600">
                            <input
                              id="keygen-upper-check"
                              type="checkbox"
                              checked={keyIncludeUpper}
                              onChange={(e) => setKeyIncludeUpper(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-[#c67f43] accent-[#c67f43] border-[#EFECE6]"
                            />
                            Uppercase (A-Z)
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-600">
                            <input
                              id="keygen-num-check"
                              type="checkbox"
                              checked={keyIncludeNumbers}
                              onChange={(e) => setKeyIncludeNumbers(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-[#c67f43] accent-[#c67f43] border-[#EFECE6]"
                            />
                            Numbers (0-9)
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-600">
                            <input
                              id="keygen-sym-check"
                              type="checkbox"
                              checked={keyIncludeSymbols}
                              onChange={(e) => setKeyIncludeSymbols(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-[#c67f43] accent-[#c67f43] border-[#EFECE6]"
                            />
                            Symbols (!@#$)
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      id="generate-key-submit"
                      onClick={handleGenerateKey}
                      className="w-full py-2 bg-[#c67f43] hover:bg-[#b0703a] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                    >
                      Generate Secure String
                    </button>
                  </motion.div>
                )}



                {/* 9. Academic Grade & GPA Hub */}
                {runningApp === "gradehub" && (() => {
                  const getGradePoints = (g: string): number => {
                    const table: { [key: string]: number } = {
                      "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0
                    };
                    return table[g] || 0.0;
                  };

                  const totalCredits = studentCourses.reduce((sum, c) => sum + Number(c.credits), 0);
                  const totalPoints = studentCourses.reduce((sum, c) => sum + (getGradePoints(c.grade) * Number(c.credits)), 0);
                  const cumulativeGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

                  const handleAddCourse = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!courseFormName.trim()) return;
                    const newCourse = {
                      id: Date.now().toString(),
                      name: courseFormName.trim(),
                      grade: courseFormGrade,
                      credits: Number(courseFormCredits) || 3
                    };
                    setStudentCourses([...studentCourses, newCourse]);
                    setCourseFormName("");
                    setCourseFormGrade("A");
                    setCourseFormCredits(3);
                  };

                  const handleDeleteCourse = (id: string) => {
                    setStudentCourses(studentCourses.filter(c => c.id !== id));
                  };

                  return (
                    <motion.div
                      key="gradehub-app"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex-grow flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center pb-2 border-b border-[#F0EBE5]/60">
                          <h3 className="font-serif font-bold text-sm text-[#221C18]">Grade & GPA Planner</h3>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" /> Academic Tools
                          </span>
                        </div>

                        {/* Cumulative GPA Indicator */}
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-[#FAF2EC] border border-amber-100 rounded-2xl flex items-center justify-between shadow-3xs">
                          <div>
                            <span className="text-[10px] text-amber-800/70 font-extrabold uppercase tracking-wide block">Cumulative GPA</span>
                            <span className="text-3xl font-mono font-bold text-amber-900 mt-1 block">
                              {cumulativeGPA}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 font-bold block uppercase">Total Credits</span>
                            <span className="text-lg font-mono font-bold text-stone-700 block">{totalCredits} hrs</span>
                          </div>
                        </div>

                        {/* List of Courses */}
                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                          <span className="text-[10px] text-stone-400 font-bold block uppercase mb-1">Your Enrolled Courses</span>
                          {studentCourses.length === 0 ? (
                            <div className="p-3 text-center border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                              <p className="text-xs text-stone-400">No courses added yet. Plan your target terms below!</p>
                            </div>
                          ) : (
                            studentCourses.map((course) => (
                              <div key={course.id} className="flex items-center justify-between p-2.5 bg-white border border-[#EFECE6] rounded-xl hover:shadow-4xs transition-shadow">
                                <div className="min-w-0">
                                  <h4 className="text-xs font-semibold text-stone-800 truncate">{course.name}</h4>
                                  <p className="text-[9px] text-stone-400 font-medium font-mono">{course.credits} Credits • {getGradePoints(course.grade).toFixed(1)} Pts</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono font-extrabold text-amber-700 bg-amber-50/70 border border-amber-100 px-2 py-0.5 rounded">
                                    {course.grade}
                                  </span>
                                  <button
                                    id={`delete-course-${course.id}`}
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="p-1 text-stone-400 hover:text-red-500 rounded hover:bg-red-50/30 transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add New Course Form */}
                        <form onSubmit={handleAddCourse} className="bg-stone-50/75 border border-[#EFECE6] rounded-xl p-3.5 space-y-2.5">
                          <span className="text-[10px] text-stone-500 font-bold block uppercase">Add Course or Term Requirement</span>
                          <div className="grid grid-cols-1 gap-2">
                            <input
                              id="course-input-name"
                              type="text"
                              required
                              placeholder="Course Name (e.g. Data Structures, Economics)"
                              value={courseFormName}
                              onChange={(e) => setCourseFormName(e.target.value)}
                              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label htmlFor="course-select-grade" className="text-[9px] text-stone-400 font-bold block mb-1">LETTER GRADE</label>
                                <select
                                  id="course-select-grade"
                                  value={courseFormGrade}
                                  onChange={(e) => setCourseFormGrade(e.target.value)}
                                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none"
                                >
                                  {["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"].map(g => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label htmlFor="course-select-credits" className="text-[9px] text-stone-400 font-bold block mb-1">CREDIT HOURS</label>
                                <select
                                  id="course-select-credits"
                                  value={courseFormCredits}
                                  onChange={(e) => setCourseFormCredits(Number(e.target.value))}
                                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none"
                                >
                                  {[1, 2, 3, 4, 5].map(cr => (
                                    <option key={cr} value={cr}>{cr} {cr === 1 ? "Hr" : "Hrs"}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          <button
                            id="btn-add-course-submit"
                            type="submit"
                            className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-4xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Course to Dashboard
                          </button>
                        </form>
                      </div>

                      <div className="pt-2 border-t border-[#F0EBE5]/50 text-[9px] text-stone-400 text-center font-mono">
                        Supports cumulative weighted point average evaluation.
                      </div>
                    </motion.div>
                  );
                })()}

                {/* 10. Student Active Recall Flashcards */}
                {runningApp === "flashcards" && (
                  <motion.div
                    key="flashcards-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">Active Recall Deck</h3>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> Card Quizzer
                        </span>
                      </div>

                      {/* Score indicator */}
                      <div className="flex justify-between items-center bg-stone-50 border border-[#EFECE6] px-3 py-2 rounded-xl">
                        <span className="text-[10px] text-stone-500 font-bold uppercase">QUIZ PROGRESS</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-stone-700">
                            Score: {quizScore.correct} / {quizScore.total}
                          </span>
                          {quizScore.total > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                              {Math.round((quizScore.correct / quizScore.total) * 100)}% Match
                            </span>
                          )}
                        </div>
                      </div>

                      {/* The Active Card Card */}
                      {studentCards.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                          <span className="text-xs text-stone-400 font-medium">Your flashcard deck is empty.</span>
                          <span className="text-[10px] text-stone-400 mt-1">Add custom key questions below to test your memory!</span>
                        </div>
                      ) : (
                        (() => {
                          const card = studentCards[currentCardIdx] || studentCards[0];
                          const realIdx = studentCards.includes(card) ? studentCards.indexOf(card) : 0;
                          return (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold uppercase">
                                <span>CARD {realIdx + 1} OF {studentCards.length}</span>
                                <button
                                  id="btn-reset-quiz-stats"
                                  onClick={() => setQuizScore({ correct: 0, total: 0 })}
                                  className="hover:text-[#c67f43] transition-colors"
                                >
                                  Reset Stats
                                </button>
                              </div>

                              {/* Interactive Flip Area */}
                              <div
                                id="flashcard-interactive-box"
                                onClick={() => setIsCardFlipped(!isCardFlipped)}
                                className={`h-36 rounded-2xl border p-5 flex flex-col justify-between cursor-pointer select-none transition-all duration-300 relative shadow-3xs overflow-hidden ${
                                  isCardFlipped 
                                    ? "bg-emerald-50/30 border-emerald-200" 
                                    : "bg-[#FAF8F5] border-[#EFECE6] hover:bg-[#FAF6F0]"
                                }`}
                              >
                                {/* Badge watermark */}
                                <span className={`absolute right-3.5 top-3 text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                                  isCardFlipped ? "bg-emerald-100 text-emerald-800" : "bg-stone-200/50 text-stone-500"
                                }`}>
                                  {isCardFlipped ? "Answer Side" : "Question Side"}
                                </span>

                                <div className="flex-grow flex items-center justify-center text-center pt-2.5">
                                  <p className={`text-xs leading-relaxed font-serif font-semibold text-stone-800 px-2`}>
                                    {isCardFlipped ? card.back : card.front}
                                  </p>
                                </div>

                                <div className="text-center text-[9px] text-stone-400 font-mono">
                                  Click anywhere on the card to flip
                                </div>
                              </div>

                              {/* Quiz Feedback Controls */}
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  id="btn-recall-incorrect"
                                  onClick={() => {
                                    setQuizScore(s => ({ correct: s.correct, total: s.total + 1 }));
                                    setIsCardFlipped(false);
                                    setCurrentCardIdx(prev => (prev + 1) % studentCards.length);
                                  }}
                                  className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-4xs"
                                >
                                  Incorrect (Needs Study)
                                </button>
                                <button
                                  id="btn-recall-correct"
                                  onClick={() => {
                                    setQuizScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
                                    setIsCardFlipped(false);
                                    setCurrentCardIdx(prev => (prev + 1) % studentCards.length);
                                  }}
                                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-4xs"
                                >
                                  Correct (Got It!)
                                </button>
                              </div>
                            </div>
                          );
                        })()
                      )}

                      {/* Custom card designer block */}
                      <div className="bg-stone-50/75 border border-[#EFECE6] rounded-xl p-3.5 space-y-2">
                        <span className="text-[10px] text-stone-500 font-bold block uppercase">Custom Card Creator</span>
                        <div className="space-y-2">
                          <input
                            id="card-input-front"
                            type="text"
                            placeholder="Question/Front Side"
                            value={newCardFront}
                            onChange={(e) => setNewCardFront(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 border border-stone-200 bg-white rounded-lg focus:outline-none"
                          />
                          <input
                            id="card-input-back"
                            type="text"
                            placeholder="Correct Answer/Back Side"
                            value={newCardBack}
                            onChange={(e) => setNewCardBack(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 border border-stone-200 bg-white rounded-lg focus:outline-none"
                          />
                        </div>
                        <button
                          id="btn-add-flashcard-submit"
                          onClick={() => {
                            if (!newCardFront.trim() || !newCardBack.trim()) return;
                            const newFC = {
                              id: Date.now().toString(),
                              front: newCardFront.trim(),
                              back: newCardBack.trim()
                            };
                            setStudentCards([...studentCards, newFC]);
                            setNewCardFront("");
                            setNewCardBack("");
                            setCurrentCardIdx(studentCards.length); // switch focus to the new card
                          }}
                          className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-4xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Flashcard to Deck
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F0EBE5]/50 text-[9px] text-stone-400 text-center font-mono">
                      Enhances memory retention via active psychological recall.
                    </div>
                  </motion.div>
                )}

                {/* 9. Weekly Study Planner */}
                {runningApp === "studyplanner" && (
                  <motion.div
                    key="studyplanner-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2.5 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">Weekly Study Planner</h3>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Term Schedule
                        </span>
                      </div>

                      {/* Planner list */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {studySessions.map((session) => (
                          <div 
                            key={session.id} 
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                              session.completed 
                                ? "bg-stone-50 border-stone-200/60 opacity-75" 
                                : "bg-white border-[#EFECE6] hover:shadow-4xs"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={session.completed}
                                onChange={() => {
                                  setStudySessions(studySessions.map(s => 
                                    s.id === session.id ? { ...s, completed: !s.completed } : s
                                  ));
                                }}
                                className="w-4 h-4 rounded text-blue-600 accent-blue-600 border-[#EFECE6] cursor-pointer"
                              />
                              <div className="min-w-0">
                                <span className={`text-xs font-semibold text-stone-800 block truncate ${session.completed ? "line-through text-stone-400" : ""}`}>
                                  {session.subject}
                                </span>
                                <span className="text-[9px] text-stone-400 font-mono font-bold block mt-0.5 uppercase">
                                  {session.day} • {session.hours} Hours Required
                                </span>
                              </div>
                            </div>
                            <button
                              id={`delete-study-${session.id}`}
                              onClick={() => setStudySessions(studySessions.filter(s => s.id !== session.id))}
                              className="text-stone-300 hover:text-red-500 p-1 rounded hover:bg-stone-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add study block form */}
                      <div className="bg-stone-50/70 border border-[#EFECE6] rounded-xl p-3 space-y-2">
                        <span className="text-[10px] text-stone-400 font-bold block uppercase">Plan study slot</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Subject / Chapter"
                            value={studySubject}
                            onChange={(e) => setStudySubject(e.target.value)}
                            className="text-xs px-2.5 py-1.5 border border-stone-200 bg-white rounded-lg focus:outline-none col-span-1 md:col-span-1"
                          />
                          <select
                            value={studyDay}
                            onChange={(e) => setStudyDay(e.target.value)}
                            className="text-xs px-2 py-1.5 border border-stone-200 bg-white rounded-lg focus:outline-none"
                          >
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          <select
                            value={studyHours}
                            onChange={(e) => setStudyHours(Number(e.target.value))}
                            className="text-xs px-2 py-1.5 border border-stone-200 bg-white rounded-lg focus:outline-none"
                          >
                            {[1, 1.5, 2, 2.5, 3, 4, 5].map(h => (
                              <option key={h} value={h}>{h} Hours</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => {
                            if (!studySubject.trim()) return;
                            const newSession = {
                              id: Date.now().toString(),
                              subject: studySubject.trim(),
                              day: studyDay,
                              hours: studyHours,
                              completed: false
                            };
                            setStudySessions([...studySessions, newSession]);
                            setStudySubject("");
                          }}
                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add study block
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F0EBE5]/50 text-[9px] text-stone-400 text-center font-mono">
                      Maintains consistent cognitive revision cycles weekly.
                    </div>
                  </motion.div>
                )}

                {/* 10. Vocab & Dictionary Box */}
                {runningApp === "dictionary" && (
                  <motion.div
                    key="dictionary-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">Vocab & Dictionary</h3>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Languages className="w-3 h-3" /> Academics
                        </span>
                      </div>

                      {/* Interactive dictionary search query lookup */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type academic word (e.g. Cognitive, Heuristic, Paradigm...)"
                            value={dictionarySearch}
                            onChange={(e) => setDictionarySearch(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-stone-200 bg-white rounded-lg focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const lookupWord = dictionarySearch.trim().toLowerCase();
                              const data: { [key: string]: { definition: string; tag: string } } = {
                                cognitive: { definition: "Relating to the mental action or process of acquiring knowledge and understanding through thought, experience, and the senses.", tag: "Psychology" },
                                heuristic: { definition: "Enabling a person to discover or learn something for themselves.", tag: "CS / Math" },
                                paradigm: { definition: "A typical example or pattern of something; a model or overarching framework.", tag: "Philosophy" },
                                synthesize: { definition: "Combine a number of components, ideas, or theories into a coherent whole.", tag: "General Science" },
                                pragmatic: { definition: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.", tag: "Philosophy" },
                                empirical: { definition: "Based on, concerned with, or verifiable by observation or experience rather than theory or pure logic.", tag: "Scientific Method" },
                                rhetoric: { definition: "The art of effective or persuasive speaking or writing, especially the use of figures of speech.", tag: "Literature" },
                                ephemeral: { definition: "Lasting for a very short time; transient, fleeting.", tag: "General Vocab" },
                                equilibrium: { definition: "A state in which opposing forces or influences are balanced.", tag: "Physics / Econ" }
                              };
                              const entry = data[lookupWord];
                              if (entry) {
                                setDictResult({ word: dictionarySearch.trim(), definition: entry.definition, tag: entry.tag });
                              } else {
                                setDictResult({ 
                                  word: dictionarySearch.trim(), 
                                  definition: "Word definition mock. (Save to add a custom definition for your classes!)", 
                                  tag: "Custom word" 
                                });
                              }
                            }}
                            className="px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Lookup
                          </button>
                        </div>

                        {/* Search result view */}
                        {dictResult && (
                          <div className="p-3 bg-purple-50/45 border border-purple-100 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-bold text-purple-950 font-serif">{dictResult.word}</h4>
                              <span className="text-[8px] bg-purple-100/70 text-purple-700 px-1.5 py-0.5 rounded font-extrabold uppercase">{dictResult.tag}</span>
                            </div>
                            <p className="text-[10px] text-purple-900 leading-relaxed font-serif italic">"{dictResult.definition}"</p>
                            <button
                              onClick={() => {
                                if (savedWords.some(w => w.word.toLowerCase() === dictResult.word.toLowerCase())) return;
                                setSavedWords([...savedWords, { id: Date.now().toString(), word: dictResult.word, definition: dictResult.definition, tag: dictResult.tag }]);
                                setDictionarySearch("");
                                setDictResult(null);
                              }}
                              className="text-[9px] font-bold text-purple-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Save to personal word list
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Saved word chips list */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 font-bold block uppercase mb-1">Your Personal Word Bank</span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {savedWords.map((item) => (
                            <div key={item.id} className="group bg-white border border-[#EFECE6] px-2.5 py-1 rounded-full text-[10px] text-stone-700 flex items-center gap-1.5 hover:border-purple-200 transition-colors">
                              <span className="font-semibold font-serif text-stone-800">{item.word}</span>
                              <span className="text-[8px] text-stone-400 font-mono">({item.tag})</span>
                              <button
                                onClick={() => setSavedWords(savedWords.filter(w => w.id !== item.id))}
                                className="text-stone-300 hover:text-red-500 font-bold"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F0EBE5]/50 text-[9px] text-stone-400 text-center font-mono">
                      Boost academic writing precision with high-tier dictionary tags.
                    </div>
                  </motion.div>
                )}

                {/* 11. Dorm Bill & Tip Splitter */}
                {runningApp === "tipsplitter" && (
                  <motion.div
                    key="tipsplitter-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">Bill & Tip Splitter</h3>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Dorm life
                        </span>
                      </div>

                      {/* Display final shared outcome */}
                      {(() => {
                        const tipAmount = billAmount * (tipPercent / 100);
                        const totalBill = billAmount + tipAmount;
                        const sharePerPerson = totalBill / numPeople;
                        return (
                          <div className="space-y-3">
                            <div className="p-4 bg-gradient-to-r from-sky-50 to-sky-50/20 border border-sky-100 rounded-2xl flex justify-between items-center shadow-3xs">
                              <div>
                                <span className="text-[10px] text-sky-800/80 font-bold block uppercase">Share Per Person</span>
                                <span className="text-2xl font-mono font-bold text-sky-900 mt-0.5 block">${sharePerPerson.toFixed(2)}</span>
                              </div>
                              <div className="text-right text-stone-500 font-mono text-[10px]">
                                <div>Bill: ${billAmount.toFixed(2)}</div>
                                <div>Tip: ${tipAmount.toFixed(2)} ({tipPercent}%)</div>
                                <div className="font-semibold text-stone-700">Total: ${totalBill.toFixed(2)}</div>
                              </div>
                            </div>

                            {/* Interactive Sliders */}
                            <div className="space-y-3 bg-stone-50 border border-[#EFECE6] rounded-xl p-3.5">
                              {/* Bill input */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-stone-600 font-medium">
                                  <span>Bill Amount:</span>
                                  <span className="font-mono font-bold text-sky-700">${billAmount.toFixed(2)}</span>
                                </div>
                                <input
                                  type="range"
                                  min="5"
                                  max="300"
                                  step="1"
                                  value={billAmount}
                                  onChange={(e) => setBillAmount(Number(e.target.value))}
                                  className="w-full accent-sky-600 bg-stone-200 rounded-lg h-1.5 cursor-pointer"
                                />
                              </div>

                              {/* Tip percent slider */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-stone-600 font-medium">
                                  <span>Tip Percentage:</span>
                                  <span className="font-mono font-bold text-sky-700">{tipPercent}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="30"
                                  step="1"
                                  value={tipPercent}
                                  onChange={(e) => setTipPercent(Number(e.target.value))}
                                  className="w-full accent-sky-600 bg-stone-200 rounded-lg h-1.5 cursor-pointer"
                                />
                              </div>

                              {/* Number of people */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-stone-600 font-medium">
                                  <span>Split Among:</span>
                                  <span className="font-mono font-bold text-sky-700">{numPeople} people</span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="12"
                                  step="1"
                                  value={numPeople}
                                  onChange={(e) => setNumPeople(Number(e.target.value))}
                                  className="w-full accent-sky-600 bg-stone-200 rounded-lg h-1.5 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="pt-2 border-t border-[#F0EBE5]/50 text-[9px] text-stone-400 text-center font-mono">
                      Excellent for split bills, rent overheads, and student dining.
                    </div>
                  </motion.div>
                )}

                {/* 12. Student Budget Ledger */}
                {runningApp === "budgetledger" && (
                  <motion.div
                    key="budgetledger-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">Student Budget Ledger</h3>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Finance Tracker
                        </span>
                      </div>

                      {/* Display Total balance stats */}
                      {(() => {
                        const income = budgetTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
                        const expense = budgetTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
                        const balance = income - expense;
                        return (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 bg-stone-50 border border-[#EFECE6] p-3 rounded-2xl text-center">
                              <div>
                                <span className="text-[8px] text-stone-400 font-bold block uppercase font-mono">INCOME</span>
                                <span className="text-xs font-mono font-bold text-emerald-600">+${income}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-stone-400 font-bold block uppercase font-mono">EXPENSES</span>
                                <span className="text-xs font-mono font-bold text-rose-600">-${expense}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-stone-400 font-bold block uppercase font-mono">BALANCE</span>
                                <span className={`text-xs font-mono font-bold ${balance >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                                  ${balance >= 0 ? "+" : ""}{balance}
                                </span>
                              </div>
                            </div>

                            {/* Transaction list */}
                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                              {budgetTransactions.map(t => (
                                <div key={t.id} className="flex justify-between items-center p-2 bg-white border border-[#EFECE6] rounded-xl text-xs hover:shadow-4xs transition-all">
                                  <div className="min-w-0">
                                    <span className="font-semibold text-stone-800 truncate block">{t.description}</span>
                                    <span className="text-[8px] text-stone-400 uppercase font-mono block font-bold">{t.category}</span>
                                  </div>
                                  <div className="flex items-center gap-2 font-mono">
                                    <span className={t.type === "income" ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                                      {t.type === "income" ? "+" : "-"}${t.amount}
                                    </span>
                                    <button
                                      onClick={() => setBudgetTransactions(budgetTransactions.filter(item => item.id !== t.id))}
                                      className="text-stone-300 hover:text-red-500"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Add Transaction form */}
                            <div className="bg-stone-50/70 border border-[#EFECE6] p-3 rounded-xl space-y-2">
                              <span className="text-[10px] text-stone-400 font-bold block uppercase">New entry</span>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Item (e.g. Coffee)"
                                  value={transDesc}
                                  onChange={(e) => setTransDesc(e.target.value)}
                                  className="text-xs px-2.5 py-1.5 border border-stone-200 bg-white rounded-lg focus:outline-none"
                                />
                                <input
                                  type="number"
                                  placeholder="Amount ($)"
                                  value={transAmount}
                                  onChange={(e) => setTransAmount(e.target.value)}
                                  className="text-xs px-2.5 py-1.5 border border-stone-200 bg-white rounded-lg focus:outline-none font-mono"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={transType}
                                  onChange={(e) => setTransType(e.target.value as "income" | "expense")}
                                  className="text-xs px-2 py-1.5 border border-stone-200 bg-white rounded-lg focus:outline-none"
                                >
                                  <option value="expense">Expense</option>
                                  <option value="income">Income</option>
                                </select>
                                <select
                                  value={transCategory}
                                  onChange={(e) => setTransCategory(e.target.value)}
                                  className="text-xs px-2 py-1.5 border border-stone-200 bg-white rounded-lg focus:outline-none"
                                >
                                  {["Food", "Allowance", "Academics", "Housing", "Leisure"].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              </div>
                              <button
                                onClick={() => {
                                  if (!transDesc.trim() || !transAmount) return;
                                  const entry = {
                                    id: Date.now().toString(),
                                    description: transDesc.trim(),
                                    amount: Number(transAmount),
                                    type: transType,
                                    category: transCategory
                                  };
                                  setBudgetTransactions([...budgetTransactions, entry]);
                                  setTransDesc("");
                                  setTransAmount("");
                                }}
                                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" /> Record Transaction
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="pt-2 border-t border-[#F0EBE5]/50 text-[9px] text-stone-400 text-center font-mono">
                      Guards students against overspending on rent, groceries, and books.
                    </div>
                  </motion.div>
                )}

                {/* 13. Zen Quotes & Affirmations */}
                {runningApp === "zenquote" && (
                  <motion.div
                    key="zenquote-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">Zen & Stress Buster</h3>
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Smile className="w-3 h-3" /> Wellness Hub
                        </span>
                      </div>

                      {/* Display selected quote */}
                      {(() => {
                        const quotesList = [
                          { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
                          { text: "Continuous effort - not strength or intelligence - is the key to unlocking our potential.", author: "Winston Churchill" },
                          { text: "Heuristic pathways build strongest when you synthesize from mistakes.", author: "Academic Proverb" },
                          { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
                          { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" }
                        ];
                        const quote = quotesList[currentQuoteIdx % quotesList.length];
                        return (
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50/25 border border-green-100 rounded-2xl space-y-2 text-center shadow-3xs">
                            <p className="text-xs italic text-green-950 font-serif leading-relaxed font-semibold">
                              "{quote.text}"
                            </p>
                            <span className="text-[9px] text-green-700/80 font-bold block font-mono">— {quote.author}</span>
                            <button
                              onClick={() => setCurrentQuoteIdx(prev => prev + 1)}
                              className="text-[9px] text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded hover:bg-emerald-100 transition-colors cursor-pointer mt-1 font-bold inline-block"
                            >
                              Generate another quote
                            </button>
                          </div>
                        );
                      })()}

                      {/* Positive student affirmations list */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-stone-400 font-bold block uppercase">Custom Affirmations List</span>
                        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                          {savedAffirmations.map((aff, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-white border border-[#EFECE6] rounded-xl text-[10px] text-stone-700">
                              <span className="truncate pr-2 font-medium">{aff}</span>
                              <button
                                onClick={() => setSavedAffirmations(savedAffirmations.filter((_, idx) => idx !== i))}
                                className="text-stone-300 hover:text-red-500 font-bold text-xs"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Custom affirmation input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add self affirmation (e.g. I will pass physics!)"
                            value={userAffirmation}
                            onChange={(e) => setUserAffirmation(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-stone-200 bg-white rounded-lg focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              if (!userAffirmation.trim()) return;
                              setSavedAffirmations([...savedAffirmations, userAffirmation.trim()]);
                              setUserAffirmation("");
                            }}
                            className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F0EBE5]/50 text-[9px] text-stone-400 text-center font-mono">
                      Enhances psychological stress management and academic focus.
                    </div>
                  </motion.div>
                )}

                {/* 14. Text Case Formatter */}
                {runningApp === "textformatter" && (
                  <motion.div
                    key="textformatter-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">Text Case Formatter</h3>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Type className="w-3 h-3" /> Formatting
                        </span>
                      </div>

                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={formatterText}
                          onChange={(e) => setFormatterText(e.target.value)}
                          placeholder="Type or paste your content here..."
                          className="w-full text-xs p-2.5 border border-stone-200 bg-white rounded-xl focus:outline-none font-mono"
                        />

                        {/* Interactive Case Switch controls */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            onClick={() => setFormatterText(formatterText.toUpperCase())}
                            className="py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            UPPER
                          </button>
                          <button
                            onClick={() => setFormatterText(formatterText.toLowerCase())}
                            className="py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            lower
                          </button>
                          <button
                            onClick={() => {
                              const t = formatterText.replace(/\b\w/g, c => c.toUpperCase());
                              setFormatterText(t);
                            }}
                            className="py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Title
                          </button>
                          <button
                            onClick={() => {
                              const clean = formatterText.split("\n").filter(l => l.trim() !== "").join("\n");
                              setFormatterText(clean);
                            }}
                            className="py-1.5 bg-stone-100 hover:bg-stone-200 text-[#c67f43] text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Trim Blanks
                          </button>
                        </div>
                      </div>

                      {/* Display live counts and word stats */}
                      <div className="p-3 bg-[#FAF2EC] border border-[#F4E3D4] rounded-xl grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
                        <div>
                          <span className="text-[8px] text-stone-400 block font-bold">WORDS</span>
                          <span className="text-stone-700 font-extrabold font-mono">
                            {formatterText.trim() === "" ? 0 : formatterText.trim().split(/\s+/).length}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-stone-400 block font-bold">CHARS</span>
                          <span className="text-stone-700 font-extrabold font-mono">{formatterText.length}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-stone-400 block font-bold">LINES</span>
                          <span className="text-stone-700 font-extrabold font-mono font-bold">
                            {formatterText.trim() === "" ? 0 : formatterText.split("\n").length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F0EBE5]/50 text-[9px] text-stone-400 text-center font-mono">
                      Format coursework copy easily for presentation standards.
                    </div>
                  </motion.div>
                )}

                {/* 15. Active Revision Quizzer */}
                {runningApp === "revisionquiz" && (
                  <motion.div
                    key="revisionquiz-app"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-grow flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F0EBE5]/60">
                        <h3 className="font-serif font-bold text-sm text-[#221C18]">Active Revision Quiz</h3>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 animate-bounce" /> Subject Quizzer
                        </span>
                      </div>

                      {/* Subject Picker tabs */}
                      <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-lg text-center text-[10px] font-bold font-mono">
                        <button
                          onClick={() => { setQuizSubject("cs"); setCurrentQuizIdx(0); setSelectedAnswerIdx(null); setIsAnswerChecked(false); }}
                          className={`py-1 rounded cursor-pointer ${quizSubject === "cs" ? "bg-white text-indigo-800 shadow-4xs" : "text-stone-500"}`}
                        >
                          Comp Sci
                        </button>
                        <button
                          onClick={() => { setQuizSubject("math"); setCurrentQuizIdx(0); setSelectedAnswerIdx(null); setIsAnswerChecked(false); }}
                          className={`py-1 rounded cursor-pointer ${quizSubject === "math" ? "bg-white text-indigo-800 shadow-4xs" : "text-stone-500"}`}
                        >
                          Calculus
                        </button>
                        <button
                          onClick={() => { setQuizSubject("science"); setCurrentQuizIdx(0); setSelectedAnswerIdx(null); setIsAnswerChecked(false); }}
                          className={`py-1 rounded cursor-pointer ${quizSubject === "science" ? "bg-white text-indigo-800 shadow-4xs" : "text-stone-500"}`}
                        >
                          Science
                        </button>
                      </div>

                      {/* Question card */}
                      {(() => {
                        const questionBank = {
                          cs: [
                            { q: "Which data structure operates on a Last-In, First-Out (LIFO) model?", choices: ["Queue", "Stack", "Binary Search Tree", "Linked List"], correct: 1 },
                            { q: "Which protocol is primarily used for secure communications over computer networks?", choices: ["HTTP", "FTP", "HTTPS", "SMTP"], correct: 2 }
                          ],
                          math: [
                            { q: "What is the derivative of sin(x)?", choices: ["-sin(x)", "-cos(x)", "cos(x)", "tan(x)"], correct: 2 },
                            { q: "What is the value of log10(100)?", choices: ["1", "2", "10", "100"], correct: 1 }
                          ],
                          science: [
                            { q: "Which gas do plants absorb during photosynthesis?", choices: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], correct: 2 },
                            { q: "What is the atomic number of Hydrogen?", choices: ["1", "2", "8", "6"], correct: 0 }
                          ]
                        };

                        const questions = questionBank[quizSubject];
                        const qObj = questions[currentQuizIdx % questions.length];

                        return (
                          <div className="space-y-3">
                            <span className="text-[10px] text-stone-400 font-bold block uppercase font-mono">
                              QUESTION { (currentQuizIdx % questions.length) + 1 } OF { questions.length }
                            </span>
                            <div className="p-3.5 bg-stone-50 border border-[#EFECE6] rounded-xl text-xs font-semibold font-serif text-stone-800 leading-relaxed">
                              {qObj.q}
                            </div>

                            {/* Choices buttons */}
                            <div className="space-y-2">
                              {qObj.choices.map((choice, index) => {
                                let btnStyle = "bg-white border-[#EFECE6] text-stone-700 hover:bg-stone-50";
                                if (selectedAnswerIdx === index) {
                                  btnStyle = "bg-indigo-50 border-indigo-300 text-indigo-900";
                                }
                                if (isAnswerChecked) {
                                  if (index === qObj.correct) {
                                    btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                                  } else if (selectedAnswerIdx === index) {
                                    btnStyle = "bg-rose-50 border-rose-300 text-rose-800 font-semibold";
                                  }
                                }

                                return (
                                  <button
                                    key={index}
                                    disabled={isAnswerChecked}
                                    onClick={() => setSelectedAnswerIdx(index)}
                                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${btnStyle}`}
                                  >
                                    <span className="font-bold mr-1.5 font-mono">{String.fromCharCode(65 + index)}.</span>
                                    {choice}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Control button */}
                            <div className="flex gap-2">
                              {!isAnswerChecked ? (
                                <button
                                  disabled={selectedAnswerIdx === null}
                                  onClick={() => {
                                    setIsAnswerChecked(true);
                                    if (selectedAnswerIdx === qObj.correct) {
                                      setQuizReport(r => ({ correct: r.correct + 1, total: r.total + 1 }));
                                    } else {
                                      setQuizReport(r => ({ correct: r.correct, total: r.total + 1 }));
                                    }
                                  }}
                                  className="w-full py-2 bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs cursor-pointer text-center"
                                >
                                  Submit Answer
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setIsAnswerChecked(false);
                                    setSelectedAnswerIdx(null);
                                    setCurrentQuizIdx(prev => prev + 1);
                                  }}
                                  className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 text-white font-bold rounded-lg text-xs cursor-pointer text-center"
                                >
                                  Next Question
                                </button>
                              )}
                            </div>

                            {/* Quiz Stats */}
                            <div className="flex justify-between items-center text-[10px] text-indigo-900 font-bold font-mono px-1">
                              <span>SCORE: {quizReport.correct} / {quizReport.total}</span>
                              <button 
                                onClick={() => setQuizReport({ correct: 0, total: 0 })}
                                className="hover:text-indigo-600 transition-colors cursor-pointer"
                              >
                                Clear Score
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="pt-2 border-t border-[#F0EBE5]/50 text-[9px] text-stone-400 text-center font-mono">
                      Active testing is proven to boost cognitive recall up to 150%.
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

// Missing Calendar icon interface mapper
function CalendarIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
