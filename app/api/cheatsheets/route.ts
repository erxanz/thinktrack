/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    const whereClause: any = {
      userId: session.user.id,
    };

    if (topicId) {
      whereClause.subtopic = {
        topicId,
      };
    }

    const cheatsheets = await prisma.microCheatsheet.findMany({
      where: whereClause,
      include: {
        subtopic: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      cheatsheets,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
