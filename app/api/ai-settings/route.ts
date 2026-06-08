import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Mengambil setting saat halaman dimuat
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
  }

  const settings = await prisma.aISettings.findUnique({
    where: { userId },
    include: { user: { select: { cognitiveMode: true } } },
  });

  return NextResponse.json(settings);
}

// PATCH: Menyimpan perubahan
export async function PATCH(req: Request) {
  try {
    const { userId, apiKey, activeModel, cognitiveMode } = await req.json();

    // Gunakan await langsung tanpa deklarasi const jika hasilnya tidak dipakai
    await prisma.aISettings.upsert({
      where: { userId },
      update: { apiKey, activeModel },
      create: { userId, apiKey, activeModel },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { cognitiveMode },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Patch Settings Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 },
    );
  }
}
