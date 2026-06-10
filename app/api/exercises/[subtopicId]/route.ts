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

    // PERBAIKAN: Instruksi ke AI diubah agar membuat soal Pilihan Ganda DAN Esai!
    const prompt = `Anda adalah Tutor AI ThinkTrack EdTech. Buat total 5 soal latihan berdasarkan materi ini, yang terdiri dari 2 soal Pilihan Ganda dan 3 soal Esai.
Judul: "${subtopic.title}"
Isi: "${subtopic.content}"

Wajib berikan jawaban dalam format JSON murni (array of objects), TIDAK BOLEH ada teks lain, markdown, atau pembuka/penutup.
Format JSON yang WAJIB digunakan:
[
  {
    "type": "pilihan ganda",
    "question": "Pertanyaan soal... (Sertakan opsi A. , B. , C. , D. di dalam teks pertanyaan)",
    "answer": "Kunci jawaban (Misalnya: A. Jawaban)",
    "explanation": "Penjelasan mengapa jawaban tersebut benar"
  },
  {
    "type": "Esai",
    "question": "Pertanyaan soal esai yang membutuhkan analisa atau penjelasan dari materi di atas...",
    "answer": "Kunci jawaban / poin-poin penting yang harus ada",
    "explanation": "Penjelasan lengkap untuk evaluasi jawaban"
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

    const jsonString = content.replace(/```json|```/gi, "").trim();

    let generatedQuestions;
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

    // Simpan soal yang di-generate ke database
    const savedExercises = await Promise.all(
      generatedQuestions.map((q: any) =>
        prisma.exercise.create({
          data: {
            subtopicId: subtopic.id,
            // Jika tipe dari AI tidak ada, default ke pilihan ganda
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
      questions: savedExercises, 
    });
  } catch (error: any) {
    console.error("Error Groq API:", error);
    return NextResponse.json(
      { error: "Gagal membuat soal dengan Groq", details: error.message },
      { status: 500 },
    );
  }
}