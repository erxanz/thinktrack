/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { FiCheck, FiCopy, FiLink, FiImage, FiVideo } from "react-icons/fi";
import { toast } from "react-hot-toast";
import React from "react";

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url);
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

function getYoutubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.searchParams.get("v")
    ) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }

    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    return null;
  } catch {
    return null;
  }
}

function CodeBlock({ inline, className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children).replace(/\n$/, "");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setIsCopied(true);
      toast.success("Kode berhasil disalin!");
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin kode");
    }
  };

  if (!inline && match) {
    return (
      <div className="group my-6 overflow-hidden rounded-xl border border-white/5 bg-[#0E0E0E] shadow-2xl font-sans">
        {/* HEADER (Mac + VS Code Style) */}
        <div className="flex items-center justify-between border-b border-white/5 bg-[#141414] px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 opacity-80">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 shadow-sm" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 shadow-sm" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80 shadow-sm" />
            </div>

            <span className="ml-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              {match[1]}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200">
            {isCopied ? (
              <>
                <FiCheck className="text-emerald-400" size={13} />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <FiCopy size={13} />
                Copy
              </>
            )}
          </button>
        </div>

        {/* CODE EDITOR AREA */}
        <SyntaxHighlighter
          {...props}
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "1.25rem",
            background: "transparent",
            fontSize: "13px",
            lineHeight: "1.6",
          }}>
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code
      className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[0.88em] text-sky-300"
      {...props}>
      {children}
    </code>
  );
}

export default function MarkdownPreview({
  content,
  className = "",
}: MarkdownPreviewProps) {
  const source = content.trim() || "_Catatan ini belum memiliki isi._";

  return (
    <div className={`markdown-preview w-full font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 mt-10 border-b border-white/5 pb-4 text-3xl font-bold tracking-tight text-zinc-100 first:mt-0">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-4 mt-8 text-2xl font-semibold tracking-tight text-zinc-200">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-3 mt-6 text-xl font-medium text-zinc-200">
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4 className="mb-2 mt-5 text-lg font-medium text-zinc-300">
              {children}
            </h4>
          ),

          p: ({ children }) => {
            // Cari tahu apakah di dalam paragraf ini ada komponen block (seperti gambar/video preview)
            const hasBlockElement = React.Children.toArray(children).some(
              (child: any) => child?.props?.href || child?.type === "div",
            );

            // Jika ada komponen block, gunakan <div> agar React tidak warning
            if (hasBlockElement) {
              return (
                <div className="mb-5 text-[15px] leading-relaxed text-zinc-300 last:mb-0">
                  {children}
                </div>
              );
            }

            // Jika teks biasa atau teks di dalam bullet point, gunakan <p> agar sejajar sempurna
            return (
              <p className="mb-5 text-[15px] leading-relaxed text-zinc-300 last:mb-0">
                {children}
              </p>
            );
          },

          blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-r-xl border-l-4 border-blue-500/50 bg-white/2 px-5 py-4 text-[15px] text-zinc-400">
              <div className="leading-relaxed">{children}</div>
            </blockquote>
          ),

          ul: ({ children }) => (
            <ul className="mb-5 list-disc space-y-2 pl-7 text-[15px] leading-relaxed text-zinc-300 marker:text-zinc-500">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-5 list-decimal space-y-2 pl-7 text-[15px] leading-relaxed text-zinc-300 marker:text-zinc-500">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="pl-1 [&>p]:inline">{children}</li>
          ),

          a: ({ children, href }) => {
            const url = href || "";

            // IMAGE PREVIEW
            if (isImageUrl(url)) {
              return (
                <div className="my-6 overflow-hidden rounded-xl border border-white/5 bg-[#0E0E0E] shadow-lg">
                  <div className="flex items-center gap-2 border-b border-white/5 bg-[#141414] px-4 py-2.5 text-[12px] font-medium text-zinc-400">
                    <FiImage size={14} />
                    Image Preview
                  </div>

                  <img
                    src={url}
                    alt={String(children)}
                    className="max-h-125 w-full object-contain bg-black/50"
                  />

                  <div className="border-t border-white/5 px-4 py-3 bg-[#141414]">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-400 transition-colors hover:text-blue-300">
                      <FiLink size={13} />
                      Buka gambar
                    </a>
                  </div>
                </div>
              );
            }

            // YOUTUBE PREVIEW
            const youtubeEmbed = getYoutubeEmbedUrl(url);

            if (youtubeEmbed) {
              return (
                <div className="my-6 overflow-hidden rounded-xl border border-white/5 bg-[#0E0E0E] shadow-lg">
                  <div className="flex items-center gap-2 border-b border-white/5 bg-[#141414] px-4 py-2.5 text-[12px] font-medium text-zinc-400">
                    <FiVideo size={14} />
                    YouTube Preview
                  </div>

                  <div className="aspect-video w-full bg-black/50">
                    <iframe
                      src={youtubeEmbed}
                      title="YouTube video"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </div>
              );
            }

            // VIDEO PREVIEW
            if (isVideoUrl(url)) {
              return (
                <div className="my-6 overflow-hidden rounded-xl border border-white/5 bg-[#0E0E0E] shadow-lg">
                  <div className="flex items-center gap-2 border-b border-white/5 bg-[#141414] px-4 py-2.5 text-[12px] font-medium text-zinc-400">
                    <FiVideo size={14} />
                    Video Preview
                  </div>

                  <video controls className="max-h-125 w-full bg-black/50">
                    <source src={url} />
                  </video>

                  <div className="border-t border-white/5 px-4 py-3 bg-[#141414]">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-400 transition-colors hover:text-blue-300">
                      <FiLink size={13} />
                      Buka video
                    </a>
                  </div>
                </div>
              );
            }

            // DEFAULT LINK
            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 underline decoration-blue-500/30 underline-offset-4 transition-all hover:text-blue-300 hover:decoration-blue-400">
                {children}
                <FiLink className="text-[10px] opacity-70" />
              </a>
            );
          },

          hr: () => (
            <div className="py-6">
              <hr className="border-white/5" />
            </div>
          ),

          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-white/5 bg-[#0E0E0E] shadow-sm">
              <table className="w-full border-collapse text-left text-[14px]">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="border-b border-white/5 bg-[#141414] text-zinc-200">
              {children}
            </thead>
          ),

          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-zinc-200">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border-b border-white/5 px-4 py-3 text-zinc-300 last:border-0">
              {children}
            </td>
          ),

          img: ({ src, alt }) => (
            <img
              src={src || ""}
              alt={alt || ""}
              className="my-6 rounded-xl border border-white/5 bg-white/2 shadow-lg max-h-150 object-contain"
            />
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-100">{children}</strong>
          ),

          em: ({ children }) => (
            <em className="text-zinc-300 italic">{children}</em>
          ),

          pre: ({ children }) => <>{children}</>,

          code: CodeBlock,
        }}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
