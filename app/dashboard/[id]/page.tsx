// app/dashboard/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { notFound, redirect } from "next/navigation";
import NoteEditorSwitcher from "@/components/editor/NoteEditorSwitcher";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Ambil detail catatan berdasarkan ID dan Pastikan milik user yang login
  const { id } = await params;

  const note = await prisma.note.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  // Jika catatan tidak ada atau bukan miliknya, lemparkan ke halaman 404
  if (!note) notFound();

  return (
    <NoteEditorSwitcher
      noteId={note.id}
      initialTitle={note.title}
      initialContent={note.content}
      initialEditorMode={note.editorMode}
      initialPinned={note.pinned}
      initialStatus={note.status}
      initialTags={note.tags}
    />
  );
}
