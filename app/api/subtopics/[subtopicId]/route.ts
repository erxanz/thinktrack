// Lokasi baru: app/api/subtopics/[subtopicId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ subtopicId: string }> },
) {
  try {
    const { subtopicId } = await params;

    const subtopic = await prisma.subtopic.findUnique({
      where: { id: subtopicId },
    });

    if (!subtopic) {
      return NextResponse.json(
        { error: "Materi tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(subtopic);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
