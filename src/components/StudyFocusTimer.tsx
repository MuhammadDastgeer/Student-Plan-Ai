import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Coffee, 
  Brain,
  History,
  AlertCircle
} from "lucide-react";

interface FocusSession {
  id: string;
  topic: string;
  duration: number; // in minutes
  timestamp: string;
}

export default function StudyFocusTimer() {
  // Timer States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [customTime, setCustomTime] = useState("25");

  // Topic state
  const [topic, setTopic] = useState("");

  // History state
  const [history, setHistory] = useState<FocusSession[]>([]);

  // Soundscape State
  const [soundscape, setSoundscape] = useState<"none" | "rain" | "cafe" | "lofi">("none");
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // AI Motivator State
  const [motivationText, setMotivationText] = useState("Your mind is a muscle. Give it focus and watch it grow. Click 'Get AI Motivation' to get custom study advice!");
  const [isMotivating, setIsMotivating] = useState(false);

  // Interval reference
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem("flowbase_focus_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveHistory = (newHistory: FocusSession[]) => {
    setHistory(newHistory);
    localStorage.setItem("flowbase_focus_history", JSON.stringify(newHistory));
  };

  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer complete
            handleTimerComplete();
          } else {
            setMinutes(prev => prev - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(prev => prev - 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Play browser notification chime (Web Audio synthesiser)
    playChime();

    if (!isBreak) {
      // Record completed session
      const currentTopic = topic.trim() || "General Study";
      const sessionDuration = parseInt(customTime) || 25;
      
      const newSession: FocusSession = {
        id: `session-${Date.now()}`,
        topic: currentTopic,
        duration: sessionDuration,
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      saveHistory([newSession, ...history]);
      
      // Auto switch to break (5 mins)
      setIsBreak(true);
      setMinutes(5);
      setSeconds(0);
      setMotivationText("Incredible focus! Time for a well-deserved 5-minute break. Stand up, stretch, and grab some water!");
    } else {
      // Return to focus mode
      setIsBreak(false);
      const customFocusMins = parseInt(customTime) || 25;
      setMinutes(customFocusMins);
      setSeconds(0);
      setMotivationText("Break is over. Let's gear up for another focused session! Put away your phone and dive in.");
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    const customFocusMins = parseInt(customTime) || 25;
    setMinutes(customFocusMins);
    setSeconds(0);
  };

  const handleApplyCustomTime = (mins: number) => {
    setIsActive(false);
    setIsBreak(false);
    setCustomTime(mins.toString());
    setMinutes(mins);
    setSeconds(0);
  };

  // Synthesize ambient rain-noise or hum using Web Audio API safely
  const startAmbianceAudio = (type: "rain" | "cafe" | "lofi") => {
    stopAmbianceAudio();
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Create a procedural audio synthesizer for background rain/hum
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Populate white-noise or soft low hum
      for (let i = 0; i < bufferSize; i++) {
        if (type === "rain") {
          // Pink-ish noise filter: random with high frequency roll-off
          data[i] = (Math.random() * 2 - 1) * 0.15;
        } else if (type === "cafe") {
          // Very warm murmur hum (low-passed waves)
          data[i] = Math.sin(i * 0.01) * 0.05 + (Math.random() * 2 - 1) * 0.04;
        } else {
          // Lofi binaural beat generator
          data[i] = Math.sin(i * 0.005) * 0.06 + Math.sin(i * 0.0052) * 0.06;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter Node to make sounds soft and cozy
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = type === "rain" ? 800 : type === "cafe" ? 400 : 300;

      // Volume Gain Node
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      noiseNodeRef.current = noiseSource;
    } catch (e) {
      console.warn("Failed to initialize Web Audio Ambiance:", e);
    }
  };

  const stopAmbianceAudio = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note
      
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {}
  };

  const handleSoundscapeToggle = (type: "none" | "rain" | "cafe" | "lofi") => {
    if (soundscape === type) {
      setSoundscape("none");
      stopAmbianceAudio();
    } else {
      setSoundscape(type);
      if (type !== "none") {
        startAmbianceAudio(type);
      } else {
        stopAmbianceAudio();
      }
    }
  };

  useEffect(() => {
    return () => {
      stopAmbianceAudio();
    };
  }, []);

  // AI Motivator Generator
  const handleGetMotivation = async () => {
    setIsMotivating(true);
    const clientApiKey = localStorage.getItem("openai_api_key") || "";
    
    const targetStudyTopic = topic.trim() || "general computer science, math, or exams";
    const systemPrompt = `You are Cozy AI, an empathetic academic coach and motivational mentor.
The student is currently in a high-focus study session studying: "${targetStudyTopic}".
Your goal is to write a highly inspiring, motivating, and warm study tip or quote.
You must return a response that is warm and encouraging.
Write a mix of English and Roman-Urdu / Hindi (e.g. "Sabar aur consistency hi aapki kamyabi ki chabi hai. Keep pushing, you've got this!") to make it feel deeply personal and relatable.
Keep your response short, inspiring, and limited to 2-3 sentences.`;

    try {
      // Try backend proxy
      try {
        const res = await fetch("/api/notes/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Give me 1 study motivation tip/quote for studying: "${targetStudyTopic}"`,
            context: systemPrompt,
            apiKey: clientApiKey || undefined
          })
        });

        if (res.ok) {
          const data = await res.json();
          setMotivationText(data.response);
          setIsMotivating(false);
          return;
        }
      } catch (err) {
        console.warn("Backend fail, falling back to direct openai", err);
      }

      // Direct OpenAI fetch fallback
      const activeKey = clientApiKey.trim() || (import.meta as any).env?.VITE_OPENAI_API_KEY?.trim() || "";
      if (!activeKey) {
        throw new Error("No OpenAI Key found. Set it in Settings -> AI settings.");
      }

      const directRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Give me a study motivation quote.` }
          ],
          temperature: 0.8
        })
      });

      if (!directRes.ok) throw new Error();
      const dData = await directRes.json();
      setMotivationText(dData.choices?.[0]?.message?.content || "Consistency and focus build genius. Keep studying!");
    } catch (e) {
      setMotivationText("Zehn ka sukoon aur consistency hi kamyabi deti hai. Focus and study hard, you are closer to your goal than you think!");
    } finally {
      setIsMotivating(false);
    }
  };

  const formatTime = (mins: number, secs: number) => {
    const mm = mins < 10 ? `0${mins}` : mins;
    const ss = secs < 10 ? `0${secs}` : secs;
    return `${mm}:${ss}`;
  };

  const progressPercentage = () => {
    const total = (isBreak ? 5 : (parseInt(customTime) || 25)) * 60;
    const remaining = minutes * 60 + seconds;
    return ((total - remaining) / total) * 100;
  };

  return (
    <div id="focus-timer-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div id="focus-timer-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2EC] text-[#c67f43] flex items-center justify-center shadow-xs">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl text-[#221C18] tracking-tight">Cozy Focus Timer</h1>
            <p className="text-xs text-stone-500 font-medium">Immerse yourself in deep study with Pomodoro tracking and relaxing, procedural ambient sounds.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Timer & sound options */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Visual Clock */}
          <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col items-center justify-center text-center relative overflow-hidden">
            
            {/* Soft decorative background gradient indicating state */}
            <div className={`absolute inset-0 opacity-10 transition-colors duration-700 ${isBreak ? "bg-emerald-500" : "bg-[#c67f43]"}`} />

            {/* Session Type Badge */}
            <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider relative z-10 ${
              isBreak ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-[#FAF2EC] text-[#c67f43] border border-[#FAF2EC]"
            }`}>
              {isBreak ? (
                <span className="flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5 animate-bounce" /> Break Time</span>
              ) : (
                <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 animate-pulse" /> Focus Mode</span>
              )}
            </span>

            {/* Circular progress container */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 my-6 flex items-center justify-center z-10">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r="45%" 
                  stroke="#FAF8F5" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r="45%" 
                  stroke={isBreak ? "#10B981" : "#c67f43"} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="283%"
                  strokeDashoffset={`${283 - (283 * progressPercentage()) / 100}%`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              <div className="flex flex-col items-center">
                <span className="text-4xl sm:text-5xl font-mono font-bold text-[#221C18] tracking-tight">
                  {formatTime(minutes, seconds)}
                </span>
                <span className="text-[11px] text-stone-400 font-bold tracking-widest uppercase mt-1">
                  Remaining
                </span>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="flex items-center gap-2 mb-6 z-10">
              <button 
                onClick={() => handleApplyCustomTime(25)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  customTime === "25" && !isBreak 
                    ? "bg-[#c67f43] border-[#c67f43] text-white" 
                    : "bg-stone-50 border-[#EFECE6] text-stone-600 hover:bg-stone-100"
                }`}
              >
                25m Focus
              </button>
              <button 
                onClick={() => handleApplyCustomTime(50)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  customTime === "50" && !isBreak 
                    ? "bg-[#c67f43] border-[#c67f43] text-white" 
                    : "bg-stone-50 border-[#EFECE6] text-stone-600 hover:bg-stone-100"
                }`}
              >
                50m Focus
              </button>
              <button 
                onClick={() => handleApplyCustomTime(15)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  customTime === "15" && !isBreak 
                    ? "bg-[#c67f43] border-[#c67f43] text-white" 
                    : "bg-stone-50 border-[#EFECE6] text-stone-600 hover:bg-stone-100"
                }`}
              >
                15m Sprint
              </button>
            </div>

            {/* Timer Core Actions */}
            <div className="flex items-center gap-4 z-10">
              <button 
                onClick={resetTimer}
                className="p-3.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl shadow-2xs transition-colors cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button 
                onClick={toggleTimer}
                className={`px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? "bg-stone-800 hover:bg-stone-900" 
                    : "bg-[#c67f43] hover:bg-[#b06f38]"
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" /> Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Start Session
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Soundscapes Ambiance Selector */}
          <div className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs text-left space-y-4">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#c67f43]" /> Study Soundscapes (White Noise)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button 
                onClick={() => handleSoundscapeToggle("none")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  soundscape === "none" 
                    ? "border-stone-800 bg-stone-50 font-bold" 
                    : "border-[#EFECE6] hover:bg-stone-50/50"
                }`}
              >
                <VolumeX className="w-5 h-5 text-stone-400 mb-1" />
                <span className="text-[11px] text-stone-700">None (Silent)</span>
              </button>

              <button 
                onClick={() => handleSoundscapeToggle("rain")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  soundscape === "rain" 
                    ? "border-[#c67f43] bg-[#FAF2EC]/30 font-bold text-[#c67f43]" 
                    : "border-[#EFECE6] hover:bg-stone-50/50"
                }`}
              >
                <span className="w-5 h-5 text-lg mb-1">🌧️</span>
                <span className="text-[11px] text-stone-700">Cozy Rain</span>
              </button>

              <button 
                onClick={() => handleSoundscapeToggle("cafe")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  soundscape === "cafe" 
                    ? "border-[#c67f43] bg-[#FAF2EC]/30 font-bold text-[#c67f43]" 
                    : "border-[#EFECE6] hover:bg-stone-50/50"
                }`}
              >
                <span className="w-5 h-5 text-lg mb-1">☕</span>
                <span className="text-[11px] text-stone-700">Paris Cafe</span>
              </button>

              <button 
                onClick={() => handleSoundscapeToggle("lofi")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  soundscape === "lofi" 
                    ? "border-[#c67f43] bg-[#FAF2EC]/30 font-bold text-[#c67f43]" 
                    : "border-[#EFECE6] hover:bg-stone-50/50"
                }`}
              >
                <span className="w-5 h-5 text-lg mb-1">🎸</span>
                <span className="text-[11px] text-stone-700">Lofi Beats</span>
              </button>
            </div>

            {soundscape !== "none" && (
              <div className="flex items-center gap-2 p-2 px-3 bg-stone-50 rounded-xl border border-stone-200/50 text-[11px] text-stone-500 font-semibold animate-pulse">
                <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 bg-[#c67f43] h-2 animate-bounce" />
                  <div className="w-0.5 bg-[#c67f43] h-3 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-0.5 bg-[#c67f43] h-1 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Playing {soundscape} ambiance in the background...</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: AI Motivator & Focus Log */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Active study topic context */}
          <div className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">What are you studying today?</h3>
            <div className="space-y-1">
              <input 
                type="text" 
                placeholder="e.g. Preparing for Calculus II Mid-term, Biochem, French..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white font-medium"
              />
              <p className="text-[10px] text-stone-400 font-semibold">Your topic will be used to customize your AI study tips.</p>
            </div>
          </div>

          {/* AI Study Coach Motivation Box */}
          <div className="bg-[#FAF2EC]/30 border border-[#FAF2EC] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#c67f43] font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI Study Coach</span>
              </div>
              <button 
                onClick={handleGetMotivation}
                disabled={isMotivating}
                className="text-[11px] font-bold bg-[#c67f43] hover:bg-[#b06f38] text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-60"
              >
                {isMotivating ? "Thinking..." : "Get AI Motivation"}
              </button>
            </div>

            <div className="bg-white border border-[#FAF2EC]/60 rounded-xl p-4 min-h-24 flex items-center justify-center">
              {isMotivating ? (
                <div className="flex flex-col items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-[#c67f43]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Preparing cozy inspiration...</p>
                </div>
              ) : (
                <p className="text-xs text-stone-700 font-medium leading-relaxed italic text-center">
                  "{motivationText}"
                </p>
              )}
            </div>
          </div>

          {/* Focus Logs History */}
          <div className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-stone-400" /> Focus Log History
            </h3>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-stone-400">Complete your first study Pomodoro session to log your progress!</p>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="p-3 bg-stone-50 border border-stone-100 rounded-xl flex items-center justify-between gap-3 text-left">
                    <div>
                      <p className="text-xs font-bold text-stone-800 truncate">{h.topic}</p>
                      <span className="text-[10px] text-stone-400 font-semibold">{h.timestamp}</span>
                    </div>
                    <span className="bg-[#FAF2EC] text-[#c67f43] text-[10px] font-extrabold px-2 py-1 rounded-md shrink-0">
                      +{h.duration}m
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
