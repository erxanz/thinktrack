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
    include: { subtopics: true },
  });

  return (
    // Mengurangi p-8 menjadi p-6 agar tidak terlalu renggang
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* HEADER - Ukuran font dikurangi agar lebih proporsional */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Halo,{" "}
            <span className="text-blue-500">
              {session.user.name?.split(" ")[0]}!
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Sistem AI siap melacak proses belajarmu.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20">
          <FiPlus size={16} /> Materi Baru
        </button>
      </div>

      {/* KARTU STATISTIK - Dibuat lebih ringkas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl">
          <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5">
            <FiBook size={12} /> Topik
          </div>
          <div className="text-2xl font-bold text-white">{topics.length}</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl">
          <div className="text-emerald-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5">
            <FiCheckCircle size={12} /> Selesai
          </div>
          <div className="text-2xl font-bold text-emerald-400">0</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl col-span-2 md:col-span-2 flex items-center justify-between">
          <div>
            <div className="text-blue-400 text-[10px] font-bold uppercase mb-1">
              Mode Kognitif
            </div>
            <div className="text-lg font-bold text-white">
              Mode Remaja Aktif
            </div>
          </div>
          <FiActivity size={24} className="text-zinc-700" />
        </div>
      </div>

      {/* ROADMAP MATERI */}
      <section>
        <h2 className="text-md font-bold text-white mb-4">Roadmap Belajar</h2>

        {topics.length === 0 ? (
          <div className="text-center p-10 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-500">
              Belum ada topik yang dipelajari.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <Link
                href={`/learn/${topic.id}`}
                key={topic.id}
                className="group block">
                <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl hover:border-blue-500/30 transition-all">
                  {/* Perbaikan: Menggunakan gradient-to-r yang standar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {topic.title}
                    </h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 font-bold uppercase">
                      {topic.isCompleted ? "Selesai" : "Aktif"}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 mb-4 line-clamp-2">
                    {topic.description ||
                      "Dekomposisi materi otomatis oleh AI."}
                  </p>

                  <div className="w-full bg-zinc-800 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full"
                      style={{ width: "15%" }}></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
