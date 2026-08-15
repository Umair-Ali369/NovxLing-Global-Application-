import React, { useState } from "react";

const MessageInput = ({ onSend, sending }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-white/10 flex gap-2 shrink-0">
      <input
        value={text}
        type="text"
        onChange={(e) => setText(e.target.value)}
        placeholder="Type  a message"
        className="flex-1 bg-[#0F1F1D] border border-white/10 rounded-lg px-4 py-2.5 text-[#E8EDEC]
        placeholder:text-[#E8EDEC]/30 focus:outline-none focus:ring-2 focus:ring-[#44ACFF]/50"
      />
      <button
        type="submit"
        disabled={sending || !text.trim()}
        className="bg-[#013d6e] text-[#ffffff] font-medium rounded-lg px-5 py-2.5
          hover:bg-[#44ACFF]/90 transition-colors disabled:opacity-90"
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </form>
  );
};

export default MessageInput;
