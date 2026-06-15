"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiBookOpen,
  FiActivity,
  FiSettings,
  FiCpu,
  FiLogOut,
} from "react-icons/fi";
import LogoutButton from "@/components/layout/LogoutButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navClass = (path: string) =>
    pathname === path
      ? "flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/10 text-sm font-medium transition-all"
      : "flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg text-sm font-medium transition-all";

  const mobileNavClass = (path: string) =>
    pathname === path
      ? "flex flex-col items-center gap-0.5 text-blue-500"
      : "flex flex-col items-center gap-0.5 text-zinc-500 hover:text-zinc-300 transition-colors";

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-56 flex-col border-r border-white/5 bg-zinc-950/50 p-4 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tighter mb-8 px-2 text-white">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FiCpu className="text-white" size={16} />
          </div>
          ThinkTrack AI
        </div>

        <nav className="flex-1 space-y-1">
          <Link href="/home" className={navClass("/home")}>
            <FiHome size={16} />
            Ruang Belajar
          </Link>

          <Link href="/catatan" className={navClass("/catatan")}>
            <FiBookOpen size={16} />
            Semua Materi
          </Link>

          <Link href="/analisis" className={navClass("/analisis")}>
            <FiActivity size={16} />
            Analisis Kognitif
          </Link>
        </nav>

        {/* SECTION BAWAH SIDEBAR */}
        <div className="mt-auto border-t border-white/5 pt-4 space-y-1">
          <Link href="/settings" className={navClass("/settings")}>
            <FiSettings size={16} />
            Pengaturan
          </Link>

          <LogoutButton />
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-y-auto bg-[#09090b]">{children}</div>

        {/* MOBILE NAVIGATION */}
        <nav className="md:hidden flex items-center justify-around px-2 py-2 border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl z-20">
          <Link href="/home" className={mobileNavClass("/home")}>
            <FiHome size={18} />
            <span className="text-[9px] font-semibold">Home</span>
          </Link>

          <Link href="/catatan" className={mobileNavClass("/catatan")}>
            <FiBookOpen size={18} />
            <span className="text-[9px] font-semibold">Materi</span>
          </Link>

          <Link href="/settings" className={mobileNavClass("/settings")}>
            <FiSettings size={18} />
            <span className="text-[9px] font-semibold">Settings</span>
          </Link>

          <button
            className="flex flex-col items-center gap-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Logout">
            <FiLogOut size={18} />
            <span className="text-[9px] font-semibold">Keluar</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
