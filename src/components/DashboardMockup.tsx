import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Calendar, CheckSquare, Plus, Trash2, Clipboard } from "lucide-react";

export default function DashboardMockup() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Research", category: "plan" },
    { id: 2, text: "Brief", category: "plan" },
    { id: 3, text: "AI flow", category: "build" },
    { id: 4, text: "Whiteboard", category: "build" },
    { id: 5, text: "Comments", category: "review" },
    { id: 6, text: "Calendar", category: "review" },
  ]);

  const [newTaskTexts, setNewTaskTexts] = useState({
    plan: "",
    build: "",
    review: "",
  });

  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  const addTask = (category: "plan" | "build" | "review") => {
    const text = newTaskTexts[category].trim();
    if (!text) return;

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        category,
      },
    ]);
    setNewTaskTexts((prev) => ({ ...prev, [category]: "" }));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Calculate dynamic stats
  const planCount = tasks.filter((t) => t.category === "plan").length;
  const buildCount = tasks.filter((t) => t.category === "build").length;
  const reviewCount = tasks.filter((t) => t.category === "review").length;

  const totalTasks = tasks.length * 7; // scale for mockup visual consistency with 42, 18, 9
  const aiDrafts = Math.max(12, Math.round(totalTasks * 0.4));
  const eventsCount = Math.max(4, Math.round(totalTasks * 0.2));

  return (
    <div 
      id="dashboard-mockup-container" 
      className="w-full max-w-2xl bg-white rounded-2xl border border-[#F3EFE9] shadow-[0_20px_50px_rgba(28,21,16,0.06)] p-6 md:p-8 font-sans relative overflow-hidden"
    >
      {/* Decorative window controls */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F9F7F4]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
          <span className="text-xs text-stone-400 font-medium ml-2">Launch workspace</span>
        </div>
        <div className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#c67f43] animate-pulse inline-block" />
          Workspace Active
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Tasks Stat */}
        <motion.div
          onMouseEnter={() => setHoveredStat("tasks")}
          onMouseLeave={() => setHoveredStat(null)}
          className="bg-[#EAF7ED] border border-[#DCF2E2] rounded-xl p-3 md:p-4 transition-all relative overflow-hidden cursor-pointer group"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#1E5A35] font-medium">Tasks</span>
            <CheckSquare className="w-3.5 h-3.5 text-[#1E5A35] opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-2xl md:text-3xl font-semibold text-[#15803D] font-serif">
            {hoveredStat === "tasks" ? tasks.length : 42}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#15803D] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </motion.div>

        {/* AI Drafts Stat */}
        <motion.div
          onMouseEnter={() => setHoveredStat("ai")}
          onMouseLeave={() => setHoveredStat(null)}
          className="bg-[#F1EAFA] border border-[#EDE3FA] rounded-xl p-3 md:p-4 transition-all relative overflow-hidden cursor-pointer group"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#5E3A8C] font-medium font-sans">AI drafts</span>
            <Sparkles className="w-3.5 h-3.5 text-[#5E3A8C] opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-2xl md:text-3xl font-semibold text-[#7C3AED] font-serif">
            {hoveredStat === "ai" ? aiDrafts - 4 : 18}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#7C3AED] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </motion.div>

        {/* Events Stat */}
        <motion.div
          onMouseEnter={() => setHoveredStat("events")}
          onMouseLeave={() => setHoveredStat(null)}
          className="bg-[#FAF2EB] border border-[#F7EBE1] rounded-xl p-3 md:p-4 transition-all relative overflow-hidden cursor-pointer group"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#8C4E2D] font-medium">Events</span>
            <Calendar className="w-3.5 h-3.5 text-[#8C4E2D] opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-2xl md:text-3xl font-semibold text-[#EA580C] font-serif">
            {hoveredStat === "events" ? eventsCount + 2 : 9}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EA580C] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </motion.div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Plan Column */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold text-stone-700 tracking-wide">Plan</span>
            <span className="bg-[#E0F2FE] text-[#0369A1] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
              Active
            </span>
          </div>
          <div className="space-y-2 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#F1EFEA] min-h-[140px] flex flex-col justify-between">
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-0.5">
              {tasks
                .filter((t) => t.category === "plan")
                .map((task) => (
                  <div
                    key={task.id}
                    className="group/item flex items-center justify-between bg-white border border-[#EFECE6] rounded-lg px-2.5 py-1.5 text-xs text-stone-700 shadow-sm"
                  >
                    <span>{task.text}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover/item:opacity-100 text-stone-400 hover:text-red-500 transition-opacity cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>

            <div className="mt-2 flex items-center gap-1">
              <input
                type="text"
                placeholder="New Plan..."
                value={newTaskTexts.plan}
                onChange={(e) =>
                  setNewTaskTexts((prev) => ({ ...prev, plan: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && addTask("plan")}
                className="w-full bg-white border border-[#EFECE6] rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[#c67f43] placeholder-stone-400 text-stone-700"
              />
              <button
                onClick={() => addTask("plan")}
                className="bg-[#c67f43] hover:bg-[#b06f38] text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Build Column */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold text-stone-700 tracking-wide">Build</span>
            <span className="bg-[#FEF3C7] text-[#D97706] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
              Work
            </span>
          </div>
          <div className="space-y-2 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#F1EFEA] min-h-[140px] flex flex-col justify-between">
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-0.5">
              {tasks
                .filter((t) => t.category === "build")
                .map((task) => (
                  <div
                    key={task.id}
                    className="group/item flex items-center justify-between bg-white border border-[#EFECE6] rounded-lg px-2.5 py-1.5 text-xs text-stone-700 shadow-sm"
                  >
                    <span>{task.text}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover/item:opacity-100 text-stone-400 hover:text-red-500 transition-opacity cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>

            <div className="mt-2 flex items-center gap-1">
              <input
                type="text"
                placeholder="New Build..."
                value={newTaskTexts.build}
                onChange={(e) =>
                  setNewTaskTexts((prev) => ({ ...prev, build: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && addTask("build")}
                className="w-full bg-white border border-[#EFECE6] rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[#c67f43] placeholder-stone-400 text-stone-700"
              />
              <button
                onClick={() => addTask("build")}
                className="bg-[#c67f43] hover:bg-[#b06f38] text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Review Column */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold text-stone-700 tracking-wide">Review</span>
            <span className="bg-[#DCFCE7] text-[#15803D] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
              Audit
            </span>
          </div>
          <div className="space-y-2 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#F1EFEA] min-h-[140px] flex flex-col justify-between">
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-0.5">
              {tasks
                .filter((t) => t.category === "review")
                .map((task) => (
                  <div
                    key={task.id}
                    className="group/item flex items-center justify-between bg-white border border-[#EFECE6] rounded-lg px-2.5 py-1.5 text-xs text-stone-700 shadow-sm"
                  >
                    <span>{task.text}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover/item:opacity-100 text-stone-400 hover:text-red-500 transition-opacity cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>

            <div className="mt-2 flex items-center gap-1">
              <input
                type="text"
                placeholder="New Review..."
                value={newTaskTexts.review}
                onChange={(e) =>
                  setNewTaskTexts((prev) => ({ ...prev, review: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && addTask("review")}
                className="w-full bg-white border border-[#EFECE6] rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[#c67f43] placeholder-stone-400 text-stone-700"
              />
              <button
                onClick={() => addTask("review")}
                className="bg-[#c67f43] hover:bg-[#b06f38] text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Banner Inside Card */}
      <div className="bg-[#F1EAFA] border border-[#EDE3FA] rounded-xl p-3 flex items-center gap-2.5 text-stone-700 text-xs shadow-sm">
        <Clipboard className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
        <span className="font-medium text-[#5E3A8C]">
          Done — {tasks.length} tasks, 3 reminders, and a review checklist created.
        </span>
      </div>
    </div>
  );
}
