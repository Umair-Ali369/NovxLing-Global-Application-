import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getConversations } from "../api";
import { useAuth } from "../AuthContext";
import { toast } from "react-hot-toast"

/**
 * FEATURES
 * --------
 * The list of NovxLing phases that actually exist right now.
 * Adding a new phase later (Learn, once Month 3 ships) means adding
 * ONE object here - the page layout doesn't need to change at all.
 */
const FEATURES = [
  {
    key: "chat",
    label: "Chat",
    description: "Talk to anyone, in any language.",
    icon: "💬",
    path: "/chat",
  },
  // Once Month 3's Learn feature ships, add:
  {
    key: "learn",
    label: "Learn",
    description: "Ask a patient tutor anything, in your language.",
    icon: "📚",
    path: "/learn",
  },
];

const Profile = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [Loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    getProfile(token)
      .then(setProfile)
      .catch((err) => {
        toast.error(err.message);
        logout();
        navigate("/login");
      });
  }, [token, navigate]);

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

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#091413] flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#091413] flex items-center justify-center">
        <p className="text-[#E8EDEC]/50">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#091413] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-[#E8EDEC] font-semibold text-lg">
            Novx<span className="text-[#44ACFF]">Ling</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-[#E8EDEC]/50 hover:text-[#E8EDEC] transition-colors"
          >
            Log out
          </button>
        </div>

        {/* Account card */}
        <div className="bg-[#0F1F1D] border border-white/10 rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-semibold text-[#E8EDEC] mb-1">
            Welcome, {profile.name}
          </h1>
          <p className="text-[#E8EDEC]/50 text-sm mb-6">You're logged in.</p>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-[#E8EDEC]/50">Email</span>
              <span className="text-[#E8EDEC]">{profile.email}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-[#E8EDEC]/50">Language</span>
              <span className="text-[#E8EDEC]">{profile.language}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-[#E8EDEC]/50">Premium</span>
              <span className="text-[#E8EDEC]">{profile.is_premium ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-[#E8EDEC]/50">Conversatinos</span>
              <span className="text-[#E8EDEC]">{conversations.length}</span>
            </div>
          </div>
        </div>

        {/* Feature launcher */}
        <h2 className="text-[#E8EDEC]/70 text-sm font-medium mb-3 px-1">
          What would you like to do?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map((feature) => (
            <button
              key={feature.key}
              onClick={() => navigate(feature.path)}
              className="bg-[#0F1F1D] border border-white/10 rounded-xl p-5 text-left
                hover:border-[#44ACFF]/50 hover:bg-[#132824] transition-colors"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="text-[#E8EDEC] font-medium mb-1">{feature.label}</div>
              <div className="text-[#E8EDEC]/40 text-xs">{feature.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
