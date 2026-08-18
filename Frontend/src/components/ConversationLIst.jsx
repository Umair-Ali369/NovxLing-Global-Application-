import React from "react";

const ConversationLIst = ({ conversations, activeId, onSelect }) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-sm text-[#E8EDEC]/40">No conversations yet.</div>
    );
  }
  return (
    <div>
      {conversations.map((conv) => (
        <button
        key={conv.id}
        onClick={() => onSelect(conv.id)}
        className={`text-left px-4 py-3 w-full border-b border-white/5 transition-colors
          ${activeId === conv.id ? "bg-[#132824]" : "hover:bg-[#0F1F1D]"}`}
      >
          <p className="text-[#E8EDEC] font-medium text-sm">
            {conv.with_User?.name || "Unknown User"}
          </p>
          <p className="text-[#E8EDEC]/40 text-xs mt-0.5">
            Conversation - {conv.id}
          </p>
        </button>
      ))}
    </div>
  );
};

export default ConversationLIst;
