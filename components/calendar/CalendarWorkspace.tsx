"use client";

import { useState } from "react";
import { addMonths, format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import CreateNoteModal from "./CreateNoteModal";
import type { CalendarNote, CalendarNoteForm } from "./types";

interface CalendarWorkspaceProps {
  initialNotes: CalendarNote[];
}

function getTodayKey() {
  return format(new Date(), "yyyy-MM-dd");
}

function dateKeyToDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function noteDateKey(note: CalendarNote) {
  if (!note.scheduledAt) {
    return getTodayKey();
  }

  return format(parseISO(note.scheduledAt), "yyyy-MM-dd");
}

function createEmptyForm(dateKey: string): CalendarNoteForm {
  return {
    title: "",
    content: "",
    scheduledAt: dateKey,
  };
}

function buildNotesByDate(notes: CalendarNote[]) {
  const grouped: Record<string, CalendarNote[]> = {};

  for (const note of notes) {
    if (!note.scheduledAt) {
      continue;
    }

    const key = format(parseISO(note.scheduledAt), "yyyy-MM-dd");

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(note);
  }

  Object.values(grouped).forEach((items) => {
    items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  });

  return grouped;
}

export default function CalendarWorkspace({
  initialNotes,
}: CalendarWorkspaceProps) {
  const router = useRouter();

  const [notes, setNotes] = useState(initialNotes);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey());
  const [activeNote, setActiveNote] = useState<CalendarNote | null>(null);
  const [form, setForm] = useState<CalendarNoteForm>(
    createEmptyForm(getTodayKey()),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedNote, setDraggedNote] = useState<CalendarNote | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  // State untuk Toggle Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const notesByDate = buildNotesByDate(notes);
  const notesForSelectedDate = notesByDate[selectedDateKey] ?? [];

  const openCreateModal = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");

    setSelectedDateKey(dateKey);
    setActiveNote(null);
    setForm(createEmptyForm(dateKey));
    setIsModalOpen(true);
  };

  const openEditModal = (note: CalendarNote) => {
    const dateKey = noteDateKey(note);

    setSelectedDateKey(dateKey);
    setActiveNote(note);
    setForm({
      title: note.title,
      content: note.content,
      scheduledAt: dateKey,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const updateNoteState = (updatedNote: CalendarNote) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note,
      ),
    );
  };

  const removeNoteState = (noteId: string) => {
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== noteId),
    );
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Judul catatan wajib diisi");
      return;
    }

    setIsSaving(true);

    const payload = {
      title: form.title.trim(),
      content: form.content,
      scheduledAt: form.scheduledAt
        ? new Date(`${form.scheduledAt}T12:00:00`).toISOString()
        : null,
    };

    const response = await fetch(
      activeNote ? `/api/notes/${activeNote.id}` : "/api/notes",
      {
        method: activeNote ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setIsSaving(false);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      toast.error(error?.error ?? "Gagal menyimpan catatan");
      return;
    }

    const savedNote = (await response.json()) as CalendarNote;

    if (activeNote) {
      updateNoteState(savedNote);
      toast.success("Catatan diperbarui");
    } else {
      setNotes((currentNotes) => [savedNote, ...currentNotes]);
      toast.success("Catatan dibuat");
    }

    setIsModalOpen(false);
    setActiveNote(null);
    router.refresh();
  };

  const handleDelete = async (noteId = activeNote?.id) => {
    if (!noteId) {
      return;
    }

    setIsDeleting(true);

    const response = await fetch(`/api/notes/${noteId}`, {
      method: "DELETE",
    });

    setIsDeleting(false);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      toast.error(error?.error ?? "Gagal menghapus catatan");
      return;
    }

    removeNoteState(noteId);
    toast.success("Catatan dihapus");

    if (activeNote?.id === noteId) {
      setIsModalOpen(false);
      setActiveNote(null);
    }

    router.refresh();
  };

  const handleDragStart = (note: CalendarNote) => {
    setDraggedNote(note);
  };

  const handleDragOver = (date: Date) => {
    setDragOverDate(format(date, "yyyy-MM-dd"));
  };

  const handleDrop = async (targetDate: Date) => {
    if (!draggedNote) return;

    const newDateKey = format(targetDate, "yyyy-MM-dd");
    const oldDateKey = noteDateKey(draggedNote);

    if (newDateKey === oldDateKey) {
      setDraggedNote(null);
      setDragOverDate(null);
      return;
    }

    const payload = {
      title: draggedNote.title,
      content: draggedNote.content,
      scheduledAt: new Date(`${newDateKey}T12:00:00`).toISOString(),
    };

    const response = await fetch(`/api/notes/${draggedNote.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      toast.error(error?.error ?? "Gagal memindahkan catatan");
      setDraggedNote(null);
      setDragOverDate(null);
      return;
    }

    const updatedNote = (await response.json()) as CalendarNote;
    updateNoteState(updatedNote);
    toast.success("Catatan dipindahkan");
    setDraggedNote(null);
    setDragOverDate(null);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#1e1e1e] font-sans text-[#cccccc]">
      {/* Header Utama Kalender */}
      <CalendarHeader
        currentMonth={currentMonth}
        totalNotes={notes.filter((note) => note.scheduledAt).length}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onPrevMonth={() => setCurrentMonth((month) => addMonths(month, -1))}
        onNextMonth={() => setCurrentMonth((month) => addMonths(month, 1))}
        onToday={() => setCurrentMonth(new Date())}
        onCreateNote={() => openCreateModal(new Date())}
      />

      {/* BUNGKUSAN KONTEN UTAMA */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 sm:p-4 gap-4 relative">
        {/* PANEL KIRI: Kontainer Kalender */}
        <div className="w-full shrink-0 lg:flex-1 lg:shrink lg:min-w-0 lg:min-h-0 flex flex-col">
          {/* Langsung masuk ke pembungkus kalender */}

          <div className="w-full flex-1 overflow-x-auto lg:overflow-auto pb-2 scrollbar-thin scrollbar-thumb-[#424242] scrollbar-track-transparent">
            <div className="min-w-3xl lg:min-w-0 h-full">
              <CalendarGrid
                currentMonth={currentMonth}
                notes={notes}
                onSelectDate={openCreateModal}
                onEditNote={openEditModal}
                draggedNote={draggedNote}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                dragOverDate={dragOverDate}
              />
            </div>
          </div>
        </div>

        {/* PANEL KANAN (Desktop) / BAWAH (Mobile): Sidebar Agenda Explorer */}
        <aside
          className={`flex-col w-full lg:w-[320px] shrink-0 border border-[#2d2d2d] bg-[#252526] rounded-md overflow-hidden h-112.5 lg:h-full shadow-lg lg:shadow-none ${
            isSidebarOpen ? "flex" : "hidden"
          }`}>
          {/* Header Sidebar */}
          <div className="flex items-center justify-between border-b border-[#2d2d2d] bg-[#252526] px-4 py-3 lg:py-2">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-[#cccccc]">
              Agenda Explorer
            </h2>
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3c3c3c] px-1 text-[10px] text-[#cccccc]">
              {notesForSelectedDate.length}
            </span>
          </div>

          {/* Tanggal Aktif */}
          <div className="bg-[#1e1e1e] px-4 py-2.5 border-b border-[#2d2d2d]">
            <span className="text-[13px] lg:text-[12px] font-medium text-[#007fd4]">
              {format(dateKeyToDate(selectedDateKey), "dd MMMM yyyy")}
            </span>
          </div>

          {/* List Catatan */}
          {/* flex-1 dan overflow-y-auto akan bekerja dengan baik karena aside sekarang punya batas tinggi */}
          <div className="flex-1 overflow-y-auto bg-[#1e1e1e]">
            {notesForSelectedDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <p className="text-[13px] lg:text-[12px] text-[#6b6b6b]">
                  Tidak ada catatan terjadwal.
                </p>
                <button
                  onClick={() =>
                    openCreateModal(dateKeyToDate(selectedDateKey))
                  }
                  className="mt-3 text-[13px] lg:text-[12px] text-[#007fd4] hover:text-[#569cd6] transition-colors font-medium">
                  + Buat catatan baru
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {notesForSelectedDate.map((note) => (
                  <div
                    key={note.id}
                    className="group flex flex-col border-b border-[#333333] p-3.5 lg:p-3 transition-colors hover:bg-[#2a2d2e] last:border-b-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] lg:text-[13px] font-medium text-[#d4d4d4] group-hover:text-white">
                          {note.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[12px] lg:text-[11px] text-[#858585]">
                          {note.content || "Tidak ada deskripsi."}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 lg:gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openEditModal(note)}
                          className="rounded bg-[#333333] px-3 py-1.5 lg:px-2 lg:py-1 text-[12px] lg:text-[11px] text-[#cccccc] transition-colors hover:bg-[#007fd4] hover:text-white">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(note.id)}
                          className="rounded bg-[#333333] px-3 py-1.5 lg:px-2 lg:py-1 text-[12px] lg:text-[11px] text-[#cccccc] transition-colors hover:bg-[#c74e4e] hover:text-white">
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <CreateNoteModal
        open={isModalOpen}
        mode={activeNote ? "edit" : "create"}
        title={form.title}
        content={form.content}
        scheduledAt={form.scheduledAt}
        selectedDateLabel={format(
          dateKeyToDate(form.scheduledAt),
          "EEEE, d MMMM yyyy",
        )}
        notesForDate={notesByDate[form.scheduledAt] ?? []}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={() => handleDelete()}
        onTitleChange={(value) =>
          setForm((current) => ({ ...current, title: value }))
        }
        onContentChange={(value) =>
          setForm((current) => ({ ...current, content: value }))
        }
        onScheduledAtChange={(value) => {
          setForm((current) => ({ ...current, scheduledAt: value }));
          setSelectedDateKey(value || getTodayKey());
        }}
        onEditExisting={openEditModal}
        onDeleteExisting={(note) => handleDelete(note.id)}
      />
    </div>
  );
}
