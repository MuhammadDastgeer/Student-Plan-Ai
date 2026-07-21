import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  ChevronRight, 
  Briefcase,
  Layers,
  Settings,
  X,
  Check,
  Layout,
  FolderPlus,
  Clock,
  ArrowRightLeft
} from "lucide-react";
import { authStore } from "../lib/authStore";

interface Board {
  id: string;
  title: string;
  color: string; // "green" | "orange" | "blue" | "rose" | "purple" | "amber"
  description?: string;
}

interface Column {
  id: string;
  boardId: string;
  title: string;
  color: string; // "green" | "orange" | "blue" | "rose" | "purple" | "amber"
  description?: string;
}

interface BoardTask {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  date: string; // YYYY-MM-DD
  color: string; // "green" | "orange" | "blue" | "rose" | "purple" | "amber"
  priority: "low" | "medium" | "high";
  description?: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string; hoverBg: string; line: string }> = {
  green: { 
    bg: "bg-[#F0FDF4]", 
    text: "text-[#166534]", 
    border: "border-[#BBF7D0]", 
    dot: "bg-[#22C55E]",
    hoverBg: "hover:bg-[#DCFCE7]",
    line: "border-l-4 border-l-[#22C55E]"
  },
  orange: { 
    bg: "bg-[#FFF7ED]", 
    text: "text-[#9A3412]", 
    border: "border-[#FFEDD5]", 
    dot: "bg-[#F97316]",
    hoverBg: "hover:bg-[#FFEDD5]",
    line: "border-l-4 border-l-[#F97316]"
  },
  blue: { 
    bg: "bg-[#EFF6FF]", 
    text: "text-[#1E40AF]", 
    border: "border-[#BFDBFE]", 
    dot: "bg-[#3B82F6]",
    hoverBg: "hover:bg-[#DBEAFE]",
    line: "border-l-4 border-l-[#3B82F6]"
  },
  rose: { 
    bg: "bg-[#FFF1F2]", 
    text: "text-[#9F1239]", 
    border: "border-[#FECDD3]", 
    dot: "bg-[#F43F5E]",
    hoverBg: "hover:bg-[#FFE4E6]",
    line: "border-l-4 border-l-[#F43F5E]"
  },
  purple: { 
    bg: "bg-[#FAF5FF]", 
    text: "text-[#6B21A8]", 
    border: "border-[#E9D5FF]", 
    dot: "bg-[#A855F7]",
    hoverBg: "hover:bg-[#F3E8FF]",
    line: "border-l-4 border-l-[#A855F7]"
  },
  amber: { 
    bg: "bg-[#FFFBEB]", 
    text: "text-[#78350F]", 
    border: "border-[#FEF3C7]", 
    dot: "bg-[#F59E0B]",
    hoverBg: "hover:bg-[#FEF3C7]",
    line: "border-l-4 border-l-[#F59E0B]"
  },
};

const COLOR_OPTIONS = [
  { name: "Emerald Green", value: "green" },
  { name: "Sunset Orange", value: "orange" },
  { name: "Ocean Blue", value: "blue" },
  { name: "Rose Pink", value: "rose" },
  { name: "Grape Purple", value: "purple" },
  { name: "Warm Amber", value: "amber" }
];

export default function WorkspaceKanban() {
  const currentUser = authStore.getCurrentUser();
  const boardsKey = currentUser ? `flowbase_user_${currentUser.email}_kanban_boards` : "workspace_kanban_boards";
  const selectedBoardKey = currentUser ? `flowbase_user_${currentUser.email}_kanban_selected_board` : "workspace_kanban_selected_board";
  const columnsKey = currentUser ? `flowbase_user_${currentUser.email}_kanban_columns` : "workspace_kanban_columns";
  const tasksKey = currentUser ? `flowbase_user_${currentUser.email}_kanban_tasks` : "workspace_kanban_tasks";

  // Empty states initially or loaded from localStorage
  const [boards, setBoards] = useState<Board[]>(() => {
    const saved = localStorage.getItem(boardsKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [selectedBoardId, setSelectedBoardId] = useState<string>(() => {
    const saved = localStorage.getItem(selectedBoardKey);
    if (saved) return saved;
    const savedBoards = localStorage.getItem(boardsKey);
    if (savedBoards) {
      try {
        const parsed = JSON.parse(savedBoards);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      } catch (e) {}
    }
    return "";
  });

  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem(columnsKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [tasks, setTasks] = useState<BoardTask[]>(() => {
    const saved = localStorage.getItem(tasksKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem(boardsKey, JSON.stringify(boards));
    if (boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id);
    }
  }, [boards, boardsKey]);

  React.useEffect(() => {
    localStorage.setItem(selectedBoardKey, selectedBoardId);
  }, [selectedBoardId, selectedBoardKey]);

  React.useEffect(() => {
    localStorage.setItem(columnsKey, JSON.stringify(columns));
  }, [columns, columnsKey]);

  React.useEffect(() => {
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
  }, [tasks, tasksKey]);

  // Input states for Board creation
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardColor, setNewBoardColor] = useState("blue");
  const [newBoardDescription, setNewBoardDescription] = useState("");

  // Input states for Column creation
  const [showAddColumnForm, setShowAddColumnForm] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColColor, setNewColColor] = useState("green");
  const [newColDescription, setNewColDescription] = useState("");

  // Input states for Task creation modal
  const [showAddTaskModalForCol, setShowAddTaskModalForCol] = useState<string | null>(null); // columnId
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTaskColor, setNewTaskColor] = useState("blue");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  // EDIT modal/states
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const [editBoardColor, setEditBoardColor] = useState("blue");
  const [editBoardDescription, setEditBoardDescription] = useState("");

  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");
  const [editColumnColor, setEditColumnColor] = useState("blue");
  const [editColumnDescription, setEditColumnDescription] = useState("");

  const [editingTask, setEditingTask] = useState<BoardTask | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskDate, setEditTaskDate] = useState("");
  const [editTaskColor, setEditTaskColor] = useState("blue");
  const [editTaskPriority, setEditTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [editTaskColumnId, setEditTaskColumnId] = useState("");

  // CRUD handlers for Boards
  const handleCreateBoard = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newBoardTitle.trim()) return;

    const boardId = "board-" + Math.random().toString(36).substr(2, 9);
    const newBoard: Board = {
      id: boardId,
      title: newBoardTitle.trim(),
      color: newBoardColor,
      description: newBoardDescription.trim()
    };

    setBoards([...boards, newBoard]);
    setSelectedBoardId(boardId);
    setNewBoardTitle("");
    setNewBoardColor("blue");
    setNewBoardDescription("");
  };

  const handleUpdateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard || !editBoardTitle.trim()) return;

    setBoards(boards.map(b => b.id === editingBoard.id ? { ...b, title: editBoardTitle.trim(), color: editBoardColor, description: editBoardDescription.trim() } : b));
    setEditingBoard(null);
  };

  const handleDeleteBoard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBoards(boards.filter(b => b.id !== id));
    // Remove dependent columns and tasks
    setColumns(columns.filter(c => c.boardId !== id));
    setTasks(tasks.filter(t => t.boardId !== id));

    if (selectedBoardId === id) {
      const remaining = boards.filter(b => b.id !== id);
      setSelectedBoardId(remaining.length > 0 ? remaining[0].id : "");
    }
  };

  // CRUD handlers for Columns
  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim() || !selectedBoardId) return;

    const colId = "col-" + Math.random().toString(36).substr(2, 9);
    const newCol: Column = {
      id: colId,
      boardId: selectedBoardId,
      title: newColTitle.trim(),
      color: newColColor,
      description: newColDescription.trim()
    };

    setColumns([...columns, newCol]);
    setNewColTitle("");
    setNewColColor("green");
    setNewColDescription("");
    setShowAddColumnForm(false);
  };

  const handleUpdateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColumn || !editColumnTitle.trim()) return;

    setColumns(columns.map(c => c.id === editingColumn.id ? { ...c, title: editColumnTitle.trim(), color: editColumnColor, description: editColumnDescription.trim() } : c));
    setEditingColumn(null);
  };

  const handleDeleteColumn = (colId: string) => {
    setColumns(columns.filter(c => c.id !== colId));
    setTasks(tasks.filter(t => t.columnId !== colId));
  };

  // CRUD handlers for Tasks
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !showAddTaskModalForCol || !selectedBoardId) return;

    const taskId = "task-" + Math.random().toString(36).substr(2, 9);
    const newTask: BoardTask = {
      id: taskId,
      columnId: showAddTaskModalForCol,
      boardId: selectedBoardId,
      title: newTaskTitle.trim(),
      date: newTaskDate,
      color: newTaskColor,
      priority: newTaskPriority,
      description: newTaskDescription.trim()
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskColor("blue");
    setNewTaskPriority("medium");
    setShowAddTaskModalForCol(null);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTaskTitle.trim()) return;

    setTasks(tasks.map(t => t.id === editingTask.id ? {
      ...t,
      title: editTaskTitle.trim(),
      date: editTaskDate,
      color: editTaskColor,
      priority: editTaskPriority,
      columnId: editTaskColumnId,
      description: editTaskDescription.trim()
    } : t));

    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Filter components active in selected board
  const activeBoard = boards.find(b => b.id === selectedBoardId);
  const activeColumns = columns.filter(c => c.boardId === selectedBoardId);
  const activeTasks = tasks.filter(t => t.boardId === selectedBoardId);

  return (
    <div id="workspace-kanban" className="p-6 md:p-8 bg-[#FAF8F5] min-h-[calc(100vh-60px)] flex flex-col space-y-6">
      
      {/* Header section */}
      <div className="text-left space-y-1">
        <h1 className="font-serif text-3xl font-bold text-[#221C18]">
          Collaborative Kanban Boards
        </h1>
        <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-xl">
          Craft completely customized workspaces. Set custom colors and dates on your boards, columns, and task cards.
        </p>
      </div>

      {boards.length === 0 ? (
        /* Zero boards empty-state with a beautiful board constructor card */
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-white border border-[#EFECE6] rounded-2xl p-8 max-w-md w-full shadow-xs text-center space-y-6">
            <div className="w-16 h-16 bg-[#FAF2EC] border border-[#F4E3D4] rounded-2xl flex items-center justify-center mx-auto text-[#c67f43] shadow-3xs">
              <FolderPlus className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-[#221C18]">No Boards Configured Yet</h2>
              <p className="text-xs text-stone-400 font-medium max-w-sm mx-auto">
                Begin by shaping your first workflow. Name your board and select a highlight accent theme below.
              </p>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Board Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. YouTube Channel, Web Project..."
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#c67f43] text-stone-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Board Description (Optional)</label>
                <textarea
                  placeholder="e.g. Project backlog, milestones, and launch details..."
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-[#c67f43] text-stone-700 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Board Accent Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_OPTIONS.map((opt) => {
                    const mapped = COLOR_MAP[opt.value];
                    const isSelected = newBoardColor === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNewBoardColor(opt.value)}
                        className={`p-2 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected 
                            ? `${mapped.bg} ${mapped.text} ${mapped.border} ring-2 ring-stone-900/10` 
                            : "bg-stone-50 border-[#EFECE6] text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${mapped.dot}`} />
                        <span>{opt.value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#c67f43] hover:bg-[#b06f37] text-white text-xs font-bold py-3 rounded-xl transition-all shadow-3xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Initialize First Board
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Regular workspace layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column Sidebar - Boards manager */}
          <div className="lg:col-span-3 bg-white border border-[#EFECE6] rounded-2xl p-4 shadow-2xs space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#FAF8F5]">
              <h3 className="text-xs font-bold text-[#c67f43] tracking-wider uppercase flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Workspace Boards
              </h3>
              <span className="text-[10px] text-stone-400 font-bold bg-stone-50 px-2 py-0.5 border border-[#EFECE6] rounded-md">
                {boards.length}
              </span>
            </div>

            {/* Quick-add board inline form */}
            <form onSubmit={handleCreateBoard} className="bg-stone-50/50 p-2.5 rounded-xl border border-[#EFECE6] space-y-2">
              <input
                type="text"
                required
                placeholder="New board title..."
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                className="w-full bg-white border border-[#EFECE6] rounded-md px-2.5 py-1.5 text-xs focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description (optional)..."
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
                className="w-full bg-white border border-[#EFECE6] rounded-md px-2.5 py-1.5 text-xs focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  {["blue", "green", "orange", "rose"].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewBoardColor(color)}
                      className={`w-4 h-4 rounded-full ${COLOR_MAP[color].dot} border ${
                        newBoardColor === color ? "ring-2 ring-stone-900/20 scale-110" : "opacity-60 hover:opacity-100"
                      }`}
                      title={color}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="bg-[#c67f43] hover:bg-[#b06f37] text-white px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Create
                </button>
              </div>
            </form>

            {/* Board List */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {boards.map((b) => {
                const isSelected = b.id === selectedBoardId;
                const config = COLOR_MAP[b.color] || COLOR_MAP.blue;
                const boardColCount = columns.filter(c => c.boardId === b.id).length;
                const boardTaskCount = tasks.filter(t => t.boardId === b.id).length;

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBoardId(b.id);
                      setShowAddColumnForm(false);
                    }}
                    className={`flex flex-col p-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all relative group border ${
                      isSelected
                        ? `${config.bg} ${config.text} ${config.border}`
                        : "bg-white border-[#EFECE6] text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                        <span className="truncate">{b.title}</span>
                      </div>

                      {/* Board edit & delete triggers */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBoard(b);
                            setEditBoardTitle(b.title);
                            setEditBoardColor(b.color);
                            setEditBoardDescription(b.description || "");
                          }}
                          className="p-1 hover:bg-black/5 rounded text-stone-500 hover:text-stone-800"
                          title="Edit Board"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteBoard(b.id, e)}
                          className="p-1 hover:bg-red-50 rounded text-stone-400 hover:text-red-600"
                          title="Delete Board"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-stone-400 font-semibold mt-1">
                      {boardColCount} columns • {boardTaskCount} tasks
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-9 bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs space-y-6 text-left">
            
            {/* Top Board Details header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FAF8F5]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`w-3 h-3 rounded-full ${COLOR_MAP[activeBoard?.color || "blue"]?.dot}`} />
                  <h2 className="font-serif text-xl font-bold text-[#221C18]">
                    {activeBoard ? activeBoard.title : "Workspace"}
                  </h2>
                </div>
                {activeBoard?.description && (
                  <p className="text-xs text-stone-500 font-normal leading-relaxed mt-1 max-w-xl break-words">
                    {activeBoard.description}
                  </p>
                )}
                <p className="text-xs text-stone-400 font-medium mt-1">
                  {activeColumns.length} columns • {activeTasks.length} tasks in this board
                </p>
              </div>

              {/* Profiles & Trigger controls */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <button
                  onClick={() => setShowAddColumnForm(!showAddColumnForm)}
                  className="bg-[#c67f43] hover:bg-[#b06f37] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-3xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Column
                </button>
              </div>
            </div>

            {/* Quick add column form */}
            <AnimatePresence>
              {showAddColumnForm && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleCreateColumn}
                  className="bg-[#FAF8F5] border border-[#EFECE6] p-4 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-stone-700 uppercase tracking-wide">Create New Column</h4>
                    <button 
                      type="button" 
                      onClick={() => setShowAddColumnForm(false)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Column Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. In Progress, Final QC..."
                        value={newColTitle}
                        onChange={(e) => setNewColTitle(e.target.value)}
                        className="w-full bg-white border border-[#EFECE6] rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Column Color Theme</label>
                      <div className="flex gap-1.5">
                        {COLOR_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setNewColColor(opt.value)}
                            className={`w-6 h-6 rounded-full ${COLOR_MAP[opt.value].dot} border ${
                              newColColor === opt.value ? "ring-2 ring-stone-900/30 scale-110" : "opacity-60 hover:opacity-100"
                            }`}
                            title={opt.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Column Description (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Tasks currently under active development..."
                      value={newColDescription}
                      onChange={(e) => setNewColDescription(e.target.value)}
                      className="w-full bg-white border border-[#EFECE6] rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddColumnForm(false)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-bold text-stone-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#c67f43] hover:bg-[#b06f37] text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Add Column
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Columns Grid list */}
            {activeColumns.length === 0 ? (
              <div className="border border-dashed border-[#EFECE6] bg-[#FAF8F5]/50 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3 min-h-[300px]">
                <div className="p-3 bg-white border border-[#EFECE6] rounded-full text-[#c67f43] shadow-3xs">
                  <Layout className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-700">No Columns Formed</h4>
                <p className="text-xs text-stone-400 font-medium leading-normal max-w-[280px]">
                  Build columns (e.g., Ideas, Scheduled, Complete) to manage task cards.
                </p>
                <button
                  onClick={() => setShowAddColumnForm(true)}
                  className="bg-stone-100 hover:bg-[#FAF2EC] text-stone-700 hover:text-[#c67f43] border border-[#EFECE6] text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Column
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                {activeColumns.map((col) => {
                  const colTasks = activeTasks.filter(t => t.columnId === col.id);
                  const config = COLOR_MAP[col.color] || COLOR_MAP.green;

                  return (
                    <div 
                      key={col.id} 
                      className="bg-[#FAF8F5]/60 border border-[#EFECE6] rounded-xl p-4 flex flex-col space-y-4 min-h-[400px] transition-all relative"
                    >
                      
                      {/* Column Header */}
                      <div className="flex flex-col border-b border-stone-200/50 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-3 h-3 rounded-full ${config.dot}`} />
                            <h3 className="text-xs font-extrabold text-stone-800 truncate">{col.title}</h3>
                            <span className="text-[9px] text-stone-400 font-extrabold bg-white border border-[#EFECE6] px-1.5 py-0.2 rounded-md">
                              {colTasks.length}
                            </span>
                          </div>

                          {/* Column edits and deletions */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setShowAddTaskModalForCol(col.id);
                                setNewTaskTitle("");
                                setNewTaskDescription("");
                              }}
                              className="p-1 hover:bg-[#FAF2EC] hover:text-[#c67f43] rounded-md text-stone-400 cursor-pointer transition-colors"
                              title="Add Task"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingColumn(col);
                                setEditColumnTitle(col.title);
                                setEditColumnColor(col.color);
                                setEditColumnDescription(col.description || "");
                              }}
                              className="p-1 hover:bg-stone-200/50 rounded-md text-stone-400 cursor-pointer transition-colors"
                              title="Edit Column"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteColumn(col.id)}
                              className="p-1 hover:bg-red-50 hover:text-red-600 rounded-md text-stone-400 cursor-pointer transition-colors"
                              title="Delete Column"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {col.description && (
                          <p className="text-[10px] text-stone-400 font-medium leading-relaxed mt-1 text-left break-words">
                            {col.description}
                          </p>
                        )}
                      </div>

                      {/* Tasks Block */}
                      <div className="flex-grow space-y-3">
                        {colTasks.length === 0 ? (
                          <div
                            onClick={() => {
                              setShowAddTaskModalForCol(col.id);
                              setNewTaskTitle("");
                            }}
                            className="border border-dashed border-[#EFECE6] hover:border-[#c67f43] hover:bg-white bg-white/30 p-4 rounded-xl text-center flex items-center justify-center cursor-pointer transition-all py-8 text-[11px] font-bold text-stone-400 hover:text-[#c67f43]"
                          >
                            + Add task card
                          </div>
                        ) : (
                          colTasks.map((task) => {
                            const tConfig = COLOR_MAP[task.color] || COLOR_MAP.blue;
                            return (
                              <div
                                key={task.id}
                                className={`bg-white border border-[#EFECE6] p-4 rounded-xl space-y-3 shadow-3xs relative group transition-all hover:shadow-2xs ${tConfig.line}`}
                              >
                                <div className="flex items-center justify-between">
                                  {/* Task priority indicator */}
                                  <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                                    task.priority === "high" 
                                      ? "bg-red-100 text-red-700" 
                                      : task.priority === "medium" 
                                      ? "bg-amber-100 text-amber-700" 
                                      : "bg-green-100 text-green-700"
                                  }`}>
                                    {task.priority}
                                  </span>

                                  {/* Quick task action bar */}
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        setEditingTask(task);
                                        setEditTaskTitle(task.title);
                                        setEditTaskDescription(task.description || "");
                                        setEditTaskDate(task.date);
                                        setEditTaskColor(task.color);
                                        setEditTaskPriority(task.priority);
                                        setEditTaskColumnId(task.columnId);
                                      }}
                                      className="text-stone-400 hover:text-stone-800 p-0.5"
                                      title="Edit Task"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="text-stone-400 hover:text-red-500 p-0.5"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Task Title */}
                                <h4 className="text-xs font-bold text-stone-800 leading-normal text-left break-words">
                                  {task.title}
                                </h4>

                                {task.description && (
                                  <p className="text-[11px] text-stone-500 font-normal leading-relaxed text-left break-words">
                                    {task.description}
                                  </p>
                                )}

                                {/* Task bottom details - Date & indicator */}
                                <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold pt-2 border-t border-[#FAF8F5]">
                                  <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#EFECE6] px-2 py-0.5 rounded-md text-[9px] font-medium text-stone-500">
                                    <Calendar className="w-3 h-3 text-stone-400" />
                                    <span>{task.date}</span>
                                  </div>
                                  <span className="text-[9px] text-stone-400 font-medium italic">
                                    {tConfig.text.replace("text-", "").replace("[#", "").substr(0, 5)}
                                  </span>
                                </div>

                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* -------------------- ALL MODAL POPUPS FOR CRUD ACTIONS -------------------- */}

      {/* Board Edit Modal */}
      <AnimatePresence>
        {editingBoard && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#EFECE6] rounded-2xl p-6 max-w-sm w-full mx-4 text-left shadow-lg space-y-4"
            >
              <div>
                <h3 className="font-serif text-lg font-bold text-[#221C18]">Edit Board Accent</h3>
                <p className="text-xs text-stone-400 font-medium">Configure workspace properties.</p>
              </div>

              <form onSubmit={handleUpdateBoard} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Board Title</label>
                  <input
                    type="text"
                    required
                    value={editBoardTitle}
                    onChange={(e) => setEditBoardTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Board Description (Optional)</label>
                  <textarea
                    value={editBoardDescription}
                    onChange={(e) => setEditBoardDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Board Theme Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_OPTIONS.map((opt) => {
                      const mapped = COLOR_MAP[opt.value];
                      const isSelected = editBoardColor === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditBoardColor(opt.value)}
                          className={`p-2 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isSelected 
                              ? `${mapped.bg} ${mapped.text} ${mapped.border} ring-2 ring-stone-900/10` 
                              : "bg-stone-50 border-[#EFECE6] text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${mapped.dot}`} />
                          <span>{opt.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingBoard(null)}
                    className="flex-1 bg-stone-50 hover:bg-stone-100 border border-[#EFECE6] text-stone-600 text-xs font-bold py-2 rounded-lg text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#c67f43] hover:bg-[#b06f37] text-white text-xs font-bold py-2 rounded-lg text-center cursor-pointer shadow-3xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Column Edit Modal */}
      <AnimatePresence>
        {editingColumn && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#EFECE6] rounded-2xl p-6 max-w-sm w-full mx-4 text-left shadow-lg space-y-4"
            >
              <div>
                <h3 className="font-serif text-lg font-bold text-[#221C18]">Edit Column Properties</h3>
                <p className="text-xs text-stone-400 font-medium">Update header colors and labels.</p>
              </div>

              <form onSubmit={handleUpdateColumn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Column Header</label>
                  <input
                    type="text"
                    required
                    value={editColumnTitle}
                    onChange={(e) => setEditColumnTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Column Description (Optional)</label>
                  <input
                    type="text"
                    value={editColumnDescription}
                    onChange={(e) => setEditColumnDescription(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Column Color Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_OPTIONS.map((opt) => {
                      const mapped = COLOR_MAP[opt.value];
                      const isSelected = editColumnColor === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditColumnColor(opt.value)}
                          className={`p-2 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isSelected 
                              ? `${mapped.bg} ${mapped.text} ${mapped.border} ring-2 ring-stone-900/10` 
                              : "bg-stone-50 border-[#EFECE6] text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${mapped.dot}`} />
                          <span>{opt.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingColumn(null)}
                    className="flex-1 bg-stone-50 hover:bg-stone-100 border border-[#EFECE6] text-stone-600 text-xs font-bold py-2 rounded-lg text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#c67f43] hover:bg-[#b06f37] text-white text-xs font-bold py-2 rounded-lg text-center cursor-pointer shadow-3xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Add Modal */}
      <AnimatePresence>
        {showAddTaskModalForCol && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#EFECE6] rounded-2xl p-6 max-w-sm w-full mx-4 text-left shadow-lg space-y-4"
            >
              <div>
                <h3 className="font-serif text-lg font-bold text-[#221C18]">Create Task Card</h3>
                <p className="text-xs text-stone-400 font-medium">Add task detail, priority, color and target schedule.</p>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gather visual assets..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#c67f43]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Description (Optional)</label>
                  <textarea
                    placeholder="e.g. Details, notes, checklist links..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#c67f43] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Date</label>
                    <input
                      type="date"
                      required
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#c67f43] text-stone-700 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#c67f43] text-stone-700 font-medium"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Card Accent Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_OPTIONS.map((opt) => {
                      const mapped = COLOR_MAP[opt.value];
                      const isSelected = newTaskColor === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setNewTaskColor(opt.value)}
                          className={`p-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isSelected 
                              ? `${mapped.bg} ${mapped.text} ${mapped.border} ring-2 ring-stone-900/10` 
                              : "bg-stone-50 border-[#EFECE6] text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${mapped.dot}`} />
                          <span className="text-[10px]">{opt.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModalForCol(null)}
                    className="flex-1 bg-stone-50 hover:bg-stone-100 border border-[#EFECE6] text-stone-600 text-xs font-bold py-2 rounded-lg text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#c67f43] hover:bg-[#b06f37] text-white text-xs font-bold py-2 rounded-lg text-center cursor-pointer shadow-3xs"
                  >
                    Save Card
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
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Edit Task Card</h3>
                  <p className="text-xs text-stone-400 font-medium">Configure card options and schedules.</p>
                </div>
                <button
                  onClick={() => {
                    handleDeleteTask(editingTask.id);
                    setEditingTask(null);
                  }}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Task Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateTask} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Task Title</label>
                  <input
                    type="text"
                    required
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#c67f43]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Description (Optional)</label>
                  <textarea
                    value={editTaskDescription}
                    onChange={(e) => setEditTaskDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#c67f43] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Target Date</label>
                    <input
                      type="date"
                      required
                      value={editTaskDate}
                      onChange={(e) => setEditTaskDate(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#c67f43] text-stone-700 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Priority</label>
                    <select
                      value={editTaskPriority}
                      onChange={(e) => setEditTaskPriority(e.target.value as any)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#c67f43] text-stone-700 font-medium"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                {/* Column migration selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Move Column</label>
                  <select
                    value={editTaskColumnId}
                    onChange={(e) => setEditTaskColumnId(e.target.value)}
                    className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#c67f43] text-stone-700 font-medium"
                  >
                    {activeColumns.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Card Accent Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_OPTIONS.map((opt) => {
                      const mapped = COLOR_MAP[opt.value];
                      const isSelected = editTaskColor === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditTaskColor(opt.value)}
                          className={`p-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isSelected 
                              ? `${mapped.bg} ${mapped.text} ${mapped.border} ring-2 ring-stone-900/10` 
                              : "bg-stone-50 border-[#EFECE6] text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${mapped.dot}`} />
                          <span className="text-[10px]">{opt.value}</span>
                        </button>
                      );
                    })}
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
                    className="flex-1 bg-[#c67f43] hover:bg-[#b06f37] text-white text-xs font-bold py-2 rounded-lg text-center cursor-pointer shadow-3xs"
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
