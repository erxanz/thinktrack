import Link from "next/link";
import {
  FiHome,
  FiBookOpen,
  FiActivity,
  FiSettings,
  FiCpu,
} from "react-icons/fi";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden">
      {/* SIDEBAR - Diperkecil menjadi w-56 dan padding yang lebih rapat */}
      <aside className="hidden md:flex w-56 flex-col border-r border-white/5 bg-zinc-950/50 p-4 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tighter mb-8 px-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FiCpu className="text-white" size={16} />
          </div>
          ThinkTrack AI
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            href="/home"
            className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/10 text-sm font-medium transition-all">
            <FiHome size={16} /> Ruang Belajar
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg text-sm font-medium transition-all">
            <FiBookOpen size={16} /> Semua Materi
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg text-sm font-medium transition-all">
            <FiActivity size={16} /> Analisis Kognitif
          </Link>
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg text-sm font-medium transition-all">
            <FiSettings size={16} /> Pengaturan
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* HEADER MOBILE - Dibuat lebih tipis */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-2 font-bold text-sm tracking-tighter">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
              <FiCpu className="text-white" size={12} />
            </div>
            ThinkTrack
          </div>
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700"></div>
        </header>

        {/* KONTEN HALAMAN */}
        <div className="flex-1 overflow-y-auto bg-[#09090b]">{children}</div>

        {/* BOTTOM NAV - Ikon diperkecil ke 18px */}
        <nav className="md:hidden flex items-center justify-around px-2 py-2 border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl z-20">
          <Link
            href="/home"
            className="flex flex-col items-center gap-0.5 text-blue-500">
            <FiHome size={18} />
            <span className="text-[9px] font-semibold">Home</span>
          </Link>
          <Link
            href="#"
            className="flex flex-col items-center gap-0.5 text-zinc-500 hover:text-zinc-300">
            <FiBookOpen size={18} />
            <span className="text-[9px] font-semibold">Materi</span>
          </Link>
          <Link
            href="#"
            className="flex flex-col items-center gap-0.5 text-zinc-500 hover:text-zinc-300">
            <FiActivity size={18} />
            <span className="text-[9px] font-semibold">Progress</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
