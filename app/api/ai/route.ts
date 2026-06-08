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
  gemini: "gemini-2.5-flash",
  grok: "llama-3.3-70b-versatile",
  groq: "llama-3.3-70b-versatile",
};

function normalizeGeminiModel(model: string) {
  let normalized = (model || "").trim().toLowerCase();

  // Accept both raw model ids (gemini-1.5-pro) and API names (models/gemini-1.5-pro).
  if (normalized.startsWith("models/")) {
    normalized = normalized.replace("models/", "");
  }

  if (!normalized || normalized === "gemini-pro") {
    return "gemini-2.5-flash";
  }

  if (normalized === "gemini-1.0-pro") {
    return "gemini-1.5-pro-latest";
  }

  if (normalized === "gemini-1.5-pro" || normalized === "gemini 1.5 pro") {
    return "gemini-1.5-pro-latest";
  }

  if (normalized === "gemini-1.5-flash" || normalized === "gemini 1.5 flash") {
    return "gemini-1.5-flash-latest";
  }

  if (
    normalized === "gemini 3.1 flash-lite" ||
    normalized === "gemini-3.1-flash-lite" ||
    normalized === "3.1 flash-lite" ||
    normalized === "flash-lite"
  ) {
    return "gemini-2.5-flash";
  }

  if (normalized === "gemini 2.5 flash") {
    return "gemini-2.5-flash";
  }

  return normalized;
}

function getProviderFromModel(model: string): string {
  const m = (model || "").toLowerCase();
  if (m.includes("gemini")) return "gemini";
  if (m.includes("llama") || m.includes("grok") || m.includes("groq")) return "groq";
  return "gemini";
}

function resolveProviderAndModel(
  requestedProvider: string,
  requestedModel: string,
  aiSettings: {
    apiKey: string | null;
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
    let { provider, model, prompt, instruction } = body;

    let aiSettings = await prisma.aISettings.findUnique({
      where: { userId: user.id },
    });
    if (!aiSettings) {
      aiSettings = await prisma.aISettings.create({
        data: {
          userId: user.id,
          activeModel: "gemini-2.5-flash",
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
        response = await callGemini(resolved.model, prompt, instruction, apiKey);
        break;

      case "grok":
      case "groq":
        apiKey = aiSettings.apiKey || process.env.GROQ_API_KEY || null;
        response = await callGroq(resolved.model, prompt, instruction, apiKey);
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported provider" },
          { status: 400 }
        );
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error calling AI provider:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

async function callGemini(
  model: string,
  prompt: string,
  instruction: string | undefined,
  apiKey: string | null
) {
  if (!apiKey) throw new Error("Gemini API key not configured");

  const fullPrompt = instruction ? `${instruction}\n\n${prompt}` : prompt;

  const requestedModel = normalizeGeminiModel(model);
  const fallbackCandidates = [
    requestedModel,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ].filter((value, index, arr) => value && arr.indexOf(value) === index);

  const apiVersions = ["v1beta", "v1"];

  let lastError = "";

  for (const apiVersion of apiVersions) {
    for (const candidate of fallbackCandidates) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${apiVersion}/models/${candidate}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
          }),
        }
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

  // If preferred aliases fail, discover allowed models for this API key and retry.
  const availableModels = await listAvailableGeminiModels(apiKey);
  if (availableModels.length > 0) {
    const discoveredCandidates = [
      ...fallbackCandidates.filter((candidate) => availableModels.includes(candidate)),
      ...availableModels,
    ].filter((value, index, arr) => value && arr.indexOf(value) === index);

    for (const candidate of discoveredCandidates) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
          }),
        }
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

async function listAvailableGeminiModels(apiKey: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models : [];

    return models
      .filter((item: any) =>
        Array.isArray(item?.supportedGenerationMethods) &&
        item.supportedGenerationMethods.includes("generateContent")
      )
      .map((item: any) => String(item?.name || "").replace(/^models\//, ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function callGroq(
  model: string,
  prompt: string,
  instruction: string | undefined,
  apiKey: string | null
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
