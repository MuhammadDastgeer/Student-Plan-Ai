import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { callOpenAIDiagramGenerate } from "../lib/openaiFallback";
import { authStore } from "../lib/authStore";
import { 
  Plus, 
  Trash2, 
  MousePointer, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Move,
  StickyNote,
  Sparkles,
  Download,
  RotateCcw,
  RotateCw,
  Lock,
  Hand,
  ChevronDown,
  Palette,
  Minus,
  Settings,
  Grid,
  Maximize2,
  FileDown,
  Upload,
  Copy,
  PenTool,
  MoveUpRight,
  List,
  Edit2,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  ArrowUp,
  ArrowDown,
  Sparkle,
  DownloadCloud,
  Check,
  FolderPlus
} from "lucide-react";

interface WhiteboardElement {
  id: string;
  type: "sticky" | "box" | "circle" | "triangle" | "diamond" | "arrow" | "line" | "text" | "draw";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string; // Background color hex or CSS hex
  borderColor?: string; // Hex
  borderWidth?: number; // px
  borderStyle?: "solid" | "dashed" | "dotted";
  textColor?: string; // Hex
  fontSize?: number; // px
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  points?: { x: number; y: number }[]; // For draw strokes or line/arrow coordinates
}

interface Board {
  id: string;
  title: string;
  sub: string;
}

export default function WorkspaceWhiteboard() {
  // --- Selected Tools & States ---
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [zoom, setZoom] = useState<number>(100);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // Custom Style Presets
  const [selectedColor, setSelectedColor] = useState<string>("#E6F4FF");
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState<number>(2);
  const [selectedBorderStyle, setSelectedBorderStyle] = useState<"solid" | "dashed" | "dotted">("solid");
  
  // Inline editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  
  // AI Generator Modal
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Board rename state
  const [renamingBoardId, setRenamingBoardId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState<string>("");

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const workspaceContainerRef = useRef<HTMLDivElement>(null);

  const currentUser = authStore.getCurrentUser();
  const listKey = currentUser ? `flowbase_user_${currentUser.email}_whiteboards_list` : "workspace_whiteboards_list";
  const selectedKey = currentUser ? `flowbase_user_${currentUser.email}_whiteboard_selected_id` : "selected_board_id";
  const dataKey = currentUser ? `flowbase_user_${currentUser.email}_whiteboards_data` : "workspace_whiteboards_data";

  // --- Boards list loaded from LocalStorage ---
  const [boards, setBoards] = useState<Board[]>(() => {
    const saved = localStorage.getItem(listKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [selectedBoard, setSelectedBoard] = useState<string>(() => {
    const savedSelected = localStorage.getItem(selectedKey);
    if (savedSelected) {
      localStorage.removeItem(selectedKey);
      return savedSelected;
    }
    return boards[0]?.id || "";
  });

  // --- Board Data Elements loaded from LocalStorage ---
  const [elementsMap, setElementsMap] = useState<Record<string, WhiteboardElement[]>>(() => {
    const saved = localStorage.getItem(dataKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const elements = elementsMap[selectedBoard] || [];

  // --- Undo / Redo History Stacks ---
  const [history, setHistory] = useState<Record<string, WhiteboardElement[][]>>({});
  const [historyIndex, setHistoryIndex] = useState<Record<string, number>>({});

  // Synchronize to LocalStorage
  useEffect(() => {
    localStorage.setItem(listKey, JSON.stringify(boards));
  }, [boards, listKey]);

  useEffect(() => {
    localStorage.setItem(dataKey, JSON.stringify(elementsMap));
  }, [elementsMap, dataKey]);

  // Handle board history initiation
  const currentBoardHistory = history[selectedBoard] || [elements];
  const currentBoardIndex = historyIndex[selectedBoard] ?? 0;

  const setElements = (
    newElements: WhiteboardElement[] | ((prev: WhiteboardElement[]) => WhiteboardElement[]),
    shouldSaveHistory = true
  ) => {
    setElementsMap(prev => {
      const current = prev[selectedBoard] || [];
      const updated = typeof newElements === "function" ? newElements(current) : newElements;
      
      if (shouldSaveHistory) {
        const boardHistory = history[selectedBoard] || [current];
        const boardIdx = historyIndex[selectedBoard] ?? 0;
        const nextHistory = boardHistory.slice(0, boardIdx + 1);
        
        setHistory(h => ({
          ...h,
          [selectedBoard]: [...nextHistory, updated]
        }));
        setHistoryIndex(idx => ({
          ...idx,
          [selectedBoard]: nextHistory.length
        }));
      }

      return {
        ...prev,
        [selectedBoard]: updated
      };
    });
  };

  const handleUndo = () => {
    const boardHistory = history[selectedBoard] || [];
    const boardIdx = historyIndex[selectedBoard] ?? 0;
    if (boardIdx > 0) {
      const prevIdx = boardIdx - 1;
      setHistoryIndex(idx => ({ ...idx, [selectedBoard]: prevIdx }));
      setElementsMap(prev => ({
        ...prev,
        [selectedBoard]: boardHistory[prevIdx]
      }));
    }
  };

  const handleRedo = () => {
    const boardHistory = history[selectedBoard] || [];
    const boardIdx = historyIndex[selectedBoard] ?? 0;
    if (boardIdx < boardHistory.length - 1) {
      const nextIdx = boardIdx + 1;
      setHistoryIndex(idx => ({ ...idx, [selectedBoard]: nextIdx }));
      setElementsMap(prev => ({
        ...prev,
        [selectedBoard]: boardHistory[nextIdx]
      }));
    }
  };

  // --- Interaction Tracking States ---
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeResizeHandle, setActiveResizeHandle] = useState<"bottom-right" | "line-start" | "line-end" | null>(null);

  // Translate screen coordinates to un-scaled and un-panned coordinates inside the canvas
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const zoomFactor = zoom / 100;
    const canvasX = (e.clientX - rect.left) / zoomFactor;
    const canvasY = (e.clientY - rect.top) / zoomFactor;
    return { x: Math.round(canvasX), y: Math.round(canvasY) };
  };

  // --- CRUD Operations for Boards ---
  const handleCreateBoard = () => {
    const newId = Math.random().toString();
    const newBoard: Board = {
      id: newId,
      title: "New Whiteboard Flow",
      sub: "Just now"
    };
    setBoards([...boards, newBoard]);
    setElementsMap(prev => ({
      ...prev,
      [newId]: []
    }));
    setSelectedBoard(newId);
  };

  const startRenameBoard = (b: Board) => {
    setRenamingBoardId(b.id);
    setRenamingTitle(b.title);
  };

  const saveRenameBoard = (id: string) => {
    if (renamingTitle.trim()) {
      setBoards(boards.map(b => b.id === id ? { ...b, title: renamingTitle.trim() } : b));
    }
    setRenamingBoardId(null);
  };

  const handleDeleteBoard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (boards.length <= 1) return; // Keep at least one board
    const remaining = boards.filter(b => b.id !== id);
    setBoards(remaining);
    
    // Clean up elements
    setElementsMap(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    if (selectedBoard === id) {
      setSelectedBoard(remaining[0].id);
    }
  };

  // --- Element Modification Helpers ---
  const updateElementStyle = (id: string, styleUpdates: Partial<WhiteboardElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...styleUpdates } : el));
  };

  const cloneElement = (id: string) => {
    const target = elements.find(el => el.id === id);
    if (!target) return;
    const cloned: WhiteboardElement = {
      ...target,
      id: Math.random().toString(),
      x: target.x + 25,
      y: target.y + 25,
      points: target.points ? target.points.map(p => ({ x: p.x + 25, y: p.y + 25 })) : undefined
    };
    setElements(prev => [...prev, cloned]);
    setSelectedElementId(cloned.id);
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElementId(null);
  };

  // Arrange depth layer ordering
  const sendToBack = (id: string) => {
    const target = elements.find(el => el.id === id);
    if (!target) return;
    const remaining = elements.filter(el => el.id !== id);
    setElements([target, ...remaining]);
  };

  const bringToFront = (id: string) => {
    const target = elements.find(el => el.id === id);
    if (!target) return;
    const remaining = elements.filter(el => el.id !== id);
    setElements([...remaining, target]);
  };

  // --- SVG path rendering helper for draw strokes ---
  const getSvgPathFromPoints = (points?: { x: number; y: number }[]) => {
    if (!points || points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  // --- Mouse Listeners for canvas operations ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // If double clicked, text-editing takes precedence
    if (editingTextId) return;

    const coords = getCanvasCoordinates(e);

    // 1. Grab Tool Panning
    if (selectedTool === "grab") {
      setIsPanning(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    // 2. Freehand Pencil Drawing
    if (selectedTool === "draw") {
      setIsDrawing(true);
      const newStrokeId = Math.random().toString();
      const newStroke: WhiteboardElement = {
        id: newStrokeId,
        type: "draw",
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: "",
        color: selectedColor || "#EF4444",
        borderWidth: selectedStrokeWidth || 3,
        borderStyle: "solid",
        points: [coords]
      };
      setElements(prev => [...prev, newStroke], false); // Don't save history on single point creation
      setSelectedElementId(newStrokeId);
      return;
    }

    // 3. Arrow / Connection Line creation
    if (selectedTool === "arrow" || selectedTool === "line") {
      setIsDrawing(true);
      const newLineId = Math.random().toString();
      const newLine: WhiteboardElement = {
        id: newLineId,
        type: selectedTool,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: "",
        color: selectedColor || "#475569",
        borderWidth: selectedStrokeWidth || 2,
        borderStyle: selectedBorderStyle || "solid",
        points: [coords, coords]
      };
      setElements(prev => [...prev, newLine], false);
      setSelectedElementId(newLineId);
      return;
    }

    // 4. Click to select elements or handles
    if (selectedElementId) {
      const selectedEl = elements.find(el => el.id === selectedElementId);
      if (selectedEl) {
        // Bottom-Right resize handle detection
        const handleSize = 14;
        const handleX = selectedEl.x + selectedEl.width;
        const handleY = selectedEl.y + selectedEl.height;
        const distToResize = Math.sqrt(Math.pow(coords.x - handleX, 2) + Math.pow(coords.y - handleY, 2));
        
        if (distToResize <= handleSize / (zoom / 100)) {
          setActiveResizeHandle("bottom-right");
          setDragStartPos({ x: coords.x, y: coords.y });
          setDragStartOffset({ x: selectedEl.width, y: selectedEl.height });
          return;
        }

        // Connection Line start and end handles detection
        if ((selectedEl.type === "line" || selectedEl.type === "arrow") && selectedEl.points && selectedEl.points.length >= 2) {
          const pStart = selectedEl.points[0];
          const pEnd = selectedEl.points[1];
          const distToStart = Math.sqrt(Math.pow(coords.x - pStart.x, 2) + Math.pow(coords.y - pStart.y, 2));
          const distToEnd = Math.sqrt(Math.pow(coords.x - pEnd.x, 2) + Math.pow(coords.y - pEnd.y, 2));

          if (distToStart <= 12) {
            setActiveResizeHandle("line-start");
            setDragStartPos({ x: coords.x, y: coords.y });
            return;
          }
          if (distToEnd <= 12) {
            setActiveResizeHandle("line-end");
            setDragStartPos({ x: coords.x, y: coords.y });
            return;
          }
        }
      }
    }

    // Find if clicked any existing shape element (from front layer to back)
    const clickedEl = [...elements].reverse().find(el => {
      if (el.type === "draw") {
        if (!el.points) return false;
        return el.points.some(p => Math.sqrt(Math.pow(coords.x - p.x, 2) + Math.pow(coords.y - p.y, 2)) < 15);
      }
      if (el.type === "line" || el.type === "arrow") {
        if (!el.points || el.points.length < 2) return false;
        const p1 = el.points[0];
        const p2 = el.points[1];
        const A = coords.x - p1.x;
        const B = coords.y - p1.y;
        const C = p2.x - p1.x;
        const D = p2.y - p1.y;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) {
          xx = p1.x;
          yy = p1.y;
        } else if (param > 1) {
          xx = p2.x;
          yy = p2.y;
        } else {
          xx = p1.x + param * C;
          yy = p1.y + param * D;
        }
        const distance = Math.sqrt(Math.pow(coords.x - xx, 2) + Math.pow(coords.y - yy, 2));
        return distance < 12;
      }
      // Standard Box boundaries
      return (
        coords.x >= el.x &&
        coords.x <= el.x + el.width &&
        coords.y >= el.y &&
        coords.y <= el.y + el.height
      );
    });

    if (clickedEl) {
      if (selectedTool === "eraser") {
        deleteElement(clickedEl.id);
        setSelectedElementId(null);
      } else {
        setSelectedElementId(clickedEl.id);
        setDraggingElementId(clickedEl.id);
        setDragStartPos({ x: coords.x, y: coords.y });
        setDragStartOffset({ x: clickedEl.x, y: clickedEl.y });
      }
    } else {
      // Clicked on empty workspace canvas
      setSelectedElementId(null);

      // If a creation tool is active, place a default shape instantly!
      if (["box", "circle", "triangle", "diamond", "text", "sticky"].includes(selectedTool)) {
        const shapeType = selectedTool as any;
        let defaultWidth = 150;
        let defaultHeight = 90;
        let defaultText = "Text Label";
        let defaultBgColor = "#E6F4FF";
        let defaultBorderColor = "#3B82F6";
        let defaultTextColor = "#1E3A8A";
        let defaultBorderWidth = 2;

        if (shapeType === "sticky") {
          defaultWidth = 140;
          defaultHeight = 140;
          defaultText = "Interactive note";
          defaultBgColor = "#FFFEE5";
          defaultBorderColor = "#EAB308";
          defaultTextColor = "#451A03";
          defaultBorderWidth = 1;
        } else if (shapeType === "circle") {
          defaultWidth = 120;
          defaultHeight = 120;
          defaultText = "Circular step";
          defaultBgColor = "#E6FFFA";
          defaultBorderColor = "#0D9488";
          defaultTextColor = "#042F2E";
        } else if (shapeType === "triangle") {
          defaultWidth = 120;
          defaultHeight = 120;
          defaultText = "Priority Triangle";
          defaultBgColor = "#FFF0F6";
          defaultBorderColor = "#EC4899";
          defaultTextColor = "#500730";
        } else if (shapeType === "diamond") {
          defaultWidth = 110;
          defaultHeight = 110;
          defaultText = "Is branching?";
          defaultBgColor = "#F5F3FF";
          defaultBorderColor = "#8B5CF6";
          defaultTextColor = "#2E1065";
        } else if (shapeType === "text") {
          defaultWidth = 160;
          defaultHeight = 45;
          defaultText = "Custom Text Block";
          defaultBgColor = "transparent";
          defaultBorderColor = "transparent";
          defaultTextColor = "#1C1917";
          defaultBorderWidth = 0;
        }

        const newShape: WhiteboardElement = {
          id: Math.random().toString(),
          type: shapeType,
          x: Math.round(coords.x - defaultWidth / 2),
          y: Math.round(coords.y - defaultHeight / 2),
          width: defaultWidth,
          height: defaultHeight,
          text: defaultText,
          color: defaultBgColor,
          borderColor: defaultBorderColor,
          borderWidth: defaultBorderWidth,
          borderStyle: "solid",
          textColor: defaultTextColor,
          fontSize: 13,
          fontWeight: "normal"
        };

        setElements(prev => [...prev, newShape]);
        setSelectedElementId(newShape.id);
        setSelectedTool("select"); // Reset tool back to select
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const coords = getCanvasCoordinates(e);

    // 1. Canvas Grab Panning
    if (isPanning && selectedTool === "grab") {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    // 2. Freehand Pencil Stroke or Connection Line Creation
    if (isDrawing && selectedElementId) {
      setElements(prev => prev.map(el => {
        if (el.id !== selectedElementId) return el;
        
        if (el.type === "draw" && el.points) {
          return {
            ...el,
            points: [...el.points, coords]
          };
        }
        
        if ((el.type === "arrow" || el.type === "line") && el.points) {
          return {
            ...el,
            points: [el.points[0], coords]
          };
        }
        return el;
      }), false); // Skip saving incremental stroke/line movements to history to keep undo neat
      return;
    }

    // 3. Resize Handle Drag
    if (activeResizeHandle && selectedElementId) {
      setElements(prev => prev.map(el => {
        if (el.id !== selectedElementId) return el;

        if (activeResizeHandle === "bottom-right") {
          const newW = Math.max(35, dragStartOffset.x + (coords.x - dragStartPos.x));
          const newH = Math.max(25, dragStartOffset.y + (coords.y - dragStartPos.y));
          return {
            ...el,
            width: newW,
            height: newH
          };
        }

        if (activeResizeHandle === "line-start" && el.points && el.points.length >= 2) {
          return {
            ...el,
            points: [coords, el.points[1]]
          };
        }

        if (activeResizeHandle === "line-end" && el.points && el.points.length >= 2) {
          return {
            ...el,
            points: [el.points[0], coords]
          };
        }

        return el;
      }), false);
      return;
    }

    // 4. Move Elements
    if (draggingElementId) {
      const dx = coords.x - dragStartPos.x;
      const dy = coords.y - dragStartPos.y;
      
      setElements(prev => prev.map(el => {
        if (el.id !== draggingElementId) return el;
        
        if (el.type === "draw" && el.points) {
          return {
            ...el,
            points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
          };
        }

        if ((el.type === "line" || el.type === "arrow") && el.points) {
          return {
            ...el,
            points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
          };
        }

        return {
          ...el,
          x: dragStartOffset.x + dx,
          y: dragStartOffset.y + dy
        };
      }), false); // Don't save history during intermediate drag steps

      // Keep relative anchor updated
      setDragStartPos({ x: coords.x, y: coords.y });
      setDragStartOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const handleMouseUp = () => {
    // Save state to undo history only when dragging/drawing action finishes
    if (draggingElementId || isDrawing || activeResizeHandle) {
      // Save current completed elements array into the history list
      const finalElementsState = elementsMap[selectedBoard] || [];
      const boardHistory = history[selectedBoard] || [];
      const boardIdx = historyIndex[selectedBoard] ?? 0;
      const nextHistory = boardHistory.slice(0, boardIdx + 1);
      
      setHistory(h => ({
        ...h,
        [selectedBoard]: [...nextHistory, finalElementsState]
      }));
      setHistoryIndex(idx => ({
        ...idx,
        [selectedBoard]: nextHistory.length
      }));
    }

    setIsPanning(false);
    setIsDrawing(false);
    setDraggingElementId(null);
    setActiveResizeHandle(null);
  };

  // --- Procedural / Smart AI Diagram Generator ---
  const handleProceduralGenerate = async (type: string) => {
    setAiLoading(true);
    let promptText = "";
    if (type === "auth") {
      promptText = "Detailed User Authentication Flowchart showing credentials validation, success redirect, and failed error paths with a Decision Diamond";
    } else if (type === "architecture") {
      promptText = "Modern Cloud Microservices System Architecture diagram showing Web App Client, API Gateway, Node.js Auth Microservice, PostgreSQL Database, and worker compute engine";
    } else if (type === "mindmap") {
      promptText = "Spacious Project Launch Core Idea Mind Map with central idea branching out to features, marketing, budget, and testing circles";
    } else {
      promptText = aiPrompt.trim() || "Custom dynamic concept flowchart map";
    }

    try {
      let data: any = null;
      try {
        const storedApiKey = localStorage.getItem("openai_api_key") || "";
        const res = await fetch("/api/diagrams/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: promptText,
            apiKey: storedApiKey || undefined,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          let serverError = "Failed to generate diagram via AI";
          try {
            const parsed = JSON.parse(errText);
            serverError = parsed.error || serverError;
          } catch (e) {}
          throw new Error(serverError);
        }

        data = await res.json();
      } catch (err: any) {
        console.warn("Backend API failed, trying direct OpenAI fallback:", err);
        const storedApiKey = localStorage.getItem("openai_api_key") || "";
        const directRes = await callOpenAIDiagramGenerate({
          prompt: promptText,
          apiKey: storedApiKey || undefined,
        });
        data = { elements: directRes.elements };
      }

      if (data && data.elements && data.elements.length > 0) {
        // Assign fresh client-side IDs to prevent duplicates if generated multiple times
        const freshElements = data.elements.map((el: any) => ({
          ...el,
          id: el.id || Math.random().toString(),
        }));
        setElements([...elements, ...freshElements]);
        setAiPrompt("");
        setShowAIModal(false);
      } else {
        throw new Error("Empty elements array returned from AI");
      }
    } catch (err: any) {
      console.warn("AI Diagram Generation error, running fallback:", err);
      // Nice fallbacks if API Key isn't configured, ensuring seamless user experience
      let diagram: WhiteboardElement[] = [];
      if (type === "auth") {
        diagram = [
          { id: "a1", type: "circle", x: 100, y: 160, width: 100, height: 100, text: "User Access", color: "#F5F3FF", borderColor: "#7C3AED", borderWidth: 2, borderStyle: "solid", textColor: "#5B21B6", fontSize: 13, fontWeight: "bold" },
          { id: "a2", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "", color: "#94A3B8", borderWidth: 2, points: [{ x: 200, y: 210 }, { x: 260, y: 210 }] },
          { id: "a3", type: "box", x: 260, y: 160, width: 160, height: 100, text: "Login Screen Input (Email/Pass)", color: "#E6F4FF", borderColor: "#3B82F6", borderWidth: 2, borderStyle: "solid", textColor: "#1E3A8A", fontSize: 12, fontWeight: "normal" },
          { id: "a4", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "", color: "#94A3B8", borderWidth: 2, points: [{ x: 420, y: 210 }, { x: 480, y: 210 }] },
          { id: "a5", type: "diamond", x: 480, y: 150, width: 120, height: 120, text: "Credentials match?", color: "#FFFEE5", borderColor: "#EAB308", borderWidth: 2, borderStyle: "solid", textColor: "#713F12", fontSize: 11 },
          { id: "a6", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "YES", color: "#10B981", borderWidth: 2, points: [{ x: 600, y: 210 }, { x: 680, y: 210 }] },
          { id: "a7", type: "box", x: 680, y: 160, width: 160, height: 100, text: "Grant Token & Redirect Home", color: "#E6FFFA", borderColor: "#10B981", borderWidth: 2, borderStyle: "solid", textColor: "#064E3B", fontSize: 12, fontWeight: "bold" },
          { id: "a8", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "NO", color: "#EF4444", borderWidth: 2, points: [{ x: 540, y: 270 }, { x: 540, y: 340 }] },
          { id: "a9", type: "box", x: 460, y: 340, width: 160, height: 80, text: "Show Error Alert\n(Increment retries)", color: "#FFE6F0", borderColor: "#EC4899", borderWidth: 2, borderStyle: "dashed", textColor: "#9D174D", fontSize: 12 }
        ];
      } else if (type === "architecture") {
        diagram = [
          { id: "s1", type: "sticky", x: 50, y: 140, width: 130, height: 130, text: "Web Application Client App", color: "#E6F4FF", borderColor: "#93C5FD", borderWidth: 1, textColor: "#1E3A8A", fontSize: 12 },
          { id: "s2", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "REST API", color: "#64748B", borderWidth: 2, points: [{ x: 180, y: 200 }, { x: 260, y: 200 }] },
          { id: "s3", type: "box", x: 260, y: 90, width: 160, height: 220, text: "API Gateway Proxy Service\n\n- CORS Auth Checks\n- Rate Limiting\n- Route Redirects", color: "#FAF5FF", borderColor: "#C084FC", borderWidth: 2, borderStyle: "solid", textColor: "#581C87", fontSize: 12 },
          { id: "s4", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "Secure Port", color: "#64748B", borderWidth: 2, points: [{ x: 420, y: 150 }, { x: 510, y: 150 }] },
          { id: "s5", type: "box", x: 510, y: 90, width: 150, height: 100, text: "Auth Server (NodeJS Microservice)", color: "#E6FFFA", borderColor: "#2DD4BF", borderWidth: 2, textColor: "#134E5E", fontSize: 12 },
          { id: "s6", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "SQL db", color: "#64748B", borderWidth: 2, points: [{ x: 660, y: 140 }, { x: 740, y: 140 }] },
          { id: "s7", type: "circle", x: 740, y: 90, width: 120, height: 120, text: "PostgreSQL Database Storage", color: "#FFFEE5", borderColor: "#EAB308", borderWidth: 2, textColor: "#713F12", fontSize: 11, fontWeight: "bold" },
          { id: "s8", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "gRPC", color: "#64748B", borderWidth: 2, points: [{ x: 420, y: 250 }, { x: 510, y: 250 }] },
          { id: "s9", type: "box", x: 510, y: 220, width: 150, height: 100, text: "Compute Engine & Worker Pool", color: "#FFF0F6", borderColor: "#F472B6", borderWidth: 2, textColor: "#831843", fontSize: 11 }
        ];
      } else if (type === "mindmap") {
        diagram = [
          { id: "m1", type: "sticky", x: 380, y: 180, width: 160, height: 160, text: "Core Idea Project Launch", color: "#FFFEE5", borderColor: "#FCD34D", borderWidth: 2, textColor: "#78350F", fontSize: 14, fontWeight: "bold" },
          { id: "m2", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "", color: "#64748B", borderWidth: 2, borderStyle: "dashed", points: [{ x: 380, y: 200 }, { x: 260, y: 130 }] },
          { id: "m3", type: "circle", x: 130, y: 70, width: 130, height: 130, text: "Features & Requirements", color: "#E6F4FF", borderColor: "#60A5FA", borderWidth: 2, textColor: "#1E3A8A", fontSize: 12 },
          { id: "m4", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "", color: "#64748B", borderWidth: 2, borderStyle: "dashed", points: [{ x: 540, y: 200 }, { x: 640, y: 130 }] },
          { id: "m5", type: "circle", x: 640, y: 70, width: 130, height: 130, text: "Marketing & Strategy", color: "#E6FFFA", borderColor: "#4FD1C5", borderWidth: 2, textColor: "#065F46", fontSize: 12 },
          { id: "m6", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "", color: "#64748B", borderWidth: 2, borderStyle: "dashed", points: [{ x: 380, y: 320 }, { x: 260, y: 390 }] },
          { id: "m7", type: "circle", x: 130, y: 340, width: 130, height: 130, text: "Budget & Timelines", color: "#FFF0F6", borderColor: "#F472B6", borderWidth: 2, textColor: "#831843", fontSize: 12 },
          { id: "m8", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "", color: "#64748B", borderWidth: 2, borderStyle: "dashed", points: [{ x: 540, y: 320 }, { x: 640, y: 390 }] },
          { id: "m9", type: "circle", x: 640, y: 340, width: 130, height: 130, text: "Testing & Operations", color: "#F5F3FF", borderColor: "#A78BFA", borderWidth: 2, textColor: "#5B21B6", fontSize: 12 }
        ];
      } else {
        const p = aiPrompt.toLowerCase();
        let keyText = aiPrompt ? `"${aiPrompt}"` : "Custom Design Map";
        diagram = [
          { id: "c1", type: "box", x: 100, y: 180, width: 160, height: 100, text: `Trigger point:\n${keyText}`, color: "#E6F4FF", borderColor: "#3B82F6", borderWidth: 2, textColor: "#1E3A8A", fontSize: 12, fontWeight: "bold" },
          { id: "c2", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "analyzing flow", color: "#94A3B8", borderWidth: 2, points: [{ x: 260, y: 230 }, { x: 360, y: 230 }] },
          { id: "c3", type: "diamond", x: 360, y: 170, width: 120, height: 120, text: "Step Check Condition", color: "#FFFEE5", borderColor: "#F59E0B", borderWidth: 2, textColor: "#78350F", fontSize: 12 },
          { id: "c4", type: "arrow", x: 0, y: 0, width: 0, height: 0, text: "Proceed", color: "#10B981", borderWidth: 2, points: [{ x: 480, y: 230 }, { x: 580, y: 230 }] },
          { id: "c5", type: "sticky", x: 580, y: 155, width: 150, height: 150, text: `Action Node details:\nCustom user logic for "${keyText}" designed instantly.`, color: "#E6FFFA", borderColor: "#0D9488", borderWidth: 1, textColor: "#0F766E", fontSize: 11 }
        ];
      }
      setElements([...elements, ...diagram]);
      setAiPrompt("");
      setShowAIModal(false);

      if (err.message && err.message.includes("key")) {
        alert("Notice: Server OPENAI_API_KEY is not configured yet. Created a high-quality preset fallback blueprint instead!");
      } else {
        alert(`Notice: ${err.message || "An error occurred"}. Rendered fallback blueprint instead.`);
      }
    } finally {
      setAiLoading(false);
    }
  };

  // --- Export Whiteboard as dynamic high-quality SVG ---
  const handleExportSVG = () => {
    if (elements.length === 0) {
      alert("No elements to export on this board!");
      return;
    }

    // Determine bounding box to create clean crop viewport
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach(el => {
      if (el.type === "draw" || el.type === "line" || el.type === "arrow") {
        el.points?.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });
      } else {
        if (el.x < minX) minX = el.x;
        if (el.y < minY) minY = el.y;
        if (el.x + el.width > maxX) maxX = el.x + el.width;
        if (el.y + el.height > maxY) maxY = el.y + el.height;
      }
    });

    // Padding
    minX = Math.max(0, minX - 40);
    minY = Math.max(0, minY - 40);
    maxX = maxX + 40;
    maxY = maxY + 40;

    const width = maxX - minX;
    const height = maxY - minY;

    // Build SVG inner elements string
    let svgContent = "";

    elements.forEach(el => {
      const fillVal = el.color === "transparent" ? "none" : el.color;
      const strokeVal = el.borderColor || el.color || "#000000";
      const strokeW = el.borderWidth ?? 1;
      const dashStr = el.borderStyle === "dashed" ? "5,5" : el.borderStyle === "dotted" ? "2,2" : "none";

      if (el.type === "draw" && el.points) {
        svgContent += `<path d="${getSvgPathFromPoints(el.points)}" fill="none" stroke="${el.color}" stroke-width="${el.borderWidth || 3}" stroke-linecap="round" stroke-linejoin="round" />\n`;
      } 
      else if (el.type === "line" && el.points && el.points.length >= 2) {
        svgContent += `<line x1="${el.points[0].x}" y1="${el.points[0].y}" x2="${el.points[1].x}" y2="${el.points[1].y}" stroke="${el.color}" stroke-width="${strokeW}" stroke-dasharray="${dashStr}" />\n`;
      }
      else if (el.type === "arrow" && el.points && el.points.length >= 2) {
        svgContent += `<line x1="${el.points[0].x}" y1="${el.points[0].y}" x2="${el.points[1].x}" y2="${el.points[1].y}" stroke="${el.color}" stroke-width="${strokeW}" stroke-dasharray="${dashStr}" marker-end="url(#arrowhead)" />\n`;
        if (el.text) {
          const mx = (el.points[0].x + el.points[1].x) / 2;
          const my = (el.points[0].y + el.points[1].y) / 2 - 10;
          svgContent += `<text x="${mx}" y="${my}" fill="#475569" font-size="10" font-weight="bold" text-anchor="middle">${el.text}</text>\n`;
        }
      }
      else if (el.type === "box" || el.type === "sticky" || el.type === "text") {
        svgContent += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="8" fill="${fillVal}" stroke="${strokeVal}" stroke-width="${strokeW}" stroke-dasharray="${dashStr}" />\n`;
        if (el.text) {
          const lines = el.text.split("\n");
          lines.forEach((line, idx) => {
            svgContent += `<text x="${el.x + el.width/2}" y="${el.y + el.height/2 + (idx - (lines.length-1)/2)*14 + 4}" fill="${el.textColor || "#000000"}" font-size="${el.fontSize || 12}" font-family="sans-serif" text-anchor="middle">${line}</text>\n`;
          });
        }
      }
      else if (el.type === "circle") {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const r = Math.min(el.width, el.height) / 2;
        svgContent += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fillVal}" stroke="${strokeVal}" stroke-width="${strokeW}" stroke-dasharray="${dashStr}" />\n`;
        if (el.text) {
          svgContent += `<text x="${cx}" y="${cy + 4}" fill="${el.textColor || "#000000"}" font-size="${el.fontSize || 12}" font-family="sans-serif" text-anchor="middle">${el.text}</text>\n`;
        }
      }
      else if (el.type === "triangle") {
        const p1 = `${el.x + el.width/2},${el.y}`;
        const p2 = `${el.x},${el.y + el.height}`;
        const p3 = `${el.x + el.width},${el.y + el.height}`;
        svgContent += `<polygon points="${p1} ${p2} ${p3}" fill="${fillVal}" stroke="${strokeVal}" stroke-width="${strokeW}" stroke-dasharray="${dashStr}" />\n`;
        if (el.text) {
          svgContent += `<text x="${el.x + el.width/2}" y="${el.y + el.height*0.7}" fill="${el.textColor || "#000000"}" font-size="${el.fontSize || 12}" font-family="sans-serif" text-anchor="middle">${el.text}</text>\n`;
        }
      }
      else if (el.type === "diamond") {
        const p1 = `${el.x + el.width/2},${el.y}`;
        const p2 = `${el.x + el.width},${el.y + el.height/2}`;
        const p3 = `${el.x + el.width/2},${el.y + el.height}`;
        const p4 = `${el.x},${el.y + el.height/2}`;
        svgContent += `<polygon points="${p1} ${p2} ${p3} ${p4}" fill="${fillVal}" stroke="${strokeVal}" stroke-width="${strokeW}" stroke-dasharray="${dashStr}" />\n`;
        if (el.text) {
          svgContent += `<text x="${el.x + el.width/2}" y="${el.y + el.height/2 + 4}" fill="${el.textColor || "#000000"}" font-size="${el.fontSize || 12}" font-family="sans-serif" text-anchor="middle">${el.text}</text>\n`;
        }
      }
    });

    const fullSVGString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#FAF9F6" />
  ${svgContent}
</svg>`;

    const blob = new Blob([fullSVGString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedBoard}_export.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

  return (
    <div id="workspace-whiteboard-sandbox" className="p-5 md:p-7 bg-[#FAF8F5] min-h-[calc(100vh-60px)] flex flex-col space-y-5 text-left">
      
      {/* Title & Board Management */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Dynamic Sandbox</span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#221C18] mt-1">Interactive Diagram Workspace</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick AI Generator Shortcut */}
          <button
            onClick={() => setShowAIModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Diagram Creator</span>
          </button>

          {/* Export SVG Button */}
          <button
            onClick={handleExportSVG}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left column: Boards Manager */}
        <div className="lg:col-span-3 bg-white border border-[#EFECE6] rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">Your Whiteboards</h3>
              <h4 className="text-xs font-extrabold text-stone-700">{boards.length} Boards saved</h4>
            </div>
            
            <button
              onClick={handleCreateBoard}
              className="bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>

          <div className="space-y-1 max-h-[220px] lg:max-h-[380px] overflow-y-auto pr-1">
            {boards.map((b) => {
              const isActive = b.id === selectedBoard;
              const isRenaming = renamingBoardId === b.id;

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    if (!isRenaming) setSelectedBoard(b.id);
                  }}
                  className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all group ${
                    isActive
                      ? "bg-[#FAF2EC] text-[#c67f43] border-l-4 border-[#E05A47] shadow-3xs"
                      : "hover:bg-stone-50 text-stone-600"
                  }`}
                >
                  <div className="text-left truncate flex-grow mr-2">
                    {isRenaming ? (
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={renamingTitle}
                          onChange={e => setRenamingTitle(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && saveRenameBoard(b.id)}
                          className="bg-white border border-stone-300 rounded px-1.5 py-0.5 text-xs text-stone-800 w-full outline-none focus:border-[#E05A47]"
                        />
                        <button onClick={() => saveRenameBoard(b.id)} className="text-emerald-600 font-bold text-xs p-1">✓</button>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-xs font-bold truncate">{b.title}</h4>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-semibold truncate">{b.sub}</p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    {!isRenaming && (
                      <button
                        onClick={() => startRenameBoard(b)}
                        className="text-stone-400 hover:text-amber-600 p-0.5"
                        title="Rename Board"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    {boards.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteBoard(b.id, e)}
                        className="text-stone-300 hover:text-red-500 p-0.5"
                        title="Delete Board"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Main Canvas Workspace & Inspectors */}
        <div className="lg:col-span-9 flex flex-col space-y-4">
          
          {/* Main Drawing Toolbar & Options */}
          <div className="bg-white border border-[#EFECE6] rounded-2xl p-3 shadow-xs space-y-3 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#FAF8F5]">
              
              {/* Core Active Tools */}
              <div className="flex flex-wrap items-center gap-1 bg-[#FAF8F5] border border-[#EFECE6] p-1 rounded-xl">
                {[
                  { id: "select", icon: MousePointer, name: "Select & Edit" },
                  { id: "grab", icon: Hand, name: "Grab & Pan" },
                  { id: "draw", icon: PenTool, name: "Freehand Pencil" },
                  { id: "arrow", icon: MoveUpRight, name: "Connector Arrow" },
                  { id: "line", icon: Minus, name: "Connection Line" },
                  { id: "box", icon: Square, name: "Box Shape" },
                  { id: "circle", icon: Circle, name: "Circle Shape" },
                  { id: "triangle", icon: TriangleIcon, name: "Triangle Shape" },
                  { id: "diamond", icon: DiamondIcon, name: "Decision Diamond" },
                  { id: "text", icon: Type, name: "Text Box" },
                  { id: "sticky", icon: StickyNote, name: "Sticky Note" },
                  { id: "eraser", icon: Eraser, name: "Eraser tool" },
                ].map((tool) => {
                  const Icon = tool.icon;
                  const isSelected = selectedTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setSelectedTool(tool.id);
                        if (tool.id !== "select") {
                          setSelectedElementId(null);
                        }
                      }}
                      className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                        isSelected 
                          ? "bg-[#E05A47] text-white shadow-sm scale-105" 
                          : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                      }`}
                      title={tool.name}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              {/* Utility Tools */}
              <div className="flex items-center gap-2">
                
                {/* Undo / Redo */}
                <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#EFECE6] p-1 rounded-xl">
                  <button
                    onClick={handleUndo}
                    disabled={currentBoardIndex <= 0}
                    className="p-1.5 rounded-lg hover:bg-white text-stone-600 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
                    title="Undo Action"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={currentBoardIndex >= currentBoardHistory.length - 1}
                    className="p-1.5 rounded-lg hover:bg-white text-stone-600 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
                    title="Redo Action"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={clearCanvas}
                  className="bg-white border border-[#EFECE6] text-stone-500 hover:text-red-600 hover:border-red-100 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer shadow-3xs transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Sub-tool contextual presets (brush color, stroke widths for drawing) */}
            {["draw", "line", "arrow"].includes(selectedTool) && (
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-stone-500 bg-[#FAF8F5]/50 p-2 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <span>Line/Brush Color:</span>
                  <div className="flex items-center gap-1">
                    {["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#1E293B"].map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-4 h-4 rounded-full border cursor-pointer transition-transform ${
                          selectedColor === color ? "scale-125 ring-2 ring-stone-400" : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="w-[1px] h-4 bg-stone-200" />

                <div className="flex items-center gap-1.5">
                  <span>Stroke Thickness:</span>
                  {[2, 4, 6].map(width => (
                    <button
                      key={width}
                      onClick={() => setSelectedStrokeWidth(width)}
                      className={`px-2 py-0.5 rounded border text-[10px] cursor-pointer ${
                        selectedStrokeWidth === width ? "bg-[#FAF2EC] border-[#c67f43] text-[#c67f43]" : "bg-white border-stone-200"
                      }`}
                    >
                      {width}px
                    </button>
                  ))}
                </div>

                {["line", "arrow"].includes(selectedTool) && (
                  <>
                    <div className="w-[1px] h-4 bg-stone-200" />
                    <div className="flex items-center gap-1.5">
                      <span>Line Style:</span>
                      {(["solid", "dashed", "dotted"] as const).map(style => (
                        <button
                          key={style}
                          onClick={() => setSelectedBorderStyle(style)}
                          className={`px-2 py-0.5 rounded border text-[10px] capitalize cursor-pointer ${
                            selectedBorderStyle === style ? "bg-[#FAF2EC] border-[#c67f43] text-[#c67f43]" : "bg-white border-stone-200"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Interactive Scaled Canvas Sandbox Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            
            {/* Canvas column */}
            <div className={`col-span-12 ${selectedElement ? "xl:col-span-8" : "col-span-12"} transition-all duration-300`}>
              <div 
                ref={workspaceContainerRef}
                className="bg-[#FAF9F6] border border-[#EFECE6] rounded-2xl relative overflow-auto custom-scrollbar min-h-[460px] max-h-[640px] shadow-inner select-none cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Simulated Canvas Inner Layer (supports Pan, Zoom translation, and native scrollbars) */}
                <div 
                  ref={canvasRef}
                  className="absolute top-0 left-0 origin-top-left transition-transform duration-75 ease-out pointer-events-none"
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
                    width: "3000px",
                    height: "2000px"
                  }}
                >
                  {/* Visual Dot Grid background moving and scaling perfectly with content */}
                  <div className="absolute inset-0 bg-[radial-gradient(#E5DFD5_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                  
                  {/* Unified SVG layer for Lines, Arrows, and pencil strokes */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    <defs>
                      <marker id="arrowhead" markerWidth="11" markerHeight="8" refX="9" refY="4" orient="auto">
                        <polygon points="0 0, 11 4, 0 8" fill="currentColor" />
                      </marker>
                    </defs>

                    {elements.map((el) => {
                      const strokeW = el.borderWidth || 2;
                      const dashArr = el.borderStyle === "dashed" ? "6,6" : el.borderStyle === "dotted" ? "2,3" : undefined;

                      if (el.type === "draw" && el.points) {
                        return (
                          <path
                            key={el.id}
                            d={getSvgPathFromPoints(el.points)}
                            fill="none"
                            stroke={el.color}
                            strokeWidth={el.borderWidth || 3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="pointer-events-auto cursor-pointer"
                          />
                        );
                      }

                      if (el.type === "line" && el.points && el.points.length >= 2) {
                        return (
                          <line
                            key={el.id}
                            x1={el.points[0].x}
                            y1={el.points[0].y}
                            x2={el.points[1].x}
                            y2={el.points[1].y}
                            stroke={el.color}
                            strokeWidth={strokeW}
                            strokeDasharray={dashArr}
                          />
                        );
                      }

                      if (el.type === "arrow" && el.points && el.points.length >= 2) {
                        return (
                          <g key={el.id}>
                            <line
                              x1={el.points[0].x}
                              y1={el.points[0].y}
                              x2={el.points[1].x}
                              y2={el.points[1].y}
                              stroke={el.color}
                              strokeWidth={strokeW}
                              strokeDasharray={dashArr}
                              markerEnd="url(#arrowhead)"
                            />
                            {el.text && (
                              <text
                                x={(el.points[0].x + el.points[1].x) / 2}
                                y={(el.points[0].y + el.points[1].y) / 2 - 8}
                                fill="#475569"
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {el.text}
                              </text>
                            )}
                          </g>
                        );
                      }
                      return null;
                    })}
                  </svg>

                  {/* HTML Absolutely positioned design shapes */}
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {elements.map((el) => {
                      if (["draw", "line", "arrow"].includes(el.type)) return null;

                      const isSelected = selectedElementId === el.id;
                      const dashStyle = el.borderStyle === "dashed" ? "dashed" : el.borderStyle === "dotted" ? "dotted" : "solid";

                      return (
                        <div
                          key={el.id}
                          className={`absolute pointer-events-auto flex items-center justify-center select-text transition-all ${
                            isSelected ? "ring-2 ring-amber-500 ring-offset-2 scale-[1.01]" : ""
                          }`}
                          style={{
                            left: el.x,
                            top: el.y,
                            width: el.width,
                            height: el.height,
                            backgroundColor: el.color,
                            borderColor: el.borderColor || el.color,
                            borderWidth: el.borderWidth !== undefined ? `${el.borderWidth}px` : "2px",
                            borderStyle: dashStyle,
                            borderRadius: el.type === "box" ? "12px" : el.type === "sticky" ? "4px" : el.type === "circle" ? "50%" : undefined,
                            boxShadow: el.type === "sticky" ? "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)" : "0 1px 3px rgba(0,0,0,0.05)",
                            clipPath: el.type === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : el.type === "diamond" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" : undefined,
                            cursor: selectedTool === "eraser" ? "not-allowed" : "move",
                          }}
                          onDoubleClick={() => {
                            setEditingTextId(el.id);
                          }}
                        >
                          {editingTextId === el.id ? (
                            <textarea
                              defaultValue={el.text}
                              onBlur={(e) => {
                                updateElementStyle(el.id, { text: e.target.value });
                                setEditingTextId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  updateElementStyle(el.id, { text: (e.target as HTMLTextAreaElement).value });
                                  setEditingTextId(null);
                                }
                              }}
                              className="w-full h-full p-2 bg-white text-stone-800 border border-amber-500 focus:ring-0 outline-none resize-none text-xs font-semibold rounded"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div 
                              className={`w-full h-full overflow-hidden text-center flex items-center justify-center p-2.5 leading-tight select-none select-text ${
                                el.type === "triangle" ? "pt-8" : ""
                              }`}
                              style={{
                                color: el.textColor || "#1E293B",
                                fontSize: `${el.fontSize || 12}px`,
                                fontWeight: el.fontWeight || "normal",
                                fontStyle: el.fontStyle || "normal",
                                textOverflow: "ellipsis"
                              }}
                            >
                              <span className="whitespace-pre-wrap">{el.text}</span>
                            </div>
                          )}

                          {/* Top Tag label helper inside shapes */}
                          {isSelected && (
                            <div className="absolute -top-6 left-0 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase select-none">
                              {el.type}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Handles Overlay for selected lines, arrows or resizer handles */}
                  {selectedElement && (
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                      
                      {/* Floating quick action toolbar directly on canvas above selected element */}
                      {(() => {
                        let posX = selectedElement.x;
                        let posY = selectedElement.y - 45;
                        if (["draw", "line", "arrow"].includes(selectedElement.type) && selectedElement.points && selectedElement.points.length > 0) {
                          posX = selectedElement.points[0].x;
                          posY = selectedElement.points[0].y - 45;
                        }
                        return (
                          <div 
                            className="absolute bg-stone-900 text-white rounded-xl px-2.5 py-1.5 shadow-lg flex items-center gap-2 pointer-events-auto z-10 select-none"
                            style={{
                              left: `${posX}px`,
                              top: `${posY}px`,
                              transform: "translateY(-5px)"
                            }}
                          >
                            <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                              {selectedElement.type}
                            </span>
                            
                            {!["draw"].includes(selectedElement.type) && (
                              <button
                                onClick={() => setEditingTextId(selectedElement.id)}
                                className="p-1 hover:bg-stone-800 text-stone-300 hover:text-white rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                                title="Edit Text Label"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">Edit</span>
                              </button>
                            )}
                            
                            <div className="w-[1px] h-3.5 bg-stone-700" />
                            
                            <button
                              onClick={() => deleteElement(selectedElement.id)}
                              className="p-1 hover:bg-red-950 text-red-400 hover:text-red-300 rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                              title="Delete Element"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">Delete</span>
                            </button>
                          </div>
                        );
                      })()}

                      {/* Bounding handles for boxes & shapes */}
                      {!["draw", "line", "arrow"].includes(selectedElement.type) && (
                        <div 
                          className="absolute border border-dashed border-amber-500 pointer-events-none"
                          style={{
                            left: selectedElement.x,
                            top: selectedElement.y,
                            width: selectedElement.width,
                            height: selectedElement.height
                          }}
                        >
                          {/* Bottom-right scaling resize handle circle */}
                          <div
                            className="absolute bottom-[-6px] right-[-6px] w-3 h-3 bg-white border-2 border-amber-500 rounded-full cursor-se-resize pointer-events-auto hover:scale-125 transition-transform shadow-xs"
                            title="Drag to resize shape"
                          />
                        </div>
                      )}

                      {/* Control nodes for Arrows & Lines */}
                      {(selectedElement.type === "line" || selectedElement.type === "arrow") && selectedElement.points && selectedElement.points.length >= 2 && (
                        <>
                          {/* Start Node */}
                          <div
                            className="absolute w-3.5 h-3.5 bg-sky-500 border-2 border-white rounded-full cursor-move pointer-events-auto shadow-sm"
                            style={{
                              left: selectedElement.points[0].x - 7,
                              top: selectedElement.points[0].y - 7
                            }}
                            title="Drag start anchor"
                          />
                          {/* End Node */}
                          <div
                            className="absolute w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full cursor-move pointer-events-auto shadow-sm"
                            style={{
                              left: selectedElement.points[1].x - 7,
                              top: selectedElement.points[1].y - 7
                            }}
                            title="Drag end anchor"
                          />
                        </>
                      )}

                    </div>
                  )}

                </div>

                {/* On-Canvas helper text */}
                <div className="absolute top-3 left-3 pointer-events-none bg-white/80 border border-stone-200 px-2.5 py-1.5 rounded-lg text-[10px] text-stone-500 font-semibold shadow-3xs flex items-center gap-1">
                  <span>🛠️ Active Tool:</span>
                  <span className="text-stone-800 uppercase font-extrabold">{selectedTool}</span>
                </div>
              </div>

              {/* Bottom Canvas scaling controls */}
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 bg-white border border-[#EFECE6] p-3 rounded-2xl shadow-3xs mt-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                    <button 
                      onClick={() => setZoom(Math.max(50, zoom - 10))} 
                      className="p-1 px-2.5 hover:bg-white rounded-md cursor-pointer transition-colors"
                      title="Zoom Out"
                    >
                      -
                    </button>
                    <span className="px-2 font-mono text-[11px] select-none text-stone-700">{zoom}%</span>
                    <button 
                      onClick={() => setZoom(Math.min(160, zoom + 10))} 
                      className="p-1 px-2.5 hover:bg-white rounded-md cursor-pointer transition-colors"
                      title="Zoom In"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setZoom(100);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className="text-[10px] text-stone-400 hover:text-stone-600 font-bold px-2 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50"
                  >
                    Reset Grid view
                  </button>
                </div>

                <div className="text-[11px] font-medium text-stone-400 italic hidden sm:block">
                  Double click any block shape to edit text labels
                </div>
              </div>
            </div>

            {/* Context-aware Style Inspector Panel (shows on selected element) */}
            {selectedElement && (
              <div className="col-span-12 xl:col-span-4 bg-white border border-[#EFECE6] rounded-2xl p-4 shadow-sm space-y-4">
                
                {/* Selected Element Header Info */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="text-left">
                    <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Style Inspector</h3>
                    <h4 className="text-xs font-extrabold text-stone-800 capitalize">{selectedElement.type} element active</h4>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => cloneElement(selectedElement.id)}
                      className="p-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Duplicate element"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteElement(selectedElement.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete element"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Edit Text Content directly */}
                {!["draw"].includes(selectedElement.type) && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Element Text:</label>
                    <textarea
                      value={selectedElement.text}
                      onChange={(e) => updateElementStyle(selectedElement.id, { text: e.target.value })}
                      className="w-full text-xs font-semibold text-stone-800 bg-stone-50 border border-stone-200 rounded-xl p-2.5 h-20 outline-none focus:border-amber-500 focus:bg-white resize-none"
                      placeholder="Type details..."
                    />
                  </div>
                )}

                {/* Background color customizer */}
                {!["draw", "text", "line", "arrow"].includes(selectedElement.type) && (
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Background Color:</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { hex: "#FFFFFF", name: "White" },
                        { hex: "#E6F4FF", name: "Blue" },
                        { hex: "#E6FFFA", name: "Teal" },
                        { hex: "#FFFEE5", name: "Yellow" },
                        { hex: "#FFF0F6", name: "Pink" },
                        { hex: "#F5F3FF", name: "Purple" },
                        { hex: "#FFF7ED", name: "Orange" },
                        { hex: "#F1F5F9", name: "Slate" },
                        { hex: "#FAF8F5", name: "Warm" },
                        { hex: "transparent", name: "None" }
                      ].map((col) => (
                        <button
                          key={col.hex}
                          onClick={() => updateElementStyle(selectedElement.id, { color: col.hex })}
                          className={`h-7 rounded-lg border text-[9px] font-bold cursor-pointer transition-transform ${
                            selectedElement.color === col.hex ? "ring-2 ring-amber-500 scale-105" : "border-stone-200 hover:scale-[1.03]"
                          }`}
                          style={{ backgroundColor: col.hex === "transparent" ? "#F5F5F4" : col.hex }}
                          title={col.name}
                        >
                          {col.hex === "transparent" ? "None" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Border Customizer */}
                {!["draw"].includes(selectedElement.type) && (
                  <div className="space-y-3 pt-2 border-t border-stone-100 text-left">
                    <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Border Settings:</label>
                    
                    {/* Border colors */}
                    <div className="grid grid-cols-6 gap-1.5">
                      {["#3B82F6", "#10B981", "#EAB308", "#EC4899", "#8B5CF6", "#1E293B", "#64748B", "transparent"].map((borderCol) => (
                        <button
                          key={borderCol}
                          onClick={() => updateElementStyle(selectedElement.id, { borderColor: borderCol })}
                          className={`h-5 rounded-full border cursor-pointer transition-transform ${
                            selectedElement.borderColor === borderCol ? "ring-2 ring-amber-500 scale-110" : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: borderCol === "transparent" ? "#FFF" : borderCol }}
                          title={borderCol === "transparent" ? "None" : borderCol}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {/* Border thickness */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400">Thickness</span>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 4].map(w => (
                            <button
                              key={w}
                              onClick={() => updateElementStyle(selectedElement.id, { borderWidth: w })}
                              className={`flex-1 py-1 text-[10px] rounded border font-mono font-bold cursor-pointer ${
                                selectedElement.borderWidth === w ? "bg-stone-800 text-white" : "bg-white text-stone-600 border-stone-200"
                              }`}
                            >
                              {w}px
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Border Style */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400">Style</span>
                        <div className="flex items-center gap-1">
                          {(["solid", "dashed", "dotted"] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => updateElementStyle(selectedElement.id, { borderStyle: s })}
                              className={`flex-1 py-1 text-[9px] rounded border capitalize cursor-pointer font-bold ${
                                selectedElement.borderStyle === s ? "bg-stone-800 text-white" : "bg-white text-stone-600 border-stone-200"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Typography Editor */}
                {!["draw", "line", "arrow"].includes(selectedElement.type) && (
                  <div className="space-y-2 pt-2 border-t border-stone-100 text-left">
                    <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Text Formatting:</label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Font size picker */}
                      <div className="flex items-center justify-between border border-stone-200 rounded-lg px-2 py-1.5 bg-stone-50">
                        <span className="text-[10px] text-stone-400">Font size:</span>
                        <select
                          value={selectedElement.fontSize || 12}
                          onChange={(e) => updateElementStyle(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                          className="text-xs bg-transparent border-none outline-none font-bold text-stone-800 cursor-pointer"
                        >
                          {[11, 12, 13, 14, 16, 18, 20, 24].map(size => (
                            <option key={size} value={size}>{size}px</option>
                          ))}
                        </select>
                      </div>

                      {/* Font styles buttons */}
                      <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg p-1">
                        <button
                          onClick={() => updateElementStyle(selectedElement.id, { fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold" })}
                          className={`flex-1 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                            selectedElement.fontWeight === "bold" ? "bg-stone-800 text-white" : "hover:bg-white text-stone-600"
                          }`}
                          title="Toggle Bold"
                        >
                          B
                        </button>
                        <button
                          onClick={() => updateElementStyle(selectedElement.id, { fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic" })}
                          className={`flex-1 py-1 text-xs italic font-serif font-bold rounded cursor-pointer transition-colors ${
                            selectedElement.fontStyle === "italic" ? "bg-stone-800 text-white" : "hover:bg-white text-stone-600"
                          }`}
                          title="Toggle Italic"
                        >
                          I
                        </button>
                      </div>
                    </div>

                    {/* Text Colors */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-stone-400">Color:</span>
                      {["#1E293B", "#374151", "#EF4444", "#3B82F6", "#10B981", "#8B5CF6", "#D97706"].map(tc => (
                        <button
                          key={tc}
                          onClick={() => updateElementStyle(selectedElement.id, { textColor: tc })}
                          className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-transform ${
                            selectedElement.textColor === tc ? "ring-2 ring-amber-500 scale-110" : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: tc }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Geometry Dimensions */}
                {!["draw"].includes(selectedElement.type) && (
                  <div className="space-y-2 pt-2 border-t border-stone-100 text-left">
                    <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Dimensions (W & H):</label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between border border-stone-200 rounded-lg p-1.5 bg-stone-50">
                        <span className="text-[9px] text-stone-400">Width</span>
                        <input
                          type="number"
                          value={selectedElement.width || 0}
                          onChange={(e) => updateElementStyle(selectedElement.id, { width: Math.max(30, parseInt(e.target.value) || 0) })}
                          className="bg-transparent text-right font-mono text-xs font-bold w-12 border-none outline-none text-stone-700"
                        />
                      </div>
                      <div className="flex items-center justify-between border border-stone-200 rounded-lg p-1.5 bg-stone-50">
                        <span className="text-[9px] text-stone-400">Height</span>
                        <input
                          type="number"
                          value={selectedElement.height || 0}
                          onChange={(e) => updateElementStyle(selectedElement.id, { height: Math.max(20, parseInt(e.target.value) || 0) })}
                          className="bg-transparent text-right font-mono text-xs font-bold w-12 border-none outline-none text-stone-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Depth layer arrangement controls */}
                <div className="space-y-2 pt-2 border-t border-stone-100 text-left">
                  <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Arrange Layers:</label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => sendToBack(selectedElement.id)}
                      className="py-2 px-3 border border-stone-200 rounded-xl text-[10px] font-bold text-stone-700 bg-white hover:bg-stone-50 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-stone-400" />
                      <span>Send to Back</span>
                    </button>

                    <button
                      onClick={() => bringToFront(selectedElement.id)}
                      className="py-2 px-3 border border-stone-200 rounded-xl text-[10px] font-bold text-stone-700 bg-white hover:bg-stone-50 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-stone-400" />
                      <span>Bring to Front</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Modern Procedural AI Diagram Creator Dialog / Popup Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center z-50 p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-100 relative text-left"
            >
              <button
                onClick={() => setShowAIModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-lg cursor-pointer font-bold p-1"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-extrabold text-stone-800">Procedural AI Diagram Creator</h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed mb-4">
                Choose an expert blueprint template below or enter custom instructions to generate beautifully connected boxes, notes, decision diamonds, and arrow flows immediately!
              </p>

              {/* Preset blueprints */}
              <div className="space-y-2 mb-5">
                <span className="text-[10px] font-extrabold text-stone-400 tracking-wider uppercase block">Expert Blueprint Templates:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleProceduralGenerate("auth")}
                    className="p-2.5 border border-purple-100 hover:border-purple-300 rounded-xl bg-purple-50/20 text-left cursor-pointer hover:bg-purple-50/50 transition-colors"
                  >
                    <span className="font-bold text-xs text-purple-800 block">🔒 Auth Flowchart</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5 font-medium leading-tight">Credentials, IsMatch?, success pathing</span>
                  </button>

                  <button
                    onClick={() => handleProceduralGenerate("architecture")}
                    className="p-2.5 border border-sky-100 hover:border-sky-300 rounded-xl bg-sky-50/20 text-left cursor-pointer hover:bg-sky-50/50 transition-colors"
                  >
                    <span className="font-bold text-xs text-sky-800 block">☁️ Microservices</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5 font-medium leading-tight">Gateway, auth, workers, pgSQL</span>
                  </button>

                  <button
                    onClick={() => handleProceduralGenerate("mindmap")}
                    className="p-2.5 border border-amber-100 hover:border-amber-300 rounded-xl bg-amber-50/20 text-left cursor-pointer hover:bg-amber-50/50 transition-colors"
                  >
                    <span className="font-bold text-xs text-amber-800 block">🧠 Mind Map</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5 font-medium leading-tight">Central core idea branching notes</span>
                  </button>
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-stone-400 tracking-wider uppercase block">Custom Blueprint Flowchart Prompt:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., SaaS sales landing page sequence..."
                    className="flex-grow bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-purple-600 focus:bg-white text-stone-800 font-semibold"
                  />
                  <button
                    onClick={() => handleProceduralGenerate("custom")}
                    disabled={aiLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-md"
                  >
                    {aiLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        <span>Rendering...</span>
                      </>
                    ) : (
                      <>
                        <Sparkle className="w-3.5 h-3.5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-400 hover:text-stone-700 font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Dummy Triangle and Diamond Icons for Toolbar
function TriangleIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2, 2 22, 22 22" />
    </svg>
  );
}

function DiamondIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2, 22 12, 12 22, 2 12" />
    </svg>
  );
}
