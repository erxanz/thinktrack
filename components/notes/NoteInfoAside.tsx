"use client";

import { useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiHash,
  FiLayers,
} from "react-icons/fi";

type NoteInfoAsideProps = {
  title: string;
  editorMode: "text" | "notion";
  createdAt: string;
  updatedAt: string;
  scheduledAt: string | null;
  noteId: string;
};

export default function NoteInfoAside({
  title,
  editorMode,
  createdAt,
  updatedAt,
  scheduledAt,
  noteId,
}: NoteInfoAsideProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`hidden shrink-0 overflow-hidden border-r border-[#2d2d2d] bg-[#181818] transition-[width] duration-300 xl:flex ${
        isCollapsed ? "w-14" : "w-67.5"
      }`}>
      <div className="flex min-h-0 w-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-[#2d2d2d] px-4 py-4">
          {!isCollapsed ? (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Note Information
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#313131] bg-[#252526] text-zinc-300 transition hover:bg-[#2f2f2f] hover:text-white"
            title={isCollapsed ? "Buka aside" : "Kecilkan aside"}>
            {isCollapsed ? (
              <FiChevronRight size={14} />
            ) : (
              <FiChevronLeft size={14} />
            )}
          </button>
        </div>

        {!isCollapsed ? (
          <div className="space-y-5 overflow-y-auto p-5">
            <div>
              <p className="mb-2 text-xs text-zinc-500">Judul</p>

              <div className="rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-3 text-sm leading-6 text-zinc-200">
                {title}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs text-zinc-500">Mode Editor</p>

              <div className="inline-flex items-center gap-2 rounded-md border border-[#313131] bg-[#252526] px-3 py-2 text-sm text-zinc-300">
                <FiLayers size={14} />

                {editorMode === "notion" ? "Notion Mode" : "Text Mode"}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs text-zinc-500">Dibuat</p>

              <div className="flex items-start gap-2 rounded-lg border border-[#2d2d2d] bg-[#1f1f1f] px-3 py-3 text-sm text-zinc-300">
                <FiCalendar size={14} className="mt-0.5 shrink-0" />

                <span>{createdAt}</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs text-zinc-500">Diperbarui</p>

              <div className="flex items-start gap-2 rounded-lg border border-[#2d2d2d] bg-[#1f1f1f] px-3 py-3 text-sm text-zinc-300">
                <FiClock size={14} className="mt-0.5 shrink-0" />

                <span>{updatedAt}</span>
              </div>
            </div>

            {scheduledAt && (
              <div>
                <p className="mb-2 text-xs text-zinc-500">Jadwal</p>

                <div className="flex items-start gap-2 rounded-lg border border-[#2d2d2d] bg-[#1f1f1f] px-3 py-3 text-sm text-zinc-300">
                  <FiCalendar size={14} className="mt-0.5 shrink-0" />

                  <span>{scheduledAt}</span>
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs text-zinc-500">ID Catatan</p>

              <div className="flex items-start gap-2 rounded-lg border border-[#2d2d2d] bg-[#1f1f1f] px-3 py-3 text-xs text-zinc-400">
                <FiHash size={13} className="mt-0.5 shrink-0" />

                <span className="break-all">{noteId}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center gap-4 px-2 py-4 text-zinc-500">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#252526] text-zinc-300">
              <FiLayers size={15} />
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#252526] text-zinc-300">
              <FiClock size={15} />
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#252526] text-zinc-300">
              <FiHash size={15} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}