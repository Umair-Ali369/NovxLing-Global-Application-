import React from "react";

const Input = ({ label, type, value, onChange, placeholder, error }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-[#E8EDEC]/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-[#0F1F1D] border rounded-lg px-4 py-3 text-[#E8EDEC] placeholder:text-[#E8EDEC]/30
        focus:outline-none focus:ring-2 focus:ring-[#44ACFF]/50 transition-colors
        ${error ? "border-red-500/60" : "border-white/10"}`}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
};

export default Input;
