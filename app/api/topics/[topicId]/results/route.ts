import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: Request, { params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const subtopics = await prisma.subtopic.findMany({ where: { topicId } });
  const subtopicIds = subtopics.map(st => st.id);

  const results = await prisma.exerciseResult.findMany({
    where: { userId: user.id, subtopicId: { in: subtopicIds } }
  });

  return NextResponse.json({ results });
}