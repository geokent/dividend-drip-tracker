import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, X, Send, Bot, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dividend-coach`;

const QUICK_ACTIONS_WITH_PORTFOLIO = [
  { label: "🎯 FIRE Timeline", question: "Based on my current portfolio, when can I reach financial independence? Calculate my FIRE timeline." },
  { label: "📊 Portfolio Analysis", question: "Analyze my dividend portfolio. What are the strengths and weaknesses? How diversified am I?" },
  { label: "💡 Get Recommendations", question: "Based on my current holdings, what dividend stocks should I consider adding to improve my portfolio?" },
  { label: "🛡️ Safety Check", question: "How safe are my dividend holdings? Are any of my stocks at risk of cutting their dividend?" },
];

const QUICK_ACTIONS_WITHOUT_PORTFOLIO = [
  { label: "🔢 FIRE Number", question: "How do I calculate my FIRE number? What factors should I consider?" },
  { label: "⚖️ SCHD vs JEPI", question: "What's the difference between SCHD and JEPI? Which is better for dividend investors?" },
  { label: "📈 Growth vs Yield", question: "Should I focus on dividend growth stocks or high-yield stocks? What are the tradeoffs?" },
  { label: "🏖️ Retire at 55", question: "How much do I need invested in dividend stocks to retire at 55?" },
];

export const DividendCoach = () => {
  const { user, session } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState(5);
  const [portfolioSummary, setPortfolioSummary] = useState<{ count: number; avgYield: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch usage + portfolio on mount
  useEffect(() => {
    if (!user) return;

    const fetchUsage = async () => {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("ai_coach_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString());
      setRemainingQuestions(5 - (count ?? 0));
    };

    const fetchPortfolio = async () => {
      const { data } = await supabase
        .from("user_stocks")
        .select("dividend_yield")
        .eq("user_id", user.id);
      if (data && data.length > 0) {
        const avg = data.reduce((s, r) => s + (r.dividend_yield || 0), 0) / data.length;
        setPortfolioSummary({ count: data.length, avgYield: parseFloat(avg.toFixed(2)) });
      }
    };

    fetchUsage();
    fetchPortfolio();
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || remainingQuestions <= 0 || !session) return;

    setError(null);
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Unknown error" }));
        if (errData.error === "limit_reached") {
          setRemainingQuestions(0);
          setError("You've used all 5 free questions today. Come back tomorrow!");
        } else if (resp.status === 429) {
          setError("Rate limited — please try again in a moment.");
        } else if (resp.status === 401) {
          setError("Session expired. Please sign in again.");
        } else {
          setError(errData.error || "Something went wrong.");
        }
        setIsLoading(false);
        return;
      }

      // Update remaining from header
      const remainHeader = resp.headers.get("X-Remaining-Questions");
      if (remainHeader !== null) {
        setRemainingQuestions(parseInt(remainHeader, 10));
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
                }
                return [...prev, { role: "assistant", content: snapshot }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
                }
                return [...prev, { role: "assistant", content: snapshot }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error("DividendCoach error:", e);
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, remainingQuestions, session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!user) return null;

  const quickActions = portfolioSummary && portfolioSummary.count > 0
    ? QUICK_ACTIONS_WITH_PORTFOLIO
    : QUICK_ACTIONS_WITHOUT_PORTFOLIO;

  const limitReached = remainingQuestions <= 0;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-all animate-pulse hover:animate-none"
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium text-sm">AI Coach</span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className={cn(
          "fixed z-50 flex flex-col bg-card border border-border rounded-xl shadow-2xl",
          isMobile
            ? "inset-2"
            : "bottom-6 right-6 w-[400px] h-[520px]"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">DividendCoach</span>
              {portfolioSummary && portfolioSummary.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {portfolioSummary.count} stocks · {portfolioSummary.avgYield}% avg
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={limitReached ? "destructive" : "outline"} className="text-xs">
                {remainingQuestions}/5
              </Badge>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">
                      👋 Hey! I'm your <strong>DividendCoach</strong> — here to help you build passive income and plan your path to financial independence.
                    </p>
                    {portfolioSummary && portfolioSummary.count > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        I can see your portfolio with <strong>{portfolioSummary.count} holdings</strong> averaging <strong>{portfolioSummary.avgYield}% yield</strong>. Ask me anything about your investments!
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        You haven't added any stocks yet. I can still help you learn about dividend investing and plan your strategy!
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {remainingQuestions}/5 free questions today
                    </p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.question)}
                      disabled={isLoading || limitReached}
                      className="text-left text-xs p-2.5 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3 mb-4", msg.role === "user" && "flex-row-reverse")}>
                <div className={cn(
                  "flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center",
                  msg.role === "assistant" ? "bg-primary/10" : "bg-secondary"
                )}>
                  {msg.role === "assistant" ? (
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-secondary-foreground" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  msg.role === "assistant"
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-xs text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
                {error}
              </div>
            )}
          </ScrollArea>

          {/* Input area */}
          <div className="p-3 border-t border-border">
            {limitReached ? (
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground text-xs">Daily limit reached</span>
                <Button size="sm" variant="default" asChild>
                  <a href="/pricing" className="flex items-center gap-1">
                    Upgrade <ArrowRight className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about dividends, FIRE, your portfolio..."
                  disabled={isLoading}
                  className="flex-1 text-sm bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
