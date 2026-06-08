"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiCalendar,
  FiSidebar,
} from "react-icons/fi";

interface CalendarHeaderProps {
  currentMonth: Date;
  totalNotes: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onCreateNote: () => void;
}

export default function CalendarHeader({
  currentMonth,
  totalNotes,
  isSidebarOpen,
  onToggleSidebar,
  onPrevMonth,
  onNextMonth,
  onToday,
  onCreateNote,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2d2d] bg-[#1e1e1e] px-4 py-3 sm:px-6">
      {/* Left Content: Title (Notion Style Header) */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center text-[#858585]">
          <FiCalendar size={20} />
        </div>

        <div className="flex flex-col">
          <h1 className="text-lg font-medium text-[#f3f3f3] leading-tight">
            {format(currentMonth, "MMMM yyyy", { locale: id })}
          </h1>
          <p className="text-[11px] text-[#858585] mt-0.5">
            {totalNotes} catatan terjadwal
          </p>
        </div>
      </div>

      {/* Right Actions: Controls (VS Code Style Toolbar) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Toggle Sidebar Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors ${
            isSidebarOpen
              ? "border-[#333333] bg-[#252526] text-[#858585] hover:bg-[#333333] hover:text-[#cccccc]"
              : "border-[#007fd4] bg-[#04395e] text-[#cccccc] hover:bg-[#007fd4] hover:text-white"
          }`}
          title={isSidebarOpen ? "Tutup Agenda" : "Buka Agenda"}>
          <FiSidebar size={14} className={isSidebarOpen ? "" : "rotate-180"} />
          {/* Teks hanya muncul di layar agak besar agar di HP tidak terlalu sempit */}
          <span className="hidden md:inline text-[11px] font-medium uppercase tracking-widest">
            {isSidebarOpen ? "Agenda" : "Buka Agenda"}
          </span>
        </button>

        {/* Navigation Group */}
        <div className="flex items-center rounded-md border border-[#333333] bg-[#252526]">
          <button
            type="button"
            onClick={onToday}
            className="border-r border-[#333333] px-3 py-1.5 text-xs text-[#cccccc] transition-colors hover:bg-[#333333] hover:text-white">
            Hari ini
          </button>

          <button
            type="button"
            onClick={onPrevMonth}
            className="flex items-center justify-center px-2 py-1.5 text-[#858585] transition-colors hover:bg-[#333333] hover:text-[#cccccc]"
            aria-label="Bulan sebelumnya">
            <FiChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={onNextMonth}
            className="flex items-center justify-center px-2 py-1.5 text-[#858585] transition-colors hover:bg-[#333333] hover:text-[#cccccc]"
            aria-label="Bulan berikutnya">
            <FiChevronRight size={16} />
          </button>
        </div>

        {/* Primary Action Button (VS Code Blue) */}
        <button
          type="button"
          onClick={onCreateNote}
          className="flex items-center gap-1.5 rounded-md bg-[#007fd4] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#006eb8]">
          <FiPlus size={14} />
          <span className="hidden sm:inline">Catatan Baru</span>
          <span className="sm:hidden">Baru</span>
        </button>
      </div>
    </div>
  );
}
