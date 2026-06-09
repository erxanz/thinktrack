import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ subtopicId: string }> }
) {
  try {
    const { subtopicId } = await params;
    console.log("👉 [API TRIGGERED] Mencari materi dengan ID:", subtopicId);

    const subtopic = await prisma.subtopic.findUnique({
      where: { id: subtopicId },
    });

    if (!subtopic) {
      console.log("❌ [GAGAL] Materi tidak ditemukan di Database Prisma!");
      return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });
    }

    console.log("✅ [SUKSES] Materi ditemukan:", subtopic.title);
    return NextResponse.json(subtopic);

  } catch (error) {
    console.error("🔥 [ERROR SERVER]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}