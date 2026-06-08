"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Wajib di-import agar CSS matematika berjalan

export default function LatexRenderer({ content }: { content: string }) {
  // Kita membungkus content dengan $$ agar dianggap sebagai block matematika oleh KaTeX
  const latexContent = `$$${content}$$`;

  return (
    <div className="overflow-x-auto">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {latexContent}
      </ReactMarkdown>
    </div>
  );
}
