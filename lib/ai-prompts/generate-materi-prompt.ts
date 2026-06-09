export type GenerateMateriInput = {
  title: string;
  cognitiveMode?: string;
  numSubtopics?: number;
  numExercisesPerSubtopic?: number;
};

export const getGenerateMateriPrompt = ({
  title,
  cognitiveMode = "REMAJA",
  numSubtopics = 3,
  numExercisesPerSubtopic = 3,
}: GenerateMateriInput) => `
Kamu adalah asisten pembuat materi edukasi matematika.

Mode kognitif user: ${cognitiveMode}
Judul materi/topik: ${title}

Tugas:
1) Buat dekomposisi sub-bab sebanyak ${numSubtopics}.
2) Untuk SETIAP sub-bab, buat materi penjelasannya SECARA DETAIL DAN KOMPREHENSIF (panjang) di dalam atribut "content".
3) Untuk setiap sub-bab, buat latihan soal sebanyak ${numExercisesPerSubtopic}.

Aturan KHUSUS JSON:
- Output WAJIB JSON valid tanpa awalan/akhiran text apapun (jangan pakai markdown \`\`\`json).
- Dalam atribut "content", kamu WAJIB memberikan materi yang mencakup pendahuluan, rumus, dan contoh.
- PENTING: Karena "content" ada di dalam JSON, JANGAN menekan enter secara langsung. Gunakan "\\n" untuk baris baru.
- JANGAN gunakan kutip ganda (") di dalam teks penjelasan, gunakan kutip tunggal (') agar JSON tidak rusak.

Skema JSON:
{
  "subtopics": [
    {
      "title": "Nama Sub-bab",
      "level": "Mudah" | "Menengah" | "Sulit",
      "content": "Isi materi yang SANGAT PANJANG, detail, dan komprehensif menggunakan format Markdown. Gunakan \\n\\n untuk memisahkan paragraf atau membuat sub-judul (contoh: ### Definisi\\n\\nIni adalah definisinya...).",
      "exercises": [
        {
          "type": "pilihan ganda",
          "question": "Pertanyaan soal...",
          "answer": "Jawaban soal...",
          "explanation": "Penjelasan langkah-langkah..."
        }
      ]
    }
  ]
}
`;
