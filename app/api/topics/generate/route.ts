/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { getGenerateMateriPrompt } from "@/lib/ai-prompts/generate-materi-prompt";

const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  gemini: "gemini-3.1-flash-lite", // Default menggunakan model gratis terbaru
  groq: "llama-3.3-70b-versatile",
  grok: "llama-3.3-70b-versatile",
};

function sanitizeModel(provider: string, model: string) {
  if (provider === "gemini") {
    // Izinkan gemini-3.1-flash-lite dan gemini-3.1-flash-lite.
    // Jika user menggunakan model lama seperti gemini-pro, paksa pindah ke 3-flash.
    if (
      !model.includes("gemini-3.1-flash-lite") &&
      !model.includes("gemini-3.1-flash-lite")
    ) {
      return "gemini-3.1-flash-lite";
    }
  }

  return model;
}

function resolveProviderAndModel(
  requestedProvider: string,
  requestedModel: string,
  aiSettings: {
    apiKey: string | null;
    activeModel: string;
  },
) {
  const provider = (requestedProvider || "").trim().toLowerCase();

  const providerHasKey = (candidate: string) => {
    switch (candidate) {
      case "gemini":
        return (
          Boolean(aiSettings.apiKey) || Boolean(process.env.GEMINI_API_KEY)
        );

      case "groq":
      case "grok":
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
      ? sanitizeModel(provider, requestedModel)
      : PROVIDER_DEFAULT_MODELS[resolvedProvider];

  return {
    provider: resolvedProvider,
    model: resolvedModel,
  };
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
      where: {
        userId: session.user.id,
      },
    });

    if (!aiSettings) {
      aiSettings = await prisma.aISettings.create({
        data: {
          userId: session.user.id,
          activeModel: "gemini-3.1-flash-lite", // Default fallback pembuatan settings diset ke 3-flash
        },
      });
    }

    const cognitiveMode =
      (
        session.user as unknown as {
          cognitiveMode?: string;
        }
      )?.cognitiveMode || "REMAJA";

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
      },
    );

    const host = req.headers.get("host");

    const protocol = req.headers.get("x-forwarded-proto") || "http";

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (host ? `${protocol}://${host}` : null);

    if (!baseUrl) {
      return NextResponse.json(
        {
          error: "Cannot determine base URL",
        },
        { status: 500 },
      );
    }

    const cookieHeader = req.headers.get("cookie") || "";

    const aiResponse = await fetch(`${baseUrl}/api/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        provider,
        model,
        prompt,
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.json().catch(() => null);

      console.error("AI ERROR:", err);

      return NextResponse.json(
        {
          error: "AI generation failed",
          aiError: err?.error,
          aiRaw: err,
        },
        { status: aiResponse.status },
      );
    }

    const aiData = await aiResponse.json();

    const rawText = aiData?.text || (typeof aiData === "string" ? aiData : "");

    if (!rawText) {
      throw new Error("AI returned empty response");
    }

    console.log("START RAW AI OUTPUT");
    console.log(rawText);
    console.log("END RAW AI OUTPUT");

    // Bersihkan teks dari Markdown terlebih dahulu
    const cleanedText = rawText.replace(/```json|```/gi, "").trim();

    let parsed: any;

    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      // Fallback index manual
      const start = cleanedText.indexOf("{");
      const end = cleanedText.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("AI output is not valid JSON");
      }

      parsed = JSON.parse(cleanedText.slice(start, end + 1));
    }

    const createdSubtopics = await Promise.all(
      (parsed.subtopics || []).map((subtopic: any) =>
        prisma.subtopic.create({
          data: {
            topicId: topic.id,
            title: subtopic.title,
            level: subtopic.level || "Menengah",
            content: subtopic.content || "",
          },
        }),
      ),
    );

    const exercisePromises: Promise<any>[] = [];

    parsed.subtopics?.forEach((subtopic: any, index: number) => {
      const created = createdSubtopics[index];

      if (!created) return;

      (subtopic.exercises || []).forEach((exercise: any) => {
        exercisePromises.push(
          prisma.exercise.create({
            data: {
              subtopicId: created.id,
              type: exercise.type || "essay",
              question: exercise.question || "",
              answer: exercise.answer || "",
              explanation: exercise.explanation || "",
            },
          }),
        );
      });
    });

    await Promise.all(exercisePromises);

    return NextResponse.json({
      success: true,
      topic,
      subtopics: createdSubtopics,
    });
  } catch (error: any) {
    console.error("Generate materi error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
