/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef } from "react";

export default function MathKeyboard({
  onInput,
}: {
  onInput: (latex: string) => void;
}) {
  // Kita menggunakan div biasa sebagai wadah (container)
  const containerRef = useRef<HTMLDivElement>(null);
  const mathFieldRef = useRef<any>(null); // Menyimpan instance dari MathLive

  useEffect(() => {
    let isMounted = true;

    // Load library mathlive secara dinamis (hanya di sisi client/browser)
    import("mathlive").then(({ MathfieldElement }) => {
      // Pastikan komponen masih aktif dan container sudah siap
      if (!isMounted || !containerRef.current) return;

      // Cegah duplikasi render ganda akibat React Strict Mode
      if (!mathFieldRef.current) {
        // Buat elemen <math-field> secara terprogram (bukan dari JSX)
        const mfe = new MathfieldElement();

        // Atur styling langsung ke elemennya
        mfe.style.width = "100%";
        mfe.style.fontSize = "1.5rem";
        mfe.style.padding = "12px";
        mfe.style.borderRadius = "8px";
        mfe.style.border = "1px solid #e2e8f0";
        mfe.style.backgroundColor = "#ffffff";

        // Tambahkan event listener untuk menangkap ketikan siswa
        mfe.addEventListener("input", (ev: Event) => {
          const target = ev.target as any;
          if (target && target.value !== undefined) {
            onInput(target.value);
          }
        });

        // Masukkan elemen ini ke dalam <div> container kita
        containerRef.current.appendChild(mfe);
        mathFieldRef.current = mfe;
      }
    });

    // Cleanup function: Bersihkan elemen jika berpindah halaman
    return () => {
      isMounted = false;
      if (mathFieldRef.current && containerRef.current) {
        containerRef.current.removeChild(mathFieldRef.current);
        mathFieldRef.current = null;
      }
    };
  }, [onInput]);

  return (
    <div className="w-full bg-slate-50 p-4 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] fixed bottom-0 left-0 z-50">
      <div className="mb-2 text-sm text-gray-500 font-medium">
        Tulis langkah penyelesaianmu:
      </div>

      {/* Ini hanyalah div kosong. Elemen math-field akan disuntikkan
        secara otomatis ke dalam div ini oleh useEffect di atas.
        Dengan ini, TypeScript tidak akan pernah protes lagi!
      */}
      <div ref={containerRef} className="w-full"></div>
    </div>
  );
}
