import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, Send, MessageCircle, Trash2, ChevronDown, Sparkles, Database, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { sendChatMessage, ChatMessage, ChatResponse } from "@/lib/api";
import {
  getConversations,
  saveConversation,
  deleteConversation,
  getActiveConversationId,
  setActiveConversationId,
  createNewConversation,
  Conversation,
  getProfile,
} from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { TypingIndicator } from "@/components/LoadingSkeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function Chat() {
  const { t, language } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const profile = getProfile();

  // Load conversations on mount
  useEffect(() => {
    const savedConversations = getConversations();
    setConversations(savedConversations);

    const activeId = getActiveConversationId();
    if (activeId) {
      const active = savedConversations.find((c) => c.id === activeId);
      if (active) {
        setActiveConversation(active);
      }
    }

    if (!activeId || !savedConversations.find((c) => c.id === activeId)) {
      handleNewChat();
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data: ChatResponse) => {
      if (!activeConversation) return;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
        route: data.route,
        sources: data.sources,
        timestamp: new Date(),
      };

      const updatedConversation = {
        ...activeConversation,
        messages: [...activeConversation.messages, assistantMessage],
        updatedAt: new Date(),
        title: activeConversation.messages.length === 1
          ? activeConversation.messages[0].content.slice(0, 30) + "..."
          : activeConversation.title,
      };

      setActiveConversation(updatedConversation);
      saveConversation(updatedConversation);
      setConversations(getConversations());
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleNewChat = () => {
    const newConversation = createNewConversation();
    setActiveConversation(newConversation);
    setActiveConversationId(newConversation.id);
    saveConversation(newConversation);
    setConversations(getConversations());
    inputRef.current?.focus();
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setActiveConversationId(conversation.id);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id);
    setConversations(getConversations());

    if (activeConversation?.id === id) {
      handleNewChat();
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !activeConversation || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage],
      updatedAt: new Date(),
    };

    setActiveConversation(updatedConversation);
    saveConversation(updatedConversation);
    setInputValue("");

    chatMutation.mutate({
      message: inputValue.trim(),
      language,
      z_score: profile?.z_score,
      district: profile?.district,
      district_id: profile?.district_id,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const suggestedPrompts = [
    t("chat.prompt1"),
    t("chat.prompt2"),
    t("chat.prompt3"),
  ];

  return (
    <div className="flex h-screen pt-16">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } transition-all duration-300 overflow-hidden border-r bg-sidebar flex flex-col`}
      >
        <div className="p-4 border-b">
          <Button onClick={handleNewChat} className="w-full rounded-xl gap-2">
            <Plus className="h-4 w-4" />
            {t("chat.newChat")}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  activeConversation?.id === conversation.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-sidebar-accent"
                }`}
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-sm">{conversation.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ${
                    activeConversation?.id === conversation.id
                      ? "hover:bg-primary-foreground/20"
                      : "hover:bg-destructive/10 hover:text-destructive"
                  }`}
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {profile && (profile.z_score || profile.district) && (
          <div className="p-4 border-t bg-sidebar-accent/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">Your Profile</p>
            <div className="space-y-1 text-sm">
              {profile.z_score && (
                <p>Z-Score: <span className="font-medium">{profile.z_score}</span></p>
              )}
              {profile.district && (
                <p>District: <span className="font-medium">{profile.district}</span></p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="h-14 border-b flex items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">{t("chat.title")}</h1>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
            {activeConversation?.messages.length === 0 && (
              <div className="text-center py-16 space-y-6 animate-fade-in">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Welcome to Career Guide</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ask me anything about universities, courses, careers, or scholarship opportunities in Sri Lanka.
                  </p>
                </div>

                {/* Suggested prompts */}
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-3">{t("chat.suggestedPrompts")}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedPrompts.map((prompt, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="rounded-full text-sm h-auto py-2 px-4"
                        onClick={() => handleSuggestedPrompt(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeConversation?.messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={
                      message.role === "user"
                        ? "chat-bubble-user"
                        : "chat-bubble-assistant"
                    }
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>

                  <div className={`flex items-center gap-2 ${message.role === "user" ? "justify-end" : ""}`}>
                    {message.route && (
                      <Badge variant="outline" className="text-xs rounded-full gap-1">
                        {message.route === "sql" ? (
                          <Database className="h-3 w-3" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                        {message.route === "sql" ? "Data Query" : "Knowledge Base"}
                      </Badge>
                    )}
                    {message.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 rounded-full">
                          <ChevronDown className="h-3 w-3" />
                          {t("chat.sources")} ({message.sources.length})
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 p-3 rounded-xl bg-secondary/50 space-y-1">
                          {message.sources.map((source, sidx) => (
                            <p key={sidx} className="text-xs text-muted-foreground">{source}</p>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start animate-fade-in">
                <div className="chat-bubble-assistant">
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4 bg-background">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("chat.placeholder")}
                  className="h-12 pr-12 rounded-2xl"
                  disabled={chatMutation.isPending}
                />
                <Button
                  size="icon"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || chatMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Press Enter to send • AI-powered responses may not always be accurate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
