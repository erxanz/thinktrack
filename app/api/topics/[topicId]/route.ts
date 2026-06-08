import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        subtopics: {
          orderBy: { title: "asc" },
        },
      },
    });

    if (!topic || topic.userId !== session.user.id) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // fetch exercises grouped by subtopic
    const exercises = await prisma.exercise.findMany({
      where: {
        subtopic: {
          topicId: topic.id,
        },
      },
      select: {
        id: true,
        subtopicId: true,
        type: true,
        question: true,
        answer: true,
        explanation: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const exercisesBySubtopic: Record<
      string,
      Array<{ id: string; type: string; question: string; answer: string; explanation: string }>
    > = {};

    for (const ex of exercises) {
      const subId = ex.subtopicId;
      if (!exercisesBySubtopic[subId]) {
        exercisesBySubtopic[subId] = [];
      }
      exercisesBySubtopic[subId].push({
        id: ex.id,
        type: ex.type,
        question: ex.question,
        answer: ex.answer,
        explanation: ex.explanation,
      });
    }

    return NextResponse.json({
      topic,
      subtopics: topic.subtopics,
      exercisesBySubtopic,
    });
  } catch (error) {
    console.error("GET topic error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

