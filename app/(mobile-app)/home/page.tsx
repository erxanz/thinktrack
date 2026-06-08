import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MobileHomePage() {
  // 1. Cek sesi user yang login
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. Fetch data topik belajar dari database (BUKAN note lagi)
  const topics = await prisma.topic.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      subtopics: true, // Ambil juga sub-materinya
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Halo, {session.user.name}!
        </h1>
        <p className="text-sm text-gray-500">
          Mari lanjutkan proses belajarmu hari ini.
        </p>
      </div>

      <h2 className="text-lg font-bold text-gray-700 mb-4">
        Roadmap Belajarmu
      </h2>

      {topics.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4 text-sm">
            Belum ada topik yang dipelajari.
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
            + Tambah Topik Baru
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Link href={`/learn/${topic.id}`} key={topic.id} className="block">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{topic.title}</h3>
                  {topic.isCompleted && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-bold">
                      Selesai
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {topic.description || "Tidak ada deskripsi"}
                </p>

                {/* Progress indikator sederhana berdasarkan jumlah subtopic */}
                <div className="text-xs font-semibold text-blue-600">
                  {topic.subtopics.length} Sub-materi tersedia
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
