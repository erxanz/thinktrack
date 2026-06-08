import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FiPlus,
  FiBook,
  FiCheckCircle,
  FiClock,
  FiActivity,
} from "react-icons/fi";

export default async function WorkspaceHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const topics = await prisma.topic.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      subtopics: true,
    },
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen bg-[#09090b]">
      {/* HEADER WELCOME */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Selamat datang,{" "}
            <span className="text-blue-500">
              {session.user.name?.split(" ")[0]}!
            </span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 mt-1">
            Sistem AI siap melacak dan menganalisis proses belajarmu hari ini.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          <FiPlus size={18} /> Dekomposisi Materi Baru
        </button>
      </div>

      {/* KARTU STATISTIK */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <FiBook /> Topik Aktif
          </div>
          <div className="text-3xl font-bold text-white">{topics.length}</div>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
          <div className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <FiCheckCircle /> Diselesaikan
          </div>
          <div className="text-3xl font-bold text-emerald-400">0</div>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl col-span-2 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FiActivity size={60} />
          </div>
          <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            Tingkat Kognitif (AI)
          </div>
          <div className="text-xl font-bold text-white mb-1">
            Mode Remaja Aktif
          </div>
          <p className="text-xs text-zinc-400">
            Analogi & bahasa disesuaikan otomatis.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 my-4"></div>

      {/* ROADMAP MATERI */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          Roadmap Belajar Kamu
        </h2>

        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/30 border border-white/5 rounded-3xl text-center border-dashed">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-600">
              <FiBook size={24} />
            </div>
            <h3 className="text-zinc-200 font-bold mb-2">Belum Ada Materi</h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-6">
              Minta AI untuk memecah topik matematika apa pun menjadi peta jalan
              belajar yang terstruktur.
            </p>
            <button className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition">
              Mulai Eksplorasi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((topic) => (
              <Link
                href={`/learn/${topic.id}`}
                key={topic.id}
                className="group block h-full">
                <div className="bg-zinc-900/60 border border-zinc-800 p-5 md:p-6 rounded-2xl hover:bg-zinc-800/80 hover:border-zinc-600 transition-all h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white text-lg leading-tight group-hover:text-blue-400 transition-colors">
                      {topic.title}
                    </h3>
                    {topic.isCompleted ? (
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-1 rounded-md font-bold uppercase border border-emerald-500/20">
                        Selesai
                      </span>
                    ) : (
                      <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded-md font-bold uppercase border border-blue-500/20 flex items-center gap-1">
                        <FiClock size={10} /> Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">
                    {topic.description ||
                      "Dekomposisi materi otomatis oleh ThinkTrack AI."}
                  </p>
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-zinc-500 font-medium mb-2">
                      <span>Progress</span>
                      <span className="text-zinc-300">
                        {topic.subtopics.length} Sub-Materi
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
