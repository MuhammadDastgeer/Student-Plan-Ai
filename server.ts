import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize the Google GenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser
  app.use(express.json());

  // API Endpoint for Note AI Assistance using OpenAI
  app.post("/api/notes/ai", async (req, res) => {
    try {
      const { prompt, context, action, apiKey: clientApiKey } = req.body;

      const apiKey = clientApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();

      if (!apiKey) {
        return res.status(400).json({
          error: "No OpenAI API key found. Please enter your OpenAI API Key or configure OPENAI_API_KEY on the server.",
        });
      }

      let systemInstruction = "You are a cozy, professional, and friendly AI writing assistant for Flowbase Notes. " +
        "You help users summarize, translate, polish, and brainstorm ideas based on their notes. " +
        "Keep your tone helpful, clear, and inspiring. When asked to perform actions like summarize, expand, or translate, focus directly on the text and return beautifully formatted results using clean, standard Markdown (like ## Headings, **bold**, *italic*, > blockquotes, and list bullets).";

      let queryPrompt = "";

      if (action === "workspace") {
        systemInstruction = "You are Cozy AI, the central workspace agent for Flowbase. You help the user manage calendars, tasks (Kanban), notes, whiteboards, templates, and spaces/pages.\n" +
          "You can answer any questions, plan their day, or help them prepare action blocks to automatically create or update files, tasks, notes, etc.\n\n" +
          "CRITICAL: If the user asks you to DO something, such as create a task, add an event on calendar, create a note, create a space/page, or place a whiteboard sticky/box, you MUST include a structured JSON action block at the VERY end of your response, wrapped inside a markdown code block labeled 'workspace-action'.\n" +
          "Supported actions in the JSON block are:\n" +
          "1. Create a Kanban Task:\n" +
          "```json\n" +
          "{\n" +
          "  \"type\": \"create_kanban_task\",\n" +
          "  \"boardTitle\": \"Productivity Space\",\n" +
          "  \"columnTitle\": \"Todo\",\n" +
          "  \"title\": \"Task Title\",\n" +
          "  \"date\": \"YYYY-MM-DD\",\n" +
          "  \"priority\": \"low\" or \"medium\" or \"high\",\n" +
          "  \"description\": \"Optional description\"\n" +
          "}\n" +
          "```\n" +
          "2. Create a Calendar Event:\n" +
          "```json\n" +
          "{\n" +
          "  \"type\": \"create_calendar_event\",\n" +
          "  \"title\": \"Event Title\",\n" +
          "  \"dateStr\": \"YYYY-MM-DD\",\n" +
          "  \"time\": \"HH:MM\",\n" +
          "  \"color\": \"green\" or \"yellow\" or \"orange\" or \"red\" or \"blue\" or \"purple\",\n" +
          "  \"status\": \"Active\" or \"Draft\"\n" +
          "}\n" +
          "```\n" +
          "3. Create a Note:\n" +
          "```json\n" +
          "{\n" +
          "  \"type\": \"create_note\",\n" +
          "  \"title\": \"Note Title\",\n" +
          "  \"content\": \"Full markdown content here\"\n" +
          "}\n" +
          "```\n" +
          "4. Create a Whiteboard Element:\n" +
          "```json\n" +
          "{\n" +
          "  \"type\": \"create_whiteboard_element\",\n" +
          "  \"boardTitle\": \"Product Roadmap Flowchart\",\n" +
          "  \"elementType\": \"sticky\" or \"box\" or \"circle\" or \"text\",\n" +
          "  \"text\": \"Sticky note content\",\n" +
          "  \"color\": \"#FAF2EC\" or \"#E6FFFA\" or \"#EFF6FF\"\n" +
          "}\n" +
          "```\n" +
          "5. Create a Space / Page:\n" +
          "```json\n" +
          "{\n" +
          "  \"type\": \"create_space\",\n" +
          "  \"name\": \"Space/Page Name\",\n" +
          "  \"desc\": \"Description of the space\",\n" +
          "  \"themeColor\": \"blue\" or \"yellow\" or \"green\" or \"red\" or \"purple\"\n" +
          "}\n" +
          "```\n\n" +
          "Format your main conversational response beautifully using elegant standard Markdown first, explaining what you are doing. Then append the JSON block if they asked you to create something. Be friendly and clear, and answer in the language requested (English or Urdu/Hindi).";
        queryPrompt = prompt;
        if (context) {
          systemInstruction += `\n\nHere is the current workspace status context for you to refer to:\n"""\n${context}\n"""`;
        }
      } else if (action === "summarize") {
        queryPrompt = `Please summarize the following note content concisely. Use clear bullet points if appropriate:\n\nNote Content:\n"""\n${context}\n"""`;
      } else if (action === "improve") {
        queryPrompt = `Please correct any grammar mistakes, improve the sentence flow, and polish the following note content. Return only the polished version without any meta comments or introductory lines:\n\nNote Content:\n"""\n${context}\n"""`;
      } else if (action === "urdu") {
        queryPrompt = `Please translate the following note content beautifully and accurately into Urdu (اردو). Use elegant language and formatting appropriate for ur-PK:\n\nNote Content:\n"""\n${context}\n"""`;
      } else if (action === "english") {
        queryPrompt = `Please translate the following note content beautifully into English. Keep a natural and polished tone:\n\nNote Content:\n"""\n${context}\n"""`;
      } else if (action === "expand") {
        queryPrompt = `Please expand upon the following note content by adding more descriptive details, structured bullet points, or additional brainstorming ideas while preserving the main message:\n\nNote Content:\n"""\n${context}\n"""`;
      } else {
        // Standard chat message with note context
        queryPrompt = prompt;
        if (context) {
          systemInstruction += `\n\nHere is the current note content for context. Refer to it if the user asks questions or requests changes to it:\n"""\n${context}\n"""`;
        }
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: queryPrompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = "Failed to communicate with OpenAI API.";
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error?.message) {
            errMsg = parsed.error.message;
          }
        } catch (e) {}
        return res.status(response.status).json({ error: errMsg });
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content || "No response received from OpenAI.";
      res.json({ response: responseText });
    } catch (error: any) {
      console.error("Error communicating with OpenAI API:", error);
      res.status(500).json({
        error: error.message || "An error occurred while generating AI content via OpenAI.",
      });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Endpoint for OpenAI Template Generation
  app.post("/api/templates/generate", async (req, res) => {
    try {
      const { name, description, prompt, apiKey: clientApiKey } = req.body;

      const apiKey = clientApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();

      if (!apiKey) {
        return res.status(400).json({
          error: "No OpenAI API key found. Please enter your OpenAI API Key in the UI field or configure OPENAI_API_KEY on the server.",
        });
      }

      const systemPrompt = `You are a professional AI UI and productivity systems designer.
Your task is to take a template Name, Description, and Prompt, and output a structured JSON configuration for a custom micro-productivity template.

You MUST respond with a valid JSON object ONLY.
The JSON object must have this exact format:
{
  "fields": [
    {
      "id": "lowercase_id_with_underscores",
      "label": "Human readable field name",
      "type": "text" | "number" | "checkbox" | "textarea" | "select",
      "placeholder": "Helpful placeholder text",
      "options": ["array", "of", "strings", "if", "type", "is", "select", "otherwise empty"]
    }
  ],
  "checklist": [
    {
      "id": "lowercase_checklist_id",
      "task": "Specific daily task or goal text",
      "completed": false
    }
  ],
  "aiAdvice": "A warm, cozy, and highly actionable guidelines paragraph of 3-4 sentences on how to run this specific productivity routine successfully using this template."
}

Ensure the fields and checklist items are perfectly customized according to the requested Name, Description, and Prompt. Produce 3-5 highly relevant fields and 3-5 highly relevant checklist items. Make the labels clear, inspiring, and elegant.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Name: ${name}\nDescription: ${description}\nPrompt Guideline: ${prompt}` }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = "Failed to communicate with OpenAI API.";
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error?.message) {
            errMsg = parsed.error.message;
          }
        } catch (e) {}
        return res.status(response.status).json({ error: errMsg });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No template content returned from OpenAI.");
      }

      const parsedTemplate = JSON.parse(content);
      res.json({ template: parsedTemplate });
    } catch (error: any) {
      console.error("Error generating template via OpenAI:", error);
      res.status(500).json({
        error: error.message || "An unexpected error occurred during template generation.",
      });
    }
  });

  // API Endpoint for OpenAI Whiteboard Diagram Generation
  app.post("/api/diagrams/generate", async (req, res) => {
    try {
      const { prompt, apiKey: clientApiKey } = req.body;

      const apiKey = clientApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();

      if (!apiKey) {
        return res.status(400).json({
          error: "No OpenAI API key found. Please enter your OpenAI API Key or configure OPENAI_API_KEY on the server.",
        });
      }

      const systemPrompt = `You are a professional software architect and dynamic diagram designer.
Your task is to take a custom user prompt describing a flowchart, mindmap, architecture, sequence, or workflow, and output a structured JSON array representing diagram elements on a whiteboard.

The coordinate system space has (x: 0 to 1200, y: 0 to 800).
A whiteboard element can be a SHAPE or a CONNECTOR.

1. SHAPES:
- type: "box" | "circle" | "triangle" | "diamond" | "sticky" | "text"
- x: number (start x coordinate)
- y: number (start y coordinate)
- width: number (e.g. 140 to 180 for box, 120 to 140 for circle/diamond)
- height: number (e.g. 80 to 110 for box, 120 to 140 for circle/diamond)
- text: string (label inside shape, keep it short and legible. Use \\n for multi-line)
- color: string (background hex color code, use soft, eye-friendly pastel colors like "#E6F4FF" (soft blue), "#E6FFFA" (teal), "#FFFEE5" (yellow), "#FFF0F6" (pink), "#F5F3FF" (purple), "#FFF7ED" (orange), or "#FAF8F5" (warm white))
- borderColor: string (border hex color, e.g. matching dark shade of background)
- textColor: string (text hex color, e.g. dark charcoal or deep shade of color)
- borderWidth: number (normally 1 or 2)
- borderStyle: "solid" | "dashed" | "dotted"
- fontSize: number (usually 11 or 12 or 13)
- fontWeight: "normal" | "bold"

2. CONNECTORS:
- type: "arrow" | "line"
- color: string (hex code like "#475569" or similar)
- borderWidth: number (typically 2)
- borderStyle: "solid" | "dashed"
- text: string (optional short label on arrow, keep empty if no label)
- points: array of exactly two points [{ "x": number, "y": number }, { "x": number, "y": number }]
Connectors MUST logically start at the boundary of the source shape and end at the boundary of the target shape. Choose points carefully so they don't overlap weirdly.

You MUST respond with a valid JSON object ONLY.
The JSON object must have this exact format:
{
  "elements": [
    {
      "id": "unique_string_id_1",
      "type": "box",
      "x": 100,
      "y": 150,
      "width": 160,
      "height": 90,
      "text": "Start Process",
      "color": "#E6F4FF",
      "borderColor": "#3B82F6",
      "borderWidth": 2,
      "borderStyle": "solid",
      "textColor": "#1E3A8A",
      "fontSize": 12,
      "fontWeight": "bold"
    },
    {
      "id": "arrow_1_2",
      "type": "arrow",
      "text": "proceed",
      "color": "#64748B",
      "borderWidth": 2,
      "borderStyle": "solid",
      "points": [ { "x": 260, "y": 195 }, { "x": 360, "y": 195 } ]
    }
  ]
}

Ensure all elements are beautifully spaced, layout flows logical (usually left-to-right or top-to-bottom), colors are professionally matched, and connectors perfectly link the shapes. Generate between 4 to 12 logical elements depending on the user prompt complexity. Keep all coordinates mathematically cohesive.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate a detailed diagram flowchart for this prompt: "${prompt}"` }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = "Failed to communicate with OpenAI API.";
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error?.message) {
            errMsg = parsed.error.message;
          }
        } catch (e) {}
        return res.status(response.status).json({ error: errMsg });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No diagram elements returned from OpenAI.");
      }

      const parsedData = JSON.parse(content);
      res.json({ elements: parsedData.elements || [] });
    } catch (error: any) {
      console.error("Error generating diagram via OpenAI:", error);
      res.status(500).json({
        error: error.message || "An unexpected error occurred during diagram generation.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
