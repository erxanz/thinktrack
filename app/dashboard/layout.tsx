// app/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch daftar catatan langsung di Server Component
  const notes = await prisma.note.findMany({
    where: { userId: session.user.id, deletedAt: null },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      scheduledAt: true,
      tags: true,
      pinned: true,
      status: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Konversi Date ke ISO String agar aman di-passing ke Client Component (Sidebar)
  const serializedNotes = notes.map((note) => ({
    ...note,
    updatedAt: note.updatedAt.toISOString(),
    scheduledAt: note.scheduledAt ? note.scheduledAt.toISOString() : null,
  }));

  return (
    <div className="flex h-screen bg-[#0e0e0e] font-sans text-zinc-100 overflow-hidden">
      <Sidebar notes={serializedNotes} />
      <main className="flex-1 flex min-w-0 flex-col h-full bg-[#0a0a0a] shadow-inner border-l border-zinc-800/50 relative pt-10 md:pt-0">
        {children}
      </main>
    </div>
  );
}
