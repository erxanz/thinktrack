import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  FiChevronRight,
  FiCpu,
  FiBookOpen,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiTarget,
  FiUser,
} from "react-icons/fi";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-[#09090b] font-sans text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Latar Belakang Glow Effect */}
      <div className="absolute top-[-10%] left-1/2 -z-10 h-125 w-125 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px] md:h-150 md:w-200" />

      {/* Navbar Atas */}
      <nav className="w-full max-w-7xl px-6 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FiCpu className="text-white" size={18} />
          </div>
          ThinkTrack AI
        </div>
        <div>
          {session ? (
            <Link
              href="/home"
              className="text-sm font-medium hover:text-blue-400 transition-colors">
              Masuk Workspace
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium hover:text-blue-400 transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10">
              Masuk / Login
            </Link>
          )}
        </div>
      </nav>

      <main className="z-10 flex w-full flex-col items-center px-4 pt-8 md:pt-16 text-center flex-1">
        {/* Bagian Hero (Judul & Tagline) */}
        <div className="max-w-4xl space-y-6 px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Sistem Adaptive Learning Berbasis Kognitif
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white to-zinc-500 sm:text-5xl md:text-7xl leading-[1.1] md:leading-[1.15]">
            Pahami Proses Berpikir, <br className="hidden md:block" />
            <span className="text-blue-500">Bukan Hanya Skor Akhir.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            ThinkTrack AI melacak pengerjaan matematika siswa secara interaktif.
            Mendeteksi miskonsepsi prasyarat, menganalisis langkah-demi-langkah,
            dan menyesuaikan gaya penyampaian materi secara personal.
          </p>
        </div>

        {/* Tombol Call to Action (Responsif: berjajar di laptop, bertumpuk di HP) */}
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row px-4">
          {session ? (
            <Link
              href="/home"
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]">
              <FiBookOpen size={18} />
              Lanjutkan Belajar
              <FiChevronRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                Mulai Belajar Sekarang
                <FiChevronRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/register"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-8 py-4 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-500 hover:bg-zinc-800">
                Daftar Akun Baru
              </Link>
            </>
          )}
        </div>

        {/* MOCKUP APLIKASI RESPONSIF (Menyesuaikan ukuran layar) */}
        <div className="mt-16 w-full max-w-5xl px-4 mb-24">
          <div className="relative rounded-2xl md:rounded-4xl border border-white/10 bg-zinc-950 shadow-2xl overflow-hidden ring-1 ring-white/5">
            {/* Header Jendela Aplikasi (Simulasi macOS/Browser) */}
            <div className="flex items-center gap-4 bg-zinc-900/80 px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="hidden sm:flex mx-auto h-6 items-center rounded-md bg-black/40 px-16 text-[11px] text-zinc-500 font-mono border border-white/5">
                app.thinktrack.ai/learn/algebra
              </div>
              <div className="sm:hidden mx-auto h-6 items-center flex text-[11px] font-bold text-zinc-400">
                ThinkTrack Workspace
              </div>
            </div>

            {/* Grid Area Kerja Aplikasi */}
            <div className="grid grid-cols-1 md:grid-cols-4 min-h-100 md:min-h-125">
              {/* Sidebar Materi (Disembunyikan otomatis jika di layar HP) */}
              <div className="hidden md:flex flex-col border-r border-white/5 bg-zinc-900/30 p-5 space-y-4">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Roadmap Belajar
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-sm text-zinc-300 bg-white/5 p-2.5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                    <FiCheckCircle className="text-emerald-500 shrink-0" />{" "}
                    <span className="truncate">Aljabar Dasar</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-100 bg-blue-600/20 p-2.5 rounded-lg border border-blue-500/30 shadow-inner">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 shrink-0 relative">
                      <div className="absolute inset-1 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="font-semibold truncate">
                      Persamaan Linear
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500 p-2.5 cursor-pointer hover:text-zinc-300 transition">
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-700 shrink-0"></div>{" "}
                    <span className="truncate">Sistem Koordinat</span>
                  </div>
                </div>
              </div>

              {/* Area Utama Belajar (Main Content) */}
              <div className="col-span-1 md:col-span-3 p-4 md:p-8 bg-[#0c0c0e]">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Kartu Soal */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 md:p-8 text-center shadow-lg">
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
                      Selesaikan Persamaan
                    </div>
                    <div className="text-2xl md:text-4xl font-serif text-white tracking-wider">
                      2x + 4 = 10
                    </div>
                  </div>

                  {/* Simulasi Thinking Trace (Langkah-langkah) */}
                  <div className="space-y-4">
                    {/* Langkah 1: Benar */}
                    <div className="flex items-start gap-3 bg-zinc-900/50 p-4 md:p-5 rounded-2xl border border-zinc-800/60 shadow-sm">
                      <div className="bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md text-xs font-mono font-semibold mt-0.5 shadow-inner">
                        Step 1
                      </div>
                      <div className="text-lg md:text-xl font-serif text-zinc-200 ml-2">
                        2x = 10 - 4
                      </div>
                      <FiCheckCircle
                        className="text-emerald-500 ml-auto mt-1"
                        size={20}
                      />
                    </div>

                    {/* Langkah 2: Salah (Simulasi Miskonsepsi) */}
                    <div className="flex flex-col md:flex-row items-start gap-3 bg-red-950/20 p-4 md:p-5 rounded-2xl border border-red-900/30">
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-red-900/40 text-red-300 px-2.5 py-1 rounded-md text-xs font-mono font-semibold mt-0.5 border border-red-900/50 shadow-inner">
                          Step 2
                        </div>
                        <div className="text-lg md:text-xl font-serif text-red-100 ml-2">
                          x = 6 × 2
                        </div>
                        <FiAlertCircle
                          className="text-rose-500 ml-auto md:hidden mt-1"
                          size={20}
                        />
                      </div>

                      {/* Box Feedback AI yang responsif */}
                      <div className="mt-4 md:mt-0 ml-0 md:ml-auto bg-zinc-950/90 p-4 rounded-xl border border-red-900/40 text-[13px] leading-relaxed text-zinc-300 flex-1 max-w-sm shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                        <span className="text-rose-400 font-bold mb-2 flex items-center gap-1.5">
                          <FiCpu /> Analisis Miskonsepsi AI:
                        </span>
                        Terdapat kesalahan perpindahan ruas. Jika di ruas kiri
                        (2x) adalah perkalian, maka saat dipindah ke ruas kanan
                        seharusnya menjadi{" "}
                        <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded ml-1">
                          pembagian (÷)
                        </span>
                        , bukan perkalian.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fitur Cards (Menjadi 1 kolom di HP, 3 kolom di Laptop) */}
        <div className="w-full max-w-6xl px-4 pb-24 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 md:p-8 hover:bg-zinc-900 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center text-xl mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <FiTrendingUp />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Thinking Trace Analysis
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Melacak setiap langkah penyelesaian siswa, bukan hanya memeriksa
                jawaban akhir. Mengubah proses belajar dari sekadar
                &quot;Benar/Salah&quot; menjadi pemahaman kognitif mendalam.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 md:p-8 hover:bg-zinc-900 transition-colors group">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center text-xl mb-6 border border-rose-500/20 group-hover:scale-110 transition-transform">
                <FiTarget />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Deteksi Miskonsepsi
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                AI mendeteksi di titik mana pemahaman siswa terputus, dan
                langsung mengidentifikasi konsep prasyarat apa yang harus
                diremedial secara spesifik pada saat itu juga.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 md:p-8 hover:bg-zinc-900 transition-colors group">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center text-xl mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <FiUser />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Personalisasi Kognitif
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Cara penyampaian dan *feedback* AI disesuaikan dengan tingkat
                kognitif pengguna (Anak, Remaja, atau Dewasa). Menggunakan
                analogi yang relevan dengan usia.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-white/5 py-8 text-center text-sm text-zinc-600 bg-[#09090b]">
        <p>
          &copy; {new Date().getFullYear()} ThinkTrack AI. Adaptive Learning
          Platform.
        </p>
      </footer>
    </div>
  );
}
