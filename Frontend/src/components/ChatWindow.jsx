import React, { useState, useRef, useEffect } from "react";

const ChatWindow = ({ messages = [], currentUid }) => {
  // Tracks which messages have been manually toggled AWAY from their
  // smart default. Each message's smart default is:
  //   - my own message  -> show my original text (I already know what I typed)
  //   - their message    -> show the translated version (translated for ME)
  const [toggledAway, setToggledAway] = useState(new Set());
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggle = (id) => {
    setToggledAway((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#E8EDEC]/30 text-sm">No Messages Yet - Say Hello</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col gap-1">
      {messages.map((msg) => {
        const isMe = msg.sender_id == currentUid;
        const isToggled = toggledAway.has(msg.id);

        // Smart default: my messages show ORIGINAL, their messages show TRANSLATED.
        // Toggling flips away from that default, whichever direction that means
        // for this particular bubble.
        const showingOriginal = isMe ? !isToggled : isToggled;
        const showText = showingOriginal ? msg.content : msg.translated;

        return (
          <div
            key={msg.id}
            className={`flex flex-col max-w-full px-4 py-2 ${isMe ? "self-end items-end" : "self-start items-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-2 text-sm
              ${
                isMe
                  ? "bg-[#44ACFF] text-[#091413]"
                  : "bg-[#0F1F1D] text-[#E8EDEC] border border-white/10"
              }`}
            >
              {showText}
            </div>
            <button
              onClick={() => toggle(msg.id)}
              className="text-[10px] text-[#E8EDEC]/30 hover:text-[#E8EDEC]/60 mt-1 px-1"
            >
              {showingOriginal ? "Show Translated" : "Show Original"}
            </button>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
