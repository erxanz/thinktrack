/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

interface AIRequest {
  provider: string;
  model: string;
  prompt: string;
  instruction?: string;
}

const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  gemini: "gemini-2.5-flash", // <-- Menggunakan 2.5-flash sebagai default
  grok: "llama-3.3-70b-versatile",
  groq: "llama-3.3-70b-versatile",
};

function normalizeGeminiModel(model: string) {
  let normalized = (model || "").trim().toLowerCase();

  // Bersihkan awalan models/ jika ada
  if (normalized.startsWith("models/")) {
    normalized = normalized.replace("models/", "");
  }

  // Jika kosong atau memakai nama lama, paksa ke 2.5-flash
  if (!normalized || normalized === "gemini-pro") {
    return "gemini-2.5-flash";
  }

  // Normalisasi penulisan spasi ke strip
  if (normalized === "gemini 2.5 flash") {
    return "gemini-2.5-flash";
  }

  if (normalized.includes("1.5-pro")) {
    return "gemini-1.5-pro";
  }

  return normalized;
}

function getProviderFromModel(model: string): string {
  const m = (model || "").toLowerCase();
  if (m.includes("gemini")) return "gemini";
  if (m.includes("llama") || m.includes("grok") || m.includes("groq"))
    return "groq";
  return "gemini";
}

function resolveProviderAndModel(
  requestedProvider: string,
  requestedModel: string,
  aiSettings: {
    apiKey: string | null;
  },
) {
  const provider = (requestedProvider || "").trim().toLowerCase();

  const providerHasKey = (candidate: string) => {
    switch (candidate) {
      case "gemini":
        return (
          Boolean(aiSettings.apiKey) || Boolean(process.env.GEMINI_API_KEY)
        );
      case "grok":
      case "groq":
        return Boolean(aiSettings.apiKey) || Boolean(process.env.GROQ_API_KEY);
      default:
        return false;
    }
  };

  const resolvedProvider = providerHasKey(provider)
    ? provider
    : ["groq", "grok", "gemini"].find(providerHasKey) || provider || "gemini";

  const resolvedModel =
    resolvedProvider === provider
      ? requestedModel
      : PROVIDER_DEFAULT_MODELS[resolvedProvider] || requestedModel;

  return { provider: resolvedProvider, model: resolvedModel };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = (await request.json()) as AIRequest;
    const { model, prompt, instruction } = body; // Pakai const untuk yang tidak berubah
    let { provider } = body; // Pakai let khusus untuk provider karena nilainya bisa ditimpa

    let aiSettings = await prisma.aISettings.findUnique({
      where: { userId: user.id },
    });

    if (!aiSettings) {
      aiSettings = await prisma.aISettings.create({
        data: {
          userId: user.id,
          activeModel: "gemini-2.5-flash", // Menyimpan 2.5-flash ke database jika belum ada
        },
      });
    }

    if (!provider) {
      provider = getProviderFromModel(model || aiSettings.activeModel);
    }
    const targetModel = model || aiSettings.activeModel;

    let apiKey: string | null = null;
    let response: any;
    const resolved = resolveProviderAndModel(provider, targetModel, aiSettings);

    switch (resolved.provider) {
      case "gemini":
        apiKey = aiSettings.apiKey || process.env.GEMINI_API_KEY || null;
        response = await callGemini(
          resolved.model,
          prompt,
          instruction,
          apiKey,
        );
        break;

      case "grok":
      case "groq":
        apiKey = aiSettings.apiKey || process.env.GROQ_API_KEY || null;
        response = await callGroq(resolved.model, prompt, instruction, apiKey);
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported provider" },
          { status: 400 },
        );
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error calling AI provider:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

async function callGemini(
  model: string,
  prompt: string,
  instruction: string | undefined,
  apiKey: string | null,
) {
  if (!apiKey) throw new Error("Gemini API key not configured");

  const requestedModel = normalizeGeminiModel(model);

  // Daftar fallback yang dipersingkat. Jika 2.5-flash gagal, ia akan otomatis mundur ke 1.5-flash
  const fallbackCandidates = [
    requestedModel,
    "gemini-2.5-flash",
    "gemini-1.5-flash",
  ].filter((value, index, arr) => value && arr.indexOf(value) === index);

  // Coba v1beta terlebih dahulu karena gemini-2.5-flash biasanya tersedia di versi beta
  const apiVersions = ["v1beta", "v1"];
  let lastError = "";

  // Deteksi apakah user butuh output JSON
  const isJsonExpected = (prompt + (instruction || ""))
    .toLowerCase()
    .includes("json");

  for (const apiVersion of apiVersions) {
    for (const candidate of fallbackCandidates) {
      const payload: any = {
        contents: [{ parts: [{ text: prompt }] }],
      };

      if (instruction) {
        payload.systemInstruction = { parts: [{ text: instruction }] };
      }

      if (isJsonExpected) {
        payload.generationConfig = { responseMimeType: "application/json" };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/${apiVersion}/models/${candidate}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

        return { provider: "gemini", model: candidate, text };
      }

      const errorPayload = await response.text();
      lastError = `${response.status} ${response.statusText}${
        errorPayload ? ` - ${errorPayload}` : ""
      }`;
    }
  }

  throw new Error(`Gemini API error: ${lastError || "Unknown error"}`);
}

async function callGroq(
  model: string,
  prompt: string,
  instruction: string | undefined,
  apiKey: string | null,
) {
  if (!apiKey) throw new Error("Groq API key not configured");

  const groq = createGroq({ apiKey });
  const result = await generateText({
    model: groq(model),
    prompt,
    ...(instruction ? { system: instruction } : {}),
  });

  return { provider: "groq", model, text: result.text || "No response" };
}
