import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../AuthContext";
import { getSessions, createSession, askTutor, getSessionMessages } from "../api";
import SessionList from "../components/SessionList";
import TutorWindow from "../components/TutorWindow";
import TutorInput from "../components/TutorInput";

const Learn = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  // id of the session currently waiting on the tutor (null = nothing in flight)
  const [askingId, setAskingId] = useState(null);
  const activeIdRef = useRef(null);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    getSessions(token)
      .then((data) => setSessions(data.sessions))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  useEffect(() => {
    if (!activeId || !token) return;
    setMessagesLoading(true);
    getSessionMessages(token, activeId)
      .then((data) => setMessages(data.messages))
      .catch((err) => toast.error(err.message))
      .finally(() => setMessagesLoading(false));
  }, [activeId, token]);

  async function handleNewSession() {
    try {
      const session = await createSession(token, "New session");
      setSessions((prev) => [session, ...prev]);
      setMessages([]);
      setActiveId(session.id);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleAsk(question, depth) {
    const sessionId = activeId;

    // show the question immediately instead of waiting for the whole round trip
    setMessages((prev) => [...prev, { id: `temp-${Date.now()}`, role: "user", content: question }]);
    setAskingId(sessionId);

    try {
      await askTutor(token, sessionId, question, depth);
    } catch (err) {
      toast.error(err.message);
    }

    // reload from the server either way: replaces the temp message, and
    // refreshes the sidebar so the session picks up its new title
    try {
      const [msgData, sessData] = await Promise.all([
        getSessionMessages(token, sessionId),
        getSessions(token),
      ]);
      if (activeIdRef.current === sessionId) setMessages(msgData.messages);
      setSessions(sessData.sessions);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAskingId(null);
    }
  }

  const activeSession = sessions.find((s) => s.id === activeId);

  return (
    <div className="h-screen bg-[#091413] flex overflow-hidden">
      {/* Sidebar: full width on mobile until a session is open */}
      <div
        className={`w-full sm:w-72 border-r border-white/10 flex-col shrink-0 min-h-0
          ${activeId ? "hidden sm:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <button
            onClick={() => navigate("/profile")}
            title="Back to home"
            className="text-[#E8EDEC] font-semibold hover:opacity-80"
          >
            Novx<span className="text-[#44ACFF]">Ling</span>
          </button>
          <button
            onClick={handleNewSession}
            className="text-[#44ACFF] text-sm font-medium px-3 py-1 rounded-lg hover:bg-white/5"
          >
            + New
          </button>
        </div>

        {loading ? (
          <p className="p-4 text-sm text-[#E8EDEC]/40">Loading…</p>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            <SessionList sessions={sessions} activeId={activeId} onSelect={setActiveId} />
          </div>
        )}
      </div>

      {/* Main area */}
      <div className={`flex-1 flex-col min-h-0 min-w-0 ${activeId ? "flex" : "hidden sm:flex"}`}>
        {activeId ? (
          <>
            <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10 shrink-0">
              <button
                onClick={() => setActiveId(null)}
                className="sm:hidden text-[#44ACFF] text-sm px-2 py-1"
              >
                ← Back
              </button>
              <span dir="auto" className="text-[#E8EDEC] text-sm font-medium truncate">
                {activeSession?.title}
              </span>
            </div>

            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[#E8EDEC]/30 text-sm">Loading…</p>
              </div>
            ) : (
              <TutorWindow messages={messages} asking={askingId === activeId} />
            )}

            <TutorInput onAsk={handleAsk} asking={askingId !== null} />
          </>
        ) : (
          <div className="flex-1 items-center justify-center hidden sm:flex">
            <p className="text-[#E8EDEC]/30">Click “+ New” to start a learning session.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Learn