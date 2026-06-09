import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subtopicId: string }> }
) {
  const { subtopicId } = await params;

  try {
    const subtopic = await prisma.subtopic.findUnique({
      where: { id: subtopicId }
    });

    if (!subtopic) {
      return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });
    }

    const prompt = `Anda adalah Tutor AI ThinkTrack EdTech. Buat 5 soal latihan pilihan ganda berdasarkan materi ini:
Judul: "${subtopic.title}"
Isi: "${subtopic.content}"

Wajib berikan jawaban dalam format JSON murni (array of objects), TIDAK BOLEH ada teks lain, markdown, atau pembuka/penutup.
Format:
[
  {
    "id": 1,
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "A"
  }
]`;

    // MENGGANTI URL KE GROQ API
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY tidak ditemukan di .env" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // Atau gunakan "mixtral-8x7b-32768"
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("Gagal menghubungi server Groq");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parsing JSON dari string hasil Groq
    const generatedQuestions = JSON.parse(content);

    return NextResponse.json({
      subtopicId,
      questions: generatedQuestions
    });

  } catch (error) {
    console.error("Error Groq API:", error);
    return NextResponse.json({ error: "Gagal membuat soal dengan Groq" }, { status: 500 });
  }
}