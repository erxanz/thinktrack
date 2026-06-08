import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  gemini: "gemini-2.5-flash",
  grok: "llama-3.3-70b-versatile",
  groq: "llama-3.3-70b-versatile",
};

function resolveActiveProvider(settings: {
  geminiApiKey?: string | null;
  grokApiKey?: string | null;
  activeProvider?: string | null;
}) {
  const providerHasKey = (provider: string) => {
    switch (provider) {
      case "gemini":
        return Boolean(settings.geminiApiKey);
      case "grok":
      case "groq":
        return Boolean(settings.grokApiKey);
      default:
        return false;
    }
  };

  const requestedProvider = (settings.activeProvider || "gemini").toLowerCase();
  if (providerHasKey(requestedProvider)) {
    return requestedProvider;
  }

  const fallbackProviders = ["groq", "grok", "gemini"];
  return fallbackProviders.find(providerHasKey) || "gemini";
}

export async function GET() {
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

    const aiSettings = (await prisma.aISettings.findUnique({
      where: { userId: user.id },
    })) || {
      id: "",
      userId: user.id,
      geminiApiKey: null,
      grokApiKey: null,
      activeProvider: "gemini",
      activeModel: "gemini-2.5-flash",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(aiSettings);
  } catch (error) {
    console.error("Error fetching AI settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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

    const body = await request.json();
    const {
      geminiApiKey,
      grokApiKey,
      activeProvider,
      activeModel,
    } = body;

    const existingSettings = await prisma.aISettings.findUnique({
      where: { userId: user.id },
    });

    const mergedSettings = {
      geminiApiKey:
        geminiApiKey !== undefined ? geminiApiKey : existingSettings?.geminiApiKey,
      grokApiKey:
        grokApiKey !== undefined ? grokApiKey : existingSettings?.grokApiKey,
      activeProvider: activeProvider !== undefined ? activeProvider : existingSettings?.activeProvider,
      activeModel: activeModel !== undefined ? activeModel : existingSettings?.activeModel,
    };

    const resolvedActiveProvider = resolveActiveProvider(mergedSettings);
    const resolvedActiveModel =
      activeModel !== undefined && activeProvider === resolvedActiveProvider
        ? activeModel
        : PROVIDER_DEFAULT_MODELS[resolvedActiveProvider] || "gemini-2.5-flash";

    const aiSettings = await prisma.aISettings.upsert({
      where: { userId: user.id },
      update: {
        ...(geminiApiKey !== undefined && { geminiApiKey }),
        ...(grokApiKey !== undefined && { grokApiKey }),
        activeProvider: resolvedActiveProvider,
        activeModel: resolvedActiveModel,
      },
      create: {
        userId: user.id,
        geminiApiKey: geminiApiKey || null,
        grokApiKey: grokApiKey || null,
        activeProvider: resolveActiveProvider({
          geminiApiKey: geminiApiKey || null,
          grokApiKey: grokApiKey || null,
          activeProvider,
        }),
        activeModel:
          PROVIDER_DEFAULT_MODELS[
            resolveActiveProvider({
              geminiApiKey: geminiApiKey || null,
              grokApiKey: grokApiKey || null,
              activeProvider,
            })
          ] || "gemini-2.5-flash",
      },
    });

    return NextResponse.json(aiSettings);
  } catch (error) {
    console.error("Error updating AI settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
