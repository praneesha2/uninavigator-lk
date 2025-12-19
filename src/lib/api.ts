import { z } from "zod";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

// Types
export interface District {
  id: number;
  name: string;
  name_si?: string;
  name_ta?: string;
}

export interface EligibilityRequest {
  z_score: number;
  district?: string;
  district_id?: number;
  year?: number;
  language?: "en" | "si" | "ta";
}

export interface EligibilityResult {
  university: string;
  course: string;
  course_code: string;
  cutoff_score: number;
  intake?: number;
  faculty?: string;
}

export interface EligibilityResponse {
  year: number;
  total_eligible: number;
  results: EligibilityResult[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  route?: "sql" | "vector";
  sources?: string[];
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  language?: "en" | "si" | "ta";
  z_score?: number;
  district?: string;
  district_id?: number;
  stream?: boolean;
}

export interface ChatResponse {
  message: string;
  route?: "sql" | "vector";
  sources?: string[];
}

// Validation schemas
export const eligibilitySchema = z.object({
  z_score: z.number().min(0).max(4),
  district_id: z.number().optional(),
  district: z.string().optional(),
  year: z.number().optional(),
  language: z.enum(["en", "si", "ta"]).optional(),
});

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  language: z.enum(["en", "si", "ta"]).optional(),
  z_score: z.number().min(0).max(4).optional(),
  district: z.string().optional(),
  district_id: z.number().optional(),
  stream: z.boolean().optional(),
});

// API functions
export async function fetchDistricts(): Promise<District[]> {
  const response = await fetch(`${API_BASE_URL}/districts`);
  if (!response.ok) {
    throw new Error("Failed to fetch districts");
  }
  return response.json();
}

export async function checkEligibility(data: EligibilityRequest): Promise<EligibilityResponse> {
  const response = await fetch(`${API_BASE_URL}/eligibility`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to check eligibility" }));
    throw new Error(error.message || "Failed to check eligibility");
  }
  
  return response.json();
}

export async function sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to send message" }));
    throw new Error(error.message || "Failed to send message");
  }
  
  return response.json();
}

export async function streamChatMessage(
  data: ChatRequest,
  onChunk: (chunk: string) => void,
  onComplete: (response: ChatResponse) => void
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, stream: true }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to send message" }));
    throw new Error(error.message || "Failed to send message");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let fullMessage = "";
  let metadata: { route?: "sql" | "vector"; sources?: string[] } = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") {
          onComplete({ message: fullMessage, ...metadata });
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            fullMessage += parsed.content;
            onChunk(parsed.content);
          }
          if (parsed.route) metadata.route = parsed.route;
          if (parsed.sources) metadata.sources = parsed.sources;
        } catch {
          // Not JSON, treat as plain text
          fullMessage += data;
          onChunk(data);
        }
      }
    }
  }

  onComplete({ message: fullMessage, ...metadata });
}
