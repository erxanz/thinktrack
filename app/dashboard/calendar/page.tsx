import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import CalendarWorkspace from "@/components/calendar/CalendarWorkspace";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      scheduledAt: { not: null },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      content: true,
      scheduledAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <CalendarWorkspace
      initialNotes={notes.map((note) => ({
        ...note,
        scheduledAt: note.scheduledAt?.toISOString() ?? null,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      }))}
    />
  );
}