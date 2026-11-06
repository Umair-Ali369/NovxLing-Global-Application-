import { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../AuthContext";
import {
  getSessions,
  createSession,
  askTutor,
  getSessionMessages,
} from "../api";
import SessionList from "../components/SessionList";
import TutorWindow from "../components/TutorWindow";
import TutorInput from "../components/TutorInput";

export const Learn = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [asking, setAsking] = useState(false);

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

  const handleNewSession = async () => {
    try {
      const session = await createSession(token, "New session");
      setSessions((prev) => [session, ...prev]);
      setActiveId(session.id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAsk = async (question, depth) => {
    try {
      await askTutor(token, activeId, question, depth);
      const data = await getSessionMessages(token, activeId);
      setMessages(data.messages);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAsking(false);
    }
  };
  return (
    <div className="h-screen bg-[#091413] flex overflow-hidden">
      <div
        className={`w-full sm:w-72 border-r border-white/10 flex-col shrink-0 min-h-0
      ${activeId ? "hidden sm:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="text-[#E8EDEC] font-semibold">
            Novx<span className="text-[#44ACFF]">Ling</span>
          </div>
          <button
            onClick={handleNewSession}
            className="text-[#44ACFF] text-xl leading-none px-2 hover:bg-white/5 rounded"
          >
            +
          </button>
        </div>
        {loading ? (
          <p className="p-4 text-sm text-[#E8EDEC]/40">Loading...</p>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            <SessionList
              sessions={sessions}
              activeId={activeId}
              onSelect={setActiveId}
            />
          </div>
        )}
      </div>
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
            </div>
            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[#E8EDEC]/30 text-sm">Loading...</p>{" "}
              </div>
            ) : (
              <TutorWindow
                messages={messages}
                currentUserLanguage={user?.language}
              />
            )}
            <TutorInput onAsk={handleAsk} asking={asking} />
          </div>
        ) : (
          <div className="flex-1 items-center justify-center hidden sm:flex">
            <p className="text-[#E8EDEC]/30">
              {" "}
              Click + to start a new learning session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
