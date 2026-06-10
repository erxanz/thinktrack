"use client";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function LatexRenderer({ content }: { content: string }) {
  // Teknik agresif untuk mengubah format matematika AI ke format Markdown ($)
  let processedContent = content;

  // 1. Tangani jika AI mengirim Double Backslash (\\)
  processedContent = processedContent.split("\\\\(").join("$");
  processedContent = processedContent.split("\\\\)").join("$");
  processedContent = processedContent.split("\\\\[").join("$$");
  processedContent = processedContent.split("\\\\]").join("$$");

  // 2. Tangani jika AI mengirim Single Backslash (\) biasa
  processedContent = processedContent.split("\\(").join("$");
  processedContent = processedContent.split("\\)").join("$");
  processedContent = processedContent.split("\\[").join("$$");
  processedContent = processedContent.split("\\]").join("$$");

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
