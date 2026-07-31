import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      \<Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0F1F1D",
              color: "#E8EDEC",
              border: "1px solid #1E332F",
            },
            success: { iconTheme: { primary: "#44ACFF", secondary: "#0F1F1D" } },
            error: { iconTheme: { primary: "#F2745B", secondary: "#0F1F1D" } },
          }}
        />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />}/>
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
