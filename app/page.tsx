import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  FiChevronRight,
  FiCpu,
  FiBookOpen,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-x-hidden bg-[#0a0a0c] font-sans text-[#e2e8f0] selection:bg-blue-600 selection:text-white">
      {/* Efek Gradasi Latar Belakang Mendalam */}
      <div className="pointer-events-none absolute left-1/2 top-12 -z-10 h-125 w-125 -translate-x-1/2 rounded-full bg-blue-600 opacity-[0.08] blur-[120px] md:h-[600px] md:w-[600px]" />
      <div className="pointer-events-none absolute right-10 bottom-10 -z-10 h-75 w-75 rounded-full bg-indigo-600 opacity-[0.05] blur-[100px]" />

      <main className="z-10 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 pt-20 text-center md:pt-28">
        {/* Badge Fitur Utama */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-[11px] font-medium text-zinc-400 shadow-xl backdrop-blur-sm md:text-[12px]">
          <FiCpu className="text-blue-500 animate-pulse" size={14} />
          <span>AI-Powered Cognitive Adaptive Learning</span>
        </div>

        {/* Heading Utama & Tagline Edukasi */}
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 sm:text-6xl md:text-7xl leading-tight">
            Pahami Proses Berpikir,
            <br />
            Bukan Hanya Skor Akhir.
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base md:text-lg">
            ThinkTrack AI melacak pengerjaan matematika siswa{" "}
            <span className="text-blue-400 font-medium">
              langkah-demi-langkah
            </span>
            , mendeteksi miskonsepsi prasyarat, dan menyesuaikan gaya
            penyampaian materi secara personal.
          </p>
        </div>

        {/* Grup Tombol Aksi (CTA) */}
        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row md:gap-4">
          {session ? (
            <Link
              href="/home"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-500 hover:shadow-[0_4px_25px_rgba(37,99,235,0.5)] sm:w-auto">
              <FiBookOpen size={16} />
              Masuk ke Ruang Belajar
              <FiChevronRight
                className="transition-transform group-hover:translate-x-1"
                size={16}
              />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-500 sm:w-auto">
                Mulai Belajar Sekarang
                <FiChevronRight
                  className="transition-transform group-hover:translate-x-1"
                  size={16}
                />
              </Link>
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-8 py-3.5 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-900 sm:w-auto">
                Daftar Akun Baru
              </Link>
            </>
          )}
        </div>

        {/* INTERAKTIF MOCKUP: Simulasi Tampilan PWA Mobile ThinkTrack AI */}
        <div className="mt-16 w-full max-w-sm overflow-hidden rounded-[40px] border-8 border-zinc-800 bg-zinc-950 shadow-2xl transition-all duration-300 hover:border-zinc-700 md:mt-24">
          {/* Status Bar Simulasi HP */}
          <div className="flex items-center justify-between bg-zinc-900 px-6 py-3 text-[11px] font-semibold text-zinc-500 border-b border-zinc-950">
            <div>12:12</div>
            <div className="h-4 w-16 rounded-full bg-zinc-950 flex items-center justify-center text-[9px] text-zinc-600">
              ThinkTrack PWA
            </div>
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-zinc-500"></div>
              <div className="h-2 w-3 rounded-sm bg-zinc-500"></div>
            </div>
          </div>

          {/* Konten Utama Aplikasi Dalam Mockup */}
          <div className="p-5 text-left space-y-4 bg-[#0c0c0e] text-zinc-300 min-h-[380px] font-sans">
            {/* Header Soal Eksperimen */}
            <div className="rounded-2xl bg-zinc-900/80 p-4 border border-zinc-800">
              <div className="text-[10px] uppercase tracking-wider text-blue-500 font-bold mb-1">
                Misi Ujian Soal
              </div>
              <div className="text-base font-bold text-white">
                Sederhanakan pecahan aljabar berikut:
              </div>
              <div className="my-2 bg-zinc-950 p-2 rounded-lg text-center text-sm text-amber-400 font-mono">
                {"2x + 4 = 10"}
              </div>
            </div>

            {/* Riwayat Langkah Berpikir (Thinking Trace Simulation) */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 rounded-xl bg-zinc-900/40 p-3 border border-zinc-800/60">
                <FiCheckCircle
                  className="text-emerald-500 mt-0.5 shrink-0"
                  size={14}
                />
                <div>
                  <span className="font-semibold text-zinc-400 block mb-0.5">
                    Langkah 1
                  </span>
                  <code className="text-white font-mono">2x = 10 - 4</code>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-red-950/20 p-3 border border-red-900/40">
                <FiAlertCircle
                  className="text-rose-500 mt-0.5 shrink-0"
                  size={14}
                />
                <div className="w-full">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-rose-400">
                      Langkah 2 (Terdeteksi Miskonsepsi)
                    </span>
                  </div>
                  <code className="text-white font-mono block my-1">
                    x = 6 \times 2
                  </code>
                  <div className="text-[11px] text-zinc-400 mt-1 bg-zinc-950 p-2 rounded-md border border-zinc-900">
                    💡{" "}
                    <span className="text-rose-400 font-medium">
                      Analisis Claude AI:
                    </span>{" "}
                    Anda melakukan kesalahan operasi. Seharusnya ruas kanan
                    dibagi dengan 2, bukan dikali.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="w-full pb-8 pt-16 text-center text-[11px] text-zinc-600 border-t border-zinc-900/50 mt-10">
        &copy; {new Date().getFullYear()} ThinkTrack AI. Menganalisis Proses
        Kognitif & Pemecahan Masalah.
      </footer>
    </div>
  );
}
