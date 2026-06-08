/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
// Hapus import NoteStatus sepenuhnya

function stripMarkdown(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeList(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value: string | null) {
  if (value === null) return null;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function scoreNote(
  note: {
    title: string;
    content: string;
    pinned: boolean;
    updatedAt: Date;
  },
  query: string,
) {
  if (!query) return 0;

  const normalizedQuery = query.toLowerCase();
  const title = note.title.toLowerCase();
  const content = note.content.toLowerCase();

  let score = 0;

  if (title === normalizedQuery) score += 120;
  if (title.startsWith(normalizedQuery)) score += 90;
  if (title.includes(normalizedQuery)) score += 70;
  if (content.includes(normalizedQuery)) score += 45;

  if (note.pinned) score += 5;

  return score;
}

export async function GET(request: NextRequest) {
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

  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim() ?? "";
  const tags = normalizeList(params.get("tags"));

  // Perbaikan validasi status tanpa menggunakan tipe Enum dari Prisma
  const rawStatus = params.get("status");
  const validStatuses = ["draft", "active", "archived"];
  const status =
    rawStatus && rawStatus !== "all" && validStatuses.includes(rawStatus)
      ? rawStatus
      : null;

  const pinned = parseBoolean(params.get("pinned"));
  const from = parseDate(params.get("from"));
  const to = parseDate(params.get("to"));

  const notes = await prisma.note.findMany({
    where: {
      userId: currentUser.id,
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tags.length ? { tags: { hasEvery: tags } } : {}),
      ...(status ? { status: status as any } : {}),
      ...(pinned === null ? {} : { pinned }),
      ...(from || to
        ? {
            updatedAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      content: true,
      updatedAt: true,
      createdAt: true,
      scheduledAt: true,
      editorMode: true,
      tags: true,
      pinned: true,
      status: true,
    },
    take: 100,
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  const items = notes
    .map((note) => ({
      ...note,
      excerpt:
        stripMarkdown(note.content).slice(0, 220) ||
        "Catatan ini belum memiliki isi.",
      score: scoreNote(note, query),
    }))
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
      return +new Date(b.updatedAt) - +new Date(a.updatedAt);
    });

  return NextResponse.json({
    items,
    total: items.length,
  });
}
