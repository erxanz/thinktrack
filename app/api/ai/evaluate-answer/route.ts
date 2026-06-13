import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, expectedAnswer, selectedOption, scratchpad, type } =
      await req.json();

    const prompt = `Anda adalah Tutor AI Evaluator Tingkat Tinggi di platform ThinkTrack yang melakukan Cognitive Task Analysis.
Tugas Anda adalah memvalidasi apakah siswa benar-benar memahami soal atau hanya menebak asal.

Soal: "${question}"
Kunci Jawaban Resmi: "${expectedAnswer}"
Tipe Soal: "${type}"
Pilihan Opsi Siswa: "${selectedOption || "Tidak ada (Esai)"}"
Coretan/Alur Berpikir Siswa: "${scratchpad || "Tidak ada"}"

ATURAN EVALUASI PEDAGOGIS MUTLAK:
1. JIKA PILIHAN GANDA (type mengandung 'ganda'):
   - Periksa apakah "Pilihan Opsi Siswa" sesuai dengan huruf Kunci Jawaban Resmi.
   - Periksa "Coretan/Alur Berpikir Siswa". Jika bagian coretannya berisi teks asal-asalan (seperti ketikan acak 'asdfas', 'ngasal', kata-kata tidak bermakna), tidak relevan dengan konteks soal, atau kosong, Anda WAJIB menyatakan "is_correct": false dan memberikan "score" maksimal 20, MESKIPUN pilihan opsinya BENAR. Ini menandakan siswa menebak beruntung (guessing).
2. JIKA ESAI:
   - Evaluasi keselarasan semantik alur berpikir siswa dengan Kunci Jawaban Resmi. Jika tidak nyambung atau asal-asalan, "is_correct" WAJIB false dengan skor 0-20.
3. GAYA BAHASA: Tulis "feedback" dengan nada Growth Mindset. Bongkar kesalahan logikanya dengan tegas namun tetap memotivasi mereka untuk mencoba lagi.

Kembalikan HANYA format JSON valid tanpa markdown atau teks tambahan:
{
  "is_correct": boolean,
  "score": number,
  "feedback": "string"
}`;

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
          temperature: 0.1, 
        }),
      },
    );

    if (!response.ok) throw new Error("Gagal menghubungi server Groq");

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonString = content.replace(/```json|```/gi, "").trim();

    return NextResponse.json(JSON.parse(jsonString));
  } catch (error: any) {
    console.error("AI Evaluator Error:", error);
    return NextResponse.json(
      { error: "Gagal mengevaluasi jawaban" },
      { status: 500 },
    );
  }
}
