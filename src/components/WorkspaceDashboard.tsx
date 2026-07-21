import { useState, useEffect } from "react";
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

interface Board {
  id: string;
  title: string;
  color: string;
  description?: string;
}

interface Column {
  id: string;
  boardId: string;
  title: string;
  color: string;
}

interface BoardTask {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  date: string;
  color: string;
  priority: "low" | "medium" | "high";
  description?: string;
}

interface CalendarTask {
  id: string;
  dateStr: string;
  title: string;
  time?: string;
  color: string;
  status: "Active" | "Draft";
}

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  wordCount: number;
  isPinned: boolean;
  isDeleted?: boolean;
}

interface Whiteboard {
  id: string;
  title: string;
  sub: string;
}

interface AppletTemplate {
  id: string;
  name: string;
  desc: string;
  prompt: string;
  pinned: boolean;
  status: "Active" | "Draft";
  createdAt: string;
}

interface WorkspaceSpace {
  id: string;
  name: string;
  desc?: string;
  updatedAt?: string;
  themeColor?: string;
}

export default function WorkspaceDashboard() {
  const { navigate } = useRouter();

  // Dynamic Workspace States
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [templates, setTemplates] = useState<AppletTemplate[]>([]);
  const [spaces, setSpaces] = useState<WorkspaceSpace[]>([]);
  const [chatMessagesCount, setChatMessagesCount] = useState(0);

  // Load everything from local storage on mount
  useEffect(() => {
    // 1. Kanban
    const savedTasks = localStorage.getItem("workspace_kanban_tasks");
    const savedColumns = localStorage.getItem("workspace_kanban_columns");
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) setTasks(parsed);
      } catch (e) {}
    }
    if (savedColumns) {
      try {
        const parsed = JSON.parse(savedColumns);
        if (Array.isArray(parsed)) setColumns(parsed);
      } catch (e) {}
    }

    // 2. Calendar
    const savedCalendar = localStorage.getItem("workspace_calendar_tasks");
    if (savedCalendar) {
      try {
        const parsed = JSON.parse(savedCalendar);
        if (Array.isArray(parsed)) setCalendarTasks(parsed);
      } catch (e) {}
    }

    // 3. Notes
    const savedNotes = localStorage.getItem("workspace_notes");
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        if (Array.isArray(parsed)) {
          // Filter out deleted notes
          setNotes(parsed.filter(n => !n.isDeleted));
        }
      } catch (e) {}
    }

    // 4. Whiteboards
    const savedWhiteboards = localStorage.getItem("workspace_whiteboards_list");
    if (savedWhiteboards) {
      try {
        const parsed = JSON.parse(savedWhiteboards);
        if (Array.isArray(parsed)) setWhiteboards(parsed);
      } catch (e) {}
    }

    // 5. AI Templates
    const savedTemplates = localStorage.getItem("workspace_templates");
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        if (Array.isArray(parsed)) setTemplates(parsed);
      } catch (e) {}
    }

    // 6. Spaces
    const savedSpaces = localStorage.getItem("workspace_spaces");
    if (savedSpaces) {
      try {
        const parsed = JSON.parse(savedSpaces);
        if (Array.isArray(parsed)) setSpaces(parsed);
      } catch (e) {}
    }

    // 7. AI Chat messages
    const savedChat = localStorage.getItem("cozy_ai_chat_history");
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed)) setChatMessagesCount(parsed.length);
      } catch (e) {}
    }
  }, []);

  // Compute Task stats
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const completedColumnIds = columns
    .filter(col => {
      const t = col.title.toLowerCase();
      return t === "done" || t === "completed" || t === "complete";
    })
    .map(col => col.id);

  const completedTasks = tasks.filter(task => completedColumnIds.includes(task.columnId));
  const pendingTasks = tasks.filter(task => !completedColumnIds.includes(task.columnId));
  
  const overdueTasks = pendingTasks.filter(task => task.date && task.date < todayStr);

  const totalTasksCount = tasks.length;
  const completedTasksCount = completedTasks.length;
  const pendingTasksCount = pendingTasks.length;
  const overdueTasksCount = overdueTasks.length;
  
  const progressPercent = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  // Formatting helper for date representation
  const formatHumanDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T12:00:00");
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  // Derive top 3 upcoming calendar active events
  const activeCalendarTasks = calendarTasks.filter(task => task.status === "Active");
  // Sort calendar events by dateStr ascending, then by time ascending
  const upcomingEventsList = [...activeCalendarTasks]
    .sort((a, b) => {
      if (a.dateStr !== b.dateStr) return a.dateStr.localeCompare(b.dateStr);
      return (a.time || "").localeCompare(b.time || "");
    })
    .slice(0, 3);

  // Header stats configs
  const whiteboardLatestName = whiteboards.length > 0 
    ? whiteboards[whiteboards.length - 1].title 
    : "No boards created yet";

  const pinnedTemplatesCount = templates.filter(t => t.pinned).length;

  const headerCards = [
    {
      title: "Whiteboards",
      val: `${whiteboards.length} board${whiteboards.length !== 1 ? "s" : ""}`,
      desc: `Latest: ${whiteboardLatestName}`,
      color: "bg-[#FFF8F6] border-[#FFECE8]",
      iconColor: "text-[#E05A47]",
      accent: "bg-[#FFECE8] text-[#E05A47]",
      path: "/whiteboard",
      icon: Brush
    },
    {
      title: "AI Assistant",
      val: `${chatMessagesCount} messages`,
      desc: chatMessagesCount > 0 ? "Chat memory active" : "No active chat yet",
      color: "bg-[#F5F3FF] border-[#EDE9FE]",
      iconColor: "text-[#6D28D9]",
      accent: "bg-[#EDE9FE] text-[#6D28D9]",
      path: "/ai-assistant",
      icon: Sparkles
    },
    {
      title: "AI Template Builder",
      val: `${templates.length} template${templates.length !== 1 ? "s" : ""}`,
      desc: `${pinnedTemplatesCount} template${pinnedTemplatesCount !== 1 ? "s" : ""} pinned`,
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
      title: "Add Calendar Event",
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
      title: "Generate AI Template",
      desc: "Build a mini productivity app.",
      color: "bg-[#FFF5F5] border-[#FFD2D2] text-[#991B1B]",
      iconColor: "text-[#E11D48]",
      path: "/template-builder"
    }
  ];

  // Derive Recent Pages dynamically based on active storage items
  const derivedRecentPages: any[] = [];
  
  // 1. Kanban Board items
  tasks.slice(-2).forEach(task => {
    derivedRecentPages.push({
      name: task.title,
      category: "Kanban task",
      meta: `Priority: ${task.priority}`,
      color: "bg-[#FFFEE5] border-[#FFECB3]",
      badge: "Kanban task",
      path: "/kanban"
    });
  });

  // 2. Whiteboards
  whiteboards.slice(-2).forEach(wb => {
    derivedRecentPages.push({
      name: wb.title,
      category: "Whiteboard",
      meta: wb.sub || "Visual workspace",
      color: "bg-[#FFF5F5] border-[#FFCDD2]",
      badge: "Whiteboard",
      path: "/whiteboard"
    });
  });

  // 3. Notes
  notes.slice(-2).forEach(note => {
    derivedRecentPages.push({
      name: note.title || "Untitled Note",
      category: "Note",
      meta: `${note.wordCount || 0} words`,
      color: "bg-[#EBF7FF] border-[#B3E5FC]",
      badge: "Note",
      path: "/notes"
    });
  });

  // 4. Templates
  templates.slice(-2).forEach(tmpl => {
    derivedRecentPages.push({
      name: tmpl.name,
      category: "AI template",
      meta: tmpl.desc || "Interactive applet",
      color: "bg-[#FBF5FF] border-[#E1BEE7]",
      badge: "AI template",
      path: "/template-builder"
    });
  });

  // 5. Spaces
  spaces.slice(-1).forEach(space => {
    derivedRecentPages.push({
      name: space.name,
      category: "Space",
      meta: space.desc || "Workspace space",
      color: "bg-[#FAF8F5] border-[#EFECE6]",
      badge: "Space",
      path: "/spaces"
    });
  });

  // Sort them dynamically or show up to 6 recent items
  const recentPagesToShow = derivedRecentPages.slice(0, 6);

  // Derive unified Recent Activity Feed based on timestamps or details
  const derivedActivities: any[] = [];

  notes.slice(-2).forEach(n => {
    derivedActivities.push({
      text: n.title || "Untitled note",
      action: "Created or updated note",
      dateStr: n.updatedAt ? new Date(n.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
      timestamp: n.updatedAt ? new Date(n.updatedAt).getTime() : Date.now(),
      color: "bg-[#0284C7]"
    });
  });

  tasks.slice(-2).forEach(t => {
    derivedActivities.push({
      text: t.title,
      action: "Scheduled Kanban task",
      dateStr: t.date ? formatHumanDate(t.date) : "Recently",
      timestamp: t.date ? new Date(t.date).getTime() : Date.now(),
      color: "bg-[#E05A47]"
    });
  });

  calendarTasks.slice(-2).forEach(c => {
    derivedActivities.push({
      text: c.title,
      action: c.status === "Draft" ? "Created calendar draft" : "Scheduled calendar item",
      dateStr: `${formatHumanDate(c.dateStr)}${c.time ? " at " + c.time : ""}`,
      timestamp: c.dateStr ? new Date(c.dateStr).getTime() : Date.now(),
      color: "bg-[#22C55E]"
    });
  });

  whiteboards.slice(-1).forEach(w => {
    derivedActivities.push({
      text: w.title,
      action: "Modified whiteboard canvas",
      dateStr: w.sub || "Recently",
      timestamp: Date.now() - 60000,
      color: "bg-[#EA580C]"
    });
  });

  // Sort activities by timestamp descending
  const recentActivitiesToShow = derivedActivities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // Generate dynamic AI Insights
  const dynamicAIInsights: string[] = [];

  if (overdueTasksCount > 0) {
    dynamicAIInsights.push(`You have ${overdueTasksCount} overdue task${overdueTasksCount > 1 ? "s" : ""} on your Kanban. Consider resolving ${overdueTasksCount > 1 ? "them" : "it"} today!`);
  } else {
    dynamicAIInsights.push("Excellent work! You have 0 overdue tasks currently.");
  }

  const activeWorkspaces: string[] = [];
  if (totalTasksCount > 0) activeWorkspaces.push("Kanban");
  if (calendarTasks.length > 0) activeWorkspaces.push("Calendar");
  if (notes.length > 0) activeWorkspaces.push("Notes");
  if (whiteboards.length > 0) activeWorkspaces.push("Whiteboard");
  if (templates.length > 0) activeWorkspaces.push("Templates");

  if (activeWorkspaces.length > 0) {
    dynamicAIInsights.push(`Your most active workspaces are: ${activeWorkspaces.slice(0, 3).join(", ")}.`);
  } else {
    dynamicAIInsights.push("Your workspace is currently a fresh clean slate.");
  }

  if (totalTasksCount > 0) {
    dynamicAIInsights.push(`You completed ${progressPercent}% of your active Kanban goals.`);
  } else {
    dynamicAIInsights.push("No tasks added yet. Try creating a Kanban task to outline your milestones.");
  }

  const todayCalendarCount = calendarTasks.filter(t => t.dateStr === todayStr).length;
  if (todayCalendarCount > 0) {
    dynamicAIInsights.push(`You have ${todayCalendarCount} active event${todayCalendarCount > 1 ? "s" : ""} scheduled on your calendar for today.`);
  } else {
    dynamicAIInsights.push("No calendar reminders scheduled for today.");
  }

  if (pendingTasksCount > 4) {
    dynamicAIInsights.push(`Suggested focus: Try wrapping up your pending ${pendingTasksCount} tasks before expanding.`);
  } else if (notes.length > 0) {
    dynamicAIInsights.push("Suggested focus: review your captured notes or draft templates with Cozy AI!");
  } else {
    dynamicAIInsights.push("Suggested focus: create a whiteboard sandbox or schedule dynamic tasks!");
  }

  return (
    <div id="workspace-dashboard" className="p-6 md:p-8 space-y-8 bg-[#FAF8F5]">
      
      {/* Top Header Row */}
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

      {/* 3 Main Header cards */}
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
                <span className="text-2xl font-bold text-[#075985] font-serif">{totalTasksCount}</span>
              </div>
              {/* Completed Card */}
              <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-3 rounded-xl flex flex-col justify-between h-[84px]">
                <span className="text-[11px] text-[#15803D] font-semibold">Completed</span>
                <span className="text-2xl font-bold text-[#166534] font-serif">{completedTasksCount}</span>
              </div>
              {/* Pending Card */}
              <div className="bg-[#FFFDF0] border border-[#FEF08A] p-3 rounded-xl flex flex-col justify-between h-[84px]">
                <span className="text-[11px] text-[#854D0E] font-semibold">Pending</span>
                <span className="text-2xl font-bold text-[#A16207] font-serif">{pendingTasksCount}</span>
              </div>
              {/* Overdue Card */}
              <div className="bg-[#FFF1F2] border border-[#FECDD3] p-3 rounded-xl flex flex-col justify-between h-[84px]">
                <span className="text-[11px] text-[#991B1B] font-semibold">Overdue</span>
                <span className="text-2xl font-bold text-[#E11D48] font-serif">{overdueTasksCount}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EBE5]/60 flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#FAF8F5] rounded-full h-2.5 overflow-hidden border border-[#EFECE6]">
                <div 
                  className="bg-[#15803D] h-full rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }} 
                />
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
            {upcomingEventsList.length > 0 ? (
              upcomingEventsList.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate("/calendar")}
                  className="bg-white border border-[#EFECE6] hover:border-stone-300 p-4 rounded-xl flex items-center justify-between gap-4 text-left cursor-pointer transition-colors shadow-3xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-[#221C18]">{item.title}</h4>
                      <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                        {formatHumanDate(item.dateStr)}{item.time ? ` at ${item.time}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#FAF8F5] text-stone-500 text-[10px] font-bold px-2.5 py-1 rounded-md border border-[#EFECE6] uppercase tracking-wider">
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="bg-white border border-[#EFECE6] p-6 rounded-xl text-center text-stone-400 font-medium text-xs">
                No upcoming calendar items. Go to the Calendar tab to schedule your first event!
              </div>
            )}
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
            {recentActivitiesToShow.length > 0 ? (
              recentActivitiesToShow.map((activity, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs border-b border-[#FAF8F5] pb-2 last:border-none last:pb-0">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.color}`} />
                  <div className="flex-grow">
                    <span className="font-bold text-stone-800">{activity.text}</span>
                    <p className="text-[11px] text-stone-400 mt-0.5">{activity.action} • {activity.dateStr}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-[#EFECE6] p-6 rounded-xl text-center text-stone-400 font-medium text-xs">
                No recent workspace activity. Your actions in the calendar, boards, or notes will show up here.
              </div>
            )}
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

          {recentPagesToShow.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentPagesToShow.map((page, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(page.path)}
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
          ) : (
            <div className="bg-white/60 border border-dashed border-[#F0EBE5] rounded-xl p-8 text-center text-stone-400 font-medium text-xs">
              No recent pages found. Create notes, boards, or templates to see them listed here!
            </div>
          )}
        </div>

        {/* AI Insights Panel */}
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
              {dynamicAIInsights.map((insight, idx) => (
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
