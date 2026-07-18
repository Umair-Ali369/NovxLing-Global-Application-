import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import { loginUser } from "../api";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }
  function validate() {
    const newErrors = {};
    if (!form.email.includes("@")) newErrors.email = "Enter a valid email";
    if (!form.password) newErrors.password = "Password is required!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await loginUser(form.email, form.password);
      login(data.access_token, data.user);
      navigate("/profile");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to continue your conversations."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="you@example.com"
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange("password")}
          placeholder="At least 6 characters"
          error={errors.password}
        />

        <button
          type="submit"
          className="mt-2 bg-[#44ACFF] text-[#091413] font-medium rounded-lg py-3
            hover:bg-[#44ACFF]/90 transition-colors"
        >
          Log in
        </button>
        <p className="text-center text-sm text-[#E8EDEC]/50">
          Don't have an account?{" "}
          <a href="/register" className="text-[#44ACFF] hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
