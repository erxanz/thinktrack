import Link from "next/link";
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
  return (
    <div className="flex h-screen bg-[#FAFAFC] text-gray-900 font-sans overflow-hidden selection:bg-[#6D28D9] selection:text-white">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-gray-100 bg-white p-5 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
        
        {/* Header / Logo */}
        <div className="flex items-center gap-3 font-extrabold font-heading text-xl tracking-tight mb-8 px-2 text-gray-900">
          <div className="w-9 h-9 rounded-[12px] bg-[#6D28D9]/10 flex items-center justify-center border border-[#6D28D9]/20 shadow-sm">
            <FiCpu className="text-[#6D28D9]" size={20} />
          </div>
          ThinkTrack <span className="text-[#FF7849] ml-1">AI</span>
        </div>

        {/* Navigasi Utama */}
        <nav className="flex-1 space-y-2">
          <Link
            href="/home"
            className="flex items-center gap-3 px-4 py-3 bg-[#6D28D9]/5 text-[#6D28D9] rounded-xl border border-[#6D28D9]/10 text-sm font-bold transition-all shadow-[0_2px_10px_rgba(109,40,217,0.05)]">
            <FiHome size={18} /> Dashboard
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all">
            <FiBookOpen size={18} /> Modules
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all">
            <FiActivity size={18} /> Analytics
          </Link>
        </nav>

        {/* SECTION BAWAH SIDEBAR */}
        <div className="mt-auto border-t border-gray-100 pt-4 space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all">
            <FiSettings size={18} /> Settings
          </Link>
          
          {/* Tombol Logout (Dibungkus agar ukurannya rapi di Sidebar) */}
          <div className="px-2 pt-1">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#FAFAFC]">
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* BOTTOM NAV (Untuk HP) */}
        <nav className="md:hidden flex items-center justify-around px-2 py-3 border-t border-gray-100 bg-white/90 backdrop-blur-xl z-20 pb-5">
          <Link
            href="/home"
            className="flex flex-col items-center gap-1.5 text-[#6D28D9]">
            <div className="p-1.5 bg-[#6D28D9]/10 rounded-lg">
              <FiHome size={20} />
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          
          <Link
            href="#"
            className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <div className="p-1.5">
              <FiBookOpen size={20} />
            </div>
            <span className="text-[10px] font-semibold">Materi</span>
          </Link>
          
          <Link
            href="/settings"
            className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <div className="p-1.5">
              <FiSettings size={20} />
            </div>
            <span className="text-[10px] font-semibold">Settings</span>
          </Link>
          
          <Link
            href="#"
            className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors">
            <div className="p-1.5">
              <FiLogOut size={20} />
            </div>
            <span className="text-[10px] font-semibold">Keluar</span>
          </Link>
        </nav>
      </main>
      
    </div>
  );
}