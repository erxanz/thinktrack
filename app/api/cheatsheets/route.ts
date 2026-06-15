import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    // Jika dipanggil dari halaman utama, topicId akan kosong, jadi ia memuat SEMUA data
    let whereClause = {};
    if (topicId) {
      whereClause = { subtopic: { topicId: topicId } };
    }

    const cheatsheets = await prisma.microCheatsheet.findMany({
      where: whereClause,
      include: {
        subtopic: true
      },
      orderBy: {
        createdAt: 'desc' // Mengurutkan catatan dari yang paling baru
      }
    });

    return NextResponse.json({ success: true, cheatsheets });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}