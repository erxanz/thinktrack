/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { getGenerateMateriPrompt } from "@/lib/ai-prompts/generate-materi-prompt";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";


const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  gemini: "gemini-2.5-flash",
  grok: "llama-3.3-70b-versatile",
  groq: "llama-3.3-70b-versatile",
};

function resolveProviderAndModel(
  requestedProvider: string,
  requestedModel: string,
  aiSettings: {
    apiKey: string | null;
    activeModel: string;
  }
) {
  const provider = (requestedProvider || "").trim().toLowerCase();

  const providerHasKey = (candidate: string) => {
    switch (candidate) {
      case "gemini":
        return Boolean(aiSettings.apiKey) || Boolean(process.env.GEMINI_API_KEY);
      case "grok":
      case "groq":
        return Boolean(aiSettings.apiKey) || Boolean(process.env.GROQ_API_KEY);
      default:
        return false;
    }
  };

  const resolvedProvider = providerHasKey(provider)
    ? provider
    : ["groq", "grok", "gemini"].find(providerHasKey) || "gemini";

  const resolvedModel =
    resolvedProvider === provider
      ? requestedModel
      : PROVIDER_DEFAULT_MODELS[resolvedProvider] || requestedModel;

  return { provider: resolvedProvider, model: resolvedModel };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      title: string;
      numSubtopics?: number;
      numExercisesPerSubtopic?: number;
    };

    if (!body?.title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const topic = await prisma.topic.create({
      data: {
        title: body.title,
        userId: session.user.id,
      },
    });

    let aiSettings = await prisma.aISettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!aiSettings) {
      aiSettings = await prisma.aISettings.create({
        data: {
          userId: session.user.id,
          activeModel: "gemini-2.5-flash",
        },
      });
    }

    // fallback persona (gunakan field dari session jika ada)
    const cognitiveMode = (session.user as unknown as { cognitiveMode?: string } | undefined)?.cognitiveMode || "REMAJA";


    const prompt = getGenerateMateriPrompt({
      title: body.title,
      cognitiveMode,
      numSubtopics: body.numSubtopics ?? 3,
      numExercisesPerSubtopic: body.numExercisesPerSubtopic ?? 3,
    });

    const { provider, model } = resolveProviderAndModel(
      "gemini",
      aiSettings.activeModel,
      {
        apiKey: aiSettings.apiKey,
        activeModel: aiSettings.activeModel,
      }
    );

    let rawText = "";

    // Untuk menghindari dependency ai-sdk provider tambahan yang belum dipasang,
    // gunakan endpoint /api/ai yang sudah teruji untuk semua provider.
    // Prefer URL internal agar tidak bergantung NEXT_PUBLIC_APP_URL/VERCEL_URL
    // Di Next.js server route, kita bisa pakai request-origin bila ada.
    const origin = req.headers.get("x-forwarded-proto")
      ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("host")}`
      : req.headers.get("host")
        ? `http://${req.headers.get("host")}`
        : null;

    const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "";

    if (!origin && !fallbackBaseUrl) {
      return NextResponse.json(
        {
          error: "Cannot resolve base URL for /api/ai",
          hint: "Set NEXT_PUBLIC_APP_URL or ensure reverse proxy sends x-forwarded-proto + host",
        },
        { status: 500 }
      );
    }

    const baseUrl = origin || fallbackBaseUrl;
    const aiUrl = baseUrl.startsWith("http") ? `${baseUrl}/api/ai` : `https://${baseUrl}/api/ai`;

    const aiResponse = await fetch(aiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model,
        prompt,
        instruction: undefined,
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.json().catch(() => null);
      return NextResponse.json(
        {
          error: "AI generation failed",
          status: aiResponse.status,
          aiError: err?.error || null,
          aiRaw: err || null,
        },
        { status: aiResponse.status || 500 }
      );
    }

    const aiData = await aiResponse.json();
    rawText = aiData?.text || (typeof aiData === "string" ? aiData : "");
    if (!rawText) {
      throw new Error("AI returned empty response");
    }


    // parse JSON safely
    const parsed = (() => {
      try {
        return JSON.parse(rawText);
      } catch {
        // attempt to extract JSON substring
        const start = rawText.indexOf("{");
        const end = rawText.lastIndexOf("}");
        if (start >= 0 && end > start) {
          return JSON.parse(rawText.slice(start, end + 1));
        }
        throw new Error("AI output is not valid JSON");
      }
    })() as {
      subtopics: Array<{
        title: string;
        level: "Mudah" | "Menengah" | "Sulit" | string;
        content: string;
        exercises: Array<{
          type: string;
          question: string;
          answer: string;
          explanation: string;
        }>;
      }>;
    };

    const createdSubtopics = await Promise.all(
      (parsed.subtopics || []).map((st) =>
        prisma.subtopic.create({
          data: {
            topicId: topic.id,
            title: st.title,
            level: st.level || "Menengah",
            content: st.content || "",
          },
        })
      )
    );

    // exercises
    const exerciseCreates: any[] = [];
    parsed.subtopics?.forEach((st, idx) => {
      const subtopic = createdSubtopics[idx];
      if (!subtopic) return;
      (st.exercises || []).forEach((ex) => {
        exerciseCreates.push(
          prisma.exercise.create({
            data: {
              subtopicId: subtopic.id,
              type: ex.type,
              question: ex.question,
              answer: ex.answer,
              explanation: ex.explanation,
            },
          })
        );
      });
    });

    await Promise.all(exerciseCreates);

    return NextResponse.json({
      topic,
      subtopics: createdSubtopics,
    });
  } catch (error: any) {
    console.error("Generate materi error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },

      { status: 500 }
    );
  }
}

