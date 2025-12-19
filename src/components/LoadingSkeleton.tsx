import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <Skeleton className="h-12 w-12 rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  );
}

export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
        <Skeleton className={`h-16 w-64 ${isUser ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"}`} />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 p-4">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
