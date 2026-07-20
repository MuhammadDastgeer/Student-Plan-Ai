import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Folder, 
  Plus, 
  Search, 
  Star, 
  MoreHorizontal, 
  Grid, 
  List as ListIcon, 
  ChevronDown, 
  FilePlus, 
  UserPlus, 
  Users,
  Eye,
  Trash2,
  ChevronLeft,
  FileText,
  Brush,
  FolderOpen,
  Link as LinkIcon,
  Unlink,
  ExternalLink
} from "lucide-react";
import { useRouter } from "./Router";

interface WorkspaceSpace {
  id: string;
  name: string;
  desc: string;
  updatedAt: string;
  themeColor: string; // "blue" | "yellow" | "green" | "red" | "purple"
  isFavorite: boolean;
}

export default function WorkspaceSpaces() {
  const { navigate } = useRouter();

  // Load spaces from localStorage. Start completely empty by default as requested.
  const [spaces, setSpaces] = useState<WorkspaceSpace[]>(() => {
    const saved = localStorage.getItem("workspace_spaces");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse workspace_spaces", e);
      }
    }
    return []; // Start with NO pre-existing spaces ("pale say koi b space ni ho")
  });

  // Track selected space for full folder view
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  // Load notes and whiteboards from localStorage to show their counts and link them to spaces
  const [allNotes, setAllNotes] = useState<any[]>(() => {
    const saved = localStorage.getItem("workspace_notes");
    return saved ? JSON.parse(saved) : [];
  });

  const [allBoards, setAllBoards] = useState<any[]>(() => {
    const saved = localStorage.getItem("workspace_whiteboards_list");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSpace, setShowAddSpace] = useState(false);
  
  // Link existing file dialog states
  const [showLinkNoteModal, setShowLinkNoteModal] = useState(false);
  const [showLinkBoardModal, setShowLinkBoardModal] = useState(false);
  
  // New space form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("blue");

  // Save spaces list to localStorage
  const saveSpaces = (updated: WorkspaceSpace[]) => {
    setSpaces(updated);
    localStorage.setItem("workspace_spaces", JSON.stringify(updated));
  };

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const added: WorkspaceSpace = {
        id: "space-" + Math.random().toString(36).substr(2, 9),
        name: newName.trim(),
        desc: newDesc.trim() || "Workspace resources and files.",
        updatedAt: "Just now",
        themeColor: newColor,
        isFavorite: false
      };
      const updated = [added, ...spaces];
      saveSpaces(updated);
      setNewName("");
      setNewDesc("");
      setShowAddSpace(false);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = spaces.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s);
    saveSpaces(updated);
  };

  const deleteSpace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = spaces.filter(s => s.id !== id);
    saveSpaces(updated);
    if (selectedSpaceId === id) {
      setSelectedSpaceId(null);
    }
  };

  const getFolderColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]";
      case "yellow": return "bg-[#FEF9C3] text-[#CA8A04] border-[#FEF08A]";
      case "green": return "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]";
      case "red": return "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]";
      case "purple": return "bg-[#F3E8FF] text-[#9333EA] border-[#E9D5FF]";
      default: return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  const getFolderTextAccent = (color: string) => {
    switch (color) {
      case "blue": return "text-[#0284C7]";
      case "yellow": return "text-[#CA8A04]";
      case "green": return "text-[#16A34A]";
      case "red": return "text-[#DC2626]";
      case "purple": return "text-[#9333EA]";
      default: return "text-stone-600";
    }
  };

  // Get dynamic pages count for folder cards
  const getPagesCount = (spaceId: string) => {
    const notesCount = allNotes.filter(n => n.spaceId === spaceId && !n.isDeleted).length;
    const boardsCount = allBoards.filter(b => b.spaceId === spaceId).length;
    return notesCount + boardsCount;
  };

  // Create new note directly inside a Space
  const handleCreateNoteInSpace = (spaceId: string) => {
    const newId = "note-" + Math.random().toString(36).substr(2, 9);
    const newNote = {
      id: newId,
      title: "Untitled Note",
      content: "",
      updatedAt: "Just now",
      wordCount: 0,
      isPinned: false,
      isDeleted: false,
      spaceId: spaceId
    };

    const savedNotes = localStorage.getItem("workspace_notes");
    let currentNotes = savedNotes ? JSON.parse(savedNotes) : [];
    currentNotes = [newNote, ...currentNotes];
    localStorage.setItem("workspace_notes", JSON.stringify(currentNotes));
    setAllNotes(currentNotes);

    // Save selected note id and navigate
    localStorage.setItem("selected_note_id", newId);
    navigate("/notes");
  };

  // Create new whiteboard directly inside a Space
  const handleCreateBoardInSpace = (spaceId: string) => {
    const newId = "board-" + Math.random().toString(36).substr(2, 9);
    const newBoard = {
      id: newId,
      title: "Untitled Whiteboard",
      sub: "Just now",
      spaceId: spaceId
    };

    // Save whiteboard list
    const savedBoards = localStorage.getItem("workspace_whiteboards_list");
    let currentBoards = savedBoards ? JSON.parse(savedBoards) : [];
    currentBoards = [...currentBoards, newBoard];
    localStorage.setItem("workspace_whiteboards_list", JSON.stringify(currentBoards));
    setAllBoards(currentBoards);

    // Initialize board elements data map
    const savedData = localStorage.getItem("workspace_whiteboards_data");
    let currentData = savedData ? JSON.parse(savedData) : {};
    currentData[newId] = [];
    localStorage.setItem("workspace_whiteboards_data", JSON.stringify(currentData));

    // Save selected board id and navigate
    localStorage.setItem("selected_board_id", newId);
    navigate("/whiteboard");
  };

  // Link an existing Note to this Space
  const handleLinkNote = (noteId: string, spaceId: string) => {
    const updated = allNotes.map(n => n.id === noteId ? { ...n, spaceId } : n);
    setAllNotes(updated);
    localStorage.setItem("workspace_notes", JSON.stringify(updated));
    setShowLinkNoteModal(false);
  };

  // Link an existing Whiteboard to this Space
  const handleLinkBoard = (boardId: string, spaceId: string) => {
    const updated = allBoards.map(b => b.id === boardId ? { ...b, spaceId } : b);
    setAllBoards(updated);
    localStorage.setItem("workspace_whiteboards_list", JSON.stringify(updated));
    setShowLinkBoardModal(false);
  };

  // Unlink a Note from this Space
  const handleUnlinkNote = (noteId: string) => {
    const updated = allNotes.map(n => n.id === noteId ? { ...n, spaceId: undefined } : n);
    setAllNotes(updated);
    localStorage.setItem("workspace_notes", JSON.stringify(updated));
  };

  // Unlink a Whiteboard from this Space
  const handleUnlinkBoard = (boardId: string) => {
    const updated = allBoards.map(b => b.id === boardId ? { ...b, spaceId: undefined } : b);
    setAllBoards(updated);
    localStorage.setItem("workspace_whiteboards_list", JSON.stringify(updated));
  };

  const handleOpenNote = (noteId: string) => {
    localStorage.setItem("selected_note_id", noteId);
    navigate("/notes");
  };

  const handleOpenBoard = (boardId: string) => {
    localStorage.setItem("selected_board_id", boardId);
    navigate("/whiteboard");
  };

  const filteredSpaces = spaces.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "favorites") {
      return matchesSearch && s.isFavorite;
    }
    return matchesSearch;
  });

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  // Filter notes and whiteboards that belong to the active space
  const spaceNotes = allNotes.filter(n => n.spaceId === selectedSpaceId && !n.isDeleted);
  const spaceBoards = allBoards.filter(b => b.spaceId === selectedSpaceId);

  // Available files to be linked (files without a space or in a different space)
  const unlinkedNotes = allNotes.filter(n => n.spaceId !== selectedSpaceId && !n.isDeleted);
  const unlinkedBoards = allBoards.filter(b => b.spaceId !== selectedSpaceId);

  return (
    <div id="workspace-spaces" className="p-6 md:p-8 bg-[#FAF8F5] min-h-[calc(100vh-60px)] flex flex-col space-y-6">
      
      {/* -------------------- DETAIL VIEW FOR OPENED SPACE -------------------- */}
      {selectedSpaceId && selectedSpace ? (
        <div className="space-y-6 text-left">
          
          {/* Back Button & Folder Info */}
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => setSelectedSpaceId(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer self-start"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Spaces</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl border ${getFolderColor(selectedSpace.themeColor)}`}>
                  <FolderOpen className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-2xl font-bold text-[#221C18]">
                      {selectedSpace.name}
                    </h1>
                    <span className={`text-[10px] uppercase tracking-wide font-extrabold px-2 py-0.5 rounded-full border ${getFolderColor(selectedSpace.themeColor)}`}>
                      {selectedSpace.themeColor} space
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 max-w-xl">
                    {selectedSpace.desc}
                  </p>
                </div>
              </div>

              {/* Quick statistics */}
              <div className="flex items-center gap-4 text-xs font-bold text-stone-500 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#FAF8F5]">
                <div className="px-4 py-2 bg-stone-50 rounded-xl text-center">
                  <span className="block text-lg font-bold text-stone-800">{spaceNotes.length}</span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wide">Notes</span>
                </div>
                <div className="px-4 py-2 bg-stone-50 rounded-xl text-center">
                  <span className="block text-lg font-bold text-stone-800">{spaceBoards.length}</span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wide">Whiteboards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Grid for Files inside this Space */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN 1: NOTES & DOCUMENTS */}
            <div className="bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-stone-500" />
                  <h3 className="font-serif text-base font-bold text-[#221C18]">Notes & Documents</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateNoteInSpace(selectedSpace.id)}
                    className="bg-[#E05A47] hover:bg-[#c64f3c] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" /> New Note
                  </button>
                  <button
                    onClick={() => setShowLinkNoteModal(true)}
                    className="bg-stone-50 border border-[#EFECE6] hover:bg-stone-100 text-[#221C18] text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <LinkIcon className="w-3 h-3 text-stone-400" /> Link Existing
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {spaceNotes.length === 0 ? (
                  <div className="border border-dashed border-[#EFECE6] rounded-xl p-8 text-center space-y-2 text-stone-400 bg-[#FAF8F5]/50">
                    <FileText className="w-8 h-8 text-stone-200 mx-auto" />
                    <p className="text-xs font-bold text-stone-500">No Notes in this Space</p>
                    <p className="text-[10px] text-stone-400 max-w-[220px] mx-auto">Create a new note or link an existing one to organize it here.</p>
                  </div>
                ) : (
                  spaceNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleOpenNote(note.id)}
                      className="group border border-[#EFECE6] rounded-xl p-3 bg-[#FAF8F5]/30 hover:bg-white hover:border-[#E05A47]/40 hover:shadow-2xs transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-[#FAF2EC] text-[#c67f43] rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="text-left min-w-0">
                          <h4 className="text-xs font-bold text-stone-800 truncate">{note.title || "Untitled Note"}</h4>
                          <span className="text-[10px] text-stone-400 font-semibold">{note.wordCount} words • {note.updatedAt}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlinkNote(note.id);
                          }}
                          className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg cursor-pointer"
                          title="Remove from Space"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenNote(note.id);
                          }}
                          className="p-1.5 hover:bg-[#FAF2EC] text-[#c67f43] rounded-lg cursor-pointer"
                          title="Open Note"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: WHITEBOARDS & DIAGRAMS */}
            <div className="bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-2xs flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brush className="w-4 h-4 text-stone-500" />
                  <h3 className="font-serif text-base font-bold text-[#221C18]">Whiteboards & Diagrams</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateBoardInSpace(selectedSpace.id)}
                    className="bg-[#E05A47] hover:bg-[#c64f3c] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" /> New Whiteboard
                  </button>
                  <button
                    onClick={() => setShowLinkBoardModal(true)}
                    className="bg-stone-50 border border-[#EFECE6] hover:bg-stone-100 text-[#221C18] text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <LinkIcon className="w-3 h-3 text-stone-400" /> Link Existing
                  </button>
                </div>
              </div>

              {/* Whiteboards List */}
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {spaceBoards.length === 0 ? (
                  <div className="border border-dashed border-[#EFECE6] rounded-xl p-8 text-center space-y-2 text-stone-400 bg-[#FAF8F5]/50">
                    <Brush className="w-8 h-8 text-stone-200 mx-auto" />
                    <p className="text-xs font-bold text-stone-500">No Whiteboards in this Space</p>
                    <p className="text-[10px] text-stone-400 max-w-[220px] mx-auto">Create a new canvas or link an existing design board here.</p>
                  </div>
                ) : (
                  spaceBoards.map((board) => (
                    <div
                      key={board.id}
                      onClick={() => handleOpenBoard(board.id)}
                      className="group border border-[#EFECE6] rounded-xl p-3 bg-[#FAF8F5]/30 hover:bg-white hover:border-[#E05A47]/40 hover:shadow-2xs transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-[#FAF2EC] text-[#c67f43] rounded-lg">
                          <Brush className="w-4 h-4" />
                        </div>
                        <div className="text-left min-w-0">
                          <h4 className="text-xs font-bold text-stone-800 truncate">{board.title || "Untitled Whiteboard"}</h4>
                          <span className="text-[10px] text-stone-400 font-semibold">{board.sub || "Just now"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlinkBoard(board.id);
                          }}
                          className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg cursor-pointer"
                          title="Remove from Space"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBoard(board.id);
                          }}
                          className="p-1.5 hover:bg-[#FAF2EC] text-[#c67f43] rounded-lg cursor-pointer"
                          title="Open Whiteboard"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* LINK EXISTING NOTE MODAL */}
          {showLinkNoteModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 max-w-md w-full text-left space-y-4 shadow-xl">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Link Existing Note</h3>
                  <p className="text-xs text-stone-400 font-medium">Select an existing note to assign it to the "{selectedSpace.name}" space.</p>
                </div>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {unlinkedNotes.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-4">No unassigned notes found.</p>
                  ) : (
                    unlinkedNotes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => handleLinkNote(note.id, selectedSpace.id)}
                        className="w-full text-left p-2.5 rounded-xl border border-stone-100 hover:border-[#E05A47]/40 bg-stone-50/50 hover:bg-[#FAF2EC]/20 text-xs font-bold text-stone-700 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <span className="truncate">{note.title || "Untitled Note"}</span>
                        <span className="text-[10px] text-stone-400 font-medium whitespace-nowrap ml-2">{note.wordCount} words</span>
                      </button>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setShowLinkNoteModal(false)}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold py-2 rounded-lg text-center cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* LINK EXISTING WHITEBOARD MODAL */}
          {showLinkBoardModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 max-w-md w-full text-left space-y-4 shadow-xl">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Link Existing Whiteboard</h3>
                  <p className="text-xs text-stone-400 font-medium">Select an existing whiteboard design to link to the "{selectedSpace.name}" space.</p>
                </div>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {unlinkedBoards.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-4">No unassigned whiteboards found.</p>
                  ) : (
                    unlinkedBoards.map((board) => (
                      <button
                        key={board.id}
                        onClick={() => handleLinkBoard(board.id, selectedSpace.id)}
                        className="w-full text-left p-2.5 rounded-xl border border-stone-100 hover:border-[#E05A47]/40 bg-stone-50/50 hover:bg-[#FAF2EC]/20 text-xs font-bold text-stone-700 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <span className="truncate">{board.title || "Untitled Whiteboard"}</span>
                        <span className="text-[10px] text-stone-400 font-medium whitespace-nowrap ml-2">{board.sub}</span>
                      </button>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setShowLinkBoardModal(false)}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold py-2 rounded-lg text-center cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* -------------------- MAIN SPACES LIBRARY GRID -------------------- */
        <>
          {/* Page Title matches screenshots */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-left">
              <h1 className="font-serif text-3xl font-bold text-[#221C18]">All Spaces</h1>
              <p className="text-xs text-stone-500 font-medium mt-1">Organize every working document and whiteboard canvas by folder space.</p>
            </div>

            {/* Header control buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowAddSpace(!showAddSpace)}
                className="bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New Space
              </button>
            </div>
          </div>

          {/* Add Space Form Modal */}
          <AnimatePresence>
            {showAddSpace && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-[#EFECE6] rounded-2xl p-6 max-w-md w-full mx-auto text-left shadow-md space-y-4"
              >
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Create New Workspace Space</h3>
                  <p className="text-xs text-stone-400 font-medium">A dedicated space folder keeps your pages and workflows neat.</p>
                </div>

                <form onSubmit={handleCreateSpace} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Space Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Design Lab"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Short description</label>
                    <input
                      type="text"
                      placeholder="e.g. Brand guides and vectors"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Color Accent</label>
                    <select
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs focus:outline-none text-stone-700"
                    >
                      <option value="blue">Blue (Work)</option>
                      <option value="yellow">Yellow (Creative)</option>
                      <option value="green">Green (Personal)</option>
                      <option value="red">Red (Research)</option>
                      <option value="purple">Purple (Productivity)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSpace(false)}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold py-2 rounded-lg text-center cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold py-2 rounded-lg text-center shadow-3xs cursor-pointer transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toolbar Filter matching design */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-[#FAF8F5]">
            
            {/* Search bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#EFECE6] rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#E05A47] text-stone-700"
              />
            </div>

            {/* Tab links */}
            <div className="flex items-center gap-1.5 self-start md:self-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "all" ? "bg-white border border-[#EFECE6] text-stone-900 shadow-3xs" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                All Spaces
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "favorites" ? "bg-white border border-[#EFECE6] text-stone-900 shadow-3xs" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Favorites
              </button>
            </div>

            {/* Views & sorting controls */}
            <div className="flex items-center gap-2.5 self-start md:self-auto text-xs font-bold text-stone-500">
              <div className="flex border border-[#EFECE6] rounded-lg overflow-hidden bg-white">
                <button className="p-1.5 bg-stone-50 text-stone-700 border-r border-[#EFECE6]"><Grid className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 bg-white text-stone-400"><ListIcon className="w-3.5 h-3.5" /></button>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#EFECE6] px-3 py-1.5 rounded-lg">
                <span>Sort Recently Updated</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </div>
            </div>

          </div>

          {/* Grid containing Folder Space Cards */}
          {filteredSpaces.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white border border-[#EFECE6] rounded-2xl shadow-3xs">
              <Folder className="w-12 h-12 text-stone-200 mx-auto fill-current animate-pulse" />
              <h3 className="font-serif text-lg font-bold text-stone-700">No Spaces Yet</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">Click "New Space" above to build your first beautiful folder space for documents and whiteboard files.</p>
              <button
                onClick={() => setShowAddSpace(true)}
                className="mt-2 bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-3xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Space
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpaces.map((space) => (
                <motion.div
                  key={space.id}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedSpaceId(space.id)}
                  className="bg-white border border-[#EFECE6] rounded-2xl p-5 text-left flex flex-col justify-between h-[184px] shadow-2xs hover:shadow-xs relative transition-all group cursor-pointer"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl border ${getFolderColor(space.themeColor)}`}>
                      <Folder className="w-5 h-5 fill-current" />
                    </div>

                    {/* Actions bar */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => toggleFavorite(space.id, e)}
                        className={`p-1 rounded-md hover:bg-stone-50 cursor-pointer ${
                          space.isFavorite ? "text-yellow-500" : "text-stone-300"
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={(e) => deleteSpace(space.id, e)}
                        className="text-stone-300 hover:text-red-600 opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Folder Info */}
                  <div className="space-y-1">
                    <h3 className="font-serif text-[15px] font-bold text-[#221C18] truncate">
                      {space.name}
                    </h3>
                    <p className="text-[11px] text-stone-400 font-semibold line-clamp-1">
                      {space.desc}
                    </p>
                  </div>

                  {/* Bottom Row metadata */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#FAF8F5]">
                    {/* Stack profile avatar */}
                    <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#EFECE6] px-2 py-0.5 rounded-lg text-[9px] font-bold text-stone-500 uppercase tracking-wide">
                      <div className="w-4.5 h-4.5 rounded-full bg-[#1F5A37] text-white flex items-center justify-center font-bold text-[8px] border border-white">SA</div>
                      <span>Owner</span>
                    </div>

                    <span className="text-[10px] text-stone-400 font-bold">
                      {getPagesCount(space.id)} Files • Created {space.updatedAt}
                    </span>
                  </div>

                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}
