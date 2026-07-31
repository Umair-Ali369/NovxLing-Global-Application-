import { createContext, useContext, useState } from "react";
import { logoutUser } from "./api";

const AuthContext = createContext(null);


function loadStoredUser() {
  try {
    const raw = localStorage.getItem("novxling_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("novxling_token"));
  const [user, setUser] = useState(loadStoredUser);

  const login = (newToken, newUser) => {
    localStorage.setItem("novxling_token", newToken);
    localStorage.setItem("novxling_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await logoutUser(); // tells the backend to clear the refresh cookie, if it still exists
    } catch (err) {
      console.error("Logout request failed:", err.message);
    }
    localStorage.removeItem("novxling_token");
    localStorage.removeItem("novxling_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
