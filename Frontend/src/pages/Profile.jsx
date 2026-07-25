import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api";
import { useAuth } from "../AuthContext";

const Profile = () => {
  const { token, logout, checkingSession } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (checkingSession) return;

    if (!token) {
      navigate("/login");
      return;
    }
    getProfile(token)
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, [token, navigate, checkingSession]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#091413] flex items-center justify-center">
        <p className="text-[#E8EDEC]/50">Checking session...</p>
      </div>
    );
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
    <div className="min-h-screen bg-[#091413] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm bg-[#0F1F1D] border border-white/10 rounded-xl p-6 sm:p-8">
        <div className="text-[#E8EDEC] font-semibold text-lg mb-6">
          Novx<span className="text-[#44ACFF]">Ling</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#E8EDEC] mb-1">
          Welcome, {profile?.name}
        </h1>
        <p className="text-[#E8EDEC]/50 text-sm mb-6">You're Logged in</p>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#E8EDEC]/50"> Email </span>
            <span className="text-[#E8EDEC]"> {profile.email} </span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#E8EDEC]/50"> Language </span>
            <span className="text-[#E8EDEC]"> {profile.language} </span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#E8EDEC]/50"> Premium </span>
            <span className="text-[#E8EDEC]">
              {" "}
              {profile.is_premium ? "Yes" : "No"}{" "}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-white/5 text-[#E8EDEC] rounded-lg py-3 hover:bg-white/10 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default Profile;
