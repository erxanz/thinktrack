/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/exercises/[subtopicId]/route.ts
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
      return NextResponse.json(
        { error: "Materi tidak ditemukan" },
        { status: 404 },
      );
    }

    // PERBAIKAN 1: Sesuaikan format JSON di prompt dengan schema model Exercise
    const prompt = `Anda adalah Tutor AI ThinkTrack EdTech. Buat 5 soal latihan berdasarkan materi ini:
Judul: "${subtopic.title}"
Isi: "${subtopic.content}"

Wajib berikan jawaban dalam format JSON murni (array of objects), TIDAK BOLEH ada teks lain, markdown, atau pembuka/penutup.
Format:
[
  {
    "type": "pilihan ganda",
    "question": "Pertanyaan soal... (Sertakan opsi A, B, C, D di dalam teks pertanyaan jika ini pilihan ganda)",
    "answer": "Kunci jawaban",
    "explanation": "Penjelasan mengapa jawaban tersebut benar"
  }
]`;

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY tidak ditemukan di .env" },
        { status: 500 },
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // PERBAIKAN 2: Gunakan model terbaru yang sama dengan route generate topics
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Gagal menghubungi server Groq");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // PERBAIKAN 3: Bersihkan tag markdown sebelum melakukan parse
    const jsonString = content.replace(/```json|```/gi, "").trim();

    let generatedQuestions;
    try {
      generatedQuestions = JSON.parse(jsonString);
    } catch (e) {
      // Fallback pemotongan string jika masih terdapat teks selain array JSON
      const start = jsonString.indexOf("[");
      const end = jsonString.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        generatedQuestions = JSON.parse(jsonString.slice(start, end + 1));
      } else {
        throw new Error("Format JSON dari AI tidak valid");
      }
    }

    // PERBAIKAN 4: Simpan soal yang di-generate ke database
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
        }),
      ),
    );

    return NextResponse.json({
      subtopicId,
      questions: savedExercises, // Mengembalikan data dengan ID dari database
    });
  } catch (error: any) {
    console.error("Error Groq API:", error);
    return NextResponse.json(
      { error: "Gagal membuat soal dengan Groq", details: error.message },
      { status: 500 },
    );
  }
}
