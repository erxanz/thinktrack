/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // <-- Import createPortal
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiTrash2, FiRefreshCw, FiLoader } from "react-icons/fi";

export default function TrashActions({ id }: { id: string }) {
  const router = useRouter();

  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // State untuk memastikan window/document sudah tersedia (mencegah error Next.js SSR)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRestore = async () => {
    try {
      setIsRestoring(true);

      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "restore",
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
      toast.success(data?.message || "Catatan dikembalikan");
      router.refresh();
    } catch (error) {
      console.error("Restore error:", error);
      toast.error("Terjadi kesalahan saat mengembalikan");
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = async () => {
    try {
      setIsDeleting(true);

      const res = await fetch(`/api/notes/${id}?force=true`, {
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
      toast.success(data?.message || "Catatan dihapus permanen");
      setShowDeleteConfirm(false);
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Terjadi kesalahan saat menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* Restore */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRestore();
          }}
          disabled={isRestoring || isDeleting}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#313131] bg-[#252526] px-2.5 text-xs font-medium text-zinc-300 transition hover:bg-[#2f2f2f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isRestoring ? (
            <FiLoader size={13} className="animate-spin" />
          ) : (
            <FiRefreshCw size={13} />
          )}

          <span className="hidden sm:inline">
            {isRestoring ? "Restore..." : "Restore"}
          </span>
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          disabled={isDeleting || isRestoring}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60">
          {isDeleting ? (
            <FiLoader size={13} className="animate-spin" />
          ) : (
            <FiTrash2 size={13} />
          )}

          <span className="hidden sm:inline">
            {isDeleting ? "Delete..." : "Delete"}
          </span>
        </button>
      </div>

      {/* DELETE CONFIRM MODAL MENGGUNAKAN PORTAL */}
      {showDeleteConfirm &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(false);
            }}>
            <div
              className="w-full max-w-md bg-[#252526] border border-[#454545] shadow-2xl p-4 rounded"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-3">
                <div className="text-[#f14c4c] mt-1 shrink-0">
                  <FiTrash2 size={28} />
                </div>

                <div className="flex-1">
                  <h2 className="text-[14px] text-white mb-2 font-medium">
                    Hapus permanen catatan ini?
                  </h2>

                  <p className="text-[13px] text-[#cccccc] mb-4">
                    Tindakan ini tidak dapat dibatalkan.
                  </p>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(false);
                      }}
                      disabled={isDeleting}
                      className="px-4 py-1.5 text-[13px] text-white bg-[#37373d] hover:bg-[#4d4d4d] rounded disabled:opacity-60">
                      Batal
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePermanentDelete();
                      }}
                      disabled={isDeleting}
                      className="px-4 py-1.5 text-[13px] text-white bg-[#f14c4c] hover:bg-[#d63e3e] rounded disabled:opacity-60 flex items-center gap-2">
                      {isDeleting && (
                        <FiLoader size={13} className="animate-spin" />
                      )}
                      {isDeleting ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body, // <-- Render modal langsung ke <body> tag
        )}
    </>
  );
}
