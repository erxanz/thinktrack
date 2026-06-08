"use client";

import Link from "next/link";
import { FiEdit2 } from "react-icons/fi";
import type { CalendarNote } from "./types";

// Palet warna yang diadaptasi dari syntax highlighting VS Code Dark+
const ACCENTS = [
  "border-l-[#007fd4] bg-[#04395e]/40 hover:bg-[#04395e]/70", // Biru (VS Code Primary)
  "border-l-[#89d185] bg-[#1e2e1e] hover:bg-[#253825]", // Hijau (Strings)
  "border-l-[#d7ba7d] bg-[#322c1d] hover:bg-[#403825]", // Kuning/Emas (Functions)
  "border-l-[#c586c0] bg-[#2d1f2c] hover:bg-[#3b293a]", // Ungu (Keywords)
  "border-l-[#ce9178] bg-[#30221c] hover:bg-[#3d2b24]", // Oranye (Numbers)
];

function getAccent(noteId: string) {
  let hash = 0;

  for (const char of noteId) {
    hash = (hash + char.charCodeAt(0)) % ACCENTS.length;
  }

  return ACCENTS[hash];
}

interface CalendarEventProps {
  note: CalendarNote;
  onEdit: (note: CalendarNote) => void;
  isDragging?: boolean;
  onDragStart?: (
    e: React.DragEvent<HTMLDivElement>,
    note: CalendarNote,
  ) => void;
}

export default function CalendarEvent({
  note,
  onEdit,
  isDragging,
  onDragStart,
}: CalendarEventProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, note)}
      className={`group relative cursor-move transition-opacity ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}>
      <Link
        href={`/dashboard/${note.id}`}
        onClick={(event) => {
          if (isDragging) event.preventDefault();
          event.stopPropagation();
        }}
        className={`block rounded-sm border border-y-[#333333] border-r-[#333333] border-l-[3px] px-2 py-1 text-left text-[11px] font-medium leading-tight transition-colors ${getAccent(note.id)}`}>
        <span className="block truncate pr-5 text-[#cccccc] group-hover:text-white">
          {note.title}
        </span>
      </Link>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(note);
        }}
        className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-sm bg-[#1e1e1e]/80 text-[#858585] opacity-0 transition-all hover:bg-[#333333] hover:text-[#cccccc] md:group-hover:opacity-100"
        aria-label={`Edit ${note.title}`}>
        <FiEdit2 size={10} />
      </button>
    </div>
  );
}
