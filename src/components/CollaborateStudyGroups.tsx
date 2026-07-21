import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  BookOpen, 
  MessageSquare, 
  AlertCircle,
  Video,
  MapPin,
  Send
} from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  membersCount: number;
  location: string;
  description: string;
  nextMeeting: string;
}

interface DiscussionMessage {
  id: string;
  sender: string;
  role: "user" | "ai" | "system";
  text: string;
  timestamp: string;
}

export default function CollaborateStudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  
  // New Group Form States
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Online / Zoom");
  const [nextMeeting, setNextMeeting] = useState("");

  // AI Discussion Facilitator States
  const [messages, setMessages] = useState<Record<string, DiscussionMessage[]>>({});
  const [inputMsg, setInputMsg] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState("");

  // Load from Local Storage
  useEffect(() => {
    const savedGroups = localStorage.getItem("flowbase_study_groups");
    const savedMessages = localStorage.getItem("flowbase_study_group_msgs");

    if (savedGroups) {
      try {
        const parsed = JSON.parse(savedGroups);
        setGroups(parsed);
        if (parsed.length > 0) {
          setSelectedGroupId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultGroups: StudyGroup[] = [
        {
          id: "group-1",
          name: "Calculus Warriors",
          subject: "Mathematics",
          membersCount: 4,
          location: "Library Study Room B / Zoom",
          description: "Weekly problem sets solving and prep for midterms.",
          nextMeeting: "Thursdays at 4:00 PM"
        },
        {
          id: "group-2",
          name: "Bio-Chem Collective",
          subject: "Biochemistry",
          membersCount: 3,
          location: "Zoom Virtual Lab",
          description: "Focusing on macromolecular structure and metabolic pathways.",
          nextMeeting: "Mondays at 6:30 PM"
        }
      ];
      setGroups(defaultGroups);
      setSelectedGroupId(defaultGroups[0].id);
      localStorage.setItem("flowbase_study_groups", JSON.stringify(defaultGroups));
    }

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultMsgs: Record<string, DiscussionMessage[]> = {
        "group-1": [
          {
            id: "msg-1",
            sender: "AI Facilitator",
            role: "ai",
            text: "Assalam-o-Alaikum! Welcome to Calculus Warriors. I am your group study facilitator. Click 'Generate Meeting Agenda' or ask me any Calculus query to kickstart your discussion!",
            timestamp: "10:30 AM"
          }
        ],
        "group-2": [
          {
            id: "msg-2",
            sender: "AI Facilitator",
            role: "ai",
            text: "Welcome to Bio-Chem Collective study room! Let's crack amino acids and glycolysis together. Ask me anything, or generate an active recall plan for the group!",
            timestamp: "Yesterday"
          }
        ]
      };
      setMessages(defaultMsgs);
      localStorage.setItem("flowbase_study_group_msgs", JSON.stringify(defaultMsgs));
    }
  }, []);

  const saveGroups = (updated: StudyGroup[]) => {
    setGroups(updated);
    localStorage.setItem("flowbase_study_groups", JSON.stringify(updated));
  };

  const saveMessages = (updatedMsgs: Record<string, DiscussionMessage[]>) => {
    setMessages(updatedMsgs);
    localStorage.setItem("flowbase_study_group_msgs", JSON.stringify(updatedMsgs));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;

    const newGroup: StudyGroup = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      subject: subject.trim(),
      membersCount: 1, // Start with current user
      location: location || "Online",
      description: description.trim() || "Collaborative study circle.",
      nextMeeting: nextMeeting || "Flexible Schedule"
    };

    const updated = [...groups, newGroup];
    saveGroups(updated);

    // Bootstrap first message for this group
    const initialMsg: DiscussionMessage = {
      id: `msg-${Date.now()}`,
      sender: "AI Facilitator",
      role: "ai",
      text: `Hello! Welcome to ${newGroup.name}. I'm your AI Facilitator. Let's make this study session super productive! Send a topic to start, or click 'Generate Meeting Agenda' to outline study activities.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMsgs = {
      ...messages,
      [newGroup.id]: [initialMsg]
    };
    saveMessages(updatedMsgs);

    setSelectedGroupId(newGroup.id);
    setName("");
    setSubject("");
    setDescription("");
    setLocation("Online / Zoom");
    setNextMeeting("");
  };

  const handleDeleteGroup = (id: string) => {
    const updated = groups.filter(g => g.id !== id);
    saveGroups(updated);
    if (selectedGroupId === id) {
      setSelectedGroupId(updated.length > 0 ? updated[0].id : "");
    }
  };

  // Consult OpenAI to answer discussion messages or facilitate group study
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedGroupId) return;

    const activeGroup = groups.find(g => g.id === selectedGroupId);
    if (!activeGroup) return;

    const currentMsg: DiscussionMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "You",
      role: "user",
      text: inputMsg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const groupHistory = messages[selectedGroupId] || [];
    const updatedHistory = [...groupHistory, currentMsg];

    const currentMsgsState = {
      ...messages,
      [selectedGroupId]: updatedHistory
    };
    saveMessages(currentMsgsState);
    setInputMsg("");
    setIsAiThinking(true);
    setError("");

    const clientApiKey = localStorage.getItem("openai_api_key") || "";
    
    // Construct dialog context
    const dialogContext = updatedHistory.slice(-5).map(m => `${m.sender}: ${m.text}`).join("\n");

    const systemPrompt = `You are a cozy AI Study Group Facilitator & Coach. 
You are moderating a student study group called "${activeGroup.name}" focused on the subject: "${activeGroup.subject}".
Answer study questions, provide helpful outlines, or clarify academic concepts.
Be encouraging, support critical thinking, and suggest collaborative tasks (e.g. peer testing, summarizing).
Add a touch of warm Roman-Urdu / Hindi (e.g. "Bilkul sahi!", "Aap log is par dhyan dein...") to build a cozy, Pakistani student study-hub ambiance.
Limit response to 2-3 short, highly structured paragraphs.`;

    try {
      let responseText = "";

      // Try Backend proxy first
      try {
        const response = await fetch("/api/notes/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Here is the current study group conversation:\n${dialogContext}\n\nAI Facilitator response:`,
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
              { role: "user", content: `Continue the discussion:\n${dialogContext}` }
            ],
            temperature: 0.7
          })
        });

        if (!directResponse.ok) throw new Error("OpenAI error");
        const dData = await directResponse.json();
        responseText = dData.choices?.[0]?.message?.content || "No advice returned.";
      }

      const aiMsg: DiscussionMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: "AI Facilitator",
        role: "ai",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      saveMessages({
        ...messages,
        [selectedGroupId]: [...updatedHistory, aiMsg]
      });

    } catch (err: any) {
      setError("AI was unable to reply. Make sure your OpenAI key is configured.");
    } finally {
      setIsAiThinking(false);
    }
  };

  // Generate study meeting agenda using OpenAI
  const handleGenerateAgenda = async () => {
    if (!selectedGroupId) return;
    const activeGroup = groups.find(g => g.id === selectedGroupId);
    if (!activeGroup) return;

    setIsAiThinking(true);
    setError("");

    const clientApiKey = localStorage.getItem("openai_api_key") || "";
    const systemPrompt = `You are a study counselor. 
Generate a beautifully formatted Study Meeting Agenda for a 1-hour session of the study group "${activeGroup.name}" (Subject: ${activeGroup.subject}).
Divide the agenda into 4 specific sections with timestamps (e.g. 0-15m Active Recall quiz, 15-35m Concept Deep-Dive).
Include a few supportive, motivational suggestions. Make it professional and highly scannable with emojis.`;

    try {
      let responseText = "";

      // Try Backend proxy first
      try {
        const response = await fetch("/api/notes/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: "Generate a 1-hour structured meeting agenda for our study circle.",
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
          throw new Error("No OpenAI API Key found. Set it in Settings.");
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
              { role: "user", content: "Generate study agenda outline." }
            ],
            temperature: 0.7
          })
        });

        if (!directResponse.ok) throw new Error();
        const dData = await directResponse.json();
        responseText = dData.choices?.[0]?.message?.content || "No agenda returned.";
      }

      const aiMsg: DiscussionMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: "AI Facilitator",
        role: "ai",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const groupHistory = messages[selectedGroupId] || [];
      saveMessages({
        ...messages,
        [selectedGroupId]: [...groupHistory, aiMsg]
      });

    } catch (err: any) {
      setError("Failed to create study agenda. Check your OpenAI configuration.");
    } finally {
      setIsAiThinking(false);
    }
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const activeMessages = selectedGroup ? (messages[selectedGroup.id] || []) : [];

  return (
    <div id="study-groups-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div id="study-groups-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2EC] text-[#c67f43] flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl text-[#221C18] tracking-tight">Study Groups Facilitator</h1>
            <p className="text-xs text-stone-500 font-medium">Coordinate collaborative study sessions, invite friends, and run AI-moderated study agendas.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Study Groups List & Creator Form */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Create Group Form */}
          <div id="create-group-card" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#c67f43]" /> Launch Study Circle
            </h2>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Group Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. MCAT Bio Study Buddies" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Subject *</label>
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
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Meeting Slot</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Fri at 3pm" 
                    value={nextMeeting}
                    onChange={(e) => setNextMeeting(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Venue / Link</label>
                <input 
                  type="text" 
                  placeholder="e.g. Zoom link or Room 402" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Goal description</label>
                <textarea 
                  rows={2}
                  placeholder="What is this group working on?" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl p-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Create Group
              </button>
            </form>
          </div>

          {/* Saved Groups */}
          <div id="saved-groups-card" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-3">Your Study Circles</h2>
            
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-xs text-stone-400">Launch a study group above to begin!</p>
              ) : (
                groups.map((g) => {
                  const isSelected = g.id === selectedGroupId;
                  return (
                    <div 
                      key={g.id}
                      onClick={() => setSelectedGroupId(g.id)}
                      className={`p-3 border rounded-xl cursor-pointer group transition-all flex items-start justify-between gap-2 ${
                        isSelected 
                          ? "border-[#c67f43] bg-[#FAF2EC]/50" 
                          : "border-[#EFECE6] hover:bg-stone-50"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-stone-800 truncate">{g.name}</p>
                        <span className="text-[10px] text-stone-400 font-semibold">{g.subject} • {g.membersCount} members</span>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(g.id);
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

        {/* Right: Selected Study Group Workspace with AI Facilitator Chat */}
        <div className="lg:col-span-8">
          {selectedGroup ? (
            <div className="space-y-6 text-left">
              
              {/* Group Metadata Bar */}
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-[#FAF2EC] text-[#c67f43] px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {selectedGroup.subject}
                  </span>
                  <h2 className="text-base font-bold text-stone-800">{selectedGroup.name}</h2>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">{selectedGroup.description}</p>
                </div>

                <div className="flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-stone-100 pt-3 md:pt-0 md:pl-5">
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 font-bold">
                    <Calendar className="w-4 h-4 text-[#c67f43]" />
                    <span>{selectedGroup.nextMeeting}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 font-bold">
                    <MapPin className="w-4 h-4 text-[#c67f43]" />
                    <span className="truncate max-w-44">{selectedGroup.location}</span>
                  </div>
                </div>
              </div>

              {/* Chat & AI Facilitator Container */}
              <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden flex flex-col h-[500px] shadow-2xs">
                
                {/* Chat header */}
                <div className="bg-stone-50 border-b border-stone-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-stone-700">Cozy Study Circle Chat & AI Facilitator</span>
                  </div>

                  <button 
                    onClick={handleGenerateAgenda}
                    disabled={isAiThinking}
                    className="bg-[#FAF2EC] hover:bg-[#FAF2EC]/80 border border-[#FAF2EC] text-[#c67f43] text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Generate Meeting Agenda</span>
                  </button>
                </div>

                {/* Messages Panel */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#FAF8F5]/30">
                  <AnimatePresence initial={false}>
                    {activeMessages.map((msg) => {
                      const isAi = msg.role === "ai";
                      const isUser = msg.role === "user";
                      
                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                        >
                          <span className="text-[10px] text-stone-400 font-bold px-1">{msg.sender}</span>
                          <div 
                            className={`max-w-xl p-3 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap text-left shadow-2xs border ${
                              isUser 
                                ? "bg-[#c67f43] text-white border-[#c67f43]" 
                                : isAi 
                                  ? "bg-white text-stone-700 border-amber-200/50 relative overflow-hidden" 
                                  : "bg-stone-100 text-stone-600 border-stone-200"
                            }`}
                          >
                            {isAi && (
                              <div className="absolute right-2 top-2 opacity-5 pointer-events-none">
                                <Sparkles className="w-12 h-12 text-[#c67f43]" />
                              </div>
                            )}
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-stone-400 px-1">{msg.timestamp}</span>
                        </div>
                      );
                    })}
                  </AnimatePresence>

                  {isAiThinking && (
                    <div className="flex items-center gap-2.5 p-3 bg-white border border-stone-100 rounded-xl max-w-xs text-xs text-stone-500 font-medium">
                      <svg className="animate-spin h-4 w-4 text-[#c67f43]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>AI Facilitator is preparing response...</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="bg-white border-t border-stone-100 p-4 flex gap-2">
                  <input 
                    type="text"
                    required
                    placeholder="Ask AI study coach, outline a concept, or type a group chat message..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    className="flex-grow bg-stone-50 border border-[#EFECE6] rounded-xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white font-medium"
                  />
                  <button 
                    type="submit"
                    className="bg-[#c67f43] hover:bg-[#b06f38] text-white p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#EFECE6] rounded-2xl p-12 shadow-2xs text-center flex flex-col items-center justify-center space-y-3 h-[450px]">
              <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-[#c67f43]">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-700">No active study group selected</h3>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Choose a study group from the left sidebar or create a new one to join discussion, consult your AI Facilitator, and run structured group prep meetings.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
