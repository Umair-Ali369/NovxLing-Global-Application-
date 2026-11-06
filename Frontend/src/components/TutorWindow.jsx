import { useEffect, useRef, useState } from "react";

const TutorWindow = ({ messages, currentUserLanguage }) => {
  const [toggledAway, setToggledAway] = useState(new Set());
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function toggle(id) {
    setToggledAway((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#E8EDEC]/30 text-sm">
          Ask your first question below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col gap-3">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        // user's own question
        if (isUser) {
          return (
            <div key={msg.id} className="self-end max-w-[85%] sm:max-w-[70%]">
              <div className="bg-[#44ACFF] text-[#091413] rounded-2xl px-4 py-2.5 text-sm">
                {msg.content}
              </div>
            </div>
          );
        }
        // tutor answer - default to translated and toggle
        const isToggled = toggledAway.has(msg.id);
        const showText = isToggled
          ? msg.content
          : msg.translated || msg.content;

        return (
          <div key={msg.id} className="self-end max-w-[85%] sm:max-w-[70%]">
            <div className="bg-[#44ACFF] text-[#091413] rounded-2xl px-4 py-2.5 text-sm">
              {showText}
            </div>
            <button
              onClick={() => toggle(msg.id)}
              className="text-[10px] text-[#E8EDEC]/30 hover:text-[#E8EDEC]/60 mt-1 px-1"
            >
              {isToggled ? "Show Translated" : "Show Original (English)"}
            </button>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
export default TutorWindow;
