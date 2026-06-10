/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subtopicId: string }> },
) {
  const { subtopicId } = await params;

  try {
    const subtopic = await prisma.subtopic.findUnique({
      where: { id: subtopicId },
    });

    if (!subtopic) {
      return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });
    }

    // Cek Database Dulu (Mencegah AI men-generate ulang / scraping)
    const existingExercises = await prisma.exercise.findMany({
      where: { subtopicId: subtopic.id },
      orderBy: { id: 'asc' } 
    });

    if (existingExercises.length > 0) {
      return NextResponse.json({
        subtopicId,
        questions: existingExercises,
      });
    }

    // INSTRUKSI DIPERTEGAS: Wajib batas 5 soal!
    const prompt = `Anda adalah Tutor AI ThinkTrack EdTech. Buat TEPAT 5 soal latihan berdasarkan materi ini. Komposisinya WAJIB: 2 soal Pilihan Ganda dan 3 soal Esai.
Judul: "${subtopic.title}"
Isi: "${subtopic.content}"

ATURAN SANGAT KETAT:
1. HANYA kembalikan array berisi TEPAT 5 object JSON. Jangan lebih dan jangan kurang!
2. TIDAK BOLEH ada teks pembuka/penutup, cukup array JSON mentah.
3. Gunakan format JSON berikut:
[
  {
    "type": "pilihan ganda",
    "question": "Pertanyaan... (Sertakan opsi A. , B. , C. , D. di dalam teks)",
    "answer": "Kunci jawaban (Misalnya: A. Jawaban)",
    "explanation": "Penjelasan mengapa jawaban tersebut benar"
  },
  {
    "type": "Esai",
    "question": "Pertanyaan soal esai...",
    "answer": "Kunci jawaban / poin-poin penting yang harus ada",
    "explanation": "Penjelasan lengkap"
  }
]`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY tidak ditemukan");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5, // Diturunkan sedikit agar AI tidak terlalu kreatif/ngelantur
      }),
    });

    if (!response.ok) throw new Error("Gagal menghubungi server Groq");

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonString = content.replace(/```json|```/gi, "").trim();

    let generatedQuestions = [];
    try {
      generatedQuestions = JSON.parse(jsonString);
    } catch (e) {
      const start = jsonString.indexOf("[");
      const end = jsonString.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        generatedQuestions = JSON.parse(jsonString.slice(start, end + 1));
      } else {
        throw new Error("Format JSON dari AI tidak valid");
      }
    }

    // ==============================================================================
    // PERLINDUNGAN LAPIS 2: POTONG PAKSA JIKA AI NAKAL MEMBUAT LEBIH DARI 5 SOAL
    // ==============================================================================
    if (Array.isArray(generatedQuestions) && generatedQuestions.length > 5) {
      generatedQuestions = generatedQuestions.slice(0, 5);
    }

    const savedExercises = await Promise.all(
      generatedQuestions.map((q: any) =>
        prisma.exercise.create({
          data: {
            subtopicId: subtopic.id,
            type: q.type || "pilihan ganda",
            question: q.question || "",
            answer: q.answer || "",
            explanation: q.explanation || "",
          },
        })
      )
    );

    return NextResponse.json({
      subtopicId,
      questions: savedExercises, 
    });
  } catch (error: any) {
    console.error("Error Groq API:", error);
    return NextResponse.json({ error: "Gagal membuat soal dengan Groq", details: error.message }, { status: 500 });
  }
}