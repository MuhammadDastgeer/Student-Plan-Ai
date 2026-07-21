import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  Sparkles, 
  Plus, 
  Trash2, 
  TrendingUp, 
  HelpCircle, 
  AlertCircle,
  Percent,
  CheckCircle,
  GraduationCap
} from "lucide-react";

interface GradeComponent {
  id: string;
  name: string;
  score: number; // percentage e.g. 85
  weight: number; // percentage e.g. 20
}

interface Course {
  id: string;
  name: string;
  credits: number;
  components: GradeComponent[];
}

export default function StudyGradeTracker() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("3");

  // Add Component state
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [compName, setCompName] = useState("");
  const [compScore, setCompScore] = useState("");
  const [compWeight, setCompWeight] = useState("");

  // AI Analyst state
  const [aiAnalysis, setAiAnalysis] = useState("Log your courses and assessment scores first, then click 'Analyze Grades with AI' to generate custom study focus tips, priority warnings, and tactical advice to maximize your GPA!");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("flowbase_courses");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCourses(parsed);
        if (parsed.length > 0) {
          setSelectedCourseId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setCourses([]);
      setSelectedCourseId("");
      localStorage.setItem("flowbase_courses", JSON.stringify([]));
    }
  }, []);

  const saveCourses = (updated: Course[]) => {
    setCourses(updated);
    localStorage.setItem("flowbase_courses", JSON.stringify(updated));
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    const newCourse: Course = {
      id: `c-${Date.now()}`,
      name: courseName.trim(),
      credits: parseInt(credits) || 3,
      components: []
    };

    const updated = [...courses, newCourse];
    saveCourses(updated);
    setSelectedCourseId(newCourse.id);
    setCourseName("");
    setCredits("3");
  };

  const handleDeleteCourse = (id: string) => {
    const updated = courses.filter(c => c.id !== id);
    saveCourses(updated);
    if (selectedCourseId === id) {
      setSelectedCourseId(updated.length > 0 ? updated[0].id : "");
    }
  };

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim() || !compScore || !compWeight || !selectedCourseId) return;

    const scoreNum = parseFloat(compScore);
    const weightNum = parseFloat(compWeight);

    if (isNaN(scoreNum) || isNaN(weightNum)) return;

    const updated = courses.map(c => {
      if (c.id === selectedCourseId) {
        const newComp: GradeComponent = {
          id: `comp-${Date.now()}`,
          name: compName.trim(),
          score: scoreNum,
          weight: weightNum
        };
        return {
          ...c,
          components: [...c.components, newComp]
        };
      }
      return c;
    });

    saveCourses(updated);
    setCompName("");
    setCompScore("");
    setCompWeight("");
  };

  const handleDeleteComponent = (courseId: string, compId: string) => {
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          components: c.components.filter(cp => cp.id !== compId)
        };
      }
      return c;
    });
    saveCourses(updated);
  };

  // Calculations
  const calculateCourseStats = (course: Course) => {
    if (course.components.length === 0) return { percent: 0, weightSum: 0, letter: "N/A", gpa: 0 };
    
    let totalWeightedScore = 0;
    let totalWeight = 0;

    course.components.forEach(c => {
      totalWeightedScore += (c.score * c.weight);
      totalWeight += c.weight;
    });

    // Weighted percentage of completed evaluations
    const percent = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    // Standard letter grading map
    let letter = "F";
    let gpa = 0.0;

    if (percent >= 90) { letter = "A"; gpa = 4.0; }
    else if (percent >= 85) { letter = "B+"; gpa = 3.5; }
    else if (percent >= 80) { letter = "B"; gpa = 3.0; }
    else if (percent >= 75) { letter = "C+"; gpa = 2.5; }
    else if (percent >= 70) { letter = "C"; gpa = 2.0; }
    else if (percent >= 60) { letter = "D"; gpa = 1.0; }

    return { 
      percent: Math.round(percent * 10) / 10, 
      weightSum: totalWeight,
      letter, 
      gpa 
    };
  };

  const calculateOverallGPA = () => {
    if (courses.length === 0) return 0.0;
    
    let totalGpaPoints = 0;
    let totalCredits = 0;
    let gradedCoursesCount = 0;

    courses.forEach(c => {
      if (c.components.length > 0) {
        const stats = calculateCourseStats(c);
        totalGpaPoints += (stats.gpa * c.credits);
        totalCredits += c.credits;
        gradedCoursesCount++;
      }
    });

    if (totalCredits === 0) return 0.0;
    const finalGpa = totalGpaPoints / totalCredits;
    return Math.round(finalGpa * 100) / 100;
  };

  // OpenAI Grade Analyzer
  const handleAnalyzeGrades = async () => {
    if (courses.length === 0) return;
    setIsAnalyzing(true);
    setError("");

    const clientApiKey = localStorage.getItem("openai_api_key") || "";
    
    // Construct simplified JSON representing student standing
    const standingContext = courses.map(c => {
      const stats = calculateCourseStats(c);
      return {
        course: c.name,
        credits: c.credits,
        gradePercentage: `${stats.percent}%`,
        gradeLetter: stats.letter,
        evaluationsLoaded: c.components.map(cp => `${cp.name}: ${cp.score}% (weight: ${cp.weight}%)`)
      };
    });

    const systemPrompt = `You are an expert academic GPA coach and data analyst.
Analyze the provided student courses and their completed grade assessment components.
Formulate a highly strategic, customized, and motivating study strategy report.
Your advice MUST:
1. Identify which courses are in danger or have the lowest scores.
2. Outline specific advice based on weighting (e.g. "Your CS final is 40% of grade, prioritize study of the midterm material!").
3. Suggest study adjustments to boost overall term GPA.
Write in a supportive, helpful tone. You can use Roman-Urdu / Hindi blocks if helpful to make advice friendly. Keep it concise (around 250 words) with beautiful markdown headers.`;

    try {
      let responseText = "";

      // Try Backend proxy first
      try {
        const response = await fetch("/api/notes/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Analyze these courses: ${JSON.stringify(standingContext)}. Provide grade-boosting advice.`,
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
              { role: "user", content: `My Grades: ${JSON.stringify(standingContext)}` }
            ],
            temperature: 0.7
          })
        });

        if (!directResponse.ok) {
          throw new Error("OpenAI API returned an error.");
        }

        const dData = await directResponse.json();
        responseText = dData.choices?.[0]?.message?.content || "No analysis returned.";
      }

      setAiAnalysis(responseText);
    } catch (err: any) {
      console.error(err);
      setError("Failed to consult Cozy AI. Please check your OpenAI API key settings.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const activeOverallGpa = calculateOverallGPA();

  return (
    <div id="grade-tracker-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div id="grade-tracker-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2EC] text-[#c67f43] flex items-center justify-center shadow-xs">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl text-[#221C18] tracking-tight">GPA & Grade Tracker</h1>
            <p className="text-xs text-stone-500 font-medium">Record assessment evaluations, calculate weighted course grades, and monitor overall semester GPA.</p>
          </div>
        </div>

        {/* Big Overall GPA Badge */}
        <div className="bg-[#FAF2EC] border border-[#FAF2EC] rounded-2xl px-6 py-3 shrink-0 text-center sm:text-right">
          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Calculated GPA</p>
          <p className="text-3xl font-mono font-bold text-[#c67f43] mt-0.5">{activeOverallGpa.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Course Creator & Course List */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Quick Create Course */}
          <div id="add-course-card" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#c67f43]" /> New Subject / Course
            </h2>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Course Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Calculus II, Biochemistry" 
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] focus:bg-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Credit Hours / Weight Weighting</label>
                <select 
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl px-3 py-2.5 text-xs text-stone-700 font-semibold focus:outline-none focus:border-[#c67f43]"
                >
                  <option value="1">1 Credit Hour</option>
                  <option value="2">2 Credit Hours</option>
                  <option value="3">3 Credit Hours</option>
                  <option value="4">4 Credit Hours</option>
                  <option value="5">5 Credit Hours</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Add Course
              </button>
            </form>
          </div>

          {/* Course Selection List */}
          <div id="courses-selector-sidebar" className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-3">Your Course Enrollments</h2>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {courses.length === 0 ? (
                <p className="text-xs text-stone-400">No courses logged yet. Add one above!</p>
              ) : (
                courses.map((c) => {
                  const isSelected = c.id === selectedCourseId;
                  const stats = calculateCourseStats(c);

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                      className={`p-3 border rounded-xl cursor-pointer group transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? "border-[#c67f43] bg-[#FAF2EC]/50" 
                          : "border-[#EFECE6] hover:bg-stone-50"
                      }`}
                    >
                      <div className="overflow-hidden text-left">
                        <p className="text-xs font-bold text-stone-800 truncate">{c.name}</p>
                        <span className="text-[10px] text-stone-400 font-bold">{c.credits} credit hours</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {c.components.length > 0 && (
                          <span className="bg-[#FAF2EC] text-[#c67f43] text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                            {stats.percent}% ({stats.letter})
                          </span>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(c.id);
                          }}
                          className="p-1 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Grades Evaluation List & AI Advisor */}
        <div className="lg:col-span-8 space-y-6">
          
          {selectedCourse ? (
            <div className="space-y-6 text-left">
              
              {/* Active Course Details & Course Evaluator List */}
              <div id="course-grades-card" className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold bg-[#FAF2EC] text-[#c67f43] px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Grade Sheet
                    </span>
                    <h2 className="text-base font-bold text-stone-800 mt-2">{selectedCourse.name}</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-stone-50 border border-[#EFECE6] rounded-xl text-center">
                      <p className="text-[8px] text-stone-400 font-bold uppercase">Weight Evaluated</p>
                      <p className="text-xs font-extrabold text-stone-700">{calculateCourseStats(selectedCourse).weightSum}%</p>
                    </div>
                    <div className="px-3 py-1.5 bg-stone-50 border border-[#EFECE6] rounded-xl text-center">
                      <p className="text-[8px] text-stone-400 font-bold uppercase">Average</p>
                      <p className="text-xs font-extrabold text-[#c67f43]">{calculateCourseStats(selectedCourse).percent}%</p>
                    </div>
                    <div className="px-3 py-1.5 bg-[#FAF2EC] border border-[#FAF2EC] rounded-xl text-center">
                      <p className="text-[8px] text-[#c67f43] font-bold uppercase">Letter Grade</p>
                      <p className="text-xs font-mono font-black text-[#c67f43]">{calculateCourseStats(selectedCourse).letter}</p>
                    </div>
                  </div>
                </div>

                {/* Log assessment component form */}
                <form onSubmit={handleAddComponent} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50/50 border border-[#EFECE6] p-4 rounded-2xl items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Assessment Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Quiz 1, Midterm" 
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="w-full bg-white border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Score (Percentage %)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="150"
                      required
                      placeholder="e.g. 90" 
                      value={compScore}
                      onChange={(e) => setCompScore(e.target.value)}
                      className="w-full bg-white border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] font-medium"
                    />
                  </div>
                  <div className="space-y-1 flex gap-2 items-end">
                    <div className="flex-grow space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase">Weight (% of total grade)</label>
                      <input 
                        type="number" 
                        min="1"
                        max="100"
                        required
                        placeholder="e.g. 20" 
                        value={compWeight}
                        onChange={(e) => setCompWeight(e.target.value)}
                        className="w-full bg-white border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c67f43] font-medium"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 transition-colors cursor-pointer"
                    >
                      Log Score
                    </button>
                  </div>
                </form>

                {/* List of completed Evaluations */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                    Logged Evaluations
                  </h3>

                  {selectedCourse.components.length === 0 ? (
                    <p className="text-xs text-stone-400 py-3">No scores logged for this course yet. Log your first midterm, test, or homework above!</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                      {selectedCourse.components.map((cp) => (
                        <div key={cp.id} className="flex items-center justify-between p-3 bg-stone-50/50 border border-[#EFECE6] rounded-xl">
                          <p className="text-xs font-bold text-stone-700">{cp.name}</p>
                          
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-xs font-bold text-stone-500">Weight: {cp.weight}%</span>
                            <span className="bg-white border border-stone-100 text-stone-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                              {cp.score}%
                            </span>
                            <button 
                              onClick={() => handleDeleteComponent(selectedCourse.id, cp.id)}
                              className="p-1 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* AI Strategic GPA Analysis Column */}
              <div id="ai-grade-analyst" className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg text-[#c67f43] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">AI GPA Strategic Analysis</h3>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">Optimized coaching report</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleAnalyzeGrades}
                    disabled={isAnalyzing}
                    className="text-xs font-bold bg-[#c67f43] hover:bg-[#b06f38] text-white px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAnalyzing ? "Analyzing Standings..." : "Analyze Grades with AI"}
                  </button>
                </div>

                <div className="bg-stone-50/50 border border-stone-100 rounded-2xl p-4 sm:p-5 min-h-24 max-h-[300px] overflow-y-auto">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <svg className="animate-spin h-5 w-5 text-[#c67f43]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Cozy AI is analyzing your grades context...</p>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-700 font-medium leading-relaxed whitespace-pre-wrap text-left">
                      {aiAnalysis}
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#EFECE6] rounded-2xl p-12 shadow-2xs text-center flex flex-col items-center justify-center space-y-3 h-[450px]">
              <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-[#c67f43]">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-700">No active course selected</h3>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Add a course on the left sidebar and select it to manage your evaluations, tests, and homework score weighings.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
