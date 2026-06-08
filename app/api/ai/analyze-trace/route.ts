import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Pastikan install: npm install @google/generative-ai

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      subtopicId,
      steps,
      inputMethod = "mathquill",
    } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cognitiveMode: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    // Persona Prompt
    const personas = {
      ANAK: "Jelaskan seperti guru SD. Gunakan analogi sederhana, imajinatif, hindari istilah teknis yang rumit.",
      REMAJA:
        "Jelaskan dengan bahasa santai namun edukatif. Berikan contoh yang dekat dengan kehidupan sehari-hari remaja.",
      DEWASA:
        "Jelaskan secara formal, fokus pada konsep, logika matematika, dan efisiensi penyelesaian.",
    };

    const personaPrompt = personas[user.cognitiveMode] || personas.REMAJA;

    // Prompt dengan instruksi JSON yang ketat
    const prompt = `
      ${personaPrompt}
      Analisis langkah matematika siswa berikut:
      ${JSON.stringify(steps)}

      Tugas: 
      1. Tentukan apakah langkah penyelesaian tersebut benar atau salah.
      2. Jika salah, temukan langkah ke berapa kesalahan pertama terjadi.
      3. Identifikasi jenis miskonsepsi (misal: "Kesalahan Operasi Dasar", "Aljabar Pindah Ruas", dsb).
      4. Berikan feedback pembelajaran yang membangun sesuai persona.

      Output HANYA dalam format JSON:
      {
        "isCorrect": boolean,
        "errorStep": number | null,
        "type": string,
        "feedback": string
      }
    `;

    // Panggil Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Pembersihan agar hasil AI murni JSON (menghapus markdown)
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const aiResponse = JSON.parse(jsonString);

    // Simpan Thinking Trace ke Database
    await prisma.thinkingTrace.create({
      data: {
        userId,
        subtopicId,
        inputMethod,
        stepData: steps,
        misconceptions: aiResponse,
        status: "analyzed",
      },
    });

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Gagal menganalisis langkah" },
      { status: 500 },
    );
  }
}
