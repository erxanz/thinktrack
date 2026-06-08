"use client";

import { useMemo } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { id } from "date-fns/locale/id";
import CalendarEvent from "./CalendarEvent";
import type { CalendarNote } from "./types";

interface CalendarGridProps {
  currentMonth: Date;
  notes: CalendarNote[];
  onSelectDate: (date: Date) => void;
  onEditNote: (note: CalendarNote) => void;
  draggedNote: CalendarNote | null;
  onDragStart: (note: CalendarNote) => void;
  onDragOver: (date: Date) => void;
  onDrop: (date: Date) => void;
  dragOverDate: string | null;
}

const WEEK_LABELS = Array.from({ length: 7 }, (_, index) =>
  format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), index), "EEE", {
    locale: id,
  }),
);

function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function buildNotesByDate(notes: CalendarNote[]) {
  const grouped: Record<string, CalendarNote[]> = {};

  for (const note of notes) {
    if (!note.scheduledAt) {
      continue;
    }

    const key = getDateKey(parseISO(note.scheduledAt));

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(note);
  }

  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
  });

  return grouped;
}

export default function CalendarGrid({
  currentMonth,
  notes,
  onSelectDate,
  onEditNote,
  draggedNote,
  onDragStart,
  onDragOver,
  onDrop,
  dragOverDate,
}: CalendarGridProps) {
  const notesByDate = useMemo(() => buildNotesByDate(notes), [notes]);

  const startDate = startOfWeek(startOfMonth(currentMonth), {
    weekStartsOn: 1,
  });
  const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });

  const days: Date[] = [];

  for (let day = startDate; day <= endDate; day = addDays(day, 1)) {
    days.push(day);
  }

  return (
    <section className="overflow-hidden rounded-md border border-[#2d2d2d] bg-[#1e1e1e]">
      {/* HEADER HARI */}
      <div className="grid grid-cols-7 border-b border-[#2d2d2d] bg-[#252526]">
        {WEEK_LABELS.map((label) => (
          <div
            key={label}
            className="border-r border-[#2d2d2d] px-2 py-2 text-center text-[11px] font-medium text-[#858585] uppercase tracking-wider last:border-r-0 sm:text-xs">
            {label}
          </div>
        ))}
      </div>

      {/* GRID KALENDER */}
      <div className="grid grid-cols-7 bg-[#1e1e1e]">
        {days.map((day, index) => {
          const key = getDateKey(day);
          const dayNotes = notesByDate[key] ?? [];
          const visibleNotes = dayNotes.slice(0, 3);
          const extraCount = dayNotes.length - visibleNotes.length;
          const outOfMonth = !isSameMonth(day, currentMonth);
          const today = isToday(day);

          // Logika untuk menghilangkan border kanan di kolom terakhir agar tidak ada double border
          const isLastColumn = (index + 1) % 7 === 0;

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDate(day)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectDate(day);
                }
              }}
              className={`group relative min-h-25 cursor-pointer p-1.5 sm:p-2 transition-colors sm:min-h-32 md:min-h-38 ${
                isLastColumn
                  ? "border-b border-[#2d2d2d]"
                  : "border-b border-r border-[#2d2d2d]"
              } ${
                outOfMonth ? "bg-[#181818]" : "bg-[#1e1e1e]"
              } hover:bg-[#252526]`}>
              <div className="flex items-center justify-between gap-1 px-1">
                {/* TANGGAL */}
                <span
                  className={`flex h-6 min-w-6 items-center justify-center rounded text-[13px] font-medium ${
                    today
                      ? "bg-[#007fd4] text-white" // VS Code Blue
                      : outOfMonth
                        ? "text-[#6b6b6b]"
                        : "text-[#cccccc]"
                  }`}>
                  {format(day, "d")}
                </span>

                {/* JUMLAH CATATAN (Kecil di pojok) */}
                {dayNotes.length > 0 && (
                  <span className="text-[10px] text-[#6b6b6b]">
                    {dayNotes.length}
                  </span>
                )}
              </div>

              {/* AREA DROP & CATATAN */}
              <div
                className={`mt-1.5 h-full space-y-1 rounded-sm p-0.5 transition-colors ${
                  dragOverDate === key
                    ? "bg-[#04395e] ring-1 ring-inset ring-[#007fd4]"
                    : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  onDragOver(day);
                }}
                onDragLeave={(event) => {
                  if (event.currentTarget === event.target) {
                    onDragOver(new Date(0));
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDrop(day);
                }}>
                {visibleNotes.map((note) => (
                  <CalendarEvent
                    key={note.id}
                    note={note}
                    onEdit={onEditNote}
                    isDragging={draggedNote?.id === note.id}
                    onDragStart={() => onDragStart(note)}
                  />
                ))}

                {/* INDIKATOR LEBIH BANYAK CATATAN */}
                {extraCount > 0 && (
                  <div className="px-1 py-0.5 text-[11px] font-medium text-[#858585] transition-colors hover:text-[#cccccc]">
                    +{extraCount} lainnya
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
