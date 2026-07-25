import { createContext, useContext, useEffect, useState } from "react";
import { logoutUser, refereshSession } from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async (newToken, newUser) => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout request failed:", err.message);
    }
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const trySilentLogin = async () => {
      try {
        const data = await refereshSession();
        setToken(data.access_token);
        setUser(data.user);
      } catch {
      } finally {
        setCheckingSession(false);
      }
    };

    trySilentLogin();
  }, []);
  return (
    <AuthContext.Provider value={{ token, user, login, logout, checkingSession }}>
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
