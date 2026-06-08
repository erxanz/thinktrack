/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import NoteEditor from "./NoteEditor";
import NotionEditor from "./NotionEditor";

type EditorMode = "text" | "notion";

interface NoteEditorSwitcherProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
  initialEditorMode: string;
  initialPinned: boolean;
  initialStatus: "draft" | "active" | "archived";
  initialTags: string[];
}

export default function NoteEditorSwitcher({
  noteId,
  initialTitle,
  initialContent,
  initialEditorMode,
  initialPinned,
  initialStatus,
  initialTags,
}: NoteEditorSwitcherProps) {
  const [pinned, setPinned] = useState<boolean>(initialPinned);
  const [status, setStatus] = useState<"draft" | "active" | "archived">(
    initialStatus,
  );
  const [tags, setTags] = useState<string[]>(initialTags);

  const router = useRouter();
  const [editorMode, setEditorMode] = useState<EditorMode>(
    initialEditorMode === "notion" ? "notion" : "text",
  );

  useEffect(() => {
    setEditorMode(initialEditorMode === "notion" ? "notion" : "text");
  }, [initialEditorMode]);

  const handleToggleEditorMode = async (nextMode: EditorMode) => {
    if (nextMode === editorMode) {
      return;
    }

    const response = await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editorMode: nextMode }),
    });

    if (!response.ok) {
      toast.error("Gagal mengganti mode editor");
      return;
    }

    setEditorMode(nextMode);
    toast.success(nextMode === "notion" ? "Berpindah ke Notion mode" : "Berpindah ke Text mode");
    router.refresh();
  };

  if (editorMode === "notion") {
    return (
      <div className="h-full">
        <NotionEditor
          noteId={noteId}
          initialTitle={initialTitle}
          initialContent={initialContent}
          editorMode="notion"
          initialPinned={pinned}
          initialStatus={status}
          initialTags={tags}
          onToggleEditorMode={handleToggleEditorMode}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      <NoteEditor
        noteId={noteId}
        initialTitle={initialTitle}
        initialContent={initialContent}
        editorMode="text"
        initialPinned={pinned}
        initialStatus={status}
        initialTags={tags}
        onToggleEditorMode={handleToggleEditorMode}
      />
    </div>
  );
}