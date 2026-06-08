/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef } from "react";
import { FiCpu } from "react-icons/fi";

interface MathKeyboardProps {
  onInput: (latex: string) => void;
}

export default function MathKeyboard({ onInput }: MathKeyboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mathFieldRef = useRef<any>(null);

  // Menyimpan callback terbaru tanpa memicu re-render MathLive
  const onInputRef = useRef(onInput);

  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  useEffect(() => {
    let isMounted = true;

    import("mathlive").then(({ MathfieldElement }) => {
      if (!isMounted || !containerRef.current) return;

      // Hindari membuat MathField dua kali
      if (mathFieldRef.current) return;

      const mfe = new MathfieldElement();

      // Styling Dark Theme ThinkTrack
      mfe.style.width = "100%";
      mfe.style.minHeight = "70px";
      mfe.style.fontSize = "1.5rem";
      mfe.style.padding = "14px";
      mfe.style.borderRadius = "16px";
      mfe.style.background = "#18181b";
      mfe.style.color = "#ffffff";
      mfe.style.border = "1px solid rgba(59,130,246,0.2)";
      mfe.style.boxShadow = "0 0 30px rgba(37,99,235,0.12)";

      // Event input
      mfe.addEventListener("input", (ev: Event) => {
        const target = ev.target as any;

        if (target?.value !== undefined) {
          onInputRef.current(target.value);
        }
      });

      containerRef.current.appendChild(mfe);

      mathFieldRef.current = mfe;
    });

    return () => {
      isMounted = false;

      if (
        mathFieldRef.current &&
        containerRef.current?.contains(mathFieldRef.current)
      ) {
        containerRef.current.removeChild(mathFieldRef.current);

        mathFieldRef.current = null;
      }
    };
  }, []); // ← WAJIB kosong supaya tidak recreate MathField

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#09090b]/95 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <FiCpu className="text-blue-400" />

          <div>
            <div className="text-sm font-semibold text-blue-400">
              ThinkTrack Math Input
            </div>

            <div className="text-xs text-zinc-500">
              Tulis langkah penyelesaian matematika
            </div>
          </div>
        </div>

        {/* Container MathLive */}
        <div className="rounded-2xl border border-blue-500/20 bg-zinc-900/80 p-2 shadow-[0_0_30px_rgba(37,99,235,0.12)]">
          <div ref={containerRef} />
        </div>

        {/* Footer */}
        <div className="mt-3 text-[11px] text-zinc-500">
          AI akan menganalisis setiap langkah yang Anda masukkan
        </div>
      </div>
    </div>
  );
}
