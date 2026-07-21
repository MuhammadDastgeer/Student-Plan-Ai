import React, { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  Columns, 
  FileText, 
  Brush, 
  FolderHeart, 
  Wrench, 
  Settings as SettingsIcon, 
  Search, 
  ChevronLeft, 
  Users, 
  ChevronDown, 
  AlertCircle,
  Home,
  MessageSquare,
  Cpu,
  Menu,
  X,
  GraduationCap,
  BookOpen,
  Timer,
  ClipboardList,
  Award,
  HelpCircle
} from "lucide-react";
import { useRouter } from "./Router";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const { currentPath, navigate } = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showIssues, setShowIssues] = useState(true);

  const menuItems = [
    {
      section: "HOME",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { label: "AI Assistant", icon: Sparkles, path: "/ai-assistant" },
      ]
    },
    {
      section: "STUDY",
      items: [
        { label: "Study Planner", icon: GraduationCap, path: "/study-planner" },
        { label: "Flashcards", icon: BookOpen, path: "/study-flashcards" },
        { label: "Focus Timer", icon: Timer, path: "/study-focus-timer" },
        { label: "Assignments", icon: ClipboardList, path: "/study-assignments" },
        { label: "Grade Tracker", icon: Award, path: "/study-grade-tracker" },
      ]
    },
    {
      section: "COLLABORATE",
      items: [
        { label: "Study groups", icon: Users, path: "/study-groups" },
        { label: "Doubt board", icon: HelpCircle, path: "/doubt-board" },
      ]
    },
    {
      section: "RESOURCES",
      items: [
        { label: "Resource library", icon: BookOpen, path: "/resource-library" },
      ]
    },
    {
      section: "WORKSPACE",
      items: [
        { label: "Calendar", icon: Calendar, path: "/calendar" },
        { label: "Task / Kanban", icon: Columns, path: "/kanban" },
        { label: "Notes", icon: FileText, path: "/notes" },
        { label: "Whiteboard", icon: Brush, path: "/whiteboard" },
        { label: "Pages / Spaces", icon: FolderHeart, path: "/spaces" },
      ]
    },
    {
      section: "BUILD",
      items: [
        { label: "AI Template Builder", icon: Wrench, path: "/template-builder" },
        { label: "Apps & Tools", icon: Cpu, path: "/apps" },
        { label: "Settings", icon: SettingsIcon, path: "/settings" },
      ]
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Just simulate searching or alert/toast
    }
  };

  return (
    <div id="workspace-layout" className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[#FAF8F5] text-[#221C18] font-sans antialiased">
      
      {/* Mobile Top Bar Header */}
      <header className="flex md:hidden items-center justify-between px-4 h-14 bg-white border-b border-[#EFECE6] shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 -ml-1 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
          
          <div 
            onClick={() => navigate("/home")} 
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#E05A47] flex items-center justify-center shadow-xs flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-white"
              >
                <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
              </svg>
            </div>
            <h1 className="font-sans font-bold text-[14px] leading-tight text-[#221C18] tracking-tight">
              Flowbase
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1F5A37] text-white flex items-center justify-center font-bold text-[11px] shadow-xs relative">
            S
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-[#27C93F] border border-white" />
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer Overlay (AnimatePresence) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            />

            {/* Slide-out Panel Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="relative w-72 max-w-[80vw] h-full bg-white flex flex-col justify-between shadow-2xl z-10"
            >
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-[#EFECE6] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E05A47] flex items-center justify-center shadow-xs">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-white"
                    >
                      <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h1 className="font-sans font-bold text-[15px] leading-tight text-[#221C18] tracking-tight">
                      Flowbase
                    </h1>
                    <p className="text-[11px] text-stone-400 font-medium leading-none">
                      Cozy workspace
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors focus:outline-none"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation List */}
              <div className="flex-grow overflow-y-auto px-4 py-3 space-y-6">
                {menuItems.map((group, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="text-[10px] font-bold text-stone-400 tracking-wider px-3 uppercase">
                      {group.section}
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = currentPath === item.path;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.path}
                            onClick={() => {
                              navigate(item.path);
                              setIsMobileOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group cursor-pointer ${
                              isActive
                                ? "bg-[#FAF2EC] text-[#c67f43] font-semibold"
                                : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                            }`}
                          >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${
                              isActive ? "text-[#c67f43]" : "text-stone-400 group-hover:text-stone-700"
                            }`} />
                            <span className="text-[13px] tracking-wide flex-grow">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Mobile Drawer Back to Marketing */}
                <div className="pt-4 border-t border-[#F0EBE5]/60">
                  <button
                    onClick={() => {
                      navigate("/home");
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-stone-500 hover:text-stone-800 rounded-lg transition-colors text-left text-xs font-semibold"
                  >
                    <Home className="w-3.5 h-3.5 text-stone-400" />
                    <span>Back to Marketing</span>
                  </button>
                </div>
              </div>

              {/* Drawer Bottom Profile info */}
              <div className="p-4 border-t border-[#EFECE6] bg-white">
                <div className="flex items-center justify-between p-2 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-[#1F5A37] text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0 shadow-xs relative">
                      S
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#27C93F] border border-white" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <h4 className="text-xs font-bold text-[#221C18] truncate leading-none">
                        Studio space
                      </h4>
                      <p className="text-[10px] text-stone-500 font-medium truncate mt-0.5">
                        5 collaborators
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 mr-1 flex-shrink-0" />
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex h-full bg-white border-r border-[#EFECE6] flex-col justify-between relative flex-shrink-0 z-30"
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-14 w-6 h-6 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center hover:bg-stone-50 transition-colors shadow-xs z-40 cursor-pointer"
        >
          <ChevronLeft className={`w-3.5 h-3.5 text-stone-500 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>

        {/* Top Header & Search */}
        <div className="flex flex-col p-4 space-y-4">
          
          {/* Logo Brand Block */}
          <div 
            onClick={() => navigate("/home")} 
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E05A47] flex items-center justify-center shadow-xs flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white"
              >
                <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
              </svg>
            </div>
            {!collapsed && (
              <div className="text-left">
                <h1 className="font-sans font-bold text-[15px] leading-tight text-[#221C18] tracking-tight">
                  Flowbase
                </h1>
                <p className="text-[11px] text-stone-400 font-medium leading-none">
                  Cozy workspace
                </p>
              </div>
            )}
          </div>

          {/* Search Box */}
          {!collapsed ? (
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search everything"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#E05A47] focus:bg-white transition-all text-stone-700 placeholder-stone-400"
              />
              <span className="absolute right-3 top-2 text-[10px] text-stone-400 font-medium px-1.5 py-0.5 bg-white border border-[#EFECE6] rounded-sm select-none">
                ⌘K
              </span>
            </form>
          ) : (
            <div className="w-full flex justify-center py-1">
              <button 
                onClick={() => setCollapsed(false)}
                className="p-2 hover:bg-stone-50 rounded-lg text-stone-400"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-grow overflow-y-auto px-3 py-2 space-y-6">
          {menuItems.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="text-[10px] font-bold text-stone-400 tracking-wider px-3 uppercase">
                  {group.section}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentPath === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group cursor-pointer ${
                        isActive
                          ? "bg-[#FAF2EC] text-[#c67f43] font-semibold"
                          : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? "text-[#c67f43]" : "text-stone-400 group-hover:text-stone-700"
                      }`} />
                      {!collapsed && (
                        <span className="text-[13px] tracking-wide flex-grow">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Marketing Navigation Helper */}
          <div className="pt-4 border-t border-[#F0EBE5]/60">
            <button
              onClick={() => navigate("/home")}
              className="w-full flex items-center gap-3 px-3 py-2 text-stone-500 hover:text-stone-800 rounded-lg transition-colors text-left text-xs font-semibold"
            >
              <Home className="w-3.5 h-3.5 text-stone-400" />
              {!collapsed && <span>Back to Marketing</span>}
            </button>
          </div>
        </div>

        {/* Bottom Profile / Collab Info */}
        <div className="p-3 border-t border-[#EFECE6] bg-white">
          <div className="flex items-center justify-between p-1.5 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#1F5A37] text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0 shadow-xs relative">
                S
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#27C93F] border border-white" />
              </div>
              {!collapsed && (
                <div className="text-left overflow-hidden">
                  <h4 className="text-xs font-bold text-[#221C18] truncate leading-none">
                    Studio space
                  </h4>
                  <p className="text-[10px] text-stone-500 font-medium truncate mt-0.5">
                    5 collaborators
                  </p>
                </div>
              )}
            </div>
            {!collapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 mr-1 flex-shrink-0" />
            )}
          </div>
        </div>

      </motion.aside>

      {/* Main Panel Content Container */}
      <main className="flex-grow h-full overflow-y-auto relative flex flex-col bg-[#FAF8F5]">
        
        <div className="flex-grow">
          {children}
        </div>
      </main>

    </div>
  );
}
