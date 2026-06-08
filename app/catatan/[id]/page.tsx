import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import Sidebar from "@/components/layout/Sidebar";
import NoteInfoAside from "@/components/notes/NoteInfoAside";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

import MarkdownPreview from "@/components/notes/MarkdownPreview";

import {
  FiArrowLeft,
  FiEdit3,
  FiFileText,
  FiClock,
  FiLayers,
  FiSidebar,
} from "react-icons/fi";

export default async function CatatanPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const sidebarNotes = await prisma.note.findMany({
    where: { userId: session.user.id, deletedAt: null },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      scheduledAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const sidebarNotesForSidebar = sidebarNotes.map((note) => ({
    ...note,
    updatedAt: note.updatedAt.toISOString(),
    scheduledAt: note.scheduledAt?.toISOString() ?? null,
  }));

  const note = await prisma.note.findFirst({
    where: {
      id,
      userId: session.user.id,
      deletedAt: null,
    },
  });

  if (!note) {
    notFound();
  }

  const updatedAt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(note.updatedAt));

  const createdAt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(note.createdAt));

  const scheduledAt = note.scheduledAt
    ? new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(note.scheduledAt))
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0E0E0E] font-sans text-zinc-300 selection:bg-blue-500/30">
      {/* CHECKBOX HACK UTUK SIDEBAR KIRI */}
      <input
        type="checkbox"
        id="toggle-sidebar"
        className="peer/sidebar hidden"
      />

      {/* SIDEBAR UTAMA */}
      <div className="flex h-full shrink-0 transition-all peer-checked/sidebar:hidden">
        <Sidebar notes={sidebarNotesForSidebar} />
      </div>

      {/* CONTENT WRAPPER */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#141414]">
        {/* TOP BAR / BREADCRUMBS (VS Code + Notion) */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#141414]/95 px-4 backdrop-blur-md">
          <div className="flex h-12 items-center justify-between">
            <div className="flex min-w-0 items-center gap-3 overflow-hidden">
              {/* TOMBOL TOGGLE SIDEBAR KIRI */}
              <label
                htmlFor="toggle-sidebar"
                title="Toggle Sidebar Menu"
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200">
                <FiSidebar size={14} />
              </label>

              {/* BREADCRUMBS */}
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-zinc-200">
                  <FiFileText size={14} className="text-[#007acc]" />
                  notes
                </span>
                <span className="text-zinc-600">/</span>
                <span className="truncate font-medium text-zinc-200">
                  {note.title}
                </span>
                <span className="ml-2 hidden rounded-sm bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline-block">
                  Preview Mode
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* TOMBOL TOGGLE ASIDE KANAN */}
              <label
                htmlFor="toggle-aside"
                title="Toggle Info Panel"
                className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200">
                <FiSidebar className="rotate-180" size={14} />
                <span className="hidden sm:inline">Info</span>
              </label>

              <Link
                href="/catatan"
                className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200">
                <FiArrowLeft size={14} />
                <span className="hidden sm:inline">Kembali</span>
              </Link>

              <Link
                href={`/dashboard/${note.id}`}
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[#007acc] px-3 text-xs font-medium text-white transition hover:bg-[#0098ff]">
                <FiEdit3 size={12} />
                <span className="hidden sm:inline">Edit Catatan</span>
              </Link>
            </div>
          </div>
        </header>

        {/* BODY */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* MAIN CONTENT (Notion Canvas Style) */}
          <main className="custom-scrollbar min-w-0 flex-1 overflow-y-auto">
            {/* MOBILE INFO PROPERTIES */}
            <div className="border-b border-white/5 bg-[#111111] p-4 xl:hidden">
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                  <FiLayers size={12} />
                  {note.editorMode === "notion" ? "Notion Mode" : "Text Mode"}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                  <FiClock size={12} />
                  {updatedAt}
                </div>
              </div>
            </div>

            {/* PREVIEW CANVAS */}
            <div className="px-6 py-10 pb-24 sm:px-10 md:px-12 lg:py-14">
              <div className="mx-auto max-w-4xl">
                {/* IN-DOCUMENT HEADER (Notion Style) */}
                <div className="mb-10 border-b border-white/5 pb-8">
                  <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
                    {note.title}
                  </h1>
                  <div className="mt-5 flex items-center gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <FiClock size={14} className="text-zinc-400" />
                      Diperbarui: {updatedAt}
                    </span>
                  </div>
                </div>

                {/* MARKDOWN CONTENT */}
                <div className="prose prose-zinc prose-invert max-w-none prose-headings:scroll-mt-24 prose-h1:font-bold prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-2 prose-h2:font-semibold prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-blockquote:border-l-4 prose-blockquote:border-white/20 prose-blockquote:bg-white/[0.02] prose-blockquote:py-1 prose-blockquote:pl-4 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-zinc-400 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-[#0E0E0E] prose-code:rounded-md prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:text-sky-300 prose-code:before:content-none prose-code:after:content-none prose-hr:border-white/10">
                  <MarkdownPreview
                    content={note.content}
                    className="max-w-none"
                  />
                </div>
              </div>
            </div>
          </main>

          {/* CHECKBOX HACK UNTUK ASIDE KANAN */}
          <input
            type="checkbox"
            id="toggle-aside"
            className="peer/aside hidden"
          />

          {/* RIGHT SIDEBAR / PROPERTIES PANELS */}
          <div className="flex h-full shrink-0 transition-all peer-checked/aside:hidden border-l border-white/5 bg-[#111111]">
            <NoteInfoAside
              title={note.title}
              editorMode={note.editorMode as "text" | "notion"}
              createdAt={createdAt}
              updatedAt={updatedAt}
              scheduledAt={scheduledAt}
              noteId={note.id}
            />
          </div>
        </div>

        {/* STATUS BAR (VS Code Style) */}
        <footer className="flex h-6 shrink-0 items-center justify-between bg-[#007acc] px-3 text-[11px] text-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-white/20 truncate">
              {note.editorMode === "notion" ? "Notion Block" : "Markdown"} Mode
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="cursor-pointer rounded px-1.5 py-0.5 transition hover:bg-white/20">
              UTF-8
            </span>
            <span className="hidden cursor-pointer rounded px-1.5 py-0.5 transition hover:bg-white/20 sm:inline">
              Preview Active
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
