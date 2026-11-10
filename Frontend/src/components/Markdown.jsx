import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Styles each markdown element by hand so we don't need a typography plugin.
// "ps-5" (padding-inline-start) keeps lists correct in right-to-left text too.
const components = {
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  h1: ({ children }) => <h1 className="text-lg font-semibold text-white mt-4 mb-2 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-semibold text-white mt-4 mb-2 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-white mt-3 mb-1.5 first:mt-0">{children}</h3>,
  ul: ({ children }) => <ul className="list-disc ps-5 mb-3 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ps-5 mb-3 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-s-2 border-[#44ACFF]/50 ps-3 my-3 text-[#E8EDEC]/70">{children}</blockquote>
  ),
  pre: ({ children }) => (
    <pre className="bg-[#091413] border border-white/10 rounded-lg p-3 overflow-x-auto text-xs mb-3" dir="ltr">
      {children}
    </pre>
  ),
  code: ({ className, children }) => (
    <code className={`${className || ""} font-mono text-[0.85em] bg-white/10 rounded px-1 [pre_&]:bg-transparent [pre_&]:p-0`}>
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="text-xs border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-white/10 px-2 py-1 text-start font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-white/10 px-2 py-1">{children}</td>,
};

export default function Markdown({ children }) {
  return (
    <div dir="auto" className="break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}