// app/api/notes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!currentUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { title, content, scheduledAt, editorMode, tags, pinned, status } = await req.json();

    const note = await prisma.note.findFirst({
      where: { id, userId: currentUser.id, deletedAt: null },
    });

    if (!note) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title: title ?? note.title,
        content: content ?? note.content,
        editorMode: editorMode ?? note.editorMode,
        scheduledAt:
          scheduledAt === undefined
            ? note.scheduledAt
            : scheduledAt
              ? new Date(scheduledAt)
              : null,
        tags:
          tags === undefined
            ? note.tags
            : Array.isArray(tags)
              ? tags.filter((tag: unknown) => typeof tag === "string" && tag.trim())
              : note.tags,
        pinned: typeof pinned === "boolean" ? pinned : note.pinned,
        status:
          status === undefined
            ? note.status
            : status === "draft" || status === "archived" || status === "active"
              ? status
              : note.status,
      },
    });

    return NextResponse.json(updatedNote, { status: 200 });
  } catch (error) {
    console.error("PUT /api/notes/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!currentUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const note = await prisma.note.findFirst({
      where: { id, userId: currentUser.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

    if (force) {
      await prisma.note.delete({ where: { id } });
      return NextResponse.json({ message: "Permanently deleted" }, { status: 200 });
    }

    await prisma.note.update({ where: { id }, data: { deletedAt: new Date() } });

    return NextResponse.json({ message: "Moved to trash" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!currentUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (body?.action === "restore") {
      const note = await prisma.note.findFirst({
        where: { id, userId: currentUser.id, deletedAt: { not: null } },
      });

      if (!note) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const restored = await prisma.note.update({ where: { id }, data: { deletedAt: null } });
      return NextResponse.json(restored, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/notes/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
