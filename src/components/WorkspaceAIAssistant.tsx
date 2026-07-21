import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Calendar, Plus, Bot, MessageSquare, Send, Mic, Trash2, CheckCircle2, AlertCircle, FolderPlus, HelpCircle } from "lucide-react";
import { useRouter } from "./Router";

export default function WorkspaceAIAssistant() {
  const { navigate } = useRouter();
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; date: string }>>(() => {
    const saved = localStorage.getItem("cozy_ai_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(-200);
        }
      } catch (e) {}
    }
    return [];
  });
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("cozy_ai_chat_history", JSON.stringify(messages.slice(-200)));
  }, [messages]);

  const prompts = [
    "Create a task tomorrow for reviewing code with priority high",
    "Add meeting reminder on calendar for Tuesday at 11:30",
    "Generate a new note with ideas for a startup",
    "Create a space/page named marketing and research",
    "Add a sticky note on whiteboard with text Hello World",
    "Plan my week and suggest what to do"
  ];

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const getWorkspaceContext = (): string => {
    const calendar = localStorage.getItem("workspace_calendar_tasks");
    const boards = localStorage.getItem("workspace_kanban_boards");
    const columns = localStorage.getItem("workspace_kanban_columns");
    const kanbanTasks = localStorage.getItem("workspace_kanban_tasks");
    const notes = localStorage.getItem("workspace_notes");
    const whiteboards = localStorage.getItem("workspace_whiteboards_list");
    const whiteboardData = localStorage.getItem("workspace_whiteboards_data");
    const spaces = localStorage.getItem("workspace_spaces");

    let context = "CURRENT WORKSPACE STATE & DETAILED RECORDS:\n\n";
    
    context += "--- ACTIVE NOTES ---\n";
    try {
      const parsedNotes = notes ? JSON.parse(notes) : [];
      const active = parsedNotes.filter((n: any) => !n.isDeleted);
      if (active.length > 0) {
        active.forEach((n: any) => {
          context += `- Note ID: "${n.id}", Title: "${n.title}", Content: "${n.content ? n.content.substring(0, 150) + '...' : ''}"\n`;
        });
      } else {
        context += "No notes exist.\n";
      }
    } catch (e) {
      context += "Error reading notes.\n";
    }

    context += "\n--- CALENDAR EVENTS ---\n";
    try {
      const parsedCal = calendar ? JSON.parse(calendar) : [];
      if (parsedCal.length > 0) {
        parsedCal.forEach((c: any) => {
          context += `- Event ID: "${c.id}", Title: "${c.title}", Date: "${c.dateStr}", Time: "${c.time || '10:00'}", Color: "${c.color || 'blue'}", Status: "${c.status || 'Active'}"\n`;
        });
      } else {
        context += "No calendar events exist.\n";
      }
    } catch (e) {
      context += "Error reading calendar events.\n";
    }

    context += "\n--- KANBAN BOARDS, COLUMNS & TASKS ---\n";
    try {
      const parsedBoards = boards ? JSON.parse(boards) : [];
      const parsedColumns = columns ? JSON.parse(columns) : [];
      const parsedTasks = kanbanTasks ? JSON.parse(kanbanTasks) : [];
      
      if (parsedBoards.length > 0) {
        parsedBoards.forEach((b: any) => {
          context += `Board ID: "${b.id}", Title: "${b.title}"\n`;
          const boardCols = parsedColumns.filter((c: any) => c.boardId === b.id);
          boardCols.forEach((col: any) => {
            context += `  Column ID: "${col.id}", Title: "${col.title}"\n`;
            const colTasks = parsedTasks.filter((t: any) => t.columnId === col.id);
            colTasks.forEach((t: any) => {
              context += `    - Task ID: "${t.id}", Title: "${t.title}", Date: "${t.date}", Priority: "${t.priority}", Desc: "${t.description || ''}"\n`;
            });
          });
        });
      } else {
        context += "No Kanban boards exist.\n";
      }
    } catch (e) {
      context += "Error reading Kanban boards.\n";
    }

    context += "\n--- WHITEBOARDS & ELEMENTS ---\n";
    try {
      const parsedWB = whiteboards ? JSON.parse(whiteboards) : [];
      const parsedWBData = whiteboardData ? JSON.parse(whiteboardData) : {};
      if (parsedWB.length > 0) {
        parsedWB.forEach((w: any) => {
          context += `Whiteboard ID: "${w.id}", Title: "${w.title}"\n`;
          const elements = parsedWBData[w.id] || [];
          elements.forEach((el: any) => {
            context += `  - Element ID: "${el.id}", Type: "${el.type}", Text: "${el.text || ''}", Color: "${el.color || ''}"\n`;
          });
        });
      } else {
        context += "No whiteboards exist.\n";
      }
    } catch (e) {
      context += "Error reading whiteboards.\n";
    }

    context += "\n--- SPACES & PAGES ---\n";
    try {
      const parsedSpaces = spaces ? JSON.parse(spaces) : [];
      if (parsedSpaces.length > 0) {
        parsedSpaces.forEach((s: any) => {
          context += `- Space ID: "${s.id}", Name: "${s.name}", Description: "${s.desc || ''}", ThemeColor: "${s.themeColor || 'purple'}"\n`;
        });
      } else {
        context += "No spaces exist.\n";
      }
    } catch (e) {
      context += "Error reading spaces.\n";
    }

    return context;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = {
      sender: "user" as const,
      text,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update state and ensure max 200 messages
    setMessages((prev) => [...prev, userMsg].slice(-200));
    setInputText("");
    setIsTyping(true);

    try {
      const context = getWorkspaceContext();

      // Pass past messages as history (max 199 messages, leaving room for the current prompt)
      const historyPayload = messages.slice(-199);

      const response = await fetch("/api/notes/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: text,
          context: context,
          action: "workspace",
          history: historyPayload
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with OpenAI API. Please check your OPENAI_API_KEY.");
      }

      const data = await response.json();
      const aiResponseText = data.response || "No response received from Cozy AI.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai" as const,
          text: aiResponseText,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ].slice(-200));

      // Detect and parse the action if present
      const actionRegex = /```(?:workspace-action|json)\s*([\s\S]*?)```/i;
      const match = aiResponseText.match(actionRegex);
      let actionData: any = null;

      if (match) {
        try {
          const parsed = JSON.parse(match[1].trim());
          if (parsed && parsed.type) {
            actionData = parsed;
          }
        } catch (e) {}
      } else {
        // Fallback: look for generic json-like bracket if user asks to create
        const braceMatch = aiResponseText.match(/\{[\s\S]*?"type"[\s\S]*?\}/);
        if (braceMatch) {
          try {
            const parsed = JSON.parse(braceMatch[0].trim());
            if (parsed && parsed.type) {
              actionData = parsed;
            }
          } catch (e) {}
        }
      }

      if (actionData) {
        setPendingAction(actionData);
        setShowActionDialog(true);
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai" as const,
          text: `Error: ${error.message || "An unexpected error occurred."} Please verify if you have configured your OPENAI_API_KEY in the Secrets panel.`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExecuteAction = () => {
    if (!pendingAction) return;

    try {
      const type = pendingAction.type;

      if (type === "create_kanban_task") {
        // 1. Boards
        const savedBoards = localStorage.getItem("workspace_kanban_boards");
        let boards = savedBoards ? JSON.parse(savedBoards) : [];
        let targetBoard = boards.find((b: any) => b.title.toLowerCase().includes((pendingAction.boardTitle || "").toLowerCase()));
        
        if (!targetBoard) {
          targetBoard = {
            id: "board-" + Math.random().toString(36).substr(2, 9),
            title: pendingAction.boardTitle || "Productivity Space",
            color: "blue",
            description: "AI Drafted workspace board"
          };
          boards.push(targetBoard);
          localStorage.setItem("workspace_kanban_boards", JSON.stringify(boards));
        }

        // 2. Columns
        const savedColumns = localStorage.getItem("workspace_kanban_columns");
        let columns = savedColumns ? JSON.parse(savedColumns) : [];
        let boardColumns = columns.filter((c: any) => c.boardId === targetBoard.id);
        
        let targetColumn = boardColumns.find((c: any) => c.title.toLowerCase().includes((pendingAction.columnTitle || "").toLowerCase()));
        if (!targetColumn) {
          if (boardColumns.length === 0) {
            const col1 = { id: "col-" + Math.random().toString(36).substr(2, 9), boardId: targetBoard.id, title: "Todo", color: "orange" };
            const col2 = { id: "col-" + Math.random().toString(36).substr(2, 9), boardId: targetBoard.id, title: "In Progress", color: "blue" };
            const col3 = { id: "col-" + Math.random().toString(36).substr(2, 9), boardId: targetBoard.id, title: "Done", color: "green" };
            columns.push(col1, col2, col3);
            targetColumn = col1;
          } else {
            targetColumn = boardColumns[0];
          }
          localStorage.setItem("workspace_kanban_columns", JSON.stringify(columns));
        }

        // 3. Task
        const savedTasks = localStorage.getItem("workspace_kanban_tasks");
        let tasks = savedTasks ? JSON.parse(savedTasks) : [];
        const newTask = {
          id: "task-" + Math.random().toString(36).substr(2, 9),
          columnId: targetColumn.id,
          boardId: targetBoard.id,
          title: pendingAction.title || "AI Generated Task",
          date: pendingAction.date || new Date().toISOString().split('T')[0],
          color: "blue",
          priority: pendingAction.priority || "medium",
          description: pendingAction.description || "Added automatically by Cozy AI."
        };
        tasks.push(newTask);
        localStorage.setItem("workspace_kanban_tasks", JSON.stringify(tasks));

        setSuccessNotification(`Successfully added Task "${newTask.title}" to Kanban board!`);
      }

      else if (type === "create_calendar_event") {
        const savedCal = localStorage.getItem("workspace_calendar_tasks");
        let calTasks = savedCal ? JSON.parse(savedCal) : [];
        const newEvent = {
          id: Math.random().toString(),
          dateStr: pendingAction.dateStr || new Date().toISOString().split('T')[0],
          title: pendingAction.title || "AI Event",
          time: pendingAction.time || "10:00",
          color: pendingAction.color || "green",
          status: pendingAction.status || "Active"
        };
        calTasks.push(newEvent);
        localStorage.setItem("workspace_calendar_tasks", JSON.stringify(calTasks));

        setSuccessNotification(`Successfully scheduled "${newEvent.title}" on your Calendar!`);
      }

      else if (type === "create_note") {
        const savedNotes = localStorage.getItem("workspace_notes");
        let notes = savedNotes ? JSON.parse(savedNotes) : [];
        const newNote = {
          id: "note-" + Math.random().toString(36).substr(2, 9),
          title: pendingAction.title || "AI Draft Note",
          content: pendingAction.content || "Draft created by Cozy AI",
          updatedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
          wordCount: (pendingAction.content || "").split(/\s+/).length,
          isPinned: false
        };
        notes.push(newNote);
        localStorage.setItem("workspace_notes", JSON.stringify(notes));

        setSuccessNotification(`Successfully created Note "${newNote.title}"!`);
      }

      else if (type === "create_whiteboard_element") {
        const savedWBList = localStorage.getItem("workspace_whiteboards_list");
        let wbList = savedWBList ? JSON.parse(savedWBList) : [
          { id: "planning", title: "Product Roadmap Flowchart", sub: "Architecture & User actions" }
        ];

        let targetBoard = wbList.find((w: any) => w.title.toLowerCase().includes((pendingAction.boardTitle || "").toLowerCase()));
        if (!targetBoard) {
          targetBoard = {
            id: "wb-" + Math.random().toString(36).substr(2, 9),
            title: pendingAction.boardTitle || "System Architecture Sandbox",
            sub: "Design playground"
          };
          wbList.push(targetBoard);
          localStorage.setItem("workspace_whiteboards_list", JSON.stringify(wbList));
        }

        const savedWBData = localStorage.getItem("workspace_whiteboards_data");
        let wbData = savedWBData ? JSON.parse(savedWBData) : {};
        if (!wbData[targetBoard.id]) {
          wbData[targetBoard.id] = [];
        }

        const newElement = {
          id: "e-" + Math.random().toString(36).substr(2, 9),
          type: pendingAction.elementType || "sticky",
          x: 150 + Math.random() * 100,
          y: 150 + Math.random() * 100,
          width: 140,
          height: 120,
          text: pendingAction.text || "Sticky note from Cozy AI",
          color: pendingAction.color || "#FAF2EC",
          borderColor: "#c67f43",
          borderWidth: 2,
          borderStyle: "solid" as const,
          textColor: "#221C18",
          fontSize: 12,
          fontWeight: "normal" as const
        };
        wbData[targetBoard.id].push(newElement);
        localStorage.setItem("workspace_whiteboards_data", JSON.stringify(wbData));

        setSuccessNotification(`Successfully added element to Whiteboard "${targetBoard.title}"!`);
      }

      else if (type === "create_space") {
        const savedSpaces = localStorage.getItem("workspace_spaces");
        let spaces = savedSpaces ? JSON.parse(savedSpaces) : [];
        const newSpace = {
          id: "space-" + Math.random().toString(36).substr(2, 9),
          name: pendingAction.name || "AI Space",
          desc: pendingAction.desc || "Added automatically by Cozy AI.",
          updatedAt: "Just now",
          themeColor: pendingAction.themeColor || "purple",
          isFavorite: false
        };
        spaces.push(newSpace);
        localStorage.setItem("workspace_spaces", JSON.stringify(spaces));

        setSuccessNotification(`Successfully created Space "${newSpace.name}"!`);
      }

      else if (type === "edit_kanban_task") {
        const savedTasks = localStorage.getItem("workspace_kanban_tasks");
        let tasks = savedTasks ? JSON.parse(savedTasks) : [];
        const taskToEdit = tasks.find((t: any) => t.id === pendingAction.taskId || t.title.toLowerCase().includes((pendingAction.taskId || "").toLowerCase()));
        if (taskToEdit) {
          if (pendingAction.title !== undefined) taskToEdit.title = pendingAction.title;
          if (pendingAction.priority !== undefined) taskToEdit.priority = pendingAction.priority;
          if (pendingAction.description !== undefined) taskToEdit.description = pendingAction.description;
          
          if (pendingAction.columnTitle) {
            const savedColumns = localStorage.getItem("workspace_kanban_columns");
            let columns = savedColumns ? JSON.parse(savedColumns) : [];
            const boardColumns = columns.filter((c: any) => c.boardId === taskToEdit.boardId);
            const col = boardColumns.find((c: any) => c.title.toLowerCase().includes(pendingAction.columnTitle.toLowerCase()));
            if (col) {
              taskToEdit.columnId = col.id;
            }
          }

          localStorage.setItem("workspace_kanban_tasks", JSON.stringify(tasks));
          setSuccessNotification(`Successfully updated Task "${taskToEdit.title}"!`);
        } else {
          setSuccessNotification(`Could not find specified task to edit.`);
        }
      }

      else if (type === "delete_kanban_task") {
        const savedTasks = localStorage.getItem("workspace_kanban_tasks");
        let tasks = savedTasks ? JSON.parse(savedTasks) : [];
        const initialLen = tasks.length;
        tasks = tasks.filter((t: any) => t.id !== pendingAction.taskId && !t.title.toLowerCase().includes((pendingAction.taskId || "").toLowerCase()));
        localStorage.setItem("workspace_kanban_tasks", JSON.stringify(tasks));
        if (tasks.length < initialLen) {
          setSuccessNotification(`Successfully deleted Task from your Kanban board!`);
        } else {
          setSuccessNotification(`Task to delete was not found.`);
        }
      }

      else if (type === "edit_calendar_event") {
        const savedCal = localStorage.getItem("workspace_calendar_tasks");
        let calTasks = savedCal ? JSON.parse(savedCal) : [];
        const eventToEdit = calTasks.find((c: any) => c.id === pendingAction.eventId || c.title.toLowerCase().includes((pendingAction.eventId || "").toLowerCase()));
        if (eventToEdit) {
          if (pendingAction.title !== undefined) eventToEdit.title = pendingAction.title;
          if (pendingAction.dateStr !== undefined) eventToEdit.dateStr = pendingAction.dateStr;
          if (pendingAction.time !== undefined) eventToEdit.time = pendingAction.time;
          if (pendingAction.color !== undefined) eventToEdit.color = pendingAction.color;
          localStorage.setItem("workspace_calendar_tasks", JSON.stringify(calTasks));
          setSuccessNotification(`Successfully updated Event "${eventToEdit.title}"!`);
        } else {
          setSuccessNotification(`Could not find specified calendar event to edit.`);
        }
      }

      else if (type === "delete_calendar_event") {
        const savedCal = localStorage.getItem("workspace_calendar_tasks");
        let calTasks = savedCal ? JSON.parse(savedCal) : [];
        const initialLen = calTasks.length;
        calTasks = calTasks.filter((c: any) => c.id !== pendingAction.eventId && !c.title.toLowerCase().includes((pendingAction.eventId || "").toLowerCase()));
        localStorage.setItem("workspace_calendar_tasks", JSON.stringify(calTasks));
        if (calTasks.length < initialLen) {
          setSuccessNotification(`Successfully deleted Event from Calendar!`);
        } else {
          setSuccessNotification(`Event to delete was not found.`);
        }
      }

      else if (type === "edit_note") {
        const savedNotes = localStorage.getItem("workspace_notes");
        let notes = savedNotes ? JSON.parse(savedNotes) : [];
        const noteToEdit = notes.find((n: any) => n.id === pendingAction.noteId || n.title.toLowerCase().includes((pendingAction.noteId || "").toLowerCase()));
        if (noteToEdit) {
          if (pendingAction.title !== undefined) noteToEdit.title = pendingAction.title;
          if (pendingAction.content !== undefined) {
            noteToEdit.content = pendingAction.content;
            noteToEdit.wordCount = pendingAction.content.split(/\s+/).length;
          }
          noteToEdit.updatedAt = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
          localStorage.setItem("workspace_notes", JSON.stringify(notes));
          setSuccessNotification(`Successfully updated Note "${noteToEdit.title}"!`);
        } else {
          setSuccessNotification(`Could not find the specified note to edit.`);
        }
      }

      else if (type === "delete_note") {
        const savedNotes = localStorage.getItem("workspace_notes");
        let notes = savedNotes ? JSON.parse(savedNotes) : [];
        const noteToDelete = notes.find((n: any) => n.id === pendingAction.noteId || n.title.toLowerCase().includes((pendingAction.noteId || "").toLowerCase()));
        if (noteToDelete) {
          noteToDelete.isDeleted = true;
          localStorage.setItem("workspace_notes", JSON.stringify(notes));
          setSuccessNotification(`Successfully moved Note "${noteToDelete.title}" to Trash!`);
        } else {
          setSuccessNotification(`Note to delete was not found.`);
        }
      }

      else if (type === "edit_whiteboard_element") {
        const savedWBData = localStorage.getItem("workspace_whiteboards_data");
        let wbData = savedWBData ? JSON.parse(savedWBData) : {};
        let found = false;
        
        Object.keys(wbData).forEach((boardId) => {
          const elements = wbData[boardId] || [];
          const elToEdit = elements.find((e: any) => e.id === pendingAction.elementId || (e.text || "").toLowerCase().includes((pendingAction.elementId || "").toLowerCase()));
          if (elToEdit) {
            if (pendingAction.text !== undefined) elToEdit.text = pendingAction.text;
            if (pendingAction.color !== undefined) elToEdit.color = pendingAction.color;
            found = true;
          }
        });

        if (found) {
          localStorage.setItem("workspace_whiteboards_data", JSON.stringify(wbData));
          setSuccessNotification(`Successfully updated Whiteboard sticky note!`);
        } else {
          setSuccessNotification(`Whiteboard element to edit was not found.`);
        }
      }

      else if (type === "delete_whiteboard_element") {
        const savedWBData = localStorage.getItem("workspace_whiteboards_data");
        let wbData = savedWBData ? JSON.parse(savedWBData) : {};
        let deletedCount = 0;

        Object.keys(wbData).forEach((boardId) => {
          const initialLen = wbData[boardId]?.length || 0;
          wbData[boardId] = (wbData[boardId] || []).filter((e: any) => e.id !== pendingAction.elementId && !(e.text || "").toLowerCase().includes((pendingAction.elementId || "").toLowerCase()));
          deletedCount += (initialLen - wbData[boardId].length);
        });

        if (deletedCount > 0) {
          localStorage.setItem("workspace_whiteboards_data", JSON.stringify(wbData));
          setSuccessNotification(`Successfully deleted element from Whiteboard!`);
        } else {
          setSuccessNotification(`Whiteboard element to delete was not found.`);
        }
      }

      else if (type === "edit_space") {
        const savedSpaces = localStorage.getItem("workspace_spaces");
        let spaces = savedSpaces ? JSON.parse(savedSpaces) : [];
        const spaceToEdit = spaces.find((s: any) => s.id === pendingAction.spaceId || s.name.toLowerCase().includes((pendingAction.spaceId || "").toLowerCase()));
        if (spaceToEdit) {
          if (pendingAction.name !== undefined) spaceToEdit.name = pendingAction.name;
          if (pendingAction.desc !== undefined) spaceToEdit.desc = pendingAction.desc;
          if (pendingAction.themeColor !== undefined) spaceToEdit.themeColor = pendingAction.themeColor;
          spaceToEdit.updatedAt = "Just now";
          localStorage.setItem("workspace_spaces", JSON.stringify(spaces));
          setSuccessNotification(`Successfully updated Space "${spaceToEdit.name}"!`);
        } else {
          setSuccessNotification(`Could not find specify Space to edit.`);
        }
      }

      else if (type === "delete_space") {
        const savedSpaces = localStorage.getItem("workspace_spaces");
        let spaces = savedSpaces ? JSON.parse(savedSpaces) : [];
        const initialLen = spaces.length;
        spaces = spaces.filter((s: any) => s.id !== pendingAction.spaceId && !s.name.toLowerCase().includes((pendingAction.spaceId || "").toLowerCase()));
        localStorage.setItem("workspace_spaces", JSON.stringify(spaces));
        if (spaces.length < initialLen) {
          setSuccessNotification(`Successfully deleted Space folder!`);
        } else {
          setSuccessNotification(`Space folder to delete was not found.`);
        }
      }

      else if (type === "switch_tab") {
        const dest = pendingAction.tab;
        if (dest) {
          navigate(dest);
          setSuccessNotification(`Successfully switched tab to ${dest}!`);
        } else {
          setSuccessNotification(`Invalid tab navigation destination.`);
        }
      }

      setShowActionDialog(false);
      setPendingAction(null);

      setTimeout(() => {
        setSuccessNotification(null);
      }, 4000);

    } catch (e) {
      console.error("Action execution error:", e);
    }
  };

  const renderMessageText = (text: string) => {
    // Hide JSON workspace action code blocks from standard chat output
    const cleanText = text.replace(/```(?:workspace-action|json)\s*([\s\S]*?)```/gi, "").trim();

    const lines = cleanText.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="font-serif text-xs font-bold text-[#c67f43] mt-2 mb-1">{line.substring(4)}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="font-serif text-sm font-bold text-[#221C18] border-b border-[#F0EBE5]/60 pb-1 mt-3 mb-1.5">{line.substring(3)}</h2>;
      }
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="font-serif text-base font-bold text-[#221C18] mt-4 mb-2">{line.substring(2)}</h1>;
      }
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const content = line.trim().substring(2);
        return (
          <ul key={idx} className="list-disc pl-5 my-1 text-stone-700 leading-relaxed">
            <li>{content}</li>
          </ul>
        );
      }
      if (line.startsWith("> ")) {
        return <blockquote key={idx} className="border-l-4 border-[#c67f43] pl-3 italic text-stone-500 bg-[#FAF2EC]/30 py-1 my-2 rounded-r">{line.substring(2)}</blockquote>;
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }

      let html = line;
      html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      
      return (
        <p 
          key={idx} 
          className="my-1 text-stone-700 leading-relaxed font-medium select-text" 
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div id="workspace-ai-assistant" className="p-6 md:p-8 bg-[#FAF8F5] min-h-[calc(100vh-60px)] flex flex-col justify-between relative">
      
      {/* Success Notification Banner */}
      <AnimatePresence>
        {successNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-6 right-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-md z-40 flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-xs font-bold">{successNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Page Title */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#F0EBE5]/60">
        <div className="flex items-center gap-2.5 text-left">
          <div className="p-2 bg-[#FAF2EC] text-[#c67f43] rounded-xl">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg text-[#221C18]">AI Assistant (GPT Powered)</h1>
            <p className="text-xs text-stone-500 font-medium">Ask questions, plan items, and build workspaces</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear your chat memory?")) {
                setMessages([]);
                localStorage.removeItem("cozy_ai_chat_history");
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#EFECE6] bg-white hover:bg-stone-50 text-stone-500 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-stone-400" /> Clear Chat History
          </button>
        )}
      </div>

      {/* Main Interactive Dialogue Sandbox */}
      <div className="flex-grow max-w-4xl w-full mx-auto flex flex-col justify-center">
        
        {messages.length === 0 ? (
          <div className="space-y-10 py-8">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#E05A47] text-white flex items-center justify-center mx-auto shadow-md">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="font-sans text-3xl font-bold tracking-tight text-[#221C18]">
                Chat, plan, and act across your workspace.
              </h2>
              <p className="text-[#5D554F] text-sm max-w-xl mx-auto leading-relaxed">
                Ask questions, plan your day, and prepare actions for your tasks, calendar, notes, whiteboards, and generated apps.
              </p>
            </div>

            {/* Prompt Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {prompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  className="bg-white border border-[#EFECE6] hover:border-[#c67f43] p-4 rounded-xl text-left flex items-center gap-3 cursor-pointer shadow-3xs transition-all hover:shadow-2xs group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FAF2EC] group-hover:bg-[#E05A47]/10 text-[#c67f43] flex items-center justify-center flex-shrink-0 transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-semibold text-[#221C18] group-hover:text-[#c67f43] transition-colors truncate">
                    {prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Live Chat Log */
          <div className="flex-grow overflow-y-auto space-y-5 max-h-[500px] mb-6 p-4 bg-white border border-[#EFECE6] rounded-2xl shadow-3xs custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto text-left"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-3xs ${
                  msg.sender === "user" ? "bg-[#c67f43] text-white" : "bg-[#E05A47] text-white"
                }`}>
                  {msg.sender === "user" ? "U" : "AI"}
                </div>
                <div className={`rounded-2xl p-4 shadow-3xs text-xs leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-[#FAF2EC] text-stone-800 rounded-tr-none text-right" 
                    : "bg-[#FFFDF9] border border-[#EFECE6] text-[#221C18] rounded-tl-none"
                }`}>
                  {msg.sender === "user" ? <p className="select-text">{msg.text}</p> : renderMessageText(msg.text)}
                  <span className="block text-[9px] text-stone-400 font-medium mt-1.5 uppercase tracking-wide">
                    {msg.date}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 mr-auto items-center text-left">
                <div className="w-8 h-8 rounded-full bg-[#E05A47] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 animate-pulse">
                  AI
                </div>
                <div className="bg-[#FFFDF9] border border-[#EFECE6] rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center justify-center shadow-3xs">
                  <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* Input Chat Block */}
      <div className="max-w-4xl w-full mx-auto bg-white border border-[#EFECE6] rounded-2xl p-4 shadow-xs relative mt-4">
        <textarea
          rows={1}
          placeholder="Ask Cozy GPT Assistant to plan, add calendar items, whiteboard cards, notes, or folders..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(inputText);
            }
          }}
          className="w-full bg-transparent outline-none border-none text-xs focus:ring-0 text-[#221C18] placeholder-stone-400 resize-none pr-20"
        />

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F3FF]/80">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-[#c67f43] flex-shrink-0" />
            <span>Actions require confirmation before saving to the active Workspace views.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => sendMessage("Generate a summary of my current workspace progress")}
              className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-[#EFECE6] rounded-lg text-[11px] font-bold text-stone-500 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3 h-3 text-[#c67f43]" /> Workspace Summary
            </button>
            <button
              onClick={() => sendMessage(inputText)}
              className="p-1.5 bg-[#E05A47] hover:bg-[#c64f3c] text-white rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-3xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-[-20px] left-0 right-0 text-center text-[10px] text-stone-400 font-medium select-none pointer-events-none">
          Enter sends. Shift+Enter adds a new line.
        </div>
      </div>

      {/* Structured Action Approval Dialog */}
      <AnimatePresence>
        {showActionDialog && pendingAction && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-stone-200/80 shadow-2xl max-w-md w-full p-6 text-left space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FAF2EC] text-[#c67f43] rounded-xl border border-[#FAF2EC]/80">
                  <Sparkles className="w-5 h-5 text-[#c67f43]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-800">Allow Workspace Update?</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Cozy AI is proposing to create/update an item in your workspace.</p>
                </div>
              </div>

              <div className="bg-stone-50 border border-[#EFECE6] p-3.5 rounded-xl max-h-48 overflow-y-auto text-xs text-stone-700 font-medium leading-relaxed custom-scrollbar">
                <span className="font-bold text-[10px] uppercase text-stone-400 block mb-1 tracking-wider">Proposed Workspace Action:</span>
                <div className="space-y-1.5 text-[11px]">
                  <div><strong className="text-stone-500">Action Type:</strong> <span className="text-[#c67f43] font-bold">{pendingAction.type}</span></div>
                  {pendingAction.title && <div><strong className="text-stone-500">Title:</strong> {pendingAction.title}</div>}
                  {pendingAction.name && <div><strong className="text-stone-500">Name:</strong> {pendingAction.name}</div>}
                  {pendingAction.desc && <div><strong className="text-stone-500">Description:</strong> {pendingAction.desc}</div>}
                  {pendingAction.date && <div><strong className="text-stone-500">Date:</strong> {pendingAction.date}</div>}
                  {pendingAction.dateStr && <div><strong className="text-stone-500">Date Str:</strong> {pendingAction.dateStr}</div>}
                  {pendingAction.priority && <div><strong className="text-stone-500">Priority:</strong> {pendingAction.priority}</div>}
                  {pendingAction.text && <div><strong className="text-stone-500">Text Content:</strong> {pendingAction.text}</div>}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowActionDialog(false);
                    setPendingAction(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer transition-colors text-center border border-stone-200/40"
                >
                  Reject / Cancel
                </button>
                <button
                  onClick={handleExecuteAction}
                  className="flex-1 px-4 py-2.5 bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-red-100 transition-colors text-center"
                >
                  Allow Action (Ijazat dein)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
