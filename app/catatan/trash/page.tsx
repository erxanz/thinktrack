import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import Sidebar from "@/components/layout/Sidebar";
import TrashActions from "@/components/notes/TrashActions";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

import { FiTrash2, FiChevronLeft, FiFileText } from "react-icons/fi";

export default async function TrashPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [trashedNotes, sidebarNotes] = await Promise.all([
    prisma.note.findMany({
      where: {
        userId: session.user.id,
        deletedAt: { not: null },
      },
      orderBy: {
        deletedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
        createdAt: true,
        scheduledAt: true,
        editorMode: true,
        deletedAt: true,
      },
    }),

    prisma.note.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        scheduledAt: true,
      },
    }),
  ]);

  const sidebarNotesForSidebar = sidebarNotes.map((note) => ({
    ...note,
    updatedAt: note.updatedAt.toISOString(),
    scheduledAt: note.scheduledAt?.toISOString() ?? null,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-[#0E0E0E] font-sans text-zinc-300 selection:bg-blue-500/30">
      {/* SIDEBAR UTAMA */}
      <Sidebar notes={sidebarNotesForSidebar} />

      {/* WRAPPER KONTEN */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#141414]">
        {/* TOP BAR / BREADCRUMBS (VS Code Style) */}
        <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center justify-between border-b border-white/5 bg-[#141414]/95 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-zinc-200">
                <FiTrash2 size={14} className="text-red-400" />
                Workspace
              </span>
              <span className="text-zinc-600">/</span>
              <span className="truncate font-medium text-zinc-200">Trash</span>
            </div>
          </div>

          <Link
            href="/catatan"
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200">
            <FiChevronLeft size={14} />
            <span className="hidden sm:inline">Kembali ke Galeri</span>
          </Link>
        </header>

        {/* BODY */}
        <main className="custom-scrollbar min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 lg:py-10">
            {/* HEADER HALAMAN */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
                Trash
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Catatan yang dihapus sementara. Anda dapat memulihkannya atau
                menghapusnya secara permanen.
              </p>
            </div>

            {/* TRASH GALLERY */}
            {trashedNotes.length === 0 ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                  <FiTrash2 size={28} />
                </div>
                <h2 className="mt-5 text-lg font-medium text-zinc-200">
                  Trash Kosong
                </h2>
                <p className="mt-2 max-w-md text-sm text-zinc-500">
                  Tidak ada catatan yang berada di keranjang sampah.
                </p>
              </div>
            ) : (
              <>
                {/* STATS BAR */}
                <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="text-sm text-zinc-400">
                    Terdapat{" "}
                    <strong className="font-medium text-zinc-200">
                      {trashedNotes.length}
                    </strong>{" "}
                    catatan dihapus
                  </div>
                </div>

                {/* GRID CATATAN */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {trashedNotes.map((note) => {
                    const excerpt =
                      (note.content || "").slice(0, 120) ||
                      "Tidak ada konten tambahan di dalam catatan ini.";

                    return (
                      <div
                        key={note.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-xl border border-red-500/10 bg-white/2 p-5 transition-all hover:-translate-y-0.5 hover:border-red-500/20 hover:bg-white/4 hover:shadow-lg hover:shadow-black/20">
                        <div>
                          {/* CARD HEADER */}
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
                                <FiFileText size={16} />
                              </div>

                              <div className="min-w-0">
                                <h2 className="line-clamp-2 text-base font-medium leading-snug text-zinc-200 transition-colors group-hover:text-red-400">
                                  {note.title}
                                </h2>
                                <p className="mt-1 text-[11px] text-zinc-500">
                                  Dihapus pada{" "}
                                  {new Date(note.deletedAt!).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* ACTION BUTTONS (Restore/Delete) */}
                            <div className="shrink-0">
                              <TrashActions id={note.id} />
                            </div>
                          </div>

                          {/* CONTENT */}
                          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-500">
                            {excerpt}
                          </p>
                        </div>

                        {/* CARD FOOTER */}
                        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-zinc-500">
                          <span className="rounded-sm bg-white/5 px-1.5 py-0.5 text-zinc-400">
                            {note.editorMode === "notion"
                              ? "Notion Block"
                              : "Markdown"}
                          </span>

                          <Link
                            href={`/catatan/${note.id}`}
                            className="font-medium text-zinc-400 transition hover:text-white">
                            Lihat Detail
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
