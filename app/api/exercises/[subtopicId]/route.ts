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

    const existingExercises = await prisma.exercise.findMany({
      where: { subtopicId: subtopic.id },
      orderBy: { id: "asc" },
    });

    // PERLINDUNGAN BARU: Pastikan jumlah soal pas 5 DAN soal tersebut sudah punya 'concept'
    if (existingExercises.length === 5 && existingExercises[0].concept) {
      return NextResponse.json({
        subtopicId,
        questions: existingExercises,
      });
    } else if (existingExercises.length > 0) {
      // Jika soalnya jadul (concept-nya kosong), HAPUS SEMUA agar AI buat ulang dengan Master Prompt!
      await prisma.exercise.deleteMany({
        where: { subtopicId: subtopic.id },
      });
    }
    // THE MASTER PROMPT
    const prompt = `Anda adalah Arsitek Asesmen Pendidikan Internasional di platform EdTech ThinkTrack. 
Tugas Anda adalah membuat 5 soal latihan yang sangat terkalibrasi berdasarkan materi ini:
Judul: "${subtopic.title}"
Isi: "${subtopic.content}"

ATURAN KOMPETISI (SANGAT KETAT):
1. Anda WAJIB membalas HANYA dengan array JSON berisi tepat 5 objek (3 Pilihan Ganda, 2 Esai).
2. METODE PISA (HOTS): Semua soal dianjurkan dibungkus dalam skenario dunia nyata (Kesehatan, Keuangan, Teknologi, dll) atau studi kasus kritis.
3. DIAGNOSTIC QUESTIONS: Untuk soal pilihan ganda, 3 opsi yang salah TIDAK BOLEH ASAL. Setiap opsi salah harus mewakili miskonsepsi yang logis dan spesifik.
4. Tentukan "concept" dengan MIKRO-KONSEP yang spesifik (maksimal 4 kata). JANGAN MENGGUNAKAN JUDUL MATERI!
5. Tentukan "cognitive_level" menggunakan Taksonomi Bloom (C1, C2, C3, C4, C5, atau C6).
6. GROWTH MINDSET TONE: Gunakan nada apresiatif pada bagian "explanation". Jangan gunakan kata "Salah/Gagal", gunakan pujian atas proses berpikir mereka.

Gunakan EXACTLY format JSON ini:
[
  {
    "type": "pilihan ganda",
    "cognitive_level": "C4",
    "concept": "Aplikasi Pergeseran Garis",
    "question": "Suhu di kota A pada malam hari adalah -4°C. Menjelang pagi, suhu naik 7°C...\\nA. -11°C\\nB. 3°C\\nC. 11°C\\nD. -3°C",
    "answer": "B. 3°C",
    "explanation": "Langkah awalmu menganalisis perubahan suhu sudah bagus! Ingat kembali bahwa suhu naik berarti bergerak ke kanan pada garis bilangan (-4 + 7 = 3). Tetap semangat berlatih penalaran ini ya."
  },
  {
    "type": "Esai",
    "cognitive_level": "C5",
    "concept": "Evaluasi Sifat Komutatif",
    "question": "Budi menghitung 5 - 3 dan 3 - 5 lalu menyimpulkan hasilnya sama. Sebagai tutor, evaluasi kesalahan Budi dan jelaskan alasannya!",
    "answer": "Sifat komutatif tidak berlaku pada pengurangan. 5 - 3 = 2, sedangkan 3 - 5 = -2.",
    "explanation": "Usahamu mengevaluasi logika Budi sangat kritis! Sifat komutatif memang berlaku di penjumlahan, tapi untuk pengurangan hasilnya akan berbeda tanda. Pertahankan cara berpikir kritis ini!"
  }
]`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY tidak ditemukan");

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
          temperature: 0.3,
        }),
      },
    );

    if (!response.ok) throw new Error("Gagal menghubungi server Groq");

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonString = content.replace(/```json|```/gi, "").trim();

    let generatedQuestions = [];
    try {
      const start = jsonString.indexOf("[");
      const end = jsonString.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        generatedQuestions = JSON.parse(jsonString.slice(start, end + 1));
      } else {
        generatedQuestions = JSON.parse(jsonString);
      }
    } catch (e) {
      throw new Error("Format JSON dari AI tidak valid");
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
            concept: q.concept || "Penalaran Konsep",
            cognitiveLevel: q.cognitive_level || "C3", // <-- SIMPAN BLOOM LEVEL
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
