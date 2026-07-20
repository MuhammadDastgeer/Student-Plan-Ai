import { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Clipboard, 
  Brush, 
  FileText, 
  Columns, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Laptop
} from "lucide-react";
import { useRouter } from "./Router";

export default function WorkspaceDashboard() {
  const { navigate } = useRouter();

  // Simulated live state that ties things together!
  const [tasks, setTasks] = useState([
    { id: 1, text: "TEST Task", status: "Todo", priority: "low", date: "2026-05-18" },
    { id: 2, text: "Task 1", status: "In Progress", priority: "high", date: "2026-05-19" },
    { id: 3, text: "Testing Task", status: "Todo", priority: "high", date: "2026-05-27" }
  ]);

  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  // Stats matching the image exactly
  const headerCards = [
    {
      title: "Whiteboard",
      val: "2 boards",
      desc: "Latest: Planning",
      color: "bg-[#FFF8F6] border-[#FFECE8]",
      iconColor: "text-[#E05A47]",
      accent: "bg-[#FFECE8] text-[#E05A47]",
      path: "/whiteboard",
      icon: Brush
    },
    {
      title: "AI Assistant",
      val: "3 actions",
      desc: "Today",
      color: "bg-[#F5F3FF] border-[#EDE9FE]",
      iconColor: "text-[#6D28D9]",
      accent: "bg-[#EDE9FE] text-[#6D28D9]",
      path: "/ai-assistant",
      icon: Sparkles
    },
    {
      title: "AI Template Builder",
      val: "1 template",
      desc: "0 sidebar apps pinned",
      color: "bg-[#FFF5F5] border-[#FEE2E2]",
      iconColor: "text-[#DC2626]",
      accent: "bg-[#FEE2E2] text-[#DC2626]",
      path: "/template-builder",
      icon: Laptop
    }
  ];

  const quickAccess = [
    {
      title: "Create Task",
      desc: "Open your Kanban workspace.",
      color: "bg-[#FFFDF0] border-[#FDE047] text-[#854D0E]",
      iconColor: "text-[#A16207]",
      path: "/kanban"
    },
    {
      title: "Add Calendar R...",
      desc: "Schedule a task or reminder.",
      color: "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]",
      iconColor: "text-[#15803D]",
      path: "/calendar"
    },
    {
      title: "Create Note",
      desc: "Capture a fresh thought.",
      color: "bg-[#F0F9FF] border-[#BAE6FD] text-[#075985]",
      iconColor: "text-[#0284C7]",
      path: "/notes"
    },
    {
      title: "Open Whiteboard",
      desc: "Sketch ideas visually.",
      color: "bg-[#FFF5F5] border-[#FEE2E2] text-[#991B1B]",
      iconColor: "text-[#DC2626]",
      path: "/whiteboard"
    },
    {
      title: "Ask AI Assistant",
      desc: "Plan or act across the app.",
      color: "bg-[#F5F3FF] border-[#EDE9FE] text-[#5B21B6]",
      iconColor: "text-[#7C3AED]",
      path: "/ai-assistant"
    },
    {
      title: "Generate AI Tem...",
      desc: "Build a mini productivity app.",
      color: "bg-[#FFF5F5] border-[#FFD2D2] text-[#991B1B]",
      iconColor: "text-[#E11D48]",
      path: "/template-builder"
    }
  ];

  const recentPages = [
    { name: "Youtube", category: "Kanban board", meta: "2 tasks", color: "bg-[#FFFEE5] border-[#FFECB3]", badge: "Kanban board" },
    { name: "Planning", category: "Whiteboard", meta: "Visual workspace", color: "bg-[#FFF5F5] border-[#FFCDD2]", badge: "Whiteboard" },
    { name: "Untitled whiteboard", category: "Whiteboard", meta: "Visual workspace", color: "bg-[#FFF5F5] border-[#FFCDD2]", badge: "Whiteboard" },
    { name: "New board", category: "Kanban board", meta: "0 tasks", color: "bg-[#FFFEE5] border-[#FFECB3]", badge: "Kanban board" },
    { name: "HabitFlow", category: "AI template", meta: "Daily habit tracking", color: "bg-[#FBF5FF] border-[#E1BEE7]", badge: "AI template" },
    { name: "First Note", category: "Note", meta: "23 words", color: "bg-[#EBF7FF] border-[#B3E5FC]", badge: "Note" },
    { name: "Personal Work", category: "Kanban board", meta: "1 task", color: "bg-[#FFFEE5] border-[#FFECB3]", badge: "Kanban board" },
  ];

  const aiInsights = [
    "You have 2 overdue tasks.",
    "Your most active workspace is Calendar.",
    "You completed 0% of tracked tasks.",
    "No reminders scheduled for today.",
    "Suggested focus: finish overdue work before adding new tasks."
  ];

  return (
    <div id="workspace-dashboard" className="p-6 md:p-8 space-y-8 bg-[#FAF8F5]">
      
      {/* Top Header Row with dynamic time indication matching user system local time */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="font-serif text-3xl font-bold text-[#221C18]">Workspace Overview</h1>
          <p className="text-sm text-stone-500 font-medium">
            Welcome back! Here is what requires your focus.
          </p>
        </div>
        <div className="text-xs text-stone-400 font-medium flex items-center gap-1.5 self-start md:self-auto bg-white border border-[#EFECE6] px-3 py-1.5 rounded-lg shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] animate-pulse inline-block" />
          Workspace Sync Online
        </div>
      </div>

      {/* 3 Main Header cards (Top area) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {headerCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              onClick={() => navigate(card.path)}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-[124px] cursor-pointer shadow-2xs relative overflow-hidden group ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 font-sans tracking-wide">
                  {card.title}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.accent}`}>
                  Active
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#221C18] font-serif tracking-tight">
                  {card.val}
                </h3>
                <p className="text-xs text-stone-400 font-medium mt-1">
                  {card.desc}
                </p>
              </div>
              <div className="absolute right-3 bottom-3 opacity-15 group-hover:opacity-30 transition-opacity">
                <Icon className="w-12 h-12" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid Content - Quick access & Task summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quick Access Block (Left) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#E05A47] rounded-sm" />
            <h2 className="text-sm font-bold text-stone-800 tracking-wider uppercase">
              Quick access
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {quickAccess.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(item.path)}
                className={`p-4 rounded-xl border flex flex-col justify-between text-left h-[105px] cursor-pointer shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden ${item.color}`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-1.5 bg-white/60 rounded-md border border-white">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] leading-tight opacity-75 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Task Summary Panel (Right) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#6D28D9] rounded-sm" />
            <h2 className="text-sm font-bold text-stone-800 tracking-wider uppercase">
              Task summary
            </h2>
          </div>

          <div className="bg-white border border-[#EFECE6] rounded-2xl p-5 text-left flex flex-col justify-between h-full shadow-2xs">
            <div className="grid grid-cols-2 gap-3">
              {/* Total Card */}
              <div className="bg-[#F0F9FF] border border-[#E0F2FE] p-3 rounded-xl flex flex-col justify-between h-[84px]">
                <span className="text-[11px] text-[#0369A1] font-semibold">Total</span>
                <span className="text-2xl font-bold text-[#075985] font-serif">3</span>
              </div>
              {/* Completed Card */}
              <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-3 rounded-xl flex flex-col justify-between h-[84px]">
                <span className="text-[11px] text-[#15803D] font-semibold">Completed</span>
                <span className="text-2xl font-bold text-[#166534] font-serif">0</span>
              </div>
              {/* Pending Card */}
              <div className="bg-[#FFFDF0] border border-[#FEF08A] p-3 rounded-xl flex flex-col justify-between h-[84px]">
                <span className="text-[11px] text-[#854D0E] font-semibold">Pending</span>
                <span className="text-2xl font-bold text-[#A16207] font-serif">3</span>
              </div>
              {/* Overdue Card */}
              <div className="bg-[#FFF1F2] border border-[#FECDD3] p-3 rounded-xl flex flex-col justify-between h-[84px]">
                <span className="text-[11px] text-[#991B1B] font-semibold">Overdue</span>
                <span className="text-2xl font-bold text-[#E11D48] font-serif">2</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EBE5]/60 flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
                <span>Progress</span>
                <span>0%</span>
              </div>
              <div className="w-full bg-[#FAF8F5] rounded-full h-2.5 overflow-hidden border border-[#EFECE6]">
                <div className="bg-[#15803D] h-full rounded-full transition-all duration-300" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Second Row Grid - Upcoming calendar (Bottom left) & Recent activity (Bottom right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upcoming calendar */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#EA580C] rounded-sm" />
            <h2 className="text-sm font-bold text-stone-800 tracking-wider uppercase">
              Upcoming calendar
            </h2>
          </div>

          <div className="space-y-2.5">
            {[
              { title: "New calendar item", date: "Tue, May 19", tag: "Task", color: "bg-[#27C93F]" },
              { title: "Meeting with Client", date: "Wed, May 20", tag: "Task", color: "bg-[#27C93F]" },
              { title: "Testing Task", date: "Wed, May 27, 9:49 PM", tag: "Task", color: "bg-[#EA580C]" }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate("/calendar")}
                className="bg-white border border-[#EFECE6] hover:border-stone-300 p-4 rounded-xl flex items-center justify-between gap-4 text-left cursor-pointer transition-colors shadow-3xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                  <div>
                    <h4 className="text-xs font-bold text-[#221C18]">{item.title}</h4>
                    <p className="text-[11px] text-stone-400 font-medium mt-0.5">{item.date}</p>
                  </div>
                </div>
                <span className="bg-[#FAF8F5] text-stone-500 text-[10px] font-bold px-2.5 py-1 rounded-md border border-[#EFECE6] uppercase tracking-wider">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#E11D48] rounded-sm" />
            <h2 className="text-sm font-bold text-stone-800 tracking-wider uppercase">
              Recent activity
            </h2>
          </div>

          <div className="bg-white border border-[#EFECE6] rounded-2xl p-5 text-left flex flex-col justify-between max-h-[320px] overflow-y-auto space-y-4 shadow-2xs">
            {[
              { text: "Task 1", action: "Created task", date: "May 18, 9:51 PM", color: "bg-yellow-500" },
              { text: "Testing Task", action: "Created calendar task", date: "May 18, 9:49 PM", color: "bg-green-500" },
              { text: "Untitled whiteboard", action: "Updated whiteboard", date: "May 18, 7:15 PM", color: "bg-red-500" },
              { text: "Meeting with Client", action: "Created calendar task", date: "May 18, 2:02 PM", color: "bg-green-500" },
              { text: "New calendar item", action: "Created calendar task", date: "May 18, 1:47 PM", color: "bg-green-500" }
            ].map((activity, idx) => (
              <div key={idx} className="flex gap-3 items-start text-xs border-b border-[#FAF8F5] pb-2 last:border-none last:pb-0">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.color}`} />
                <div className="flex-grow">
                  <span className="font-bold text-stone-800">{activity.text}</span>
                  <p className="text-[11px] text-stone-400 mt-0.5">{activity.action} • {activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Third Row Grid - Recent pages (Bottom left) & AI Insights (Bottom right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent pages */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#0284C7] rounded-sm" />
            <h2 className="text-sm font-bold text-stone-800 tracking-wider uppercase">
              Recent pages
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentPages.map((page, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (page.category.includes("Kanban")) navigate("/kanban");
                  else if (page.category.includes("Whiteboard")) navigate("/whiteboard");
                  else if (page.category.includes("Note")) navigate("/notes");
                  else if (page.category.includes("template")) navigate("/template-builder");
                }}
                className={`p-4 rounded-xl border flex flex-col justify-between text-left h-[105px] cursor-pointer shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden ${page.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-600 tracking-wider uppercase bg-white/70 px-2 py-0.5 rounded-full border border-white/60">
                    {page.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight truncate text-stone-800">
                    {page.name}
                  </h4>
                  <p className="text-[10px] opacity-75 mt-0.5 text-stone-500">
                    {page.meta}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Panel (Right side, beneath recent pages) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#c67f43] rounded-sm" />
            <h2 className="text-sm font-bold text-stone-800 tracking-wider uppercase">
              AI insights
            </h2>
          </div>

          <div className="bg-[#FAF2EC] border border-[#F4E3D4] rounded-2xl p-6 text-left flex flex-col h-full shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#F4E3D4]">
              <Sparkles className="w-4 h-4 text-[#c67f43]" />
              <h3 className="font-serif text-[15px] font-bold text-[#c67f43]">Flowbase Assistant Insights</h3>
            </div>
            
            <ol className="space-y-3 flex-grow">
              {aiInsights.map((insight, idx) => (
                <li key={idx} className="flex gap-3 text-xs leading-relaxed text-stone-700">
                  <span className="font-bold text-[#c67f43] bg-white border border-[#F4E3D4] w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 shadow-3xs">
                    {idx + 1}
                  </span>
                  <span className="mt-0.5">{insight}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

      </div>

    </div>
  );
}
