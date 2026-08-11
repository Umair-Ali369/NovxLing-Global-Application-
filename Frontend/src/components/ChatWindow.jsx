import React, { useEffect, useRef, useState } from "react";

const ChatWindow = ({ messages = [], currentUid }) => {
  const [showOriginalText, setShowOriginalText] = useState(new Set());
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavious : "smooth"})
  },[messages])

  const toggle = (id) => {
    setShowOriginalText((prev) => {
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
    <div className="flex flex-col gap-2 py-1 overflow-y-auto h-full">
      {messages.map((msg) => {
        const isMe = msg.sender_id == currentUid;
        const isShowText = showOriginalText.has(msg.id);
        const showText = isShowText ? msg.content : msg.translated;

        return (
          <div
            key={msg.id}
            className={`flex flex-col py-2 px-5 ${isMe ? "self-end items-end" : "self-start items-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm 
                ${
                  isMe
                    ? "bg-[#44ACFF] text-[#091413] font-semibold"
                    : "bg-[#0F1F1D] text-[#E8EDEC] font-semibold border border-white/10"
                }`}
            >
              {showText}
            </div>
            <button
              onClick={() => toggle(msg.id)}
              className="text-[10px] text-[#E8EDEC]/30 hover:text-[#E8EDEC]/60 mt-1 px-1"
            >
              {isShowText ? "Show Translated" : "Show Original"}
            </button>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
