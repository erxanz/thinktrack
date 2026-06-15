import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId, subtopicId, bugData, messages } = await req.json();

    const systemPrompt = `
      Kamu adalah Tutor Socrates (Socrates AI) yang ramah.
      Siswa ini memiliki masalah pemahaman (Bug Kognitif): "${bugData.cognitiveBug}".
      
      Aturan ketat:
      1. JANGAN PERNAH memberikan jawaban langsung.
      2. Beri pertanyaan pancingan (1-2 kalimat saja) untuk mengarahkan logika siswa.
      3. Jika kamu mendeteksi bahwa siswa SUDAH PAHAM berdasarkan balasan terakhirnya, berikan penjelasan singkat penutup, lalu set "isResolved" menjadi true dan buatkan "cheatsheet" (catatan kecil).
      
      Kamu WAJIB membalas dengan JSON valid:
      {
        "reply": "Balasan chatmu ke siswa",
        "isResolved": boolean,
        "cheatsheet": "Catatan singkat inti materi (hanya diisi jika isResolved true, jika belum paham isi null)"
      }
    `;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: chatMessages,
      model: "llama-3.1-8b-instant",
      temperature: 0.6,
      response_format: { type: "json_object" },
    });

    const responseData = JSON.parse(
      chatCompletion.choices[0]?.message?.content || "{}",
    );

    // Jika sudah paham, simpan cheatsheet ke DB
    if (responseData.isResolved && responseData.cheatsheet) {
      await prisma.microCheatsheet.upsert({
        where: { userId_subtopicId: { userId, subtopicId } },
        update: { content: responseData.cheatsheet },
        create: {
          userId,
          subtopicId,
          content: responseData.cheatsheet,
        },
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Socrates Chat Error:", error);
    return NextResponse.json({ error: "Gagal memproses AI" }, { status: 500 });
  }
}
