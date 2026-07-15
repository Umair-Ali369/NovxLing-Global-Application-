import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  function handleChange(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }
  function validate() {
    const newErrors = {};
    if (!form.email.includes("@")) newErrors.email = "Enter a valid email";
    if (form.password) newErrors.password = "Password is required!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    // Week 3 replaces this block with a real fetch() call to /register
    console.log("Login form ready to send:", form);
    alert("Form valid! (Backend connection comes in Week 3)");
  }

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
