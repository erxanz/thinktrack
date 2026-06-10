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

    // CEK DATABASE: Ambil data soal yang sudah pernah dikerjakan
    const existingExercises = await prisma.exercise.findMany({
      where: { subtopicId: subtopic.id },
      orderBy: { id: 'asc' } 
    });

    // PERLINDUNGAN: Jika jumlah soal di database PAS 5, gunakan itu.
    if (existingExercises.length === 5) {
      return NextResponse.json({
        subtopicId,
        questions: existingExercises,
      });
    } else if (existingExercises.length > 0) {
      // Jika jumlahnya kurang/lebih (seperti 3 atau 222), HAPUS SEMUA agar AI buat ulang!
      await prisma.exercise.deleteMany({
        where: { subtopicId: subtopic.id }
      });
    }

    // INSTRUKSI SUPER KETAT: Menyediakan 5 template kosong dengan format A. B. C. D. yang dipaksa enter (\n)
    const prompt = `Anda adalah Tutor AI ThinkTrack EdTech. Buat TEPAT 5 soal latihan berdasarkan materi ini.
Judul: "${subtopic.title}"
Isi: "${subtopic.content}"

ATURAN SANGAT KETAT:
1. Anda WAJIB mengisi 5 template JSON di bawah ini. Tidak boleh menambah atau mengurangi jumlah objeknya.
2. 3 soal pertama WAJIB "pilihan ganda", 2 soal terakhir WAJIB "Esai".
3. TIDAK BOLEH ada teks pembuka/penutup, cukup array JSON mentah.

Gunakan persis format dan jumlah array ini:
[
  {
    "type": "pilihan ganda",
    "question": "Pertanyaan 1...\\nA. Teks Opsi A\\nB. Teks Opsi B\\nC. Teks Opsi C\\nD. Teks Opsi D",
    "answer": "A. Teks Opsi A",
    "explanation": "Penjelasan mengapa jawaban tersebut benar"
  },
  {
    "type": "pilihan ganda",
    "question": "Pertanyaan 2...\\nA. Teks Opsi A\\nB. Teks Opsi B\\nC. Teks Opsi C\\nD. Teks Opsi D",
    "answer": "B. Teks Opsi B",
    "explanation": "Penjelasan mengapa jawaban tersebut benar"
  },
  {
    "type": "pilihan ganda",
    "question": "Pertanyaan 3...\\nA. Teks Opsi A\\nB. Teks Opsi B\\nC. Teks Opsi C\\nD. Teks Opsi D",
    "answer": "C. Teks Opsi C",
    "explanation": "Penjelasan mengapa jawaban tersebut benar"
  },
  {
    "type": "Esai",
    "question": "Pertanyaan soal esai 1...",
    "answer": "Kunci jawaban esai 1",
    "explanation": "Penjelasan lengkap"
  },
  {
    "type": "Esai",
    "question": "Pertanyaan soal esai 2...",
    "answer": "Kunci jawaban esai 2",
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
        temperature: 0.3, 
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