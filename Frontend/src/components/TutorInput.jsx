import React, { useState } from "react";

const TutorInput = ({ onAsk, asking }) => {
  const [text, setText] = useState("");
  const [depth, setDepth] = useState("simple");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAsk(trimmed, depth);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-white/10 flex flex-col gap-2 shrink-0"
    >
      <div className="flex gap-1 text-xs">
        <button
          type="button"
          onClick={() => setDepth("simple")}
          className={`px-3 py-1 rounded-full ${depth === "simple" ? "bg-[#44ACFF] text-[#091413]" : "bg-[#0F1F1D] text-[#E8EDEC]/50"}`}
        >
          Simple
        </button>
        <button
          type="button"
          onClick={() => setDepth("deep")}
          className={`px-3 py-1 rounded-full ${depth === "deep" ? "bg-[#44ACFF] text-[#091413]" : "bg-[#0F1F1D] text-[#E8EDEC]/50"}`}
        >
          Deep
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 bg-[#0F1F1D] border border-white/10 rounded-lg px-4 py-2.5 text-[#E8EDEC]
            placeholder:text-[#E8EDEC]/30 focus:outline-none focus:ring-2 focus:ring-[#44ACFF]/50"
        />
        <button
          type="submit"
          disabled={asking || !text.trim()}
          className="bg-[#44ACFF] text-[#091413] font-medium rounded-lg px-5 py-2.5
            hover:bg-[#44ACFF]/90 transition-colors disabled:opacity-40"
        >
          {asking ? "..." : "Ask"}
        </button>
      </div>
    </form>
  );
};

export default TutorInput;
