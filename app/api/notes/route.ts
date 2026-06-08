// app/api/notes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: { userId: currentUser.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      editorMode: true,
      scheduledAt: true,
      tags: true,
      pinned: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      userId: true,
    },
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, scheduledAt, editorMode, tags, pinned, status } = await req.json();
  const note = await prisma.note.create({
    data: {
      title,
      content,
      editorMode: editorMode ?? "text",
      userId: currentUser.id,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      tags: Array.isArray(tags)
        ? tags.filter((tag: unknown) => typeof tag === "string" && tag.trim())
        : [],
      pinned: typeof pinned === "boolean" ? pinned : false,
      status:
        status === "draft" || status === "archived" || status === "active"
          ? status
          : "active",
    },
  });

  return NextResponse.json(note);
}