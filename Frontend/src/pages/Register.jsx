import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { registerUser } from "../api";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur", label: "Urdu" },
  { code: "ja", label: "Japanese" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
];

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    language: "en",
    age: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.includes("@")) newErrors.email = "Enter a valid email";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.age && (isNaN(form.age) || Number(form.age) < 1))
      newErrors.age = "Enter a valid age";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser(form);
      navigate("/login");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join NovxLing and talk to anyone, in any language."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          value={form.name}
          onChange={handleChange("name")}
          placeholder="Umair Khan"
          error={errors.name}
        />
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
        <Input
          label="Age (optional)"
          type="number"
          value={form.age}
          onChange={handleChange("age")}
          placeholder="19"
          error={errors.age}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-[#E8EDEC]/70">
            Preferred language
          </label>
          <select
            value={form.language}
            onChange={handleChange("language")}
            className="bg-[#0F1F1D] border border-white/10 rounded-lg px-4 py-3 text-[#E8EDEC]
              focus:outline-none focus:ring-2 focus:ring-[#44ACFF]/50"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="mt-2 bg-[#44ACFF] text-[#091413] font-medium rounded-lg py-3
            hover:bg-[#44ACFF]/90 transition-colors"
        >
          Create account
        </button>

        <p className="text-center text-sm text-[#E8EDEC]/50">
          Already have an account?{" "}
          <a href="/login" className="text-[#44ACFF] hover:underline">
            Log in
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
