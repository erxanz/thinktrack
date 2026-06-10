import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: Request, { params }: { params: Promise<{ subtopicId: string }> }) {
  const { subtopicId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const result = await prisma.exerciseResult.findUnique({
    where: { userId_subtopicId: { userId: user.id, subtopicId } }
  });

  return NextResponse.json({ result });
}

export async function POST(request: Request, { params }: { params: Promise<{ subtopicId: string }> }) {
  const { subtopicId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await request.json();
  const { score, userAnswers, detailedAnalysis } = body;

  const result = await prisma.exerciseResult.upsert({
    where: { userId_subtopicId: { userId: user.id, subtopicId } },
    update: { score, userAnswers, detailedAnalysis },
    create: { userId: user.id, subtopicId, score, userAnswers, detailedAnalysis }
  });

  return NextResponse.json({ result });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ subtopicId: string }> }) {
  const { subtopicId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  
  await prisma.exerciseResult.deleteMany({
    where: { userId: user!.id, subtopicId }
  });

  return NextResponse.json({ success: true });
}