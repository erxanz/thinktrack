import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { FiChevronRight, FiCode, FiLayout } from "react-icons/fi";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    // PERBAIKAN: Ganti overflow-hidden menjadi overflow-x-hidden agar bisa di-scroll vertikal di HP
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-x-hidden bg-[#0e0e0e] font-sans text-[#cccccc] selection:bg-[#007fd4] selection:text-white">
      {/* Efek Glow Latar Belakang */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
        {/* PERBAIKAN: Gunakan ukuran pasti seperti h-[400px] w-[400px] */}
        <div className="h-100 w-100 rounded-full bg-[#007fd4] opacity-[0.05] blur-[80px] md:h-150 md:w-150 md:blur-[100px]" />
      </div>

      <main className="z-10 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 pt-16 text-center md:pt-24">
        {/* Badge Intro */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-[#333333] bg-[#1e1e1e] px-4 py-1.5 text-[11px] font-medium text-[#858585] shadow-sm md:text-[12px]">
          <FiCode className="text-[#007fd4]" size={14} />
          <span>Markdown & Code Editor Workspace</span>
        </div>

        {/* Heading & Deskripsi */}
        <div className="max-w-3xl space-y-5 md:space-y-6">
          {/* PERBAIKAN: bg-gradient-to-br adalah class Tailwind yang standar */}
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white via-zinc-300 to-zinc-600 sm:text-6xl md:text-7xl">
            Catatan Modern.
            <br />
            Simpel & Cepat.
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#858585] sm:text-base md:text-lg">
            Platform catatan berbasis Markdown dan Kode dengan fitur{" "}
            <span className="text-[#cccccc]">syntax highlighting</span>. Simpan
            ide, snippet kode, dan dokumentasi Anda dengan aman seperti di
            editor favorit Anda.
          </p>
        </div>

        {/* Grup Tombol (Call to Action) */}
        {/* PERBAIKAN: Tambahkan w-full dan justify-center agar tombol responsif di HP */}
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row md:mt-10 md:gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="group flex w-full items-center justify-center gap-2 rounded-md bg-[#007fd4] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#006eb8] hover:shadow-[0_0_20px_rgba(0,127,212,0.3)] sm:w-auto sm:py-3">
              <FiLayout size={16} />
              Masuk ke Workspace
              <FiChevronRight
                className="transition-transform group-hover:translate-x-1"
                size={16}
              />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="group flex w-full items-center justify-center gap-2 rounded-md bg-[#007fd4] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#006eb8] hover:shadow-[0_0_20px_rgba(0,127,212,0.3)] sm:w-auto sm:py-3">
                Login Sekarang
                <FiChevronRight
                  className="transition-transform group-hover:translate-x-1"
                  size={16}
                />
              </Link>
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-[#333333] bg-[#252526] px-6 py-3.5 text-sm font-medium text-[#cccccc] transition-colors hover:border-[#569cd6] hover:bg-[#2d2d2d] hover:text-white sm:w-auto sm:py-3">
                Buat Akun Gratis
              </Link>
            </>
          )}
        </div>

        {/* Visual Mockup: Fake VS Code / Notion Window */}
        <div className="mt-16 w-full max-w-4xl overflow-hidden rounded-xl border border-[#333333] bg-[#1e1e1e] shadow-2xl md:mt-20">
          {/* Mockup Header */}
          <div className="flex items-center justify-between border-b border-[#2d2d2d] bg-[#252526] px-4 py-2.5 md:py-3">
            <div className="flex gap-1.5 md:gap-2">
              <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-[#ff5f56]"></div>
              <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="text-[10px] md:text-[11px] font-medium text-[#858585]">
              workspace.md — Note Editor
            </div>
            <div className="w-10 md:w-12"></div> {/* Spacer */}
          </div>

          {/* Mockup Body */}
          {/* PERBAIKAN: Tambahkan overflow-x-auto agar kode bisa digeser di HP */}
          <div className="flex w-full flex-col gap-1 overflow-x-auto bg-[#1e1e1e] p-5 text-left font-mono text-[12px] leading-relaxed text-[#d4d4d4] md:p-6 md:text-[13px]">
            <div className="min-w-max">
              {" "}
              {/* Memaksa konten kode tidak melipat (wrap) secara berantakan */}
              <p>
                <span className="text-[#569cd6]">#</span>{" "}
                <span>Selamat Datang di Catatan Modern</span>
              </p>
              <br />
              <p className="text-[#6a9955]">
                {"// Ketik apapun di sini, dukung format markdown dan kode."}
              </p>
              <br />
              <p>
                <span className="text-[#c586c0]">export</span>{" "}
                <span className="text-[#c586c0]">function</span>{" "}
                <span className="text-[#dcdcaa]">mulaiMenulis</span>() {"{"}
              </p>
              <p className="pl-4 md:pl-6">
                <span className="text-[#c586c0]">const</span>{" "}
                <span className="text-[#9cdcfe]">ide</span>{" "}
                <span className="text-[#d4d4d4]">=</span>{" "}
                <span className="text-[#ce9178]">
                  &quot;Membangun aplikasi keren&quot;
                </span>
                ;
              </p>
              <p className="pl-4 md:pl-6">
                <span className="text-[#4fc1ff]">simpanKeCloud</span>(
                <span className="text-[#9cdcfe]">ide</span>);
              </p>
              <p className="pl-4 md:pl-6">
                <span className="text-[#c586c0]">return</span>{" "}
                <span className="text-[#4fc1ff]">sukses</span>;
              </p>
              <p>{"}"}</p>
              <br />
              <p className="animate-pulse">_</p>
            </div>
          </div>
        </div>
      </main>

      {/* Dekorasi Footer */}
      {/* PERBAIKAN: Ubah dari absolute menjadi posisi normal agar tidak menimpa mockup di HP */}
      <footer className="w-full pb-6 pt-12 text-center text-[10px] md:text-[11px] text-[#505050]">
        &copy; {new Date().getFullYear()} Note Workspace. Built for developers.
      </footer>
    </div>
  );
}
