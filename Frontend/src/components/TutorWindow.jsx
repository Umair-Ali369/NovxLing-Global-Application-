import { useState, useRef, useEffect } from "react";
import Markdown from "./Markdown";

function ThinkingBubble() {
  return (
    <div className="flex w-full justify-start">
      <div className="bg-[#0F1F1D] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#44ACFF] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="text-xs text-[#E8EDEC]/40">Tutor is thinking…</span>
      </div>
    </div>
  );
}

export default function TutorWindow({ messages, asking }) {
  const [showOriginal, setShowOriginal] = useState(new Set());
  const bottomRef = useRef(null);

  // scroll down when a message arrives OR when the thinking bubble appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, asking]);

  function toggle(id) {
    setShowOriginal((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (messages.length === 0 && !asking) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-[#E8EDEC]/30 text-sm text-center">
          Ask your first question below. Pick Simple for a beginner-friendly answer, or Deep for a technical one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 flex flex-col gap-5">
        {messages.map((msg) => {
          // YOUR question: right side
          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex w-full justify-end">
                <div
                  dir="auto"
                  className="max-w-[85%] sm:max-w-[75%] bg-[#44ACFF] text-[#091413] rounded-2xl rounded-tr-sm
                    px-4 py-2.5 text-sm whitespace-pre-wrap break-words"
                >
                  {msg.content}
                </div>
              </div>
            );
          }

          // TUTOR answer: left side, rendered as markdown
          const hasTranslation = msg.translated && msg.translated !== msg.content;
          const showingOriginal = showOriginal.has(msg.id);
          const text = showingOriginal || !hasTranslation ? msg.content : msg.translated;

          return (
            <div key={msg.id} className="flex w-full justify-start">
              <div className="max-w-[95%] sm:max-w-[85%] min-w-0">
                <div className="bg-[#0F1F1D] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[#E8EDEC]">
                  <Markdown>{text}</Markdown>
                </div>
                {hasTranslation && (
                  <button
                    onClick={() => toggle(msg.id)}
                    className="text-[11px] text-[#E8EDEC]/30 hover:text-[#E8EDEC]/60 mt-1 px-1"
                  >
                    {showingOriginal ? "Show translated" : "Show original (English)"}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {asking && <ThinkingBubble />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}