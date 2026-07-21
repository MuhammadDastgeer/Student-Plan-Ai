import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Trash2, 
  ClipboardList,
  Edit,
  Check,
  AlertCircle
} from "lucide-react";

interface CalendarTask {
  id: string;
  dateStr: string; // "YYYY-MM-DD"
  title: string;
  time?: string;
  color: string; // "green" | "yellow" | "orange" | "red" | "blue" | "purple"
  status: "Active" | "Draft";
}

export default function WorkspaceCalendar() {
  const [currentView, setCurrentView] = useState<"Month" | "Week">("Month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  // Standard formatted helper for date
  const formatDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDateStr(new Date());

  // Unified state for all tasks (Active & Draft) loaded from localStorage
  const [tasks, setTasks] = useState<CalendarTask[]>(() => {
    const saved = localStorage.getItem("workspace_calendar_tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse calendar tasks", e);
      }
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem("workspace_calendar_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const [newDraftText, setNewDraftText] = useState("");
  
  // Add Task Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(todayStr);
  const [newTaskTime, setNewTaskTime] = useState("10:00");
  const [newTaskColor, setNewTaskColor] = useState("green");
  const [newTaskStatus, setNewTaskStatus] = useState<"Active" | "Draft">("Active");

  // Edit Task Modal state
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDate, setEditTaskDate] = useState("");
  const [editTaskTime, setEditTaskTime] = useState("");
  const [editTaskColor, setEditTaskColor] = useState("green");
  const [editTaskStatus, setEditTaskStatus] = useState<"Active" | "Draft">("Active");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigations
  const handleNext = () => {
    if (currentView === "Month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    }
  };

  const handleBack = () => {
    if (currentView === "Month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setNewTaskDate(formatDateStr(date));
    setNewTaskTitle("");
    setNewTaskStatus("Active");
    setShowAddModal(true);
  };

  // Create active/draft task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const added: CalendarTask = {
      id: Math.random().toString(),
      dateStr: newTaskDate || todayStr,
      title: newTaskTitle.trim(),
      time: newTaskTime || undefined,
      color: newTaskColor,
      status: newTaskStatus
    };
    
    setTasks([added, ...tasks]);

    // Reset Form
    setNewTaskTitle("");
    setNewTaskTime("10:00");
    setNewTaskStatus("Active");
    setShowAddModal(false);
  };

  // Create Draft via Right Sidebar Input
  const handleAddDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftText.trim()) return;

    const addedDraft: CalendarTask = {
      id: Math.random().toString(),
      dateStr: selectedDate ? formatDateStr(selectedDate) : todayStr,
      title: newDraftText.trim(),
      color: "green",
      status: "Draft"
    };

    setTasks([addedDraft, ...tasks]);
    setNewDraftText("");
  };

  // Open Edit Modal
  const openEditModal = (task: CalendarTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDate(task.dateStr);
    setEditTaskTime(task.time || "10:00");
    setEditTaskColor(task.color);
    setEditTaskStatus(task.status);
  };

  // Save Edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTaskTitle.trim()) return;

    setTasks(tasks.map(t => {
      if (t.id === editingTask.id) {
        return {
          ...t,
          title: editTaskTitle.trim(),
          dateStr: editTaskDate,
          time: editTaskTime || undefined,
          color: editTaskColor,
          status: editTaskStatus
        };
      }
      return t;
    }));

    setEditingTask(null);
  };

  const deleteCalendarTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case "green": return "border-l-4 border-l-[#27C93F] bg-[#F0FDF4] text-[#166534]";
      case "yellow": return "border-l-4 border-l-amber-500 bg-amber-50 text-amber-800";
      case "orange": return "border-l-4 border-l-orange-500 bg-orange-50 text-orange-800";
      case "red": return "border-l-4 border-l-red-500 bg-red-50 text-red-800";
      case "blue": return "border-l-4 border-l-blue-500 bg-blue-50 text-blue-800";
      case "purple": return "border-l-4 border-l-purple-500 bg-purple-50 text-purple-800";
      default: return "border-l-4 border-l-stone-400 bg-stone-50 text-stone-700";
    }
  };

  // Month days generator
  const getMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const totalDays = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);

    // Padding from previous month
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const totalDaysPrev = getDaysInMonth(prevYear, prevMonth);
    const prevPadding: Date[] = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevPadding.push(new Date(prevYear, prevMonth, totalDaysPrev - i));
    }

    // Current month days
    const currentDays: Date[] = [];
    for (let i = 1; i <= totalDays; i++) {
      currentDays.push(new Date(year, month, i));
    }

    // Next month padding to keep grid symmetrical (total of 42 days, 6 rows)
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    const remainingCount = 42 - (prevPadding.length + currentDays.length);
    const nextPadding: Date[] = [];
    for (let i = 1; i <= remainingCount; i++) {
      nextPadding.push(new Date(nextYear, nextMonth, i));
    }

    return { prevPadding, currentDays, nextPadding };
  };

  // Week days generator
  const getWeekGrid = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay(); // 0-6
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const { prevPadding, currentDays, nextPadding } = getMonthGrid();
  const weekDays = getWeekGrid();

  // Filter drafts for the sidebar display
  const draftTasks = tasks.filter(t => t.status === "Draft");

  return (
    <div id="workspace-calendar" className="p-6 md:p-8 bg-[#FAF8F5] min-h-[calc(100vh-60px)] flex flex-col space-y-6">
      
      {/* Page Header */}
      <div className="text-left space-y-1">
        <h1 className="font-serif text-3xl font-bold text-[#221C18]">
          Calendar Hub
        </h1>
        <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-xl">
          Coordinate your personal schedules, active events, and draft checklists. Click any date to start planning.
        </p>
      </div>

      {/* Grid Layout containing Main Calendar & Draft Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Calendar Grid Block */}
        <div className="lg:col-span-9 bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-5 text-left">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Title Month indicator */}
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl font-bold text-[#221C18]">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex bg-[#FAF8F5] border border-[#EFECE6] rounded-lg p-0.5 text-xs font-semibold text-stone-600">
                <button
                  onClick={() => setCurrentView("Month")}
                  className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                    currentView === "Month" ? "bg-white text-[#221C18] shadow-3xs font-bold" : "hover:text-stone-900"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setCurrentView("Week")}
                  className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                    currentView === "Week" ? "bg-white text-[#221C18] shadow-3xs font-bold" : "hover:text-stone-900"
                  }`}
                >
                  Week
                </button>
              </div>
            </div>

            {/* Pagination controls & Add Button */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={handleToday}
                className="bg-white border border-[#EFECE6] hover:bg-stone-50 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-700 shadow-3xs cursor-pointer"
              >
                Today
              </button>
              <div className="flex rounded-lg border border-[#EFECE6] overflow-hidden">
                <button 
                  onClick={handleBack}
                  className="bg-white hover:bg-stone-50 p-2 border-r border-[#EFECE6] text-stone-600 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleNext}
                  className="bg-white hover:bg-stone-50 p-2 text-stone-600 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  setNewTaskDate(todayStr);
                  setNewTaskTitle("");
                  setNewTaskStatus("Active");
                  setShowAddModal(true);
                }}
                className="bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-3xs"
              >
                <Plus className="w-3.5 h-3.5" /> New task
              </button>
            </div>

          </div>

          {/* Core Calendar Days Board */}
          <div className="border border-[#EFECE6] rounded-xl overflow-hidden bg-stone-50">
            
            {/* Weekdays row */}
            <div className="grid grid-cols-7 bg-stone-50 border-b border-[#EFECE6] text-center text-[10px] font-bold text-stone-400 uppercase tracking-wider py-2.5">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Date Grid conditional rendering */}
            {currentView === "Month" ? (
              <div className="grid grid-cols-7 bg-white divide-x divide-y divide-[#EFECE6] border-t border-l border-none">
                
                {/* Previous Month Offset */}
                {prevPadding.map((date, idx) => {
                  const dateString = formatDateStr(date);
                  const dayTasks = tasks.filter(t => t.dateStr === dateString);
                  return (
                    <div 
                      key={`prev-${idx}`} 
                      onClick={() => handleDayClick(date)}
                      className="min-h-[115px] p-2 bg-[#FAF9F6]/40 text-stone-300 font-medium text-xs select-none hover:bg-stone-50/30 cursor-pointer flex flex-col justify-between"
                    >
                      <span className="text-[10px] text-stone-300 font-bold">{date.getDate()}</span>
                      <div className="mt-1 space-y-1 max-h-[75px] overflow-y-auto">
                        {dayTasks.map(task => (
                          <div key={task.id} className={`text-[9px] px-1 py-0.5 rounded-sm truncate ${getBadgeColor(task.color)}`}>
                            {task.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Current Month Days */}
                {currentDays.map((date, idx) => {
                  const dateString = formatDateStr(date);
                  const dayTasks = tasks.filter(t => t.dateStr === dateString);
                  const isCurrentToday = dateString === todayStr;
                  const isSelected = selectedDate && formatDateStr(selectedDate) === dateString;

                  return (
                    <div
                      key={`curr-${idx}`}
                      onClick={() => handleDayClick(date)}
                      className={`min-h-[115px] p-2 flex flex-col justify-between hover:bg-[#FAF2EC]/40 cursor-pointer transition-all relative ${
                        isCurrentToday ? "bg-amber-50/20" : ""
                      } ${isSelected ? "ring-2 ring-[#E05A47]/40 ring-inset" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold w-5.5 h-5.5 rounded-md flex items-center justify-center ${
                          isCurrentToday 
                            ? "bg-[#E11D48] text-white shadow-3xs font-extrabold" 
                            : "text-stone-700 font-bold"
                        }`}>
                          {date.getDate()}
                        </span>
                        {dayTasks.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E05A47]" />
                        )}
                      </div>

                      {/* Day Task badges */}
                      <div className="mt-1.5 space-y-1 flex-grow max-h-[80px] overflow-y-auto">
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={(e) => openEditModal(task, e)}
                            className={`text-[10px] font-semibold px-1.5 py-1 rounded-md flex flex-col gap-0.5 justify-start group relative transition-all hover:brightness-95 ${getBadgeColor(task.color)}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate pr-2 font-bold leading-tight text-stone-800">{task.title}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCalendarTask(task.id, e);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-600 transition-opacity cursor-pointer p-0.5"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            
                            {/* Sub-labels indicating Time & Status */}
                            <div className="flex items-center justify-between gap-1 mt-0.5 text-[8px] font-semibold tracking-wide">
                              {task.time && (
                                <span className="opacity-75 font-mono flex items-center gap-0.5">
                                  <Clock className="w-2 h-2" /> {task.time}
                                </span>
                              )}
                              <span className={`px-1 py-0.2 rounded-sm uppercase text-[7px] font-extrabold ${
                                task.status === "Active" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-stone-200 text-stone-800"
                              }`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick plus trigger on hover */}
                      <span className="absolute bottom-1 right-1 opacity-0 hover:opacity-100 text-stone-400 p-0.5 bg-white border border-[#EFECE6] rounded-sm text-[8px] font-bold">
                        + Add
                      </span>

                    </div>
                  );
                })}

                {/* Next Month Padding */}
                {nextPadding.map((date, idx) => {
                  const dateString = formatDateStr(date);
                  const dayTasks = tasks.filter(t => t.dateStr === dateString);
                  return (
                    <div 
                      key={`next-${idx}`} 
                      onClick={() => handleDayClick(date)}
                      className="min-h-[115px] p-2 bg-[#FAF9F6]/40 text-stone-300 font-medium text-xs select-none hover:bg-stone-50/30 cursor-pointer flex flex-col justify-between"
                    >
                      <span className="text-[10px] text-stone-300 font-bold">{date.getDate()}</span>
                      <div className="mt-1 space-y-1 max-h-[75px] overflow-y-auto">
                        {dayTasks.map(task => (
                          <div key={task.id} className={`text-[9px] px-1 py-0.5 rounded-sm truncate ${getBadgeColor(task.color)}`}>
                            {task.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

              </div>
            ) : (
              /* Week View Columns representation */
              <div className="grid grid-cols-7 bg-white divide-x divide-[#EFECE6] border-t border-none">
                {weekDays.map((date, idx) => {
                  const dateString = formatDateStr(date);
                  const dayTasks = tasks.filter(t => t.dateStr === dateString);
                  const isCurrentToday = dateString === todayStr;
                  const isSelected = selectedDate && formatDateStr(selectedDate) === dateString;

                  return (
                    <div
                      key={`week-${idx}`}
                      onClick={() => handleDayClick(date)}
                      className={`min-h-[380px] p-3 flex flex-col justify-between hover:bg-stone-50/50 cursor-pointer transition-all relative ${
                        isCurrentToday ? "bg-amber-50/20" : ""
                      } ${isSelected ? "ring-2 ring-[#E05A47]/40 ring-inset" : ""}`}
                    >
                      <div className="flex flex-col items-center gap-1 border-b border-stone-100 pb-2">
                        <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]}
                        </span>
                        <span className={`text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center ${
                          isCurrentToday 
                            ? "bg-[#E11D48] text-white shadow-3xs font-extrabold" 
                            : "text-stone-700 font-bold"
                        }`}>
                          {date.getDate()}
                        </span>
                      </div>

                      {/* Week tasks list */}
                      <div className="mt-3 space-y-1.5 flex-grow overflow-y-auto max-h-[280px]">
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={(e) => openEditModal(task, e)}
                            className={`text-[10px] font-semibold p-2 rounded-lg flex flex-col gap-1 group relative transition-all hover:brightness-95 shadow-3xs ${getBadgeColor(task.color)}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-bold leading-tight break-words text-stone-800">{task.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCalendarTask(task.id, e);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-600 transition-opacity ml-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                            
                            {/* Time & Status */}
                            <div className="flex items-center justify-between gap-1 mt-1 text-[8px] font-bold">
                              {task.time && (
                                <span className="opacity-75 font-mono flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" /> {task.time}
                                </span>
                              )}
                              <span className={`px-1 py-0.2 rounded-sm text-[7px] uppercase font-extrabold ${
                                task.status === "Active" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-stone-200 text-stone-800"
                              }`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <span className="text-[9px] text-stone-400 font-bold text-center mt-2 opacity-0 hover:opacity-100 transition-opacity">
                        + Add Task
                      </span>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

        {/* Right Draft Task Panel */}
        <div className="lg:col-span-3 bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs text-left space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-800">Draft Task Panel</h3>
            <p className="text-[11px] text-stone-400 font-medium mt-0.5">Unscheduled / draft items reside here.</p>
          </div>

          {/* Form to submit draft */}
          <form onSubmit={handleAddDraft} className="space-y-2">
            <input
              type="text"
              placeholder="Type draft task..."
              value={newDraftText}
              onChange={(e) => setNewDraftText(e.target.value)}
              className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
            />
            <button
              type="submit"
              className="w-full bg-stone-100 hover:bg-[#FAF2EC] hover:text-[#c67f43] text-stone-600 border border-[#EFECE6] text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add draft
            </button>
          </form>

          {/* Draft list (Sourced dynamically from central tasks array) */}
          <div className="border-t border-[#EFECE6] pt-3">
            <h4 className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider mb-2">My Draft List ({draftTasks.length})</h4>
            
            {draftTasks.length === 0 ? (
              <div className="border border-dashed border-[#EFECE6] bg-stone-50/50 rounded-xl p-5 text-center flex flex-col items-center justify-center min-h-[140px] space-y-2">
                <div className="p-2.5 bg-white border border-[#EFECE6] rounded-full text-stone-300 shadow-3xs">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-stone-700">No drafts waiting</h4>
                <p className="text-[10px] text-stone-400 font-medium leading-normal">
                  Type draft above or mark any task as "Draft" to display here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {draftTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => openEditModal(task, e)}
                    className="p-3 bg-[#FAF8F5] border border-[#EFECE6] hover:border-[#c67f43] rounded-lg text-xs font-semibold text-stone-700 cursor-pointer flex flex-col gap-1 group transition-colors hover:bg-stone-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2 font-bold text-stone-800">{task.title}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCalendarTask(task.id);
                          }}
                          className="text-stone-400 hover:text-red-500 transition-colors cursor-pointer p-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[9px] text-stone-400 font-medium">
                      <span>{task.dateStr}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTasks(tasks.map(t => t.id === task.id ? { ...t, status: "Active" } : t));
                        }}
                        className="text-[#c67f43] hover:underline font-bold text-[10px] flex items-center gap-0.5"
                      >
                        Activate →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#EFECE6] rounded-2xl p-6 max-w-sm w-full mx-4 text-left shadow-lg space-y-4"
            >
              <div>
                <h3 className="font-serif text-lg font-bold text-[#221C18]">Create New Task</h3>
                <p className="text-xs text-stone-400 font-medium">Add a fully structured event to your flow.</p>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Task Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design review or Code update"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E05A47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Date</label>
                  <input
                    type="date"
                    required
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Time</label>
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Indicator Tag</label>
                    <select
                      value={newTaskColor}
                      onChange={(e) => setNewTaskColor(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
                    >
                      <option value="green">Green (General)</option>
                      <option value="blue">Blue (Demo)</option>
                      <option value="purple">Purple (Personal)</option>
                      <option value="yellow">Yellow (Meeting)</option>
                      <option value="orange">Orange (Critical)</option>
                      <option value="red">Red (Overdue)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTaskStatus("Active")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        newTaskStatus === "Active" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-stone-50 text-stone-500 border-stone-200"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTaskStatus("Draft")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        newTaskStatus === "Draft" 
                          ? "bg-stone-100 text-stone-700 border-stone-300" 
                          : "bg-stone-50 text-stone-500 border-[#EFECE6]"
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400 font-semibold leading-normal mt-1">
                    {newTaskStatus === "Draft" 
                      ? "Drafts will also appear in the Draft Task Panel on the right." 
                      : "Active tasks appear on the specific calendar date."}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-stone-50 hover:bg-stone-100 border border-[#EFECE6] text-stone-600 text-xs font-bold py-2 rounded-lg text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold py-2 rounded-lg text-center cursor-pointer shadow-3xs"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Edit Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#EFECE6] rounded-2xl p-6 max-w-sm w-full mx-4 text-left shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Edit Task Details</h3>
                  <p className="text-xs text-stone-400 font-medium">Update or delete your event schedule.</p>
                </div>
                <button
                  onClick={() => {
                    deleteCalendarTask(editingTask.id);
                    setEditingTask(null);
                  }}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Task Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design review or Code update"
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E05A47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Date</label>
                  <input
                    type="date"
                    required
                    value={editTaskDate}
                    onChange={(e) => setEditTaskDate(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Time</label>
                    <input
                      type="time"
                      value={editTaskTime}
                      onChange={(e) => setEditTaskTime(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Indicator Tag</label>
                    <select
                      value={editTaskColor}
                      onChange={(e) => setEditTaskColor(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
                    >
                      <option value="green">Green (General)</option>
                      <option value="blue">Blue (Demo)</option>
                      <option value="purple">Purple (Personal)</option>
                      <option value="yellow">Yellow (Meeting)</option>
                      <option value="orange">Orange (Critical)</option>
                      <option value="red">Red (Overdue)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditTaskStatus("Active")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        editTaskStatus === "Active" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-stone-50 text-stone-500 border-stone-200"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTaskStatus("Draft")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        editTaskStatus === "Draft" 
                          ? "bg-stone-100 text-stone-700 border-stone-300" 
                          : "bg-stone-50 text-stone-500 border-[#EFECE6]"
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="flex-1 bg-stone-50 hover:bg-stone-100 border border-[#EFECE6] text-stone-600 text-xs font-bold py-2 rounded-lg text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold py-2 rounded-lg text-center cursor-pointer shadow-3xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
