import React, { useEffect, useState } from "react";

const GREETINGS = [
  { word: "Hello", lang: "English" },
  { word: "خوش آمدید", lang: "Urdu" },
  { word: "こんにちは", lang: "Japanese" },
  { word: "مرحباً", lang: "Arabic" },
  { word: "Bonjour", lang: "French" },
];
const AuthLayout = ({ title, subtitle, children }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % GREETINGS.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#091413] flex">
      {/* Left — brand side, hidden on small screens */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 border-r border-white/10">
        <div className="text-[#E8EDEC] font-semibold text-2xl tracking-tight">
          Novx<span className="text-[#44ACFF]">Ling</span>
        </div>

        <div>
          <p
            key={index}
            className="text-6xl font-semibold text-[#E8EDEC] mb-3 transition-opacity duration-500"
          >
            {GREETINGS[index].word}
          </p>
          <p className="text-[#E8EDEC]/40 text-sm tracking-wide">
            {GREETINGS[index].lang} - one platform , every language.
          </p>
        </div>

        <p className="text-[#E8EDEC]/30 text-xs">NovxLing © 2026</p>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-[#E8EDEC] font-semibold text-lg mb-8">
            Novx<span className="text-[#44ACFF]">Ling </span>
          </div>

          <h1 className="text-2xl font-semibold text-[#E8EDEC] mb-1">
            {title}
          </h1>
          <p className="text-[#E8EDEC]/50 text-sm mb-8"> {subtitle} </p>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout
