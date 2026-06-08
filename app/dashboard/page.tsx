import Link from "next/link";
import { FiFileText, FiCalendar, FiSettings, FiTrash2 } from "react-icons/fi";

export default function DashboardPage() {
  return (
    <div className="custom-scrollbar min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#141414] font-sans text-zinc-300 selection:bg-blue-500/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* HEADER */}
        <div className="mx-auto mb-6 w-full max-w-2xl text-center sm:mb-10 lg:mb-14">
          <div className="mb-4 flex justify-center sm:mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 shadow-inner sm:h-16 sm:w-16">
              <FiFileText className="text-[24px] sm:text-[32px]" />
            </div>
          </div>

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
            Notes Ones
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
            Welcome to Workspace
          </h1>

          <p className="mx-auto mt-3 max-w-xl px-1 text-sm leading-relaxed text-zinc-500 sm:mt-4 sm:text-[15px]">
            Kelola catatan, jadwalkan tugas, dan organisir ide-ide Anda dalam
            satu ruang kerja yang terintegrasi bergaya modern.
          </p>
        </div>

        {/* PRIMARY ACTIONS GRID */}
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:gap-6">
          {/* Card: Semua Catatan */}
          <Link
            href="/catatan"
            className="group flex min-h-55 flex-col justify-between rounded-2xl border border-white/5 bg-white/2 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/4 hover:shadow-2xl hover:shadow-black/20 sm:min-h-65 sm:p-6">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500/20 sm:mb-5 sm:h-12 sm:w-12">
                <FiFileText className="text-[18px] sm:text-[22px]" />
              </div>

              <h2 className="text-[15px] font-medium text-zinc-200 transition-colors group-hover:text-blue-400 sm:text-lg">
                Galeri Catatan
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Lihat, edit, dan kelola seluruh dokumen Anda dalam mode preview
                yang bersih dan responsif.
              </p>
            </div>

            <div className="mt-6 flex items-center text-xs font-medium text-blue-400 opacity-80 transition-opacity group-hover:opacity-100 sm:mt-8">
              Buka Galeri
              <span className="ml-1 transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          {/* Card: Kalender */}
          <Link
            href="/dashboard/calendar"
            className="group flex min-h-55 flex-col justify-between rounded-2xl border border-white/5 bg-white/2 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/4 hover:shadow-2xl hover:shadow-black/20 sm:min-h-65 sm:p-6">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20 sm:mb-5 sm:h-12 sm:w-12">
                <FiCalendar className="text-[18px] sm:text-[22px]" />
              </div>

              <h2 className="text-[15px] font-medium text-zinc-200 transition-colors group-hover:text-emerald-400 sm:text-lg">
                Kalender Jadwal
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Atur jadwal pengerjaan, tetapkan tenggat waktu, dan lihat
                catatan Anda berdasarkan tanggal.
              </p>
            </div>

            <div className="mt-6 flex items-center text-xs font-medium text-emerald-400 opacity-80 transition-opacity group-hover:opacity-100 sm:mt-8">
              Buka Kalender
              <span className="ml-1 transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        </div>

        {/* SECONDARY / QUICK LINKS */}
        <div className="mt-5 mb-6 w-full rounded-2xl border border-white/5 bg-[#111111] p-4 sm:mt-8 sm:mb-10 sm:p-6 lg:mb-14">
          {" "}
          <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-[11px]">
            Akses Cepat (Start)
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li>
              <Link
                href="/dashboard/ai-settings"
                className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-400 transition-all duration-200 hover:border-white/5 hover:bg-white/5 hover:text-zinc-200">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-500">
                  <FiSettings size={15} />
                </div>

                <span className="truncate">Konfigurasi AI</span>
              </Link>
            </li>

            <li>
              <Link
                href="/catatan/trash"
                className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-400 transition-all duration-200 hover:border-white/5 hover:bg-white/5 hover:text-zinc-200">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-500">
                  <FiTrash2 size={15} />
                </div>

                <span className="truncate">Tempat Sampah (Trash)</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
