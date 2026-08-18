import React, { act } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../AuthContext";
import { getConversations, getMessages, sendMessage } from "../api";
import ConversationLIst from "../components/ConversationLIst";
import { useState } from "react";
import { useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import NewChat from "../components/NewChat";
import { jsx } from "react/jsx-runtime";

const Chat = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(Number);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newChat, setNewChat] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    getConversations(token)
      .then((data) => setConversations(data.Conversations))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  useEffect(() => {
    if (!token || !activeId) return;

    getMessages(token, activeId)
      .then((data) => setMessages(data.messages))
      .catch((err) => toast.error(err.message));
  }, [token, activeId]);

  const handleContent = async (content) => {
    setLoading(true);
    try {
      await sendMessage(token, activeId, content);
      const data = await getMessages(token, activeId);
      setMessages(data.messages);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#091413] flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`w-full sm:w-72 border-r border-white/10 flex-col shrink-0 min-h-0
          ${activeId ? "hidden sm:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="text-[#E8EDEC] font-semibold">
            Novx<span className="text-[#44ACFF]">Ling</span>
          </div>
          <button
            onClick={() => setNewChat(true)}
            className="text-[#44ACFF] text-xl leading-none p-2 hover:bg-white/5 rounded"
          >
            +
          </button>
        </div>
        {loading ? (
          <p className="p-4 text-sm text-[#E8EDEC]/40">Loading... </p>
        ) : (
          <ConversationLIst
            conversations={conversations}
            activeId={activeId}
            onSelect={setActiveId}
          />
        )}
      </div>

      {/* Main Area */}
      <div
        className={`flex-1 flex-col min-h-0 ${activeId ? "flex" : "hidden sm:flex"}`}
      >
        {activeId ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="sm:hidden flex items-center gap-2 p-3 border-b border-white/10 shrink-0">
              <button
                onClick={() => setActiveId(null)}
                className="text-[#44ACFF] text-sm px-2 py-1"
              >
                ← Back
              </button>
              <span className="text-[#E8EDEC] text-sm font-medium">
                {conversations?.with_User?.name}
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[#E8EDEC]/30 text-sm">Loading messages...</p>
              </div>
            ) : (
              <ChatWindow messages={messages} currentUid={user?.id} />
            )}
            <MessageInput onSend={handleContent} sending={loading} />
          </div>
        ) : (
          <div className="flex-1 items-center justify-center hidden sm:flex">
            <p className="text-[#E8EDEC]/30">
              Select a conversation to start chatting.
            </p>
          </div>
        )}
      </div>

      {newChat && (
        <NewChat
          token={token}
          onClose={() => setNewChat(false)}
          onCreated={(newId) => {
            setActiveId(newId);
            getConversations(token).then((data) =>
              setConversations(data.Conversations),
            );
          }}
        />
      )}
    </div>
  );
};

export default Chat;
