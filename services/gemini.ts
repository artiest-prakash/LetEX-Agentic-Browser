import { GoogleGenAI, Type, FunctionDeclaration, Tool } from "@google/genai";
import { Message } from '../types';
import { saveNote } from './firebase';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are LetEX, a high-fidelity, context-aware AI browsing assistant. 
Your goal is to help the user navigate the web, summarize content, and answer questions.
You have access to the content of the webpage the user is currently viewing (if available) via the "pageContext" variable provided in the prompt.
- If "pageContext" is available, use it to answer questions about the page.
- If "pageContext" indicates security restrictions, acknowledging that you cannot read the page directly and offer to search for the information using Google Search.
- Keep responses concise, professional, and formatted in clean Markdown.
- Use bullet points for lists and bold text for emphasis.
`;

// --- Tool Definitions ---

const addToNotesTool: FunctionDeclaration = {
  name: "add_to_notes",
  description: "Saves a block of text, a URL, or a summary from the current page to the user's notes.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      content_to_save: { type: Type.STRING, description: "The text content or URL to save." }
    },
    required: ["content_to_save"]
  }
};

const draftEmailTool: FunctionDeclaration = {
  name: "draft_email",
  description: "Drafts an email based on the current page content or a user's request.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      recipient: { type: Type.STRING, description: "The email recipient." },
      subject: { type: Type.STRING, description: "The email subject line." },
      body_content: { type: Type.STRING, description: "The main content/body of the email." }
    },
    required: ["recipient", "subject", "body_content"]
  }
};

const searchAndCompareTool: FunctionDeclaration = {
  name: "search_and_compare",
  description: "Performs a follow-up web search and compares results on two topics.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic_a: { type: Type.STRING, description: "The first topic to compare." },
      topic_b: { type: Type.STRING, description: "The second topic to compare." }
    },
    required: ["topic_a", "topic_b"]
  }
};

// Combine into a Tool object
const tools: Tool[] = [{
  functionDeclarations: [addToNotesTool, draftEmailTool, searchAndCompareTool],
  // We can also include googleSearch here if we want to combine capabilities, 
  // but for this specific "Agentic" prototype, we focus on the custom functions.
  googleSearch: {} 
}];

// --- Simulated Execution ---

const executeTool = async (name: string, args: any, userId?: string): Promise<any> => {
  console.log(`Executing Tool: ${name}`, args);
  
  // Simulate network delay for effect
  await new Promise(resolve => setTimeout(resolve, 1000));

  switch (name) {
    case 'add_to_notes':
      if (userId) {
        try {
          await saveNote(userId, args.content_to_save);
          return { result: `Success: Saved to your Notes database: "${args.content_to_save.substring(0, 30)}..."` };
        } catch (e) {
          return { error: "Failed to save note to database." };
        }
      } else {
        return { error: "User not authenticated. Cannot save note." };
      }
    
    case 'draft_email':
      return { result: `Success: Drafted a new email to ${args.recipient} with the subject: "${args.subject}". Ready to review.` };
    
    case 'search_and_compare':
      return { result: `Success: Performed comparison search. ${args.topic_a} vs ${args.topic_b}. Found 5 key differences regarding pricing and features.` };
      
    default:
      return { error: "Unknown tool" };
  }
};

// --- Main Service ---

export const sendMessageToGemini = async (
  history: Message[], 
  newMessage: string, 
  pageContext: string,
  onToolStart?: (name: string, args: any) => void,
  userId?: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct the context block
    const contextBlock = `
    [CURRENT PAGE CONTEXT]
    ${pageContext || "No specific page context available."}
    [END CONTEXT]
    `;

    const fullMessage = `${contextBlock}\n\nUser Query: ${newMessage}`;

    // 1. Initial Call
    const response = await ai.models.generateContent({
      model: model,
      contents: fullMessage, // Simple content string for the first turn
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools,
      },
    });

    // 2. Check for Function Calls
    const calls = response.functionCalls;

    if (calls && calls.length > 0) {
      const call = calls[0]; // Handle the first call
      
      // Notify UI
      if (onToolStart) {
        onToolStart(call.name, call.args);
      }

      // Execute Tool
      // Pass userId to tool execution
      const toolResult = await executeTool(call.name, call.args, userId);

      // 3. Send Result back to Gemini (Multi-turn)
      // We must construct the history of this specific turn manually since we aren't using a persistent ChatSession object here.
      // Turn 1: User (fullMessage)
      // Turn 2: Model (The function call request)
      // Turn 3: User (The function response)
      
      const secondResponse = await ai.models.generateContent({
        model: model,
        contents: [
          { role: 'user', parts: [{ text: fullMessage }] },
          { role: 'model', parts: response.candidates?.[0]?.content?.parts || [] },
          { 
            role: 'user', 
            parts: [{ 
              functionResponse: {
                name: call.name,
                response: toolResult
              }
            }]
          }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: tools 
        }
      });

      return secondResponse.text || "Task completed, but no final summary provided.";
    }

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error connecting to the AI service. Please check your connection or API key.";
  }
};