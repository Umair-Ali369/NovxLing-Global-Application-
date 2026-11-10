export default function SessionList({ sessions, activeId, onSelect }) {
  if (sessions.length === 0) {
    return (
      <div className="p-4 text-sm text-[#E8EDEC]/40">
        No sessions yet. Click <span className="text-[#44ACFF]">+ New</span> to start.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {sessions.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`block w-full text-left px-4 py-3 border-b border-white/5 transition-colors
            ${activeId === s.id ? "bg-[#132824]" : "hover:bg-[#0F1F1D]"}`}
        >
          <p dir="auto" className="text-[#E8EDEC] font-medium text-sm truncate">{s.title}</p>
          <p className="text-[#E8EDEC]/40 text-xs mt-0.5">
            {new Date(s.created_at).toLocaleDateString()}
          </p>
        </button>
      ))}
    </div>
  );
}