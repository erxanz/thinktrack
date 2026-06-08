/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

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

  const topics = await prisma.topic.findMany({
    where: {
      userId: currentUser.id,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      description: true,
      isCompleted: true,
      createdAt: true,
    },
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  const items = topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    excerpt: topic.description || "Tidak ada deskripsi.",
    updatedAt: topic.createdAt,
    scheduledAt: null,
    editorMode: "text",
    tags: [],
    pinned: false,
    status: topic.isCompleted ? "active" : "draft",
  }));

  return NextResponse.json({
    items,
    total: items.length,
  });
}
