import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import Sidebar from "@/components/layout/Sidebar";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

import {
  FiBookOpen,
  FiChevronLeft,
  FiFileText,
  FiClock,
  FiLayers,
} from "react-icons/fi";

const PAGE_SIZE = 8;

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function stripMarkdown(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function CatatanPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string } | undefined>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const requestedPage = parsePage(resolvedSearchParams?.page);

  const totalNotes = await prisma.note.count({
    where: { userId: session.user.id, deletedAt: null },
  });

  const totalPages = Math.max(1, Math.ceil(totalNotes / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const skip = (currentPage - 1) * PAGE_SIZE;

  const [notes, sidebarNotes] = await Promise.all([
    prisma.note.findMany({
      where: { userId: session.user.id, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
        createdAt: true,
        scheduledAt: true,
        editorMode: true,
        tags: true,
        pinned: true,
        status: true,
      },
    }),

    prisma.note.findMany({
      where: { userId: session.user.id, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        scheduledAt: true,
        tags: true,
        pinned: true,
        status: true,
      },
    }),
  ]);

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;
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
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 bg-[#141414] px-4 backdrop-blur-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-zinc-200">
                <FiBookOpen size={14} className="text-[#007acc]" />
                Workspace
              </span>
              <span className="text-zinc-600">/</span>
              <span className="truncate font-medium text-zinc-200">
                Semua Catatan
              </span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200">
            <FiChevronLeft size={14} />
            <span className="hidden sm:inline">Kembali ke Dashboard</span>
          </Link>
        </header>

        {/* BODY */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* CONTENT AREA (Notion Style Gallery) */}
          <main className="custom-scrollbar min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 lg:py-10">
              {/* NOTES GALLERY */}
              {notes.length === 0 ? (
                <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-zinc-400">
                    <FiFileText size={28} />
                  </div>
                  <h2 className="mt-5 text-lg font-medium text-zinc-200">
                    Belum Ada Catatan
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-zinc-500">
                    Mulai tuangkan ide Anda. Semua catatan yang dibuat akan
                    tampil di galeri ini.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {notes.map((note) => {
                      const excerpt =
                        stripMarkdown(note.content).slice(0, 120) ||
                        "Tidak ada konten tambahan di dalam catatan ini.";

                      const updatedAt = new Intl.DateTimeFormat("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(note.updatedAt));

                      return (
                        <Link
                          key={note.id}
                          href={`/catatan/${note.id}`}
                          className="group flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-white/2 p-5 transition-all hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/4 hover:shadow-lg hover:shadow-black/20">
                          <div>
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <h2 className="line-clamp-2 text-base font-medium leading-snug text-zinc-200 transition-colors group-hover:text-blue-400">
                                {note.title}
                              </h2>
                              {note.pinned && (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                                  ★
                                </span>
                              )}
                            </div>
                            <p className="line-clamp-3 text-sm leading-relaxed text-zinc-500">
                              {excerpt}
                            </p>
                          </div>

                          <div className="mt-5 space-y-3">
                            {note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {note.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                                    #{tag}
                                  </span>
                                ))}
                                {note.tags.length > 3 && (
                                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                                    +{note.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-zinc-500">
                              <span className="flex items-center gap-1.5">
                                <FiClock size={10} />
                                {updatedAt}
                              </span>
                              <span className="rounded-sm bg-white/5 px-1.5 py-0.5 text-zinc-400">
                                {note.editorMode === "notion"
                                  ? "Notion"
                                  : "Text"}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* PAGINATION */}
                  <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6 text-sm">
                    <span className="text-zinc-500">
                      Halaman{" "}
                      <strong className="font-medium text-zinc-200">
                        {currentPage}
                      </strong>{" "}
                      dari{" "}
                      <strong className="font-medium text-zinc-200">
                        {totalPages}
                      </strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <Link
                        aria-disabled={!hasPrevious}
                        tabIndex={hasPrevious ? 0 : -1}
                        href={
                          hasPrevious ? `/catatan?page=${currentPage - 1}` : "#"
                        }
                        className={`inline-flex h-8 items-center justify-center rounded-md px-3 transition-colors ${
                          hasPrevious
                            ? "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                            : "pointer-events-none text-zinc-700"
                        }`}>
                        Prev
                      </Link>
                      <Link
                        aria-disabled={!hasNext}
                        tabIndex={hasNext ? 0 : -1}
                        href={
                          hasNext ? `/catatan?page=${currentPage + 1}` : "#"
                        }
                        className={`inline-flex h-8 items-center justify-center rounded-md px-3 transition-colors ${
                          hasNext
                            ? "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                            : "pointer-events-none text-zinc-700"
                        }`}>
                        Next
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>

          {/* PROPERTIES SIDEBAR (VS Code Secondary Pane layout) */}
          <aside className="hidden w-64 shrink-0 border-l border-white/5 bg-[#111111] xl:block">
            <div className="flex h-12 items-center px-4 border-b border-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Properties
              </p>
            </div>

            <div className="space-y-6 p-5">
              <div className="group">
                <p className="mb-2 text-[11px] text-zinc-500">Total Catatan</p>
                <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/2 px-3 py-2 transition-colors group-hover:bg-white/4">
                  <FiLayers className="text-blue-400" size={16} />
                  <div>
                    <div className="text-sm font-medium text-zinc-200">
                      {totalNotes}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Dokumen tersimpan
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <p className="mb-2 text-[11px] text-zinc-500">
                  Aktivitas Terakhir
                </p>
                <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/2 px-3 py-2 transition-colors group-hover:bg-white/4">
                  <FiClock className="text-emerald-400" size={16} />
                  <div>
                    <div className="text-sm font-medium text-zinc-200">
                      {notes[0]
                        ? new Intl.DateTimeFormat("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(notes[0].updatedAt))
                        : "-"}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Update terbaru
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <p className="mb-2 text-[11px] text-zinc-500">Mode Editor</p>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    Markdown
                  </span>
                  <span className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    Notion Block
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* STATUS BAR (VS Code Style) */}
        <footer className="flex h-6 shrink-0 items-center justify-between bg-[#007acc] px-3 text-[11px] text-white">
          <div className="flex items-center gap-3">
            <span className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-white/20">
              <FiBookOpen size={12} />
              Collection: {totalNotes}
            </span>
            <span className="hidden cursor-pointer rounded px-1.5 py-0.5 transition hover:bg-white/20 sm:inline">
              Preview Mode Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="cursor-pointer rounded px-1.5 py-0.5 transition hover:bg-white/20">
              UTF-8
            </span>
            <span className="cursor-pointer rounded px-1.5 py-0.5 transition hover:bg-white/20">
              Markdown
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
