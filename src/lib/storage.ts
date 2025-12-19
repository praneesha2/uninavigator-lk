import { ChatMessage } from "./api";

const STORAGE_KEYS = {
  PROFILE: "uninavigator_profile",
  LAST_SEARCH: "uninavigator_last_search",
  CONVERSATIONS: "uninavigator_conversations",
  ACTIVE_CONVERSATION: "uninavigator_active_conversation",
  LANGUAGE: "uninavigator_language",
  THEME: "uninavigator_theme",
} as const;

// Profile types
export interface StudentProfile {
  z_score?: number;
  district?: string;
  district_id?: number;
  stream?: string;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LastSearch {
  z_score: number;
  district_id?: number;
  district?: string;
  year?: number;
  language?: "en" | "si" | "ta";
  timestamp: Date;
}

// Profile functions
export function getProfile(): StudentProfile | null {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
}

export function saveProfile(profile: StudentProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
}

// Last search functions
export function getLastSearch(): LastSearch | null {
  const data = localStorage.getItem(STORAGE_KEYS.LAST_SEARCH);
  if (!data) return null;
  const parsed = JSON.parse(data);
  return { ...parsed, timestamp: new Date(parsed.timestamp) };
}

export function saveLastSearch(search: Omit<LastSearch, "timestamp">): void {
  localStorage.setItem(
    STORAGE_KEYS.LAST_SEARCH,
    JSON.stringify({ ...search, timestamp: new Date().toISOString() })
  );
}

// Conversation functions
export function getConversations(): Conversation[] {
  const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  if (!data) return [];
  const parsed = JSON.parse(data);
  return parsed.map((conv: Conversation) => ({
    ...conv,
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt),
    messages: conv.messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
    })),
  }));
}

export function saveConversation(conversation: Conversation): void {
  const conversations = getConversations();
  const index = conversations.findIndex((c) => c.id === conversation.id);
  
  if (index >= 0) {
    conversations[index] = conversation;
  } else {
    conversations.unshift(conversation);
  }
  
  // Keep only last 50 conversations
  const trimmed = conversations.slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(trimmed));
}

export function deleteConversation(id: string): void {
  const conversations = getConversations().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
}

export function getActiveConversationId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
}

export function setActiveConversationId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  }
}

export function createNewConversation(): Conversation {
  const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    id,
    title: "New Conversation",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Language functions
export function getLanguage(): "en" | "si" | "ta" {
  return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as "en" | "si" | "ta") || "en";
}

export function setLanguage(language: "en" | "si" | "ta"): void {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
}

// Theme functions
export function getTheme(): "light" | "dark" {
  return (localStorage.getItem(STORAGE_KEYS.THEME) as "light" | "dark") || "light";
}

export function setTheme(theme: "light" | "dark"): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// Initialize theme on load
export function initTheme(): void {
  const theme = getTheme();
  setTheme(theme);
}
