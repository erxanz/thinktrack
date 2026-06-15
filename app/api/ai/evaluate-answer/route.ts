import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { question, expectedAnswer, selectedOption, scratchpad, type, subtopicId } = await req.json();

    const systemPrompt = `
      Kamu adalah AI Evaluator Pendidikan tingkat lanjut untuk platform Knowledge Tracing.
      Tugasmu menilai 1 jawaban siswa dan mengklasifikasikannya ke dalam 3 jenis respon UX:

      [DATA SOAL]
      Tipe: ${type}
      Pertanyaan: ${question}
      Kunci Jawaban Resmi: ${expectedAnswer}
      
      [DATA JAWABAN SISWA]
      Opsi Dipilih: ${selectedOption || "Essay"}
      Coretan/Logika: ${scratchpad}

      ATURAN URUTAN PERCABANGAN RESOLUSI (MUTLAK):
      1. JIKA BENAR: "resolutionType" = "NONE", "cognitiveBug" = null.
      2. LOCAL_BUG (Skenario A): Kesalahan murni pada prosedur/rumus dari materi baru yang sedang dikerjakan ini saja. (UX: Memicu Socrates Chat).
      3. FOUNDATIONAL_GAP (Skenario B): Siswa salah karena lupa konsep matematika dasar dari SUB-BAB SEBELUMNYA yang masih satu rumpun (Misal: Belajar desimal tapi salah di sifat dasar pengurangan/asosiatif). (UX: Memicu Warp Portal).
      4. CUSTOM_BRANCH (Skenario C): Kesalahan fatal di luar lingkup materi rumpun ini atau membutuhkan fondasi prasyarat yang jauh di belakang (Misal: Konversi desimal ke bilangan bulat, perkalian dasar, pecahan dasar). (UX: Memicu Percabangan Baru kustom).

      WAJIB merespon HANYA dengan JSON valid tanpa markdown:
      {
        "score": <angka 0-100>,
        "is_correct": <boolean>,
        "feedback": "<Penjelasan logis>",
        "cognitiveBug": "<Tulis rincian poin kesalahan spesifik, misal: 'Sifat Asosiatif' atau 'Konversi Desimal ke Bilangan Bulat'>",
        "resolutionType": "LOCAL_BUG" | "FOUNDATIONAL_GAP" | "CUSTOM_BRANCH" | "NONE",
        "foundationalTopicTarget": "<Isi string ID sub-bab dasar jika FOUNDATIONAL_GAP, selain itu isi null>"
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const rawContent = chatCompletion.choices[0]?.message?.content || "{}";
    const cleanContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    const evaluationResult = JSON.parse(cleanContent);

    return NextResponse.json({ evaluation: evaluationResult });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengevaluasi" }, { status: 500 });
  }
}