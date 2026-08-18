import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { searchUsers, createConversations } from "../api";

const NewChat = ({ token, onClose, onCreated }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      const data = await searchUsers(token, query);
      setResults(data.Users);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handlePick = async (userId) => {
    try {
      const data = await createConversations(token, userId);
      onCreated(data.id);
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0F1F1D] border border-white/10 rounded-xl w-full max-w-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#E8EDEC] font-semibold"> New Conversation </h2>
          <button
            onClick={onClose}
            className="text-[#E8EDEC]/50 hover:text-[#E8EDEC]"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="flex-1 bg-[#091413] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E8EDEC]
            placeholder:text-[#E8EDEC]/30 focus:outline-none focus:ring-2 focus:ring-[#44ACFF]/50"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-[#44ACFF] text-[#091413] text-sm font-medium rounded-lg px-4 disabled:opacity-50"
          >
            Search
          </button>
        </form>

        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-[#E8EDEC]/30 text-sm text-center py-4">
              {" "}
              Search for someone to start chatting.
            </p>
          ) : (
            results.map((u) => (
              <button
                key={u.id}
                onClick={() => handlePick(u.id)}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 text-[#E8EDEC] text-sm"
              >
                {u.name}{" "}
                <span className="text-[#E8EDEC]/30 text-xs">
                  {" "}
                  {u.language}{" "}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChat;
