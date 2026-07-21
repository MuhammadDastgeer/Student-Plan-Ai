/**
 * Direct client-side fallbacks for OpenAI APIs.
 * This ensures that if the application is deployed on static platforms like Vercel (without a backend),
 * the AI features still work perfectly if an OpenAI API Key is configured in the UI settings/local storage.
 */

export async function callOpenAINotesAI(payload: {
  prompt: string;
  context?: string;
  action?: string;
  history?: any[];
  apiKey?: string;
}) {
  const apiKey = payload.apiKey?.trim() || localStorage.getItem("openai_api_key")?.trim();
  if (!apiKey) {
    throw new Error("No OpenAI API Key found. Please configure your OpenAI API Key in the Settings -> AI Settings panel.");
  }

  let systemInstruction = "You are a cozy, professional, and friendly AI writing assistant for Flowbase Notes. " +
    "You help users summarize, translate, polish, and brainstorm ideas based on their notes. " +
    "Keep your tone helpful, clear, and inspiring. When asked to perform actions like summarize, expand, or translate, focus directly on the text and return beautifully formatted results using clean, standard Markdown (like ## Headings, **bold**, *italic*, > blockquotes, and list bullets).";

  let queryPrompt = payload.prompt;
  const context = payload.context;
  const action = payload.action;
  const history = payload.history;

  if (action === "workspace") {
    systemInstruction += "\n\n" +
      "CRITICAL ACTION SYSTEM: If the user asks you to CREATE, EDIT (update/modify), or DELETE any workspace items (Kanban task, calendar event, note, whiteboard sticky, space/folder), you MUST look up the nearest match in the provided context (by title/text matching or ID), prepare the corresponding action, and include a structured JSON action block at the VERY end of your response inside a markdown code block labeled 'workspace-action'.\n\n" +
      "CRITICAL IN-THE-LOOP RULE: Always formulate a friendly, conversational, and helpful reply first in the language the user is speaking (e.g. English, or Urdu/Hindi/Roman-Urdu mix). At the very end of your reply, you MUST keep the user in the loop by asking a clear question such as: 'Would you like me to apply this update to your workspace?' or 'Kya aap chahte hain ke main yeh update/deletion apply kar doon?' so they feel fully in control before you apply changes.\n\n" +
      "Supported actions in the JSON block are:\n" +
      "1. Kanban Tasks:\n" +
      "  - Create Task:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"create_kanban_task\",\n" +
      "      \"boardTitle\": \"Board Name\",\n" +
      "      \"columnTitle\": \"Todo\",\n" +
      "      \"title\": \"Task Title\",\n" +
      "      \"date\": \"YYYY-MM-DD\",\n" +
      "      \"priority\": \"low\" or \"medium\" or \"high\",\n" +
      "      \"description\": \"Description\"\n" +
      "    }\n" +
      "    ```\n" +
      "  - Edit Task:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"edit_kanban_task\",\n" +
      "      \"taskId\": \"task-id-or-title\",\n" +
      "      \"title\": \"New Title (optional)\",\n" +
      "      \"priority\": \"low\"/\"medium\"/\"high\" (optional),\n" +
      "      \"description\": \"New Description (optional)\",\n" +
      "      \"columnTitle\": \"New Column Name (optional)\"\n" +
      "    }\n" +
      "    ```\n" +
      "  - Delete Task:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"delete_kanban_task\",\n" +
      "      \"taskId\": \"task-id-or-title\"\n" +
      "    }\n" +
      "    ```\n" +
      "2. Calendar Events:\n" +
      "  - Create Event:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"create_calendar_event\",\n" +
      "      \"title\": \"Event Title\",\n" +
      "      \"dateStr\": \"YYYY-MM-DD\",\n" +
      "      \"time\": \"HH:MM\",\n" +
      "      \"color\": \"green\"/\"yellow\"/\"orange\"/\"red\"/\"blue\"/\"purple\",\n" +
      "      \"status\": \"Active\" or \"Draft\"\n" +
      "    }\n" +
      "    ```\n" +
      "  - Edit Event:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"edit_calendar_event\",\n" +
      "      \"eventId\": \"event-id-or-title\",\n" +
      "      \"title\": \"New Title (optional)\",\n" +
      "      \"dateStr\": \"YYYY-MM-DD\" (optional),\n" +
      "      \"time\": \"HH:MM\" (optional),\n" +
      "      \"color\": \"color\" (optional)\n" +
      "    }\n" +
      "    ```\n" +
      "  - Delete Event:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"delete_calendar_event\",\n" +
      "      \"eventId\": \"event-id-or-title\"\n" +
      "    }\n" +
      "    ```\n" +
      "3. Notes:\n" +
      "  - Create Note:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"create_note\",\n" +
      "      \"title\": \"Note Title\",\n" +
      "      \"content\": \"Full markdown content here\"\n" +
      "    }\n" +
      "    ```\n" +
      "  - Edit Note:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"edit_note\",\n" +
      "      \"noteId\": \"note-id-or-title\",\n" +
      "      \"title\": \"New Title (optional)\",\n" +
      "      \"content\": \"New Full content (optional)\"\n" +
      "    }\n" +
      "    ```\n" +
      "  - Delete Note:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"delete_note\",\n" +
      "      \"noteId\": \"note-id-or-title\"\n" +
      "    }\n" +
      "    ```\n" +
      "4. Whiteboard Elements:\n" +
      "  - Create Element:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"create_whiteboard_element\",\n" +
      "      \"boardTitle\": \"Product Roadmap Flowchart\",\n" +
      "      \"elementType\": \"sticky\"/\"box\"/\"circle\"/\"text\",\n" +
      "      \"text\": \"content\",\n" +
      "      \"color\": \"#FAF2EC\"/\"#E6FFFA\"/\"#EFF6FF\"\n" +
      "    }\n" +
      "    ```\n" +
      "  - Edit Element:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"edit_whiteboard_element\",\n" +
      "      \"elementId\": \"element-id-or-text\",\n" +
      "      \"text\": \"New Text (optional)\",\n" +
      "      \"color\": \"color\" (optional)\n" +
      "    }\n" +
      "    ```\n" +
      "  - Delete Element:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"delete_whiteboard_element\",\n" +
      "      \"elementId\": \"element-id-or-text\"\n" +
      "    }\n" +
      "    ```\n" +
      "5. Spaces / Pages:\n" +
      "  - Create Space:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"create_space\",\n" +
      "      \"name\": \"Space/Page Name\",\n" +
      "      \"desc\": \"Description\",\n" +
      "      \"themeColor\": \"blue\"/\"yellow\"/\"green\"/\"red\"/\"purple\"\n" +
      "    }\n" +
      "    ```\n" +
      "  - Edit Space:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"edit_space\",\n" +
      "      \"spaceId\": \"space-id-or-name\",\n" +
      "      \"name\": \"New Name (optional)\",\n" +
      "      \"desc\": \"New description (optional)\",\n" +
      "      \"themeColor\": \"color\" (optional)\n" +
      "    }\n" +
      "    ```\n" +
      "  - Delete Space:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"delete_space\",\n" +
      "      \"spaceId\": \"space-id-or-name\"\n" +
      "    }\n" +
      "    ```\n" +
      "6. Switch Tab / Navigate Tab:\n" +
      "    ```json\n" +
      "    {\n" +
      "      \"type\": \"switch_tab\",\n" +
      "      \"tab\": \"/calendar\" or \"/kanban\" or \"/notes\" or \"/whiteboard\" or \"/spaces\" or \"/dashboard\" or \"/settings\"\n" +
      "    }\n" +
      "    ```\n\n" +
      "Always remember to ask the user a confirming question at the end of the conversation to keep them fully in the loop.";
    queryPrompt = payload.prompt;
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
    queryPrompt = payload.prompt;
    if (context) {
      systemInstruction += `\n\nHere is the current note content for context. Refer to it if the user asks questions or requests changes to it:\n"""\n${context}\n"""`;
    }
  }

  let messagesPayload: any[] = [
    { role: "system", content: systemInstruction }
  ];

  if (history && Array.isArray(history)) {
    const mappedHistory = history.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    }));
    messagesPayload = messagesPayload.concat(mappedHistory);
  }

  messagesPayload.push({ role: "user", content: queryPrompt });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messagesPayload,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `Failed to call OpenAI Chat API (Status ${response.status}).`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error?.message) {
        errMsg = parsed.error.message;
      }
    } catch (e) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  const responseText = data.choices?.[0]?.message?.content || "No response received from OpenAI.";
  return { response: responseText };
}

export async function callOpenAITemplateGenerate(payload: {
  name: string;
  description: string;
  prompt: string;
  apiKey?: string;
}) {
  const apiKey = payload.apiKey?.trim() || localStorage.getItem("openai_api_key")?.trim();
  if (!apiKey) {
    throw new Error("No OpenAI API Key found. Please configure your OpenAI API Key in the Settings -> AI Settings panel.");
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
        { role: "user", content: `Name: ${payload.name}\nDescription: ${payload.description}\nPrompt Guideline: ${payload.prompt}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `Failed to generate template from OpenAI (Status ${response.status}).`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error?.message) {
        errMsg = parsed.error.message;
      }
    } catch (e) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No template content returned from OpenAI.");
  }

  const parsedTemplate = JSON.parse(content);
  return { template: parsedTemplate };
}

export async function callOpenAIDiagramGenerate(payload: {
  prompt: string;
  apiKey?: string;
}) {
  const apiKey = payload.apiKey?.trim() || localStorage.getItem("openai_api_key")?.trim();
  if (!apiKey) {
    throw new Error("No OpenAI API Key found. Please configure your OpenAI API Key in the Settings -> AI Settings panel.");
  }

  const systemPrompt = `You are a professional software architect and dynamic diagram designer.
Your task is to take a custom user prompt describing a flowchart, mindmap, architecture, sequence, or workflow, and output a structured JSON array representing diagram elements on a whiteboard.

You MUST respond with a valid JSON object ONLY.
The JSON object must have this exact format:
{
  "elements": [
    {
      "id": "unique_lowercase_id",
      "type": "sticky" | "box" | "circle" | "triangle" | "diamond" | "arrow" | "line" | "text",
      "x": number (recommended 50 to 900),
      "y": number (recommended 50 to 600),
      "width": number (recommended 80 to 200),
      "height": number (recommended 60 to 180),
      "text": "The display text inside the shape. Use '\\n' for new lines if long.",
      "color": "elegant light bg hex color like '#FAF2EC' or '#E6FFFA' or '#EFF6FF' or '#FFFDF9'",
      "borderColor": "optional accent border hex color",
      "borderWidth": optional number like 2,
      "borderStyle": "optional 'solid' or 'dashed' or 'dotted'",
      "textColor": "optional matching text color hex like '#475569' or '#1E293B'",
      "fontSize": optional number (usually 11 to 14),
      "fontWeight": "optional 'normal' or 'bold'",
      "points": "For type 'arrow' or 'line' only, must be a JSON array of coordinates: [{'x': x1, 'y': y1}, {'x': x2, 'y': y2}] indicating connection direction. Always make sure arrow coordinates link existing elements beautifully."
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
        { role: "user", content: `Generate a detailed diagram flowchart for this prompt: "${payload.prompt}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `Failed to generate diagram from OpenAI (Status ${response.status}).`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error?.message) {
        errMsg = parsed.error.message;
      }
    } catch (e) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No diagram elements returned from OpenAI.");
  }

  const parsedData = JSON.parse(content);
  return { elements: parsedData.elements || [] };
}
