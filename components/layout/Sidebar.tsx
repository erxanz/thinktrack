// components/layout/Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiPlus,
  FiFileText,
  FiCalendar,
  FiLogOut,
  FiTrash2,
  FiSearch,
  FiX,
  FiMenu,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiSettings,
  FiMoreHorizontal,
  FiBookOpen,
} from "react-icons/fi";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";

type Note = {
  scheduledAt: string | null;
  id: string;
  title: string;
  updatedAt: string;
  tags?: string[];
  pinned?: boolean;
  status?: string;
};

type SearchResult = {
  id: string;
  title: string;
  excerpt: string;
  updatedAt: string;
  scheduledAt: string | null;
  editorMode: string;
  tags: string[];
  pinned: boolean;
  status: string;
};

export default function Sidebar({ notes }: { notes: Note[] }) {
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isNotesListOpen, setIsNotesListOpen] = useState(true);

  // FIX: panel sekarang bisa toggle buka/tutup lagi
  const [activePanel, setActivePanel] = useState<
    "explorer" | "search" | "settings"
  >("explorer");

  const [settingsState] = useState({
    compactExplorer: true,
    showNoteDates: true,
    autoFocusSearch: true,
  });

  // Modal create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Modal delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Mobile drawer
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalSearchTags, setGlobalSearchTags] = useState("");
  const [globalSearchFrom, setGlobalSearchFrom] = useState("");
  const [globalSearchTo, setGlobalSearchTo] = useState("");
  const [globalSearchPinned, setGlobalSearchPinned] = useState("all");
  const [globalSearchStatus, setGlobalSearchStatus] = useState("all");
  const [globalSearchResults, setGlobalSearchResults] = useState<
    SearchResult[]
  >([]);
  const [globalSearchLoading, setGlobalSearchLoading] = useState(false);
  const [globalSearchError, setGlobalSearchError] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleCreateNote = async () => {
    if (!newTitle.trim()) {
      toast.error("Judul catatan wajib diisi");
      return;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: "// Mulai ketik kode atau markdown Anda di sini...",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg =
          errorData?.error || `Error: ${res.status} ${res.statusText}`;
        toast.error(`Gagal: ${errorMsg}`);
        return;
      }

      const newNote = await res.json();

      toast.success("Catatan berhasil dibuat!");

      setIsCreateModalOpen(false);
      setNewTitle("");
      setIsMobileOpen(false);

      router.push(`/dashboard/${newNote.id}`);
      router.refresh();
    } catch (error) {
      console.error("Create note error:", error);
      toast.error("Terjadi kesalahan saat membuat catatan");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/notes/${deleteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg =
          errorData?.error || `Error: ${res.status} ${res.statusText}`;
        toast.error(`Gagal: ${errorMsg}`);
        return;
      }

      const data = await res.json().catch(() => ({}));
      toast.success(data?.message || "Catatan dihapus");

      setDeleteId(null);
      setIsMobileOpen(false);

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Terjadi kesalahan saat menghapus");
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // GROUP NOTE
  const groupNotesByDate = (noteList: Note[]) => {
    const groups: Record<string, Note[]> = {};

    noteList.forEach((n) => {
      const key = n.scheduledAt
        ? new Date(n.scheduledAt).toISOString().slice(0, 10)
        : "__inbox__";

      if (!groups[key]) groups[key] = [];

      groups[key].push(n);
    });

    const entries = Object.entries(groups).map(([key, items]) => {
      const label =
        key === "__inbox__"
          ? "No date"
          : new Date(key).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

      items.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

      return {
        key,
        label,
        items,
      };
    });

    entries.sort((a, b) => {
      if (a.key === "__inbox__") return 1;
      if (b.key === "__inbox__") return -1;

      return +new Date(b.key) - +new Date(a.key);
    });

    return entries;
  };

  const grouped = groupNotesByDate(filteredNotes);

  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg =
          errorData?.error || `Error: ${res.status} ${res.statusText}`;
        toast.error(`Gagal: ${errorMsg}`);
        return;
      }

      const data = await res.json().catch(() => ({}));
      toast.success(data?.message || "Nama catatan diperbarui");

      setEditingId(null);
      setEditTitle("");

      router.refresh();
    } catch (error) {
      console.error("Rename error:", error);
      toast.error("Terjadi kesalahan saat mengganti nama");
    }
  };

  useEffect(() => {
    if (activePanel !== "search") {
      return;
    }

    const controller = new AbortController();
    const debounceId = window.setTimeout(async () => {
      setGlobalSearchLoading(true);
      setGlobalSearchError("");

      try {
        const params = new URLSearchParams();

        if (globalSearchQuery.trim()) {
          params.set("q", globalSearchQuery.trim());
        }

        if (globalSearchTags.trim()) {
          params.set("tags", globalSearchTags.trim());
        }

        if (globalSearchFrom) {
          params.set("from", globalSearchFrom);
        }

        if (globalSearchTo) {
          params.set("to", globalSearchTo);
        }

        if (globalSearchPinned !== "all") {
          params.set("pinned", globalSearchPinned);
        }

        if (globalSearchStatus !== "all") {
          params.set("status", globalSearchStatus);
        }

        const res = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData?.error ||
              `Search failed: ${res.status} ${res.statusText}`,
          );
        }

        const data = await res.json();
        setGlobalSearchResults(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setGlobalSearchResults([]);
        setGlobalSearchError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mencari",
        );
      } finally {
        if (!controller.signal.aborted) {
          setGlobalSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(debounceId);
    };
  }, [
    activePanel,
    globalSearchQuery,
    globalSearchTags,
    globalSearchFrom,
    globalSearchTo,
    globalSearchPinned,
    globalSearchStatus,
  ]);

  const renderSettingsPanel = () => (
    <div className="flex min-h-0 flex-1 flex-col p-5 text-sm text-zinc-400">
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Settings
        </h2>
        <p className="mt-1.5 text-[11px] text-zinc-500">
          Quick preferences for explorer display.
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-white/5">
          <span className="text-[13px] text-zinc-300">Compact explorer</span>
          <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-500">
            {settingsState.compactExplorer ? "ON" : "OFF"}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-white/5">
          <span className="text-[13px] text-zinc-300">Show note dates</span>
          <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-500">
            {settingsState.showNoteDates ? "ON" : "OFF"}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-white/5">
          <span className="text-[13px] text-zinc-300">Auto focus search</span>
          <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-500">
            {settingsState.autoFocusSearch ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    </div>
  );

  const handlePanelToggle = (panel: "explorer" | "search" | "settings") => {
    if (isMobileOpen) {
      setActivePanel(panel);
      setIsPanelOpen(true);
      return;
    }

    if (activePanel === panel && isPanelOpen) {
      setIsPanelOpen(false);
    } else {
      setActivePanel(panel);
      setIsPanelOpen(true);
    }

    if (panel === "explorer") {
      setIsNotesListOpen(true);
    }
  };

  const handleMobileTopbarAction = (
    panel: "explorer" | "search" | "settings",
  ) => {
    setIsMobileOpen(true);
    setActivePanel(panel);

    if (panel === "explorer") {
      setIsNotesListOpen(true);
    }
  };

  const explorerItemPadding = settingsState.compactExplorer
    ? "px-2 py-1.5"
    : "px-3 py-2";

  const searchItemPadding = settingsState.compactExplorer
    ? "px-3 py-2"
    : "px-4 py-3";

  const renderSidebarInner = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full w-full overflow-hidden text-zinc-300 font-sans">
      {/* ACTIVITY BAR (VS Code left strip, with Notion elegance) */}
      <div className="z-10 flex w-13 shrink-0 flex-col items-center justify-between border-r border-white/5 bg-[#0E0E0E] py-4">
        <div className="flex w-full flex-col items-center gap-3">
          {/* Explorer */}
          <button
            onClick={() => handlePanelToggle("explorer")}
            title="Explorer"
            className={`group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ${
              activePanel === "explorer" && isPanelOpen
                ? "bg-white/10 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            }`}>
            <FiFileText size={20} />
          </button>

          {/* Search */}
          <button
            title="Search"
            onClick={() => handlePanelToggle("search")}
            className={`group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ${
              activePanel === "search" && isPanelOpen
                ? "bg-white/10 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            }`}>
            <FiSearch size={20} />
          </button>
        </div>

        <div className="mb-2 flex w-full flex-col items-center gap-3">
          {/* Trash */}
          <button
            title="Trash"
            onClick={() => {
              router.push("/catatan/trash");
              setIsMobileOpen(false);
            }}
            className={`group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ${
              pathname.startsWith("/catatan/trash")
                ? "bg-white/10 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            }`}>
            <FiTrash2 size={20} />
          </button>

          {/* Settings */}
          <button
            title="Settings"
            onClick={() => handlePanelToggle("settings")}
            className={`group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ${
              activePanel === "settings" && isPanelOpen
                ? "bg-white/10 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            }`}>
            <FiSettings size={20} />
          </button>

          {/* Desktop collapse button */}
          {!isMobile && (
            <div className="mt-2 w-8 border-t border-white/5 pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setIsPanelOpen((prev) => !prev)}
                title={isPanelOpen ? "Collapse sidebar" : "Expand sidebar"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300">
                {isPanelOpen ? (
                  <FiChevronLeft size={16} />
                ) : (
                  <FiChevronRight size={16} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PRIMARY SIDE BAR (VS Code Panel + Notion Canvas) */}
      <div
        className={`flex min-w-0 flex-col overflow-hidden bg-[#111111] transition-all duration-300 ease-in-out ${
          isMobile || isPanelOpen ? "w-64 opacity-100" : "w-0 opacity-0"
        }`}>
        <div
          className={`flex h-full flex-col pt-2 ${
            isMobile ? "w-full" : "w-64"
          }`}>
          {/* HEADER SECTION */}
          <div className="flex h-10 items-center justify-between px-5">
            <h1 className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              {activePanel === "explorer"
                ? "Explorer"
                : activePanel === "search"
                  ? "Search"
                  : "Settings"}
            </h1>

            {isMobile && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300">
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* ================= EXPLORER ================= */}
          {activePanel === "explorer" ? (
            <>
              <div className="mb-4 px-3 mt-2 space-y-0.5">
                <Link
                  href="/dashboard/calendar"
                  onClick={() => isMobile && setIsMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg ${explorerItemPadding} text-[13px] transition-all duration-200 ${
                    pathname.startsWith("/dashboard/calendar")
                      ? "bg-white/10 text-zinc-100 font-medium"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}>
                  <FiCalendar
                    size={15}
                    className={
                      pathname.startsWith("/dashboard/calendar")
                        ? "text-sky-400"
                        : "text-zinc-500"
                    }
                  />
                  <span className="truncate">Calendar</span>
                </Link>

                <Link
                  href="/catatan"
                  onClick={() => isMobile && setIsMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg ${explorerItemPadding} text-[13px] transition-all duration-200 ${
                    pathname.startsWith("/catatan")
                      ? "bg-white/10 text-zinc-100 font-medium"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}>
                  <FiBookOpen
                    size={15}
                    className={
                      pathname.startsWith("/catatan")
                        ? "text-sky-400"
                        : "text-zinc-500"
                    }
                  />
                  <span className="truncate">Galeri Catatan</span>
                </Link>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                {/* MY NOTES HEADER */}
                <div
                  className="group flex cursor-pointer items-center justify-between px-3 py-1.5 transition-colors hover:bg-white/2"
                  onClick={() => setIsNotesListOpen(!isNotesListOpen)}>
                  <div className="flex items-center gap-1.5 overflow-hidden text-zinc-400 group-hover:text-zinc-200">
                    <FiChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        isNotesListOpen ? "" : "-rotate-90"
                      }`}
                    />
                    <h2 className="text-[11px] font-bold tracking-wider">
                      WORKSPACE
                    </h2>
                  </div>

                  <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreateModalOpen(true);
                      }}
                      className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200">
                      <FiPlus size={14} />
                    </button>
                    <button
                      className="mr-1 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
                      onClick={(e) => e.stopPropagation()}>
                      <FiMoreHorizontal size={14} />
                    </button>
                  </div>
                </div>

                {/* FILE LIST */}
                {isNotesListOpen && (
                  <div className="custom-scrollbar flex-1 overflow-y-auto pb-4">
                    {/* Inline Search */}
                    <div className="px-4 py-2 mb-2">
                      <div className="relative">
                        <FiSearch
                          size={13}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                          type="text"
                          placeholder="Filter workspace..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-md border border-transparent bg-white/5 py-1.5 pl-8 pr-3 text-[12px] text-zinc-300 transition-colors placeholder:text-zinc-600 focus:border-white/10 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {grouped.map((group) => (
                        <div key={group.key}>
                          {/* GROUP HEADER */}
                          <div
                            className="group flex cursor-pointer items-center justify-between px-4 py-1.5 text-zinc-500 hover:text-zinc-300"
                            onClick={() => toggleGroup(group.key)}>
                            <div className="flex items-center gap-2">
                              <FiChevronDown
                                size={12}
                                className={`transition-transform duration-200 ${
                                  collapsedGroups[group.key]
                                    ? "-rotate-90"
                                    : "rotate-0"
                                }`}
                              />
                              <span className="text-[11px] font-medium tracking-wide">
                                {group.label}
                              </span>
                            </div>
                            <span className="text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
                              {group.items.length} items
                            </span>
                          </div>

                          {/* GROUP CONTENT */}
                          {!collapsedGroups[group.key] && (
                            <div className="mt-0.5 space-y-0.5 px-2">
                              {group.items.map((note) => {
                                const isActive =
                                  pathname === `/dashboard/${note.id}`;

                                return (
                                  <Link
                                    href={`/dashboard/${note.id}`}
                                    key={note.id}
                                    onClick={() =>
                                      isMobile && setIsMobileOpen(false)
                                    }
                                    className={`group flex items-center justify-between rounded-lg ${explorerItemPadding} transition-all duration-200 ${
                                      isActive
                                        ? "bg-blue-500/10 text-blue-400"
                                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                                    }`}>
                                    <div className="flex min-w-0 items-center gap-2">
                                      <FiFileText
                                        size={14}
                                        className={`shrink-0 ${
                                          isActive
                                            ? "text-blue-400"
                                            : "text-zinc-600 group-hover:text-zinc-400"
                                        }`}
                                      />

                                      {editingId === note.id ? (
                                        <input
                                          autoFocus
                                          value={editTitle}
                                          onChange={(e) =>
                                            setEditTitle(e.target.value)
                                          }
                                          onBlur={() => handleRename(note.id)}
                                          onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            handleRename(note.id)
                                          }
                                          className="w-full rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-zinc-200 outline-none ring-1 ring-blue-500/50"
                                          onClick={(e) => e.preventDefault()}
                                        />
                                      ) : (
                                        <span
                                          className={`truncate text-[13px] ${
                                            isActive ? "font-medium" : ""
                                          }`}
                                          onDoubleClick={(e) => {
                                            e.preventDefault();
                                            setEditingId(note.id);
                                            setEditTitle(note.title);
                                          }}>
                                          {note.title}
                                        </span>
                                      )}
                                    </div>

                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setDeleteId(note.id);
                                      }}
                                      className={`rounded-md p-1 text-zinc-500 transition-all hover:bg-red-500/20 hover:text-red-400 ${
                                        isActive
                                          ? "opacity-100"
                                          : "opacity-0 group-hover:opacity-100"
                                      }`}>
                                      <FiTrash2 size={13} />
                                    </button>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : activePanel === "search" ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-white/5 pb-2 pt-1">
                {/* HEADER SEARCH PANEL */}
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-white/2">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-zinc-300">
                      ADVANCED SEARCH
                    </label>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      Search by keywords, tags, dates
                    </p>
                  </div>
                  <FiChevronDown
                    size={14}
                    className={`text-zinc-500 transition-transform duration-200 ${
                      isAdvancedOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* SEARCH INPUTS */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isAdvancedOpen
                      ? "max-h-125 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}>
                  <div className="space-y-3 px-4 pb-4 pt-1">
                    <div className="relative">
                      <FiSearch
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
                      />
                      <input
                        type="text"
                        placeholder="Type to search..."
                        value={globalSearchQuery}
                        onChange={(e) => setGlobalSearchQuery(e.target.value)}
                        className="w-full rounded-md border border-transparent bg-white/5 py-1.5 pl-8 pr-3 text-[12px] text-zinc-200 transition-colors placeholder:text-zinc-600 focus:border-white/10 focus:bg-white/10 focus:outline-none"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      value={globalSearchTags}
                      onChange={(e) => setGlobalSearchTags(e.target.value)}
                      className="w-full rounded-md border border-transparent bg-white/5 px-3 py-1.5 text-[12px] text-zinc-200 transition-colors placeholder:text-zinc-600 focus:border-white/10 focus:bg-white/10 focus:outline-none"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={globalSearchFrom}
                        onChange={(e) => setGlobalSearchFrom(e.target.value)}
                        className="w-full rounded-md border border-transparent bg-white/5 px-2.5 py-1.5 text-[11px] text-zinc-400 transition-colors focus:border-white/10 focus:bg-white/10 focus:outline-none"
                      />
                      <input
                        type="date"
                        value={globalSearchTo}
                        onChange={(e) => setGlobalSearchTo(e.target.value)}
                        className="w-full rounded-md border border-transparent bg-white/5 px-2.5 py-1.5 text-[11px] text-zinc-400 transition-colors focus:border-white/10 focus:bg-white/10 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={globalSearchPinned}
                        onChange={(e) => setGlobalSearchPinned(e.target.value)}
                        className="w-full rounded-md border border-transparent bg-white/5 px-2 py-1.5 text-[11px] text-zinc-400 transition-colors focus:border-white/10 focus:bg-white/10 focus:outline-none">
                        <option value="all">Pinned: all</option>
                        <option value="true">Pinned only</option>
                        <option value="false">Not pinned</option>
                      </select>

                      <select
                        value={globalSearchStatus}
                        onChange={(e) => setGlobalSearchStatus(e.target.value)}
                        className="w-full rounded-md border border-transparent bg-white/5 px-2 py-1.5 text-[11px] text-zinc-400 transition-colors focus:border-white/10 focus:bg-white/10 focus:outline-none">
                        <option value="all">Status: all</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setGlobalSearchQuery("");
                        setGlobalSearchTags("");
                        setGlobalSearchFrom("");
                        setGlobalSearchTo("");
                        setGlobalSearchPinned("all");
                        setGlobalSearchStatus("all");
                      }}
                      className="w-full rounded-md bg-white/5 px-3 py-1.5 text-center text-[11px] font-medium text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200">
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* SEARCH RESULTS */}
              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
                <div className="px-3 pt-4">
                  <div className="mb-3 px-2 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                    {globalSearchLoading
                      ? "Searching..."
                      : globalSearchQuery.trim() ||
                          globalSearchTags.trim() ||
                          globalSearchFrom ||
                          globalSearchTo ||
                          globalSearchPinned !== "all" ||
                          globalSearchStatus !== "all"
                        ? `Results (${globalSearchResults.length})`
                        : `All Notes (${notes.length})`}
                  </div>

                  {globalSearchError && (
                    <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                      {globalSearchError}
                    </div>
                  )}

                  {globalSearchLoading && (
                    <div className="mb-3 animate-pulse rounded-lg bg-white/5 px-3 py-2 text-[12px] text-zinc-500">
                      Searching across workspace...
                    </div>
                  )}

                  <div className="space-y-2">
                    {globalSearchResults.length > 0 ? (
                      globalSearchResults.map((note) => {
                        const isActive = pathname === `/dashboard/${note.id}`;

                        return (
                          <Link
                            key={note.id}
                            href={`/dashboard/${note.id}`}
                            onClick={() =>
                              isMobileOpen && setIsMobileOpen(false)
                            }
                            className={`group flex flex-col gap-2 rounded-xl border transition-all duration-200 ${searchItemPadding} ${
                              isActive
                                ? "border-blue-500/30 bg-blue-500/5 shadow-sm"
                                : "border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/4"
                            }`}>
                            <div className="flex items-start gap-2.5 min-w-0">
                              <FiFileText
                                size={14}
                                className={`mt-0.5 shrink-0 ${isActive ? "text-blue-400" : "text-zinc-500"}`}
                              />
                              <div className="min-w-0 flex-1">
                                <div
                                  className={`truncate text-[13px] ${isActive ? "font-medium text-blue-100" : "font-medium text-zinc-200"}`}>
                                  {note.title}
                                </div>
                                <div className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                  {note.excerpt}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 pl-6">
                              <span className="text-[10px] text-zinc-600">
                                {new Intl.DateTimeFormat("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                }).format(new Date(note.updatedAt))}
                              </span>

                              {note.pinned && (
                                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-500">
                                  Pinned
                                </span>
                              )}

                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-medium capitalize text-zinc-400">
                                {note.status}
                              </span>

                              {note.tags.length > 0 && (
                                <div className="ml-1 flex gap-1 border-l border-white/10 pl-2">
                                  {note.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[9px] text-zinc-500">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/10 bg-white/1 p-5 text-center">
                        <FiSearch
                          className="mx-auto mb-2 text-zinc-600"
                          size={20}
                        />
                        <p className="text-[12px] text-zinc-500">
                          {globalSearchQuery.trim() ||
                          globalSearchTags.trim() ||
                          globalSearchFrom ||
                          globalSearchTo ||
                          globalSearchPinned !== "all" ||
                          globalSearchStatus !== "all"
                            ? "No notes found matching your filters."
                            : "Start typing to search notes."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            renderSettingsPanel()
          )}

          {/* FOOTER SECTION */}
          <div className="mt-auto space-y-0.5 border-t border-white/5 p-3">
            <Link
              href="/dashboard/ai-settings"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200">
              <FiSettings size={14} className="text-zinc-500" />
              <span>AI Settings</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400">
              <FiLogOut
                size={14}
                className="text-zinc-500 group-hover:text-red-400"
              />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TOPBAR */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-12 items-center border-b border-white/5 bg-[#141414]/95 px-3 shadow-md backdrop-blur md:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200">
          <FiMenu size={18} />
        </button>

        <div className="ml-3 flex items-center gap-1.5 text-[12px] font-medium text-zinc-500">
          <button
            type="button"
            onClick={() => handleMobileTopbarAction("explorer")}
            className={`rounded-md px-2.5 py-1 transition-colors hover:bg-white/10 hover:text-zinc-300 ${
              activePanel === "explorer" && isMobileOpen
                ? "bg-white/10 text-zinc-200"
                : ""
            }`}>
            File
          </button>
          <button
            type="button"
            onClick={() => handleMobileTopbarAction("search")}
            className={`rounded-md px-2.5 py-1 transition-colors hover:bg-white/10 hover:text-zinc-300 ${
              activePanel === "search" && isMobileOpen
                ? "bg-white/10 text-zinc-200"
                : ""
            }`}>
            Search
          </button>
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden h-full shrink-0 border-r border-white/5 bg-[#111111] md:flex">
        {renderSidebarInner({})}
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          <aside className="fixed left-0 top-0 z-50 flex h-dvh w-[min(88vw,300px)] flex-col overflow-hidden bg-[#111111] shadow-2xl transition-transform">
            {renderSidebarInner({ isMobile: true })}
          </aside>
        </>
      )}

      {/* CREATE NOTE MODAL (Notion style minimal popup) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm sm:items-start sm:pt-24">
          <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl">
            <div className="border-b border-white/5 bg-[#1a1a1a] p-2">
              <input
                type="text"
                autoFocus
                placeholder="Ketik judul catatan baru..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateNote()}
                className="w-full bg-transparent px-4 py-3 text-[15px] font-medium text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between bg-[#111111] px-5 py-4 text-xs">
              <span className="text-zinc-500">Create new note</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg px-4 py-2 font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200">
                  Batal
                </button>
                <button
                  onClick={handleCreateNote}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-500">
                  Buat Catatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE NOTE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
            <div className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <FiTrash2 size={20} />
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-[15px] font-semibold text-zinc-100">
                  Hapus catatan ini?
                </h2>
                <p className="mb-6 text-[13px] leading-relaxed text-zinc-400">
                  Catatan ini akan dipindahkan ke Trash. Anda masih bisa
                  memulihkannya nanti sebelum dihapus permanen.
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="rounded-lg px-4 py-2 text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/5">
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-lg bg-red-500 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-red-600">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}