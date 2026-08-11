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

const Chat = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(Number);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

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
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
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
    <div className="min-h-screen bg-[#091413] flex">
      {/* Sidebar */}
      <div className="w-72 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="text-[#E8EDEC] font-semibold">
            Novx<span className="text-[#44ACFF]">Ling</span>
          </div>
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
      <div className="flex-1 flex items-center justify-center">
        {activeId ? (
          <div className="flex-1 flex flex-col">
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
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#E8EDEC]/30">
              Select a conversation to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
